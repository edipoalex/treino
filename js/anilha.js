/* Anilhas em SVG.
   - 3D (grandes: tela Hoje e resumo): olímpica de borracha girada levemente no eixo vertical, com a espessura à direita.
   - De frente (pequenas: semana, histórico, seletores): aro colorido e a letra no cubo de metal, legível até 30 px.
   As cores vêm das variáveis do tema (--c = cor do treino, --on = cor do texto sobre ela), via classe L-A, L-B…
   Os gradientes compartilhados (#an-luz, #an-me, #an-fu, #an-lat) ficam num <svg> escondido no início do index.html. */
import { esc } from "./util.js";

const F = 'font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="700"';
const COR = 'style="fill:var(--c)"';

// face da anilha (coordenadas 0–100); detalhada = furo, sulco e "TREINO"; senão a letra vai no cubo
function face(L, detalhada, texto=true){
  const aro = `<circle cx="50" cy="50" r="47" ${COR}/><circle cx="50" cy="50" r="47" fill="url(#an-luz)"/>
    <circle cx="50" cy="50" r="45.6" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="2.8"/>
    <circle cx="50" cy="50" r="43.8" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>`;
  if(!detalhada) return aro + `<circle cx="50" cy="50" r="31" fill="url(#an-me)" stroke="#000" stroke-opacity=".4" stroke-width="1.2"/>
    <circle cx="50" cy="50" r="25" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="2"/>
    <text x="50" y="65" text-anchor="middle" font-size="44" ${F} fill="#1d232a">${L}</text>`;
  return aro + `<circle cx="50" cy="50" r="32.5" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.6"/>
    <circle cx="50" cy="50" r="31.3" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1"/>
    <circle cx="50" cy="50" r="19" fill="url(#an-me)" stroke="#000" stroke-opacity=".35" stroke-width="1"/>
    <circle cx="50" cy="50" r="14.5" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1.4"/>
    <circle cx="50" cy="50" r="9" fill="#0d1014"/><circle cx="50" cy="50" r="9" fill="url(#an-fu)"/>
    ${texto?`<text x="50" y="27.5" text-anchor="middle" font-size="19" ${F} style="fill:var(--on)">${L}</text>
    <text x="50" y="81" text-anchor="middle" font-size="7.5" font-weight="600" fill-opacity=".85" letter-spacing=".6" font-family="Barlow Condensed, Arial Narrow, sans-serif" style="fill:var(--on)">TREINO</text>`:""}`;
}

export function anilhaSVG(letra, { d3=false, detalhada=false, texto=true } = {}){
  const L = esc(letra);
  if(!d3) return `<svg viewBox="0 0 100 100" aria-hidden="true">${face(L, detalhada, texto)}</svg>`;
  const cx = 46, sx = .84, esp = 8, rx = (47*sx).toFixed(1);
  const lado = `M${cx} 3 L${cx+esp} 3 A${rx} 47 0 0 1 ${cx+esp} 97 L${cx} 97 A${rx} 47 0 0 0 ${cx} 3 Z`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <ellipse cx="${cx+esp+2}" cy="54" rx="${rx}" ry="45" fill="#000" fill-opacity=".25"/>
    <path d="${lado}" ${COR}/><path d="${lado}" fill="url(#an-lat)"/>
    <path d="M${cx+esp/2} 3 A${rx} 47 0 0 1 ${cx+esp/2} 97" fill="none" stroke="#000" stroke-opacity=".25" stroke-width=".8"/>
    <g transform="translate(${cx} 50) scale(${sx} 1) translate(-50 -50)">${face(L, detalhada, texto)}</g></svg>`;
}
