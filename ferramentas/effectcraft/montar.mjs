import {connect} from './mcp-client.mjs';
import {resolve} from 'node:path';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const kind=process.argv[2]||'short',dir=resolve('exportacoes/heranca-csharp');
const tl=JSON.parse(readFileSync(`${dir}/${kind}-timeline.json`));
const vertical=kind==='short',W=tl.largura,H=tl.altura;
const C={bg:'#141c15',panel:'#202c23',line:'#526a45',cream:'#f2ead8',yellow:'#FFD23F',muted:'#a6b097',blue:'#83c7e9',red:'#ed8170',green:'#a6d478',ink:'#101810'};
mkdirSync(`${dir}/stills`,{recursive:true});
const cli=await connect();let commands=0;
const parse=r=>{const x=r.content?.find(c=>c.type==='text');return x?JSON.parse(x.text):r};
async function exec(command,params){commands++;return parse(await cli.call('execute_command',{command,params}));}
function sceneBuilder(dur){
 const steps=[];let n=0,ease=[];
 const cmd=(command,params)=>{steps.push({command,params});return steps.length};
 const prop=(layer,path,value)=>cmd('prop.set',{layer,path,value});
 const keys=(layer,path,points,eased=true)=>{for(const [time,value]of points){cmd('prop.addKey',{layer,path,time,value});if(eased)ease.push({layer,path,time})}};
 function timing(layer,t=0,end=dur){cmd('layer.timing',{layers:[layer],in:t,out:end});}
 function enter(layer,x,y,t=0,dir=35){keys(layer,'transform/position',[[t,[x,y+dir]],[t+.42,[x,y]]]);keys(layer,'transform/opacity',[[t,0],[t+.25,100]]);timing(layer,t);}
 function rect(name,x,y,w,h,fill,stroke=null,t=0,animate=true){const name1=`${name}-${++n}`;cmd('layer.newShape',{name:name1,kind:'rect',position:[x,y],size:[w,h],fill,...(stroke?{stroke,strokeWidth:2}:{} )});if(animate)enter(name1,x,y,t);return name1;}
 function circle(name,x,y,w,fill,t=0){const name1=`${name}-${++n}`;cmd('layer.newShape',{name:name1,kind:'ellipse',position:[x,y],size:[w,w],fill});enter(name1,x,y,t);return name1;}
 function text(name,txt,x,y,size=40,color=C.cream,t=0,{center=false,font='Arial',bold=false,anim=true,end=dur}={}){const name1=`${name}-${++n}`;cmd('layer.newText',{name:name1,text:txt,position:[x,y],size,font,fill:color,justify:center?'center':'left',fauxBold:bold});if(anim)enter(name1,x,y,t,18);else timing(name1,t,end);return name1;}
 function line(name,x1,y1,x2,y2,t=0,color=C.yellow,width=4){const len=Math.hypot(x2-x1,y2-y1),ang=Math.atan2(y2-y1,x2-x1)*180/Math.PI;const l=rect(name,(x1+x2)/2,(y1+y2)/2,len,width,color,null,t,false);prop(l,'transform/rotation',ang);keys(l,'transform/opacity',[[t,0],[t+.35,100]]);if(width>2)keys(l,'transform/scale',[[t,[0,100]],[t+.5,[100,100]]]);timing(l,t);return l;}
 function card(label,x,y,w=300,h=100,t=0,color=C.yellow,sub=''){rect('card',x,y,w,h,C.panel,color,t);text('label',label,x,y-(sub?8:0),vertical?33:35,color,t+.08,{center:true,bold:true});if(sub)text('sub',sub,x,y+28,vertical?24:25,C.muted,t+.15,{center:true});}
 function enemy(label,x,y,scale=1,t=0,saw=false){
  const s=scale;rect('sombra',x,y+132*s,110*s,9*s,'#0b100c',null,t);
  rect('pernaE',x-19*s,y+87*s,22*s,80*s,'#333b30',null,t+.04);rect('pernaD',x+19*s,y+87*s,22*s,80*s,'#333b30',null,t+.04);
  rect('casaco',x,y+23*s,102*s,100*s,saw?'#795a42':'#566148',C.ink,t+.08);
  rect('braco',x+67*s,y+23*s,22*s,96*s,'#8f9b77',null,t+.12);
  circle('cabeca',x,y-66*s,66*s,saw?'#b5a37d':'#b5bd88',t+.16);
  rect('olho',x-13*s,y-68*s,8*s,5*s,C.ink,null,t+.2);rect('olho',x+13*s,y-68*s,8*s,5*s,C.ink,null,t+.2);
  if(saw){const arm=rect('lamina',x+112*s,y+36*s,120*s,30*s,'#b9bbae',C.ink,t+.3);keys(arm,'transform/rotation',[[t+.3,-15],[t+.8,12],[t+1.2,-8],[t+1.6,0]]);rect('motor',x+65*s,y+40*s,58*s,50*s,C.red,C.ink,t+.3);}
  text('nomeInimigo',label,x,y+184*s,vertical?29:31,C.cream,t+.2,{center:true,bold:true});
 }
 function hp(label,x,y,w=240,t=0,damage=false){
  text('hpLabel',label,x-w/2,y-25,26,C.muted,t);rect('barraFundo',x,y,w,18,'#3d4d38',null,t);
  const bar=rect('vida',x,y,w,18,C.green,null,t);if(damage){keys(bar,'transform/scale',[[t+.8,[100,100]],[t+1.35,[70,100]]]);text('dano','−30',x,y+45,38,C.red,t+.8,{center:true,bold:true});}
 }
 function wrap(str,max){const lines=[];let l='';for(const w of str.split(' ')){if((l+' '+w).trim().length>max&&l){lines.push(l);l=''}l+=(l?' ':'')+w}if(l)lines.push(l);return lines.join('\n');}
 function backdrop(index){
  // Grade e silhuetas da vila: movimentos pequenos preservam a leitura.
  for(let x=0;x<W;x+=120)line('gradeV',x,0,x,H,0,'#253126',1);
  for(let y=0;y<H;y+=120)line('gradeH',0,y,W,y,0,'#253126',1);
  for(let j=0;j<6;j++){const x=j*W/5;const h=110+(j%3)*45;rect('vila',x,H*.66,130,h,'#1a261b',null,0,false);const roof=rect('telhado',x,H*.66-h/2,100,100,'#1a261b',null,0,false);prop(roof,'transform/rotation',45);}
  rect('filete',W/2,vertical?62:45,W-120,3,C.yellow,null,0,false);
  text('marca','DEV SOBREVIVENTE',70,vertical?103:84,vertical?26:24,C.yellow,0,{anim:false,bold:true});
  text('missao',`MISSÃO ${String(index+1).padStart(2,'0')} / ${tl.cenas.length}`,W-70,vertical?103:84,vertical?23:24,C.muted,0,{center:false,anim:false});
  // Texto da missão alinhado pela direita através do ponto de partida.
  prop(`missao-${n}`,'transform/position',[W-(vertical?310:330),vertical?103:84]);
 }
 function graphic(type,c){
  const X=vertical?540:500,Y=vertical?600:460,s=vertical?.95:1;
  const at=(word,fallback)=>{const p=c.palavras.find(p=>p.w.toLowerCase().replace(/[^a-záéíóúâêôãõç]/g,'').includes(word));return Math.min(p?.t??fallback,dur-1)};
  if(['base','arvore','resumo','interface'].includes(type)){
   card('Inimigo',X,Y-125,vertical?340:360,100,.1,C.yellow,'Vida • ReceberDano');
   line('ramo1',X,Y-72,X-200,Y+25,.6);line('ramo2',X,Y-72,X+200,Y+25,.8);
   card(type==='interface'?'IPatrulhavel':'Ganado',X-200,Y+90,vertical?285:330,95,1,C.blue);
   card('Motosserra',X+200,Y+90,vertical?285:330,95,1.25,C.green);
   text('relacao',type==='interface'?'CONTRATOS + ESPECIALIZAÇÃO':'É UM INIMIGO',X,Y+205,vertical?32:36,C.yellow,1.6,{center:true,bold:true});
  }else if(['dano','instancias'].includes(type)){
   enemy('GANADO A',X-180,Y-30,s,.1);enemy('GANADO B',X+200,Y-30,s,.3);
   hp('VIDA: 100 → 70',X-180,Y-175,vertical?220:250,.4,true);hp('VIDA: 100',X+200,Y-175,vertical?220:250,.6,false);
  }else if(['virtual','override','ataque','polimorfismo','lista'].includes(type)){
   const saw=['override','polimorfismo','lista'].includes(type);
   enemy(saw?'MOTOSSERRA':'ALDEÃO',X+(saw?120:-100),Y-15,1.15,.1,saw);
   card(type==='virtual'?'virtual':type==='polimorfismo'?'Inimigo alvo':'Atacar()',X-190,Y-155,vertical?300:320,85,.2,C.blue);
   line('dispatch',X-170,Y-108,X+(saw?100:-80),Y-10,1,C.yellow,6);
   const l=text('acao',saw?'INVESTIDA!':'GOLPE COMUM',X,Y+260,vertical?48:55,C.yellow,at('atac',1.3),{center:true,bold:true});
   keys(l,'transform/scale',[[1.3,[90,90]],[1.65,[104,104]],[1.9,[100,100]]]);
  }else if(type==='duplicacao'){
   for(let j=0;j<3;j++){card(['Aldeão.cs','Escudo.cs','Motosserra.cs'][j],X+(j-1)*(vertical?260:295),Y-60,vertical?240:270,180,.2+j*.18,j===2?C.red:C.line,'Vida + Dano');}
   text('alerta','3 CÓPIAS = 3 MANUTENÇÕES',X,Y+125,vertical?39:43,C.red,1.1,{center:true,bold:true});
   line('riscado',X-370,Y+10,X+370,Y+10,1.4,C.red,6);
  }else if(type==='construtor'){
   card('Inimigo(100)',X,Y-90,vertical?560:620,100,.2,C.yellow,'1. estado comum');
   line('ordem',X,Y-35,X,Y+25,.7);card('Ganado()',X,Y+90,vertical?560:620,100,1,C.blue,'2. corpo da derivada');
   text('base','base(100)',X,Y+205,48,C.yellow,1.4,{center:true,bold:true,font:'Consolas'});
  }else if(type==='acesso'){
   [['private','PRÓPRIA CLASSE',C.red],['protected','BASE + DERIVADAS',C.yellow],['public','CÓDIGO EXTERNO',C.green]].forEach(([a,b,col],j)=>{card(a,X,Y-160+j*140,vertical?640:720,115,.2+j*.35,col,b)});
  }else if(type==='abstract'){
   card('abstract Inimigo',X,Y-120,vertical?660:730,115,.2,C.yellow,'Categoria: não instancia');
   line('abstractRamo',X,Y-60,X,Y+10,.7);card('Ganado concreto',X,Y+90,vertical?660:730,115,1,C.green,'override Atacar()');
   text('new','new Inimigo()  ✗',X,Y+218,vertical?39:45,C.red,1.5,{center:true,font:'Consolas'});
  }else if(type==='composicao'){
   card('LEON',X-210,Y-40,vertical?280:300,150,.2,C.blue,'Sobrevivente');
   line('temUm',X-55,Y-40,X+80,Y-40,.7,C.yellow,6);
   rect('mochila',X+220,Y-40,vertical?245:260,210,'#6f7950',C.cream,1);
   rect('bolso',X+220,Y+12,170,70,'#4b5a35',C.cream,1.15);
   text('inventario','INVENTÁRIO',X+220,Y-55,vertical?26:29,C.cream,1.25,{center:true,bold:true});
   text('tem','TEM UM ≠ É UM',X,Y+190,vertical?49:55,C.yellow,1.4,{center:true,bold:true});
  }else if(type==='cta'||type==='desafio'){
   card(type==='cta'?'MISSÃO CONCLUÍDA':'SUA PRÓXIMA MISSÃO',X,Y-105,vertical?800:850,115,.1,C.yellow);
   text('cta1',type==='cta'?'SALVE • PRATIQUE':'GanadoEscudo : Inimigo',X,Y+15,vertical?48:53,C.cream,.6,{center:true,bold:true});
   text('cta2',type==='cta'?'ACOMPANHE O CANAL':'Reutilize o dano. Mude o ataque.',X,Y+100,vertical?37:39,C.green,1,{center:true});
  }else{enemy('ALDEÃO',X-190,Y-30,1.05,.2);enemy('MOTOSSERRA',X+200,Y-30,1.05,.4,true);text('arena','VILA • MODELO DIDÁTICO',X,Y-220,vertical?34:39,C.yellow,.1,{center:true,bold:true});}
 }
 function code(c){
  const x=vertical?540:1450,y=vertical?1110:475,w=vertical?920:810,h=vertical?430:470;
  rect('editor',x,y,w,h,'#101a16',C.line,.25);rect('barraEditor',x,y-h/2+26,w,52,'#2b382a',null,.3);
  circle('janelaR',x-w/2+25,y-h/2+26,10,C.red,.3);circle('janelaY',x-w/2+45,y-h/2+26,10,C.yellow,.3);circle('janelaG',x-w/2+65,y-h/2+26,10,C.green,.3);
  text('arquivo','C#  /  nossa simulação',x-w/2+90,y-h/2+34,vertical?23:22,C.muted,.35);
  const lines=c.visual.codigo.split('\n');const max=Math.max(...lines.map(l=>l.length));const fs=Math.min(vertical?37:33,(w-65)/(max*.61));
  lines.forEach((l,j)=>{const col=/class |virtual|override|abstract|foreach/.test(l)?C.yellow:l.trim().startsWith('//')?C.muted:C.cream;text('codigo',l,x-w/2+32,y-h/2+100+j*(fs*1.5),fs,col,.55+j*.10,{font:'Consolas'});});
  text('legendaCodigo','EXEMPLO DIDÁTICO • C#',x,y+h/2-20,vertical?20:19,C.muted,.5,{center:true});
 }
 function mascot(c){const name=`Mascote-${++n}`;cmd('layer.addItem',{item:`${c.mascote||'explicando'}.png`,position:[vertical?160:175,vertical?1490:835],duration:dur});cmd('layer.rename',{name});const h=vertical?325:285;prop(name,'transform/scale',[h/875*100,h/875*100]);const x=vertical?160:175,y=vertical?1490:835;keys(name,'transform/position',[[0,[x-100,y]],[.4,[x,y]],[dur*.5,[x,y-6]],[dur-.05,[x,y]]]);}
 function captions(c){
  const maxChars=vertical?26:58,words=c.palavras;let groups=[],g=[];
  for(const word of words){if(g.map(w=>w.w).join(' ').length+word.w.length+1>maxChars&&g.length){groups.push(g);g=[]}g.push(word)}if(g.length)groups.push(g);
  const size=vertical?39:37,cx=vertical?650:1120,cy=vertical?1480:875,maxWidth=vertical?690:1440;
  rect('faixaLegenda',cx,cy+(vertical?0:10),maxWidth,vertical?210:140,'#101710',null,0,false);
  groups.forEach((grp,j)=>{
   const t=Math.min(grp[0].t,dur-.1),end=Math.min(groups[j+1]?.[0].t??dur,dur),str=grp.map(w=>w.w).join(' ');
   const label=str.replace(/C sharp/g,'C#');
   text('frase',label,cx,cy,size,C.cream,t,{center:true,font:'Consolas',anim:false,end});
   // Palavra atual abaixo da frase, com atualização nos timestamps da ElevenLabs.
   grp.forEach((p,k)=>{let en=Math.min(grp[k+1]?.t??end,end);let st=Math.min(p.t,end-.02);text('palavra',p.w==='sharp'?'C#':p.w,cx,cy+60,size+5,C.yellow,st,{center:true,font:'Consolas',bold:true,anim:false,end:en});});
  });
 }
 function finish(){if(ease.length){cmd('keys.select',{keys:ease});cmd('keys.easyEase',{})}return steps;}
 return {cmd,prop,keys,rect,text,backdrop,graphic,code,mascot,captions,wrap,finish};
}
try{
 const poses=[...new Set(tl.cenas.map(c=>(c.mascote||'explicando')+'.png'))];
 await exec('file.import',{paths:poses.map(p=>resolve('remotion/public/mascote',p))});
 const sceneNames=[];
 for(let i=0;i<tl.cenas.length;i++){
  const c=tl.cenas[i],name=`${kind}-cena-${String(i+1).padStart(2,'0')}`;sceneNames.push(name);
  await exec('comp.new',{name,width:W,height:H,duration:c.dur,frameRate:30,background:C.bg});
  const b=sceneBuilder(c.dur);b.backdrop(i);
  b.text('titulo',b.wrap(c.titulo||'Herança em C#',vertical?24:48),vertical?70:70,vertical?220:185,vertical?66:66,C.cream,.02,{bold:true});
  b.graphic(c.visual.tipo,c);b.code(c);b.mascot(c);b.captions(c);
  b.rect('trilho',W/2,H-(vertical?170:40),W-140,4,C.line,null,0,false);
  const progress=b.rect('progresso',70+(W-140)*(i+1)/tl.cenas.length/2,H-(vertical?170:40),(W-140)*(i+1)/tl.cenas.length,5,C.yellow,null,0,false);
  b.text('rodape','HERANÇA EM C#  /  RESIDENT EVIL 4',70,H-(vertical?125:16),vertical?22:19,C.muted,0,{anim:false});
  await cli.call('batch',{steps:b.finish(),label:name});
  if(i%8===0)console.log(`Montagem ${kind}: ${i+1}/${tl.cenas.length}`);
 }
 const main=kind==='long'?'Heranca-CSharp-Longo':'Heranca-CSharp-Short';
 await exec('comp.new',{name:main,width:W,height:H,duration:tl.duracao,frameRate:30,background:C.bg});
 for(let i=0;i<sceneNames.length;i++){
  const layer=(await exec('layer.addItem',{item:sceneNames[i],time:tl.cenas[i].inicio,in:tl.cenas[i].inicio,out:tl.cenas[i].inicio+tl.cenas[i].dur})).layer;
  if(layer){await cli.call('add_keyframe',{layer,path:'transform/opacity',keys:[{time:0,value:0},{time:.10,value:100},{time:tl.cenas[i].dur-.10,value:100},{time:tl.cenas[i].dur,value:0}],interpolation:'easyEase'});}
 }
 const importedAudio=await exec('file.import',{paths:[`${dir}/${kind}-audio.wav`]});
 await exec('layer.addItem',{item:importedAudio.items[0],time:0,in:0,out:tl.duracao});
 await cli.call('save_project',{path:`${dir}/${kind}.ecproj`});
 writeFileSync(`${dir}/${kind}-composicao.json`,JSON.stringify({composicao:main,projeto:`${kind}.ecproj`,duracao:tl.duracao,largura:W,altura:H,fps:30,motor:'EffectCraft 0.21.1',controle:'MCP stdio',audio:`${kind}-audio.wav`},null,2));
 for(const i of (vertical?[0,3,5,7]:[0,5,10,17,20,25,30,37,44,47])){
  const t=tl.cenas[i].inicio+Math.min(2,tl.cenas[i].dur*.5);
  await cli.call('render_frame',{comp:main,time:t,max_side:1280,path:`${dir}/stills/${kind}-${String(i+1).padStart(2,'0')}.png`,inline:false});
 }
 console.log(`Pronto: ${dir}/${kind}.ecproj; ${main}`);
}finally{cli.close()}
