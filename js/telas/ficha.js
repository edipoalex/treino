import { E, FICHA, LETRAS } from "../estado.js";
import { nav, render } from "../navegacao.js";
import { PROG, faseAtual, minutos, porVoltas, proxima, semTxt, totalMin, treino, voltasDo } from "../progresso.js";
import { fmtMin, plate } from "../ui.js";
import { $, esc } from "../util.js";

export let fichaModo="completo";
export function viewFicha(){
  nav.fichaFase ??= faseAtual(); nav.fichaLetra ??= (E.atual?.letra || proxima());
  if(!FICHA.fases[nav.fichaFase][nav.fichaLetra].express) fichaModo="completo";
  const t0 = treino(nav.fichaLetra, nav.fichaFase, null, fichaModo); const t = {...t0, itens: t0.itens.filter(it=>!voltasDo(it) || voltasDo(it).length)};
  const sem = porVoltas() ? PROG().fases_voltas : FICHA.fases_semanas;
  const un = porVoltas() ? ["volta","voltas"] : ["sem.","sem."];
  $("#view").innerHTML = `
  <h1 class="page">Ficha completa</h1>
  <p class="sub">Sequência ${LETRAS.join(", ")}. Treino corrido, sem ligação com o dia da semana.</p>
  <div class="seg" role="group" aria-label="Fase">
    ${Object.keys(FICHA.fases).map(f=>`<button data-fase="${f}" aria-pressed="${f===nav.fichaFase}">Fase ${f} (${sem[f].length>1?`${un[1]} ${sem[f][0]}–${sem[f][sem[f].length-1]}`:`${un[0]} ${sem[f][0]}`})</button>`).join("")}
  </div>
  ${FICHA.fases[nav.fichaFase][nav.fichaLetra].express?`<div class="seg" role="group" aria-label="Versão" style="margin-top:10px">${["completo","express"].map(m=>`<button data-fmodo="${m}" aria-pressed="${fichaModo===m}">${m==="completo"?"Completo":"Express"}</button>`).join("")}</div>`:""}
  <div class="letters" role="group" aria-label="Treino">${LETRAS.map(l=>`<button data-l="${l}" aria-pressed="${l===nav.fichaLetra}" aria-label="Treino ${l}">${plate(l,"sm")}</button>`).join("")}</div>
  <p class="meta" style="margin-top:8px"><strong style="color:var(--ink)">Treino ${nav.fichaLetra}:</strong> ${esc(t.foco)}</p>
  <div class="table">
    ${t.itens.map(it=>`<div class="trow"><span class="t">${esc(it.nome)}${voltasDo(it)&&voltasDo(it).length?` <span class="chip" style="margin-left:4px">${semTxt(voltasDo(it))}</span>`:""}</span><span class="min">${fmtMin(minutos(it))}</span>
      <span class="m">${esc(it.prescricao)}${it.series?`. Descanso ${it.descanso}s`:""}${it.obs?`. ${esc(it.obs)}`:""}</span></div>`).join("")}
    <div class="total"><span>Tempo estimado da sessão</span><span class="min">${fmtMin(totalMin(t))}</span></div>
  </div>`;
  document.querySelectorAll("[data-fase]").forEach(b=>b.onclick=()=>{nav.fichaFase=b.dataset.fase;render();});
  document.querySelectorAll("[data-fmodo]").forEach(b=>b.onclick=()=>{fichaModo=b.dataset.fmodo;render();});
  document.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{nav.fichaLetra=b.dataset.l;render();});
}
