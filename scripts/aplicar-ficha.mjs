#!/usr/bin/env node
/* Aplica uma ficha (JSON entregue pelo agente) ao app.
   Uso: node scripts/aplicar-ficha.mjs caminho/da/ficha.json
   1. Valida a ficha (mesmas regras do app e da planilha). Com erro, não altera nada.
   2. Ajusta "versao": revisão da mesma etapa sobe a versão; etapa nova começa em 1.
   3. Grava fichas/etapa-NN.json e regera js/ficha-atual.js a partir dele.
   4. Sobe APP_VERSAO em js/versao.js (ex.: 1.17 → 1.18) e atualiza APP_DATA para hoje. */
import fs from "node:fs";
import path from "node:path";
import { RAIZ, appAtual, trechoDaFicha, checarFicha } from "./validar.mjs";
import { recursosDaFicha } from "../js/recursos.js";

const arq = process.argv[2];
if(!arq){ console.error("Uso: node scripts/aplicar-ficha.mjs ficha.json"); process.exit(1); }
let f;
try{ f = JSON.parse(fs.readFileSync(path.resolve(arq), "utf8")); }
catch(e){ console.error(`✗ ${arq}: JSON inválido (${e.message})`); process.exit(1); }

const app = appAtual();
const atual = app.ficha;

if(f.etapa < atual.etapa){ console.error(`✗ a ficha é da etapa ${f.etapa}, anterior à atual (${atual.etapa})`); process.exit(1); }
if(f.etapa === atual.etapa){
  const v = (atual.versao||0) + 1;
  if((f.versao||0) < v){ console.log(`! mesma etapa ${f.etapa}: versao ajustada de ${f.versao||0} para ${v}`); f.versao = v; }
} else if(!f.versao) f.versao = 1;

const erros = [], avisos = [];
checarFicha(f, erros, avisos);
{ const { cont } = recursosDaFicha(f), lista = o => Object.entries(o).map(([k,v])=>`${k} ${v}`).join(", ") || "nenhum";
  console.log(`Recursos · cronômetro: ${lista(cont.cronometro)} · carga: ${lista(cont.cargas)}`); }
for(const a of avisos) console.log(`! ${a}`);
if(erros.length){ for(const e of erros) console.log(`✗ ${e}`); console.log("\nNada foi alterado."); process.exit(1); }

const json = JSON.stringify(f, null, 1);
const nomeArq = `fichas/etapa-${String(f.etapa).padStart(2,"0")}.json`;
fs.mkdirSync(path.join(RAIZ, "fichas"), { recursive: true });
fs.writeFileSync(path.join(RAIZ, nomeArq), json + "\n");

const fichaPath = path.join(RAIZ, "js/ficha-atual.js");
const codigo = fs.readFileSync(fichaPath, "utf8");
const t = trechoDaFicha(codigo);
fs.writeFileSync(fichaPath, codigo.slice(0, t.ini) + json + codigo.slice(t.fim));

const [ma, mi] = app.versao.split(".").map(Number);
const novaVersao = `${ma}.${mi+1}`;
const d = new Date(); const hoje = new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const versaoPath = path.join(RAIZ, "js/versao.js");
fs.writeFileSync(versaoPath, fs.readFileSync(versaoPath, "utf8")
  .replace(/APP_VERSAO = "[^"]+"/, `APP_VERSAO = "${novaVersao}"`)
  .replace(/APP_DATA = "[^"]+"/, `APP_DATA = "${hoje}"`));

console.log(`Ficha etapa ${f.etapa} (rev. ${f.versao}) aplicada: ${nomeArq} e js/ficha-atual.js · app v${app.versao} → v${novaVersao}`);
