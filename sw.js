/* Treino – service worker
   Arquivos do app: rede primeiro (versão nova assim que publicada), cache se estiver offline.
   Fontes do Google: cache primeiro (não mudam).
   A planilha (script.google.com) e qualquer POST passam direto, sem cache. */
const CACHE = "treino-v2";
// scripts/validar.mjs confere que todo arquivo de css/ e js/ está nesta lista
const ARQUIVOS = [
  "./", "manifest.json", "icon.svg", "icon-180.png",
  "css/base.css", "css/componentes.css", "css/sessao.css", "css/telas.css",
  "js/ajustes.js", "js/app.js", "js/atualizacao.js", "js/cargas.js",
  "js/descanso.js", "js/estado.js", "js/ficha-atual.js", "js/guia-exercicios.js",
  "js/navegacao.js", "js/progresso.js", "js/series.js", "js/sync.js",
  "js/telas/ficha.js", "js/telas/guia.js", "js/telas/historico.js", "js/telas/hoje.js",
  "js/telas/sessao.js", "js/ui.js", "js/util.js", "js/validacao.js",
  "js/versao.js"
];
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
  // no-cache: revalida com o servidor, para não misturar módulos de versões diferentes
  const rede = req.mode === "navigate" ? fetch(req) : fetch(req, { cache: "no-cache" });
  e.respondWith(rede.then(res => {
    if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(chave, copia)); }
    return res;
  }).catch(() => caches.match(chave).then(r => r || caches.match(chave.replace(/index\.html$/, "")))));
});
