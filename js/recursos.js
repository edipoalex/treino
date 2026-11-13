/* Recursos que cada item da ficha ativa no app, lidos dos campos e do texto da prescrição.
   É a fonte única dessas regras: o app (cargas.js, execucao.js) e as ferramentas (validar.mjs,
   aplicar-ficha.mjs, testes) usam as mesmas funções. Assim, uma ficha nova ganha as mesmas
   funcionalidades sem mexer no código, e o validador avisa quando algo não vai ser reconhecido.
   Módulo puro (sem DOM). O registro das funcionalidades e dos formatos fica em FUNCIONALIDADES.md. */
import { seriesDe, tempoDe } from "./series.js";

/* Carga: exercícios com séries têm campo de carga, exceto "carga": false ou nomes de core/abdômen */
export const temCarga = it => it.series>0 && (it.carga ?? !/abdômen|core/i.test(it.nome));
/* Contraste: séries "pesado" e "leve" têm cargas separadas */
export const contraste = it => { const tags=new Set(seriesDe(it).map(s=>s.tag)); return tags.has("pesado") && tags.has("leve"); };

const TEMPO = /\d+\s*(s|seg|segundos?|min|minutos?)(?![a-zà-ú])/i;
/* Tira do texto o tempo que é só descanso ("30 s de descanso", "(descanso de 45 s …)") */
const semDescanso = p => p.replace(/\d+\s*s\w*\s+(na|no|de)\s+(descida|subida|exc[êe]ntric\w*|conc[êe]ntric\w*|pausa|cad[êe]ncia|topo)/gi, "").replace(/\([^()]*(descanso|pausa|intervalo)[^()]*\)/gi, "")
  .replace(/(descanso|pausa|intervalo)(\s+de)?\s*\d+\s*(s|seg|min)\w*/gi, "")
  .replace(/\d+\s*(s|seg|min)\w*\s*(de\s+)?(descanso|pausa|intervalo)/gi, "");

export function recursosDe(it){
  const r = { cronometro:null, series:null, cargas:null, avisos:[] };
  const p = String(it?.prescricao ?? ""), t = tempoDe(it);
  r.cronometro = t?.tipo ?? null;
  if(it?.series > 0){
    const ser = seriesDe(it);
    r.series = Array.isArray(it.series_detalhe) ? "detalhe" : ser.every(s=>s.r==="série") ? "genericas" : "lidas";
    if(r.series==="genericas") r.avisos.push("as séries não foram lidas da prescrição (o app mostra só \"série 1, 2…\"); use series_detalhe");
    r.cargas = !temCarga(it) ? "sem" : String(it.nome).includes(" + ") ? "combinada" : contraste(it) ? "pesado-leve" : "unica";
  } else if(/cardio|hiit|intervalad|zona\s*2/i.test(p+" "+(it?.nome??"")) && !t){
    r.avisos.push("cardio sem cronômetro por fases: escreva como \"3x (4 min forte / 3 min leve)\" ou \"Zona 2 contínuo\"");
  }
  if(/hiit|intervalad|tabata|tiros?\b/i.test(p) && t && t.tipo!=="intervalo" && !/zona\s*2/i.test(p))
    r.avisos.push("parece intervalado, mas não foi lido como fases: escreva como \"6x (30s forte / 30s leve)\"");
  if(!t && TEMPO.test(semDescanso(p)) && !(it?.series > 0 && /^\s*\d+\s*x/i.test(p) && !/\d+\s*s(?![a-zà-ú])/i.test(semDescanso(p))))
    r.avisos.push("a prescrição cita um tempo, mas não terá cronômetro; veja os formatos em FUNCIONALIDADES.md");
  return r;
}

/* Resumo dos recursos de uma ficha (itens distintos por nome e prescrição) */
export function recursosDaFicha(f){
  const itens = new Map();
  for(const [fase, ts] of Object.entries(f.fases)) for(const [letra, t] of Object.entries(ts))
    for(const it of t.itens.concat(t.express||[])){ const k=`${it.nome}|${it.prescricao}`; if(!itens.has(k)) itens.set(k, { it, onde:`${letra}, fase ${fase}` }); }
  const cont = { cronometro:{}, cargas:{} }, avisos = [];
  for(const { it, onde } of itens.values()){
    const r = recursosDe(it);
    if(r.cronometro) cont.cronometro[r.cronometro] = (cont.cronometro[r.cronometro]||0)+1;
    if(r.cargas) cont.cargas[r.cargas] = (cont.cargas[r.cargas]||0)+1;
    for(const a of r.avisos) avisos.push(`${it.nome} (treino ${onde}): ${a}`);
  }
  return { cont, avisos };
}

/* ---------- Sessão de treino (v1.42): etiqueta do método e orientações ----------
   metodoDe: nome curto da técnica, para a etiqueta acima do nome do exercício ("Contraste", "Rest-pause", "Bi-set",
   "Drop duplo", "Pirâmide", "HIIT", "Zona 2"…). Lido do começo da prescrição ou dos recursos; "" quando não há. */
const capt = s => s.charAt(0).toUpperCase() + s.slice(1);
export function metodoDe(it){
  const p = String(it?.prescricao ?? "").trim(), nome = String(it?.nome ?? ""), t = tempoDe(it);
  if(t?.tipo==="intervalo") return t.rotulo;
  if(t?.tipo==="continuo") return t.zona2 ? "Zona 2" : "Contínuo";
  if(t?.tipo==="aquecimento") return "";
  const m = p.match(/^([A-Za-zÀ-ú][A-Za-zÀ-ú -]{1,18}?)\s*(?::|\(|\d)/);
  if(m && !/^(de|na|no|em|até)\b/i.test(m[1])) return capt(m[1].trim());
  if(/\bdrop\b/i.test(p)) return "Drop";
  const partes = nome.split(" + ").length;
  if(it?.series>0 && partes>=4) return "Circuito";
  if(it?.series>0 && partes===3) return "Tri-set";
  if(/bi-?set/i.test(nome) || (it?.series>0 && partes===2)) return "Bi-set";
  if(t?.tipo==="segurar") return "Isometria";
  if(/até (o |a )?(próximo da )?falha/i.test(p)) return "Até a falha";
  return "";
}
/* separarNotas: a frase de orientação que se repete em vários itens do treino ("Volta de calibração: …") vale para o
   treino todo; sai de cada item e aparece uma vez só. Recebe os textos de "obs" dos itens, devolve
   { comum, rotulo, proprias } (proprias[i] = o que sobra da obs do item i). */
const frases = s => String(s||"").split(/(?<=[.;!?])\s+/).map(x=>x.replace(/[.;]\s*$/,"").trim()).filter(Boolean);
export function separarNotas(obs){
  const fs = obs.map(frases), cont = new Map();
  for(const lista of fs) for(const f of new Set(lista)) cont.set(f, (cont.get(f)||0)+1);
  const comItens = fs.filter(l=>l.length).length;
  const comuns = [...cont].filter(([, n]) => n>=3 || (n>=2 && n===comItens)).map(([f])=>f);
  const comum = comuns.join(". ");
  const r = comum.match(/^([^:]{3,26}):/);
  return { comum, rotulo: comum ? (r ? r[1].trim() : "Dica do treino") : "", proprias: fs.map(l => l.filter(f=>!comuns.includes(f)).join(". ")) };
}
