import { FICHA_EMBUTIDA } from "./ficha-atual.js";
import { toast } from "./ui.js";
import { RX, cmpFicha, limparSessao, num, pesoOk, unidOk, validarFicha } from "./validacao.js";

export let FICHA, LETRAS, E;
export const KEY = "treino-app-v1";
/* ---------- Estado persistido ---------- */
export const ESTADO_V = 2;
export function load(){
  try{ const raw = localStorage.getItem(KEY); if(raw) return JSON.parse(raw); }catch(e){}
  return {};
}
export function novaEtapa(){ return { inicio:"", faseModo:"auto", historico:[], cargas:{}, atual:null }; }
/* Completa e limpa o estado (do navegador ou de um backup importado). Versão em S.v. */
export function normalizarEstado(S){
  if(!S || typeof S!=="object") S={};
  if(!["auto","light","dark"].includes(S.theme)) S.theme="auto";
  if(!S.etapas || typeof S.etapas!=="object") S.etapas={};
  for(const st of Object.values(S.etapas)){
    st.historico = (Array.isArray(st.historico)?st.historico:[]).map(limparSessao).filter(Boolean);
    if(!st.cargas || typeof st.cargas!=="object") st.cargas={};
    for(const c of Object.values(st.cargas)){ c.v=String(c.v??""); c.u=unidOk(c.u); }
    if(!RX.data.test(st.inicio||"")) st.inicio="";
    if(!["auto","1","2"].includes(st.faseModo)) st.faseModo="auto";
    st.atual ??= null;
    if(st.atual){ st.atual.series ??= {}; st.atual.feitos ??= []; st.atual.marcas ??= {}; }
    // fechamento da etapa (fase 3): já mostrado uma vez / pessoa escolheu continuar treinando
    for(const k of ["fechoVisto","fechoDispensado"]) if(st[k]!==true) delete st[k];
  }
  S.peso = (Array.isArray(S.peso)?S.peso:[]).filter(pesoOk);
  S.idade = num(+S.idade) && +S.idade>0 ? +S.idade : "";
  S.meta = { kg: num(+S.meta?.kg) && +S.meta.kg>0 ? +S.meta.kg : "", data: RX.data.test(S.meta?.data||"") ? S.meta.data : "" };
  S.sync ??= { url:"", k:"", migrado:false, ultimo:0, erro:"" };
  if(!Array.isArray(S.fila) || !S.sync.url) S.fila = []; // sem planilha não há fila: a 1ª conexão envia tudo pelo migrar()
  if(S.fichaRemota && validarFicha(S.fichaRemota)) S.fichaRemota = null;
  if(S.timer && !(num(S.timer.fim) && num(S.timer.total) && num(S.timer.k))) delete S.timer;
  // cronômetro de execução, cronômetro livre e exercícios com "variar a carga por série"
  if(S.exec && !(num(S.exec.k) && num(S.exec.inicio) && Array.isArray(S.exec.etapas) && S.exec.etapas.every(e=>num(e?.seg)))) delete S.exec;
  if(S.livre && !(num(S.livre.k) && num(S.livre.acum ?? 0))) delete S.livre;
  if(!S.variar || typeof S.variar!=="object" || Array.isArray(S.variar)) S.variar = {};
  if(!RX.data.test(S.revisaoVista||"")) delete S.revisaoVista; // última revisão da semana vista (segunda-feira)
  S.pref = { modo: S.pref?.modo==="foco" ? "foco" : "lista", descanso: S.pref?.descanso==="tela" ? "tela" : "botao", animacoes: S.pref?.animacoes==="reduzidas" ? "reduzidas" : "completas" };
  S.v = ESTADO_V;
  return S;
}
export let S;
export function usarFicha(f){
  FICHA = f; LETRAS = Object.keys(f.fases["1"] || Object.values(f.fases)[0]);
  E = (S.etapas[f.etapa] ??= novaEtapa());
  document.title = `Treino · Etapa ${f.etapa}`;
}
export function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ toast("Não foi possível salvar neste navegador"); } }

export function iniciarEstado(){
  S = normalizarEstado(load());
  { const erro=validarFicha(FICHA_EMBUTIDA); if(erro) console.error("FICHA_EMBUTIDA inválida:", erro); }
  usarFicha(S.fichaRemota && cmpFicha(S.fichaRemota, FICHA_EMBUTIDA)>=0 ? S.fichaRemota : FICHA_EMBUTIDA);
}
