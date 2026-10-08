/* Service Worker: App offline verfügbar halten. Bei Änderungen CACHE-Version hochzählen. */
const CACHE = 'abi-trainer-v2';
const SHELL = ['./', 'index.html', 'app.css', 'app.js', 'data.js', 'data-physik.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'vendor/katex/katex.min.css', 'vendor/katex/katex.min.js', 'vendor/katex/fonts/KaTeX_AMS-Regular.woff2','vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2','vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2','vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2','vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2','vendor/katex/fonts/KaTeX_Main-Bold.woff2','vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2','vendor/katex/fonts/KaTeX_Main-Italic.woff2','vendor/katex/fonts/KaTeX_Main-Regular.woff2','vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2','vendor/katex/fonts/KaTeX_Math-Italic.woff2','vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2','vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2','vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2','vendor/katex/fonts/KaTeX_Script-Regular.woff2','vendor/katex/fonts/KaTeX_Size1-Regular.woff2','vendor/katex/fonts/KaTeX_Size2-Regular.woff2','vendor/katex/fonts/KaTeX_Size3-Regular.woff2','vendor/katex/fonts/KaTeX_Size4-Regular.woff2','vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Netz zuerst (damit Updates ankommen), sonst Cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(hit => hit || caches.match('./')))
  );
});
