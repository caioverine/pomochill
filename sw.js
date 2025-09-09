const CACHE_NAME = 'pomochill-v1';
const urlsToCache = [
    '/',
    '/style.css',
    '/app.js',
    '/translations.js',
    '/logo.png'
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
