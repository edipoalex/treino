/* Sessão de treino redesenhada (v1.42): etiqueta do método e orientações comuns (js/recursos.js). */
import test from "node:test";
import assert from "node:assert/strict";
import { metodoDe, separarNotas } from "../js/recursos.js";
import { seriesDe, notaPrescricao, tempoDe } from "../js/series.js";
import { fonteDaFicha } from "../js/validacao.js";
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

test("séries por faixa com +: 2x12 + 1x20, 2x12 + 2x15 + 2x20 (o bi-set 3x10 + 10 continua igual)", () => {
  const r = (p, n) => seriesDe({ prescricao:p, series:n }).map(x => x.r + (x.tag ? " " + x.tag : ""));
  assert.deepEqual(r("2x12 + 1x20", 3), ["12","12","20"]);
  assert.deepEqual(r("2x12 + 2x15 + 2x20", 6), ["12","12","15","15","20","20"]);
  assert.deepEqual(r("2x12 + 1x15 (na última: até a falha)", 3), ["12","12","15 até a falha"]);
  assert.deepEqual(r("3x10 + 10", 3), ["10 + 10","10 + 10","10 + 10"]);
  assert.deepEqual(r("2x12 + 1x20", 4), ["série","série","série","série"]);   // contagem não bate: não inventa
});
test("fonte da ficha: a planilha decide; sem decisão, aparelho antigo fica no app e aparelho novo na planilha", () => {
  assert.equal(fonteDaFicha({ ficha:"planilha" }, "app"), "planilha");
  assert.equal(fonteDaFicha({ ficha:"app" }, ""), "app");
  assert.equal(fonteDaFicha({}, "app"), "app");
  assert.equal(fonteDaFicha({}, ""), "planilha");
  assert.equal(fonteDaFicha(undefined, "planilha"), "planilha");
});

test("faixa de repetições com texto depois: séries, técnica na última e o resto na orientação", () => {
  const sd = (p, n) => seriesDe({ prescricao:p, series:n }).map(x => x.r + (x.tag ? ` [${x.tag}]` : ""));
  assert.deepEqual(sd("4x8–10, descida em 3 s, profundidade máxima; RIR 1 (sem falha)", 4), ["8–10","8–10","8–10","8–10"]);
  assert.deepEqual(sd("3x10–14; na última série, drop-set de ~25% até a falha", 3), ["10–14","10–14","10–14 [drop-set]"]);
  assert.deepEqual(sd("3x10–12 por perna, tronco à frente; última série até a falha", 3), ["10–12 por perna","10–12 por perna","10–12 por perna [até a falha]"]);
  assert.deepEqual(sd("3x15–20, tronco inclinado à frente; última série em rest-pause", 3), ["15–20","15–20","15–20 [rest-pause]"]);
  assert.deepEqual(sd("2x12–15 por perna até a falha", 2), ["12–15 por perna [até a falha]","12–15 por perna [até a falha]"]);
  assert.deepEqual(sd("3x10–12, RIR 2–3", 3), ["10–12","10–12","10–12"]);
  assert.deepEqual(sd("2 séries em micro-pausas (30 / 20 s / 20 / 15 s / 10 / 10 s / 6 e falha)", 2), ["micro-pausas","micro-pausas"]);
  assert.equal(notaPrescricao({ prescricao:"4x8–10, descida em 3 s; RIR 1", series:4 }), "descida em 3 s; RIR 1");
  assert.equal(notaPrescricao({ prescricao:"4x6 (carga alta)", series:4 }), "");
  assert.equal(notaPrescricao({ prescricao:"3x10–12, RIR 2–3", series:2 }), "");   // contagem não bate: nada
});
test("cadência e pausa não viram cronômetro; isometria continua", () => {
  assert.equal(tempoDe({ nome:"Agachamento", prescricao:"4x8–10, descida em 3 s, profundidade máxima", series:4 }), null);
  assert.equal(tempoDe({ nome:"Stiff", prescricao:"3x8–10, descida em 3 s até alongar bem; RIR 1", series:3 }), null);
  assert.equal(tempoDe({ nome:"Panturrilha", prescricao:"3x10–15 com 2 s de pausa embaixo", series:3 }), null);
  assert.equal(tempoDe({ nome:"Prancha frontal", prescricao:"3x30–45 s", series:3 })?.tipo, "segurar");
});
test("aquecimento com 1 série leve de aproximação e método informado na ficha", () => {
  assert.equal(tempoDe({ nome:"Aquecimento", prescricao:"4 min de bike leve + 1 série leve de aproximação no supino", series:0, bloco:4 })?.tipo, "aquecimento");
  assert.equal(metodoDe({ nome:"Agachamento", prescricao:"4x8–10, descida em 3 s", series:4, metodo:"Cadência controlada" }), "Cadência controlada");
});
