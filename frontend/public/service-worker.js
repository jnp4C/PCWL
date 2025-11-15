const VERSION = 'pcwl-sw-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== VERSION)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (
    request.method !== 'GET' ||
    (request.cache === 'only-if-cached' && request.mode !== 'same-origin') ||
    !(request.url.startsWith('http://') || request.url.startsWith('https://'))
  ) {
    return;
  }
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFontHost =
    url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com');

  if (!isSameOrigin) {
    if (isGoogleFontHost) {
      event.respondWith(new Response('', { status: 204, statusText: 'Font request blocked' }));
    }
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      try {
        const response = await fetch(request);
        if (response && response.status === 200 && response.type === 'basic') {
          cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        return cached || Response.error();
      }
    })(),
  );
});
