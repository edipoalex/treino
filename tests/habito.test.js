/* Hábito (js/habito.js): sequência, blocos da etapa, marcos, revisão da semana e fechamento. */
import test from "node:test";
import assert from "node:assert/strict";
import { sequencia, textoSequencia, blocosEtapa, marcoConclusao, resumoSemana, evolucaoCargas, distSensacao, textoFechamento, segunda } from "../js/habito.js";

const meta = { min:4, max:5 };
// semanas de 2026: 02/11 (seg) a 08/11, 09/11 a 15/11, 16/11 a 22/11
const sem = (seg, n) => Array.from({length:n}, (_, i) => `2026-11-${String(+seg.slice(8)+i).padStart(2,"0")}`);

test("segunda-feira da semana", () => {
  assert.equal(segunda("2026-11-15"), "2026-11-09"); // domingo
  assert.equal(segunda("2026-11-09"), "2026-11-09");
  assert.equal(segunda("2026-11-01"), "2026-10-26"); // virada de mês
});
test("sequência conta semanas anteriores com a meta e a atual só quando batida", () => {
  const datas = [...sem("2026-11-02", 4), ...sem("2026-11-09", 5), "2026-11-16", "2026-11-17"];
  const r = sequencia(datas, meta, "2026-11-18"); // quarta, 2 feitos
  assert.equal(r.ant, 2); assert.equal(r.seq, 2); assert.equal(r.n, 2); assert.equal(r.estado, "normal"); assert.equal(r.restam, 5);
  const b = sequencia([...datas, "2026-11-18", "2026-11-19"], meta, "2026-11-19");
  assert.equal(b.estado, "batida"); assert.equal(b.seq, 3);
  assert.equal(sequencia([...datas, "2026-11-18", "2026-11-19", "2026-11-20"], meta, "2026-11-20").estado, "perfeita");
});
test("semana abaixo da meta quebra a sequência anterior", () => {
  const r = sequencia([...sem("2026-11-02", 4), "2026-11-09", "2026-11-10"], meta, "2026-11-16");
  assert.equal(r.ant, 0); assert.equal(r.seq, 0);
});
test("em risco quando faltam tantos treinos quanto dias, em pausa quando não dá mais", () => {
  const base = sem("2026-11-09", 4);
  const risco = sequencia([...base, "2026-11-16", "2026-11-17"], meta, "2026-11-21"); // sábado, sem treino hoje
  assert.equal(risco.estado, "risco"); assert.equal(risco.seq, 1);
  assert.match(textoSequencia(risco).texto, /Faltam 2 treinos e restam 2 dias: hoje e domingo/);
  const pausa = sequencia([...base, "2026-11-16"], meta, "2026-11-21");
  assert.equal(pausa.estado, "pausa"); assert.equal(pausa.seq, 0);
  assert.equal(textoSequencia(pausa).titulo, "Sequência em pausa");
});
test("treino de hoje tira o dia de hoje dos que restam", () => {
  const r = sequencia(["2026-11-16", "2026-11-18"], meta, "2026-11-18");
  assert.equal(r.restam, 4);
});
test("sem histórico: convite para começar", () => {
  const t = textoSequencia(sequencia([], meta, "2026-11-16"));
  assert.equal(t.titulo, "Comece uma sequência"); assert.equal(t.texto, "Faça 4 treinos até domingo.");
});
test("blocos por voltas preenchem em ordem e agrupam as fases", () => {
  const sessoes = "ABCDEABCDEAB".split("").map(letra => ({ letra }));
  const fv = { "1":[1], "2":[2,3,4,5,6] };
  const r = blocosEtapa({ porVoltas:true, blocos:6, porBloco:5, faseDoBloco:v => Object.keys(fv).find(k => fv[k].includes(v)), sessoes });
  assert.deepEqual(r.blocos[2], ["A","B"]); assert.deepEqual(r.prox, { b:2, j:2 });
  assert.deepEqual(r.fases, [{ f:"1", n:1 }, { f:"2", n:5 }]);
});
test("blocos por semanas usam a semana de cada treino", () => {
  const sessoes = [{ letra:"A", s:1 }, { letra:"B", s:1 }, { letra:"C", s:3 }];
  const r = blocosEtapa({ porVoltas:false, blocos:4, porBloco:5, faseDoBloco:s => s<=2 ? "1" : "2", sessoes, blocoDaSessao:x => x.s, blocoAtual:3 });
  assert.deepEqual(r.blocos.map(b => b.length), [2,0,1,0]); assert.deepEqual(r.prox, { b:2, j:1 });
});
test("marco: etapa > semana perfeita > meta > metade > última volta", () => {
  const s = (n, seq=1) => ({ n, min:4, max:5, seq });
  assert.equal(marcoConclusao({ semana:s(4), feitos:30, total:30, porVolta:5 }).tipo, "etapa");
  assert.equal(marcoConclusao({ semana:s(5), feitos:12, total:30, porVolta:5 }).tipo, "perfeita");
  assert.equal(marcoConclusao({ semana:s(4, 6), feitos:15, total:30, porVolta:5 }).texto, "4 de 4–5 treinos. Sequência: 6 semanas.");
  assert.equal(marcoConclusao({ semana:s(2), feitos:15, total:30, porVolta:5 }).tipo, "metade");
  assert.equal(marcoConclusao({ semana:s(2), feitos:25, total:30, porVolta:5 }).tipo, "ultima");
  assert.equal(marcoConclusao({ semana:s(2), feitos:7, total:30, porVolta:5 }), null);
});
const cs = (k, v, g="") => ({ r:"6", g, c:[{ k, v:String(v), u:"kg" }] });
test("revisão da semana: totais, recordes, sensação e peso", () => {
  const todas = [
    { data:"2026-11-04", duracao:50, itens:[{ n:"Supino", s:3, cs:[cs("Supino",80,"pesado")] }] },
    { data:"2026-11-10", duracao:55, sen:"ponto", itens:[{ n:"Supino", s:3, cs:[cs("Supino",85,"pesado")] }] },
    { data:"2026-11-12", duracao:60, sen:"pesado", itens:[{ n:"Supino", s:2, cs:[cs("Supino",82.5,"pesado")] }] },
  ];
  const r = resumoSemana(todas, "2026-11-09", [{ semana:"2026-11-02", kg:83 }, { semana:"2026-11-09", kg:82.4 }]);
  assert.equal(r.sessoes.length, 2); assert.equal(r.minutos, 115); assert.equal(r.series, 5);
  assert.equal(r.recordes.length, 1); assert.equal(r.recordes[0].v, 85); assert.equal(r.recordes[0].antes, 80);
  assert.deepEqual([r.dist.ponto, r.dist.pesado, r.dist.total], [1, 1, 2]);
  assert.equal(r.peso.kg, 82.4); assert.ok(Math.abs(r.peso.dif + 0.6) < 1e-9);
});
test("evolução de carga: primeira e última, só em kg, maiores ganhos primeiro", () => {
  const ss = [
    { itens:[{ cs:[cs("Supino",75,"pesado"), cs("Supino",50,"leve")] }, { cs:[cs("Leg",180)] }] },
    { itens:[{ cs:[cs("Supino",85,"pesado"), cs("Supino",50,"leve")] }, { cs:[cs("Leg",220)] }, { cs:[{ r:"10", g:"", c:[{ k:"Voador", v:"9", u:"placas" }] }] }] },
  ];
  const e = evolucaoCargas(ss);
  assert.deepEqual(e.map(x => [x.k, x.g, x.de, x.ate, x.pct]), [["Leg","",180,220,22], ["Supino","pesado",75,85,13]]);
});
test("sensação ignora valores inválidos e o texto do fechamento junta tudo", () => {
  const d = distSensacao([{ sen:"facil" }, { sen:"pesado" }, { sen:"x" }, {}]);
  assert.deepEqual(d, { facil:1, ponto:0, pesado:1, total:2 });
  const t = textoFechamento({ etapa:19, feitos:30, total:30, semanas:7, porSemana:4.3, dist:d, evol:[{ k:"Leg", g:"", de:180, ate:220 }], pesadosPorLetra:{ B:1 }, peso:{ de:84.2, ate:81.9 }, recordes:14 });
  assert.match(t, /^Etapa 19 concluída: 30 de 30 treinos em 7 semanas \(4,3 por semana\)\./);
  assert.match(t, /Treinos marcados como pesados: B \(1\)\./); assert.match(t, /Leg 180 → 220 kg/); assert.match(t, /Peso: 84,2 → 81,9 kg\./);
});
