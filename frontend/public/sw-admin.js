// Admin PWA Service Worker
const CACHE_NAME = 'civic-connect-admin-v1.0.0';
const ADMIN_ASSETS = [
  '/admin',
  '/admin/dashboard',
  '/admin/login',
  '/index.html',
  '/offline.html',
  '/manifest-admin.json',
  '/icons/admin-icon-192.png',
  '/icons/admin-icon-512.png',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Install event - cache admin-specific assets
self.addEventListener('install', (event) => {
  console.log('Admin SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Admin SW: Caching assets');
        return cache.addAll(ADMIN_ASSETS);
      })
      .then(() => {
        console.log('Admin SW: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Admin SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('civic-connect-')) {
            console.log('Admin SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Admin SW: Activation complete');
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

  // Only handle admin routes and shared assets
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith('/admin') && 
      !url.pathname.includes('/static/') && 
      !url.pathname.includes('/icons/admin') &&
      url.pathname !== '/' && 
      url.pathname !== '/index.html' && 
      url.pathname !== '/offline.html') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Admin SW: Serving from cache:', event.request.url);
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

  // Background sync for admin actions
  if (event.request.url.includes('/api/admin/') && event.request.method === 'POST') {
    event.waitUntil(
      self.registration.sync.register('admin-action')
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Admin SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'admin-action') {
    event.waitUntil(syncAdminActions());
  }
});

// Sync pending admin actions
async function syncAdminActions() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': action.auth
          },
          body: JSON.stringify(action.data)
        });

        if (response.ok) {
          await removePendingAction(action.id);
          console.log('Admin SW: Synced admin action:', action.id);
        }
      } catch (error) {
        console.error('Admin SW: Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('Admin SW: Background sync failed:', error);
  }
}

// IndexedDB helpers (simplified)
async function getPendingActions() {
  // Implementation would use IndexedDB to get pending actions
  return [];
}

async function removePendingAction(id) {
  // Implementation would remove action from IndexedDB
  console.log('Removing pending action:', id);
}

// Push notifications for admin alerts
self.addEventListener('push', (event) => {
  console.log('Admin SW: Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'CivicConnect Admin Alert';
  const options = {
    body: data.body || 'New complaint requires attention',
    icon: '/icons/admin-icon-192.png',
    badge: '/icons/admin-icon-192.png',
    tag: 'admin-alert',
    data: data,
    requireInteraction: true, // Admin notifications should be persistent
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Admin SW: Notification clicked');
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/admin/dashboard')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open admin dashboard
    event.waitUntil(
      clients.openWindow('/admin/dashboard')
    );
  }
});

// Periodic background sync for admin data
self.addEventListener('periodicsync', (event) => {
  console.log('Admin SW: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'admin-data-sync') {
    event.waitUntil(syncAdminData());
  }
});

// Sync admin dashboard data
async function syncAdminData() {
  try {
    console.log('Admin SW: Syncing dashboard data...');
    
    // Sync complaint statistics
    const statsResponse = await fetch('/api/admin/stats/');
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      // Cache updated stats
      const cache = await caches.open(CACHE_NAME);
      cache.put('/api/admin/stats/', new Response(JSON.stringify(stats)));
    }

    // Sync recent complaints
    const complaintsResponse = await fetch('/api/admin/complaints/recent/');
    if (complaintsResponse.ok) {
      const complaints = await complaintsResponse.json();
      // Cache updated complaints
      const cache = await caches.open(CACHE_NAME);
      cache.put('/api/admin/complaints/recent/', new Response(JSON.stringify(complaints)));
    }

    console.log('Admin SW: Data sync complete');
  } catch (error) {
    console.error('Admin SW: Data sync failed:', error);
  }
}