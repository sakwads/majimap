/* MajiMap prototype service worker. build.mjs fills in VERSION and PRECACHE.
   Offline-first for the app shell; the data lives in localStorage so nothing else is needed. */
const VERSION = "a12ad09289";
const PRECACHE = [
  "./",
  "./assets/app.css",
  "./assets/app.js",
  "./assets/fonts.css",
  "./assets/fonts/figtree-latin-400-normal.woff2",
  "./assets/fonts/figtree-latin-500-normal.woff2",
  "./assets/fonts/figtree-latin-600-normal.woff2",
  "./assets/fonts/figtree-latin-700-normal.woff2",
  "./assets/fonts/jetbrains-mono-latin-500-normal.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./img/basemap.jpg",
  "./img/phone-check.png",
  "./img/phone-progress.png",
  "./img/shot-asset.jpg",
  "./img/shot-assets.jpg",
  "./img/shot-atlas.jpg",
  "./img/shot-compare.jpg",
  "./img/shot-market.jpg",
  "./img/shot-overview.jpg",
  "./img/shot-project.jpg",
  "./img/shot-projects.jpg",
  "./img/shot-reports.jpg",
  "./img/shot-team.jpg",
  "./index.html",
  "./manifest.webmanifest"
];
const CACHE = "majimap-" + VERSION;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("majimap-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === "navigate") { e.respondWith(fetch(req).catch(() => caches.match("./index.html"))); return; }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});
