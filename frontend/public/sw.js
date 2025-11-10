// Main Service Worker Router for CivicConnect
// This service worker acts as a router to determine which specialized SW to use

const CACHE_NAME = 'civic-connect-main-v1.0.0';

// Install event
self.addEventListener('install', (event) => {
  console.log('Main SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Main SW: Cache opened');
        return cache.addAll([
          '/',
          '/index.html',
          '/offline.html'
        ]);
      })
      .then(() => {
        console.log('Main SW: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Main SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('civic-connect-main-')) {
            console.log('Main SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Main SW: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - Basic routing logic
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // Let specialized service workers handle their routes
  if (url.pathname.startsWith('/admin')) {
    // Admin routes should be handled by sw-admin.js
    return;
  }
  
  // Basic caching for shared resources
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Main SW: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Main SW: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      type: 'main-sw'
    });
  }
});

console.log('Main Service Worker loaded successfully');