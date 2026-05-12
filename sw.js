// Service Worker for offline functionality
const CACHE_NAME = 'matmat-v3';
const urlsToCache = [
    '/static/css/style.css',
    '/static/js/main.js',
    '/static/js/tracking.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // console.log('Service Worker: Caching files'); // Debug disabled
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        // console.log('Service Worker: Deleting old cache:', cacheName); // Debug disabled
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Always fetch HTML pages fresh from network (never serve from cache)
    if (event.request.destination === 'document' || event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
            })
    );
});

// Handle skip waiting message to force update
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'customer-lookup') {
        event.waitUntil(syncCustomerLookup());
    } else if (event.tag === 'tracking-query') {
        event.waitUntil(syncTrackingQuery());
    }
});

// Push notifications
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body,
            icon: '/static/icons/icon-192x192.png',
            badge: '/static/icons/badge-72x72.png',
            tag: data.tag || 'default',
            requireInteraction: true,
            actions: [
                {
                    action: 'open',
                    title: 'Xem chi tiết',
                    icon: '/static/icons/open-action.png'
                },
                {
                    action: 'dismiss',
                    title: 'Bỏ qua',
                    icon: '/static/icons/dismiss-action.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data?.url || '/')
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper functions
async function syncCustomerLookup() {
    try {
        // Get pending lookups from IndexedDB
        const pendingLookups = await getPendingLookups();
        
        for (const lookup of pendingLookups) {
            try {
                const response = await fetch(`/customer/api/lookup/${lookup.customerCode}`);
                if (response.ok) {
                    // Remove from pending
                    await removePendingLookup(lookup.id);
                    
                    // Show notification
                    self.registration.showNotification('Tra cứu khách hàng thành công', {
                        body: `Đã tìm thấy thông tin cho mã ${lookup.customerCode}`,
                        icon: '/static/icons/icon-192x192.png',
                        tag: 'customer-lookup-success'
                    });
                }
            } catch (error) {
                console.log('Sync failed for lookup:', lookup.customerCode, error);
            }
        }
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

async function syncTrackingQuery() {
    try {
        // Get pending tracking queries from IndexedDB
        const pendingQueries = await getPendingTrackingQueries();
        
        for (const query of pendingQueries) {
            try {
                const response = await fetch(`/tracking/api/track/${query.trackingNumber}?provider=${query.provider}`);
                if (response.ok) {
                    // Remove from pending
                    await removePendingTrackingQuery(query.id);
                    
                    // Show notification
                    self.registration.showNotification('Tra cứu vận đơn thành công', {
                        body: `Đã tìm thấy thông tin cho mã ${query.trackingNumber}`,
                        icon: '/static/icons/icon-192x192.png',
                        tag: 'tracking-query-success'
                    });
                }
            } catch (error) {
                console.log('Sync failed for tracking:', query.trackingNumber, error);
            }
        }
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

// IndexedDB helpers (simplified)
async function getPendingLookups() {
    // Implementation would use IndexedDB to store/retrieve pending lookups
    return [];
}

async function removePendingLookup(id) {
    // Implementation would remove from IndexedDB
    return Promise.resolve();
}

async function getPendingTrackingQueries() {
    // Implementation would use IndexedDB to store/retrieve pending queries
    return [];
}

async function removePendingTrackingQuery(id) {
    // Implementation would remove from IndexedDB
    return Promise.resolve();
}

// Message handler for communication with main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
