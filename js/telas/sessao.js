import { consumirRepeticao, confete, contar, marcar, recente, segurarRepete } from "../movimento.js";
import { blocoCarga, cargasDaSerieF, valorPlanejado, cargaDaSerie, cargaDe, cargaPorSerie, cargaResumo, cargasDaSerie, chaveCarga, controlesCarga, digitarCarga, fmtCarga, enviarCargasPendentes, grupoDaSerie, grupoIdx, gruposDe, linhaCargaSerie, linhaCargaUnica, linkVariar, partesDe, passoCarga, salvarCarga, serieSelecionada, temCarga, trocarUnidade, ultimaDaSerie, variaPorSerie } from "../cargas.js";
import { iniciarDescanso, maisTempo, pararDescanso } from "../descanso.js";
import { E, FICHA, S, save } from "../estado.js";
import { copiarTexto, guiaDe, linkClaude, metodosDe, notaExpress, perguntaClaude } from "../guia-exercicios.js";
import { nav, render } from "../navegacao.js";
import { hojeISO, isoDe, minutos, proxima, relDia, semTxt, semanaAtual, temExpress, totalMin, treino, voltasDo } from "../progresso.js";
import { rotSerie, seriesDe, tempoDe } from "../series.js";
import { fmtRec, fmtVolume, recordesDaSessao, resumoCargas, temCargas, volumeSessao } from "../metricas.js";
import { enfileirar, hora } from "../sync.js";
import { confirmar, desfazer, fecharFolha, fmtMin, fmtSeg, folha, ico, manterTela, plate, toast } from "../ui.js";
import { $, esc, fmtNum } from "../util.js";
import { ligarSentir, marcoDoTreino, semanasSeguidas, sentirHtml } from "./habito.js";
import { abrirCompartilhar, dataCurta, urlApp } from "../compartilhar.js";
import { dispensarSugestao, recordeSerie, recordeTxt, sugestaoHtml, usarSugestao } from "../dicas.js";
import { icone } from "../icones.js";
import { motivar } from "../balao.js";
import { metodoDe, separarNotas } from "../recursos.js";
import { acaoTempo, alternarLivre, limparCronometros, marcarAproximacao, minimizarExec, partesHtml, previaFases, avancarParte, iniciarExec, livreDe, livreHtml, pararExec, playLivre, zerarLivre } from "../execucao.js";

/* ---------- Sessão: peças comuns aos modos lista e foco ---------- */
export const ICO = { mais:icone("ellipsis"), lista:icone("list"), copiar:icone("copy") };
export const PASSO = { kg:2.5, placas:1 };
export const treinoAtual = a => treino(a.letra, a.fase, a.volta ?? a.semana ?? undefined, a.modo||"completo");
export const minDesde = t => Math.max(0, Math.round((Date.now()-t)/6e4));
export const rerender = (topo=false) => { const y=scrollY; render(); scrollTo(0, topo?0:y); };
export const primeiroPendente = (a,t) => { const i=t.itens.findIndex((_,k)=>!a.feitos.includes(k)); return i<0 ? t.itens.length-1 : i; };
/* Botão de ação: "Série N de M feita" (o descanso agora conta na barra fixa de baixo, v1.42). */
export function botaoAcao(it,i,a,destaque,{ chips=true } = {}){
  const cls = destaque ? "primary cor" : "";
  const tx = acaoTempo(it,i,a,cls,{ chips }); if(tx) return tx;
  if(!it.series){
    const ok=a.feitos.includes(i);
    return `<div class="linha2"><button class="btn" data-bloco="${i}">${icone("play")} ${it.bloco} min</button><button class="btn ${ok?"":cls} ${ok&&recente("feito")?.i===i?"feito-btn":""}" data-feito="${i}">${ok?`${icone("check")} Feito`:"Marcar feito"}</button></div>`;
  }
  const f=(a.series||{})[i]||0;
  if(f>=it.series) return `<button class="btn reabrir" data-reabrir="${i}">${ico.check} Concluído · ${it.series}/${it.series} · desfazer</button>`;
  return `<button class="btn ${cls} serie-btn ${recente("fimDescanso",120000)?.k===i?"vai":""}" data-serie="${i}">${ico.check}<span>Série ${f+1} de ${it.series} feita</span></button>`;
}

/* ---------- Sessão v1.42: barra da sessão, cabeçalho do exercício, tabela de séries e barra de ação ----------
   Lista e foco usam as mesmas peças. A orientação que se repete nos itens (ex.: "Volta de calibração…") vira
   uma nota do treino (selo na barra; aviso único na lista); cada exercício mostra só a parte dele, numa linha que abre. */
const oriAberta = new Set();
/* O que acabou de mudar ganha animação na próxima renderização */
const pop = (i,j) => { const m=recente("serie"); return m && m.i===i && (j===undefined || m.j===j); };
const recem = i => { const s=recente("serie"), f=recente("feito"); return (s && s.i===i && s.fim) || (f && f.i===i); };
/* Série que recebe o ajuste de carga: a selecionada, quando a carga varia por série (senão, a carga do exercício) */
const alvoSerie = (it,i,a) => cargaPorSerie(it) && variaPorSerie(it) && !a.feitos.includes(i) ? { i, j:serieSelecionada(it,i,a) } : {};
const notas = t => separarNotas(t.itens.map(x=>x.obs||""));
export function topoSessao(a,t){
  const n=t.itens.length, nt=notas(t), foco=S.pref.modo==="foco";
  return `<div class="sb"><div class="sb-l"><button class="icon-btn s-ic" id="sMenu" aria-label="Opções do treino">${ICO.mais}</button>
    <div class="sb-t"><b>Treino ${esc(a.letra)}${a.modo==="express"?" · express":""}</b>
      <span>${a.feitos.length} de ${n} · ${minDesde(a.inicio)} min${nt.comum?` <button class="sb-nota" data-nota aria-label="${esc(nt.rotulo)}: ver a orientação">${icone("lightbulb")}${esc(nt.rotulo)}</button>`:""}</span></div>
    <button class="icon-btn s-ic" id="sModo" aria-label="${foco?"Ver a lista de exercícios":"Ver um exercício por vez"}">${icone(foco?"list":"rectangle-vertical")}</button></div>
    <div class="s-prog">${t.itens.map((_,i)=>`<span class="${a.feitos.includes(i)?"ok":i===a.ativo?"at":""}"></span>`).join("")}</div></div>`;
}
const cap1 = s => s.charAt(0).toUpperCase()+s.slice(1);
/* Rest-pause e afins: "falha / 10s / falha / 10s / falha" vira "3× falha" (as etapas aparecem como pílulas na série) */
function repsDe(it, s){ const t=tempoDe(it); if(t?.tipo!=="partes") return s.r; const r=t.partes.filter(p=>!p.pausa).map(p=>p.rot); return r.length>1 && r.every(x=>x===r[0]) ? `${r.length}× ${r[0]}` : s.r; }
const metaDe = it => (it.series>0 ? [`${it.series} ${it.series>1?"séries":"série"}`, `${it.descanso} s`].concat(voltasDo(it)?.length?[semTxt(voltasDo(it))]:[]) : [`${it.bloco} min`]);
function cabExercicio(it,i,a,t,{ titulo=true } = {}){
  const met=metodoDe(it), prop=notas(t).proprias[i], semSeries = it.series>0 && seriesDe(it).every(s=>s.r==="série");
  const ori=[semSeries?it.prescricao:"", prop].filter(Boolean).join(". "), ab=oriAberta.has(i);
  return `<div class="sx-cab"><div class="sx-tit"><p class="sx-eb">${met?`<span class="sx-chip">${esc(met)}</span>`:""}${it.series>0?`<span class="sx-meta">${metaDe(it).map(esc).join(" · ")}</span>`:""}</p>
      ${titulo?`<h2 class="sx-nome">${esc(it.nome)}</h2>`:""}</div>
    <div class="sx-ac">${it.series>0?`<button class="icon-btn sx-ib ${S.livre?.k===i?"on":""}" data-livre="${i}" aria-label="Cronômetro livre">${icone("timer")}</button>`:""}<button class="icon-btn sx-ib" data-info="${i}" aria-label="Como fazer ${esc(it.nome)}">${icone("info")}</button></div></div>
    ${livreHtml(i)}
    ${ori?`<button class="sx-ori ${ab?"aberta":""}" data-ori="${i}" aria-expanded="${ab}">${icone("lightbulb")}<span>${esc(ori)}</span>${icone("chevron-down","sx-chev")}</button>`:""}`;
}
/* Tabela de séries: a única fonte da prescrição. Feitas com ✓ e a carga usada; a da vez destacada; a selecionada
   (a da vez, ou outra tocada quando a carga varia por série) abre os controles de carga na própria linha. */
function tabelaSeries(it,i,a,done){
  const ser=seriesDe(it), fs=(a.series||{})[i]||0, cps=cargaPorSerie(it), varia=cps && variaPorSerie(it), comCarga=temCarga(it);
  const sel = done ? -1 : cps && varia ? serieSelecionada(it,i,a) : fs;
  const linhas=ser.map((s,j)=>{
    const feita=j<fs, atual=!done && j===fs, ed=j===sel && !feita;
    const kg = !comCarga ? "" : cps ? cargaDaSerie(it,i,j,a) : feita && a.cs?.[i]?.[j]?.c ? a.cs[i][j].c.map(c=>fmtCarga(c)).join(" / ") : cargaResumo(it, grupoDaSerie(it,j));
    const rec = !feita && !done && cps ? recordeSerie(it,i,j) : null, u = ed && cps ? ultimaDaSerie(it,j) : null;
    let corpo="";
    if(ed){
      const parts = atual ? partesHtml(it,i,a) : "";
      const ctrl = !comCarga ? "" : cps ? `<div class="sx-passo">${controlesCarga(it,i,0,grupoIdx(it,j),{ valor:valorPlanejado(it,i,j,a) })}</div>` : blocoCarga(it,i) + sugestoesBloco(it,i,a);
      const dentro = `${parts}${ctrl}${u||rec?`<p class="sx-ult">${rec?recordeTxt(rec,false):`Última vez: <b>${esc(u)}</b>`}</p>`:""}${cps?sugestaoHtml(it,i,0,grupoDaSerie(it,j)):""}`;
      corpo = dentro.trim() ? `<div class="sx-ed">${dentro}</div>` : "";
    }
    return `<div class="sx-lin ${feita?"feita":""} ${atual?"atual":""} ${ed?"edita":""} ${pop(i,j)?"pop":""}" ${!feita&&varia&&!done&&!ed?`data-selc="${i}:${j}" role="button" aria-label="Série ${j+1}: ajustar carga"`:""}>
      <span class="n">${feita?icone("check","ic-sm"):j+1}</span><span class="reps">${esc(repsDe(it,s))}${s.tag?` <small>${esc(s.tag)}</small>`:""}</span>
      <span class="kg">${ed && cps ? "" : esc(/^[—\s/]*$/.test(kg)?"":kg)}${rec&&!ed?` ${icone("trophy","ic-sm rec")}`:""}</span>${corpo}</div>`;
  }).join("");
  return `<div class="sx-tab" role="list"><div class="sx-th"><span>Série</span><span>Reps</span><span>${comCarga?"Carga":""}</span></div>${linhas}</div>
    ${!done && cps ? linkVariar(it,i) : ""}${done ? botaoAcao(it,i,a,false) : ""}`;
}
/* Cardio e itens sem séries: cartão com o tempo e a linha das fases */
function cartaoTempo(it,i,a){
  const t=tempoDe(it), min = t?.tipo==="intervalo" ? Math.round((t.rodadas*(t.a.seg+t.b.seg)+t.desaquecer)/60) : it.bloco;
  return `<div class="sx-crd"><p class="sx-crd-t"><b>${esc(String(min))}</b> min</p>${previaFases(it) || `<p class="sx-crd-p">${esc(it.prescricao)}</p>`}</div>`;
}
const conteudo = (it,i,a,done) => it.series>0 ? tabelaSeries(it,i,a,done) : cartaoTempo(it,i,a);
/* Exercícios sem carga por série (combinados): uma sugestão por parte, no grupo da próxima série */
const sugestoesBloco = (it,i,a) => temCarga(it) ? partesDe(it).map((_,pi)=>sugestaoHtml(it,i,pi,grupoDaSerie(it,(a.series||{})[i]||0))).join("") : "";
/* Barra de ação fixa embaixo: no descanso, o cronômetro (tempo, próxima série, +15 s, pular); no foco, ‹ ação › */
export function barraAcao(a,t){
  const T=S.timer;
  if(T && S.pref.descanso==="botao" && T.fim>Date.now())
    return `<div class="sb-acao"><div class="ab"><div class="ab-rest t-btn" role="timer" aria-label="Descanso"><span class="t-fill" id="tFill"></span><span class="ab-t" id="tTxt">${fmtSeg((T.fim-Date.now())/1000)}</span>
      ${T.prox?`<span class="ab-px"><small>A seguir</small><b>${esc(T.prox.replace(/^Próximo:\s*/,""))}</b></span>`:""}</div>
      <button class="btn ab-mini" data-mais15>+15 s</button><button class="btn ab-nav" data-pular aria-label="Pular descanso">${icone("skip-forward")}</button></div></div>`;
  if(S.pref.modo!=="foco") return "";
  const i=a.ativo, it=t.itens[i], done=a.feitos.includes(i), prox=t.itens[i+1];
  const meio = done ? `<button class="btn primary cor" data-navega="1">${prox?`Próximo: ${esc(prox.nome)}`:`Concluir treino ${esc(a.letra)}`}</button>` : botaoAcao(it,i,a,true,{ chips:false });
  return `<div class="sb-acao"><div class="ab"><button class="btn ab-nav" data-navega="-1" ${i===0?"disabled":""} aria-label="Exercício anterior">${icone("chevron-left")}</button>
    <div class="ab-meio">${meio}</div><button class="btn ab-nav" data-navega="1" aria-label="${prox?"Próximo exercício":"Concluir treino"}">${icone(prox?"chevron-right":"check")}</button></div></div>`;
}
function anel(it,i,a){
  const done=a.feitos.includes(i);
  if(done) return `<span class="sx-anel ok">${icone("check")}</span>`;
  if(!(it.series>0)) return `<span class="sx-anel">${icone("play","ic-sm")}</span>`;
  const f=(a.series||{})[i]||0, C=2*Math.PI*17;
  return `<span class="sx-anel"><svg class="r" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17"/><circle class="v" cx="20" cy="20" r="17" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-f/it.series)).toFixed(1)}"/></svg>${f}/${it.series}</span>`;
}
function resumoItem(it,i,a){
  const done=a.feitos.includes(i), c = temCarga(it) ? cargaResumo(it) : "";
  if(done) return [it.series?`${(a.series||{})[i]||it.series}/${it.series} séries`:"Feito", a.marcas?.[i]?`às ${hora(a.marcas[i])}`:""].filter(Boolean).join(" · ");
  return [metodoDe(it), metaDe(it)[0], c && c!=="—" ? c : ""].filter(Boolean).join(" · ");
}
export function sessaoLista(a,t){
  const n=t.itens.length, f=a.feitos.length, nt=notas(t), vez=primeiroPendente(a,t);
  const aviso = [nt.comum && !a.notaOk ? `<div class="sx-ban">${icone("lightbulb")}<p><b>${esc(nt.rotulo)}.</b> ${esc(cap1(nt.comum.replace(/^[^:]{3,26}:\s*/,"")))}</p><button class="icon-btn sx-ib" data-nota-ok aria-label="Dispensar">${icone("x")}</button></div>` : "",
    a.modo==="express" && notaExpress(t) ? `<div class="sx-ban">${icone("zap")}<p>${esc(notaExpress(t))}</p></div>` : ""].join("");
  const cards=t.itens.map((it,i)=>{
    const done=a.feitos.includes(i), ab=a.ativo===i;
    return `<li class="sx-cd ${ab?"aberto":""} ${done?"feito":""} ${done&&recem(i)?"recem":""}" data-item="${i}">
      <button class="sx-cd-h" data-item="${i}" aria-expanded="${ab}">${anel(it,i,a)}<span class="t"><b>${esc(it.nome)}</b><span>${!ab&&i===vez&&!done?`<em>A seguir</em> · `:""}${esc(resumoItem(it,i,a))}</span></span>${icone(ab?"chevron-down":"chevron-right","sx-chev")}</button>
      ${ab?`<div class="sx-cd-c">${cabExercicio(it,i,a,t,{ titulo:false })}${conteudo(it,i,a,done)}${done?"":`<div class="sx-acao">${botaoAcao(it,i,a,true,{ chips:false })}</div>`}</div>`:""}
    </li>`;
  }).join("");
  return `${aviso}<ul class="sx-lista">${cards}</ul>
  <section class="centro fim-treino">
    <button class="btn grande block" id="finishBtn">Concluir treino ${esc(a.letra)}</button>
    <p class="meta">${f===n?"Todos os itens concluídos.":`${n-f} ${n-f>1?"itens pendentes":"item pendente"}.`}</p>
  </section>`;
}
export function sessaoFoco(a,t){
  const i=a.ativo, it=t.itens[i], done=a.feitos.includes(i);
  const links = done ? [] : (botaoAcao(it,i,a,true,{ chips:false }).match(/<button class="link-btn"[^>]*>[^<]*<\/button>/g) || []);
  return `<div class="sx-foco">${cabExercicio(it,i,a,t)}${conteudo(it,i,a,done)}${links.length?`<div class="sx-sec">${links.join("")}</div>`:""}</div>`;
}
export function viewSessao(){
  const a=E.atual, t=treinoAtual(a);
  a.series ??= {};
  if(a.ativo==null || a.ativo>=t.itens.length) a.ativo = primeiroPendente(a,t);
  $("#view").innerHTML = `<div class="L-${esc(a.letra)} sx">${topoSessao(a,t)}${S.pref.modo==="foco" ? sessaoFoco(a,t) : sessaoLista(a,t)}${barraAcao(a,t)}</div>`;
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
  if(d.sug){ const [i,pi,...g]=d.sug.split(":"); return usarSugestao(t.itens[+i], +i, +pi, g.join(":")); }
  if(d.sugX) return dispensarSugestao(d.sugX);
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
  if(d.navega){ const nv=a.ativo+(+d.navega); if(nv>=t.itens.length) return concluir(); if(nv<0) return; a.ativo=nv; save(); rerender(true); return comecoExercicio(a, nv); }
  if(el.id==="sMenu") return menuSessao();
  if(el.id==="sModo"){ S.pref.modo = S.pref.modo==="foco" ? "lista" : "foco"; save(); return rerender(true); }
  if(d.ori!=null){ const i=+d.ori; oriAberta.has(i) ? oriAberta.delete(i) : oriAberta.add(i); return rerender(); }
  if(d.nota!=null){ const nt=notas(t); return folha(`<h3>${esc(nt.rotulo)}</h3><p>${esc(nt.comum)}.</p><p class="meta">Vale para todos os exercícios deste treino.</p><button class="btn" data-fechar>Fechar</button>`); }
  if(d.notaOk!=null){ a.notaOk=true; save(); return rerender(); }
  if(el.id==="sLista") return listaGeral();
  if(el.id==="finishBtn") return concluir();
  if(d.item!=null && el.matches("[data-item]")){ const i=+d.item; if(a.ativo!==i){ a.ativo=i; save(); rerender(); comecoExercicio(a, i); } }
}
export function registrarSerie(i){
  const a=E.atual, t=treinoAtual(a), it=t.itens[i]; a.series ??= {};
  const f=a.series[i]||0; if(f>=it.series) return;
  const ser=seriesDe(it);
  if(temCarga(it)){ const g=grupoDaSerie(it,f); ((a.cs ??= {})[i] ??= [])[f] = { r:ser[f]?.r ?? "", g, c:cargasDaSerieF(it,i,f,a,g) }; }
  if(a.rp) delete a.rp[i];
  delete a.selC; marcar("fimDescanso",{k:null});
  const rec = temCarga(it) ? recordeSerie(it,i,f) : null;   // antes de registrar: a série passa o melhor já feito?
  const tl=Math.round(livreDe(i)); if(tl>0){ ((a.tm ??= {})[i] ??= [])[f]=tl; S.livre.acum=0; if(S.livre.ini) S.livre.ini=Date.now(); }
  a.series[i]=f+1; a.ativo=i; navigator.vibrate?.(15); marcar("serie",{i, j:f, fim:f+1===it.series});
  const fimEx = a.series[i]===it.series;
  if(fimEx && !a.feitos.includes(i)){ a.feitos.push(i); (a.marcas ??= {})[i]=Date.now(); if(S.pref.modo!=="foco") abrirProximo(a, t, i); }
  save();
  desfazer(`Série ${f+1} de ${it.series} registrada`, ()=>{
    a.series[i]=f; if(a.cs?.[i]) a.cs[i].length=Math.min(a.cs[i].length,f); const k=a.feitos.indexOf(i); if(k>=0){ a.feitos.splice(k,1); delete a.marcas[i]; }
    pararDescanso(false); save(); rerender();
  });
  const seguinte=t.itens[i+1];
  const prox = !fimEx ? `Série ${f+2} · ${rotSerie(ser[f+1])}${temCarga(it)?` · ${cargaPorSerie(it) ? cargaDaSerie(it,i,f+1,a) : cargaResumo(it, grupoDaSerie(it,f+1))}`:""}` : (seguinte ? `Próximo: ${seguinte.nome}` : "");
  if(!fimEx || seguinte) iniciarDescanso(i, it.descanso, prox); else rerender();
  if(rec) motivar("recorde", { ex:it.nome, carga:`${fmtNum(rec.v)} ${rec.u==="kg"?"kg":"placas"}` });
  else if(fimEx) motivar("exercicioFeito", { ex:it.nome });
  else if(f+2===it.series) motivar("ultimaSerie", { ex:it.nome });
  else motivar("serie", { ex:it.nome, n:f+1, total:it.series });
}
/* falas: começo de um exercício (aberto no foco ou tocado na lista, ainda sem série feita) */
function comecoExercicio(a, i){
  const it=treinoAtual(a).itens[i]; if(it && !a.feitos.includes(i) && !(a.series?.[i])) motivar("inicioExercicio", { ex:it.nome });
}
/* Lista: quando um exercício termina, o próximo pendente abre sozinho */
function abrirProximo(a, t, i){ const pend=t.itens.map((_,k)=>k).filter(k=>!a.feitos.includes(k)); const n=pend.find(k=>k>i) ?? pend[0]; if(n!=null) a.ativo=n; }
export function alternarFeito(i){
  const a=E.atual, k=a.feitos.indexOf(i); a.marcas ??= {};
  if(k>=0){ a.feitos.splice(k,1); delete a.marcas[i]; }
  else { a.feitos.push(i); a.marcas[i]=Date.now(); navigator.vibrate?.(15); marcar("feito",{i}); if(S.timer?.k===i) pararDescanso(false);
    if(S.pref.modo!=="foco") abrirProximo(a, treinoAtual(a), i);
    motivar("exercicioFeito", { ex:treinoAtual(a).itens[i].nome });
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
    <div class="mt-0 linha2"><button class="btn" data-aba="ficha">Ver ficha</button><button class="btn" data-aba="guia">Ver guia</button></div>
    <button class="btn" data-ajustes>${icone("settings")} Ajustes</button>
    <div class="esp-2"></div>
    <button class="btn danger" data-cancelar>Cancelar treino</button>
    <button class="btn" data-fechar>Fechar</button>`,
    f=>{
      f.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{ S.pref.modo=b.dataset.m; save(); fecharFolha(); rerender(true); });
      f.querySelector("[data-versao]")?.addEventListener("click", e=>{ fecharFolha(); trocarVersao(e.currentTarget.dataset.versao); });
      f.querySelector("[data-ajustes]").onclick=()=>{ fecharFolha(); document.getElementById("openSettings")?.click(); };
      f.querySelectorAll("[data-aba]").forEach(b=>b.onclick=()=>{ fecharFolha(); nav.tab=b.dataset.aba; render(); scrollTo(0,0); });
      f.querySelector("[data-cancelar]").onclick=()=>{
        f.querySelector(".corpo").innerHTML=`<h3>Cancelar o treino ${esc(a.letra)}?</h3><p class="meta">As séries marcadas não serão registradas.</p>
          <button class="btn" data-fechar>Voltar ao treino</button><div class="esp-2"></div><button class="btn danger" data-sim>Sim, cancelar</button>`;
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
export async function trocarVersao(novo){
  const a=E.atual, t=treinoAtual(a);
  if(novo===(a.modo||"completo")) return;
  const temAlgo = a.feitos.length || Object.values(a.series||{}).some(v=>v>0);
  if(temAlgo && !(await confirmar({ titulo:`Trocar para ${novo==="express"?"Express":"Completo"}?`, texto:"Os exercícios que existem nas duas versões mantêm as marcações e as séries.", sim:"Trocar" }))) return;
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
export async function concluir(){
  const a=E.atual, t=treino(a.letra,a.fase,a.volta ?? a.semana ?? undefined, a.modo||"completo"), falt=t.itens.length-a.feitos.length;
  { const series=Object.values(a.series||{}).reduce((x,y)=>x+y,0), faltam=t.itens.filter((_,i)=>!a.feitos.includes(i)).map(x=>x.nome);
    const resumo=`<div class="conf-resumo"><div><b>${Math.round((Date.now()-a.inicio)/6e4)}</b><span>min</span></div><div><b>${a.feitos.length}/${t.itens.length}</b><span>itens</span></div><div><b>${series}</b><span>séries</span></div></div>
      ${faltam.length?`<p class="conf-falta">${faltam.length>3 ? `Faltam ${faltam.length} itens, entre eles ${esc(faltam.slice(0,2).join(" e "))}.` : `Faltam: ${esc(faltam.join(", "))}.`}</p>`:""}`;
    if(!(await confirmar({ titulo:`Concluir o treino ${a.letra}?`, html:resumo, sim: faltam.length ? "Concluir assim mesmo" : "Concluir treino", nao:"Continuar treinando" }))) return; }
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
  const marco=marcoDoTreino(); // meta da semana, semana perfeita, metade da etapa... (depois de registrar a sessão)
  render(); scrollTo(0,0);
  { const ctx={ letra:a.letra, bicho:a.bicho }; setTimeout(()=>motivar(marco.m && ["meta","perfeita"].includes(marco.m.tipo) ? "metaSemana" : "treinoFim", ctx), 400); }
  folha(`<div class="linha-ic L-${esc(a.letra)}">${plate(a.letra,"sm d3")}<div><h3>Treino ${esc(a.letra)} concluído</h3><p class="meta">${x.inicio}–${x.fim}</p></div></div>
    <div class="stats"><div class="stat"><b data-contar="${x.duracao}">${x.duracao}</b><span>min</span></div><div class="stat"><b data-contar="${seriesFeitas}">${seriesFeitas}</b><span>séries</span></div>${vol?`<div class="stat"><b ${vol>=1000?`data-contar="${Math.round(vol/100)/10}" data-dec="1" data-suf=" t"`:`data-contar="${Math.round(vol)}" data-suf=" kg"`}>${fmtVolume(vol)}</b><span>volume</span></div>`:`<div class="stat"><b>${x.feitos}/${x.total}</b><span>itens</span></div>`}</div>
    ${vol && volAnt ? `<p class="meta">Volume ${difVol>=0?"+":"−"}${Math.abs(difVol)}% sobre o último treino ${esc(a.letra)}.</p>` : ""}
    ${recs.length?`<div class="recordes"><b>${ico.trofeu} ${recs.length>1?`${recs.length} recordes`:"Recorde"}</b>${recs.map(r=>`<span>${esc([r.k, r.g].filter(Boolean).join(" · "))}: ${fmtRec(r)} <small>(antes ${fmtNum(r.antes)})</small></span>`).join("")}</div>`:""}
    ${linhasCargas?`<ul class="r-cargas">${linhasCargas}</ul>`:""}
    ${anterior?`<p class="meta">Último treino ${esc(a.letra)}: ${anterior.duracao} min (${relDia(anterior.data)}).</p>`:""}
    ${marco.html}
    ${sentirHtml(x.sen||"")}
    <p class="meta">Próximo da sequência: treino ${esc(proxima())}.</p>
    <div class="linha2"><button class="btn" data-compartilhar>${icone("share")} Compartilhar</button><button class="btn primary" data-fechar>Fechar</button></div>`);
  const fr=$("#folha"); if(fr){ contar(fr); ligarSentir(fr, x.id);
    const seq=semanasSeguidas();
    fr.querySelector("[data-compartilhar]").onclick=()=>abrirCompartilhar({ nome:`treino-${a.letra}-${x.data}.png`, temRec:recs.length>0, temVol:vol>0,
      monta: op => ({ letra:a.letra, cab:`Treino · ${dataCurta(x.data)}`, titulo:[`Treino ${a.letra}`,"concluído"],
        sub:[t.foco, seq?`${seq} ${seq>1?"semanas seguidas":"semana seguida"}`:""].filter(Boolean).join(" · "),
        nums:[[x.duracao,"min"],[seriesFeitas,"séries"], op.vol && vol ? [fmtVolume(vol),"volume"] : [`${x.feitos}/${x.total}`,"exercícios"]],
        recs: op.rec ? recs.map(r=>`Recorde: ${[r.k, r.g].filter(Boolean).join(" ")} ${fmtRec(r)}`) : [], url:urlApp() }) }); }
  if(recs.length || marco.m?.tipo==="perfeita") // na etapa concluída, o confete vem com o fechamento na Hoje
    setTimeout(confete, 450);
}
