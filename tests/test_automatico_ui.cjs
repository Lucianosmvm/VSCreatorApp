const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const script = fs.readFileSync(path.join(__dirname, '../automatico.js'), 'utf8').split('(async () => {')[0];

function ambiente(disponivel = true) {
  const nodes = new Map();
  const el = id => {
    if (!nodes.has(id)) nodes.set(id, {disabled: false, value: '', textContent: '', hidden: false,
      style: {}, classList: {remove() {}, toggle() {}}});
    return nodes.get(id);
  };
  const ctx = vm.createContext({
    document: {getElementById: el, body: {classList: {remove() {}}}, querySelectorAll: () => [], querySelector: () => null},
    projetoAtual: {id: 'teste'}, projAtivo: () => true, rendering: false,
    frames: [{text: 'Oi', audioBuffer: {}}], narrationOf: f => f.text,
    cenasComNarracaoVelha: () => [],
    clCarregar: async () => disponivel === null ? null : {animacaoDisponivel: disponivel},
    requests: [], uploads: 0, mensagens: [],
    setStatus: text => ctx.mensagens.push(text),
  });
  vm.runInContext(script, ctx);
  vm.runInContext(`
    autoApi = async (path, body) => {
      requests.push({path, body});
      return body ? {id:'auto-123456', tipo:'animacao', pid:'teste', estado:'rodando', etapa:2}
        : {claude:true, remotion:true, chave:false};
    };
    enviarParaClaude = async () => { uploads++; return true; };
    garantirChaveNoServidor = async () => { throw new Error('Não deve pedir chave'); };
    pintarAutomatico = job => { autoJob = job; };
  `, ctx);
  return {ctx, el, iniciar: () => vm.runInContext('refazerAnimacaoAutomatico()', ctx)};
}

test('usa timeline do servidor sem upload nem chave da ElevenLabs', async () => {
  const a = ambiente();
  a.el('animacaoOrientacao').value = ' Mais comparações ';
  await a.iniciar();
  assert.equal(a.ctx.uploads, 0);
  assert.equal(a.ctx.requests.length, 2);
  assert.equal(a.ctx.requests[1].body.animacao, 'teste');
  assert.equal(a.ctx.requests[1].body.orientacao, 'Mais comparações');
  assert.equal(a.el('refazerAnimacaoBtn').disabled, true);
});

test('prepara áudio existente no navegador quando ainda não há timeline', async () => {
  const a = ambiente(false);
  await a.iniciar();
  assert.equal(a.ctx.uploads, 1);
  assert.equal(a.ctx.requests[1].body.animacao, 'teste');
});

test('falha na consulta não reenvia nem substitui a narração salva', async () => {
  const a = ambiente(null);
  await a.iniciar();
  assert.equal(a.ctx.uploads, 0);
  assert.equal(a.ctx.requests.length, 1);
  assert.equal(a.el('refazerAnimacaoBtn').disabled, false);
});

test('upload malsucedido não inicia montagem', async () => {
  const a = ambiente(false);
  vm.runInContext('enviarParaClaude = async () => false;', a.ctx);
  await a.iniciar();
  assert.equal(a.ctx.requests.length, 1);
  assert.equal(a.el('refazerAnimacaoBtn').disabled, false);
});

test('áudio faltando não chama geração de voz nem inicia montagem', async () => {
  const a = ambiente(false);
  a.ctx.frames[0].audioBuffer = null;
  await a.iniciar();
  assert.equal(a.ctx.uploads, 0);
  assert.equal(a.ctx.requests.length, 1);
  assert.match(a.ctx.mensagens.at(-1), /narração disponível/);
});

test('scripts embutidos do editor continuam com sintaxe válida', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
});
