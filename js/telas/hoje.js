import { E, FICHA, LETRAS, S, save } from "../estado.js";
import { render } from "../navegacao.js";
import { DIA, PROG, addPeso, faseAtual, feitoHoje, feitosEtapa, fmtKg, freqAlvo, hojeISO, modoPadrao, parseISO, parseKg, pesoSemanal, porVoltas, proxima, relDia, segundaDe, semanaAtual, temExpress, totalMin, totalTreinos, treino, treinosPorVolta, ultimo, voltaAtual } from "../progresso.js";
import { rerender, viewSessao } from "./sessao.js";
import { plate, toast } from "../ui.js";
import { $, esc } from "../util.js";

/* ---------- Views ---------- */
let escolha = null;
export function viewHoje(){
  if(E.atual) return viewSessao();
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
  $("#view").innerHTML = `
  <section class="hoje-card L-${esc(letra)}">${plate(letra,"md")}
    <div style="flex:1;min-width:0"><p class="meta">${titulo}</p><h2>Treino ${esc(letra)}</h2>
    <p class="meta">${esc(t.foco)} · ~${Math.round(totalMin(t))} min${tEx?` · express ~${Math.round(totalMin(tEx))} min`:""}</p></div>
  </section>
  ${feito ? `<p class="done-today">Treino ${esc(feito.letra)} concluído hoje. Este é o próximo da sequência.</p>` : ""}
  ${aviso ? `<p class="done-today" style="color:var(--warn)">${aviso}</p>` : ""}
  <div class="stack" style="margin-top:12px">
    <button class="btn primary cor grande block L-${esc(letra)}" id="startBtn">Começar treino ${esc(letra)}</button>
    <div class="linha2" style="margin-top:0">
      <button class="btn" id="previaBtn" aria-expanded="${!!verPrevia}">${verPrevia?"Ocultar lista":`Exercícios (${t.itens.length})`}</button>
      <button class="btn" id="pickToggle" aria-expanded="false">Outro treino hoje</button>
    </div>
    <div class="pick" id="pick" hidden>${LETRAS.map(l=>`<button aria-pressed="${l===letra}" aria-label="Treino ${esc(l)}" data-pick="${esc(l)}">${plate(l,"sm")}</button>`).join("")}</div>
    ${verPrevia?`<ul class="previa">${t.itens.map(it=>`<li><span>${esc(it.nome)}</span><span>${it.series?`${it.series} ${it.series>1?"séries":"série"}`:`${it.bloco} min`}</span></li>`).join("")}</ul>`:""}
  </div>
  ${semanaPanel()}
  ${pesoPanel()}`;
  bindPeso();
  $("#startBtn").onclick = () => iniciar(letra);
  $("#previaBtn").onclick = () => { verPrevia=!verPrevia; rerender(); };
  $("#pickToggle").onclick = e => { const p=$("#pick"); p.hidden=!p.hidden; e.currentTarget.setAttribute("aria-expanded",String(!p.hidden)); };
  document.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>{ escolha = b.dataset.pick===proxima()?null:b.dataset.pick; render(); $("#pick").hidden=false; });
}
export let verPrevia=false;
export function pesoPanel(){
  const seg = segundaDe(hojeISO());
  const sem = pesoSemanal(); const atual = sem.find(x=>x.semana===seg); const ant = sem.filter(x=>x.semana<seg).pop();
  const meta = parseKg(S.meta.kg);
  if(!atual || pesoEditando){
    return `<section class="panel" aria-label="Peso da semana"><h3>Peso da semana</h3>
      <div class="row"><div class="kgfield"><input id="pesoHoje" inputmode="decimal" placeholder="${ant?fmtKg(ant.kg):"Ex.: 84,0"}" aria-label="Peso em kg"><span>kg</span></div>
      <button class="btn primary" id="pesoSalvar" style="min-height:56px">Salvar</button></div>
      <p class="meta" style="margin-top:8px;font-size:14px">De manhã, em jejum, depois de ir ao banheiro.</p></section>`;
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
    <div style="display:flex;align-items:flex-end;gap:16px">
      <div><div class="big"><b>${fmtKg(atual.kg)} kg</b></div>
      ${d!==null?`<div class="delta ${d<=0?"down":"up"}" style="margin-top:4px">${d>0?"+":""}${fmtKg(d)} kg na semana</div>`:""}
      ${meta?`<p class="meta" style="margin-top:2px">${atual.kg>meta?`faltam ${fmtKg(atual.kg-meta)} kg`:"meta atingida"}</p>`:""}</div>
      ${spark}</div>
    <button class="btn block" id="pesoEditar" style="margin-top:12px;min-height:56px">Registrar peso</button></section>`;
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
export function semanaPanel(){
  const hoje = parseISO(hojeISO());
  const dow = (hoje.getDay()+6)%7; // segunda=0
  const seg = new Date(hoje - dow*DIA);
  const nomes = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  let feitos = 0;
  const dias = nomes.map((n,i)=>{
    const d = new Date(seg.getTime()+i*DIA); d.setHours(0,0,0,0);
    const iso = new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
    const h = E.historico.filter(x=>x.data===iso).pop();
    if(h) feitos++;
    return `<div class="d ${i===dow?"today":""}">${h?plate(h.letra,"xs"):`<span class="slot"></span>`}<span>${n}</span></div>`;
  }).join("");
  const u=ultimo(), durs=E.historico.filter(x=>x.duracao>0).map(x=>x.duracao);
  const media=durs.length?Math.round(durs.reduce((a,b)=>a+b,0)/durs.length):null;
  const rodape=[u?`Último: treino ${esc(u.letra)}, ${relDia(u.data)}`:"", media?`média de ${media} min`:""].filter(Boolean).join(" · ");
  return `<section class="panel" aria-label="Semana atual"><h3>Esta semana<span class="sub2">${feitos} de ${freqAlvo().max} treinos</span></h3><div class="week">${dias}</div>
    ${rodape?`<p class="meta" style="margin-top:12px;font-size:14px">${rodape}</p>`:""}</section>`;
}
export function iniciar(letra){
  E.atual = { letra, fase: faseAtual(), semana: Math.min(semanaAtual(), FICHA.semanas), volta: voltaAtual(), modo: temExpress(letra) ? modoPadrao() : "completo", inicio: Date.now(), feitos: [], marcas: {}, series: {}, ativo: 0 };
  escolha = null; verPrevia=false; save(); render(); scrollTo(0,0);
}
