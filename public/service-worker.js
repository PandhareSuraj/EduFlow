const CACHE_NAME = 'eduflow-v4';
const STATIC_CACHE = 'eduflow-static-v4';
const DYNAMIC_CACHE = 'eduflow-dynamic-v4';

// Static assets - cache first strategy
const staticAssets = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/placeholder.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('Caching static assets');
      return cache.addAll(staticAssets);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old cache versions
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - smart caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Never cache Vite dev modules/HMR assets to avoid mixed React runtimes.
  if (
    url.pathname.startsWith('/node_modules/.vite/') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/src/')
  ) {
    return;
  }

  // Never intercept Supabase (auth/session/data) — always go straight to the
  // network so the auth token is never served stale and locks never deadlock.
  if (url.hostname.includes('supabase')) {
    return;
  }

  // Static assets - cache first
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML navigation - network first
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default - stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});

/**
 * Cache First Strategy
 * Best for: static assets that rarely change (images, fonts, CSS)
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Cache first failed:', error);
    // Return a fallback for images
    if (request.destination === 'image') {
      return caches.match('/placeholder.svg');
    }
    throw error;
  }
}

/**
 * Network First Strategy
 * Best for: API calls, HTML pages that need fresh data
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Network first fallback to cache:', error);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // For navigation, return cached index
    if (request.destination === 'document') {
      return caches.match('/');
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Best for: content that updates but stale is acceptable
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.log('Revalidate fetch failed:', error);
    return cached;
  });
  
  return cached || fetchPromise;
}

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
    tag: data.type || 'general',
    requireInteraction: data.type === 'error',
    timestamp: Date.now()
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'EduFlow Notification', options)
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});
