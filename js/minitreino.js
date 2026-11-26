/* Treino minimizado (v1.59): durante o treino, o botão ⌄ encolhe a tela do treino até um mini-player acima da
   barra de abas. O treino continua (descanso, cronômetros, alertas) enquanto o usuário usa o resto do app; tocar no
   mini-player expande de volta para o treino. O estado fica em E.atual.min (sobrevive a recarregar o app).
   Concluir e cancelar continuam só dentro do treino. */
import { E, S, save } from "./estado.js";
import { nav, render } from "./navegacao.js";
import { minDesde, treinoAtual } from "./telas/sessao.js";
import { pararDescanso } from "./descanso.js";
import { execResumo } from "./execucao.js";
import { movimentoOk, recente } from "./movimento.js";
import { icone } from "./icones.js";
import { esc } from "./util.js";

let el = null, tInt = 0, ultimo = "";
const mmss = s => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; };

/* a tela do treino se recorta até o retângulo do mini-player (ou cresce a partir dele): uma camada com o fundo do
   app cobre a tela e anima o clip-path; a tela de baixo já é a de destino. */
function recorte(encolher){
  if(!movimentoOk() || !el) return;
  const r = el.getBoundingClientRect(); if(!r.width) return;
  const mini = `inset(${r.top}px ${innerWidth-r.right}px ${innerHeight-r.bottom}px ${r.left}px round 22px)`, cheio = "inset(0px 0px 0px 0px round 0px)";
  const c = document.createElement("div"); c.className = "mt-recorte"; c.setAttribute("aria-hidden", "true");
  document.body.appendChild(c);
  c.animate([{ clipPath: encolher ? cheio : mini, opacity: 1 }, { clipPath: encolher ? mini : cheio, opacity: encolher ? .2 : 1 }],
    { duration: encolher ? 420 : 380, easing: "cubic-bezier(.32,.72,0,1)" }).finished.finally(() => c.remove());
}
export function minimizarTreino(){
  if(!E.atual) return;
  E.atual.min = true; save(); render(); scrollTo(0, 0);
  atualizarMini(); recorte(true);
  el?.animate([{ transform: "scale(.94)", opacity: .3 }, { transform: "none", opacity: 1 }], { duration: movimentoOk() ? 460 : 0, easing: "cubic-bezier(.34,1.4,.55,1)" });
}
export function expandirTreino(){
  if(!E.atual) return;
  atualizarMini(); recorte(false);
  E.atual.min = false; nav.tab = "hoje"; save(); render(); scrollTo(0, 0);
}

/* Conteúdo do mini-player: progresso, exercício e série; descanso ou cronômetro ao vivo; aviso de fim do descanso */
function conteudo(){
  const a = E.atual, t = treinoAtual(a), n = t.itens.length, feitos = a.feitos.length;
  const i = Number.isInteger(a.ativo) ? a.ativo : 0, it = t.itens[i] || t.itens[0], f = (a.series||{})[i] || 0;
  const C = 2*Math.PI*16, anel = `<span class="mt-anel" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" class="tr"/><circle cx="20" cy="20" r="16" class="v" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${(C*(1-feitos/n)).toFixed(1)}"/></svg><b>${feitos}/${n}</b></span>`;
  const T = S.timer, X = execResumo(), fim = recente("fimDescanso", 6000);
  if(T && T.fim > Date.now()){
    const r = (T.fim-Date.now())/1000;
    return { cls: `mt-descanso${r<=3?" mt-low":""}`, fill: Math.max(0, Math.min(1, r/T.total)), rot: `Descanso ${mmss(r)}`,
      html: `${anel}<span class="mt-txt"><b>Descanso <span class="mt-t">${mmss(r)}</span></b><small>A seguir: ${esc(T.prox || it.nome)}</small></span>
        <span class="mt-bt" data-mt-pular role="button" aria-label="Pular o descanso">${icone("skip-forward")}</span>` };
  }
  if(X){
    return { cls: "mt-descanso mt-exec", fill: X.total ? X.resta/X.total : 0, rot: `${X.titulo} ${mmss(X.resta)}`,
      html: `${anel}<span class="mt-txt"><b>${esc(X.titulo)} <span class="mt-t">${mmss(X.resta)}</span></b><small>${X.pausado ? "Pausado" : esc(X.fase || "")} · ${esc(t.itens[X.k]?.nome || "")}</small></span>
        <span class="mt-bt" aria-hidden="true">${icone("chevron-up")}</span>` };
  }
  if(fim){
    return { cls: "mt-vai", rot: "Hora da próxima série",
      html: `${anel}<span class="mt-txt"><b>Hora da série ${f+1}!</b><small>${esc(it.nome)} · toque para voltar</small></span><span class="mt-bt" aria-hidden="true">${icone("chevron-up")}</span>` };
  }
  const sub = it.series ? (f < it.series ? `Série ${f+1} de ${it.series}` : "Exercício concluído") : `${it.bloco} min`;
  return { cls: "", rot: `Treino ${a.letra}: ${it.nome}`,
    html: `${anel}<span class="mt-txt"><b>${esc(it.nome)}</b><small>Treino ${esc(a.letra)} · ${sub} · ${minDesde(a.inicio)} min</small></span><span class="mt-bt" aria-hidden="true">${icone("chevron-up")}</span>` };
}
function pintar(){
  if(!el || el.hidden) return;
  const c = conteudo(), chave = c.cls + c.html.replace(/\d+:\d\d/g, "");
  el.className = `mini-treino L-${E.atual.letra} ${c.cls}`; el.setAttribute("aria-label", `${c.rot}. Voltar ao treino`);
  if(chave !== ultimo){ el.innerHTML = `<span class="mt-fill" aria-hidden="true"></span>${c.html}`; ultimo = chave; }
  else el.querySelectorAll(".mt-t").forEach(t => { t.textContent = c.html.match(/class="mt-t">([^<]*)/)[1]; });
  el.querySelector(".mt-fill").style.transform = `scaleX(${c.fill ?? 0})`;
}
/* Chamado a cada render: mostra o mini-player quando há treino e a tela do treino não está aberta */
export function atualizarMini(){
  const mostra = !!E.atual && !document.body.classList.contains("em-sessao") && !document.body.classList.contains("sem-ficha");
  if(mostra && !el){
    el = document.createElement("button"); el.type = "button"; el.id = "miniTreino";
    el.onclick = e => { if(e.target.closest("[data-mt-pular]")){ pararDescanso(true); ultimo = ""; pintar(); return; } expandirTreino(); };
    document.body.appendChild(el);
  }
  if(!el) return;
  el.hidden = !mostra; document.body.classList.toggle("com-mini", mostra);
  clearInterval(tInt);
  if(mostra){ ultimo = ""; pintar(); tInt = setInterval(pintar, 250); }
}
