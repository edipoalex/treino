/* Dicas de carga na sessão (fase 4): sugestão de carga e recorde ao alcance.
   As regras ficam em js/inteligente.js (testadas); aqui só montagem e ações. Nada muda sem um toque:
   "Usar" aplica a sugestão às séries do grupo; o X dispensa até o fim do treino (fica em E.atual.sugOff). */
import { E, save } from "./estado.js";
import { cargaDe, chaveCarga, grupoDaSerie, gruposDe, partesDe, planejar, salvarCarga, valorPlanejado, variaPorSerie, cargaPorSerie } from "./cargas.js";
import { PASSO, rerender } from "./telas/sessao.js";
import { todasSessoes } from "./telas/habito.js";
import { recordeAlcance, sugestaoCarga } from "./inteligente.js";
import { maximos } from "./metricas.js";
import { icone } from "./icones.js";
import { esc, fmtNum } from "./util.js";
import { motivar } from "./balao.js";

/* Recordes de todas as etapas; recalculados só quando o número de sessões muda */
let memo = { n:-1, m:{} };
function maxs(){ const ss=todasSessoes(); if(ss.length!==memo.n) memo={ n:ss.length, m:maximos(ss) }; return memo.m; }
const idSug = (i, pi, g) => `${i}:${pi}:${g}`;
/* O grupo já começou neste treino? (a sugestão só aparece antes da 1ª série dele) */
const comecou = (it, i, g) => { const fs=(E.atual?.series||{})[i]||0; for(let j=0;j<fs;j++) if(grupoDaSerie(it,j)===g) return true; return false; };
/* Carga planejada para o grupo: a da 1ª série dele ainda não feita (por série) ou a salva do exercício */
function atualDoGrupo(it, i, pi, g){
  const a=E.atual, fs=(a?.series||{})[i]||0;
  if(cargaPorSerie(it) && variaPorSerie(it)){ for(let j=fs;j<it.series;j++) if(grupoDaSerie(it,j)===g) return valorPlanejado(it,i,j,a); }
  return cargaDe(chaveCarga(partesDe(it)[pi], g));
}
export function sugestaoDe(it, i, pi, g){
  const a=E.atual; if(!a || a.feitos?.includes(i) || comecou(it,i,g) || a.sugOff?.[idSug(i,pi,g)]) return null;
  const atual=atualDoGrupo(it,i,pi,g);
  return sugestaoCarga(todasSessoes(), { k:partesDe(it)[pi].key, g, atual, passo:PASSO[atual.u] ?? 2.5 });
}
export function sugestaoHtml(it, i, pi, g){
  const s=sugestaoDe(it,i,pi,g); if(!s) return "";
  const rot = [partesDe(it).length>1 ? partesDe(it)[pi].n : "", g && gruposDe(it).length>1 ? g : ""].filter(Boolean).join(" · ");
  return `<div class="sugestao ${s.tipo==="manter"?"manter":""}" role="status">${icone(s.tipo==="manter"?"info":"trending-up")}
    <div><b>${esc(s.titulo)}${rot?` <small class="grupo">${esc(rot)}</small>`:""}</b><small>${esc(s.motivo)}</small></div>
    ${s.tipo==="subir"?`<button class="btn primary cor" data-sug="${idSug(i,pi,g)}" aria-label="Usar ${esc(fmtNum(s.v))} ${s.u==="kg"?"kg":"placas"}">Usar</button>`:""}
    <button class="fechar" data-sug-x="${idSug(i,pi,g)}" aria-label="Dispensar a sugestão">${icone("x")}</button></div>`;
}
export function usarSugestao(it, i, pi, g){
  const s=sugestaoDe(it,i,pi,g); if(!s || s.tipo!=="subir") return;
  const a=E.atual, fs=(a.series||{})[i]||0, v=fmtNum(s.v);
  if(cargaPorSerie(it) && variaPorSerie(it)){ const j=[...Array(it.series).keys()].find(k=>k>=fs && grupoDaSerie(it,k)===g); if(j!=null) planejar(it,i,j,v,s.u); }
  else salvarCarga(chaveCarga(partesDe(it)[pi], g), v, s.u);
  (a.sugOff ??= {})[idSug(i,pi,g)] = true; save(); rerender();
  motivar("cargaSubiu", { ex:it.nome, carga:`${v} ${s.u==="kg"?"kg":"placas"}` });
}
export function dispensarSugestao(id){ const a=E.atual; if(!a) return; (a.sugOff ??= {})[id]=true; save(); rerender(); }

/* Recorde ao alcance da série j (carga planejada maior que o melhor já registrado) */
export function recordeSerie(it, i, j){
  const a=E.atual, fs=(a?.series||{})[i]||0; if(!a || j<fs || partesDe(it).length!==1) return null;
  const c=valorPlanejado(it,i,j,a); if(c.u!=="kg" && c.u!=="placas") return null;
  return recordeAlcance(maxs(), { k:partesDe(it)[0].key, g:grupoDaSerie(it,j), v:c.v, u:c.u });
}
export const recordeTxt = (r, completar=true) => r ? `<p class="rec-alcance">${icone("trophy")} ${esc(fmtNum(r.v))} ${r.u==="kg"?"kg":"placas"} passa o seu recorde (${esc(fmtNum(r.antes))}).${completar?" Complete a série para bater.":""}</p>` : "";
