/* Aba Progresso (fase 4): cargas por exercício de todas as etapas, com busca, filtro por treino,
   mini gráfico e detalhe (gráfico por grupo, recorde, últimos treinos, como fazer).
   Os recordes e o volume, que ficavam no Histórico, moram aqui. Cálculo em js/inteligente.js. */
import { E, LETRAS } from "../estado.js";
import { nav, render } from "../navegacao.js";
import { fmtData, hojeISO } from "../progresso.js";
import { casa, destacar, progressoExercicios } from "../inteligente.js";
import { somarDias } from "../habito.js";
import { resumoCargas } from "../metricas.js";
import { guiaDe } from "../guia-exercicios.js";
import { todasSessoes } from "./habito.js";
import { alternarRecordes, chartVolume, painelRecordes } from "./historico.js";
import { plate, vazio } from "../ui.js";
import { icone } from "../icones.js";
import { $, esc, fmtNum } from "../util.js";

const un = u => u==="kg" ? "kg" : "placas";
const nomeGrupo = G => G.g || (G.u==="placas" ? "placas" : "carga");
const corGrupo = (k, letra) => k===0 ? `var(--p${letra})` : k===1 ? "var(--muted)" : "var(--warn)";
let busca="", filtro="todos";

function mini(pts, letra){
  const vs=pts.slice(-8).map(p => p.v), lo=Math.min(...vs), hi=Math.max(...vs), r=hi-lo||1;
  if(vs.length<2) return `<svg class="mini" viewBox="0 0 64 28" aria-hidden="true"></svg>`;
  return `<svg class="mini L-${esc(letra)}" viewBox="0 0 64 28" aria-hidden="true"><polyline points="${vs.map((v,i)=>`${(2+i*60/(vs.length-1)).toFixed(1)},${(25-(v-lo)/r*22).toFixed(1)}`).join(" ")}"/></svg>`;
}
function lista(){
  const etapaIni=E.inicio||"", todos=progressoExercicios(todasSessoes(), { etapaInicio:etapaIni });
  if(!todos.length) return vazio("trending-up","Seu progresso aparece aqui","Registre as cargas das séries no próximo treino.");
  const letras=LETRAS.filter(l => todos.some(e => e.letras.includes(l)));
  const xs=todos.filter(e => (filtro==="todos" || e.letras.includes(filtro)) && casa(`${e.k} ${e.item}`, busca));
  const lim=somarDias(hojeISO(), -14);
  return `<div class="filtros" role="group" aria-label="Filtrar por treino">${["todos",...letras].map(k=>`<button data-filtro="${esc(k)}" aria-pressed="${k===filtro}">${k==="todos"?"Todos":`${plate(k,"xs")}${esc(k)}`}</button>`).join("")}</div>
    ${xs.length?`<ul class="prog-lista">${xs.map(e => { const P=e.principal, l=e.letras.includes(filtro)?filtro:e.letras[e.letras.length-1];
      const det = [P.g, P.recData>=lim && P.pts.length>1 && P.recorde===P.atual ? `<span class="rec-tag">${icone("trophy")} recorde recente</span>` : `treino ${e.letras.map(esc).join(", ")}`].filter(Boolean).join(" · ");
      return `<li><button data-ex="${esc(e.k)}"><span class="nome">${destacar(esc(e.k), busca)}</span><span class="det">${det}</span>
        <span class="dir">${mini(P.pts, l)}<span class="kg">${fmtNum(P.atual)}${P.u==="placas"?" pl":""}<small class="${P.pct?"":"neutro"}">${P.pct?`${P.pct>0?"+":""}${P.pct}%`:"estável"}</small></span></span></button></li>`; }).join("")}</ul>`
      : vazio("search",`Nada encontrado${busca?` para "${esc(busca)}"`:""}`,"Tente outro nome ou limpe o filtro.")}`;
}
function grafico(e, letra){
  const gs=e.grupos.slice(0,3), datas=[...new Set(gs.flatMap(G => G.pts.map(p => p.data)))].sort().slice(-12);
  const vs=gs.flatMap(G => G.pts.filter(p => datas.includes(p.data)).map(p => p.v)).concat(e.principal.recorde);
  const lo=Math.floor(Math.min(...vs)*.95), hi=Math.ceil(Math.max(...vs)*1.03), W=340, H=170, L=34, R=20, T=12, B=24;
  const x=d => L + (datas.length>1 ? datas.indexOf(d)*(W-L-R)/(datas.length-1) : (W-L-R)/2), y=v => T+(hi-v)/(hi-lo||1)*(H-T-B);
  const marcas=[lo, Math.round((lo+hi)/2), hi];
  const linhas=gs.map((G, k) => { const ps=G.pts.filter(p => datas.includes(p.data)), c=corGrupo(k, letra);
    return `<polyline points="${ps.map(p => `${x(p.data).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ")}" stroke="${c}"/>${ps.map(p => `<circle cx="${x(p.data).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="3.5" fill="${c}"><title>${fmtData(p.data)}: ${fmtNum(p.v)} ${un(G.u)}</title></circle>`).join("")}`; }).join("");
  const rot=datas.map((d, i) => i%Math.ceil(datas.length/4) ? "" : `<text x="${x(d)}" y="${H-6}" text-anchor="middle">${d.slice(8)}/${d.slice(5,7)}</text>`).join("");
  return `<svg class="graf-carga" viewBox="0 0 ${W} ${H}" role="img" aria-label="Carga por treino de ${esc(e.k)}">
    ${marcas.map(v => `<line class="grade" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${fmtNum(v)}</text>`).join("")}
    <line class="rec" x1="${L}" x2="${W-R}" y1="${y(e.principal.recorde)}" y2="${y(e.principal.recorde)}"/>${linhas}${rot}</svg>
    <div class="leg-carga">${gs.map((G, k) => `<span><i style="background:${corGrupo(k, letra)}"></i>${esc(nomeGrupo(G))}</span>`).join("")}<span><i style="background:var(--ok)"></i>recorde ${fmtNum(e.principal.recorde)} ${un(e.principal.u)}</span></div>`;
}
function detalhe(k){
  const e=progressoExercicios(todasSessoes(), { etapaInicio:E.inicio||"" }).find(x => x.k===k);
  if(!e){ nav.progEx=null; return lista(); }
  const P=e.principal, letra=e.letras[e.letras.length-1];
  const ult=todasSessoes().filter(x => (x.itens||[]).some(it => it.cs?.some(s => s.c?.some(c => c.k===k)))).slice(-5).reverse();
  const dicas=guiaDe(e.item);
  return `<button class="btn-link" data-voltar>${icone("chevron-left")} Progresso</button>
    <h1 class="page">${esc(e.k)}</h1><p class="sub">Treino ${e.letras.map(esc).join(", ")}${e.grupos.length>1?` · ${e.grupos.map(nomeGrupo).map(esc).join(" / ")}`:""}</p>
    <div class="stats"><div class="stat"><b>${fmtNum(P.atual)}</b><span>atual · ${un(P.u)}</span></div><div class="stat"><b>${fmtNum(P.recorde)}</b><span>recorde · ${un(P.u)}</span></div>
      <div class="stat"><b>${P.pct>0?"+":""}${P.pct}%</b><span>${E.inicio?"na etapa":"no total"}</span></div></div>
    <section class="panel" aria-label="Carga por treino"><h3>Carga por treino<span class="sub2">maior da sessão</span></h3>${grafico(e, letra)}</section>
    <section class="panel" aria-label="Últimos treinos"><h3>Últimos treinos</h3><ul class="lista-num">${ult.map(x => { const it=x.itens.find(i => i.cs?.some(s => s.c?.some(c => c.k===k)));
      return `<li><span>${fmtData(x.data)}</span><span>${esc(resumoCargas(it))}</span></li>`; }).join("")}</ul></section>
    <section class="panel" aria-label="Como fazer"><h3>Como fazer</h3><ol class="como-ol">${dicas.map(d => `<li>${esc(d)}</li>`).join("")}</ol></section>`;
}
export function viewProgresso(){
  const det=nav.progEx;
  $("#view").innerHTML = det ? detalhe(det) : `<h1 class="page">Progresso</h1><p class="sub">Cargas de todas as etapas</p>
    <label class="busca">${icone("search")}<input id="buscaProg" type="search" placeholder="Buscar exercício" value="${esc(busca)}" aria-label="Buscar exercício" autocomplete="off"></label>
    <div id="progLista">${lista()}</div>
    ${painelRecordes()}${chartVolume()}`;
  const v=$("#view");
  v.onclick=e => {
    const b=e.target.closest("button"); if(!b) return;
    if(b.dataset.filtro){ filtro=b.dataset.filtro; $("#progLista").innerHTML=lista(); return; }
    if(b.dataset.ex){ nav.progEx=b.dataset.ex; render(); scrollTo(0,0); return; }
    if("voltar" in b.dataset){ nav.progEx=null; render(); scrollTo(0,0); return; }
  };
  const inp=$("#buscaProg"); if(inp) inp.oninput=() => { busca=inp.value; $("#progLista").innerHTML=lista(); };
  // "Ver todos os recordes" continua funcionando aqui
  $("#verRecordes") && ($("#verRecordes").onclick=()=>{ alternarRecordes(); const y=scrollY; render(); scrollTo(0,y); });
}
/* Abre o progresso de um exercício (atalho do Guia) */
export function abrirProgresso(k){ nav.progEx=k; nav.tab="progresso"; render(); scrollTo(0,0); }
