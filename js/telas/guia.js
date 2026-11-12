import { FICHA, S } from "../estado.js";
import { notasCardio } from "../guia-exercicios.js";
import { render } from "../navegacao.js";
import { enfileirar } from "../sync.js";
import { $, esc } from "../util.js";

export function viewGuia(){
  const fc = S.idade ? Math.round(208-0.7*S.idade) : null;
  const z = (a,b)=> fc ? `${Math.round(fc*a)}–${Math.round(fc*b)} bpm` : "Informe a idade";
  $("#view").innerHTML = `
  <h1 class="page">Guia</h1>
  <p class="sub">Como executar cada método e como conduzir o cardio.</p>
  <details open><summary>Orientações da etapa</summary><div class="dbody"><dl>
    ${(FICHA.orientacoes||[]).map(([t,d])=>`<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join("")}</dl></div></details>
  <details><summary>Métodos</summary><div class="dbody"><dl>
    ${(FICHA.metodos||[]).map(([t,d])=>`<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join("")}</dl></div></details>
  <details><summary>Zonas de cardio</summary><div class="dbody">
    <div class="field"><label for="idade">Sua idade</label><input id="idade" type="number" inputmode="numeric" min="14" max="90" value="${esc(S.idade)}" placeholder="Ex.: 38"></div>
    <p class="mt-2 meta">${fc?`FC máxima estimada: <strong class="tx-tinta">${fc} bpm</strong> (208 − 0,7 × idade).`:"A FC máxima é estimada pela idade."} Um teste de esforço dá o valor real.</p>
    <table class="zones"><thead><tr><th>Zona</th><th>Faixa</th><th>Esforço</th></tr></thead><tbody>
      <tr><td>Zona 2</td><td>${z(.6,.7)}</td><td>4–5, dá para conversar</td></tr>
      <tr><td>Intervalado longo</td><td>${z(.85,.9)}</td><td>7–8</td></tr>
      <tr><td>HIIT curto</td><td>${z(.9,.95)}</td><td>8–9</td></tr>
    </tbody></table>
    ${notasCardio().map(n=>`<p class="mt-3 meta">${esc(n)}</p>`).join("")}
  </div></details>`;
  const inp=$("#idade");
  inp.onchange=()=>{ S.idade = inp.value ? +inp.value : ""; enfileirar({tipo:"setConfig", chave:"idade", valor:S.idade}); const o=document.querySelectorAll("details"); const st=[...o].map(d=>d.open); render(); document.querySelectorAll("details").forEach((d,i)=>d.open=st[i]); };
}
