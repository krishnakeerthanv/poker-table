// Poker Table — offline cache. The page is one file; cache it on first load
// and serve it from cache when there is no signal at the table.
// Bump VERSION whenever index.html changes so phones pick up the new page.
var VERSION = "pbt-v4-20261113";
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(["./", "./index.html"]); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  // Network first (so a fixed page arrives), cache when offline.
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    if (r.ok && new URL(e.request.url).origin === self.location.origin) caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () {
    return caches.match(e.request).then(function (m) { return m || caches.match("./index.html"); });
  }));
});
