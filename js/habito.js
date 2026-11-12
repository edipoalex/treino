/* Hábito (fase 3): meta da semana, sequência de semanas, blocos da etapa, marcos, revisão da semana e fechamento.
   Módulo puro (sem DOM e sem estado global), testado em tests/habito.test.js.
   Tudo vem da ficha (frequência, voltas ou semanas, fases) e do histórico; nada é fixo de uma etapa. */
import { chaveRec, recordesDaSessao, volumeSessao } from "./metricas.js";
import { numCarga } from "./util.js";

const DIA = 864e5;
const pISO = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const fISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export const somarDias = (s, n) => { const d = pISO(s); d.setDate(d.getDate()+n); return fISO(d); };
export const segunda = s => { const d = pISO(s); d.setDate(d.getDate()-((d.getDay()+6)%7)); return fISO(d); };
export const SENSACOES = { facil:"Leve", ponto:"No ponto", pesado:"Pesado" };
export const sensacaoOk = v => typeof v==="string" && Object.hasOwn(SENSACOES, v);
// chave na aba Config da planilha (o Apps Script já aceita setConfig; não precisa reimplantar)
export const chaveSen = id => `sensacao.${String(id).replace(/[^\w.]/g,"_")}`;
const DIAS = ["segunda","terça","quarta","quinta","sexta","sábado","domingo"];
const pl = (n, um, varios) => n===1 ? um : varios;

/* Sequência: semanas seguidas (segunda a domingo) com pelo menos `min` treinos.
   A semana em andamento só entra quando a meta é batida, e nunca quebra a sequência enquanto ainda dá para bater. */
export function sequencia(datas, { min, max }, hoje){
  const por = {}; for(const d of datas) { const k = segunda(d); por[k] = (por[k]||0) + 1; }
  const seg = segunda(hoje), n = por[seg] || 0, dow = (pISO(hoje).getDay()+6)%7;
  const treinouHoje = datas.includes(hoje), restam = 7 - dow - (treinouHoje ? 1 : 0);
  let ant = 0; for(let k = somarDias(seg,-7); (por[k]||0) >= min; k = somarDias(k,-7)) ant++;
  const batida = n >= min, faltam = Math.max(0, min-n);
  const estado = n >= max ? "perfeita" : batida ? "batida" : faltam > restam ? "pausa" : faltam === restam ? "risco" : "normal";
  const seq = estado === "pausa" ? 0 : ant + (batida ? 1 : 0);
  const semanas = Array.from({length:8}, (_, i) => { const s = somarDias(seg, -(7-i)*7), q = por[s] || 0; return { seg:s, n:q, ok:q>=min, atual:i===7 }; });
  const proxDias = Array.from({length:restam}, (_, i) => dow + (treinouHoje ? 1 : 0) + i);
  return { n, min, max, restam, faltam, ant, seq, estado, semanas, dow, proxDias };
}
export function textoSequencia(r){
  const sem = n => `${n} ${pl(n,"semana seguida","semanas seguidas")}`;
  const titulo = r.estado==="pausa" ? (r.ant ? "Sequência em pausa" : "Comece uma sequência") : r.seq ? sem(r.seq) : "Comece uma sequência";
  let texto, cls = "";
  if(r.estado==="perfeita"){ texto = `Semana perfeita: ${r.n} de ${r.max}.`; cls = "ok"; }
  else if(r.estado==="batida"){ const f = r.max-r.n; texto = `Meta batida. Mais ${f} ${pl(f,"fecha","fecham")} a semana perfeita.`; cls = "ok"; }
  else if(r.estado==="pausa") texto = "Esta semana não fecha mais a meta. A sequência recomeça na segunda.";
  else if(r.estado==="risco"){
    const nomes = r.proxDias.map(d => d===r.dow ? "hoje" : DIAS[d]);
    const lista = nomes.length>1 ? `${nomes.slice(0,-1).join(", ")} e ${nomes[nomes.length-1]}` : nomes[0];
    texto = `${pl(r.faltam,"Falta","Faltam")} ${r.faltam} ${pl(r.faltam,"treino","treinos")} e ${pl(r.restam,"resta","restam")} ${r.restam} ${pl(r.restam,"dia","dias")}: ${lista}.`; cls = "risco";
  } else if(!r.n && !r.ant) texto = `Faça ${r.min} treinos até domingo.`;
  else texto = `${pl(r.faltam,"Falta","Faltam")} ${r.faltam} ${pl(r.faltam,"treino","treinos")} para ${r.ant ? "manter a sequência" : "começar uma sequência"}. ${pl(r.restam,"Resta","Restam")} ${r.restam} ${pl(r.restam,"dia","dias")}.`;
  return { titulo, texto, cls, zero: !r.seq };
}

/* Blocos da etapa: um por volta (fichas por voltas) ou por semana (fichas por semanas), um traço por treino.
   Por voltas, os treinos preenchem em ordem; por semanas, cada treino entra na semana em que foi feito. */
export function blocosEtapa({ porVoltas, blocos, porBloco, faseDoBloco, sessoes, blocoDaSessao, blocoAtual }){
  const b = Array.from({length:blocos}, () => []);
  if(porVoltas) sessoes.slice(0, blocos*porBloco).forEach((x, i) => b[Math.floor(i/porBloco)].push(x.letra));
  else sessoes.forEach(x => { const k = blocoDaSessao(x)-1; if(k>=0 && k<blocos && b[k].length<porBloco) b[k].push(x.letra); });
  const n = sessoes.length;
  const prox = porVoltas ? (n < blocos*porBloco ? { b:Math.floor(n/porBloco), j:n%porBloco } : null)
    : (blocoAtual>=1 && blocoAtual<=blocos && b[blocoAtual-1].length<porBloco ? { b:blocoAtual-1, j:b[blocoAtual-1].length } : null);
  const fases = [];
  for(let i=1; i<=blocos; i++){ const f = faseDoBloco(i), u = fases[fases.length-1]; if(u && u.f===f) u.n++; else fases.push({ f, n:1 }); }
  return { blocos:b, prox, fases };
}

/* Marco ao concluir um treino (no máximo um, o mais importante) */
export function marcoConclusao({ semana, feitos, total, porVolta }){
  const sq = `Sequência: ${semana.seq} ${pl(semana.seq,"semana","semanas")}.`;
  if(total && feitos===total) return { tipo:"etapa", titulo:"Etapa concluída", texto:`${total} de ${total} treinos. O fechamento está na aba Hoje.` };
  if(semana.n===semana.max && semana.max>semana.min) return { tipo:"perfeita", titulo:"Semana perfeita", texto:`${semana.n} de ${semana.max} treinos. ${sq}` };
  if(semana.n===semana.min) return { tipo:"meta", titulo:"Meta da semana batida", texto:`${semana.n} de ${semana.min===semana.max ? semana.min : `${semana.min}–${semana.max}`} treinos. ${sq}` };
  if(total>=4 && feitos===Math.floor(total/2)) return { tipo:"metade", titulo:"Metade da etapa", texto:`${feitos} de ${total} treinos.` };
  if(porVolta && total>porVolta && feitos===total-porVolta) return { tipo:"ultima", titulo:"Última volta", texto:`Faltam ${porVolta} treinos para fechar a etapa.` };
  return null;
}

/* Contagem das sensações ("como foi") */
export function distSensacao(sessoes){
  const d = { facil:0, ponto:0, pesado:0, total:0 };
  for(const x of sessoes) if(sensacaoOk(x.sen)){ d[x.sen]++; d.total++; }
  return d;
}
const series = x => (x.itens||[]).reduce((t, i) => t + (+i.s || 0), 0);

/* Revisão de uma semana. todas: sessões de todas as etapas em ordem (para os recordes); pesos: [{semana, kg}] */
export function resumoSemana(todas, seg, pesos=[]){
  const fim = somarDias(seg, 7), idx = todas.map((x, i) => [x, i]).filter(([x]) => x.data>=seg && x.data<fim);
  const ss = idx.map(([x]) => x), recs = {};
  for(const [x, i] of idx) for(const r of recordesDaSessao(x, todas.slice(0, i))){
    const k = `${chaveRec(r.k, r.g)}|${r.u}`; if(!recs[k] || r.v>recs[k].v) recs[k] = { ...r, antes: recs[k]?.antes ?? r.antes };
  }
  const p = pesos.find(w => w.semana===seg), pa = pesos.filter(w => w.semana<seg).pop();
  return { seg, sessoes:ss, minutos:ss.reduce((t, x) => t + (x.duracao||0), 0), series:ss.reduce((t, x) => t + series(x), 0),
    volume:ss.reduce((t, x) => t + volumeSessao(x), 0), recordes:Object.values(recs), dist:distSensacao(ss),
    peso: p ? { kg:p.kg, dif: pa ? p.kg-pa.kg : null } : null };
}

/* Evolução de carga na etapa: primeira e última carga (maior da sessão) de cada exercício e grupo, em kg */
export function evolucaoCargas(sessoes, limite=5){
  const m = {};
  sessoes.forEach((x, si) => {
    const nesta = {};
    for(const it of x.itens||[]) for(const s of it.cs||[]) for(const c of s.c||[]){
      const v = numCarga(c.v); if(!v || c.u!=="kg") continue;
      const k = chaveRec(c.k, s.g); if(!nesta[k] || v>nesta[k].v) nesta[k] = { k:c.k, g:s.g||"", v };
    }
    for(const [k, r] of Object.entries(nesta)){ m[k] ??= { k:r.k, g:r.g, de:r.v, si }; m[k].ate = r.v; m[k].sf = si; }
  });
  return Object.values(m).filter(r => r.sf>r.si && r.ate!==r.de)
    .map(r => ({ k:r.k, g:r.g, de:r.de, ate:r.ate, pct:Math.round((r.ate/r.de-1)*100) }))
    .sort((a, b) => b.pct-a.pct || a.k.localeCompare(b.k)).slice(0, limite);
}

/* Resumo da etapa em texto, para colar na conversa com o agente */
export function textoFechamento({ etapa, feitos, total, semanas, porSemana, dist, evol, pesadosPorLetra, peso, recordes }){
  const f = n => String(n).replace(".", ",");
  const ls = [`Etapa ${etapa} ${feitos>=total ? "concluída" : "encerrada"}: ${feitos} de ${total} treinos em ${semanas} ${pl(semanas,"semana","semanas")} (${f(porSemana)} por semana).`];
  if(recordes) ls.push(`Recordes de carga: ${recordes}.`);
  if(dist.total) ls.push(`Como foi: ${dist.facil} ${pl(dist.facil,"leve","leves")}, ${dist.ponto} no ponto, ${dist.pesado} ${pl(dist.pesado,"pesado","pesados")} (de ${dist.total} marcados).`);
  const pes = Object.entries(pesadosPorLetra).filter(([, n]) => n).sort((a, b) => b[1]-a[1]);
  if(pes.length) ls.push(`Treinos marcados como pesados: ${pes.map(([l, n]) => `${l} (${n})`).join(", ")}.`);
  if(evol.length) ls.push(`Cargas (1ª → última): ${evol.map(e => `${[e.k, e.g].filter(Boolean).join(" ")} ${f(e.de)} → ${f(e.ate)} kg`).join("; ")}.`);
  if(peso) ls.push(`Peso: ${f(peso.de)} → ${f(peso.ate)} kg.`);
  return ls.join("\n");
}
