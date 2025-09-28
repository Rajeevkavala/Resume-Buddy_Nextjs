const CACHE_NAME = 'resume-buddy-v2';
const STATIC_CACHE_NAME = 'resume-buddy-static-v2';
const DYNAMIC_CACHE_NAME = 'resume-buddy-dynamic-v2';

// Core app routes to cache immediately
const coreRoutes = [
  '/',
  '/analysis',
  '/qa', 
  '/interview',
  '/improvement',
  '/profile',
];

// Static assets to cache
const staticAssets = [
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico',
  // Add more static assets as needed
];

// Routes to preload in background
const backgroundRoutes = [
  '/login',
  '/signup',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache core routes immediately
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching core routes');
        return cache.addAll(coreRoutes.map(route => new Request(route, { cache: 'reload' })));
      }),
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(staticAssets);
      }),
      // Preload background routes after core routes
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        console.log('Preloading background routes');
        return Promise.all(
          backgroundRoutes.map(route => 
            fetch(route).then(response => {
              if (response.ok) {
                return cache.put(route, response);
              }
            }).catch(() => {
              // Ignore errors for background routes
              console.log(`Could not preload ${route}`);
            })
          )
        );
      })
    ])
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If we have a cached response, use it
      if (cachedResponse) {
        // For HTML pages, also fetch in background to update cache
        if (event.request.headers.get('accept')?.includes('text/html')) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              const cache = caches.open(CACHE_NAME);
              cache.then(c => c.put(event.request, networkResponse.clone()));
            }
          }).catch(() => {
            // Network error, cached version is fine
          });
        }
        return cachedResponse;
      }
      
      // No cached response, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Don't cache if not ok
        if (!networkResponse.ok) {
          return networkResponse;
        }
        
        // Cache the response
        const responseClone = networkResponse.clone();
        const url = new URL(event.request.url);
        
        // Determine which cache to use
        let cacheName = DYNAMIC_CACHE_NAME;
        if (coreRoutes.includes(url.pathname)) {
          cacheName = CACHE_NAME;
        } else if (staticAssets.some(asset => url.pathname.includes(asset))) {
          cacheName = STATIC_CACHE_NAME;
        }
        
        caches.open(cacheName).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return networkResponse;
      }).catch(() => {
        // Network failed, return offline page if it's an HTML request
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/');
        }
        throw new Error('Network request failed and no cached version available');
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim clients to start controlling them immediately
      self.clients.claim()
    ])
  );
});

// Message event - handle commands from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_ROUTES') {
    const routes = event.data.routes || [];
    
    // Preload requested routes
    caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
      routes.forEach(route => {
        fetch(route).then(response => {
          if (response.ok) {
            cache.put(route, response);
            console.log('Preloaded route:', route);
          }
        }).catch(() => {
          console.log('Failed to preload route:', route);
        });
      });
    });
  }
});