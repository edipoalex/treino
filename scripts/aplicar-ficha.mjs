#!/usr/bin/env node
/* Aplica uma ficha (JSON entregue pelo agente) ao app.
   Uso: node scripts/aplicar-ficha.mjs caminho/da/ficha.json
   1. Valida a ficha (mesmas regras do app e da planilha). Com erro, não altera nada.
   2. Ajusta "versao": revisão da mesma etapa sobe a versão; etapa nova começa em 1.
   3. Grava fichas/etapa-NN.json e substitui FICHA_EMBUTIDA no index.html.
   4. Sobe APP_VERSAO (ex.: 1.13 → 1.14) e atualiza APP_DATA para hoje. */
import fs from "node:fs";
import path from "node:path";
import { RAIZ, lerApp, scriptDoApp, trechoDaFicha, checarFicha } from "./validar.mjs";

const arq = process.argv[2];
if(!arq){ console.error("Uso: node scripts/aplicar-ficha.mjs ficha.json"); process.exit(1); }
let f;
try{ f = JSON.parse(fs.readFileSync(path.resolve(arq), "utf8")); }
catch(e){ console.error(`✗ ${arq}: JSON inválido (${e.message})`); process.exit(1); }

const indexPath = path.join(RAIZ, "index.html");
const html = fs.readFileSync(indexPath, "utf8");
const app = lerApp(html);
const atual = app.ficha;

if(f.etapa < atual.etapa){ console.error(`✗ a ficha é da etapa ${f.etapa}, anterior à atual (${atual.etapa})`); process.exit(1); }
if(f.etapa === atual.etapa){
  const v = (atual.versao||0) + 1;
  if((f.versao||0) < v){ console.log(`! mesma etapa ${f.etapa}: versao ajustada de ${f.versao||0} para ${v}`); f.versao = v; }
} else if(!f.versao) f.versao = 1;

const erros = [], avisos = [];
checarFicha(f, app.codigo, erros, avisos);
for(const a of avisos) console.log(`! ${a}`);
if(erros.length){ for(const e of erros) console.log(`✗ ${e}`); console.log("\nNada foi alterado."); process.exit(1); }

const json = JSON.stringify(f, null, 1);
const nomeArq = `fichas/etapa-${String(f.etapa).padStart(2,"0")}.json`;
fs.mkdirSync(path.join(RAIZ, "fichas"), { recursive: true });
fs.writeFileSync(path.join(RAIZ, nomeArq), json + "\n");

const codigo = scriptDoApp(html);
const t = trechoDaFicha(codigo);
const [ma, mi] = app.versao.split(".").map(Number);
const novaVersao = `${ma}.${mi+1}`;
const d = new Date(); const hoje = new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const novoCodigo = (codigo.slice(0, t.ini) + json + codigo.slice(t.fim))
  .replace(/const APP_VERSAO = "[^"]+"/, `const APP_VERSAO = "${novaVersao}"`)
  .replace(/const APP_DATA = "[^"]+"/, `const APP_DATA = "${hoje}"`);
fs.writeFileSync(indexPath, html.replace(codigo, () => novoCodigo));

console.log(`Ficha etapa ${f.etapa} (rev. ${f.versao}) aplicada: ${nomeArq} e index.html · app v${app.versao} → v${novaVersao}`);
