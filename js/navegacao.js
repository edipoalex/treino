import { entrada, trocarTela } from "./movimento.js";
import { atualizarMini } from "./minitreino.js";
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
  if(semFicha){ $("#brandTxt").textContent = "Treino"; document.title = "Treino"; document.body.classList.remove("em-sessao"); $("#view").onclick=null; atualizarMini(); return viewBoasVindas(render, sincronizar); }
  // treino minimizado (v1.59): a Hoje mostra o card e o treino vai para o mini-player
  document.body.classList.toggle("em-sessao", nav.tab==="hoje" && !!E.atual && !E.atual.min);
  document.body.dataset.tab = nav.tab;
  $("#view").onclick=null; $("#view").onchange=null; $("#view").onpointerdown=null;
  marcarAba(nav.tab);
  ({hoje:viewHoje, ficha:viewFicha, progresso:viewProgresso, historico:viewHistorico, guia:viewGuia})[nav.tab]();
  // cor do treino em uso (sessão ou card da Hoje): a aurora do estilo Vidro acompanha (v1.52)
  const L = E.atual?.letra || document.querySelector("#cardHoje")?.className.match(/\bL-([A-Z])\b/)?.[1];
  if(L) document.documentElement.dataset.letra = L;
  atualizarMini();
}
/* ---------- Navegação ---------- */

const ordem=["hoje","ficha","progresso","historico","guia"];
/* aba atual: aria-current e a posição (--i) da pílula do estilo Vidro */
function marcarAba(tab){
  document.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-current", b.dataset.tab===tab ? "page" : "false"));
  document.querySelector(".tabs")?.style.setProperty("--i", Math.max(0, ordem.indexOf(tab)));
}
/* Toque na aba (v1.58): a resposta começa quando o dedo encosta (pointerdown): a pílula anda e o ícone dá o pulo de
   mola, ~100 ms antes do clique. Como a pílula muda a largura das abas embaixo do dedo, a troca acontece no pointerup
   da aba em que o dedo encostou (captura do ponteiro), não no clique, que poderia cair na aba vizinha. Se o dedo
   arrastar para fora (> 24 px) ou o toque for cancelado, a pílula volta para a aba atual. Teclado e leitor de tela
   continuam pelo clique. */
function pulo(el){ el.classList.remove("pulo"); void el.offsetWidth; el.classList.add("pulo"); }
let tocada = null, volta = 0, ini = null, ignorar = { b:null, t:0 };   // ignorar: o clique que o próprio toque gera depois do pointerup
function anteciparAba(b){
  if(tocada===b) return;
  tocada = b; pulo(b);
  if(b.dataset.tab!==nav.tab){ marcarAba(b.dataset.tab); pulo(document.querySelector(".tabs")); }
  clearTimeout(volta); volta = setTimeout(desfazerToque, 900);
}
function desfazerToque(){ tocada = null; ini = null; marcarAba(nav.tab); }
function irPara(para){
  clearTimeout(volta); tocada = null;
  const de = nav.tab;
  if(de===para){ if(para==="progresso" && nav.progEx){ nav.progEx=null; render(); } scrollTo({top:0, behavior:"smooth"}); return; }
  trocarTela(()=>{ nav.tab=para; if(para!=="ficha"){nav.fichaFase=null;nav.fichaLetra=null;} if(para!=="progresso") nav.progEx=null; render(); scrollTo(0,0); entrada(para); },
    ordem.indexOf(para)>ordem.indexOf(de) ? "frente" : "tras");
}
export function iniciarNavegacao(){
  document.querySelectorAll(".tab").forEach(b=>{
    b.onpointerdown = e => { if(e.button!==0) return; try{ b.setPointerCapture(e.pointerId); }catch(_){} ini = { b, x:e.clientX, y:e.clientY }; anteciparAba(b); };
    b.onpointerup = e => {
      if(ini?.b!==b) return; const longe = Math.hypot(e.clientX-ini.x, e.clientY-ini.y) > 24; ini = null;
      if(longe) return desfazerToque();
      ignorar = { b, t:Date.now() }; irPara(b.dataset.tab);
    };
    b.onpointercancel = () => { if(ini?.b===b) desfazerToque(); };
    b.onclick = () => { if(ignorar.b===b && Date.now()-ignorar.t < 700) return; anteciparAba(b); irPara(b.dataset.tab); };
  });
}
