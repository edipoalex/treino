/* Movimento: transições e microinterações.
   Regras: nada espera a animação para responder ao toque; tudo dura até ~0,3 s (exceto comemoração);
   só transform e opacity; desligado com "reduzir movimento" do sistema ou Ajustes › Animações › Reduzidas. */
import { S } from "./estado.js";

const reduzSistema = matchMedia("(prefers-reduced-motion: reduce)");
export const movimentoOk = () => S?.pref?.animacoes!=="reduzidas" && !reduzSistema.matches;
export function aplicarMovimento(){ document.documentElement.dataset.mov = movimentoOk() ? "completo" : "reduzido"; }
export function iniciarMovimento(){ aplicarMovimento(); reduzSistema.addEventListener?.("change", aplicarMovimento); }

/* Eventos recentes: a próxima renderização anima só o que acabou de mudar (a série marcada, a carga ajustada…) */
const marcas = {};
export const marcar = (nome, dados={}) => { marcas[nome] = { ...dados, t: Date.now() }; };
export function recente(nome, ms=900){ const m = marcas[nome]; return m && Date.now()-m.t < ms ? m : null; }

/* Entrada de tela: as animações de chegada (anilha, barras…) rodam só na primeira abertura de cada aba no dia;
   nas trocas seguintes a aba aparece direto (com o deslize curto da troca de aba) */
let tEntrada;
function primeiraVezHoje(nome){
  const hoje=new Date().toLocaleDateString("sv"); let v={};
  try{ v=JSON.parse(localStorage.getItem("treino-entradas")||"{}"); }catch(e){}
  if(v.d!==hoje) v={ d:hoje, a:[] };
  if(v.a.includes(nome)) return false;
  v.a.push(nome); try{ localStorage.setItem("treino-entradas", JSON.stringify(v)); }catch(e){}
  return true;
}
export function entrada(nome="hoje"){
  if(!movimentoOk() || !primeiraVezHoje(nome)) return;
  const v = document.getElementById("view"); if(!v) return;
  v.classList.remove("entrando"); void v.offsetWidth; v.classList.add("entrando");
  clearTimeout(tEntrada); tEntrada = setTimeout(() => v.classList.remove("entrando"), 1400);
}

/* Troca de aba: deslize curto na direção da aba (View Transitions; sem suporte, troca direto) */
export function trocarTela(fazer, dir="frente"){
  if(!movimentoOk() || !document.startViewTransition){ fazer(); return; }
  const html = document.documentElement; html.dataset.dir = dir; html.classList.add("vt");
  const vt = document.startViewTransition(fazer);
  // trocar de aba rápido pula a transição anterior: não é erro, então as promessas não podem rejeitar soltas
  vt.ready.catch(()=>{}); vt.updateCallbackDone.catch(()=>{});
  vt.finished.catch(()=>{}).finally(() => html.classList.remove("vt"));
}

/* Números que contam até o valor: <b data-contar="56">56</b>; data-dec="1" e data-suf=" t" opcionais */
export function contar(raiz){
  if(!movimentoOk()) return;
  raiz.querySelectorAll("[data-contar]").forEach(el => {
    const fim = +el.dataset.contar, dec = +(el.dataset.dec||0), suf = el.dataset.suf||"";
    if(!isFinite(fim) || fim<=0) return;
    const t0 = performance.now(), dur = 700;
    const passo = agora => { const p = Math.min(1, (agora-t0)/dur), e = 1-Math.pow(1-p, 3);
      el.textContent = (fim*e).toFixed(dec).replace(".", ",") + suf; if(p<1) requestAnimationFrame(passo); };
    requestAnimationFrame(passo);
  });
}

/* Confete curto (1,2 s) para recorde, nas cores das anilhas */
export function confete(){
  if(!movimentoOk()) return;
  const c = document.createElement("canvas"), dpr = Math.min(2, devicePixelRatio||1);
  c.className = "confete"; c.width = innerWidth*dpr; c.height = innerHeight*dpr; document.body.appendChild(c);
  const g = c.getContext("2d"); g.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement), cores = ["--pA","--pB","--pC","--pD","--pF","--pG"].map(v => cs.getPropertyValue(v).trim());
  const ps = Array.from({length:70}, () => ({ x: innerWidth/2, y: innerHeight*.38, vx: (Math.random()-.5)*11, vy: -Math.random()*12-4,
    r: Math.random()*Math.PI, vr: (Math.random()-.5)*.4, w: 6+Math.random()*6, h: 4+Math.random()*4, cor: cores[Math.floor(Math.random()*cores.length)] }));
  const t0 = performance.now();
  const quadro = agora => {
    const t = (agora-t0)/1200; g.clearRect(0, 0, innerWidth, innerHeight);
    for(const p of ps){ p.vy += .38; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.globalAlpha = Math.max(0, 1-t); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.cor; g.fillRect(-p.w/2, -p.h/2, p.w, p.h); g.restore(); }
    if(t<1) requestAnimationFrame(quadro); else c.remove();
  };
  requestAnimationFrame(quadro);
}

/* Segurar + ou − repete o ajuste (depois de 0,4 s, a cada 0,12 s) */
let tRep, iRep, repetiu = false, ouvindo = false;
const parar = () => { clearTimeout(tRep); clearInterval(iRep); };
export function segurarRepete(raiz, seletor, acao){
  if(!ouvindo){ ouvindo = true; for(const ev of ["pointerup","pointercancel","scroll","visibilitychange"]) document.addEventListener(ev, parar, true); }
  raiz.onpointerdown = e => {
    const b = e.target.closest(seletor); if(!b) return;
    const dado = b.dataset; repetiu = false; parar();
    tRep = setTimeout(() => { repetiu = true; iRep = setInterval(() => acao(dado), 120); }, 400);
  };
}
/* Depois de repetir segurando, o clique que vem ao soltar não conta mais um passo */
export const consumirRepeticao = () => { const r = repetiu; repetiu = false; return r; };

/* Folha (menu de baixo): arrastar para baixo fecha */
export function arrastarParaFechar(f, fechar){
  const corpo = f.querySelector(".corpo"); let y0 = null, dy = 0;
  corpo.addEventListener("touchstart", e => { y0 = corpo.scrollTop<=0 ? e.touches[0].clientY : null; dy = 0; }, { passive:true });
  corpo.addEventListener("touchmove", e => {
    if(y0==null) return; dy = Math.max(0, e.touches[0].clientY - y0);
    if(dy>6){ corpo.style.transition = "none"; corpo.style.transform = `translateY(${dy}px)`; }
  }, { passive:true });
  corpo.addEventListener("touchend", () => {
    if(y0==null) return; y0 = null; corpo.style.transition = ""; corpo.style.transform = "";
    if(dy>90) fechar();
  });
}
