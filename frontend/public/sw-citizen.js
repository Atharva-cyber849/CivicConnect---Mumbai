// Citizen PWA Service Worker
const CACHE_NAME = 'civic-connect-citizen-v1.0.0';
const CITIZEN_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest-citizen.json',
  '/icons/citizen-icon-192.png',
  '/icons/citizen-icon-512.png',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Install event - cache citizen-specific assets
self.addEventListener('install', (event) => {
  console.log('Citizen SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Citizen SW: Caching assets');
        return cache.addAll(CITIZEN_ASSETS);
      })
      .then(() => {
        console.log('Citizen SW: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Citizen SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('civic-connect-')) {
            console.log('Citizen SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Citizen SW: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip admin routes
  if (event.request.url.includes('/admin')) {
    return;
  }

  // Skip API requests - let them go directly to the backend
  if (event.request.url.includes('/api/') || event.request.url.includes('localhost:8000')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Citizen SW: Serving from cache:', event.request.url);
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

  // Background sync for complaint submissions
  if (event.request.url.includes('/api/complaints') && event.request.method === 'POST') {
    event.waitUntil(
      self.registration.sync.register('complaint-submission')
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Citizen SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'complaint-submission') {
    event.waitUntil(syncComplaintSubmissions());
  }
});

// Sync pending complaint submissions
async function syncComplaintSubmissions() {
  try {
    // Get pending submissions from IndexedDB
    const pendingSubmissions = await getPendingSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/complaints/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data)
        });

        if (response.ok) {
          await removePendingSubmission(submission.id);
          console.log('Citizen SW: Synced complaint submission:', submission.id);
        }
      } catch (error) {
        console.error('Citizen SW: Failed to sync submission:', error);
      }
    }
  } catch (error) {
    console.error('Citizen SW: Background sync failed:', error);
  }
}

// IndexedDB helpers (simplified)
async function getPendingSubmissions() {
  // Implementation would use IndexedDB to get pending submissions
  return [];
}

async function removePendingSubmission(id) {
  // Implementation would remove submission from IndexedDB
  console.log('Removing pending submission:', id);
}

// Push notifications for complaint updates
self.addEventListener('push', (event) => {
  console.log('Citizen SW: Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'CivicConnect Update';
  const options = {
    body: data.body || 'Your complaint status has been updated',
    icon: '/icons/citizen-icon-192.png',
    badge: '/icons/citizen-icon-192.png',
    tag: 'complaint-update',
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Citizen SW: Notification clicked');
  
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});