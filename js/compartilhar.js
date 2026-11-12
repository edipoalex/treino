/* Cartão para compartilhar (fase 4): imagem 1080×1350 desenhada no aparelho (canvas), sem enviar nada a servidor.
   Abre o compartilhar do sistema (navigator.share com arquivo); sem suporte, baixa a imagem.
   Por padrão sem peso corporal e sem cargas; recordes e volume em kg são opcionais. */
import { folha, toast } from "./ui.js";
import { icone } from "./icones.js";

const W=1080, H=1350;
const cor = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "#888";
async function fontes(){ try{ await Promise.all(['700 140px "Barlow Condensed"','600 40px "Barlow"','500 36px "Barlow"'].map(f=>document.fonts.load(f))); }catch(e){} }
const DISPLAY='"Barlow Condensed", "Arial Narrow", sans-serif', BODY='"Barlow", system-ui, sans-serif';
function anilha(g, x, y, r, c){
  // anilha simplificada em marca d'água: aro, disco, cubo e furo
  g.save(); g.globalAlpha=.32;
  g.fillStyle=c; g.beginPath(); g.arc(x,y,r,0,7); g.fill();
  g.globalAlpha=.22; g.fillStyle="#000"; g.beginPath(); g.arc(x,y,r*.8,0,7); g.fill();
  g.globalAlpha=.35; g.fillStyle="#C9CED4"; g.beginPath(); g.arc(x,y,r*.3,0,7); g.fill();
  g.globalAlpha=.9; g.fillStyle="#0F1317"; g.beginPath(); g.arc(x,y,r*.12,0,7); g.fill(); g.restore();
}
function caixa(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
function cortar(g, t, max){ if(g.measureText(t).width<=max) return t; while(t.length>1 && g.measureText(t+"…").width>max) t=t.slice(0,-1); return t+"…"; }
/* d = { letra, cab, titulo:[linha1, linha2], sub, nums:[[valor, rótulo]×3], recs:[texto], url } */
export async function desenharCartao(d){
  await fontes();
  const c=document.createElement("canvas"); c.width=W; c.height=H; const g=c.getContext("2d"), cl=cor(`--p${d.letra}`);
  g.fillStyle="#0F1317"; g.fillRect(0,0,W,H);
  const rg=g.createRadialGradient(W*.85,0,40,W*.85,0,W*1.1); rg.addColorStop(0, cl); rg.addColorStop(1, "rgba(15,19,23,0)");
  g.globalAlpha=.55; g.fillStyle=rg; g.fillRect(0,0,W,H); g.globalAlpha=1;
  anilha(g, W-170, 230, 330, cl);
  g.fillStyle="rgba(255,255,255,.75)"; g.font=`600 34px ${BODY}`; g.fillText(d.cab.toUpperCase(), 80, 130);
  g.fillStyle="#fff"; g.font=`700 150px ${DISPLAY}`;
  d.titulo.forEach((t,i)=>g.fillText(cortar(g,t,W-160), 80, 560+i*140));
  g.fillStyle="rgba(255,255,255,.8)"; g.font=`500 38px ${BODY}`; g.fillText(cortar(g,d.sub,W-160), 80, 560+d.titulo.length*140-40);
  const y0=820, bw=(W-160-2*28)/3;
  d.nums.forEach(([v,r],i)=>{ const x=80+i*(bw+28); g.fillStyle="rgba(255,255,255,.08)"; caixa(g,x,y0,bw,190,32); g.fill();
    g.fillStyle="#fff"; g.textAlign="center"; g.font=`700 84px ${DISPLAY}`; g.fillText(String(v), x+bw/2, y0+108);
    g.fillStyle="rgba(255,255,255,.75)"; g.font=`500 30px ${BODY}`; g.fillText(r, x+bw/2, y0+158); g.textAlign="left"; });
  let y=y0+270;
  for(const t of (d.recs||[]).slice(0,3)){ g.fillStyle="#7BE0A6"; g.font=`600 36px ${BODY}`; g.fillText(cortar(g,"★ "+t, W-160), 80, y); y+=56; }
  g.fillStyle="rgba(255,255,255,.75)"; g.font=`700 34px ${DISPLAY}`; g.fillText("TREINO", 80, H-80);
  g.font=`500 30px ${BODY}`; g.textAlign="right"; g.fillText(d.url, W-80, H-80); g.textAlign="left";
  return new Promise(res => c.toBlob(res, "image/png"));
}
async function enviar(blob, nome){
  const f=new File([blob], nome, { type:"image/png" });
  try{ if(navigator.canShare?.({ files:[f] })){ await navigator.share({ files:[f], title:"Treino" }); return; } }
  catch(e){ if(e?.name==="AbortError") return; }
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=nome; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
  toast("Imagem salva");
}
/* Folha de compartilhar: monta(opções) devolve os dados do cartão; opções = { rec, vol } */
export function abrirCompartilhar({ monta, nome, temRec, temVol }){
  const op={ rec:!!temRec, vol:false };
  const podeArquivo = !!navigator.canShare && (()=>{ try{ return navigator.canShare({ files:[new File([""],"x.png",{type:"image/png"})] }); }catch(e){ return false; } })();
  folha(`<h3>Compartilhar</h3><img class="share-prev" id="sharePrev" alt="Prévia do cartão">
    <div class="opcoes-share">${temRec?`<label><input type="checkbox" data-op="rec" checked> Mostrar recordes</label>`:""}${temVol?`<label><input type="checkbox" data-op="vol"> Mostrar volume em kg</label>`:""}</div>
    <button class="btn primary cor" data-enviar>${icone("share")} ${podeArquivo?"Compartilhar imagem":"Salvar imagem"}</button><button class="btn" data-fechar>Cancelar</button>`, async f => {
    let blob=null, url="";
    const atualizar = async () => { blob=await desenharCartao(monta(op)); if(url) URL.revokeObjectURL(url); url=URL.createObjectURL(blob); const im=f.querySelector("#sharePrev"); if(im) im.src=url; };
    f.querySelectorAll("[data-op]").forEach(i => i.onchange=() => { op[i.dataset.op]=i.checked; atualizar(); });
    f.querySelector("[data-enviar]").onclick=async () => { if(!blob) await atualizar(); enviar(blob, nome); };
    await atualizar();
  });
}
export const urlApp = () => (location.host + location.pathname).replace(/\/(index\.html)?$/, "");
const MESES=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
export const dataCurta = iso => { const [, m, d]=iso.split("-").map(Number); return `${d} de ${MESES[m-1]}`; };
