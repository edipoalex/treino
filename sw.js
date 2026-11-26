/* Treino – service worker
   Arquivos do app: rede primeiro (versão nova assim que publicada), cache se estiver offline.
   Imagens (img/, v1.47): cache primeiro, sem esperar a rede. Elas só mudam junto com a versão do app, e a troca de
   versão (CACHE novo) baixa todas de novo na instalação; assim a anilha do card Hoje aparece na hora, mesmo com rede lenta.
   Fontes do Google: cache primeiro (não mudam).
   A planilha (script.google.com) e qualquer POST passam direto, sem cache. */
const CACHE = "treino-v29";
// scripts/validar.mjs confere que todo arquivo de css/ e js/ está nesta lista
const ARQUIVOS = [
  "./", "manifest.json", "icon.svg", "icon-180.png", "icon-192.png", "icon-512.png",
  "css/tokens.css", "css/base.css", "css/componentes.css", "css/sessao.css", "css/telas.css",
  "css/habito.css", "css/progresso.css", "css/visual.css", "css/card-treino.css", "css/acabamento.css", "css/movimento.css", "css/sessao-sx.css", "css/balao.css", "css/vidro.css",
  "js/ajustes.js", "js/anilha.js", "js/app.js", "js/balao.js", "js/atualizacao.js", "js/cargas.js", "js/compartilhar.js",
  "js/descanso.js", "js/dicas.js", "js/estado.js", "js/execucao.js", "js/ficha-atual.js", "js/guia-exercicios.js", "js/habito.js", "js/icones.js", "js/falas.js", "js/inteligente.js", "js/metricas.js", "js/motivacao.js", "js/movimento.js",
  "js/navegacao.js", "js/personagens.js", "js/progresso.js", "js/recursos.js", "js/tecnicas.js", "js/series.js", "js/sync.js",
  "js/telas/boas-vindas.js", "js/telas/card-treino.js", "js/telas/ficha.js", "js/telas/guia.js", "js/telas/habito.js", "js/telas/historico.js", "js/telas/progresso.js", "js/telas/hoje.js",
  "js/telas/sessao.js", "js/ui.js", "js/util.js", "js/validacao.js", "js/voz.js",
  "js/versao.js",
  "img/anilhas/anilha-A.webp", "img/anilhas/anilha-B.webp", "img/anilhas/anilha-C.webp", "img/anilhas/anilha-D.webp", "img/anilhas/anilha-E.webp"
];
const FONTES = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  // cache "reload": baixa do servidor, sem pegar cópia antiga do cache HTTP do navegador
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
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
  if (url.pathname.includes("/img/")) {
    e.respondWith(caches.match(chave).then(r => r || fetch(req).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(chave, copia)); }
      return res;
    })));
    return;
  }
  // no-cache: revalida com o servidor, para não misturar módulos de versões diferentes
  // a página também revalida: um index.html antigo do cache HTTP com módulos novos quebrava a abertura
  const rede = req.mode === "navigate" ? fetch(req.url, { cache: "no-cache", credentials: "same-origin", redirect: "manual" }) : fetch(req, { cache: "no-cache" });
  e.respondWith(rede.then(res => {
    if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(chave, copia)); }
    return res;
  }).catch(() => caches.match(chave).then(r => r || caches.match(chave.replace(/index\.html$/, "")))));
});
