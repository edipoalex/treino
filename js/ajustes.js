import { aplicarMovimento } from "./movimento.js";
import { textoVersao } from "./atualizacao.js";
import { E, FICHA, KEY, S, normalizarEstado, novaEtapa, save } from "./estado.js";
import { render } from "./navegacao.js";
import { fmtKg, hojeISO, parseKg } from "./progresso.js";
import { atualizarSyncUI, enfileirar } from "./sync.js";
import { applyTheme, toast } from "./ui.js";
import { $ } from "./util.js";

/* ---------- Ajustes ---------- */
export const dlg=$("#settings");
export function marcarPref(){
  document.querySelectorAll("[data-pref-modo]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.prefModo===S.pref.modo)));
  document.querySelectorAll("[data-pref-desc]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.prefDesc===S.pref.descanso)));
  document.querySelectorAll("[data-pref-anim]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.prefAnim===S.pref.animacoes)));
}

export function iniciarAjustes(){
  $("#openSettings").onclick=()=>{ setTimeout(atualizarSyncUI); $("#versaoTxt").textContent=textoVersao(); $("#startDate").value=E.inicio||""; $("#phaseMode").value=E.faseModo; $("#metaKg").value=S.meta.kg?fmtKg(+S.meta.kg):""; $("#metaData").value=S.meta.data||""; applyTheme(); marcarPref(); dlg.showModal(); };
  $("#closeSettings").onclick=()=>dlg.close();
  dlg.addEventListener("click",e=>{ if(e.target===dlg) dlg.close(); });
  document.querySelectorAll("[data-theme-opt]").forEach(b=>b.onclick=()=>{ S.theme=b.dataset.themeOpt; save(); applyTheme(); });
  document.querySelectorAll("[data-pref-modo]").forEach(b=>b.onclick=()=>{ S.pref.modo=b.dataset.prefModo; save(); marcarPref(); render(); });
  document.querySelectorAll("[data-pref-anim]").forEach(b=>b.onclick=()=>{ S.pref.animacoes=b.dataset.prefAnim; save(); marcarPref(); aplicarMovimento(); });
  document.querySelectorAll("[data-pref-desc]").forEach(b=>b.onclick=()=>{ S.pref.descanso=b.dataset.prefDesc; save(); marcarPref(); $("#descanso")?.remove(); render(); });
  $("#startDate").onchange=e=>{ E.inicio=e.target.value; enfileirar({tipo:"setConfig", chave:`etapa.${FICHA.etapa}.inicio`, valor:E.inicio}); render(); };
  $("#phaseMode").onchange=e=>{ E.faseModo=e.target.value; enfileirar({tipo:"setConfig", chave:`etapa.${FICHA.etapa}.faseModo`, valor:E.faseModo}); render(); };
  $("#metaKg").onchange=e=>{ const v=e.target.value.trim(); const kg=parseKg(v); if(v && !kg){ toast("Meta inválida"); return; } S.meta.kg = kg ?? ""; enfileirar({tipo:"setConfig", chave:"meta.kg", valor:S.meta.kg}); render(); };
  $("#metaData").onchange=e=>{ S.meta.data=e.target.value; enfileirar({tipo:"setConfig", chave:"meta.data", valor:S.meta.data}); render(); };
  $("#resetBtn").onclick=()=>{ if(confirm(`Apagar as sessões e a data de início da etapa ${FICHA.etapa}${S.sync.url?" também na planilha":""}? As cargas registradas na planilha continuam como histórico.`)){
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
      if(!confirm("Substituir os dados deste aparelho pelo backup?")) return;
      // a conexão e a fila deste aparelho são mantidas; o backup é limpo e validado como o estado salvo
      const novo=normalizarEstado({...d, sync:{...S.sync, migrado:false}, fila:S.fila});
      localStorage.setItem(KEY,JSON.stringify(novo)); location.reload();
    }
    catch(err){ toast("Arquivo inválido. Use um backup exportado por este app."); }
  };
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",applyTheme);
}
