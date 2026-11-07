#!/usr/bin/env node
/* Validação do app Treino (sem dependências).
   Uso:
     node scripts/validar.mjs                   valida index.html, sw.js, apps-script/Code.gs e a ficha embutida
     node scripts/validar.mjs --base <ref git>  também compara com outra versão (APP_VERSAO e "versao" da ficha subiram?)
     node scripts/validar.mjs --ficha arq.json  valida só uma ficha avulsa (ex.: a entregue pelo agente)
   As regras de formato da ficha vêm das próprias funções validarFicha() do app e do Apps Script,
   para nunca divergirem. Sai com código 1 se houver erro. */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ler = arq => fs.readFileSync(path.join(RAIZ, arq), "utf8");

/* ---------- Leitura do index.html ---------- */
export function scriptDoApp(html){
  const m = html.match(/<script>\n([\s\S]*?)\n<\/script>/);
  if(!m) throw new Error("index.html: bloco <script> não encontrado");
  return m[1];
}
const MARCA = "const FICHA_EMBUTIDA = ";
export function trechoDaFicha(codigo){
  const i = codigo.indexOf(MARCA);
  if(i<0) throw new Error("index.html: FICHA_EMBUTIDA não encontrada");
  const ini = i + MARCA.length, fim = codigo.indexOf("\n};", ini) + 2;
  return { ini, fim, texto: codigo.slice(ini, fim) };
}
export function lerApp(html){
  const codigo = scriptDoApp(html);
  const ficha = JSON.parse(trechoDaFicha(codigo).texto);
  const versao = (codigo.match(/const APP_VERSAO = "([^"]+)"/)||[])[1];
  const data = (codigo.match(/const APP_DATA = "([^"]+)"/)||[])[1];
  return { codigo, ficha, versao, data };
}

/* ---------- Validadores reaproveitados ---------- */
function validadorDoApp(codigo){
  const ini = codigo.indexOf("const RX = {"), fim = codigo.indexOf("function limparSessao");
  if(ini<0 || fim<0) throw new Error("index.html: validarFicha() não encontrada");
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(codigo.slice(ini, fim) + "\nthis.validar = validarFicha;", ctx);
  return ctx.validar;
}
function validadorDaPlanilha(){
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(ler("apps-script/Code.gs") + "\nthis.validar = validarFicha;", ctx);
  return ctx.validar;
}

/* ---------- Regras de conteúdo (além do formato) ---------- */
const minutos = it => it.series*(it.exec+it.descanso)/60 + it.bloco;
const r1 = v => Math.round(v*10)/10;

export function checarFicha(f, codigoApp, erros, avisos){
  const validadores = [["app", validadorDoApp(codigoApp)], ["planilha", validadorDaPlanilha()]];
  for(const [nome, v] of validadores){ const e = v(f); if(e) erros.push(`ficha recusada pelo ${nome}: ${e}`); }
  if(erros.length) return null;

  const fases = Object.keys(f.fases);
  const letras = Object.keys(f.fases[fases[0]]);
  for(const fa of fases){
    const ls = Object.keys(f.fases[fa]);
    if(ls.join(",") !== letras.join(",")) erros.push(`fase ${fa} tem os treinos ${ls.join(", ")}; esperado ${letras.join(", ")} (mesmas letras em todas as fases)`);
  }
  if(erros.length) return null;

  const prog = f.progressao;
  const uni = prog ? "volta" : "semana";
  const total = prog ? prog.voltas : f.semanas;
  const mapa = prog ? prog.fases_voltas : f.fases_semanas;
  if(!Number.isInteger(total) || total<1){ erros.push(`${prog?"progressao.voltas":"semanas"} ausente ou inválido`); return null; }
  if(!mapa){ erros.push(`${prog?"progressao.fases_voltas":"fases_semanas"} ausente`); return null; }
  if(Object.keys(mapa).sort().join(",") !== [...fases].sort().join(",")) erros.push(`as fases de ${prog?"fases_voltas":"fases_semanas"} (${Object.keys(mapa).join(", ")}) não batem com as da ficha (${fases.join(", ")})`);
  for(let n=1; n<=total; n++){
    const em = Object.keys(mapa).filter(k=>(mapa[k]||[]).includes(n));
    if(em.length!==1) erros.push(`${uni} ${n} aparece em ${em.length} fases (deve estar em exatamente uma)`);
  }
  if(prog && prog.treinos_por_volta && prog.treinos_por_volta!==letras.length) avisos.push(`treinos_por_volta (${prog.treinos_por_volta}) difere do número de treinos (${letras.length})`);

  // tempo por janela e voltas citadas nos itens
  const resumo = {};
  const alvoExpress = f.express_alvo || 40;
  const vistos = new Set();
  for(let n=1; n<=total; n++){
    const fa = Object.keys(mapa).find(k=>(mapa[k]||[]).includes(n)); if(!fa || !f.fases[fa]) continue;
    for(const letra of letras){
      const t = f.fases[fa][letra];
      for(const [modo, lista] of [["completo", t.itens], ["express", t.express]]){
        if(!lista) continue;
        const doDia = lista.filter(it=>{ const a=it.voltas||it.semanas; return !a || !a.length || a.includes(n); });
        const porJanela = {};
        for(const it of doDia){ const j = it.janela || "almoco"; porJanela[j] = (porJanela[j]||0) + minutos(it); }
        for(const [j, m] of Object.entries(porJanela)){
          const chave = `${letra}|${modo}|${j}|${r1(m)}`;
          if(m>60 && !vistos.has(chave)){ vistos.add(chave); erros.push(`treino ${letra} (${modo}, ${j}), ${uni} ${n}: ${r1(m)} min (máximo 60)`); }
        }
        const almoco = porJanela.almoco || 0;
        if(modo==="express" && almoco>alvoExpress+2 && !vistos.has(`${letra}|xa`)){ vistos.add(`${letra}|xa`); avisos.push(`express do treino ${letra}: ${r1(almoco)} min, acima do alvo de ${alvoExpress}`); }
        const R = (resumo[letra] ??= { completo:[0,99], express:[0,99] });
        R[modo] = [Math.max(R[modo][0], almoco), Math.min(R[modo][1], almoco)];
      }
    }
  }
  for(const fa of fases) for(const letra of letras){
    const t = f.fases[fa][letra];
    for(const it of t.itens.concat(t.express||[])){
      const a = it.voltas || it.semanas || [];
      const fora = a.filter(v=>v<1 || v>total);
      if(fora.length) erros.push(`${it.nome} (fase ${fa}, treino ${letra}): ${uni} ${fora.join(", ")} fora de 1–${total}`);
      const daFase = mapa[fa] || [];
      if(a.length && !a.some(v=>daFase.includes(v))) avisos.push(`${it.nome} (fase ${fa}, treino ${letra}) nunca aparece: as ${uni}s ${a.join(", ")} não são da fase ${fa}`);
    }
  }

  // cargas são salvas pelo nome: nomes que só existem em uma fase costumam ser erro de digitação
  if(fases.length>1){
    // itens com "voltas" alternam de propósito e podem faltar numa fase
    const nomes = fa => new Set(letras.flatMap(l=>f.fases[fa][l].itens.filter(it=>!(it.voltas||it.semanas||[]).length).map(it=>it.nome)));
    const todas = fases.map(nomes);
    const uniao = new Set(todas.flatMap(s=>[...s]));
    for(const n of uniao){ const em = fases.filter((fa,i)=>todas[i].has(n)); if(em.length<fases.length) avisos.push(`"${n}" só existe na fase ${em.join(", ")} (cargas são salvas pelo nome exato)`); }
  }
  return resumo;
}

/* ---------- Execução ---------- */
function principal(){
  const args = process.argv.slice(2);
  const opt = n => { const i=args.indexOf(n); return i>=0 ? args[i+1] : null; };
  const erros = [], avisos = [];
  const app = lerApp(ler("index.html"));

  let ficha = app.ficha;
  if(opt("--ficha")){
    try{ ficha = JSON.parse(fs.readFileSync(path.resolve(opt("--ficha")), "utf8")); }
    catch(e){ console.error(`✗ ${opt("--ficha")}: JSON inválido (${e.message})`); process.exit(1); }
  } else {
    for(const [nome, codigo] of [["index.html", app.codigo], ["sw.js", ler("sw.js")], ["apps-script/Code.gs", ler("apps-script/Code.gs")]]){
      try{ new vm.Script(codigo, { filename: nome }); } catch(e){ erros.push(`${nome}: erro de sintaxe: ${e.message}`); }
    }
    if(!/^\d+\.\d+$/.test(app.versao||"")) erros.push(`APP_VERSAO inválida: ${app.versao}`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(app.data||"")) erros.push(`APP_DATA inválida: ${app.data}`);
    const arq = `fichas/etapa-${String(ficha.etapa).padStart(2,"0")}.json`;
    if(fs.existsSync(path.join(RAIZ, arq)) && JSON.stringify(JSON.parse(ler(arq))) !== JSON.stringify(ficha))
      erros.push(`${arq} difere da FICHA_EMBUTIDA (use scripts/aplicar-ficha.mjs para manter os dois iguais)`);
  }

  const resumo = checarFicha(ficha, app.codigo, erros, avisos);

  const base = opt("--base");
  if(base && !/^0+$/.test(base) && !opt("--ficha")){
    let antigo = null;
    try{ antigo = lerApp(execFileSync("git", ["show", `${base}:index.html`], { cwd: RAIZ, encoding: "utf8", stdio: ["ignore","pipe","ignore"] })); }
    catch(e){ avisos.push(`não foi possível ler index.html em ${base}; comparação de versão ignorada`); }
    if(antigo){
      if(antigo.codigo !== app.codigo && antigo.versao === app.versao) erros.push(`index.html mudou, mas APP_VERSAO continua ${app.versao} (os aparelhos não verão o aviso de nova versão)`);
      const a = antigo.ficha, n = ficha;
      if(JSON.stringify(a) !== JSON.stringify(n)){
        if(n.etapa < a.etapa) erros.push(`etapa voltou de ${a.etapa} para ${n.etapa}`);
        else if(n.etapa === a.etapa && (n.versao||0) <= (a.versao||0)) erros.push(`a ficha da etapa ${n.etapa} mudou sem subir "versao" (continua ${n.versao||0}); os aparelhos manteriam a ficha antiga da planilha`);
      }
    }
  }

  if(resumo){
    console.log(`Ficha etapa ${ficha.etapa}${ficha.versao?` (rev. ${ficha.versao})`:""}${opt("--ficha")?"":` · app v${app.versao}`}`);
    for(const [l, R] of Object.entries(resumo)){
      const fx = ([max, min]) => min===max ? `${Math.round(max)} min` : `${Math.round(min)}–${Math.round(max)} min`;
      console.log(`  ${l}: completo ${fx(R.completo)}${R.express[1]<99?` · express ${fx(R.express)}`:""}`);
    }
  }
  for(const a of avisos) console.log(`! ${a}`);
  for(const e of erros) console.log(`✗ ${e}`);
  console.log(erros.length ? `\n${erros.length} erro(s).` : "\nTudo certo.");
  process.exit(erros.length ? 1 : 0);
}

if(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
