// Poker Bank table — offline cache. The page is one file; cache it on first
// load and serve it from cache when there is no signal at the table.
// Bump VERSION whenever index.html changes so phones pick up the new page.
var VERSION = "pbt-v446-20261120";
// 4.3 (A13): network first, but a weak signal at the table waits at most
// ~3 s for it; then the cached page opens (and the network copy, if it
// arrives later, refreshes the cache for next time).
var TIMEOUT = 3000;
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
function fromCache(req) {
  return caches.match(req).then(function (m) { return m || caches.match("./index.html"); });
}
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  // The group's database and sign-in go straight to the network: never
  // cached, and live streams must not pass through here.
  if (new URL(e.request.url).origin !== self.location.origin) return;
  var req = e.request;
  var net = fetch(req).then(function (r) {
    if (r && r.ok) { var copy = r.clone(); caches.open(VERSION).then(function (c) { return c.put(req, copy); }); }
    return r;
  });
  e.respondWith(new Promise(function (resolve) {
    var done = false;
    function give(p) { if (done) return; done = true; resolve(p); }
    var timer = setTimeout(function () {
      fromCache(req).then(function (m) { if (m) give(m); }); // nothing cached: keep waiting for the network
    }, TIMEOUT);
    net.then(function (r) { clearTimeout(timer); give(r); }, function () {
      clearTimeout(timer);
      fromCache(req).then(function (m) { give(m || Response.error()); });
    });
  }));
});
