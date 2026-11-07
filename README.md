# Treino – app da ficha atual

App web (um único `index.html`) para acompanhar a ficha de treino pelo celular.

Acesse: https://edipoalex.github.io/treino/ e use **Adicionar à tela inicial**.
Depois do primeiro acesso, o app abre também sem internet (`sw.js`).

## Nova ficha
Só o objeto `FICHA_EMBUTIDA` dentro do `index.html` muda. Suba também o `versao` da ficha e o `APP_VERSAO`.
Histórico, cargas e ajustes ficam separados por número de etapa, então trocar a ficha não apaga o histórico anterior.

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

## Agente das fichas
O prompt do projeto que cria as fichas fica em [`agente/prompt.md`](agente/prompt.md).
Ele não contém dados pessoais: o agente lê os dados do atleta na planilha (abas Atleta, Config e Peso).

## Backup
Use **Ajustes › Exportar** de vez em quando. Com a planilha conectada, ela também guarda os dados.
