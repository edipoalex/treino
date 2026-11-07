#!/usr/bin/env node
/* Gera os ícones do app a partir da anilha 3D (js/anilha.js), na cor do treino A.
   Uso: node scripts/gerar-icone.mjs   (precisa do Google Chrome instalado, para converter em PNG)
   Saída: icon.svg (navegador), icon-180.png (iPhone), icon-192.png e icon-512.png (Android),
   icon-maskable-512.png (Android, com margem de segurança para o recorte redondo). */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { RAIZ } from "./validar.mjs";
import { anilhaSVG } from "../js/anilha.js";

const COR = "#D6343B", FUNDO = "#12161B";
const html = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
const defs = html.match(/<defs>[\s\S]*?<\/defs>/)[0];
// a anilha usa as variáveis do tema; no ícone a cor é fixa
const anilha = anilhaSVG("A", { d3: true, detalhada: true, texto: false })
  .replace(/style="fill:var\(--c\)"/g, `fill="${COR}"`)
  .replace(/<svg viewBox="0 0 100 100" aria-hidden="true">/, "").replace(/<\/svg>$/, "");

// escala = tamanho da anilha em relação ao ícone (o maskable precisa caber no círculo central de 80%)
function icone(escala, cantos){
  const s = 512, tam = s*escala, x = (s - tam)/2 + tam*.02, y = (s - tam)/2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">${defs}
  <radialGradient id="ic-fundo" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#232A33"/><stop offset="1" stop-color="${FUNDO}"/></radialGradient>
  <rect width="${s}" height="${s}" ${cantos?'rx="112"':""} fill="url(#ic-fundo)"/>
  <g transform="translate(${x} ${y}) scale(${tam/100})">${anilha}</g></svg>`;
}
fs.writeFileSync(path.join(RAIZ, "icon.svg"), icone(.78, true) + "\n");

const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "google-chrome", "chromium"].find(c => { try{ execFileSync(c, ["--version"], { stdio:"ignore" }); return true; }catch(e){ return false; } });
if(!CHROME){ console.log("icon.svg gerado. Sem Chrome: PNGs não foram gerados."); process.exit(0); }
const tmp = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TMPDIR || "/tmp"), "icone-"));
// iPhone recorta os cantos sozinho: PNG quadrado, sem transparência
for(const [nome, px, escala] of [["icon-180.png",180,.78],["icon-192.png",192,.78],["icon-512.png",512,.78],["icon-maskable-512.png",512,.62]]){
  const arq = path.join(tmp, nome + ".html");
  fs.writeFileSync(arq, `<!DOCTYPE html><html><body style="margin:0;background:${FUNDO}"><div style="width:${px}px;height:${px}px">${icone(escala, false).replace("<svg ", `<svg width="${px}" height="${px}" `)}</div></body></html>`);
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--window-size=${px},${px}`, `--screenshot=${path.join(RAIZ, nome)}`, "file://" + arq], { stdio: "ignore" });
  console.log(`${nome} (${px}px)`);
}
console.log("icon.svg");
