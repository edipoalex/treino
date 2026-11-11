/* Séries do exercício, uma a uma ("6 pesado", "20 leve"…): vêm de series_detalhe na ficha
   ou são lidas da prescrição; se não der para ler, cada série aparece só numerada. */
export function seriesDe(it){
  const n=it.series, lista=it.series_detalhe;
  if(Array.isArray(lista) && lista.length===n) return lista.map(r=>({r:String(r), tag:""}));
  const p=String(it.prescricao).trim(); let m;
  const repete=(r,tag)=>Array.from({length:n},(_,j)=>({r, tag: typeof tag==="function" ? tag(j) : tag}));
  if((m=p.match(/^(?:[A-Za-zÀ-ú -]+?\s)?(\d+)\s*x\s*\((.+)\)\s*$/)) && +m[1]===n) return repete(m[2].trim(),"");
  if((m=p.match(/^(\d+)\s*voltas?:\s*(.+)$/i)) && +m[1]===n) return repete(m[2].trim(),"");
  const itens=[]; let ok=p.includes("/");
  if(ok) for(const s of p.replace(/^[^:\d]*:\s*/,"").split("/").map(x=>x.trim())){
    const q=s.match(/^(\d+)\s*x\s*(\d+)\s*(.*)$/); if(!q){ ok=false; break; }
    for(let k=0;k<+q[1];k++) itens.push({r:q[2], tag:q[3].trim()});
  }
  if(ok && itens.length===n){
    if(/contraste/i.test(p)){ const min=Math.min(...itens.map(x=>+x.r)); itens.forEach(x=>{ if(!x.tag) x.tag = +x.r===min ? "pesado" : "leve"; }); }
    return itens;
  }
  if((m=p.match(/(\d+)\s*x\s*([\d+ ]*\d|até [^()]+?)\s*(\(([^)]*)\))?\s*$/)) && +m[1]===n){
    const r=m[2].replace(/\s*\+\s*/g," + ").trim(), nota=m[4]||"", ultima=/na última/i.test(nota) ? nota.replace(/^na última:\s*/i,"") : "";
    return repete(r, j => ultima ? (j===n-1 ? ultima : "") : nota);
  }
  return Array.from({length:n},()=>({r:"série", tag:""}));
}
export const rotSerie = s => s ? [s.r, s.tag].filter(Boolean).join(" ") : "";

/* Partes com tempo na prescrição, para o cronômetro de execução:
   - "intervalo": "6x (30s forte / 30s leve) + 2 min de desaquecimento" (HIIT)
   - "partes": rest-pause e micro-pausas, "(falha / 10s / falha / 10s / falha)"
   - "segurar": isometria, "45s de prancha", "30s por lado"
   Devolve null quando não há tempo a cronometrar. */
const ehPausa = x => /^\d+\s*s$/i.test(x);
const seg = x => +String(x).match(/\d+/)[0];
export function tempoDe(it){
  const p = String(it?.prescricao ?? "");
  let m = p.match(/(\d+)\s*x\s*\(\s*(\d+)\s*s\s+([^/()]+?)\s*\/\s*(\d+)\s*s\s+([^()]+?)\s*\)/i);
  if(m){
    const des = p.match(/(\d+)\s*min(?:utos)?\s+de\s+desaquec/i);
    return { tipo:"intervalo", rodadas:+m[1], a:{ seg:+m[2], rot:m[3].trim() }, b:{ seg:+m[4], rot:m[5].trim() }, desaquecer: des ? +des[1]*60 : 0 };
  }
  if(!(it?.series > 0)) return null;
  m = p.match(/\(([^()]*)\)/);
  if(m){
    const partes = m[1].split("/").map(x=>x.trim()).filter(Boolean);
    if(partes.length>=3 && partes.some(ehPausa) && partes.some(x=>!ehPausa(x)))
      return { tipo:"partes", partes: partes.map(x => ehPausa(x) ? { pausa:seg(x) } : { rot:x }) };
  }
  for(const mm of p.matchAll(/(\d+)\s*s(?:eg(?:undos)?)?\b\s*(por lado)?/gi)){
    if(/descanso\s*$|pausa\s*$/i.test(p.slice(0, mm.index))) continue;
    const s = +mm[1], nome = String(it.nome);
    const rot = /prancha lateral/i.test(nome) && mm[2] ? "Prancha lateral" : /prancha/i.test(nome) || /prancha/i.test(p) ? "Prancha" : "Tempo";
    if(mm[2]) return { tipo:"segurar", rotulo:`${s} s por lado`, botao:`${rot} ${s} s × 2`,
      etapas:[{ seg:s, rot:"Lado esquerdo", tipo:"exec" }, { seg:5, rot:"Troque de lado", tipo:"troca" }, { seg:s, rot:"Lado direito", tipo:"exec" }] };
    return { tipo:"segurar", rotulo:`${s} s ${rot.toLowerCase()}`, botao:`${rot} ${s} s`, etapas:[{ seg:s, rot, tipo:"exec" }] };
  }
  return null;
}
