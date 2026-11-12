/* Regressão das funcionalidades por ficha (js/recursos.js): uma ficha de exemplo com todos os formatos
   que o app reconhece precisa continuar ativando os mesmos recursos. Se um teste daqui quebrar, uma
   funcionalidade já decidida deixou de funcionar para fichas futuras (ver FUNCIONALIDADES.md). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { recursosDe, recursosDaFicha } from "../js/recursos.js";
import { validarFicha } from "../js/validacao.js";

const ler = arq => JSON.parse(fs.readFileSync(new URL(arq, import.meta.url), "utf8"));
const exemplo = ler("./ficha-exemplo.json");
const item = nome => Object.values(exemplo.fases["1"]).flatMap(t=>t.itens).find(i=>i.nome===nome);

test("a ficha de exemplo é válida", () => assert.equal(validarFicha(exemplo), ""));

const ESPERADO = {
  "Aquecimento":                          { cronometro:"aquecimento", cargas:null },
  "Supino reto com barra":                { cronometro:null,          cargas:"pesado-leve" },
  "Puxada aberta":                        { cronometro:"partes",      cargas:"unica" },
  "Elevação lateral":                     { cronometro:"partes",      cargas:"unica" },
  "Cadeira abdutora":                     { cronometro:"partes",      cargas:"unica" },
  "Leg press + afundo":                   { cronometro:"partes",      cargas:"combinada" },
  "Agachamento livre":                    { cronometro:null,          cargas:"unica" },
  "Supino 30° com halteres":              { cronometro:null,          cargas:"unica" },
  "Rosca direta":                         { cronometro:null,          cargas:"unica" },
  "Leg press 45°":                        { cronometro:null,          cargas:"unica" },
  "Abdômen: elevação de pernas + prancha":{ cronometro:"segurar",     cargas:"sem" },
  "Core: prancha lateral":                { cronometro:"segurar",     cargas:"sem" },
  "Cardio":                               { cronometro:"intervalo",   cargas:null },
  "Cardio intervalado":                   { cronometro:"intervalo",   cargas:null },
  "Cardio contínuo":                      { cronometro:"continuo",    cargas:null },
  "Caminhada rápida na esteira":          { cronometro:"continuo",    cargas:null },
};
for(const [nome, esp] of Object.entries(ESPERADO)) test(`recursos: ${nome}`, () => {
  const r = recursosDe(item(nome));
  assert.equal(r.cronometro, esp.cronometro); assert.equal(r.cargas, esp.cargas);
  assert.deepEqual(r.avisos, []);
});
test("toda a ficha de exemplo sem avisos", () => assert.deepEqual(recursosDaFicha(exemplo).avisos, []));
test("a ficha publicada (etapa 19) sem avisos", () => assert.deepEqual(recursosDaFicha(ler("../fichas/etapa-19.json")).avisos, []));
test("avisa o que não vai ser reconhecido", () => {
  assert.equal(recursosDe({ nome:"Cardio", prescricao:"HIIT puxado de 10 minutos", series:0, bloco:10 }).avisos.length, 1);
  assert.match(recursosDe({ nome:"Remada", prescricao:"séries até cansar", series:3 }).avisos[0], /séries não foram lidas/);
  assert.match(recursosDe({ nome:"Bike", prescricao:"Tabata 8 tiros de 20 por 10", series:0, bloco:4 }).avisos.join(), /parece intervalado/);
});
test("prancha em minutos vira cronômetro; cadência não", () => {
  assert.equal(recursosDe({ nome:"Prancha", prescricao:"3 voltas de 1 minuto", series:3 }).cronometro, "segurar");
  const r = recursosDe({ nome:"Remada", prescricao:"3x10 (3s na descida)", series:3 });
  assert.equal(r.cronometro, null); assert.deepEqual(r.avisos, []);
});
