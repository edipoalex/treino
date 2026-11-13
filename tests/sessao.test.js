/* Sessão de treino redesenhada (v1.42): etiqueta do método e orientações comuns (js/recursos.js). */
import test from "node:test";
import assert from "node:assert/strict";
import { metodoDe, separarNotas } from "../js/recursos.js";
import { FICHA_EMBUTIDA } from "../js/ficha-atual.js";

const it = (prescricao, extra={}) => ({ nome:"Supino", prescricao, series:3, ...extra });
test("etiqueta do método lida da prescrição", () => {
  assert.equal(metodoDe(it("Contraste: 1x6 pesado / 1x20 leve / 1x6", { series:3 })), "Contraste");
  assert.equal(metodoDe(it("Rest-pause 2x (falha / 10s / falha / 10s / falha)", { series:2 })), "Rest-pause");
  assert.equal(metodoDe(it("Bi-set 2x12+12", { series:2 })), "Bi-set");
  assert.equal(metodoDe(it("Drop duplo 2x (10 reps / −10% até a falha / −10% até a falha)", { series:2 })), "Drop duplo");
  assert.equal(metodoDe(it("Pirâmide: 1x30 / 1x20 / 1x10 / 1x6", { series:4 })), "Pirâmide");
  assert.equal(metodoDe(it("3x8 (na última: drop −20% até a falha)")), "Drop");
  assert.equal(metodoDe(it("3x12+15", { nome:"Panturrilha em pé + sentada (bi-set)" })), "Bi-set");
  assert.equal(metodoDe(it("3x até próximo da falha")), "Até a falha");
  assert.equal(metodoDe(it("3x (10 + 15 reps + 30s por lado)", { nome:"Core: roda + remador + prancha lateral" })), "Tri-set");
  assert.equal(metodoDe(it("3x10")), "");
  assert.equal(metodoDe({ nome:"Cardio", prescricao:"HIIT: 6x (30s forte / 30s leve) + 2 min de desaquecimento", series:0, bloco:10 }), "HIIT");
  assert.equal(metodoDe({ nome:"Cardio", prescricao:"Zona 2 na bike (baixo impacto)", series:0, bloco:8 }), "Zona 2");
  assert.equal(metodoDe({ nome:"Aquecimento", prescricao:"5 min de esteira leve + 2 séries de aproximação no supino", series:0, bloco:5 }), "");
});
test("etiqueta curta em todos os itens da ficha", () => {
  for(const ts of Object.values(FICHA_EMBUTIDA.fases)) for(const t of Object.values(ts)) for(const x of t.itens.concat(t.express||[]))
    assert.ok(metodoDe(x).length <= 20, `${x.nome}: ${metodoDe(x)}`);
});
test("orientação repetida vira nota do treino; o resto fica no item", () => {
  const cal = "Volta de calibração: pare 1–2 reps antes da falha nas técnicas";
  const r = separarNotas([ "", `${cal}. Quanto menos reps, mais carga`, cal, `${cal}. 1ª falha entre 10 e 14 reps`, cal, "Bike ou esteira; PSE 8–9 nos tiros" ]);
  assert.equal(r.comum, cal); assert.equal(r.rotulo, "Volta de calibração");
  assert.deepEqual(r.proprias, ["", "Quanto menos reps, mais carga", "", "1ª falha entre 10 e 14 reps", "", "Bike ou esteira. PSE 8–9 nos tiros"]);
});
test("sem repetição, nada vira nota do treino", () => {
  const r = separarNotas(["Pré-exaustão", "Descanso maior", ""]);
  assert.equal(r.comum, ""); assert.equal(r.rotulo, ""); assert.deepEqual(r.proprias, ["Pré-exaustão", "Descanso maior", ""]);
});
