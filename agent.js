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
  return json.items.map(post => ({
    title: post.title,
    url: post.link,
    text: post.description || '',
    created_utc: post.pubDate
  }));
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
    - FILTERING: DO NOT include minor updates, random fan chats, TikToks, Instagram Reels/Videos, or generic daily selfies. Only include major updates.
    - DO INCLUDE: Group news (comebacks, MV releases), member magazine pictorials/covers, official brand ambassador photos, concert/fansite previews, major awards, and official YouTube content.
    - If the post contains a YouTube link (e.g. MV, behind-the-scenes), do not use an image. Instead, extract the YouTube video ID.
    - If a post qualifies, format it into a timeline entry.

    For the 'tag' field, use one of: "Tour", "Award", "Member", "Fansite", "Release".
    For the 'tagColor' field, use: 
      - "Tour": "text-emerald-400 bg-emerald-400/10"
      - "Award": "text-amber-400 bg-amber-400/10"
      - "Member": "text-violet-400 bg-violet-400/10"
      - "Fansite": "text-pink-400 bg-pink-400/10"
      - "Release": "text-rose-400 bg-rose-400/10"

    Here are the latest posts:
    ${JSON.stringify(posts, null, 2)}

    Return ONLY a valid JSON array containing the qualified updates. It must exactly match this format:
    [
      {
        "title": "Short punchy title",
        "body": "A 1-2 sentence description of the news.",
        "tag": "Member",
        "tagColor": "text-violet-400 bg-violet-400/10",
        "raw_image_url": "Extract the FULL image URL EXACTLY as it appears in the post, including any query parameters like ?width=...&s=... Do not cut off the URL. Set to null if there is no image, OR if the update does not inherently need a picture, OR if it is a YouTube video.",
        "videoId": "Extract the 11-character YouTube video ID if the post links to YouTube. Set to null if it is not a YouTube video."
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
  if (!url || (!url.includes('.jpg') && !url.includes('.png'))) return null;
  
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

    // 3. Download images and format entries
    const newEntries = [];
    for (const update of updates) {
      let localImagePath = null;
      if (update.raw_image_url) {
        localImagePath = await downloadImage(update.raw_image_url, today);
      }

      const entry = {
        date: dateFormatted,
        tag: update.tag,
        tagColor: update.tagColor,
        title: update.title,
        body: update.body,
      };

      if (localImagePath) {
        entry.images = [{ src: localImagePath, alt: update.title }];
      }

      if (update.videoId) {
        entry.videoId = update.videoId;
      }

      newEntries.push(entry);
    }

    // 4. Update timeline.json
    console.log(`📝 Writing ${newEntries.length} new entries to timeline.json...`);
    
    // Add new entries to the top
    const updatedTimeline = [...newEntries, ...timelineData];
    
    await fs.writeFile(TIMELINE_PATH, JSON.stringify(updatedTimeline, null, 2));
    console.log('🎉 Done! Timeline updated successfully.');

  } catch (error) {
    console.error('❌ Agent Error:', error.message);
    process.exit(1);
  }
}

run();
