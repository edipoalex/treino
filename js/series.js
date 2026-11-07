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
