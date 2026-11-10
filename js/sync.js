import { envioCarga } from "./cargas.js";
import { FICHA, S, novaEtapa, save, usarFicha } from "./estado.js";
import { FICHA_EMBUTIDA } from "./ficha-atual.js";
import { render } from "./navegacao.js";
import { toast } from "./ui.js";
import { $, esc } from "./util.js";
import { RX, cmpFicha, limparSessao, num, pesoOk, unidOk, validarFicha, vazio } from "./validacao.js";

/* ---------- Sincronização com a planilha ---------- */
export const SCRIPT_PADRAO="https://script.google.com/macros/s/AKfycbxwTnJ-NgKNXqWs5DKNwUwjG6dw0hC1vETohzrDlxh5x-7ijcNBh_oLuQ8YiGh5QB_M/exec";
export let syncMsg="";
export let syncTimer=null, sincronizando=false, renderPendente=false, fichaEnviada=false, falhasSync=0;
// Sem planilha conectada não há fila: o que existe no aparelho vai pelo migrar() na 1ª conexão.
export function enfileirar(op){ if(S.sync.url) S.fila.push(op); save(); agendarSync(); }
export function agendarSync(ms=600){ clearTimeout(syncTimer); if(S.sync.url) syncTimer=setTimeout(sincronizar, ms); atualizarSyncUI(); }
export function migrar(rem){
  // Primeira conexão deste aparelho: envia o que só existe aqui.
  const ops=[]; const ids=new Set(rem.sessoes.map(x=>x.id));
  for(const [et, st] of Object.entries(S.etapas)){
    (st.historico||[]).forEach((x,i)=>{
      x.id ??= `${x.data}-${x.letra}-${String(x.inicio||i).replace(/\W/g,"")}`; // estável entre aparelhos quando há horário
      if(!ids.has(x.id)) ops.push({tipo:"addSessao", etapa:+et, ...x});
    });
    for(const [nome,c] of Object.entries(st.cargas||{})){
      const r=rem.cargas.find(y=>y.etapa==et && y.nome===nome);
      if(!r || r.data < c.d) ops.push({tipo:"setCarga", etapa:+et, nome, kg:String(c.v), u:c.u||"kg", data:c.d});
    }
    if(st.inicio && !rem.config[`etapa.${et}.inicio`]) ops.push({tipo:"setConfig", chave:`etapa.${et}.inicio`, valor:st.inicio});
    if(st.faseModo && st.faseModo!=="auto" && !rem.config[`etapa.${et}.faseModo`]) ops.push({tipo:"setConfig", chave:`etapa.${et}.faseModo`, valor:st.faseModo});
  }
  const pesos=new Set(rem.peso.map(p=>p.d));
  S.peso.forEach(p=>{ if(!pesos.has(p.d)) ops.push({tipo:"setPeso", data:p.d, kg:p.kg}); });
  if(S.meta.kg && !rem.config["meta.kg"]) ops.push({tipo:"setConfig", chave:"meta.kg", valor:S.meta.kg});
  if(S.meta.data && !rem.config["meta.data"]) ops.push({tipo:"setConfig", chave:"meta.data", valor:S.meta.data});
  if(S.idade && !rem.config["idade"]) ops.push({tipo:"setConfig", chave:"idade", valor:S.idade});
  return ops;
}
export function aplicarRemoto(rem){
  const cfg=rem.config||{};
  const etapas=new Set([...Object.keys(S.etapas), ...rem.sessoes.map(x=>String(x.etapa)), ...rem.cargas.map(x=>String(x.etapa))]);
  etapas.forEach(et=>{
    const st = (S.etapas[et] ??= novaEtapa());
    const locais=Object.fromEntries((st.historico||[]).map(x=>[x.id,x]));
    st.historico = rem.sessoes.filter(x=>String(x.etapa)===et).map(({etapa,...x})=>{
      const l=locais[x.id]; // mantém horários e itens locais se a planilha ainda não os tiver
      if(l){ if(!x.inicio && l.inicio) x.inicio=l.inicio; if(!x.fim && l.fim) x.fim=l.fim; if(!(x.itens&&x.itens.length) && l.itens) x.itens=l.itens; if(!x.modo && l.modo) x.modo=l.modo; if(!x.volta && l.volta) x.volta=l.volta; if(!x.numero && l.numero) x.numero=l.numero; }
      if(!x.modo) delete x.modo; if(!x.volta) delete x.volta; if(!x.numero) delete x.numero;
      if(!x.inicio) delete x.inicio; if(!x.fim) delete x.fim; if(!x.itens || !x.itens.length) delete x.itens;
      return x; });
    st.historico = st.historico.map(limparSessao).filter(Boolean);
    st.cargas = {}; rem.cargas.filter(x=>String(x.etapa)===et && typeof x.nome==="string" && RX.data.test(x.data)).forEach(c=>{ const u=unidOk(c.u); st.cargas[c.nome]={v:String(c.kg), u, d:c.data}; (S.unidades ??= {})[c.nome] ??= u; });
    st.inicio = ""; st.faseModo = "auto";
  });
  S.peso = rem.peso.filter(pesoOk).sort((a,b)=>a.d<b.d?-1:1);
  S.meta = { kg:"", data:"" }; S.idade = "";
  for(const [chave, valor] of Object.entries(cfg)) aplicarConfig(chave, valor);
  const erroFicha = rem.ficha ? validarFicha(rem.ficha) : "";
  if(erroFicha) console.warn("Ficha da planilha ignorada:", erroFicha);
  const rf = rem.ficha && !erroFicha ? rem.ficha : null;
  if(rf && cmpFicha(rf, FICHA_EMBUTIDA)>=0){ S.fichaRemota = rf; const trocou = rf.etapa!==FICHA.etapa; usarFicha(rf); if(trocou) toast(`Ficha da etapa ${rf.etapa} carregada da planilha`); }
  else { S.fichaRemota = null; usarFicha(FICHA_EMBUTIDA); }
}
export function aplicarConfig(chave, valor){
  const m = /^etapa\.(\d+)\.(inicio|faseModo)$/.exec(chave);
  if(m){
    const st = (S.etapas[m[1]] ??= novaEtapa());
    if(m[2]==="inicio") st.inicio = RX.data.test(valor||"") ? valor : "";
    else st.faseModo = ["1","2"].includes(String(valor)) ? String(valor) : "auto";
  } else if(chave==="meta.kg") S.meta.kg = num(+valor) && +valor>0 ? +valor : "";
  else if(chave==="meta.data") S.meta.data = RX.data.test(valor||"") ? valor : "";
  else if(chave==="idade") S.idade = num(+valor) && +valor>0 ? +valor : "";
}
/* Reaplica no estado local uma alteração que ainda está na fila (não chegou à planilha),
   para o estado remoto não "desfazer" na tela o que foi feito durante a sincronização. */
export function aplicarOpLocal(op){
  const st = et => (S.etapas[et] ??= novaEtapa());
  switch(op.tipo){
    case "addSessao": { const {tipo, etapa, ...x} = op; const h=st(etapa).historico; if(!h.some(y=>y.id===x.id)) h.push(x); break; }
    case "delSessao": for(const e of Object.values(S.etapas)) e.historico = e.historico.filter(y=>y.id!==op.id); break;
    case "setPeso": S.peso = S.peso.filter(p=>p.d!==op.data).concat({d:op.data, kg:op.kg}).sort((a,b)=>a.d<b.d?-1:1); break;
    case "delPeso": S.peso = S.peso.filter(p=>p.d!==op.data); break;
    case "setCarga": { const c=st(op.etapa).cargas; if(vazio(op.kg)) delete c[op.nome]; else c[op.nome]={v:String(op.kg), u:unidOk(op.u), d:op.data}; break; }
    case "setConfig": aplicarConfig(op.chave, op.valor); break;
  }
}
export async function sincronizar(){
  if(!S.sync.url || !S.sync.k || sincronizando) return;
  if(!navigator.onLine){ S.sync.erro="offline"; atualizarSyncUI(); return; }
  sincronizando=true; atualizarSyncUI();
  try{
    const ops=S.fila.slice();
    const res=await fetch(S.sync.url,{method:"POST", body:JSON.stringify({k:S.sync.k, ops})});
    const j=await res.json();
    if(!j.ok) throw new Error(j.erro||"falha");
    S.fila.splice(0, ops.length);
    let extra=[];
    if(!S.sync.migrado){ extra=migrar(j.estado); S.sync.migrado=true; }
    if(j.rejeitadas?.length){
      console.warn("Alterações recusadas pela planilha:", j.rejeitadas);
      toast(`${j.rejeitadas.length} ${j.rejeitadas.length>1?"alterações recusadas":"alteração recusada"} pela planilha (veja a aba Rejeitadas)`);
    }
    const rf=j.estado.ficha;
    const embutidaMaisNova = !rf || cmpFicha(FICHA_EMBUTIDA, rf)>0;
    if(!fichaEnviada && embutidaMaisNova && !validarFicha(FICHA_EMBUTIDA)){
      extra.push({tipo:"setFicha", ficha:FICHA_EMBUTIDA, ativar:true}); fichaEnviada=true;
    }
    // await: a trava "sincronizando" só pode ser liberada depois que a nova rodada terminar
    if(extra.length){ S.fila.push(...extra); save(); sincronizando=false; return await sincronizar(); }
    aplicarRemoto(j.estado);
    S.fila.forEach(aplicarOpLocal); // alterações feitas durante a requisição continuam visíveis
    // cargas ajustadas há menos de 1,2 s ainda não entraram na fila (o envio espera parar de tocar no + / −);
    // sem isto, a resposta da planilha voltava a carga para o valor anterior no meio do ajuste
    Object.values(envioCarga).forEach(e=>aplicarOpLocal(e.op));
    if(!S.sync.ultimo) toast("Conectado à planilha");
    S.sync.ultimo=Date.now(); S.sync.erro=""; falhasSync=0;
    save();
    if(S.fila.length) agendarSync(300);
    const ativo=document.activeElement;
    if(ativo && /INPUT|SELECT|TEXTAREA/.test(ativo.tagName)) renderPendente=true; else { const y=scrollY; render(); scrollTo(0,y); }
  }catch(err){
    if(/chave/.test(err.message) && !S.sync.ultimo){ S.sync={url:"",k:"",migrado:false,ultimo:0,erro:""}; syncMsg="Chave inválida. Confira e tente de novo."; }
    else if(/chave/.test(err.message)) S.sync.erro = "Chave inválida";
    else {
      S.sync.erro = /ocupada|servidor/.test(err.message) ? "Erro na planilha, tentando de novo" : "Sem conexão com a planilha";
      // nova tentativa com espera crescente: 15s, 30s, 1min… até 5min
      falhasSync++; clearTimeout(syncTimer); syncTimer=setTimeout(sincronizar, Math.min(300000, 15000*2**(falhasSync-1)));
    }
    save();
  }finally{ sincronizando=false; atualizarSyncUI(); }
}
export function linkConfig(){ return `${location.origin}${location.pathname}#sync=${encodeURIComponent(S.sync.url)}&k=${encodeURIComponent(S.sync.k)}`; }
export function hora(t){ return new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}); }
export function atualizarSyncUI(){
  const dot=$("#syncDot"), box=$("#syncBox");
  const con=!!S.sync.url, pend=S.fila.length;
  dot.hidden = !con ? true : !(pend || S.sync.erro);
  dot.classList.toggle("ok", false);
  if(!box || !document.getElementById("settings").open) return;
  let st, cls="";
  if(!con){ st="Não conectado"; }
  else if(sincronizando){ st="Sincronizando…"; }
  else if(S.sync.erro){ st=S.sync.erro==="offline"?"Sem internet":S.sync.erro; cls="err"; }
  else { st="Conectado à planilha"; cls="ok"; }
  box.innerHTML = con ? `
    <div class="sync-st ${cls}"><i></i>${esc(st)}</div>
    <p class="meta">${S.sync.ultimo?`Última sincronização às ${hora(S.sync.ultimo)}.`:""} ${pend?`${pend} ${pend>1?"alterações pendentes":"alteração pendente"}, enviadas quando a conexão voltar.`:"Tudo salvo."}</p>
    <div class="row"><button class="btn" id="syncNow" style="flex:1">Sincronizar agora</button><button class="btn" id="syncLink" style="flex:1">Copiar link</button></div>
    <button class="btn ghost danger" id="syncOff">Desconectar este aparelho</button>`
  : `<p class="meta">Digite a chave de acesso à planilha (ou cole o link de configuração completo).</p>
    <input id="syncKey" placeholder="Chave ou link" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
    <details style="border:0;margin:0;background:none"><summary style="padding:4px 0;min-height:0;font-size:14px;font-weight:500;color:var(--muted)">Endereço do script</summary>
    <input id="syncUrl" value="${esc(SCRIPT_PADRAO)}" inputmode="url" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="margin-top:6px"></details>
    ${syncMsg?`<p class="meta" style="color:var(--warn);font-weight:600">${esc(syncMsg)}</p>`:""}
    <button class="btn primary" id="syncCon">Conectar</button>`;
  $("#syncNow") && ($("#syncNow").onclick=()=>sincronizar());
  $("#syncLink") && ($("#syncLink").onclick=async()=>{ try{ await navigator.clipboard.writeText(linkConfig()); toast("Link copiado. Abra-o no outro navegador."); }catch(e){ prompt("Copie o link:", linkConfig()); } });
  $("#syncOff") && ($("#syncOff").onclick=()=>{ if(confirm(`Desconectar este aparelho da planilha? Os dados continuam na planilha.${S.fila.length?`\n\nAtenção: ${S.fila.length} ${S.fila.length>1?"alterações ainda não enviadas serão perdidas":"alteração ainda não enviada será perdida"}. Sincronize antes, se puder.`:""}`)){ S.sync={url:"",k:"",migrado:false,ultimo:0,erro:""}; save(); atualizarSyncUI(); } });
  $("#syncCon") && ($("#syncCon").onclick=()=>{
    const limpa=v=>String(v||"").replace(/[\s\u200B-\u200D\uFEFF]/g,"");
    let k=limpa($("#syncKey").value), url=limpa($("#syncUrl").value)||SCRIPT_PADRAO;
    if(/#?sync=|[?&#]k=/.test(k)){ try{ const h=new URLSearchParams(k.slice(k.indexOf("#")+1).replace(/^[^?]*\?/,"")); url=h.get("sync")||url; k=h.get("k")||""; }catch(e){} }
    conectar(url,k);
  });
}
export function conectar(url,k){
  if(!/^https:\/\/script\.google(usercontent)?\.com\//i.test(url)){ syncMsg="Endereço do script inválido."; atualizarSyncUI(); return; }
  if(!k){ syncMsg="Informe a chave."; atualizarSyncUI(); return; }
  syncMsg=""; S.sync={url, k, migrado:false, ultimo:0, erro:""}; save(); toast("Conectando à planilha…"); sincronizar();
}

export function iniciarSync(){
  document.addEventListener("focusout",()=>{ if(renderPendente){ renderPendente=false; setTimeout(()=>{ if(!/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName||"")){ const y=scrollY; render(); scrollTo(0,y); } },150); } });
  addEventListener("online",()=>agendarSync(100));
  (function lerLinkConfig(){
    const h=new URLSearchParams(location.hash.slice(1));
    if(h.get("sync") && h.get("k")){
      history.replaceState(null,"",location.pathname+location.search);
      if(S.sync.url!==h.get("sync") || S.sync.k!==h.get("k")) conectar(h.get("sync"), h.get("k"));
    }
  })();
}
