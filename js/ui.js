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
export const ico = {
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  trofeu:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/></svg>',
  clock:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>'
};
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
}
export const fecharFolha = () => $("#folha")?.remove();
/* Aviso no topo com "Desfazer" (5 s) */
export let desfazerT;
export function desfazer(msg, acao){
  clearTimeout(desfazerT); $("#desfazer")?.remove();
  const d=document.createElement("div"); d.className="desfazer"; d.id="desfazer"; d.setAttribute("role","status");
  d.innerHTML=`<span>${esc(msg)}</span><button>Desfazer</button>`;
  d.querySelector("button").onclick=()=>{ d.remove(); acao(); };
  document.body.appendChild(d); desfazerT=setTimeout(()=>d.remove(),5000);
}
