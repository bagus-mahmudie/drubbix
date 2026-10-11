/* ====== Service Worker MEB ====== */
const CACHE_VERSION = "v2025-08-26-01";
const STATIC_CACHE  = `drubbix-static-${CACHE_VERSION}`;
const HTML_CACHE    = `drubbix-html-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "./",                              
  "./assets/css/main-style.css?v=2025-08-26-01",
  "./assets/js/main.js?v=2025-08-26-01",
  "./assets/img/bg/Solusi pengambilan sampah untuk restoran dan hotel.png",
  "./assets/img/bg/Pakan Maggot Terpercaya dari Sampah Organik.png",
  "./assets/img/bg/Jasa Pengangkutan Sampah Terpercaya & Ramah Lingkungan.png",
  "./assets/img/bg/Blog Seputar Sampah dan Maggot.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting(); 
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (![STATIC_CACHE, HTML_CACHE].includes(name)) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

function isNavigationRequest(req) {
  return req.mode === "navigate" ||
         (req.headers.get("accept") || "").includes("text/html");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request, { cache: "no-store" });
          const cache = await caches.open(HTML_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch (err) {
          const cached = await caches.match(request);
          return cached || caches.match("/");
        }
      })()
    );
    return;
  }

  if (request.url.startsWith(self.location.origin)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        const resp = await fetch(request);
        if (resp && resp.status === 200 && resp.type === "basic") {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, resp.clone());
        }
        return resp;
      })()
    );
  }
});
