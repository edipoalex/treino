import { marcar } from "./movimento.js";
import { E, S, save } from "./estado.js";
import { render } from "./navegacao.js";
import { rerender } from "./telas/sessao.js";
import { fmtSeg, toast } from "./ui.js";
import { $, esc } from "./util.js";

/* ---------- Descanso: no botão da série ou em tela cheia (Ajustes › Descanso) ---------- */
// guardado no aparelho para o cronômetro continuar se o app for recarregado ou fechado no meio do descanso
export let tInt=null, actx=null;
export function prepararSom(){ try{ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch(e){} }
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
  if(r<=0){ navigator.vibrate?.([200,100,200]); beep(); marcar("fimDescanso",{k:T.k}); pararDescanso(); toast("Descanso encerrado. Próxima série!"); return; }
  const txt=fmtSeg(r), fr=Math.max(0,Math.min(1,r/T.total));
  const tt=$("#tTxt"); if(tt){ tt.textContent=txt; $("#tFill").style.transform=`scaleX(${fr})`; tt.closest(".t-btn")?.classList.toggle("low", r<=10); }
  const dt=$("#dTxt"); if(dt){ dt.textContent=txt; const arc=$("#dArc"), C=2*Math.PI*104; arc.setAttribute("stroke-dashoffset",(C*(1-fr)).toFixed(1)); arc.setAttribute("stroke", r<=10?"var(--warn)":"var(--c)"); }
}
export function abrirTelaDescanso(){
  $("#descanso")?.remove(); const T=S.timer, a=E.atual; if(!T || !a) return;
  const C=2*Math.PI*104, d=document.createElement("div"); d.className=`descanso L-${a.letra}`; d.id="descanso";
  d.innerHTML=`<p class="meta" style="align-self:flex-start;font-size:18px">Descanso</p>
    <svg class="anel" viewBox="0 0 240 240" role="timer" aria-label="Tempo de descanso"><circle cx="120" cy="120" r="104" fill="none" stroke="var(--line)" stroke-width="16"/>
    <circle id="dArc" cx="120" cy="120" r="104" fill="none" stroke="var(--c)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="0" transform="rotate(-90 120 120)"/>
    <text id="dTxt" x="120" y="138" text-anchor="middle" font-size="64">${fmtSeg((T.fim-Date.now())/1000)}</text></svg>
    ${T.prox?`<p class="meta">Próxima</p><p class="prox">${esc(T.prox)}</p>`:""}
    <div class="acoes"><div class="linha2" style="margin:0"><button class="btn" data-d="-15">−15 s</button><button class="btn" data-d="15">+15 s</button></div>
    <button class="btn" data-d="pular">Pular descanso</button></div>`;
  d.onclick=e=>{ const b=e.target.closest("[data-d]"); if(!b) return; if(b.dataset.d==="pular") return pararDescanso(); maisTempo(+b.dataset.d); };
  document.body.appendChild(d); tick();
}
export function retomarTimer(){
  const T=S.timer; if(!T) return;
  if(!E.atual || !(T.fim>Date.now())){ delete S.timer; save(); return; }
  clearInterval(tInt); tInt=setInterval(tick,250);
  if(S.pref.descanso==="tela") abrirTelaDescanso();
  render();
}
