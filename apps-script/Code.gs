/**
 * Treino – API da planilha "Treino – Dados" (v2)
 *
 * Cole em Extensões › Apps Script desta planilha e publique:
 *   Implantar › Gerenciar implantações › (lápis) na implantação existente › Versão: Nova versão › Implantar.
 * Editar a implantação existente mantém a mesma URL; os aparelhos não precisam trocar o endereço.
 *
 * A chave não fica mais no código: fica em Configurações do projeto › Propriedades do script (CHAVE).
 * Rode configurar() uma vez pelo editor para gravar o ID da planilha e gerar uma chave nova.
 * Rodar configurar() de novo troca a chave (os aparelhos precisam reconectar com a nova).
 * Sem segredos no código, este arquivo pode ficar versionado no GitHub.
 */

const API_VERSAO = 2;

const ABAS = {
  Sessoes:      { cab: ['id','etapa','letra','fase','semana','data','duracao_min','itens_feitos','itens_total','registrado_em','hora_inicio','hora_fim','itens_json','modo','volta','numero'], num: ['etapa','semana','duracao_min','itens_feitos','itens_total','volta','numero'] },
  Peso:         { cab: ['data','kg','registrado_em'], num: ['kg'] },
  Cargas:       { cab: ['etapa','exercicio','carga','data','registrado_em','unidade'], num: ['etapa'] },
  Config:       { cab: ['chave','valor','atualizado_em'], num: [] },
  Fichas:       { cab: ['etapa','ativa','semanas','frequencia','registrada_em','json'], num: ['etapa','semanas'] },
  Fichas_Itens: { cab: ['etapa','fase','semanas','treino','foco','ordem','exercicio','prescricao','series','descanso_s','minutos','obs'], num: ['etapa','ordem','series','descanso_s','minutos'] },
  Rejeitadas:   { cab: ['registrado_em','tipo','erro','op_json'], num: [] },
  Etapas:       { cab: ['etapa','fonte','semanas','treinos','divisao','descanso','falha','cardio','orientacoes'], num: ['etapa'] },
  Historico_Exercicios: { cab: ['etapa','fonte','fase','treino','foco','ordem','exercicio','exercicio_original','grupo','tipo','metodo','prescricao','series','voltas','obs'], num: ['etapa','ordem','series'] }
};
const PEDACO = 45000;        // limite seguro por célula (máx. 50.000)
const MAX_TXT = 2000;        // tamanho máximo de qualquer texto recebido
const MAX_FICHA = 300000;    // tamanho máximo do JSON da ficha
const UNIDADES = ['kg', 'placas', 'livre'];

/* ---------------- Configuração ---------------- */

function props() { return PropertiesService.getScriptProperties(); }

/** Rode pelo editor (botão Executar). Grava o ID da planilha, gera chave nova e prepara as abas. */
function configurar() {
  const p = props();
  p.setProperty('PLANILHA_ID', SpreadsheetApp.getActiveSpreadsheet().getId());
  const nova = Utilities.getUuid().replace(/-/g, '').slice(0, 24);
  p.setProperty('CHAVE', nova);
  Object.keys(ABAS).forEach(n => formatar(aba(n), ABAS[n]));
  Logger.log('Planilha pronta. Chave nova: ' + nova);
  Logger.log('No app: Ajustes › Desconectar este aparelho › cole a chave › Conectar.');
}

function chaveOk(k) {
  const c = props().getProperty('CHAVE');
  return !!c && typeof k === 'string' && k === c;
}

function planilha() {
  const id = props().getProperty('PLANILHA_ID');
  if (!id) throw new Error('Rode configurar() no editor antes de usar.');
  return SpreadsheetApp.openById(id);
}

/* ---------------- Entrada ---------------- */

// GET não devolve dados (a chave não deve ir na URL). Serve só para testar se a URL responde.
function doGet() {
  return saida({ ok: true, servico: 'treino', versao: API_VERSAO });
}

function doPost(e) {
  let corpo;
  try { corpo = JSON.parse(e && e.postData ? e.postData.contents : ''); } catch (err) { return saida({ ok: false, erro: 'json inválido' }); }
  if (!corpo || !chaveOk(corpo.k)) return saida({ ok: false, erro: 'chave inválida' });
  const ops = Array.isArray(corpo.ops) ? corpo.ops : [];

  const trava = LockService.getScriptLock();
  if (!trava.tryLock(20000)) return saida({ ok: false, erro: 'planilha ocupada, tente de novo' });
  try {
    // Cada operação é aplicada isoladamente: uma operação ruim é registrada na aba
    // Rejeitadas e descartada, em vez de travar a fila do aparelho para sempre.
    const rejeitadas = [];
    ops.forEach((op, i) => {
      let erro = validarOp(op);
      if (!erro) { try { aplicar(op); } catch (err) { erro = 'falha ao gravar: ' + (err && err.message || err); } }
      if (erro) rejeitadas.push({ i: i, tipo: op && op.tipo, erro: erro });
    });
    if (rejeitadas.length) registrarRejeitadas(ops, rejeitadas);
    SpreadsheetApp.flush();
    return saida({ ok: true, versao: API_VERSAO, estado: lerEstado(), rejeitadas: rejeitadas });
  } catch (err) {
    return saida({ ok: false, erro: 'falha no servidor: ' + (err && err.message || err) });
  } finally {
    trava.releaseLock();
  }
}

function saida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function agora() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'); }
function txt(v) { return v === null || v === undefined ? '' : String(v); }

/* ---------------- Validação ---------------- */

const RX = {
  data:  /^\d{4}-\d{2}-\d{2}$/,
  id:    /^[\w.-]{1,64}$/,
  letra: /^[A-Z]$/,
  fase:  /^\d{1,2}$/,
  hora:  /^(\d{1,2}[:h]\d{2})?$/,
  chave: /^[\w.]{1,64}$/
};
const vazio = v => v === null || v === undefined || v === '';
const numero = v => typeof v === 'number' && isFinite(v);
const inteiro = v => numero(v) && Math.floor(v) === v;
const numOpc = v => vazio(v) || numero(v);
const texto = (v, max) => typeof v === 'string' && v.length <= (max || MAX_TXT) && !/[<>]/.test(v);
const textoOpc = (v, max) => vazio(v) || texto(v, max);

function validarOp(op) {
  if (!op || typeof op !== 'object') return 'operação inválida';
  switch (op.tipo) {
    case 'addSessao':
      if (!RX.id.test(txt(op.id))) return 'id inválido';
      if (!inteiro(op.etapa)) return 'etapa inválida';
      if (!RX.letra.test(txt(op.letra))) return 'letra inválida';
      if (!RX.fase.test(txt(op.fase))) return 'fase inválida';
      if (!RX.data.test(txt(op.data))) return 'data inválida';
      if (![op.semana, op.duracao, op.feitos, op.total, op.volta, op.numero].every(numOpc)) return 'campo numérico inválido';
      if (!RX.hora.test(txt(op.inicio)) || !RX.hora.test(txt(op.fim))) return 'horário inválido';
      if (!vazio(op.modo) && op.modo !== 'completo' && op.modo !== 'express') return 'modo inválido';
      if (!vazio(op.itens)) {
        if (!Array.isArray(op.itens) || op.itens.length > 100) return 'itens inválidos';
        if (!op.itens.every(x => x && texto(x.n, 200) && numOpc(x.t) && numOpc(x.e) && numOpc(x.s) && numOpc(x.sp))) return 'item da sessão inválido';
      }
      return '';
    case 'delSessao':
      return RX.id.test(txt(op.id)) ? '' : 'id inválido';
    case 'setPeso':
      if (!RX.data.test(txt(op.data))) return 'data inválida';
      return numero(Number(op.kg)) && Number(op.kg) >= 20 && Number(op.kg) <= 400 ? '' : 'peso inválido';
    case 'delPeso':
      return RX.data.test(txt(op.data)) ? '' : 'data inválida';
    case 'setCarga':
      if (!inteiro(op.etapa)) return 'etapa inválida';
      if (!texto(op.nome, 200) || !op.nome) return 'exercício inválido';
      if (!vazio(op.kg) && !texto(txt(op.kg), 40)) return 'carga inválida';
      if (!vazio(op.u) && UNIDADES.indexOf(op.u) < 0) return 'unidade inválida';
      return RX.data.test(txt(op.data)) ? '' : 'data inválida';
    case 'setConfig':
      if (!RX.chave.test(txt(op.chave))) return 'chave de configuração inválida';
      return vazio(op.valor) || numero(op.valor) || texto(op.valor, 200) ? '' : 'valor inválido';
    case 'setFicha':
      return validarFicha(op.ficha);
    default:
      return 'tipo desconhecido';
  }
}

function validarFicha(f) {
  if (!f || typeof f !== 'object') return 'ficha ausente';
  if (JSON.stringify(f).length > MAX_FICHA) return 'ficha grande demais';
  if (!inteiro(f.etapa) || f.etapa < 1) return 'ficha: etapa inválida';
  if (!numOpc(f.semanas) || !numOpc(f.versao) || !numOpc(f.express_alvo)) return 'ficha: número inválido';
  if (!textoOpc(f.frequencia, 100)) return 'ficha: frequência inválida';
  if (!f.fases || typeof f.fases !== 'object' || !Object.keys(f.fases).length) return 'ficha: sem fases';
  const listaInt = a => vazio(a) || (Array.isArray(a) && a.every(inteiro));
  for (const fase of Object.keys(f.fases)) {
    if (!RX.fase.test(fase)) return 'ficha: fase "' + fase + '" inválida';
    const treinos = f.fases[fase];
    if (!treinos || typeof treinos !== 'object' || !Object.keys(treinos).length) return 'ficha: fase ' + fase + ' vazia';
    for (const letra of Object.keys(treinos)) {
      if (!RX.letra.test(letra)) return 'ficha: treino "' + letra + '" inválido (use uma letra A–Z)';
      const t = treinos[letra];
      if (!t || !texto(t.foco, 200)) return 'ficha: foco do treino ' + letra + ' inválido';
      if (!Array.isArray(t.itens) || !t.itens.length) return 'ficha: treino ' + letra + ' sem itens';
      if (!vazio(t.express) && !Array.isArray(t.express)) return 'ficha: express do treino ' + letra + ' inválido';
      for (const it of t.itens.concat(t.express || [])) {
        if (!it || typeof it.nome !== 'string' || !it.nome) return 'ficha: exercício sem nome no treino ' + letra;
        if (!texto(it.nome, 200)) return 'ficha: nome de exercício inválido no treino ' + letra;
        if (!texto(it.prescricao) || !textoOpc(it.obs)) return 'ficha: texto inválido em ' + it.nome;
        if (![it.series, it.exec, it.descanso, it.bloco].every(v => numero(v) && v >= 0)) return 'ficha: números inválidos em ' + it.nome;
        if (!listaInt(it.voltas) || !listaInt(it.semanas)) return 'ficha: voltas inválidas em ' + it.nome;
      }
    }
  }
  const pares = a => vazio(a) || (Array.isArray(a) && a.every(p => Array.isArray(p) && p.every(x => texto(x))));
  if (!pares(f.orientacoes) || !pares(f.metodos)) return 'ficha: orientações ou métodos inválidos';
  // nenhum texto em qualquer lugar da ficha pode conter < ou >
  let ruim = '';
  JSON.stringify(f, (k, v) => { if (typeof v === 'string' && /[<>]/.test(v)) ruim = v; return v; });
  return ruim ? 'ficha: texto com < ou > não é permitido' : '';
}

function registrarRejeitadas(ops, rejeitadas) {
  rejeitadas.forEach(r => {
    let json = '';
    try { json = JSON.stringify(ops[r.i]).slice(0, PEDACO); } catch (e) {}
    anexar('Rejeitadas', [agora(), txt(r.tipo), r.erro, json]);
  });
}

/* ---------------- Acesso às abas ---------------- */

const _abas = {}, _linhas = {};
function aba(nome) {
  if (_abas[nome]) return _abas[nome];
  const ss = planilha();
  let sh = ss.getSheetByName(nome);
  const def = ABAS[nome];
  if (!sh) sh = ss.insertSheet(nome);
  if (sh.getLastRow() === 0 || sh.getRange(1, 1, 1, def.cab.length).getValues()[0].join('|') !== def.cab.join('|')) {
    sh.getRange(1, 1, 1, def.cab.length).setValues([def.cab]).setFontWeight('bold');
    sh.setFrozenRows(1);
    formatar(sh, def);
  }
  return (_abas[nome] = sh);
}
// colunas de texto ficam como texto puro, para datas e ids não virarem número ou data
function formatar(sh, def) {
  def.cab.forEach((c, i) => {
    if (def.num.indexOf(c) < 0) sh.getRange(2, i + 1, Math.max(sh.getMaxRows() - 1, 1), 1).setNumberFormat('@');
  });
}

// Lê cada aba uma vez por requisição; escritas atualizam ou invalidam o cache.
function linhas(nome) {
  if (_linhas[nome]) return _linhas[nome];
  const sh = aba(nome), n = sh.getLastRow();
  const cab = ABAS[nome].cab;
  if (n < 2) return (_linhas[nome] = []);
  const larg = Math.max(sh.getLastColumn(), cab.length);
  return (_linhas[nome] = sh.getRange(2, 1, n - 1, larg).getValues().map((r, i) => {
    const o = { _linha: i + 2, _extra: r.slice(cab.length) };
    cab.forEach((c, j) => o[c] = r[j]);
    return o;
  }));
}
function sujar(nome) { delete _linhas[nome]; }

// Formatos por coluna: texto ('@') nas colunas de texto, para valores como "=..." nunca virarem fórmula.
function formatos(nome, n) {
  const def = ABAS[nome];
  return def.cab.slice(0, n).map(c => def.num.indexOf(c) < 0 ? '@' : '0.##');
}
function paraCelula(nome, valores) {
  const def = ABAS[nome];
  return valores.map((v, i) => def.num.indexOf(def.cab[i]) < 0 ? txt(v) : (vazio(v) ? '' : v));
}

function anexar(nome, valores) {
  const sh = aba(nome), r = sh.getLastRow() + 1;
  const linha = paraCelula(nome, valores);
  const rg = sh.getRange(r, 1, 1, linha.length);
  rg.setNumberFormats([formatos(nome, linha.length)]);
  rg.setValues([linha]);
  if (_linhas[nome]) {
    const o = { _linha: r, _extra: [] };
    ABAS[nome].cab.forEach((c, j) => o[c] = linha[j]);
    _linhas[nome].push(o);
  }
}

function apagar(nome, cond) {
  const sh = aba(nome);
  const alvo = linhas(nome).filter(cond).map(r => r._linha).sort((a, b) => b - a);
  alvo.forEach(l => sh.deleteRow(l));
  if (alvo.length) sujar(nome);
}
function ordenar(nome, col) {
  const sh = aba(nome), n = sh.getLastRow();
  if (n > 2) { sh.getRange(2, 1, n - 1, sh.getLastColumn()).sort(col); sujar(nome); }
}

/* ---------------- Operações ---------------- */

function aplicar(op) {
  const t = op.tipo;
  if (t === 'addSessao') {
    if (linhas('Sessoes').some(r => txt(r.id) === op.id)) return; // idempotente: reenvio não duplica
    anexar('Sessoes', [op.id, op.etapa, op.letra, op.fase, op.semana, op.data, op.duracao, op.feitos, op.total, agora(), op.inicio || '', op.fim || '', JSON.stringify(op.itens || []), op.modo || 'completo', op.volta || '', op.numero || '']);
  } else if (t === 'delSessao') {
    apagar('Sessoes', r => txt(r.id) === op.id);
  } else if (t === 'setPeso') {
    apagar('Peso', r => txt(r.data) === op.data);
    anexar('Peso', [op.data, Number(op.kg), agora()]);
    ordenar('Peso', 1);
  } else if (t === 'delPeso') {
    apagar('Peso', r => txt(r.data) === op.data);
  } else if (t === 'setCarga') {
    // Uma linha por exercício e data. Carga vazia fica gravada como "apagada nesta data",
    // para a carga de uma data anterior não voltar a aparecer no app.
    apagar('Cargas', r => Number(r.etapa) === Number(op.etapa) && txt(r.exercicio) === op.nome && txt(r.data) === op.data);
    anexar('Cargas', [op.etapa, op.nome, vazio(op.kg) ? '' : txt(op.kg), op.data, agora(), op.u || 'kg']);
  } else if (t === 'setConfig') {
    apagar('Config', r => txt(r.chave) === op.chave);
    anexar('Config', [op.chave, txt(op.valor), agora()]);
  } else if (t === 'setFicha') {
    salvarFicha(op.ficha, op.ativar !== false);
  }
}

function salvarFicha(f, ativar) {
  const sh = aba('Fichas');
  const json = JSON.stringify(f);
  const partes = [];
  for (let i = 0; i < json.length; i += PEDACO) partes.push(json.slice(i, i + PEDACO));
  apagar('Fichas', r => Number(r.etapa) === Number(f.etapa));
  if (ativar) { linhas('Fichas').forEach(r => sh.getRange(r._linha, 2).setValue('não')); sujar('Fichas'); }
  const linha = [f.etapa, ativar ? 'sim' : 'não', f.semanas, txt(f.frequencia), agora()].concat(partes);
  sh.getRange(sh.getLastRow() + 1, 1, 1, linha.length).setNumberFormat('@').setValues([linha.map(String)]);
  sujar('Fichas');
  ordenar('Fichas', 1);

  // visão legível dos exercícios
  apagar('Fichas_Itens', r => Number(r.etapa) === Number(f.etapa));
  const it = aba('Fichas_Itens'), rows = [];
  Object.keys(f.fases).forEach(fase => {
    const sem = ((f.fases_semanas || {})[fase] || []).join(', ');
    Object.keys(f.fases[fase]).forEach(letra => {
      const tr = f.fases[fase][letra];
      tr.itens.forEach((x, i) => {
        const min = Math.round((x.series * (x.exec + x.descanso) / 60 + x.bloco) * 10) / 10;
        rows.push(paraCelula('Fichas_Itens', [f.etapa, fase, sem, letra, tr.foco, i + 1, x.nome, x.prescricao, x.series, x.descanso, min, x.obs || '']));
      });
    });
  });
  if (rows.length) {
    const rg = it.getRange(it.getLastRow() + 1, 1, rows.length, rows[0].length);
    rg.setNumberFormats(rows.map(() => formatos('Fichas_Itens', rows[0].length)));
    rg.setValues(rows);
    sujar('Fichas_Itens');
  }
  catalogar(f);
}

/* ---------------- Catálogo de fichas ----------------
   Abas Etapas e Historico_Exercicios: histórico estruturado de todas as etapas. As etapas dos PDFs
   foram importadas uma vez; as do app são gravadas aqui sempre que uma ficha é publicada.
   O agente do projeto usa essas abas como fonte de verdade para planejar as próximas etapas. */
const FONTE_APP = 'App (agente)';
const semAcento = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// primeira regra que casar com o nome do exercício (minúsculas, sem acento)
const GRUPOS = [
  [/aquecimento/, 'Aquecimento'],
  [/cardio|esteira|bike|bicicleta|eliptico|hiit|zona 2|caminhada/, 'Cardio'],
  [/abdom|prancha|roda abdominal|pallof|elevacao de pernas|\bcore\b/, 'Abdômen'],
  [/panturrilha/, 'Panturrilha'],
  [/encolhimento/, 'Trapézio'],
  [/crucifixo inv|voador invertido|posterior de ombro|face pull|voador dorsal.*(ombro|testa)/, 'Ombro (posterior)'],
  [/triceps|paralelas|mergulho|supino fechado|frances|testa/, 'Tríceps'],
  [/rosca|biceps/, 'Bíceps'],
  [/voador dorsal/, 'Costas'],
  [/supino|voador|crucifixo|cross ?over|peitoral|peito|flexao de bracos/, 'Peito'],
  [/desenvolvimento|elevacao lateral|elevacao frontal|^lateral|^frontal|remada alta|remada em pe/, 'Ombro'],
  [/puxada|remada|serrote|barra fixa|pullover|pulldown|voador dorsal/, 'Costas'],
  [/stiff|flexora|terra/, 'Posterior de coxa'],
  [/abdutora|gluteo|elevacao pelvica/, 'Glúteo'],
  [/agachamento|leg|hack|extensora|afundo|bulgaro|passada/, 'Quadríceps']
];
function grupoDe(nome) {
  const grupos = [];
  String(nome).split(' + ').forEach(parte => {
    const n = semAcento(parte), r = GRUPOS.filter(g => g[0].test(n))[0];
    const g = r ? r[1] : 'Outro';
    if (grupos.indexOf(g) < 0) grupos.push(g);
  });
  return grupos.join(' + ');
}
const COMPOSTOS = /supino|puxada|remada|desenvolvimento|agachamento|leg|hack|stiff|terra|afundo|bulgaro|paralelas|barra fixa|serrote|mergulho|flexao de bracos/;
function tipoDe(it) {
  if (!it.series) return /aquecimento/.test(semAcento(it.nome)) ? 'aquecimento' : 'cardio';
  if (String(it.nome).indexOf(' + ') >= 0) return 'combinado';
  return COMPOSTOS.test(semAcento(it.nome)) ? 'composto' : 'isolado';
}
const METODOS = [
  [/contraste/, 'Contraste de cargas'], [/rest-pause/, 'Rest-pause'], [/micro-pausa/, 'Micro-pausas'],
  [/bi-set/, 'Bi-set'], [/tri-set/, 'Tri-set'], [/drop (duplo|-\d+%.*drop)/, 'Drop-set duplo'], [/drop/, 'Drop-set'],
  [/piramide/, 'Pirâmide'], [/cluster/, 'Cluster'], [/myo/, 'Myo-reps'], [/\+ ?\dx\d|faixa/, 'Séries por faixa'], [/falha/, 'Até a falha']
];
function metodoDe(it) {
  if (it.metodo) return [].concat(it.metodo).join(' + ');
  if (!it.series) return /aquecimento/.test(semAcento(it.nome)) ? 'Aquecimento' : 'Cardio';
  const p = semAcento(it.prescricao), m = METODOS.filter(x => x[0].test(p))[0];
  return m ? m[1] : 'Séries retas';
}

function linhasCatalogo(f) {
  const rows = [];
  Object.keys(f.fases).forEach(fase => {
    Object.keys(f.fases[fase]).forEach(letra => {
      const t = f.fases[fase][letra];
      // nome do catálogo sem o símbolo de grau ("Supino 30°" = "Supino 30"), como nas etapas dos PDFs
      t.itens.forEach((it, i) => rows.push([f.etapa, FONTE_APP, fase, letra, t.foco, i + 1, String(it.nome).replace(/(\d+)\s*[º°]/g, '$1'), it.nome, grupoDe(it.nome),
        tipoDe(it), metodoDe(it), it.prescricao, it.series, (it.voltas || it.semanas || []).join(', '), it.obs || '']));
    });
  });
  return rows;
}
function linhaEtapa(f) {
  const fase1 = f.fases['1'] || f.fases[Object.keys(f.fases)[0]];
  const letras = Object.keys(fase1);
  const conta = {};
  letras.forEach(l => fase1[l].itens.forEach(it => { if (it.series) conta[it.descanso] = (conta[it.descanso] || 0) + it.series; }));
  const descanso = Object.keys(conta).sort((a, b) => conta[b] - conta[a])[0];
  const orient = f.orientacoes || [];
  const achar = re => orient.filter(o => re.test(semAcento(o[0]))).map(o => o[1]).join(' ');
  const p = f.progressao;
  const semanas = p ? p.voltas + ' voltas de ' + p.treinos_por_volta + ' treinos (limite de ' + p.limite_semanas + ' semanas)' : String(f.semanas || '');
  const corta = s => String(s).slice(0, MAX_TXT);
  return [f.etapa, FONTE_APP, semanas, String(letras.length), letras.map(l => l + ' ' + fase1[l].foco).join(' | '),
    descanso ? descanso + ' s' : '', achar(/falha/), achar(/cardio/), orient.map(o => o[0] + ': ' + o[1]).join(' ')].map((v, i) => i ? corta(v) : v);
}
function catalogar(f) {
  apagar('Historico_Exercicios', r => Number(r.etapa) === Number(f.etapa) && txt(r.fonte) === FONTE_APP);
  const rows = linhasCatalogo(f).map(r => paraCelula('Historico_Exercicios', r));
  if (rows.length) {
    const sh = aba('Historico_Exercicios');
    const rg = sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length);
    rg.setNumberFormats(rows.map(() => formatos('Historico_Exercicios', rows[0].length)));
    rg.setValues(rows);
    sujar('Historico_Exercicios');
  }
  apagar('Etapas', r => Number(r.etapa) === Number(f.etapa) && txt(r.fonte) === FONTE_APP);
  anexar('Etapas', linhaEtapa(f));
  ordenar('Etapas', 1);
}

/* ---------------- Leitura ---------------- */

function lerEstado() {
  const sessoes = linhas('Sessoes').map(r => ({
    id: txt(r.id), etapa: Number(r.etapa), letra: txt(r.letra), fase: txt(r.fase), semana: Number(r.semana),
    data: txt(r.data), duracao: Number(r.duracao_min) || 0, feitos: Number(r.itens_feitos) || 0, total: Number(r.itens_total) || 0,
    inicio: txt(r.hora_inicio), fim: txt(r.hora_fim), modo: txt(r.modo) || 'completo', volta: Number(r.volta) || null, numero: Number(r.numero) || null,
    itens: (function () { try { return JSON.parse(txt(r.itens_json) || '[]'); } catch (e) { return []; } })()
  }));
  const peso = linhas('Peso').map(r => ({ d: txt(r.data), kg: Number(r.kg) })).filter(p => p.d && p.kg);
  // carga mais recente por exercício; se a mais recente estiver vazia, o exercício fica sem carga
  const ult = {};
  linhas('Cargas').forEach(r => {
    const k = r.etapa + '|' + r.exercicio;
    if (!ult[k] || txt(r.data) >= ult[k].data) ult[k] = { etapa: Number(r.etapa), nome: txt(r.exercicio), kg: txt(r.carga), u: txt(r.unidade) || 'kg', data: txt(r.data) };
  });
  const cargas = Object.keys(ult).map(k => ult[k]).filter(c => c.kg !== '');
  const config = {};
  linhas('Config').forEach(r => config[txt(r.chave)] = txt(r.valor));
  const fichas = linhas('Fichas');
  const ativa = fichas.filter(r => txt(r.ativa) === 'sim').pop() || fichas[fichas.length - 1];
  let ficha = null;
  if (ativa) { try { ficha = JSON.parse([txt(ativa.json)].concat(ativa._extra.map(txt)).join('')); } catch (e) {} }
  return { sessoes: sessoes, peso: peso, cargas: cargas, config: config, ficha: ficha, etapas: fichas.map(r => Number(r.etapa)) };
}
