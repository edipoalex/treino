import { E, FICHA, LETRAS, S, save } from "../estado.js";
import { render } from "../navegacao.js";
import { DIA, PROG, addPeso, faseAtual, feitoHoje, feitosEtapa, fmtKg, freqAlvo, hojeISO, modoPadrao, parseISO, parseKg, pesoSemanal, porVoltas, proxima, relDia, segundaDe, semanaAtual, temExpress, totalMin, totalTreinos, treino, treinosPorVolta, ultimo, voltaAtual } from "../progresso.js";
import { rerender, viewSessao } from "./sessao.js";
import { plate, toast } from "../ui.js";
import { icone } from "../icones.js";
import { movimentoOk } from "../movimento.js";
import { limparCronometros } from "../execucao.js";
import { $, esc } from "../util.js";
import { cartaoRevisao, etapaEncerrada, ligarFechamento, ligarRevisao, painelEtapa, painelSemana, viewFechamento } from "./habito.js";

/* ---------- Views ---------- */
let escolha = null;
export function viewHoje(){
  if(E.atual) return viewSessao();
  const encerrada = etapaEncerrada();
  // fim da etapa: a Hoje vira o fechamento até a pessoa escolher continuar treinando
  if(encerrada && !E.fechoDispensado){ $("#view").innerHTML = viewFechamento(); ligarFechamento(); return; }
  const feito = feitoHoje();
  const letra = escolha || proxima();
  const t = treino(letra);
  let aviso="";
  if(porVoltas()){
    const n=feitosEtapa(), tot=totalTreinos(), lim=PROG().limite_semanas, sem=semanaAtual();
    if(n>=tot) aviso=`Etapa ${FICHA.etapa} concluída: ${tot} treinos feitos. Hora de planejar a próxima ficha.`;
    else if(E.inicio && sem>lim) aviso=`A etapa ${FICHA.etapa} passou de ${lim} semanas (${n} de ${tot} treinos). Hora de planejar a próxima ficha.`;
    else if(tot-n<=treinosPorVolta()) aviso=`Falta${tot-n>1?"m":""} ${tot-n} treino${tot-n>1?"s":""} para fechar a etapa. Já dá para planejar a próxima.`;
  } else if(semanaAtual() > FICHA.semanas) aviso=`As ${FICHA.semanas} semanas da etapa ${FICHA.etapa} terminaram. Hora de planejar a próxima ficha.`;
  const tEx = temExpress(letra) ? treino(letra, faseAtual(), voltaAtual(), "express") : null;
  const titulo = feito && !escolha ? "Próximo treino" : (escolha && escolha!==proxima() ? "Treino escolhido" : "Treino de hoje");
  const seq = proxima();
  const qtd = `${t.itens.length} ${t.itens.length>1?"exercícios":"exercício"}`;
  const n=feitosEtapa(), progresso = porVoltas() ? `${Math.min(n+1, totalTreinos())} de ${totalTreinos()}` : `semana ${Math.min(semanaAtual(), FICHA.semanas)} de ${FICHA.semanas}`;
  /* Card do treino em estúdio: texto à esquerda (nunca por baixo da anilha), anilha 3D em pé no chão à direita, ação dentro do card */
  $("#view").innerHTML = `
  <section class="hero2 estudio L-${esc(letra)}" id="cardHoje" aria-label="Treino ${esc(letra)}">
    <div class="h2-anilha" aria-hidden="true"><span class="h2-sombra projetada"></span><span class="h2-sombra contato"></span>${plate(letra,"d3")}</div>
    <div class="h2-txt"><p class="eyebrow">${titulo} · ${progresso}</p><h2>Treino ${esc(letra)}</h2><p class="foco">${esc(t.foco)}</p></div>
    <div class="h2-meta"><span>${icone("clock")} ${Math.round(totalMin(t))} min</span>${tEx?`<span>${icone("zap")} Express ${Math.round(totalMin(tEx))} min</span>`:""}
      <button id="verPrevia" aria-expanded="${!!verPrevia}" aria-controls="previaHoje">${icone("list")} ${qtd} ${icone("chevron-right")}</button></div>
    ${verPrevia?`<ul class="previa2" id="previaHoje">${t.itens.map(it=>`<li><span>${esc(it.nome)}</span><span>${it.series?`${it.series} ${it.series>1?"séries":"série"}`:`${it.bloco} min`}</span></li>`).join("")}</ul>`:""}
    <button class="btn primary cor grande block L-${esc(letra)}" id="startBtn">${icone("play")} Iniciar treino</button>
  </section>
  ${feito ? `<p class="done-today">Treino ${esc(feito.letra)} concluído hoje. Este é o próximo da sequência.</p>` : ""}
  ${aviso ? `<p class="tx-alerta done-today">${aviso}${encerrada?` <button class="btn-link" id="verFecho">Ver o fechamento</button>`:""}</p>` : ""}
  <div class="trocar"><p class="rot">Trocar treino <span class="leg"><i></i>próximo</span></p>
    <div class="fila" role="group" aria-label="Escolher outro treino" style="--n:${LETRAS.length}">${LETRAS.map(l=>`<button class="L-${esc(l)}" aria-pressed="${l===letra}" aria-label="Treino ${esc(l)}${l===seq?", próximo da sequência":""}" data-pick="${esc(l)}">${plate(l,"sm")}${esc(l)}${l===seq?`<span class="prox"></span>`:""}</button>`).join("")}</div></div>
  ${cartaoRevisao().replace('class="revisao ','class="revisao compacta ')}
  ${painelSemana()}
  ${painelEtapa()}
  ${pesoPanel()}`;
  bindPeso(); ligarRevisao($("#view"));
  $("#verFecho") && ($("#verFecho").onclick = () => { E.fechoDispensado=false; save(); render(); scrollTo(0,0); });
  $("#startBtn").onclick = () => iniciar(letra);
  $("#verPrevia").onclick = () => { verPrevia=!verPrevia; const y=scrollY; render(); scrollTo(0,y); };
  document.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>{
    const nova = b.dataset.pick===seq ? null : b.dataset.pick; if((nova||seq)===letra) return;
    escolha = nova; verPrevia = false; const y=scrollY; render(); scrollTo(0,y);
    if(movimentoOk()) $("#cardHoje .h2-anilha .plate")?.animate([{transform:"translateX(30%) scale(.85)", opacity:0},{transform:"none", opacity:1}],{duration:500, easing:"cubic-bezier(.22,1,.36,1)"});
  });
}
export let verPrevia=false;
export function pesoPanel(){
  const seg = segundaDe(hojeISO());
  const sem = pesoSemanal(); const atual = sem.find(x=>x.semana===seg); const ant = sem.filter(x=>x.semana<seg).pop();
  const meta = parseKg(S.meta.kg);
  if(!atual || pesoEditando){
    return `<section class="panel" aria-label="Peso da semana"><h3>Peso da semana</h3>
      <div class="row"><div class="kgfield"><input id="pesoHoje" inputmode="decimal" placeholder="${ant?fmtKg(ant.kg):"Ex.: 84,0"}" aria-label="Peso em kg"><span>kg</span></div>
      <button class="alt-m btn primary" id="pesoSalvar">Salvar</button></div>
      <p class="mt-2 tx-sec meta">De manhã, em jejum, depois de ir ao banheiro.</p></section>`;
  }
  const d = ant ? atual.kg-ant.kg : null;
  const ult = sem.slice(-4);
  let spark="";
  if(ult.length>1){
    const vs=ult.map(x=>x.kg), lo=Math.min(...vs)-.2, hi=Math.max(...vs)+.2;
    const pts=ult.map((x,i)=>[12+i*(216/(ult.length-1)), 8+(hi-x.kg)/(hi-lo)*40]);
    spark=`<svg class="spark" viewBox="0 0 240 56" role="img" aria-label="Peso nas últimas ${ult.length} semanas"><polyline points="${pts.map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${pts.map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="var(--ink)"/>`).join("")}</svg>`;
  }
  return `<section class="panel" aria-label="Peso da semana"><h3>Peso da semana${meta?`<span class="sub2">meta ${fmtKg(meta)} kg</span>`:""}</h3>
    <div class="linha-ic itens-fim">
      <div><div class="big"><b>${fmtKg(atual.kg)} kg</b></div>
      ${d!==null?`<div class="delta mt-1 ${d<=0?"down":"up"}">${d>0?"+":""}${fmtKg(d)} kg na semana</div>`:""}
      ${meta?`<p class="mt-1 meta">${atual.kg>meta?`faltam ${fmtKg(atual.kg-meta)} kg`:"meta atingida"}</p>`:""}</div>
      ${spark}</div>
    <button class="mt-3 alt-m btn block" id="pesoEditar">Registrar peso</button></section>`;
}
export let pesoEditando=false;
export function bindPeso(){
  const inp=$("#pesoHoje"), bt=$("#pesoSalvar"), ed=$("#pesoEditar");
  if(ed) ed.onclick=()=>{ pesoEditando=true; render(); $("#pesoHoje")?.focus(); };
  if(bt) bt.onclick=()=>{
    const kg=parseKg(inp.value); if(!kg){ toast("Informe um peso válido, ex.: 83,4"); inp.focus(); return; }
    addPeso(hojeISO(), kg); pesoEditando=false; toast(`Peso registrado: ${fmtKg(kg)} kg`); render();
  };
  if(inp) inp.onkeydown=e=>{ if(e.key==="Enter") bt.click(); };
}
export function iniciar(letra){
  limparCronometros();
  E.atual = { letra, fase: faseAtual(), semana: Math.min(semanaAtual(), FICHA.semanas), volta: voltaAtual(), modo: temExpress(letra) ? modoPadrao() : "completo", inicio: Date.now(), feitos: [], marcas: {}, series: {}, ativo: 0 };
  escolha = null; verPrevia=false; save(); render(); scrollTo(0,0);
}
