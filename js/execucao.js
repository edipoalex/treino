/* Cronômetro de execução: partes com tempo dentro do exercício (prancha, por lado, pausas do rest-pause,
   intervalos do HIIT) e o cronômetro livre, que conta para cima.
   O estado fica em S.exec / S.livre (salvos no aparelho), e a etapa atual é calculada pelo tempo
   decorrido: recarregar o app no meio não perde a contagem. */
import { E, S, save } from "./estado.js";
import { actx, prepararSom } from "./descanso.js";
import { tempoDe } from "./series.js";
import { alternarFeito, registrarSerie, rerender, treinoAtual } from "./telas/sessao.js";
import { icone } from "./icones.js";
import { fmtSeg } from "./ui.js";
import { $, esc } from "./util.js";
import { falar, vozLigada } from "./voz.js";
import { falaFase } from "./inteligente.js";
import { motivar } from "./balao.js";

const PREP = 3;               // segundos para se posicionar
let tInt = null, ultimoSeg = null, ultimaEtapa = null, avisos = {};

function bip(freq=880, dur=.12, vezes=1){
  try{ if(!actx) return;
    for(let k=0;k<vezes;k++){ const t0=actx.currentTime+k*.22, o=actx.createOscillator(), g=actx.createGain(); o.frequency.value=freq; o.connect(g); g.connect(actx.destination);
      g.gain.setValueAtTime(.22, t0); g.gain.exponentialRampToValueAtTime(.001, t0+dur); o.start(t0); o.stop(t0+dur); } }catch(e){}
}
const vibra = p => { try{ navigator.vibrate?.(p); }catch(e){} };
/* Cardio e aquecimento abrem sempre em tela cheia (você está longe do celular); os demais seguem Ajustes › Descanso */
const CARDIO = new Set(["intervalo","continuo","aquecimento"]);
const telaCheia = X => CARDIO.has(X.tipo) || S.pref.descanso==="tela";
const cap = s => s.charAt(0).toUpperCase()+s.slice(1);

/* Aparência e som de cada tipo de fase: a cor vem da classe t-<tipo> (css/sessao.css) */
const FASE = {
  prep:    { ic:"timer",       nome:"PREPARE",     som:[660,.1,1] },
  forte:   { ic:"flame",       nome:"FORTE",       aviso:"ACELERE!",       som:[1046,.14,3], vib:[120,60,120,60,120] },
  leve:    { ic:"wind",        nome:"LEVE",        aviso:"DESACELERE",     som:[523,.25,2],  vib:[300] },
  desaq:   { ic:"snowflake",   nome:"DESACELERE",  aviso:"DESAQUECER",     som:[523,.3,1],   vib:[300] },
  zona:    { ic:"heart-pulse", nome:"ZONA 2",      som:[880,.15,1],  vib:[120] },
  esteira: { ic:"footprints",  nome:"AQUECIMENTO", som:[880,.15,1],  vib:[120] },
  exec:    { ic:"timer",       nome:"",            som:[1046,.14,1], vib:[120] },
  troca:   { ic:"rotate-ccw",  nome:"TROQUE",      aviso:"TROQUE DE LADO", som:[660,.2,2],   vib:[200] },
  pausa:   { ic:"timer",       nome:"PAUSA",       som:[880,.12,1],  vib:[60] },
};
const nomeFase = e => (e.nome ?? FASE[e.tipo]?.nome ?? e.rot ?? "").toString();
const DICA = { forte:"Ritmo forte: difícil manter uma conversa.", leve:"Recupere: respiração voltando ao normal.", desaq:"Ritmo bem leve até o fim." };
function zonaFC(){ const id=+S.idade; if(!(id>0)) return ""; const fcm=208-.7*id; return `FC alvo ${Math.round(fcm*.6)}–${Math.round(fcm*.7)} bpm`; }

/* Monta as etapas de cada tipo */
function etapasDe(it, tipoParte){
  const t = tempoDe(it); if(!t) return null;
  if(tipoParte!=null){ const pt = typeof tipoParte==="object" ? tipoParte : { pausa:tipoParte };
    return [{ seg:pt.pausa, rot: pt.rot ? cap(pt.rot) : "Pausa", tipo:"pausa", nome: pt.rot ? pt.rot.toUpperCase() : undefined }]; }
  const prep = { seg:PREP, rot:"Prepare", tipo:"prep" };
  if(t.tipo==="segurar") return [prep, ...t.etapas.map(e=>({ ...e, nome: e.tipo==="exec" ? e.rot.toUpperCase() : undefined }))];
  if(t.tipo==="intervalo"){
    const et=[{ seg:10, rot:"Prepare", tipo:"prep", sub:"Comece em ritmo leve" }];
    for(let r=1; r<=t.rodadas; r++){ et.push({ seg:t.a.seg, rot:t.a.rot, tipo:t.a.tipo, r }); et.push({ seg:t.b.seg, rot:t.b.rot, tipo:t.b.tipo, r }); }
    if(t.desaquecer) et.push({ seg:t.desaquecer, rot:"Desaquecer", tipo:"desaq" });
    return et;
  }
  if(t.tipo==="continuo") return [{ seg:5, rot:"Prepare", tipo:"prep", sub:"Ajuste a velocidade" }, { seg:t.seg, rot:t.rot, tipo: t.zona2 ? "zona" : "esteira", nome:t.rot.toUpperCase() }];
  if(t.tipo==="aquecimento") return [prep, { seg:t.seg, rot:t.rot, tipo:"esteira", nome:t.rot.toUpperCase(), sub:`Depois: ${t.passos} séries de ${t.passoRot}` }];
  return null;
}
export function iniciarExec(i, { pausa=null } = {}){
  const a=E.atual; if(!a) return;
  const it=treinoAtual(a).itens[i], t=tempoDe(it), etapas=etapasDe(it, pausa); if(!etapas) return;
  prepararSom();
  S.exec = { k:i, inicio:Date.now(), etapas, tipo: pausa!=null ? "pausa" : t.tipo, rodadas: t.rodadas||0, titulo: t.rotulo || t.rot && cap(t.rot) || it.nome, pausadoEm:null, min:false };
  a.ativo=i; save(); ultimoSeg=null; ultimaEtapa=null; avisos={};
  clearInterval(tInt); tInt=setInterval(tickExec, 200);
  if(telaCheia(S.exec)) abrirTelaExec();
  rerender(); tickExec();
  if(pausa==null && CARDIO.has(t.tipo)) motivar("cardioInicio", { ex:it.nome });
}
/* Etapa atual pelo tempo decorrido (parado enquanto pausado) */
function agora(X){
  let dec=((X.pausadoEm ?? Date.now())-X.inicio)/1000;
  for(let j=0; j<X.etapas.length; j++){ const e=X.etapas[j]; if(dec<e.seg) return { j, e, resta:e.seg-dec }; dec-=e.seg; }
  return null;
}
const totalDe = X => X.etapas.reduce((a,e)=>a+e.seg,0);
export function pausarExec(){ const X=S.exec; if(!X) return; if(X.pausadoEm){ X.inicio+=Date.now()-X.pausadoEm; X.pausadoEm=null; } else X.pausadoEm=Date.now(); save(); tickExec(); }
export function pularFase(){ const X=S.exec; if(!X) return; const s=agora(X); if(!s) return; X.inicio-=Math.ceil(s.resta*1000)+5; save(); tickExec(); }
export function minimizarExec(min=true){ const X=S.exec; if(!X) return; X.min=min; save(); if(min) $("#execTela")?.remove(); else abrirTelaExec(); rerender(); }
function aviso(txt){ const d=$("#execTela"); if(!d || !txt) return; const a=document.createElement("div"); a.className="f-aviso"; a.textContent=txt; d.appendChild(a); setTimeout(()=>a.remove(),1700); }

export function tickExec(){
  const X=S.exec; if(!X) return;
  const s=agora(X);
  if(!s){ bip(1046,.4); vibra([200,80,200]); if(CARDIO.has(X.tipo)) falar(X.tipo==="aquecimento"?"Aquecimento concluído":"Cardio concluído"); return finalizar(); }
  const seg=Math.ceil(s.resta), F=FASE[s.e.tipo]||FASE.exec, pausado=!!X.pausadoEm;
  if(s.j!==ultimaEtapa){ if(ultimaEtapa!=null){ bip(...F.som); if(F.vib) vibra(F.vib); aviso(F.aviso);
      if(s.e.tipo!=="prep") falar(falaFase(nomeFase(s.e)||s.e.rot, s.e.seg));
      if(CARDIO.has(X.tipo) && !pausado && (s.e.tipo==="forte" || s.e.tipo==="leve")) motivar(s.e.tipo==="forte" ? "cardioForte" : "cardioLeve"); } ultimaEtapa=s.j; }
  if(seg!==ultimoSeg){ ultimoSeg=seg; if(!pausado && seg<=3 && seg>0 && !["leve","zona","esteira","desaq"].includes(s.e.tipo)){ bip(s.e.tipo==="prep"?660:880); if(X.etapas[s.j+1] || s.e.tipo==="prep") falar(String(seg)); } }
  const total=totalDe(X), dec=total-(X.etapas.slice(s.j+1).reduce((a,e)=>a+e.seg,0)+s.resta);
  if(X.tipo==="continuo"){ // marcas do cardio contínuo
    if(!avisos.meio && dec>=total/2){ avisos.meio=1; aviso("METADE!"); bip(880,.15,2); vibra([150]); falar("Metade"); }
    if(!avisos.fim && s.resta<=Math.min(60, s.e.seg/6)){ avisos.fim=1; aviso("RETA FINAL"); bip(880,.15,1); falar("Reta final"); } }
  // falas do cardio: metade e reta final (marcadas no cronômetro salvo: não repetem se o app recarregar)
  if(CARDIO.has(X.tipo) && !pausado && s.e.tipo!=="prep"){ const fl=(X.falas ??= {});
    if(!fl.meio && dec>=total/2 && total-dec>60){ fl.meio=1; save(); motivar("cardioMetade"); }
    else if(!fl.fim && total>=180 && total-dec<=Math.min(60, total*.15)){ fl.fim=1; save(); motivar("cardioRetaFinal"); } }
  const fr = s.e.tipo==="prep" ? 0 : s.resta/s.e.seg, prox=X.etapas[s.j+1];
  // botão da série (isometria e pausas, sem tela cheia)
  const b=$("#eBtn");
  if(b){ $("#eTxt").textContent = s.e.tipo==="prep" ? `Prepare… ${seg}` : `${s.e.rot} ${fmtSeg(s.resta)}`; $("#eFill").style.transform=`scaleX(${fr})`;
    b.classList.toggle("prepara", s.e.tipo==="prep"); b.classList.toggle("troca", s.e.tipo==="troca"); b.classList.toggle("low", s.e.tipo!=="prep" && s.resta<=3); }
  // indicador compacto da fase (tela cheia minimizada ou por baixo dela)
  const m=$("#eMini");
  if(m){ m.className=`mini-fase t-${s.e.tipo}`; $(".mf-ic",m).innerHTML=icone(F.ic); $(".mf-txt b",m).textContent=nomeFase(s.e)||s.e.rot;
    $(".mf-txt small",m).textContent = pausado ? "Pausado" : s.e.r ? `Rodada ${s.e.r} de ${X.rodadas}${prox?` · depois ${nomeFase(prox).toLowerCase()}`:""}` : (s.e.sub||"");
    $(".mf-t",m).textContent=fmtSeg(s.resta); $(".mf-barra i",m).style.transform=`scaleX(${fr})`; }
  // tela cheia
  const d=$("#execTela");
  if(d){ d.className=`fases t-${s.e.tipo}`;
    $("#xIc",d).innerHTML=icone(F.ic); $("#xF",d).textContent=nomeFase(s.e)||s.e.rot.toUpperCase();
    $("#xT",d).textContent=fmtSeg(s.resta); $("#xT",d).classList.toggle("final", !pausado && seg<=3);
    $("#xS",d).textContent = s.e.r ? `Rodada ${s.e.r} de ${X.rodadas}` : s.e.tipo==="zona" ? (zonaFC() || "Ritmo em que dá para conversar") : (s.e.sub||"");
    $("#xD",d).textContent = DICA[s.e.tipo] || (s.e.tipo==="zona" ? "Dá para conversar sem ofegar." : "");
    const rod=$("#xRod",d); if(rod) [...rod.children].forEach((x,k)=>x.classList.toggle("on", k<(s.e.r||0)));
    $("#xP",d).innerHTML = pausado ? "Pausado" : prox ? `<span class="bol t-${prox.tipo}"></span> Depois: ${esc(nomeFase(prox).toLowerCase()||prox.rot)} · ${fmtSeg(prox.seg)}` : `${icone("check","ic-sm")} Última fase`;
    $("#xDec",d).textContent=`${fmtSeg(dec)} feitos`; $("#xRes",d).textContent=`faltam ${fmtSeg(total-dec)} de ${fmtSeg(total)}`;
    $("[data-x=pausa]",d).textContent = pausado ? "Continuar" : "Pausar";
    const reg=$("#xReg",d); if(reg) reg.style.transform=`scaleX(${dec/total})`;
    d.querySelectorAll(".f-linha i").forEach((x,k)=>{ x.className=`t-${X.etapas[k].tipo} ${k<s.j?"feita":k===s.j?"agora":""}`; x.firstChild.style.transform=`scaleX(${k<s.j?1:k===s.j?1-fr:0})`; }); }
}
/* Fim natural: marca a série, avança a parte do rest-pause, marca o cardio ou passa para as séries do aquecimento */
function finalizar(){
  const X=S.exec, a=E.atual; clearInterval(tInt); tInt=null; delete S.exec; $("#execTela")?.remove(); save();
  if(!X || !a) return rerender();
  if(X.tipo==="segurar") return registrarSerie(X.k);
  if(X.tipo==="pausa"){ (a.rp ??= {})[X.k]=(a.rp[X.k]||0)+1; save(); return rerender(); }
  if(X.tipo==="aquecimento"){ (a.aq ??= {})[X.k]=0; save(); return rerender(); }
  if(CARDIO.has(X.tipo)){ motivar("cardioFim"); if(!a.feitos.includes(X.k)) return alternarFeito(X.k); return rerender(); }
  rerender();
}
/* Parar: na pausa do rest-pause, pula a pausa; nos outros, para sem marcar */
export function pararExec(){
  const X=S.exec; if(!X) return;
  if(X.tipo==="pausa") return finalizar();
  clearInterval(tInt); tInt=null; delete S.exec; $("#execTela")?.remove(); save(); rerender();
}
export function retomarExec(){
  const X=S.exec; if(!X) return;
  if(!E.atual || !agora(X)){ delete S.exec; save(); return; }  // app fechado até depois do fim: não marca sozinho
  clearInterval(tInt); tInt=setInterval(tickExec, 200);
  if(telaCheia(X) && !X.min) abrirTelaExec();
}
function abrirTelaExec(){
  $("#execTela")?.remove(); const a=E.atual, X=S.exec; if(!a || !X) return;
  const d=document.createElement("div"); d.className="fases t-prep"; d.id="execTela"; d.setAttribute("role","timer");
  const regua = X.tipo==="continuo";
  const minutos = regua ? Math.round(X.etapas[1].seg/60) : 0;
  d.innerHTML=`<div class="f-topo L-${esc(a.letra)}">${icone("timer","ic-sm")} ${esc(X.titulo||"")}
      ${vozLigada()?`<button class="ml-auto x ${X.mudo?"voz-off":""}" data-x="voz" aria-pressed="${!X.mudo}" aria-label="${X.mudo?"Ligar a voz":"Silenciar a voz"}">${icone(X.mudo?"volume-x":"volume-2")}</button>`:""}
      ${CARDIO.has(X.tipo)?`<button class="${vozLigada()?"":"ml-auto"} x" data-x="min" aria-label="Minimizar">${icone("minimize-2")}</button>`:""}
      <button class="x ${CARDIO.has(X.tipo)||vozLigada()?"":"ml-auto"}" data-x="parar" aria-label="${X.tipo==="pausa"?"Pular a pausa":"Parar"}">${icone("x")}</button></div>
    <div class="f-centro"><div class="f-ic" id="xIc"></div><p class="f-nome" id="xF"></p><div class="f-tempo" id="xT"></div>
      <div class="f-sub" id="xS"></div><div class="f-dica" id="xD"></div>
      ${X.rodadas?`<div class="f-rodadas" id="xRod">${Array.from({length:X.rodadas},()=>"<span></span>").join("")}</div>`:""}
      <div class="f-prox" id="xP"></div></div>
    ${regua ? `<div class="f-regua"><b id="xReg"></b>${Array.from({length:Math.max(0,minutos-1)},(_,k)=>(k+1)*2===minutos?"":`<i style="left:${(k+1)/minutos*100}%"></i>`).join("")}<i class="meio"></i></div>`
      : `<div class="f-linha">${X.etapas.map(e=>`<i class="t-${e.tipo}" style="flex:${e.seg}"><b></b></i>`).join("")}</div>`}
    <div class="f-total"><span id="xDec"></span><span id="xRes"></span></div>
    <div class="f-acoes"><button class="btn" data-x="pausa">Pausar</button><button class="btn" data-x="pular">${icone("skip-forward")} Pular fase</button></div>`;
  d.onclick=e=>{ const b=e.target.closest("[data-x]"); if(!b) return;
    ({ min:()=>minimizarExec(true), parar:pararExec, pausa:pausarExec, pular:pularFase, voz:()=>{ X.mudo=!X.mudo; save(); if(X.mudo) try{ speechSynthesis.cancel(); }catch(e){}
      b.classList.toggle("voz-off", X.mudo); b.setAttribute("aria-pressed", String(!X.mudo)); b.setAttribute("aria-label", X.mudo?"Ligar a voz":"Silenciar a voz"); b.innerHTML=icone(X.mudo?"volume-x":"volume-2"); } })[b.dataset.x]?.(); };
  document.body.appendChild(d); tickExec();
}

/* ---------- O que aparece no lugar do botão da série ---------- */
const btnRodando = () => `<button class="btn primary cor t-btn" id="eBtn" data-exec-parar aria-label="${S.exec?.tipo==="pausa"?"Pular a pausa":"Parar o cronômetro"}"><span class="t-fill" id="eFill"></span>${icone("timer")}<span id="eTxt">…</span></button>`;
const fmtDur = s => s>=60 && s%60===0 ? `${s/60} min` : s>=60 ? fmtSeg(s) : `${s} s`;
const miniHtml = () => `<button class="mini-fase" id="eMini" data-exec-max aria-label="Abrir o cronômetro em tela cheia"><span class="mf-ic"></span><span class="mf-txt"><b></b><small></small></span><span class="mf-t"></span><span class="mf-barra"><i></i></span></button>`;
const minutosDe = t => Math.round((t.tipo==="intervalo" ? t.rodadas*(t.a.seg+t.b.seg)+t.desaquecer : t.seg)/60);
/* Prévia das fases do cardio intervalado: um bloco colorido por fase e a legenda */
export function previaFases(it){
  const t=tempoDe(it); if(t?.tipo!=="intervalo") return "";
  const fases=[]; for(let r=0;r<t.rodadas;r++) fases.push(t.a, t.b); if(t.desaquecer) fases.push({ seg:t.desaquecer, tipo:"desaq" });
  const dur = s => s>=60 ? `${Math.round(s/60)} min` : `${s} s`;
  return `<div class="pre-fases" aria-hidden="true">${fases.map(f=>`<i class="t-${f.tipo}" style="flex:${f.seg}"></i>`).join("")}</div>
    <p class="meta pre-leg"><span class="bol t-${t.a.tipo}"></span> ${dur(t.a.seg)} ${esc(t.a.rot)} · <span class="bol t-${t.b.tipo}"></span> ${dur(t.b.seg)} ${esc(t.b.rot)} · ${t.rodadas} rodadas${t.desaquecer?` · ${dur(t.desaquecer)} de desaquecimento`:""}</p>`;
}
export function acaoTempo(it, i, a, cls){
  const t=tempoDe(it); if(!t) return "";
  const chipsPartes = () => { const k=Math.min((a.rp||{})[i]||0, t.partes.length-1);
    return `<div class="microp" aria-label="Partes da série">${t.partes.map((x,j)=>`<span class="${j<k?"feito":j===k?"agora":""}">${x.pausa?`${fmtDur(x.pausa)}${x.rot?` ${esc(x.rot)}`:""}`:esc(x.rot)}</span>`).join("")}</div>`; };
  if(S.exec?.k===i) return (t.tipo==="partes" ? chipsPartes() : "") + (CARDIO.has(S.exec.tipo) || telaCheia(S.exec) ? miniHtml() : btnRodando());
  if(!it.series){
    if(!CARDIO.has(t.tipo)) return "";
    const ok=a.feitos.includes(i);
    if(ok) return `<div class="linha2"><button class="btn" data-exec="${i}">${icone("play")} De novo</button><button class="btn" data-feito="${i}">${icone("check")} Feito</button></div>`;
    if(t.tipo==="aquecimento" && a.aq?.[i]!=null){
      const n=a.aq[i];
      return `<p class="m-0 mt-3 meta">${cap(t.rot)} feita. Agora: ${t.passos} séries de ${esc(t.passoRot)}.</p><div class="passos-aq">${Array.from({length:t.passos},(_,k)=>`<button class="btn ${k===n?cls:""} ${k<n?"ok":""}" ${k===n?`data-aq="${i}"`:"disabled"}>${k<n?icone("check"):""} Série ${k+1} de aproximação</button>`).join("")}</div>`;
    }
    const rot = t.tipo==="intervalo" ? `${t.rotulo} ${t.rodadas}× · ${minutosDe(t)} min` : t.tipo==="continuo" ? `${t.rot} · ${minutosDe(t)} min` : `${cap(t.rot)} ${minutosDe(t)} min`;
    return `<button class="btn ${cls} exec-btn" data-exec="${i}">${icone("play")}<span>${esc(rot)}</span></button>
      <button class="link-btn" data-feito="${i}">Marcar feito sem cronômetro</button>`;
  }
  const f=(a.series||{})[i]||0; if(f>=it.series) return "";
  if(t.tipo==="segurar") return `<button class="btn ${cls} t-btn exec-btn" data-exec="${i}">${icone("play")}<span>${esc(t.botao)}</span></button>
    <button class="link-btn" data-serie="${i}">Marcar a série sem cronômetro</button>`;
  if(t.tipo==="partes"){
    const k=Math.min((a.rp||{})[i]||0, t.partes.length-1), p=t.partes[k], ultima=k===t.partes.length-1, chips=chipsPartes();
    if(p.pausa) return chips + `<button class="btn ${cls}" data-exec-pausa="${i}:${k}">${icone("play")} ${p.rot?esc(cap(p.rot)):"Pausa"} ${fmtDur(p.pausa)}</button>`;
    return chips + (ultima ? `<button class="btn ${cls} serie-btn" data-serie="${i}">${icone("check")}<span>Série ${f+1} de ${it.series} feita</span></button>`
      : `<button class="btn ${cls} exec-btn" data-rp="${i}">${icone("check")}<span>${p.rot==="falha"?"Cheguei na falha":`Fiz ${esc(p.rot)}`}</span></button>`);
  }
  return "";
}
/* Séries de aproximação do aquecimento: ao marcar a última, o aquecimento fica feito */
export function marcarAproximacao(i){
  const a=E.atual, it=treinoAtual(a).itens[i], t=tempoDe(it); if(t?.tipo!=="aquecimento") return;
  const n=((a.aq ??= {})[i]||0)+1; a.aq[i]=n; save();
  if(n>=t.passos && !a.feitos.includes(i)) return alternarFeito(i);
  rerender();
}
/* "Cheguei na falha" / "Fiz 1x30": avança a parte; se a próxima é pausa, já começa a contar */
export function avancarParte(i){
  const a=E.atual, it=treinoAtual(a).itens[i], t=tempoDe(it); if(t?.tipo!=="partes") return;
  const k=((a.rp ??= {})[i]||0)+1; a.rp[i]=k; save();
  const p=t.partes[k]; if(p?.pausa) return iniciarExec(i, { pausa:p });
  rerender();
}

/* Ao iniciar, concluir ou cancelar um treino os cronômetros de execução e livre recomeçam do zero */
export function limparCronometros(){ clearInterval(tInt); tInt=null; delete S.exec; delete S.livre; $("#execTela")?.remove(); }

/* ---------- Cronômetro livre (conta para cima) ---------- */
let lvInt=null;
const livreSeg = L => (L.acum||0) + (L.ini ? (Date.now()-L.ini)/1000 : 0);
export const livreDe = i => S.livre?.k===i ? livreSeg(S.livre) : 0;
export function alternarLivre(i){
  if(S.livre?.k===i){ delete S.livre; } else S.livre = { k:i, ini:null, acum:0 };
  save(); rerender();
}
export function playLivre(){ const L=S.livre; if(!L) return; if(L.ini){ L.acum=livreSeg(L); L.ini=null; } else L.ini=Date.now(); save(); rerender(); }
export function zerarLivre(){ const L=S.livre; if(!L) return; L.ini=L.ini?Date.now():null; L.acum=0; save(); rerender(); }
function tickLivre(){ const el=$("#lvT"); if(!S.livre?.ini){ clearInterval(lvInt); lvInt=null; return; } if(el) el.textContent=fmtSeg(livreSeg(S.livre)); }
export function livreHtml(i){
  const L=S.livre; if(L?.k!==i) return "";
  if(L.ini && !lvInt) lvInt=setInterval(tickLivre, 250);
  return `<div class="livre"><b id="lvT">${fmtSeg(livreSeg(L))}</b>
    <button class="btn ${L.ini?"":"primary cor"}" data-livre-play>${L.ini?"Pausar":`${icone("play")} ${L.acum?"Continuar":"Iniciar"}`}</button>
    <button class="btn" data-livre-zerar aria-label="Zerar">${icone("rotate-ccw")}</button></div>`;
}
