import { consumirRepeticao, confete, contar, marcar, recente, segurarRepete } from "../movimento.js";
import { blocoCarga, cargasDaSerieF, valorPlanejado, cargaDaSerie, cargaDe, cargaPorSerie, cargaResumo, cargasDaSerie, chaveCarga, controlesCarga, digitarCarga, enviarCargasPendentes, grupoDaSerie, grupoIdx, gruposDe, linhaCargaSerie, linhaCargaUnica, linkVariar, partesDe, passoCarga, salvarCarga, serieSelecionada, temCarga, trocarUnidade, ultimaDaSerie, variaPorSerie } from "../cargas.js";
import { iniciarDescanso, maisTempo, pararDescanso } from "../descanso.js";
import { E, FICHA, S, save } from "../estado.js";
import { copiarTexto, guiaDe, linkClaude, metodosDe, notaExpress, perguntaClaude } from "../guia-exercicios.js";
import { nav, render } from "../navegacao.js";
import { hojeISO, isoDe, minutos, proxima, relDia, semTxt, semanaAtual, temExpress, totalMin, treino, voltasDo } from "../progresso.js";
import { rotSerie, seriesDe, tempoDe } from "../series.js";
import { fmtRec, fmtVolume, recordesDaSessao, resumoCargas, temCargas, volumeSessao } from "../metricas.js";
import { enfileirar, hora } from "../sync.js";
import { desfazer, fecharFolha, fmtMin, fmtSeg, folha, ico, manterTela, plate, toast } from "../ui.js";
import { $, esc, fmtNum } from "../util.js";
import { icone } from "../icones.js";
import { acaoTempo, alternarLivre, limparCronometros, marcarAproximacao, minimizarExec, previaFases, avancarParte, iniciarExec, livreDe, livreHtml, pararExec, playLivre, zerarLivre } from "../execucao.js";

/* ---------- Sessão: peças comuns aos modos lista e foco ---------- */
export const ICO = { mais:icone("ellipsis"), lista:icone("list"), copiar:icone("copy") };
export const PASSO = { kg:2.5, placas:1 };
export const treinoAtual = a => treino(a.letra, a.fase, a.volta ?? a.semana ?? undefined, a.modo||"completo");
export const minDesde = t => Math.max(0, Math.round((Date.now()-t)/6e4));
export const rerender = (topo=false) => { const y=scrollY; render(); scrollTo(0, topo?0:y); };
export const primeiroPendente = (a,t) => { const i=t.itens.findIndex((_,k)=>!a.feitos.includes(k)); return i<0 ? t.itens.length-1 : i; };
/* Botão de ação: "Série N de M feita"; com descanso no botão, vira o cronômetro (tocar nele pula). */
export function botaoAcao(it,i,a,destaque){
  const T=S.timer;
  if(T && T.k===i && S.pref.descanso==="botao" && T.fim>Date.now())
    return `<div class="t-linha"><button class="btn primary cor t-btn" data-pular aria-label="Pular descanso"><span class="t-fill" id="tFill"></span>${icone("timer")}<span id="tTxt">${fmtSeg((T.fim-Date.now())/1000)}</span></button>
      <button class="btn t-mais" data-mais15>+15 s</button></div>`;
  const cls = destaque ? "primary cor" : "";
  const tx = acaoTempo(it,i,a,cls); if(tx) return tx;
  if(!it.series){
    const ok=a.feitos.includes(i);
    return `<div class="linha2"><button class="btn" data-bloco="${i}">${icone("play")} ${it.bloco} min</button><button class="btn ${ok?"":cls} ${ok&&recente("feito")?.i===i?"feito-btn":""}" data-feito="${i}">${ok?`${icone("check")} Feito`:"Marcar feito"}</button></div>`;
  }
  const f=(a.series||{})[i]||0;
  if(f>=it.series) return `<button class="btn reabrir" data-reabrir="${i}">${ico.check} Concluído · ${it.series}/${it.series} · desfazer</button>`;
  return `<button class="btn ${cls} serie-btn ${recente("fimDescanso",2600)?.k===i?"acende":""}" data-serie="${i}">${ico.check}<span>Série ${f+1} de ${it.series} feita</span></button>`;
}
export const chipsDe = it => (it.series>0
  ? [`${it.series} ${it.series>1?"séries":"série"}`, `${it.descanso}s de descanso`, `≈ ${fmtMin(minutos(it))}`].concat(voltasDo(it)&&voltasDo(it).length?[semTxt(voltasDo(it))]:[])
  : [`${it.bloco} min`]).map(c=>`<span class="chip">${c}</span>`).join("");
export function topoSessao(a,t){
  const n=t.itens.length;
  return `<div class="s-topo"><button class="icon-btn s-ic" id="sMenu" aria-label="Opções do treino">${ICO.mais}</button>
    <div class="s-tit">${plate(a.letra,"xs")}<div><b>Treino ${esc(a.letra)}${a.modo==="express"?" · express":""}</b><span class="meta">${a.feitos.length} de ${n} feitos · ${minDesde(a.inicio)} min</span></div></div>
    ${S.pref.modo==="foco"?`<button class="icon-btn s-ic" id="sLista" aria-label="Ver todos os exercícios">${ICO.lista}</button>`:`<span class="s-ic" aria-hidden="true"></span>`}</div>
  <div class="s-prog">${t.itens.map((_,i)=>`<span class="${a.feitos.includes(i)?"ok":i===a.ativo?"at":""}"></span>`).join("")}</div>
  ${a.modo==="express" && notaExpress(t)?`<p class="meta" style="font-size:14px;margin:0 2px 12px">${esc(notaExpress(t))}</p>`:""}`;
}
/* O que acabou de mudar ganha animação na próxima renderização */
const pop = (i,j) => { const m=recente("serie"); return m && m.i===i && (j===undefined || m.j===j); };
const recem = i => { const s=recente("serie"), f=recente("feito"); return (s && s.i===i && s.fim) || (f && f.i===i); };
/* Série que recebe o ajuste de carga: a selecionada, quando a carga varia por série (senão, a carga do exercício) */
const alvoSerie = (it,i,a) => cargaPorSerie(it) && variaPorSerie(it) && !a.feitos.includes(i) ? { i, j:serieSelecionada(it,i,a) } : {};
/* Lista: cada bolinha mostra a carga da série; uma linha compacta ajusta a série selecionada (ou todas) */
const curto = s => s.replace(/ kg$/,"").replace(/ placas$/," pl");
function pipsComCarga(it,i,a,ser,fs){
  const varia=variaPorSerie(it), sel=serieSelecionada(it,i,a);
  return `<div class="pips-kg">${ser.map((s,j)=>{ const feita=j<fs, edita=varia && !feita;
      return `<button class="pk ${feita?"feita":j===fs?"atual":""} ${varia&&j===sel&&!feita?"sel":""} ${pop(i,j)?"pop":""}" ${edita?`data-selc="${i}:${j}" aria-label="Série ${j+1}: ajustar carga"`:`tabindex="-1" aria-hidden="true"`}>
        <span class="pip ${feita?"on":""}"></span>${varia||feita?esc(curto(cargaDaSerie(it,i,j,a))):""}<small>${esc(s.tag||s.r)}</small></button>`; }).join("")}</div>
    ${varia ? linhaCargaSerie(it,i,sel,a) : linhaCargaUnica(it,i)}${linkVariar(it,i)}`;
}
/* Foco: cada linha de série com a carga dela; a selecionada abre o − e o + na própria linha */
function seriesComCarga(it,i,a,ser,fs,done){
  const varia=variaPorSerie(it), sel=serieSelecionada(it,i,a);
  const linhas=ser.map((s,j)=>{ const feita=j<fs, ed=!done && varia && j===sel && !feita, u=ultimaDaSerie(it,j);
    const kg = varia || feita ? `<span class="kgcol"><span class="kg ${feita?"":"plan"}">${esc(cargaDaSerie(it,i,j,a))}</span>${u?`<span class="ult">última ${esc(u)}</span>`:""}</span>` : "";
    return `<div class="f-serie ${feita?"feita":j===fs?"atual":""} ${ed?"edita":""} ${pop(i,j)?"pop":""}" ${!feita&&varia&&!done?`data-selc="${i}:${j}"`:""}>
      <span class="n">${j+1}${feita?icone("check","ic-sm"):""}</span><span class="reps">${esc(s.r)}${s.tag?` <span class="tag">${esc(s.tag)}</span>`:""}</span>${kg}
      ${ed?`<div class="passo">${controlesCarga(it,i,0,grupoIdx(it,j),{ valor:valorPlanejado(it,i,j,a) })}</div>`:""}</div>`; }).join("");
  return `${!done && !varia ? linhaCargaUnica(it,i) : ""}<div class="f-series">${linhas}</div>${!done ? linkVariar(it,i) : ""}`;
}
export function sessaoLista(a,t){
  const n=t.itens.length, f=a.feitos.length;
  const cards=t.itens.map((it,i)=>{
    const done=a.feitos.includes(i), ativo=a.ativo===i, forca=it.series>0, fs=(a.series||{})[i]||0, ser=forca?seriesDe(it):[];
    const emDescanso = S.timer && S.timer.k===i;
    return `<li class="item ${done?"done":""} ${ativo&&!done?"ativo":""} ${done&&recem(i)?"recem":""}" data-item="${i}">
      <div class="i-cab"><div class="i-tit"><p class="name">${esc(it.nome)}</p>${ativo&&!done?`<span class="ativo-tag">em execução</span>`:""}</div>
        ${ativo&&!done?`<button class="info-btn ${S.livre?.k===i?"on":""}" data-livre="${i}" aria-label="Cronômetro livre">${icone("timer")}</button>`:""}
        <button class="info-btn" data-info="${i}" aria-label="Como fazer ${esc(it.nome)}">${icone("info")}</button></div>
      <p class="presc">${esc(it.prescricao)}</p>${!done?previaFases(it):""}
      ${ativo&&!done?livreHtml(i):""}
      <div class="chips">${chipsDe(it)}</div>
      ${it.obs?`<p class="obs">${esc(it.obs)}</p>`:""}
      ${forca && ativo && !done && cargaPorSerie(it) ? pipsComCarga(it,i,a,ser,fs) : forca?`<div class="i-pips"><div class="pips" aria-hidden="true">${ser.map((_,j)=>`<span class="pip ${j<fs?"on":""} ${pop(i,j)?"pop":""}"></span>`).join("")}</div><b class="cnt ${pop(i)?"pop":""}">${fs}/${it.series}</b>
        ${fs<it.series?`<span class="meta prox-serie">próxima: ${esc(rotSerie(ser[fs]))}</span>`:""}</div>`:""}
      ${done && a.marcas?.[i] ? `<p class="done-at">${ico.check} Feito às ${hora(a.marcas[i])}</p>` : ""}
      ${ativo && !done ? (cargaPorSerie(it) ? "" : blocoCarga(it,i)) : (temCarga(it)?`<p class="meta c-resumo">Carga: ${esc(cargaResumo(it))}</p>`:"")}
      ${done && !emDescanso ? (forca?botaoAcao(it,i,a,false):"") : botaoAcao(it,i,a,ativo)}
    </li>`;
  }).join("");
  return `<ul class="items">${cards}</ul>
  <section class="panel fim-treino" style="text-align:center">
    <p class="meta" style="margin:0 0 12px">${f===n?"Todos os itens concluídos.":`${n-f} ${n-f>1?"itens pendentes":"item pendente"}.`}</p>
    <button class="btn primary cor grande block" id="finishBtn">Concluir treino ${esc(a.letra)}</button>
  </section>`;
}
export function sessaoFoco(a,t){
  const i=a.ativo, it=t.itens[i], forca=it.series>0, fs=(a.series||{})[i]||0, done=a.feitos.includes(i);
  const ser=forca?seriesDe(it):[], prox=t.itens[i+1], emDescanso = S.timer && S.timer.k===i;
  const lista = forca && cargaPorSerie(it) ? seriesComCarga(it,i,a,ser,fs,done)
    : forca ? `<div class="f-series">${ser.map((s,j)=>`<div class="f-serie ${j<fs?"feita":j===fs?"atual":""} ${pop(i,j)?"pop":""}"><span class="n">${j+1}${j<fs?icone("check","ic-sm"):""}</span><span>${esc(s.r)}</span>${s.tag?`<span class="tag">${esc(s.tag)}</span>`:""}</div>`).join("")}</div>`
    : `<p class="presc" style="font-size:19px;margin:14px 0 4px">${esc(it.prescricao)}</p>${previaFases(it)}`;
  return `<h2 class="f-nome">${esc(it.nome)}</h2>
    <div class="chips">${chipsDe(it)}<button class="btn f-como" data-info="${i}">Como fazer</button><button class="btn f-como ${S.livre?.k===i?"on":""}" data-livre="${i}" aria-label="Cronômetro livre">${icone("timer")}</button></div>
    ${livreHtml(i)}
    ${forca?`<p class="presc meta">${esc(it.prescricao)}</p>`:""}
    ${it.obs?`<p class="obs">${esc(it.obs)}</p>`:""}
    ${lista}
    <div class="f-rodape">
      ${!done && !cargaPorSerie(it) ? blocoCarga(it,i) : ""}
      ${botaoAcao(it,i,a,true)}
      ${done && !emDescanso ? `<button class="btn primary cor grande block" data-navega="1" style="margin-top:12px">${prox?`Próximo: ${esc(prox.nome)}`:`Concluir treino ${esc(a.letra)}`}</button>` : ""}
    </div>
    <div class="f-nav"><button class="btn" data-navega="-1" ${i===0?"disabled":""}>${icone("chevron-left")} Anterior</button><button class="btn" data-navega="1">${prox?`Próximo ${icone("chevron-right")}`:"Concluir"}</button></div>`;
}
export function viewSessao(){
  const a=E.atual, t=treinoAtual(a);
  a.series ??= {};
  if(a.ativo==null || a.ativo>=t.itens.length) a.ativo = primeiroPendente(a,t);
  $("#view").innerHTML = `<div class="L-${esc(a.letra)}">${topoSessao(a,t)}${S.pref.modo==="foco" ? sessaoFoco(a,t) : sessaoLista(a,t)}</div>`;
  $("#view").onclick = cliqueSessao;
  segurarRepete($("#view"), "[data-passo]", dado=>{ const b=E.atual; if(!b) return; const [i,pi,gi,dir]=dado.passo.split(":").map(Number);
    marcar("carga",{id:`${i}:${pi}:${gi}`, dir}); const it=treinoAtual(b).itens[i]; passoCarga(it,pi,gi,dir,alvoSerie(it,i,b)); });
  $("#view").onchange = e => {
    const inp=e.target.closest("[data-txt]"); if(!inp) return;
    const [i,pi,gi]=inp.dataset.txt.split(":").map(Number), it=treinoAtual(E.atual).itens[i];
    const key=chaveCarga(partesDe(it)[pi], gruposDe(it)[gi]||"");
    salvarCarga(key, inp.value, cargaDe(key).u);
  };
  manterTela(true);
}
export function cliqueSessao(e){
  const a=E.atual; if(!a) return;
  const t=treinoAtual(a), el=e.target.closest("button,a,input,[data-selc],[data-item]"); if(!el || el.matches("a,input")) return;
  const d=el.dataset, par = v => v.split(":").map(Number);
  if(d.serie!=null) return registrarSerie(+d.serie);
  if(d.selc){ const [i,j]=par(d.selc); a.selC={i,j}; save(); return rerender(); }
  if(d.variar!=null){ const nome=t.itens[+d.variar].nome; S.variar ??= {}; if(S.variar[nome]) delete S.variar[nome]; else S.variar[nome]=true; save(); return rerender(); }
  if(d.exec!=null) return iniciarExec(+d.exec);
  if(d.execParar!=null) return pararExec();
  if(d.execMax!=null) return minimizarExec(false);
  if(d.aq!=null) return marcarAproximacao(+d.aq);
  if(d.execPausa){ const [i,k]=par(d.execPausa), pt=tempoDe(t.itens[i])?.partes?.[k]; if(pt?.pausa) return iniciarExec(i,{pausa:pt}); return; }
  if(d.rp!=null) return avancarParte(+d.rp);
  if(d.livre!=null) return alternarLivre(+d.livre);
  if(d.livrePlay!=null) return playLivre();
  if(d.livreZerar!=null) return zerarLivre();
  if(d.pular!=null) return pararDescanso();
  if(d.mais15!=null) return maisTempo(15);
  if(d.bloco!=null){ const i=+d.bloco; a.ativo=i; save(); return iniciarDescanso(i, t.itens[i].bloco*60, "Fim do bloco"); }
  if(d.feito!=null) return alternarFeito(+d.feito);
  if(d.reabrir!=null) return reabrir(+d.reabrir);
  if(d.info!=null) return comoFazer(t.itens[+d.info], a.letra);
  if(d.passo){ if(consumirRepeticao()) return; const [i,pi,gi,dir]=par(d.passo); marcar("carga",{id:`${i}:${pi}:${gi}`, dir}); return passoCarga(t.itens[i],pi,gi,dir,alvoSerie(t.itens[i],i,a)); }
  if(d.digitar){ const [i,pi,gi]=par(d.digitar); return digitarCarga(t.itens[i],pi,gi,alvoSerie(t.itens[i],i,a)); }
  if(d.uni){ const [i,pi,gi]=par(d.uni), it=t.itens[i]; trocarUnidade(it,pi,gi);
    // a unidade vale para o exercício todo, inclusive as cargas planejadas por série
    if(a.plan?.[i]){ const u=cargaDe(chaveCarga(partesDe(it)[pi], gruposDe(it)[gi]||"")).u; for(const k in a.plan[i]) a.plan[i][k].u=u; save(); rerender(); }
    return; }
  if(d.navega){ const nv=a.ativo+(+d.navega); if(nv>=t.itens.length) return concluir(); if(nv<0) return; a.ativo=nv; save(); return rerender(true); }
  if(el.id==="sMenu") return menuSessao();
  if(el.id==="sLista") return listaGeral();
  if(el.id==="finishBtn") return concluir();
  if(d.item!=null && el.matches("[data-item]")){ const i=+d.item; if(a.ativo!==i){ a.ativo=i; save(); rerender(); } }
}
export function registrarSerie(i){
  const a=E.atual, t=treinoAtual(a), it=t.itens[i]; a.series ??= {};
  const f=a.series[i]||0; if(f>=it.series) return;
  const ser=seriesDe(it);
  if(temCarga(it)){ const g=grupoDaSerie(it,f); ((a.cs ??= {})[i] ??= [])[f] = { r:ser[f]?.r ?? "", g, c:cargasDaSerieF(it,i,f,a,g) }; }
  if(a.rp) delete a.rp[i];
  delete a.selC;
  const tl=Math.round(livreDe(i)); if(tl>0){ ((a.tm ??= {})[i] ??= [])[f]=tl; S.livre.acum=0; if(S.livre.ini) S.livre.ini=Date.now(); }
  a.series[i]=f+1; a.ativo=i; navigator.vibrate?.(15); marcar("serie",{i, j:f, fim:f+1===it.series});
  const fimEx = a.series[i]===it.series;
  if(fimEx && !a.feitos.includes(i)){ a.feitos.push(i); (a.marcas ??= {})[i]=Date.now(); }
  save();
  desfazer(`Série ${f+1} de ${it.series} registrada`, ()=>{
    a.series[i]=f; if(a.cs?.[i]) a.cs[i].length=Math.min(a.cs[i].length,f); const k=a.feitos.indexOf(i); if(k>=0){ a.feitos.splice(k,1); delete a.marcas[i]; }
    pararDescanso(false); save(); rerender();
  });
  const seguinte=t.itens[i+1];
  const prox = !fimEx ? `Série ${f+2} · ${rotSerie(ser[f+1])}${temCarga(it)?` · ${cargaPorSerie(it) ? cargaDaSerie(it,i,f+1,a) : cargaResumo(it, grupoDaSerie(it,f+1))}`:""}` : (seguinte ? `Próximo: ${seguinte.nome}` : "");
  if(!fimEx || seguinte) iniciarDescanso(i, it.descanso, prox); else rerender();
}
export function alternarFeito(i){
  const a=E.atual, k=a.feitos.indexOf(i); a.marcas ??= {};
  if(k>=0){ a.feitos.splice(k,1); delete a.marcas[i]; }
  else { a.feitos.push(i); a.marcas[i]=Date.now(); navigator.vibrate?.(15); marcar("feito",{i}); if(S.timer?.k===i) pararDescanso(false);
    desfazer(`${treinoAtual(a).itens[i].nome} feito`, ()=>{ const j=a.feitos.indexOf(i); if(j>=0){ a.feitos.splice(j,1); delete a.marcas[i]; } save(); rerender(); }); }
  save(); rerender();
}
export function reabrir(i){
  const a=E.atual; a.series ??= {}; a.series[i]=Math.max(0,(a.series[i]||0)-1);
  if(a.cs?.[i]) a.cs[i].length=Math.min(a.cs[i].length,a.series[i]);
  const k=a.feitos.indexOf(i); if(k>=0){ a.feitos.splice(k,1); delete a.marcas?.[i]; }
  a.ativo=i; save(); rerender();
}
export function comoFazer(it, letra){
  const mets=metodosDe(it), c=temCarga(it)?cargaResumo(it):"";
  folha(`<h3>${esc(it.nome)}</h3>
    <h4>Como executar</h4><ul>${guiaDe(it.nome).map(d=>`<li>${esc(d)}</li>`).join("")}</ul>
    ${mets.length?`<h4>Método</h4>${mets.map(([m,d])=>`<p><strong>${esc(m)}</strong>${d?`: ${esc(d)}`:""}</p>`).join("")}`:""}
    <h4>Nesta ficha</h4><p>${esc(it.prescricao)}${it.series?`. ${it.series} ${it.series>1?"séries":"série"}, ${it.descanso}s de descanso`:`. ${it.bloco} min`}.${it.obs?` ${esc(it.obs)}.`:""}</p>
    ${c && c!=="—"?`<p>Última carga: <strong>${esc(c)}</strong></p>`:""}
    <a class="btn claude" href="${linkClaude(it,letra)}" target="_blank" rel="noopener">Perguntar ao Claude</a>
    <button class="btn" data-copiar>${ICO.copiar} Copiar a pergunta</button>
    <button class="btn" data-fechar>Fechar</button>`,
    f=>{ f.querySelector("[data-copiar]").onclick=async()=>{ const ok=await copiarTexto(perguntaClaude(it,letra)); toast(ok?"Pergunta copiada. Cole no projeto do Claude.":"Não foi possível copiar neste navegador"); }; });
}
export function menuSessao(){
  const a=E.atual, outro = a.modo==="express" ? "completo" : "express";
  const tOutro = temExpress(a.letra) ? treino(a.letra,a.fase,a.volta ?? a.semana ?? undefined,outro) : null;
  folha(`<h3>Opções do treino</h3>
    <h4>Modo do treino</h4>
    <div class="seg"><button data-m="lista" aria-pressed="${S.pref.modo==="lista"}">Lista</button><button data-m="foco" aria-pressed="${S.pref.modo==="foco"}">Foco</button></div>
    ${tOutro?`<button class="btn" data-versao="${outro}">Trocar para ${outro==="express"?"Express":"Completo"} · ${Math.round(totalMin(tOutro))} min</button>`:""}
    <div class="linha2" style="margin-top:0"><button class="btn" data-aba="ficha">Ver ficha</button><button class="btn" data-aba="guia">Ver guia</button></div>
    <div style="height:8px"></div>
    <button class="btn danger" data-cancelar>Cancelar treino</button>
    <button class="btn" data-fechar>Fechar</button>`,
    f=>{
      f.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{ S.pref.modo=b.dataset.m; save(); fecharFolha(); rerender(true); });
      f.querySelector("[data-versao]")?.addEventListener("click", e=>{ fecharFolha(); trocarVersao(e.currentTarget.dataset.versao); });
      f.querySelectorAll("[data-aba]").forEach(b=>b.onclick=()=>{ fecharFolha(); nav.tab=b.dataset.aba; render(); scrollTo(0,0); });
      f.querySelector("[data-cancelar]").onclick=()=>{
        f.querySelector(".corpo").innerHTML=`<h3>Cancelar o treino ${esc(a.letra)}?</h3><p class="meta">As séries marcadas não serão registradas.</p>
          <button class="btn" data-fechar>Voltar ao treino</button><div style="height:8px"></div><button class="btn danger" data-sim>Sim, cancelar</button>`;
        f.querySelector("[data-sim]").onclick=()=>{ fecharFolha(); pararDescanso(false); limparCronometros(); E.atual=null; save(); manterTela(false); render(); scrollTo(0,0); };
      };
    });
}
export function listaGeral(){
  const a=E.atual, t=treinoAtual(a);
  folha(`<h3>Treino ${esc(a.letra)}</h3>
    ${t.itens.map((it,i)=>{ const ok=a.feitos.includes(i), fs=(a.series||{})[i]||0;
      return `<button class="ex ${i===a.ativo?"at":""} ${ok?"ok":""}" data-ir="${i}"><span class="cnt">${i+1}</span><span>${esc(it.nome)}</span><span class="st">${it.series?`${fs}/${it.series}`:(ok?"feito":`${it.bloco} min`)}</span></button>`; }).join("")}
    <button class="btn" data-fechar>Fechar</button>`,
    f=>f.querySelectorAll("[data-ir]").forEach(b=>b.onclick=()=>{ a.ativo=+b.dataset.ir; save(); fecharFolha(); rerender(true); }));
}
export function trocarVersao(novo){
  const a=E.atual, t=treinoAtual(a);
  if(novo===(a.modo||"completo")) return;
  const temAlgo = a.feitos.length || Object.values(a.series||{}).some(v=>v>0);
  if(temAlgo && !confirm(`Trocar para ${novo==="express"?"Express":"Completo"}? Os exercícios que existem nas duas versões mantêm as marcações e séries.`)) return;
  const novoT=treino(a.letra,a.fase,a.volta ?? a.semana ?? undefined,novo);
  const map={}; t.itens.forEach((it,i)=>{ const j=novoT.itens.findIndex(x=>x.nome===it.nome); if(j>=0) map[i]=j; });
  const remap=obj=>{ const o={}; for(const [k,v] of Object.entries(obj||{})) if(map[k]!=null) o[map[k]]=v; return o; };
  a.feitos=a.feitos.filter(i=>map[i]!=null).map(i=>map[i]);
  a.marcas=remap(a.marcas); a.series=remap(a.series); a.cs=remap(a.cs);
  for(const k in a.series) a.series[k]=Math.min(a.series[k], novoT.itens[k].series||0);
  for(const k in a.cs) a.cs[k].length=Math.min(a.cs[k].length, a.series[k]||0);
  a.ativo = a.ativo!=null && map[a.ativo]!=null ? map[a.ativo] : 0;
  pararDescanso(false); a.modo=novo; save(); rerender(true);
}
export function concluir(){
  const a=E.atual, t=treino(a.letra,a.fase,a.volta ?? a.semana ?? undefined, a.modo||"completo"), falt=t.itens.length-a.feitos.length;
  if(!confirm(falt>0 ? `Faltam ${falt} ${falt>1?"itens":"item"} sem marcar. Concluir o treino ${a.letra} assim mesmo?` : `Concluir o treino ${a.letra} e registrar ${Math.round((Date.now()-a.inicio)/6e4)} min?`)) return;
  if(!E.inicio){ E.inicio = hojeISO(); enfileirar({tipo:"setConfig", chave:`etapa.${FICHA.etapa}.inicio`, valor:E.inicio}); }
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  const fim=Date.now();
  const itens = a.feitos.slice().sort((x,y)=>(a.marcas?.[x]||0)-(a.marcas?.[y]||0))
    .map(i=>({ n:t.itens[i].nome, t: a.marcas?.[i] ? Math.round((a.marcas[i]-a.inicio)/1000) : null, e: Math.round(minutos(t.itens[i])*60), ...(t.itens[i].series ? {s:a.series?.[i]||0, sp:t.itens[i].series} : {}), ...(a.cs?.[i]?.filter(Boolean).length ? {cs:a.cs[i].filter(Boolean)} : {}), ...(a.tm?.[i]?.filter(Boolean).length ? {tm:a.tm[i].filter(Boolean)} : {}) }));
  // exercícios com séries registradas mas não concluídos entram como parciais (p:1), só para guardar as cargas
  for(const [k,n] of Object.entries(a.series||{})){ const i=+k, cs=a.cs?.[i]?.filter(Boolean);
    if(n>0 && !a.feitos.includes(i) && t.itens[i] && cs?.length) itens.push({ n:t.itens[i].nome, t:null, e:Math.round(minutos(t.itens[i])*60), s:n, sp:t.itens[i].series, cs, p:1 }); }
  E.historico.push({ id, letra:a.letra, fase:a.fase, semana:semanaAtual(), data:isoDe(new Date(a.inicio)), // data do início, mesmo se passar da meia-noite
    duracao: Math.round((fim-a.inicio)/6e4), feitos:a.feitos.length, total:t.itens.length,
    inicio: hora(a.inicio), fim: hora(fim), itens, modo: a.modo||"completo", volta: a.volta ?? null, numero: E.historico.length+1 });
  { const x=E.historico[E.historico.length-1]; enfileirar({tipo:"addSessao", etapa:FICHA.etapa, ...x}); }
  const seriesFeitas=Object.values(a.series||{}).reduce((x,y)=>x+y,0), x=E.historico[E.historico.length-1];
  const anterior=E.historico.slice(0,-1).filter(h=>h.letra===a.letra && h.duracao>0).pop();
  // volume e recordes (só existem nos treinos registrados com carga por série)
  const vol=volumeSessao(x), antComCarga=E.historico.slice(0,-1).filter(h=>h.letra===a.letra && temCargas(h)).pop();
  const volAnt=antComCarga?volumeSessao(antComCarga):0, difVol=volAnt?Math.round((vol/volAnt-1)*100):0;
  const outras=Object.values(S.etapas).flatMap(e=>e.historico||[]).filter(h=>h!==x);
  const recs=recordesDaSessao(x, outras);
  const linhasCargas=x.itens.filter(i=>i.cs?.length).map(i=>`<li><span>${esc(i.n)}</span><span>${esc(resumoCargas(i))}</span></li>`).join("");
  E.atual=null; limparCronometros(); save(); pararDescanso(false); enviarCargasPendentes(); manterTela(false); $("#desfazer")?.remove();
  render(); scrollTo(0,0);
  folha(`<div class="L-${esc(a.letra)}" style="display:flex;align-items:center;gap:14px">${plate(a.letra,"sm d3")}<div><h3>Treino ${esc(a.letra)} concluído</h3><p class="meta">${x.inicio}–${x.fim}</p></div></div>
    <div class="stats"><div class="stat"><b data-contar="${x.duracao}">${x.duracao}</b><span>min</span></div><div class="stat"><b data-contar="${seriesFeitas}">${seriesFeitas}</b><span>séries</span></div>${vol?`<div class="stat"><b ${vol>=1000?`data-contar="${Math.round(vol/100)/10}" data-dec="1" data-suf=" t"`:`data-contar="${Math.round(vol)}" data-suf=" kg"`}>${fmtVolume(vol)}</b><span>volume</span></div>`:`<div class="stat"><b>${x.feitos}/${x.total}</b><span>itens</span></div>`}</div>
    ${vol && volAnt ? `<p class="meta">Volume ${difVol>=0?"+":"−"}${Math.abs(difVol)}% sobre o último treino ${esc(a.letra)}.</p>` : ""}
    ${recs.length?`<div class="recordes"><b>${ico.trofeu} ${recs.length>1?`${recs.length} recordes`:"Recorde"}</b>${recs.map(r=>`<span>${esc([r.k, r.g].filter(Boolean).join(" · "))}: ${fmtRec(r)} <small>(antes ${fmtNum(r.antes)})</small></span>`).join("")}</div>`:""}
    ${linhasCargas?`<ul class="r-cargas">${linhasCargas}</ul>`:""}
    ${anterior?`<p class="meta">Último treino ${esc(a.letra)}: ${anterior.duracao} min (${relDia(anterior.data)}).</p>`:""}
    <p class="meta">Próximo da sequência: treino ${esc(proxima())}.</p>
    <button class="btn primary" data-fechar>Fechar</button>`);
  const fr=$("#folha"); if(fr) contar(fr);
  if(recs.length) setTimeout(confete, 450);
}
