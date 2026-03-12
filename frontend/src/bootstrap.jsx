async function clearDevServiceWorkers() {
  const isLocalDev = import.meta.env.DEV && ['localhost', '127.0.0.1'].includes(window.location.hostname);

  if (!isLocalDev) {
    return;
  }

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith('sehatsetu') || cacheName.startsWith('workbox'))
        .map((cacheName) => caches.delete(cacheName))
    );
  }
}

clearDevServiceWorkers()
  .catch(() => {})
  .finally(() => import('./main.jsx'));