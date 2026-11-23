import React from 'react';
import {interpolate} from 'remotion';
import {Pessoa, Predio} from '../videos/Refugio13Dia01';

const amber='#ffc464',cyan='#8fe6d3',red='#ff796c';
const progresso=(t:number,a:number,b:number)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const lerp=(a:number,b:number,p:number)=>a+(b-a)*p;
const arvores=[[6,17],[16,30],[8,52],[7,74],[17,92],[8,111],[20,119],[35,120],[46,114],[63,121],[85,114],[95,102],[108,113],[116,94],[114,79],[114,51],[107,8],[90,7],[37,7],[19,10]];
const ids=['lia','nilo','eva','ulisses','giu'] as const;
type Id=typeof ids[number];
const roupa:Record<Id,string>={lia:'#c67c61',nilo:'#6faab4',eva:'#dab267',ulisses:'#e1e8da',giu:'#7c855a'};
const nomes:Record<Id,string>={lia:'Lia',nilo:'Nilo',eva:'Eva',ulisses:'ULISSES',giu:'Velho Giu'};
const coresNome:Record<Id,string>={lia:'#ffab8e',nilo:'#9bdae5',eva:'#ffe2a0',ulisses:'#f6f8e9',giu:'#d0daa1'};

const Sobrevivente=({id,x,y,t,andando=false}: {id:Id;x:number;y:number;t:number;andando?:boolean})=>(
 <g>
  <Pessoa x={x} y={y} roupa={roupa[id]} passo={andando?(Math.floor(t*7)%2?1:0):0} item={id==='lia'?'radio':id==='nilo'?'lanterna':id==='eva'?'mochila':undefined}/>
  {id==='ulisses'&&<path d={`M${x-1} ${y+2}h2m-1-1v2`} stroke="#418e77" strokeWidth=".8"/>}
  {id==='giu'&&<g fill="#bcb7aa"><rect x={x-2} y={y-3} width="4" height="1"/><rect x={x-1} y={y} width="2" height="2"/></g>}
 </g>
);

export const MundoDia02:React.FC<{acao:string;t:number;dur:number}>=({acao,t,dur})=>{
 const retorno=['retorno','amanhecer','posto','reservas','opcao-a','opcao-b','votacao','convite'].includes(acao);
 const dia=['amanhecer','posto','reservas','opcao-a','opcao-b','votacao','convite'].includes(acao);
 const mapa=['custo','opcao-a','opcao-b','votacao','convite'].includes(acao);
 const oficina=['encontro','porta','socorro','ameaca','giu','gravador','desvio','pecas'].includes(acao);
 const fuga=['desvio','pecas'].includes(acao);
 const audio=['gravador','desvio','pecas'].includes(acao);
 const posto=['posto','reservas','opcao-a','opcao-b','votacao','convite'].includes(acao);
 const camera=mapa?[0,0,126,126]:oficina?[65,18,66,66]:acao==='resultado'?[49,18,80,80]:acao==='reservas'?[50,48,60,60]:[31,27,84,84];
 const aproxima=progresso(t,0,Math.max(1,dur-.6));
 const caminho=(p:number)=>p<.55?{x:lerp(66,95,p/.55),y:lerp(84,73,p/.55)}:{x:96,y:lerp(73,55,(p-.55)/.45)};
 let atores:{id:Id;x:number;y:number;andando?:boolean;nome?:boolean}[]=[];
 if(acao==='rota'){
  const p=caminho(progresso(t,.2,dur-.4));
  atores=[{id:'lia',x:p.x-3,y:p.y+4,andando:true},{id:'nilo',x:p.x+2,y:p.y,andando:true},{id:'eva',x:52,y:84}];
 }else if(retorno){
  const r=acao==='retorno'?progresso(t,.2,dur-.4):1;
  atores=[{id:'lia',x:lerp(87,58,r),y:lerp(64,83,r),andando:r<1},{id:'nilo',x:lerp(90,65,r),y:lerp(69,88,r),andando:r<1},{id:'eva',x:52,y:82},
   {id:'ulisses',x:lerp(94,81,r),y:lerp(67,84,r),andando:r<1},{id:'giu',x:lerp(97,88,r),y:lerp(72,90,r),andando:r<1}];
  if(acao==='posto'){
   const p=progresso(t,.3,dur-.6);
   atores=atores.map(a=>a.id==='nilo'?{...a,x:lerp(65,75,p),y:lerp(88,97,p),andando:p<1}:a.id==='ulisses'?{...a,x:lerp(81,84,p),y:lerp(84,97,p),andando:p<1}:a);
  }
 }else if(oficina){
  const p=acao==='pecas'?1:fuga?progresso(t,.2,dur-.5):0;
  atores=[{id:'lia',x:lerp(90,85,p),y:lerp(56,65,p),andando:fuga&&p<1},{id:'nilo',x:lerp(96,98,p),y:lerp(53,68,p),andando:fuga&&p<1},
   {id:'ulisses',x:lerp(89,72,p),y:lerp(46,63,p),andando:fuga&&p<1},
   {id:'giu',x:lerp(101,110,p),y:lerp(39,70,p),andando:fuga&&p<1}];
  if(acao==='socorro')atores=atores.map(a=>a.id==='ulisses'?{...a,x:lerp(89,88,progresso(t,.2,2)),y:lerp(46,52,progresso(t,.2,2))}:a);
  if(acao==='gravador')atores=atores.map(a=>a.id==='lia'?{...a,y:lerp(56,73,Math.sin(aproxima*Math.PI)),andando:true}:a);
 }else atores=[{id:'lia',x:62,y:83},{id:'nilo',x:68,y:87},{id:'eva',x:52,y:82}];
 // Nas tomadas de ação, aproximar quem participa para preservar a leitura das tags.
 const focoDaTomada:Record<string,Id[]>={encontro:['ulisses','giu'],porta:['nilo'],socorro:['ulisses','nilo'],ameaca:['lia','nilo'],giu:['giu'],gravador:['lia'],pecas:['nilo'],posto:['nilo','ulisses']};
 if(focoDaTomada[acao])atores=atores.filter(a=>focoDaTomada[acao].includes(a.id));
 // Espaçar os próprios personagens; cada tag permanece centralizada na cabeça.
 const larguraTag=(id:Id)=>nomes[id].length*1.65+3;
 const centroOriginal=atores.reduce((s,a)=>s+a.x,0)/atores.length;
 const ordemHorizontal=[...atores].sort((a,b)=>a.x-b.x).map(a=>a.id);
 for(let passo=0;passo<24;passo++)for(let i=0;i<atores.length;i++)for(let j=i+1;j<atores.length;j++){
  const a=atores[i],b=atores[j],dy=Math.abs(a.y-b.y);
  const pesoTag=Math.min(1,Math.max(0,(8-dy)/2));
  const pesoCorpo=Math.min(1,Math.max(0,(15-dy)/2));
  const pesoTagCorpo=Math.max(0,Math.min(1,dy/2,(22-dy)/2));
  const minimo=Math.max((larguraTag(a.id)/2+larguraTag(b.id)/2+1.5)*pesoTag,11*pesoCorpo,(Math.max(larguraTag(a.id),larguraTag(b.id))/2+6)*pesoTagCorpo);
  const sentido=ordemHorizontal.indexOf(a.id)<ordemHorizontal.indexOf(b.id)?-1:1;
  const falta=minimo-(a.x-b.x)*sentido;
  if(falta>0){a.x+=sentido*falta/2;b.x-=sentido*falta/2;}
 }
 const ajuste=centroOriginal-atores.reduce((s,a)=>s+a.x,0)/atores.length;
 for(const a of atores)a.x+=ajuste;
 const etiquetas=atores.map(a=>({x:a.x-larguraTag(a.id)/2,y:a.y-12,w:larguraTag(a.id),h:5,ator:a}));
 const esquerda=Math.min(camera[0],...etiquetas.map(e=>e.x-4));
 const direita=Math.max(camera[0]+camera[2],...etiquetas.map(e=>e.x+e.w+4));
 const topo=Math.min(camera[1],...etiquetas.map(e=>e.y-4));
 const baixo=Math.max(camera[1]+camera[3],...atores.map(a=>a.y+12));
 const lado=Math.max(direita-esquerda,baixo-topo);
 const cameraTags=[(esquerda+direita-lado)/2,(topo+baixo-lado)/2,lado,lado];
 const camTags=cameraTags.map((n,i)=>i<2?n+aproxima*.5:n-aproxima).join(' ');
 return <svg viewBox={camTags} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges">
  <rect x="-20" y="-20" width="180" height="180" fill={dia?'#354a42':'#222e36'}/>
  {Array.from({length:250},(_,i)=><rect key={i} x={(i*43)%119} y={(i*73+i%7)%125} width={1+i%3} height="1" fill={i%2?'#6f8970':'#171f20'} opacity=".21"/>)}
  <path d="M4 66H114V77H4Z M24 26H32V75H24Z M94 25H102V73H94Z" fill="#666455"/>
  <path d="M4 70H115M28 29V68M98 25V68" fill="none" stroke="#afa993" strokeDasharray="3 5" opacity=".35"/>
  <path d="M43 3V126M49 3V126" stroke="#949086"/>
  {Array.from({length:31},(_,i)=><rect key={i} x="41" y={i*4} width="10" height="1" fill="#5b4b41"/>)}
  <rect x="69" y="83" width="38" height="28" fill="#6d8061" opacity=".52"/>
  {arvores.map(([x,y])=><g key={`${x}-${y}`} transform={`translate(${x},${y})`}><path d="M-1 0H2V8H-1Z" fill="#4b3d30"/><path d="M-2-5H2V-3H4V0H5V4H-5V1H-4V-3H-2Z" fill={dia?'#456654':'#243d3c'}/><path d="M-2-4H2V-2H-2Z" fill="#819780" opacity=".46"/></g>)}
  <Predio x={14} y={25} w={24} cor="#766856"/>
  <Predio x={84} y={24} w={23} cor="#596277"/>
  <Predio x={53} y={44} w={27} cor="#8a5449" luz/>
  <text x="61" y="64" textAnchor="middle" fontSize="3" fontFamily="monospace" fill={amber}>13</text>
  <path d="M42 79h7v20h-7z" fill="#84634f" stroke="#383038" strokeWidth=".8"/>
  <path d="M43 83h5m-5 4h5m-5 4h5m-5 4h5" stroke="#343845"/>
  <rect x="79" y="61" width="6" height="9" fill="#354d60" stroke="#92bfba" strokeWidth=".6"/>
  <rect x="80" y={acao==='reservas'?68:67} width="4" height={acao==='reservas'?1:2} fill={acao==='reservas'?red:cyan}/>
  {oficina&&<><rect x="85" y="25" width="21" height="26" fill="#3e4246" stroke="#8b8c7f" strokeWidth=".5"/><path d="M86 33h19m-19 8h19m-15-15v24m6-24v24" stroke="#525653" strokeWidth=".4"/><rect x="87" y="27" width="5" height="5" fill="#725b44"/><rect x="99" y="44" width="5" height="4" fill="#6b685a"/><path d="M85 43v6" stroke="#303d3e" strokeWidth="2"/></>}
  {oficina&&<path d={`M90 53L101 ${acao==='porta'?51+progresso(t,1,2)*4:53}`} stroke="#b68a59" strokeWidth="2"/>}
  {!dia&&<rect width="120" height="126" fill="#101a36" opacity=".22"/>}
  {!dia&&<path d="M61 71H72L84 91H52Z" fill={amber} opacity=".22"/>}
  {posto&&<g opacity={acao==='posto'?progresso(t,.5,2):1}>
   <rect x="85" y="91" width="14" height="10" fill="#273c38" stroke="#a1b59b" strokeWidth=".5"/>
   <path d="M86 95h11v2H86zM87 97v4m9-4v4" fill="#a48054" stroke="#a48054" strokeWidth="1"/>
   <rect x="91" y="92" width="4" height="3" fill="#d6e1d4"/><path d="M92 93h2m-1-1v2" stroke="#458e72" strokeWidth=".7"/>
   <rect x="86" y="89" width="12" height="3" fill="#e6dcc2"/><text x="92" y="91.2" textAnchor="middle" fontSize="2" fontFamily="monospace" fill="#294b40">SOCORROS</text>
  </g>}
  {['pecas','retorno'].includes(acao)&&<g fill="#ab895c"><rect x="89" y="72" width="4" height="3"/><path d="M91 70h6v1h-5v3h-1z" fill="#a4b4b0"/></g>}
  {['resultado',...['encontro','porta','socorro','ameaca','giu','gravador','desvio','pecas']].includes(acao)&&[0,1,2,3].map(i=>{
   const p=acao==='gravador'?progresso(t,dur*.65,dur-.2):audio?1:0;
   const x=lerp(99+i%2*4,89+i%2*4,p),y=lerp(58+i*3,73+i*2,p);
   return <g key={i} opacity=".9"><Pessoa x={x} y={y} roupa="#4a5459" passo={Math.floor(t*6+i)%2}/><rect x={x-2} y={y-3} width="4" height="4" fill="#77807a"/></g>;
  })}
  {acao==='opcao-a'&&[0,1,2].map(i=><Pessoa key={i} x={30+i*5} y={66+i%2*3} roupa="#4a5459" passo={Math.floor(t*6+i)%2}/>)}
  {atores.map(a=><Sobrevivente key={a.id} {...a} t={t}/>)}
  {acao==='socorro'&&t>2&&atores.filter(a=>a.id==='nilo').map(a=><rect key="curativo" x={a.x+2} y={a.y+2} width="2" height="1" fill="#e7dfca"/>)}
  {acao==='giu'&&<g><rect x="69" y="24" width="22" height="5" fill="#152126" stroke={amber} strokeWidth=".4"/><text x="80" y="27.5" textAnchor="middle" fontSize="2.8" fontFamily="monospace" fill={amber}>DEVOLVE ISSO!</text></g>}
  {audio&&<g><rect x="89" y="72" width="5" height="3" fill="#bab5a5"/><rect x="90" y="73" width="2" height="1" fill="#263940"/>{[0,1,2].map(i=><circle key={i} cx="91" cy="74" r={2+(t*6+i*4)%12} fill="none" stroke={amber} strokeWidth=".6" opacity={.6-((t*6+i*4)%12)/24}/>)}</g>}
  {['custo','rota'].includes(acao)&&<path d="M68 81L96 73V56" fill="none" stroke={cyan} strokeWidth="1" strokeDasharray="2 2" strokeDashoffset={-t*4}/>}
  {['opcao-a','votacao','convite'].includes(acao)&&<g><path d="M61 79V71H27V56" fill="none" stroke={amber} strokeWidth="1" strokeDasharray="2 2" strokeDashoffset={-t*3}/><rect x="22" y="51" width="9" height="8" fill={amber}/><text x="26.5" y="57" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#142026">A</text></g>}
  {['opcao-b','votacao','convite'].includes(acao)&&<g><path d="M74 79H82V71" stroke={cyan} strokeDasharray="2 2" strokeWidth="1" fill="none"/><path d="M76 59H87V76H84" fill="none" stroke={cyan} strokeDasharray="1 1" strokeWidth="1" opacity={.5+.3*Math.sin(t*3)}/><rect x="86" y="64" width="8" height="8" fill={cyan}/><text x="90" y="70" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#142026">B</text></g>}
  {acao==='reservas'&&<rect x="77" y="59" width="10" height="13" fill="none" stroke={red} strokeWidth=".6" strokeDasharray="2 1"/>}
  {etiquetas.map(e=><g key={e.ator.id}>
   <rect x={e.x} y={e.y} width={e.w} height={e.h} fill="#0d191e" stroke={coresNome[e.ator.id]} strokeWidth=".3"/>
   <text x={e.x+e.w/2} y={e.y+3.5} textAnchor="middle" fontSize="2.7" fontFamily="monospace" fontWeight="bold" fill={coresNome[e.ator.id]}>{nomes[e.ator.id]}</text>
  </g>)}
 </svg>;
};
