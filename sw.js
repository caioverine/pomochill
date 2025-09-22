const CACHE_NAME = 'pomochill-v2';
const urlsToCache = [
    '/',
    '/style.css',
    '/app.js',
    '/translations.js',
    '/pomochill_logo.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    // Only cache GET requests and avoid caching ads
    if (event.request.method === 'GET' && !event.request.url.includes('googlesyndication.com')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Return cached version or fetch from network
                    return response || fetch(event.request).then(fetchResponse => {
                        // Don't cache if not successful
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // Clone the response
                        const responseToCache = fetchResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return fetchResponse;
                    });
                }).catch(() => {
                    // Fallback for offline
                    if (event.request.destination === 'document') {
                        return caches.match('/');
                    }
                })
        );
    }
});

// Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
