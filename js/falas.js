/* Falas do treinador (v2.0): repertório ampliado por momento do treino e por estilo.
   Estilos: "padrao" (Motivador: incentivo cordial), "zoeira" (memes, humor e provocações leves)
   e "bravo" (Sem filtro: sarcasmo e palavrões, sem preconceito, discriminação ou baixaria sexual).
   Placeholders preservados: {letra} {ex} {n} {total} {carga}.
   Cada momento contém pelo menos 5 frases por estilo. O motor que decide quando falar
   continua em js/motivacao.js. */

export const FALAS = {
  inicioTreino: {
    padrao: [
      "Bora começar! Treino {letra} na área.",
      "Hoje é dia de evoluir. Vamos!",
      "Você já venceu a parte mais difícil: chegou. Agora é executar!",
      "Foco no treino {letra}. Um exercício de cada vez.",
      "Vamos com tudo, e com técnica!",
      "Treino {letra} começando. Respira e vai!",
      "Cada treino conta. Bora fazer este valer!",
      "Seu compromisso de hoje é com a sua evolução.",
      "Aquecimento bem feito, treino bem feito. Bora!",
      "O resultado é construído repetição por repetição."
    ],
    zoeira: [
      "Saiu da jaula o monstro! Ou pelo menos abriu a porta.",
      "BIRL! Hora do show!",
      "Larga o sofá, que hoje tem treino {letra}!",
      "O shape não vem por sedex. Bora buscar!",
      "Netflix pode esperar. O ferro, não.",
      "Olha quem apareceu! O algoritmo da academia te encontrou.",
      "Pré-treino batendo ou é só a ansiedade de quem viu a ficha?",
      "Modo projeto verão: carregando... não interrompa.",
      "Hoje o único migué permitido é o nome do exercício.",
      "A preguiça mandou lembranças. Manda ela voltar depois."
    ],
    bravo: [
      "Bora, porra! O treino {letra} não vai se fazer sozinho.",
      "Levanta essa bunda e vai treinar, caralho!",
      "Que cara de sono é essa? Acorda, porra, é treino {letra}!",
      "Hoje não tem chororô. Treino {letra}, e vai calado.",
      "Deixa de enrolação e começa logo essa merda.",
      "Tá esperando o quê? Convite impresso? Vai, porra!",
      "Celular só pra marcar série. Instagram depois, seu peste.",
      "Chegou! Agora não vem com frescura, arrombado.",
      "A preguiça não paga mensalidade. Bora trabalhar, caralho!",
      "Fecha a cara de derrota e abre o treino, porra!"
    ]
  },

  inicioExercicio: {
    padrao: [
      "Agora: {ex}. Técnica primeiro.",
      "Concentre-se no movimento e controle cada repetição.",
      "Amplitude completa, controle na descida.",
      "Vamos de {ex}! Faça cada repetição valer.",
      "Postura firme, respiração no ritmo e execução consciente.",
      "Respira, posiciona e executa.",
      "Ajuste o aparelho e encontre uma posição confortável.",
      "Qualidade de movimento acima de quantidade.",
      "Comece com controle. A força vem junto com a técnica.",
      "Mais um passo na direção da sua meta: {ex}."
    ],
    zoeira: [
      "{ex}? Hoje ele vai chorar. Ou você. Que vença a técnica.",
      "Olha o {ex} aí te encarando. Não arregue para um aparelho.",
      "Esse aparelho estava com saudade de você. Ele não.",
      "Ajeita o banco e para de negociar com o equipamento.",
      "Bora, que o {ex} não vai se fazer sozinho.",
      "O aparelho não é decoração. Mostra serviço!",
      "Atenção: começou o episódio de hoje de 'Eu e o Ferro'.",
      "O {ex} chamou seu nome. Não vai deixar no vácuo, né?",
      "Postura de quem sabe o que está fazendo. Mesmo que esteja aprendendo.",
      "Sem coreografia inventada: faz o movimento direito!"
    ],
    bravo: [
      "{ex}. Faz direito ou nem começa, caralho.",
      "{ex} agora. E sem roubar no movimento, malandro.",
      "Olha a técnica no {ex}, que eu tô vendo essa porra.",
      "{ex}: amplitude e controle. Não essa meia-boca de bosta.",
      "Ajusta essa postura, porra. O objetivo é treinar, não improvisar.",
      "{ex}. Se pegar o celular entre as séries, vai se foder.",
      "Para de conversar com o aparelho e executa essa merda.",
      "Menos gracinha e mais controle, caralho!",
      "Não inventa moda. Faz o básico bem feito, porra.",
      "Se a execução tá torta, corrige antes de querer bancar o gigante."
    ]
  },

  serie: {
    padrao: [
      "Isso aí! Boa execução.",
      "Muito bem! Continue nesse ritmo.",
      "Boa série! Mais um passo concluído.",
      "Continue assim, com controle e consistência.",
      "Mais uma! Você está no caminho certo.",
      "Mandou bem! Respire e prepare a próxima.",
      "Ritmo consistente. É assim que se evolui.",
      "Série {n} de {total}: feita!",
      "Execução limpa. Assim!",
      "Constância é tudo. Segue!",
      "Estamos progredindo bem!",
      "Cada repetição bem feita conta."
    ],
    zoeira: [
      "BIRL! O ferro sentiu a pressão!",
      "Ainda tá vivo? Ótimo, próxima.",
      "Ajuda o maluco que tá treinando!",
      "Mais uma e eu paro de te zoar. Mentira.",
      "Respira, que o oxigênio é de graça.",
      "Só isso? Pensei que era treino, não demonstração grátis.",
      "O ferro não mente. E ele disse que você consegue manter a técnica.",
      "Tá tremendo ou o celular entrou no modo terremoto?",
      "Bonito! Agora para de negociar com o espelho.",
      "A série foi paga. O boleto do descanso vem depois.",
      "Foi dentro! O fiscal da repetição aprovou.",
      "O shape está em construção. Favor não tocar na obra."
    ],
    bravo: [
      "Série {n} de {total}. Só isso? Parecia aquecimento.",
      "Que caralho foi esse? Agora faz com controle. Tá valendo!",
      "Isso, caralho! Próxima!",
      "Feita. Agora para de se admirar no espelho e descansa.",
      "Foi. Mas mantém o foco na próxima, seu peste.",
      "Descansa. E não vai transformar 60 segundos em meia hora, hein.",
      "Série {n} paga. Agora não amarela na próxima, porra.",
      "Chega de enrolar. A próxima série não vai se fazer sozinha.",
      "Mais uma? Mais uma, porra!",
      "Menos teatro e mais consistência, caralho!",
      "Boa! Até que enfim esse treino começou a andar.",
      "Não precisa fazer cena. Só precisa fazer bem feito, porra."
    ]
  },

  ultimaSerie: {
    padrao: [
      "Última série! Dê o seu melhor, sem perder a técnica.",
      "Última! Feche com qualidade.",
      "É a hora de consolidar o trabalho. Vamos!",
      "Última série: técnica até o fim.",
      "Capriche nesta última. Você chegou até aqui!",
      "Última do exercício. Controle e concentração.",
      "Feche forte, mas respeite seus limites.",
      "Mais uma etapa e missão cumprida!",
      "Respire, ajuste a postura e conclua bem.",
      "Última série. Faça valer cada repetição."
    ],
    zoeira: [
      "Última! Depois pode reclamar no grupo da família.",
      "Última série. É agora ou nunca, campeão!",
      "Bota a alma nessa última. Mas deixa um pouco pra amanhã.",
      "Última. Faz direito, senão começa de novo. Brincadeira. Talvez.",
      "Última! Finge que tem gente olhando.",
      "Chegou o chefão da fase. Bora derrotar!",
      "A última série desbloqueou: modo protagonista.",
      "É a saideira do exercício. Sem discurso de despedida!",
      "Última! O sofá está acompanhando de longe.",
      "Agora é aquela cena de filme em que toca a música épica."
    ],
    bravo: [
      "Última, caralho! Faz valer!",
      "Última série. Se sobrar força, ótimo: você treinou com juízo.",
      "É a última. Não me vem com execução meia-boca, arrombado.",
      "Última! Treina como se o ex estivesse olhando.",
      "Última série, porra! Depois você descansa.",
      "Bota foco nessa última. O resto é conversa fiada.",
      "Chegou na última. Agora termina essa merda direito.",
      "Sem desistir no meio do caminho, porra!",
      "Fecha essa série com dignidade, seu enrolado!",
      "Última! Para de fazer reunião com o peso e executa."
    ]
  },

  exercicioFeito: {
    padrao: [
      "Exercício concluído! Muito bem!",
      "{ex}: feito. Próximo!",
      "Um a menos. Seguimos!",
      "Excelente execução! Vamos avançar.",
      "Mais uma etapa concluída com sucesso.",
      "Bom trabalho! Recupere o fôlego para o próximo.",
      "Você está construindo consistência. Próximo exercício!",
      "Etapa concluída. Mantenha esse foco!",
      "Muito bem! Cada exercício aproxima você da meta.",
      "Concluído! Orgulho da sua dedicação."
    ],
    zoeira: [
      "Já era! {ex} derrotado.",
      "Riscado da lista. Próxima vítima!",
      "Mais um pro currículo, monstro.",
      "Esse aí nem viu de onde veio.",
      "Achei que ia arregar. Errei feio!",
      "Ninguém liga, mas eu ligo: mandou bem!",
      "Mais um capítulo da saga 'Hoje eu vim mesmo'.",
      "O aparelho já pode pedir transferência.",
      "Missão concluída! Pode comemorar sem fazer dancinha. Ou faça.",
      "Foi de base! Próximo da fila.",
      "Um exercício a menos e uma história a mais pra contar.",
      "O boleto da academia está começando a fazer sentido."
    ],
    bravo: [
      "{ex} pago. Nem doeu. Mentira, doeu pra caralho.",
      "Feito! Próximo, que eu não tenho o dia todo.",
      "{ex} concluído. Ficou bom pra caralho.",
      "Pago, porra! Segue o baile.",
      "Acabou o {ex}. Agora o próximo sem reclamar, caralho.",
      "Menos um. Para de comemorar e prepara o próximo, porra.",
      "Até que enfim! Próximo exercício, seu enrolado.",
      "Fez o que tinha que fazer. Milagre? Não, obrigação cumprida.",
      "Boa, caralho! Agora mantém esse ritmo.",
      "Não foi bonito o tempo todo, mas foi concluído. Bora!"
    ]
  },

  cargaSubiu: {
    padrao: [
      "Carga nova, mesma técnica. Vai!",
      "Subiu a carga: é evolução!",
      "{carga} agora. Confie no seu treino!",
      "Mais peso, mais força. Bora!",
      "Progressão de carga: é assim que se cresce.",
      "Carga nova! Controle a descida.",
      "Seu esforço está aparecendo. Parabéns pela evolução!",
      "Novo desafio, mesma atenção à execução.",
      "Evoluir também é saber quando aumentar com segurança.",
      "Boa! Aumente o desafio sem abrir mão da técnica."
    ],
    zoeira: [
      "Aumentou o peso? Agora sim, o ferro ganhou um assunto.",
      "Mais peso! O ferro gostou de você.",
      "Agora sim! Esse peso aí não é de enfeite.",
      "{carga}? Tá ficando metido, hein!",
      "Subiu o peso! O frango tá virando galo.",
      "O algoritmo detectou evolução. Favor manter o comportamento.",
      "Atualização instalada: +1 nível de força.",
      "O peso subiu e a autoestima foi junto.",
      "Daqui a pouco vai pedir música no Fantástico.",
      "A carga aumentou. O ego também, pelo visto.",
      "É sobre isso! E tá tudo bem comemorar.",
      "O ferro perguntou quem autorizou esse upgrade."
    ],
    bravo: [
      "{carga}? Agora sim, porra! Mas mantém a técnica.",
      "Subiu a carga! Até que enfim, caralho.",
      "{carga}. Quero ver controlar essa merda direito.",
      "Olha o frango virando galo, caralho!",
      "Subiu pra {carga}. Agora não inventa de roubar movimento.",
      "Mais peso, menos conversa fiada. Bora!",
      "Tá ficando forte, porra. Não deixa a execução virar bagunça.",
      "Aumentou? Então honra essa carga, seu peste.",
      "Agora segura a onda e faz direito, caralho!",
      "O peso subiu. A responsabilidade também, porra."
    ]
  },

  recorde: {
    padrao: [
      "Recorde! {carga}! Isso é evolução!",
      "Novo recorde pessoal! Parabéns!",
      "Recorde batido. O trabalho aparece!",
      "Seu melhor de todos os tempos! Parabéns!",
      "{carga}! Você nunca levantou tanto!",
      "Conquista desbloqueada! Excelente trabalho.",
      "Você superou sua própria marca. Que evolução!",
      "Mais um resultado da sua consistência. Celebre!",
      "Novo recorde registrado. Continue construindo!",
      "Hoje você mostrou do que é capaz. Parabéns!"
    ],
    zoeira: [
      "RECORDE! O monstro saiu da jaula de vez!",
      "{carga}?! Quem é você e o que fez com o frango?",
      "Recorde batido! Já pode se gabar no grupo da família.",
      "Hora do show! Recorde novo!",
      "Recorde! Tira print antes que alguém duvide.",
      "O shape recebeu uma notificação: temos novidades.",
      "Novo recorde! O personagem subiu de nível.",
      "Pode atualizar o currículo: especialista em superar limites.",
      "O ferro ficou sem argumento. Próximo assunto!",
      "Isso não é sorte, é treino. Mas pode comemorar como se fosse!",
      "Alerta de humildade: desativado por 5 minutos.",
      "Hoje o espelho vai ouvir umas verdades."
    ],
    bravo: [
      "RECORDE, CARALHO! {carga}!",
      "Puta que pariu, que recorde! Mandou muito!",
      "{carga}! Quem é esse monstro, porra?",
      "Recorde! Posta, porque ninguém vai acreditar nessa merda.",
      "Recorde batido! Tá ficando forte pra caralho.",
      "Aí sim, porra! Trabalho reconhecido.",
      "Olha essa evolução! Até que enfim uma notícia boa, caralho!",
      "Novo recorde. Pode comemorar, seu desgraçado do bem!",
      "O ferro tentou te parar e tomou no cu. Recorde!",
      "É isso, porra! Guarda essa marca e continua trabalhando."
    ]
  },

  cardioInicio: {
    padrao: [
      "Cardio! Bom ritmo, respiração controlada.",
      "Hora de cuidar do coração. Vamos!",
      "Cardio começando. Constância vence intensidade.",
      "Bora pro cardio. Ritmo constante!",
      "Cardio na área. Mantenha a postura e respire.",
      "Encontre um ritmo sustentável e siga firme.",
      "Cada minuto conta. Vamos nessa!",
      "Comece com calma e deixe o corpo entrar no ritmo.",
      "Mais uma etapa importante para sua evolução.",
      "Respiração no controle. Você consegue!"
    ],
    zoeira: [
      "Hora de mexer as pernas sem sair do lugar!",
      "Cardio: o único momento em que você corre e não chega a lugar nenhum.",
      "Bora suar, que a camiseta já está pedindo.",
      "Liga o modo Forrest Gump.",
      "Esteira não morde. Só cansa.",
      "A esteira está online. Seu fôlego também?",
      "Chegou a hora de correr atrás dos objetivos. Literalmente.",
      "O sofá mandou mensagem perguntando onde você está.",
      "Cardio ativado. Reclamações serão aceitas após o término.",
      "Hoje o passeio é indoor. Bora!",
      "Pensa que é fuga do boleto. Vai ajudar.",
      "O coração vai trabalhar e a playlist vai testemunhar."
    ],
    bravo: [
      "Cardio. Eu sei que você odeia. Vai assim mesmo, porra.",
      "Hora do cardio. Tira essa cara de enterro.",
      "Bora se mexer, caralho!",
      "Cardio não é pra andar mexendo no celular, seu peste.",
      "Esteira não é passarela. Bora, caralho!",
      "Chega de negociar com a esteira. Começa essa merda.",
      "O fôlego não melhora olhando pro painel, porra.",
      "Vai no seu ritmo, mas vai. Sem migué!",
      "Menos drama e mais constância, caralho!",
      "A caminhada não vai acontecer por telepatia, seu folgado."
    ]
  },

  cardioForte: {
    padrao: [
      "Forte! Aumente o ritmo com controle.",
      "Agora é intensidade! Vai!",
      "Forte! Mantenha a postura e a respiração.",
      "Ritmo forte! Você consegue sustentar.",
      "Agora é o momento de dar um pouco mais!",
      "Boa intensidade! Continue atento aos seus limites.",
      "Acelere com consciência. Você está indo bem!",
      "Mais ritmo, foco total!",
      "Segure firme. Cada segundo conta!",
      "Excelente! Mantenha o movimento consistente."
    ],
    zoeira: [
      "Acelera, que a pizza está fugindo!",
      "Corre, que o boleto está atrás!",
      "Forte! Finge que é o ônibus saindo do ponto!",
      "Vai, vai, vai! O ex está vindo!",
      "Modo perseguição de novela: ativado.",
      "Acelera como quem ouviu 'tem promoção só hoje'.",
      "O controle remoto caiu do outro lado da sala. Corre!",
      "Seu eu do futuro está torcendo. E filmando.",
      "A playlist pediu velocidade. Atenda!",
      "Pensa que o elevador está fechando. Bora!",
      "A esteira está no modo turbo e você no elenco principal.",
      "Não é fuga, é cardio com motivação narrativa."
    ],
    bravo: [
      "Forte, caralho! Acelera!",
      "Isso é forte pra você? Mantém o foco e trabalha!",
      "Mete o pé, porra!",
      "Forte de verdade, não forte de Instagram!",
      "Vai, porra! Mantém esse ritmo com controle.",
      "Chega de passeio, caralho! É hora de acelerar.",
      "Não olha pro relógio a cada dois segundos, seu apressado.",
      "Dá o seu melhor sem perder a postura, porra!",
      "Acelera essa merda, mas não perde a técnica!",
      "Foco no ritmo. Reclamação só depois, caralho."
    ]
  },

  cardioLeve: {
    padrao: [
      "Leve. Recupere o fôlego.",
      "Respire. Já já tem mais.",
      "Leve. Solte os ombros e respire.",
      "Recupere. A próxima vem forte.",
      "Ritmo leve. Respiração no controle.",
      "Aproveite para recuperar sem parar completamente.",
      "Muito bem. Controle o ritmo e se prepare.",
      "Recuperação também faz parte do treino.",
      "Diminua a intensidade e mantenha o movimento.",
      "Respire com calma. Você está no caminho certo."
    ],
    zoeira: [
      "Respira, que ainda não é a hora de virar lenda.",
      "Descansa, que já já eu te chamo de novo.",
      "Pode ofegar, ninguém está olhando. Só eu.",
      "Leve! Aproveita pra lembrar por que começou.",
      "Respira fundo. O pulmão está pedindo um intervalo.",
      "Pausa estratégica para atualizar o sistema.",
      "Agora é caminhada contemplativa. A paisagem é a parede.",
      "Recupera aí. Até a esteira precisa de um intervalo.",
      "Momento de paz. Dura pouco, aproveita.",
      "Seu fôlego está reiniciando. Aguarde...",
      "Aproveita para escolher a próxima música de sofrimento.",
      "Modo econômico ativado. Já já volta o turbo."
    ],
    bravo: [
      "Leve. Respira, mas não senta, folgado.",
      "Recupera aí. Leve não é parado, porra.",
      "Aproveita, que daqui a pouco volta o trabalho.",
      "Descansa o pulmão, que já já tem mais.",
      "Diminui o ritmo, mas não transforma isso em férias.",
      "Respira, caralho! Recuperação também é parte do plano.",
      "Sem inventar de parar por causa de uma subidinha, porra.",
      "Controla esse ritmo e para de fazer drama.",
      "É leve, seu apressado. Não precisa competir com a esteira.",
      "Recupera direito, porra. A próxima etapa merece atenção."
    ]
  },

  cardioMetade: {
    padrao: [
      "Metade! Está indo muito bem.",
      "Já foi a metade. Segue firme!",
      "Metade feita! Mantenha o ritmo.",
      "Meio caminho andado. Continue!",
      "Metade! Você está mandando bem.",
      "Olha só o progresso: metade concluída!",
      "Você chegou até aqui. Continue no seu ritmo.",
      "Metade vencida. Foque no próximo trecho.",
      "Boa! Agora é manter a consistência.",
      "O esforço está valendo. Vamos em frente!"
    ],
    zoeira: [
      "Metade! A outra metade é só mental. E nas pernas.",
      "Metade já foi. Falta a parte que ainda não foi.",
      "Metade! Agora não dá mais pra desistir, já gastou a playlist.",
      "Já foi metade. A outra é ladeira abaixo. Mentira.",
      "Metade! Respira que o relógio não vai acelerar sozinho.",
      "50% concluído. Seu personagem está evoluindo.",
      "Chegou no meio do episódio. Não abandona a série agora.",
      "A metade passou. O sofá está perdendo a esperança.",
      "Você está a 50% de poder falar 'cardio pago'.",
      "Metade feita! A matemática hoje está do seu lado.",
      "O painel confirmou: não é impressão, você está avançando.",
      "Agora é reta mental. O corpo já está no elenco."
    ],
    bravo: [
      "Metade. Ainda falta a outra metade, gênio.",
      "Metade, porra! Agora não arrega.",
      "Para de olhar o relógio, caralho. Ainda é a metade.",
      "O relógio não está parado. Continua trabalhando!",
      "Já fez metade. Vai jogar tudo fora agora, porra?",
      "Metade concluída. Para de reclamar e mantém o ritmo.",
      "Não começa com essa cara de derrota, caralho!",
      "O trabalho está pela metade. Termina essa porra!",
      "Vai firme, seu apressado. Ainda tem chão.",
      "Metade! Não transforma um bom começo em história pela metade."
    ]
  },

  cardioRetaFinal: {
    padrao: [
      "Reta final! Segure o ritmo!",
      "Falta pouco! Termine forte!",
      "Reta final! Mantenha o foco!",
      "Últimos minutos! Continue firme!",
      "Quase lá! Termine com qualidade!",
      "Você chegou até aqui. Vamos concluir!",
      "Mais um pouco. Respire e mantenha o controle.",
      "Último trecho. Orgulhe-se do caminho percorrido.",
      "Feche com consistência. Você consegue!",
      "Finalizando com foco e determinação!"
    ],
    zoeira: [
      "Reta final! Não vai amarelar agora, né?",
      "Últimos minutos. Até o sofá está torcendo.",
      "Reta final! Corre como se tivesse açaí no fim!",
      "Falta pouco! Até a esteira está torcendo por você.",
      "Bota a alma pra jogo, que o fim está chegando.",
      "Última fase do chefão. Não desconecta agora!",
      "O fim está tão perto que já dá pra ouvir o banho.",
      "Vai que vai! A liberdade está logo ali.",
      "Só mais um pouquinho. Depois você conta vantagem.",
      "A playlist está no clímax. Não decepciona o DJ!",
      "Final de temporada! Entrega esse episódio.",
      "A linha de chegada mandou dizer que está com saudade."
    ],
    bravo: [
      "Reta final, caralho! Termina com foco!",
      "Agora vai com tudo, respeitando seu limite!",
      "Último gás, porra! Mantém o controle!",
      "Termina essa etapa com dignidade!",
      "Falta pouco. Não entrega os pontos agora, caralho!",
      "Chegou até aqui. Fecha essa merda direito!",
      "Olha pra frente e mantém o ritmo, porra!",
      "Não é hora de fazer acordo com a preguiça.",
      "Mais um trecho, seu teimoso. Bora!",
      "Finaliza essa porra com a mesma disciplina do começo!"
    ]
  },

  cardioFim: {
    padrao: [
      "Cardio concluído! Seu coração agradece.",
      "Feito! Ótimo trabalho no cardio.",
      "Cardio pago! Excelente!",
      "Concluído! Respire e hidrate-se.",
      "Fim do cardio. Missão cumprida!",
      "Muito bem! Você concluiu mais uma etapa.",
      "Boa dedicação. Agora recupere o fôlego.",
      "Mais um objetivo alcançado. Parabéns!",
      "Você fez acontecer. Excelente trabalho!",
      "Cardio finalizado. Valorize sua consistência."
    ],
    zoeira: [
      "Sobreviveu! Pode colocar o pulmão de volta.",
      "Cardio pago! O sofá perdeu essa rodada.",
      "Acabou! Já pode voltar a respirar pelo nariz.",
      "Acabou o cardio! A esteira pediu férias.",
      "Cardio feito! Agora pode andar igual pinguim.",
      "Missão concluída. Solicite sua medalha imaginária na recepção.",
      "O painel zerou e sua dignidade voltou aos poucos.",
      "Pode descer da esteira. Ela promete não contar nada.",
      "Mais um cardio finalizado. A lenda segue viva.",
      "Respiração normalizando em 3, 2, 1...",
      "O cardio acabou. A vontade de reclamar permanece.",
      "Você venceu a esteira. Por enquanto."
    ],
    bravo: [
      "Acabou o cardio! Agora pode respirar em paz.",
      "Cardio pago, porra! Boa!",
      "Achou que não ia conseguir, né? Conseguiu, caralho!",
      "Fim! Suado pra caralho. Ótimo trabalho.",
      "Terminou essa merda. Agora recupera o fôlego.",
      "A esteira não te venceu, porra!",
      "Fechou! Pode parar de encarar o painel como inimigo.",
      "Bom trabalho, caralho. Hidrata e recupera.",
      "Acabou. Não precisa mais ameaçar a esteira.",
      "Foi até o fim. Respeita seu esforço, porra!"
    ]
  },

  treinoFim: {
    padrao: [
      "Treino {letra} concluído! Você conseguiu!",
      "Treino pago! Muito bem!",
      "Mais um treino na conta. Estamos evoluindo bem!",
      "Orgulho desse esforço!",
      "Descanso merecido. Até o próximo!",
      "Você cumpriu o compromisso de hoje. Parabéns!",
      "Mais um passo consistente na sua jornada.",
      "Treino finalizado. Recupere-se e volte ainda melhor.",
      "O resultado vem da soma de dias como este.",
      "Excelente trabalho! Até a próxima sessão."
    ],
    zoeira: [
      "Treino pago! Agora pode comer aquela pizza. Com equilíbrio!",
      "Tá pago! Pode postar a foto no espelho.",
      "O shape agradece. O sofá também.",
      "Missão cumprida, guerreiro! Banho, comida e descanso.",
      "Hoje teve treino. Amanhã talvez tenha aquela lembrança nas pernas.",
      "BIRL! Treino {letra} concluído!",
      "Fim! Pode voltar pra Netflix com a consciência tranquila.",
      "Saiu da academia mais monstro do que entrou. Pequenos detalhes.",
      "Parabéns! Você e o ferro tiveram uma conversa séria hoje.",
      "Treino encerrado. Favor retirar sua autoestima na saída.",
      "O aplicativo confirma: hoje você não veio só passear.",
      "Agora é alongar conforme o plano e fingir naturalidade na escada."
    ],
    bravo: [
      "Treino {letra} pago, caralho! Vai tomar banho, que o suor está vencendo.",
      "Acabou! Foi bom pra caralho. Agora recupera.",
      "Treino pago. Agora come direito, porra, e descansa.",
      "Fechou! Quem diria, hein? Mandou bem pra caralho.",
      "Pago! Hoje você não deixou a preguiça ganhar.",
      "Acabou, porra! Que treino bem feito!",
      "Missão cumprida. Para de enrolar e vai se hidratar.",
      "Fez sua parte, caralho. Amanhã tem mais compromisso.",
      "Pode guardar o peso. A batalha de hoje acabou.",
      "Treino encerrado. Agora não estraga a recuperação fazendo besteira, porra."
    ]
  },

  metaSemana: {
    padrao: [
      "Meta da semana batida! Constância é tudo.",
      "Semana cumprida. Você é consistente!",
      "Meta da semana alcançada! Parabéns!",
      "Mais uma semana completa. Isso é disciplina!",
      "Meta cumprida! O resultado vem da constância.",
      "Você honrou seu planejamento. Excelente trabalho!",
      "Uma semana de cada vez, uma conquista de cada vez.",
      "Parabéns por manter o compromisso com você.",
      "Sua consistência merece reconhecimento!",
      "Semana concluída com sucesso. Continue assim!"
    ],
    zoeira: [
      "Meta batida! Pode se achar, mas só um pouquinho.",
      "Semana fechada! Até o frango ficou com inveja.",
      "Meta batida! Pode se gabar no grupo da família.",
      "Semana completa! O sofá está até com saudade.",
      "Meta cumprida! Tá mais disciplinado que despertador.",
      "O calendário confirmou: você não deu perdido!",
      "Meta semanal desbloqueada. Próxima fase disponível.",
      "A preguiça pediu demissão. Não aceita contraproposta.",
      "Semana concluída! Pode andar com pose de protagonista.",
      "Você prometeu e cumpriu. Print para o grupo!",
      "Constância em dia. O sofá já está procurando outro amigo.",
      "Parabéns! Hoje até o despertador te respeita."
    ],
    bravo: [
      "Meta da semana batida, caralho! Respeita!",
      "Bateu a meta! Agora não some no fim de semana, seu peste.",
      "Tá ficando disciplinado pra caralho.",
      "Semana paga! Pode até tirar foto no espelho, porra.",
      "Cumpriu o combinado. Até que enfim, caralho!",
      "Meta batida. Não vai jogar tudo pro alto agora, porra!",
      "Olha só: consistência! Continua nessa merda de caminho certo.",
      "Você fez o que precisava. Sem desculpa, sem novela.",
      "Semana concluída, porra! Descansa e planeja a próxima.",
      "Parabéns, seu teimoso. A disciplina venceu de novo!"
    ]
  },

  fimDescanso: {
    padrao: [
      "Bora! Próxima série.",
      "Acabou o descanso. Vamos!",
      "Hora de voltar!",
      "Pra cima! Mais uma.",
      "Descansou? Agora execute!",
      "Foco total. Vai!",
      "Respire fundo e retome!",
      "De volta ao treino. Mantenha a técnica!",
      "Bora, com controle e boa postura!",
      "Pronto? Então vamos para a próxima!",
      "Mais uma série bem feita!",
      "Recuperado? Vamos continuar!"
    ],
    zoeira: [
      "BIRL! Volta pro ferro!",
      "Acabou a moleza!",
      "Larga o celular, que o peso não vai levantar sozinho!",
      "Bora, monstro!",
      "O ferro está com saudade!",
      "Saiu da jaula de novo!",
      "Chega de selfie! O descanso acabou.",
      "Sem migué! Bora!",
      "O descanso acabou. O drama, não.",
      "Volta, que o shape não vem sozinho!",
      "O cronômetro apitou. Não adianta fingir que não ouviu.",
      "Próxima série te esperando igual boleto no fim do mês."
    ],
    bravo: [
      "Levanta, porra!",
      "Acabou o descanso, caralho!",
      "Vai, arrombado!",
      "Larga essa merda de celular!",
      "Tá esperando o quê, porra?",
      "Bora, seu enrolado!",
      "Chega de enrolar, caralho!",
      "Volta pro ferro, porra!",
      "Descansou demais. Mexe essa bunda!",
      "Que descanso comprido da porra é esse? Vai!",
      "O cronômetro chamou. Obedece essa merda!",
      "Acabou a reunião com o celular. Próxima série!"
    ]
  },

  volta: {
    padrao: [
      "Que bom te ver de volta! Bora retomar.",
      "Voltou! Recomeçar também é evoluir.",
      "Bem-vindo de volta! Um treino de cada vez.",
      "Voltou! O importante é retomar.",
      "Que bom! Hoje é dia de reconstruir o ritmo.",
      "Não importa a pausa. O que vale é dar o próximo passo.",
      "Retomar é uma conquista. Vamos com calma e consistência.",
      "Cada retorno é uma nova oportunidade de evoluir.",
      "Bom ter você por aqui novamente. Vamos nessa!",
      "O importante é continuar. Conte comigo no treino de hoje."
    ],
    zoeira: [
      "Olha quem lembrou que tem academia!",
      "Sumiu, hein? O ferro sentiu sua falta. Eu, nem tanto.",
      "Voltou! Achei que tinha virado sócio do sofá.",
      "Os pesos estavam perguntando de você.",
      "Reapareceu! Bora tirar a ferrugem.",
      "A lenda retornou. A temporada nova começa agora.",
      "Depois de um hiato digno de série, você voltou!",
      "O algoritmo detectou saudade de puxar ferro.",
      "Plot twist: você voltou! Bora escrever o próximo episódio.",
      "A academia não é grupo de WhatsApp, mas pode aparecer mais vezes.",
      "O sofá perdeu a guarda compartilhada. Bora!",
      "Olha só quem saiu do modo avião!"
    ],
    bravo: [
      "Olha quem voltou! Onde você tava, caralho?",
      "Sumiu, né? Achei que tinha aposentado, porra.",
      "Que porra de férias foram essas?",
      "Ah, lembrou que tem academia? Bora, seu peste.",
      "Até que enfim, caralho! Bora recuperar o ritmo.",
      "Chega de sumiço. Vamos recomeçar essa merda com juízo.",
      "O ferro estava criando teia. Bora trabalhar, porra!",
      "Não quero justificativa, quero constância. Bora!",
      "Voltou? Então para de enrolar e começa, caralho!",
      "O importante é que voltou. Agora não desaparece de novo, seu figura."
    ]
  }
};

/* Quando falar: probabilidade por evento e se o evento ignora o intervalo mínimo
   permanecem configurados no motor js/motivacao.js. */

export const TONS = {
  padrao: "Motivador",
  zoeira: "Zoeira",
  bravo: "Sem filtro"
};
