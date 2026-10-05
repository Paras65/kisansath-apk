// किसान साथी (Kisan Saathi) Service Worker
const CACHE_NAME = 'kisan-saathi-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/kisan-icon-512.png',
  '/icons/kisan-icon.svg',
  '/favicon.svg'
];

// Install Event - Pre-cache essential app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Kisan Saathi SW] Pre-caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Kisan Saathi SW] Non-fatal caching warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Kisan Saathi SW] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Stale-While-Revalidate & Offline Fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Security & Privacy: Never cache API endpoints or farmer PII in service worker cache (Rule 13)
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith('/api/') || requestUrl.searchParams.has('api')) {
    return;
  }

  // Handle cross-origin or chrome-extension schemes safely
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails (farmer in field offline), return cached response
          if (cachedResponse) {
            return cachedResponse;
          }
          // If request was for a page navigation, return root
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
