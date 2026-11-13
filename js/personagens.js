/* Personagens do treinador (v1.41): equipamentos de academia, crossfit e HYROX com rosto, no estilo de mascote de animação 3D.
   Originais, em SVG vetorial (nítidos e leves), na cor do treino. Cada um tem 3 expressões, uma por estilo de fala:
   padrao (confiante), zoeira (sobrancelha levantada, olho meio fechado, sorriso de canto) e bravo (cenho franzido, gritando).
   Usado pelo balão (js/balao.js), pelo aviso do fim do descanso e pela prévia em Ajustes › Motivação. */
let uid = 0;
const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")}`; };
const claro = (c, t) => mix(c, "#ffffff", t), escuro = (c, t) => mix(c, "#000000", t);
const TINTA = "#16110f";

/* ---------- rosto ---------- */
function olho(x, y, humor, lado, cor, id){
  const cid = `${id}o${lado < 0 ? "e" : "d"}`, lid = escuro(cor, .25);
  const olhar = humor === "zoeira" ? [2.6, .4] : humor === "bravo" ? [lado * -1.2, 1.4] : [.6, .2];
  let palpebra = "";
  if(humor === "bravo"){ const p = lado < 0 ? "-11,-13 11,-13 11,-1 -11,-7" : "-11,-13 11,-13 11,-7 -11,-1", l = lado < 0 ? "M-11 -7 L11 -1" : "M-11 -1 L11 -7";
    palpebra = `<polygon points="${p}" fill="${lid}"/><path d="${l}" stroke="${TINTA}" stroke-width="2.4" stroke-linecap="round"/>`; }
  if(humor === "zoeira" && lado < 0) palpebra = `<rect x="-11" y="-13" width="22" height="12" fill="${lid}"/><path d="M-10 -1 Q0 1 10 -1" stroke="${TINTA}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  return `<g transform="translate(${x} ${y})">
    <clipPath id="${cid}"><ellipse rx="9" ry="10.5"/></clipPath>
    <ellipse rx="9" ry="10.5" fill="url(#${id}esc)"/>
    <g clip-path="url(#${cid})">
      <g transform="translate(${olhar[0]} ${olhar[1]})"><circle r="6.2" fill="url(#${id}iris)"/><circle r="3.3" fill="#070707"/>
        <circle cx="-2.2" cy="-2.6" r="1.9" fill="#fff"/><circle cx="2" cy="2" r=".9" fill="#fff" opacity=".85"/></g>
      <ellipse cy="-7" rx="9" ry="4" fill="#000" opacity=".12"/>
      ${palpebra}
    </g>
    <ellipse rx="9" ry="10.5" fill="none" stroke="${TINTA}" stroke-width="2.2"/></g>`;
}
function sobrancelha(x, y, forma, lado){
  const F = {
    alta:  "M-11 -15 Q-1 -24 10 -17 Q11 -15.5 9.5 -14.5 Q-1 -20 -10 -12.5 Q-12 -13 -11 -15 Z",
    brava: "M-12 -19.5 Q-11 -21.5 -9 -20.5 L10.5 -12.5 Q12 -10.5 10 -9 L-11 -15.5 Q-13 -17 -12 -19.5 Z",
    reta:  "M-11 -12.5 Q0 -14.5 10.5 -12.5 Q11.5 -10.8 10 -10 Q0 -11.5 -10.5 -10 Q-12 -11 -11 -12.5 Z",
    arco:  "M-11 -19 Q0 -31 10.5 -21 Q11.5 -19 10 -18 Q0 -26 -10.5 -15.8 Q-12 -17 -11 -19 Z" };
  return `<path d="${F[forma]}" fill="${TINTA}" transform="translate(${x} ${y}) scale(${lado < 0 ? 1 : -1} 1)"/>`;
}
function boca(x, y, humor, id){
  const g = d => `<g transform="translate(${x} ${y})">${d}</g>`;
  if(humor === "zoeira") return g(`<path d="M-13 1 Q-2 7 12 -4" stroke="${TINTA}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M12 -4 q3.4 -.6 3 2.6" stroke="${TINTA}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-5 7.5 Q1 9 6 6.2" stroke="${TINTA}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".45"/>`);
  const P = humor === "bravo" ? "M-14 -6 Q0 -9.5 14 -6 Q16.5 8 10 13.5 Q0 16.5 -10 13.5 Q-16.5 8 -14 -6 Z" : "M-15 -3 Q0 2 15 -3 Q13.5 14 0 15.5 Q-13.5 14 -15 -3 Z";
  const dentes = humor === "bravo"
    ? `<path d="M-16 -10 H16 V-2.5 Q0 -1 -16 -2.5 Z" fill="#fbfaf6"/><path d="M-5 -9 V-2 M0 -9 V-1.6 M5 -9 V-2" stroke="#d9d4c8" stroke-width="1"/><path d="M-12 15 Q0 9.5 12 15 V18 H-12 Z" fill="#fbfaf6"/><ellipse cy="10" rx="7" ry="4" fill="#e0575f"/>`
    : `<path d="M-16 -5 H16 V1.5 Q0 4.5 -16 1.5 Z" fill="#fbfaf6"/><path d="M0 -4 V3.6" stroke="#d9d4c8" stroke-width="1"/><ellipse cy="13" rx="9" ry="6.2" fill="#e8636b"/><path d="M0 9 V14" stroke="#c4444d" stroke-width="1" opacity=".6"/>`;
  return g(`<clipPath id="${id}b"><path d="${P}"/></clipPath><path d="${P}" fill="#4a0f14"/><g clip-path="url(#${id}b)">${dentes}</g>
    <path d="${P}" fill="none" stroke="${TINTA}" stroke-width="2.3" stroke-linejoin="round"/>`);
}
/* rosto completo: olhos em (cx±d, oy), boca em (cx, by); s = escala; veia = posição do sinal de raiva */
function rosto({ cx, oy, by, d = 15, s = 1, veia = [30, -22] }, humor, cor, id){
  const sb = { padrao:["alta","alta"], zoeira:["reta","arco"], bravo:["brava","brava"] }[humor];
  const my = (by - oy) / s;
  const bochecha = humor !== "bravo" ? `<ellipse cx="${-d - 6}" cy="${my - 6}" rx="6" ry="3.4" fill="#ff5d6c" opacity=".3"/><ellipse cx="${d + 6}" cy="${my - 6}" rx="6" ry="3.4" fill="#ff5d6c" opacity=".3"/>` : "";
  const raiva = humor === "bravo" ? `<g transform="translate(${veia[0]} ${veia[1]})" stroke="#ff2d2d" stroke-width="2.2" stroke-linecap="round" fill="none">
      <path d="M-7.5 -1.5 Q-1.5 -1.5 -1.5 -7.5 M1.5 -7.5 Q1.5 -1.5 7.5 -1.5 M7.5 1.5 Q1.5 1.5 1.5 7.5 M-1.5 7.5 Q-1.5 1.5 -7.5 1.5"/></g>` : "";
  return `<g transform="translate(${cx} ${oy}) scale(${s})">${bochecha}
    ${olho(-d, 0, humor, -1, cor, id)}${olho(d, 0, humor, 1, cor, id)}
    ${sobrancelha(-d, 0, sb[0], -1)}${sobrancelha(d, 0, sb[1], 1)}
    ${boca(0, my, humor, id)}${raiva}</g>`;
}

/* ---------- materiais comuns ---------- */
function defs(id, cor){
  return `<radialGradient id="${id}esc" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".75" stop-color="#f1f2f4"/><stop offset="1" stop-color="#c9ced6"/></radialGradient>
    <radialGradient id="${id}iris" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#8a5a2b"/><stop offset=".55" stop-color="#4a2c14"/><stop offset="1" stop-color="#1c0f06"/></radialGradient>
    <radialGradient id="${id}corpo" cx="34%" cy="28%" r="78%"><stop offset="0" stop-color="${claro(cor, .38)}"/><stop offset=".42" stop-color="${cor}"/><stop offset=".85" stop-color="${escuro(cor, .38)}"/><stop offset="1" stop-color="${escuro(cor, .55)}"/></radialGradient>
    <linearGradient id="${id}aco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5d646c"/><stop offset=".22" stop-color="#f4f6f8"/><stop offset=".45" stop-color="#9aa2ab"/><stop offset=".7" stop-color="#d9dde2"/><stop offset="1" stop-color="#4b5158"/></linearGradient>
    <radialGradient id="${id}acoR" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#b9c0c8"/><stop offset="1" stop-color="#4f565e"/></radialGradient>
    <radialGradient id="${id}raiva" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff3b2b" stop-opacity=".16"/><stop offset="1" stop-color="#ff2b2b" stop-opacity="0"/></radialGradient>
    <filter id="${id}bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>`;
}
const sombra = (id, cx, w) => `<ellipse cx="${cx}" cy="114" rx="${w}" ry="4.5" fill="#000" opacity=".38" filter="url(#${id}bl)"/>`;
/* brilho especular, luz de contorno, sombra própria e vermelhidão (bravo), recortados na silhueta */
const acabamento = (id, forma, brilho, humor, centro) => `<clipPath id="${id}s"><path d="${forma}"/></clipPath>
  <g clip-path="url(#${id}s)">
    <path d="${forma}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5" transform="translate(-2.4 -2.4)" filter="url(#${id}bl)"/>
    <path d="${forma}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="7" transform="translate(3 3)" filter="url(#${id}bl)"/>
    ${brilho}
    ${humor === "bravo" ? `<ellipse cx="${centro[0]}" cy="${centro[1]}" rx="40" ry="30" fill="url(#${id}raiva)"/>` : ""}
  </g>`;

/* ---------- corpos ---------- */
export const PERSONAGENS = {
  kettle: { nome:"Kettão", item:"Kettlebell", desenho(cor, humor, id){
    const forma = "M60 38 C88 38 104 56 104 78 C104 93 97 102 88 106 Q86 110 82 110 L38 110 Q34 110 32 106 C23 102 16 93 16 78 C16 56 32 38 60 38 Z";
    return `${sombra(id, 60, 40)}
      <path d="M33 56 V32 Q33 8 60 8 Q87 8 87 32 V56" fill="none" stroke="${escuro(cor, .55)}" stroke-width="14" stroke-linecap="round"/>
      <path d="M33 56 V32 Q33 8 60 8 Q87 8 87 32 V56" fill="none" stroke="${escuro(cor, .2)}" stroke-width="9" stroke-linecap="round"/>
      <path d="M36 44 V32 Q36 12 60 11.5" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2.6" stroke-linecap="round" filter="url(#${id}bl)"/>
      <path d="${forma}" fill="url(#${id}corpo)"/>
      <path d="M33 105.5 Q60 109 87 105.5" stroke="${escuro(cor, .5)}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
      ${acabamento(id, forma, `<ellipse cx="38" cy="54" rx="13" ry="8" fill="#fff" opacity=".42" transform="rotate(-28 38 54)" filter="url(#${id}bl)"/><ellipse cx="34" cy="51" rx="4" ry="2.4" fill="#fff" opacity=".8" transform="rotate(-28 34 51)"/>`, humor, [60, 80])}
      ${rosto({ cx:60, oy:70, by:92, veia:[34, -22] }, humor, cor, id)}`; } },

  anilha: { nome:"Anilhão", item:"Anilha bumper", desenho(cor, humor, id){
    const forma = "M60 8 A54 54 0 1 1 59.99 8 Z";
    const parafusos = [0, 60, 120, 180, 240, 300].map(a => { const r = a * Math.PI / 180; return `<circle cx="${(60 + 10.5 * Math.cos(r)).toFixed(1)}" cy="${(62 + 10.5 * Math.sin(r)).toFixed(1)}" r="1.3" fill="#3d434a"/>`; }).join("");
    return `${sombra(id, 60, 44)}
      <path d="${forma}" fill="url(#${id}corpo)"/>
      <circle cx="60" cy="62" r="45" fill="none" stroke="${escuro(cor, .35)}" stroke-width="2.4" opacity=".7"/>
      <circle cx="60" cy="62" r="43.4" fill="none" stroke="${claro(cor, .3)}" stroke-width="1" opacity=".5"/>
      <circle cx="60" cy="62" r="14.5" fill="url(#${id}acoR)" stroke="#3a3f45" stroke-width="1.2"/>${parafusos}
      <circle cx="60" cy="62" r="6.4" fill="#0c0e10"/><circle cx="60" cy="62" r="6.4" fill="none" stroke="#000" stroke-width="2" opacity=".6"/>
      ${acabamento(id, forma, `<ellipse cx="34" cy="30" rx="16" ry="8" fill="#fff" opacity=".35" transform="rotate(-38 34 30)" filter="url(#${id}bl)"/>`, humor, [60, 50])}
      ${rosto({ cx:60, oy:36, by:92, d:17, s:.9, veia:[36, -16] }, humor, cor, id)}`; } },

  halter: { nome:"Halterzão", item:"Halter sextavado", desenho(cor, humor, id){
    const hexa = (cx, cy, r) => Array.from({ length:6 }, (_, i) => { const a = i * Math.PI / 3; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; });
    const forma = `M${hexa(54, 68, 46).join(" L")} Z`;
    const lado = hexa(54, 68, 46), lado2 = hexa(99, 20, 19);
    return `${sombra(id, 56, 46)}
      <polygon points="${lado2.join(" ")}" fill="${escuro(cor, .35)}"/><polygon points="${hexa(99, 20, 14).join(" ")}" fill="none" stroke="${escuro(cor, .55)}" stroke-width="1.4"/>
      <path d="M62 60 L96 23" stroke="url(#${id}aco)" stroke-width="10" stroke-linecap="round"/>
      ${Array.from({ length:6 }, (_, i) => `<path d="M${79 + i * 2.4} ${40 - i * 2.6} l5 4.4" stroke="#6c737b" stroke-width=".8"/>`).join("")}
      <path d="M${lado[0]} L${lado[5]} L${hexa(60, 62, 46)[5]} L${hexa(60, 62, 46)[0]} Z" fill="${escuro(cor, .45)}"/>
      <path d="M${lado[5]} L${lado[4]} L${hexa(60, 62, 46)[4]} L${hexa(60, 62, 46)[5]} Z" fill="${escuro(cor, .25)}"/>
      <path d="${forma}" fill="url(#${id}corpo)" stroke-linejoin="round"/>
      <polygon points="${hexa(54, 68, 39).join(" ")}" fill="none" stroke="${escuro(cor, .3)}" stroke-width="1.6" opacity=".55"/>
      ${acabamento(id, forma, `<ellipse cx="34" cy="44" rx="13" ry="6" fill="#fff" opacity=".4" transform="rotate(-30 34 44)" filter="url(#${id}bl)"/>`, humor, [54, 70])}
      ${rosto({ cx:54, oy:62, by:86, d:15, s:.95, veia:[32, -22] }, humor, cor, id)}`; } },

  bola: { nome:"Wall Ballzão", item:"Wall ball", desenho(cor, humor, id){
    const forma = "M60 10 A52 52 0 1 1 59.99 10 Z", costura = `stroke="${escuro(cor, .55)}" stroke-width="1.1" stroke-dasharray="2.2 2.2" fill="none"`;
    return `${sombra(id, 60, 42)}
      <path d="${forma}" fill="url(#${id}corpo)"/>
      <clipPath id="${id}bc"><path d="${forma}"/></clipPath>
      <g clip-path="url(#${id}bc)"><path d="M0 30 Q60 14 120 30 L120 40 Q60 24 0 40 Z" fill="#1d2126" opacity=".92"/>
        <path d="M0 29 Q60 13 120 29" ${costura} opacity=".8"/><path d="M0 41 Q60 25 120 41" ${costura} opacity=".8"/>
        <path d="M60 10 Q40 62 60 114" ${costura} opacity=".3"/><path d="M60 10 Q80 62 60 114" ${costura} opacity=".3"/></g>
      ${acabamento(id, forma, `<ellipse cx="36" cy="34" rx="15" ry="8" fill="#fff" opacity=".38" transform="rotate(-35 36 34)" filter="url(#${id}bl)"/>`, humor, [60, 75])}
      ${rosto({ cx:60, oy:66, by:90, d:16, s:.95, veia:[34, -20] }, humor, cor, id)}`; } },

  treno: { nome:"Trenzão", item:"Trenó (HYROX)", desenho(cor, humor, id){
    const forma = "M52 16 A41 41 0 1 1 51.99 16 Z";
    return `${sombra(id, 60, 52)}
      <path d="M88 96 L106 14" stroke="url(#${id}aco)" stroke-width="6" stroke-linecap="round"/><path d="M76 96 L94 14" stroke="url(#${id}aco)" stroke-width="6" stroke-linecap="round"/>
      <rect x="88" y="10" width="24" height="7" rx="3.5" fill="#2b3036"/>
      <path d="M6 108 H102 Q114 108 114 98" stroke="url(#${id}aco)" stroke-width="5" fill="none" stroke-linecap="round"/>
      <rect x="12" y="94" width="92" height="9" rx="2.5" fill="#2f353b"/><rect x="12" y="94" width="92" height="3" rx="1.5" fill="#5a626b"/>
      <rect x="48" y="86" width="8" height="10" fill="url(#${id}aco)"/>
      <path d="${forma}" fill="url(#${id}corpo)"/>
      <circle cx="52" cy="57" r="34" fill="none" stroke="${escuro(cor, .35)}" stroke-width="1.8" opacity=".6"/>
      <circle cx="52" cy="57" r="9" fill="url(#${id}acoR)" stroke="#3a3f45"/><circle cx="52" cy="57" r="4" fill="#0c0e10"/>
      ${acabamento(id, forma, `<ellipse cx="32" cy="34" rx="13" ry="6" fill="#fff" opacity=".4" transform="rotate(-35 40 40)" filter="url(#${id}bl)"/>`, humor, [52, 55])}
      ${rosto({ cx:52, oy:36, by:80, d:14, s:.8, veia:[32, -14] }, humor, cor, id)}`; } },
};

export function personagem(id = "kettle", humor = "padrao", cor = "#2E9E5B", tam = 52){
  const P = PERSONAGENS[id] || PERSONAGENS.kettle, gid = `pz${++uid}`;
  return `<svg class="bichinho" width="${tam}" height="${tam}" viewBox="0 0 120 120" aria-hidden="true"><defs>${defs(gid, cor)}</defs>${P.desenho(cor, humor, gid)}</svg>`;
}
