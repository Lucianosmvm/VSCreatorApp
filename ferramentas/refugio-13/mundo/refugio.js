/* Refúgio 13: mundo Canvas independente, usando os renderizadores de tiles,
   prédios e sprites do motor que também produz Mundo Pixelândia. */
window.r13=(()=>{
 document.title='Refúgio 13 — Mundo de sobrevivência';
 const S={x:1296,y:1024},O={x:1464,y:884},M={x:1136,y:880};
 const colors={lia:'#be765b',nilo:'#629eaa',eva:'#c2a263',ulisses:'#e4e9de',giu:'#7c895b'};
 const names={lia:'Lia',nilo:'Nilo',eva:'Eva',ulisses:'ULISSES',giu:'Velho Giu'};
 let scene=null,sceneIndex=-1,elapsed=0,snap=null,actors={},infectados=[],props={posto:false,resgatados:false},tagRects=[];
 const rand=mulberry32(130218),mix=(a,b,p)=>a+(b-a)*p;
 const ease=p=>{p=Math.max(0,Math.min(1,p));return p*p*(3-2*p)};
 const p=(x,y)=>({x,y});
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
  if(input.estadoAnterior.votacao.vencedora!=='B')throw Error('EP02 requer a apuração confirmada da rota B.');
  seed=130218;villageName='Refúgio 13';mins=1430;SEASON='verao';
  Object.assign(GRASS.verao,{b:'#587347',d:'#48633c',l:'#71895a',fl:.005});
  ground=new Uint8Array(N);obj=new Uint8Array(N);objVar=new Uint8Array(N);crop=new Uint8Array(N);cropT=new Float32Array(N);bld=new Int16Array(N).fill(-1);
  props={posto:false,resgatados:false};
  buildings=[];npcs=[];queue=[];bById.clear();nextId=1;nextBid=1;particles=[];butterflies=[];res={wood:0,stone:0,fish:0,crops:0,meals:input.estadoAnterior.suprimentos.comidaDias*input.estadoAnterior.elenco.length,coins:0,tools:1};
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
  const station=build('estacao',78,59),market=build('mercado',69,51),garage=build('ferraria',89,52);
  station._st={...bStyle(station),wc:'#a1765b',rc:'#78554a',feat:['canopy','clock']};
  garage._st={...bStyle(garage),wc:'#8a8b79',rc:'#566366',forge:false,feat:['anvil','stack']};
  build('casa',64,49)._st={wall:'brick',wc:'#897765',roof:'gable',rc:'#655b50',feat:[],door:'#3c3930'};
  build('casa',96,46)._st={wall:'plaster',wc:'#92917d',roof:'hip',rc:'#52645f',feat:[],door:'#3d4439'};
  actors={};
  for(const id of ['lia','nilo','eva','ulisses','giu'])actors[id]=actor(id,id==='ulisses'?p(1444,882):id==='giu'?p(1480,856):id==='lia'?p(1248,1056):id==='nilo'?p(1280,1056):p(1312,1056));
  npcs=Object.values(actors);nextId=6;
  infectados=Array.from({length:6},(_,i)=>{const n=actor('giu',p(1450+i%3*24,968+Math.floor(i/3)*25));Object.assign(n,{id:100+i,name:'',skin:'#879482',shirt:i%2?'#535f58':'#666457',hairC:'#535a4d',beard:false,prof:'custom',dir:'up'});return n;});
  // O piso continua usando o atlas de Pixelândia, com asfalto gasto nas ruas.
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
 function update(t){
  elapsed=t;gtime=sceneIndex*8+t;
  for(const a of Object.values(actors)){a.moving=false;a.walkT=gtime;a.animT=t;}
  const a=scene.acao,q=ease(t/Math.max(1,scene.dur-.25));
  mins=['amanhecer','posto','reservas','opcao-a','opcao-b','votacao','convite'].includes(a)?1800:1430;
  if(a==='rota'){
   // Contornar o cerco pelo oeste; nunca atravessar os infectados na rua.
   move('lia',[p(1248,1032),p(1360,1032),p(1360,920),p(1450,920)],q);
   move('nilo',[p(1280,1010),p(1390,1010),p(1390,914),p(1478,914)],q);
  }
  if(a==='porta'){move('nilo',[p(1474,914)],q);actors.nilo.anim=t>1?'hammer':null;actors.nilo.dir='up';}
  if(a==='socorro'){move('ulisses',[p(1444,914),p(1456,914)],ease(t/2));actors.ulisses.dir='right';actors.ulisses.anim='speech';}
  if(a==='giu'){actors.giu.anim='speech';actors.giu.dir='down';}
  if(a==='gravador'){
   const u=t/scene.dur;
   if(u<.52)move('lia',[p(1518,920),p(1550,940)],ease(u/.52));
   else Object.assign(actors.lia,pathAt([p(1550,940),p(1518,920),p(1450,920)],ease((u-.52)/.48)));
  }
  if(a==='desvio'){
   move('lia',[p(1390,910),p(1360,956)],q);
   // Nilo cobre a retirada: aproximação, golpe, recuo do zumbi e fuga.
   if(t<.8)move('nilo',[p(1474,946),p(1430,946)],ease(t/.8));
   else if(t<2.2)Object.assign(actors.nilo,{x:1430,y:946,dir:'right',moving:false});
   else Object.assign(actors.nilo,pathAt([p(1430,946),p(1394,974)],ease((t-2.2)/(scene.dur-2.2))));
   move('ulisses',[p(1360,884),p(1320,940)],q);move('giu',[p(1394,856),p(1348,914)],q);
   if(q>.98)props.resgatados=true;
  }
  if(a==='pecas'){actors.nilo.carry=t>.8?'wood':null;actors.nilo.carryN=3;actors.nilo.anim=t<1?'hammer':null;if(t>.8){res.wood=3;props.materiaisRecuperados=true;}}
  if(a==='retorno'){
   const destino={lia:1248,nilo:1280,ulisses:1344,giu:1376};
   for(const [i,id] of ['lia','nilo','ulisses','giu'].entries())move(id,[p(id==='giu'?1460:1400+i*12,1010+i*10),p(destino[id],1080+(i%2)*20)],q);
   move('eva',[p(1230,1056)],ease(t/2));actors.nilo.carry='wood';actors.nilo.carryN=3;
  }
  if(a==='amanhecer'){move('eva',[p(1312,1080)],q);props.resgatados=true;res.meals=5;}
  if(a==='posto'){
   move('nilo',[p(1344,1140)],ease(t/2));move('ulisses',[p(1380,1140)],ease(t/2));
   actors.nilo.anim='hammer';actors.nilo.dir='right';actors.ulisses.anim='speech';actors.ulisses.dir='left';
   if(q>.98){props.posto=true;res.wood=0;}
  }
  const radio=['gravador','desvio','pecas','retorno'].includes(a);
  const atrair=a==='gravador'?ease(Math.max(0,(t/scene.dur-.65)/.35)):radio?1:0;
  for(const [i,z] of infectados.entries()){
   z.down=false;
   z.x=mix(1450+i%3*24,1534+i%3*18,atrair);z.y=mix(968+Math.floor(i/3)*25,950+Math.floor(i/3)*23,atrair);
   z.dir=atrair>0?'right':'up';z.moving=true;z.walkT=gtime*.5;
   if(a==='opcao-a'){z.x=1120+i%3*23;z.y=916+Math.floor(i/3)*22;z.dir='left';}
  }
  const z=infectados[0];
  if(['porta','socorro','ameaca','giu'].includes(a)){
   const u=a==='porta'?ease(t/scene.dur):1;
   z.x=mix(1450,1474,u);z.y=mix(968,941,u);z.dir='up';
  }
  if(a==='desvio'){
   const hit=1.25,approach=ease(t/hit),recoil=ease((t-hit)/.6);
   z.x=t<hit?mix(1534,1448,approach):mix(1448,1484,recoil);
   z.y=t<hit?mix(950,946,approach):mix(946,964,recoil);
   z.dir='left';z.down=t>hit+.2;z.moving=t<hit;
  }
  if(['pecas','retorno'].includes(a)){z.x=1484;z.y=964;z.down=true;z.moving=false;}
 }
 function camera(){
  const a=scene.acao;
  let x=1464,y=918,z=3.4;
  if(['custo','opcao-a','opcao-b','votacao','convite'].includes(a)){x=1296;y=1000;z=1.15;}
  else if(a==='resultado'){x=1464;y=944;z=2.8;}
  else if(a==='rota'){x=(actors.lia.x+actors.nilo.x)/2;y=(actors.lia.y+actors.nilo.y)/2-15;z=3;}
  else if(a==='encontro'){x=1462;y=865;z=4.25;}
  else if(a==='socorro'){x=1466;y=908;z=4.4;}
  else if(a==='giu'){x=1480;y=846;z=4.7;}
  else if(a==='gravador'){x=1514;y=932;z=2.8;}
  else if(a==='desvio'){x=1420;y=930;z=2.45;}
  else if(a==='pecas'){x=1430;y=955;z=4;}
  else if(a==='retorno'){x=(actors.lia.x+actors.giu.x)/2;y=(actors.lia.y+actors.giu.y)/2-20;z=2.55;}
  else if(a==='amanhecer'){x=1296;y=1070;z=2.8;}
  else if(a==='posto'){x=1362;y=1120;z=3.7;}
  else if(a==='reservas'){x=1372;y=1042;z=3.25;}
  if(a==='opcao-a'){x=1138;y=915;z=2.7;}
  if(a==='opcao-b'){x=1368;y=1040;z=3.35;}
  cam.x=x;cam.y=y;cam.z=z*(1+.025*ease(elapsed/scene.dur));
 }
 const rect=(c,x,y,w,h)=>px(ctx,c,Math.round(x),Math.round(y),w,h);
 function floorGarage(){
  rect('#252f2c',1424,832,80,64);rect('#626c62',1426,834,76,58);
  for(let y=836;y<893;y+=8)for(let x=1428;x<1499;x+=8){rect((x+y)%16?'#687365':'#5c685d',x,y,7,7);rect('#4c594e',x,y,7,1);}
  rect('#969782',1424,832,80,3);rect('#404d44',1424,835,3,53);rect('#9c9b85',1501,835,3,60);
  drawCrate(1430,837);drawCrate(1482,837);rect('#414e45',1440,840,31,6);rect('#8e967b',1440,840,31,2);
  rect('#202d29',1423,872,5,17);rect('#b99c67',1422,870,7,2);
  ctx.font='7px "Pixelify Sans",monospace';ctx.fillStyle='#d8d6a8';ctx.textAlign='center';ctx.fillText('OFICINA',1464,830);
 }
 function details(){
  // Objetos persistentes no mundo: plataforma, barricada, cisterna e materiais.
  rect('#777361',1210,1000,24,118);for(let y=1000;y<1118;y+=6)rect('#5c5c4d',1210,y,24,1);
  for(let x=1220;x<1326;x+=19){rect('#684f39',x,1112,3,15);rect('#ac8a58',x,1114,17,3);rect('#806b46',x,1121,17,2);}
  rect('#303f3b',1355,1006,27,41);rect('#8a9d8d',1355,1006,27,3);rect('#536d67',1357,1010,23,34);rect('#91b7a2',1359,1036,19,4);rect('#1f302b',1365,1047,5,5);
  drawCrate(1328,1064);drawCrate(1407,946);
  rect('#1c3529',1285,977,22,9);ctx.font='9px "Pixelify Sans",monospace';ctx.fillStyle='#e9d9a3';ctx.textAlign='center';ctx.fillText('13',1296,984);
  rect('#9a8057',1126,858,24,3);rect('#776746',1129,862,18,2);
  for(let i=0;i<45;i++){const x=1080+(hash(i,4,13)*510|0),y=815+(hash(i,9,13)*370|0);if(i%3===0){rect('#646b5b',x,y,4,2);rect('#909079',x+1,y-1,2,1);}else rect('#7e8c59',x,y,1,3);}
  // Carcaça de um carro na rua, vidro quebrado e pneus.
  rect('#333e37',1190,1000,14,28);rect('#68766c',1191,1004,12,20);rect('#283e3b',1193,1008,8,5);rect('#191f1c',1188,1005,3,7);rect('#191f1c',1203,1018,3,7);
  rect('#a28b63',1453,900,28,3);rect('#5e4c34',1456,903,24,2);
  if(scene.acao==='porta'&&elapsed>1.5){rect('#a28b63',1450,910,16,2);rect('#756347',1467,914,9,2);}
  const a=scene.acao;
  const radio=['gravador','desvio','pecas','retorno'].includes(a);
  if(radio){rect('#243c39',1547,938,8,5);rect('#a8b9a5',1548,939,6,2);rect('#d6a453',1547,935,1,4);for(let k=0;k<3;k++){const r=(gtime*12+k*10)%32;ctx.strokeStyle=`rgba(255,204,100,${.7-r/48})`;ctx.lineWidth=.6;ctx.beginPath();ctx.arc(1551,940,r,0,Math.PI*2);ctx.stroke();}}
  if(a==='giu'){rect('#243c39',1485,850,7,4);rect('#df795d',1489,851,1,1);ctx.font='6px "Pixelify Sans",monospace';ctx.fillStyle='#f4cf89';ctx.fillText('REC',1490,845);}
  if(a==='socorro'&&elapsed>1.5)rect('#eee8d6',actors.nilo.x+3,actors.nilo.y-7,3,2);
  if(props.posto||a==='posto'){
   const u=a==='posto'?ease(Math.max(0,(elapsed-.5)/4)):1;
   ctx.globalAlpha=.3;ctx.strokeStyle='#d1cba4';ctx.strokeRect(1348,1120,42,23);ctx.globalAlpha=1;
   rect('#775b3d',1350,1135,3,13*u);rect('#775b3d',1385,1135,3,13*u);
   if(u>.2){rect('#a88c5b',1348,1129,42*u,5);rect('#d0b078',1348,1129,42*u,1);}
   if(u>.65){rect('#e0e7da',1360,1122,12,7);rect('#3b8b70',1365,1123,2,5);rect('#3b8b70',1363,1125,6,1);}
   if(u>.9){ctx.font='6px "Pixelify Sans",monospace';ctx.textAlign='center';rect('#253f32',1352,1116,34,7);ctx.fillStyle='#dee8ce';ctx.fillText('SOCORROS',1369,1122);}
  }
  if(['custo','opcao-a','opcao-b','votacao','convite'].includes(a)){
   const rota=(cor,points,letra,bx,by)=>{ctx.strokeStyle=cor;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.lineDashOffset=-gtime*7;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);rect('#172822',bx-9,by-10,18,18);ctx.font='bold 14px "Pixelify Sans",monospace';ctx.fillStyle=cor;ctx.textAlign='center';ctx.fillText(letra,bx,by+4);};
   if(a==='custo')rota('#8fe6d3',[[1296,1026],[1464,1026],[1464,916]],'B',1464,910);
   if(['opcao-a','votacao','convite'].includes(a))rota('#ffce75',[[1278,1032],[1136,1032],[1136,888]],'A',1136,880);
   if(['opcao-b','votacao','convite'].includes(a))rota('#8fe6d3',[[1312,1060],[1368,1060],[1368,1048]],'B',1396,1020);
   if(a==='opcao-b'){ctx.strokeStyle='#8fe6d3';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.strokeRect(1352,1000,34,51);ctx.beginPath();ctx.moveTo(1339,973);ctx.lineTo(1388,973);ctx.lineTo(1388,1049);ctx.stroke();ctx.setLineDash([]);}
  }
 }
 function renderWorld(){
  cv.width=540;cv.height=960;cw=540;ch=960;dpr=1;camera();
  const noite=!['amanhecer','posto','reservas','opcao-a','opcao-b','votacao','convite'].includes(scene.acao);
  ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#3f5639';ctx.fillRect(0,0,540,960);
  const ox=Math.round(cw/2-cam.x*cam.z),oy=Math.round(ch/2-cam.y*cam.z);ctx.setTransform(cam.z,0,0,cam.z,ox,oy);
  ctx.drawImage(groundCv,0,0);
  for(let y=Math.max(0,(cam.y-ch/2/cam.z)/T|0);y<Math.min(H,(cam.y+ch/2/cam.z)/T+2);y++)for(let x=Math.max(0,(cam.x-cw/2/cam.z)/T|0);x<Math.min(W,(cam.x+cw/2/cam.z)/T+2);x++)if(obj[idx(x,y)]===O_TREE)ctx.drawImage(treeImgs[objVar[idx(x,y)]&3],x*T-4,y*T-18);
  const dentro=['encontro','socorro','giu','desvio'].includes(scene.acao),lights=[];
  for(const b of buildings){if(b.type==='ferraria'&&dentro)floorGarage();else drawBuilding(b,lights,b.type==='estacao'&&noite);}
  details();
  const antes=['resultado','custo','rota'].includes(scene.acao);
  const foco={encontro:['ulisses','giu'],porta:['nilo'],socorro:['ulisses','nilo'],ameaca:['lia','nilo','ulisses'],giu:['giu'],gravador:['lia'],pecas:['nilo'],posto:['nilo','ulisses']};
  const visiveis=Object.entries(actors).filter(([id])=>(!antes||!['ulisses','giu'].includes(id))&&(!foco[scene.acao]||foco[scene.acao].includes(id)));
  const desenhar=[...visiveis.map(([id,n])=>({id,n})),...infectados.map(n=>({id:null,n}))].sort((a,b)=>a.n.y-b.n.y);
  for(const {n} of desenhar){
   ctx.save();
   if(n.down){ctx.translate(n.x,n.y-4);ctx.rotate(-Math.PI/2);ctx.translate(-n.x,-n.y+4);}
   drawNPC(n);if(n.id>=100){rect('#9aa58b',n.x-2,n.y-12,1,1);rect('#9aa58b',n.x+1,n.y-12,1,1);rect('#879482',n.x-7,n.y-11,4,2);rect('#879482',n.x+3,n.y-11,4,2);rect('#263b32',n.x-2,n.y-6,2,2);}
   ctx.restore();
  }
  if(scene.acao==='desvio'&&elapsed>.65&&elapsed<2.2){
   const n=actors.nilo,sw=ease((elapsed-1.03)/.22);
   ctx.save();ctx.translate(n.x+4,n.y-10);ctx.rotate(mix(-1.1,.3,sw));
   rect('#59432e',0,-2,23,4);rect('#c4a16a',0,-2,23,2);ctx.restore();
   if(elapsed>=1.25&&elapsed<1.55){
    const u=(elapsed-1.25)/.3;ctx.globalAlpha=1-u;
    for(let k=0;k<5;k++){const an=k*Math.PI*2/5;rect('#f9d995',1449+Math.cos(an)*(6+u*10),936+Math.sin(an)*(6+u*10),2,2);}ctx.globalAlpha=1;
   }
  }
  ctx.setTransform(1,0,0,1,0,0);
  if(noite){
   lightCv.width=540;lightCv.height=960;lctx.clearRect(0,0,540,960);lctx.globalCompositeOperation='source-over';lctx.fillStyle='rgba(14,24,42,.36)';lctx.fillRect(0,0,540,960);lctx.globalCompositeOperation='destination-out';
   for(const L of [...lights,{x:1296,y:1010,r:95},{x:1464,y:880,r:dentro?75:40}]){const x=L.x*cam.z+ox,y=L.y*cam.z+oy,r=(L.r||40)*cam.z;const g=lctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,.9)');g.addColorStop(1,'rgba(0,0,0,0)');lctx.fillStyle=g;lctx.fillRect(x-r,y-r,r*2,r*2);}
   ctx.drawImage(lightCv,0,0);
  }
  // Tags em coordenadas de tela, como no jogo: acima da cabeça, sem linhas.
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
 function exportWorld(){return {v:1,universo:'refugio-13',jogo:JSON.parse(serialize()),atores:Object.fromEntries(Object.entries(actors).map(([id,n])=>[id,{x:n.x,y:n.y,roupa:n.shirt,nome:n.name}])),infectados:infectados.map(n=>({x:n.x,y:n.y})),estruturas:props,locais:{estacao:S,oficina:O,mercado:M},decisaoAnterior:window.__r13input.estadoAnterior.votacao,suprimentos:{aguaHoras:6,comidaDias:1}};}
 function loadWorld(data){
  if(data.universo!=='refugio-13')throw Error('Estado pertence a outro universo.');
  const looks=Object.fromEntries(Object.entries(actors).map(([id,n])=>[id,{skin:n.skin,hairC:n.hairC,pants:n.pants,shirt:n.shirt}]));
  load(data.jogo);
  actors=Object.fromEntries(Object.entries(data.atores).map(([id,s])=>{const n=npcs.find(n=>n.name===s.nome);if(!n)throw Error('Sobrevivente ausente: '+s.nome);Object.assign(n,looks[id]||{},{x:s.x,y:s.y,shirt:s.roupa,active:true,inside:false});return [id,n];}));
  props={...data.estruturas};
  for(const [i,z] of infectados.entries())if(data.infectados?.[i])Object.assign(z,data.infectados[i]);
  return {pessoas:Object.keys(actors).length,estruturas:props};
 }
 return {init,setScene,loadWorld,inspect:t=>{update(t);return {tags:renderWorld(),atores:Object.fromEntries(Object.entries(actors).map(([id,n])=>[id,{x:n.x,y:n.y}])),infectados:infectados.map(n=>({x:n.x,y:n.y,caido:n.down}))};},frame:t=>{update(t);const tags=renderWorld();return {imagem:cv.toDataURL('image/jpeg',.94).slice(23),tags};},exportWorld};
})();
