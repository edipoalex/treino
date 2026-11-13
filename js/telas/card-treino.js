/* Card do treino premium (v1.40): estúdio com a anilha em foto. Estilos em css/card-treino.css.
   Dados dinâmicos: letra (cor e foto da anilha), chamada, título, descrição, minutos, express, exercícios e a lista.
   Letras sem foto (F a H) usam a anilha 3D do app. */
import { plate } from "../ui.js";
import { icone } from "../icones.js";
import { esc } from "../util.js";

export const FOTOS_ANILHA = new Set(["A","B","C","D","E"]);
export const fotoAnilha = l => `img/anilhas/anilha-${l}.webp`;

export function cardTreino({ letra, chamada, titulo, descricao, minutos, express, exercicios, itens = [], aberto = false }){
  const L = esc(letra), foto = FOTOS_ANILHA.has(letra) ? fotoAnilha(letra) : "";
  const anilha = foto
    ? `<div class="ct-anilha" aria-hidden="true" style="--img:url('${foto}')">
        <img class="reflexo" src="${foto}" alt="" decoding="async"><img class="foto" src="${foto}" alt="" decoding="async"><span class="luz"></span><span class="brilho-chao"></span></div>`
    : `<div class="ct-anilha sem-foto" aria-hidden="true">${plate(letra, "d3")}</div>`;
  return `<section class="ct L-${L}" id="cardHoje" aria-label="${esc(titulo)}">
    ${anilha}
    <div class="ct-palco">
      <p class="ct-eyebrow">${esc(chamada)}</p>
      <h2 class="ct-titulo">${esc(titulo)}</h2>
      <p class="ct-sub">${esc(descricao)}</p>
    </div>
    <div class="ct-info">
      <span class="ct-pill">${icone("clock")}${esc(minutos)} min</span>
      ${express ? `<span class="ct-pill">${icone("zap")}Express ${esc(express)} min</span>` : ""}
      <button class="ct-pill" id="verPrevia" aria-expanded="${aberto}" aria-controls="previaHoje">${icone("list")}${esc(exercicios)} ${exercicios === 1 ? "exercício" : "exercícios"}${icone("chevron-right")}</button>
    </div>
    ${aberto ? `<ul class="ct-previa" id="previaHoje">${itens.map(([n, d]) => `<li><span>${esc(n)}</span><span>${esc(d)}</span></li>`).join("")}</ul>` : ""}
    <div class="ct-acao"><button class="ct-btn" id="startBtn">${icone("play")}Iniciar treino</button></div>
  </section>`;
}
