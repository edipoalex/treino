/* Falas do treinador (v2.1): repertório por momento do treino, estilo e categoria de humor.
   Estilos: "padrao" (Motivador: incentivo cordial), "zoeira" (memes, humor e provocações leves)
   e "bravo" (Sem filtro: sarcasmo e palavrões, sem preconceito, discriminação ou baixaria sexual).
   Categorias (v1.46): dentro de cada estilo, as frases ficam em grupos (CATEGORIAS, abaixo). O motor (js/motivacao.js)
   alterna as categorias para não repetir o mesmo tipo de humor em seguida, e não repete frase até usar todas do grupo.
   Para ampliar: acrescente frases no grupo certo; para criar uma categoria, crie o grupo e registre o nome em CATEGORIAS.
   Uma lista simples (sem grupos) também é aceita. Placeholders: {letra} {ex} {n} {total} {carga}.
   Os testes conferem: 5+ frases por momento e estilo, nenhum grupo vazio, categorias registradas e
   frases do fim do descanso com até 60 letras. */

export const CATEGORIAS = {
  padrao: { incentivo:"Incentivo", tecnica:"Técnica", conquista:"Conquista", constancia:"Constância" },
  zoeira: { classico:"Memes de academia", cotidiano:"Cotidiano", pop:"Cultura pop e games", ironia:"Ironia" },
  bravo:  { cobranca:"Cobrança", sarcasmo:"Sarcasmo", comemoracao:"Comemoração" }
};

export const FALAS = {
  inicioTreino: {
    padrao: {
      incentivo: [
        "Bora começar! Treino {letra} na área.",
        "Hoje é dia de evoluir. Vamos!",
        "Treino {letra} começando. Respira e vai!"
      ],
      tecnica: [
        "Vamos com tudo, e com técnica!",
        "Aquecimento bem feito, treino bem feito. Bora!"
      ],
      constancia: [
        "Você já venceu a parte mais difícil: chegou. Agora é executar!",
        "Foco no treino {letra}. Um exercício de cada vez.",
        "Cada treino conta. Bora fazer este valer!",
        "Seu compromisso de hoje é com a sua evolução.",
        "O resultado é construído repetição por repetição."
      ]
    },
    zoeira: {
      classico: [
        "Saiu da jaula o monstro! Ou pelo menos abriu a porta.",
        "BIRL! Hora do show!",
        "O shape não vem por sedex. Bora buscar!",
        "Modo projeto verão: carregando... não interrompa.",
        "Hoje o único migué permitido é o nome do exercício."
      ],
      cotidiano: [
        "Larga o sofá, que hoje tem treino {letra}!",
        "Netflix pode esperar. O ferro, não."
      ],
      pop: [
        "Olha quem apareceu! O algoritmo da academia te encontrou."
      ],
      ironia: [
        "Pré-treino batendo ou é só a ansiedade de quem viu a ficha?",
        "A preguiça mandou lembranças. Manda ela voltar depois."
      ]
    },
    bravo: {
      cobranca: [
        "Bora, porra! O treino {letra} não vai se fazer sozinho.",
        "Levanta essa bunda e vai treinar, caralho!",
        "Hoje não tem chororô. Treino {letra}, e vai calado.",
        "Deixa de enrolação e começa logo essa merda.",
        "Chegou! Agora não vem com frescura, arrombado.",
        "Fecha a cara de derrota e abre o treino, porra!"
      ],
      sarcasmo: [
        "Que cara de sono é essa? Acorda, porra, é treino {letra}!",
        "Tá esperando o quê? Convite impresso? Vai, porra!",
        "Celular só pra marcar série. Instagram depois, seu peste.",
        "A preguiça não paga mensalidade. Bora trabalhar, caralho!"
      ]
    }
  },

  inicioExercicio: {
    padrao: {
      incentivo: [
        "Vamos de {ex}! Faça cada repetição valer.",
        "Mais um passo na direção da sua meta: {ex}."
      ],
      tecnica: [
        "Agora: {ex}. Técnica primeiro.",
        "Concentre-se no movimento e controle cada repetição.",
        "Amplitude completa, controle na descida.",
        "Postura firme, respiração no ritmo e execução consciente.",
        "Respira, posiciona e executa.",
        "Ajuste o aparelho e encontre uma posição confortável.",
        "Qualidade de movimento acima de quantidade.",
        "Comece com controle. A força vem junto com a técnica."
      ]
    },
    zoeira: {
      pop: [
        "Atenção: começou o episódio de hoje de 'Eu e o Ferro'."
      ],
      ironia: [
        "{ex}? Hoje ele vai chorar. Ou você. Que vença a técnica.",
        "Olha o {ex} aí te encarando. Não arregue para um aparelho.",
        "Esse aparelho estava com saudade de você. Ele não.",
        "Ajeita o banco e para de negociar com o equipamento.",
        "Bora, que o {ex} não vai se fazer sozinho.",
        "O aparelho não é decoração. Mostra serviço!",
        "O {ex} chamou seu nome. Não vai deixar no vácuo, né?",
        "Postura de quem sabe o que está fazendo. Mesmo que esteja aprendendo.",
        "Sem coreografia inventada: faz o movimento direito!"
      ]
    },
    bravo: {
      cobranca: [
        "{ex}. Faz direito ou nem começa, caralho.",
        "{ex} agora. E sem roubar no movimento, malandro.",
        "Olha a técnica no {ex}, que eu tô vendo essa porra.",
        "{ex}: amplitude e controle. Não essa meia-boca de bosta.",
        "Ajusta essa postura, porra. O objetivo é treinar, não improvisar.",
        "{ex}. Se pegar o celular entre as séries, vai se foder.",
        "Menos gracinha e mais controle, caralho!",
        "Não inventa moda. Faz o básico bem feito, porra."
      ],
      sarcasmo: [
        "Para de conversar com o aparelho e executa essa merda.",
        "Se a execução tá torta, corrige antes de querer bancar o gigante."
      ]
    }
  },

  serie: {
    padrao: {
      incentivo: [
        "Muito bem! Continue nesse ritmo.",
        "Mais uma! Você está no caminho certo.",
        "Cada repetição bem feita conta."
      ],
      tecnica: [
        "Continue assim, com controle e consistência.",
        "Execução limpa. Assim!"
      ],
      conquista: [
        "Isso aí! Boa execução.",
        "Boa série! Mais um passo concluído.",
        "Mandou bem! Respire e prepare a próxima.",
        "Série {n} de {total}: feita!",
        "Estamos progredindo bem!"
      ],
      constancia: [
        "Ritmo consistente. É assim que se evolui.",
        "Constância é tudo. Segue!"
      ]
    },
    zoeira: {
      classico: [
        "BIRL! O ferro sentiu a pressão!",
        "Ajuda o maluco que tá treinando!",
        "O ferro não mente. E ele disse que você consegue manter a técnica.",
        "O shape está em construção. Favor não tocar na obra."
      ],
      cotidiano: [
        "Tá tremendo ou o celular entrou no modo terremoto?",
        "A série foi paga. O boleto do descanso vem depois."
      ],
      ironia: [
        "Ainda tá vivo? Ótimo, próxima.",
        "Mais uma e eu paro de te zoar. Mentira.",
        "Respira, que o oxigênio é de graça.",
        "Só isso? Pensei que era treino, não demonstração grátis.",
        "Bonito! Agora para de negociar com o espelho.",
        "Foi dentro! O fiscal da repetição aprovou."
      ]
    },
    bravo: {
      cobranca: [
        "Foi. Mas mantém o foco na próxima, seu peste.",
        "Chega de enrolar. A próxima série não vai se fazer sozinha.",
        "Menos teatro e mais consistência, caralho!",
        "Não precisa fazer cena. Só precisa fazer bem feito, porra."
      ],
      sarcasmo: [
        "Série {n} de {total}. Só isso? Parecia aquecimento.",
        "Que caralho foi esse? Agora faz com controle. Tá valendo!",
        "Feita. Agora para de se admirar no espelho e descansa.",
        "Descansa. E não vai transformar 60 segundos em meia hora, hein.",
        "Boa! Até que enfim esse treino começou a andar."
      ],
      comemoracao: [
        "Isso, caralho! Próxima!",
        "Série {n} paga. Agora não amarela na próxima, porra.",
        "Mais uma? Mais uma, porra!"
      ]
    }
  },

  ultimaSerie: {
    padrao: {
      incentivo: [
        "Última! Feche com qualidade.",
        "É a hora de consolidar o trabalho. Vamos!",
        "Capriche nesta última. Você chegou até aqui!",
        "Mais uma etapa e missão cumprida!",
        "Última série. Faça valer cada repetição."
      ],
      tecnica: [
        "Última série! Dê o seu melhor, sem perder a técnica.",
        "Última série: técnica até o fim.",
        "Última do exercício. Controle e concentração.",
        "Feche forte, mas respeite seus limites.",
        "Respire, ajuste a postura e conclua bem."
      ]
    },
    zoeira: {
      cotidiano: [
        "Última! Depois pode reclamar no grupo da família.",
        "Última! O sofá está acompanhando de longe."
      ],
      pop: [
        "Chegou o chefão da fase. Bora derrotar!",
        "A última série desbloqueou: modo protagonista.",
        "Agora é aquela cena de filme em que toca a música épica."
      ],
      ironia: [
        "Última série. É agora ou nunca, campeão!",
        "Bota a alma nessa última. Mas deixa um pouco pra amanhã.",
        "Última. Faz direito, senão começa de novo. Brincadeira. Talvez.",
        "Última! Finge que tem gente olhando.",
        "É a saideira do exercício. Sem discurso de despedida!"
      ]
    },
    bravo: {
      cobranca: [
        "Última, caralho! Faz valer!",
        "É a última. Não me vem com execução meia-boca, arrombado.",
        "Última série, porra! Depois você descansa.",
        "Bota foco nessa última. O resto é conversa fiada.",
        "Chegou na última. Agora termina essa merda direito.",
        "Sem desistir no meio do caminho, porra!",
        "Fecha essa série com dignidade, seu enrolado!"
      ],
      sarcasmo: [
        "Última! Treina como se o ex estivesse olhando.",
        "Última! Para de fazer reunião com o peso e executa."
      ],
      comemoracao: [
        "Última série. Se sobrar força, ótimo: você treinou com juízo."
      ]
    }
  },

  exercicioFeito: {
    padrao: {
      incentivo: [
        "Um a menos. Seguimos!",
        "Bom trabalho! Recupere o fôlego para o próximo."
      ],
      conquista: [
        "Exercício concluído! Muito bem!",
        "{ex}: feito. Próximo!",
        "Excelente execução! Vamos avançar.",
        "Mais uma etapa concluída com sucesso.",
        "Etapa concluída. Mantenha esse foco!",
        "Concluído! Orgulho da sua dedicação."
      ],
      constancia: [
        "Você está construindo consistência. Próximo exercício!",
        "Muito bem! Cada exercício aproxima você da meta."
      ]
    },
    zoeira: {
      classico: [
        "Mais um pro currículo, monstro.",
        "Foi de base! Próximo da fila."
      ],
      cotidiano: [
        "O boleto da academia está começando a fazer sentido."
      ],
      pop: [
        "Mais um capítulo da saga 'Hoje eu vim mesmo'."
      ],
      ironia: [
        "Já era! {ex} derrotado.",
        "Riscado da lista. Próxima vítima!",
        "Esse aí nem viu de onde veio.",
        "Achei que ia arregar. Errei feio!",
        "Ninguém liga, mas eu ligo: mandou bem!",
        "O aparelho já pode pedir transferência.",
        "Missão concluída! Pode comemorar sem fazer dancinha. Ou faça.",
        "Um exercício a menos e uma história a mais pra contar."
      ]
    },
    bravo: {
      cobranca: [
        "Feito! Próximo, que eu não tenho o dia todo.",
        "Acabou o {ex}. Agora o próximo sem reclamar, caralho.",
        "Menos um. Para de comemorar e prepara o próximo, porra."
      ],
      sarcasmo: [
        "{ex} pago. Nem doeu. Mentira, doeu pra caralho.",
        "Até que enfim! Próximo exercício, seu enrolado.",
        "Fez o que tinha que fazer. Milagre? Não, obrigação cumprida."
      ],
      comemoracao: [
        "{ex} concluído. Ficou bom pra caralho.",
        "Pago, porra! Segue o baile.",
        "Boa, caralho! Agora mantém esse ritmo.",
        "Não foi bonito o tempo todo, mas foi concluído. Bora!"
      ]
    }
  },

  cargaSubiu: {
    padrao: {
      incentivo: [
        "{carga} agora. Confie no seu treino!",
        "Mais peso, mais força. Bora!"
      ],
      tecnica: [
        "Carga nova, mesma técnica. Vai!",
        "Carga nova! Controle a descida.",
        "Novo desafio, mesma atenção à execução.",
        "Evoluir também é saber quando aumentar com segurança.",
        "Boa! Aumente o desafio sem abrir mão da técnica."
      ],
      conquista: [
        "Subiu a carga: é evolução!",
        "Seu esforço está aparecendo. Parabéns pela evolução!"
      ],
      constancia: [
        "Progressão de carga: é assim que se cresce."
      ]
    },
    zoeira: {
      classico: [
        "Aumentou o peso? Agora sim, o ferro ganhou um assunto.",
        "Mais peso! O ferro gostou de você.",
        "Subiu o peso! O frango tá virando galo.",
        "O ferro perguntou quem autorizou esse upgrade."
      ],
      pop: [
        "O algoritmo detectou evolução. Favor manter o comportamento.",
        "Atualização instalada: +1 nível de força.",
        "Daqui a pouco vai pedir música no Fantástico.",
        "É sobre isso! E tá tudo bem comemorar."
      ],
      ironia: [
        "Agora sim! Esse peso aí não é de enfeite.",
        "{carga}? Tá ficando metido, hein!",
        "O peso subiu e a autoestima foi junto.",
        "A carga aumentou. O ego também, pelo visto."
      ]
    },
    bravo: {
      cobranca: [
        "{carga}. Quero ver controlar essa merda direito.",
        "Subiu pra {carga}. Agora não inventa de roubar movimento.",
        "Mais peso, menos conversa fiada. Bora!",
        "Aumentou? Então honra essa carga, seu peste.",
        "Agora segura a onda e faz direito, caralho!",
        "O peso subiu. A responsabilidade também, porra."
      ],
      sarcasmo: [
        "Subiu a carga! Até que enfim, caralho."
      ],
      comemoracao: [
        "{carga}? Agora sim, porra! Mas mantém a técnica.",
        "Olha o frango virando galo, caralho!",
        "Tá ficando forte, porra. Não deixa a execução virar bagunça."
      ]
    }
  },

  recorde: {
    padrao: {
      conquista: [
        "Recorde! {carga}! Isso é evolução!",
        "Novo recorde pessoal! Parabéns!",
        "Recorde batido. O trabalho aparece!",
        "Seu melhor de todos os tempos! Parabéns!",
        "{carga}! Você nunca levantou tanto!",
        "Conquista desbloqueada! Excelente trabalho.",
        "Você superou sua própria marca. Que evolução!",
        "Novo recorde registrado. Continue construindo!",
        "Hoje você mostrou do que é capaz. Parabéns!"
      ],
      constancia: [
        "Mais um resultado da sua consistência. Celebre!"
      ]
    },
    zoeira: {
      classico: [
        "RECORDE! O monstro saiu da jaula de vez!",
        "{carga}?! Quem é você e o que fez com o frango?",
        "Hora do show! Recorde novo!",
        "O shape recebeu uma notificação: temos novidades.",
        "O ferro ficou sem argumento. Próximo assunto!"
      ],
      cotidiano: [
        "Recorde batido! Já pode se gabar no grupo da família.",
        "Recorde! Tira print antes que alguém duvide."
      ],
      pop: [
        "Novo recorde! O personagem subiu de nível.",
        "Pode atualizar o currículo: especialista em superar limites."
      ],
      ironia: [
        "Isso não é sorte, é treino. Mas pode comemorar como se fosse!",
        "Alerta de humildade: desativado por 5 minutos.",
        "Hoje o espelho vai ouvir umas verdades."
      ]
    },
    bravo: {
      sarcasmo: [
        "Recorde! Posta, porque ninguém vai acreditar nessa merda.",
        "Olha essa evolução! Até que enfim uma notícia boa, caralho!"
      ],
      comemoracao: [
        "RECORDE, CARALHO! {carga}!",
        "Puta que pariu, que recorde! Mandou muito!",
        "{carga}! Quem é esse monstro, porra?",
        "Recorde batido! Tá ficando forte pra caralho.",
        "Aí sim, porra! Trabalho reconhecido.",
        "Novo recorde. Pode comemorar, seu desgraçado do bem!",
        "O ferro tentou te parar e tomou no cu. Recorde!",
        "É isso, porra! Guarda essa marca e continua trabalhando."
      ]
    }
  },

  cardioInicio: {
    padrao: {
      incentivo: [
        "Hora de cuidar do coração. Vamos!",
        "Cada minuto conta. Vamos nessa!",
        "Respiração no controle. Você consegue!"
      ],
      tecnica: [
        "Cardio! Bom ritmo, respiração controlada.",
        "Bora pro cardio. Ritmo constante!",
        "Cardio na área. Mantenha a postura e respire.",
        "Encontre um ritmo sustentável e siga firme.",
        "Comece com calma e deixe o corpo entrar no ritmo."
      ],
      constancia: [
        "Cardio começando. Constância vence intensidade.",
        "Mais uma etapa importante para sua evolução."
      ]
    },
    zoeira: {
      cotidiano: [
        "Bora suar, que a camiseta já está pedindo.",
        "O sofá mandou mensagem perguntando onde você está.",
        "Pensa que é fuga do boleto. Vai ajudar."
      ],
      pop: [
        "Liga o modo Forrest Gump.",
        "A esteira está online. Seu fôlego também?",
        "O coração vai trabalhar e a playlist vai testemunhar."
      ],
      ironia: [
        "Hora de mexer as pernas sem sair do lugar!",
        "Cardio: o único momento em que você corre e não chega a lugar nenhum.",
        "Esteira não morde. Só cansa.",
        "Chegou a hora de correr atrás dos objetivos. Literalmente.",
        "Cardio ativado. Reclamações serão aceitas após o término.",
        "Hoje o passeio é indoor. Bora!"
      ]
    },
    bravo: {
      cobranca: [
        "Bora se mexer, caralho!",
        "Chega de negociar com a esteira. Começa essa merda.",
        "Vai no seu ritmo, mas vai. Sem migué!",
        "Menos drama e mais constância, caralho!"
      ],
      sarcasmo: [
        "Cardio. Eu sei que você odeia. Vai assim mesmo, porra.",
        "Hora do cardio. Tira essa cara de enterro.",
        "Cardio não é pra andar mexendo no celular, seu peste.",
        "Esteira não é passarela. Bora, caralho!",
        "O fôlego não melhora olhando pro painel, porra.",
        "A caminhada não vai acontecer por telepatia, seu folgado."
      ]
    }
  },

  cardioForte: {
    padrao: {
      incentivo: [
        "Agora é intensidade! Vai!",
        "Ritmo forte! Você consegue sustentar.",
        "Agora é o momento de dar um pouco mais!",
        "Mais ritmo, foco total!",
        "Segure firme. Cada segundo conta!"
      ],
      tecnica: [
        "Forte! Aumente o ritmo com controle.",
        "Forte! Mantenha a postura e a respiração.",
        "Boa intensidade! Continue atento aos seus limites.",
        "Acelere com consciência. Você está indo bem!",
        "Excelente! Mantenha o movimento consistente."
      ]
    },
    zoeira: {
      cotidiano: [
        "Acelera, que a pizza está fugindo!",
        "Corre, que o boleto está atrás!",
        "Forte! Finge que é o ônibus saindo do ponto!",
        "Vai, vai, vai! O ex está vindo!",
        "Acelera como quem ouviu 'tem promoção só hoje'.",
        "O controle remoto caiu do outro lado da sala. Corre!",
        "Pensa que o elevador está fechando. Bora!"
      ],
      pop: [
        "Modo perseguição de novela: ativado.",
        "A playlist pediu velocidade. Atenda!",
        "A esteira está no modo turbo e você no elenco principal."
      ],
      ironia: [
        "Seu eu do futuro está torcendo. E filmando.",
        "Não é fuga, é cardio com motivação narrativa."
      ]
    },
    bravo: {
      cobranca: [
        "Forte, caralho! Acelera!",
        "Mete o pé, porra!",
        "Vai, porra! Mantém esse ritmo com controle.",
        "Chega de passeio, caralho! É hora de acelerar.",
        "Dá o seu melhor sem perder a postura, porra!",
        "Acelera essa merda, mas não perde a técnica!",
        "Foco no ritmo. Reclamação só depois, caralho."
      ],
      sarcasmo: [
        "Isso é forte pra você? Mantém o foco e trabalha!",
        "Forte de verdade, não forte de Instagram!",
        "Não olha pro relógio a cada dois segundos, seu apressado."
      ]
    }
  },

  cardioLeve: {
    padrao: {
      incentivo: [
        "Recupere. A próxima vem forte.",
        "Recuperação também faz parte do treino.",
        "Respire com calma. Você está no caminho certo."
      ],
      tecnica: [
        "Leve. Recupere o fôlego.",
        "Respire. Já já tem mais.",
        "Leve. Solte os ombros e respire.",
        "Ritmo leve. Respiração no controle.",
        "Aproveite para recuperar sem parar completamente.",
        "Muito bem. Controle o ritmo e se prepare.",
        "Diminua a intensidade e mantenha o movimento."
      ]
    },
    zoeira: {
      pop: [
        "Respira, que ainda não é a hora de virar lenda.",
        "Pausa estratégica para atualizar o sistema.",
        "Seu fôlego está reiniciando. Aguarde...",
        "Aproveita para escolher a próxima música de sofrimento.",
        "Modo econômico ativado. Já já volta o turbo."
      ],
      ironia: [
        "Descansa, que já já eu te chamo de novo.",
        "Pode ofegar, ninguém está olhando. Só eu.",
        "Leve! Aproveita pra lembrar por que começou.",
        "Respira fundo. O pulmão está pedindo um intervalo.",
        "Agora é caminhada contemplativa. A paisagem é a parede.",
        "Recupera aí. Até a esteira precisa de um intervalo.",
        "Momento de paz. Dura pouco, aproveita."
      ]
    },
    bravo: {
      cobranca: [
        "Leve. Respira, mas não senta, folgado.",
        "Recupera aí. Leve não é parado, porra.",
        "Aproveita, que daqui a pouco volta o trabalho.",
        "Descansa o pulmão, que já já tem mais.",
        "Respira, caralho! Recuperação também é parte do plano.",
        "Controla esse ritmo e para de fazer drama.",
        "Recupera direito, porra. A próxima etapa merece atenção."
      ],
      sarcasmo: [
        "Diminui o ritmo, mas não transforma isso em férias.",
        "Sem inventar de parar por causa de uma subidinha, porra.",
        "É leve, seu apressado. Não precisa competir com a esteira."
      ]
    }
  },

  cardioMetade: {
    padrao: {
      incentivo: [
        "Já foi a metade. Segue firme!",
        "Meio caminho andado. Continue!",
        "Metade vencida. Foque no próximo trecho.",
        "O esforço está valendo. Vamos em frente!"
      ],
      tecnica: [
        "Metade feita! Mantenha o ritmo."
      ],
      conquista: [
        "Metade! Está indo muito bem.",
        "Metade! Você está mandando bem.",
        "Olha só o progresso: metade concluída!"
      ],
      constancia: [
        "Você chegou até aqui. Continue no seu ritmo.",
        "Boa! Agora é manter a consistência."
      ]
    },
    zoeira: {
      cotidiano: [
        "A metade passou. O sofá está perdendo a esperança."
      ],
      pop: [
        "Metade! Agora não dá mais pra desistir, já gastou a playlist.",
        "50% concluído. Seu personagem está evoluindo.",
        "Chegou no meio do episódio. Não abandona a série agora.",
        "Agora é reta mental. O corpo já está no elenco."
      ],
      ironia: [
        "Metade! A outra metade é só mental. E nas pernas.",
        "Metade já foi. Falta a parte que ainda não foi.",
        "Já foi metade. A outra é ladeira abaixo. Mentira.",
        "Metade! Respira que o relógio não vai acelerar sozinho.",
        "Você está a 50% de poder falar 'cardio pago'.",
        "Metade feita! A matemática hoje está do seu lado.",
        "O painel confirmou: não é impressão, você está avançando."
      ]
    },
    bravo: {
      cobranca: [
        "Metade, porra! Agora não arrega.",
        "Para de olhar o relógio, caralho. Ainda é a metade.",
        "O relógio não está parado. Continua trabalhando!",
        "Metade concluída. Para de reclamar e mantém o ritmo.",
        "Não começa com essa cara de derrota, caralho!",
        "O trabalho está pela metade. Termina essa porra!",
        "Vai firme, seu apressado. Ainda tem chão."
      ],
      sarcasmo: [
        "Metade. Ainda falta a outra metade, gênio.",
        "Já fez metade. Vai jogar tudo fora agora, porra?",
        "Metade! Não transforma um bom começo em história pela metade."
      ]
    }
  },

  cardioRetaFinal: {
    padrao: {
      incentivo: [
        "Falta pouco! Termine forte!",
        "Reta final! Mantenha o foco!",
        "Últimos minutos! Continue firme!",
        "Quase lá! Termine com qualidade!",
        "Você chegou até aqui. Vamos concluir!",
        "Finalizando com foco e determinação!"
      ],
      tecnica: [
        "Reta final! Segure o ritmo!",
        "Mais um pouco. Respire e mantenha o controle."
      ],
      conquista: [
        "Último trecho. Orgulhe-se do caminho percorrido."
      ],
      constancia: [
        "Feche com consistência. Você consegue!"
      ]
    },
    zoeira: {
      cotidiano: [
        "Últimos minutos. Até o sofá está torcendo.",
        "Reta final! Corre como se tivesse açaí no fim!",
        "O fim está tão perto que já dá pra ouvir o banho."
      ],
      pop: [
        "Última fase do chefão. Não desconecta agora!",
        "A playlist está no clímax. Não decepciona o DJ!",
        "Final de temporada! Entrega esse episódio."
      ],
      ironia: [
        "Reta final! Não vai amarelar agora, né?",
        "Falta pouco! Até a esteira está torcendo por você.",
        "Bota a alma pra jogo, que o fim está chegando.",
        "Vai que vai! A liberdade está logo ali.",
        "Só mais um pouquinho. Depois você conta vantagem.",
        "A linha de chegada mandou dizer que está com saudade."
      ]
    },
    bravo: {
      cobranca: [
        "Reta final, caralho! Termina com foco!",
        "Agora vai com tudo, respeitando seu limite!",
        "Último gás, porra! Mantém o controle!",
        "Termina essa etapa com dignidade!",
        "Falta pouco. Não entrega os pontos agora, caralho!",
        "Chegou até aqui. Fecha essa merda direito!",
        "Olha pra frente e mantém o ritmo, porra!",
        "Mais um trecho, seu teimoso. Bora!",
        "Finaliza essa porra com a mesma disciplina do começo!"
      ],
      sarcasmo: [
        "Não é hora de fazer acordo com a preguiça."
      ]
    }
  },

  cardioFim: {
    padrao: {
      incentivo: [
        "Boa dedicação. Agora recupere o fôlego."
      ],
      tecnica: [
        "Concluído! Respire e hidrate-se."
      ],
      conquista: [
        "Cardio concluído! Seu coração agradece.",
        "Feito! Ótimo trabalho no cardio.",
        "Cardio pago! Excelente!",
        "Fim do cardio. Missão cumprida!",
        "Muito bem! Você concluiu mais uma etapa.",
        "Mais um objetivo alcançado. Parabéns!",
        "Você fez acontecer. Excelente trabalho!"
      ],
      constancia: [
        "Cardio finalizado. Valorize sua consistência."
      ]
    },
    zoeira: {
      cotidiano: [
        "Cardio pago! O sofá perdeu essa rodada.",
        "Missão concluída. Solicite sua medalha imaginária na recepção."
      ],
      pop: [
        "Mais um cardio finalizado. A lenda segue viva."
      ],
      ironia: [
        "Sobreviveu! Pode colocar o pulmão de volta.",
        "Acabou! Já pode voltar a respirar pelo nariz.",
        "Acabou o cardio! A esteira pediu férias.",
        "Cardio feito! Agora pode andar igual pinguim.",
        "O painel zerou e sua dignidade voltou aos poucos.",
        "Pode descer da esteira. Ela promete não contar nada.",
        "Respiração normalizando em 3, 2, 1...",
        "O cardio acabou. A vontade de reclamar permanece.",
        "Você venceu a esteira. Por enquanto."
      ]
    },
    bravo: {
      sarcasmo: [
        "Achou que não ia conseguir, né? Conseguiu, caralho!",
        "Fechou! Pode parar de encarar o painel como inimigo.",
        "Acabou. Não precisa mais ameaçar a esteira."
      ],
      comemoracao: [
        "Acabou o cardio! Agora pode respirar em paz.",
        "Cardio pago, porra! Boa!",
        "Fim! Suado pra caralho. Ótimo trabalho.",
        "Terminou essa merda. Agora recupera o fôlego.",
        "A esteira não te venceu, porra!",
        "Bom trabalho, caralho. Hidrata e recupera.",
        "Foi até o fim. Respeita seu esforço, porra!"
      ]
    }
  },

  treinoFim: {
    padrao: {
      incentivo: [
        "Descanso merecido. Até o próximo!",
        "Treino finalizado. Recupere-se e volte ainda melhor."
      ],
      conquista: [
        "Treino {letra} concluído! Você conseguiu!",
        "Treino pago! Muito bem!",
        "Orgulho desse esforço!",
        "Você cumpriu o compromisso de hoje. Parabéns!",
        "Excelente trabalho! Até a próxima sessão."
      ],
      constancia: [
        "Mais um treino na conta. Estamos evoluindo bem!",
        "Mais um passo consistente na sua jornada.",
        "O resultado vem da soma de dias como este."
      ]
    },
    zoeira: {
      classico: [
        "Tá pago! Pode postar a foto no espelho.",
        "O shape agradece. O sofá também.",
        "BIRL! Treino {letra} concluído!",
        "Saiu da academia mais monstro do que entrou. Pequenos detalhes.",
        "Parabéns! Você e o ferro tiveram uma conversa séria hoje."
      ],
      cotidiano: [
        "Treino pago! Agora pode comer aquela pizza. Com equilíbrio!",
        "Missão cumprida, guerreiro! Banho, comida e descanso.",
        "Fim! Pode voltar pra Netflix com a consciência tranquila.",
        "Agora é alongar conforme o plano e fingir naturalidade na escada."
      ],
      ironia: [
        "Hoje teve treino. Amanhã talvez tenha aquela lembrança nas pernas.",
        "Treino encerrado. Favor retirar sua autoestima na saída.",
        "O aplicativo confirma: hoje você não veio só passear."
      ]
    },
    bravo: {
      cobranca: [
        "Missão cumprida. Para de enrolar e vai se hidratar.",
        "Treino encerrado. Agora não estraga a recuperação fazendo besteira, porra."
      ],
      sarcasmo: [
        "Fechou! Quem diria, hein? Mandou bem pra caralho."
      ],
      comemoracao: [
        "Treino {letra} pago, caralho! Vai tomar banho, que o suor está vencendo.",
        "Acabou! Foi bom pra caralho. Agora recupera.",
        "Treino pago. Agora come direito, porra, e descansa.",
        "Pago! Hoje você não deixou a preguiça ganhar.",
        "Acabou, porra! Que treino bem feito!",
        "Fez sua parte, caralho. Amanhã tem mais compromisso.",
        "Pode guardar o peso. A batalha de hoje acabou."
      ]
    }
  },

  metaSemana: {
    padrao: {
      conquista: [
        "Meta da semana alcançada! Parabéns!",
        "Você honrou seu planejamento. Excelente trabalho!",
        "Sua consistência merece reconhecimento!",
        "Semana concluída com sucesso. Continue assim!"
      ],
      constancia: [
        "Meta da semana batida! Constância é tudo.",
        "Semana cumprida. Você é consistente!",
        "Mais uma semana completa. Isso é disciplina!",
        "Meta cumprida! O resultado vem da constância.",
        "Uma semana de cada vez, uma conquista de cada vez.",
        "Parabéns por manter o compromisso com você."
      ]
    },
    zoeira: {
      classico: [
        "Semana fechada! Até o frango ficou com inveja."
      ],
      cotidiano: [
        "Meta batida! Pode se gabar no grupo da família.",
        "Semana completa! O sofá está até com saudade.",
        "Meta cumprida! Tá mais disciplinado que despertador.",
        "Você prometeu e cumpriu. Print para o grupo!",
        "Constância em dia. O sofá já está procurando outro amigo.",
        "Parabéns! Hoje até o despertador te respeita."
      ],
      pop: [
        "Meta semanal desbloqueada. Próxima fase disponível.",
        "Semana concluída! Pode andar com pose de protagonista."
      ],
      ironia: [
        "Meta batida! Pode se achar, mas só um pouquinho.",
        "O calendário confirmou: você não deu perdido!",
        "A preguiça pediu demissão. Não aceita contraproposta."
      ]
    },
    bravo: {
      cobranca: [
        "Bateu a meta! Agora não some no fim de semana, seu peste.",
        "Meta batida. Não vai jogar tudo pro alto agora, porra!"
      ],
      sarcasmo: [
        "Cumpriu o combinado. Até que enfim, caralho!"
      ],
      comemoracao: [
        "Meta da semana batida, caralho! Respeita!",
        "Tá ficando disciplinado pra caralho.",
        "Semana paga! Pode até tirar foto no espelho, porra.",
        "Olha só: consistência! Continua nessa merda de caminho certo.",
        "Você fez o que precisava. Sem desculpa, sem novela.",
        "Semana concluída, porra! Descansa e planeja a próxima.",
        "Parabéns, seu teimoso. A disciplina venceu de novo!"
      ]
    }
  },

  fimDescanso: {
    padrao: {
      incentivo: [
        "Bora! Próxima série.",
        "Acabou o descanso. Vamos!",
        "Hora de voltar!",
        "Pra cima! Mais uma.",
        "Descansou? Agora execute!",
        "Foco total. Vai!",
        "Pronto? Então vamos para a próxima!",
        "Mais uma série bem feita!",
        "Recuperado? Vamos continuar!"
      ],
      tecnica: [
        "Respire fundo e retome!",
        "De volta ao treino. Mantenha a técnica!",
        "Bora, com controle e boa postura!"
      ]
    },
    zoeira: {
      classico: [
        "BIRL! Volta pro ferro!",
        "Bora, monstro!",
        "O ferro está com saudade!",
        "Saiu da jaula de novo!",
        "Sem migué! Bora!",
        "Volta, que o shape não vem sozinho!"
      ],
      cotidiano: [
        "Larga o celular, que o peso não vai levantar sozinho!",
        "Chega de selfie! O descanso acabou.",
        "Próxima série te esperando igual boleto no fim do mês."
      ],
      ironia: [
        "Acabou a moleza!",
        "O descanso acabou. O drama, não.",
        "O cronômetro apitou. Não adianta fingir que não ouviu."
      ]
    },
    bravo: {
      cobranca: [
        "Levanta, porra!",
        "Acabou o descanso, caralho!",
        "Vai, arrombado!",
        "Larga essa merda de celular!",
        "Tá esperando o quê, porra?",
        "Bora, seu enrolado!",
        "Chega de enrolar, caralho!",
        "Volta pro ferro, porra!",
        "Descansou demais. Mexe essa bunda!",
        "O cronômetro chamou. Obedece essa merda!"
      ],
      sarcasmo: [
        "Que descanso comprido da porra é esse? Vai!",
        "Acabou a reunião com o celular. Próxima série!"
      ]
    }
  },

  volta: {
    padrao: {
      incentivo: [
        "Não importa a pausa. O que vale é dar o próximo passo.",
        "Bom ter você por aqui novamente. Vamos nessa!"
      ],
      constancia: [
        "Que bom te ver de volta! Bora retomar.",
        "Voltou! Recomeçar também é evoluir.",
        "Bem-vindo de volta! Um treino de cada vez.",
        "Voltou! O importante é retomar.",
        "Que bom! Hoje é dia de reconstruir o ritmo.",
        "Retomar é uma conquista. Vamos com calma e consistência.",
        "Cada retorno é uma nova oportunidade de evoluir.",
        "O importante é continuar. Conte comigo no treino de hoje."
      ]
    },
    zoeira: {
      classico: [
        "Sumiu, hein? O ferro sentiu sua falta. Eu, nem tanto."
      ],
      cotidiano: [
        "Voltou! Achei que tinha virado sócio do sofá.",
        "A academia não é grupo de WhatsApp, mas pode aparecer mais vezes.",
        "O sofá perdeu a guarda compartilhada. Bora!"
      ],
      pop: [
        "A lenda retornou. A temporada nova começa agora.",
        "Depois de um hiato digno de série, você voltou!",
        "O algoritmo detectou saudade de puxar ferro.",
        "Plot twist: você voltou! Bora escrever o próximo episódio.",
        "Olha só quem saiu do modo avião!"
      ],
      ironia: [
        "Olha quem lembrou que tem academia!",
        "Os pesos estavam perguntando de você.",
        "Reapareceu! Bora tirar a ferrugem."
      ]
    },
    bravo: {
      cobranca: [
        "Até que enfim, caralho! Bora recuperar o ritmo.",
        "Chega de sumiço. Vamos recomeçar essa merda com juízo.",
        "Não quero justificativa, quero constância. Bora!",
        "Voltou? Então para de enrolar e começa, caralho!",
        "O importante é que voltou. Agora não desaparece de novo, seu figura."
      ],
      sarcasmo: [
        "Olha quem voltou! Onde você tava, caralho?",
        "Sumiu, né? Achei que tinha aposentado, porra.",
        "Que porra de férias foram essas?",
        "Ah, lembrou que tem academia? Bora, seu peste.",
        "O ferro estava criando teia. Bora trabalhar, porra!"
      ]
    }
  }
};

export const TONS = {
  padrao: "Motivador",
  zoeira: "Zoeira",
  bravo: "Sem filtro"
};
