import { marcar } from "./movimento.js";
import { E, S, save } from "./estado.js";
import { render } from "./navegacao.js";
import { rerender, treinoAtual } from "./telas/sessao.js";
import { cargaDaSerie, valorPlanejado, variaPorSerie, cargaPorSerie, cargaResumo, controlesCarga, grupoDaSerie, grupoIdx, passoCarga, trocarUnidade } from "./cargas.js";
import { rotSerie, seriesDe } from "./series.js";
import { consumirRepeticao, movimentoOk, segurarRepete } from "./movimento.js";
import { icone } from "./icones.js";
import { fmtSeg, toast } from "./ui.js";
import { $, esc } from "./util.js";
import { desbloquear, falar } from "./voz.js";
import { falaCarga } from "./inteligente.js";
import { dispensarSugestao, recordeSerie, recordeTxt, sugestaoHtml, usarSugestao } from "./dicas.js";
import { desenhoBicho, fecharBalao, fraseFimDescanso } from "./balao.js";

/* ---------- Descanso: no botão da série ou em tela cheia (Ajustes › Descanso) ---------- */
// guardado no aparelho para o cronômetro continuar se o app for recarregado ou fechado no meio do descanso
export let tInt=null, actx=null;
export function prepararSom(){ try{ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch(e){} desbloquear(); }
export function beep(){
  try{ if(!actx) return; [0,.25,.5].forEach(o=>{ const g=actx.createGain(), os=actx.createOscillator(); os.frequency.value=880;
    os.connect(g); g.connect(actx.destination); g.gain.setValueAtTime(.2,actx.currentTime+o); g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+o+.2);
    os.start(actx.currentTime+o); os.stop(actx.currentTime+o+.2); }); }catch(e){}
}
export function iniciarDescanso(k, seg, prox){
  S.timer={ k, fim:Date.now()+seg*1000, total:seg, prox:prox||"" }; save(); prepararSom();
  clearInterval(tInt); tInt=setInterval(tick,250);
  if(S.pref.descanso==="tela") abrirTelaDescanso();
  rerender(); tick();
}
export function maisTempo(seg){ const T=S.timer; if(!T) return; T.fim+=seg*1000; T.total=Math.max(T.total,(T.fim-Date.now())/1000); save(); tick(); }
export function pararDescanso(rend=true){
  clearInterval(tInt); tInt=null; const tinha=!!S.timer;
  if(tinha){ delete S.timer; save(); }
  $("#descanso")?.remove();
  if(rend && tinha) rerender();
}
export function tick(){
  const T=S.timer; if(!T) return;
  const r=(T.fim-Date.now())/1000;
  if(r<=0){ navigator.vibrate?.([200,100,200]); beep();
    // falas do treinador: uma frase curta no lugar do "VAI!" (a voz não fala as do Sem filtro)
    const fr=fraseFimDescanso(); falar(`${fr && fr.tom!=="bravo" ? fr.texto : "Vai!"} ${falaCarga(T.prox)}`, "descanso");
    marcar("fimDescanso",{k:T.k}); fimDescanso(T, fr); return; }
  const txt=fmtSeg(r), fr=Math.max(0,Math.min(1,r/T.total));
  const tt=$("#tTxt"); if(tt){ tt.textContent=txt; $("#tFill").style.transform=`scaleX(${fr})`; tt.closest(".t-btn")?.classList.toggle("low", r<=10); }
  const dt=$("#dTxt"); if(dt){ dt.textContent=txt; const arc=$("#dArc"), C=2*Math.PI*104; arc.setAttribute("stroke-dashoffset",(C*(1-fr)).toFixed(1)); arc.setAttribute("stroke", r<=10?"var(--warn)":"var(--c)"); }
}
/* Fim do descanso: o iPhone não vibra em apps da web e o som some no modo silencioso, então o aviso é visual.
   Tela cheia: "VAI!" na cor do treino por 1,5 s antes de fechar. Sempre: a tela pisca na cor do treino e um aviso
   desce no topo com a próxima série (aparece mesmo com o cartão fora da tela, no modo lista); tocar nele leva ao exercício.
   Com as falas do treinador ligadas (v1.41), o "VAI!" vira uma frase curta com o personagem (fr = { texto, tom }). */
function fimDescanso(T, fr=null){
  const a=E.atual, L=a ? `L-${esc(a.letra)}` : "", d=$("#descanso"), vai=esc(fr?.texto || "VAI!");
  fecharBalao();
  if(d && movimentoOk()){ clearInterval(tInt); tInt=null; delete S.timer; save();
    d.insertAdjacentHTML("beforeend", `<div class="tc-vai${fr?" com-frase":""}">${fr?desenhoBicho(fr.tom,96):""}<b>${vai}</b>${T.prox?`<span>${esc(T.prox)}</span>`:""}</div>`);
    setTimeout(()=>{ d.remove(); rerender(); }, fr ? 2200 : 1500); }
  else pararDescanso();
  document.querySelectorAll(".flash-fim, .aviso-fim").forEach(x=>x.remove());
  if(movimentoOk()){ const f=document.createElement("div"); f.className=`flash-fim ${L}`; document.body.appendChild(f); setTimeout(()=>f.remove(), 2400); }
  const av=document.createElement("button"); av.className=`aviso-fim ${L}${fr?" com-frase":""}`; av.setAttribute("role","alert");
  av.innerHTML=`${(fr && desenhoBicho(fr.tom,40)) || icone("dumbbell")}<span><b>${vai}</b>${T.prox?`<small>${esc(T.prox)}</small>`:""}</span>`;
  av.onclick=()=>{ av.remove(); document.querySelector(".item.ativo, .f-nome")?.scrollIntoView({ behavior:"smooth", block:"center" }); };
  document.body.appendChild(av); setTimeout(()=>av.remove(), 6000);
}
export function abrirTelaDescanso(){
  $("#descanso")?.remove(); const T=S.timer, a=E.atual; if(!T || !a) return;
  const C=2*Math.PI*104, d=document.createElement("div"); d.className=`descanso L-${a.letra}`; d.id="descanso";
  d.innerHTML=`<p class="auto-inicio tx-destaque meta">Descanso</p>
    <svg class="anel" viewBox="0 0 240 240" role="timer" aria-label="Tempo de descanso"><circle cx="120" cy="120" r="104" fill="none" stroke="var(--line)" stroke-width="16"/>
    <circle id="dArc" cx="120" cy="120" r="104" fill="none" stroke="var(--c)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="0" transform="rotate(-90 120 120)"/>
    <text id="dTxt" x="120" y="138" text-anchor="middle" font-size="64">${fmtSeg((T.fim-Date.now())/1000)}</text></svg>
    ${T.prox?`<p class="meta">Próxima</p><p class="prox" id="dProx">${esc(T.prox)}</p>`:""}
    <div id="dCarga" class="largura-max">${cargaProxima()}</div>
    <div class="acoes"><div class="m-0 linha2"><button class="btn" data-d="-15">−15 s</button><button class="btn" data-d="15">+15 s</button></div>
    <button class="btn" data-d="pular">Pular descanso</button></div>`;
  d.onclick=e=>{
    const p=e.target.closest("[data-passo]"); if(p){ if(consumirRepeticao()) return; return ajustarProxima(p.dataset.passo); }
    const sg=e.target.closest("[data-sug]"); if(sg){ const [i,pi,...g]=sg.dataset.sug.split(":"); usarSugestao(treinoAtual(E.atual).itens[+i], +i, +pi, g.join(":")); return atualizarProxima(); }
    const sx=e.target.closest("[data-sug-x]"); if(sx){ dispensarSugestao(sx.dataset.sugX); return atualizarProxima(); }
    const u=e.target.closest("[data-uni]"); if(u){ const [i,pi,gi]=u.dataset.uni.split(":").map(Number); trocarUnidade(treinoAtual(E.atual).itens[i],pi,gi); return atualizarProxima(); }
    const b=e.target.closest("[data-d]"); if(!b) return; if(b.dataset.d==="pular") return pararDescanso(); maisTempo(+b.dataset.d); };
  segurarRepete(d, "[data-passo]", dado=>ajustarProxima(dado.passo));
  document.body.appendChild(d); tick();
}
/* Tela cheia: carga da próxima série do mesmo exercício, ajustável durante o descanso */
function proximaSerie(){
  const T=S.timer, a=E.atual; if(!T || !a) return null;
  const it=treinoAtual(a).itens[T.k], f=(a.series||{})[T.k]||0;
  return it && cargaPorSerie(it) && f<it.series ? { it, i:T.k, f } : null;
}
function cargaProxima(){
  const x=proximaSerie(); if(!x) return "";
  const g=grupoDaSerie(x.it,x.f);
  return `<div class="carga-linha"><span class="rotulo">Carga<small>${g||`série ${x.f+1}`}</small></span>${controlesCarga(x.it,x.i,0,grupoIdx(x.it,x.f),{ digitar:false, valor:valorPlanejado(x.it,x.i,x.f,E.atual) })}</div>
    ${recordeTxt(recordeSerie(x.it,x.i,x.f))}${sugestaoHtml(x.it,x.i,0,g)}`;
}
function atualizarProxima(){
  const x=proximaSerie(), T=S.timer; if(!x || !T) return;
  T.prox=`Série ${x.f+1} · ${rotSerie(seriesDe(x.it)[x.f])} · ${cargaDaSerie(x.it,x.i,x.f,E.atual)}`; save();
  const el=$("#dProx"); if(el) el.textContent=T.prox;
  const c=$("#dCarga"); if(c) c.innerHTML=cargaProxima();
}
function ajustarProxima(passo){
  const [i,pi,gi,dir]=passo.split(":").map(Number), a=E.atual; if(!a) return;
  const it=treinoAtual(a).itens[i], f=(a.series||{})[i]||0;
  passoCarga(it,pi,gi,dir, variaPorSerie(it) ? { i, j:f } : {}); atualizarProxima();
}
export function retomarTimer(){
  const T=S.timer; if(!T) return;
  if(!E.atual || !(T.fim>Date.now())){ delete S.timer; save(); return; }
  clearInterval(tInt); tInt=setInterval(tick,250);
  if(S.pref.descanso==="tela") abrirTelaDescanso();
  render();
}
