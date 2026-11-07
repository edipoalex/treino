export const $ = s => document.querySelector(s);
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* Números de carga: "82,5" → 82.5 (texto livre como "10/20" não é número) */
export const numCarga = v => /^\s*\d+([.,]\d+)?\s*$/.test(String(v)) ? parseFloat(String(v).replace(",",".")) : null;
export const fmtNum = n => String(Math.round(n*100)/100).replace(".",",");
