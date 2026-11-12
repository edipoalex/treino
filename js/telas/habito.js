/* Hábito (fase 3) na tela: "Sua semana" e barra da etapa na Hoje, cartão e folha da revisão da semana,
   "como foi" ao concluir e no Histórico, marco do resumo e fechamento da etapa.
   Os cálculos ficam em js/habito.js (testados); aqui só montagem e eventos. */
import { E, FICHA, LETRAS, S, save } from "../estado.js";
import { render } from "../navegacao.js";
import { PROG, faseAtual, fmtKg, freqAlvo, hojeISO, parseISO, pesoSemanal, porVoltas, proxima, relDia, semanaAtual, semanaDaEtapa, totalTreinos, treinosPorVolta, ultimo, voltaAtual } from "../progresso.js";
import { SENSACOES, blocosEtapa, chaveSen, distSensacao, evolucaoCargas, marcoConclusao, resumoSemana, segunda, sensacaoOk, sequencia, somarDias, textoFechamento, textoSequencia } from "../habito.js";
import { fmtRec, fmtVolume, recordesDaSessao } from "../metricas.js";
import { enfileirar } from "../sync.js";
import { fecharFolha, folha, plate, toast } from "../ui.js";
import { icone } from "../icones.js";
import { confete, contar, movimentoOk } from "../movimento.js";
import { copiarTexto } from "../guia-exercicios.js";
import { abrirCompartilhar, urlApp } from "../compartilhar.js";
import { esc, fmtNum } from "../util.js";

const pl = (n, um, varios) => n===1 ? um : varios;
const fmtHoras = min => { const h=Math.floor(min/60), m=Math.round(min%60); return h ? `${h}h${String(m).padStart(2,"0")}` : `${m} min`; };
const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const faixa = seg => { const a=parseISO(seg), b=parseISO(somarDias(seg,6));
  return a.getMonth()===b.getMonth() ? `${a.getDate()} a ${b.getDate()} de ${MESES[b.getMonth()]}` : `${a.getDate()} de ${MESES[a.getMonth()]} a ${b.getDate()} de ${MESES[b.getMonth()]}`; };
/* Sessões de todas as etapas, em ordem de data (a sequência atravessa etapas) */
export function todasSessoes(){
  return Object.values(S.etapas).flatMap(e => e.historico||[]).map((x, i) => [x, i]).sort((a, b) => a[0].data.localeCompare(b[0].data) || a[1]-b[1]).map(([x]) => x);
}
const metaTxt = a => a.min===a.max ? `${a.min}` : `${a.min}–${a.max}`;

/* Anel segmentado: um gomo por treino da meta máxima; os gomos além do mínimo são bônus */
export function anelMeta(feitos, { min, max }, cls=""){
  const r=40, C=2*Math.PI*r, gap=6, seg=C/max-gap, batida=feitos>=min;
  const gomos = Array.from({length:max}, (_, i) => `<circle class="${i<feitos?"arco":"fundo"}" cx="50" cy="50" r="${r}" fill="none" stroke-width="10"
    stroke-dasharray="${seg.toFixed(1)} ${(C-seg).toFixed(1)}" stroke-dashoffset="${(-(i*C/max)-gap/2).toFixed(1)}"${i>=min && i>=feitos?' stroke-opacity=".45"':""}/>`).join("");
  return `<div class="anel-meta ${batida?"batida":""} ${cls}" role="img" aria-label="${feitos} de ${metaTxt({min,max})} treinos na semana">
    <svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(-90 50 50)">${gomos}</g></svg>
    <div class="num" aria-hidden="true"><b>${batida?icone("check"):feitos}</b><small>${batida?`${feitos} ${pl(feitos,"treino","treinos")}`:`de ${min}`}</small></div></div>`;
}

export const semanasSeguidas = () => sequencia(todasSessoes().map(x => x.data), freqAlvo(), hojeISO()).seq;
/* ---------- Hoje: Sua semana ---------- */
export function painelSemana(){
  const alvo=freqAlvo(), hoje=hojeISO(), todas=todasSessoes();
  const r=sequencia(todas.map(x => x.data), alvo, hoje), t=textoSequencia(r), seg=segunda(hoje);
  const nomes=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  const dias=nomes.map((n, i) => { const iso=somarDias(seg, i), h=todas.filter(x => x.data===iso).pop();
    return `<div class="d ${i===r.dow?"today":""}">${h?plate(h.letra,"xs"):`<span class="slot"></span>`}<span>${n}</span></div>`; }).join("");
  const chamas=r.semanas.map(w => `<i class="${w.ok?"sim":""} ${w.atual?"agora":""}"></i>`).join("");
  const u=ultimo(), durs=E.historico.filter(x => x.duracao>0).map(x => x.duracao);
  const media=durs.length ? Math.round(durs.reduce((a, b) => a+b, 0)/durs.length) : null;
  const rodape=[u?`Último: treino ${esc(u.letra)}, ${relDia(u.data)}`:"", media?`média de ${media} min`:""].filter(Boolean).join(" · ");
  return `<section class="panel" aria-label="Sua semana"><h3>Sua semana<span class="sub2">meta ${metaTxt(alvo)}</span></h3>
    <div class="habito">${anelMeta(r.n, alvo)}
      <div class="seq ${t.zero?"zero":""}"><div class="linha-ic">${icone("flame")}<b>${t.titulo}</b></div><p class="${t.cls}">${t.texto}</p>
      <div class="chamas" role="img" aria-label="Meta batida em ${r.semanas.filter(w => w.ok && !w.atual).length} das 7 semanas anteriores">${chamas}</div></div></div>
    <div class="week">${dias}</div>
    ${rodape?`<p class="mt-3 tx-sec meta">${rodape}</p>`:""}</section>`;
}

/* ---------- Hoje: barra da etapa ---------- */
export function painelEtapa(){
  const pv=porVoltas(), P=PROG(), alvo=freqAlvo(), n=E.historico.length, tot=totalTreinos();
  const blocos = pv ? P.voltas : FICHA.semanas, porBloco = pv ? treinosPorVolta() : alvo.max;
  const mapa = pv ? P.fases_voltas||{} : FICHA.fases_semanas||{};
  const faseDoBloco = b => Object.keys(mapa).find(k => (mapa[k]||[]).includes(b)) || "";
  const r = blocosEtapa({ porVoltas:pv, blocos, porBloco, faseDoBloco, sessoes:E.historico, blocoDaSessao:x => semanaDaEtapa(x.data) ?? x.semana, blocoAtual:semanaAtual() });
  const fa=faseAtual(), prox=proxima();
  const rot = r.fases.length>1 ? `<div class="fases-rot" style="grid-template-columns:repeat(${blocos},1fr)" aria-hidden="true">${r.fases.map(f => `<span class="${f.f===fa?"atual":""}" style="grid-column:span ${f.n}">Fase ${esc(f.f)}</span>`).join("")}</div>` : "";
  const vs = r.blocos.map((b, i) => `<div class="volta">${Array.from({length:porBloco}, (_, j) => {
    const l=b[j], p=r.prox && r.prox.b===i && r.prox.j===j;
    return `<i class="${l?`f L-${esc(l)}`:""} ${p?`prox L-${esc(prox)}`:""}"></i>`; }).join("")}</div>`).join("");
  const sem=Math.min(semanaAtual(), FICHA.semanas);
  const rodape = pv ? `<span><b>Treino ${Math.min(n+1, tot)} de ${tot}</b> · volta ${voltaAtual()}</span><span>${n>=tot?"etapa completa":`faltam ${tot-n}`}</span>`
    : `<span><b>Semana ${sem} de ${FICHA.semanas}</b></span><span>${n} ${pl(n,"treino feito","treinos feitos")}</span>`;
  const sub = pv && P.limite_semanas && E.inicio ? `semana ${semanaAtual()} de até ${P.limite_semanas}` : `fase ${esc(fa)}`;
  const desc = pv ? `${n} de ${tot} treinos, ${blocos} voltas de ${porBloco}` : `semana ${sem} de ${FICHA.semanas}, ${n} treinos feitos`;
  return `<section class="panel" aria-label="Etapa ${esc(FICHA.etapa)}"><h3>Etapa ${esc(FICHA.etapa)}<span class="sub2">${sub}</span></h3>
    <div class="etapa-barra">${rot}<div class="voltas" style="grid-template-columns:repeat(${blocos},1fr)" role="img" aria-label="${desc}">${vs}</div>
    <div class="rodape">${rodape}</div></div></section>`;
}

/* ---------- Revisão da semana ---------- */
export function cartaoRevisao(){
  const seg=somarDias(segunda(hojeISO()), -7); if(S.revisaoVista===seg) return "";
  const todas=todasSessoes(), r=resumoSemana(todas, seg, pesoSemanal()); if(!r.sessoes.length) return "";
  const alvo=freqAlvo(), n=r.sessoes.length, ok=n>=alvo.min;
  const partes=[`${n} ${pl(n,"treino","treinos")}`, fmtHoras(r.minutos), r.recordes.length?`${r.recordes.length} ${pl(r.recordes.length,"recorde","recordes")}`:""].filter(Boolean).join(" · ");
  return `<div class="revisao ${ok?"":"nao"}" role="group" aria-label="Revisão da semana passada">
    ${icone(ok?"circle-check":"calendar-days")}<button class="flex1" data-revisao="${seg}"><b>Semana passada: ${ok?"meta batida":`${n} de ${alvo.min}`}</b><span>${partes}</span></button>
    <button class="fechar" data-revisao-fechar="${seg}" aria-label="Dispensar a revisão da semana">${icone("x")}</button></div>`;
}
export function ligarRevisao(raiz=document){
  raiz.querySelectorAll("[data-revisao]").forEach(b => b.onclick=() => { S.revisaoVista=b.dataset.revisao; save(); abrirRevisao(b.dataset.revisao); render(); });
  raiz.querySelectorAll("[data-revisao-fechar]").forEach(b => b.onclick=() => { S.revisaoVista=b.dataset.revisaoFechar; save(); render(); });
}
const distHtml = d => `<div class="dist" aria-hidden="true">${["facil","ponto","pesado"].filter(k => d[k]).map(k => `<i class="${k}" style="flex:${d[k]}"></i>`).join("")}</div>
  <div class="dist-leg"><span><i style="background:var(--ok)"></i>${d.facil} ${pl(d.facil,"leve","leves")}</span><span><i style="background:var(--ink-2)"></i>${d.ponto} no ponto</span><span><i style="background:var(--warn)"></i>${d.pesado} ${pl(d.pesado,"pesado","pesados")}</span></div>`;
export function abrirRevisao(seg){
  const todas=todasSessoes(), r=resumoSemana(todas, seg, pesoSemanal()), alvo=freqAlvo(), n=r.sessoes.length;
  const atual=seg===segunda(hojeISO()), dom=somarDias(seg, 6);
  const sq=sequencia(todas.map(x => x.data).filter(d => d<=dom), alvo, atual ? hojeISO() : dom);
  const sqTxt=`Sequência: ${sq.seq} ${pl(sq.seq,"semana","semanas")}.`;
  const marco = n>=alvo.max && alvo.max>alvo.min ? `<div class="marco">${icone("flame")}<div><b>Semana perfeita</b><span>${n} de ${alvo.max} treinos. ${sqTxt}</span></div></div>`
    : n>=alvo.min ? `<div class="marco">${icone("flame")}<div><b>Meta da semana batida</b><span>${n} de ${metaTxt(alvo)} treinos. ${sqTxt}</span></div></div>`
    : `<p class="meta">${n} de ${alvo.min} treinos${atual?" até agora.":". A sequência recomeça na semana seguinte."}</p>`;
  const se=E.inicio && seg>=segunda(E.inicio) ? semanaDaEtapa(dom) : null;
  folha(`<div class="linha-ic">${anelMeta(n, alvo)}<div><h3>${se?`Semana ${se}`:"Semana"}</h3><p class="meta">${faixa(seg)}${atual?" · em andamento":""}</p></div></div>
    ${marco}
    <div class="rev-letras">${r.sessoes.map(x => plate(x.letra,"xs")).join("")}</div>
    <div class="stats"><div class="stat"><b>${fmtHoras(r.minutos)}</b><span>treinando</span></div><div class="stat"><b data-contar="${r.series}">${r.series}</b><span>séries</span></div>
      ${r.volume?`<div class="stat"><b>${fmtVolume(r.volume)}</b><span>volume</span></div>`:`<div class="stat"><b>${n}</b><span>${pl(n,"treino","treinos")}</span></div>`}</div>
    ${r.recordes.length?`<h4>Recordes</h4><ul class="lista-num">${r.recordes.map(x => `<li><span>${esc([x.k, x.g].filter(Boolean).join(" · "))}</span><span><b>${fmtRec(x)}</b> (antes ${fmtNum(x.antes)})</span></li>`).join("")}</ul>`:""}
    ${r.dist.total?`<h4>Como foi</h4>${distHtml(r.dist)}`:""}
    ${r.peso?`<h4>Peso</h4><p>Média ${fmtKg(r.peso.kg)} kg${r.peso.dif!=null?` · <span class="${r.peso.dif<=0?"tx-ok":""}">${r.peso.dif>0?"+":"−"}${fmtKg(Math.abs(r.peso.dif))} kg</span> sobre a semana anterior`:""}</p>`:""}
    <button class="btn primary" data-fechar>Fechar</button>`, f => contar(f));
}
/* Atalhos no Histórico: uma pílula por semana com treino */
export function semanasRevisao(){
  const alvo=freqAlvo(), por={};
  for(const x of todasSessoes()){ const k=segunda(x.data); por[k]=(por[k]||0)+1; }
  const ks=Object.keys(por).sort().slice(-8); if(!ks.length) return "";
  return `<p class="mt-3 tx-sec meta">Revisão da semana</p><div class="semanas-rev">${ks.map(k => {
    const se=E.inicio && k>=segunda(E.inicio) ? `S${semanaDaEtapa(somarDias(k,6))}` : faixa(k).replace(/ de \w+$/,"");
    return `<button class="${por[k]>=alvo.min?"ok":""}" data-revisao="${k}" aria-label="Revisão da semana de ${faixa(k)}, ${por[k]} treinos">${se}</button>`; }).join("")}</div>`;
}

/* ---------- Como foi (sensação) ---------- */
const medidor = (n, k) => `<span class="med ${k}" aria-hidden="true">${[1,2,3].map(i => `<i class="${i<=n?"on":""}"></i>`).join("")}</span>`;
const NIVEL = { facil:1, ponto:2, pesado:3 };
export const medidorSen = k => sensacaoOk(k) ? medidor(NIVEL[k], k) : "";
export function sentirHtml(sel="", depois=true){
  return `<div class="sentir" data-sentir><p>Como foi o treino?</p><div class="ops" role="group" aria-label="Como foi o treino">
    ${Object.entries(SENSACOES).map(([k, n]) => `<button data-sen="${k}" aria-pressed="${sel===k}">${medidor(NIVEL[k], k)}${n}</button>`).join("")}</div>
    <p class="salvo" aria-live="polite">${sel?"Salvo. O agente usa isso para ajustar a próxima ficha.":depois?"Opcional. Dá para marcar depois no Histórico.":""}</p></div>`;
}
export function definirSensacao(id, v){
  const x=Object.values(S.etapas).flatMap(e => e.historico||[]).find(y => y.id===id); if(!x) return;
  if(sensacaoOk(v)) x.sen=v; else delete x.sen;
  if(x.id) enfileirar({ tipo:"setConfig", chave:chaveSen(x.id), valor:x.sen||"" }); else save();
}
/* Liga os botões de "como foi" dentro de raiz; tocar de novo na mesma opção desmarca */
export function ligarSentir(raiz, id, aoMudar){
  raiz.querySelector("[data-sentir]")?.addEventListener("click", e => {
    const b=e.target.closest("[data-sen]"); if(!b) return;
    const atual=Object.values(S.etapas).flatMap(st => st.historico||[]).find(y => y.id===id)?.sen;
    const v = atual===b.dataset.sen ? "" : b.dataset.sen;
    definirSensacao(id, v);
    const s=raiz.querySelector("[data-sentir]"); s.outerHTML=sentirHtml(v);
    ligarSentir(raiz, id, aoMudar); aoMudar?.(v);
  }, { once:true });
}
export function abrirSensacao(x, aoMudar){
  folha(`<div class="linha-ic">${plate(x.letra,"sm")}<div><h3>Treino ${esc(x.letra)}</h3><p class="meta">${esc(x.data.split("-").reverse().join("/"))}${x.duracao?` · ${x.duracao} min`:""}</p></div></div>
    ${sentirHtml(x.sen||"", false)}<button class="btn primary" data-fechar>Fechar</button>`, f => ligarSentir(f, x.id, aoMudar));
}

/* ---------- Marco no resumo do treino ---------- */
export function marcoDoTreino(){
  const alvo=freqAlvo(), s=sequencia(todasSessoes().map(x => x.data), alvo, hojeISO());
  const m=marcoConclusao({ semana:s, feitos:E.historico.length, total:totalTreinos(), porVolta:porVoltas()?treinosPorVolta():0 });
  if(!m) return { html:"", m };
  const vis = m.tipo==="meta" || m.tipo==="perfeita" ? anelMeta(s.n, alvo) : icone(m.tipo==="etapa"?"trophy":"flame");
  return { m, html:`<div class="marco" role="status">${vis}<div><b>${m.titulo}</b><span>${m.texto}</span></div></div>` };
}

/* ---------- Fechamento da etapa ---------- */
export function etapaEncerrada(){
  const n=E.historico.length, tot=totalTreinos();
  if(porVoltas()) return n>=tot || (!!E.inicio && semanaAtual()>PROG().limite_semanas);
  return !!E.inicio && semanaAtual()>FICHA.semanas;
}
function dadosFechamento(){
  const xs=E.historico, n=xs.length, tot=totalTreinos(), todas=todasSessoes();
  const semanas=Math.max(1, (xs.length ? semanaDaEtapa(xs[n-1].data) : semanaAtual()) || 1);
  const porSemana=Math.round(n/semanas*10)/10, minutos=xs.reduce((t, x) => t+(x.duracao||0), 0);
  let recordes=0; for(const x of xs) recordes+=recordesDaSessao(x, todas.slice(0, todas.indexOf(x))).length;
  const dist=distSensacao(xs), evol=evolucaoCargas(xs);
  const pesadosPorLetra={}; for(const x of xs) if(x.sen==="pesado") pesadosPorLetra[x.letra]=(pesadosPorLetra[x.letra]||0)+1;
  const ps=S.peso.filter(p => E.inicio && p.d>=E.inicio && (!xs.length || p.d<=somarDias(xs[n-1].data, 7)));
  const peso = ps.length>1 ? { de:ps[0].kg, ate:ps[ps.length-1].kg } : null;
  const seq=sequencia(todas.map(x => x.data), freqAlvo(), hojeISO()).seq;
  return { etapa:FICHA.etapa, feitos:n, total:tot, semanas, porSemana, minutos, recordes, dist, evol, pesadosPorLetra, peso, seq };
}
export function viewFechamento(){
  const d=dadosFechamento(), completa=d.feitos>=d.total;
  const f1 = v => fmtNum(v);
  return `<div class="fecho"><div class="pilha">${LETRAS.map(l => plate(l,"sm d3")).join("")}</div>
      <h1>Etapa ${esc(d.etapa)} ${completa?"concluída":"encerrada"}</h1><p>${d.feitos} de ${d.total} treinos em ${d.semanas} ${pl(d.semanas,"semana","semanas")}</p></div>
    <div class="stats fecho-stats"><div class="stat"><b>${f1(d.porSemana)}</b><span>treinos por semana</span></div><div class="stat"><b>${fmtHoras(d.minutos)}</b><span>treinando</span></div>
      <div class="stat"><b data-contar="${d.recordes}">${d.recordes}</b><span>${pl(d.recordes,"recorde","recordes")}</span></div><div class="stat"><b data-contar="${d.seq}">${d.seq}</b><span>${pl(d.seq,"semana seguida","semanas seguidas")}</span></div></div>
    ${d.evol.length?`<section class="panel" aria-label="Evolução de carga"><h3>Evolução de carga<span class="sub2">1ª → última</span></h3><ul class="lista-num">
      ${d.evol.map(e => `<li><span>${esc([e.k, e.g].filter(Boolean).join(" · "))}</span><span>${f1(e.de)} → <b>${f1(e.ate)} kg</b> <span class="${e.pct>0?"sobe":""}">${e.pct>0?"+":""}${e.pct}%</span></span></li>`).join("")}</ul></section>`:""}
    ${d.dist.total?`<section class="panel" aria-label="Como foi"><h3>Como foi<span class="sub2">${d.dist.total} ${pl(d.dist.total,"treino marcado","treinos marcados")}</span></h3>${distHtml(d.dist)}</section>`:""}
    ${d.peso?`<section class="panel" aria-label="Peso"><h3>Peso</h3><p>${fmtKg(d.peso.de)} → <b>${fmtKg(d.peso.ate)} kg</b> · <span class="${d.peso.ate<=d.peso.de?"tx-ok":""}">${d.peso.ate>d.peso.de?"+":"−"}${fmtKg(Math.abs(d.peso.ate-d.peso.de))} kg</span> na etapa</p></section>`:""}
    <div class="mt-4 stack"><button class="btn primary cor grande block L-${esc(LETRAS[0])}" id="copiarResumo">${icone("copy")} Copiar resumo para o agente</button>
      <button class="btn block" id="compartilharEtapa">${icone("share")} Compartilhar</button>
      <button class="btn block" id="treinarMesmo">${icone("play")} Treinar enquanto a nova ficha não chega</button></div>
    <p class="mt-2 tx-legenda meta">O resumo vai pronto para colar na conversa com o agente e pedir a próxima ficha.</p>`;
}
export function ligarFechamento(){
  const d=dadosFechamento();
  document.getElementById("copiarResumo").onclick=async () => toast(await copiarTexto(textoFechamento(d)) ? "Resumo copiado. Cole na conversa com o agente." : "Não foi possível copiar");
  document.getElementById("compartilharEtapa").onclick=() => abrirCompartilhar({ nome:`treino-etapa-${d.etapa}.png`, temRec:d.evol.length>0, temVol:false,
    monta: op => ({ letra:LETRAS[0], cab:`Treino · etapa ${d.etapa}`, titulo:[`Etapa ${d.etapa}`, d.feitos>=d.total?"concluída":"encerrada"],
      sub:`${d.feitos} treinos em ${d.semanas} ${pl(d.semanas,"semana","semanas")}`,
      nums:[[fmtNum(d.porSemana),"por semana"],[fmtHoras(d.minutos),"treinando"],[d.recordes, pl(d.recordes,"recorde","recordes")]],
      recs: op.rec ? d.evol.slice(0,3).map(e => `${[e.k, e.g].filter(Boolean).join(" ")} ${fmtNum(e.de)} → ${fmtNum(e.ate)} kg`) : [], url:urlApp() }) });
  document.getElementById("treinarMesmo").onclick=() => { E.fechoDispensado=true; save(); render(); scrollTo(0,0); };
  const v=document.getElementById("view"); if(v) contar(v);
  if(!E.fechoVisto){ E.fechoVisto=true; save(); if(movimentoOk()) setTimeout(confete, 500); }
}
