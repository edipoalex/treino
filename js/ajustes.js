import { aplicarMovimento } from "./movimento.js";
import { textoVersao } from "./atualizacao.js";
import { E, FICHA, KEY, S, normalizarEstado, novaEtapa, save } from "./estado.js";
import { render } from "./navegacao.js";
import { fmtKg, hojeISO, parseKg } from "./progresso.js";
import { atualizarSyncUI, enfileirar } from "./sync.js";
import { applyTheme, confirmar, toast } from "./ui.js";
import { $ } from "./util.js";
import { falar, desbloquear, ativarSomSilencioso, desativarSomSilencioso } from "./voz.js";
import { icsLembrete, primeiraData } from "./inteligente.js";

/* ---------- Ajustes ---------- */
export const dlg=$("#settings");
export function marcarPref(){
  document.querySelectorAll("[data-pref-modo]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.prefModo===S.pref.modo)));
  document.querySelectorAll("[data-pref-desc]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.prefDesc===S.pref.descanso)));
  document.querySelectorAll("[data-pref-anim]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.prefAnim===S.pref.animacoes)));
  document.querySelectorAll("[data-pref-voz]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.prefVoz===S.pref.voz)));
  const sl=$("#prefSilencioso"); if(sl) sl.checked=!!S.pref.silencioso;
  const ld=$("#lembDias"); if(ld) ld.innerHTML=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d,i)=>`<button data-lemb-dia="${i}" aria-pressed="${S.lembrete.dias.includes(i)}">${d}</button>`).join("");
  const lh=$("#lembHora"); if(lh) lh.value=S.lembrete.hora;
}

export function iniciarAjustes(){
  $("#openSettings").onclick=()=>{ setTimeout(atualizarSyncUI); $("#versaoTxt").textContent=textoVersao(); $("#startDate").value=E.inicio||""; $("#phaseMode").value=E.faseModo; $("#metaKg").value=S.meta.kg?fmtKg(+S.meta.kg):""; $("#metaData").value=S.meta.data||""; applyTheme(); marcarPref(); dlg.showModal(); };
  $("#closeSettings").onclick=()=>dlg.close();
  dlg.addEventListener("click",e=>{ if(e.target===dlg) dlg.close(); });
  document.querySelectorAll("[data-theme-opt]").forEach(b=>b.onclick=()=>{ S.theme=b.dataset.themeOpt; save(); applyTheme(); });
  document.querySelectorAll("[data-pref-modo]").forEach(b=>b.onclick=()=>{ S.pref.modo=b.dataset.prefModo; save(); marcarPref(); render(); });
  document.querySelectorAll("[data-pref-anim]").forEach(b=>b.onclick=()=>{ S.pref.animacoes=b.dataset.prefAnim; save(); marcarPref(); aplicarMovimento(); });
  document.querySelectorAll("[data-pref-desc]").forEach(b=>b.onclick=()=>{ S.pref.descanso=b.dataset.prefDesc; save(); marcarPref(); $("#descanso")?.remove(); render(); });
  document.querySelectorAll("[data-pref-voz]").forEach(b=>b.onclick=()=>{ S.pref.voz=b.dataset.prefVoz; save(); marcarPref(); });
  $("#prefSilencioso").onchange=e=>{ S.pref.silencioso=e.target.checked; save(); if(S.pref.silencioso && E.atual) ativarSomSilencioso(); else if(!S.pref.silencioso) desativarSomSilencioso(); };
  $("#ouvirVoz").onclick=()=>{ if(S.pref.voz==="off"){ toast("A voz está desligada"); return; } desbloquear(); falar("Forte, 30 segundos. Três, dois, um. Leve."); if(!E.atual) setTimeout(desativarSomSilencioso, 6000); };
  $("#lembDias").onclick=e=>{ const b=e.target.closest("[data-lemb-dia]"); if(!b) return; const d=+b.dataset.lembDia, ds=S.lembrete.dias;
    S.lembrete.dias = ds.includes(d) ? ds.filter(x=>x!==d) : [...ds, d].sort(); save(); marcarPref(); };
  $("#lembHora").onchange=e=>{ if(/^\d{2}:\d{2}$/.test(e.target.value)){ S.lembrete.hora=e.target.value; save(); } };
  $("#lembBtn").onclick=()=>{
    const {dias, hora}=S.lembrete; if(!dias.length){ toast("Escolha pelo menos um dia"); return; }
    const url=location.origin+location.pathname, txt=icsLembrete({ dias, hora, inicio:primeiraData(hojeISO(), dias), url });
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([txt],{type:"text/calendar"})); a.download="treino-lembrete.ics"; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),2000); toast("Abra o arquivo para adicionar ao Calendário");
  };
  $("#startDate").onchange=e=>{ E.inicio=e.target.value; enfileirar({tipo:"setConfig", chave:`etapa.${FICHA.etapa}.inicio`, valor:E.inicio}); render(); };
  $("#phaseMode").onchange=e=>{ E.faseModo=e.target.value; enfileirar({tipo:"setConfig", chave:`etapa.${FICHA.etapa}.faseModo`, valor:E.faseModo}); render(); };
  $("#metaKg").onchange=e=>{ const v=e.target.value.trim(); const kg=parseKg(v); if(v && !kg){ toast("Meta inválida"); return; } S.meta.kg = kg ?? ""; enfileirar({tipo:"setConfig", chave:"meta.kg", valor:S.meta.kg}); render(); };
  $("#metaData").onchange=e=>{ S.meta.data=e.target.value; enfileirar({tipo:"setConfig", chave:"meta.data", valor:S.meta.data}); render(); };
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
