/* Ponto de entrada: carrega o estado, liga os eventos e desenha a tela.
   Os módulos só declaram funções e constantes; tudo que mexe na página acontece aqui, nesta ordem. */
import { iniciarEstado, E } from "./estado.js";
import { iniciarSync, agendarSync, atualizarSyncUI } from "./sync.js";
import { iniciarNavegacao, render } from "./navegacao.js";
import { iniciarAjustes } from "./ajustes.js";
import { iniciarAtualizacao, checarVersao } from "./atualizacao.js";
import { enviarCargasPendentes } from "./cargas.js";
import { retomarTimer, tick } from "./descanso.js";
import { applyTheme, manterTela } from "./ui.js";
import { entrada, iniciarMovimento } from "./movimento.js";

iniciarEstado();
iniciarMovimento();
iniciarSync();
iniciarNavegacao();
iniciarAjustes();
document.addEventListener("visibilitychange",()=>{ if(document.hidden){ enviarCargasPendentes(); return; } render(); tick(); agendarSync(200); if(E.atual) manterTela(true); });
iniciarAtualizacao();

applyTheme(); render(); entrada(); retomarTimer(); atualizarSyncUI(); agendarSync(100); checarVersao();

/* Offline */
if("serviceWorker" in navigator && location.protocol==="https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
