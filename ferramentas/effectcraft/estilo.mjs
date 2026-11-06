// Kit visual "TI Ninja" para EffectCraft (ver docs/estilo-ti-ninja.md).
// Cada cena vira uma composição; `novaCena` devolve um construtor que junta
// comandos num único `batch` (uma ida ao MCP por cena) e lista efeitos sonoros.

export const COR = {
  fundo: '#0d1210', painel: '#151c18', painel2: '#1b241f', borda: '#2a3a30',
  verde: '#7cff4f', vermelho: '#ff4d5e', laranja: '#ff8a3d', amarelo: '#ffd23f',
  azul: '#4da3ff', roxo: '#8b5cf6', texto: '#f2ead8', apagado: '#7d8c80', marca: '#18211c',
  piso: '#2f7f86', grade: '#3f9aa2', palco: '#1c2023', gradePalco: '#2a3036',
};
export const CAMADAS = [COR.roxo, COR.laranja, COR.azul, COR.verde];
const TIT = {font: 'Segoe UI', style: 'Black'};
const MONO = {font: 'JetBrains Mono', style: 'Bold'};
const TIPO_COR = {...COR, ok: COR.verde, erro: COR.vermelho, alerta: COR.amarelo, info: COR.azul};
const TIPO_ICONE = {ok: '✓ ', erro: '✗ ', alerta: '! ', info: '● '};

const sem = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9#%]/g, '');
export const tela = s => String(s ?? '').replace(/C sharp/g, 'C#');

export function novaCena({W, H, cena, plano, indice, total}) {
  const dur = cena.dur, vertical = H > W, u = Math.min(W, H) / 1080; // unidade: 1 em 1080p
  const steps = [], ease = [], sons = [];
  let n = 0;
  const nome = p => `${p}-${++n}`;
  const cmd = (command, params) => steps.push({command, params});
  const prop = (layer, path, value) => cmd('prop.set', {layer, path, value});
  const keys = (layer, path, pts, suave = true) => {
    for (const [time, value] of pts) {
      const t = Math.max(0, Math.min(dur - 1 / 30, time));
      cmd('prop.addKey', {layer, path, time: t, value});
      if (suave) ease.push({layer, path, time: t});
    }
  };
  // tempo (s, dentro da cena) em que a palavra começa; aceita número
  const em = (q, padrao = 0) => {
    if (typeof q === 'number') return q;
    if (!q) return padrao;
    const alvo = sem(q.split(' ')[0]);
    const p = cena.palavras.find(w => sem(w.w).startsWith(alvo));
    return p ? p.t : padrao;
  };
  const som = (t, tipo) => sons.push({t, tipo});

  // ---------- primitivas 2D ----------
  function aparece(l, x, y, t, dy = 24 * u) {
    keys(l, 'transform/position', [[t, [x, y + dy]], [t + .4, [x, y]]]);
    keys(l, 'transform/opacity', [[0, 0], [t, 0], [t + .25, 100]]);
  }
  function some(l, t) { keys(l, 'transform/opacity', [[t, 100], [t + .25, 0]]); }
  function retangulo(x, y, w, h, fill, {borda, larg = 2, t = null, op = 100, nomeP = 'ret', arredondado = true} = {}) {
    const l = nome(nomeP);
    cmd('layer.newShape', {name: l, kind: arredondado ? 'rounded' : 'rect', position: [x, y], size: [w, h], fill, ...(borda ? {stroke: borda, strokeWidth: larg} : {})});
    if (op !== 100) prop(l, 'transform/opacity', op);
    if (t !== null) aparece(l, x, y, t);
    return l;
  }
  function elipse(x, y, w, h, fill, {t = null, nomeP = 'eli', borda, larg = 3} = {}) {
    const l = nome(nomeP);
    cmd('layer.newShape', {name: l, kind: 'ellipse', position: [x, y], size: [w, h], ...(fill ? {fill} : {fillOpacity: 0}), ...(borda ? {stroke: borda, strokeWidth: larg} : {})});
    if (t !== null) aparece(l, x, y, t);
    return l;
  }
  function texto(str, x, y, tam, cor = COR.texto, {t = null, centro = false, fonte = TIT, nomeP = 'txt', fim = null, entra = true} = {}) {
    const l = nome(nomeP);
    cmd('layer.newText', {name: l, text: tela(str), position: [x, y], size: Math.round(tam * u), fill: cor, justify: centro ? 'center' : 'left', ...fonte});
    if (t !== null) { if (entra) aparece(l, x, y, t, 14 * u); else keys(l, 'transform/opacity', [[0, 0], [t, 0], [t + 1 / 30, 100]], false); }
    if (fim !== null && fim < dur - .05) keys(l, 'transform/opacity', [[fim - 1 / 30, 100], [fim, 0]], false);
    return l;
  }
  function linha(x1, y1, x2, y2, cor, larg = 3, t = null) {
    const L = Math.hypot(x2 - x1, y2 - y1), l = retangulo((x1 + x2) / 2, (y1 + y2) / 2, L, larg, cor, {arredondado: false, nomeP: 'lin'});
    prop(l, 'transform/rotation', Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI);
    if (t !== null) { keys(l, 'transform/scale', [[t, [0, 100]], [t + .5, [100, 100]]]); keys(l, 'transform/opacity', [[0, 0], [t, 0], [t + .05, 100]], false); }
    return l;
  }
  const largTexto = (s, tam, mono = false) => tela(s).length * tam * u * (mono ? .6 : .58);
  function quebra(s, max) {
    const out = []; let l = '';
    for (const w of tela(s).split(' ')) { if ((l + ' ' + w).trim().length > max && l) { out.push(l); l = ''; } l += (l ? ' ' : '') + w; }
    if (l) out.push(l); return out;
  }
  function pilula(str, x, y, tipo = 'ok', t = 0, {tam = 26} = {}) {
    const cor = TIPO_COR[tipo] || tipo, s = (TIPO_ICONE[tipo] || '') + str;
    const w = largTexto(s, tam, true) + 44 * u, h = tam * u * 1.7;
    retangulo(x + w / 2, y, w, h, '#0f1512', {borda: cor, larg: 2, t, nomeP: 'pil'});
    texto(s, x + 22 * u, y + tam * u * .36, tam, cor, {t: t + .05, fonte: MONO, nomeP: 'pilT'});
    som(t, tipo === 'erro' ? 'erro' : tipo === 'ok' ? 'plim' : 'pop');
    return w;
  }
  function janela(x, y, w, h, titulo, t, cor = COR.borda) {
    retangulo(x, y, w, h, COR.painel, {borda: cor, larg: 2, t, nomeP: 'jan'});
    retangulo(x, y - h / 2 + 22 * u, w - 4, 44 * u, COR.painel2, {t, nomeP: 'janBarra'});
    [COR.vermelho, COR.amarelo, COR.verde].forEach((c, i) => elipse(x - w / 2 + (24 + i * 22) * u, y - h / 2 + 22 * u, 12 * u, 12 * u, c, {t}));
    texto(titulo, x - w / 2 + 96 * u, y - h / 2 + 30 * u, 20, COR.apagado, {t, fonte: {font: 'JetBrains Mono', style: 'Regular'}});
  }

  // ---------- elementos fixos ----------
  function moldura(em3d = false) {
    // vinheta verde no topo
    if (!em3d) {
    const v = elipse(W / 2, -H * .05, W * 1.3, H * .7, '#1f5a2a', {nomeP: 'vinheta'});
    prop(v, 'transform/opacity', 55);
    cmd('effect.apply', {effect: 'Gaussian Blur', layers: [v]});
    prop(v, 'effects/#1/blurriness', 260 * u);
    }
    // marca-d'água
    if (plano.marca && !em3d) {
      const tam = vertical ? 190 : 230, l = texto(plano.marca.toUpperCase(), vertical ? 30 * u : 40 * u, H - (vertical ? 260 : 40) * u, tam, COR.marca, {nomeP: 'marca'});
      keys(l, 'transform/position', [[0, [40 * u, H - (vertical ? 260 : 40) * u]], [dur, [10 * u, H - (vertical ? 260 : 40) * u]]], false);
    }
    // rótulo de seção
    if (plano.secao) texto(plano.secao.toUpperCase(), 56 * u, (vertical ? 120 : 62) * u, 22, COR.verde, {fonte: MONO, nomeP: 'secao'});
    // pilha de camadas (canto)
    if (plano.camada !== undefined && plano.camada !== null) {
      CAMADAS.forEach((c, i) => {
        const l = retangulo(W - 90 * u, (vertical ? 110 : 44) * u + i * 14 * u, 70 * u, 9 * u, c, {arredondado: false, nomeP: 'cam'});
        prop(l, 'transform/opacity', i === plano.camada ? 100 : 22);
      });
    }
  }
  function legenda() {
    const max = vertical ? 24 : 44, tam = vertical ? 44 : 34, y = H * (vertical ? .78 : .93);
    let grupos = [], g = [];
    for (const p of cena.palavras) { const atual = g.map(w => w.w).join(' '); if ((atual + ' ' + p.w).length > max && g.length) { grupos.push(g); g = []; } g.push(p); }
    if (g.length) grupos.push(g);
    grupos.forEach((grp, j) => {
      const ini = Math.min(grp[0].t, dur - .1), fim = Math.min(grupos[j + 1]?.[0].t ?? dur, dur);
      texto(grp.map(w => w.w).join(' '), W / 2, y, tam, COR.texto, {t: ini, fim, centro: true, entra: false, nomeP: 'leg', fonte: {font: 'Segoe UI', style: 'Bold'}});
    });
  }

  // ---------- modelos de cena ----------
  const M = {};
  M.frase = (p) => {
    const tam = p.tamanho || (vertical ? 92 : 96), linhas = quebra(p.texto || cena.texto, vertical ? 16 : 26);
    const y0 = H * .5 - (linhas.length - 1) * tam * u * .6;
    linhas.forEach((ln, i) => {
      const destaque = p.destaque && sem(ln).includes(sem(p.destaque));
      texto(ln, W / 2, y0 + i * tam * u * 1.2, tam, destaque ? (TIPO_COR[p.cor] || p.cor || COR.verde) : COR.texto, {t: em(p.em, .1) + i * .15, centro: true});
    });
    som(em(p.em, .1), 'whoosh');
  };
  M.titulo = (p) => {
    const t = em(p.em, .05);
    texto(p.numero || '', W / 2, H * .36, 60, COR.verde, {t, centro: true, fonte: MONO});
    const linhas = quebra(p.texto || cena.texto, vertical ? 12 : 20);
    linhas.forEach((ln, i) => texto(ln.toUpperCase(), W / 2, H * .5 + i * 120 * u, vertical ? 104 : 120, COR.texto, {t: t + .15 + i * .1, centro: true}));
    const l = retangulo(W / 2, H * .5 + linhas.length * 120 * u - 50 * u, 240 * u, 8 * u, COR.verde, {arredondado: false});
    keys(l, 'transform/scale', [[t + .4, [0, 100]], [t + .9, [100, 100]]]);
    som(t, 'whoosh');
  };
  M.lista = (p) => {
    const itens = p.itens || [], x = vertical ? 80 * u : W * .2, y0 = H * (vertical ? .25 : .22), dy = (vertical ? 140 : 118) * u, w = vertical ? W - 160 * u : W * .55;
    if (p.titulo) texto(p.titulo, x, y0 - 60 * u, 30, COR.apagado, {t: 0, fonte: MONO});
    itens.forEach((it, i) => {
      const atual = i === p.atual, t = em(it.em ?? null, .15 + i * .18), y = y0 + i * dy + 30 * u;
      retangulo(x + w / 2, y, w, dy * .78, atual ? '#1a2a1c' : COR.painel, {borda: atual ? COR.verde : COR.borda, larg: atual ? 3 : 2, t});
      elipse(x + 40 * u, y, 40 * u, 40 * u, atual ? COR.verde : COR.borda, {t});
      texto(String(i + 1), x + 40 * u, y + 12 * u, 26, atual ? COR.fundo : COR.apagado, {t, centro: true, fonte: MONO});
      texto(it.texto ?? it, x + 84 * u, y + 16 * u, vertical ? 50 : 46, atual ? COR.texto : COR.apagado, {t});
    });
  };
  M.checklist = (p) => {
    const itens = p.itens || [], x = vertical ? 90 * u : W * .22, y0 = H * .32, dy = (vertical ? 150 : 120) * u;
    retangulo(vertical ? W / 2 : x + 470 * u, y0 + (itens.length - 1) * dy / 2, vertical ? W - 120 * u : 1000 * u, itens.length * dy + 70 * u, COR.painel, {borda: COR.borda, t: 0});
    itens.forEach((it, i) => {
      const y = y0 + i * dy, t = em(it.em, .2 + i * .25), cor = TIPO_COR[it.estado] || COR.borda;
      retangulo(x + 20 * u, y, 40 * u, 40 * u, '#0f1512', {borda: cor, larg: 3, t});
      texto(it.texto, x + 70 * u, y + 16 * u, vertical ? 52 : 48, it.estado === 'erro' ? COR.apagado : COR.texto, {t});
      if (it.estado) {
        const tm = em(it.marca ?? it.em, t + .5);
        texto(it.estado === 'ok' ? '✓' : '✗', x + 20 * u, y + 13 * u, 34, cor, {t: tm, centro: true, fonte: MONO});
        if (it.estado === 'erro') { const r = linha(x + 64 * u, y, x + 70 * u + largTexto(it.texto, vertical ? 52 : 48), y, COR.vermelho, 4, tm); }
        som(tm, it.estado === 'ok' ? 'plim' : 'erro');
      }
    });
  };
  M.tabela = (p) => {
    const linhas = p.linhas || [], w = vertical ? W - 100 * u : 1000 * u, rh = 84 * u, h = 90 * u + linhas.length * rh, x = vertical ? W / 2 : W * .42, y = H * .47;
    janela(x, y, w, h, p.titulo || 'Configuração de rede', 0);
    linhas.forEach(([rot, val], i) => {
      const ly = y - h / 2 + 90 * u + i * rh + rh / 2 - 10 * u, t = .25 + i * .2;
      const l = retangulo(x, ly, w - 50 * u, rh - 16 * u, '#111814', {borda: COR.borda, t});
      texto(rot, x - w / 2 + 50 * u, ly + 10 * u, 26, COR.apagado, {t});
      texto(val, x + w * .02, ly + 12 * u, 38, COR.texto, {t, fonte: MONO});
      if (p.erro === i || (Array.isArray(p.erro) && p.erro.includes(i))) {
        const te = em(p.em, dur * .5), r = retangulo(x, ly, w - 50 * u, rh - 16 * u, '#8a1f2a', {borda: COR.vermelho, larg: 3});
        keys(r, 'transform/opacity', [[0, 0], [te, 0], [te + .25, 45]]);
        som(te, 'erro');
      }
      if (p.ok === i) { const te = em(p.em, dur * .5), r = retangulo(x, ly, w - 50 * u, rh - 16 * u, '#1d4a24', {borda: COR.verde, larg: 3}); keys(r, 'transform/opacity', [[0, 0], [te, 0], [te + .25, 40]]); som(te, 'plim'); }
    });
    if (p.titulo_grande) texto(p.titulo_grande, x, y - h / 2 - 60 * u, 64, COR.vermelho, {t: em(p.em, dur * .5), centro: true});
  };
  M.cartoes = (p) => {
    const itens = p.itens || [], k = itens.length, gap = 40 * u;
    const w = vertical ? W - 160 * u : Math.min(520 * u, (W - 200 * u - gap * (k - 1)) / k), h = (p.altura || 180) * u;
    itens.forEach((it, i) => {
      const x = vertical ? W / 2 : W / 2 + (i - (k - 1) / 2) * (w + gap), y = vertical ? H * .3 + i * (h + gap) : H * .45;
      const cor = TIPO_COR[it.cor] || it.cor || [COR.laranja, COR.amarelo, COR.roxo, COR.azul][i % 4], t = em(it.em, .15 + i * .3);
      retangulo(x, y, w, h, COR.painel, {borda: cor, larg: 3, t});
      texto(it.titulo, x, y + (it.sub ? -4 : 18) * u, it.tam || 58, cor, {t: t + .05, centro: true});
      if (it.sub) texto(it.sub, x, y + 56 * u, 28, COR.apagado, {t: t + .1, centro: true, fonte: MONO});
      if (it.estado) { const te = em(it.estado_em, t + .8); pilula(it.estado === 'ok' ? 'sim' : 'não', x - 50 * u, y + h / 2 + 50 * u, it.estado, te); }
      som(t, 'pop');
    });
    if (p.entre && k === 2 && !vertical) texto(p.entre, W / 2, H * .45 + 30 * u, 80, COR.apagado, {t: em(p.entre_em, .6), centro: true});
  };
  M.pilha = (p) => {
    const cams = p.camadas || ['Aplicação', 'Transporte', 'Internet', 'Enlace'], cores = p.cores || CAMADAS;
    const w = vertical ? W * .7 : 560 * u, h = 96 * u, x = vertical ? W / 2 : W * .62, y0 = H * .3;
    cams.forEach((c, i) => {
      const y = y0 + i * (h + 16 * u), t = em(p.em_camadas?.[i], .2 + i * .2), ativa = p.ativa === undefined || p.ativa === i;
      const l = retangulo(x, y, w, h, '#101614', {borda: cores[i % cores.length], larg: ativa ? 4 : 2, t});
      texto(c.toUpperCase(), x, y + 14 * u, 40, ativa ? cores[i % cores.length] : COR.apagado, {t, centro: true});
    });
    if (p.seta) {
      const t = em(p.seta_em, dur * .5), xs = x - w / 2 - 70 * u, yA = y0 + (cams.length - 1) * (h + 16 * u), yB = y0;
      const [a, b] = p.seta === 'sobe' ? [yA, yB] : [yB, yA];
      linha(xs, a, xs, b, COR.verde, 6, t);
      texto(p.seta_texto || (p.seta === 'sobe' ? 'de baixo pra cima' : 'de cima pra baixo'), x, Math.max(a, b) + h / 2 + 60 * u, 24, COR.verde, {t: t + .3, fonte: MONO, centro: true});
    }
  };
  // Grafo de commits: ramos em faixas, bolinhas por commit, merge e HEAD.
  // commits: [{id, ramo (índice), pai?, msg?, em}], ramos: [{nome, cor}], merges: [{de, para, em}],
  // head: [{alvo, em}] (etiqueta HEAD pula entre commits)
  M.grafo = (p) => {
    const ramos = p.ramos || [{nome: 'main', cor: COR.verde}], commits = p.commits || [];
    const passoX = vertical ? 190 * u : Math.min(340 * u, (W - 420 * u) / Math.max(1, commits.length - 1));
    const x0 = vertical ? 140 * u : 300 * u, y0 = H * (vertical ? .36 : .4), dy = (vertical ? 300 : 250) * u;
    const pos = {};
    commits.forEach((c, i) => { pos[c.id] = [c.x != null ? x0 + c.x * passoX : x0 + i * passoX, y0 + (c.ramo || 0) * dy]; });
    ramos.forEach((r, i) => {
      const prim = commits.find(c => (c.ramo || 0) === i); if (!prim) return;
      const t = em(prim.em, .1 + i * .3);
      texto(r.nome, x0 - 40 * u, y0 + i * dy - 70 * u, 34, r.cor, {t, fonte: MONO});
    });
    commits.forEach((c, i) => {
      const t = em(c.em, .2 + i * .35), [x, y] = pos[c.id], cor = ramos[c.ramo || 0].cor;
      const pai = c.pai ?? commits.slice(0, i).reverse().find(k => (k.ramo || 0) === (c.ramo || 0))?.id;
      if (pai && pos[pai]) linha(pos[pai][0], pos[pai][1], x, y, cor, 8, t - .35);
      const b = elipse(x, y, 76 * u, 76 * u, COR.fundo, {borda: cor, larg: 9, nomeP: 'commit'});
      keys(b, 'transform/scale', [[t, [0, 0]], [t + .3, [100, 100]]]);
      keys(b, 'transform/opacity', [[0, 0], [t, 0], [t + .05, 100]], false);
      texto(c.id, x, y + 84 * u, 28, COR.apagado, {t: t + .1, centro: true, fonte: MONO});
      if (c.msg) texto(c.msg, x, y - 62 * u, 30, COR.texto, {t: t + .15, centro: true, fonte: {font: 'Segoe UI', style: 'Bold'}});
      som(t, 'pop');
    });
    for (const m of p.merges || []) {
      if (!pos[m.de] || !pos[m.para]) continue; const t = em(m.em, dur * .6);
      linha(pos[m.de][0], pos[m.de][1], pos[m.para][0], pos[m.para][1], COR.amarelo, 6, t);
      som(t, 'plim');
    }
    const heads = p.head || [];
    if (heads.length) {
      const h = retangulo(0, 0, 140 * u, 50 * u, COR.amarelo, {nomeP: 'head'}), ht = nome('headT');
      cmd('layer.newText', {name: ht, text: 'HEAD', position: [0, 0], size: Math.round(30 * u), fill: COR.fundo, justify: 'center', ...MONO});
      let ant = null;
      heads.forEach((hd, i) => {
        if (!pos[hd.alvo]) return; const t = em(hd.em, .3 + i), [x, y] = pos[hd.alvo];
        if (ant) { keys(h, 'transform/position', [[t - .4, ant]]); keys(ht, 'transform/position', [[t - .4, [ant[0], ant[1] + 8 * u]]]); }
        ant = [x, y - (commits.find(c => c.id === hd.alvo)?.msg ? 140 : 100) * u];
        keys(h, 'transform/position', [[t, [x, y - (commits.find(c => c.id === hd.alvo)?.msg ? 140 : 100) * u]]]);
        keys(ht, 'transform/position', [[t, [x, y - (commits.find(c => c.id === hd.alvo)?.msg ? 140 : 100) * u + 10 * u]]]);
        if (i === 0) { keys(h, 'transform/opacity', [[0, 0], [t, 0], [t + .2, 100]], false); keys(ht, 'transform/opacity', [[0, 0], [t, 0], [t + .2, 100]], false); }
      });
    }
  };
  // Fluxo: caixas lado a lado (ou empilhadas no Short) e "chips" (arquivos/commits) andando entre elas.
  // caixas: [{titulo, sub, cor}], itens: [{texto, cor, passos: [{caixa, em}]}], setas: [{de, para, rotulo, em}]
  M.fluxo = (p) => {
    const cx = p.caixas || [], k = cx.length, gap = (vertical ? 70 : 90) * u;
    const w = vertical ? W - 200 * u : Math.min(480 * u, (W - 160 * u - gap * (k - 1)) / k), h = (vertical ? 300 : 360) * u;
    const centro = i => vertical ? [W / 2, H * .24 + i * (h + gap)] : [W / 2 + (i - (k - 1) / 2) * (w + gap), H * .5];
    cx.forEach((c, i) => {
      const [x, y] = centro(i), cor = TIPO_COR[c.cor] || c.cor || [COR.azul, COR.amarelo, COR.verde, COR.roxo][i % 4], t = em(c.em, .1 + i * .25);
      retangulo(x, y, w, h, COR.painel, {borda: cor, larg: 3, t});
      texto(c.titulo, x, y - h / 2 + 62 * u, vertical ? 50 : 50, cor, {t: t + .05, centro: true});
      if (c.sub) texto(c.sub, x, y - h / 2 + 104 * u, 28, COR.apagado, {t: t + .1, centro: true, fonte: MONO});
      som(t, 'pop');
    });
    for (const s of p.setas || []) {
      const [x1, y1] = centro(s.de), [x2, y2] = centro(s.para), t = em(s.em, dur * .4);
      const a = vertical ? [x1, y1 + h / 2 + 8 * u] : [x1 + w / 2 + 8 * u, y1], b = vertical ? [x2, y2 - h / 2 - 8 * u] : [x2 - w / 2 - 8 * u, y2];
      linha(a[0], a[1], b[0], b[1], COR.texto, 4, t);
      if (s.rotulo) {
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        const lw = largTexto(s.rotulo, 30, true) + 36 * u;
        retangulo(vertical ? mx + lw / 2 + 30 * u : mx, vertical ? my : my - 40 * u, lw, 52 * u, '#0f1512', {borda: COR.amarelo, t});
        texto(s.rotulo, vertical ? mx + lw / 2 + 30 * u : mx, (vertical ? my : my - 40 * u) + 10 * u, 30, COR.amarelo, {t, centro: true, fonte: MONO});
      }
    }
    (p.itens || []).forEach((it, j) => {
      const cor = TIPO_COR[it.cor] || it.cor || COR.texto, cw = Math.max(220 * u, largTexto(it.texto, 32, true) + 50 * u);
      const ch = retangulo(0, 0, cw, 64 * u, '#0c110e', {borda: cor, larg: 2, nomeP: 'chip'}), ct = nome('chipT');
      cmd('layer.newText', {name: ct, text: tela(it.texto), position: [0, 0], size: Math.round(32 * u), fill: cor, justify: 'center', ...MONO});
      let ant = null;
      (it.passos || []).forEach((ps, i) => {
        const t = em(ps.em, .5 + i), [x, y] = centro(ps.caixa), yy = y + (vertical ? 20 : 10) * u + j * 62 * u;
        if (ant) { keys(ch, 'transform/position', [[t - .45, ant]]); keys(ct, 'transform/position', [[t - .45, [ant[0], ant[1] + 8 * u]]]); }
        keys(ch, 'transform/position', [[t, [x, yy]]]);
        keys(ct, 'transform/position', [[t, [x, yy + 8 * u]]]); ant = [x, yy];
        if (i === 0) [ch, ct].forEach(l => keys(l, 'transform/opacity', [[0, 0], [t, 0], [t + .2, 100]], false));
        som(t, 'pop');
      });
    });
  };
  M.terminal = (p) => {
    const linhas = p.linhas || [], w = vertical ? W - 80 * u : 1250 * u, h = Math.max(300 * u, 110 * u + linhas.length * 64 * u), x = vertical ? W / 2 : W * .45, y = H * .48;
    janela(x, y, w, h, p.titulo || 'Windows PowerShell', 0, '#2c4a7a');
    linhas.forEach((ln, i) => {
      const t = em(ln.em, .3 + i * .35), ly = y - h / 2 + 96 * u + i * 64 * u, s = ln.texto ?? ln;
      if (ln.realce) { const r = retangulo(x, ly - 11 * u, w - 40 * u, 54 * u, ln.realce === 'erro' ? '#4a141c' : '#163a1d', {borda: TIPO_COR[ln.realce], t: em(ln.realce_em, t + .3)}); som(em(ln.realce_em, t + .3), ln.realce === 'erro' ? 'erro' : 'plim'); }
      texto(s, x - w / 2 + 30 * u, ly, 34, ln.cor ? (TIPO_COR[ln.cor] || ln.cor) : (i === 0 || String(s).startsWith('PS ') ? COR.texto : '#b9c4bb'), {t, entra: false, fonte: {font: 'JetBrains Mono', style: 'Regular'}});
      som(t, 'tecla');
    });
  };
  M.documento = (p) => {
    const w = vertical ? W - 80 * u : 1100 * u, linhas = quebra(p.texto || '', vertical ? 34 : 60), h = 160 * u + linhas.length * 52 * u, x = vertical ? W / 2 : W * .45, y = H * .5;
    if (p.fonte) texto(p.fonte, x - w / 2, y - h / 2 - 30 * u, 26, COR.texto, {t: 0, fonte: MONO});
    janela(x, y, w, h, p.url || 'rfc-editor.org', .1);
    if (p.titulo) texto(p.titulo, x - w / 2 + 30 * u, y - h / 2 + 90 * u, 28, COR.texto, {t: .2, fonte: {font: 'Segoe UI', style: 'Bold'}});
    linhas.forEach((ln, i) => {
      const ly = y - h / 2 + 150 * u + i * 52 * u, marca = p.realce && sem(ln).includes(sem(p.realce).slice(0, 12));
      if (marca) { const te = em(p.em, dur * .4), r = retangulo(x, ly - 10 * u, w - 40 * u, 46 * u, '#1d4a24', {borda: COR.verde}); keys(r, 'transform/opacity', [[0, 0], [te, 0], [te + .3, 100]]); som(te, 'plim'); }
      texto(ln, x - w / 2 + 30 * u, ly, 29, '#c9d1ca', {t: .3, fonte: {font: 'JetBrains Mono', style: 'Regular'}});
    });
    if (p.rodape) texto(p.rodape, x - w / 2, y + h / 2 + 40 * u, 20, COR.apagado, {t: .4, fonte: {font: 'JetBrains Mono', style: 'Regular'}});
  };
  M.comentarios = (p) => {
    const itens = p.itens || [], w = vertical ? 620 * u : 440 * u, h = vertical ? 1050 * u : 780 * u, x = W / 2, y = H * .48;
    retangulo(x, y, w, h, '#0c100e', {borda: '#3b4a40', larg: 3, t: 0});
    texto(p.titulo || 'Comentários', x - w / 2 + 30 * u, y - h / 2 + 46 * u, 20, COR.apagado, {t: 0, fonte: MONO});
    if (p.badge) { elipse(x + w / 2 - 10 * u, y - h / 2 + 10 * u, 56 * u, 56 * u, COR.amarelo, {t: .2}); texto(String(p.badge), x + w / 2 - 10 * u, y - h / 2 + 22 * u, 30, COR.fundo, {t: .2, centro: true, fonte: MONO}); }
    let yy = y - h / 2 + 100 * u;
    itens.forEach((it, i) => {
      const ls = quebra(it.texto ?? it, vertical ? 24 : 22), bh = 40 * u + ls.length * 40 * u, t = em(it.em, .4 + i * .9);
      retangulo(x, yy + bh / 2, w - 50 * u, bh, '#f2efe6', {t});
      ls.forEach((l, j) => texto(l, x - w / 2 + 45 * u, yy + 46 * u + j * 40 * u, 30, sem(l).includes(sem(it.destaque || '~')) ? '#b06a00' : '#1b1f1c', {t: t + .05, fonte: {font: 'Segoe UI', style: 'Bold'}}));
      som(t, 'pop'); yy += bh + 26 * u;
    });
  };

  // ---------- cena 3D de rede ----------
  M.rede3d = (p) => {
    const escritorio = (p.cenario || 'escritorio') === 'escritorio';
    const prim = o => cmd('layer.new3dPrimitive', {castsShadows: true, acceptsShadows: true, acceptsLights: true, roughness: .6, ...o});
    const nm = s => nome(s);
    // piso + grade
    const piso = nm('piso'); prim({kind: 'plane', name: piso, width: 4200, height: 3200, position: [960, 700, 0], baseColor: escritorio ? COR.piso : COR.palco, roughness: .95});
    prop(piso, 'transform/rotationX', 90);
    for (let i = -10; i <= 10; i++) {
      prim({kind: 'cube', name: nm('gx'), width: 3, height: 1, depth: 3200, position: [960 + i * 170, 699, 0], baseColor: escritorio ? COR.grade : COR.gradePalco, castsShadows: false});
      prim({kind: 'cube', name: nm('gz'), width: 4200, height: 1, depth: 3, position: [960, 699, i * 170], baseColor: escritorio ? COR.grade : COR.gradePalco, castsShadows: false});
    }
    // nós: padrão = escritório da referência
    const nos = p.nos || padraoEscritorio(p.pcs || 15);
    const pos = {};
    const corTela = {azul: ['#1438d8', '#1f4dff'], verde: ['#14d84a', '#1fff5a'], vermelho: ['#d81430', '#ff2a45'], apagado: ['#1a1f24', '#000000']};
    const telas = {};
    for (const no of nos) {
      const x = 960 + (no.x || 0), z = no.z || 0; pos[no.id] = [x, z];
      const tipo = no.tipo || 'pc';
      if (tipo === 'pc' || tipo === 'notebook') {
        prim({kind: 'cube', name: nm('mesa'), width: 130, height: 10, depth: 80, position: [x, 690, z], baseColor: '#1a1f22'});
        prim({kind: 'cube', name: nm('pe'), width: 10, height: 30, depth: 6, position: [x, 678, z - 14], baseColor: '#111111'});
        const t = nm('tela'), [b, e] = corTela[no.cor || 'azul'];
        prim({kind: 'cube', name: t, width: 130, height: 85, depth: 8, position: [x, 630, z - 20], baseColor: b, emissive: e});
        telas[no.id] = t;
      } else if (tipo === 'servidor') {
        prim({kind: 'cube', name: nm('srv'), width: 90, height: 240, depth: 90, position: [x, 580, z], baseColor: '#0d0f12'});
        for (let k = 0; k < 4; k++) prim({kind: 'cube', name: nm('led'), width: 8, height: 8, depth: 2, position: [x + 30, 500 + k * 30, z - 46], baseColor: '#2aff6a', emissive: '#2aff6a', castsShadows: false});
      } else if (tipo === 'switch') {
        prim({kind: 'cube', name: nm('sw'), width: 200, height: 24, depth: 70, position: [x, 683, z], baseColor: '#22272b'});
        for (let k = 0; k < 8; k++) prim({kind: 'cube', name: nm('porta'), width: 10, height: 6, depth: 2, position: [x - 70 + k * 20, 680, z - 36], baseColor: '#9fffb0', emissive: '#4dff7a', castsShadows: false});
      } else if (tipo === 'impressora') {
        prim({kind: 'cube', name: nm('imp'), width: 130, height: 70, depth: 100, position: [x, 660, z], baseColor: '#d8d8d2'});
        prim({kind: 'cube', name: nm('papel'), width: 80, height: 4, depth: 40, position: [x, 624, z - 30], baseColor: '#ffffff'});
      } else if (tipo === 'roteador') {
        prim({kind: 'cube', name: nm('rot'), width: 150, height: 40, depth: 90, position: [x, 676, z], baseColor: '#e6e6e0'});
        prim({kind: 'cylinder', name: nm('ant'), radius: 5, height: 90, position: [x - 50, 615, z + 30], baseColor: '#cfcfca'});
        prim({kind: 'cylinder', name: nm('ant'), radius: 5, height: 90, position: [x + 50, 615, z + 30], baseColor: '#cfcfca'});
      } else if (tipo === 'nuvem') {
        [[0, 0, 60], [-60, 20, 45], [60, 20, 45], [0, -40, 50]].forEach(([dx, dy, r]) => prim({kind: 'sphere', name: nm('nuv'), radius: r, position: [x + dx, 560 + dy, z], baseColor: '#f4f6f8', roughness: .9}));
      } else if (tipo === 'celular') {
        prim({kind: 'cube', name: nm('cel'), width: 40, height: 80, depth: 8, position: [x, 650, z], baseColor: '#1438d8', emissive: '#1f4dff'});
      } else if (tipo === 'camera') {
        prim({kind: 'cylinder', name: nm('cam'), radius: 18, height: 60, position: [x, 620, z], baseColor: '#dcdcdc'});
      } else if (tipo === 'firewall') {
        const f = nm('fw'); prim({kind: 'cube', name: f, width: 10, height: 200, depth: 260, position: [x, 600, z], baseColor: '#ff2a45', emissive: '#a0101e', castsShadows: false});
        prop(f, 'transform/opacity', 70);
      }
    }
    // cabos
    const ligacoes = p.ligacoes || nos.filter(n => (n.tipo || 'pc') === 'pc').map(n => [n.id, 'sw']).concat(nos.some(n => n.id === 'srv') ? [['srv', 'sw']] : [], nos.some(n => n.id === 'imp') ? [['imp', 'sw']] : []);
    const cabo = {};
    for (const [a, b] of ligacoes) {
      if (!pos[a] || !pos[b]) continue;
      const [x1, z1] = pos[a], [x2, z2] = pos[b], L = Math.hypot(x2 - x1, z2 - z1), c = nm('cabo');
      prim({kind: 'cube', name: c, width: 4, height: 2, depth: L, position: [(x1 + x2) / 2, 697, (z1 + z2) / 2], baseColor: escritorio ? '#3a5560' : '#4a5258', castsShadows: false});
      prop(c, 'transform/rotationY', Math.atan2(x2 - x1, z2 - z1) * 180 / Math.PI);
      cabo[a + '>' + b] = c;
    }
    // eventos sincronizados com a fala
    for (const ev of p.eventos || []) {
      const t = em(ev.em, ev.t ?? dur * .4), alvos = [].concat(ev.alvo || []).flatMap(a => a === '*' ? Object.keys(telas) : a.endsWith('*') ? Object.keys(telas).filter(k => k.startsWith(a.slice(0, -1))) : [a]);
      if (ev.acao === 'cor') {
        const [b, e] = corTela[ev.cor || 'verde'];
        // troca de cor = nova tela por cima que aparece
        alvos.forEach((a, i) => {
          const tl = telas[a]; if (!tl) return; const ti = t + i * (ev.passo ?? .04), no = nos.find(n => n.id === a), x = 960 + (no.x || 0), z = no.z || 0, nova = nm('tela2');
          prim({kind: 'cube', name: nova, width: 132, height: 87, depth: 8, position: [x, 630, z - 22], baseColor: b, emissive: e, castsShadows: false});
          keys(nova, 'transform/opacity', [[0, 0], [ti, 0], [ti + .15, 100]], false);
        });
        som(t, ev.cor === 'vermelho' ? 'erro' : 'plim');
      } else if (ev.acao === 'anel' || ev.acao === 'foco') {
        alvos.forEach(a => {
          if (!pos[a]) return; const [x, z] = pos[a], r = nm('anel');
          prim({kind: 'torus', name: r, radius: 120, tubeRadius: 4, position: [x, 698, z], baseColor: ev.cor === 'vermelho' ? '#ff2a45' : '#4da3ff', emissive: ev.cor === 'vermelho' ? '#ff2a45' : '#4da3ff', castsShadows: false});
          keys(r, 'transform/opacity', [[0, 0], [t, 0], [t + .3, 100]]);
          keys(r, 'transform/scale', [[t, [40, 40, 40]], [t + .4, [100, 100, 100]]]);
        });
        som(t, 'pop');
      } else if (ev.acao === 'pacote') {
        const rota = [].concat(ev.rota || ev.alvo); const s = nm('pacote');
        const p0 = pos[rota[0]]; if (!p0) continue;
        prim({kind: 'sphere', name: s, radius: 16, position: [p0[0], 680, p0[1]], baseColor: '#ffcf4a', emissive: '#b88600', castsShadows: false});
        const passo = ev.duracao ?? .6;
        keys(s, 'transform/opacity', [[0, 0], [t, 0], [t + .1, 100]], false);
        rota.forEach((id, i) => { if (pos[id]) keys(s, 'transform/position', [[t + i * passo, [pos[id][0], 680, pos[id][1]]]]); });
        if (ev.perde) keys(s, 'transform/opacity', [[t + (rota.length - 1) * passo, 100], [t + (rota.length - 1) * passo + .2, 0]], false);
        som(t, 'pop');
      } else if (ev.acao === 'falha') {
        alvos.forEach(a => { if (!pos[a]) return; const [x, z] = pos[a], f = nm('x'); prim({kind: 'cube', name: f, width: 160, height: 26, depth: 26, position: [x, 560, z], baseColor: '#ff2a45', emissive: '#a0101e'}); prop(f, 'transform/rotation', 45); const g = nm('x'); prim({kind: 'cube', name: g, width: 160, height: 26, depth: 26, position: [x, 560, z], baseColor: '#ff2a45', emissive: '#a0101e'}); prop(g, 'transform/rotation', -45); [f, g].forEach(l => { keys(l, 'transform/opacity', [[0, 0], [t, 0], [t + .1, 100]], false); keys(l, 'transform/scale', [[t, [0, 0, 0]], [t + .35, [100, 100, 100]]]); }); });
        som(t, 'erro');
      }
    }
    // luzes e câmera
    cmd('layer.newLight', {kind: 'Ambient', name: nm('amb'), intensity: escritorio ? 45 : 35, color: '#bfe6ff'});
    cmd('layer.newLight', {kind: 'Spot', name: nm('sol'), intensity: 120, color: '#e8fbff', position: [400, -900, -1200], poi: [960, 690, 0], castsShadows: true, shadowDarkness: 55, shadowDiffusion: 30, coneAngle: 120});
    const cam = nm('cam'), alvo = p.alvo ? pos[p.alvo] : null, ax = alvo ? alvo[0] : 960, az = alvo ? alvo[1] : 60;
    const dist = (p.zoom ? 1 / p.zoom : 1) * (vertical ? 1.25 : 1.18);
    cmd('layer.newCamera', {name: cam, preset: '50mm', position: [ax, -1200 * dist, az - 1560 * dist], poi: [ax, 660, az]});
    const ini = [ax + 180, -1300 * dist, az - 1700 * dist], fim = [ax - 80, -1100 * dist, az - 1450 * dist];
    keys(cam, 'transform/position', [[0, ini], [dur, fim]]);
    // HUD
    if (p.cartao) {
      const c = p.cartao, t = em(c.em, dur * .5), tipo = c.tipo || 'ok', cor = TIPO_COR[tipo];
      const x = 60 * u, y = H - (vertical ? 520 : plano.legenda ? 260 : 200) * u, w = 460 * u;
      retangulo(x + w / 2, y, w, 130 * u, '#0e1813', {borda: COR.borda, t});
      texto((c.rotulo || '').toUpperCase(), x + 26 * u, y - 24 * u, 20, COR.apagado, {t, fonte: MONO});
      texto(TIPO_ICONE[tipo] + c.texto, x + 26 * u, y + 34 * u, 48, cor, {t: t + .08});
      som(t, tipo === 'erro' ? 'erro' : 'plim');
    }
    if (p.legenda_nos) { let x = W / 2 - 400 * u; for (const ln of p.legenda_nos) x += pilula(ln.texto ?? ln, x, H - (vertical ? 420 : plano.legenda ? 190 : 110) * u, ln.tipo || COR.azul, em(ln.em, .3)) + 18 * u; }
  };

  function padraoEscritorio(qtd) {
    const nos = [{id: 'srv', tipo: 'servidor', x: 0, z: 520}, {id: 'sw', tipo: 'switch', x: 0, z: 300}, {id: 'imp', tipo: 'impressora', x: 520, z: 450}];
    const cols = 5, linhas = Math.ceil(qtd / cols);
    for (let i = 0; i < qtd; i++) { const r = Math.floor(i / cols), k = i % cols; nos.push({id: `pc${i + 1}`, tipo: 'pc', x: -460 + k * 230, z: -380 + r * 230 - (linhas - 3) * 115}); }
    return nos;
  }

  // ---------- montar ----------
  function montar() {
    const modelo = M[plano.modelo] ? plano.modelo : 'frase';
    if (modelo !== 'rede3d') moldura();
    M[modelo](plano);
    if (modelo === 'rede3d') moldura(true); // HUD por cima do 3D
    for (const pl of plano.pilulas || []) pilula(pl.texto, pl.x != null ? pl.x * u : 60 * u, pl.y != null ? pl.y * u : H - (vertical ? 380 : plano.legenda ? 200 : 120) * u, pl.tipo || 'ok', em(pl.em, dur * .6));
    if (plano.legenda) legenda();
    const limpos = steps;
    if (ease.length) { limpos.push({command: 'keys.select', params: {keys: ease}}); limpos.push({command: 'keys.easyEase', params: {}}); }
    return {steps: limpos, sons};
  }
  return {montar, modelo: plano.modelo};
}
