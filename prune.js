import fs from 'fs/promises';
import path from 'path';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

// --- CONFIGURATION ---
const rawEndpoint = process.env.B2_ENDPOINT;
const B2_ENDPOINT = rawEndpoint ? (rawEndpoint.startsWith('http') ? rawEndpoint : `https://${rawEndpoint}`) : null;
const B2_REGION = process.env.B2_REGION || 'us-east-005';
const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || 'divewithive-media';
const B2_PUBLIC_URL = process.env.B2_PUBLIC_URL ? process.env.B2_PUBLIC_URL.replace(/\/$/, '') : null;

function extractKeyFromUrl(url, publicUrl) {
  if (!url) return null;
  if (publicUrl && url.startsWith(publicUrl)) {
    let key = url.slice(publicUrl.length);
    if (key.startsWith('/')) key = key.slice(1);
    return key;
  }
  const match = url.match(/(images|videos)\/.*$/);
  if (match) {
    return match[0];
  }
  return null;
}

async function getReferencedKeys(publicUrl) {
  const referencedKeys = new Set();
  
  async function parseFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      if (!Array.isArray(data)) return;
      
      for (const entry of data) {
        if (Array.isArray(entry.images)) {
          for (const img of entry.images) {
            const key = extractKeyFromUrl(img.src, publicUrl);
            if (key) referencedKeys.add(key);
          }
        }
        if (entry.videoUrl) {
          const key = extractKeyFromUrl(entry.videoUrl, publicUrl);
          if (key) referencedKeys.add(key);
        }
      }
    } catch (e) {
      console.error(`⚠️ Error parsing ${filePath}:`, e.message);
    }
  }

  await parseFile('./src/data/timeline.json');

  const archiveDir = './src/data/archive';
  try {
    const files = await fs.readdir(archiveDir);
    for (const file of files) {
      if (file.startsWith('timeline-') && file.endsWith('.json')) {
        await parseFile(path.join(archiveDir, file));
      }
    }
  } catch (e) {
    // Archive folder might not exist or be empty, ignore
  }

  return referencedKeys;
}

async function run() {
  const isCommit = process.argv.includes('--commit');
  
  console.log('🧹 B2 Storage Pruner started.');
  console.log(`Mode: ${isCommit ? '🔴 COMMIT (will delete files)' : '🟢 DRY RUN (no files will be deleted)'}`);
  
  if (!B2_ENDPOINT || !B2_KEY_ID || !B2_APPLICATION_KEY) {
    console.error('❌ Error: Backblaze B2 credentials missing in environment.');
    console.error('Please set B2_ENDPOINT, B2_KEY_ID, B2_APPLICATION_KEY in .env or system environment.');
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

  try {
    console.log('🔍 Scanning local timeline and archive files for referenced media...');
    const referencedKeys = await getReferencedKeys(B2_PUBLIC_URL);
    console.log(`ℹ️ Found ${referencedKeys.size} referenced files in JSON records.`);

    console.log(`📡 Listing all files in B2 bucket "${B2_BUCKET_NAME}"...`);
    const b2Objects = [];
    let isTruncated = true;
    let nextContinuationToken = undefined;

    while (isTruncated) {
      const response = await s3Client.send(new ListObjectsV2Command({
        Bucket: B2_BUCKET_NAME,
        ContinuationToken: nextContinuationToken,
      }));

      if (response.Contents) {
        for (const item of response.Contents) {
          if (item.Key && !item.Key.endsWith('/')) {
            b2Objects.push({
              key: item.Key,
              size: item.Size || 0
            });
          }
        }
      }

      isTruncated = response.IsTruncated;
      nextContinuationToken = response.NextContinuationToken;
    }

    console.log(`ℹ️ Found ${b2Objects.length} files in B2 bucket.`);

    // Find orphaned files
    const orphanedObjects = b2Objects.filter(obj => !referencedKeys.has(obj.key));

    if (orphanedObjects.length === 0) {
      console.log('✅ B2 storage is clean! No orphaned files found.');
      return;
    }

    let totalSize = 0;
    console.log('\n⚠️ Found orphaned files in B2:');
    for (const obj of orphanedObjects) {
      const sizeMB = (obj.size / (1024 * 1024)).toFixed(2);
      console.log(`  - ${obj.key} (${sizeMB} MB)`);
      totalSize += obj.size;
    }

    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`\n📊 Total orphaned files: ${orphanedObjects.length}`);
    console.log(`📊 Total space to reclaim: ${totalSizeMB} MB`);

    if (isCommit) {
      console.log('\n🚀 Starting deletion of orphaned files...');
      
      const batchSize = 1000;
      const keysToDelete = orphanedObjects.map(obj => obj.key);
      
      for (let i = 0; i < keysToDelete.length; i += batchSize) {
        const batchKeys = keysToDelete.slice(i, i + batchSize);
        const batchObjects = batchKeys.map(key => ({ Key: key }));
        
        console.log(`   Deleting batch of ${batchKeys.length} files...`);
        await s3Client.send(new DeleteObjectsCommand({
          Bucket: B2_BUCKET_NAME,
          Delete: {
            Objects: batchObjects,
            Quiet: true,
          },
        }));
      }
      
      console.log(`\n✅ Deletion complete. Successfully reclaimed ${totalSizeMB} MB of storage.`);
    } else {
      console.log('\n💡 Dry-run completed. No files were deleted.');
      console.log('💡 To perform the actual deletion, run the script with the --commit flag:');
      console.log('   npm run prune:commit');
    }

  } catch (error) {
    console.error('❌ Pruning failed with error:', error.message);
    process.exit(1);
  }
}

run();
