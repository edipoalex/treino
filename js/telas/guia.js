import { FICHA, LETRAS, S } from "../estado.js";
import { guiaDe, metodosDe, notasCardio } from "../guia-exercicios.js";
import { faseAtual, treino } from "../progresso.js";
import { enfileirar } from "../sync.js";
import { casa, destacar } from "../inteligente.js";
import { partesDe, temCarga } from "../cargas.js";
import { abrirProgresso } from "./progresso.js";
import { plate, vazio } from "../ui.js";
import { icone } from "../icones.js";
import { $, esc } from "../util.js";

/* Guia consultável (fase 4): busca no topo que procura em exercícios, dicas de execução, métodos e orientações.
   Exercícios da etapa por treino (fase atual), com as dicas do "Como fazer" e atalho para o progresso. */
let busca="";
const H = (t) => destacar(esc(t), busca);
function exercicios(){
  const fa=faseAtual(), vistos=new Set();
  return LETRAS.map(l => {
    const t=treino(l, fa, null); if(!t) return "";
    const its=t.itens.filter(it => { if(vistos.has(`${l}|${it.nome}`)) return false; vistos.add(`${l}|${it.nome}`); return true; })
      .filter(it => casa([it.nome, it.prescricao, it.obs||"", ...guiaDe(it.nome), ...metodosDe(it).flat()].join(" "), busca));
    if(!its.length) return "";
    return `<div class="guia-tit linha-ic">${plate(l,"xs")} Treino ${esc(l)}<span class="tx-legenda normal">· ${esc(t.foco)}</span></div><div class="guia-ex">${its.map(it => {
      const mets=metodosDe(it), pr=temCarga(it) ? partesDe(it)[0].key : "";
      return `<details ${busca?"open":""}><summary>${plate(l,"xs")}<span>${H(it.nome)}<small>${H(mets.map(m => m[0]).join(" · ") || it.prescricao)}</small></span></summary>
        <div class="dbody"><ol>${guiaDe(it.nome).map(d => `<li>${H(d)}</li>`).join("")}</ol>
        ${mets.filter(m => m[1]).map(([m,d]) => `<p class="mt-2 tx-sec"><strong class="tx-tinta">${H(m)}</strong>: ${H(d)}</p>`).join("")}
        <p class="mt-2 tx-sec meta">Nesta ficha: ${H(it.prescricao)}${it.obs?`. ${H(it.obs)}`:""}</p>
        ${pr?`<div class="acoes-ex"><button class="btn alt-p" data-prog="${esc(pr)}">${icone("trending-up")} Ver progresso</button></div>`:""}</div></details>`; }).join("")}</div>`;
  }).join("");
}
function secao(titulo, linhas, aberto){
  const f=linhas.filter(([t,d]) => casa(`${t} ${d}`, busca)); if(busca && !f.length) return "";
  return `<details ${aberto || busca ? "open" : ""}><summary>${esc(titulo)}</summary><div class="dbody"><dl>
    ${f.map(([t,d]) => `<dt>${H(t)}</dt><dd>${H(d)}</dd>`).join("")}</dl></div></details>`;
}
function conteudo(){
  const fc = S.idade ? Math.round(208-0.7*S.idade) : null;
  const z = (a,b)=> fc ? `${Math.round(fc*a)}–${Math.round(fc*b)} bpm` : "Informe a idade";
  const ex=exercicios(), ori=secao("Orientações da etapa", FICHA.orientacoes||[], !busca), met=secao("Métodos", FICHA.metodos||[], false);
  const cardioTxt=["Zona 2 dá para conversar","Intervalado longo","HIIT curto","frequência cardíaca FC",...notasCardio()].join(" ");
  const cardio = !busca || casa(cardioTxt, busca) ? `<details ${busca?"open":""}><summary>Zonas de cardio</summary><div class="dbody">
    <div class="field"><label for="idade">Sua idade</label><input id="idade" type="number" inputmode="numeric" min="14" max="90" value="${esc(S.idade)}" placeholder="Ex.: 38"></div>
    <p class="mt-2 meta">${fc?`FC máxima estimada: <strong class="tx-tinta">${fc} bpm</strong> (208 − 0,7 × idade).`:"A FC máxima é estimada pela idade."} Um teste de esforço dá o valor real.</p>
    <table class="zones"><thead><tr><th>Zona</th><th>Faixa</th><th>Esforço</th></tr></thead><tbody>
      <tr><td>Zona 2</td><td>${z(.6,.7)}</td><td>4–5, dá para conversar</td></tr>
      <tr><td>Intervalado longo</td><td>${z(.85,.9)}</td><td>7–8</td></tr>
      <tr><td>HIIT curto</td><td>${z(.9,.95)}</td><td>8–9</td></tr>
    </tbody></table>
    ${notasCardio().map(n=>`<p class="mt-3 meta">${H(n)}</p>`).join("")}
  </div></details>` : "";
  const tudo = `${ori}${met}${cardio}${ex?`<h2 class="guia-sec">Exercícios da etapa</h2>${ex}`:""}`;
  return tudo.trim() ? tudo : vazio("search", `Nada encontrado para "${esc(busca)}"`, "Tente o nome do aparelho, do exercício ou do método.");
}
export function viewGuia(){
  $("#view").innerHTML = `
  <h1 class="page">Guia</h1>
  <p class="sub">Exercícios, métodos e cardio da etapa</p>
  <label class="busca">${icone("search")}<input id="buscaGuia" type="search" placeholder="Buscar no guia" value="${esc(busca)}" aria-label="Buscar no guia" autocomplete="off"></label>
  <div id="guiaCorpo">${conteudo()}</div>`;
  ligar();
  const b=$("#buscaGuia"); b.oninput=()=>{ busca=b.value; $("#guiaCorpo").innerHTML=conteudo(); ligar(); };
}
function ligar(){
  const inp=$("#idade");
  if(inp) inp.onchange=()=>{ S.idade = inp.value ? +inp.value : ""; enfileirar({tipo:"setConfig", chave:"idade", valor:S.idade}); const o=document.querySelectorAll("#guiaCorpo details"); const st=[...o].map(d=>d.open); $("#guiaCorpo").innerHTML=conteudo(); ligar(); document.querySelectorAll("#guiaCorpo details").forEach((d,i)=>d.open=st[i]); };
  document.querySelectorAll("[data-prog]").forEach(b => b.onclick=() => abrirProgresso(b.dataset.prog));
}
