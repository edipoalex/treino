import { E, FICHA, LETRAS, S, save } from "../estado.js";
import { render } from "../navegacao.js";
import { DIA, addPeso, fmtData, fmtKg, freqAlvo, hojeISO, minutos, parseISO, parseKg, pesoSemanal, segundaDe, semanaAtual, semanaDaEtapa, totalMin, treino } from "../progresso.js";
import { enfileirar } from "../sync.js";
import { confirmar, plate, toast } from "../ui.js";
import { $, esc } from "../util.js";
import { icone } from "../icones.js";
import { fmtRec, fmtVolume, maximos, temCargas, volumeSessao } from "../metricas.js";

export function chartFreq(){
  const alvo=freqAlvo(), atual=semanaAtual();
  const n=Math.max(FICHA.semanas, Math.min(atual, FICHA.semanas+2));
  const porSem=Array.from({length:n},()=>[]);
  for(const x of E.historico){ const w=(semanaDaEtapa(x.data) ?? x.semana)-1; if(w>=0&&w<n) porSem[w].push(x.letra); }
  const maxY=Math.max(alvo.max+1, ...porSem.map(a=>a.length));
  const W=340,H=150,L=22,R=6,T=8,B=24, cw=(W-L-R)/n, bw=Math.min(30,cw*.62), bh=(H-T-B)/maxY;
  const y=v=>H-B-v*bh;
  let g=`<line class="grid" x1="${L}" x2="${W-R}" y1="${y(0)}" y2="${y(0)}"/>`;
  for(const v of [alvo.min,alvo.max]) g+=`<line class="goal" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
  porSem.forEach((ls,i)=>{
    const x=L+i*cw+(cw-bw)/2;
    ls.forEach((l,j)=>{ g+=`<rect x="${x}" y="${y(j+1)+1.5}" width="${bw}" height="${bh-3}" rx="4" fill="var(--p${l})"><title>Treino ${l}</title></rect>`; });
    if(!ls.length && i+1<atual) g+=`<rect x="${x}" y="${y(.12)}" width="${bw}" height="${bh*.12}" rx="2" fill="var(--line)"/>`;
    g+=`<text x="${x+bw/2}" y="${H-6}" text-anchor="middle" ${i+1===atual?'class="cur"':''}>S${i+1}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Treinos por semana da etapa">${g}</svg>`;
}
export function chartPeso(){
  const sem=pesoSemanal(); if(!sem.length) return "";
  const meta=parseKg(S.meta.kg), mData=S.meta.data;
  const pts=sem.map(p=>({t:parseISO(p.semana).getTime(), kg:p.kg}));
  let t0=pts[0].t, t1=pts[pts.length-1].t;
  if(meta && mData) t1=Math.max(t1, parseISO(segundaDe(mData)).getTime());
  if(t1===t0) t1=t0+7*DIA;
  const vals=pts.map(p=>p.kg).concat(meta?[meta]:[]);
  let lo=Math.floor(Math.min(...vals)-.5), hi=Math.ceil(Math.max(...vals)+.5);
  const W=340,H=180,L=34,R=12,T=10,B=26;
  const x=t=>L+(t-t0)/(t1-t0)*(W-L-R), y=v=>T+(hi-v)/(hi-lo)*(H-T-B);
  const step=(hi-lo)>6?2:1;
  let g="";
  for(let v=lo; v<=hi; v+=step) g+=`<line class="grid" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
  if(meta) g+=`<line class="goal" x1="${L}" x2="${W-R}" y1="${y(meta)}" y2="${y(meta)}"/>`;
  if(meta && mData) g+=`<line class="proj" x1="${x(t0)}" y1="${y(pts[0].kg)}" x2="${x(parseISO(segundaDe(mData)).getTime())}" y2="${y(meta)}"/>`;
  g+=`<polyline class="line" points="${pts.map(p=>`${x(p.t)},${y(p.kg)}`).join(" ")}"/>`;
  g+=pts.map(p=>`<circle class="dot" cx="${x(p.t)}" cy="${y(p.kg)}" r="4"><title>${fmtKg(p.kg)} kg</title></circle>`).join("");
  const lab=t=>new Date(t).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
  g+=`<text x="${L}" y="${H-6}">${lab(t0)}</text><text x="${W-R}" y="${H-6}" text-anchor="end">${lab(t1)}</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução do peso semanal">${g}</svg>
  <div class="legend"><span><i class="l"></i>Média semanal</span>${meta?`<span><i></i>Meta ${fmtKg(meta)} kg</span>`:""}${meta&&mData?`<span><i class="p"></i>Ritmo necessário</span>`:""}</div>`;
}
export function resumoPeso(){
  const sem=pesoSemanal(); if(!sem.length) return `<p class="meta">Registre o peso uma vez por semana para ver a evolução.</p>`;
  const ult=sem[sem.length-1], pri=sem[0], meta=parseKg(S.meta.kg);
  const semanas=(parseISO(ult.semana)-parseISO(pri.semana))/DIA/7;
  const ritmo= semanas>0 ? (ult.kg-pri.kg)/semanas : null;
  let falta="";
  if(meta && ult.kg>meta){
    falta = `Faltam ${fmtKg(ult.kg-meta)} kg`;
    if(S.meta.data){ const rest=(parseISO(S.meta.data)-parseISO(hojeISO()))/DIA/7; if(rest>0) falta+=`. Ritmo necessário: ${fmtKg((ult.kg-meta)/rest)} kg/semana`; }
  } else if(meta) falta=`Meta atingida`;
  return `<div class="big"><b>${fmtKg(ult.kg)} kg</b>${sem.length>1?`<span class="delta ${ult.kg<=pri.kg?"down":"up"}">${ult.kg>pri.kg?"+":""}${fmtKg(ult.kg-pri.kg)} kg no total</span>`:""}</div>
    <p class="meta" style="margin-top:6px">${ritmo!==null?`Média de ${ritmo>0?"+":""}${fmtKg(ritmo)} kg/semana. `:""}${falta}</p>`;
}
export let verTodas=false;
/* Métricas de tempo: real x estimado, por treino e por exercício */
export function metricasTempo(){
  const porLetra={}, porEx={};
  for(const x of E.historico){
    if(!(x.duracao>0)) continue;
    const t=treino(x.letra, x.fase, x.volta ?? semanaDaEtapa(x.data) ?? x.semana, x.modo||"completo"); if(!t) continue;
    // estimado só com os itens marcados como feitos
    const feitosNomes=(x.itens||[]).filter(i=>!i.p).map(i=>i.n);
    const est = feitosNomes.length ? t.itens.filter(it=>feitosNomes.includes(it.nome)).reduce((a,it)=>a+minutos(it),0) : totalMin(t)*(x.feitos/x.total||1);
    const L=(porLetra[x.letra] ??= {n:0, real:0, est:0});
    L.n++; L.real+=x.duracao; L.est+=est;
    // por exercício: intervalo entre marcações consecutivas
    let ant=0;
    (x.itens||[]).forEach(i=>{
      if(i.t==null || i.p){ return; }
      const dur=(i.t-ant)/60; ant=i.t;
      if(dur<=0 || dur>40) return;
      const k=`${x.letra}|${i.n}`; const X=(porEx[k] ??= {letra:x.letra, nome:i.n, n:0, real:0, est:(i.e||0)/60});
      X.n++; X.real+=dur;
    });
  }
  return {porLetra, porEx};
}
export function painelTempo(){
  const {porLetra, porEx}=metricasTempo();
  const letras=LETRAS.filter(l=>porLetra[l]);
  if(!letras.length) return `<section class="panel"><h3>Tempo de execução</h3><p class="meta">Conclua treinos marcando os exercícios para ver o tempo real comparado ao estimado.</p></section>`;
  const dif=(r,e)=>{ const d=r-e; return `<span class="delta ${d>2?"up":d<-2?"down":""}" style="${Math.abs(d)<=2?"color:var(--muted)":""}">${d>0?"+":""}${Math.round(d)} min</span>`; };
  const linhas=letras.map(l=>{ const L=porLetra[l], r=L.real/L.n, e=L.est/L.n;
    return `<div class="trow"><span class="t" style="display:flex;align-items:center;gap:10px">${plate(l,"xs")} ${L.n} ${L.n>1?"sessões":"sessão"}</span><span class="min">${Math.round(r)} min</span>
      <span class="m">Estimado ${Math.round(e)} min · ${dif(r,e)}</span></div>`; }).join("");
  const ordem=(l,n)=>{ for(const f of Object.keys(FICHA.fases)){ const i=(FICHA.fases[f][l]?.itens||[]).findIndex(it=>it.nome===n); if(i>=0) return i; } return 99; };
  const fmt1=v=>v.toFixed(1).replace(".",",");
  const exHtml = letras.map(l=>{
    const exs=Object.values(porEx).filter(x=>x.letra===l && x.n>0).map(x=>({...x, r:x.real/x.n})).sort((a,b)=>ordem(l,a.nome)-ordem(l,b.nome));
    if(!exs.length) return "";
    return `<details style="margin-top:10px;border:1px solid var(--line)"><summary style="font-size:15px;gap:10px;justify-content:flex-start">${plate(l,"xs")}<span style="flex:1">Treino ${l} por exercício</span></summary><div class="dbody">
      ${exs.map(x=>`<div class="trow" style="padding:10px 0"><span class="t" style="font-weight:500">${esc(x.nome)}</span><span class="min" style="font-size:16px">${fmt1(x.r)} min</span>
        <span class="m">Estimado ${fmt1(x.est)} min · ${dif(x.r,x.est).replace(/ min</," min<")} · ${x.n} ${x.n>1?"sessões":"sessão"}</span></div>`).join("")}</div></details>`;
  }).join("") + (Object.keys(porEx).length?`<p class="meta" style="font-size:13px;margin-top:10px">Por exercício: tempo entre a marcação anterior (ou o início do treino) e a deste, incluindo descansos e trocas de aparelho.</p>`:"");
  return `<section class="panel" aria-labelledby="hTempo"><h3 id="hTempo">Tempo de execução <span class="sub2">real × estimado</span></h3>
    <div class="table" style="margin-top:4px">${linhas}</div>${exHtml}</section>`;
}
/* Volume dos últimos treinos com carga registrada por série, na cor da letra */
export function chartVolume(){
  const xs=E.historico.filter(temCargas).slice(-10); if(!xs.length) return "";
  const vs=xs.map(volumeSessao), max=Math.max(...vs,1);
  const W=340,H=130,B=22,T=16, cw=W/xs.length, bw=Math.min(30,cw*.62);
  let g="";
  xs.forEach((x,i)=>{ const h=(H-B-T)*vs[i]/max, px=i*cw+(cw-bw)/2;
    g+=`<rect x="${px}" y="${H-B-h}" width="${bw}" height="${Math.max(h,2)}" rx="4" fill="var(--p${x.letra})"><title>Treino ${x.letra}, ${fmtData(x.data)}: ${fmtVolume(vs[i])}</title></rect>`;
    g+=`<text x="${px+bw/2}" y="${H-6}" text-anchor="middle">${x.letra}</text>`;
    if(i===xs.length-1) g+=`<text x="${px+bw/2}" y="${H-B-h-4}" text-anchor="middle">${fmtVolume(vs[i])}</text>`; });
  return `<section class="panel" aria-labelledby="hVol"><h3 id="hVol">Volume por treino <span class="sub2">kg × repetições</span></h3>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Volume dos últimos treinos">${g}</svg></section>`;
}
/* Recordes de carga de todas as etapas (registradas por série a partir da v1.18) */
let verRecordes=false;
export function painelRecordes(){
  const todas=Object.values(S.etapas).flatMap(e=>e.historico||[]);
  const rs=Object.values(maximos(todas)).sort((a,b)=>b.data.localeCompare(a.data) || a.k.localeCompare(b.k));
  if(!rs.length) return `<section class="panel"><h3>Recordes de carga</h3><p class="meta">Os recordes aparecem conforme você registra séries com carga.</p></section>`;
  const lista=rs.slice(0, verRecordes?rs.length:6);
  return `<section class="panel" aria-labelledby="hRec" style="padding-bottom:8px"><h3 id="hRec">Recordes de carga</h3>
    <ul class="r-cargas">${lista.map(r=>`<li><span>${esc([r.k, r.g].filter(Boolean).join(" · "))}</span><span><b style="color:var(--ink)">${fmtRec(r)}</b> · ${r.data===hojeISO()?"hoje":fmtData(r.data)}</span></li>`).join("")}</ul>
    ${rs.length>6?`<button class="btn ghost block" id="verRecordes">${verRecordes?"Mostrar menos":`Ver todos os ${rs.length} recordes`}</button>`:""}</section>`;
}

export function viewHistorico(){
  const h=[...E.historico].reverse();
  const durs=E.historico.filter(x=>x.duracao>0).map(x=>x.duracao);
  const media = durs.length? Math.round(durs.reduce((a,b)=>a+b,0)/durs.length) : null;
  const semFeitas=Math.max(1, Math.min(semanaAtual(), FICHA.semanas));
  const porSemana = E.historico.length ? (E.historico.length/semFeitas) : 0;
  const alvo=freqAlvo();
  const ultimos=[...S.peso].reverse().slice(0,8);
  $("#view").innerHTML = `
  <h1 class="page">Histórico</h1>
  <p class="sub">Etapa ${FICHA.etapa}${E.inicio?`, iniciada em ${fmtData(E.inicio)}`:""}</p>
  <div class="stats">
    <div class="stat"><b>${E.historico.length}</b><span>treinos</span></div>
    <div class="stat"><b>${porSemana?fmtKg(porSemana):"—"}</b><span>por semana</span></div>
    <div class="stat"><b>${media??"—"}</b><span>min em média</span></div>
  </div>

  <section class="panel" aria-labelledby="hFreq"><h3 id="hFreq">Frequência por semana <span class="sub2">meta ${alvo.min}–${alvo.max}</span></h3>
    ${E.historico.length||E.inicio ? chartFreq() : `<p class="meta">Conclua treinos na aba Hoje para ver a frequência.</p>`}
  </section>

  <section class="panel" aria-labelledby="hPeso"><h3 id="hPeso">Peso</h3>
    ${resumoPeso()}
    ${chartPeso()}
    <div class="inline-form">
      <input type="date" id="pData" value="${hojeISO()}" aria-label="Data da pesagem">
      <input id="pKg" inputmode="decimal" placeholder="kg" aria-label="Peso em kg">
      <button class="btn primary" id="pAdd">Registrar</button>
    </div>
    ${ultimos.length?`<ul class="weigh-list">${ultimos.map(p=>`<li><span>${fmtData(p.d)}</span><strong>${fmtKg(p.kg)} kg</strong><button data-del="${esc(p.d)}" aria-label="Apagar registro de ${fmtData(p.d)}">${icone("x")}</button></li>`).join("")}</ul>`:""}
    ${!parseKg(S.meta.kg)?`<p class="meta" style="margin-top:10px;font-size:14px">Defina a meta de peso em Ajustes para ver a linha de meta.</p>`:""}
  </section>

  ${painelRecordes()}
  ${chartVolume()}
  ${painelTempo()}

  <section class="panel" aria-labelledby="hSes" style="padding-bottom:8px"><h3 id="hSes">Sessões</h3>
  ${h.length ? `<ul class="hist" style="margin-top:0">${h.slice(0, verTodas?h.length:8).map((x,i)=>`<li>${plate(x.letra,"sm")}<div class="info"><strong>Treino ${x.letra}${x.modo==="express"?" · express":""}, ${fmtData(x.data)}</strong>
    <span>${x.inicio&&x.fim?`${esc(x.inicio)}–${esc(x.fim)}, `:""}${x.duracao?`${x.duracao} min, `:""}${x.feitos} de ${x.total} itens${temCargas(x)&&volumeSessao(x)?`, ${fmtVolume(volumeSessao(x))}`:""}. Fase ${esc(x.fase)}, ${x.volta?`volta ${esc(x.volta)}`:`semana ${semanaDaEtapa(x.data) ?? x.semana}`}</span></div>
    ${i===0?`<button class="btn" id="undoBtn" style="min-height:44px">Desfazer</button>`:""}</li>`).join("")}</ul>`
  : `<p class="empty" style="padding:16px 8px">Nenhum treino registrado nesta etapa.</p>`}
  ${h.length>8?`<button class="btn ghost block" id="verTodas" style="margin-top:8px">${verTodas?"Mostrar menos":`Ver todas as ${h.length} sessões`}</button>`:""}
  </section>`;
  $("#verRecordes") && ($("#verRecordes").onclick=()=>{ verRecordes=!verRecordes; const y=scrollY; render(); scrollTo(0,y); });
  $("#verTodas") && ($("#verTodas").onclick=()=>{ verTodas=!verTodas; const y=scrollY; render(); scrollTo(0,y); });
  $("#undoBtn") && ($("#undoBtn").onclick=async()=>{ if(await confirmar({ titulo:"Remover o último treino registrado?", texto:"Some também da planilha.", sim:"Remover", nao:"Manter", perigo:true })){ const x=E.historico.pop(); if(x?.id) enfileirar({tipo:"delSessao", id:x.id}); else save(); toast("Registro removido"); render(); }});
  $("#pAdd").onclick=()=>{
    const kg=parseKg($("#pKg").value), d=$("#pData").value || hojeISO();
    if(!kg){ toast("Informe um peso válido, ex.: 83,4"); $("#pKg").focus(); return; }
    addPeso(d,kg); toast(`Peso registrado: ${fmtKg(kg)} kg`); const y=scrollY; render(); scrollTo(0,y);
  };
  document.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{
    if(await confirmar({ titulo:`Apagar o peso de ${fmtData(b.dataset.del)}?`, texto:"Some também da planilha.", sim:"Apagar", nao:"Manter", perigo:true })){ S.peso=S.peso.filter(p=>p.d!==b.dataset.del); enfileirar({tipo:"delPeso", data:b.dataset.del}); const y=scrollY; render(); scrollTo(0,y); }
  });
}
