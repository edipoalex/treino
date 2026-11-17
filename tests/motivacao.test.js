/* Falas do treinador (js/motivacao.js e js/falas.js). */
import test from "node:test";
import assert from "node:assert/strict";
import { FALAS, TONS, CATEGORIAS } from "../js/falas.js";
import { EVENTOS, FREQ, falar, total, grupos } from "../js/motivacao.js";
const todas = (ev, tom) => Object.values(grupos(FALAS[ev][tom])).flat();

const novo = () => ({ ultimoEm:0, noTreino:0, sacos:{}, recentes:[] });
const sempre1 = () => 0;           // rnd que sempre passa na chance
const CTX = { letra:"A", ex:"Supino", n:1, total:4, carga:"80 kg" };

test("todo momento tem frases nos 3 estilos, ao menos 4 por estilo, sem placeholder desconhecido", () => {
  for(const ev of Object.keys(EVENTOS)) for(const tom of Object.keys(TONS)){
    const l = todas(ev, tom); assert.ok(l.length >= 5, `${ev}.${tom}`);
    for(const f of l) assert.match(f, /^[^{}]*(\{(letra|ex|n|total|carga)\}[^{}]*)*$/, f);
  }
  assert.ok(total() > 500);
});
test("frases do fim do descanso cabem no aviso e na tela cheia (até 60 letras; acima de 32 a letra diminui)", () => {
  for(const tom of Object.keys(TONS)) for(const f of todas("fimDescanso", tom)) assert.ok(f.length <= 60, f);
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
  const st = novo(), p = { tons:["padrao"], freq:"normal" }, l = todas("fimDescanso","padrao"), vistas = new Set();
  for(let i=0; i<l.length; i++) vistas.add(falar("fimDescanso", CTX, st, p).texto);
  assert.equal(vistas.size, l.length);
});
test("categorias: só as registradas, nenhum grupo vazio", () => {
  for(const ev of Object.keys(EVENTOS)) for(const tom of Object.keys(TONS)){
    const v = FALAS[ev][tom];
    if(Array.isArray(v)) continue;
    for(const [c, l] of Object.entries(v)){ assert.ok(CATEGORIAS[tom][c], `${ev}.${tom}: categoria "${c}" não registrada`); assert.ok(l.length > 0, `${ev}.${tom}.${c} vazio`); }
  }
});
test("categorias: alterna sem repetir frase; com grupos parecidos, nunca a mesma categoria em seguida", () => {
  const antes = FALAS.volta.zoeira; FALAS.volta.zoeira = { classico:["a1","a2","a3","a4"], cotidiano:["b1","b2","b3","b4"], pop:["c1","c2","c3","c4"] };
  try{ const st = novo(), vistas = new Set(); let ant = null;
    for(let i=0;i<12;i++){ const f = falar("volta", CTX, st, { tons:["zoeira"] }, i*1e6); assert.notEqual(f.cat, ant); ant = f.cat; vistas.add(f.texto); }
    assert.equal(vistas.size, 12); }
  finally{ FALAS.volta.zoeira = antes; }
});
test("categorias: no repertório real, todas aparecem e a repetição em seguida é rara", () => {
  const st = novo(), p = { tons:["zoeira"], freq:"normal" }, vistas = new Set(); let ant = null, rep = 0;
  for(let i=0; i<200; i++){ const ev = ["fimDescanso","treinoFim","recorde","volta","metaSemana"][i%5];   // momentos que sempre falam
    const f = falar(ev, CTX, st, p, i*1e6); if(f.cat===ant) rep++; ant = f.cat; vistas.add(f.cat); }
  assert.deepEqual([...vistas].sort(), Object.keys(CATEGORIAS.zoeira).sort());
  assert.ok(rep < 30, `${rep} repetições em 200`);
});
test("lista simples (sem categorias) continua funcionando", () => {
  const antes = FALAS.volta.padrao; FALAS.volta.padrao = ["A", "B", "C", "D", "E"];
  try{ const st = novo(), vistas = new Set(); for(let i=0;i<5;i++){ const f = falar("volta", CTX, st, { tons:["padrao"] }, i*1e6); vistas.add(f.texto); assert.equal(f.cat, "geral"); } assert.equal(vistas.size, 5); }
  finally{ FALAS.volta.padrao = antes; }
});
test("estado antigo ou incompleto não quebra (repertório mudou de tamanho)", () => {
  const st = { ultimoEm:0, noTreino:0, sacos:{ "fimDescanso.padrao":[999, 0], "fimDescanso.padrao.incentivo":[999] } };
  assert.ok(falar("fimDescanso", CTX, st, { tons:["padrao"] }).texto);
  assert.ok(falar("fimDescanso", CTX, { }, { tons:["padrao"] }).texto);
});
