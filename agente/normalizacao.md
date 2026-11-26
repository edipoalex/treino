# Normalização de fichas (contrato v1)

Toda ficha nova passa pelo comando `/normalize` antes de ir para o app. O Claude lê a ficha como chegou
(JSON do agente, texto colado ou transcrição), interpreta cada exercício, corrige grafia e variações de escrita,
pergunta o que for ambíguo e escreve a ficha no **contrato v1**. Depois disso, o validador (`scripts/normalizacao.mjs
validar`) confere a ficha contra o catálogo (`js/tecnicas.js`). Quem interpreta é o Claude; quem garante a estrutura
é o código.

Objetivo: o mesmo tipo de exercício usa sempre os mesmos componentes do app, qualquer que seja a ficha ou o jeito de
escrever. O app só muda quando aparece uma técnica ou combinação que o catálogo não prevê, ou quando falta o componente.

## Fases
- **Fase 1 (v1.55):** contrato, catálogo, validador, `/normalize` e relatórios.
- **Fase 2 (v1.56):** o app lê `tecnicas`, `componentes` e `series_detalhe` quando o exercício os tem; o texto
  fica como reserva para fichas antigas. `aplicar-ficha` e `publicar-ficha` aceitam ficha normalizada **só se o
  validador não apontar erro**.
- **Fase 3 (v1.57):** `cronometro-partes-ultima` (rest-pause / micro-pausas só na última série). Daqui em diante, todo
  componente novo segue o mesmo caminho: o relatório aponta ✖, o componente é criado no app e marcado `existe: true`.

## Contrato v1
Na raiz da ficha:
```json
"normalizacao": { "versao": 1, "data": "AAAA-MM-DD", "fonte": "original.json", "revisado_por": "Claude (/normalize)" }
```
Em **cada** exercício (itens e express), além dos campos de sempre (`nome`, `prescricao`, `series`, `exec`,
`descanso`, `bloco`, `obs`, `metodo`, `carga`…):

| Campo | Regra |
|---|---|
| `tipo` | `forca`, `core`, `cardio`, `aquecimento` ou `mobilidade` |
| `series_detalhe` | obrigatório quando `series` > 0: uma entrada por série, na ordem, no formato `"repetições · etiqueta"` ("8–10", "6 · pesado", "12–15 por perna · até a falha", "15–20 · rest-pause"). A etiqueta vira a pílula da série no app; contraste usa `pesado` e `leve`. |
| `tecnicas` | lista (vazia = séries normais). Cada técnica: `{ "id", "aplica": "todas" \| "ultima", …parâmetros, "assumido": [] }` |
| `componentes` | lista dos componentes do app que o exercício usa, conforme o catálogo |

A `prescricao` continua com o texto para leitura (corrigido de grafia, mas com o mesmo sentido).

## Catálogo
Fonte única: `js/tecnicas.js` (`node scripts/normalizacao.mjs catalogo` lista tudo). Resumo:

| Técnica (`id`) | Quando | Parâmetros | Componentes |
|---|---|---|---|
| `ate-falha` | "até a falha", "até próximo da falha" | — | — |
| `contraste` | séries pesado/leve alternadas | — | carga `cargas-pesado-leve` |
| `piramide` | repetições que sobem ou descem ("30 / 20 / 10 / 6") | — | — |
| `drop` | drop-set, drop duplo | `quedas` (1–3), `reducao_pct` | — |
| `rest-pause` | falha, pausa curta, falha… | `pausa_s` (padrão 10), `blocos` (esforços, padrão 3) | todas → `cronometro-partes`; última → `cronometro-partes-ultima` |
| `micro-pausas` | blocos de reps com pausas diferentes | `blocos`: `[{ "reps", "pausa_s" }]` | idem rest-pause |
| `isometria-no-meio` | "20 reps / 20 s isometria / 20 reps" | `blocos`: `[{ "reps", "pausa_s", "pausa_rot" }]` | `cronometro-partes` |
| `bi-set` / `tri-set` / `circuito` | 2 / 3 / 4+ exercícios em sequência (nome com " + ") | — | carga `cargas-combinada` (ou `sem-carga` em core) |
| `isometria` | prancha, segurar X s, "por lado" | `segundos`, `por_lado` | `cronometro-segurar` |
| `parciais` | "+ 4–6 parciais" | `reps`, `descricao` | — |
| `cadencia` | "descida em 3 s", "2 s de pausa embaixo" (não é cronômetro) | `descricao` | — |
| `intervalado` | HIIT, tiros, "4x (4 min forte / 3 min leve)" | `rodadas`, `forte_s`, `leve_s`, `desaquecer_s`, `rotulo` | `fases-intervalo` |
| `continuo` | zona 2, caminhada, cardio contínuo | `minutos`, `zona2` | `fases-continuo` |
| `aquecimento` | "5 min de bike + 2 séries de aproximação" | `minutos`, `atividade`, `series_aproximacao`, `exercicio_aproximacao` | `fases-aquecimento` |

Componentes de carga (exatamente um por exercício com séries): `cargas-unica`, `cargas-pesado-leve`,
`cargas-combinada`, `sem-carga`. Sem séries (cardio, aquecimento) não há componente de carga.

## Regras de interpretação
1. **Leia a intenção, não a grafia.** "rest pause", "rest-puase", "RP", "descanso de 10 s entre mini-séries até a falha"
   são todos `rest-pause`. Corrija a grafia na `prescricao` e registre a correção no relatório.
2. **Um parâmetro que a ficha não diz** recebe o padrão do catálogo e entra em `assumido`. O relatório pede confirmação.
   Se não houver padrão, **pergunte** ao usuário antes de gravar.
3. **"Na última série"** vira `"aplica": "ultima"`; o resto da técnica vale para todas.
4. **RIR, carga alta, amplitude, posição dos pés** são orientação: ficam no texto e em `series_detalhe`, não viram técnica.
5. **Cadência e pausas de 1–3 s no movimento** são `cadencia`, nunca cronômetro.
6. **Express:** a prescrição costuma repetir a da versão completa. Use o número de séries do campo `series`, escreva
   `series_detalhe` com esse número e registre a diferença no relatório.
7. **Core e abdômen** usam `sem-carga` (como o app faz hoje). Se a ficha indicar carga (polia, anilha, cabo),
   pergunte ao usuário se quer registrar a carga (`cargas-unica`).
8. **Combinações** (nome com " + "): `bi-set`, `tri-set` ou `circuito` pelo número de partes; uma isometria dentro da
   combinação ("+ 45 s de prancha") entra como `isometria` também.
9. **Não previsto:** técnica sem equivalente no catálogo, ou que precise de componente inexistente. **Não invente id.**
   Pare, explique ao usuário o que é, proponha a entrada no catálogo (e o componente, se precisar) e só continue com
   aprovação. Técnica que só muda o texto (como `parciais`) entra no catálogo sem componente.
10. **Dúvidas** vão para o usuário **todas de uma vez**, antes de gravar a ficha normalizada.

## Arquivos de auditoria
Fora do repositório (os originais podem ter conteúdo licenciado ou dados de outra pessoa):
```
AI-Personal/fichas-normalizadas/<perfil>/etapa-NN/
  original.json | original.txt   como chegou, sem alteração
  normalizada.json               contrato v1
  relatorio.md                   o que foi corrigido, assumido, perguntado e o de-para gerado pelo validador
```

## Exemplos
Rest-pause em todas as séries:
```json
{ "nome": "Voador peitoral", "prescricao": "Rest-pause 2x (falha / 10s / falha / 10s / falha)", "series": 2,
  "tipo": "forca", "series_detalhe": ["falha / 10s / falha / 10s / falha", "falha / 10s / falha / 10s / falha"],
  "tecnicas": [{ "id": "rest-pause", "aplica": "todas", "pausa_s": 10, "blocos": 3 }],
  "componentes": ["cargas-unica", "cronometro-partes"] }
```
Rest-pause só na última, sem pausa escrita (parâmetros assumidos → ⚠ para confirmar):
```json
{ "nome": "Cadeira abdutora", "prescricao": "3x15–20, tronco inclinado à frente; última série em rest-pause", "series": 3,
  "tipo": "forca", "series_detalhe": ["15–20", "15–20", "15–20 · rest-pause"],
  "tecnicas": [{ "id": "rest-pause", "aplica": "ultima", "pausa_s": 10, "blocos": 3, "assumido": ["pausa_s", "blocos"] }],
  "componentes": ["cargas-unica", "cronometro-partes-ultima"] }
```
Core em combinação, sem carga:
```json
{ "nome": "Abdômen: elevação de pernas na paralela + prancha", "prescricao": "3 voltas: 15 reps + 45s de prancha", "series": 3,
  "tipo": "core", "series_detalhe": ["15 reps + 45s de prancha", "15 reps + 45s de prancha", "15 reps + 45s de prancha"],
  "tecnicas": [{ "id": "isometria", "segundos": 45, "por_lado": false }, { "id": "bi-set" }],
  "componentes": ["cronometro-segurar", "sem-carga"] }
```
