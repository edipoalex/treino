/* Falas do treinador (v1.41): repertório por momento do treino e por estilo. O motor que decide quando falar está em js/motivacao.js.
   Estilos: "padrao" (Motivador: frases de personal), "zoeira" (memes e esculhambação) e "bravo" (Sem filtro: sarcasmo e palavrão clássico,
   sem ofensa religiosa, de raça, de orientação ou baixaria pesada). Placeholders: {letra} {ex} {n} {total} {carga}.
   Para ampliar: acrescente frases nas listas; cada momento precisa de pelo menos 4 frases por estilo (os testes conferem). */
export const FALAS = {
  inicioTreino: {
    padrao: ["Bora começar! Treino {letra} na área.", "Hoje é dia de evoluir. Vamos!", "Você já venceu a parte mais difícil: chegou. Agora é executar!",
      "Foco no treino {letra}. Um exercício de cada vez.", "Vamos com tudo, e com técnica!", "Treino {letra} começando. Respira e vai!",
      "Cada treino conta. Bora fazer este valer!", "Celular no modo treino. Vamos!", "Aquecimento bem feito, treino bem feito. Bora!", "Hora de trabalhar. Estou com você!"],
    zoeira: ["Saiu da jaula o monstro!", "BIRL! Hora do show!", "Larga o sofá, que hoje tem treino {letra}!", "Bora, frango! Hoje o ferro não perdoa.",
      "Netflix pode esperar. O ferro, não.", "Achou que eu ia esquecer? Treino {letra}, campeão.", "Treino {letra} na tela. Desculpa esfarrapada fora.",
      "Pré-treino batendo ou é só ansiedade?", "Vamo que vamo! A pizza de sábado agradece.", "Ihhh, olha quem apareceu! Bora, fujão.",
      "Modo besta-fera: ativado.", "Prepara, que hoje o ferro vai te ensinar umas coisas.", "Hoje sai o shape. Ou sai a alma. Vamos ver.",
      "Que cara de sono é essa? Acorda, que o ferro tá te esperando!"] },
  inicioExercicio: {
    padrao: ["Agora: {ex}. Técnica primeiro.", "Concentra no movimento.", "Amplitude completa, controle na descida.", "Vamos de {ex}!",
      "Postura firme e vai.", "Respira, posiciona e executa.", "Ajusta o aparelho e manda ver."],
    zoeira: ["{ex}? Hoje ele vai chorar. Ou você.", "Olha o {ex} aí te encarando.", "Esse aparelho tava com saudade de você. Ele não.",
      "Aparelho livre? Milagre! Aproveita.", "Ajeita o banco e para de enrolar.", "Cuidado, que esse aí não perdoa frango.",
      "Bora, que o {ex} não vai se fazer sozinho."] },
  serie: {
    padrao: ["Isso aí!", "Muito bem!", "Boa série!", "Continue assim!", "Mais uma!", "Mandou bem!", "Ritmo perfeito!", "Tá voando!",
      "Série {n} de {total}: feita!", "Execução limpa. Assim!", "Constância é tudo. Segue!", "Estamos progredindo bem!"],
    zoeira: ["Isso aí, saco de banha!", "BIRL!", "Que moleza é essa? Bora!", "Ainda tá vivo? Ótimo, próxima.", "Tá saindo da jaula o monstro!",
      "Ajuda o maluco que tá doente!", "Frango não, hein? Mostra serviço.", "Mais uma e eu paro de te zoar. Mentira.",
      "Respira, que o oxigênio é de graça.", "Só isso? Pensei que era treino, não alongamento.", "O ferro não mente, e ele disse que dá pra mais.",
      "Aguenta, que a pizza de mais tarde é merecida.", "Tá tremendo ou é terremoto?", "Bonito! Agora para de se olhar no espelho.",
      "Tá com dó do ferro? Ele não tem dó de você.", "Deixa de moleza, seu fracote!", "Era melhor ter ficado em casa vendo série? Não! Bora!",
      "Esse peso aí é de aquecimento, né?", "Quer moleza? Senta no pudim."] },
  ultimaSerie: {
    padrao: ["Última série! Dá tudo!", "Última! Deixa tudo aqui.", "Fecha com chave de ouro!", "Última série: técnica até o fim.", "Última. Capricha!"],
    zoeira: ["Última! Depois pode chorar no vestiário.", "Última série. É agora ou nunca, fracote!", "Bota a alma nessa última.",
      "Última. Faz direito, senão começa de novo. Brincadeira. Ou não.", "Última! Finge que tem gente olhando."] },
  exercicioFeito: {
    padrao: ["Exercício concluído! Muito bem!", "{ex}: feito. Próximo!", "Um a menos. Seguimos!", "Excelente execução!", "Estamos evoluindo bem!"],
    zoeira: ["Já era! {ex} derrotado.", "Riscado da lista. Próxima vítima!", "Mais um pro currículo, monstro.", "Esse aí nem viu de onde veio.",
      "Achei que ia arregar. Errei feio.", "Ninguém liga, mas eu ligo: mandou bem!"] },
  cargaSubiu: {
    padrao: ["Carga nova, mesma técnica. Vai!", "Subiu a carga: é evolução!", "{carga} agora. Confia no seu treino!", "Mais peso, mais força. Bora!", "Progressão de carga: é assim que se cresce.", "Carga nova! Controla a descida."],
    zoeira: ["Aumentou o peso? Agora sim, deixou de ser fraco.", "Mais peso! O ferro gostou de você.", "Agora sim! Esse peso aí não é de enfeite.", "{carga}? Tá ficando metido, hein!", "Subiu o peso! O frango tá virando galo."] },
  recorde: {
    padrao: ["Recorde! {carga}! Isso é evolução!", "Novo recorde pessoal! Parabéns!", "Recorde batido. O trabalho aparece!", "Seu melhor de todos os tempos! Parabéns!", "{carga}! Você nunca levantou tanto!"],
    zoeira: ["RECORDE! O monstro saiu da jaula de vez!", "{carga}?! Quem é você e o que fez com o frango?",
      "Recorde batido! Já pode se gabar no grupo da família.", "Hora do show! Recorde novo!", "Recorde! Tira print antes que alguém duvide."] },
  cardioInicio: {
    padrao: ["Cardio! Bom ritmo, respiração controlada.", "Hora de cuidar do coração. Vamos!", "Cardio começando. Constância vence intensidade.", "Bora pro cardio. Ritmo constante!", "Cardio na área. Mantém a postura e respira."],
    zoeira: ["Hora de queimar essa gordura que não te pertence!", "Cardio: o único momento em que você corre e não chega a lugar nenhum.",
      "Bora suar, que a camiseta já tá pedindo.", "Liga o modo Forrest Gump.", "Esteira não morde. Só cansa."] },
  cardioForte: {
    padrao: ["Forte! Acelera!", "Agora é tiro! Vai!", "Forte! Tudo que tiver!", "Ritmo forte! Você aguenta!", "Agora é intensidade! Vai!"],
    zoeira: ["Acelera, que a pizza tá fugindo!", "Corre, que o boleto tá atrás!", "Forte! Finge que é o ônibus saindo do ponto!", "Vai, vai, vai! O ex tá vindo!"] },
  cardioLeve: {
    padrao: ["Leve. Recupera o fôlego.", "Respira. Já já tem mais.", "Leve. Solta os ombros e respira.", "Recupera. A próxima vem forte.", "Ritmo leve. Respiração no controle."],
    zoeira: ["Respira, que ainda não é a hora de morrer.", "Descansa, que já já eu te chamo de novo.", "Pode ofegar, ninguém tá olhando. Só eu.", "Leve! Aproveita pra lembrar por que começou.", "Respira fundo. O pulmão tá pedindo arrego."] },
  cardioMetade: {
    padrao: ["Metade! Tá indo muito bem.", "Já foi a metade. Segue firme!", "Metade feita! Mantém o ritmo.", "Meio caminho andado. Continua!", "Metade! Você tá mandando bem."],
    zoeira: ["Metade! A outra metade é só mental. E nas pernas.", "Metade já foi. Falta a parte que dói.", "Metade! Agora não dá mais pra desistir, já gastou a pré-treino.", "Já foi a metade. A outra é ladeira abaixo. Mentira.", "Metade! Respira que o pior já foi. Talvez."] },
  cardioRetaFinal: {
    padrao: ["Reta final! Segura o ritmo!", "Falta pouco! Termina forte!", "Reta final! Dá tudo agora!", "Últimos minutos! Mantém firme!", "Quase lá! Termina com força!"],
    zoeira: ["Reta final! Não vai morrer agora, né?", "Últimos minutos. Até o sofá termina essa.", "Reta final! Corre como se tivesse açaí no fim!", "Falta pouco! Até a esteira tá torcendo por você.", "Reta final! Bota a alma pra fora, que ela volta depois."] },
  cardioFim: {
    padrao: ["Cardio concluído! Seu coração agradece.", "Feito! Ótimo trabalho no cardio.", "Cardio pago! Excelente!", "Concluído! Respira e hidrata.", "Fim do cardio. Missão cumprida!"],
    zoeira: ["Sobreviveu! Pode colocar o pulmão de volta.", "Gordura derretida com sucesso. Algumas.", "Acabou! Já pode voltar a respirar pelo nariz.", "Acabou o cardio! A esteira pediu férias.", "Cardio feito! Agora pode andar igual pinguim."] },
  treinoFim: {
    padrao: ["Treino {letra} concluído! Você conseguiu!", "Treino pago! Muito bem!", "Mais um treino na conta. Estamos evoluindo bem!",
      "Orgulho desse esforço!", "Descanso merecido. Até o próximo!"],
    zoeira: ["Treino pago! Agora pode comer aquela pizza. Uma fatia.", "Tá pago! Pode postar a foto no espelho.", "O shape agradece. O sofá também.",
      "Missão cumprida, guerreiro! Banho, comida e cama.", "Hoje teve treino. Amanhã tem dor. Faz parte.", "BIRL! Treino {letra} destruído!",
      "Fim! Pode voltar pra Netflix com a consciência limpa.", "Saiu da academia mais monstro do que entrou. Pouca coisa, mas saiu."] },
  metaSemana: {
    padrao: ["Meta da semana batida! Constância é tudo.", "Semana cumprida. Você é consistente!", "Meta da semana alcançada! Parabéns!", "Mais uma semana completa. Isso é disciplina!", "Meta cumprida! O resultado vem da constância."],
    zoeira: ["Meta batida! Pode se achar, mas só um pouquinho.", "Semana fechada! Até o frango ficou com inveja.", "Meta batida! Pode até se gabar no grupo da família.", "Semana completa! O sofá tá até com saudade.", "Meta cumprida! Tá mais disciplinado que despertador."] },
  fimDescanso: {
    padrao: ["Bora! Próxima série.", "Acabou o descanso. Vamos!", "Hora de voltar!", "Pra cima! Mais uma.", "Descansou? Agora executa!", "Foco total. Vai!",
      "Respira fundo e vai!", "De volta ao ferro!", "Bora, com técnica!", "É agora! Vamos!", "Pronto? Então vai!", "Mais uma, e bem feita!"],
    zoeira: ["BIRL! Volta pro ferro!", "Acabou a moleza!", "Larga o celular, frango!", "Bora, monstro!", "O ferro tá com saudade!", "Saiu da jaula de novo!",
      "Chega de selfie!", "Sem migué! Bora!", "O descanso acabou. O drama, não.", "Volta, que o shape não vem sozinho!", "Ajuda o maluco! Vai!", "Bora, que hoje tem pizza!"] },
  volta: {
    padrao: ["Que bom te ver de volta! Bora retomar.", "Voltou! Recomeçar também é evoluir.", "Bem-vindo de volta! Um treino de cada vez.", "Voltou! O importante é retomar.", "Que bom! Hoje é dia de reconstruir o ritmo."],
    zoeira: ["Olha quem lembrou que tem academia!", "Sumiu, hein? O ferro sentiu sua falta. Eu, nem tanto.", "Voltou! Achei que tinha virado sócio do sofá.", "Voltou! Os pesos estavam perguntando de você.", "Reapareceu! Bora tirar a ferrugem."] },
};

/* Quando falar: probabilidade por evento e se o evento ignora o intervalo mínimo (os grandes momentos sempre falam) */
/* Estilo "Sem filtro" (bravo) */
const BRAVO = {
  inicioTreino: ["Bora, porra! O treino {letra} não vai se fazer sozinho.", "Levanta essa bunda e vai treinar, caralho!", "Que cara de sono é essa? Acorda, porra, é treino {letra}!",
    "Hoje não tem chororô. Treino {letra}, e vai calado.", "Deixa de ser frango do caralho e começa logo essa merda.", "Tá esperando o quê? Convite impresso? Vai, porra!",
    "Se for pra treinar de leve, vai tomar no cu e volta pra casa.", "Celular só pra marcar série. Instagram depois, seu puto.", "Chegou! Agora não vem com frescura, arrombado."],
  inicioExercicio: ["{ex}. Faz direito ou nem começa, caralho.", "{ex} agora. E sem roubar no movimento, malandro.", "Olha a técnica no {ex}, que eu tô vendo essa porra.",
    "{ex}: amplitude completa, não essa meia-boca de bosta.", "Pega peso de gente grande no {ex}, frango.", "{ex}. Se pegar o celular entre as séries, vai se foder."],
  serie: ["Série {n} de {total}. Só isso? Parecia aquecimento.", "Que caralho é esse? Foi série ou alongamento? Brincadeira, tá valendo.", "Isso, caralho! Próxima!",
    "Feita. Agora para de se admirar no espelho e descansa.", "Foi. Mas dá pra mais, e você sabe disso, seu puto.", "Descansa. E não vai dar meia hora com o relógio parado, hein.",
    "Série {n} paga. Agora não amarela na próxima, porra.", "Que bosta é essa de descanso de 5 minutos? Volta pro ferro!", "Mais uma? Mais uma, porra!"],
  ultimaSerie: ["Última, caralho! Esvazia o tanque!", "Última série. Se sobrar força, você fez errado.", "É a última. Não me vem com meia-boca, arrombado.",
    "Última! Treina como se o ex estivesse olhando.", "Última série, porra! Depois você chora.", "Bota a alma nessa última, que o resto foi aquecimento."],
  exercicioFeito: ["{ex} pago. Nem doeu. Mentira, doeu pra caralho.", "Feito! Próximo, que eu não tenho o dia todo.", "{ex} concluído. Ficou bom pra caralho.",
    "Pago, porra! Segue o baile.", "{ex} feito. Tá vendo? Não morreu, seu frouxo.", "Acabou o {ex}. Agora o próximo sem reclamar, caralho."],
  cargaSubiu: ["{carga}? Agora sim, porra! Peso de gente grande.", "Subiu a carga! Até que enfim, caralho.", "{carga}. Quero ver segurar essa merda agora.",
    "Olha o frango virando galo, caralho!", "Subiu pra {carga}. Se baixar de novo, vai tomar no cu."],
  recorde: ["RECORDE, CARALHO! {carga}!", "Puta que pariu, que recorde do caralho!", "{carga}! Quem é esse monstro, porra?",
    "Recorde! Posta, porque ninguém vai acreditar nessa porra.", "Recorde batido! Tá ficando forte pra caralho."],
  cardioInicio: ["Cardio. Eu sei que você odeia. Vai assim mesmo, porra.", "Hora do cardio. Tira essa cara de enterro.", "Bora queimar essa gordura, caralho!",
    "Cardio não é pra andar mexendo no celular, seu puto.", "Esteira não é passarela. Bora, caralho!"],
  cardioForte: ["Forte, caralho! Acelera!", "Isso é forte pra você? Tá de sacanagem.", "Mete o pé, porra!", "Forte de verdade, não forte de Instagram!", "Corre, arrombado, corre!"],
  cardioLeve: ["Leve. Respira, mas não senta, folgado.", "Recupera aí. Leve não é parado, porra.", "Aproveita, que daqui a pouco volta o sofrimento.", "Descansa o pulmão, que o próximo vai doer pra caralho."],
  cardioMetade: ["Metade. Ainda falta a outra metade, gênio.", "Metade, porra! Agora não arrega.", "Para de olhar o relógio, caralho. Ainda é a metade.", "O relógio não tá parado. Você que tá lento pra caralho."],
  cardioRetaFinal: ["Reta final, caralho! Acaba com isso!", "Agora vai com tudo, ou vai se foder.", "Último gás, porra! Bota pra fora!", "Termina essa merda com dignidade!",
    "Falta pouco. Se parar agora, vai dar meia hora com o relógio parado."],
  cardioFim: ["Acabou o cardio! Agora pode morrer em paz.", "Cardio pago, porra! A gordura tá chorando.", "Achou que não ia conseguir, né, seu frouxo?", "Fim! Suado pra caralho. Ótimo."],
  treinoFim: ["Treino {letra} pago, caralho! Vai tomar banho, que tá fedendo.", "Acabou! Foi bom pra caralho. Amanhã tem mais.", "Treino pago. Agora come direito, porra, nada de besteira.",
    "Fechou! Quem diria, hein, frango do caralho?", "Pago! Hoje você não foi um arrombado preguiçoso.", "Acabou, porra! Que treino do caralho!"],
  metaSemana: ["Meta da semana batida, caralho! Respeita!", "Bateu a meta! Agora não vai estragar no fim de semana, seu puto.", "Tá ficando disciplinado pra caralho.", "Semana paga! Pode até tirar foto no espelho, porra."],
  fimDescanso: ["Levanta, porra!", "Acabou o descanso, caralho!", "Vai, arrombado!", "Larga essa merda de celular!", "Tá esperando o quê, porra?",
    "Bora, frango do caralho!", "Chega de enrolar, seu puto!", "Volta pro ferro, caralho!", "Descansou demais, porra!", "Mexe essa bunda!",
    "Que descanso de bosta é esse? Vai!", "Relógio parado? Vai, porra!"],
  volta: ["Olha quem voltou! Onde você tava, caralho?", "Sumiu, né? Achei que tinha morrido, porra.", "Que porra de férias foram essas?", "Ah, lembrou que tem academia? Bora, seu puto.",
    "Até que enfim, caralho! Bora recuperar o tempo perdido."] };
for(const k in BRAVO) FALAS[k].bravo = BRAVO[k];

export const TONS = { padrao:"Motivador", zoeira:"Zoeira", bravo:"Sem filtro" };
