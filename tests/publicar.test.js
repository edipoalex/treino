/* Publicação da ficha de outro perfil na planilha dele (scripts/publicar-ficha.mjs), com a planilha simulada. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { publicar, lerPerfil } from "../scripts/publicar-ficha.mjs";

const base = JSON.parse(fs.readFileSync(new URL("../fichas/etapa-19.json", import.meta.url), "utf8"));
const ficha = (etapa, versao) => ({ ...structuredClone(base), etapa, versao });
/* planilha falsa: guarda a ficha ativa e a Config; responde como o Apps Script */
function planilha(ativa = null){
  const st = { ativa, config:{}, chamadas:[] };
  const f = async (url, { body }) => { const { k, ops } = JSON.parse(body); st.chamadas.push(ops);
    if(k !== "segredo") return { status:200, json: async () => ({ ok:false, erro:"chave inválida" }) };
    for(const op of ops){ if(op.tipo === "setFicha") st.ativa = op.ficha; if(op.tipo === "setConfig") st.config[op.chave] = op.valor; }
    return { status:200, json: async () => ({ ok:true, estado:{ ficha:st.ativa, config:st.config }, rejeitadas:[] }) }; };
  return { st, f };
}
const sem = () => {};

test("publica a primeira ficha e marca a planilha como 'ficha = planilha'", async () => {
  const { st, f } = planilha();
  const r = await publicar({ url:"u", chave:"segredo", ficha:ficha(10), fetch:f, log:sem });
  assert.equal(r.enviada, true); assert.equal(st.ativa.etapa, 10); assert.equal(st.ativa.versao, 1); assert.equal(st.config.ficha, "planilha");
});
test("revisão da mesma etapa sobe a versão", async () => {
  const { st, f } = planilha(ficha(10, 1));
  await publicar({ url:"u", chave:"segredo", ficha:ficha(10), fetch:f, log:sem });
  assert.equal(st.ativa.versao, 2);
});
test("recusa etapa anterior à ativa, ficha inválida e chave errada, sem enviar nada", async () => {
  { const { st, f } = planilha(ficha(11, 1));
    await assert.rejects(publicar({ url:"u", chave:"segredo", ficha:ficha(10), fetch:f, log:sem }), /anterior/);
    assert.equal(st.ativa.etapa, 11); assert.equal(st.chamadas.length, 1); }
  { const { st, f } = planilha(); const ruim = ficha(10); ruim.fases = {};
    await assert.rejects(publicar({ url:"u", chave:"segredo", ficha:ruim, fetch:f, log:sem })); assert.equal(st.chamadas.length, 0); }
  { const { f } = planilha();
    await assert.rejects(publicar({ url:"u", chave:"errada", ficha:ficha(10), fetch:f, log:sem }), /chave inválida/); }
});
test("simular não envia nada", async () => {
  const { st, f } = planilha();
  const r = await publicar({ url:"u", chave:"segredo", ficha:ficha(10), simular:true, fetch:f, log:sem });
  assert.equal(r.enviada, false); assert.equal(st.ativa, null); assert.equal(st.chamadas.length, 1);   // só a leitura
});
test("perfis ficam num arquivo fora do repositório, com url do Apps Script", () => {
  const arq = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "perfis-")), "perfis.json");
  fs.writeFileSync(arq, JSON.stringify({ thay:{ url:"https://script.google.com/macros/s/AKfy-abc_1/exec", chave:"x" }, ruim:{ url:"http://exemplo.com", chave:"x" } }));
  assert.equal(lerPerfil("thay", arq).chave, "x");
  assert.throws(() => lerPerfil("ruim", arq), /Apps Script/);
  assert.throws(() => lerPerfil("outro", arq), /sem "url"/);
});
