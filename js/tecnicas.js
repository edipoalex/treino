/* Catálogo de técnicas e componentes: o de-para da ficha normalizada (contrato v1, agente/normalizacao.md).
   A normalização (comando /normalize) lê a ficha como chegou e escreve, em cada exercício, o tipo, as técnicas
   (com parâmetros e a que séries se aplicam) e os componentes do app que ele usa. Este módulo diz quais técnicas
   e componentes existem, que parâmetros cada técnica aceita e quais componentes ela exige; validarNormalizada()
   confere a ficha contra ele. Técnica ou componente fora do catálogo = caso não previsto: entra aqui (e, se
   preciso, no app) antes de a ficha ser publicada. Módulo puro (sem DOM). */
import { validarFicha } from "./validacao.js";
import { recursosDe } from "./recursos.js";

export const VERSAO_NORMALIZACAO = 1;
export const TIPOS_ITEM = ["forca", "core", "cardio", "aquecimento", "mobilidade"];

/* Componentes do app. existe:false = ainda não implementado: a ficha que precisar dele não pode ser publicada. */
export const COMPONENTES = {
  "cargas-unica":            { existe:true,  nome:"Carga única por série", grupo:"carga" },
  "cargas-pesado-leve":      { existe:true,  nome:"Cargas separadas pesado / leve (contraste)", grupo:"carga" },
  "cargas-combinada":        { existe:true,  nome:"Uma carga por exercício do bi-set / tri-set / circuito", grupo:"carga" },
  "sem-carga":               { existe:true,  nome:"Sem campo de carga (peso do corpo, core)", grupo:"carga" },
  "cronometro-partes":       { existe:true,  nome:"Cronômetro de partes com pausas (rest-pause, micro-pausas) em todas as séries" },
  "cronometro-partes-ultima":{ existe:true,  nome:"Cronômetro de partes (rest-pause, micro-pausas) só na última série" },
  "cronometro-segurar":      { existe:true,  nome:"Cronômetro de isometria (prancha, por lado)" },
  "fases-intervalo":         { existe:true,  nome:"Tela de fases: intervalado / HIIT" },
  "fases-continuo":          { existe:true,  nome:"Tela de fases: cardio contínuo / zona 2" },
  "fases-aquecimento":       { existe:true,  nome:"Tela de fases: aquecimento + séries de aproximação" },
};

/* Parâmetros: tipo int | num | bool | texto | blocos (lista de { reps, pausa_s }); padrao = valor usado quando a ficha
   não diz (a normalização marca o parâmetro em "assumido" e pede confirmação). */
const P = (tipo, o={}) => ({ tipo, ...o });
export const TECNICAS = {
  "ate-falha":    { nome:"Até a falha", aplica:["todas","ultima"], params:{}, componentes:{} },
  "contraste":    { nome:"Contraste", aplica:["todas"], params:{}, carga:"cargas-pesado-leve", componentes:{} },
  "piramide":     { nome:"Pirâmide", aplica:["todas"], params:{}, componentes:{} },
  "drop":         { nome:"Drop-set", aplica:["todas","ultima"], params:{ quedas:P("int",{min:1,max:3,padrao:1}), reducao_pct:P("num",{min:5,max:60}) }, componentes:{} },
  "rest-pause":   { nome:"Rest-pause", aplica:["todas","ultima"], params:{ pausa_s:P("int",{min:5,max:60,padrao:10}), blocos:P("int",{min:2,max:6,padrao:3}) },
                    componentes:{ todas:["cronometro-partes"], ultima:["cronometro-partes-ultima"] } },
  "micro-pausas": { nome:"Micro-pausas", aplica:["todas","ultima"], params:{ blocos:P("blocos") }, componentes:{ todas:["cronometro-partes"], ultima:["cronometro-partes-ultima"] } },
  "isometria-no-meio": { nome:"Isometria no meio da série", aplica:["todas"], params:{ blocos:P("blocos") }, componentes:{ todas:["cronometro-partes"] } },
  "bi-set":       { nome:"Bi-set", aplica:["todas"], params:{}, carga:"cargas-combinada", componentes:{} },
  "tri-set":      { nome:"Tri-set", aplica:["todas"], params:{}, carga:"cargas-combinada", componentes:{} },
  "circuito":     { nome:"Circuito", aplica:["todas"], params:{}, carga:"cargas-combinada", componentes:{} },
  "isometria":    { nome:"Isometria", aplica:["todas"], params:{ segundos:P("int",{min:5,max:600}), por_lado:P("bool",{padrao:false}) }, componentes:{ todas:["cronometro-segurar"] } },
  "parciais":     { nome:"Parciais", aplica:["todas","ultima"], params:{ reps:P("texto"), descricao:P("texto") }, componentes:{} },
  "cadencia":     { nome:"Cadência / pausa no movimento", aplica:["todas","ultima"], params:{ descricao:P("texto") }, componentes:{} },
  "intervalado":  { nome:"Intervalado / HIIT", aplica:["todas"], params:{ rodadas:P("int",{min:1,max:50}), forte_s:P("int",{min:5,max:1800}), leve_s:P("int",{min:5,max:1800}),
                    desaquecer_s:P("int",{min:0,max:1800,padrao:0}), rotulo:P("texto",{padrao:"Intervalado"}) }, componentes:{ todas:["fases-intervalo"] } },
  "continuo":     { nome:"Cardio contínuo", aplica:["todas"], params:{ minutos:P("int",{min:1,max:180}), zona2:P("bool",{padrao:false}) }, componentes:{ todas:["fases-continuo"] } },
  "aquecimento":  { nome:"Aquecimento", aplica:["todas"], params:{ minutos:P("int",{min:1,max:60}), atividade:P("texto"), series_aproximacao:P("int",{min:0,max:5,padrao:0}),
                    exercicio_aproximacao:P("texto") }, componentes:{ todas:["fases-aquecimento"] } },
};

/* O que o app faz hoje com o item lendo só o texto (recursos.js), na mesma linguagem de componentes:
   serve para comparar a normalização com o comportamento atual (fase 1) e achar diferenças. */
const DO_CRONOMETRO = { partes:"cronometro-partes", "partes-ultima":"cronometro-partes-ultima", segurar:"cronometro-segurar", intervalo:"fases-intervalo", continuo:"fases-continuo", aquecimento:"fases-aquecimento" };
const DA_CARGA = { unica:"cargas-unica", "pesado-leve":"cargas-pesado-leve", combinada:"cargas-combinada", sem:"sem-carga" };
export function componentesDoApp(it){
  const r = recursosDe(it);
  return [DA_CARGA[r.cargas], DO_CRONOMETRO[r.cronometro]].filter(Boolean).sort();
}

const okParam = (d, v) => d.tipo==="int" ? Number.isInteger(v) && (d.min==null || v>=d.min) && (d.max==null || v<=d.max)
  : d.tipo==="num" ? typeof v==="number" && isFinite(v) && (d.min==null || v>=d.min) && (d.max==null || v<=d.max)
  : d.tipo==="bool" ? typeof v==="boolean"
  : d.tipo==="texto" ? typeof v==="string" && v.trim().length>0 && v.length<=200
  : d.tipo==="blocos" ? Array.isArray(v) && v.length>=2 && v.every(b => b && typeof b==="object" && typeof b.reps==="string" && b.reps.trim()
      && (b.pausa_s==null || (Number.isInteger(b.pausa_s) && b.pausa_s>=3 && b.pausa_s<=120))
      && (b.pausa_rot==null || (typeof b.pausa_rot==="string" && b.pausa_rot.trim() && b.pausa_s!=null)))
  : false;

/* Confere um exercício normalizado. Devolve { erros, avisos, componentes, esperados } (textos sem o nome do item). */
export function checarItem(it){
  const erros = [], avisos = [];
  if(!TIPOS_ITEM.includes(it.tipo)) erros.push(`tipo "${it.tipo ?? ""}" fora do contrato (${TIPOS_ITEM.join(", ")})`);
  if(it.series>0 && !(Array.isArray(it.series_detalhe) && it.series_detalhe.length===it.series))
    erros.push("series_detalhe precisa ter uma descrição por série");
  if(!Array.isArray(it.tecnicas)) erros.push("tecnicas precisa ser uma lista (vazia quando são séries normais)");
  if(!Array.isArray(it.componentes)) erros.push("componentes precisa ser uma lista");
  const tecs = Array.isArray(it.tecnicas) ? it.tecnicas : [], comps = Array.isArray(it.componentes) ? it.componentes : [];
  const esperados = new Set(); let cargaTec = null;
  for(const t of tecs){
    const def = TECNICAS[t?.id];
    if(!def){ erros.push(`técnica "${t?.id}" não está no catálogo (caso não previsto: incluir em js/tecnicas.js)`); continue; }
    const aplica = t.aplica ?? "todas";
    if(!def.aplica.includes(aplica)) erros.push(`${def.nome}: "aplica" = "${aplica}" não é aceito (${def.aplica.join(", ")})`);
    for(const k of Object.keys(t)) if(!["id","aplica","assumido"].includes(k) && !def.params[k]) erros.push(`${def.nome}: parâmetro "${k}" desconhecido`);
    for(const [k, d] of Object.entries(def.params)){
      if(t[k]===undefined){ if(d.padrao===undefined && !["reducao_pct","exercicio_aproximacao","descricao"].includes(k)) erros.push(`${def.nome}: falta o parâmetro "${k}"`); continue; }
      if(!okParam(d, t[k])) erros.push(`${def.nome}: parâmetro "${k}" inválido (${JSON.stringify(t[k])})`);
    }
    if(t.assumido!==undefined){
      if(!Array.isArray(t.assumido) || !t.assumido.every(k=>def.params[k])) erros.push(`${def.nome}: "assumido" deve listar parâmetros da técnica`);
      else if(t.assumido.length) avisos.push(`${def.nome}: ${t.assumido.map(k=>`${k} = ${JSON.stringify(t[k])}`).join(", ")} assumido(s) pelo padrão; confirme`);
    }
    for(const c of def.componentes[aplica] || []) esperados.add(c);
    if(def.carga){ if(cargaTec && cargaTec!==def.carga) erros.push(`técnicas pedem cargas diferentes (${cargaTec} e ${def.carga})`); cargaTec = def.carga; }
  }
  for(const c of comps){
    if(!COMPONENTES[c]){ erros.push(`componente "${c}" não existe no catálogo`); continue; }
    if(!COMPONENTES[c].existe) erros.push(`componente "${c}" (${COMPONENTES[c].nome}) ainda não existe no app: precisa ser criado antes de publicar`);
  }
  for(const c of esperados) if(!comps.includes(c)) erros.push(`falta o componente "${c}", exigido pela técnica`);
  const cargas = comps.filter(c => COMPONENTES[c]?.grupo==="carga");
  if(it.series>0 && cargas.length!==1) erros.push(`exercício com séries precisa de exatamente um componente de carga (tem ${cargas.length})`);
  if(!(it.series>0) && cargas.length) erros.push("item sem séries não leva componente de carga");
  // combinação de core sem carga (bi-set de abdômen + prancha) é válida
  if(cargaTec && cargas.length===1 && cargas[0]!==cargaTec && !(cargas[0]==="sem-carga" && cargaTec==="cargas-combinada")) erros.push(`a técnica pede "${cargaTec}", mas o componente de carga é "${cargas[0]}"`);
  if(cargas[0]==="sem-carga" && it.carga!==false && it.tipo!=="core") avisos.push(`sem-carga num exercício de ${it.tipo}: confira (use "carga": false na ficha para o app não pedir carga)`);
  for(const c of comps) if(COMPONENTES[c] && !COMPONENTES[c].grupo && !esperados.has(c)) erros.push(`componente "${c}" sem técnica que o justifique`);
  return { erros, avisos, componentes:[...comps].sort(), esperados:[...esperados].sort() };
}

/* Confere a ficha normalizada inteira. linhas = o de-para de cada exercício distinto (para o relatório).
   original (opcional) = a ficha como chegou, para comparar com o que o app faz hoje lendo o texto. */
export function validarNormalizada(f, original){
  const erros = [], avisos = [], linhas = [];
  const base = validarFicha(f); if(base) erros.push(`ficha: ${base}`);
  if(f?.normalizacao?.versao!==VERSAO_NORMALIZACAO) erros.push(`ficha: "normalizacao.versao" deve ser ${VERSAO_NORMALIZACAO}`);
  const vistos = new Map();
  for(const [fase, ts] of Object.entries(f?.fases || {})) for(const [letra, t] of Object.entries(ts || {}))
    for(const [lista, its] of [["itens", t?.itens || []], ["express", t?.express || []]]) its.forEach(it => {
      const k = JSON.stringify([it.nome, it.prescricao, it.series, it.tecnicas, it.componentes, it.tipo, it.series_detalhe]);
      const onde = `${letra}${lista==="express"?" express":""} f${fase}`;
      if(vistos.has(k)){ vistos.get(k).onde.push(onde); return; }
      // "app hoje" vem da ficha original (mesma posição): os campos normalizados mudam a leitura do texto
      const orig = original?.fases?.[fase]?.[letra]?.[lista]?.[its.indexOf(it)];
      const r = checarItem(it), app = orig ? componentesDoApp(orig) : null;
      const linha = { nome:it.nome, onde:[onde], tipo:it.tipo, series:it.series, tecnicas:(it.tecnicas||[]).map(t=>t.aplica==="ultima" ? `${t.id} (última)` : t.id),
        componentes:r.componentes, app, muda: !!app && JSON.stringify(app)!==JSON.stringify(r.componentes), erros:r.erros, avisos:r.avisos };
      vistos.set(k, linha); linhas.push(linha);
    });
  for(const l of linhas){ for(const e of l.erros) erros.push(`${l.nome} (${l.onde[0]}): ${e}`); for(const a of l.avisos) avisos.push(`${l.nome} (${l.onde[0]}): ${a}`); }
  return { erros, avisos, linhas };
}
