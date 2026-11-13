# Funcionalidades do app e o que as ativa

Registro das decisões já tomadas. Toda funcionalidade abaixo é **genérica**: vale para qualquer ficha,
porque é ativada pelos campos ou pelo texto da prescrição, nunca pelo nome de um exercício ou por uma
etapa específica. Ao trocar de ficha nada precisa ser refeito; basta a ficha usar os formatos abaixo.

**Como isso é garantido**
- As regras ficam em um só lugar: `js/series.js` (leitura da prescrição) e `js/recursos.js` (o que cada
  item ativa). O app e as ferramentas usam as mesmas funções.
- `node scripts/aplicar-ficha.mjs etapa-NN.json` mostra os recursos que a ficha nova ativa e **avisa** o que
  não vai ser reconhecido (tempo citado sem cronômetro, séries não lidas, cardio sem fases). O
  `validar.mjs` faz o mesmo no CI.
- `tests/ficha-exemplo.json` tem um exemplo de cada formato; `tests/recursos.test.js` garante que todos
  continuam reconhecidos (e que a ficha publicada não gera avisos). Ao criar uma funcionalidade nova,
  inclua o formato no exemplo e um teste.

## Regra: toda melhoria vale para todos os modos
Toda melhoria é avaliada e aplicada em **todos os modos do app** sempre que fizer sentido, sem precisar
pedir de novo. Quando um modo não comportar a mesma solução, ele recebe uma adaptação equivalente, e a
diferença é registrada aqui. Modos a considerar a cada mudança:
- **Sessão:** modo lista e modo foco (Ajustes › Modo do treino);
- **Descanso:** no botão e em tela cheia (Ajustes › Descanso), que também define onde abrem os cronômetros;
- **Treino:** completo e express;
- **Aparência:** tema claro e escuro; animações completas e reduzidas (e o "reduzir movimento" do sistema);
- **Tela:** celular em pé, tamanhos pequenos (anilhas e textos legíveis) e o app recarregado no meio do treino.

Protótipos e testes no navegador cobrem lista, foco e tela cheia; a descrição de cada PR diz como cada modo foi tratado.

## Sessão de treino

| Funcionalidade | Como a ficha ativa | Onde |
|---|---|---|
| Modos lista e foco, descanso no botão ou em tela cheia | Ajustes do app (não depende da ficha) | `telas/sessao.js`, `descanso.js` |
| Séries uma a uma ("6 pesado", "20 leve") | `series_detalhe`, ou prescrição "3x8", "3x8 (na última: …)", "Contraste: 1x6 pesado / 1x20 leve / …", "Pirâmide: 1x15 / 1x12 / …", "Rest-pause 2x (…)", "3 voltas: …" | `series.js › seriesDe` |
| Carga por série na linha (foco) e nas bolinhas (lista) | Exercício de uma parte com carga | `cargas.js` |
| Carga pesada e leve separadas | Séries com "pesado" e "leve" (contraste) | `recursos.js › contraste` |
| Mesma carga em todas, com "variar por série" | Exercício de uma parte sem contraste | `cargas.js` |
| Ajustar uma série muda ela e as seguintes | Sempre (carga planejada por série no treino) | `cargas.js › planejar` |
| Uma carga por parte | Nome com " + " (exercício combinado) | `cargas.js › partesDe` |
| Sem campo de carga | `"carga": false`, ou nome com "abdômen" / "core" | `recursos.js › temCarga` |
| Carga da última vez | Automático, pelo nome exato do exercício | `cargas.js › ultimaDaSerie` |
| Volume, recordes, resumo | Automático a partir das cargas registradas | `metricas.js` |

| Fim do descanso visível sem vibração (iPhone) | Sempre: flash na cor do treino, aviso "VAI!" no topo com a próxima série, botão pulsando; em tela cheia, "VAI!" antes de fechar | `descanso.js › fimDescanso` |
| Confirmações no visual do app | Concluir (com resumo), apagar peso, desfazer treino, recomeçar, importar, desconectar, trocar para express | `ui.js › confirmar` |
| Destaque da sessão | O cartão em execução usa a cor do treino (sem verde neon); textos lidos na série com 16 px ou mais | `css/sessao.css` |

## Cronômetros

| Funcionalidade | Formato na prescrição | Tipo |
|---|---|---|
| Isometria dentro da série | "15 reps + 45s de prancha", "3 voltas de 1 minuto" | `segurar` |
| Por lado, com troca | "30s por lado" | `segurar` |
| Partes da série com pausas | "(falha / 10s / falha / 10s / falha)", "(1x30 / 20s / 1x20 / 15s / 1x10)", "1x30+6 / 1 min / 1x20+6", "(20 reps / 20 s isometria / 20 reps)" | `partes` |
| Cardio intervalado em fases | "6x (30s forte / 30s leve) + 2 min de desaquecimento", "3x (4 min forte / 3 min leve)" | `intervalo` |
| Cardio contínuo (zona 2, com FC alvo pela idade) | Item sem séries com "Zona 2", "contínuo", "cardio", "caminhada", "esteira", "bike"…; o tempo é o do `bloco` | `continuo` |
| Aquecimento em passos | "5 min de esteira leve + 2 séries de aproximação no supino" | `aquecimento` |
| Cronômetro livre | Sempre disponível em qualquer exercício | — |

Não viram cronômetro: tempo de descanso ("(30 s de descanso)", "descanso de 45 s") e cadência
("3s na descida", "2 s de pausa no topo").

Tela de fases (cardio e, com descanso em tela cheia, isometria): cor por fase (forte vermelho com listras,
leve verde, desaquecimento azul, zona 2 verde-azulado), avisos ACELERE!/DESACELERE com bipes e vibração,
pausar, pular fase e minimizar (o cartão ou o botão vira o indicador da fase).

## Hábito (fase 3)

Tudo vem da ficha e do histórico; nada é fixo de uma etapa. Cálculos em `js/habito.js` (testados em
`tests/habito.test.js`), telas em `js/telas/habito.js`, estilos em `css/habito.css`.

| Funcionalidade | O que ativa | Onde |
|---|---|---|
| Meta da semana (anel) | `frequencia` da ficha ("4–5x" → mínimo 4, máximo 5; os gomos além do mínimo são bônus) | Hoje › Sua semana |
| Sequência de semanas | Semanas seguidas (seg a dom) com a meta mínima, contando entre etapas. A semana em andamento só quebra quando não dá mais (em pausa); "em risco" quando faltam tantos treinos quanto dias | Hoje › Sua semana |
| Barra da etapa | `progressao` (um bloco por volta) ou `semanas` × máximo da frequência (um bloco por semana); fases de `fases_voltas` ou `fases_semanas` | Hoje › Etapa N |
| Como foi (leve, no ponto, pesado) | Um toque no resumo do treino; opcional, pode ser marcado ou trocado depois no Histórico. Vai para a planilha como `setConfig` `sensacao.<id da sessão>` (aba Config), sem mudar o Apps Script | Resumo do treino, Histórico |
| Marco ao concluir | Meta batida, semana perfeita, metade da etapa, última volta (só fichas por voltas), etapa concluída | Resumo do treino |
| Revisão da semana | Cartão na Hoje na semana seguinte (uma vez; tocar abre, X dispensa) e pílulas S1, S2… no Histórico | Folha da revisão |
| Fechamento da etapa | Etapa completa ou prazo (`limite_semanas`, ou `semanas`) passado: a Hoje mostra resultados, evolução de carga, como foi e peso; copia um resumo para o agente; "Treinar enquanto a nova ficha não chega" volta à Hoje normal | Hoje |

Em todos os modos: o resumo do treino é o mesmo em lista e foco; treino express conta igual para a meta; com
animações reduzidas não há confete nem o traço do próximo treino piscando; em 320 px nada rola para o lado.

## Treino inteligente e progresso (fase 4)

Regras em `js/inteligente.js` (testadas em `tests/inteligente.test.js`); na sessão, `js/dicas.js`; telas em
`js/telas/progresso.js` e `js/telas/guia.js`; cartão em `js/compartilhar.js`; voz em `js/voz.js`; estilos em `css/progresso.css`.

| Funcionalidade | O que ativa | Onde |
|---|---|---|
| Sugestão de carga | Mesma carga nas 2 últimas vezes da parte e do grupo (pesado/leve), todas as séries feitas e nenhum treino marcado como pesado: sobe 1 passo (2,5 kg ou 1 placa). Faltou série ou foi pesado: "mantenha". Nunca sugere baixar. Só antes da 1ª série do grupo; "Usar" aplica, o X dispensa até o fim do treino (`E.atual.sugOff`) | Lista, foco, descanso em tela cheia; combinados: uma por parte |
| Recorde ao alcance | Carga planejada maior que o melhor registrado da parte, grupo e unidade, em qualquer etapa (kg ou placas). Combinados ficam sem troféu | Bolinha da série (lista), linha da série (foco), descanso em tela cheia |
| Aba Progresso | Toda parte com carga registrada (`cs`): busca sem acento, filtro por treino, mini gráfico, variação desde o início da etapa; detalhe com gráfico por grupo, recorde, últimos treinos e como fazer. Recordes e Volume saíram do Histórico | Aba Progresso |
| Guia consultável | Busca em orientações, métodos, cardio e exercícios da fase atual (dicas de `guia` da ficha ou da base), com atalho para o progresso | Aba Guia |
| Cartão para compartilhar | Imagem 1080×1350 desenhada no aparelho; sem peso e sem cargas por padrão; recordes e volume opcionais | Resumo do treino, fechamento da etapa |
| Lembretes | Dias e horário em Ajustes viram um evento semanal (.ics) com alerta 15 min antes | Ajustes › Lembretes |
| Voz | Ajustes › Voz: desligada, cardio (fases do cardio e dos cronômetros, "3, 2, 1", metade, reta final) ou cardio e descanso (também "Vai! Série…"). Alto-falante na tela de fases silencia na hora | Tela de fases, fim do descanso |
| Som no modo silencioso (opcional) | Ajustes › "Tocar voz e bipes no modo silencioso": durante o treino o app toca como player de mídia (`navigator.audioSession = "playback"` e um áudio mudo em loop), para a voz e os bipes saírem com o iPhone no silencioso. Pode pausar a música de outros apps; desliga ao concluir ou cancelar o treino | Todo o treino |

## Fundação visual
- Medidas e cores só por tokens (`css/tokens.css`, cores em `css/base.css`); nada de tamanho solto nem estilo inline.
- Seções com título forte acima do cartão; estados vazios com ícone, frase e próximo passo; botões em 4 variantes.
- Toda mudança visual confere as capturas (`scripts/capturas.mjs`) nos dois temas e nos modos lista e foco.

## Tela Hoje, visual e dados
- Card do treino com anilha 3D em marca d'água; tocar vira e mostra os exercícios; anilhas A–E para escolher.
- Anilhas: 3D nas grandes, de frente com a letra no cubo nas pequenas (`anilha.js`); ícone do app gerado por `scripts/gerar-icone.mjs`.
- Cores das letras A–H; animações respeitam Ajustes › Animações e "reduzir movimento".
- Sincronização com a planilha, catálogo de fichas e validação: ver README.
