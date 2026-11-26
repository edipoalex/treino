/* Estilo Vidro (v1.52, Ajustes › Aparência › Estilo). O estilo Padrão não pode mudar quando o vidro existe:
   toda regra de css/vidro.css precisa estar presa a html[data-visual="vidro"], com exceção das peças que
   existem nos dois estilos (a aurora escondida e as miniaturas da página Estilo). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const ler = arq => fs.readFileSync(new URL(arq, import.meta.url), "utf8");
const css = ler("../css/vidro.css").replace(/\/\*[\s\S]*?\*\//g, "");

/* seletores das regras de estilo (ignora @keyframes e entra nos @media) */
function seletores(txt){
  const out = []; let i = 0;
  while(i < txt.length){
    const a = txt.indexOf("{", i); if(a < 0) break;
    const cab = txt.slice(i, a).trim();
    let n = 1, j = a + 1; while(n && j < txt.length){ if(txt[j]==="{") n++; else if(txt[j]==="}") n--; j++; }
    const corpo = txt.slice(a + 1, j - 1);
    if(cab.startsWith("@media")) out.push(...seletores(corpo));
    else if(!cab.startsWith("@keyframes")) out.push(...cab.split(/,(?![^(]*\))/).map(s => s.trim()));
    i = j;
  }
  return out;
}
const LIVRES = [/^#aurora( i(:nth-child\(\d\))?)?$/, /^\.aj-estilos\b/, /^\.am(-padrao|-vidro)?\b/, /^html\[data-esquema="claro"\] #aurora i/];

test("toda regra do vidro fica presa a html[data-visual=\"vidro\"]", () => {
  const soltas = seletores(css).filter(s => !s.startsWith('html[data-visual="vidro"]') && !LIVRES.some(r => r.test(s)));
  assert.deepEqual(soltas, []);
});

test("a aurora fica escondida no Padrão e o vidro tem tokens nos dois temas", () => {
  assert.match(css, /#aurora\{display:none\}/);
  assert.match(css, /html\[data-visual="vidro"\]\[data-esquema="escuro"\]\{--bg:/);
  assert.match(css, /html\[data-visual="vidro"\]\[data-esquema="claro"\]\{--bg:/);
});

test("animações reduzidas param tudo (inclusive aurora e anilha do vidro)", () => {
  assert.match(ler("../css/movimento.css"), /html\[data-mov="reduzido"\] \*,html\[data-mov="reduzido"\] \*::before,html\[data-mov="reduzido"\] \*::after\{animation:none!important/);
});

test("a preferência é normalizada e aplicada no <html>", () => {
  assert.match(ler("../js/estado.js"), /visual: S\.pref\?\.visual==="vidro" \? "vidro" : "padrao"/);
  assert.match(ler("../js/ui.js"), /r\.dataset\.visual = S\.pref\?\.visual==="vidro" \? "vidro" : "padrao"/);
  assert.match(ler("../index.html"), /<div id="aurora" aria-hidden="true">/);
});
