/* Motivação (v1.41): decide QUANDO o treinador fala e QUAL frase usa. Puro e testado (tests/motivacao.test.js).
   - Cada momento tem uma chance de falar; início e fim do treino, recorde, meta da semana e volta sempre falam.
   - Frequência (Pouca/Normal/Muita): intervalo mínimo entre balões e limite por treino.
   - Sorteio sem repetição por momento, estilo e categoria; as 20 últimas frases mostradas não voltam logo.
   - Categorias de humor (v1.46): alterna as categorias do estilo (nunca a mesma em seguida, se houver outra).
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
/* {masculino|feminino} pelo tratamento escolhido (v1.49); depois {letra} {ex} {n} {total} {carga} */
export const preencher = (t, ctx, genero="m") => t.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m, f) => genero==="f" ? f : m).replace(/\{(\w+)\}/g, (_, k) => ctx[k] ?? "");

/* Grupos de um momento e estilo: { categoria: [frases] }; uma lista simples vira um grupo só ("geral") */
export const grupos = v => Array.isArray(v) ? (v.length ? { geral:v } : {}) : Object.fromEntries(Object.entries(v||{}).filter(([,l]) => Array.isArray(l) && l.length));
const qtd = v => Object.values(grupos(v)).reduce((n, l) => n + l.length, 0);
/* Categoria da vez (v1.46): a que está há mais tempo sem aparecer naquele estilo; nunca a mesma da fala anterior, se houver outra */
function escolherCategoria(cats, usadas, rnd){
  const ult = usadas[usadas.length-1], cand = cats.length>1 ? cats.filter(c => c!==ult) : cats;
  const idade = c => usadas.lastIndexOf(c);   // -1 = nunca usada (a mais antiga)
  const min = Math.min(...cand.map(idade)), empate = cand.filter(c => idade(c)===min);
  return empate[Math.floor(rnd()*empate.length)];
}
/* estado = { ultimoEm, noTreino, sacos:{}, recentes:[], cats:{ tom:[categorias recentes] } } (fica no aparelho);
   prefs = { tons:["padrao","zoeira","bravo"] (vazio = desligado), freq } */
export function falar(evento, ctx, estado, prefs, agora=Date.now(), rnd=Math.random){
  const E = EVENTOS[evento], F = FREQ[prefs.freq||"normal"];
  const tons = (prefs.tons||[]).filter(t => qtd(FALAS[evento]?.[t])); if(!E || !tons.length) return null;
  if(!E.sempre){
    if(estado.noTreino >= F.limite) return null;
    if(estado.ultimoEm && agora-estado.ultimoEm < F.intervalo*1000) return null;
    if(rnd() > Math.min(1, E.p*F.fator)) return null;
  }
  const tom = tons[Math.floor(rnd()*tons.length)], gs = grupos(FALAS[evento][tom]);
  estado.sacos ??= {}; estado.recentes ??= []; estado.cats ??= {};
  const usadas = estado.cats[tom] ??= [];
  // só concorrem as categorias que ainda têm frase não usada neste momento; usadas todas, recomeça
  const k = c => `${evento}.${tom}.${c}`;
  for(const c in gs) if(estado.sacos[k(c)]) estado.sacos[k(c)] = estado.sacos[k(c)].filter(i => i < gs[c].length);   // o repertório pode mudar entre versões
  let livres = Object.keys(gs).filter(c => !estado.sacos[k(c)] || estado.sacos[k(c)].length);
  if(!livres.length){ for(const c in gs) delete estado.sacos[k(c)]; livres = Object.keys(gs); }
  // prioridade: não repetir frase; depois, não repetir a categoria anterior (só repete se ela for a única com frase nova)
  const cat = escolherCategoria(livres, usadas, rnd), lista = gs[cat], chave = k(cat);
  let saco = estado.sacos[chave];
  if(!saco) saco = estado.sacos[chave] = embaralha(lista.map((_,i)=>i), rnd).filter(i => !estado.recentes.includes(`${chave}.${i}`) || lista.length<4);
  if(!saco.length) saco = estado.sacos[chave] = embaralha(lista.map((_,i)=>i), rnd);
  const i = saco.shift(); estado.recentes = [...estado.recentes, `${chave}.${i}`].slice(-20);
  estado.cats[tom] = [...usadas, cat].slice(-12);
  if(!E.livre){ estado.ultimoEm = agora; estado.noTreino++; }   // fim do descanso troca o "VAI!": não conta no intervalo nem no limite
  return { texto: preencher(lista[i], ctx, prefs.genero), tom, evento, cat };
}
export const total = (tom) => Object.values(FALAS).reduce((t, e) => t + (tom ? qtd(e[tom]) : Object.keys(TONS).reduce((s, k) => s + qtd(e[k]), 0)), 0);
