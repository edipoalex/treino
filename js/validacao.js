/* ---------- Validação (dados vindos da planilha ou de backup) ---------- */
import { sensacaoOk } from "./habito.js";
export const RX = { data:/^\d{4}-\d{2}-\d{2}$/, letra:/^[A-Z]$/, fase:/^\d{1,2}$/, hora:/^\d{1,2}[:h]\d{2}$/, id:/^[\w.-]{1,64}$/ };
export const UNIDS = ["kg","placas","livre"];
export const num = v => typeof v==="number" && isFinite(v);
export const txtOk = (v,max=2000) => typeof v==="string" && v.length<=max && !/[<>]/.test(v);
export const vazio = v => v===null || v===undefined || v==="";
/* Mesmas regras do Apps Script (apps-script/Code.gs). Devolve "" se a ficha é válida. */
export function validarFicha(f){
  if(!f || typeof f!=="object") return "ficha ausente";
  if(!Number.isInteger(f.etapa) || f.etapa<1) return "etapa inválida";
  if(![f.semanas, f.versao, f.express_alvo].every(v=>vazio(v)||num(v))) return "número inválido";
  if(!f.fases || typeof f.fases!=="object" || !Object.keys(f.fases).length) return "sem fases";
  const listaInt = a => vazio(a) || (Array.isArray(a) && a.every(Number.isInteger));
  for(const fase of Object.keys(f.fases)){
    if(!RX.fase.test(fase)) return `fase "${fase}" inválida`;
    const ts=f.fases[fase]; if(!ts || typeof ts!=="object" || !Object.keys(ts).length) return `fase ${fase} vazia`;
    for(const letra of Object.keys(ts)){
      if(!RX.letra.test(letra)) return `treino "${letra}" inválido`;
      const t=ts[letra];
      if(!t || !txtOk(t.foco,200) || !Array.isArray(t.itens) || !t.itens.length) return `treino ${letra} inválido`;
      if(!vazio(t.express) && !Array.isArray(t.express)) return `express do treino ${letra} inválido`;
      if(!vazio(t.express_nota) && !txtOk(t.express_nota)) return `express_nota do treino ${letra} inválida`;
      for(const it of t.itens.concat(t.express||[])){
        if(!it || !it.nome || !txtOk(it.nome,200) || !txtOk(it.prescricao) || !(vazio(it.obs)||txtOk(it.obs))) return `exercício inválido no treino ${letra}`;
        if(![it.series,it.exec,it.descanso,it.bloco].every(v=>num(v)&&v>=0)) return `números inválidos em ${it.nome}`;
        if(!listaInt(it.voltas) || !listaInt(it.semanas)) return `voltas inválidas em ${it.nome}`;
        if(!vazio(it.metodo) && !(txtOk(it.metodo,200) || (Array.isArray(it.metodo) && it.metodo.every(m=>txtOk(m,200))))) return `método inválido em ${it.nome}`;
        if(!vazio(it.carga) && typeof it.carga!=="boolean") return `campo carga inválido em ${it.nome}`;
        if(!vazio(it.janela) && !["almoco","manha","tarde"].includes(it.janela)) return `janela inválida em ${it.nome}`;
        if(!vazio(it.series_detalhe) && !(Array.isArray(it.series_detalhe) && it.series_detalhe.length===it.series && it.series_detalhe.every(x=>txtOk(x,200)))) return `series_detalhe inválido em ${it.nome} (uma descrição por série)`;
      }
    }
  }
  const pares = a => vazio(a) || (Array.isArray(a) && a.every(p=>Array.isArray(p) && p.every(x=>txtOk(x))));
  if(!pares(f.orientacoes) || !pares(f.metodos)) return "orientações ou métodos inválidos";
  if(!vazio(f.guia) && (typeof f.guia!=="object" || Array.isArray(f.guia) || !Object.entries(f.guia).every(([k,d])=>txtOk(k,200) && Array.isArray(d) && d.every(x=>txtOk(x))))) return "guia inválido";
  if(!vazio(f.express_dias) && !(Array.isArray(f.express_dias) && f.express_dias.every(d=>Number.isInteger(d) && d>=0 && d<=6))) return "express_dias inválido (0 = domingo … 6 = sábado)";
  if(!vazio(f.cardio_notas) && !(Array.isArray(f.cardio_notas) && f.cardio_notas.every(x=>txtOk(x)))) return "cardio_notas inválido";
  return /[<>]/.test(JSON.stringify(f)) ? "texto com < ou >" : "";
}
/* >0 se a ficha a é mais nova que b (etapa, depois revisão) */
export const cmpFicha = (a,b) => a.etapa!==b.etapa ? a.etapa-b.etapa : (a.versao||0)-(b.versao||0);
export function limparSessao(x){
  if(!x || typeof x!=="object") return null;
  if(!vazio(x.id) && !RX.id.test(String(x.id))) return null;
  if(!RX.letra.test(x.letra) || !RX.fase.test(String(x.fase)) || !RX.data.test(x.data)) return null;
  const s={...x, fase:String(x.fase)};
  for(const k of ["inicio","fim"]) if(!vazio(s[k]) && !RX.hora.test(String(s[k]))) delete s[k];
  for(const k of ["semana","duracao","volta","numero"]) if(!vazio(s[k]) && !num(s[k])) delete s[k];
  for(const k of ["feitos","total"]) if(!num(s[k])) s[k]=0;
  if(s.modo!=="completo" && s.modo!=="express") delete s.modo;
  if(!sensacaoOk(s.sen)) delete s.sen; // "como foi" (fase 3)
  if(!Array.isArray(s.itens)) delete s.itens; else s.itens=s.itens.filter(i=>i && typeof i.n==="string");
  return s;
}
export const pesoOk = p => p && RX.data.test(p.d) && num(p.kg);
export const unidOk = u => UNIDS.includes(u) ? u : "kg";
