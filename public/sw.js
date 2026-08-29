const CACHE = 'bookmark-merge-map-v9';
const PAGES = ['/', '/demo', '/privacy', '/terms', '/404.html'];
const CORE = [...PAGES, '/offline.html', '/offline.css', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png', '/assets/merge-map-640.webp', '/assets/merge-map-960.webp', '/assets/merge-map-1536.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    await cache.addAll(CORE);
    const builtAssets = new Set();
    for (const page of PAGES) {
      const response = await cache.match(page);
      const html = await response.text();
      for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) builtAssets.add(match[1]);
    }
    await cache.addAll([...builtAssets]);
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()).then(async () => {
    const pages = await self.clients.matchAll({ type: 'window' });
    pages.forEach((page) => page.postMessage({ type: 'SW_READY' }));
  }));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response;
    }).catch(async () => (await caches.match(url.pathname)) || (await caches.match('/')) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(url.pathname).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); }
    return response;
  })));
});
