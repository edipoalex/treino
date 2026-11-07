/* Regras de dados vindos da planilha ou de backup (js/validacao.js). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { validarFicha, cmpFicha, limparSessao, unidOk, pesoOk } from "../js/validacao.js";

const ficha = () => JSON.parse(fs.readFileSync(new URL("../fichas/etapa-19.json", import.meta.url), "utf8"));

test("a ficha atual é válida", () => assert.equal(validarFicha(ficha()), ""));
test("recusa texto com < ou >", () => {
  const f = ficha(); f.fases["1"].A.itens[0].obs = "<script>";
  assert.notEqual(validarFicha(f), "");
});
test("recusa letra de treino inválida", () => {
  const f = ficha(); f.fases["1"].a = f.fases["1"].A;
  assert.match(validarFicha(f), /treino "a"/);
});
test("cmpFicha compara etapa e depois revisão", () => {
  assert.ok(cmpFicha({etapa:20}, {etapa:19, versao:9}) > 0);
  assert.ok(cmpFicha({etapa:19, versao:2}, {etapa:19, versao:3}) < 0);
  assert.equal(cmpFicha({etapa:19}, {etapa:19, versao:0}), 0);
});
test("limparSessao descarta inválidas e corrige campos", () => {
  assert.equal(limparSessao({ letra:"x", fase:"1", data:"2026-11-07" }), null);
  const s = limparSessao({ letra:"A", fase:2, data:"2026-11-07", inicio:"ontem", feitos:"3", modo:"outro" });
  assert.equal(s.fase, "2"); assert.equal(s.inicio, undefined); assert.equal(s.feitos, 0); assert.equal(s.modo, undefined);
});
test("unidades e peso", () => {
  assert.equal(unidOk("placas"), "placas"); assert.equal(unidOk("lb"), "kg");
  assert.ok(pesoOk({ d:"2026-11-07", kg:83.4 })); assert.ok(!pesoOk({ d:"07/11", kg:83.4 }));
});
