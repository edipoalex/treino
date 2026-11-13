#!/usr/bin/env node
/* Gera os ícones do app com a anilha nova (js/anilha.js), na cor do treino A.
   Uso: node scripts/gerar-icone.mjs   (precisa do Google Chrome instalado, para converter em PNG)
   Saída:
   - icon.svg (navegador): a anilha plana, de frente (SVG puro, sem CSS);
   - icon-180.png (iPhone), icon-192.png e icon-512.png (Android), icon-maskable-512.png (Android, com margem
     para o recorte redondo): a anilha 3D realista, renderizada pelo Chrome com o mesmo CSS do app (css/visual.css). */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { RAIZ } from "./validar.mjs";
import { anilha3D, anilhaPlana } from "../js/anilha.js";

const FUNDO = "#12161B", BORRACHA = "#AE2E34"; // = color-mix(#D6343B 80%, #101418), a borracha da anilha plana

// icon.svg: anilha plana com a cor fixa (o SVG do ícone não tem as variáveis do tema)
const plana = anilhaPlana("A").replace(/style="fill:color-mix\([^"]*\)"/, `fill="${BORRACHA}"`)
  .replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
const s = 512, tam = s*.78, x0 = (s-tam)/2;
fs.writeFileSync(path.join(RAIZ, "icon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">
  <radialGradient id="ic-fundo" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#232A33"/><stop offset="1" stop-color="${FUNDO}"/></radialGradient>
  <rect width="${s}" height="${s}" rx="112" fill="url(#ic-fundo)"/>
  <g transform="translate(${x0} ${x0}) scale(${tam/100})">${plana}</g></svg>\n`);
console.log("icon.svg");

const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "google-chrome", "chromium"].find(c => { try{ execFileSync(c, ["--version"], { stdio:"ignore" }); return true; }catch(e){ return false; } });
if(!CHROME){ console.log("Sem Chrome: PNGs não foram gerados."); process.exit(0); }
const tmp = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TMPDIR || "/tmp"), "icone-"));
const css = ["tokens","base","componentes","acabamento","visual"].map(n => `<link rel="stylesheet" href="${pathToFileURL(path.join(RAIZ, "css", n + ".css"))}">`).join("");
// iPhone recorta os cantos sozinho: PNG quadrado, sem transparência; a anilha 3D girada fica centralizada
// (posição absoluta: o Chrome headless usa uma área visível menor que a janela, e centralizar pela altura falha)
for(const [nome, px, escala] of [["icon-180.png",180,.86],["icon-192.png",192,.86],["icon-512.png",512,.86],["icon-maskable-512.png",512,.68]]){
  const arq = path.join(tmp, nome + ".html");
  fs.writeFileSync(arq, `<!DOCTYPE html><html data-theme="dark" data-mov="reduzido"><head>${css}<style>
    html,body{margin:0;background:radial-gradient(circle at 50% 38%,#232A33,${FUNDO} 70%);width:${px}px;height:${px}px;overflow:hidden}
    .plate{--size:${Math.round(px*escala)}px;position:absolute;left:${Math.round(px*(1-escala)/2 + px*.04)}px;top:${Math.round(px*(1-escala)/2)}px}
  </style></head><body><div class="plate anilha d3 L-A">${anilha3D("A")}</div></body></html>`);
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--window-size=${px},${px}`, `--screenshot=${path.join(RAIZ, nome)}`, "--virtual-time-budget=1500", pathToFileURL(arq).href], { stdio:"ignore" });
  console.log(`${nome} (${px}px)`);
}
