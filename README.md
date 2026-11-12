# Treino – app da ficha atual

App web estático para acompanhar a ficha de treino pelo celular. Sem build: o navegador carrega os
módulos ES direto, e o GitHub Pages publica o que estiver na `main`.

Acesse: https://edipoalex.github.io/treino/ e use **Adicionar à tela inicial**.
Depois do primeiro acesso, o app abre também sem internet (`sw.js`).

## Estrutura
```
index.html              só a estrutura da página
css/                    base · componentes · sessao · telas · acabamento · movimento (nessa ordem)
js/app.js               ponto de entrada: carrega o estado, liga os eventos, desenha a tela
js/estado.js            estado salvo no aparelho (localStorage) e ficha em uso
js/validacao.js         regras dos dados vindos da planilha/backup (as mesmas do Apps Script)
js/progresso.js         datas, sequência, voltas, fases, frequência e peso
js/series.js            leitura da prescrição: séries ("6 pesado", "20 leve"…) e partes com tempo ("45s de prancha")
js/cargas.js            cargas por exercício (kg, placas, livre; pesado e leve no contraste)
js/metricas.js          volume e recordes a partir das cargas registradas em cada série
js/movimento.js         transições e microinterações (respeita Ajustes › Animações e "reduzir movimento")
js/icones.js            ícones Lucide (ISC) guardados no app, para funcionar offline
js/anilha.js            anilhas em SVG: 3D nas grandes, de frente com a letra no cubo nas pequenas
js/descanso.js          cronômetro de descanso (e a carga da próxima série, na tela cheia)
js/execucao.js          cronômetro de execução e tela de fases (cardio intervalado/zona 2, aquecimento, prancha, rest-pause) e cronômetro livre
js/sync.js              sincronização com a planilha
js/navegacao.js         abas e render()
js/telas/               hoje · sessao · ficha · historico · guia
js/ajustes.js, js/ui.js, js/guia-exercicios.js, js/atualizacao.js, js/util.js
js/versao.js            APP_VERSAO e APP_DATA
js/ficha-atual.js       gerado a partir de fichas/etapa-NN.json (não edite à mão)
tests/                  testes unitários (node --test)
```
Os módulos só declaram funções e constantes; tudo que mexe na página roda a partir de `js/app.js`.
Arquivo novo em `js/` ou `css/` precisa entrar na lista `ARQUIVOS` do `sw.js` (o validador cobra).

Para rodar localmente: `python3 -m http.server` na pasta e abra `http://localhost:8000`
(módulos ES não carregam por `file://`).

## Ícone do app
`node scripts/gerar-icone.mjs` gera `icon.svg` e os PNGs (iPhone 180 px, Android 192/512 px e versão
"maskable") a partir da anilha 3D de `js/anilha.js`. Precisa do Google Chrome instalado para converter em PNG.
No iPhone, o ícone da tela inicial só muda ao remover o app da tela inicial e adicionar de novo.

## Nova ficha
A ficha vem do agente do projeto como JSON. Para aplicar:

```bash
node scripts/aplicar-ficha.mjs caminho/etapa-20.json
```

O script valida a ficha (com erro, não altera nada), grava `fichas/etapa-NN.json`, regera
`js/ficha-atual.js`, ajusta o `versao` da ficha e sobe `APP_VERSAO`/`APP_DATA` em `js/versao.js`.
Histórico, cargas e ajustes ficam separados por número de etapa, então trocar a ficha não apaga o histórico anterior.

## Validação
`node scripts/validar.mjs` confere a sintaxe de cada módulo, se todo import existe, se o `sw.js` lista todos os
arquivos, a sintaxe do Apps Script, a ficha atual (formato, letras iguais em todas as fases, voltas, tempo por
janela até 60 min) e se `fichas/etapa-NN.json` bate com `js/ficha-atual.js`. Com `--base <ref>` também exige que
`APP_VERSAO` e o `versao` da ficha tenham subido. `--ficha arq.json` valida só uma ficha avulsa.
`npm test` roda os testes unitários (`tests/`) e o teste do Apps Script contra uma planilha simulada
(`scripts/testar-planilha.mjs`). O GitHub Actions roda tudo em todo PR e push na `main`.

Regras da ficha (validadas no app e na planilha; ficha inválida é recusada):
- treinos com uma letra de `A` a `Z`, fases numéricas (`"1"`, `"2"`);
- `series`, `exec`, `descanso` e `bloco` numéricos;
- nenhum texto pode conter `<` ou `>`.

Se a ficha embutida estiver inválida, o erro aparece no console do navegador.

## Planilha (sincronização)
O código do Apps Script fica em [`apps-script/Code.gs`](apps-script/Code.gs). Ele não contém segredos:
a chave fica em **Propriedades do script** (`CHAVE`).

Para publicar uma alteração do script:
1. Cole o `Code.gs` em **Extensões › Apps Script** da planilha.
2. **Implantar › Gerenciar implantações › (lápis) na implantação existente › Versão: Nova versão › Implantar.**
   Editar a implantação existente mantém a URL; criar uma nova muda a URL e desconecta os aparelhos.

Para trocar a chave: rode `configurar()` no editor, copie a chave do registro de execução e,
em cada aparelho, **Ajustes › Desconectar este aparelho**, cole a chave nova e **Conectar**.

Alterações que a planilha recusa (dado inválido) vão para a aba **Rejeitadas**, com o JSON original.

**Catálogo de fichas:** as abas **Etapas** e **Historico_Exercicios** guardam o histórico estruturado de todas as
etapas e são a fonte de verdade do agente. As etapas dos PDFs foram importadas uma vez (o conteúdo é licenciado
para uso pessoal e não fica neste repositório); cada ficha publicada no app entra no catálogo automaticamente.

## Agente das fichas
O prompt do projeto que cria as fichas fica em [`agente/prompt.md`](agente/prompt.md).
O agente cuida só do treino (fichas, orientações, feedback) e entrega a ficha como `etapa-NN.json`;
a manutenção técnica do app é feita com o Claude Code. A seção `<ficha_para_o_app>` do prompt é o
contrato da ficha: ao mudar campos ou regras no app, atualize-a junto.
O prompt não contém dados pessoais: o agente lê os dados do atleta na planilha (abas Atleta, Config e Peso).

## Backup
Use **Ajustes › Exportar** de vez em quando. Com a planilha conectada, ela também guarda os dados.
