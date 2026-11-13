/* Anilhas (v1.38).
   - 3D realista (grandes: card do treino, resumo, fechamento): camadas de CSS 3D, em pé e girada no eixo vertical.
     Borracha fosca com frisos e "TREINO A" impresso, espessura visível na borda (iluminada pela esquerda, como
     a face), inserto de aço escovado (gradiente cônico = reflexo em leque do metal), 6 parafusos, colar e
     furo vazado (máscara: aparece o fundo). Um brilho corre pelo aço na entrada da tela. Estilos em css/visual.css.
   - Plana (pequenas: botões de troca, listas, histórico): o mesmo desenho de frente, em SVG, legível até ~30 px.
   A cor vem de --c (classe L-A, L-B…). Os ids do SVG são únicos por desenho, para várias anilhas na mesma tela. */
import { esc } from "./util.js";

let seq = 0;
const novoId = () => `an${(++seq).toString(36)}`;

/* Plana, de frente. texto: "TREINO A" na borracha (só faz sentido a partir de ~56 px) */
export function anilhaPlana(letra, { texto=false } = {}){
  const id = novoId(), L = esc(letra);
  const parafusos = [0,60,120,180,240,300].map(a => { const r=14.5, t=(a-90)*Math.PI/180, x=50+r*Math.cos(t), y=50+r*Math.sin(t);
    return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.5" fill="#7D858E"/><circle cx="${(x-.35).toFixed(2)}" cy="${(y-.35).toFixed(2)}" r=".6" fill="#E9EDF1"/>`; }).join("");
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs>
    <mask id="${id}m"><rect width="100" height="100" fill="#fff"/><circle cx="50" cy="50" r="6.2" fill="#000"/></mask>
    <radialGradient id="${id}l" cx="32%" cy="26%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
    <linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3F5F7"/><stop offset=".5" stop-color="#C3C9D0"/><stop offset="1" stop-color="#9AA2AB"/></linearGradient>
    ${texto?`<path id="${id}t" d="M 22 50 A 28 28 0 0 1 78 50"/>`:""}</defs>
    <g mask="url(#${id}m)">
      <circle cx="50" cy="50" r="48.5" style="fill:color-mix(in srgb, var(--c) 80%, #101418)"/>
      <circle cx="50" cy="50" r="48.5" fill="url(#${id}l)"/>
      <circle cx="50" cy="50" r="47" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width=".8"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="1.4"/>
      <circle cx="50" cy="50" r="36.6" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width=".8"/>
      ${texto?`<text font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="700" font-size="11" letter-spacing="1.5" fill="#fff" fill-opacity=".9"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">TREINO ${L}</textPath></text>`:""}
      <circle cx="50" cy="50" r="20.5" fill="#000" fill-opacity=".22"/>
      <circle cx="50" cy="50" r="19.5" fill="url(#${id}a)"/>
      <circle cx="50" cy="50" r="19.5" fill="none" stroke="#000" stroke-opacity=".25" stroke-width=".7"/>
      ${parafusos}
      <circle cx="50" cy="50" r="9.5" fill="#D6DBE1" stroke="#000" stroke-opacity=".22" stroke-width=".7"/>
      <circle cx="50" cy="50" r="7.4" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1.2"/>
    </g></svg>`;
}

/* 3D realista. O tamanho vem de --s (no .plate, igual ao --size) */
export function anilha3D(letra, { espessura=16 } = {}){
  const id = novoId(), L = esc(letra);
  const camadas = Array.from({length:espessura}, (_,i) => `<span class="a3-ca" style="--z:calc(var(--s) * ${(-(i+1)*0.0095).toFixed(4)})"></span>`).join("");
  const parafusos = [0,60,120,180,240,300].map(a => `<span class="a3-bolt" style="--a:${a}deg"></span>`).join("");
  return `<div class="a3" aria-hidden="true"><div class="a3-giro">${camadas}
    <div class="a3-face"><div class="a3-borracha"></div>
      <svg class="a3-txt" viewBox="0 0 100 100" focusable="false"><defs><path id="${id}t" d="M 21 50 A 29 29 0 0 1 79 50"/></defs>
        <text><textPath href="#${id}t" startOffset="50%" text-anchor="middle">TREINO ${L}</textPath></text></svg>
      <div class="a3-aco"><div class="a3-brilho"></div>${parafusos}<div class="a3-colar"></div></div>
    </div></div></div>`;
}

/* Compatível com a chamada antiga: d3 → 3D realista; senão, plana */
export function anilhaSVG(letra, { d3=false, texto=false } = {}){ return d3 ? anilha3D(letra) : anilhaPlana(letra, { texto }); }
