import { arrastarParaFechar, movimentoOk } from "./movimento.js";
import { icone } from "./icones.js";
import { E, FICHA, S } from "./estado.js";
import { faseAtual, feitosEtapa, porVoltas, semanaAtual, totalTreinos, voltaAtual } from "./progresso.js";
import { $, esc } from "./util.js";

/* ---------- Tema ---------- */
export function applyTheme(){
  const r=document.documentElement;
  if(S.theme==="auto") r.removeAttribute("data-theme"); else r.setAttribute("data-theme",S.theme);
  document.querySelectorAll("[data-theme-opt]").forEach(b=>b.setAttribute("aria-pressed", String(b.dataset.themeOpt===S.theme)));
  const dark = S.theme==="dark" || (S.theme==="auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach(m=>m.content = dark ? "#12161B" : "#E8EBEE");
}
/* ---------- UI helpers ---------- */
export const plate = (l, cls="", sub="") => `<div class="plate L-${esc(l)} ${cls}" aria-hidden="true"><b>${esc(l)}</b>${sub?`<i>${esc(sub)}</i>`:""}</div>`;
export let toastT;
export function toast(msg){ const t=$("#toast"); const dl=document.getElementById("settings"); const host=dl&&dl.open?dl:document.body; if(t.parentNode!==host) host.appendChild(t); t.textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2600); }
export const ico = { check:icone("check"), trofeu:icone("trophy"), clock:icone("clock") };
export function fmtSeg(s){ s=Math.max(0,Math.ceil(s)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
export function fmtMin(m){ return `${Math.round(m)} min`; }
export function header(){
  $("#brandTxt").textContent = `Etapa ${FICHA.etapa}`;
  if(porVoltas()){
    const n=Math.min(feitosEtapa()+1, totalTreinos());
    $("#weekLbl").textContent = `treino ${n}/${totalTreinos()} · volta ${E.atual?.volta ?? voltaAtual()} · fase ${E.atual?.fase ?? faseAtual()}`;
  } else {
    const sem = semanaAtual();
    $("#weekLbl").textContent = sem>FICHA.semanas ? `semana ${sem} de ${FICHA.semanas}` : `semana ${sem} de ${FICHA.semanas}, fase ${faseAtual()}`;
  }
}
/* ---------- Tela sempre ligada durante o treino ---------- */
export let wakeLock=null;
export async function manterTela(on){
  try{
    if(on && "wakeLock" in navigator && !wakeLock && document.visibilityState==="visible"){ wakeLock=await navigator.wakeLock.request("screen"); wakeLock.addEventListener?.("release",()=>{ wakeLock=null; }); }
    if(!on && wakeLock){ await wakeLock.release(); wakeLock=null; }
  }catch(e){ wakeLock=null; }
}
/* ---------- Folhas: menus, confirmações, "Como fazer" ---------- */
export function folha(html, depois){
  fecharFolha();
  const f=document.createElement("div"); f.className="folha"; f.id="folha"; f.innerHTML=`<div class="corpo" role="dialog" aria-modal="true">${html}</div>`;
  f.addEventListener("click", e=>{ if(e.target===f || e.target.closest("[data-fechar]")) fecharFolha(); });
  document.body.appendChild(f); depois?.(f);
  arrastarParaFechar(f, fecharFolha);
}
/* Fecha descendo; o id sai na hora, para uma folha nova poder abrir enquanto a antiga ainda desce */
export function fecharFolha(){
  const f=$("#folha"); if(!f) return;
  f.removeAttribute("id");
  if(!movimentoOk()){ f.remove(); return; }
  f.classList.add("saindo"); setTimeout(()=>f.remove(), 220);
}
/* Aviso no topo com "Desfazer" (5 s) */
export let desfazerT;
export function desfazer(msg, acao){
  clearTimeout(desfazerT); $("#desfazer")?.remove();
  const d=document.createElement("div"); d.className="desfazer"; d.id="desfazer"; d.setAttribute("role","status");
  d.innerHTML=`<span>${esc(msg)}</span><button>Desfazer</button>`;
  d.querySelector("button").onclick=()=>{ d.remove(); acao(); };
  document.body.appendChild(d); desfazerT=setTimeout(()=>d.remove(),5000);
}
