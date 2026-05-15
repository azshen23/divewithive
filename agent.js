import fs from 'fs/promises';
import path from 'path';

// --- CONFIGURATION ---
const REDDIT_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.reddit.com/r/IVE/new/.rss';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TIMELINE_PATH = './src/data/timeline.json';

// Ensure you run this with: node --experimental-fetch agent.js

// ─── Step 1: Fetch RSS (fast, no enrichment) ───────────────────────────────
async function fetchRedditPosts() {
  console.log('📡 Fetching latest updates from r/IVE via RSS proxy...');
  const response = await fetch(REDDIT_URL);
  if (!response.ok) throw new Error(`RSS API failed: ${response.statusText}`);
  const json = await response.json();
  return json.items.map(post => ({
    title: post.title,
    url: post.link,
    text: post.description || '',
    created_utc: post.pubDate
  }));
}

// ─── Step 2: AI filters posts ──────────────────────────────────────────────
async function askAI(posts, existingTitles) {
  console.log('🧠 Asking AI to filter and format the news...');

  if (!GEMINI_API_KEY) {
    throw new Error('Please set the GEMINI_API_KEY environment variable.');
  }

  const prompt = `
    You are an AI assistant managing a minimalist fansite timeline for the K-pop group IVE.
    Your job is to read the latest Reddit posts and decide if they are worth adding to the timeline.

    IMPORTANT: Do NOT include any media URLs in your output. The agent handles all images and videos automatically.
    Your job is ONLY to decide inclusion, write a title, a body, and pick a tag.

    RULES FOR INCLUSION:
    - DUPLICATE PREVENTION: Here are the titles of the most recent updates already on the timeline: ${JSON.stringify(existingTitles)}. DO NOT include any news that is already semantically covered by these existing updates!
    - FILTERING: DO NOT include random fan chat posts, low-effort memes, or totally context-free selfies with no notable occasion. Everything else is fair game.
    - DO INCLUDE: Group comebacks/MV releases, member magazine pictorials/covers, official brand ambassador content, concert previews, major awards, official YouTube content, Instagram updates (photos or videos) from members or official brand/magazine accounts.

    For the 'tag' field, use one of: "Tour", "Award", "Member", "Fansite", "Release".
    For the 'tagColor' field, use:
      - "Tour": "text-emerald-400 bg-emerald-400/10"
      - "Award": "text-amber-400 bg-amber-400/10"
      - "Member": "text-violet-400 bg-violet-400/10"
      - "Fansite": "text-pink-400 bg-pink-400/10"
      - "Release": "text-rose-400 bg-rose-400/10"

    Here are the latest posts:
    ${JSON.stringify(posts.map(p => ({ title: p.title, url: p.url, text: p.text })), null, 2)}

    Return ONLY a valid JSON array. Each element must match this format exactly:
    [
      {
        "title": "Short punchy title",
        "body": "A 1-2 sentence description of the news.",
        "tag": "Member",
        "tagColor": "text-violet-400 bg-violet-400/10",
        "post_url": "Copy the exact 'url' field from the post — do not modify it"
      }
    ]
    Return [] if no posts qualify.
  `;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: "application/json" }
    })
  });

  const data = await response.json();
  const rawResponse = data.candidates[0].content.parts[0].text;
  return JSON.parse(rawResponse);
}

// Headers for Reddit JSON API
// Using a dedicated API User-Agent instead of a browser spoof prevents 403 Forbidden errors
const REDDIT_HEADERS = {
  'User-Agent': 'web:divewithive-agent:v1.0.0 (by /u/divewithive)',
  'Accept': 'application/json',
};

// Parse image URLs from the RSS HTML description as a fallback
function parseImagesFromHtml(html) {
  if (!html) return [];
  // Match i.redd.it and external-preview.redd.it image URLs embedded in the HTML
  const matches = [...html.matchAll(/https:\/\/(?:i|external-preview|preview)\.redd\.it\/[^\s"<>]+/g)];
  const seenBase = new Set();
  return matches
    .map(m => m[0].replace(/&amp;/g, '&'))
    .filter(url => {
      // Deduplicate by base URL (ignore query string — same image can appear
      // multiple times with different width/s= params)
      const base = url.split('?')[0];
      if (seenBase.has(base)) return false;
      seenBase.add(base);
      return true;
    });
}

// Parse any useful media from the RSS HTML description
function parseMediaFromRSS(text, postUrl) {
  if (!text) return {};

  // Check for YouTube links embedded in the description
  const ytMatch = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return { youtube_id: ytMatch[1] };
  }

  // Fall back to image extraction
  const images = parseImagesFromHtml(text);
  return images.length > 0 ? { image_urls: images } : {};
}

// ─── Step 3: Enrich a single selected post with media data ─────────────────
async function enrichPost(post) {
  const { url: postUrl, title, text } = post;
  // Strip trailing slash AND any query parameters to ensure clean .json append
  const cleanUrl = postUrl.replace(/\/$/, '').split('?')[0];

  // Since direct Reddit API endpoints (api.reddit.com, www.reddit.com) actively
  // block GitHub Actions/Datacenter IPs resulting in guaranteed 403 errors,
  // we bypass them entirely and go straight to the free CORS proxy which succeeds.
  const jsonUrls = [
    'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(cleanUrl + '.json')
  ];

  for (const jsonUrl of jsonUrls) {
    try {
      const resp = await fetch(jsonUrl, { headers: REDDIT_HEADERS });

      if (!resp.ok) {
        console.warn(`  ⚠️  [${title}] Reddit JSON ${jsonUrl.includes('old.') ? '(old)' : ''} failed: HTTP ${resp.status}`);
        continue; // try next URL
      }

      const data = await resp.json();
      const postData = data?.[0]?.data?.children?.[0]?.data;
      if (!postData) continue;

      const destUrl = postData.url_overridden_by_dest || '';

      // YouTube
      const ytMatch = destUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) {
        console.log(`  ▶️  [${title}] YouTube: ${ytMatch[1]}`);
        return { youtube_id: ytMatch[1] };
      }

      // Reddit-hosted video
      if (postData.is_video) {
        const videoUrl =
          postData.secure_media?.reddit_video?.fallback_url ||
          postData.media?.reddit_video?.fallback_url || null;
        console.log(`  🎬 [${title}] Reddit video detected`);
        return { is_video: true, video_url: videoUrl };
      }

      // Gallery (multiple images)
      if (postData.is_gallery && postData.gallery_data && postData.media_metadata) {
        const imageUrls = (postData.gallery_data.items || [])
          .map(item => postData.media_metadata[item.media_id])
          .filter(meta => meta && meta.status === 'valid' && meta.s)
          .map(meta => (meta.s.u || meta.s.gif || '').replace(/&amp;/g, '&'))
          .filter(Boolean);
        console.log(`  🖼️  [${title}] Gallery: ${imageUrls.length} images`);
        return { image_urls: imageUrls };
      }

      // Single image (direct link)
      if (/\.(jpg|jpeg|png|gif|webp)/i.test(destUrl)) {
        console.log(`  🖼️  [${title}] Single image`);
        return { image_urls: [destUrl] };
      }

      // Preview image fallback
      const previewUrl = postData.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&');
      if (previewUrl) {
        console.log(`  🖼️  [${title}] Preview image (fallback)`);
        return { image_urls: [previewUrl] };
      }

      console.log(`  ℹ️  [${title}] No media in JSON (text-only or external link)`);
      return {};

    } catch (e) {
      console.warn(`  ⚠️  [${title}] Enrichment error: ${e.message}`);
    }
  }

  // All JSON attempts failed — parse media from RSS HTML as last resort
  const rssMedia = parseMediaFromRSS(text, postUrl);
  if (rssMedia.youtube_id) {
    console.log(`  ▶️  [${title}] YouTube detected via RSS fallback: ${rssMedia.youtube_id}`);
    return rssMedia;
  }
  if (rssMedia.image_urls?.length > 0) {
    console.log(`  🖼️  [${title}] RSS HTML fallback: ${rssMedia.image_urls.length} image(s) found`);
    return rssMedia;
  }

  console.warn(`  ⚠️  [${title}] All enrichment methods failed — entry will have no media`);
  return {};
}


// ─── Download helpers ──────────────────────────────────────────────────────
async function downloadImage(url, title, index, dateStr) {
  if (!url) return null;

  // Fix HTML encoded ampersands
  let cleanUrl = url.replace(/&amp;/g, '&');

  // Upgrade native Reddit previews to full-res i.redd.it
  if (cleanUrl.includes('preview.redd.it') && !cleanUrl.includes('external-preview')) {
    try {
      const urlObj = new URL(cleanUrl);
      cleanUrl = `https://i.redd.it${urlObj.pathname}`;
    } catch (e) { /* ignore */ }
  }

  // Check URL has a recognizable image path
  if (!cleanUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) && !cleanUrl.includes('i.redd.it') && !cleanUrl.includes('external-preview.redd.it')) {
    console.warn(`  ⚠️  [${title}] Skipping non-image URL: ${cleanUrl}`);
    return null;
  }

  try {
    console.log(`  🖼️  [${title}] Downloading image ${index}: ${cleanUrl}`);
    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`  ❌ [${title}] Image ${index} failed: HTTP ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error(`  ❌ [${title}] Image ${index} returned HTML instead of image data`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const urlObj = new URL(cleanUrl);
    const ext = path.extname(urlObj.pathname) || '.jpg';
    const filename = `img_${Date.now()}_${index}${ext}`;
    const dirPath = `./public/images/${dateStr}`;
    const filePath = `${dirPath}/${filename}`;

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, Buffer.from(buffer));

    console.log(`  ✅ [${title}] Saved image ${index} → ${filePath}`);
    return `/images/${dateStr}/${filename}`;
  } catch (error) {
    console.error(`  ❌ [${title}] Image ${index} download error:`, error.message);
    return null;
  }
}

async function downloadVideo(url, title, dateStr) {
  if (!url) return null;

  const cleanUrl = url.replace(/&amp;/g, '&');

  try {
    console.log(`  🎬 [${title}] Downloading video: ${cleanUrl}`);
    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`  ❌ [${title}] Video failed: HTTP ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error(`  ❌ [${title}] Video URL returned HTML instead of video data`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const filename = `vid_${Date.now()}.mp4`;
    const dirPath = `./public/videos/${dateStr}`;
    const filePath = `${dirPath}/${filename}`;

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, Buffer.from(buffer));

    console.log(`  ✅ [${title}] Video saved → ${filePath} (${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB)`);
    return `/videos/${dateStr}/${filename}`;
  } catch (error) {
    console.error(`  ❌ [${title}] Video download error:`, error.message);
    return null;
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function run() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // 1. Read existing timeline to prevent duplicates
    const timelineData = JSON.parse(await fs.readFile(TIMELINE_PATH, 'utf-8'));
    const existingTitles = timelineData.slice(0, 15).map(entry => entry.title);

    // 2. Fetch RSS (lightweight, no enrichment yet)
    const posts = await fetchRedditPosts();

    // 3. AI selects which posts to include
    const updates = await askAI(posts, existingTitles);

    if (updates.length === 0) {
      console.log('✅ No new updates found. Exiting.');
      return;
    }

    console.log(`\n🎬 Enriching ${updates.length} selected post(s) with media data...`);

    // 4. Enrich ONLY the selected posts (avoids rate-limiting)
    const newEntries = [];
    for (const update of updates) {
      console.log(`\n📌 Processing: "${update.title}"`);

      // Add a 1.5-second delay to be kind to Reddit's API and avoid IP bans
      await new Promise(r => setTimeout(r, 1500));

      // Build URL lookup for the source post
      const sourcePost = posts.find(p => p.url.replace(/\/$/, '') === (update.post_url || '').replace(/\/$/, ''));
      const media = await enrichPost(sourcePost || { url: update.post_url, title: update.title, text: '' });

      // --- Images ---
      // Download all available images from the gallery
      const imageUrls = media.image_urls || [];
      let localImagePaths = [];
      if (imageUrls.length > 0) {
        console.log(`   Found ${imageUrls.length} image(s) to download.`);
        const results = await Promise.all(
          imageUrls.map((imgUrl, i) => downloadImage(imgUrl, update.title, i + 1, today))
        );
        localImagePaths = results.filter(Boolean);
      }

      // --- Video ---
      let localVideoPath = null;
      if (media.is_video && media.video_url) {
        localVideoPath = await downloadVideo(media.video_url, update.title, today);
      }

      // --- Build entry ---
      const entry = {
        date: dateFormatted,
        tag: update.tag,
        tagColor: update.tagColor,
        title: update.title,
        body: update.body,
      };

      if (localImagePaths.length > 0) {
        entry.images = localImagePaths.map(src => ({ src, alt: update.title }));
        console.log(`   🖼️  ${localImagePaths.length}/${imageUrls.length} image(s) saved.`);
      }

      if (media.youtube_id) {
        entry.videoId = media.youtube_id;
        console.log(`   ▶️  YouTube embed set: ${media.youtube_id}`);
      }

      if (localVideoPath) {
        entry.videoUrl = localVideoPath;
      } else if (media.is_video && media.video_url) {
        entry.videoUrl = media.video_url;
        console.warn(`   ⚠️  Video download failed — storing remote URL as fallback.`);
      }

      newEntries.push(entry);
    }

    // 5. Update timeline.json
    console.log(`\n📝 Writing ${newEntries.length} new entries to timeline.json...`);
    const updatedTimeline = [...newEntries, ...timelineData];
    await fs.writeFile(TIMELINE_PATH, JSON.stringify(updatedTimeline, null, 2));

    // 6. Update index.html SEO meta tags
    const latestPost = updatedTimeline[0];
    if (latestPost) {
      console.log('🌐 Updating index.html meta tags...');
      const indexPath = './index.html';
      let html = await fs.readFile(indexPath, 'utf-8');

      const title = latestPost.title.replace(/"/g, '&quot;');
      const desc = latestPost.body.replace(/"/g, '&quot;');
      const imagePath = (latestPost.images && latestPost.images.length > 0)
        ? latestPost.images[0].src
        : '/images/2026-05-13/singapore_concert_group.jpg';
      const fullImageUrl = `https://divewithive.com${imagePath}`;

      html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`);
      html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${desc}" />`);
      html = html.replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${fullImageUrl}" />`);
      html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${title}" />`);
      html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${desc}" />`);
      html = html.replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${fullImageUrl}" />`);

      await fs.writeFile(indexPath, html);
    }

    console.log('🎉 Done! Timeline updated successfully.');

  } catch (error) {
    console.error('❌ Agent Error:', error.message);
    process.exit(1);
  }
}

run();
