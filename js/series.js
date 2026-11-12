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
   - "intervalo": "6x (30s forte / 30s leve) + 2 min de desaquecimento" (HIIT) ou "3x (4 min forte / 3 min leve)"
   - "continuo": cardio em zona 2 (o tempo é o do bloco)
   - "aquecimento": "5 min de esteira leve + 2 séries de aproximação no supino"
   - "partes": rest-pause e micro-pausas, "(falha / 10s / falha / 10s / falha)"
   - "segurar": isometria, "45s de prancha", "30s por lado"
   Devolve null quando não há tempo a cronometrar. */
const ehPausa = x => /^\d+\s*s$/i.test(x);
const seg = x => +String(x).match(/\d+/)[0];
const emSeg = (n, u) => /min/i.test(u) ? +n*60 : +n;
const ehForte = rot => /forte|r[aá]pid|intens|sprint|acelera/i.test(rot);
export function tempoDe(it){
  const p = String(it?.prescricao ?? ""), nome = String(it?.nome ?? "");
  // intervalos: "6x (30s forte / 30s leve)" ou "3x (4 min forte / 3 min leve)"
  let m = p.match(/(\d+)\s*x\s*\(\s*(\d+)\s*(s|seg|min)\w*\s+([^/()]+?)\s*\/\s*(\d+)\s*(s|seg|min)\w*\s+([^()]+?)\s*\)/i);
  if(m){
    const des = p.match(/(\d+)\s*min(?:utos)?\s+de\s+desaquec/i);
    const a = { seg:emSeg(m[2],m[3]), rot:m[4].trim() }, b = { seg:emSeg(m[5],m[6]), rot:m[7].trim() };
    a.tipo = ehForte(a.rot) || !ehForte(b.rot) ? "forte" : "leve"; b.tipo = a.tipo==="forte" ? "leve" : "forte";
    return { tipo:"intervalo", rodadas:+m[1], a, b, desaquecer: des ? +des[1]*60 : 0, rotulo: /hiit/i.test(p) ? "HIIT" : "Intervalado" };
  }
  if(!(it?.series > 0)){
    // aquecimento: "5 min de esteira leve + 2 séries de aproximação no supino"
    m = p.match(/^\s*(\d+)\s*min\s+de\s+([^+]+?)\s*\+\s*(\d+)\s*s[ée]ries?\s+de\s+(.+)$/i);
    if(m) return { tipo:"aquecimento", seg:+m[1]*60, rot:m[2].trim(), passos:+m[3], passoRot:m[4].trim() };
    // cardio contínuo (zona 2): o tempo é o do bloco
    if(/zona\s*2|cont[ií]nuo/i.test(p+" "+nome) && it?.bloco>0) return { tipo:"continuo", seg:it.bloco*60, rot:/zona\s*2/i.test(p) ? "Zona 2" : "Contínuo" };
    return null;
  }
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
