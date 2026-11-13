/* Treino inteligente e progresso (fase 4): sugestão de carga, recorde ao alcance, progresso por exercício,
   busca do Guia, lembretes (.ics) e falas da voz. Módulo puro (sem DOM e sem estado global),
   testado em tests/inteligente.test.js. Tudo vem das cargas registradas por série (cs) e do "como foi". */
import { chaveRec } from "./metricas.js";
import { numCarga, fmtNum } from "./util.js";

const pl = (n, um, varios) => n===1 ? um : varios;

/* As últimas vezes (mais recente primeiro) em que a parte k foi feita no grupo g:
   maior carga da sessão nessa unidade, se todas as séries foram feitas e o "como foi" */
export function ultimasVezes(sessoes, k, g, u, n=2){
  const out = [];
  for(let s=sessoes.length-1; s>=0 && out.length<n; s--){
    const x = sessoes[s]; let v = null, item = null;
    for(const it of x.itens||[]) for(const se of it.cs||[]) if((se.g||"")===(g||"")) for(const c of se.c||[]){
      if(c.k!==k || c.u!==u) continue; const q = numCarga(c.v); if(q!=null && (v==null || q>v)){ v=q; item=it; }
    }
    if(v!=null) out.push({ data:x.data, v, completo: !item.p && (+item.s||0) >= (+item.sp||0), pesado: x.sen==="pesado" });
  }
  return out;
}
/* Sugestão de carga para a parte k no grupo g, com a carga planejada agora (atual = { v, u }).
   - subir: a mesma carga nas 2 últimas vezes, todas as séries feitas e nenhuma marcada como pesada;
   - manter: na última vez faltou série ou o treino foi marcado como pesado;
   - nada: primeira vez, carga em texto livre, ou a carga planejada já é diferente da última (você já ajustou). */
export function sugestaoCarga(sessoes, { k, g="", atual, passo }){
  if(!atual || (atual.u!=="kg" && atual.u!=="placas")) return null;
  const v = numCarga(atual.v); if(v==null || !v) return null;
  const [u1, u2] = ultimasVezes(sessoes, k, g, atual.u);
  if(!u1 || u1.v!==v) return null;
  const un = atual.u==="kg" ? "kg" : "placas", f = n => `${fmtNum(n)} ${un}`;
  if(!u1.completo || u1.pesado){
    const motivo = !u1.completo && u1.pesado ? "Na última vez ficou faltando série e o treino foi marcado como pesado"
      : !u1.completo ? "Na última vez ficou faltando série" : "O último treino com ele foi marcado como pesado";
    return { tipo:"manter", v, u:atual.u, titulo:`Mantenha ${f(v)}`, motivo };
  }
  if(u2 && u2.v===v && u2.completo && !u2.pesado){
    const nv = Math.round((v+passo)*100)/100;
    return { tipo:"subir", v:nv, u:atual.u, titulo:`Sugestão: ${f(nv)} (+${fmtNum(passo)})`, motivo:"Mesma carga nas 2 últimas vezes, com todas as séries feitas" };
  }
  return null;
}
/* Recorde ao alcance: a carga planejada passa o melhor já registrado (mesma parte, grupo e unidade) */
export function recordeAlcance(maxs, { k, g="", v, u }){
  const r = maxs[`${chaveRec(k, g)}|${u}`], n = numCarga(v);
  return r && n!=null && n>r.v ? { antes:r.v, v:n, u } : null;
}

/* Progresso por exercício: uma entrada por parte (k), com uma série de pontos por grupo e unidade */
export function progressoExercicios(sessoes, { etapaInicio="" } = {}){
  const m = {};
  sessoes.forEach(x => {
    const nesta = {};
    for(const it of x.itens||[]) for(const se of it.cs||[]) for(const c of se.c||[]){
      const v = numCarga(c.v); if(!v || (c.u!=="kg" && c.u!=="placas")) continue;
      const id = `${se.g||""}|${c.u}`, k = c.k;
      const n = (nesta[k] ??= { item:it.n, grupos:{} }); if(!n.grupos[id] || v>n.grupos[id]) n.grupos[id] = v;
    }
    for(const [k, n] of Object.entries(nesta)){
      const e = (m[k] ??= { k, item:n.item, letras:new Set(), grupos:{}, ultima:"" });
      e.item = n.item; e.letras.add(x.letra); e.ultima = x.data;
      for(const [id, v] of Object.entries(n.grupos)){ const [g, u] = id.split("|"); (e.grupos[id] ??= { g, u, pts:[] }).pts.push({ data:x.data, v, letra:x.letra }); }
    }
  });
  return Object.values(m).map(e => {
    const gs = Object.values(e.grupos).map(G => {
      const rec = G.pts.reduce((a, p) => p.v>a.v ? p : a, G.pts[0]);
      const base = G.pts.find(p => etapaInicio && p.data>=etapaInicio) || G.pts[0], ult = G.pts[G.pts.length-1];
      return { ...G, atual:ult.v, recorde:rec.v, recData:rec.data, de:base.v, pct: base.v ? Math.round((ult.v/base.v-1)*100) : 0 };
    }).sort((a, b) => (b.u==="kg")-(a.u==="kg") || b.atual-a.atual); // principal: kg e a maior carga (o "pesado")
    return { k:e.k, item:e.item, letras:[...e.letras].sort(), ultima:e.ultima, grupos:gs, principal:gs[0] };
  }).sort((a, b) => b.ultima.localeCompare(a.ultima) || a.k.localeCompare(b.k));
}

/* Busca sem acento e sem maiúsculas */
export const normalizar = s => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const casa = (texto, q) => !q || normalizar(texto).includes(normalizar(q).trim());
/* Destaca q em texto já escapado (sem acento: "escapulas" acha "Escápulas") */
export function destacar(textoEsc, q){
  const nq = normalizar(q).trim(); if(!nq) return textoEsc;
  const nt = normalizar(textoEsc); let out = "", i = 0, p;
  while((p = nt.indexOf(nq, i)) >= 0){ out += textoEsc.slice(i, p) + `<mark>${textoEsc.slice(p, p+nq.length)}</mark>`; i = p+nq.length; }
  return out + textoEsc.slice(i);
}

/* Lembretes: evento semanal no Calendário (.ics), alerta 15 min antes */
const BYDAY = ["MO","TU","WE","TH","FR","SA","SU"];
export function icsLembrete({ dias, hora, inicio, url, duracaoMin=60, alertaMin=15 }){
  const [h, m] = hora.split(":"), d = inicio.replace(/-/g, "");
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Treino//PT-BR","CALSCALE:GREGORIAN","BEGIN:VEVENT",
    `UID:treino-lembrete-${d}${h}${m}`, `DTSTAMP:${d}T000000Z`, `DTSTART:${d}T${h}${m}00`, `DURATION:PT${duracaoMin}M`,
    `RRULE:FREQ=WEEKLY;BYDAY=${dias.map(i => BYDAY[i]).join(",")}`, "SUMMARY:Treino", `URL:${url}`, `DESCRIPTION:Abra o app: ${url}`,
    "BEGIN:VALARM", `TRIGGER:-PT${alertaMin}M`, "ACTION:DISPLAY", "DESCRIPTION:Treino em 15 minutos", "END:VALARM",
    "END:VEVENT","END:VCALENDAR"].join("\r\n");
}
/* Primeira data (AAAA-MM-DD) a partir de hoje que cai num dos dias escolhidos (0 = segunda) */
export function primeiraData(hojeIso, dias){
  const [y, mo, d] = hojeIso.split("-").map(Number);
  for(let k=0; k<7; k++){ const dt = new Date(y, mo-1, d+k), dow = (dt.getDay()+6)%7;
    if(dias.includes(dow)) return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`; }
  return hojeIso;
}

/* Falas da voz: nome da fase e duração, por extenso o bastante para o sintetizador */
export function duracaoFalada(seg){
  const m = Math.floor(seg/60), s = Math.round(seg%60);
  if(m && s) return `${m} ${pl(m,"minuto","minutos")} e ${s} ${pl(s,"segundo","segundos")}`;
  return m ? `${m} ${pl(m,"minuto","minutos")}` : `${s} ${pl(s,"segundo","segundos")}`;
}
export function falaFase(nome, seg){ return `${nome.charAt(0).toUpperCase()}${nome.slice(1).toLowerCase()}, ${duracaoFalada(seg)}`; }
export function falaCarga(txt){ return String(txt||"").replace(/(\d),(\d)/g, "$1 vírgula $2").replace(/\bkg\b/g, "quilos").replace(/·/g, ","); }
