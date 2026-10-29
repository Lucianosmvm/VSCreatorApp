// Tema -> vídeo pelo servidor (/auto no serve.py): o Claude escreve o roteiro,
// ferramentas/narrar.py narra com a chave da ElevenLabs do .env e o Claude
// monta as cenas no Remotion. A página só pede, acompanha e abre o projeto.
let autoJob = null;
let autoTimer = null;
const autoEl = id => document.getElementById(id);
const AUTO_JOB_KEY = 'vscreator-auto-job';

function alternarEditor() {
  if (autoJob && autoJob.estado === 'rodando') return;
  const aberto = document.body.classList.toggle('editor-aberto');
  autoEl('editorToggle').textContent = aberto ? 'Voltar à criação' : 'Editar cenas';
  if (aberto) requestAnimationFrame(() => { ajustarAlturaCanvas(); medirLarguraCanvas(); aplicarVista(); });
}

function pedidoAutomatico() {
  return {pedido: autoEl('autoPedido').value.trim(),
    resolucao: document.querySelector('[name="autoFormato"]:checked').value,
    pausar: autoEl('autoPausar').checked};
}

function salvarPedidoAutomatico() {
  try { localStorage.setItem('vscreator-pedido', JSON.stringify(pedidoAutomatico())); } catch (_) {}
}

async function autoApi(caminho, corpo) {
  const r = await fetch('/auto' + caminho, corpo === undefined ? {cache: 'no-store'}
    : {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(corpo)});
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.detail || `HTTP ${r.status}`);
  return d;
}

const AUTO_ETAPAS = ['Escrevendo o roteiro', 'Narrando', 'Animando as cenas', 'Pronto'];

function pintarAutomatico(job) {
  autoJob = job;
  const rodando = job.estado === 'rodando', erro = job.estado === 'erro' || job.estado === 'cancelado';
  autoEl('autoAndamento').hidden = false;
  autoEl('autoAndamento').classList.toggle('com-erro', erro);
  autoEl('autoTitulo').textContent = erro ? (job.estado === 'cancelado' ? 'Cancelado' : 'Precisamos da sua atenção')
    : job.estado === 'revisar' ? 'Confira o roteiro' : job.estado === 'pronto' ? 'Vídeo pronto' : AUTO_ETAPAS[job.etapa] + '…';
  autoEl('autoContagem').textContent = `${Math.min(job.etapa + 1, 4)} / 4`;
  autoEl('autoMensagem').textContent = erro ? (job.detalhe || job.msg) : job.msg;
  document.querySelectorAll('.auto-etapas li').forEach((el, i) => {
    el.classList.toggle('concluida', i < job.etapa || job.estado === 'pronto');
    el.classList.toggle('ativa', i === job.etapa && job.estado !== 'pronto');
  });
  const lista = autoEl('autoRoteiro');
  lista.hidden = job.estado !== 'revisar' || !job.cenas;
  if (!lista.hidden) lista.innerHTML = job.cenas.map(t => `<li>${esc(t)}</li>`).join('');
  autoEl('autoContinuar').hidden = !(job.estado === 'revisar' || (erro && job.pid));
  autoEl('autoContinuar').textContent = job.estado === 'revisar' ? 'Narrar e animar' : 'Tentar de novo';
  autoEl('autoCancelar').hidden = !(rodando || job.estado === 'revisar');
  autoEl('autoCriar').disabled = rodando;
  autoEl('autoResultado').hidden = job.estado !== 'pronto';
  try { localStorage.setItem(AUTO_JOB_KEY, job.id); } catch (_) {}
  clearTimeout(autoTimer);
  if (rodando) autoTimer = setTimeout(acompanharAutomatico, 2000);
}

function esc(t) { return String(t).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]); }

async function acompanharAutomatico() {
  if (!autoJob) return;
  try { pintarAutomatico(await autoApi('/' + autoJob.id)); }
  catch (e) {
    // servidor reiniciado: o job sumiu da memória, o projeto continua no disco
    autoEl('autoMensagem').textContent = 'Perdi o acompanhamento (o app foi reiniciado?). ' + e.message;
    autoEl('autoCriar').disabled = false;
  }
}

// A chave sai do navegador para o .env do servidor uma única vez.
async function garantirChaveNoServidor(st) {
  if (st.chave) return;
  const k = elKey();
  if (!k) throw new Error('Cole a chave da ElevenLabs em Conexões: ela será guardada no servidor (.env).');
  await autoApi('/chave', {elevenlabs: k});
}

async function criarVideoAutomatico() {
  const {pedido, resolucao, pausar} = pedidoAutomatico();
  if (!pedido) { autoEl('autoPedido').focus(); return; }
  autoEl('autoCriar').disabled = true;
  autoEl('autoResultado').hidden = true;
  try {
    const st = await autoApi('');
    if (!st.claude) throw new Error('Claude Code não encontrado. Instale o "claude" e reabra o app.');
    if (!st.remotion) throw new Error('Remotion não instalado: rode cd remotion && npm install.');
    await garantirChaveNoServidor(st);
    pintarAutomatico(await autoApi('', {pedido, resolucao, pausar}));
  } catch (e) {
    autoEl('autoCriar').disabled = false;
    pintarAutomatico({id: autoJob?.id || '', estado: 'erro', etapa: 0, msg: '', detalhe: e.message});
  }
}

async function continuarAutomatico() {
  try { pintarAutomatico(await autoApi(`/${autoJob.id}/continuar`, {})); }
  catch (e) { autoEl('autoMensagem').textContent = e.message; }
}

async function cancelarAutomatico() {
  try { await autoApi(`/${autoJob.id}/cancelar`, {}); } catch (_) {}
  acompanharAutomatico();
}

// "💬 Ajuste pro Claude" sem sair do app: o mesmo /auto, no modo revisão.
async function revisarAutomatico() {
  if (!projAtivo()) return;
  await clSalvarRevisao();
  document.body.classList.remove('editor-aberto');
  try { pintarAutomatico(await autoApi('', {revisao: projetoAtual.id})); }
  catch (e) { setStatus('❌ ' + e.message); }
}

function abrirProjetoAutomatico() {
  if (autoJob?.pid) projAbrir(autoJob.pid);
}

(async () => {
  try {
    const salvo = JSON.parse(localStorage.getItem('vscreator-pedido') || 'null');
    if (salvo) {
      autoEl('autoPedido').value = salvo.pedido || '';
      const radio = [...document.querySelectorAll('[name="autoFormato"]')].find(el => el.value === salvo.resolucao);
      if (radio) radio.checked = true;
      if (salvo.pausar === false) autoEl('autoPausar').checked = false;
    }
  } catch (_) {}
  try {
    const st = await autoApi('');
    autoEl('autoNota').textContent = !st.claude ? 'Claude Code não encontrado neste computador.'
      : st.chave ? `Chave da ElevenLabs no servidor · montagem com ${st.modelo}.`
      : 'Na primeira criação, a chave da ElevenLabs de Conexões é guardada no servidor (.env).';
    const id = st.ativo?.id || localStorage.getItem(AUTO_JOB_KEY);
    if (st.ativo) pintarAutomatico(st.ativo);
    else if (id) {
      try { pintarAutomatico(await autoApi('/' + id)); }
      catch (_) { localStorage.removeItem(AUTO_JOB_KEY); }   // job de antes do app reiniciar
    }
  } catch (_) {
    autoEl('autoNota').textContent = 'Inicie o app pelo iniciar.bat para criar vídeos automaticamente.';
  }
})();
