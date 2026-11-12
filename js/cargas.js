import { recente } from "./movimento.js";
import { E, FICHA, S, save } from "./estado.js";
import { UNID, hojeISO, relDia, unidPadrao } from "./progresso.js";
import { enfileirar } from "./sync.js";
import { PASSO, rerender } from "./telas/sessao.js";
import { fecharFolha, folha } from "./ui.js";
import { esc, fmtNum, numCarga } from "./util.js";
import { seriesDe } from "./series.js";
import { temCarga as temCargaFicha } from "./recursos.js";

/* Cargas: kg (passo 2,5), placas (passo 1) ou texto livre. Exercícios combinados ("A + B")
   têm uma carga por parte, salva como "A + B › A". */
export function partesDe(it){
  const nomes=it.nome.split(" + ").map(x=>x.trim()).filter(Boolean);
  const cap = n => n.charAt(0).toUpperCase()+n.slice(1);
  return nomes.length>1 ? nomes.map(n=>({n:cap(n), key:`${it.nome} › ${n}`})) : [{n:it.nome, key:it.nome}];
}
export const temCarga = it => temCargaFicha(it);   // regra única em js/recursos.js
/* Grupos de carga: no contraste, séries "pesado" e "leve" têm cargas separadas, salvas como "Nome · pesado".
   Nos demais exercícios há um grupo só (""), salvo pelo nome. */
const GRUPOS = ["pesado","leve"];
export function gruposDe(it){
  const tags = new Set(seriesDe(it).map(s=>s.tag));
  return GRUPOS.every(g=>tags.has(g)) ? GRUPOS : [""];
}
export function grupoDaSerie(it, j){
  const gs = gruposDe(it); if(gs.length<2) return "";
  const tag = seriesDe(it)[j]?.tag; return gs.includes(tag) ? tag : "";
}
export const chaveCarga = (p, g) => g ? `${p.key} · ${g}` : p.key;
// "pesado" sem registro próprio começa da carga única anterior do exercício
export function cargaDe(key){
  const base = key.endsWith(" · pesado") ? key.slice(0, -" · pesado".length) : null;
  const c = E.cargas[key] || (base && E.cargas[base]);
  return { v: c ? String(c.v) : "", u: (c && c.u) || unidPadrao(key) || (base && unidPadrao(base)), d: c && c.d };
}
export const fmtCarga = c => !c.v ? "—" : (c.u==="livre" || numCarga(c.v)==null) ? c.v : `${c.v} ${UNID[c.u]}`;
const cap = s => s.charAt(0).toUpperCase()+s.slice(1);
/* Carga do grupo g; sem g, todos os grupos ("Pesado 80 kg · Leve 50 kg") */
export function cargaResumo(it, g){
  const gs = g!==undefined ? [g] : gruposDe(it);
  const um = g => partesDe(it).map(p=>fmtCarga(cargaDe(chaveCarga(p,g)))).join(" / ");
  return gs.map(x => x && gs.length>1 ? `${cap(x)} ${um(x)}` : um(x)).join(" · ");
}
/* Retrato das cargas usadas numa série, guardado no treino (volume e recordes vêm daqui) */
export const cargasDaSerie = (it, g) => partesDe(it).map(p => { const c=cargaDe(chaveCarga(p,g)); return { k:p.key, v:c.v, u:c.u }; });
export const envioCarga = {};
export function salvarCarga(key, v, u){
  v=String(v).replace(/[<>]/g,"").trim().replace(/\s+/g," ").slice(0,40);
  if(v==="") delete E.cargas[key]; else E.cargas[key]={ v, u, d:hojeISO() };
  S.unidades ??= {}; S.unidades[key]=u; save();
  // a planilha recebe só o valor final de cada ajuste (vários toques em + viram um envio)
  clearTimeout(envioCarga[key]?.t);
  envioCarga[key]={ op:{tipo:"setCarga", etapa:FICHA.etapa, nome:key, kg:v===""?null:v, u, data:hojeISO()} };
  envioCarga[key].t=setTimeout(()=>enviarCarga(key), 1200);
}
export function enviarCarga(key){ const e=envioCarga[key]; if(!e) return; clearTimeout(e.t); delete envioCarga[key]; enfileirar(e.op); }
export const enviarCargasPendentes = () => Object.keys(envioCarga).forEach(enviarCarga);
/* −, valor, + e unidade da carga da parte pi no grupo gi (ou um campo de texto, na unidade "livre") */
export function controlesCarga(it,i,pi,gi,{ digitar=true, valor=null } = {}){
  const p=partesDe(it)[pi], g=gruposDe(it)[gi]||"", c=valor || cargaDe(chaveCarga(p,g)), n=numCarga(c.v), id=`${i}:${pi}:${gi}`, nome=[p.n, g].filter(Boolean).join(" ");
  const uni=`<button class="c-uni" data-uni="${id}" aria-label="Unidade da carga de ${esc(nome)}">${UNID[c.u]}</button>`;
  if(c.u==="livre" || (c.v && n==null))
    return `<input class="c-txt" data-txt="${id}" value="${esc(c.v)}" placeholder="ex.: 10 / 20" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Carga de ${esc(nome)}">${uni}`;
  return `<button class="c-btn" data-passo="${id}:-1" aria-label="Diminuir carga de ${esc(nome)}">−</button>
    <button class="c-val ${recente("carga",400)?.id===id?(recente("carga",400).dir>0?"sobe":"desce"):""}" ${digitar?`data-digitar="${id}"`:""} aria-label="${digitar?"Digitar carga":"Carga"} de ${esc(nome)}">${n==null?"—":fmtNum(n)}</button>
    <button class="c-btn" data-passo="${id}:1" aria-label="Aumentar carga de ${esc(nome)}">+</button>${uni}`;
}

/* ---------- Carga na linha de cada série (fase 4) ----------
   Vale para exercícios de uma parte só (os combinados "A + B" continuam com o bloco de cargas).
   - contraste (pesado/leve) ou "variar por série": cada série mostra a sua carga; a selecionada abre o − e o +.
     Mudar a carga de uma série muda a do grupo dela, então as próximas do mesmo grupo acompanham.
   - mesma carga em todas: uma linha compacta só, "Carga · todas as séries".
   As séries feitas mostram a carga usada (registrada em E.atual.cs). */
export const cargaPorSerie = it => temCarga(it) && partesDe(it).length===1;
export const variaPorSerie = it => gruposDe(it).length>1 || !!S.variar?.[it.nome];
export const grupoIdx = (it,j) => Math.max(0, gruposDe(it).indexOf(grupoDaSerie(it,j)));
export function serieSelecionada(it,i,a){ const fs=(a.series||{})[i]||0, s=a.selC; return s && s.i===i && s.j>=fs && s.j<it.series ? s.j : fs; }
export function cargaDaSerie(it,i,j,a){
  const fs=(a.series||{})[i]||0, feita=a.cs?.[i]?.[j];
  if(j<fs && feita?.c?.[0]) return fmtCarga(feita.c[0]);
  return fmtCarga(valorPlanejado(it,i,j,a));
}
/* Carga planejada de uma série ainda não feita: a definida para ela neste treino, ou a do grupo */
export function valorPlanejado(it,i,j,a){
  const p=a?.plan?.[i]?.[j]; if(p) return { v:String(p.v), u:p.u };
  const c=cargaDe(chaveCarga(partesDe(it)[0], grupoDaSerie(it,j))); return { v:c.v, u:c.u };
}
/* Mudar a carga da série j vale para ela e para as seguintes do mesmo grupo; as anteriores ainda não feitas
   ficam com o valor que tinham. A carga salva do exercício (para o próximo treino) passa a ser a nova. */
export function planejar(it,i,j,v,u){
  const a=E.atual; if(!a) return;
  v=String(v).replace(/[<>]/g,"").trim().replace(/\s+/g," ").slice(0,40);
  const fs=(a.series||{})[i]||0, g=grupoDaSerie(it,j), mesmo = k => grupoDaSerie(it,k)===g;
  const P=((a.plan ??= {})[i] ??= {});
  for(let k=fs; k<j; k++) if(mesmo(k) && !P[k]) P[k]=valorPlanejado(it,i,k,a);
  for(let k=j; k<it.series; k++) if(mesmo(k)) P[k]={ v, u };
  salvarCarga(chaveCarga(partesDe(it)[0], g), v, u);
}
/* Retrato da carga usada na série f: a planejada para ela, se houver */
export const cargasDaSerieF = (it,i,f,a,g) => a?.plan?.[i]?.[f] && partesDe(it).length===1
  ? [{ k:partesDe(it)[0].key, ...valorPlanejado(it,i,f,a) }] : cargasDaSerie(it,g);
/* Carga usada na mesma série da última vez que o exercício foi feito */
export function ultimaDaSerie(it,j){
  for(let k=E.historico.length-1; k>=0; k--){
    const x=E.historico[k].itens?.find(y=>y.n===it.nome && y.cs?.length); if(!x) continue;
    const c=x.cs[j]?.c?.[0]; return c?.v ? fmtCarga(c) : null;
  }
  return null;
}
export const linhaCargaUnica = (it,i) => `<div class="carga-linha"><span class="rotulo">Carga<small>todas as séries</small></span>${controlesCarga(it,i,0,0)}</div>`;
export const linhaCargaSerie = (it,i,j,a) => { const [r,t]=[seriesDe(it)[j]?.r??"", grupoDaSerie(it,j)];
  return `<div class="carga-linha"><span class="rotulo">Série ${j+1}<small>${esc(r)}${t?` ${t}`:""}</small></span>${controlesCarga(it,i,0,grupoIdx(it,j),{ valor:valorPlanejado(it,i,j,a) })}</div>`; };
export const linkVariar = (it,i) => gruposDe(it).length>1 ? "" : `<button class="link-btn" data-variar="${i}">${S.variar?.[it.nome]?"Usar a mesma carga em todas":"Variar a carga por série"}</button>`;

export function blocoCarga(it,i){
  if(!temCarga(it)) return "";
  const ps=partesDe(it), gs=gruposDe(it), legado = ps.length>1 && E.cargas[it.nome];
  const fs=(E.atual?.series||{})[i]||0, gAtual=grupoDaSerie(it, fs);
  const linhas = (g, gi) => ps.map((p,pi)=>{
    const c=cargaDe(chaveCarga(p,g)), n=numCarga(c.v), id=`${i}:${pi}:${gi}`, nome=[p.n, g].filter(Boolean).join(" ");
    const titulo = [ps.length>1?`<b>${esc(p.n)}</b>`:"", g?`<b>${cap(g)}</b>`:""].filter(Boolean).join(" · ") || "Carga";
    const rot=`<div class="c-rot">${titulo}${g && g===gAtual && fs<it.series?` · próxima série`:""}${c.d?` · ${relDia(c.d)}`:""}</div>`;
    return `${rot}<div class="c-linha">${controlesCarga(it,i,pi,gi)}</div>`;
  }).join("");
  return `<div class="cargas">${gs.map((g,gi)=> gs.length>1
      ? `<div class="c-grupo ${g===gAtual?"atual":""}">${linhas(g,gi)}</div>` : linhas(g,gi)).join("")}
    ${legado?`<p class="meta" style="font-size:14px">Registro anterior: ${esc(E.cargas[it.nome].v)}</p>`:""}</div>`;
}
/* Parte pi do exercício no grupo gi: chave e nome para a folha de digitação */
function alvo(it,pi,gi){ const p=partesDe(it)[pi], g=gruposDe(it)[gi]||""; return { key:chaveCarga(p,g), n:[p.n, g&&cap(g)].filter(Boolean).join(" · ") }; }
export function passoCarga(it,pi,gi,dir,{ i=null, j=null } = {}){
  if(j!=null && E.atual){ const c=valorPlanejado(it,i,j,E.atual), u = c.u==="livre" ? "kg" : c.u;
    planejar(it,i,j, fmtNum(Math.max(0,(numCarga(c.v)??0)+PASSO[u]*dir)), u); return rerender(); }
  const {key}=alvo(it,pi,gi), c=cargaDe(key), u = c.u==="livre" ? "kg" : c.u;
  salvarCarga(key, fmtNum(Math.max(0,(numCarga(c.v)??0)+PASSO[u]*dir)), u); rerender();
}
export function digitarCarga(it,pi,gi,{ i=null, j=null } = {}){
  const p=alvo(it,pi,gi), porSerie = j!=null && E.atual, c = porSerie ? valorPlanejado(it,i,j,E.atual) : cargaDe(p.key);
  if(porSerie) p.n += ` · série ${j+1}`;
  folha(`<h3>${esc(p.n)}</h3><input class="dig" id="digIn" inputmode="decimal" value="${esc(c.v)}" aria-label="Carga em ${UNID[c.u]}">
    <p class="meta">Em ${UNID[c.u]}.</p><button class="btn primary cor" data-ok>Salvar</button><button class="btn" data-fechar>Cancelar</button>`,
    s=>{ const inp=s.querySelector("#digIn"); inp.focus(); inp.select();
      const ok=()=>{ if(porSerie) planejar(it,i,j, inp.value, c.u); else salvarCarga(p.key, inp.value, c.u); fecharFolha(); rerender(); };
      s.querySelector("[data-ok]").onclick=ok; inp.onkeydown=e=>{ if(e.key==="Enter") ok(); }; });
}
export function trocarUnidade(it,pi,gi){
  const p=alvo(it,pi,gi), c=cargaDe(p.key), ordem=Object.keys(UNID), nova=ordem[(ordem.indexOf(c.u)+1)%ordem.length];
  S.unidades ??= {}; S.unidades[p.key]=nova;
  if(c.v) salvarCarga(p.key, c.v, nova); else save();
  rerender();
}
