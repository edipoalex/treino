/* Séries do exercício, uma a uma ("6 pesado", "20 leve"…): vêm de series_detalhe na ficha
   ou são lidas da prescrição; se não der para ler, cada série aparece só numerada. */
export function seriesDe(it){
  const n=it.series, lista=it.series_detalhe;
  // ficha normalizada (contrato v1): "6 · pesado", "15–20 · rest-pause" = repetições · etiqueta
  if(Array.isArray(lista) && lista.length===n) return lista.map(x=>{ const [r, ...tag]=String(x).split(" · "); return { r:r.trim(), tag:tag.join(" · ").trim() }; });
  const p=String(it.prescricao).trim(); let m;
  const repete=(r,tag)=>Array.from({length:n},(_,j)=>({r, tag: typeof tag==="function" ? tag(j) : tag}));
  if((m=p.match(/^(?:[A-Za-zÀ-ú -]+?\s)?(\d+)\s*x\s*\((.+)\)\s*$/)) && +m[1]===n) return repete(m[2].trim(),"");
  if((m=p.match(/^(\d+)\s*voltas?:\s*(.+)$/i)) && +m[1]===n) return repete(m[2].trim(),"");
  // séries por faixa com "+": "2x12 + 1x20", "2x12 + 2x15 + 2x20" (v1.49; o bi-set "3x10 + 10" não entra aqui)
  if((m=p.match(/^\s*\d+\s*x\s*\d+(?:\s*\+\s*\d+\s*x\s*\d+)+\s*(?:\(([^)]*)\))?\s*$/))){
    const fx=[...p.replace(/\(.*\)/,"").matchAll(/(\d+)\s*x\s*(\d+)/g)].flatMap(([,q,r])=>Array.from({length:+q},()=>({r, tag:""})));
    const nota=(m[1]||"").trim(), ult=/na última/i.test(nota);
    if(nota) fx.forEach((x,j)=>{ if(!ult || j===n-1) x.tag = ult ? nota.replace(/^na última:?\s*/i,"") : nota; });
    if(fx.length===n) return fx;
  }
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
  // "2 séries em micro-pausas (30 / 20 s / …)": a série leva o nome da técnica; as etapas aparecem como pílulas (v1.50)
  if((m=p.match(/^\s*(\d+)\s*s[ée]ries?\s+(?:em|de|com)\s+([^()]+?)\s*(?:\(|$)/i)) && +m[1]===n) return repete(m[2].trim(),"");
  // faixa de repetições com texto depois (v1.50): "3x10–12, RIR 2–3", "4x8–10, descida em 3 s…; RIR 1",
  // "3x10–12 por perna, …; última série até a falha", "2x15 por perna". O texto que sobra aparece na orientação.
  if((m=p.match(FAIXA)) && +m[1]===n){
    const r=m[2].replace(/\s*[–-]\s*/,"–").replace(/\s+s$/," s"), lado=(m[3]||"").trim(), resto=m[4]||"";
    const tudo=/^\s*até a falha/i.test(resto) ? "até a falha" : "", ult=ultimaDe(resto);
    return Array.from({length:n},(_,j)=>({ r: lado ? `${r} ${lado}` : r, tag: j===n-1 && ult ? ult : tudo }));
  }
  return Array.from({length:n},()=>({r:"série", tag:""}));
}
const FAIXA = /^\s*(\d+)\s*x\s*(\d+(?:\s*[–-]\s*\d+)?(?:\s*s(?![a-zà-ú]))?)\s*(por (?:perna|lado|braço))?\s*(?:[,;]\s*|\s+|$)(.*)$/i;
/* técnica pedida só na última série: "na última série, drop-set…", "última série até a falha", "última série em rest-pause" */
function ultimaDe(t){ const m=String(t).match(/(?:na\s+)?última série[^;.]*?(até a falha|drop-?set|rest-pause)/i); return m ? (/drop/i.test(m[1]) ? "drop-set" : m[1].toLowerCase()) : ""; }
/* O que a prescrição diz além das séries ("descida em 3 s, profundidade máxima…; RIR 1"), para a linha de orientação */
export function notaPrescricao(it){
  const p=String(it?.prescricao ?? "").trim();
  if(/^\s*\d+\s*x\s*[\d+ –-]*\d\s*(\([^)]*\))?\s*$/.test(p)) return "";   // "4x6 (carga alta)": a nota já vira etiqueta da série
  const m=p.match(FAIXA);
  return m && +m[1]===it.series ? m[4].replace(/^[\s,;]+/,"").trim() : "";
}
export const rotSerie = s => s ? [s.r, s.tag].filter(Boolean).join(" ") : "";

/* Partes com tempo na prescrição, para o cronômetro de execução:
   - "intervalo": "6x (30s forte / 30s leve) + 2 min de desaquecimento" (HIIT) ou "3x (4 min forte / 3 min leve)"
   - "continuo": cardio em zona 2 (o tempo é o do bloco)
   - "aquecimento": "5 min de esteira leve + 2 séries de aproximação no supino"
   - "partes": rest-pause e micro-pausas, "(falha / 10s / falha / 10s / falha)"
   - "segurar": isometria, "45s de prancha", "30s por lado"
   Devolve null quando não há tempo a cronometrar. */
const ehPausa = x => /^\d+\s*(s|seg|min)(?![a-zà-ú])/i.test(x);
const seg = x => { const n=+String(x).match(/\d+/)[0]; return /min/i.test(x) ? n*60 : n; };
const CARDIO_RX = /cardio|caminhada|corrida|esteira|bike|bicicleta|el[ií]ptico|escada|remo erg|zona\s*2|cont[ií]nuo/i;
const emSeg = (n, u) => /min/i.test(u) ? +n*60 : +n;
const ehForte = rot => /forte|r[aá]pid|intens|sprint|acelera/i.test(rot);
export function tempoDe(it){
  if(Array.isArray(it?.tecnicas)) return tempoNormalizado(it);
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
    m = p.match(/^\s*(\d+)\s*min\s+de\s+([^+]+?)\s*\+\s*(\d+)\s*s[ée]ries?\s+(?:leves?\s+)?de\s+(.+)$/i);   // "1 série leve de aproximação" também
    if(m) return { tipo:"aquecimento", seg:+m[1]*60, rot:m[2].trim(), passos:+m[3], passoRot:m[4].trim() };
    // cardio contínuo (zona 2, caminhada, "40 min"…): o tempo é o do bloco
    if(CARDIO_RX.test(p+" "+nome) && it?.bloco>0){
      const zona2=/zona\s*2/i.test(p+" "+nome), aquec=/aquec/i.test(nome);
      return { tipo:"continuo", seg:it.bloco*60, zona2, rot: zona2 ? "Zona 2" : aquec ? "Aquecimento" : "Cardio contínuo" };
    }
    return null;
  }
  // partes entre parênteses, ou a prescrição inteira separada por "/" (ex.: "1x30+6 / 1 min / 1x20+6")
  const grupos = [...p.matchAll(/\(([^()]*)\)/g)].map(x=>x[1]).concat([p.replace(/^[^:]*:\s*/,"")]);
  for(const g of grupos){
    const partes = g.split("/").map(x=>x.trim()).filter(Boolean);
    if(partes.length>=3 && partes.some(ehPausa) && partes.some(x=>!ehPausa(x)))
      return { tipo:"partes", partes: partes.map(x => { if(!ehPausa(x)) return { rot:x };
        const resto=x.replace(/^\d+\s*(s|seg|min)\w*\s*(de\s+)?/i,"").trim(); return resto ? { pausa:seg(x), rot:resto } : { pausa:seg(x) }; }) };
  }
  for(const mm of p.matchAll(/(\d+)\s*(s|seg|segundos?|min|minutos?)(?![a-zà-ú])\s*(por lado)?/gi)){
    // cadência ("3s na descida", "2 s de pausa no topo") não é cronômetro
    if(/^\s*(na|no|de)\s+(descida|subida|exc[êe]ntric|conc[êe]ntric|pausa|cad[êe]ncia|topo)/i.test(p.slice(mm.index+mm[0].length))) continue;
    if(/(descanso|pausa|intervalo)(\s+de)?\s*$/i.test(p.slice(0, mm.index))) continue;
    if(/(descida|subida|exc[êe]ntrica?|conc[êe]ntrica?|cad[êe]ncia|pausa)\s+(em|de|com)\s*$/i.test(p.slice(0, mm.index))) continue;   // "descida em 3 s"
    if(/^\s*(de\s+)?(descanso|pausa|intervalo)/i.test(p.slice(mm.index+mm[0].length))) continue;
    const abre=p.lastIndexOf("(", mm.index), fecha=p.indexOf(")", mm.index);   // dentro de "(descanso de 45 s …, 90 s entre …)"
    if(abre>=0 && abre>p.lastIndexOf(")", mm.index) && /descanso|pausa|intervalo/i.test(p.slice(abre, fecha<0?undefined:fecha))) continue;
    return segurar(/min/i.test(mm[2]) ? +mm[1]*60 : +mm[1], !!mm[3], String(it.nome), p);
  }
  return null;
}
/* isometria: "45 s prancha", "30 s por lado" (troca de lado no meio) */
function segurar(s, lado, nome, p){
  const rot = /prancha lateral/i.test(nome) && lado ? "Prancha lateral" : /prancha/i.test(nome) || /prancha/i.test(p) ? "Prancha" : /isometr/i.test(nome+" "+p) ? "Isometria" : "Tempo";
  const dur = s>=60 && s%60===0 ? `${s/60} min` : `${s} s`;
  if(lado) return { tipo:"segurar", rotulo:`${dur} por lado`, botao:`${rot} ${dur} × 2`,
    etapas:[{ seg:s, rot:"Lado esquerdo", tipo:"exec" }, { seg:5, rot:"Troque de lado", tipo:"troca" }, { seg:s, rot:"Lado direito", tipo:"exec" }] };
  return { tipo:"segurar", rotulo:`${dur} ${rot.toLowerCase()}`, botao:`${rot} ${dur}`, etapas:[{ seg:s, rot, tipo:"exec" }] };
}
/* Ficha normalizada (contrato v1, fase 2): o cronômetro vem das técnicas, não do texto. Mesmas estruturas que a
   leitura do texto devolve. Rest-pause / micro-pausas só na última série: { …partes, so:"ultima" } (use tempoDaSerie). */
function tempoNormalizado(it){
  const p = String(it.prescricao ?? ""), nome = String(it.nome ?? ""), tecs = it.tecnicas.filter(t => (t.aplica ?? "todas")==="todas");
  const t = id => tecs.find(x => x.id===id);
  let x;
  if((x = t("intervalado"))) return { tipo:"intervalo", rodadas:x.rodadas, a:{ seg:x.forte_s, rot:"forte", tipo:"forte" }, b:{ seg:x.leve_s, rot:"leve", tipo:"leve" },
    desaquecer:x.desaquecer_s || 0, rotulo:x.rotulo || "Intervalado" };
  if((x = t("aquecimento"))) return { tipo:"aquecimento", seg:x.minutos*60, rot:x.atividade, passos:x.series_aproximacao || 0, passoRot:x.exercicio_aproximacao || "" };
  if((x = t("continuo"))) return { tipo:"continuo", seg:x.minutos*60, zona2:!!x.zona2, rot: x.zona2 ? "Zona 2" : /aquec/i.test(nome) ? "Aquecimento" : "Cardio contínuo" };
  if((x = t("rest-pause"))){ const partes = []; for(let k=0; k<x.blocos; k++){ if(k) partes.push({ pausa:x.pausa_s }); partes.push({ rot:"falha" }); } return { tipo:"partes", partes }; }
  if((x = t("micro-pausas") || t("isometria-no-meio"))) return { tipo:"partes", partes: x.blocos.flatMap(b => b.pausa_s ? [{ rot:b.reps }, b.pausa_rot ? { pausa:b.pausa_s, rot:b.pausa_rot } : { pausa:b.pausa_s }] : [{ rot:b.reps }]) };
  if((x = t("isometria"))) return segurar(x.segundos, !!x.por_lado, nome, p);
  // só na última série (v1.57, fase 3): o mesmo cronômetro de partes, marcado com so:"ultima"
  const ult = it.tecnicas.find(t => (t.aplica ?? "todas")==="ultima" && ["rest-pause","micro-pausas"].includes(t.id));
  if(ult){ const r = tempoNormalizado({ ...it, tecnicas:[{ ...ult, aplica:"todas" }] }); return r && { ...r, so:"ultima" }; }
  return null;
}
/* Cronômetro da série f (0 = primeira): o "só na última" não vale para as séries anteriores */
export const tempoDaSerie = (it, f) => { const t = tempoDe(it); return t?.so==="ultima" && f < it.series-1 ? null : t; };
