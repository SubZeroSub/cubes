const CACHE_NAME = 'cube-app-v1';
const urlsToCache = [
  '/cubes/',
  '/cubes/index.html',
  '/cubes/app.js',
  '/cubes/data/cubes.json',
  '/cubes/images/cube.png',
  '/cubes/icons/icon-192x192.png',
  '/cubes/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});