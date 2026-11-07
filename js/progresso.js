import { E, FICHA, LETRAS, S } from "./estado.js";
import { enfileirar } from "./sync.js";

/* ---------- Datas ---------- */
export const DIA = 864e5;
export const hojeISO = () => { const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); };
export const parseISO = s => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); };
export const fmtData = s => parseISO(s).toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short"}).replace(".","");
export function relDia(s){
  const diff = Math.round((parseISO(hojeISO()) - parseISO(s))/DIA);
  if(diff===0) return "hoje"; if(diff===1) return "ontem"; return `há ${diff} dias`;
}
export function semanaAtual(){
  if(!E.inicio) return 1;
  const d = Math.floor((parseISO(hojeISO()) - parseISO(E.inicio))/DIA);
  return Math.max(1, Math.floor(d/7)+1);
}
/* Progressão: por voltas (A a E) quando a ficha define; senão, por semanas */
export const PROG = () => FICHA.progressao || null;
export const porVoltas = () => !!PROG();
export const treinosPorVolta = () => PROG()?.treinos_por_volta || LETRAS.length;
export const totalTreinos = () => porVoltas() ? PROG().voltas*treinosPorVolta() : FICHA.semanas*freqAlvo().max;
export const feitosEtapa = () => E.historico.length;
export function voltaAtual(n=feitosEtapa()){ // volta do próximo treino
  if(!porVoltas()) return Math.min(semanaAtual(), FICHA.semanas);
  return Math.min(Math.floor(n/treinosPorVolta())+1, PROG().voltas);
}
export function faseAtual(){
  if(E.faseModo==="1"||E.faseModo==="2") return E.faseModo;
  if(porVoltas()){ const v=voltaAtual(); const f=Object.keys(PROG().fases_voltas).find(k=>PROG().fases_voltas[k].includes(v)); return f || Object.keys(FICHA.fases).pop(); }
  return FICHA.fases_semanas["1"].includes(Math.min(semanaAtual(),FICHA.semanas)) ? "1" : "2";
}
export const voltasDo = it => it.voltas || it.semanas;
export const daSemana = (it, v) => { const a=voltasDo(it); return !a || !a.length || a.includes(v); };
export function treino(letra, fase=faseAtual(), v=voltaAtual(), modo="completo"){
  const t=FICHA.fases[fase]?.[letra]; if(!t) return t;
  const base = modo==="express" && t.express ? t.express : t.itens;
  return v==null ? {...t, itens: base} : {...t, itens: base.filter(it=>daSemana(it, v))};
}
export const temExpress = letra => !!FICHA.fases[faseAtual()]?.[letra]?.express;
export const modoPadrao = () => (FICHA.express_dias || [1,2]).includes(new Date().getDay()) && temExpress(LETRAS[0]) ? "express" : "completo"; // padrão: seg e ter
export const UNID = { kg:"kg", placas:"placas", livre:"livre" };
export const unidPadrao = nome => (S.unidades && S.unidades[nome]) || "kg";
export const semTxt = arr => { const u = porVoltas() ? (arr.length>1?"voltas":"volta") : "sem."; return arr.length>1 ? `${u} ${arr.slice(0,-1).join(", ")} e ${arr[arr.length-1]}` : `${u} ${arr[0]}`; };
export const minutos = it => it.series*(it.exec+it.descanso)/60 + it.bloco;
export const totalMin = t => t.itens.reduce((a,it)=>a+minutos(it),0);
/* ---------- Frequência e peso ---------- */
export function freqAlvo(){
  const n = String(FICHA.frequencia||"").match(/\d+/g);
  return n ? { min:+n[0], max:+n[n.length-1] } : { min:LETRAS.length, max:LETRAS.length };
}
export const isoDe = d => new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
export function segundaDe(iso){ const d=parseISO(iso); d.setDate(d.getDate()-((d.getDay()+6)%7)); return isoDe(d); }
export function semanaDaEtapa(iso){ return E.inicio ? Math.max(1, Math.floor((parseISO(iso)-parseISO(E.inicio))/DIA/7)+1) : null; }
export function pesoSemanal(){
  const g={};
  for(const p of S.peso){ (g[segundaDe(p.d)] ??= []).push(p.kg); }
  return Object.keys(g).sort().map(k=>({ semana:k, kg: g[k].reduce((a,b)=>a+b,0)/g[k].length }));
}
export const fmtKg = v => v.toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1});
export function parseKg(v){ const n=parseFloat(String(v).trim().replace(",",".")); return n>=30 && n<=300 ? Math.round(n*10)/10 : null; }
export function addPeso(iso, kg){ S.peso = S.peso.filter(p=>p.d!==iso); S.peso.push({d:iso, kg}); S.peso.sort((a,b)=>a.d<b.d?-1:1); enfileirar({tipo:"setPeso", data:iso, kg}); }
/* ---------- Sequência ---------- */
export function ultimo(){ return E.historico[E.historico.length-1] || null; }
export function proxima(){
  const u = ultimo(); if(!u) return LETRAS[0];
  return LETRAS[(LETRAS.indexOf(u.letra)+1) % LETRAS.length];
}
export function feitoHoje(){ const u=ultimo(); return u && u.data===hojeISO() ? u : null; }
