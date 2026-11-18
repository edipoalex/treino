#!/usr/bin/env node
/* Publica a ficha de outro perfil direto na planilha dele, sem passar pelo repositório (v1.49).
   Uso: node scripts/publicar-ficha.mjs --perfil thay caminho/etapa-10.json [--simular]

   O endereço e a chave de cada planilha ficam fora do repositório, em ~/.config/treino/perfis.json:
     { "thay": { "url": "https://script.google.com/macros/s/…/exec", "chave": "…" } }
   (TREINO_PERFIS=/outro/caminho.json troca o arquivo.)

   1. Valida a ficha com as mesmas regras do app e da planilha (com erro, não envia nada).
   2. Lê a ficha ativa da planilha: revisão da mesma etapa sobe a "versao"; etapa anterior à atual é recusada.
   3. Envia à planilha: Config "ficha" = "planilha" (o app daquele perfil passa a usar só a ficha da planilha e
      nunca recebe a ficha do app) e a ficha, ativa. A planilha registra a ficha no catálogo (Etapas,
      Historico_Exercicios) como faz com as fichas publicadas pelo app.
   A sua própria ficha continua sendo publicada com scripts/aplicar-ficha.mjs. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checarFicha } from "./validar.mjs";
import { recursosDaFicha } from "../js/recursos.js";
import { cmpFicha } from "../js/validacao.js";

export const arquivoPerfis = () => process.env.TREINO_PERFIS || path.join(os.homedir(), ".config", "treino", "perfis.json");
export function lerPerfil(nome, arq = arquivoPerfis()){
  let todos;
  try{ todos = JSON.parse(fs.readFileSync(arq, "utf8")); }
  catch(e){ throw new Error(`não consegui ler ${arq} (${e.code === "ENOENT" ? "arquivo não existe" : e.message}). Crie com { "${nome}": { "url": "…", "chave": "…" } }`); }
  const p = todos?.[nome];
  if(!p?.url || !p?.chave) throw new Error(`perfil "${nome}" sem "url" e "chave" em ${arq}`);
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(p.url)) throw new Error(`perfil "${nome}": a url precisa ser a do Apps Script (https://script.google.com/macros/s/…/exec)`);
  return p;
}
async function chamar(url, chave, ops, f = fetch){
  const res = await f(url, { method:"POST", body:JSON.stringify({ k:chave, ops }), redirect:"follow" });
  let j; try{ j = await res.json(); }catch(e){ throw new Error(`resposta inválida da planilha (HTTP ${res.status})`); }
  if(!j.ok) throw new Error(`a planilha recusou: ${j.erro || "erro desconhecido"}`);
  return j;
}
/* Núcleo (testável): devolve o que foi feito; com simular, não envia nada */
export async function publicar({ url, chave, ficha, simular = false, fetch: f = fetch, log = console.log }){
  const erros = [], avisos = [];
  checarFicha(ficha, erros, avisos);
  { const { cont } = recursosDaFicha(ficha), lista = o => Object.entries(o).map(([k,v])=>`${k} ${v}`).join(", ") || "nenhum";
    log(`Recursos · cronômetro: ${lista(cont.cronometro)} · carga: ${lista(cont.cargas)}`); }
  for(const a of avisos) log(`! ${a}`);
  if(erros.length) throw new Error(erros.join("\n"));

  const atual = (await chamar(url, chave, [], f)).estado?.ficha || null;
  if(atual && ficha.etapa < atual.etapa) throw new Error(`a ficha é da etapa ${ficha.etapa}, anterior à ativa na planilha (${atual.etapa})`);
  if(atual && ficha.etapa === atual.etapa){
    const v = (atual.versao || 0) + 1;
    if((ficha.versao || 0) < v){ log(`! mesma etapa ${ficha.etapa}: versao ajustada de ${ficha.versao || 0} para ${v}`); ficha.versao = v; }
  } else if(!ficha.versao) ficha.versao = 1;
  if(atual && cmpFicha(ficha, atual) <= 0) throw new Error(`a planilha já tem a etapa ${atual.etapa} rev. ${atual.versao || 0}`);

  const ops = [{ tipo:"setConfig", chave:"ficha", valor:"planilha" }, { tipo:"setFicha", ficha, ativar:true }];
  if(simular){ log(`Simulação: enviaria a etapa ${ficha.etapa} (rev. ${ficha.versao}) e Config ficha = planilha. Nada foi enviado.`); return { enviada:false, ficha }; }
  const r = await chamar(url, chave, ops, f);
  if(r.rejeitadas?.length) throw new Error(`a planilha recusou: ${r.rejeitadas.map(x=>`${x.tipo}: ${x.erro}`).join("; ")}`);
  const ativa = r.estado?.ficha;
  if(!ativa || ativa.etapa !== ficha.etapa || (ativa.versao || 0) !== ficha.versao) throw new Error("a planilha respondeu, mas a ficha ativa não é a enviada");
  log(`Ficha etapa ${ficha.etapa} (rev. ${ficha.versao}) publicada na planilha. O app daquele perfil carrega na próxima sincronização.`);
  return { enviada:true, ficha };
}

async function principal(){
  const args = process.argv.slice(2), i = args.indexOf("--perfil"), nome = i >= 0 ? args[i+1] : "";
  const arq = args.find((a, k) => !a.startsWith("--") && args[k-1] !== "--perfil");
  if(!nome || !arq){ console.error("Uso: node scripts/publicar-ficha.mjs --perfil NOME ficha.json [--simular]"); process.exit(1); }
  let ficha;
  try{ ficha = JSON.parse(fs.readFileSync(path.resolve(arq), "utf8")); }
  catch(e){ console.error(`✗ ${arq}: JSON inválido (${e.message})`); process.exit(1); }
  try{ const p = lerPerfil(nome); await publicar({ url:p.url, chave:p.chave, ficha, simular:args.includes("--simular") }); }
  catch(e){ for(const l of String(e.message).split("\n")) console.error(`✗ ${l}`); console.error("\nNada foi publicado."); process.exit(1); }
}
if(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
