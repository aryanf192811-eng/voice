const CACHE_NAME = "civic-shell-v4";
const OFFLINE_ASSETS = [
  "./",
  "./index.html",
  "./feed.html",
  "./case.html",
  "./report.html",
  "./profile.html",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/pages.css",
  "./css/dashboard.css",
  "./css/feed.css",
  "./css/report.css",
  "./css/emergency.css",
  "./css/case.css",
  "./css/profile.css",
  "./js/main.js",
  "./js/dashboard.js",
  "./js/feed.js",
  "./js/report.js",
  "./js/emergency-sos.js",
  "./js/accident-report.js",
  "./js/case.js",
  "./js/profile.js",
  "./manifest.json",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/images/city.jpg",
  "./assets/images/water.jpg",
  "./assets/images/traffic.jpg",
  "./assets/images/hospital.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          return cachedPage || caches.match("./index.html");
        })
    );
    return;
  }

  const isStyleOrScript =
    request.destination === "style" || request.destination === "script";

  if (isStyleOrScript) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
