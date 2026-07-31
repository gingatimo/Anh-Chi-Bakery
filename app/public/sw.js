/**
 * sw.js — service worker: cache "vỏ app" để cài PWA + mở nhanh/chạy offline (vỏ).
 * DB (Supabase) và font (cross-origin) KHÔNG cache — dữ liệu là nguồn chân lý trên
 * cloud, luôn đi mạng. Tài nguyên build có hash → cache-first an toàn.
 */
const CACHE = 'anhchi-shell-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase / Google Fonts → để mạng lo

  // Mở app (điều hướng): network-first, offline thì trả index.html đã cache.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Tài nguyên cùng origin (JS/CSS/ảnh/icon): stale-while-revalidate.
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
