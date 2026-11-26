/* Apoio ao comando /normalize (agente/normalizacao.md). Quem normaliza é o Claude, lendo as regras; este script só:
     node scripts/normalizacao.mjs rascunho <ficha.json | js/ficha-atual.js> <saida.json>
       gera um rascunho do contrato v1 com os leitores de texto do app (series.js, recursos.js). É só ponto de
       partida: cada exercício é revisado contra o texto original, corrigido e confirmado com o usuário.
     node scripts/normalizacao.mjs validar <normalizada.json> [--original <original.json>] [--relatorio <relatorio.md>]
       confere a ficha normalizada contra o catálogo (js/tecnicas.js) e escreve o de-para no relatório
       (substitui só a seção "De-para", entre os marcadores). Sai com código 1 se houver erro: não publique. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { seriesDe, tempoDe } from "../js/series.js";
import { recursosDe, contraste } from "../js/recursos.js";
import { TECNICAS, COMPONENTES, VERSAO_NORMALIZACAO, validarNormalizada } from "../js/tecnicas.js";

const [cmd, ...args] = process.argv.slice(2);
const sair = (msg, cod=1) => { console.error(msg); process.exit(cod); };

async function lerFicha(arq){
  if(arq.endsWith(".js")) return structuredClone((await import(pathToFileURL(path.resolve(arq)).href)).FICHA_EMBUTIDA);
  return JSON.parse(fs.readFileSync(arq, "utf8"));
}

/* ---------- rascunho ---------- */
const DA_CARGA = { unica:"cargas-unica", "pesado-leve":"cargas-pesado-leve", combinada:"cargas-combinada", sem:"sem-carga" };
function rascunhoItem(it){
  const p = String(it.prescricao||""), nome = String(it.nome||""), t = tempoDe(it), r = recursosDe(it), tecs = [];
  const revisar = [];
  if(t?.tipo==="aquecimento") tecs.push({ id:"aquecimento", minutos:Math.round(t.seg/60), atividade:t.rot, series_aproximacao:t.passos, exercicio_aproximacao:t.passoRot });
  else if(t?.tipo==="continuo") tecs.push({ id:"continuo", minutos:Math.round(t.seg/60), zona2:!!t.zona2 });
  else if(t?.tipo==="intervalo"){ const forte = t.a.tipo==="forte" ? t.a : t.b, leve = t.a.tipo==="forte" ? t.b : t.a;
    tecs.push({ id:"intervalado", rodadas:t.rodadas, forte_s:forte.seg, leve_s:leve.seg, desaquecer_s:t.desaquecer||0, rotulo:t.rotulo }); }
  else if(t?.tipo==="segurar") tecs.push({ id:"isometria", segundos:t.etapas[0].seg, por_lado:t.etapas.length>1 });
  else if(t?.tipo==="partes"){
    if(/rest.?pause/i.test(p)){ const pausa = t.partes.find(x=>x.pausa)?.pausa ?? 10; tecs.push({ id:"rest-pause", aplica:"todas", pausa_s:pausa, blocos:t.partes.filter(x=>!x.pausa).length }); }
    else { const blocos = []; for(const x of t.partes){ if(x.pausa && blocos.length){ blocos[blocos.length-1].pausa_s = x.pausa; if(x.rot) blocos[blocos.length-1].pausa_rot = x.rot; } else if(!x.pausa) blocos.push({ reps:x.rot }); }
      // pausa com nome ("20 s isometria") = isometria no meio da série; sem nome = micro-pausas
      tecs.push(blocos.some(b=>b.pausa_rot) ? { id:"isometria-no-meio", blocos } : { id:"micro-pausas", aplica:"todas", blocos }); }
  }
  if(it.series>0){
    const partes = nome.split(" + ").length;
    if(contraste(it)) tecs.push({ id:"contraste" });
    if(/pir[âa]mide/i.test(p)) tecs.push({ id:"piramide" });
    if(partes===2 || /bi-?set/i.test(nome+" "+p)) tecs.push({ id:"bi-set" }); else if(partes===3) tecs.push({ id:"tri-set" }); else if(partes>=4) tecs.push({ id:"circuito" });
    const ult = p.match(/(?:na\s+)?última(?: série)?[^;.]*?(até a falha|drop-?set|drop|rest-pause)/i);
    if(ult){ const k = /drop/i.test(ult[1]) ? "drop" : /rest/i.test(ult[1]) ? "rest-pause" : "ate-falha";
      if(!tecs.some(x=>x.id===k)) tecs.push(k==="rest-pause" ? { id:k, aplica:"ultima", pausa_s:10, blocos:3, assumido:["pausa_s","blocos"] } : { id:k, aplica:"ultima" }); }
    else if(/\bdrop\b/i.test(p) && !tecs.some(x=>x.id==="drop")) tecs.push({ id:"drop", aplica:"todas" });
    // drop: quedas ("drop duplo" ou "−10% … / −10% …") e redução ("−20%")
    for(const d of tecs.filter(x=>x.id==="drop")){ const pct=[...p.matchAll(/[−-]\s*(\d+)\s*%/g)].map(x=>+x[1]);
      d.quedas = /duplo/i.test(p) ? 2 : /triplo/i.test(p) ? 3 : Math.max(1, d.aplica==="ultima" ? 1 : pct.length || 1); if(pct.length) d.reducao_pct = pct[0]; }
    if(/até (a |o )?(próximo da )?falha/i.test(p) && !ult && !tecs.some(x=>["rest-pause","micro-pausas","drop"].includes(x.id))) tecs.push({ id:"ate-falha", aplica:"todas" });
    const cad = p.match(/(\d+\s*s\s+de\s+pausa[^,;.()]*|descida em \d+\s*s[^,;.()]*|\d+\s*s na descida[^,;.()]*)/i);
    if(cad) tecs.push({ id:"cadencia", aplica:"todas", descricao:cad[1].trim() });
  }
  const sd = it.series>0 ? seriesDe(it).map(s=>s.tag ? `${s.r} · ${s.tag}` : s.r) : undefined;   // "repetições · etiqueta"
  if(sd && sd.every(x=>x==="série")) revisar.push("séries não lidas da prescrição: escreva series_detalhe");
  revisar.push(...r.avisos.filter(a=>!/séries não foram lidas/.test(a)));
  const comps = new Set();
  for(const x of tecs) for(const c of TECNICAS[x.id].componentes[x.aplica ?? "todas"] || []) comps.add(c);
  if(it.series>0){ const tc = tecs.map(x=>TECNICAS[x.id].carga).find(Boolean); comps.add(r.cargas==="sem" ? "sem-carga" : tc || DA_CARGA[r.cargas] || "cargas-unica"); }
  const tipo = t?.tipo==="aquecimento" || /aquec/i.test(nome) && !(it.series>0) ? "aquecimento"
    : ["continuo","intervalo"].includes(t?.tipo) || (!(it.series>0) && /cardio|esteira|bike|corrida|caminhada|hiit/i.test(nome+" "+p)) ? "cardio"
    : it.series>0 ? (/abd[ôo]men|core|prancha/i.test(nome) ? "core" : "forca") : "mobilidade";
  const novo = { ...it, tipo };
  if(sd) novo.series_detalhe = sd;
  novo.tecnicas = tecs; novo.componentes = [...comps].sort();
  return { novo, revisar };
}

if(cmd==="rascunho"){
  const [ent, sai] = args; if(!ent || !sai) sair("uso: rascunho <ficha.json | js/ficha-atual.js> <saida.json>");
  const f = await lerFicha(ent), revisar = [];
  for(const [fase, ts] of Object.entries(f.fases)) for(const [letra, t] of Object.entries(ts)) for(const lista of ["itens","express"]) if(t[lista])
    t[lista] = t[lista].map(it => { const { novo, revisar:rv } = rascunhoItem(it); for(const x of rv) revisar.push(`${letra}${lista==="express"?" express":""} f${fase} · ${it.nome}: ${x}`); return novo; });
  f.normalizacao = { versao:VERSAO_NORMALIZACAO, data:new Date().toISOString().slice(0,10), rascunho:true };
  fs.mkdirSync(path.dirname(sai), { recursive:true }); fs.writeFileSync(sai, JSON.stringify(f, null, 1)+"\n");
  console.log(`rascunho salvo em ${sai} (remova "rascunho": true de normalizacao depois de revisar cada exercício)`);
  for(const x of [...new Set(revisar)]) console.log(`  revisar · ${x}`);
  process.exit(0);
}

/* ---------- validar ---------- */
if(cmd==="validar"){
  const arq = args[0]; if(!arq) sair("uso: validar <normalizada.json> [--relatorio <relatorio.md>]");
  const rel = args.includes("--relatorio") ? args[args.indexOf("--relatorio")+1] : null;
  const orig = args.includes("--original") ? await lerFicha(args[args.indexOf("--original")+1]) : null;
  const f = await lerFicha(arq), { erros, avisos, linhas } = validarNormalizada(f, orig);
  if(f.normalizacao?.rascunho) erros.push('ficha ainda marcada como rascunho (normalizacao.rascunho): revise cada exercício e remova a marca');
  const cel = s => String(s).replace(/\|/g, "\\|");
  const tabela = ["| Exercício | Onde | Tipo | Técnicas | Componentes | App hoje (texto) | Situação |", "|---|---|---|---|---|---|---|"]
    .concat(linhas.map(l => `| ${cel(l.nome)} | ${l.onde.join(", ")} | ${l.tipo} | ${l.tecnicas.join(", ") || (l.series>0 ? "séries normais" : "—")} | ${l.componentes.join(", ")} | ${l.app ? l.app.join(", ") || "—" : "?"} | ${
      l.erros.length ? "✖ " + cel(l.erros.join("; ")) : l.avisos.length ? "⚠ " + cel(l.avisos.join("; ")) : l.muda ? "✔ muda o comportamento" : "✔"} |`));
  const usados = {}; for(const l of linhas) for(const c of l.componentes) usados[c] = (usados[c]||0) + 1;
  const resumo = [`- Exercícios distintos: ${linhas.length} · ✔ ${linhas.filter(l=>!l.erros.length && !l.avisos.length).length} · ⚠ ${linhas.filter(l=>!l.erros.length && l.avisos.length).length} · ✖ ${linhas.filter(l=>l.erros.length).length}`,
    `- Mudam em relação ao app de hoje (leitura do texto): ${linhas.filter(l=>l.muda).length}`,
    `- Componentes usados: ${Object.entries(usados).map(([c,n])=>`${c} (${n})`).join(", ")}`,
    `- Resultado: ${erros.length ? `**não publicar** (${erros.length} erro(s))` : avisos.length ? `contrato ok depois de confirmar ${avisos.length} ponto(s)` : "contrato ok"}`];
  const secao = ["<!-- de-para:inicio (gerado por scripts/normalizacao.mjs validar; não edite à mão) -->", "## De-para exercício → componente", "", ...resumo, "", ...tabela, "",
    ...(erros.length ? ["### Erros (bloqueiam a publicação)", ...erros.map(e=>`- ${e}`), ""] : []),
    ...(avisos.length ? ["### Para confirmar", ...avisos.map(a=>`- ${a}`), ""] : []), "<!-- de-para:fim -->"].join("\n");
  if(rel){
    const antes = fs.existsSync(rel) ? fs.readFileSync(rel, "utf8") : "";
    const novo = /<!-- de-para:inicio[\s\S]*?<!-- de-para:fim -->/.test(antes) ? antes.replace(/<!-- de-para:inicio[\s\S]*?<!-- de-para:fim -->/, secao) : (antes ? antes.trimEnd()+"\n\n" : "") + secao + "\n";
    fs.writeFileSync(rel, novo); console.log(`de-para escrito em ${rel}`);
  }
  console.log(resumo.join("\n"));
  for(const e of erros) console.log(`✖ ${e}`);
  for(const a of avisos) console.log(`⚠ ${a}`);
  process.exit(erros.length ? 1 : 0);
}

if(cmd==="catalogo"){
  for(const [id, t] of Object.entries(TECNICAS)) console.log(`${id.padEnd(13)} ${t.nome} · aplica: ${t.aplica.join("/")} · parâmetros: ${Object.keys(t.params).join(", ") || "—"} · componentes: ${
    Object.entries(t.componentes).map(([a,c])=>`${a}→${c.join("+")}`).join(" ") || "—"}${t.carga ? ` · carga: ${t.carga}` : ""}`);
  for(const [id, c] of Object.entries(COMPONENTES)) console.log(`${c.existe ? "✔" : "✖"} ${id.padEnd(25)} ${c.nome}`);
  process.exit(0);
}
sair("uso: node scripts/normalizacao.mjs rascunho|validar|catalogo …");
