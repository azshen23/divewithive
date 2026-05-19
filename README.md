# 🌊 Dive with IVE

[![Live Demo](https://img.shields.io/badge/Live_Demo-divewithive.com-0055FF?style=for-the-badge&logo=vercel)](https://divewithive.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)]()
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-AI_Curated-8E75B2?style=for-the-badge&logo=google&logoColor=white)]()
[![Cloudflare CDN](https://img.shields.io/badge/Cloudflare-Bandwidth_Alliance-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)]()
[![Backblaze B2](https://img.shields.io/badge/Backblaze_B2-Cloud_Storage-E51A3B?style=for-the-badge&logo=backblaze&logoColor=white)]()

**Dive with IVE** is an autonomous, AI-curated digital sanctuary and news aggregator for the K-pop group **IVE**. Built to showcase premium media layouts, buttery-smooth animations, and custom video experiences, the platform updates automatically every 4 hours using an intelligent scraping agent powered by Google Gemini 2.5 Flash.

---

## ✨ Key Features

### 🤖 Autonomous AI Curation (`agent.js`)
* **Intelligent Filtering:** Powered by **Google Gemini 2.5 Flash**, the automated agent filters out low-effort posts, fan chatter, and duplicates, selecting only high-quality updates (comebacks, pictorials, ambassador news, concert previews).
* **Smart Categorization:** Automatically assigns custom tags (`Tour`, `Award`, `Member`, `Fansite`, `Release`) with tailored UI styling.
* **Dynamic SEO Enrichment:** Automatically injects the latest headline, description, and cover image into `index.html` OpenGraph and Twitter meta tags for flawless social sharing.

### ☁️ Cloud Storage & Cloudflare CDN Integration
* **Direct Backblaze B2 Uploads:** Uses the AWS S3 SDK to upload all high-resolution images and compressed MP4 videos directly to Backblaze B2 cloud storage.
* **Cloudflare Bandwidth Alliance ($0 Egress):** Fully integrated with Cloudflare CDN (`cdn.divewithive.com`) via a CNAME proxy. By leveraging the Cloudflare Bandwidth Alliance, all data transferred from Backblaze B2 to Cloudflare edge servers incurs **$0.00 egress bandwidth costs**.
* **Zero-Transform-Rule Architecture:** Bypasses Cloudflare Free Plan restrictions by embedding the full Backblaze bucket path (`/file/divewithive-media`) directly inside `timeline.json` and `.env`, requiring **zero paid Transform Rules** in the Cloudflare dashboard.
* **Graceful Local Fallback:** Automatically detects if B2 environment variables are missing or incomplete and seamlessly reverts to saving media to the local filesystem, ensuring zero friction during local development.
* **Static JSON Sharding:** Automatically monitors `timeline.json` growth; when entries exceed 500 items, older news is automatically archived into monthly sharded files (`src/data/archive/timeline-YYYY-MM.json`) to keep initial page load speeds instantaneous.

### 🎬 Advanced Media Processing & Compression
* **Multi-Proxy Reddit Scraper:** Bypasses CDN restrictions and 403 blocks using a rotating multi-proxy JSON scraper.
* **Automated FFmpeg Compression:** Replaced raw video copying with advanced H.264 video compression (`-c:v libx264 -crf 26 -preset fast`) and AAC audio encoding (`-c:a aac -b:a 128k`). This reduces uploaded video file sizes by **50% to 70%**, drastically cutting Backblaze B2 storage consumption and speeding up video buffering.
* **Automated Audio/Video Merging:** Detects separated Reddit DASH video and audio streams, downloading and merging them locally via `ffmpeg` before cloud upload to ensure pristine video playback with fully synchronized sound.
* **Full-Resolution Image Upgrading:** Automatically rewrites preview URLs to fetch and store uncompressed, full-resolution images from `i.redd.it`.

### 💎 Premium Frontend UI/UX & Service Worker Caching
* **Robust Service Worker (`public/sw.js`):** Implements transparent background media caching with automated 7-day pruning. Features intelligent `Range` request detection: if a cached video is an opaque response (`status 0`), the Service Worker seamlessly bypasses the cache and fetches byte ranges directly from Cloudflare CDN, eliminating video decode failures on page reload.
* **Custom Video Player:** Built from scratch with auto-mute detection, custom volume controls, and intuitive "Tap to Unmute" mobile overlays.
* **Interactive Lightbox Gallery:** Features seamless fade transitions, zero layout jank, and synchronized thumbnail navigation.
* **Vinyl Music Player:** An interactive discography experience with a spinning vinyl record, absolute-positioned info panels, and smooth playback toggles.
* **Framer Motion Integration:** Fluid layout animations (`AnimatePresence`), spring-physics hover states, and smooth timeline filtering by idol member or platform.

---

## 🏗️ Architecture & Automated Workflow

Every 4 hours, a GitHub Actions cron job triggers the automated workflow:

```mermaid
graph TD
    A[GitHub Actions Cron / Local Bun] -->|Fetch RSS| B(r/IVE RSS Feed)
    B --> C{Gemini 2.5 Flash AI}
    C -->|Filter & Categorize| D[Select High-Quality Posts]
    D --> E{Media Type}
    E -->|Images| F[Fetch Full-Res i.redd.it]
    E -->|Reddit Video| G[Download DASH Video & Audio]
    G -->|ffmpeg H.264/AAC| H[Compress & Merge Tracks]
    E -->|YouTube| I[Extract Video ID]
    F --> J{B2 Configured?}
    H --> J
    J -->|Yes| K[Upload Directly to Backblaze B2]
    J -->|No| L[Save Locally to /public]
    I --> M[Update timeline.json & Shard Archives]
    K -->|Serve via cdn.divewithive.com| M
    L --> M
    M --> N[Update index.html SEO Meta Tags]
    N --> O[Commit & Push to GitHub / Deploy]
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* **Node.js** (v20+) or **Bun** (v1.1+)
* **FFmpeg** installed and available in your system PATH (for local video/audio merging and H.264 compression)

### 1. Clone the Repository
```bash
git clone https://github.com/azshen23/divewithive.com.git
cd divewithive
```

### 2. Install Dependencies
```bash
npm install
# or with bun
bun install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your API keys and Backblaze B2 credentials:
```env
# Gemini AI (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Backblaze B2 Cloud Storage (Optional — will fall back to local storage if omitted)
B2_ENDPOINT=s3.us-east-005.backblazeb2.com
B2_REGION=us-east-005
B2_KEY_ID=your_b2_key_id
B2_APPLICATION_KEY=your_b2_application_key
B2_BUCKET_NAME=divewithive-media
B2_PUBLIC_URL=https://cdn.divewithive.com/file/divewithive-media
```

### 4. Run the Frontend Dev Server
```bash
npm run dev
# or with bun
bun run dev
```
Your application will be running at `http://localhost:5173`.

### 5. Run the AI Scraping Agent Locally
To manually trigger the scraping, S3 cloud upload, ffmpeg compression, and AI curation process:
```bash
npm run agent
# or with bun
bun agent
```

---

## 📁 Project Structure

```text
divewithive/
├── .github/workflows/
│   └── daily-agent.yml      # Automated 4-hour scraping cron job
├── public/
│   └── sw.js                # Service Worker for background caching & Range request handling
├── src/
│   ├── components/          # Modular React components (Hero, Timeline, VideoPlayer, etc.)
│   ├── data/
│   │   ├── archive/         # Monthly sharded timeline JSON archives
│   │   └── timeline.json    # Main AI-generated news database (capped at 500 entries)
│   ├── App.tsx              # Main application view & layout assembly
│   ├── index.css            # Tailwind CSS & custom utilities
│   └── main.tsx             # React DOM entry point & SW registration
├── agent.js                 # Autonomous AI scraping, S3 upload, ffmpeg compression, & sharding
├── tailwind.config.js       # Tailwind configuration & custom fonts/colors
└── vite.config.ts           # Vite bundler configuration
```

---

## 🛠️ Tech Stack

* **Core:** React 18, TypeScript, Vite
* **Styling & UI:** Tailwind CSS, Framer Motion, Lucide React
* **AI & Scraping:** Google Gemini 2.5 Flash API, RSS2JSON, Multi-Proxy Fetch
* **Cloud Storage & CDN:** Backblaze B2 Object Storage, Cloudflare CDN (Bandwidth Alliance), `@aws-sdk/client-s3`
* **Media Processing:** FFmpeg (child_process/execSync H.264/AAC compression)
* **Automation & DevOps:** GitHub Actions, Vercel Analytics, Husky, Lint-Staged

---

## 📄 License

This project is private and created for experimental, educational, and K-pop community enjoyment purposes. All scraped media assets and K-pop group trademarks belong to their respective copyright holders (Starship Entertainment, etc.).
