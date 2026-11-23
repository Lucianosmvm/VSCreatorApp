/* Refúgio 13 — Dia 03: a cisterna. Mesmo mundo, mapa e sobreviventes do Dia 02
   (restaurados de projetos/refugio-13-02/mundo.json). Diretor separado para não
   alterar a filmagem já exportada do Dia 02. */
window.r13d3=(()=>{
 const colors={lia:'#be765b',nilo:'#629eaa',eva:'#c2a263',ulisses:'#e4e9de',giu:'#7c895b'};
 const names={lia:'Lia',nilo:'Nilo',eva:'Eva',ulisses:'ULISSES',giu:'Velho Giu'};
 const S={x:1296,y:1024},M={x:1136,y:880},C={x:1368,y:1026};
 let scene=null,sceneIndex=-1,elapsed=0,snap=null,actors={},infectados=[],props={},tagRects=[];
 const rand=mulberry32(130218),mix=(a,b,p)=>a+(b-a)*p;
 const ease=p=>{p=Math.max(0,Math.min(1,p));return p*p*(3-2*p)};
 const p=(x,y)=>({x,y});
 const DIA=['resultado','custo','inspecao','tubos','calha','fundo','ulisses','filtro','fervura','reservas','comida','opcao-a','opcao-b','votacao','convite'];
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
 // Mesmo mapa do Dia 02 (mesma semente e mesmas construções).
 function init(input){
  if(input.estadoAnterior?.votacao?.contagem?.vencedora!=='B')throw Error('Dia 03 requer a apuração confirmada da rota B do Dia 02.');
  seed=130218;villageName='Refúgio 13';mins=1800;SEASON='verao';
  Object.assign(GRASS.verao,{b:'#587347',d:'#48633c',l:'#71895a',fl:.005});
  ground=new Uint8Array(N);obj=new Uint8Array(N);objVar=new Uint8Array(N);crop=new Uint8Array(N);cropT=new Float32Array(N);bld=new Int16Array(N).fill(-1);
  buildings=[];npcs=[];queue=[];bById.clear();nextId=1;nextBid=1;particles=[];butterflies=[];res={wood:3,stone:0,fish:0,crops:0,meals:5,coins:0,tools:1};
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
  // Infectados: três vagam pela rua leste; três seguem perto do mercado.
  infectados=Array.from({length:6},(_,i)=>{const n=actor('giu',p(1600+i*20,1032));Object.assign(n,{id:100+i,name:'',skin:'#879482',shirt:i%2?'#535f58':'#666457',hairC:'#535a4d',beard:false,prof:'custom',dir:'left'});return n;});
  props={...input.mundo.estruturas,cisterna:0,calha:0,barreira:0,filtro:0,fogo:false,radio:false};
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
 function update(t){
  elapsed=t;gtime=sceneIndex*8+t;
  for(const a of Object.values(actors)){a.moving=false;a.walkT=gtime;a.animT=t;}
  const a=scene.acao,q=ease(t/Math.max(1,scene.dur-.25)),q2=ease(t/2);
  mins=['ameaca','barreira','bloqueio'].includes(a)?1680:['votacao','convite','opcao-a','opcao-b'].includes(a)?2280:1800;
  if(a==='resultado'){
   // Todos se reúnem diante da cisterna da estação.
   move('lia',[p(1290,1072)],q2);move('eva',[p(1332,1072)],q2);move('nilo',[p(1374,1068)],q2);move('giu',[p(1416,1096)],q2);move('ulisses',[p(1458,1076)],q2);
   for(const id in actors)if(t>2)actors[id].dir='up';
  }
  if(a==='inspecao'){move('nilo',[p(1368,1062)],q2);actors.nilo.dir='up';actors.nilo.anim=t>1.4?'hammer':null;}
  if(a==='tubos'){
   at('nilo',1368,1062,'up');actors.nilo.anim='hammer';
   const u=(t%3)/3;actors.eva.x=mix(1334,1396,u<.5?ease(u*2):ease(2-u*2));actors.eva.y=1098;actors.eva.dir=u<.5?'right':'left';actors.eva.moving=true;
   actors.eva.carry=u<.5?'tubo':null;
   props.cisterna=Math.max(props.cisterna,ease(t/scene.dur)*.6);
  }
  if(a==='calha'){
   move('lia',[p(1396,1004)],q2);actors.lia.dir='left';actors.lia.anim=t>1.5?'hammer':null;
   props.calha=ease(Math.max(0,(t-1.2)/(scene.dur-1.6)));props.cisterna=Math.max(props.cisterna,.6+.4*props.calha);
  }
  if(a==='ameaca'||a==='barreira'||a==='bloqueio'){
   // Três infectados descem a rua leste atraídos pelas marteladas.
   const chegada=a==='ameaca'?ease(t/scene.dur)*.55:a==='barreira'?.55+ease(t/scene.dur)*.3:1;
   for(const [i,z] of infectados.slice(0,3).entries()){
    z.down=false;z.moving=true;z.walkT=gtime*.5;
    const alvoX=1486+i*8,alvoY=1024+i*14;
    z.x=mix(1650+i*26,alvoX,chegada);z.y=mix(1028+i*12,alvoY,chegada);z.dir='left';
    if(a==='bloqueio'){
     // Batem na barreira, recuam e voltam pela rua: reação e consequência visíveis.
     const hit=1.2,volta=ease((t-1.9)/(scene.dur-2.1));
     if(t<hit){z.x=mix(1486+i*8,1462+i*6,ease(t/hit));}
     else if(t<1.9){z.x=1462+i*6+Math.sin((t-hit)*30)*1.5;z.moving=false;}
     else {z.x=mix(1462+i*6,1660+i*20,volta);z.dir='right';}
    }
   }
   if(a==='barreira'||a==='bloqueio'){
    if(a==='barreira'){move('nilo',[p(1428,1040)],q2);move('giu',[p(1428,1010)],q2);}
    else {at('nilo',1428,1040,'right');at('giu',1428,1010,'right');}
    actors.nilo.dir='right';actors.giu.dir='right';
    actors.nilo.anim=a==='barreira'&&t>1?'hammer':null;actors.giu.carry=a==='barreira'&&t<2?'wood':null;actors.giu.carryN=3;
    props.barreira=a==='barreira'?ease(Math.max(0,(t-1)/(scene.dur-1.4))):1;
    if(props.barreira>=1)res.wood=0;
   }
  }
  if(a==='fundo'){
   at('nilo',1428,1040);move('nilo',[p(1400,1060),p(1368,1062)],q2);actors.nilo.dir='up';
   move('ulisses',[p(1334,1066)],q2);actors.ulisses.dir='right';
   at('giu',1436,1076);
  }
  if(a==='ulisses'){at('ulisses',1334,1066,'right');actors.ulisses.anim='speech';at('nilo',1368,1062,'left');}
  if(a==='filtro'){move('eva',[p(1290,1126)],q2);actors.eva.dir='left';actors.eva.anim=t>1.2?'hammer':null;props.filtro=ease(Math.max(0,(t-1)/(scene.dur-1.4)));}
  if(a==='fervura'){
   at('eva',1290,1126,'left');props.filtro=1;props.fogo=true;
   move('giu',[p(1330,1178),p(1236,1160)],q2);actors.giu.dir='left';actors.giu.anim=t>1.5?'speech':null;
   move('ulisses',[p(1208,1110)],q2);actors.ulisses.dir='down';
  }
  if(a==='reservas'){res.meals=2;}
  if(a==='comida'){move('eva',[p(1330,1088)],q2);actors.eva.dir='up';}
  if(['opcao-b','votacao','convite'].includes(a)){props.radio=true;}
  if(a==='opcao-b'){move('lia',[p(1300,1002)],q2);actors.lia.dir='up';actors.lia.anim=t>1.5?'speech':null;}
  // Infectados distantes perto do mercado (rota A).
  for(const [i,z] of infectados.slice(3).entries()){
   z.x=1120+i*23;z.y=916+(i%2)*10;z.dir='left';z.moving=true;z.walkT=gtime*.5;z.down=false;
  }
  if(!['ameaca','barreira','bloqueio'].includes(a))for(const [i,z] of infectados.slice(0,3).entries()){
   const depois=DIA.indexOf(a)>DIA.indexOf('fundo')||a==='fundo';
   z.x=depois?1660+i*20:1650+i*26;z.y=1028+i*12;z.dir=depois?'right':'left';z.moving=false;
  }
 }
 function camera(){
  const a=scene.acao;
  let x=C.x,y=1050,z=3;
  if(['custo','votacao','convite'].includes(a)){x=1296;y=1000;z=1.15;}
  else if(a==='resultado'){x=1368;y=1046;z=2.7;}
  else if(a==='inspecao'){x=1368;y=1040;z=4.3;}
  else if(a==='tubos'){x=1366;y=1046;z=3.6;}
  else if(a==='calha'){x=1370;y=1000;z=3.6;}
  else if(a==='ameaca'){x=1560;y=1036;z=2.6;}
  else if(a==='barreira'||a==='bloqueio'){x=1452;y=1036;z=3.1;}
  else if(a==='fundo'){x=1360;y=1040;z=4;}
  else if(a==='ulisses'){x=1350;y=1050;z=4.4;}
  else if(a==='filtro'){x=1286;y=1116;z=4.2;}
  else if(a==='fervura'){x=1246;y=1124;z=3.5;}
  else if(a==='reservas'){x=1340;y=1060;z=2.6;}
  else if(a==='comida'){x=1330;y=1072;z=4.2;}
  else if(a==='opcao-a'){x=1138;y=915;z=2.7;}
  else if(a==='opcao-b'){x=1296;y=980;z=3.2;}
  cam.x=x;cam.y=y;cam.z=z*(1+.025*ease(elapsed/scene.dur));
 }
 const rect=(c,x,y,w,h)=>px(ctx,c,Math.round(x),Math.round(y),w,h);
 function tubo(x,y){rect('#5d6b6a',x,y,10,3);rect('#a6b4b0',x,y,10,1);}
 function details(){
  const a=scene.acao;
  // Persistentes do Dia 02: plataforma, cerca de tábuas, caixas, posto de socorros.
  rect('#777361',1210,1000,24,118);for(let y=1000;y<1118;y+=6)rect('#5c5c4d',1210,y,24,1);
  for(let x=1220;x<1326;x+=19){rect('#684f39',x,1112,3,15);rect('#ac8a58',x,1114,17,3);rect('#806b46',x,1121,17,2);}
  drawCrate(1328,1064);
  rect('#1c3529',1285,977,22,9);ctx.font='9px "Pixelify Sans",monospace';ctx.fillStyle='#e9d9a3';ctx.textAlign='center';ctx.fillText('13',1296,984);
  for(let i=0;i<45;i++){const x=1080+(hash(i,4,13)*510|0),y=815+(hash(i,9,13)*370|0);if(i%3===0){rect('#646b5b',x,y,4,2);rect('#909079',x+1,y-1,2,1);}else rect('#7e8c59',x,y,1,3);}
  rect('#333e37',1190,1000,14,28);rect('#68766c',1191,1004,12,20);rect('#283e3b',1193,1008,8,5);rect('#191f1c',1188,1005,3,7);rect('#191f1c',1203,1018,3,7);
  // Posto de socorros (Dia 02).
  rect('#775b3d',1350,1135,3,13);rect('#775b3d',1385,1135,3,13);rect('#a88c5b',1348,1129,42,5);rect('#d0b078',1348,1129,42,1);
  rect('#e0e7da',1360,1122,12,7);rect('#3b8b70',1365,1123,2,5);rect('#3b8b70',1363,1125,6,1);
  ctx.font='6px "Pixelify Sans",monospace';ctx.textAlign='center';rect('#253f32',1352,1116,34,7);ctx.fillStyle='#dee8ce';ctx.fillText('SOCORROS',1369,1122);
  // Cisterna: rachada no começo, remendada conforme o trabalho avança.
  rect('#303f3b',1355,1006,27,41);rect('#8a9d8d',1355,1006,27,3);rect('#536d67',1357,1010,23,34);rect('#1f302b',1365,1047,5,5);
  const conserto=props.cisterna;
  if(conserto<1){ctx.globalAlpha=1-conserto;ctx.strokeStyle='#14201c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(1362,1012);ctx.lineTo(1368,1022);ctx.lineTo(1364,1030);ctx.lineTo(1371,1040);ctx.stroke();ctx.globalAlpha=1;}
  if(conserto>.15)tubo(1382,1040);if(conserto>.35)tubo(1392,1040);if(conserto>.5){rect('#5d6b6a',1400,1040,3,12);rect('#7fd8ff',1400,1052,3,2);}
  // Nível de água: turva no fundo; depois do conserto e da calha, sobe.
  const nivel=['fundo','ulisses'].includes(a)?6:DIA.indexOf(a)>DIA.indexOf('ulisses')?14:0;
  if(nivel){rect(a==='fundo'||a==='ulisses'?'#6f6a45':'#5c9fb1',1358,1043-nivel,21,nivel);rect('#91b7a2',1358,1043-nivel,21,1);}
  // Calha do telhado da estação até a cisterna.
  if(props.calha>0){const u=props.calha;rect('#6d7774',1338,986,Math.round(30*Math.min(1,u*2)),3);if(u>.5)rect('#6d7774',1366,986,3,Math.round(20*(u-.5)*2));}
  // Barreira de tábuas na rua leste.
  if(props.barreira>0){const n=Math.ceil(props.barreira*5);for(let k=0;k<n;k++){rect('#684f39',1444,1006+k*12,3,12);rect('#ac8a58',1440,1008+k*12,12,3);rect('#806b46',1440,1013+k*12,12,2);}}
  if(a==='bloqueio'&&elapsed>1.2&&elapsed<1.6){const u=(elapsed-1.2)/.4;ctx.globalAlpha=1-u;for(let k=0;k<5;k++){const an=k*Math.PI*2/5;rect('#f9d995',1452+Math.cos(an)*(6+u*9),1030+Math.sin(an)*(6+u*9),2,2);}ctx.globalAlpha=1;}
  // Filtro de baldes: pano, areia e carvão.
  if(props.filtro>0){const u=props.filtro;rect('#7a7f80',1262,1110,14,12);rect('#7a7f80',1262,1124,14,12);
   if(u>.25)rect('#eee8d6',1263,1111,12,2);if(u>.5)rect('#d8c08a',1263,1114,12,3);if(u>.75)rect('#2a2a2a',1263,1118,12,3);if(u>=1){rect('#7fd8ff',1268,1122,2,2);}}
  // Fogueira com panela.
  if(props.fogo){rect('#5b3d24',1236,1138,16,3);const f=Math.sin(gtime*18)*1.5;rect('#ff9b3d',1240,1132-f,8,6+f);rect('#ffd23f',1242,1134,4,4);rect('#3c4446',1237,1125,14,8);rect('#7d8789',1237,1125,14,2);
   if(Math.random()<.5)particles.push({x:1244+rnd(-3,3),y:1122,vx:rnd(-3,3),vy:-12,life:1.6,max:1.6,type:'smoke',size:2});}
  // Caixa de comida quase vazia.
  if(a==='comida'){rect('#2c241a',1331,1066,10,6);rect('#c9a76b',1333,1068,3,2);}
  // Antena do rádio no telhado (opção B).
  if(props.radio){rect('#4c5652',1300,948,2,26);rect('#4c5652',1294,952,14,1);for(let k=0;k<3;k++){const r=(gtime*12+k*10)%30;ctx.strokeStyle=`rgba(143,230,211,${.7-r/45})`;ctx.lineWidth=.7;ctx.beginPath();ctx.arc(1301,948,r,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}}
  // Carregar tubo nas mãos.
  for(const n of Object.values(actors))if(n.carry==='tubo'){rect('#5d6b6a',n.x-7,n.y-14,14,3);rect('#a6b4b0',n.x-7,n.y-14,14,1);}
  if(['custo','opcao-a','opcao-b','votacao','convite'].includes(a)){
   const rota=(cor,points,letra,bx,by)=>{ctx.strokeStyle=cor;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.lineDashOffset=-gtime*7;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);rect('#172822',bx-9,by-10,18,18);ctx.font='bold 14px "Pixelify Sans",monospace';ctx.fillStyle=cor;ctx.textAlign='center';ctx.fillText(letra,bx,by+4);};
   if(a==='custo')rota('#8fe6d3',[[1296,1050],[1368,1050]],'B',1368,1034);
   if(['opcao-a','votacao','convite'].includes(a))rota('#ffce75',[[1278,1032],[1136,1032],[1136,888]],'A',1136,880);
   if(['votacao','convite'].includes(a)){rect('#172822',1292,920,18,18);ctx.font='bold 14px "Pixelify Sans",monospace';ctx.fillStyle='#8fe6d3';ctx.textAlign='center';ctx.fillText('B',1301,934);}
  }
 }
 function renderWorld(){
  cv.width=540;cv.height=960;cw=540;ch=960;dpr=1;camera();
  const a=scene.acao,noite=['votacao','convite','opcao-a','opcao-b'].includes(a),tarde=['ameaca','barreira','bloqueio'].includes(a);
  ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#3f5639';ctx.fillRect(0,0,540,960);
  const ox=Math.round(cw/2-cam.x*cam.z),oy=Math.round(ch/2-cam.y*cam.z);ctx.setTransform(cam.z,0,0,cam.z,ox,oy);
  ctx.drawImage(groundCv,0,0);
  for(let y=Math.max(0,(cam.y-ch/2/cam.z)/T|0);y<Math.min(H,(cam.y+ch/2/cam.z)/T+2);y++)for(let x=Math.max(0,(cam.x-cw/2/cam.z)/T|0);x<Math.min(W,(cam.x+cw/2/cam.z)/T+2);x++)if(obj[idx(x,y)]===O_TREE)ctx.drawImage(treeImgs[objVar[idx(x,y)]&3],x*T-4,y*T-18);
  const lights=[];
  for(const b of buildings)drawBuilding(b,lights,b.type==='estacao'&&noite);
  details();
  const foco={custo:[],votacao:[],convite:[],inspecao:['nilo','eva'],tubos:['nilo','eva'],calha:['lia','nilo'],ameaca:[],barreira:['nilo','giu'],bloqueio:['nilo','giu'],fundo:['nilo','ulisses'],ulisses:['ulisses','nilo'],filtro:['eva'],fervura:['eva','giu','ulisses'],comida:['eva'],'opcao-a':[],'opcao-b':['lia']};
  const visiveis=Object.entries(actors).filter(([id])=>!foco[a]||foco[a].includes(id));
  const desenhar=[...visiveis.map(([id,n])=>({id,n})),...infectados.map(n=>({id:null,n}))].sort((x,y)=>x.n.y-y.n.y);
  for(const {n} of desenhar){
   ctx.save();
   if(n.down){ctx.translate(n.x,n.y-4);ctx.rotate(-Math.PI/2);ctx.translate(-n.x,-n.y+4);}
   drawNPC(n);if(n.id>=100){rect('#9aa58b',n.x-2,n.y-12,1,1);rect('#9aa58b',n.x+1,n.y-12,1,1);rect('#879482',n.x-7,n.y-11,4,2);rect('#879482',n.x+3,n.y-11,4,2);rect('#263b32',n.x-2,n.y-6,2,2);}
   ctx.restore();
  }
  for(const P of particles){if(P.type==='smoke'){P.life-=1/30;P.x+=P.vx/30;P.y+=P.vy/30;ctx.globalAlpha=Math.max(0,P.life/P.max)*.5;rect('#c9c9c0',P.x,P.y,P.size,P.size);ctx.globalAlpha=1;}}
  particles=particles.filter(P=>P.life>0);
  ctx.setTransform(1,0,0,1,0,0);
  if(noite||tarde){
   lightCv.width=540;lightCv.height=960;lctx.clearRect(0,0,540,960);lctx.globalCompositeOperation='source-over';lctx.fillStyle=noite?'rgba(14,24,42,.36)':'rgba(70,40,20,.16)';lctx.fillRect(0,0,540,960);lctx.globalCompositeOperation='destination-out';
   if(noite)for(const L of [...lights,{x:1296,y:1010,r:95}]){const x=L.x*cam.z+ox,y=L.y*cam.z+oy,r=(L.r||40)*cam.z;const g=lctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,.9)');g.addColorStop(1,'rgba(0,0,0,0)');lctx.fillStyle=g;lctx.fillRect(x-r,y-r,r*2,r*2);}
   ctx.drawImage(lightCv,0,0);
  }
  tagRects=[];ctx.textAlign='center';ctx.textBaseline='middle';const tagFs=Math.round(clamp(cam.z*3.6,10,14));ctx.font=`600 ${tagFs}px "Pixelify Sans",monospace`;
  for(const [id,n] of visiveis){
   const sx=n.x*cam.z+ox,sy=(n.y-(n.carry?32:25))*cam.z+oy,w=ctx.measureText(n.name).width+10;
   if(sx<10||sx>530||sy<14||sy>925)continue;
   ctx.fillStyle='rgba(14,28,23,.88)';ctx.fillRect(Math.round(sx-w/2),Math.round(sy-tagFs*.7),Math.round(w),tagFs*1.4);
   ctx.fillStyle=id==='ulisses'?'#f8f8eb':id==='giu'?'#e0e7b2':'#fff3cd';ctx.fillText(n.name,Math.round(sx),Math.round(sy));
   tagRects.push({id,nome:n.name,x:sx-w/2,y:sy-tagFs*.7,w,h:tagFs*1.4});
  }
  return tagRects;
 }
 function exportWorld(){return {v:1,universo:'refugio-13',dia:3,jogo:JSON.parse(serialize()),atores:Object.fromEntries(Object.entries(actors).map(([id,n])=>[id,{x:n.x,y:n.y,roupa:n.shirt,nome:n.name}])),infectados:infectados.map(n=>({x:n.x,y:n.y})),estruturas:{...props,cisterna:true,calha:true,barreira:true,filtro:true,fogo:true,radio:false},locais:{estacao:S,cisterna:C,mercado:M},decisaoAnterior:window.__r13input.estadoAnterior.votacao.contagem,suprimentos:{aguaHoras:30,comidaDias:.5,tabuas:0}};}
 return {init,setScene,inspect:t=>{update(t);return {tags:renderWorld(),atores:Object.fromEntries(Object.entries(actors).map(([id,n])=>[id,{x:n.x,y:n.y}])),infectados:infectados.map(n=>({x:n.x,y:n.y,caido:n.down}))};},frame:t=>{update(t);const tags=renderWorld();return {imagem:cv.toDataURL('image/jpeg',.94).slice(23),tags};},exportWorld};
})();
