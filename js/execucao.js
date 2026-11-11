/* Cronômetro de execução: partes com tempo dentro do exercício (prancha, por lado, pausas do rest-pause,
   intervalos do HIIT) e o cronômetro livre, que conta para cima.
   O estado fica em S.exec / S.livre (salvos no aparelho), e a etapa atual é calculada pelo tempo
   decorrido: recarregar o app no meio não perde a contagem. */
import { E, S, save } from "./estado.js";
import { actx, prepararSom } from "./descanso.js";
import { tempoDe } from "./series.js";
import { alternarFeito, registrarSerie, rerender, treinoAtual } from "./telas/sessao.js";
import { icone } from "./icones.js";
import { fmtSeg } from "./ui.js";
import { $, esc } from "./util.js";

const PREP = 3;               // segundos para se posicionar
let tInt = null, ultimoSeg = null, ultimaEtapa = null;

function bip(freq=880, dur=.12){
  try{ if(!actx) return; const o=actx.createOscillator(), g=actx.createGain(); o.frequency.value=freq; o.connect(g); g.connect(actx.destination);
    g.gain.setValueAtTime(.22, actx.currentTime); g.gain.exponentialRampToValueAtTime(.001, actx.currentTime+dur); o.start(); o.stop(actx.currentTime+dur); }catch(e){}
}
const vibra = p => { try{ navigator.vibrate?.(p); }catch(e){} };
const telaCheia = X => X.tipo==="intervalo" || S.pref.descanso==="tela";

/* Monta as etapas de cada tipo */
function etapasDe(it, tipoParte){
  const t = tempoDe(it); if(!t) return null;
  if(tipoParte!=null) return [{ seg:tipoParte, rot:"Pausa", tipo:"pausa" }];
  const prep = { seg:PREP, rot:"Prepare", tipo:"prep" };
  if(t.tipo==="segurar") return [prep, ...t.etapas];
  if(t.tipo==="intervalo"){
    const et=[prep];
    for(let r=1; r<=t.rodadas; r++){ et.push({ seg:t.a.seg, rot:t.a.rot, tipo:"exec", r }); et.push({ seg:t.b.seg, rot:t.b.rot, tipo:"leve", r }); }
    if(t.desaquecer) et.push({ seg:t.desaquecer, rot:"Desaquecer", tipo:"leve" });
    return et;
  }
  return null;
}
export function iniciarExec(i, { pausa=null } = {}){
  const a=E.atual; if(!a) return;
  const it=treinoAtual(a).itens[i], t=tempoDe(it), etapas=etapasDe(it, pausa); if(!etapas) return;
  prepararSom();
  S.exec = { k:i, inicio:Date.now(), etapas, tipo: pausa!=null ? "pausa" : t.tipo, rodadas: t.rodadas||0 };
  a.ativo=i; save(); ultimoSeg=null; ultimaEtapa=null;
  clearInterval(tInt); tInt=setInterval(tickExec, 200);
  if(telaCheia(S.exec)) abrirTelaExec();
  rerender(); tickExec();
}
/* Etapa atual pelo tempo decorrido */
function agora(X){
  let dec=(Date.now()-X.inicio)/1000;
  for(let j=0; j<X.etapas.length; j++){ const e=X.etapas[j]; if(dec<e.seg) return { j, e, resta:e.seg-dec }; dec-=e.seg; }
  return null;
}
export function tickExec(){
  const X=S.exec; if(!X) return;
  const s=agora(X);
  if(!s){ bip(1046,.35); vibra([200,80,200]); return finalizar(); }
  const seg=Math.ceil(s.resta);
  if(s.j!==ultimaEtapa){ if(ultimaEtapa!=null){ bip(s.e.tipo==="troca"?520:1046,.25); vibra(s.e.tipo==="exec"?120:60); } ultimaEtapa=s.j; }
  if(seg!==ultimoSeg){ ultimoSeg=seg; if(seg<=3 && seg>0 && s.e.tipo!=="leve") bip(s.e.tipo==="prep"?660:880); }
  const txt = s.e.tipo==="prep" ? `Prepare… ${seg}` : `${s.e.rot} ${fmtSeg(s.resta)}`;
  const fr = s.e.tipo==="prep" ? 0 : s.resta/s.e.seg;
  const b=$("#eBtn");
  if(b){ $("#eTxt").textContent=txt; $("#eFill").style.transform=`scaleX(${fr})`;
    b.classList.toggle("prepara", s.e.tipo==="prep"); b.classList.toggle("troca", s.e.tipo==="troca"); b.classList.toggle("low", s.e.tipo!=="prep" && s.e.tipo!=="leve" && s.resta<=3); }
  const d=$("#execTela");
  if(d){ const C=2*Math.PI*104, cor = s.e.tipo==="troca" ? "var(--warn)" : s.e.tipo==="leve" ? "var(--ok)" : s.e.tipo==="prep" ? "var(--muted)" : "var(--c)";
    $("#xF",d).textContent = s.e.tipo==="prep" ? "PREPARE" : s.e.rot.toUpperCase(); $("#xF",d).style.color = cor;
    $("#xT",d).textContent = fmtSeg(s.resta); $("#xA",d).setAttribute("stroke-dashoffset",(C*(1-(s.e.tipo==="prep"?s.resta/s.e.seg:fr))).toFixed(1)); $("#xA",d).setAttribute("stroke", cor);
    $("#xR",d).textContent = s.e.r ? `Rodada ${s.e.r} de ${X.rodadas}` : s.e.rot==="Desaquecer" ? "Desaquecimento" : ""; }
}
/* Fim natural: marca a série, avança a parte do rest-pause ou marca o item (HIIT) */
function finalizar(){
  const X=S.exec, a=E.atual; clearInterval(tInt); tInt=null; delete S.exec; $("#execTela")?.remove(); save();
  if(!X || !a) return rerender();
  if(X.tipo==="segurar") return registrarSerie(X.k);
  if(X.tipo==="pausa"){ (a.rp ??= {})[X.k]=(a.rp[X.k]||0)+1; save(); return rerender(); }
  if(X.tipo==="intervalo"){ if(!a.feitos.includes(X.k)) return alternarFeito(X.k); return rerender(); }
  rerender();
}
/* Tocar no cronômetro: na pausa do rest-pause, pula a pausa; nos outros, para sem marcar */
export function pararExec(){
  const X=S.exec; if(!X) return;
  if(X.tipo==="pausa") return finalizar();
  clearInterval(tInt); tInt=null; delete S.exec; $("#execTela")?.remove(); save(); rerender();
}
export function retomarExec(){
  const X=S.exec; if(!X) return;
  if(!E.atual || !agora(X)){ delete S.exec; save(); return; }  // app fechado até depois do fim: não marca sozinho
  clearInterval(tInt); tInt=setInterval(tickExec, 200);
  if(telaCheia(X)) abrirTelaExec();
}
function abrirTelaExec(){
  $("#execTela")?.remove(); const a=E.atual; if(!a) return;
  const C=2*Math.PI*104, d=document.createElement("div"); d.className=`descanso L-${a.letra}`; d.id="execTela";
  d.innerHTML=`<p class="fase-exec" id="xF">PREPARE</p>
    <svg class="anel" viewBox="0 0 240 240" role="timer" aria-label="Cronômetro do exercício"><circle cx="120" cy="120" r="104" fill="none" stroke="var(--line)" stroke-width="16"/>
    <circle id="xA" cx="120" cy="120" r="104" fill="none" stroke="var(--c)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="0" transform="rotate(-90 120 120)"/>
    <text id="xT" x="120" y="138" text-anchor="middle" font-size="64">0:03</text></svg>
    <p class="meta" id="xR"></p>
    <div class="acoes"><button class="btn" data-x="parar">${S.exec?.tipo==="pausa"?"Pular pausa":"Parar"}</button></div>`;
  d.onclick=e=>{ if(e.target.closest("[data-x]")) pararExec(); };
  document.body.appendChild(d); tickExec();
}

/* ---------- O que aparece no lugar do botão da série ---------- */
const btnRodando = () => `<button class="btn primary cor t-btn" id="eBtn" data-exec-parar aria-label="${S.exec?.tipo==="pausa"?"Pular a pausa":"Parar o cronômetro"}"><span class="t-fill" id="eFill"></span>${icone("timer")}<span id="eTxt">…</span></button>`;
export function acaoTempo(it, i, a, cls){
  const t=tempoDe(it); if(!t) return "";
  const chipsPartes = () => { const k=Math.min((a.rp||{})[i]||0, t.partes.length-1);
    return `<div class="microp" aria-label="Partes da série">${t.partes.map((x,j)=>`<span class="${j<k?"feito":j===k?"agora":""}">${x.pausa?`${x.pausa} s`:esc(x.rot)}</span>`).join("")}</div>`; };
  if(S.exec?.k===i) return (t.tipo==="partes" ? chipsPartes() : "") + (telaCheia(S.exec) ? `<p class="meta" style="text-align:center;margin:12px 0">Cronômetro em andamento…</p>` : btnRodando());
  if(!it.series){
    if(t.tipo!=="intervalo") return "";
    const ok=a.feitos.includes(i);
    return `<div class="linha2"><button class="btn ${ok?"":cls}" data-exec="${i}">${icone("play")} ${esc(`HIIT ${t.rodadas}×`)}</button><button class="btn" data-feito="${i}">${ok?`${icone("check")} Feito`:"Marcar feito"}</button></div>`;
  }
  const f=(a.series||{})[i]||0; if(f>=it.series) return "";
  if(t.tipo==="segurar") return `<button class="btn ${cls} t-btn exec-btn" data-exec="${i}">${icone("play")}<span>${esc(t.botao)}</span></button>
    <button class="link-btn" data-serie="${i}">Marcar a série sem cronômetro</button>`;
  if(t.tipo==="partes"){
    const k=Math.min((a.rp||{})[i]||0, t.partes.length-1), p=t.partes[k], ultima=k===t.partes.length-1, chips=chipsPartes();
    if(p.pausa) return chips + `<button class="btn ${cls}" data-exec-pausa="${i}:${p.pausa}">${icone("play")} Pausa ${p.pausa} s</button>`;
    return chips + (ultima ? `<button class="btn ${cls} serie-btn" data-serie="${i}">${icone("check")}<span>Série ${f+1} de ${it.series} feita</span></button>`
      : `<button class="btn ${cls} exec-btn" data-rp="${i}">${icone("check")}<span>${p.rot==="falha"?"Cheguei na falha":`Fiz ${esc(p.rot)}`}</span></button>`);
  }
  return "";
}
/* "Cheguei na falha" / "Fiz 1x30": avança a parte; se a próxima é pausa, já começa a contar */
export function avancarParte(i){
  const a=E.atual, it=treinoAtual(a).itens[i], t=tempoDe(it); if(t?.tipo!=="partes") return;
  const k=((a.rp ??= {})[i]||0)+1; a.rp[i]=k; save();
  const p=t.partes[k]; if(p?.pausa) return iniciarExec(i, { pausa:p.pausa });
  rerender();
}

/* Ao iniciar, concluir ou cancelar um treino os cronômetros de execução e livre recomeçam do zero */
export function limparCronometros(){ clearInterval(tInt); tInt=null; delete S.exec; delete S.livre; $("#execTela")?.remove(); }

/* ---------- Cronômetro livre (conta para cima) ---------- */
let lvInt=null;
const livreSeg = L => (L.acum||0) + (L.ini ? (Date.now()-L.ini)/1000 : 0);
export const livreDe = i => S.livre?.k===i ? livreSeg(S.livre) : 0;
export function alternarLivre(i){
  if(S.livre?.k===i){ delete S.livre; } else S.livre = { k:i, ini:null, acum:0 };
  save(); rerender();
}
export function playLivre(){ const L=S.livre; if(!L) return; if(L.ini){ L.acum=livreSeg(L); L.ini=null; } else L.ini=Date.now(); save(); rerender(); }
export function zerarLivre(){ const L=S.livre; if(!L) return; L.ini=L.ini?Date.now():null; L.acum=0; save(); rerender(); }
function tickLivre(){ const el=$("#lvT"); if(!S.livre?.ini){ clearInterval(lvInt); lvInt=null; return; } if(el) el.textContent=fmtSeg(livreSeg(S.livre)); }
export function livreHtml(i){
  const L=S.livre; if(L?.k!==i) return "";
  if(L.ini && !lvInt) lvInt=setInterval(tickLivre, 250);
  return `<div class="livre"><b id="lvT">${fmtSeg(livreSeg(L))}</b>
    <button class="btn ${L.ini?"":"primary cor"}" data-livre-play>${L.ini?"Pausar":`${icone("play")} ${L.acum?"Continuar":"Iniciar"}`}</button>
    <button class="btn" data-livre-zerar aria-label="Zerar">${icone("rotate-ccw")}</button></div>`;
}
