import { E } from "./estado.js";
import { viewFicha } from "./telas/ficha.js";
import { viewGuia } from "./telas/guia.js";
import { viewHistorico } from "./telas/historico.js";
import { viewHoje } from "./telas/hoje.js";
import { header } from "./ui.js";
import { $ } from "./util.js";

/* Estado da navegação entre abas (compartilhado pelas telas) */
export const nav = { tab:"hoje", fichaFase:null, fichaLetra:null };
export function render(){
  header();
  document.body.classList.toggle("em-sessao", nav.tab==="hoje" && !!E.atual);
  $("#view").onclick=null; $("#view").onchange=null;
  document.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-current", b.dataset.tab===nav.tab ? "page" : "false"));
  ({hoje:viewHoje, ficha:viewFicha, historico:viewHistorico, guia:viewGuia})[nav.tab]();
}
/* ---------- Navegação ---------- */

export function iniciarNavegacao(){
  document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{ nav.tab=b.dataset.tab; if(nav.tab!=="ficha"){nav.fichaFase=null;nav.fichaLetra=null;} render(); scrollTo(0,0); });
}
