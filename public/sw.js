// Service Worker for push notifications and offline support

const CACHE_NAME = 'towapp-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: 'New tow request available!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'accept',
        title: 'Accept Job',
        icon: '/icons/accept.png'
      },
      {
        action: 'decline',
        title: 'Decline',
        icon: '/icons/decline.png'
      }
    ]
  };

  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }

  event.waitUntil(
    self.registration.showNotification('TOWAPP Driver', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'accept') {
    // Handle job acceptance
    event.waitUntil(
      clients.openWindow('/driver-map?action=accept&jobId=' + event.notification.data.jobId)
    );
  } else if (event.action === 'decline') {
    // Handle job decline
    event.waitUntil(
      fetch('/api/jobs/' + event.notification.data.jobId + '/decline', {
        method: 'POST'
      })
    );
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/driver-map')
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync offline actions when connection is restored
  try {
    const cache = await caches.open('offline-actions');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.log('Sync failed for request:', request.url);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}