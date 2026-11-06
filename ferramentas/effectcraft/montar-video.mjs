// Monta um vídeo no estilo TI Ninja com EffectCraft a partir da timeline do app.
//
//   node ferramentas/effectcraft/montar-video.mjs <id-do-projeto> [opções]
//     --short          formato 1080x1920 (padrão: o da timeline)
//     --stills         só monta o .ecproj e gera um still por cena (rápido, para conferir)
//     --cenas 3,7      stills/clipes só dessas cenas (0-based); o render final é sempre inteiro
//     --sem-clipes     não gera os clipes dos cards do app
//     --cpu            renderiza na CPU (padrão: GPU, com volta para CPU se falhar)
//     --reusar         usa o visual já renderizado (refaz só áudio, MP4 final e clipes)
//
// Entradas: remotion/public/videos/<id>/timeline.json (+ cena_XXX.wav)
//           projetos/<id>/cenas-ec.json  (plano visual, ver docs/estilo-ti-ninja.md)
// Saídas:   exportacoes/<id>/<comp>.ecproj, stills/, remotion/out/<comp>.mp4,
//           remotion/public/videos/<id>/cenas/cena_XXX.{mp4,jpg}, composicoes.json
import {connect} from './mcp-client.mjs';
import {novaCena, COR} from './estilo.mjs';
import {spawnSync, spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..', '..');
const CLI = path.join(import.meta.dirname, 'bin', 'effectcraft-0.21.1-windows-x64-portable', 'effectcraft-cli.exe');
const args = process.argv.slice(2), pid = args[0];
if (!/^[a-z0-9-]+$/i.test(pid || '')) { console.error('uso: node montar-video.mjs <id-do-projeto> [--short] [--stills] [--cenas 1,2]'); process.exit(1); }
const opt = f => args.includes(f), val = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const somente = val('--cenas') ? val('--cenas').split(',').map(Number) : null;

const pastaVideo = path.join(RAIZ, 'remotion', 'public', 'videos', pid);
const tl = JSON.parse(fs.readFileSync(path.join(pastaVideo, 'timeline.json'), 'utf8'));
const planoPath = path.join(RAIZ, 'projetos', pid, 'cenas-ec.json');
const planoArq = fs.existsSync(planoPath) ? JSON.parse(fs.readFileSync(planoPath, 'utf8')) : {};
const planoCenas = Array.isArray(planoArq) ? planoArq : (planoArq.cenas || []);
const short = opt('--short') || planoArq.formato === '9:16' || tl.altura > tl.largura;
const W = short ? 1080 : 1920, H = short ? 1920 : 1080;
const compId = `${pid}-ec${short ? '-short' : ''}`.slice(-80);
const saida = path.join(RAIZ, 'exportacoes', pid); fs.mkdirSync(path.join(saida, 'stills'), {recursive: true});
const ecproj = path.join(saida, `${compId}.ecproj`);

// plano de cada cena: campos de seção/marca/camada herdam da cena anterior
let herda = {legenda: planoArq.legenda ?? short};
const planos = tl.cenas.map((c, i) => {
  const p = {...planoCenas[i]};
  for (const k of ['secao', 'marca', 'camada']) { if (p[k] === undefined) p[k] = herda[k]; else herda[k] = p[k]; }
  if (p.legenda === undefined) p.legenda = herda.legenda;
  if (!p.modelo) Object.assign(p, {modelo: 'frase', texto: c.titulo || c.texto});
  return p;
});

const cli = await connect();
const parse = r => { const x = r.content?.find(c => c.type === 'text'); try { return JSON.parse(x.text); } catch { return x?.text; } };
const exec = async (command, params) => parse(await cli.call('execute_command', {command, params}));
const todosSons = [];
try {
  const nomes = [];
  for (let i = 0; i < tl.cenas.length; i++) {
    const c = tl.cenas[i], nome = `cena_${String(i).padStart(3, '0')}`; nomes.push(nome);
    await exec('comp.new', {name: nome, width: W, height: H, frameRate: 30, duration: c.dur, background: COR.fundo, renderer: planos[i].modelo === 'rede3d' ? 'advanced3D' : 'classic3D'});
    const {steps, sons} = novaCena({W, H, cena: c, plano: planos[i], indice: i, total: tl.cenas.length}).montar();
    try { await cli.call('batch', {steps, label: nome}); }
    catch (e) { throw new Error(`cena ${i} (${planos[i].modelo}): ${String(e.message).slice(0, 600)}`); }
    for (const s of sons) if (s.t < c.dur) todosSons.push({t: c.inicio + s.t, tipo: s.tipo});
    console.log(`montada ${i + 1}/${tl.cenas.length} (${planos[i].modelo})`);
  }
  await exec('comp.new', {name: compId, width: W, height: H, frameRate: 30, duration: tl.duracao, background: COR.fundo});
  for (let i = 0; i < nomes.length; i++) {
    const c = tl.cenas[i];
    const r = await exec('layer.addItem', {item: nomes[i], time: c.inicio, in: c.inicio, out: Math.min(tl.duracao, c.inicio + c.dur)});
    if (r?.layer && i > 0) await cli.call('add_keyframe', {layer: r.layer, path: 'transform/opacity', keys: [{time: 0, value: 0}, {time: .12, value: 100}]});
  }
  await cli.call('save_project', {path: ecproj});
  const idx = somente || tl.cenas.map((_, i) => i);
  for (const i of idx) {
    const c = tl.cenas[i], ult = c.palavras.at(-1)?.t ?? c.dur * .7;
    await cli.call('render_frame', {comp: nomes[i], time: Math.min(c.dur - .05, ult + .3), max_side: 1280, path: path.join(saida, 'stills', `${nomes[i]}.png`)});
  }
  console.log(`stills em ${path.join(saida, 'stills')}`);
} finally { cli.close(); }

if (opt('--stills')) process.exit(0);

// ---------- render do vídeo (sem áudio) ----------
const visual = path.join(saida, `${compId}-visual.mp4`);
const total = Math.round(tl.duracao * 30);
// GPU ~10x mais rápida (teste: 6 s de cena 3D em 80 s × 814 s na CPU); --cpu força a CPU
const renderizar = gpu => new Promise((ok, falha) => {
  const p = spawn(CLI, ['render', '--comp', compId, '--out', visual, '--audio', 'off', ...(gpu ? ['--gpu'] : []), ecproj], {windowsHide: true});
  let ultimo = -1, cauda = '';
  const ler = d => { cauda = (cauda + d).slice(-2000); const m = [...String(d).matchAll(/(\d+)\s*\/\s*(\d+)/g)].at(-1); if (m) { const f = +m[1]; if (f !== ultimo) { ultimo = f; console.log(`Rendered ${f}/${total}`); } } };
  p.stdout.on('data', ler); p.stderr.on('data', ler);
  p.on('exit', code => code === 0 ? ok() : falha(new Error('render falhou: ' + cauda)));
});
if (!(opt('--reusar') && fs.existsSync(visual))) {
  try { await renderizar(!opt('--cpu')); }
  catch (e) { if (opt('--cpu')) throw e; console.log('GPU falhou, renderizando na CPU:', String(e.message).slice(-300)); await renderizar(false); }
}

// ---------- áudio: narração + efeitos ----------
const ff = (a) => { const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], {stdio: 'inherit'}); if (r.status) throw new Error('ffmpeg falhou'); };
const entradas = [], filtros = [];
tl.cenas.forEach((c, i) => { entradas.push('-i', path.join(pastaVideo, c.audio)); filtros.push(`[${i}:a]aresample=48000,adelay=${Math.round(c.inicio * 1000)}:all=1[v${i}]`); });
const SFX = path.join(RAIZ, 'remotion', 'public', 'sfx'), VOL = {pop: .25, plim: .3, erro: .3, whoosh: .25, tecla: .15, contagem: .2};
let k = tl.cenas.length; const sfxLabels = [];
// no máximo um efeito a cada 0,25 s
let ultimoSom = -1;
for (const s of todosSons.sort((a, b) => a.t - b.t)) {
  if (s.t - ultimoSom < .25 || !fs.existsSync(path.join(SFX, s.tipo + '.wav'))) continue; ultimoSom = s.t;
  entradas.push('-i', path.join(SFX, s.tipo + '.wav'));
  filtros.push(`[${k}:a]aresample=48000,volume=${VOL[s.tipo] ?? .2},adelay=${Math.round(s.t * 1000)}:all=1[s${k}]`); sfxLabels.push(`[s${k}]`); k++;
}
const rotulos = tl.cenas.map((_, i) => `[v${i}]`).join('') + sfxLabels.join('');
filtros.push(`${rotulos}amix=inputs=${tl.cenas.length + sfxLabels.length}:normalize=0,atrim=0:${tl.duracao},loudnorm=I=-16:TP=-1.5[a]`);
const audio = path.join(saida, `${compId}-audio.wav`);
fs.writeFileSync(path.join(saida, 'filtro.txt'), filtros.join(';\n'));
ff([...entradas, '-/filter_complex', path.join(saida, 'filtro.txt'), '-map', '[a]', '-ar', '48000', '-ac', '2', audio]);

const final = path.join(RAIZ, 'remotion', 'out', `${compId}.mp4`); fs.mkdirSync(path.dirname(final), {recursive: true});
ff(['-i', visual, '-i', audio, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(tl.duracao), '-movflags', '+faststart', final]);
console.log('Encoded 1/1');
console.log('VIDEO:', final);

// ---------- clipes dos cards + composicoes.json ----------
if (!opt('--sem-clipes')) {
  const pc = path.join(pastaVideo, 'cenas'); fs.mkdirSync(pc, {recursive: true});
  const indPath = path.join(pc, 'index.json'), ind = fs.existsSync(indPath) ? JSON.parse(fs.readFileSync(indPath, 'utf8')) : {cenas: {}};
  const escala = short ? 'scale=360:640' : 'scale=640:360';
  for (const i of (somente || tl.cenas.map((_, j) => j))) {
    const c = tl.cenas[i], nome = `cena_${String(i).padStart(3, '0')}`;
    ff(['-ss', String(c.inicio), '-i', final, '-t', String(c.dur), '-vf', escala, '-c:v', 'libx264', '-crf', '28', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '96k', path.join(pc, nome + '.mp4')]);
    const ult = c.palavras.at(-1)?.t ?? c.dur * .7;
    ff(['-ss', String(c.inicio + Math.min(c.dur - .1, ult + .2)), '-i', final, '-frames:v', '1', '-vf', escala, '-q:v', '4', path.join(pc, nome + '.jpg')]);
    ind.cenas[i] = {quando: Date.now()};
  }
  fs.writeFileSync(indPath, JSON.stringify({...ind, composicao: compId, total: tl.cenas.length}));
}
const compPath = path.join(pastaVideo, 'composicoes.json');
const comps = (fs.existsSync(compPath) ? JSON.parse(fs.readFileSync(compPath, 'utf8')) : []).filter(c => c.id !== compId);
comps.unshift({id: compId, titulo: short ? 'Short estilo TI (EffectCraft)' : 'Vídeo estilo TI (EffectCraft)', formato: short ? '9:16' : '16:9', duracao: tl.duracao, motor: 'effectcraft'});
fs.writeFileSync(compPath, JSON.stringify(comps, null, 2));
console.log('composicoes.json atualizado');
