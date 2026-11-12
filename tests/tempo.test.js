/* Partes com tempo da prescrição (js/series.js › tempoDe), base do cronômetro de execução. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { tempoDe } from "../js/series.js";

const it = (prescricao, series=3, nome="Exercício") => ({ prescricao, series, nome });

test("prancha dentro da série", () => {
  const t = tempoDe(it("3 voltas: 15 reps + 45s de prancha", 3, "Abdômen: elevação de pernas na paralela + prancha"));
  assert.equal(t.tipo, "segurar"); assert.equal(t.botao, "Prancha 45 s"); assert.deepEqual(t.etapas.map(e=>e.seg), [45]);
});
test("por lado: dois lados com troca", () => {
  const t = tempoDe(it("3 voltas: 10 + 15 reps + 30s por lado", 3, "Core: roda abdominal + abdominal remador + prancha lateral"));
  assert.equal(t.botao, "Prancha lateral 30 s × 2"); assert.deepEqual(t.etapas.map(e=>e.tipo), ["exec","troca","exec"]);
});
test("rest-pause vira partes com pausas", () => {
  const t = tempoDe(it("Rest-pause 2x (falha / 10s / falha / 10s / falha)", 2));
  assert.equal(t.tipo, "partes"); assert.deepEqual(t.partes, [{rot:"falha"},{pausa:10},{rot:"falha"},{pausa:10},{rot:"falha"}]);
});
test("micro-pausas com pausas diferentes", () => {
  const t = tempoDe(it("Micro-pausas 2x (1x30 / 20s / 1x20 / 15s / 1x10 / 10s / 1x6 / falha)", 2));
  assert.deepEqual(t.partes.filter(p=>p.pausa).map(p=>p.pausa), [20,15,10]);
});
test("HIIT do cardio vira intervalos", () => {
  const t = tempoDe(it("HIIT: 6x (30s forte / 30s leve) + 2 min de desaquecimento", 0, "Cardio"));
  assert.deepEqual([t.tipo, t.rodadas, t.a.rot, t.b.rot, t.desaquecer], ["intervalo", 6, "forte", "leve", 120]);
});
test("intervalado em minutos", () => {
  const t = tempoDe(it("Intervalado: 3x (4 min forte / 3 min leve)", 0, "Cardio"));
  assert.deepEqual([t.tipo, t.rodadas, t.a.seg, t.a.tipo, t.b.seg, t.b.tipo, t.rotulo], ["intervalo", 3, 240, "forte", 180, "leve", "Intervalado"]);
});
test("cardio contínuo usa o tempo do bloco", () => {
  const t = tempoDe({ prescricao:"Zona 2 contínuo", series:0, bloco:8, nome:"Cardio" });
  assert.deepEqual([t.tipo, t.seg, t.rot], ["continuo", 480, "Zona 2"]);
});
test("aquecimento com tempo e séries de aproximação", () => {
  const t = tempoDe({ prescricao:"5 min de esteira leve + 2 séries de aproximação no supino", series:0, bloco:5, nome:"Aquecimento" });
  assert.deepEqual([t.tipo, t.seg, t.rot, t.passos], ["aquecimento", 300, "esteira leve", 2]);
});
test("sem tempo e descanso citado não viram cronômetro", () => {
  assert.equal(tempoDe(it("Contraste: 1x6 / 1x20 / 1x6")), null);
  assert.equal(tempoDe(it("3x12 (descanso 60s)")), null);
  assert.equal(tempoDe(it("Mobilidade de ombro + 2 séries de aproximação na puxada", 0)), null);
});
test("na ficha atual, só exercícios com tempo ganham cronômetro", () => {
  const f = JSON.parse(fs.readFileSync(new URL("../fichas/etapa-19.json", import.meta.url), "utf8"));
  const achados = new Set();
  for(const fase of Object.values(f.fases)) for(const t of Object.values(fase)) for(const x of t.itens.concat(t.express||[])){
    const r = tempoDe(x); if(r) achados.add(r.tipo);
    if(r?.tipo==="segurar") assert.match(x.prescricao, /\d+\s*s/);
  }
  assert.deepEqual([...achados].sort(), ["aquecimento","continuo","intervalo","partes","segurar"]);
});
