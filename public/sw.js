/* Basic service worker for offline app shell caching.
 *
 * Note: This is intentionally minimal (no Workbox) to stay compatible with
 * modern Next.js builds on Vercel.
 */

const CACHE_NAME = "calorie-tracker-shell-v1";

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Navigation: network-first, fallback to cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put("/", response.clone()).catch(() => undefined);
          return response;
        } catch {
          const cached = await caches.match("/");
          return cached ?? new Response("Offline", { status: 503 });
        }
      })(),
    );
    return;
  }

  // Static assets: cache-first, then update in background.
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone()).catch(() => undefined);
          return response;
        } catch {
          return new Response("", { status: 504 });
        }
      })(),
    );
  }
});
