---
name: normalize
description: Normaliza uma ficha de treino nova para o contrato v1 do app Treino (técnicas e componentes explícitos por exercício), valida contra o catálogo e salva original, normalizada e relatório para auditoria. Use quando o usuário digitar /normalize e colar uma ficha (JSON ou texto), ou pedir para normalizar uma ficha.
---

# /normalize: ficha nova → contrato v1

Você (Claude) é o normalizador. O código só ajuda e confere. Siga nesta ordem.

## 1. Ler as regras
Leia `treino/agente/normalizacao.md` (contrato, regras de interpretação, exemplos) e rode
`node treino/scripts/normalizacao.mjs catalogo` para ver as técnicas e componentes que existem hoje.
Os caminhos são relativos a `/Users/ediposilva/Documents/AI-Personal`.

## 2. Identificar a ficha
- Perfil: de quem é a ficha ("edipo" para o próprio usuário, ou o nome do perfil em `~/.config/treino/perfis.json`). Se não estiver claro, pergunte.
- Etapa (e revisão, se houver). Se vier em texto, monte o JSON no formato do app (veja uma ficha em
  `treino/fichas/etapa-*.json`) antes de normalizar.
- Pasta: `fichas-normalizadas/<perfil>/etapa-NN/` (fora do repositório). Se a pasta já existir, confirme antes de
  sobrescrever; use `etapa-NN-revK` para revisões.

## 3. Salvar o original
Grave exatamente o que o usuário colou em `original.json` (ou `original.txt` se for texto), sem alterar nada.

## 4. Rascunho (opcional, só ponto de partida)
`node treino/scripts/normalizacao.mjs rascunho <original.json> <pasta>/rascunho.json` preenche o contrato com os
leitores de texto do app e lista o que revisar. O rascunho erra; ele não substitui a sua leitura.

## 5. Normalizar (a parte que é sua)
Para **cada exercício distinto**, compare com o texto original e decida, seguindo as regras do documento:
`tipo`, `series_detalhe`, `tecnicas` (com parâmetros e `aplica`) e `componentes`.
- Corrija grafia e variações de escrita; anote cada correção.
- Parâmetro que a ficha não diz: use o padrão do catálogo e marque em `assumido`, ou pergunte se não houver padrão.
- Técnica sem equivalente no catálogo ou que precise de componente que não existe: **não invente**. Explique e
  proponha a inclusão no catálogo/componente; só siga com aprovação.
- Junte **todas as dúvidas numa pergunta só** (AskUserQuestion, até 4 por vez) antes de gravar.
Grave `normalizada.json` com `"normalizacao": { "versao": 1, "data": "<hoje>", "fonte": "original.json",
"revisado_por": "Claude (/normalize)" }` e sem `rascunho`. Apague `rascunho.json` depois.

## 6. Relatório e validação
Escreva `relatorio.md` com: origem da ficha, correções de grafia, parâmetros assumidos e confirmados, respostas do
usuário, casos não previstos e decisões. Depois rode:
```
node treino/scripts/normalizacao.mjs validar <pasta>/normalizada.json --original <pasta>/original.json --relatorio <pasta>/relatorio.md
```
Ele acrescenta ao relatório a tabela do de-para (exercício → técnicas → componentes, comparada com o que o app faz
hoje). Se houver ✖, corrija a ficha ou explique ao usuário o que precisa ser criado no app. Não publique com ✖.

## 7. Entregar
Mostre ao usuário o resumo do validador, os ⚠ para confirmar, os ✖ e o que muda em relação ao app de hoje.
Na fase 1 (atual), a ficha normalizada **não é publicada**: `aplicar-ficha`/`publicar-ficha` recusam o contrato v1.
Publicar continua sendo com a ficha original, como sempre, e só com o pedido do usuário.

## Cuidados
- Fichas e dados de outros perfis e conteúdo de PDFs licenciados nunca vão para o repositório (só para `fichas-normalizadas/`).
- Não altere o catálogo (`js/tecnicas.js`) sem aprovação: mudança no catálogo é mudança no app (branch e PR).
