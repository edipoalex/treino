/* Volume e recordes, calculados a partir das cargas registradas em cada série (fase 3).
   Cada item de sessão pode ter cs: [{ r:"6", g:"pesado", c:[{ k:"Puxada aberta pronada", v:"80", u:"kg" }] }]
   r = repetições prescritas, g = grupo de carga (pesado/leve, ou vazio), c = carga de cada parte do exercício.
   Módulo puro (sem DOM), testado em tests/metricas.test.js. */
import { numCarga, fmtNum } from "./util.js";

export const chaveRec = (k, g) => g ? `${k} · ${g}` : k;

// repetições da parte pi: "10 + 12" em exercício combinado vira 10 para a 1ª parte e 12 para a 2ª
function reps(r, pi){
  const ps = String(r ?? "").split(" + ").map(x=>x.trim());
  const v = ps.length>1 ? ps[pi] : ps[0];
  return /^\d+$/.test(v ?? "") ? +v : 0;
}
/* Volume em kg × repetições. Placas e texto livre ficam de fora. */
export function volumeSerie(s){
  return (s?.c || []).reduce((tot, c, pi) => { const v = c.u==="kg" ? numCarga(c.v) : null; return tot + (v ? v*reps(s.r, pi) : 0); }, 0);
}
export const volumeItem = it => (it?.cs || []).reduce((t, s) => t + volumeSerie(s), 0);
export const volumeSessao = x => (x?.itens || []).reduce((t, it) => t + volumeItem(it), 0);
export const temCargas = x => (x?.itens || []).some(it => (it.cs||[]).length);

/* Maior carga por exercício (e grupo), separada por unidade. Devolve { "chave|u": { k, g, u, v, data } }. */
export function maximos(sessoes){
  const m = {};
  for(const x of sessoes) for(const it of x.itens || []) for(const s of it.cs || []) for(const c of s.c || []){
    const v = numCarga(c.v); if(v==null || !v || (c.u!=="kg" && c.u!=="placas")) continue;
    const id = `${chaveRec(c.k, s.g)}|${c.u}`;
    if(!m[id] || v > m[id].v) m[id] = { k:c.k, g:s.g||"", u:c.u, v, data:x.data };
  }
  return m;
}
/* Recordes batidos pela sessão x: carga maior que a melhor anterior do mesmo exercício e grupo.
   A primeira carga registrada de um exercício não conta como recorde. */
export function recordesDaSessao(x, anteriores){
  const antes = maximos(anteriores), agora = maximos([x]);
  return Object.entries(agora).filter(([id, r]) => antes[id] && r.v > antes[id].v)
    .map(([id, r]) => ({ ...r, antes: antes[id].v }));
}
export const fmtRec = r => `${fmtNum(r.v)} ${r.u}`;
export const fmtVolume = kg => kg>=1000 ? `${fmtNum(Math.round(kg/100)/10)} t` : `${Math.round(kg)} kg`;
/* Resumo das cargas de um item: "80×6 · 50×20 · 80×6" (partes de combinados separadas por "+") */
export function resumoCargas(it){
  return (it?.cs || []).map(s => (s.c||[]).map((c, pi) => {
    const v = numCarga(c.v), rp = reps(s.r, pi);
    return c.v ? (v!=null && rp ? `${fmtNum(v)}×${rp}` : c.v) : "—";
  }).join(" + ")).join(" · ");
}
