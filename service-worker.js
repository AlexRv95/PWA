const CACHE_NAME = 'taqueria-cache-v4';  // Cambia el nombre de la versión para actualizar el caché
const urlsToCache = [
  '/SW/index.html',
  '/SW/offline.html',
  '/SW/styles.css',
  '/SW/app.js',               
  '/SW/images/hrPico.png',
  '/SW/images/logo.png',
  '/SW/images/logoTA.png',
  '/SW/images/logoTA2.png',
  '/SW/images/logoTA3.png',
  '/SW/images/oferta.png',
  '/SW/images/orden.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css'
];

// Instalar el Service Worker y cachear los recursos necesarios
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Archivos en caché');
        return cache.addAll(urlsToCache);
      })
      .catch(error => console.error('Error al cachear archivos:', error))
  );
  self.skipWaiting();  // Activa inmediatamente el nuevo SW
});

// Interceptar peticiones y servir recursos en modo caché-primero
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si el recurso está en el caché, lo devuelve
        if (response) {
          return response;
        }
        // Si el recurso no está en el caché, intenta obtenerlo de la red
        return fetch(event.request)
          .then((networkResponse) => {
            // Si el recurso se obtiene exitosamente de la red, lo agrega al caché
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => caches.match('/SW/offline.html')); // Página de respaldo en caso de fallo
      })
  );
});

// Eliminar cachés antiguos cuando se active una nueva versión del SW
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Asegura que el nuevo SW se active en todas las pestañas
});
