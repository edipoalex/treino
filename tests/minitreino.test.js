/* Treino minimizado (v1.59): o botão ⌄ da sessão encolhe o treino para o mini-player; o treino continua e o usuário
   navega pelo app. Estas checagens protegem a regra (arquivos do app não rodam no Node: o teste lê o código). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const ler = arq => fs.readFileSync(new URL(arq, import.meta.url), "utf8");

test("sessão só ocupa a Hoje quando o treino não está minimizado", () => {
  assert.match(ler("../js/navegacao.js"), /em-sessao", nav\.tab==="hoje" && !!E\.atual && !E\.atual\.min\)/);
  assert.match(ler("../js/telas/hoje.js"), /if\(E\.atual && !E\.atual\.min\) return viewSessao\(\);/);
  assert.match(ler("../js/telas/hoje.js"), /\$\("#startBtn"\)\.onclick = \(\) => andamento \? expandirTreino\(\) : iniciar\(letra\);/);
});

test("sessão tem o botão de minimizar e o mini-player aparece em todo render", () => {
  assert.match(ler("../js/telas/sessao.js"), /id="sMin" aria-label="Minimizar o treino/);
  assert.match(ler("../js/telas/sessao.js"), /if\(el\.id==="sMin"\) return minimizarTreino\(\);/);
  assert.match(ler("../js/navegacao.js"), /atualizarMini\(\);\n\}/);
});

test("mini-player: estados com nomes próprios (não colidem com .descanso da tela cheia) e sem tela cheia fora do treino", () => {
  const css = ler("../css/minitreino.css"), js = ler("../js/minitreino.js");
  assert.doesNotMatch(css, /\.mini-treino\.(descanso|low|vai)\b/);
  assert.doesNotMatch(js, /cls: "(descanso|vai)/);
  assert.match(css, /body:not\(\.em-sessao\) #descanso,body:not\(\.em-sessao\) \.aviso-fim\{display:none\}/);
  assert.match(ler("../index.html"), /css\/minitreino\.css/);
  assert.match(ler("../sw.js"), /"js\/minitreino\.js"/);
});
