import { E, FICHA, S, save } from "./estado.js";
import { UNID, hojeISO, relDia, unidPadrao } from "./progresso.js";
import { enfileirar } from "./sync.js";
import { PASSO, rerender } from "./telas/sessao.js";
import { fecharFolha, folha } from "./ui.js";
import { esc } from "./util.js";

/* Cargas: kg (passo 2,5), placas (passo 1) ou texto livre. Exercícios combinados ("A + B")
   têm uma carga por parte, salva como "A + B › A". */
export function partesDe(it){
  const nomes=it.nome.split(" + ").map(x=>x.trim()).filter(Boolean);
  const cap = n => n.charAt(0).toUpperCase()+n.slice(1);
  return nomes.length>1 ? nomes.map(n=>({n:cap(n), key:`${it.nome} › ${n}`})) : [{n:it.nome, key:it.nome}];
}
export const temCarga = it => it.series>0 && (it.carga ?? !/abdômen|core/i.test(it.nome));
export function cargaDe(key){ const c=E.cargas[key]; return { v: c ? String(c.v) : "", u: (c && c.u) || unidPadrao(key), d: c && c.d }; }
export const numCarga = v => /^\s*\d+([.,]\d+)?\s*$/.test(String(v)) ? parseFloat(String(v).replace(",",".")) : null;
export const fmtNum = n => String(Math.round(n*100)/100).replace(".",",");
export const fmtCarga = c => !c.v ? "—" : (c.u==="livre" || numCarga(c.v)==null) ? c.v : `${c.v} ${UNID[c.u]}`;
export const cargaResumo = it => partesDe(it).map(p=>fmtCarga(cargaDe(p.key))).join(" / ");
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
  const ps=partesDe(it), legado = ps.length>1 && E.cargas[it.nome];
  return `<div class="cargas">${ps.map((p,pi)=>{
    const c=cargaDe(p.key), n=numCarga(c.v);
    const rot=`<div class="c-rot">${ps.length>1?`<b>${esc(p.n)}</b>`:"Carga"}${c.d?` · ${relDia(c.d)}`:""}</div>`;
    const uni=`<button class="c-uni" data-uni="${i}:${pi}" aria-label="Unidade da carga de ${esc(p.n)}">${UNID[c.u]}</button>`;
    if(c.u==="livre" || (c.v && n==null))
      return `${rot}<div class="c-linha"><input class="c-txt" data-txt="${i}:${pi}" value="${esc(c.v)}" placeholder="ex.: 10 / 20" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Carga de ${esc(p.n)}">${uni}</div>`;
    return `${rot}<div class="c-linha"><button class="c-btn" data-passo="${i}:${pi}:-1" aria-label="Diminuir carga de ${esc(p.n)}">−</button>
      <button class="c-val" data-digitar="${i}:${pi}" aria-label="Digitar carga de ${esc(p.n)}">${n==null?"—":fmtNum(n)}</button>
      <button class="c-btn" data-passo="${i}:${pi}:1" aria-label="Aumentar carga de ${esc(p.n)}">+</button>${uni}</div>`;
  }).join("")}${legado?`<p class="meta" style="font-size:14px">Registro anterior: ${esc(E.cargas[it.nome].v)}</p>`:""}</div>`;
}
export function passoCarga(it,pi,dir){
  const p=partesDe(it)[pi], c=cargaDe(p.key), u = c.u==="livre" ? "kg" : c.u;
  salvarCarga(p.key, fmtNum(Math.max(0,(numCarga(c.v)??0)+PASSO[u]*dir)), u); rerender();
}
export function digitarCarga(it,pi){
  const p=partesDe(it)[pi], c=cargaDe(p.key);
  folha(`<h3>${esc(p.n)}</h3><input class="dig" id="digIn" inputmode="decimal" value="${esc(c.v)}" aria-label="Carga em ${UNID[c.u]}">
    <p class="meta">Em ${UNID[c.u]}.</p><button class="btn primary cor" data-ok>Salvar</button><button class="btn" data-fechar>Cancelar</button>`,
    s=>{ const inp=s.querySelector("#digIn"); inp.focus(); inp.select();
      const ok=()=>{ salvarCarga(p.key, inp.value, c.u); fecharFolha(); rerender(); };
      s.querySelector("[data-ok]").onclick=ok; inp.onkeydown=e=>{ if(e.key==="Enter") ok(); }; });
}
export function trocarUnidade(it,pi){
  const p=partesDe(it)[pi], c=cargaDe(p.key), ordem=Object.keys(UNID), nova=ordem[(ordem.indexOf(c.u)+1)%ordem.length];
  S.unidades ??= {}; S.unidades[p.key]=nova;
  if(c.v) salvarCarga(p.key, c.v, nova); else save();
  rerender();
}
