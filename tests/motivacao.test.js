/* Falas do treinador (js/motivacao.js e js/falas.js). */
import test from "node:test";
import assert from "node:assert/strict";
import { FALAS, TONS } from "../js/falas.js";
import { EVENTOS, FREQ, falar, total } from "../js/motivacao.js";

const novo = () => ({ ultimoEm:0, noTreino:0, sacos:{}, recentes:[] });
const sempre1 = () => 0;           // rnd que sempre passa na chance
const CTX = { letra:"A", ex:"Supino", n:1, total:4, carga:"80 kg" };

test("todo momento tem frases nos 3 estilos, ao menos 4 por estilo, sem placeholder desconhecido", () => {
  for(const ev of Object.keys(EVENTOS)) for(const tom of Object.keys(TONS)){
    const l = FALAS[ev]?.[tom]; assert.ok(l?.length >= 4, `${ev}.${tom}`);
    for(const f of l) assert.match(f, /^[^{}]*(\{(letra|ex|n|total|carga)\}[^{}]*)*$/, f);
  }
  assert.ok(total() > 250);
});
test("frases do fim do descanso são curtas (cabem grandes na tela cheia)", () => {
  for(const tom of Object.keys(TONS)) for(const f of FALAS.fimDescanso[tom]) assert.ok(f.length <= 36, f);
});
test("sem estilo marcado, não fala nada", () => {
  assert.equal(falar("inicioTreino", CTX, novo(), { tons:[], freq:"normal" }), null);
});
test("só usa os estilos marcados; Sem filtro nunca aparece desligado", () => {
  const st = novo();
  for(let i=0; i<300; i++){ const f = falar("treinoFim", CTX, st, { tons:["padrao","zoeira"], freq:"normal" }, i*1e6); assert.notEqual(f.tom, "bravo"); }
  const g = falar("treinoFim", CTX, novo(), { tons:["bravo"], freq:"normal" }); assert.equal(g.tom, "bravo");
});
test("preenche os placeholders", () => {
  const st = novo();
  for(let i=0; i<40; i++){ const f = falar("recorde", CTX, st, { tons:["padrao"], freq:"normal" }, i*1e6); assert.doesNotMatch(f.texto, /[{}]/); }
});
test("respeita o intervalo mínimo e o limite por treino; momentos 'sempre' passam", () => {
  const p = { tons:["padrao"], freq:"normal" }, st = novo();
  assert.ok(falar("serie", CTX, st, p, 1e6, sempre1));
  assert.equal(falar("serie", CTX, st, p, 1e6 + 30e3, sempre1), null);                 // 30 s < 75 s
  assert.ok(falar("recorde", CTX, st, p, 1e6 + 31e3, sempre1));                         // recorde sempre fala
  assert.ok(falar("serie", CTX, st, p, 1e6 + 31e3 + FREQ.normal.intervalo*1e3, sempre1));
  st.noTreino = FREQ.normal.limite;
  assert.equal(falar("serie", CTX, st, p, 9e9, sempre1), null);
  assert.ok(falar("treinoFim", CTX, st, p, 9e9, sempre1));
});
test("fim do descanso não conta no intervalo nem no limite", () => {
  const st = novo(), p = { tons:["padrao"], freq:"pouca" };
  for(let i=0; i<30; i++) assert.ok(falar("fimDescanso", CTX, st, p, 1e6 + i));
  assert.equal(st.noTreino, 0); assert.equal(st.ultimoEm, 0);
});
test("chance por momento: série comum fala só às vezes", () => {
  let n = 0; for(let i=0; i<1000; i++) if(falar("serie", CTX, novo(), { tons:["padrao"], freq:"normal" })) n++;
  assert.ok(n > 120 && n < 330, String(n));
});
test("não repete: usa todas as frases do momento antes de repetir", () => {
  const st = novo(), p = { tons:["padrao"], freq:"normal" }, l = FALAS.fimDescanso.padrao, vistas = new Set();
  for(let i=0; i<l.length; i++) vistas.add(falar("fimDescanso", CTX, st, p).texto);
  assert.equal(vistas.size, l.length);
});
test("estado antigo ou incompleto não quebra (repertório mudou de tamanho)", () => {
  const st = { ultimoEm:0, noTreino:0, sacos:{ "fimDescanso.padrao":[999, 0] } };
  assert.ok(falar("fimDescanso", CTX, st, { tons:["padrao"] }).texto);
  assert.ok(falar("fimDescanso", CTX, { }, { tons:["padrao"] }).texto);
});
