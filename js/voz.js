/* Voz (fase 4): fala as fases do cardio e, se escolhido, o fim do descanso, com a voz do próprio aparelho.
   Ajustes › Voz: desligada, cardio, ou cardio e descanso. Na tela de fases, o alto-falante silencia na hora.
   No iPhone a fala precisa começar num toque: desbloquear() roda junto com o primeiro bip (prepararSom). */
import { S } from "./estado.js";

let liberada=false, vozPt=null;
const ok = () => "speechSynthesis" in window && typeof SpeechSynthesisUtterance!=="undefined";
function escolherVoz(){ if(!ok()) return; const vs=speechSynthesis.getVoices(); vozPt = vs.find(v=>/^pt-BR/i.test(v.lang)) || vs.find(v=>/^pt/i.test(v.lang)) || null; }
if(ok()){ escolherVoz(); speechSynthesis.addEventListener?.("voiceschanged", escolherVoz); }
/* Modo silencioso do iPhone: apps da web ficam mudos (voz e bipes). Com Ajustes › "Tocar no modo silencioso",
   o app entra na categoria de mídia (como um player): navigator.audioSession = "playback" onde existe, e um áudio
   mudo em loop enquanto o treino está aberto, que mantém essa categoria. Pode pausar a música de outros apps,
   por isso é opcional. Precisa começar num toque (vem de desbloquear(), chamado pelo prepararSom). */
let mudo=null;
function silencioWav(){ // 1 s de silêncio, 8 kHz, 8 bits
  const n=8000, b=new ArrayBuffer(44+n), v=new DataView(b), t=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));
  t(0,"RIFF"); v.setUint32(4,36+n,true); t(8,"WAVE"); t(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
  v.setUint32(24,8000,true); v.setUint32(28,8000,true); v.setUint16(32,1,true); v.setUint16(34,8,true); t(36,"data"); v.setUint32(40,n,true);
  for(let i=0;i<n;i++) v.setUint8(44+i,128);
  return URL.createObjectURL(new Blob([b],{type:"audio/wav"}));
}
export function ativarSomSilencioso(){
  if(!S?.pref?.silencioso) return;
  try{ if(navigator.audioSession) navigator.audioSession.type="playback"; }catch(e){}
  try{ if(!mudo){ mudo=new Audio(silencioWav()); mudo.loop=true; mudo.setAttribute("playsinline",""); } if(mudo.paused) mudo.play().catch(()=>{}); }catch(e){}
}
export function desativarSomSilencioso(){
  try{ mudo?.pause(); }catch(e){}
  try{ if(navigator.audioSession) navigator.audioSession.type="auto"; }catch(e){}
}
export function desbloquear(){
  ativarSomSilencioso();
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
