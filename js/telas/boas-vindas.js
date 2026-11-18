/* Boas-vindas e espera da ficha (v1.49, vários perfis).
   - Aparelho novo, sem fonte de ficha: escolher entre conectar a própria planilha (a ficha vem de lá) e usar a ficha do app.
   - Perfil da planilha sem ficha ainda: aviso de espera, com "Atualizar" (a ficha aparece assim que for publicada).
   Enquanto isso as abas ficam escondidas, para não mostrar a ficha de outra pessoa. */
import { S, save, usarFicha, fichaEscolhida } from "../estado.js";
import { icone } from "../icones.js";
import { $ } from "../util.js";

function abrirPlanilha(){
  $("#openSettings")?.click();
  setTimeout(() => document.querySelector('#settings [data-pag-ir="planilha"]')?.click(), 50);
}
export function viewBoasVindas(render, sincronizar){
  const conectado = !!S.sync.url;
  $("#view").innerHTML = conectado
    ? `<section class="bv"><div class="bv-ic">${icone("cloud")}</div><h2>Aguardando a primeira ficha</h2>
        <p>A sua planilha está conectada. Assim que a ficha for publicada nela, o treino aparece aqui.</p>
        <button class="btn primary grande block" data-bv="atualizar">${icone("rotate-ccw")} Atualizar</button>
        <button class="btn-link" data-bv="planilha">Ver a conexão com a planilha</button></section>`
    : `<section class="bv"><div class="bv-ic">${icone("dumbbell")}</div><h2>Boas-vindas ao Treino</h2>
        <p>As suas fichas e o seu histórico ficam na sua planilha do Google. Conecte a planilha para começar.</p>
        <button class="btn primary grande block" data-bv="planilha">${icone("cloud")} Conectar minha planilha</button>
        <button class="btn-link" data-bv="app">Usar a ficha que já vem no app</button></section>`;
  $("#view").onclick = e => {
    const b = e.target.closest("[data-bv]"); if(!b) return;
    if(b.dataset.bv === "planilha") return abrirPlanilha();
    if(b.dataset.bv === "atualizar") return sincronizar?.();
    if(b.dataset.bv === "app"){ S.fichaFonte = "app"; usarFicha(fichaEscolhida()); save(); render(); }
  };
}
