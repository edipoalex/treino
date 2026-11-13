/* Treino inteligente e progresso (js/inteligente.js). */
import test from "node:test";
import assert from "node:assert/strict";
import { maximos } from "../js/metricas.js";
import { sugestaoCarga, recordeAlcance, progressoExercicios, normalizar, casa, destacar, icsLembrete, primeiraData, duracaoFalada, falaFase, falaCarga } from "../js/inteligente.js";

const ses = (data, v, { s=3, sp=3, sen, g="pesado", p, u="kg", k="Supino" } = {}) =>
  ({ data, letra:"A", sen, itens:[{ n:k, s, sp, ...(p?{p:1}:{}), cs:[{ r:"6", g, c:[{ k, v:String(v), u }] }, { r:"20", g:"leve", c:[{ k, v:"50", u }] }] }] });
const sug = (ss, v="80", extra={}) => sugestaoCarga(ss, { k:"Supino", g:"pesado", atual:{ v, u:"kg" }, passo:2.5, ...extra });

test("sobe 1 passo com a mesma carga nas 2 últimas vezes, completas e sem 'pesado'", () => {
  const r = sug([ses("2026-11-02", 80), ses("2026-11-09", 80, { sen:"ponto" })]);
  assert.equal(r.tipo, "subir"); assert.equal(r.v, 82.5); assert.equal(r.titulo, "Sugestão: 82,5 kg (+2,5)");
});
test("placas sobem 1 placa", () => {
  const ss = [ses("a", 9, { u:"placas" }), ses("b", 9, { u:"placas" })];
  assert.equal(sugestaoCarga(ss, { k:"Supino", g:"pesado", atual:{ v:"9", u:"placas" }, passo:1 }).v, 10);
});
test("manter quando faltou série ou o treino foi pesado", () => {
  assert.equal(sug([ses("a", 80), ses("b", 80, { s:2 })]).tipo, "manter");
  assert.match(sug([ses("a", 80), ses("b", 80, { sen:"pesado" })]).motivo, /pesado/);
  assert.equal(sug([ses("a", 80), ses("b", 80, { s:3, p:1 })]).tipo, "manter"); // parcial
});
test("sem sugestão: primeira vez, carga já ajustada, cargas diferentes, texto livre", () => {
  assert.equal(sug([]), null);
  assert.equal(sug([ses("a", 80), ses("b", 80)], "82,5"), null);
  assert.equal(sug([ses("a", 77.5), ses("b", 80)]), null);
  assert.equal(sug([ses("a", 77.5), ses("b", 80, { sen:"pesado" })], "80").tipo, "manter");
  assert.equal(sugestaoCarga([ses("a", 80), ses("b", 80)], { k:"Supino", g:"pesado", atual:{ v:"10/20", u:"livre" }, passo:2.5 }), null);
  assert.equal(sug([ses("a", 80), ses("b", 80, { sen:"pesado" })]).tipo, "manter");
  assert.equal(sug([ses("a", 80, { sen:"pesado" }), ses("b", 80)]), null); // a penúltima pesada impede subir
});
test("grupo separado: o leve tem a própria sugestão", () => {
  const r = sugestaoCarga([ses("a", 80), ses("b", 85)], { k:"Supino", g:"leve", atual:{ v:"50", u:"kg" }, passo:2.5 });
  assert.equal(r.v, 52.5);
});
test("recorde ao alcance só quando passa o melhor", () => {
  const m = maximos([ses("a", 80), ses("b", 82.5)]);
  assert.deepEqual(recordeAlcance(m, { k:"Supino", g:"pesado", v:"85", u:"kg" }), { antes:82.5, v:85, u:"kg" });
  assert.equal(recordeAlcance(m, { k:"Supino", g:"pesado", v:"82,5", u:"kg" }), null);
  assert.equal(recordeAlcance(m, { k:"Remada", g:"", v:"50", u:"kg" }), null);
});
test("progresso por exercício: grupos, recorde e variação desde o início da etapa", () => {
  const ps = progressoExercicios([ses("2026-10-01", 70), ses("2026-10-20", 75), ses("2026-11-02", 80), ses("2026-11-09", 78)], { etapaInicio:"2026-10-15" });
  assert.equal(ps.length, 1); const e = ps[0];
  assert.equal(e.principal.g, "pesado"); assert.equal(e.principal.atual, 78); assert.equal(e.principal.recorde, 80);
  assert.equal(e.principal.de, 75); assert.equal(e.principal.pct, 4); assert.equal(e.grupos.length, 2); assert.deepEqual(e.letras, ["A"]);
});
test("busca sem acento e destaque preservando o texto", () => {
  assert.equal(normalizar("Escápulas"), "escapulas"); assert.ok(casa("Escápulas retraídas", "ESCAPULA")); assert.ok(casa("x", ""));
  assert.equal(destacar("Escápulas e escápula", "escapula"), "<mark>Escápula</mark>s e <mark>escápula</mark>");
});
test("lembrete .ics semanal com alerta", () => {
  const t = icsLembrete({ dias:[0,1,3], hora:"18:30", inicio:"2026-11-16", url:"https://x/treino/" });
  assert.match(t, /RRULE:FREQ=WEEKLY;BYDAY=MO,TU,TH/); assert.match(t, /DTSTART:20261116T183000/); assert.match(t, /TRIGGER:-PT15M/);
  assert.equal(primeiraData("2026-11-12", [0,1]), "2026-11-16"); assert.equal(primeiraData("2026-11-12", [3]), "2026-11-12");
});
test("falas", () => {
  assert.equal(duracaoFalada(30), "30 segundos"); assert.equal(duracaoFalada(60), "1 minuto"); assert.equal(duracaoFalada(150), "2 minutos e 30 segundos");
  assert.equal(falaFase("FORTE", 30), "Forte, 30 segundos");
  assert.equal(falaCarga("Série 3 · 6 · 82,5 kg"), "Série 3 , 6 , 82 vírgula 5 quilos");
});
