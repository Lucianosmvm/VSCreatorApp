import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const root=path.resolve('.'),check=process.argv.includes('--conferir');
const validar=process.argv.includes('--validar-tags');
const roundtrip=process.argv.includes('--validar-estado');
const selecionadas=process.argv.find(a=>a.startsWith('--cenas='))?.slice(8).split(',').map(Number);
// --dia 03 filma o Dia 03 com o diretor dia03.js; sem o parâmetro, o Dia 02 original.
const iDia=process.argv.indexOf('--dia'),DIA=iDia>0?String(+process.argv[iDia+1]).padStart(2,'0'):'02';
const ANT=String(+DIA-1).padStart(2,'0'),ID=`refugio-13-${DIA}`,R13=DIA==='02'?'r13':`r13d${+DIA}`;
const plano=JSON.parse(fs.readFileSync(`projetos/${ID}/plano.json`,'utf8'));
const base=JSON.parse(fs.readFileSync(`projetos/refugio-13-${ANT}/estado.json`,'utf8'));
if(DIA!=='02'){base.votacao={...base.votacao,contagem:plano.apuracaoAnterior};}
const mundoAnterior=DIA!=='02'?JSON.parse(fs.readFileSync(`projetos/refugio-13-${ANT}/mundo.json`,'utf8')):null;
const out=path.join(root,`remotion/public/refugio-13/${ID}`);
const jobs=path.join(root,`remotion/jobs/${ID}`);
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(jobs,{recursive:true});
const chrome=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'refugio13-'));
const porta=9900+Math.floor(Math.random()*300);
const proc=spawn(chrome,['--headless=new',`--remote-debugging-port=${porta}`,`--user-data-dir=${profile}`,'--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore'});
let ws;const erros=[];
try{
 let target;
 for(let i=0;i<40&&!target;i++){await new Promise(r=>setTimeout(r,250));try{target=(await (await fetch(`http://127.0.0.1:${porta}/json`)).json()).find(t=>t.type==='page')}catch{}}
 if(!target)throw Error('Chrome não iniciou');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
 let seq=0;const pending=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}else if(m.method==='Runtime.exceptionThrown')erros.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)};
 const cmd=(method,params={})=>new Promise(r=>{const id=++seq;pending.set(id,r);ws.send(JSON.stringify({id,method,params}))});
 const js=async expression=>{const r=await cmd('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.result?.exceptionDetails)throw Error(r.result.exceptionDetails.exception?.description||r.result.exceptionDetails.text);return r.result?.result?.value};
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:1,mobile:false});
 await cmd('Page.addScriptToEvaluateOnNewDocument',{source:'window.requestAnimationFrame=()=>1;window.cancelAnimationFrame=()=>{};'});
 await cmd('Page.navigate',{url:pathToFileURL(path.join(root,'ferramentas/refugio-13/mundo/index.html')).href});
 await new Promise(r=>setTimeout(r,3000));
 await js('document.fonts.ready.then(()=>true)');
 if(!await js(`!!window.${R13}`))throw Error('Mundo não carregou: '+erros.join('\n'));
 console.log('Mundo:',await js(`${R13}.init(${JSON.stringify({estadoAnterior:base,novos:plano.novos,mundo:mundoAnterior})})`));
 if(roundtrip){
  const salvo=JSON.parse(fs.readFileSync(`projetos/${ID}/mundo.json`,'utf8'));
  console.log('Restauração:',await js(`r13.loadWorld(${JSON.stringify(salvo)})`));
  const restaurado=await js(`${R13}.exportWorld()`);
  if(restaurado.jogo.ground!==salvo.jogo.ground||JSON.stringify(restaurado.estruturas)!==JSON.stringify(salvo.estruturas)||restaurado.jogo.npcs.length!==5)throw Error('Estado restaurado divergente.');
  for(const [id,n] of Object.entries(salvo.atores))if(restaurado.atores[id].x!==n.x||restaurado.atores[id].y!==n.y||restaurado.atores[id].roupa!==n.roupa)throw Error('Sobrevivente restaurado divergente: '+id);
  console.log('Mapa, cinco sobreviventes, aparências, posições e construções restaurados corretamente.');
 }
 const tagsVistas=new Set();let inicio=0;const cenas=[];let colis=0,atravessamentos=0;
 for(const [i,c] of (roundtrip?[]:plano.cenas.entries())){
  await js(`${R13}.setScene(${JSON.stringify(c)},${i})`);
  if(check&&c.acao==='desvio')for(const t of [.6,1.25,1.5,2.1,3.8]){
   const f=await js(`${R13}.frame(${t})`);fs.writeFileSync(path.join(jobs,`combate-${t}.jpg`),Buffer.from(f.imagem,'base64'));
  }
  if(check){const f=await js(`${R13}.frame(${c.dur*.6})`);fs.writeFileSync(path.join(jobs,`mundo-cena-${String(i).padStart(2,'0')}.jpg`),Buffer.from(f.imagem,'base64'));await js(`${R13}.frame(${c.dur})`);console.log('Conferência',i+1,c.acao);continue;}
  if(validar){for(let q=0;q<Math.round(c.dur*30);q++){const f=await js(`${R13}.inspect(${q/30})`);for(let x=0;x<f.tags.length;x++)for(let y=x+1;y<f.tags.length;y++){const a=f.tags[x],b=f.tags[y];if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y){colis++;if(colis<20)console.log('Sobreposição:',c.acao,q,a.nome,b.nome);}}
   for(const tag of f.tags)for(const z of f.infectados){const n=f.atores[tag.id];if(Math.hypot(n.x-z.x,n.y-z.y)<12){atravessamentos++;if(atravessamentos<10)console.log('Contato sem espaço:',c.acao,q,tag.nome);}}
  }await js(`${R13}.inspect(${c.dur})`);continue;}
  const file=path.join(out,`cena-${i+1}.mp4`);
  const gravar=!selecionadas||selecionadas.includes(i+1);
  if(gravar){
  const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-vf','scale=1080:1920:flags=neighbor','-c:v','libx264','-pix_fmt','yuv420p','-preset','medium','-crf','18','-r','30',file],{stdio:['pipe','inherit','inherit']});
  for(let q=0;q<Math.round(c.dur*30);q++){
   const f=await js(`${R13}.frame(${q/30})`);
   for(const tag of f.tags)tagsVistas.add(tag.nome);
   for(let x=0;x<f.tags.length;x++)for(let y=x+1;y<f.tags.length;y++){const a=f.tags[x],b=f.tags[y];if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y)colis++;}
   if(!ff.stdin.write(Buffer.from(f.imagem,'base64')))await new Promise(r=>ff.stdin.once('drain',r));
  }
  ff.stdin.end();const exit=await new Promise(r=>ff.on('close',r));if(exit!==0)throw Error('Erro de codificação na cena '+c.acao);
  }else{
   const f=await js(`${R13}.inspect(${c.dur*.6})`);for(const tag of f.tags)tagsVistas.add(tag.nome);
  }
  await js(`${R13}.frame(${c.dur})`);
  cenas.push({nome:c.acao,video:`refugio-13/${ID}/cena-${i+1}.mp4`,inicio,dur:c.dur,linhas:[`${c.titulo}\n${c.destaque}`],clima:c.clima??(c.acao==='ameaca'?'ameaca':null),cta:c.acao==='convite',audio:c.audio,tempos:c.tempos});inicio+=c.dur;
  console.log(`Filmando ${i+1}/${plano.cenas.length}: ${c.acao}`);
 }
 if(validar){console.log('Total de sobreposições:',colis,'; atravessamentos de infectados:',atravessamentos);if(colis||atravessamentos)process.exitCode=1;}
 if(!check&&!validar&&!roundtrip){
  const mundo=await js(`${R13}.exportWorld()`);
  fs.writeFileSync(`projetos/${ID}/mundo.json`,JSON.stringify(mundo,null,2));
  fs.writeFileSync(path.join(out,'video.json'),JSON.stringify({id:ID,episodio:+DIA,vila:'Refúgio 13',largura:1080,altura:1920,fps:30,duracao:inicio,cenas,validacao:{nomes:[...tagsVistas],sobreposicoesTags:colis,avisos:erros}},null,2));
  console.log(`Pronto: ${inicio}s. Tags identificadas: ${[...tagsVistas].join(', ')}. Sobreposições: ${colis}.`);
 }
 if(erros.length)console.log('Avisos:',erros.slice(0,3));
}finally{try{ws?.close()}catch{}proc.kill();}
