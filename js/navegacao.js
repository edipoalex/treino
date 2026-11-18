import { entrada, trocarTela } from "./movimento.js";
import { E, precisaFicha } from "./estado.js";
import { viewBoasVindas } from "./telas/boas-vindas.js";
import { sincronizar } from "./sync.js";
import { viewFicha } from "./telas/ficha.js";
import { viewGuia } from "./telas/guia.js";
import { viewHistorico } from "./telas/historico.js";
import { viewHoje } from "./telas/hoje.js";
import { viewProgresso } from "./telas/progresso.js";
import { header } from "./ui.js";
import { $ } from "./util.js";

/* Estado da navegação entre abas (compartilhado pelas telas) */
export const nav = { tab:"hoje", fichaFase:null, fichaLetra:null, progEx:null };
export function render(){
  header();
  // sem ficha para mostrar (aparelho novo ou perfil da planilha sem ficha ainda): boas-vindas, sem as abas
  const semFicha = precisaFicha();
  document.body.classList.toggle("sem-ficha", semFicha);
  if(semFicha){ $("#brandTxt").textContent = "Treino"; document.title = "Treino"; document.body.classList.remove("em-sessao"); $("#view").onclick=null; return viewBoasVindas(render, sincronizar); }
  document.body.classList.toggle("em-sessao", nav.tab==="hoje" && !!E.atual);
  document.body.dataset.tab = nav.tab;
  $("#view").onclick=null; $("#view").onchange=null; $("#view").onpointerdown=null;
  document.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-current", b.dataset.tab===nav.tab ? "page" : "false"));
  ({hoje:viewHoje, ficha:viewFicha, progresso:viewProgresso, historico:viewHistorico, guia:viewGuia})[nav.tab]();
}
/* ---------- Navegação ---------- */

export function iniciarNavegacao(){
  const ordem=["hoje","ficha","progresso","historico","guia"];
  document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
    const de=nav.tab, para=b.dataset.tab;
    if(de===para){ if(para==="progresso" && nav.progEx){ nav.progEx=null; render(); } scrollTo({top:0, behavior:"smooth"}); return; }
    trocarTela(()=>{ nav.tab=para; if(para!=="ficha"){nav.fichaFase=null;nav.fichaLetra=null;} if(para!=="progresso") nav.progEx=null; render(); scrollTo(0,0); entrada(para); },
      ordem.indexOf(para)>ordem.indexOf(de) ? "frente" : "tras");
  });
}
