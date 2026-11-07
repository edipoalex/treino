#!/usr/bin/env node
/* Testes do Apps Script (apps-script/Code.gs) contra uma planilha simulada em memória.
   Uso: node scripts/testar-planilha.mjs   (sai com código 1 se algum teste falhar) */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { RAIZ } from "./validar.mjs";

const codigo = fs.readFileSync(path.join(RAIZ, "apps-script/Code.gs"), "utf8");
const ficha = JSON.parse(fs.readFileSync(path.join(RAIZ, "fichas/etapa-19.json"), "utf8"));

/* ---------- Planilha simulada ---------- */
class Aba {
  constructor(linhas){ this.rows = linhas || []; }
  getLastRow(){ return this.rows.length; }
  getLastColumn(){ return Math.max(0, ...this.rows.map(r=>r.length)); }
  getMaxRows(){ return 1000; }
  setFrozenRows(){}
  deleteRow(l){ this.rows.splice(l-1, 1); }
  getRange(r, c, nr=1, nc=1){
    const sh = this;
    return {
      setValues(v){ v.forEach((row,i)=>{ const R=(sh.rows[r-1+i] ||= []); row.forEach((x,j)=>R[c-1+j]=x); }); return this; },
      getValues(){ return Array.from({length:nr},(_,i)=>Array.from({length:nc},(_,j)=>{ const v=(sh.rows[r-1+i]||[])[c-1+j]; return v===undefined?"":v; })); },
      setValue(v){ (sh.rows[r-1] ||= [])[c-1]=v; return this; },
      setNumberFormat(){ return this; }, setNumberFormats(){ return this; }, setFontWeight(){ return this; },
      sort(col){ const p=sh.rows.slice(r-1,r-1+nr).sort((a,b)=>String(a[col-1])<String(b[col-1])?-1:1); sh.rows.splice(r-1,nr,...p); }
    };
  }
}
function novaPlanilha(abas = {}){
  const props = {};
  const ss = { getSheetByName: n=>abas[n], insertSheet: n=>(abas[n]=new Aba()), getId: ()=>"ID" };
  const base = {
    SpreadsheetApp: { openById: ()=>ss, getActiveSpreadsheet: ()=>ss, flush(){} },
    PropertiesService: { getScriptProperties: ()=>({ getProperty: k=>props[k] ?? null, setProperty: (k,v)=>{ props[k]=v; } }) },
    LockService: { getScriptLock: ()=>({ tryLock: ()=>true, releaseLock(){} }) },
    Utilities: { getUuid: ()=>"aaaa-bbbb-cccc-dddd-eeee-ffff", formatDate: ()=>"2026-11-07 10:00:00" },
    Session: { getScriptTimeZone: ()=>"America/Sao_Paulo" }, Logger: { log(){} },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: t=>({ setMimeType(){ return JSON.parse(t); } }) }
  };
  // contexto novo a cada chamada, como no Apps Script (variáveis globais zeradas por requisição)
  const rodar = src => vm.runInContext(codigo + "\n" + src, vm.createContext({ ...base }));
  rodar("configurar()");
  const post = (ops, k = props.CHAVE) => rodar(`doPost(${JSON.stringify({ postData: { contents: JSON.stringify({ k, ops }) } })})`);
  return { abas, props, rodar, post };
}

/* ---------- Testes ---------- */
let falhas = 0;
const ok = (nome, cond) => { console.log(`${cond ? "✓" : "✗"} ${nome}`); if(!cond) falhas++; };
const copia = o => JSON.parse(JSON.stringify(o));

{ // básico
  const p = novaPlanilha();
  ok("configurar() gera a chave", !!p.props.CHAVE && p.props.PLANILHA_ID === "ID");
  ok("chave errada é recusada", p.post([], "errada").erro === "chave inválida");
  ok("doGet não expõe dados", !("estado" in p.rodar("doGet()")));
  const sessao = { tipo:"addSessao", etapa:19, id:"mh2abc12x9z", letra:"A", fase:"1", semana:1, data:"2026-11-03", duracao:62, feitos:7, total:8, inicio:"07:10", fim:"08:12", itens:[{n:"Supino reto com barra",t:600,e:675,s:5,sp:5}], modo:"completo", volta:1, numero:1 };
  let r = p.post([{ tipo:"setFicha", ficha, ativar:true }, sessao, sessao, { tipo:"addSessao", etapa:18, id:"2026-09-01-B-3", letra:"B", fase:"2", semana:4, data:"2026-09-01", duracao:55, feitos:8, total:8 }]);
  ok("lote válido sem rejeitadas", r.ok && r.rejeitadas.length === 0);
  ok("sessão repetida não duplica", r.estado.sessoes.length === 2);
  ok("ficha volta idêntica", JSON.stringify(r.estado.ficha) === JSON.stringify(ficha));
  r = p.post([{ tipo:"setCarga", etapa:19, nome:"Supino", kg:"80", u:"kg", data:"2026-11-01" }, { tipo:"setCarga", etapa:19, nome:"Supino", kg:null, u:"kg", data:"2026-11-05" }]);
  ok("apagar carga não faz a anterior voltar", !r.estado.cargas.some(c=>c.nome==="Supino"));
  const xss = copia(ficha); xss.fases["1"].A.itens[1].nome = "<img src=x onerror=alert(1)>";
  const letra = copia(ficha); letra.fases["1"]["<b>"] = letra.fases["1"].A;
  r = p.post([{ tipo:"setFicha", ficha:xss }, { tipo:"setFicha", ficha:letra }, { tipo:"addSessao", id:"x", etapa:19, letra:"<i>", fase:"1", data:"2026-11-06" }, { tipo:"xyz" }, null, { tipo:"delSessao", id:"mh2abc12x9z" }]);
  ok("operações inválidas recusadas, válidas aplicadas", r.ok && r.rejeitadas.length === 5 && r.estado.sessoes.length === 1);
  ok("recusadas registradas na aba Rejeitadas", p.abas.Rejeitadas.rows.length - 1 === 5);
  ok("ficha maliciosa não substitui a válida", !JSON.stringify(r.estado.ficha).includes("<"));
}

console.log(falhas ? `\n${falhas} teste(s) falharam.` : "\nTodos os testes passaram.");
process.exit(falhas ? 1 : 0);
