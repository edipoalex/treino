/* Falas do treinador na tela (v1.41): balão com o personagem no topo, durante o treino.
   motivar(evento, ctx) decide pelo motor (js/motivacao.js) e mostra; fraseFimDescanso() dá a frase que troca o "VAI!".
   Ajustes › Motivação: estilos (Motivador, Zoeira, Sem filtro), frequência e personagem (S.pref.falas).
   O balão: um por vez, some sozinho em 3,5 a 6 s (barra de tempo), fecha no X ou com um toque, fica abaixo do "Desfazer"
   quando ele está na tela, aparece também sobre a tela cheia do descanso e do cardio, e é anunciado sem roubar o foco. */
import { E, S, save } from "./estado.js";
import { falar } from "./motivacao.js";
import { PERSONAGENS, personagem } from "./personagens.js";
import { esc } from "./util.js";

const IDS = Object.keys(PERSONAGENS);
/* personagem do treino: o escolhido, ou um sorteado a cada treino (guardado no treino em andamento) */
export function bichoAtual(){
  const b = S.pref.falas.bicho;
  if(b !== "sortear") return b;
  const a = E?.atual; if(!a) return IDS[0];
  if(!IDS.includes(a.bicho)){ a.bicho = IDS[Math.floor(Math.random() * IDS.length)]; save(); }
  return a.bicho;
}
export function corDoTreino(letra = E?.atual?.letra){
  const c = letra && getComputedStyle(document.documentElement).getPropertyValue(`--p${letra}`).trim();
  return /^#[0-9a-f]{6}$/i.test(c || "") ? c : "#2E9E5B";
}
export const desenhoBicho = (humor, tam, bicho = bichoAtual(), letra) => bicho === "nenhum" ? "" : personagem(bicho, humor, corDoTreino(letra), tam);

/* estado do motor (fica no aparelho: o treino continua igual se o app recarregar) */
export function zerarTreinoFalas(){ S.mot.ultimoEm = 0; S.mot.noTreino = 0; }
export const falasLigadas = () => S.pref.falas.tons.length > 0;

let tFecha = null;
export function fecharBalao(){
  clearTimeout(tFecha); const b = document.getElementById("balao"); if(!b) return;
  b.classList.add("saindo"); b.id = ""; setTimeout(() => b.remove(), 240);
}
export function mostrarBalao({ texto, tom }, { bicho, letra } = {}){
  fecharBalao(); clearTimeout(tFecha);
  const dur = Math.min(6000, 3500 + texto.length * 40), fig = desenhoBicho(tom, 52, bicho, letra);
  const b = document.createElement("div"); b.id = "balao"; b.className = `balao ${tom}${fig ? "" : " sem-bicho"}`;
  b.innerHTML = `${fig}<div class="fala" role="status" aria-live="polite"><span>${esc(texto)}</span>
    <button class="fechar" aria-label="Fechar">×</button><i class="tempo" style="animation-duration:${dur}ms"></i></div>`;
  const d = document.getElementById("desfazer"); if(d) b.style.top = `${Math.round(d.getBoundingClientRect().bottom + 8)}px`;
  b.querySelector(".fala").onclick = fecharBalao;
  // com um diálogo aberto (Ajustes), o balão vai dentro dele para ficar por cima
  (document.querySelector("dialog[open]") || document.body).appendChild(b); tFecha = setTimeout(fecharBalao, dur);
}
/* um momento do treino: o motor decide se fala */
export function motivar(evento, ctx = {}){
  if(!falasLigadas()) return null;
  const f = falar(evento, { letra: E?.atual?.letra || "", ...ctx }, S.mot, S.pref.falas); save();
  if(f) mostrarBalao(f, { letra: ctx.letra || E?.atual?.letra, bicho: ctx.bicho });
  return f;
}
/* fim do descanso: a frase troca o "VAI!" (null = falas desligadas, fica o "VAI!") */
export function fraseFimDescanso(){
  if(!falasLigadas()) return null;
  const f = falar("fimDescanso", {}, S.mot, S.pref.falas); save(); return f;
}
/* exemplo em Ajustes: um balão de cada estilo marcado, sem mexer no limite do treino */
export function exemploFala(){
  if(!falasLigadas()) return false;
  const tom = S.pref.falas.tons[Math.floor(Math.random() * S.pref.falas.tons.length)];
  const f = falar("treinoFim", { letra: "A" }, { ...S.mot, ultimoEm: 0, noTreino: 0 }, { ...S.pref.falas, tons: [tom] });
  if(f) mostrarBalao(f, { letra: E?.atual?.letra || "A" });
  return true;
}
