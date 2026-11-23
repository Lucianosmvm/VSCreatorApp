/* Refúgio 13 — Dia 04: o mercado. Mesmo mapa e sobreviventes do Dia 03
   (restaurados de projetos/refugio-13-03/mundo.json). Diretor separado para não
   alterar as filmagens já exportadas. */
window.r13d4=(()=>{
 const colors={lia:'#be765b',nilo:'#629eaa',eva:'#c2a263',ulisses:'#e4e9de',giu:'#7c895b'};
 const names={lia:'Lia',nilo:'Nilo',eva:'Eva',ulisses:'ULISSES',giu:'Velho Giu'};
 const S={x:1296,y:1024},M={x:1136,y:880},C={x:1368,y:1026};
 let scene=null,sceneIndex=-1,elapsed=0,snap=null,actors={},infectados=[],props={},tagRects=[],escondidos=new Set();
 const rand=mulberry32(130218),mix=(a,b,p)=>a+(b-a)*p;
 const ease=p=>{p=Math.max(0,Math.min(1,p));return p*p*(3-2*p)};
 const p=(x,y)=>({x,y});
 const DIA=['resultado','giu','equipe','saida','ameaca','distracao','entrada','saque','volta','golpe','fuga','exame','reservas','agua','opcao-a','opcao-b','votacao','convite'];
 const depoisDe=(a,b)=>DIA.indexOf(a)>=DIA.indexOf(b);
 function pathAt(points,t){
  if(points.length===1)return {...points[0],moving:false,dir:'down'};
  const ds=points.slice(1).map((b,i)=>Math.hypot(b.x-points[i].x,b.y-points[i].y));
  let rest=Math.max(0,Math.min(1,t))*ds.reduce((a,b)=>a+b,0);
  for(let i=0;i<ds.length;i++){
   if(rest<=ds[i]||i===ds.length-1){const a=points[i],b=points[i+1],u=ds[i]?Math.min(1,rest/ds[i]):1;return {x:mix(a.x,b.x,u),y:mix(a.y,b.y,u),moving:t>0&&t<1,dir:Math.abs(b.x-a.x)>Math.abs(b.y-a.y)?(b.x>a.x?'right':'left'):(b.y>a.y?'down':'up')};}
   rest-=ds[i];
  }
 }
 function actor(id,position){
  const n=makeNPC(names[id],id==='ulisses'?'medico':'custom',id==='lia'||id==='eva'?'f':'m',id==='giu'?'Contador de histórias':id,1+Object.keys(actors).length);
  Object.assign(n,{...position,active:true,inside:false,sleeping:false,si:id==='nilo'?3:1,hi:id==='giu'?7:0,pi:0,ci:0,beard:id==='giu',dir:'down',shirt:colors[id],pants:'#343b38',hairC:id==='giu'?'#b6b5a5':'#352b27',skin:id==='nilo'?'#b77d58':'#e0b49a',moving:false,walkT:0});
  return n;
 }
 function init(input){
  if(input.estadoAnterior?.votacao?.contagem?.vencedora!=='A')throw Error('Dia 04 requer a decisão A (mercado) apurada no Dia 03.');
  seed=130218;villageName='Refúgio 13';mins=1800;SEASON='verao';
  Object.assign(GRASS.verao,{b:'#587347',d:'#48633c',l:'#71895a',fl:.005});
  ground=new Uint8Array(N);obj=new Uint8Array(N);objVar=new Uint8Array(N);crop=new Uint8Array(N);cropT=new Float32Array(N);bld=new Int16Array(N).fill(-1);
  buildings=[];npcs=[];queue=[];bById.clear();nextId=1;nextBid=1;particles=[];butterflies=[];res={wood:0,stone:0,fish:0,crops:0,meals:2,coins:0,tools:1};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   const i=idx(x,y);objVar[i]=(rand()*4)|0;
   const bairro=x>65&&x<100&&y>47&&y<77;
   if(!bairro&&rand()<.19)obj[i]=O_TREE;
   else if(!bairro&&rand()<.035)obj[i]=O_ROCK;
   if((y>=64&&y<=65&&x>=64&&x<=103)||(x>=90&&x<=92&&y>=55&&y<=65)||(x>=70&&x<=72&&y>=55&&y<=65))ground[i]=G_PATH;
   if(x===75||x===76)ground[i]=G_RAIL;
  }
  for(let y=62;y<74;y++)for(let x=77;x<88;x++){obj[idx(x,y)]=0;if(y<67)ground[idx(x,y)]=G_PATH;}
  BT.ferraria.w=5;BT.ferraria.h=4;
  const build=(type,x,y)=>{const d=BT[type],b={id:nextBid++,type,x,y,w:d.w,h:d.h,done:true,progress:d.time,need:d.time,manual:false,owner:null};placeBuilding(b);buildings.push(b);bById.set(b.id,b);return b;};
  const station=build('estacao',78,59),garage=build('ferraria',89,52);build('mercado',69,51);
  station._st={...bStyle(station),wc:'#a1765b',rc:'#78554a',feat:['canopy','clock']};
  garage._st={...bStyle(garage),wc:'#8a8b79',rc:'#566366',forge:false,feat:['anvil','stack']};
  build('casa',64,49)._st={wall:'brick',wc:'#897765',roof:'gable',rc:'#655b50',feat:[],door:'#3c3930'};
  build('casa',96,46)._st={wall:'plaster',wc:'#92917d',roof:'hip',rc:'#52645f',feat:[],door:'#3d4439'};
  actors={};
  const salvo=input.mundo.atores;
  for(const id of ['lia','nilo','eva','ulisses','giu'])actors[id]=actor(id,p(salvo[id].x,salvo[id].y));
  npcs=Object.values(actors);nextId=6;
  // Infectados: três atrás da barreira leste (longe), três na porta do mercado.
  infectados=Array.from({length:6},(_,i)=>{const n=actor('giu',p(1660+i*20,1032));Object.assign(n,{id:100+i,name:'',skin:'#879482',shirt:i%2?'#535f58':'#666457',hairC:'#535a4d',beard:false,prof:'custom',dir:'left'});return n;});
  props={cisterna:1,calha:1,barreira:1,filtro:1,fogo:true,radio:false,caixas:0,carrinho:null,lata:null};
  const originalTile=drawGroundTile;
  drawGroundTile=function(x,y){
   if(ground[idx(x,y)]!==G_PATH)return originalTile(x,y);
   const X=x*T,Y=y*T;px(gctx,'#76796b',X,Y,16,16);
   for(let k=0;k<10;k++)px(gctx,k%2?'#676d61':'#858878',X+((hash(x,y,k)*15)|0),Y+((hash(x,y,k+30)*15)|0),k%3?1:2,1);
   if(hash(x,y,90)<.3){px(gctx,'#4d594d',X+5,Y,1,7);px(gctx,'#4d594d',X+6,Y+6,3,1);px(gctx,'#4d594d',X+8,Y+7,1,5);}
  };
  redrawAllGround();
  window.__r13input=input;
  return {pessoas:npcs.length,predios:buildings.length};
 }
 function setScene(c,i){
  scene=c;sceneIndex=i;elapsed=0;
  for(const n of Object.values(actors)){n.carry=null;n.anim=null;n.moving=false;n.dir='down';}
  snap=Object.fromEntries(Object.entries(actors).map(([id,a])=>[id,{x:a.x,y:a.y}]));
  return true;
 }
 function move(id,points,q){Object.assign(actors[id],pathAt([snap[id],...points],q));}
 const at=(id,x,y,dir)=>Object.assign(actors[id],{x,y,dir:dir||actors[id].dir,moving:false});
 // Posições fixas de cada fase da missão.
 const ESCONDE={nilo:p(1150,960),eva:p(1186,976),giu:p(1214,952)};
 const PORTA={nilo:p(1174,878),eva:p(1196,906),giu:p(1214,952)};
 const OESTE=[p(1052,928),p(1076,944),p(1100,912)];
 const MERCADO_PORTA=[p(1110,896),p(1136,904),p(1160,894)];
 const ESTACAO={lia:p(1236,1100),eva:p(1290,1072),nilo:p(1334,1068),giu:p(1378,1080),ulisses:p(1420,1096)};
 function update(t){
  elapsed=t;gtime=sceneIndex*8+t;escondidos=new Set();
  for(const a of Object.values(actors)){a.moving=false;a.walkT=gtime;a.animT=t;}
  const a=scene.acao,q=ease(t/Math.max(1,scene.dur-.25)),q2=ease(t/2);
  mins=['agua','opcao-a','opcao-b'].includes(a)?2120:['votacao','convite'].includes(a)?2280:depoisDe(a,'exame')?1950:1560;
  // Infectados do mercado: na porta, até a distração; depois no lado oeste; o terceiro volta e cai.
  const mz=infectados.slice(3);
  for(const [i,z] of mz.entries()){z.down=false;z.moving=false;z.walkT=gtime*.5;z.dir='left';
   if(DIA.indexOf(a)<DIA.indexOf('distracao')){const b=MERCADO_PORTA[i];z.x=b.x+Math.sin(gtime*1.3+i)*3;z.y=b.y;z.moving=true;}
   else if(a==='distracao'){const ida=ease((t-1.7-i*.25)/(scene.dur-2.2));const alvo=OESTE[i];const b=MERCADO_PORTA[i];z.x=mix(b.x,alvo.x,i===2?ida*.85:ida);z.y=mix(b.y,alvo.y,ida);z.moving=ida>0&&ida<1;}
   else {const alvo=OESTE[i];z.x=alvo.x;z.y=alvo.y;}
  }
  const z2=mz[2];
  if(a==='volta'){const u=ease((t-.6)/(scene.dur-1));z2.x=mix(OESTE[2].x,1124,u);z2.y=mix(OESTE[2].y,898,u);z2.dir='right';z2.moving=u>0&&u<1;}
  if(a==='golpe'){z2.dir='right';if(t<1.25){z2.x=1124+ease(t/1.25)*4;z2.y=898;z2.moving=true;}else{z2.x=1114;z2.y=900;z2.down=true;}}
  if(depoisDe(a,'fuga')){z2.x=1114;z2.y=900;z2.down=true;}
  // Infectados da rua leste: longe, atrás da barreira.
  for(const [i,z] of infectados.slice(0,3).entries()){z.x=1664+i*22;z.y=1028+i*12;z.dir='left';z.moving=false;z.down=false;}
  if(a==='resultado'){
   for(const [id,pos] of Object.entries(ESTACAO))move(id,[pos],q2);
   for(const id in actors)if(t>2)actors[id].dir='up';
  }
  if(a==='giu'){for(const [id,pos] of Object.entries(ESTACAO))at(id,pos.x,pos.y,'up');actors.giu.anim='speech';actors.giu.dir='left';}
  if(a==='equipe'){
   move('nilo',[p(1212,1046)],q2);move('eva',[p(1252,1058)],q2);move('giu',[p(1292,1046)],q2);
   move('lia',[p(1270,1108)],q2);move('ulisses',[p(1330,1108)],q2);
   if(t>2)for(const id of ['nilo','eva','giu'])actors[id].dir='left';
  }
  if(a==='saida'){
   const qe=ease((t-.7)/Math.max(1,scene.dur-.9)),qg=ease((t-1.3)/Math.max(1,scene.dur-1.4));
   move('nilo',[p(1176,1044),ESCONDE.nilo],q);move('eva',[p(1206,1052),ESCONDE.eva],qe);move('giu',[p(1236,1044),ESCONDE.giu],qg);
  }
  if(a==='ameaca'){for(const [id,pos] of Object.entries(ESCONDE))at(id,pos.x,pos.y,'up');}
  if(a==='distracao'){
   for(const [id,pos] of Object.entries(ESCONDE))at(id,pos.x,pos.y,'up');
   actors.giu.dir='left';actors.giu.anim=t<1.8?'speech':null;
   // A lata sai da mão do Giu, faz um arco e cai do outro lado da rua.
   const u=Math.max(0,Math.min(1,(t-.8)/.9));
   props.lata=t>=.8?{x:mix(1210,1056,u),y:mix(944,930,u)-Math.sin(u*Math.PI)*46,caiu:u>=1,t:t-1.7}:null;
  }
  if(DIA.indexOf(a)>DIA.indexOf('distracao'))props.lata={x:1056,y:930,caiu:true,t:9};
  if(a==='entrada'){
   at('giu',ESCONDE.giu.x,ESCONDE.giu.y,'left');
   move('nilo',[PORTA.nilo],q2);move('eva',[PORTA.eva],q2);
   if(t>1.6){actors.nilo.dir='left';actors.nilo.anim='hammer';}
  }
  if(a==='saque'){
   at('nilo',PORTA.nilo.x,PORTA.nilo.y,'left');at('giu',ESCONDE.giu.x,ESCONDE.giu.y,'left');
   // Eva entra, some lá dentro e volta com a primeira caixa.
   if(t<1.2)move('eva',[p(1160,888)],ease(t/1.2));
   else if(t<3.4){at('eva',1160,888);escondidos.add('eva');}
   else {Object.assign(actors.eva,pathAt([p(1160,888),p(1160,916),PORTA.eva],ease((t-3.4)/1.6)));actors.eva.dir='right';actors.eva.carry='caixa';}
   props.caixas=t>3.4?1:0;
  }
  if(a==='volta'){
   at('nilo',PORTA.nilo.x,PORTA.nilo.y,'left');at('giu',ESCONDE.giu.x,ESCONDE.giu.y,'left');
   at('eva',PORTA.eva.x,PORTA.eva.y,'left');actors.eva.carry='caixa';
   if(t>1.6){actors.nilo.dir='left';actors.eva.x=mix(PORTA.eva.x,1214,ease((t-1.6)/1.5));actors.eva.y=mix(PORTA.eva.y,918,ease((t-1.6)/1.5));actors.eva.moving=t<3.1;}
  }
  if(a==='golpe'){
   at('giu',ESCONDE.giu.x,ESCONDE.giu.y,'left');at('eva',1214,918,'left');actors.eva.carry='caixa';
   // Antecipação, empurrão, impacto e recuo; Nilo fica sempre a um carrinho de distância.
   if(t<1.25){actors.nilo.x=mix(PORTA.nilo.x,1156,ease(t/1.25));actors.nilo.y=mix(PORTA.nilo.y,888,ease(t/1.25));actors.nilo.moving=true;actors.nilo.dir='left';}
   else if(t<2.4){at('nilo',1156,888,'left');}
   else {actors.nilo.x=mix(1156,1190,ease((t-2.4)/1.6));actors.nilo.y=mix(888,940,ease((t-2.4)/1.6));actors.nilo.moving=true;actors.nilo.dir='right';actors.nilo.carry='caixa';}
   const c=t<1.25?mix(1150,1132,ease(t/1.25)):t<1.6?1132:1132-Math.min(6,(t-1.6)*8);
   props.carrinho={x:c,y:890,tomba:t>=1.25};
   if(t>2.4){actors.giu.carry='caixa';}
  }
  if(depoisDe(a,'fuga'))props.carrinho={x:1126,y:890,tomba:true};
  if(a==='fuga'){
   for(const id of ['nilo','eva','giu'])actors[id].carry='caixa';
   move('nilo',[p(1166,1000),p(1180,1044),p(1300,1050)],q);
   move('eva',[p(1200,1010),p(1214,1052),p(1260,1060)],q);
   move('giu',[p(1236,1000),p(1250,1046),p(1340,1046)],q);
   at('lia',1270,1108,'up');at('ulisses',1330,1108,'up');
  }
  if(a==='exame'){
   at('nilo',1300,1050,'down');at('eva',1260,1060,'down');at('giu',1340,1046,'down');at('lia',1226,1100,'up');
   const alvo=t<scene.dur/3?1260:t<scene.dur*2/3?1300:1340;
   actors.ulisses.x=mix(actors.ulisses.x,alvo,.2);actors.ulisses.x=alvo;actors.ulisses.y=1086;actors.ulisses.dir='up';actors.ulisses.anim='speech';
   props.caixas=3;
  }
  if(a==='reservas'){
   at('nilo',1300,1050,'down');at('giu',1360,1052,'down');at('lia',1226,1100,'up');at('ulisses',1400,1090,'left');
   move('eva',[p(1326,1086)],q2);actors.eva.dir='up';props.caixas=3;res.meals=9;
  }
  if(a==='agua'){
   at('nilo',1330,1046,'up');at('giu',1236,1150,'left');at('ulisses',1400,1090,'left');at('eva',1290,1126,'left');
   move('lia',[p(1296,1092)],q2);actors.lia.dir='up';props.caixas=3;
  }
  if(DIA.indexOf(a)>=DIA.indexOf('opcao-a')){at('nilo',1330,1046,'up');at('giu',1236,1150,'left');at('ulisses',1400,1090,'left');at('eva',1290,1126,'left');at('lia',1296,1092,'up');props.caixas=3;}
 }
 function camera(){
  const a=scene.acao;
  let x=C.x,y=1050,z=3;
  if(['votacao','convite'].includes(a)){x=1300;y=1000;z=1.15;}
  else if(a==='resultado'){x=1334;y=1060;z=2.6;}
  else if(a==='giu'){x=1370;y=1070;z=4.3;}
  else if(a==='equipe'){x=1292;y=1074;z=2.9;}
  else if(a==='saida'){x=mix(1250,1180,ease(elapsed/scene.dur));y=mix(1044,968,ease(elapsed/scene.dur));z=2.9;}
  else if(a==='ameaca'){x=1156;y=930;z=3;}
  else if(a==='distracao'){x=1120;y=932;z=2.5;}
  else if(a==='entrada'){x=1170;y=900;z=3.8;}
  else if(a==='saque'){x=1172;y=896;z=3.8;}
  else if(a==='volta'){x=1150;y=904;z=3.2;}
  else if(a==='golpe'){x=1150;y=904;z=3.4;}
  else if(a==='fuga'){x=mix(1180,1280,ease(elapsed/scene.dur));y=mix(980,1050,ease(elapsed/scene.dur));z=2.7;}
  else if(a==='exame'){x=1300;y=1070;z=3.9;}
  else if(a==='reservas'){x=1326;y=1070;z=4.2;}
  else if(a==='agua'){x=1296;y=1080;z=3;}
  else if(a==='opcao-a'){x=1368;y=1030;z=3.3;}
  else if(a==='opcao-b'){x=1520;y=1036;z=2.1;}
  cam.x=x;cam.y=y;cam.z=z*(1+.025*ease(elapsed/scene.dur));
 }
 const rect=(c,x,y,w,h)=>px(ctx,c,Math.round(x),Math.round(y),w,h);
 function tubo(x,y){rect('#5d6b6a',x,y,10,3);rect('#a6b4b0',x,y,10,1);}
 function caixa(x,y){rect('#6b4a2c',x,y,12,9);rect('#a87c4a',x,y,12,2);rect('#3c2a18',x+5,y+2,2,7);}
 function details(){
  const a=scene.acao;
  // Persistentes: plataforma, cerca, posto de socorros, cisterna pronta, calha, barreira, filtro e fogueira.
  rect('#777361',1210,1000,24,118);for(let y=1000;y<1118;y+=6)rect('#5c5c4d',1210,y,24,1);
  for(let x=1220;x<1326;x+=19){rect('#684f39',x,1112,3,15);rect('#ac8a58',x,1114,17,3);rect('#806b46',x,1121,17,2);}
  drawCrate(1328,1064);
  rect('#1c3529',1285,977,22,9);ctx.font='9px "Pixelify Sans",monospace';ctx.fillStyle='#e9d9a3';ctx.textAlign='center';ctx.fillText('13',1296,984);
  for(let i=0;i<45;i++){const x=1080+(hash(i,4,13)*510|0),y=815+(hash(i,9,13)*370|0);if(i%3===0){rect('#646b5b',x,y,4,2);rect('#909079',x+1,y-1,2,1);}else rect('#7e8c59',x,y,1,3);}
  rect('#333e37',1190,1000,14,28);rect('#68766c',1191,1004,12,20);rect('#283e3b',1193,1008,8,5);rect('#191f1c',1188,1005,3,7);rect('#191f1c',1203,1018,3,7);
  rect('#775b3d',1350,1135,3,13);rect('#775b3d',1385,1135,3,13);rect('#a88c5b',1348,1129,42,5);rect('#d0b078',1348,1129,42,1);
  rect('#e0e7da',1360,1122,12,7);rect('#3b8b70',1365,1123,2,5);rect('#3b8b70',1363,1125,6,1);
  ctx.font='6px "Pixelify Sans",monospace';ctx.textAlign='center';rect('#253f32',1352,1116,34,7);ctx.fillStyle='#dee8ce';ctx.fillText('SOCORROS',1369,1122);
  rect('#303f3b',1355,1006,27,41);rect('#8a9d8d',1355,1006,27,3);rect('#536d67',1357,1010,23,34);rect('#1f302b',1365,1047,5,5);
  tubo(1382,1040);tubo(1392,1040);rect('#5d6b6a',1400,1040,3,12);
  // Água filtrada baixando ao longo do dia; na opção A, gotas de chuva começam a cair.
  const nivel=depoisDe(a,'agua')?4:9;rect('#5c9fb1',1358,1043-nivel,21,nivel);rect('#91b7a2',1358,1043-nivel,21,1);
  rect('#6d7774',1338,986,30,3);rect('#6d7774',1366,986,3,20);
  for(let k=0;k<5;k++){rect('#684f39',1444,1006+k*12,3,12);rect('#ac8a58',1440,1008+k*12,12,3);rect('#806b46',1440,1013+k*12,12,2);}
  rect('#7a7f80',1262,1110,14,12);rect('#7a7f80',1262,1124,14,12);rect('#eee8d6',1263,1111,12,2);rect('#d8c08a',1263,1114,12,3);rect('#2a2a2a',1263,1118,12,3);
  rect('#5b3d24',1236,1138,16,3);const f=Math.sin(gtime*18)*1.5;rect('#ff9b3d',1240,1132-f,8,6+f);rect('#ffd23f',1242,1134,4,4);rect('#3c4446',1237,1125,14,8);rect('#7d8789',1237,1125,14,2);
  if(Math.random()<.4)particles.push({x:1244+rnd(-3,3),y:1122,vx:rnd(-3,3),vy:-12,life:1.6,max:1.6,type:'smoke',size:2});
  // Lata da distração: arco, quique e barulho.
  if(props.lata){rect('#b9c2c4',props.lata.x-2,props.lata.y-2,4,4);rect('#6d7774',props.lata.x-2,props.lata.y+1,4,1);
   if(props.lata.caiu&&props.lata.t<.8){const u=props.lata.t/.8;ctx.globalAlpha=1-u;ctx.strokeStyle='#f9d995';ctx.lineWidth=1;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(props.lata.x,props.lata.y,4+u*16+k*5,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;}}
  // Porta lateral do mercado forçada pelo Nilo.
  if(depoisDe(a,'entrada')){const ab=a==='entrada'?ease((elapsed-2.2)/1.4):1;rect('#3a2a1c',1166,858,8,14);rect('#6d4c30',1166+ab*6,858,8-ab*6,14);}
  // Carrinho de compras.
  if(props.carrinho){const c=props.carrinho;ctx.save();if(c.tomba){ctx.translate(c.x,c.y);ctx.rotate(-.5);ctx.translate(-c.x,-c.y);}
   rect('#9aa6aa',c.x-9,c.y-6,16,8);for(let k=0;k<4;k++)rect('#5d6b6a',c.x-8+k*4,c.y-6,1,8);rect('#5d6b6a',c.x-9,c.y+2,16,1);rect('#2b2f30',c.x-7,c.y+3,2,2);rect('#2b2f30',c.x+4,c.y+3,2,2);rect('#c7d0d2',c.x+7,c.y-9,1,5);ctx.restore();
   if(scene.acao==='golpe'&&elapsed>1.25&&elapsed<1.65){const u=(elapsed-1.25)/.4;ctx.globalAlpha=1-u;for(let k=0;k<6;k++){const an=k*Math.PI*2/6;rect('#f9d995',1126+Math.cos(an)*(5+u*10),894+Math.sin(an)*(5+u*10),2,2);}ctx.globalAlpha=1;}}
  // Caixas de comida trazidas do mercado, empilhadas na estação.
  if(props.caixas>=3&&depoisDe(a,'exame')){caixa(1300,1062);caixa(1314,1062);caixa(1307,1054);}
  // Rotas da votação: A fica na cisterna; B sai pela rua leste até o rio.
  if(['opcao-a','opcao-b','votacao','convite'].includes(a)){
   const rota=(cor,points,letra,bx,by)=>{ctx.strokeStyle=cor;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.lineDashOffset=-gtime*7;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);rect('#172822',bx-9,by-10,18,18);ctx.font='bold 14px "Pixelify Sans",monospace';ctx.fillStyle=cor;ctx.textAlign='center';ctx.fillText(letra,bx,by+4);};
   if(a!=='opcao-b'){rect('#172822',1359,976,18,18);ctx.font='bold 14px "Pixelify Sans",monospace';ctx.fillStyle='#ffce75';ctx.textAlign='center';ctx.fillText('A',1368,990);}
   if(a!=='opcao-a'){rota('#8fe6d3',[[1340,1040],[1430,1040],[1470,1060],[1640,1060],[1720,1060]],'B',1700,1040);
    ctx.font='bold 10px "Pixelify Sans",monospace';ctx.fillStyle='#8fe6d3';ctx.textAlign='center';ctx.fillText('RIO',1700,1080);}
  }
 }
 function renderWorld(){
  cv.width=540;cv.height=960;cw=540;ch=960;dpr=1;camera();
  const a=scene.acao,noite=['votacao','convite'].includes(a),tarde=['agua','opcao-a','opcao-b'].includes(a);
  ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#3f5639';ctx.fillRect(0,0,540,960);
  const ox=Math.round(cw/2-cam.x*cam.z),oy=Math.round(ch/2-cam.y*cam.z);ctx.setTransform(cam.z,0,0,cam.z,ox,oy);
  ctx.drawImage(groundCv,0,0);
  for(let y=Math.max(0,(cam.y-ch/2/cam.z)/T|0);y<Math.min(H,(cam.y+ch/2/cam.z)/T+2);y++)for(let x=Math.max(0,(cam.x-cw/2/cam.z)/T|0);x<Math.min(W,(cam.x+cw/2/cam.z)/T+2);x++)if(obj[idx(x,y)]===O_TREE)ctx.drawImage(treeImgs[objVar[idx(x,y)]&3],x*T-4,y*T-18);
  const lights=[];
  for(const b of buildings)drawBuilding(b,lights,b.type==='estacao'&&noite);
  details();
  const foco={votacao:[],convite:[],'opcao-b':[],resultado:null,giu:['giu','nilo','ulisses'],equipe:null,saida:['nilo','eva','giu'],ameaca:['nilo','eva','giu'],distracao:['nilo','eva','giu'],entrada:['nilo','eva','giu'],saque:['nilo','eva','giu'],volta:['nilo','eva','giu'],golpe:['nilo','eva','giu'],fuga:['nilo','eva','giu'],exame:['ulisses','nilo','eva','giu'],reservas:['eva','nilo','giu'],agua:['lia','eva','nilo'],'opcao-a':['lia','nilo']};
  const visiveis=Object.entries(actors).filter(([id])=>(!foco[a]||foco[a].includes(id))&&!escondidos.has(id));
  const desenhar=[...visiveis.map(([id,n])=>({id,n})),...infectados.map(n=>({id:null,n}))].sort((x,y)=>x.n.y-y.n.y);
  for(const {n} of desenhar){
   ctx.save();
   if(n.down){ctx.translate(n.x,n.y-4);ctx.rotate(-Math.PI/2);ctx.translate(-n.x,-n.y+4);}
   drawNPC(n);if(n.id>=100){rect('#9aa58b',n.x-2,n.y-12,1,1);rect('#9aa58b',n.x+1,n.y-12,1,1);rect('#879482',n.x-7,n.y-11,4,2);rect('#879482',n.x+3,n.y-11,4,2);rect('#263b32',n.x-2,n.y-6,2,2);}
   ctx.restore();
  }
  // Caixas carregadas por cima dos personagens (desenhadas depois deles).
  for(const [id,n] of visiveis)if(n.carry==='caixa')caixa(n.x-6,n.y-28);
  for(const P of particles){if(P.type==='smoke'){P.life-=1/30;P.x+=P.vx/30;P.y+=P.vy/30;ctx.globalAlpha=Math.max(0,P.life/P.max)*.5;rect('#c9c9c0',P.x,P.y,P.size,P.size);ctx.globalAlpha=1;}}
  particles=particles.filter(P=>P.life>0);
  ctx.setTransform(1,0,0,1,0,0);
  if(noite||tarde){
   lightCv.width=540;lightCv.height=960;lctx.clearRect(0,0,540,960);lctx.globalCompositeOperation='source-over';lctx.fillStyle=noite?'rgba(14,24,42,.36)':'rgba(40,46,58,.26)';lctx.fillRect(0,0,540,960);lctx.globalCompositeOperation='destination-out';
   if(noite)for(const L of [...lights,{x:1296,y:1010,r:95}]){const x=L.x*cam.z+ox,y=L.y*cam.z+oy,r=(L.r||40)*cam.z;const g=lctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,.9)');g.addColorStop(1,'rgba(0,0,0,0)');lctx.fillStyle=g;lctx.fillRect(x-r,y-r,r*2,r*2);}
   ctx.drawImage(lightCv,0,0);
  }
  // Céu fechando: sombras de nuvens passando sobre o mapa.
  if(depoisDe(a,'agua')){for(let k=0;k<5;k++){const x=((gtime*14+k*150)%760)-110,y=80+k*170;ctx.fillStyle='rgba(20,26,36,.22)';ctx.beginPath();ctx.ellipse(x,y,120,46,0,0,Math.PI*2);ctx.fill();}}
  if(a==='opcao-a'){ctx.fillStyle='rgba(170,200,230,.55)';for(let k=0;k<40;k++){const x=(hash(k,1,4)*540+gtime*40)%540,y=(hash(k,7,4)*960+gtime*420)%960;ctx.fillRect(x|0,y|0,1,7);}}
  tagRects=[];ctx.textAlign='center';ctx.textBaseline='middle';const tagFs=Math.round(clamp(cam.z*3.6,10,14));ctx.font=`600 ${tagFs}px "Pixelify Sans",monospace`;
  for(const [id,n] of visiveis){
   const sx=n.x*cam.z+ox,sy=(n.y-(n.carry?36:25))*cam.z+oy,w=ctx.measureText(n.name).width+10;
   if(sx<10||sx>530||sy<14||sy>925)continue;
   ctx.fillStyle='rgba(14,28,23,.88)';ctx.fillRect(Math.round(sx-w/2),Math.round(sy-tagFs*.7),Math.round(w),tagFs*1.4);
   ctx.fillStyle=id==='ulisses'?'#f8f8eb':id==='giu'?'#e0e7b2':'#fff3cd';ctx.fillText(n.name,Math.round(sx),Math.round(sy));
   tagRects.push({id,nome:n.name,x:sx-w/2,y:sy-tagFs*.7,w,h:tagFs*1.4});
  }
  return tagRects;
 }
 function exportWorld(){return {v:1,universo:'refugio-13',dia:4,jogo:JSON.parse(serialize()),atores:Object.fromEntries(Object.entries(actors).map(([id,n])=>[id,{x:n.x,y:n.y,roupa:n.shirt,nome:n.name}])),infectados:infectados.map(n=>({x:n.x,y:n.y,caido:!!n.down})),estruturas:{cisterna:true,calha:true,barreira:true,filtro:true,fogo:true,radio:false,caixasComida:3,portaMercadoAberta:true},locais:{estacao:S,cisterna:C,mercado:M},decisaoAnterior:window.__r13input.estadoAnterior.votacao.contagem,suprimentos:{aguaHoras:8,comidaDias:3,tabuas:0}};}
 return {init,setScene,inspect:t=>{update(t);return {tags:renderWorld(),atores:Object.fromEntries(Object.entries(actors).filter(([id])=>!escondidos.has(id)).map(([id,n])=>[id,{x:n.x,y:n.y}])),infectados:infectados.map(n=>({x:n.x,y:n.y,caido:n.down}))};},frame:t=>{update(t);const tags=renderWorld();return {imagem:cv.toDataURL('image/jpeg',.94).slice(23),tags};},exportWorld};
})();
