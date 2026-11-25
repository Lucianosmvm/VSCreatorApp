import React from 'react';
import {AbsoluteFill,Audio,Sequence,staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import tl from '../../public/videos/imagina-so-07-qi-infinito-mwunfjkb/timeline.json';
import {useT,COR,rampa} from './Bloco';
import {Boneco3D,Brilhos,Caixa,Camera,Controle3D,Coracao3D,Mundo3D,Pia3D} from './Bloco3D';
import {Bolo3D,Botao3D,Brocolis3D,Cachorro3D,Caderno3D,FoguetePapelao3D,Livro3D,Lousa3D,Mesa3D,Mochila3D,Poof3D,Relogio3D,Robo3D,Sofa3D,Spray3D,Tradutor3D} from './Objetos3D';
import {Balao3D,Faixa3D,Flash,Legenda3D,Marca3D,montarFala} from './Camada2D';

// Visual aprovado: narração original ElevenLabs com os tempos reais por palavra.
const PASTA='videos/imagina-so-07-qi-infinito-mwunfjkb/';
const F=montarFala(tl,{vel:1.15,inicio:.35});
const {S}=F,PI=Math.PI;
export const QI_INFINITO_DUR=F.fim+.6;
type V3=[number,number,number];
type BProps=React.ComponentProps<typeof Boneco3D>;
const Actor:React.FC<BProps&{rot?:V3}>=({rot=[0,0,0],pos=[0,0,0],...props})=><group position={pos} rotation={rot}><Boneco3D {...props}/></group>;
const filho=(p:Partial<BProps>&{rot?:V3})=><Actor tipo="filho" {...p}/>;
const mae=(p:Partial<BProps>)=><Actor tipo="mae" coroa {...p}/>;
const cena=(t:number)=>S.reduce((a,s,i)=>t>=s-.025?i:a,0);
const prog=(t:number,a:number,b:number)=>{const q=rampa(t,a,b);return q*q*(3-2*q);};
const mistura=(a:V3,b:V3,q:number)=>a.map((n,i)=>n+(b[i]-n)*q) as V3;
const camera=(x=0,z=10.3,alvoY=2.45,y=3.5)=>({pos:[x,y,z] as V3,alvo:[x*.2,alvoY,0] as V3});
const controlador=<Controle3D rot={[1.3,0,0]} esc={.75}/>;
const tarefaClone=(t:number)=>t<F.W(8,'lava')?0:t<F.W(8,'arruma')?1:2;

const Mundo:React.FC=()=>{
 const {t}=useT(),k=cena(t),d=t-S[k],dur=(S[k+1]??QI_INFINITO_DUR)-S[k],p=Math.max(0,d/dur);
 let cam=camera(),objs:React.ReactNode,atores:React.ReactNode;
 let mundoT=t;
 if(k===0){
  cam=t<.48?{pos:[0,2.4,8],alvo:[0,2.4,0]}:camera(.15,6.5-prog(d,.3,2)*.45,2.8,3.1);
  atores=filho({expr:t<.5?'medo':'feliz',bracoE:[-2.5,-.25],bracoD:[-2.5,.25]});
  objs=<>{t<.5&&<Livro3D pos={mistura([0,3,-5],[0,2.4,7.8],prog(t,0,.49))} rot={[t*16,.4,t*6]} esc={2.4} cor={COR.vermelho}/>}{t>.48&&<><Brilhos t={t} pos={[0,3,0]} raio={.8} n={10}/><pointLight position={[0,3.4,1]} intensity={.6} color="#ffe888"/></>}</>;
 }
 if(k===1){
  const close=d>2.5;
  cam=close?{pos:[-1.15,3.7,4.7],alvo:[-1.2,1.35,.7]}:camera(.3,13.8,2.25,4.5);
  atores=filho({pos:[3.0,.98,.5],rot:[0,0,PI/2],rotY:0,bracoE:[-1.4,-.2],bracoD:[-1.4,.2],segura:controlador,expr:'feliz'});
  objs=<><Sofa3D pos={[1.6,0,0]} esc={.9}/><Robo3D t={t} pos={[-1.8,0,0]} escrevendo/><Mesa3D pos={[-1.3,0,1.05]} esc={.85}/><Caderno3D pos={[-.9,1.16,.85]} escrita={prog(d,.3,dur-.4)}/>{close&&<Caderno3D pos={[-1.85,1.16,.85]} escrita={.95} esc={.7}/>}</>;
 }
 if(k===2){
  const spray=d>dur*.24&&d<dur*.65,choc=d>dur*.5,eat=prog(d,dur*.74,dur*.94);
  cam=d<dur*.48?{pos:[.1,3.8,5.5],alvo:[0,1.9,.5]}:camera(0,6.7,2.2,3.5);
  atores=filho({pos:[0,0,-.4],expr:choc?'feliz':'medo',bracoD:[-1.4,-.35],bracoE:[-1.8,-.2]});
  objs=<><Mesa3D pos={[0,0,.9]}/><Brocolis3D pos={[0,1.35,.95]} esc={.8} chocolate={choc} resto={eat>.9?.4:1}/><Spray3D t={t} pos={[1.1,1.98,.95]} ativo={spray}/>{eat>0&&<Caixa p={[-.1,1.9+eat*.5,.72-eat*.55]} s={[.28,.25,.28]} cor="#61351f" contorno={.025}/>}{choc&&<Brilhos t={t} pos={[0,1.9,1]} raio={.6} n={6}/>}</>;
 }
 if(k===3){
  const freeze=d>dur*.43,st=freeze?S[k]+dur*.43:t;
  mundoT=st;cam=freeze?camera(.3,11.5,2.45,3.5):camera(-.2,10.5,2.5,3.6);
  atores=<>{mae({pos:[-1.6,0,0],expr:'brava',boca:freeze?.9:.5+Math.sin(t*18)*.3,bracoD:[-1.2,freeze?-.5:Math.sin(t*8)*.2-.5]})}{filho({pos:[1.05,.2,0],expr:'feliz',pernaE:-PI/2,pernaD:-PI/2,bracoD:[-1.4,.25],bracoE:[-1.4,-.25],segura:freeze?controlador:<Botao3D rot={[1.3,0,0]} apertado={freeze}/>})}</>;
  objs=<><Sofa3D pos={[1.2,0,-.4]} esc={.65}/><Relogio3D pos={[-.15,4,-2]} esc={.45} h={st*.18}/><Botao3D pos={[.1,1.1,.6]} apertado={freeze}/>{freeze&&<Brilhos t={t} pos={[.1,1.1,.6]} raio={.35} n={5} cor="#7fd3ff"/>}</>;
 }
 if(k===4){
  const launch=p<.32,flight=p>=.32&&p<.68,land=p>=.68;
  const rise=launch?prog(p,.15,.32)*4:flight?4:4*(1-prog(p,.68,.86));
  const rx=flight?Math.sin(t*2)*.7:-.9;
  cam=flight?{pos:[.2,5.8,12],alvo:[0,5.2,0]}:camera(.15,12.4,2.5+rise*.6,4+rise*.6);
  atores=<>{(launch&&p<.13)?filho({pos:[-2.1,0,.3],bracoD:[-2.7,.3]}):land&&p>.88?filho({pos:[.1+prog(p,.88,1)*.5,0,.7],bracoD:[-2.7,.25]}):filho({pos:[rx,1.5+rise,.98],esc:.4,bracoD:[-2.5,.2]})}{land&&<Actor tipo="avo" pos={[1.6,0,0]} bracoE={[-1.4,-.2]} bracoD={[-1.4,.2]} segura={<Bolo3D esc={.5} rot={[1.3,0,0]}/>}/>}</>;
  objs=<><FoguetePapelao3D pos={[rx,rise,0]} t={t} motor={p>.14&&p<.86} rot={[0,0,flight?Math.sin(t*3)*.12:0]}/>{land&&<Mesa3D pos={[2.9,0,-1.2]} esc={.7}/>}</>;
 }
 if(k===5){
  cam=d<dur*.45?camera(.3,10,2.15,3.6):{pos:[-.35,2.5,6.3],alvo:[-.35,1.7,0]};
  atores=filho({pos:[1.5,0,-.4],rotY:-.6,bracoE:[-1.6,-.3],expr:'feliz'});
  objs=<><Lousa3D pos={[0,0,-1.9]} cheia={prog(d,.3,dur-.2)} certo={p>.76}/><Cachorro3D t={t} pos={[-.4,.15,.4]} rotY={p<.4?PI:.2} oculos lapis boca={.2}/><Caderno3D pos={[-.4,.12,1.7]} escrita={prog(d,.4,dur)}/></>;
 }
 if(k===6){
  const no=d>dur*.56;cam=no?camera(.4,8.3,2.35,3.2):camera(0,10.2,2.45,3.6);
  atores=<>{mae({pos:[-1.35,0,0],expr:'feliz',boca:no?0:.5+Math.sin(t*17)*.3,bracoD:[-1.45,.2]})}{filho({pos:[1.2,0,0],expr:no?'medo':'feliz',bracoE:[-1.6,-.25],bracoD:[-1.6,.25],cabeca:[0,no?-.25:0]})}</>;
  objs=<Tradutor3D pos={[.3,1.7,1.2]} esc={1.1} ativo={no}/>;
 }
 if(k===7){
  const pop=d>dur*.36,q=prog(d,dur*.36,dur*.7);cam=camera(0,11.3,2.5,3.9);
  atores=<>{filho({pos:[-1.4,0,0],expr:'feliz',bracoD:[-2,.45]})}{pop&&<group scale={Math.max(.01,q)} position={[1.1,0,0]}>{filho({bracoD:[-2.5,.25],expr:'feliz'})}<Mochila3D pos={[0,1.4,-.52]}/></group>}</>;
  objs=<><Poof3D t={t} t0={S[k]+dur*.36} pos={[1.1,.2,0]}/>{pop&&<Brilhos t={t} pos={[1.1,1.8,0]} raio={1.3} n={8} cor="#7fd3ff"/>}</>;
 }
 if(k===8){
  const stage=tarefaClone(t);cam=camera(0,8.2,2.3,3.5);
  atores=stage===0?filho({bracoD:[-1.3,.2],expr:'feliz'}):stage===1?filho({pos:[-.65,0,0],rotY:.8,bracoD:[-1.5+Math.sin(t*18)*.15,.2],bracoE:[-1.5-Math.sin(t*18)*.15,-.2]}):filho({pos:[Math.sin(d*2)*.65,0,0],bracoD:[-1.6,.15],bracoE:[-1.6,-.15],pernaE:Math.sin(t*10)*.3,pernaD:-Math.sin(t*10)*.3});
  objs=stage===0?<group position={[.55,1.65,1]} rotation={[.95,0,0]}><Caderno3D escrita={.3} notaDez/></group>:stage===1?<Pia3D t={t} pos={[.65,0,1]} pratos={Math.max(0,6-Math.floor(prog(t,F.W(8,'lava'),F.W(8,'arruma'))*6))}/>:<><Caixa p={[0,.34,-2.1]} s={[3.4,.65,2.2]} cor="#6d4c9f"/><Caixa p={[0,.75,-2.1]} s={[3.1,.16,1.5]} cor="#7ecbdb"/>{[0,1,2,3].map(i=>prog(t,F.W(8,'arruma'),S[9])<i/4+.15?<Caixa key={i} p={[-1.4+i*.9,.12,.9]} s={[.5,.2,.4]} cor={[COR.vermelho,COR.amarelo,COR.azul,COR.verde][i]}/>:null)}<Brilhos t={t} pos={[0,1,-1.8]} raio={1.4} n={6}/></>;
 }
 if(k===9){
  const hug=prog(d,.3,1.15);cam=camera(-.3,14.8-prog(d,.4,dur)*.25,2.55,3.8);
  atores=<>{filho({pos:[-2.25,0,.15],expr:'medo',boca:.9,cabeca:[0,.25],bracoE:[0,-.4],bracoD:[0,.4]})}{mae({pos:[.15,0,0],expr:'feliz',rotY:.25,bracoD:[-1.3,-hug*.9],bracoE:[-1.4,-.2]})}{filho({pos:[1.8-hug*.8,0,.3],expr:'feliz',rotY:-.25,bracoE:[-1.4,hug*.75],bracoD:[-1.4,.1]})}</>;
  objs=<>{[0,1,2,3].map(i=><Coracao3D key={i} pos={[.65+Math.sin(i*3+t)*.4,3.45+(d*.65+i*.3)%1.3,.3]} esc={.22}/>)}</>;
 }
 if(k===10){
  const defeated=p>.5;cam=defeated?camera(.3,9.4,2.5,3.5):camera(0,11.2,2.5,3.7);
  atores=<>{filho({pos:[-1.25,0,0],expr:defeated?'medo':'feliz',bracoD:defeated?[0,.2]:[-1.4,-.5],cabeca:defeated?[.2,0]:[0,0],boca:defeated?0:.5})}{mae({pos:[1.2,0,0],expr:'brava',bracoE:[-1.45,.95],bracoD:[-1.45,-.95]})}</>;
 }
 if(k===11){
  cam={pos:[0,3.5,12.5],alvo:[0,2.5,0]};
  const wave=Math.sin(t*11)*.3;
  atores=<>{filho({pos:[-1.8,0,0],bracoD:[-2.7,.3+wave]})}{filho({pos:[0,0,0],bracoD:[-2.7,.3-wave]})}{mae({pos:[1.8,0,0],bracoE:[-2.7,-.3+wave]})}</>;
  const start=QI_INFINITO_DUR-.65;
  objs=t>start?<Livro3D pos={mistura([-.8,2.5,.2],[0,2.5,12.4],prog(t,start,QI_INFINITO_DUR-.01))} rot={[t*16,.4,t*6]} esc={2.4} cor={COR.vermelho}/>:null;
 }
 return <><Camera {...cam}/><ambientLight intensity={.65}/><hemisphereLight args={['#cfefff','#7fbf5a',.7]}/><directionalLight position={[6,12,8]} intensity={1.6} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14}/><Mundo3D t={mundoT}/>{atores}{objs}</>;
};

const titulos=['QI: ∞','LIÇÃO NO AUTOMÁTICO','BRÓCOLIS DE CHOCOLATE','PAUSA NA MÃE','DESTINO: CASA DA AVÓ','CACHORRO COM DIPLOMA','TRADUTOR DE MÃE','UM CLONE PRA ESCOLA','O FILHO PERFEITO','ELA PREFERE O CLONE!','VOCÊ 0 × MÃE ∞','O QUE VOCÊ INVENTARIA?'];
const Camada:React.FC=()=>{
 const {t}=useT(),k=cena(t),d=t-S[k],dur=(S[k+1]??QI_INFINITO_DUR)-S[k];
 return <><Marca3D/><Faixa3D t0={k===0?.48:S[k]+.08} t1={S[k+1]??QI_INFINITO_DUR} txt={titulos[k]} y={k===10?280:280} tam={k===0?170:k===10?94:68}/>
 {k===1&&d>dur*.53&&<Balao3D t0={S[k]+dur*.53} t1={S[k+1]} txt="ATÉ A SUA LETRA!" x={540} y={560} tam={53}/>}
 {k===2&&d>dur*.5&&<Balao3D t0={S[k]+dur*.5} t1={S[k+1]} txt="CHOCOLATE!" x={540} y={570} tam={64}/>}
 {k===3&&<><Balao3D t0={S[k]+.12} t1={S[k+1]} txt="JANTAAAR!" x={310} y={560} tam={56}/>{d>dur*.43&&<Balao3D t0={S[k]+dur*.43} t1={S[k+1]} txt="Ⅱ PAUSADO" x={740} y={740} tam={44}/>}</>}
 {k===4&&d>dur*.68&&<Balao3D t0={S[k]+dur*.68} t1={S[k+1]} txt="TEM BOLO!" x={690} y={580} tam={53}/>}
 {k===6&&<><Balao3D t0={S[k]+.15} t1={S[k]+dur*.56} txt="DEPOIS A GENTE VÊ" x={540} y={570} tam={51}/><Balao3D t0={S[k]+dur*.56} t1={S[k+1]} txt="TRADUÇÃO: NÃO!" x={540} y={600} tam={68}/></>}
 {k===7&&d>dur*.5&&<Balao3D t0={S[k]+dur*.5} t1={S[k+1]} txt="VAI POR MIM!" x={540} y={590} tam={54}/>}
 {k===8&&<Faixa3D t0={[S[k],F.W(8,'lava'),F.W(8,'arruma')][tarefaClone(t)]} t1={S[k+1]} txt={['NOTA 10!','LOUÇA LAVADA!','QUARTO ARRUMADO!'][tarefaClone(t)]} y={540} tam={72} cor="#ffffff"/>}
 {k===9&&<Balao3D t0={S[k]+.45} t1={S[k+1]} txt="MEU FILHO EXEMPLAR!" x={590} y={570} tam={48}/>}
 <Legenda3D fala={F} fim={QI_INFINITO_DUR} top={1390}/></>;
};

export const ImaginaSoQIInfinito3D:React.FC=()=>{
 const {fps}=useT();
 return <AbsoluteFill style={{background:'linear-gradient(#4fb6ff,#bfe7ff)'}}><ThreeCanvas width={1080} height={1920} shadows flat camera={{fov:50,position:[0,2.4,8],near:.1,far:200}}><Mundo/></ThreeCanvas><Camada/><Flash picos={[.48,S[7]+(S[8]-S[7])*.36,QI_INFINITO_DUR-.03]}/>
 <Sequence from={0} premountFor={fps}><Audio src={staticFile('sfx/musica.wav')} volume={.1} loop/></Sequence>
 {tl.cenas.map((c,i)=><Sequence key={`voz-${i}`} from={Math.round(S[i]*fps)} premountFor={fps}><Audio src={staticFile(PASTA+c.audio)} playbackRate={F.vel}/></Sequence>)}
 {S.map((s,i)=><Sequence key={i} from={Math.round(s*fps)} premountFor={fps}><Audio src={staticFile(`sfx/${i===9?'erro':i===7?'pop':'whoosh'}.wav`)} volume={.35}/></Sequence>)}
 </AbsoluteFill>;
};
