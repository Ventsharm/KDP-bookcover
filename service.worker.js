// Unique service worker for KDP Book Cover Converter
const CACHE_NAME = 'kdp-bookcover-cache-v2'; // bump version to refresh installs
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate and clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch handler: serve from cache first, fallback to network
self.addEventListener('fetch', event => {
  // Ensure this handles only HTTP/HTTPS requests (ignore chrome-extension etc.)
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request).then(resp =>
        resp ||
        fetch(event.request).then(response => {
          // Optionally cache new requests dynamically
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        }).catch(() => resp)
      )
    );
  }
});
