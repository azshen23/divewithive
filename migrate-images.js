import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// --- CONFIGURATION ---
const rawEndpoint = process.env.B2_ENDPOINT;
const B2_ENDPOINT = rawEndpoint ? (rawEndpoint.startsWith('http') ? rawEndpoint : `https://${rawEndpoint}`) : null;
const B2_REGION = process.env.B2_REGION || 'us-east-005';
const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || 'divewithive-media';
const B2_PUBLIC_URL = process.env.B2_PUBLIC_URL ? process.env.B2_PUBLIC_URL.replace(/\/$/, '') : null;
const FFMPEG_PATH = process.platform !== 'win32'
  ? 'ffmpeg'
  : '"C:\\Program Files\\TrackMan Performance Studio\\Modules\\VmsFiles\\ffmpeg.exe"';

function extractKeyFromUrl(url, publicUrl) {
  if (!url) return null;
  if (url.toLowerCase().endsWith('.webp')) return null; // already compressed
  if (publicUrl && url.startsWith(publicUrl)) {
    let key = url.slice(publicUrl.length);
    if (key.startsWith('/')) key = key.slice(1);
    return key;
  }
  const match = url.match(/(images|videos)\/.*$/);
  if (match && (url.includes('cdn.divewithive.com') || url.includes('backblazeb2.com'))) {
    return match[0];
  }
  return null;
}

async function migrateSingleImage(imageUrl, s3Client, publicUrl, isCommit) {
  const key = extractKeyFromUrl(imageUrl, publicUrl);
  if (!key) return null; // not an uncompressed B2 image

  const ext = path.extname(key) || '.jpg';
  const isGif = ext.toLowerCase() === '.gif';
  
  // New WebP key
  const dirName = path.dirname(key);
  const baseName = path.basename(key, ext);
  const webpKey = `${dirName}/${baseName}.webp`;
  const webpUrl = `${publicUrl}/${webpKey}`;

  if (!isCommit) {
    return { key, webpKey, webpUrl, isGif, ext };
  }

  // Create temporary directories
  const tempDir = './temp/migration';
  const rawPath = path.join(tempDir, `raw_${baseName}${ext}`);
  const compressedPath = path.join(tempDir, `compressed_${baseName}.webp`);

  await fs.mkdir(tempDir, { recursive: true });

  try {
    // 1. Download original file from B2/CDN
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    await fs.writeFile(rawPath, Buffer.from(buffer));

    // 2. Compress using FFmpeg
    let ffmpegCommand = '';
    if (isGif) {
      // Convert GIF to Animated WebP (caps width at 1200, quality 75)
      ffmpegCommand = `${FFMPEG_PATH} -y -i "${path.resolve(rawPath)}" -vf "scale='min(1200,iw)':-1" -loop 0 -quality 75 "${path.resolve(compressedPath)}"`;
    } else {
      // Convert static images to WebP (caps width at 1600, quality 75)
      ffmpegCommand = `${FFMPEG_PATH} -y -i "${path.resolve(rawPath)}" -vf "scale='min(1600,iw)':-1" -q:v 75 "${path.resolve(compressedPath)}"`;
    }
    execSync(ffmpegCommand, { stdio: 'ignore' });

    // 3. Upload WebP to B2
    const webpBuffer = await fs.readFile(compressedPath);
    await s3Client.send(new PutObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: webpKey,
      Body: webpBuffer,
      ContentType: 'image/webp'
    }));

    // 4. Delete original uncompressed file from B2
    await s3Client.send(new DeleteObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: key
    }));

    console.log(`✅ Migrated: ${key} -> ${webpKey}`);

    // Clean up local temp files
    try { await fs.unlink(rawPath); } catch (_) {}
    try { await fs.unlink(compressedPath); } catch (_) {}

    return { webpUrl, success: true, originalSize: buffer.byteLength, compressedSize: webpBuffer.byteLength };
  } catch (error) {
    console.error(`❌ Failed migrating ${key}:`, error.message);
    try { await fs.unlink(rawPath); } catch (_) {}
    try { await fs.unlink(compressedPath); } catch (_) {}
    return { success: false, error: error.message };
  }
}

async function migrateJsonFile(filePath, s3Client, publicUrl, isCommit, stats) {
  console.log(`📖 Scanning ${filePath}...`);
  const content = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(content);
  if (!Array.isArray(data)) return;

  let fileModified = false;

  for (const entry of data) {
    if (Array.isArray(entry.images)) {
      for (const img of entry.images) {
        const result = await migrateSingleImage(img.src, s3Client, publicUrl, isCommit);
        if (result) {
          if (isCommit) {
            if (result.success) {
              img.src = result.webpUrl;
              fileModified = true;
              stats.migrated++;
              stats.originalSize += result.originalSize;
              stats.compressedSize += result.compressedSize;
            } else {
              stats.failed++;
            }
          } else {
            stats.toMigrate.push(result);
          }
        }
      }
    }
  }

  if (isCommit && fileModified) {
    console.log(`📝 Writing updated entries back to ${filePath}...`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
}

async function run() {
  const isCommit = process.argv.includes('--commit');

  console.log('🔄 B2 Image Retroactive WebP Migration');
  console.log(`Mode: ${isCommit ? '🔴 COMMIT (will compress, upload, and update JSONs)' : '🟢 DRY RUN (scan and estimate)'}`);

  if (!B2_ENDPOINT || !B2_KEY_ID || !B2_APPLICATION_KEY) {
    console.error('❌ Error: Backblaze B2 credentials missing in environment.');
    process.exit(1);
  }

  const s3Client = new S3Client({
    region: B2_REGION,
    endpoint: B2_ENDPOINT,
    credentials: {
      accessKeyId: B2_KEY_ID,
      secretAccessKey: B2_APPLICATION_KEY,
    },
  });

  const stats = {
    toMigrate: [],
    migrated: 0,
    failed: 0,
    originalSize: 0,
    compressedSize: 0
  };

  try {
    // 1. Scan timeline.json
    await migrateJsonFile('./src/data/timeline.json', s3Client, B2_PUBLIC_URL, isCommit, stats);

    // 2. Scan archive directory
    const archiveDir = './src/data/archive';
    try {
      const files = await fs.readdir(archiveDir);
      for (const file of files) {
        if (file.startsWith('timeline-') && file.endsWith('.json')) {
          await migrateJsonFile(path.join(archiveDir, file), s3Client, B2_PUBLIC_URL, isCommit, stats);
        }
      }
    } catch (e) {
      // Ignore if directory doesn't exist
    }

    if (isCommit) {
      console.log(`\n🎉 Migration Complete!`);
      console.log(`📊 Successfully migrated: ${stats.migrated} images`);
      console.log(`📊 Failed: ${stats.failed}`);
      if (stats.migrated > 0) {
        const sizeSaved = stats.originalSize - stats.compressedSize;
        console.log(`💾 Original Total: ${(stats.originalSize / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`💾 Compressed Total: ${(stats.compressedSize / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`📈 Total reclaimed: ${(sizeSaved / (1024 * 1024)).toFixed(2)} MB (${((sizeSaved / stats.originalSize) * 100).toFixed(1)}% savings)`);
      }
    } else {
      console.log(`\n📊 Dry-run Scan Complete!`);
      console.log(`📊 Uncompressed B2 images found: ${stats.toMigrate.length}`);

      if (stats.toMigrate.length === 0) {
        console.log('✅ All images in the JSON structures are already compressed WebP files!');
        return;
      }

      console.log(`\n🔍 Performing sample compression to estimate size savings...`);
      const sampleLimit = Math.min(3, stats.toMigrate.length);
      let sampleOrigTotal = 0;
      let sampleCompTotal = 0;

      for (let i = 0; i < sampleLimit; i++) {
        const item = stats.toMigrate[i];
        const imageUrl = `${B2_PUBLIC_URL}/${item.key}`;
        console.log(`   Sampling (${i + 1}/${sampleLimit}): ${item.key}...`);
        
        const tempDir = './temp/migration_sample';
        const rawPath = path.join(tempDir, `sample_raw_${i}${item.ext}`);
        const compressedPath = path.join(tempDir, `sample_comp_${i}.webp`);
        await fs.mkdir(tempDir, { recursive: true });

        try {
          const resp = await fetch(imageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
          });
          if (resp.ok) {
            const buf = await resp.arrayBuffer();
            await fs.writeFile(rawPath, Buffer.from(buf));
            
            let cmd = '';
            if (item.isGif) {
              cmd = `${FFMPEG_PATH} -y -i "${path.resolve(rawPath)}" -vf "scale='min(1200,iw)':-1" -loop 0 -quality 75 "${path.resolve(compressedPath)}"`;
            } else {
              cmd = `${FFMPEG_PATH} -y -i "${path.resolve(rawPath)}" -vf "scale='min(1600,iw)':-1" -q:v 75 "${path.resolve(compressedPath)}"`;
            }
            execSync(cmd, { stdio: 'ignore' });
            
            const compBuf = await fs.readFile(compressedPath);
            sampleOrigTotal += buf.byteLength;
            sampleCompTotal += compBuf.byteLength;
          }
        } catch (e) {
          console.warn(`   ⚠️ Sample fetch/compression failed for ${item.key}: ${e.message}`);
        } finally {
          try { await fs.unlink(rawPath); } catch (_) {}
          try { await fs.unlink(compressedPath); } catch (_) {}
        }
      }

      if (sampleOrigTotal > 0) {
        const savingsRatio = (sampleOrigTotal - sampleCompTotal) / sampleOrigTotal;
        console.log(`\n📈 Sample Compression Results:`);
        console.log(`   - Original Sample Size: ${(sampleOrigTotal / (1024 * 1024)).toFixed(3)} MB`);
        console.log(`   - Compressed Sample Size: ${(sampleCompTotal / (1024 * 1024)).toFixed(3)} MB`);
        console.log(`   - Sample Space Saved: ${(savingsRatio * 100).toFixed(1)}%`);
        console.log(`\n🔮 Estimated total storage reduction across all ${stats.toMigrate.length} images: ~${(((stats.toMigrate.length / sampleLimit) * (sampleOrigTotal - sampleCompTotal)) / (1024 * 1024)).toFixed(1)} MB`);
      }

      console.log('\n💡 Dry-run completed. No B2 files or JSON references were modified.');
      console.log('💡 To perform the actual migration, run:');
      console.log('   npm run migrate:images:commit');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

run();
