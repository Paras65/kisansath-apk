// किसान साथी (Kisan Saathi) Service Worker
// Version: v1.0.16 (Network-First Navigation + Stale-While-Revalidate Assets + Zero-Poisoning)
const CACHE_NAME = 'kisan-saathi-v1.0.16';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/version.json',
  '/icons/kisan-icon-512.png',
  '/icons/kisan-icon.svg',
  '/favicon.svg'
];

// Install Event - Pre-cache essential app shell & activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Kisan Saathi SW] Pre-caching App Shell v1.0.15');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Kisan Saathi SW] Non-fatal caching warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up ANY legacy or stale caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Kisan Saathi SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network-First for Navigation (HTML), Stale-While-Revalidate for Assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Security & Privacy: Never cache API endpoints or farmer PII (OWASP / Rule 13)
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith('/api/') || requestUrl.searchParams.has('api')) {
    return;
  }

  // Handle cross-origin or non-http schemes safely
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('http')) {
    return;
  }

  // 1. Navigation / HTML requests: ALWAYS NETWORK FIRST
  // Ensures farmers immediately receive the newest website release when online,
  // while falling back to cached shell when working in offline fields.
  if (
    event.request.mode === 'navigate' ||
    requestUrl.pathname === '/' ||
    requestUrl.pathname === '/index.html'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, images, fonts): Stale-While-Revalidate with Zero-Poisoning Protection
  const isScriptOrStyle = requestUrl.pathname.endsWith('.js') || requestUrl.pathname.endsWith('.css') || requestUrl.pathname.startsWith('/assets/');

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Zero-Poisoning Protection: If cachedResponse is HTML for a script/style asset, discard it immediately!
      if (cachedResponse && isScriptOrStyle) {
        const cachedType = cachedResponse.headers.get('content-type') || '';
        if (cachedType.includes('text/html')) {
          console.warn('[Kisan Saathi SW] Discarding poisoned HTML cache for asset:', requestUrl.pathname);
          cachedResponse = null;
        }
      }

      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const contentType = networkResponse.headers.get('content-type') || '';
            // Never cache text/html for a script or stylesheet (prevents SPA rewrite poisoning)
            if (isScriptOrStyle && contentType.includes('text/html')) {
              console.warn('[Kisan Saathi SW] Server returned text/html for asset, refusing to cache:', requestUrl.pathname);
              return new Response('Asset not found or outdated build', {
                status: 404,
                statusText: 'Not Found',
                headers: { 'Content-Type': 'text/plain' }
              });
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
