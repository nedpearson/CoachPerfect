// ─── CoachPerfect Service Worker ──────────────────────────────────────────────
// Handles: offline caching · push notifications · background sync
// Version bump CACHE_NAME to force update on deploy.

const CACHE_NAME = 'coachperfect-app-v1';
const SHELL = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

// ── Install: pre-cache app shell ──────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(SHELL.filter(u => !u.includes('icon') || true)))
      .catch(() => {}) // icons may not exist yet — don't block install
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first with network fallback ──────────────────────────────────
self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  // Always go to network for API calls
  if (request.url.includes('/api/')) {
    e.respondWith(fetch(request).catch(() => new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      }).catch(() =>
        // Offline fallback for navigation requests
        request.mode === 'navigate'
          ? caches.match('/index.html')
          : new Response('Offline', { status: 503 })
      );
    })
  );
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', e => {
  let payload = { title: 'CoachPerfect', body: 'You have a new notification.', url: '/', icon: '/icon-192.png' };
  try { if (e.data) payload = { ...payload, ...e.data.json() }; } catch (_) {}

  e.waitUntil(
    self.registration.showNotification(payload.title, {
      body:    payload.body,
      icon:    payload.icon   || '/icon-192.png',
      badge:   '/icon-192.png',
      tag:     payload.tag    || 'coachperfect',
      data:    { url: payload.url || '/' },
      vibrate: [100, 50, 100],
      requireInteraction: payload.requireInteraction || false,
    })
  );
});

// ── Notification click: open or focus app ─────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = e.notification.data?.url || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.startsWith(self.location.origin));
      if (existing) { existing.focus(); existing.navigate(target); }
      else self.clients.openWindow(target);
    })
  );
});

// ── Background sync: flush offline queue ─────────────────────────────────────
self.addEventListener('sync', e => {
  if (e.tag === 'coachperfect-sync') {
    e.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SYNC_TRIGGERED' }))
      )
    );
  }
});
