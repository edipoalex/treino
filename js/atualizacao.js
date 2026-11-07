import { FICHA } from "./estado.js";
import { $ } from "./util.js";
import { APP_DATA, APP_VERSAO } from "./versao.js";

/* ---------- Versão do app ---------- */
export function textoVersao(){
  const d=APP_DATA.split("-").reverse().join("/");
  return `App v${APP_VERSAO} · ${d} · Ficha etapa ${FICHA.etapa}${FICHA.versao?` (rev. ${FICHA.versao})`:""}`;
}
export let ultimaChecagem=0;
export async function checarVersao(){
  if(location.protocol==="file:" || Date.now()-ultimaChecagem<60000) return;
  ultimaChecagem=Date.now();
  try{
    const r=await fetch(new URL("./versao.js?v="+Date.now(), import.meta.url),{cache:"no-store"});
    const m=(await r.text()).match(/APP_VERSAO = "([^"]+)"/);
    if(m && m[1]!==APP_VERSAO) $("#novaVersao").hidden=false;
  }catch(e){}
}

export function iniciarAtualizacao(){
  $("#atualizarApp").onclick=()=>{ location.replace(location.pathname+"?v="+Date.now()); };
  document.addEventListener("visibilitychange",()=>{ if(!document.hidden) checarVersao(); });
}
