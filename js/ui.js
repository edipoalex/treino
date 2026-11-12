import { anilhaSVG } from "./anilha.js";
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
/* Anilha do treino: 3D nas grandes ("md" ou "d3"), de frente nas pequenas (js/anilha.js) */
export const plate = (l, cls="") => { const d3=/\b(md|d3)\b/.test(cls);
  return `<div class="plate anilha ${d3?"d3":""} L-${esc(l)} ${cls}" aria-hidden="true">${anilhaSVG(l, { d3, detalhada: /\bmd\b/.test(cls), texto: !/\bsemtexto\b/.test(cls) })}</div>`; };
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
  const f=document.createElement("div"); f.className=`folha ${E?.atual?.letra?`L-${esc(E.atual.letra)}`:""}`; f.id="folha"; f.innerHTML=`<div class="corpo" role="dialog" aria-modal="true">${html}</div>`;
  f.addEventListener("click", e=>{ if(e.target===f || e.target.closest("[data-fechar]")) fecharFolha(); });
  // com Ajustes aberto (dialog modal), a folha precisa ficar dentro dele para aparecer por cima
  const dl=document.getElementById("settings"); (dl && dl.open ? dl : document.body).appendChild(f); depois?.(f);
  arrastarParaFechar(f, fecharFolha);
}
/* Confirmação no visual do app (no lugar do confirm() do navegador). Devolve uma Promise<boolean>.
   html: conteúdo extra (resumo); perigo: o botão de confirmar em laranja, para apagar */
export function confirmar({ titulo, texto="", html="", sim="Confirmar", nao="Cancelar", perigo=false }){
  return new Promise(resolve=>{
    let respondeu=false; const fim = v => { if(respondeu) return; respondeu=true; fecharFolha(); resolve(v); };
    folha(`<h3>${esc(titulo)}</h3>${texto?`<p class="meta">${esc(texto)}</p>`:""}${html}
      <button class="btn ${perigo?"grande perigo":"primary cor grande"}" data-sim>${perigo?icone("x"):icone("check")} ${esc(sim)}</button>
      <button class="btn" data-nao>${esc(nao)}</button>`,
      f=>{ f.querySelector("[data-sim]").onclick=()=>fim(true); f.querySelector("[data-nao]").onclick=()=>fim(false);
        // fechar tocando fora ou arrastando para baixo = não
        new MutationObserver((_,o)=>{ if(!f.id){ o.disconnect(); if(!respondeu){ respondeu=true; resolve(false); } } }).observe(f,{ attributes:true, attributeFilter:["id"] }); });
  });
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
