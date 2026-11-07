import { recente } from "./movimento.js";
import { E, FICHA, S, save } from "./estado.js";
import { UNID, hojeISO, relDia, unidPadrao } from "./progresso.js";
import { enfileirar } from "./sync.js";
import { PASSO, rerender } from "./telas/sessao.js";
import { fecharFolha, folha } from "./ui.js";
import { esc, fmtNum, numCarga } from "./util.js";
import { seriesDe } from "./series.js";

/* Cargas: kg (passo 2,5), placas (passo 1) ou texto livre. Exercícios combinados ("A + B")
   têm uma carga por parte, salva como "A + B › A". */
export function partesDe(it){
  const nomes=it.nome.split(" + ").map(x=>x.trim()).filter(Boolean);
  const cap = n => n.charAt(0).toUpperCase()+n.slice(1);
  return nomes.length>1 ? nomes.map(n=>({n:cap(n), key:`${it.nome} › ${n}`})) : [{n:it.nome, key:it.nome}];
}
export const temCarga = it => it.series>0 && (it.carga ?? !/abdômen|core/i.test(it.nome));
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
export function blocoCarga(it,i){
  if(!temCarga(it)) return "";
  const ps=partesDe(it), gs=gruposDe(it), legado = ps.length>1 && E.cargas[it.nome];
  const fs=(E.atual?.series||{})[i]||0, gAtual=grupoDaSerie(it, fs);
  const linhas = (g, gi) => ps.map((p,pi)=>{
    const c=cargaDe(chaveCarga(p,g)), n=numCarga(c.v), id=`${i}:${pi}:${gi}`, nome=[p.n, g].filter(Boolean).join(" ");
    const titulo = [ps.length>1?`<b>${esc(p.n)}</b>`:"", g?`<b>${cap(g)}</b>`:""].filter(Boolean).join(" · ") || "Carga";
    const rot=`<div class="c-rot">${titulo}${g && g===gAtual && fs<it.series?` · próxima série`:""}${c.d?` · ${relDia(c.d)}`:""}</div>`;
    const uni=`<button class="c-uni" data-uni="${id}" aria-label="Unidade da carga de ${esc(nome)}">${UNID[c.u]}</button>`;
    if(c.u==="livre" || (c.v && n==null))
      return `${rot}<div class="c-linha"><input class="c-txt" data-txt="${id}" value="${esc(c.v)}" placeholder="ex.: 10 / 20" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Carga de ${esc(nome)}">${uni}</div>`;
    return `${rot}<div class="c-linha"><button class="c-btn" data-passo="${id}:-1" aria-label="Diminuir carga de ${esc(nome)}">−</button>
      <button class="c-val ${recente("carga",400)?.id===id?(recente("carga",400).dir>0?"sobe":"desce"):""}" data-digitar="${id}" aria-label="Digitar carga de ${esc(nome)}">${n==null?"—":fmtNum(n)}</button>
      <button class="c-btn" data-passo="${id}:1" aria-label="Aumentar carga de ${esc(nome)}">+</button>${uni}</div>`;
  }).join("");
  return `<div class="cargas">${gs.map((g,gi)=> gs.length>1
      ? `<div class="c-grupo ${g===gAtual?"atual":""}">${linhas(g,gi)}</div>` : linhas(g,gi)).join("")}
    ${legado?`<p class="meta" style="font-size:14px">Registro anterior: ${esc(E.cargas[it.nome].v)}</p>`:""}</div>`;
}
/* Parte pi do exercício no grupo gi: chave e nome para a folha de digitação */
function alvo(it,pi,gi){ const p=partesDe(it)[pi], g=gruposDe(it)[gi]||""; return { key:chaveCarga(p,g), n:[p.n, g&&cap(g)].filter(Boolean).join(" · ") }; }
export function passoCarga(it,pi,gi,dir){
  const {key}=alvo(it,pi,gi), c=cargaDe(key), u = c.u==="livre" ? "kg" : c.u;
  salvarCarga(key, fmtNum(Math.max(0,(numCarga(c.v)??0)+PASSO[u]*dir)), u); rerender();
}
export function digitarCarga(it,pi,gi){
  const p=alvo(it,pi,gi), c=cargaDe(p.key);
  folha(`<h3>${esc(p.n)}</h3><input class="dig" id="digIn" inputmode="decimal" value="${esc(c.v)}" aria-label="Carga em ${UNID[c.u]}">
    <p class="meta">Em ${UNID[c.u]}.</p><button class="btn primary cor" data-ok>Salvar</button><button class="btn" data-fechar>Cancelar</button>`,
    s=>{ const inp=s.querySelector("#digIn"); inp.focus(); inp.select();
      const ok=()=>{ salvarCarga(p.key, inp.value, c.u); fecharFolha(); rerender(); };
      s.querySelector("[data-ok]").onclick=ok; inp.onkeydown=e=>{ if(e.key==="Enter") ok(); }; });
}
export function trocarUnidade(it,pi,gi){
  const p=alvo(it,pi,gi), c=cargaDe(p.key), ordem=Object.keys(UNID), nova=ordem[(ordem.indexOf(c.u)+1)%ordem.length];
  S.unidades ??= {}; S.unidades[p.key]=nova;
  if(c.v) salvarCarga(p.key, c.v, nova); else save();
  rerender();
}
