import React from 'react';
import * as THREE from 'three';
import {AbsoluteFill,Audio,Sequence,staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import tl from '../../public/videos/imagina-so-09-mae-monstro-da-floresta-mwutrfij/timeline.json';
import {useT,COR,rampa} from './Bloco';
import {Boneco3D,Brilhos,Caixa,Camera,Chinelo3D,Pia3D} from './Bloco3D';
import {Brocolis3D,Esfregao3D} from './Objetos3D';
import {ArvoreFloresta3D,FeixeLanterna3D,Floresta3D,Lanterna3D} from './Floresta3D';
import {AcampamentoGameplay3D,CavernaResgate3D,GalhosCoroa3D,Lenha3D,Machado3D} from './Sobrevivencia3D';
import {Balao3D,Faixa3D,Flash,Legenda3D,Marca3D,montarFala} from './Camada2D';

const PASTA='videos/imagina-so-09-mae-monstro-da-floresta-mwutrfij/';
const F=montarFala(tl,{vel:1.15,inicio:.35}),{S}=F,PI=Math.PI;
export const MAE_GAMEPLAY_DUR=F.fim+.65;
type V3=[number,number,number];type BP=React.ComponentProps<typeof Boneco3D>;
const Filho=(p:Partial<BP>)=><Boneco3D tipo="filho" {...p}/>;
const Mae=(p:Partial<BP>)=>{const{pos=[0,0,0],esc=1.18,rotY=0,...outros}=p;return <group position={pos} rotation={[0,rotY,0]} scale={esc}><Boneco3D tipo="mae" coroa {...outros}/><GalhosCoroa3D/></group>;};
const Pai=(p:Partial<BP>)=><Boneco3D tipo="pai" social avental {...p}/>;
const cena=(t:number)=>S.reduce((a,s,i)=>t>=s-.02?i:a,0);
const prog=(t:number,a:number,b:number)=>{const p=rampa(t,a,b);return p*p*(3-2*p);};
const mix=(a:V3,b:V3,p:number)=>a.map((n,i)=>n+(b[i]-n)*p) as V3;
const cam=(pos:V3=[0,4.5,12.5],alvo:V3=[0,2.2,-.8])=>({pos,alvo,fov:52});
const fogo=(k:number,p:number)=>k<7?1:k===7?1-prog(p,.3,.72):0;
const bracoLam:[number,number]=[-1.4,.12];

const Mundo:React.FC=()=>{
 const {t}=useT(),k=cena(t),d=t-S[k],dur=(S[k+1]??MAE_GAMEPLAY_DUR)-S[k],p=Math.max(0,d/dur),noite=k===0||k>=3;
 let camera=cam(),atores:React.ReactNode,objs:React.ReactNode,camp=true;
 if(k===0){
  camera=t<.5?cam([0,2.5,8],[0,2.5,0]):cam([0,4.3,12.8],[0,2.4,-1]);
  atores=<>{Filho({pos:[-1.05,0,1.5],expr:'medo',bracoD:[-1.4,.1],bracoE:[-1.4,-.1],boca:.7})}{Mae({pos:[1.4,0,-4.1],expr:'brava',olhosBrilho:.8,bracoD:[-2.5,.2],segura:<Chinelo3D rot={[2.5,0,0]} esc={.75}/>})}</>;
  objs=t<.5?<Chinelo3D pos={mix([0,3,-6],[0,2.5,7.9],prog(t,0,.49))} rot={[t*16,t*6,.2]} esc={3} brilho={.35}/>:null;
 }
 if(k===1){
  const cut=p<.43,throwQ=prog(p,.52,.85),b= cut?-1.65+Math.sin(t*17)*.55:-1.7;
  camera=p<.5?cam([-3.5,4.8,11],[.2,1.9,.3]):cam([0,4.6,13.6],[.4,2.1,-.3]);
  atores=<>{Filho({pos:[0,0,2.2],rotY:.5,expr:'feliz',bracoD:[b,.12],segura:cut?<Machado3D rot={[1.3,0,0]} esc={.8}/>:p<.52?<Lenha3D rot={[1.7,0,0]} esc={.8}/>:undefined})}{Mae({pos:[3.2,0,-1.4],expr:'brava',bracoE:[-1.4,-.4]})}</>;
  objs=<>{p<.68?<group position={[1.65,0,2.6]} rotation={[prog(p,.43,.65)*PI/2,0,0]}><ArvoreFloresta3D esc={.8} lowPoly/></group>:<Caixa p={[1.65,.15,2.6]} s={[.5,.3,.5]} cor="#9b744b" contorno={.02}/>}<Esfregao3D pos={[3,0,-1.1]}/>{throwQ>0&&throwQ<1&&<Lenha3D pos={mix([1.1,1.7,2.8],[0,.3,0],throwQ).map((v,i)=>i===1?v+Math.sin(throwQ*PI)*1.2:v) as V3} rot={[t*5,0,t*3]}/>} {throwQ>=1&&<Brilhos t={t} pos={[0,.8,0]} raio={.7} n={7}/>}</>;
 }
 if(k===2){
  camera=cam([0,4.1,12.3],[0,2,-.1]);
  atores=<>{Filho({pos:[-1.2,0,1.1],expr:p>.5?'medo':'feliz',bracoD:[-1.4,.2],bracoE:[-1.4,-.2],boca:p>.5?.6:0})}{Mae({pos:[1.6,0,-3.5],expr:'feliz',bracoD:[-1.4,.1],segura:<group rotation={[1.4,0,0]}><Brocolis3D esc={.55}/></group>})}</>;
  objs=p>.72?<Brocolis3D pos={[-.6,1.7,1.9]} esc={.55}/>:null;
 }
 if(k===3){
  const approach=prog(p,.15,.9);
  camera=cam([.2,4.8,12.5],[0,2.4,-1.6]);
  atores=<>{Filho({pos:[-1.0,0,-1.2],rotY:PI,expr:'medo',bracoD:[-1.4,.1],segura:<Lanterna3D rot={[1.4,0,0]}/>})}{Mae({pos:[.8,0,-7+approach*1.5],expr:'brava',olhosBrilho:1,bracoE:[-1.4,-.4],bracoD:[-2.6,.3],segura:<Chinelo3D rot={[2.6,0,0]} esc={.85}/>})}</>;
 }
 if(k===4){
  camp=false;const freeze=d>.4&&d<Math.min(2.4,dur-.1),step=freeze?0:Math.sin(t*10)*.3;
  camera=p<.63?cam([.2,4.2,3.7],[0,2.1,-5.4]):cam([-1.6,3.7,1],[.1,2.4,-5.5]);
  atores=<>{Filho({pos:[-1,0,-5.5],rotY:PI,expr:'medo',bracoD:bracoLam,segura:<Lanterna3D rot={[1.4,0,0]}/>})}{Mae({pos:[.9,0,-7.2],expr:'brava',olhosBrilho:freeze?0:.8,pernaE:step,pernaD:-step,bracoD:[-2.5,.3],bracoE:[freeze?-2.5:-1.3,-.4],segura:<Chinelo3D rot={[2.5,0,0]} esc={.8}/>})}</>;
  objs=<><FeixeLanterna3D origem={[-1.8,1.8,-6.55]} destino={[.9,2.8,-6.9]}/>{freeze&&<Brilhos t={t} pos={[.9,3.5,-7.2]} raio={1.0} n={8} cor="#c4edff"/>}</>;
 }
 if(k===5){
  const run=prog(p,.15,.95),step=Math.sin(t*16)*.48;
  camera=cam([.2,4.4,8],[0,2.3,-3.7]);
  atores=<>{Filho({pos:[-1+run*.3,0,-5.5+run*2.25],expr:'medo',pernaE:step,pernaD:-step,bracoE:[step,-.1],bracoD:[-step,.1],boca:.8})}{Mae({pos:[.9-run*.3,0,-7.2+run*2.85],expr:'brava',olhosBrilho:.8,pernaE:step,pernaD:-step,bracoD:[-1.8,.3],bracoE:[-2.4,-.2],boca:.8,segura:<Chinelo3D rot={[1.8,0,0]} esc={.8}/>})}</>;
 }
 if(k===6){
  const enter=prog(p,0,.45),brake=prog(p,.1,.52);
  camera=cam([0,5,10.7],[0,2,-1.5]);
  atores=<>{Filho({pos:[-.7,0,-3.25+enter*1.85],expr:enter>.9?'feliz':'medo',bracoD:enter>.9?[-2.5,.3]:[-1.2,.2],bracoE:enter>.9?[-2.5,-.3]:[-1.2,-.2]})}{Mae({pos:[.6+brake*.3,0,-4.35+brake*.5],expr:'brava',olhosBrilho:.7,bracoD:[-1.4,.1],segura:<Chinelo3D rot={[1.4,0,0]} esc={.8}/>})}</>;
 }
 if(k===7){
  const blow=p>.28&&p<.74,off=prog(p,.3,.72);
  camera=cam([.4,4.8,11.4],[0,2,-1]);
  atores=<>{Filho({pos:[-.7,0,-1.4],expr:off>.5?'medo':'feliz',bracoD:off>.5?[-2.5,.2]:[-1.45,-.95],bracoE:off>.5?[-2.5,-.2]:[-1.45,.95],boca:off>.5?.8:0})}{Mae({pos:[.9,0,-3.85],expr:'feliz',cabeca:[.25,0],bracoE:[-1.3,-.2],bracoD:[-1.3,.2],boca:blow?.8:0})}</>;
  objs=blow?<>{Array.from({length:16},(_,i)=>{const v=(t*1.6+i/16)%1,from:V3=[.9,2.85,-3.2],to:V3=[0,.6,0],pt=mix(from,to,v);return <Caixa key={i} p={[pt[0]+Math.sin(i*3)*v*.24,pt[1],pt[2]]} s={[.06+v*.06,.06,.15]} cor="#e2f6f8" contorno={0} opacidade={.65*(1-v)} sombra={false}/>;})}</>:null;
 }
 if(k===8){
  camp=false;const open=prog(p,.22,.55);
  camera=cam([.3,4.7,14.8],[0,2,-.4]);
  atores=<>{Filho({pos:[1.9,0,2.4],rotY:-.3,expr:p>.6?'medo':'feliz',bracoE:[-1.4,-.4],bracoD:[-1.4,.2],boca:p>.6?.8:0})}{Pai({pos:[0,0,-.45],expr:'medo',bracoD:[-1.3,.2]})}</>;
  objs=<CavernaResgate3D aberta={open}/>;
 }
 if(k===9){
  camp=false;const out=prog(p,0,.25),back=prog(p,.42,.8),z=-.45+out*2.3-back*2.3,close=prog(p,.82,.98);
  camera=cam([.2,4.7,15.3],[0,2,.1]);
  atores=<>{Filho({pos:[1.9,0,2.4],expr:'medo',bracoE:[-1.7,-.4],boca:.9})}{Pai({pos:[0,0,z],rotY:back>.05?PI:0,expr:'medo',pernaE:back>0&&back<1?Math.sin(t*15)*.35:0,pernaD:back>0&&back<1?-Math.sin(t*15)*.35:0,bracoD:[-1.5,.2],bracoE:[-1.5,-.2]})}{p>.25&&Mae({pos:[-2.8+prog(p,.25,.65)*.5,0,1.4],expr:'brava',olhosBrilho:.7,bracoD:[-2.5,.3],segura:<Chinelo3D rot={[2.5,0,0]} esc={.8}/>})}</>;
  objs=<CavernaResgate3D aberta={1-close}/>;
 }
 if(k===10){
  const wash=prog(p,.2,.95);
  camera=cam([.1,4,11.3],[0,2.1,.2]);
  atores=<>{Filho({pos:[-.85,0,.1],rotY:.35,expr:'medo',bracoD:[-1.4+Math.sin(t*14)*.15,.1],bracoE:[-1.4-Math.sin(t*14)*.15,-.1]})}{Mae({pos:[1.8,0,-1.2],expr:'feliz',bracoE:[-1.45,.95],bracoD:[-1.45,-.95]})}</>;
  objs=<Pia3D t={t} pos={[.65,0,1.2]} pratos={Math.max(0,6-Math.floor(wash*6))}/>;
 }
 if(k===11){
  const launch=MAE_GAMEPLAY_DUR-.65;
  camera=cam([0,4.1,11.7],[0,2.3,.1]);
  atores=<>{Filho({pos:[-1.0,0,.2],expr:'feliz',bracoD:[-2.6,.3+Math.sin(t*10)*.2]})}{Mae({pos:[1.45,0,-.4],expr:'feliz',bracoD:[-2.5,.3],segura:t<launch?<Chinelo3D rot={[2.5,0,0]} esc={.8}/>:undefined})}</>;
  objs=<><Pia3D t={t} pos={[.5,0,1.8]} pratos={0}/>{t>=launch&&<Chinelo3D pos={mix([1.4,2.4,.5],[0,4.1,11.6],prog(t,launch,MAE_GAMEPLAY_DUR-.01))} rot={[t*16,t*6,.2]} esc={3} brilho={.35}/>}</>;
 }
 return <><Camera {...camera}/><fog attach="fog" args={[noite?'#192b37':'#a0b7a0',20,60]}/><ambientLight intensity={noite?.74:.85}/><hemisphereLight args={[noite?'#a7c6df':'#d8ecff','#597647',noite?.5:.7]}/><directionalLight position={[-7,13,5]} intensity={noite?.85:1.4} color={noite?'#bbd6e6':'#fff5dc'} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22}/><Floresta3D gameplay/>{camp&&<AcampamentoGameplay3D t={t} fogo={fogo(k,p)} zona={k<7?1:k===7?1-prog(p,.5,.85):0}/>} {atores}{objs}</>;
};

const titulos=['E SE O MONSTRO FOSSE SUA MÃE?','LENHA PRA SOBREVIVER','ELA TROCOU SUA COMIDA!','A MÃE ESTÁ BRAVA HOJE','A LANTERNA FUNCIONOU!','APAGA ESSA LUZ!','AQUI ELA NÃO ENTRA!','ELA APAGOU A FOGUEIRA!','RESGATAR UMA CRIANÇA…','O PAI DESISTIU DO RESGATE','MISSÃO: LAVAR A LOUÇA','QUAL PODER SUA MÃE TERIA?'];
const HUD:React.FC=()=>{
 const {t}=useT(),k=cena(t),d=t-S[k],dur=(S[k+1]??MAE_GAMEPLAY_DUR)-S[k],p=Math.max(0,d/dur),fuel=k===1?Math.round(28+prog(p,.65,.9)*66):k<7?94:k===7?Math.round((1-prog(p,.3,.72))*94):0;
 const itens=k>=10?['ESPONJA','PRATO','SABÃO','LOUÇA']:['MACHADO','LANTERNA','SACO','COMIDA'];
 return <><Marca3D/><div style={{position:'absolute',right:45,top:65,color:'#fff',fontFamily:'Poppins',fontWeight:900,fontSize:35,textShadow:'3px 3px #14251b'}}>{k!==0&&k<3?'DIA 1':'NOITE 2'} · RESGATE {k===9&&p>.22&&p<.8?'1':'0'}/4</div>
 <Faixa3D t0={S[k]+.05} t1={S[k+1]??MAE_GAMEPLAY_DUR} txt={titulos[k]} y={240} tam={k===0?57:k===11?60:k===3?64:68} cor={k===3?'#ff7171':COR.amarelo}/>
 {(k<=7&&k!==4)&&<div style={{position:'absolute',top:420,left:275,right:275,padding:'10px 18px',background:'rgba(22,36,30,.94)',border:'5px solid #d5d1b8',fontFamily:'Poppins',fontWeight:900,color:'#fff',textAlign:'center'}}><div style={{fontSize:31}}>FOGUEIRA · {fuel}%</div><div style={{height:22,background:'#272c28',marginTop:7}}><div style={{height:'100%',width:`${fuel}%`,background:fuel<20?'#ef6256':'#83ca62'}}/></div></div>}
 {k===1&&<Balao3D t0={S[k]+dur*.48} t1={S[k]+dur*.85} txt="E · COLOCAR LENHA" x={540} y={620} tam={43}/>}
 {k===1&&p>.85&&<Balao3D t0={S[k]+dur*.85} t1={S[k+1]} txt="E O CHÃO? VAI VARRER!" x={540} y={610} tam={45}/>}
 {k===2&&p>.2&&p<.74&&<div style={{position:'absolute',top:575,left:135,right:135,background:'rgba(38,50,40,.98)',border:'7px solid #b3ad91',padding:25,fontFamily:'Poppins',fontWeight:900,color:'#fff'}}><div style={{fontSize:46,marginBottom:18}}>INVENTÁRIO</div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:15}}>{['CARNE','CENOURA','ENSOPADO','MAÇÃ','COMIDA','LANCHE'].map((x,i)=><div key={x} style={{height:155,background:'#66715a',border:'4px solid #a2ab8e',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:p>.4?'#c5f19b':'#fff'}}><div style={{fontSize:44}}>{p>.4?'🥦':['🥩','🥕','🍲','🍎','🥪','🍪'][i]}</div><div style={{fontSize:p>.4?25:24,marginTop:8}}>{p>.4?'BRÓCOLIS':x}</div></div>)}</div></div>}
 {k===4&&d>.4&&d<Math.min(2.4,dur-.1)&&<Balao3D t0={S[k]+.4} t1={S[k]+Math.min(2.4,dur-.1)} txt="MÃE ATORDOADA · 2s" x={540} y={610} tam={46}/>}
 {k===5&&<Balao3D t0={S[k]+.05} t1={S[k]+dur*.6} txt="APAGA ESSA LUZ, MENINO!" x={540} y={610} tam={45}/>}
 {k===6&&<Balao3D t0={S[k]+dur*.45} t1={S[k+1]} txt="ZONA SEGURA ✓" x={540} y={610} tam={52}/>}
 {k===7&&p>.72&&<Balao3D t0={S[k]+dur*.72} t1={S[k+1]} txt="ZONA SEGURA ACABOU!" x={540} y={610} tam={46}/>}
 {k===8&&<Balao3D t0={S[k]+dur*.64} t1={S[k+1]} txt="PAI?!" x={540} y={560} tam={80}/>}
 {k===9&&p>.65&&<Balao3D t0={S[k]+dur*.65} t1={S[k+1]} txt="RESGATE RECUSADO 😂" x={540} y={560} tam={46}/>}
 {k===10&&p<.35&&<div style={{position:'absolute',top:570,left:140,right:140,padding:40,textAlign:'center',background:'rgba(103,33,34,.94)',border:'8px solid #f19282',fontFamily:'Poppins',fontWeight:900,color:'#fff',fontSize:62}}>CAPTURADO<br/><span style={{fontSize:34}}>PELA PRÓPRIA MÃE</span></div>}
 <Legenda3D fala={F} fim={MAE_GAMEPLAY_DUR} top={1360}/>
 <div style={{position:'absolute',top:1575,left:70,width:250,height:20,background:'#2e312a',border:'3px solid #d4d3bf'}}><div style={{width:k>=10?'65%':'100%',height:'100%',background:'#8ed470'}}/></div>
 <div style={{position:'absolute',top:1655,left:70,right:70,display:'flex',gap:14,fontFamily:'Poppins',fontWeight:900}}>{itens.map((n,i)=><div key={n} style={{flex:1,height:125,background:i===(k===4||k===5?1:0)?'#687b58':'#394638',border:`5px solid ${i===(k===4||k===5?1:0)?'#ffe9a4':'#91a187'}`,color:'#fff',textAlign:'center',padding:'4px 3px'}}><div style={{fontSize:48,color:'#ffe8a1'}}>{i+1}</div><div style={{fontSize:27}}>{k===2&&p>.4&&i===3?'BRÓCOLIS':n}</div></div>)}</div>
 </>;
};
export const ImaginaSoMaeGameplay3D:React.FC=()=>{
 const {fps}=useT();
 const eventos=[{t:S[1]+(S[2]-S[1])*.85,s:'plim',v:.3},{t:S[2]+(S[3]-S[2])*.4,s:'pop',v:.3},{t:S[4]+.4,s:'plim',v:.35},{t:S[7]+(S[8]-S[7])*.3,s:'whoosh',v:.3},{t:S[7]+(S[8]-S[7])*.72,s:'erro',v:.3},{t:S[9]+(S[10]-S[9])*.82,s:'erro',v:.3}];
 return <AbsoluteFill style={{background:'#192b37'}}><ThreeCanvas width={1080} height={1920} shadows flat camera={{fov:52,near:.1,far:160}}><Mundo/></ThreeCanvas><HUD/><Flash picos={[.5,MAE_GAMEPLAY_DUR-.03]}/>
 <Sequence from={0} premountFor={fps}><Audio src={staticFile('sfx/musica.wav')} volume={.08} loop/></Sequence>
 {tl.cenas.map((c,i)=><Sequence key={`voz-${i}`} from={Math.round(S[i]*fps)} premountFor={fps}><Audio src={staticFile(PASTA+c.audio)} playbackRate={F.vel}/></Sequence>)}
 {S.map((s,i)=><Sequence key={i} from={Math.round(s*fps)} premountFor={fps}><Audio src={staticFile('sfx/whoosh.wav')} volume={.22}/></Sequence>)}
 {eventos.map((e,i)=><Sequence key={`sfx-${i}`} from={Math.round(e.t*fps)} premountFor={fps}><Audio src={staticFile(`sfx/${e.s}.wav`)} volume={e.v}/></Sequence>)}
 </AbsoluteFill>;
};
