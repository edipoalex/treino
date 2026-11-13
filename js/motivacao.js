/* Motivação (v1.41): decide QUANDO o treinador fala e QUAL frase usa. Puro e testado (tests/motivacao.test.js).
   - Cada momento tem uma chance de falar; início e fim do treino, recorde, meta da semana e volta sempre falam.
   - Frequência (Pouca/Normal/Muita): intervalo mínimo entre balões e limite por treino.
   - Sorteio sem repetição por momento e estilo; as 20 últimas frases mostradas não voltam logo.
   - Fim do descanso ("livre"): a frase troca o "VAI!" do aviso que já existe, então não conta no intervalo nem no limite. */
import { FALAS, TONS } from "./falas.js";

export const EVENTOS = {
  inicioTreino:{ p:1, sempre:true, rot:"Início do treino" }, inicioExercicio:{ p:.35, rot:"Início de exercício" }, serie:{ p:.22, rot:"Série feita" },
  ultimaSerie:{ p:.55, rot:"Última série (antes)" }, exercicioFeito:{ p:.5, rot:"Exercício concluído" }, cargaSubiu:{ p:.6, rot:"Carga aumentada" },
  recorde:{ p:1, sempre:true, rot:"Recorde batido" }, cardioInicio:{ p:1, rot:"Início do cardio" }, cardioForte:{ p:.35, rot:"Fase forte" },
  cardioLeve:{ p:.2, rot:"Fase leve" }, cardioMetade:{ p:1, rot:"Metade do cardio" }, cardioRetaFinal:{ p:.8, rot:"Reta final" },
  cardioFim:{ p:1, rot:"Fim do cardio" }, treinoFim:{ p:1, sempre:true, rot:"Treino concluído" }, metaSemana:{ p:1, sempre:true, rot:"Meta da semana" },
  volta:{ p:1, sempre:true, rot:"Volta após dias sem treinar" },
  fimDescanso:{ p:1, sempre:true, livre:true, rot:"Fim do descanso" } };
/* Frequência: intervalo mínimo entre balões (s), limite por treino e um fator na probabilidade */
export const FREQ = { pouca:{ intervalo:150, limite:6, fator:.5 }, normal:{ intervalo:75, limite:12, fator:1 }, muita:{ intervalo:40, limite:20, fator:1.5 } };

/* Sorteio sem repetição: cada evento+tom tem um "saco" embaralhado; só repete depois de usar todas */
function embaralha(a, rnd){ const b=[...a]; for(let i=b.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; }
const preencher = (t, ctx) => t.replace(/\{(\w+)\}/g, (_, k) => ctx[k] ?? "");

/* estado = { ultimoEm, noTreino, sacos:{}, recentes:[] } (fica no aparelho); prefs = { tons:["padrao","zoeira","bravo"] (vazio = desligado), freq } */
export function falar(evento, ctx, estado, prefs, agora=Date.now(), rnd=Math.random){
  const E = EVENTOS[evento], F = FREQ[prefs.freq||"normal"];
  const tons = (prefs.tons||[]).filter(t => FALAS[evento]?.[t]?.length); if(!E || !tons.length) return null;
  if(!E.sempre){
    if(estado.noTreino >= F.limite) return null;
    if(estado.ultimoEm && agora-estado.ultimoEm < F.intervalo*1000) return null;
    if(rnd() > Math.min(1, E.p*F.fator)) return null;
  }
  const tom = tons[Math.floor(rnd()*tons.length)], lista = FALAS[evento][tom], chave = `${evento}.${tom}`;
  estado.sacos ??= {}; estado.recentes ??= [];
  let saco = estado.sacos[chave] = estado.sacos[chave]?.filter(i => i < lista.length);   // o repertório pode mudar entre versões
  if(!saco?.length) saco = estado.sacos[chave] = embaralha(lista.map((_,i)=>i), rnd).filter(i => !estado.recentes.includes(`${chave}.${i}`) || lista.length<4);
  if(!saco.length) saco = estado.sacos[chave] = embaralha(lista.map((_,i)=>i), rnd);
  const i = saco.shift(); estado.recentes = [...estado.recentes, `${chave}.${i}`].slice(-20);
  if(!E.livre){ estado.ultimoEm = agora; estado.noTreino++; }   // fim do descanso troca o "VAI!": não conta no intervalo nem no limite
  return { texto: preencher(lista[i], ctx), tom, evento };
}
export const total = (tom) => Object.values(FALAS).reduce((t, e) => t + (tom ? (e[tom]||[]).length : Object.keys(TONS).reduce((s, k) => s + (e[k]||[]).length, 0)), 0);
