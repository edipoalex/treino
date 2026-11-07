/* Leitura da prescrição em séries (js/series.js). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { seriesDe, rotSerie } from "../js/series.js";

const it = (prescricao, series, extra={}) => ({ prescricao, series, ...extra });
const rot = x => seriesDe(x).map(rotSerie);

test("contraste marca pesado e leve", () => {
  assert.deepEqual(rot(it("Contraste: 1x6 / 1x20 / 1x6 / 1x20 / 1x6", 5)), ["6 pesado","20 leve","6 pesado","20 leve","6 pesado"]);
});
test("séries iguais", () => {
  assert.deepEqual(rot(it("3x12", 3)), ["12","12","12"]);
});
test('"na última" vale só para a última série', () => {
  assert.deepEqual(rot(it("3x8 (na última: drop-set)", 3)), ["8","8","8 drop-set"]);
});
test("series_detalhe da ficha tem prioridade", () => {
  assert.deepEqual(rot(it("3x10", 3, { series_detalhe:["12","10","8"] })), ["12","10","8"]);
});
test("prescrição que não dá para ler vira série numerada", () => {
  assert.deepEqual(rot(it("até a falha controlada", 2)), ["série","série"]);
});
test("toda prescrição da ficha atual gera o número certo de séries", () => {
  const f = JSON.parse(fs.readFileSync(new URL("../fichas/etapa-19.json", import.meta.url), "utf8"));
  for(const fase of Object.values(f.fases)) for(const t of Object.values(fase))
    for(const x of t.itens.concat(t.express||[])) if(x.series) assert.equal(seriesDe(x).length, x.series, x.prescricao);
});
