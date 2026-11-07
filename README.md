# Treino – app da ficha atual

App web (um único `index.html`) para acompanhar a ficha de treino pelo celular.

Acesse: https://edipoalex.github.io/treino/ e use **Adicionar à tela inicial**.
Depois do primeiro acesso, o app abre também sem internet (`sw.js`).

## Nova ficha
A ficha vem do agente do projeto como JSON. Para aplicar:

```bash
node scripts/aplicar-ficha.mjs caminho/etapa-20.json
```

O script valida a ficha (com erro, não altera nada), grava `fichas/etapa-NN.json`, substitui
`FICHA_EMBUTIDA` no `index.html`, ajusta o `versao` da ficha e sobe `APP_VERSAO`/`APP_DATA`.
Histórico, cargas e ajustes ficam separados por número de etapa, então trocar a ficha não apaga o histórico anterior.

## Validação
`node scripts/validar.mjs` confere a sintaxe do app, do `sw.js` e do Apps Script, a ficha embutida
(formato, letras iguais em todas as fases, voltas, tempo por janela até 60 min) e se `fichas/etapa-NN.json`
bate com o `index.html`. Com `--base <ref>` também exige que `APP_VERSAO` e o `versao` da ficha tenham subido.
`--ficha arq.json` valida só uma ficha avulsa. `node scripts/testar-planilha.mjs` testa o Apps Script contra uma
planilha simulada. O GitHub Actions roda os dois em todo PR e push na `main`.

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
