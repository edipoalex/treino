import { aplicarMovimento } from "./movimento.js";
import { textoVersao } from "./atualizacao.js";
import { E, FICHA, KEY, S, normalizarEstado, novaEtapa, save } from "./estado.js";
import { render } from "./navegacao.js";
import { fmtKg, hojeISO, parseKg } from "./progresso.js";
import { atualizarSyncUI, enfileirar } from "./sync.js";
import { applyTheme, confirmar, toast } from "./ui.js";
// elemento ausente (ex.: index.html de outra versão) vira um objeto vazio, para os Ajustes não travarem a abertura do app
const $ = s => document.querySelector(s) || {};
import { falar, desbloquear } from "./voz.js";
import { icsLembrete, primeiraData } from "./inteligente.js";
import { icone } from "./icones.js";

/* ---------- Ajustes ---------- */
export const dlg=$("#settings");
export function marcarPref(){
  document.querySelectorAll("[data-pref-modo]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.prefModo===S.pref.modo)));
  document.querySelectorAll("[data-pref-desc]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.prefDesc===S.pref.descanso)));
  document.querySelectorAll("[data-pref-anim]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.prefAnim===S.pref.animacoes)));
  document.querySelectorAll("[data-pref-voz]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.prefVoz===S.pref.voz)));
  const ld=$("#lembDias"); if(ld) ld.innerHTML=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d,i)=>`<button data-lemb-dia="${i}" aria-pressed="${S.lembrete.dias.includes(i)}">${d}</button>`).join("");
  const lh=$("#lembHora"); if(lh) lh.value=S.lembrete.hora;
  atualizarMenu();
}


/* ---------- Menu dos Ajustes: grupos por tema; cada linha mostra o valor atual e abre a página dele ---------- */
const DIAS=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
const dm = iso => iso ? iso.split("-").reverse().slice(0,2).join("/") : "";
function grupos(){
  const sy = !S.sync.url ? ["Não conectada",""] : S.sync.erro ? [S.sync.erro==="offline"?"Sem internet":"Com erro","alerta"] : S.fila.length ? [`${S.fila.length} ${S.fila.length>1?"alterações pendentes":"alteração pendente"}`,""] : ["● Conectada","ok"];
  const l = S.lembrete;
  return [
    ["Durante o treino", [["modo","dumbbell","--pA","Modo do treino", S.pref.modo==="foco"?"Foco":"Lista"],
      ["descanso","timer","--pA","Descanso", S.pref.descanso==="tela"?"Tela cheia":"No botão"],
      ["voz","volume-2","--pA","Voz", {off:"Desligada",cardio:"Cardio",tudo:"Cardio e descanso"}[S.pref.voz]]]],
    ["Aparência", [["tema","palette","--pB","Tema", {auto:"Automático",light:"Claro",dark:"Escuro"}[S.theme]||"Automático"],
      ["anim","wind","--pB","Animações", S.pref.animacoes==="reduzidas"?"Reduzidas":"Completas"]]],
    ["Lembretes", [["lemb","bell","--pC","Calendário", `${l.dias.map(d=>DIAS[d]).join(", ")} · ${l.hora}`]]],
    ["Etapa e metas", [["etapa","flag","--pD",`Etapa ${FICHA.etapa}`, E.inicio ? `início ${dm(E.inicio)} · ${E.faseModo==="auto"?"fase automática":`fase ${E.faseModo}`}` : "sem data de início"],
      ["meta","weight","--pD","Meta de peso", S.meta.kg ? `${fmtKg(+S.meta.kg)} kg${S.meta.data?` até ${dm(S.meta.data)}`:""}` : "Não definida"]]],
    ["Dados", [["planilha","cloud","--pE","Planilha Google", ...sy], ["backup","download","--pE","Backup","Exportar ou importar"]]],
  ];
}
export function atualizarMenu(){
  const g=$("#ajGrupos");
  g.innerHTML = grupos().map(([t,its])=>`<div class="aj-grupo"><h4>${t}</h4><ul class="aj-lista">${its.map(([k,ic,cor,n,v,cls])=>
    `<li><button class="aj-item" data-pag-ir="${k}"><span class="aj-ic" style="--k:var(${cor})">${icone(ic)}</span><span class="nome">${n}</span><span class="val ${cls||""}">${v}</span>${icone("chevron-right")}</button></li>`).join("")}</ul></div>`).join("");
  const et=$("#ajEtapaTit"); if(et) et.textContent=`Etapa ${FICHA.etapa}`;
}
function abrirPagina(k){
  $("#ajMenu").hidden=true;
  document.querySelectorAll("#settings .aj-sub").forEach(p=>p.hidden = p.dataset.pag!==k);
  const sh=document.querySelector("#settings .sheet"); if(sh) sh.scrollTop=0;
  document.querySelector(`#settings .aj-sub[data-pag="${k}"] [data-voltar]`)?.focus();
  if(k==="planilha") atualizarSyncUI();
}
export function voltarMenu(){
  document.querySelectorAll("#settings .aj-sub").forEach(p=>p.hidden=true);
  $("#ajMenu").hidden=false; atualizarMenu();
}

export function iniciarAjustes(){
  document.querySelectorAll("#settings .aj-sub").forEach(p=>p.insertAdjacentHTML("afterbegin", `<button class="btn-link voltar" data-voltar>${icone("chevron-left")} Ajustes</button>`));
  dlg.addEventListener?.("click", e=>{ const b=e.target.closest("[data-pag-ir]"); if(b) return abrirPagina(b.dataset.pagIr); if(e.target.closest("[data-voltar]")) return voltarMenu(); });
  $("#openSettings").onclick=()=>{ setTimeout(atualizarSyncUI); $("#versaoTxt").textContent=textoVersao(); $("#startDate").value=E.inicio||""; $("#phaseMode").value=E.faseModo; $("#metaKg").value=S.meta.kg?fmtKg(+S.meta.kg):""; $("#metaData").value=S.meta.data||""; applyTheme(); marcarPref(); voltarMenu(); dlg.showModal(); };
  $("#closeSettings").onclick=()=>dlg.close();
  dlg.addEventListener("click",e=>{ if(e.target===dlg) dlg.close(); });
  document.querySelectorAll("[data-theme-opt]").forEach(b=>b.onclick=()=>{ S.theme=b.dataset.themeOpt; save(); applyTheme(); atualizarMenu(); });
  document.querySelectorAll("[data-pref-modo]").forEach(b=>b.onclick=()=>{ S.pref.modo=b.dataset.prefModo; save(); marcarPref(); render(); });
  document.querySelectorAll("[data-pref-anim]").forEach(b=>b.onclick=()=>{ S.pref.animacoes=b.dataset.prefAnim; save(); marcarPref(); aplicarMovimento(); });
  document.querySelectorAll("[data-pref-desc]").forEach(b=>b.onclick=()=>{ S.pref.descanso=b.dataset.prefDesc; save(); marcarPref(); $("#descanso")?.remove(); render(); });
  document.querySelectorAll("[data-pref-voz]").forEach(b=>b.onclick=()=>{ S.pref.voz=b.dataset.prefVoz; save(); marcarPref(); });
  $("#ouvirVoz").onclick=()=>{ if(S.pref.voz==="off"){ toast("A voz está desligada"); return; } desbloquear(); falar("Forte, 30 segundos. Três, dois, um. Leve."); };
  $("#lembDias").onclick=e=>{ const b=e.target.closest("[data-lemb-dia]"); if(!b) return; const d=+b.dataset.lembDia, ds=S.lembrete.dias;
    S.lembrete.dias = ds.includes(d) ? ds.filter(x=>x!==d) : [...ds, d].sort(); save(); marcarPref(); };
  $("#lembHora").onchange=e=>{ if(/^\d{2}:\d{2}$/.test(e.target.value)){ S.lembrete.hora=e.target.value; save(); } };
  $("#lembBtn").onclick=()=>{
    const {dias, hora}=S.lembrete; if(!dias.length){ toast("Escolha pelo menos um dia"); return; }
    const url=location.origin+location.pathname, txt=icsLembrete({ dias, hora, inicio:primeiraData(hojeISO(), dias), url });
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([txt],{type:"text/calendar"})); a.download="treino-lembrete.ics"; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),2000); toast("Abra o arquivo para adicionar ao Calendário");
  };
  $("#startDate").onchange=e=>{ E.inicio=e.target.value; setTimeout(atualizarMenu); enfileirar({tipo:"setConfig", chave:`etapa.${FICHA.etapa}.inicio`, valor:E.inicio}); render(); };
  $("#phaseMode").onchange=e=>{ E.faseModo=e.target.value; setTimeout(atualizarMenu); enfileirar({tipo:"setConfig", chave:`etapa.${FICHA.etapa}.faseModo`, valor:E.faseModo}); render(); };
  $("#metaKg").onchange=e=>{ setTimeout(atualizarMenu); const v=e.target.value.trim(); const kg=parseKg(v); if(v && !kg){ toast("Meta inválida"); return; } S.meta.kg = kg ?? ""; enfileirar({tipo:"setConfig", chave:"meta.kg", valor:S.meta.kg}); render(); };
  $("#metaData").onchange=e=>{ S.meta.data=e.target.value; setTimeout(atualizarMenu); enfileirar({tipo:"setConfig", chave:"meta.data", valor:S.meta.data}); render(); };
  $("#resetBtn").onclick=async()=>{ if(await confirmar({ titulo:"Recomeçar os dados da etapa?", texto:`Apagar as sessões e a data de início da etapa ${FICHA.etapa}${S.sync.url?" também na planilha":""}? As cargas registradas na planilha continuam como histórico.`, sim:"Apagar", nao:"Manter", perigo:true })){
    E.historico.forEach(x=>{ if(x.id) enfileirar({tipo:"delSessao", id:x.id}); });
    enfileirar({tipo:"setConfig", chave:`etapa.${FICHA.etapa}.inicio`, valor:""});
    S.etapas[FICHA.etapa]=novaEtapa(); save(); location.reload(); } };
  $("#exportBtn").onclick=()=>{
    const blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`treino-backup-${hojeISO()}.json`; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  };
  $("#importFile").onchange=async e=>{
    const f=e.target.files[0]; e.target.value=""; if(!f) return;
    try{
      const d=JSON.parse(await f.text());
      if(!d || typeof d!=="object" || !d.etapas || typeof d.etapas!=="object" || Array.isArray(d.etapas)) throw 0;
      if(!(await confirmar({ titulo:"Substituir os dados deste aparelho pelo backup?", sim:"Substituir", nao:"Cancelar", perigo:true }))) return;
      // a conexão e a fila deste aparelho são mantidas; o backup é limpo e validado como o estado salvo
      const novo=normalizarEstado({...d, sync:{...S.sync, migrado:false}, fila:S.fila});
      localStorage.setItem(KEY,JSON.stringify(novo)); location.reload();
    }
    catch(err){ toast("Arquivo inválido. Use um backup exportado por este app."); }
  };
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",applyTheme);
}
