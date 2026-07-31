/**
 * sw.js — service worker: cài PWA + mở nhanh/offline (vỏ app).
 * DB (Supabase) và font cross-origin KHÔNG cache — luôn đi mạng.
 * QUAN TRỌNG: asset dùng NETWORK-FIRST và KHÔNG cache HTML — tránh trường hợp một
 * request asset lỡ trúng SPA-fallback (index.html 200) rồi bị cache-first phục vụ
 * mãi (gây lỗi MIME "text/html" khi nạp chunk JS). Online luôn lấy bản mới; offline
 * mới dùng cache.
 */
const CACHE = 'anhchi-shell-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))); // xoá cache cũ (kể cả v1 hỏng)
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase / Google Fonts → để mạng lo
  if (url.pathname === '/sw.js') return; // đừng chặn chính service worker (để cập nhật được)

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

  // Tài nguyên (JS/CSS/ảnh/icon): NETWORK-FIRST, chỉ cache phản hồi KHÔNG phải HTML.
  e.respondWith(
    fetch(req)
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        if (res.ok && !ct.includes('text/html')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
