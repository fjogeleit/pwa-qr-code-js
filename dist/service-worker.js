importScripts("precache-manifest.1ce170186d2c863abc9c102f4ea376af.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

workbox.core.skipWaiting();
workbox.core.clientsClaim();

workbox.precaching.precacheAndRoute(self.__precacheManifest);

self.addEventListener('fetch', async (event) => {
  if (event.request.method !== 'POST') return;

  event.respondWith(Response.redirect('/'));

  event.waitUntil(async function () {
    const data = await event.request.formData();
    const client = await self.clients.get(event.resultingClientId || event.clientId);
    const file = data.get('file');

    client.postMessage({ file, action: 'load-image' });
  }());
});

