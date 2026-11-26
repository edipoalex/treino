/* Fase 2 da normalização: o app lê os campos normalizados (tecnicas, componentes, series_detalhe "reps · etiqueta").
   Uma ficha lida pelo texto e a mesma ficha normalizada têm de dar exatamente o mesmo comportamento: séries e
   etiquetas, cronômetro, carga (pede ou não, contraste, combinada) e a etiqueta do método. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { seriesDe, tempoDe, tempoDaSerie } from "../js/series.js";
import { recursosDe, temCarga, contraste, metodoDe } from "../js/recursos.js";
import { validarNormalizada } from "../js/tecnicas.js";

function normalizar(arq){
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "norm2-")), orig = path.join(dir, "o.json"), saida = path.join(dir, "n.json");
  fs.copyFileSync(arq, orig);
  execFileSync(process.execPath, [new URL("../scripts/normalizacao.mjs", import.meta.url).pathname, "rascunho", orig, saida]);
  const n = JSON.parse(fs.readFileSync(saida, "utf8")); delete n.normalizacao.rascunho;
  return { o: JSON.parse(fs.readFileSync(orig, "utf8")), n };
}
const pares = (o, n) => Object.entries(o.fases).flatMap(([fase, ts]) => Object.entries(ts).flatMap(([L, t]) =>
  ["itens","express"].flatMap(lista => (t[lista]||[]).map((it, i) => [it, n.fases[fase][L][lista][i], `${L}${lista==="express"?" express":""} f${fase} · ${it.nome}`]))));
const comportamento = it => ({ series: it.series>0 ? seriesDe(it) : null, tempo: tempoDe(it), carga: temCarga(it), contraste: it.series>0 ? contraste(it) : null,
  metodo: metodoDe(it), recursos: (({ cronometro, cargas }) => ({ cronometro, cargas }))(recursosDe(it)) });

for(const [nome, arq] of [["ficha de exemplo", new URL("./ficha-exemplo.json", import.meta.url)], ["etapa 19", new URL("../fichas/etapa-19.json", import.meta.url)]]){
  test(`${nome}: normalizada = lida pelo texto, exercício a exercício`, () => {
    const { o, n } = normalizar(arq);
    // itens cujas séries o texto não consegue ler ficam de fora: a normalização (revisão do Claude) os completa
    for(const [a, b, onde] of pares(o, n)){
      if(a.series>0 && seriesDe(a).every(s=>s.r==="série")) continue;
      assert.deepEqual(comportamento(b), comportamento(a), onde);
    }
  });
  test(`${nome}: normalizada passa no validador`, () => {
    const { o, n } = normalizar(arq);
    assert.deepEqual(validarNormalizada(n, o).erros.filter(e=>!/series_detalhe/.test(e)), []);
  });
}

test("fase 3: rest-pause só na última série liga o cronômetro de partes apenas na última", () => {
  const it = { nome:"Cadeira abdutora", prescricao:"3x15–20; última série em rest-pause", series:3, tipo:"forca",
    series_detalhe:["15–20","15–20","15–20 · rest-pause"], tecnicas:[{ id:"rest-pause", aplica:"ultima", pausa_s:10, blocos:3 }], componentes:["cargas-unica","cronometro-partes-ultima"] };
  assert.equal(tempoDe(it).so, "ultima");
  assert.equal(tempoDaSerie(it, 0), null);
  assert.equal(tempoDaSerie(it, 1), null);
  assert.deepEqual(tempoDaSerie(it, 2).partes, [{ rot:"falha" }, { pausa:10 }, { rot:"falha" }, { pausa:10 }, { rot:"falha" }]);
  assert.deepEqual(seriesDe(it)[2], { r:"15–20", tag:"rest-pause" });
  assert.equal(recursosDe(it).cronometro, "partes-ultima");
  assert.equal(metodoDe(it), "");
  // micro-pausas na última também
  const mp = { ...it, tecnicas:[{ id:"micro-pausas", aplica:"ultima", blocos:[{ reps:"12", pausa_s:15 }, { reps:"8", pausa_s:15 }, { reps:"falha" }] }] };
  assert.deepEqual(tempoDaSerie(mp, 2).partes, [{ rot:"12" }, { pausa:15 }, { rot:"8" }, { pausa:15 }, { rot:"falha" }]);
  assert.equal(tempoDaSerie(mp, 1), null);
});

test("contrato v1: campos normalizados vencem o texto", () => {
  // o nome tem " + ", mas a ficha diz carga única; o texto não cita tempo, mas a técnica é isometria de 30 s por lado
  const it = { nome:"Prancha + respiração", prescricao:"3 voltas", series:3, tipo:"core", series_detalhe:["30 s","30 s","30 s"],
    tecnicas:[{ id:"isometria", segundos:30, por_lado:true }], componentes:["cronometro-segurar","sem-carga"] };
  assert.equal(temCarga(it), false);
  assert.equal(recursosDe(it).cargas, "sem");
  assert.equal(tempoDe(it).botao, "Prancha 30 s × 2");
  assert.equal(metodoDe(it), "Isometria");
});
