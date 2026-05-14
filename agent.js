import fs from 'fs/promises';
import path from 'path';

// --- CONFIGURATION ---
const REDDIT_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.reddit.com/r/IVE/new/.rss';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Make sure to set this in your environment or a .env file
const TIMELINE_PATH = './src/data/timeline.json';

// Ensure you run this with: bun run agent.js
// If using Node: node --experimental-fetch agent.js

async function fetchRedditPosts() {
  console.log('📡 Fetching latest updates from r/IVE via RSS proxy...');
  const response = await fetch(REDDIT_URL);

  if (!response.ok) throw new Error(`RSS API failed: ${response.statusText}`);

  const json = await response.json();
  const rssPosts = json.items.map(post => ({
    title: post.title,
    url: post.link,
    text: post.description || '',
    created_utc: post.pubDate
  }));

  // Enrich with Reddit JSON API to detect video posts and gallery images
  console.log('🎬 Enriching posts with Reddit JSON API for media detection...');
  const enriched = await Promise.all(rssPosts.map(async (post) => {
    try {
      // Convert Reddit post URL to JSON endpoint
      const cleanUrl = post.url.replace(/\/$/, '');
      const jsonUrl = cleanUrl + '.json';
      const resp = await fetch(jsonUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 divewithive-agent/1.0' }
      });
      if (!resp.ok) return post;
      const data = await resp.json();
      const postData = data?.[0]?.data?.children?.[0]?.data;
      if (!postData) return post;

      // Video post
      if (postData.is_video) {
        const videoUrl =
          postData.secure_media?.reddit_video?.fallback_url ||
          postData.media?.reddit_video?.fallback_url ||
          null;
        return { ...post, is_video: true, video_url: videoUrl };
      }

      // Gallery post (multiple images)
      if (postData.is_gallery && postData.gallery_data && postData.media_metadata) {
        const imageUrls = (postData.gallery_data.items || [])
          .map(item => postData.media_metadata[item.media_id])
          .filter(meta => meta && meta.status === 'valid' && meta.s)
          .map(meta => (meta.s.u || meta.s.gif || '').replace(/&amp;/g, '&'))
          .filter(Boolean);
        return { ...post, image_urls: imageUrls };
      }

      // Single image post
      const singleUrl = postData.url_overridden_by_dest || '';
      if (/\.(jpg|jpeg|png|gif|webp)/i.test(singleUrl)) {
        return { ...post, image_urls: [singleUrl] };
      }

      // Fallback: try preview image
      const previewUrl = postData.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&');
      if (previewUrl) {
        return { ...post, image_urls: [previewUrl] };
      }
    } catch (e) {
      // JSON fetch failed — just use RSS data
    }
    return post;
  }));

  return enriched;
}

async function askAI(posts, existingTitles) {
  console.log('🧠 Asking AI to filter and format the news...');

  if (!GEMINI_API_KEY) {
    throw new Error('Please set the GEMINI_API_KEY environment variable.');
  }

  const prompt = `
    You are an AI assistant managing a minimalist fansite timeline for the K-pop group IVE.
    Your job is to read the latest social media and Reddit posts and decide if they are worth adding to the timeline.
    
    RULES FOR INCLUSION:
    - DUPLICATE PREVENTION: Here are the titles of the most recent updates already on the timeline: ${JSON.stringify(existingTitles)}. DO NOT include any news that is already semantically covered by these existing updates!
    - FILTERING: DO NOT include random fan chat posts, low-effort memes, or totally context-free selfies with no notable occasion. Everything else is fair game.
    - DO INCLUDE: Group comebacks/MV releases, member magazine pictorials/covers, official brand ambassador content, concert previews, major awards, official YouTube content, and Instagram updates (photos or videos) from members or official brand/magazine accounts — e.g. ELLE, Esquire, FASHIONSNAP, BVLGARI, DELING, etc.
    - If the post has "is_video: true" and a "video_url", use that as the videoUrl. Do NOT also set raw_image_url for video posts.
    - If the post contains a YouTube link (e.g. MV, behind-the-scenes), extract the 11-character YouTube video ID into videoId. Do NOT set raw_image_url or videoUrl for YouTube posts.
    - If a post qualifies, format it into a timeline entry.

    For the 'tag' field, use one of: "Tour", "Award", "Member", "Fansite", "Release".
    For the 'tagColor' field, use: 
      - "Tour": "text-emerald-400 bg-emerald-400/10"
      - "Award": "text-amber-400 bg-amber-400/10"
      - "Member": "text-violet-400 bg-violet-400/10"
      - "Fansite": "text-pink-400 bg-pink-400/10"
      - "Release": "text-rose-400 bg-rose-400/10"

    Here are the latest posts (posts with is_video=true have a video_url field):
    ${JSON.stringify(posts, null, 2)}

    Return ONLY a valid JSON array containing the qualified updates. It must exactly match this format:
    [
      {
        "title": "Short punchy title",
        "body": "A 1-2 sentence description of the news.",
        "tag": "Member",
        "tagColor": "text-violet-400 bg-violet-400/10",
        "raw_image_urls": "An array of image URLs for this post. If the post has an 'image_urls' field, copy it here exactly as-is. If not, extract any image URLs you can find from the post text. Set to [] if it is a YouTube video, a Reddit video post (is_video=true), or there are no images.",
        "videoId": "Extract the 11-character YouTube video ID if the post links to YouTube. Set to null otherwise.",
        "videoUrl": "If the post has is_video=true and a video_url, copy the video_url here exactly. Set to null otherwise."
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

async function downloadImage(url, dateStr) {
  if (!url || (!url.includes('.jpg') && !url.includes('.jpeg') && !url.includes('.png') && !url.includes('.webp') && !url.includes('.gif'))) return null;

  // Fix HTML encoded ampersands
  let cleanUrl = url.replace(/&amp;/g, '&');

  // Convert blurry preview.redd.it thumbnails to full-resolution i.redd.it images
  // Do NOT do this for external-preview.redd.it because they aren't native Reddit images
  if (cleanUrl.includes('preview.redd.it') && !cleanUrl.includes('external-preview')) {
    try {
      const urlObj = new URL(cleanUrl);
      cleanUrl = `https://i.redd.it${urlObj.pathname}`;
    } catch (e) {
      // ignore
    }
  }

  try {
    console.log(`🖼️ Downloading image: ${cleanUrl}`);
    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Failed to download ${cleanUrl} - Status: ${response.status}`);
      return null;
    }

    // Check if we accidentally downloaded an HTML error page
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error(`Failed: URL returned an HTML page instead of an image.`);
      return null;
    }

    const buffer = await response.arrayBuffer();

    // Safely extract extension
    const urlObj = new URL(cleanUrl);
    const ext = path.extname(urlObj.pathname) || '.jpg';
    const filename = `img_${Date.now()}${ext}`;

    const dirPath = `./public/images/${dateStr}`;
    const filePath = `${dirPath}/${filename}`;

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, Buffer.from(buffer));

    return `/images/${dateStr}/${filename}`;
  } catch (error) {
    console.error(`Failed to download ${cleanUrl}:`, error.message);
    return null;
  }
}

async function downloadVideo(url, dateStr) {
  if (!url) return null;

  // Fix HTML encoded ampersands
  const cleanUrl = url.replace(/&amp;/g, '&');

  try {
    console.log(`🎬 Downloading video: ${cleanUrl}`);
    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Failed to download video ${cleanUrl} - Status: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error(`Failed: Video URL returned an HTML page instead of a video.`);
      return null;
    }

    const buffer = await response.arrayBuffer();

    const filename = `vid_${Date.now()}.mp4`;
    const dirPath = `./public/videos/${dateStr}`;
    const filePath = `${dirPath}/${filename}`;

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, Buffer.from(buffer));

    console.log(`✅ Video saved: ${filePath}`);
    return `/videos/${dateStr}/${filename}`;
  } catch (error) {
    console.error(`Failed to download video ${cleanUrl}:`, error.message);
    return null;
  }
}

async function run() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // 1. Read existing timeline to prevent duplicates
    const timelineData = JSON.parse(await fs.readFile(TIMELINE_PATH, 'utf-8'));
    const existingTitles = timelineData.slice(0, 15).map(entry => entry.title);

    // 2. Scrape
    const posts = await fetchRedditPosts();

    // 3. Process via AI
    const updates = await askAI(posts, existingTitles);

    if (updates.length === 0) {
      console.log('✅ No major updates today. Exiting.');
      return;
    }

    // 3. Download images/videos and format entries
    const newEntries = [];
    for (const update of updates) {
      // Download all images in parallel
      const imageUrls = Array.isArray(update.raw_image_urls)
        ? update.raw_image_urls
        : (update.raw_image_url ? [update.raw_image_url] : []); // backwards compat

      let localImagePaths = [];
      if (imageUrls.length > 0 && !update.videoUrl) {
        const results = await Promise.all(
          imageUrls.map(imgUrl => downloadImage(imgUrl, today))
        );
        localImagePaths = results.filter(Boolean);
      }

      let localVideoPath = null;
      if (update.videoUrl) {
        localVideoPath = await downloadVideo(update.videoUrl, today);
      }

      const entry = {
        date: dateFormatted,
        tag: update.tag,
        tagColor: update.tagColor,
        title: update.title,
        body: update.body,
      };

      if (localImagePaths.length > 0) {
        entry.images = localImagePaths.map(src => ({ src, alt: update.title }));
      }

      if (update.videoId) {
        entry.videoId = update.videoId;
      }

      if (localVideoPath) {
        // Use downloaded local file (permanent, no expiring tokens)
        entry.videoUrl = localVideoPath;
      } else if (update.videoUrl) {
        // Fallback: store remote URL if download failed
        entry.videoUrl = update.videoUrl;
        console.warn(`⚠️ Video download failed, storing remote URL for: ${update.title}`);
      }

      newEntries.push(entry);
    }

    // 4. Update timeline.json
    console.log(`📝 Writing ${newEntries.length} new entries to timeline.json...`);

    // Add new entries to the top
    const updatedTimeline = [...newEntries, ...timelineData];

    await fs.writeFile(TIMELINE_PATH, JSON.stringify(updatedTimeline, null, 2));

    // 5. Update index.html SEO meta tags with the latest news
    const latestPost = updatedTimeline[0];
    if (latestPost) {
      console.log('🌐 Updating index.html meta tags with latest news...');
      const indexPath = './index.html';
      let html = await fs.readFile(indexPath, 'utf-8');
      
      const title = latestPost.title.replace(/"/g, '&quot;');
      const desc = latestPost.body.replace(/"/g, '&quot;');
      // Provide a default image fallback if the post has no image
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
