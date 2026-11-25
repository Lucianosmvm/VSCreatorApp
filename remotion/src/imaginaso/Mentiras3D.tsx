import React from 'react';
import {AbsoluteFill,Audio,Sequence,staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import tl from '../../public/videos/imagina-so-08-mentiras-viram-realidade-mwuppkq4/timeline.json';
import {useT,COR,rampa} from './Bloco';
import {Boneco3D,Brilhos,Caixa,Camera,Chinelo3D,Controle3D,Mundo3D,tremor} from './Bloco3D';
import {Balde3D,Bandeja3D,Cachorro3D,Churrasqueira3D,Esfregao3D,Mochila3D,Nota3D,Poof3D} from './Objetos3D';
import {Dinossauro3D,Escola3D,Onda3D,Onibus3D,Piscina3D,Rua3D} from './Cenarios3D';
import {Balao3D,Faixa3D,Flash,Legenda3D,Marca3D,montarFala} from './Camada2D';

// EP08: visual aprovado, narração real e velocidade de montagem da série.
const PASTA='videos/imagina-so-08-mentiras-viram-realidade-mwuppkq4/';
const F=montarFala(tl,{vel:1.15,inicio:.35}),{S}=F,PI=Math.PI;
export const MENTIRAS_DUR=F.fim+.65;
type V3=[number,number,number];
type BP=React.ComponentProps<typeof Boneco3D>;
const Actor:React.FC<BP&{rot?:V3}>=({pos=[0,0,0],rot=[0,0,0],...p})=><group position={pos} rotation={rot}><Boneco3D {...p}/></group>;
const Filho=(p:Partial<BP>)=><Actor tipo="filho" {...p}/>;
const Mae=(p:Partial<BP>)=><Actor tipo="mae" coroa {...p}/>;
const Pai=(p:Partial<BP>)=><Actor tipo="pai" social avental {...p}/>;
const cena=(t:number)=>S.reduce((a,s,i)=>t>=s-.02?i:a,0);
const q=(t:number,a:number,b:number)=>{const v=rampa(t,a,b);return v*v*(3-2*v);};
const mix=(a:V3,b:V3,p:number)=>a.map((n,i)=>n+(b[i]-n)*p) as V3;
const cam=(x=0,z=12,y=4,alvoY=2.5)=>({pos:[x,y,z] as V3,alvo:[x*.15,alvoY,0] as V3});
const CHURRAS:V3=[1.4,0,2.2],PISCINA:V3=[-1.1,0,-.8];
const dinheiro=(t:number,chovendo:boolean)=>Array.from({length:16},(_,i)=>{
 const x=((i*1.617)%7)-3.5,z=((i*1.37)%2)-3.5;
 const y=chovendo?7-((t*2+i*.47)%6.9):.1;
 return <Nota3D key={i} pos={[x,y,z]} esc={.9} rot={[chovendo?t+i:0,i*2.2,chovendo?Math.sin(t*3+i)*.5:0]}/>;
});

const Cena3D:React.FC=()=>{
 const {t}=useT(),k=cena(t),d=t-S[k],dur=(S[k+1]??MENTIRAS_DUR)-S[k],p=Math.max(0,d/dur);
 let camera=cam(),atores:React.ReactNode,objetos:React.ReactNode;
 if(k===0){
  camera=t<.52?{pos:[0,2.25,8],alvo:[0,2.25,0]}:cam(0,10.8,3.8,2.1);
  atores=Filho({pos:[-1.15,0,-.1],expr:'medo',bracoD:[-1.4,.3],bracoE:[-1.4,-.3],boca:.6});
  objetos=<><Cachorro3D t={t} pos={[1,0,.1]} esc={1.35} boca={.8}/>{t<.52?<group position={mix([0,2,-5],[0,2.25,7.85],q(t,0,.51))} rotation={[t*12,t*8,.3]}><Mochila3D esc={2.8}/></group>:<Mochila3D pos={[.1,1.1,1.2]} esc={.8}/>}</>;
 }
 if(k===1){
  const pull=q(d,dur*.15,dur*.62),eat=q(d,dur*.62,dur*.94);
  camera=p<.52?cam(0,11,3.5,2):{pos:[.6,2.5,6.2],alvo:[.65,1.5,1.1]};
  atores=p<.52?Filho({pos:[-1.3-.2*eat,0,0],expr:'medo',bracoD:[-1.5,-.5],bracoE:[-1.5,-.15],boca:.8}):null;
  objetos=<><Cachorro3D t={t} pos={[1,0,.1]} esc={1.35} boca={.5+Math.abs(Math.sin(t*18))*.5}/>{eat<.99&&<group position={mix([-.55,1.25,.8],[1,1.5,1.92],pull)} rotation={[0,0,Math.sin(t*16)*.13]}><Mochila3D esc={.85*(1-eat)}/></group>}{eat>.9&&<Brilhos t={t} pos={[1,1.4,1.9]} raio={.3} n={5}/>}</>;
 }
 if(k===2){
  const vanish=q(d,dur*.35,dur*.58),bus=q(d,0,dur*.3);
  camera={pos:[3,5.3,17.5],alvo:[0,2.3,-1.5]};
  atores=Filho({pos:[-2.5,0,1.4],rotY:.2,expr:vanish>.5?'medo':'feliz',bracoD:[-1.8,-.4]});
  objetos=<><Escola3D pos={[0,0,-2.6]} sumindo={vanish}/><Poof3D t={t} t0={S[k]+dur*.35} pos={[0,0,-2.6]}/><group scale={.62} position={[5-bus*3.5,0,1.2]}><Onibus3D rodas={bus*5}/></group></>;
 }
 if(k===3){
  camera=p<.5?cam(0,12,4.2,2.4):cam(1.1,9.4,4.1,2.3);
  atores=<>{Filho({pos:[-1.5,0,.5],expr:'feliz',bracoE:[-2.6,-.2],bracoD:[-2.6,.2]})}{Pai({pos:[1.4,0,.1],expr:'medo',bracoE:[-1.45,-.2],bracoD:[-1.45,.2],segura:<Bandeja3D rot={[1.4,0,0]} esc={.7}/>})}</>;
  objetos=<><Churrasqueira3D t={t} pos={CHURRAS}/>{dinheiro(t,true)}<Brilhos t={t} pos={[0,3,.5]} raio={1.8} n={7}/></>;
 }
 if(k===4){
  camera={pos:[1.6,3.5,7.3],alvo:[1.4,2.3,1]};
  atores=Pai({pos:[1.4,0,.1],expr:'brava',bracoE:[-2.6,-.25],bracoD:[-2.6,.25],segura:<Bandeja3D rot={[2.6,0,0]} esc={.9}/>});
  objetos=<><Churrasqueira3D t={t} pos={CHURRAS}/>{dinheiro(t,true)}</>;
 }
 if(k===5){
  const grow=q(d,dur*.3,dur*.63);
  camera=cam(0,13.8+grow*2,4.3+grow*.5,2.7+grow*.2);
  atores=Filho({pos:[-2,0,1.2],expr:grow>.6?'medo':'feliz',bracoD:[-1.5,-.3],boca:grow>.6?.7:0});
  objetos=<><Piscina3D pos={PISCINA}/><Churrasqueira3D t={t} pos={CHURRAS}/><Poof3D t={t} t0={S[k]+dur*.3} pos={[.7,0,-.4]}/>{grow>0&&<Dinossauro3D t={t} pos={[.7,0,-.4]} esc={grow} rotY={-.5} boca={.5}/>} {dinheiro(t,false)}</>;
 }
 if(k===6){
  const lift=q(d,dur*.06,dur*.26)*(1-q(d,dur*.3,dur*.46)),breaks=q(d,dur*.42,dur*.6),wave=q(d,dur*.48,dur*.88);
  camera={pos:[1.8,5.1,16.8],alvo:[0,2.2,.4]};
  atores=<>{Filho({pos:[-2.4,0,1.7],expr:'medo',bracoD:[-2.3,.2],bracoE:[-2.3,-.2]})}{Pai({pos:[1.4,0,.1],expr:'medo',bracoD:[-1.3-wave*1.2,.2],bracoE:[-1.3-wave*1.2,-.2],segura:<Bandeja3D rot={[1.3+wave*1.2,0,0]} esc={.7} carne={wave>.3}/>})}</>;
  objetos=<><Dinossauro3D t={t} pos={[-.55,0,.2]} rotY={0} pisao={lift} boca={.3}/><Piscina3D pos={PISCINA} rompimento={breaks}/><Churrasqueira3D t={t} pos={CHURRAS} carne={wave<.3}/>{wave>0&&wave<1&&<Onda3D pos={mix([-.8,0,.9],[1.4,0,2.2],wave)} t={t} forca={1}/>} {dinheiro(t,false)}</>;
 }
 if(k===7){
  const connect=p>.28,walk=connect?Math.sin(t*7)*.12:0;
  camera=cam(0,14.8,4.5,2.8);
  atores=Filho({pos:[-2,0,1.4],expr:'feliz',bracoD:[-1.4,.1],bracoE:[-1.4,-.1],segura:connect?<Controle3D rot={[1.4,0,0]} brilho={.4}/>:undefined});
  objetos=<><Dinossauro3D t={t} pos={[.7+walk,0,-.5]} rotY={-.5+walk} andando={connect?.6:0} boca={.12}/><Piscina3D pos={PISCINA} rompimento={1}/><Churrasqueira3D t={t} pos={CHURRAS} carne={false}/><Poof3D t={t} t0={S[k]+dur*.25} pos={[-1.3,1.3,2]}/>{connect&&<Brilhos t={t} pos={[-1.15,1.7,2]} raio={.4} n={5} cor="#7fd3ff"/>}{dinheiro(t,false)}</>;
 }
 if(k===8){
  const fail=p>.5,run=fail?q(d,dur*.5,dur*.95):0;
  camera=p<.45?{pos:[-1.2,3.4,6.8],alvo:[-1.4,2.15,1.2]}:cam(0,15,4.7,2.9);
  atores=Filho({pos:[-2-run*.6,0,1.4+run*.4],expr:fail?'medo':'feliz',bracoD:[-1.4-Math.sin(t*18)*.1,.1],bracoE:[-1.4,-.1],segura:<Controle3D rot={[1.4,0,0]} brilho={fail?0:.2}/>,pernaE:run?Math.sin(t*15)*.3:0,pernaD:run?-Math.sin(t*15)*.3:0});
  objetos=<><Dinossauro3D t={t} pos={[.7-run*.3,0,-.5+run*.25]} rotY={-.5+run*.6} andando={fail?1:0} boca={fail?.7:.1}/><Piscina3D pos={PISCINA} rompimento={1}/><Churrasqueira3D t={t} pos={CHURRAS} carne={false}/>{dinheiro(t,false)}</>;
 }
 if(k===9){
  const grow=q(d,dur*.33,dur*.78),size=1+grow*1.8;
  camera={pos:[.4,4.7+grow*2,13+grow*8],alvo:[0,2.6+grow*2.4,0]};
  atores=<>{Filho({pos:[-2.15,0,2.3],expr:'medo',bracoE:[-2.7,-.2],bracoD:[-2.7,.2],boca:.9})}{Mae({pos:[1,0,-1.6],esc:size,expr:'brava',olhosBrilho:grow*.7,bracoD:[-2.7,.3],bracoE:[-1.45,.95],segura:<Chinelo3D rot={[2.7,0,0]} brilho={.6}/>})}</>;
  objetos=<><Dinossauro3D t={t} pos={[-.3,0,.2]} esc={1} rotY={.3} boca={.05}/><Piscina3D pos={PISCINA} rompimento={1}/><Churrasqueira3D t={t} pos={CHURRAS} carne={false}/>{dinheiro(t,false)}</>;
 }
 if(k===10){
  const start=d>dur*.38,scrub=start?Math.sin(t*9)*.3:0;
  camera=cam(0,21,7,4.8);
  atores=<>{Mae({pos:[1.2,0,-2],esc:2.8,expr:'brava',bracoD:[-1.2,-.6],bracoE:[-1.45,.95]})}{Filho({pos:[-2.1,0,3],expr:'medo',bracoD:[-1.5,.1],bracoE:[-1.5,-.1],cabeca:[.14,0]})}</>;
  objetos=<><Esfregao3D pos={[-1.35+scrub,0,3.4]} rot={[.15,0,.12]}/><Balde3D pos={[-2.7,0,3.4]}/><Dinossauro3D t={t} pos={[-.2,0,-.5]} esc={1} rotY={-.6} boca={.05}/><Balde3D pos={[.5,1.8,1.2]} esc={1}/><Piscina3D pos={PISCINA} rompimento={1} agua={1-q(d,dur*.38,dur*.95)}/><Churrasqueira3D t={t} pos={CHURRAS} carne={false}/>{dinheiro(t,false)}</>;
 }
 if(k===11){
  const fly=MENTIRAS_DUR-.62;
  camera=cam(0,22,7,4.8);
  atores=<>{Filho({pos:[-2.1,0,3],expr:'feliz',bracoD:[-2.7,.3+Math.sin(t*10)*.25]})}{Mae({pos:[1.2,0,-2],esc:2.8,expr:'brava',bracoE:[-1.45,.95],bracoD:[-1.45,-.95]})}</>;
  objetos=<><Piscina3D pos={PISCINA} rompimento={1} agua={0}/><Dinossauro3D t={t} pos={[-.2,0,-.5]} esc={1} rotY={-.3}/><Churrasqueira3D t={t} pos={CHURRAS} carne={false}/><Cachorro3D t={t} pos={[-.4,0,4]} boca={.8}/><Esfregao3D pos={[-2.8,0,3.5]}/><Balde3D pos={[-1.2,0,3.7]}/>{t>=fly?<group position={mix([-.4,1.2,5.2],[0,7,21.85],q(t,fly,MENTIRAS_DUR-.01))} rotation={[t*12,t*8,.3]}><Mochila3D esc={2.8}/></group>:<Mochila3D pos={[-.4,1.15,5.2]} esc={.6}/>}</>;
 }
 const tr=k===6?tremor(t,S[k]+dur*.45,.35,.1):k===9?tremor(t,S[k]+dur*.7,.35,.08):[0,0,0] as V3;
 return <><Camera {...camera} pos={mix(camera.pos,[camera.pos[0]+tr[0],camera.pos[1]+tr[1],camera.pos[2]],1)}/><ambientLight intensity={.65}/><hemisphereLight args={['#cfefff','#7fbf5a',.7]}/><directionalLight position={[6,12,8]} intensity={1.6} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20}/>{k===2?<Rua3D desloc={0} casas={false}/>:<Mundo3D t={t}/>}{atores}{objetos}</>;
};

const titulos=['MENTIU? ACONTECEU!','ELE COMEU A MOCHILA!','CADÊ A ESCOLA?','PAI MILIONÁRIO!','PRIORIDADE: CARNE','UM DINOSSAURO?!','LÁ SE FOI A PISCINA!','AGORA EU CONTROLO!','A PILHA TÁ ACABANDO!','MÃE: CHEFE FINAL','PRIMEIRO, LIMPA ISSO.','QUAL SERIA A SUA MENTIRA?'];
const Camada:React.FC=()=>{
 const {t}=useT(),k=cena(t),d=t-S[k],dur=(S[k+1]??MENTIRAS_DUR)-S[k];
 const battery=k===7?1:k===8?1-q(d,.1,dur*.58):0;
 return <><Marca3D/><Faixa3D t0={k===0?.5:S[k]+.1} t1={S[k+1]??MENTIRAS_DUR} txt={titulos[k]} y={260} tam={k===11?60:72}/>
 {k===1&&<Balao3D t0={S[k]+.1} t1={S[k]+dur*.55} txt="MEU CACHORRO COMEU!" x={540} y={540} tam={48}/>}
 {k===2&&<Balao3D t0={S[k]+.15} t1={S[k]+dur*.4} txt="HOJE NÃO TEM ESCOLA!" x={540} y={540} tam={48}/>}
 {k===4&&<Balao3D t0={S[k]+.25} t1={S[k+1]} txt="A CARNE, NÃO!" x={540} y={540} tam={64}/>}
 {(k===7||k===8)&&<div style={{position:'absolute',left:330,right:330,top:410,background:'#241c46',border:'8px solid #1b1530',borderRadius:20,padding:'12px 20px',fontFamily:'Poppins',fontWeight:900,textAlign:'center',color:'#fff'}}><div style={{fontSize:30}}>CONTROLE</div><div style={{display:'flex',gap:10,height:34,marginTop:6}}>{[0,1,2,3].map(i=><div key={i} style={{flex:1,background:battery>(i+.1)/4?(battery<.3?'#ff4d5e':'#5ad35a'):'#4c455b'}}/>)}</div><div style={{fontSize:32,marginTop:5}}>{battery<.05?'SEM SINAL':`${Math.round(battery*100)}%`}</div></div>}
 {k===9&&<Balao3D t0={S[k]+.1} t1={S[k]+dur*.48} txt="MINHA MÃE VAI ME MATAR!" x={540} y={530} tam={44}/>}
 {k===10&&<Balao3D t0={S[k]+.1} t1={S[k]+dur*.65} txt="VOCÊ VAI LIMPAR ISSO." x={540} y={530} tam={49}/>}
 <Legenda3D fala={F} fim={MENTIRAS_DUR} top={1390}/></>;
};

export const ImaginaSoMentiras3D:React.FC=()=>{
 const {fps}=useT();
 return <AbsoluteFill style={{background:'linear-gradient(#4fb6ff,#bfe7ff)'}}><ThreeCanvas width={1080} height={1920} shadows flat camera={{fov:50,near:.1,far:250}}><Cena3D/></ThreeCanvas><Camada/><Flash picos={[.5,S[2]+(S[3]-S[2])*.4,S[5]+(S[6]-S[5])*.35,MENTIRAS_DUR-.03]}/>
 <Sequence from={0} premountFor={fps}><Audio src={staticFile('sfx/musica.wav')} volume={.1} loop/></Sequence>
 {tl.cenas.map((c,i)=><Sequence key={`voz-${i}`} from={Math.round(S[i]*fps)} premountFor={fps}><Audio src={staticFile(PASTA+c.audio)} playbackRate={F.vel}/></Sequence>)}
 {S.map((s,i)=><Sequence key={i} from={Math.round((s+(i===9?(S[10]-S[9])*.33:0))*fps)} premountFor={fps}><Audio src={staticFile(`sfx/${i===8?'erro':i===9?'aura':'whoosh'}.wav`)} volume={.4}/></Sequence>)}
 <Sequence from={Math.round((S[6]+(S[7]-S[6])*.45)*fps)} premountFor={fps}><Audio src={staticFile('sfx/impacto.wav')} volume={.5}/></Sequence>
 </AbsoluteFill>;
};
