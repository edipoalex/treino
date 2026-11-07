import { FICHA } from "./estado.js";

/* ---------- Guia de exercícios (verso do card) ---------- */
export const GUIA_EX = [
 ["aquecimento",["Comece leve e aumente o ritmo aos poucos.","Nas séries de aproximação, faça 12 reps com ~40% e 6 reps com ~70% da carga de trabalho, sem cansar."]],
 ["supino reto",["Escápulas retraídas e deprimidas, glúteos e pés firmes.","Desça a barra até a linha do mamilo, cotovelos a ~45–60° do tronco.","Empurre para cima e levemente para trás, sem perder a retração das escápulas."]],
 ["supino 30",["Banco a ~30° para enfatizar a porção superior do peitoral.","Halteres descem ao lado do peito com cotovelos levemente para dentro.","Suba aproximando os halteres sem bater um no outro."]],
 ["voador peitoral",["Ajuste o banco para as pegadas ficarem na altura do peito.","Cotovelos levemente flexionados e fixos durante todo o movimento.","Feche contraindo o peito e volte devagar até sentir o alongamento."]],
 ["crossover",["Polias altas, um passo à frente, tronco levemente inclinado.","No cruzando à frente, termine com uma mão passando a outra; no soco para baixo, empurre em direção ao quadril.","Controle a volta, sem deixar o peso puxar os braços."]],
 ["paralelas",["Tronco o mais vertical possível para focar o tríceps.","Desça até ~90° de cotovelo, sem jogar os ombros para frente.","No graviton, ajuste o contrapeso para a falha cair na faixa pedida."]],
 ["tríceps corda",["Cotovelos colados ao corpo e parados.","Estenda totalmente abrindo a corda no final.","Volte até ~90° de cotovelo, sem deixar os ombros subirem."]],
 ["puxada",["Pegada um pouco mais aberta que os ombros.","Inicie o movimento descendo as escápulas, depois puxe a barra até o alto do peito.","Tronco levemente inclinado para trás, sem balançar."]],
 ["remada na máquina",["Peito apoiado e coluna neutra.","Puxe levando os cotovelos para trás e junte as escápulas no final.","Volte até alongar as costas, sem soltar o peso."]],
 ["remada curvada",["Tronco a ~45°, joelhos semiflexionados, coluna neutra.","Pegada supinada: puxe a barra em direção ao umbigo com cotovelos rentes ao corpo.","Evite usar impulso do quadril."]],
 ["voador dorsal",["Peito apoiado no banco, braços estendidos à frente.","Abra os braços em arco levando as mãos para trás, foco na parte de trás do ombro.","Use carga moderada; se precisar balançar, está pesado."]],
 ["rosca barra",["Cotovelos fixos ao lado do corpo.","Suba sem jogar o tronco para trás e desça controlando até estender o braço.","Punhos neutros, sem dobrar."]],
 ["rosca martelo",["Pegada neutra (palmas uma de frente para a outra).","Cotovelos parados; suba até o antebraço passar da horizontal.","Alternado ou simultâneo, sempre com descida controlada."]],
 ["elevação de pernas",["Na paralela, ombros firmes, sem afundar.","Suba as pernas enrolando o quadril para frente, sem balanço.","Desça devagar, sem relaxar totalmente embaixo."]],
 ["prancha",["Corpo em linha reta da cabeça aos calcanhares.","Contraia abdômen e glúteos; não deixe o quadril cair nem subir.","Na lateral, quadril alto e ombro sobre o cotovelo."]],
 ["cadeira extensora",["Joelho alinhado ao eixo da máquina, encosto ajustado.","Estenda até o final e segure ~1 segundo contraindo o quadríceps.","No drop, reduza a carga rápido e continue sem descanso."]],
 ["agachamento livre",["Barra apoiada no trapézio, pés na largura dos ombros, pontas levemente para fora.","Desça mantendo coluna neutra e joelhos na direção dos pés, até pelo menos coxas paralelas.","Suba empurrando o chão com o pé inteiro."]],
 ["hack",["Costas e quadril bem apoiados no encosto.","Pés na altura média da plataforma; desça até ~90° de joelho ou mais, se a lombar não descolar.","Não trave os joelhos no topo."]],
 ["leg press",["Lombar e quadril sempre apoiados no banco.","Pés na altura média da plataforma; desça até onde a lombar não descola.","Na pirâmide, troque as anilhas nos 90s de descanso; não trave os joelhos."]],
 ["stiff",["Joelhos levemente flexionados e fixos.","Leve o quadril para trás deslizando a barra rente às coxas, coluna neutra.","Desça até sentir o alongamento dos posteriores e suba contraindo glúteos."]],
 ["flexora",["Joelho alinhado ao eixo da máquina, quadril apoiado.","Flexione até o máximo e volte devagar.","Não tire o quadril do banco para ajudar."]],
 ["panturrilha",["Em pé: joelhos quase estendidos; sentada: joelhos a 90°.","Desça até alongar bem e suba até a ponta dos pés, segurando 1 segundo no topo.","Bi-set: termine a série em pé e vá direto para a sentada."]],
 ["desenvolvimento",["Sentado com encosto, halteres na altura das orelhas.","Empurre para cima sem bater os halteres e sem arquear a lombar.","Desça até os cotovelos ficarem um pouco abaixo da linha dos ombros."]],
 ["elevação lateral",["Leve inclinação do tronco à frente, cotovelos levemente flexionados.","Suba até a linha dos ombros, conduzindo pelos cotovelos.","Nas micro-pausas, mantenha a mesma carga do início ao fim."]],
 ["crucifixo invertido",["No voador, de frente para o encosto, pegadas na altura dos ombros.","Abra os braços para trás com cotovelos levemente flexionados.","Foco no posterior de ombro, sem encolher o trapézio."]],
 ["elevação frontal",["Anilha segura com as duas mãos, braços quase estendidos.","Suba até a altura dos olhos sem balançar o tronco.","No bi-set, siga direto para a remada alta: puxe os halteres até a altura do peito com cotovelos acima das mãos."]],
 ["encolhimento",["Braços estendidos ao lado do corpo.","Suba os ombros em direção às orelhas, sem girar, e segure 1 segundo.","Na última série, faça o drop de −20% até a falha."]],
 ["abdominal na polia",["Ajoelhado, corda atrás da cabeça.","Enrole o tronco levando o peito em direção ao quadril; quem trabalha é o abdômen, não os braços.","No pallof press, resista à rotação: empurre a corda à frente e segure 2 segundos."]],
 ["roda abdominal",["Ajoelhado, abdômen contraído antes de rolar.","Vá até onde consegue sem a lombar ceder e volte puxando com o abdômen.","Abdominal remador: suba o tronco e dobre as pernas ao mesmo tempo."]],
 ["cardio",["Siga a faixa de frequência cardíaca indicada no Guia.","No HIIT, os tiros são quase no máximo; na Zona 2, dá para conversar.","Prefira bike ou esteira inclinada depois de treinar pernas."]]
];
export function guiaDe(nome){
  const daFicha=FICHA.guia?.[nome]; if(daFicha?.length) return daFicha;
  const n=nome.toLowerCase();
  const achadas=GUIA_EX.filter(([k])=>n.includes(k)).flatMap(([,d])=>d);
  return achadas.length ? achadas : ["Mantenha a técnica e a amplitude completa.","Controle a fase de descida (2–3 segundos).","Siga a prescrição de repetições, descanso e esforço da ficha."];
}
export function metodosDe(it){
  const lista=FICHA.metodos||[];
  const nomes=[].concat(it.metodo||[]);
  if(nomes.length) return nomes.map(n=>lista.find(x=>x[0].toLowerCase()===n.toLowerCase()) || [n,""]);
  const p=it.prescricao.toLowerCase();
  const mapa=[["contraste","Contraste de cargas"],["rest-pause","Rest-pause"],["drop","Drop-set"],["micro-pausas","Micro-pausas"],["bi-set","Bi-set"],["pirâmide","Pirâmide"],["+ 2x","Séries por faixa"]];
  return mapa.filter(([k])=>p.includes(k)).map(([,m])=>lista.find(x=>x[0]===m)).filter(Boolean);
}
/* Textos que dependem da divisão: vêm da ficha; os padrões valem para fichas antigas (até a etapa 19) */
export const notaExpress = t => t.express_nota ?? (FICHA.etapa<=19 ? "Cardio fora deste treino: faça Zona 2 de 25–30 min de manhã ou no fim da tarde, ou some ao treino E." : "");
export const notasCardio = () => FICHA.cardio_notas || (FICHA.etapa<=19 ? ["Depois de pernas, prefira bike ou esteira inclinada. Não faça o intervalado do treino E na véspera do treino C."] : []);
export function perguntaClaude(it, letra){
  return `Estou fazendo o treino ${letra} da minha ficha de musculação (etapa ${FICHA.etapa}). Exercício: ${it.nome}. Prescrição: ${it.prescricao}${it.series?`, ${it.series} séries, ${it.descanso}s de descanso`:""}${it.obs?`. Observação: ${it.obs}`:""}. Me explique como executar com boa técnica, os erros mais comuns e como escolher a carga.`;
}
export const linkClaude=(it,letra)=>"https://claude.ai/new?q="+encodeURIComponent(perguntaClaude(it,letra));
export async function copiarTexto(txt){
  try{ await navigator.clipboard.writeText(txt); return true; }
  catch(e){ const ta=document.createElement("textarea"); ta.value=txt; ta.setAttribute("readonly",""); ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); let ok=false; try{ ok=document.execCommand("copy"); }catch(_){} ta.remove(); return ok; }
}
