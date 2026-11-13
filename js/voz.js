/* Voz (fase 4): fala as fases do cardio e, se escolhido, o fim do descanso, com a voz do próprio aparelho.
   Ajustes › Voz: desligada, cardio, ou cardio e descanso. Na tela de fases, o alto-falante silencia na hora.
   No iPhone a fala precisa começar num toque: desbloquear() roda junto com o primeiro bip (prepararSom). */
import { S } from "./estado.js";

let liberada=false, vozPt=null;
const ok = () => "speechSynthesis" in window && typeof SpeechSynthesisUtterance!=="undefined";
function escolherVoz(){ if(!ok()) return; const vs=speechSynthesis.getVoices(); vozPt = vs.find(v=>/^pt-BR/i.test(v.lang)) || vs.find(v=>/^pt/i.test(v.lang)) || null; }
if(ok()){ escolherVoz(); speechSynthesis.addEventListener?.("voiceschanged", escolherVoz); }
export function desbloquear(){
  if(liberada || !ok() || S?.pref?.voz==="off") return;
  try{ const u=new SpeechSynthesisUtterance(" "); u.volume=0; speechSynthesis.speak(u); liberada=true; }catch(e){}
}
/* tipo: "cardio" (fases do cardio e do cronômetro) ou "descanso" (só com "Cardio e descanso") */
export function falar(txt, tipo="cardio"){
  const p=S?.pref?.voz || "cardio";
  if(!ok() || !txt || p==="off" || (tipo==="descanso" && p!=="tudo") || S.exec?.mudo) return;
  try{ const u=new SpeechSynthesisUtterance(txt); u.lang="pt-BR"; if(vozPt) u.voice=vozPt; u.rate=1.05;
    speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(e){}
}
export const vozLigada = () => (S?.pref?.voz || "cardio")!=="off" && ok();
