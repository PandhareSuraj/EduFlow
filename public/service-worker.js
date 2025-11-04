const CACHE_NAME = 'kkpatil-erp-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // If both cache and network fail, return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event - show notification when received
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const data = event.data?.json() || {};
  
  const options = {
    body: data.message || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.action_url || '/',
      notificationId: data.id
    },
    actions: [
      {
        action: 'open',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ],
    tag: data.type || 'general', // Group notifications by type
    requireInteraction: data.type === 'error', // Keep error notifications visible
    timestamp: Date.now()
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'EduERP Notification', options)
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Open the app at the specified URL
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close event (for analytics/tracking if needed)
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});
