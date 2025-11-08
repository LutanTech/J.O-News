const OFFLINE_URL = "/offline/index.html";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("v2").then(cache => cache.add(OFFLINE_URL))
  );
});

self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});
