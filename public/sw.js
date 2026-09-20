// Service Worker：静态资源离线缓存
// 策略：
//   - HTML（导航请求）：network-first，离线回退到缓存 → 保证内容更新及时
//   - /_astro/* 带哈希的构建产物：cache-first，永久有效（内容变更即 URL 变更）
//   - 其他静态资源（图标等）：stale-while-revalidate
const VERSION = "calc-v1";
const HTML_CACHE = VERSION + "-html";
const ASSET_CACHE = VERSION + "-assets";
const PRECACHE = ["/", "/favicon.svg", "/og-image.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(ASSET_CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;

  // 导航请求：network-first，离线回退缓存
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(HTML_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/"))),
    );
    return;
  }

  // 带哈希构建产物：cache-first
  if (new URL(req.url).pathname.startsWith("/_astro/")) {
    event.respondWith(
      caches.match(req).then(
        (m) =>
          m ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(ASSET_CACHE).then((c) => c.put(req, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // 其余静态资源：stale-while-revalidate
  event.respondWith(
    caches.match(req).then((m) => {
      const refresh = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(ASSET_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => m);
      return m || refresh;
    }),
  );
});
