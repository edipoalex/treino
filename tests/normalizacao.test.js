/* Normalização de fichas (contrato v1, agente/normalizacao.md): catálogo de técnicas e componentes (js/tecnicas.js),
   validador e o script de apoio. A ficha de exemplo, passada pelo rascunho, tem de validar e reproduzir exatamente o
   que o app faz hoje lendo o texto: se o catálogo e os leitores do app divergirem, este teste quebra. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { checarItem, validarNormalizada, TECNICAS, COMPONENTES } from "../js/tecnicas.js";
import { checarFicha } from "../scripts/validar.mjs";

const base = { nome:"Voador peitoral", prescricao:"Rest-pause 2x (falha / 10s / falha / 10s / falha)", series:2, exec:1, descanso:1, bloco:5,
  tipo:"forca", series_detalhe:["falha / 10s / falha / 10s / falha","falha / 10s / falha / 10s / falha"],
  tecnicas:[{ id:"rest-pause", aplica:"todas", pausa_s:10, blocos:3 }], componentes:["cargas-unica","cronometro-partes"] };
const com = mud => ({ ...structuredClone(base), ...mud });

test("item normalizado válido passa sem erros", () => assert.deepEqual(checarItem(base).erros, []));

test("técnica fora do catálogo e componente que falta são erros", () => {
  assert.match(checarItem(com({ tecnicas:[{ id:"cluster" }] })).erros.join(), /não está no catálogo/);
  assert.match(checarItem(com({ componentes:["cargas-unica"] })).erros.join(), /falta o componente "cronometro-partes"/);
  assert.match(checarItem(com({ componentes:["cargas-unica","cronometro-partes","fases-intervalo"] })).erros.join(), /sem técnica que o justifique/);
});

test("componente que ainda não existe no app bloqueia; parâmetro assumido vira aviso", () => {
  const r = checarItem(com({ tecnicas:[{ id:"rest-pause", aplica:"ultima", pausa_s:10, blocos:3, assumido:["pausa_s","blocos"] }],
    componentes:["cargas-unica","cronometro-partes-ultima"] }));
  assert.match(r.erros.join(), /ainda não existe no app/);
  assert.match(r.avisos.join(), /assumido/);
});

test("parâmetros: tipo, faixa e nomes conferidos", () => {
  assert.match(checarItem(com({ tecnicas:[{ id:"rest-pause", pausa_s:300, blocos:3 }] })).erros.join(), /pausa_s" inválido/);
  assert.match(checarItem(com({ tecnicas:[{ id:"rest-pause", pausa_s:10, blocos:3, segundos:5 }] })).erros.join(), /desconhecido/);
});

test("carga: exatamente um componente de carga; contraste pede pesado-leve; core em combinação pode ser sem carga", () => {
  assert.match(checarItem(com({ componentes:["cronometro-partes"] })).erros.join(), /exatamente um componente de carga/);
  assert.match(checarItem(com({ tecnicas:[{ id:"contraste" }], componentes:["cargas-unica"] })).erros.join(), /pede "cargas-pesado-leve"/);
  assert.deepEqual(checarItem(com({ tipo:"core", tecnicas:[{ id:"bi-set" }], componentes:["sem-carga"] })).erros, []);
});

test("catálogo coerente: toda técnica só aponta para componentes do catálogo", () => {
  for(const [id, t] of Object.entries(TECNICAS)){
    for(const lista of Object.values(t.componentes)) for(const c of lista) assert.ok(COMPONENTES[c], `${id} → ${c}`);
    if(t.carga) assert.equal(COMPONENTES[t.carga]?.grupo, "carga", id);
  }
});

test("ficha de exemplo: rascunho valida e reproduz o comportamento atual do app", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "norm-")), orig = path.join(dir, "original.json"), saida = path.join(dir, "n.json");
  fs.copyFileSync(new URL("./ficha-exemplo.json", import.meta.url), orig);
  execFileSync(process.execPath, [new URL("../scripts/normalizacao.mjs", import.meta.url).pathname, "rascunho", orig, saida]);
  const f = JSON.parse(fs.readFileSync(saida, "utf8")); delete f.normalizacao.rascunho;
  const { erros, linhas } = validarNormalizada(f, JSON.parse(fs.readFileSync(orig, "utf8")));
  const semSeries = l => l.erros.every(e => /series_detalhe/.test(e));   // séries não lidas: é a revisão humana que completa
  assert.deepEqual(erros.filter(e => !/series_detalhe/.test(e)), []);
  assert.ok(linhas.length > 10);
  assert.deepEqual(linhas.filter(l => l.muda && semSeries(l)).map(l => l.nome), []);
});

test("publicação: ficha normalizada só passa sem erros do validador (fase 2)", () => {
  const ruim = []; checarFicha({ normalizacao:{ versao:1 } }, ruim, []);
  assert.match(ruim.join(), /normalização ·/);
  const rasc = []; checarFicha({ normalizacao:{ versao:1, rascunho:true } }, rasc, []);
  assert.match(rasc.join(), /rascunho/);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "norm-pub-")), saida = path.join(dir, "n.json");
  execFileSync(process.execPath, [new URL("../scripts/normalizacao.mjs", import.meta.url).pathname, "rascunho", new URL("../fichas/etapa-19.json", import.meta.url).pathname, saida]);
  const f = JSON.parse(fs.readFileSync(saida, "utf8")); delete f.normalizacao.rascunho;
  const erros = [], avisos = []; checarFicha(f, erros, avisos);
  assert.deepEqual(erros.filter(e => /normaliza/.test(e)), []);
});
