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
  $("#view").innerHTML = `${cartaoRevisao()}
  <section class="hoje-card marcado L-${esc(letra)}" id="cardHoje" role="button" tabindex="0" aria-expanded="${!!verPrevia}"
    aria-label="Treino ${esc(letra)}: toque para ${verPrevia?"voltar":"ver os exercícios"}">
    <div class="marca" aria-hidden="true">${plate(letra,"md semtexto")}</div>
    <div class="face frente" ${verPrevia?"hidden":""}>
      <div class="flex1"><p class="meta">${titulo}</p><h2>Treino ${esc(letra)}</h2>
      <p class="meta">${esc(t.foco)} · ~${Math.round(totalMin(t))} min${tEx?` · express ~${Math.round(totalMin(tEx))} min`:""}</p>
      <span class="virar">${icone("list")} ${qtd}</span></div>
    </div>
    <div class="face verso" ${verPrevia?"":"hidden"}>
      <div class="verso-cab"><b>Treino ${esc(letra)}</b><span class="meta">${qtd}</span></div>
      <ul class="previa">${t.itens.map(it=>`<li><span>${esc(it.nome)}</span><span>${it.series?`${it.series} ${it.series>1?"séries":"série"}`:`${it.bloco} min`}</span></li>`).join("")}</ul>
      <span class="virar">${icone("rotate-ccw")} Voltar</span>
    </div>
  </section>
  ${feito ? `<p class="done-today">Treino ${esc(feito.letra)} concluído hoje. Este é o próximo da sequência.</p>` : ""}
  ${aviso ? `<p class="tx-alerta done-today">${aviso}${encerrada?` <button class="btn-link" id="verFecho">Ver o fechamento</button>`:""}</p>` : ""}
  <div class="escolher" role="group" aria-label="Escolher outro treino">${LETRAS.map(l=>`<button aria-pressed="${l===letra}" aria-label="Treino ${esc(l)}${l===seq?", próximo da sequência":""}" data-pick="${esc(l)}">${plate(l,"sm")}<span>${l===seq?"próximo":"&nbsp;"}</span></button>`).join("")}</div>
  <div class="mt-3 stack">
    <button class="btn primary cor grande block L-${esc(letra)}" id="startBtn">${icone("play")} Iniciar treino</button>
  </div>
  ${painelSemana()}
  ${painelEtapa()}
  ${pesoPanel()}`;
  bindPeso(); ligarRevisao($("#view"));
  $("#verFecho") && ($("#verFecho").onclick = () => { E.fechoDispensado=false; save(); render(); scrollTo(0,0); });
  $("#startBtn").onclick = () => iniciar(letra);
  const card=$("#cardHoje");
  card.onclick = () => virarCard(card);
  card.onkeydown = e => { if(e.key==="Enter" || e.key===" "){ e.preventDefault(); virarCard(card); } };
  document.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>{
    const nova = b.dataset.pick===seq ? null : b.dataset.pick; if((nova||seq)===letra) return;
    escolha = nova; verPrevia = false; render();
    if(movimentoOk()) $("#cardHoje .plate")?.animate([{transform:"perspective(500px) rotateY(-80deg) scale(.8)", opacity:0},{transform:"none", opacity:1}],{duration:550, easing:"cubic-bezier(.22,1,.36,1)"});
  });
}
/* Vira o card: frente (treino) e verso (exercícios). Gira até a borda, troca a face e volta, ajustando a altura. */
function virarCard(c){
  verPrevia=!verPrevia;
  const trocar=()=>{ c.querySelector(".frente").hidden=verPrevia; c.querySelector(".verso").hidden=!verPrevia;
    c.setAttribute("aria-expanded",String(verPrevia)); c.setAttribute("aria-label",`${c.querySelector("h2").textContent}: toque para ${verPrevia?"voltar":"ver os exercícios"}`); };
  if(!movimentoOk() || !c.animate){ trocar(); return; }
  const h0=c.offsetHeight, p="perspective(900px) ";
  // a troca de face não pode depender só do fim da animação (em segundo plano ela pode não terminar)
  let trocou=false;
  const meio=()=>{ if(trocou) return; trocou=true; trocar(); const h1=c.offsetHeight;
    c.animate([{transform:p+"rotateY(-90deg)", height:h0+"px", overflow:"hidden"},{transform:p+"rotateY(0)", height:h1+"px", overflow:"hidden"}],{duration:280, easing:"cubic-bezier(.22,1,.36,1)"}); };
  c.animate([{transform:p+"rotateY(0)"},{transform:p+"rotateY(90deg)"}],{duration:150, easing:"ease-in"}).onfinish=meio;
  setTimeout(meio, 200);
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
