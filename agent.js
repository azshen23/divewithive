import fs from 'fs/promises';
import path from 'path';

// --- CONFIGURATION ---
const REDDIT_URL = 'https://www.reddit.com/r/IVE/new.json?limit=15';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Make sure to set this in your environment or a .env file
const TIMELINE_PATH = './src/data/timeline.json';

// Ensure you run this with: bun run agent.js
// If using Node: node --experimental-fetch agent.js

async function fetchRedditPosts() {
  console.log('📡 Fetching latest updates from r/IVE...');
  const response = await fetch(REDDIT_URL, {
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) throw new Error(`Reddit API failed: ${response.statusText}`);
  
  const json = await response.json();
  return json.data.children.map(post => ({
    title: post.data.title,
    url: post.data.url,
    text: post.data.selftext || '',
    is_video: post.data.is_video,
    created_utc: post.data.created_utc
  }));
}

async function askAI(posts) {
  console.log('🧠 Asking AI to filter and format the news...');
  
  if (!GEMINI_API_KEY) {
    throw new Error('Please set the GEMINI_API_KEY environment variable.');
  }

  const prompt = `
    You are an AI assistant managing a minimalist fansite timeline for the K-pop group IVE.
    Your job is to read the latest social media and Reddit posts and decide if they are worth adding to the timeline.
    
    RULES FOR INCLUSION:
    - DO NOT include minor updates, random fan chats, or small TikToks.
    - ONLY include larger updates: Group news (comebacks, MV releases), major member sponsorships/magazine covers, concert date pictures/fansite previews, or major awards.
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
        "raw_image_url": "extract the image url from the post if it ends in .jpg or .png. Set to null if there is no image, OR if the update (like Brand Reputation, announcements, or text news) does not inherently need a picture."
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
  if (!url || (!url.endsWith('.jpg') && !url.endsWith('.png'))) return null;
  
  try {
    console.log(`🖼️ Downloading image: ${url}`);
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const filename = `img_${Date.now()}${path.extname(url)}`;
    const dirPath = `./public/images/${dateStr}`;
    const filePath = `${dirPath}/${filename}`;

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, Buffer.from(buffer));
    
    return `/images/${dateStr}/${filename}`;
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return null;
  }
}

async function run() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // 1. Scrape
    const posts = await fetchRedditPosts();
    
    // 2. Process via AI
    const updates = await askAI(posts);

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

      newEntries.push(entry);
    }

    // 4. Update timeline.json
    console.log(`📝 Writing ${newEntries.length} new entries to timeline.json...`);
    const timelineData = JSON.parse(await fs.readFile(TIMELINE_PATH, 'utf-8'));
    
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
