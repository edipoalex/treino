/* Treino – service worker
   Arquivos do app: rede primeiro (versão nova assim que publicada), cache se estiver offline.
   Fontes do Google: cache primeiro (não mudam).
   A planilha (script.google.com) e qualquer POST passam direto, sem cache. */
const CACHE = "treino-v1";
const ARQUIVOS = ["./", "manifest.json", "icon.svg", "icon-180.png"];
const FONTES = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (FONTES.includes(url.hostname)) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;

  // guarda sem a query (?v=…), para a checagem de versão não encher o cache
  const chave = url.origin + url.pathname;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(chave, copia)); }
    return res;
  }).catch(() => caches.match(chave).then(r => r || caches.match(chave.replace(/index\.html$/, "")))));
});
