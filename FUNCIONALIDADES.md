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

## Tela Hoje, visual e dados
- Card do treino com anilha 3D em marca d'água; tocar vira e mostra os exercícios; anilhas A–E para escolher.
- Anilhas: 3D nas grandes, de frente com a letra no cubo nas pequenas (`anilha.js`); ícone do app gerado por `scripts/gerar-icone.mjs`.
- Cores das letras A–H; animações respeitam Ajustes › Animações e "reduzir movimento".
- Sincronização com a planilha, catálogo de fichas e validação: ver README.
