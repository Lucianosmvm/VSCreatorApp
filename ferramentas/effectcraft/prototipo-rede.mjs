// Protótipo do estilo "TI Ninja": cena 3D isométrica de rede + HUD 2D.
// Uso: node ferramentas/effectcraft/prototipo-rede.mjs <saida.png> [tempo]
import {connect} from './mcp-client.mjs';
import {resolve} from 'node:path';

const out = resolve(process.argv[2] || 'out-rede.png');
const tempo = Number(process.argv[3] || 2);
const c = await connect();
const parse = r => { const x = r.content?.find(c => c.type === 'text'); try { return JSON.parse(x.text); } catch { return x?.text; } };
const ex = async (command, params) => parse(await c.call('execute_command', {command, params}));

await ex('comp.new', {name: 'Rede', width: 1920, height: 1080, frameRate: 30, duration: 6, background: '#0f1a14', renderer: 'advanced3D'});

const prim = (o) => ex('layer.new3dPrimitive', {castsShadows: true, acceptsShadows: true, acceptsLights: true, roughness: .6, ...o});
// piso
await prim({kind: 'plane', name: 'piso', width: 3600, height: 2600, position: [960, 700, 0], baseColor: '#2f7f86', roughness: .9});
await c.call('set_property',{layer:'piso',path:'transform/rotationX',value:90});
for (let i=-8;i<=8;i++){ await prim({kind:'cube',name:`gx${i}`,width:3,height:1,depth:2600,position:[960+i*160,699,0],baseColor:'#3f9aa2',castsShadows:false}); await prim({kind:'cube',name:`gz${i}`,width:3600,height:1,depth:3,position:[960,699,i*160],baseColor:'#3f9aa2',castsShadows:false}); }
// monitores em grade
const mons = [];
for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) {
  const x = 500 + k * 230, z = -380 + r * 230;
  await prim({kind: 'cube', name: `mesa${r}${k}`, width: 120, height: 10, depth: 70, position: [x, 690, z], baseColor: '#1a1f22'});
  await prim({kind: 'cube', name: `mon${r}${k}`, width: 130, height: 85, depth: 8, position: [x, 630, z - 20], baseColor: (k<2||r==0&&k<3)?'#14d84a':'#1438d8', emissive: (k<2||r==0&&k<3)?'#1fff5a':'#1f4dff'});
  await prim({kind: 'cube', name: `pe${r}${k}`, width: 10, height: 30, depth: 6, position: [x, 678, z - 14], baseColor: '#111111'});
  // cabo até o switch
  const dx=960-x, dz=300-z, L=Math.hypot(dx,dz);
  await prim({kind: 'cube', name: `cabo${r}${k}`, width: 4, height: 2, depth: L, position: [(x+960)/2, 698, (z+300)/2], baseColor: '#3a5560', castsShadows:false});
  await c.call('set_property',{layer:`cabo${r}${k}`,path:'transform/rotationY',value:Math.atan2(dx,dz)*180/Math.PI}).catch(e=>console.log('rot',String(e).slice(0,200)));
  mons.push(`mon${r}${k}`);
}
await prim({kind: 'cube', name: 'servidor', width: 90, height: 240, depth: 90, position: [960, 575, 520], baseColor: '#0d0f12'});
await prim({kind: 'cube', name: 'switch', width: 180, height: 22, depth: 60, position: [960, 683, 300], baseColor: '#22272b'});
await prim({kind: 'cube', name: 'impressora', width: 120, height: 70, depth: 90, position: [1480, 660, 450], baseColor: '#d8d8d2'});

await ex('layer.newLight', {kind: 'Ambient', intensity: 45, color: '#bfe6ff'});
await ex('layer.newLight', {kind: 'Spot', name: 'sol', intensity: 120, color: '#e8fbff', position: [400, -900, -1200], poi: [960, 690, 0], castsShadows: true, shadowDarkness: 55, shadowDiffusion: 30, coneAngle: 120});
await ex('layer.newCamera', {name: 'cam', preset: '50mm', position: [960, -1200, -1500], poi: [960, 660, 60]});
// câmera desce devagar
await c.call('add_keyframe', {layer: 'cam', path: 'transform/position', keys: [{time: 0, value: [1150, -1300, -1650]}, {time: 6, value: [880, -1100, -1400]}], interpolation: 'easyEase'});

// HUD 2D
const shape = (o) => ex('layer.newShape', {kind: 'rect', ...o});
await shape({name: 'hudCard', position: [330, 900], size: [440, 120], fill: '#0e1813', stroke: '#2f4a38', strokeWidth: 2});
await ex('layer.newText', {name: 'hudLbl', text: 'METADE DO ESCRITÓRIO', position: [140, 870], size: 22, font: 'Consolas', fill: '#7fa58a', justify: 'left'});
await ex('layer.newText', {name: 'hudOk', text: '✓ IMPRIME', position: [140, 925], size: 46, font: 'Arial', fauxBold: true, fill: '#5dff7a', justify: 'left'});
await ex('layer.newText', {name: 'sec', text: '01 · A IMPRESSORA DA SEGUNDA', position: [60, 60], size: 26, font: 'Consolas', fill: '#5dff7a', justify: 'left'});

const lst = await c.call('list_effects', {filter: 'glow', compact: true});
console.log(parse(lst)?.toString().slice(0, 300));

const r = await c.call('render_frame', {time: tempo, path: out, max_side: 1280});
console.log(JSON.stringify(parse(r)).slice(0, 300));
await c.call('save_project', {path: out.replace(/\.png$/, '.ecproj')});
c.close();
