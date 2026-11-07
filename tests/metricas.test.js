/* Volume e recordes (js/metricas.js). */
import test from "node:test";
import assert from "node:assert/strict";
import { volumeSessao, maximos, recordesDaSessao, resumoCargas, fmtVolume } from "../js/metricas.js";

const serie = (r, g, ...c) => ({ r, g, c: c.map(([k, v, u="kg"]) => ({ k, v, u })) });
const sessao = (data, itens) => ({ data, itens });
const puxada = (p, l) => ({ n:"Puxada", cs:[serie("6","pesado",["Puxada",p]), serie("20","leve",["Puxada",l]), serie("6","pesado",["Puxada",p])] });

test("volume soma carga × repetições só em kg", () => {
  const x = sessao("2026-11-08", [puxada("80","50"), { n:"Voador", cs:[serie("12","",["Voador","9","placas"])] }, { n:"Livre", cs:[serie("10","",["Livre","10/20","livre"])] }]);
  assert.equal(volumeSessao(x), 80*6 + 50*20 + 80*6);
});
test("combinado usa as repetições de cada parte", () => {
  const x = sessao("d", [{ n:"A + B", cs:[serie("10 + 12","",["A + B › A","20"],["A + B › B","10"])] }]);
  assert.equal(volumeSessao(x), 20*10 + 10*12);
});
test("repetição não numérica não entra no volume", () => {
  assert.equal(volumeSessao(sessao("d", [{ n:"X", cs:[serie("até a falha","",["X","50"])] }])), 0);
});
test("máximos separam grupo e unidade", () => {
  const m = maximos([sessao("2026-11-01", [puxada("75","50")]), sessao("2026-11-05", [puxada("80","45")])]);
  assert.equal(m["Puxada · pesado|kg"].v, 80); assert.equal(m["Puxada · pesado|kg"].data, "2026-11-05");
  assert.equal(m["Puxada · leve|kg"].v, 50);
});
test("recorde só quando supera uma carga anterior", () => {
  const antes = [sessao("2026-11-01", [puxada("75","50")])];
  const r = recordesDaSessao(sessao("2026-11-08", [puxada("80","50")]), antes);
  assert.deepEqual(r.map(x => [x.k, x.g, x.v, x.antes]), [["Puxada","pesado",80,75]]);
  assert.equal(recordesDaSessao(sessao("2026-11-08", [puxada("80","50")]), []).length, 0);
});
test("resumo legível das cargas", () => {
  assert.equal(resumoCargas(puxada("82,5","50")), "82,5×6 · 50×20 · 82,5×6");
  assert.equal(fmtVolume(8400), "8,4 t"); assert.equal(fmtVolume(950), "950 kg");
});
