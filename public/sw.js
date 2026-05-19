const CACHE_NAME = 'b2-media-cache-v1';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Helper to determine if a URL represents media older than 7 days
function isOlderThan7Days(urlStr) {
  const now = Date.now();
  try {
    // 1. Check for Unix timestamp in filename (e.g. img_1779136288741_1.jpeg or vid_1779141198053.mp4)
    const tsMatch = urlStr.match(/(?:img|vid)_(\d+)/);
    if (tsMatch && tsMatch[1]) {
      const fileTime = parseInt(tsMatch[1], 10);
      return (now - fileTime) > SEVEN_DAYS_MS;
    }

    // 2. Fallback check for date folder in URL path (e.g. /2026-05-18/)
    const dateMatch = urlStr.match(/.*\/(20\d{2}-\d{2}-\d{2})\//);
    if (dateMatch && dateMatch[1]) {
      const folderTime = new Date(dateMatch[1]).getTime();
      if (!isNaN(folderTime)) {
        return (now - folderTime) > SEVEN_DAYS_MS;
      }
    }
  } catch (e) {
    console.error('Error parsing date from URL:', urlStr, e);
  }
  return false;
}

// Function to prune cached media older than 7 days
async function cleanOldCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    let deletedCount = 0;

    for (const request of requests) {
      if (isOlderThan7Days(request.url)) {
        await cache.delete(request);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`🧹 Service Worker pruned ${deletedCount} old media file(s) exceeding 7-day retention.`);
    }
  } catch (error) {
    console.error('🧹 Service Worker cache pruning failed:', error);
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      await cleanOldCache();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRUNE_OLD_CACHE') {
    cleanOldCache();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept requests to both Cloudflare CDN and Backblaze B2 bucket media
  if (url.hostname.includes('cdn.divewithive.com') || url.hostname.includes('backblazeb2.com')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request, { ignoreSearch: true });

        if (cachedResponse) {
          // Check if the request is a Range request (common for video scrubbing/playback)
          const rangeHeader = event.request.headers.get('Range');
          if (rangeHeader) {
            if (cachedResponse.status === 200) {
              try {
                const blob = await cachedResponse.blob();
                const total = blob.size;
                const parts = rangeHeader.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
                const chunk = blob.slice(start, end + 1);

                return new Response(chunk, {
                  status: 206,
                  statusText: 'Partial Content',
                  headers: {
                    'Content-Range': `bytes ${start}-${end}/${total}`,
                    'Content-Length': chunk.size,
                    'Content-Type': cachedResponse.headers.get('Content-Type') || 'video/mp4',
                    'Accept-Ranges': 'bytes',
                  },
                });
              } catch (err) {
                console.error('Error slicing cached blob for Range request:', err);
                return fetch(event.request);
              }
            } else {
              // It's an opaque response (status 0). Opaque responses cannot be sliced for Range requests.
              // We must let the browser fetch the byte range directly from the network/CDN.
              return fetch(event.request);
            }
          }
          return cachedResponse;
        }

        // Not in cache, fetch from network
        try {
          const networkResponse = await fetch(event.request);

          // Clone and cache successful 200 OK responses or opaque responses
          if (networkResponse.status === 200 || networkResponse.status === 0) {
            // Only cache if it's NOT older than 7 days
            if (!isOlderThan7Days(event.request.url)) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          } else if (networkResponse.status === 206) {
            // If the initial fetch is a 206 Partial Content, perform a background fetch 
            // for the full resource without the Range header to cache the entire video.
            if (!isOlderThan7Days(event.request.url)) {
              const fullRequest = new Request(event.request.url, {
                mode: event.request.mode === 'navigate' ? 'cors' : event.request.mode,
                credentials: event.request.credentials,
                redirect: event.request.redirect
              });
              // Remove Range header for full fetch
              fullRequest.headers.delete('Range');

              fetch(fullRequest).then(fullResponse => {
                if (fullResponse.status === 200 || fullResponse.status === 0) {
                  cache.put(event.request, fullResponse);
                }
              }).catch(err => console.error('Background full video fetch failed:', err));
            }
            return networkResponse;
          }

          return networkResponse;
        } catch (error) {
          console.error('Service Worker fetch failed:', error);
          throw error;
        }
      })()
    );
  }
});
