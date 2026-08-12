/*
 * Minimal service worker — its job is installability (Chrome only offers "Add to
 * home screen" when a SW handles fetch) plus a light cache for static assets.
 *
 * Deliberately conservative: anything dynamic (pages, the dashboard, the API,
 * media) always goes to the network, so a stale cache can never serve someone
 * else's tenant data or an out-of-date dashboard.
 */
const CACHE = 'viralpx-static-v1'
const PRECACHE = ['/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/offline.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

/** Immutable build output + our own icons are safe to cache forever. */
function isStatic(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    /\.(png|svg|ico|woff2?)$/i.test(url.pathname)
  )
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  // Never cache auth'd or generated responses.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/login')
  )
    return

  if (isStatic(url)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(req, copy))
            }
            return res
          }),
      ),
    )
    return
  }

  // Pages: network only, with an offline card if the device is truly offline.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')))
  }
})
