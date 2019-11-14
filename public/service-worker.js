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
