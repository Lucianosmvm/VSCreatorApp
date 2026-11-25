import React from 'react';
import * as THREE from 'three';
import {AbsoluteFill,Audio,Sequence,staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import tl from './MaeFlorestaStoryboard.json';
import {useT,COR,rampa} from './Bloco';
import {Boneco3D,Brilhos,Camera,Chinelo3D} from './Bloco3D';
import {Brocolis3D,Mesa3D} from './Objetos3D';
import {ArvoreFloresta3D,BancoTronco3D,FeixeLanterna3D,Floresta3D,Fogueira3D,Lanterna3D,PortaoMadeira3D} from './Floresta3D';
import {Balao3D,Faixa3D,Flash,Legenda3D,Marca3D,montarFala} from './Camada2D';

// EP09: prévia sem narração. História concluída; comentários por relatos, sem votos.
const F=montarFala(tl,{vel:1.15,inicio:.35}),{S}=F,PI=Math.PI;
export const MAE_FLORESTA_DUR=F.fim+.65;
type V3=[number,number,number];
type BP=React.ComponentProps<typeof Boneco3D>;
const Filho=(p:Partial<BP>)=><Boneco3D tipo="filho" {...p}/>;
const Mae=(p:Partial<BP>)=>{
 const {pos=[0,0,0],rotY=0,esc=1,pernaE=0,pernaD=0,...outros}=p;
 return <group position={pos} rotation={[0,rotY,0]} scale={esc}><Boneco3D tipo="mae" coroa pernaE={pernaE} pernaD={pernaD} {...outros}/>{[-1,1].map((l,i)=>{const r=i===0?pernaE:pernaD;return <Chinelo3D key={l} pos={[l*.28,.95-.9*Math.cos(r),-.9*Math.sin(r)+.06]} esc={.66}/>;})}</group>;
};
const kCena=(t:number)=>S.reduce((a,s,i)=>t>=s-.02?i:a,0);
const prog=(t:number,a:number,b:number)=>{const p=rampa(t,a,b);return p*p*(3-2*p);};
const mix=(a:V3,b:V3,q:number)=>a.map((v,i)=>v+(b[i]-v)*q) as V3;
const cam=(pos:V3=[0,3.7,10.5],alvo:V3=[0,2.35,0])=>({pos,alvo});
const mao=(pos:V3,l:number,arm:[number,number],esc=1):V3=>new THREE.Vector3(0,-1.1,.1).applyEuler(new THREE.Euler(arm[0],0,arm[1])).add(new THREE.Vector3(l*.8,1.88,0)).multiplyScalar(esc).add(new THREE.Vector3(...pos)).toArray() as V3;
const sentar=(p:Partial<BP>)=>Filho({pos:[-1.1,.2,-3.5],pernaE:-PI/2,pernaD:-PI/2,...p});
const camping=(t:number)=><><Fogueira3D t={t} pos={[.55,0,-1.3]}/><BancoTronco3D pos={[-1.1,0,-3.5]}/><Mesa3D pos={[-.8,0,-2.2]} esc={.7}/></>;
const mesaPrato:V3=[-.8,.96,-2.2];

const Cena3D:React.FC=()=>{
 const {t}=useT(),k=kCena(t),d=t-S[k],dur=(S[k+1]??MAE_FLORESTA_DUR)-S[k],p=Math.max(0,d/dur);
 let camera=cam(),atores:React.ReactNode,objetos:React.ReactNode;
 if(k===0){
  camera=t<.5?cam([0,2.4,8],[0,2.4,0]):cam([0,3.7,11.7],[0,2.3,-.4]);
  atores=<>{Filho({pos:[-1.35,0,.2],expr:'medo',bracoE:[-1.2,-.3],bracoD:[-1.2,.3],boca:.6})}{Mae({pos:[1.3,0,-2],expr:'brava',olhosBrilho:.7,bracoD:[-1.3,.2]})}</>;
  objetos=t<.5?<Chinelo3D pos={mix([0,3,-6],[0,2.4,7.9],prog(t,0,.49))} rot={[t*16,t*6,.2]} esc={3} brilho={.35}/>:<Chinelo3D pos={[2.1,1.4,-.9]} esc={.7}/>;
 }
 if(k===1){
  const walk=prog(d,.15,dur-.2),r=Math.sin(t*9)*.35;
  camera=p<.42?cam([1.3,1.2,4.1],[1.3,.45,.1]):cam([.1,3.6,10.6],[0,2.35,0]);
  atores=<>{Filho({pos:[-1.35,0,.5],expr:'medo',cabeca:[0,.3],bracoD:[-1.1,.3]})}{Mae({pos:[1.3,0,1.1-walk*1.3],expr:'brava',olhosBrilho:.5,pernaE:r,pernaD:-r,segura:<Chinelo3D rot={[1.4,0,0]} esc={.7}/>,bracoD:[-1.4,.2]})}</>;
 }
 if(k===2){
  const hide=prog(d,0,dur*.4),move=prog(d,dur*.45,dur*.9);
  camera=p<.5?cam([.1,3.5,12],[.7,2.3,0]):cam([.2,3.5,10.8],[.75,2.6,-.2]);
  atores=<>{Filho({pos:[-1.4+hide*2.13,0,-.85],expr:'medo',rotY:-.15,bracoE:[0,-.12],bracoD:[0,.12],pernaE:p<.4?Math.sin(t*15)*.4:0,pernaD:p<.4?-Math.sin(t*15)*.4:0})}{Mae({pos:[2.7-move*.5,0,0],expr:'brava',olhosBrilho:.3,bracoE:[-1.35,-.8],bracoD:[-1.4,.2],segura:<Chinelo3D rot={[1.4,0,0]} esc={.7}/>})}</>;
  objetos=<ArvoreFloresta3D pos={[0,0,.15]} troncoLargo/>;
 }
 if(k===3){
  camera=cam([.4,3.5,10.6],[.9,2.4,-.2]);
  atores=<>{Filho({pos:[.95,0,-.85],expr:'medo',cabeca:[.1,-.2],bracoD:[-2.6,-.3],boca:.6})}{Mae({pos:[2.4,0,0],expr:'brava',bracoE:[-1.35,-.8]})}</>;
  objetos=<ArvoreFloresta3D pos={[0,0,.15]} troncoLargo/>;
 }
 if(k===4){
  const a:V3=[-1.1,0,.9],b:V3=[1.3,0,.1],hand=prog(d,dur*.34,dur*.68),left:[number,number]=[-1.4,-.6],right:[number,number]=[-1.4,-.12],recolhe=prog(d,dur*.68,dur*.92);
  const origem=mao(a,1,right),destino=mao(b,-1,left);
  camera=p<.35?cam([0,3.4,10.8],[0,2.3,.4]):cam([.15,3.25,9.2],[0,2.35,.4]);
  atores=<>{Filho({pos:a,expr:hand>.3?'medo':'feliz',bracoD:[right[0]*(1-recolhe),right[1]],bracoE:[0,-.12],segura:hand===0?<Lanterna3D rot={[1.4,0,0]}/>:undefined})}{Mae({pos:b,expr:'brava',bracoE:[-1.4+recolhe*.8,-.6+recolhe*.48],bracoD:[-1.4,.12],seguraE:hand>=1?<Lanterna3D rot={[1.4-recolhe*.8,0,0]} acesa={false}/>:undefined,segura:<Chinelo3D rot={[1.4,0,0]} esc={.7}/>})}</>;
  objetos=<>{hand>0&&hand<1&&<Lanterna3D pos={mix(origem,destino,hand)} acesa={hand<.85}/>}<FeixeLanterna3D origem={hand===0?origem:mix(origem,destino,hand)} destino={[1.3,2.5,.4]} aceso={hand<.85}/></>;
 }
 if(k===5){
  const build=prog(d,.1,dur*.7);
  camera=cam([.2,4,16.2],[.25,2,1]);
  atores=<>{Filho({pos:[-1.1,0,3],expr:build>.9?'feliz':'medo',bracoD:build>.9?[-1.45,-.95]:[-1.5,.2],bracoE:build>.9?[-1.45,.95]:[-1.5,-.2]})}{Mae({pos:[0,0,-1.2],expr:'brava',bracoD:[-1.4,.12],bracoE:[-1.4,-.12],segura:<Chinelo3D rot={[1.4,0,0]} esc={.7}/>,seguraE:<Lanterna3D rot={[1.4,0,0]} acesa={false}/>})}</>;
  objetos=<PortaoMadeira3D pos={[0,0,1.2]} construcao={build}/>;
 }
 if(k===6){
  const hit=S[k]+dur*.54,flight=prog(t,S[k]+.1,hit),open=prog(t,hit+.12,hit+.65),walk=prog(d,dur*.77,dur*.98);
  camera=cam([.2,4,16.2],[.25,2,1.1]);
  const points=[[.8,1.9,-.2],[3.5,2,-.1],[3.55,1.6,2],[2.6,1.3,1.44]].map(v=>new THREE.Vector3(...v));
  const shoe=new THREE.CatmullRomCurve3(points).getPointAt(flight).toArray() as V3;
  atores=<>{Filho({pos:[-1.2,0,3.2],expr:'medo',bracoE:[-2.5,-.2],bracoD:[-2.5,.2],boca:.7})}{Mae({pos:[0,0,-1.2+walk*3.5],expr:'brava',pernaE:walk?Math.sin(t*10)*.35:0,pernaD:walk?-Math.sin(t*10)*.35:0,bracoD:[-1.6,.4],bracoE:[-1.4,-.12],seguraE:<Lanterna3D rot={[1.4,0,0]} acesa={false}/>})}</>;
  objetos=<><PortaoMadeira3D pos={[0,0,1.2]} aberto={open} apertado={t>=hit}/>{t>=S[k]+.1&&t<hit+.15&&<Chinelo3D pos={shoe} rot={[t*15,.5,t*7]} esc={.85} brilho={.25}/>} {t>=hit+.15&&<Chinelo3D pos={[2.6,Math.max(.07,1.3-(t-hit-.15)*3),1.7]} rot={[0,.1,0]} esc={.85}/>} {t>=hit&&t<hit+.45&&<Brilhos t={t} pos={[2.6,1.3,1.55]} raio={.4} n={7}/>}</>;
 }
 if(k===7){
  const run=prog(d,0,dur*.85),z=4-run*4.9;
  camera=cam([-1.25,3.8,11.8-run*.8],[-.7,2,-2]);
  atores=Filho({pos:[-1.25,0,z],rotY:PI,expr:'medo',pernaE:Math.sin(t*16)*.5,pernaD:-Math.sin(t*16)*.5,bracoE:[Math.sin(t*16)*.5,-.1],bracoD:[-Math.sin(t*16)*.5,.1]});
  objetos=camping(t);
 }
 if(k===8){
  const sit=prog(d,dur*.72,dur*.96),u=prog(d,0,dur*.72);
  const caminho:V3=u<.28?mix([-1.25,0,-.9],[-2.3,0,-.9],u/.28):u<.7?mix([-2.3,0,-.9],[-2.3,0,-3.5],(u-.28)/.42):mix([-2.3,0,-3.5],[-1.1,0,-3.5],(u-.7)/.3);
  camera=cam([.1,4,10.6],[-.2,2.35,-2.5]);
  atores=<>{Filho({pos:[caminho[0],.2*sit,caminho[2]],expr:'medo',pernaE:-PI/2*sit,pernaD:-PI/2*sit,bracoE:[-.8,-.2],bracoD:[-.8,.2]})}{Mae({pos:[1.35,0,-3.5],expr:'brava',bracoE:[-1.4,-.12],bracoD:[-1.3,-.65],seguraE:<Lanterna3D rot={[1.4,0,0]} acesa={false}/>})}</>;
  objetos=<>{camping(t)}<Chinelo3D pos={[1.9,.08,-2.9]} esc={.75}/></>;
 }
 if(k===9){
  const put=prog(d,dur*.25,dur*.62),from=mao([1.35,0,-3.5],1,[-1.3,-.3]);
  camera=p<.42?cam([0,3.6,8.2],[0,2.25,-3]):cam([0,3.8,7.5],[0,2.1,-2.7]);
  atores=<>{sentar({expr:'medo',bracoE:[-1.3,-.2],bracoD:[-1.3,.2],boca:.7})}{Mae({pos:[1.35,0,-3.5],expr:'feliz',bracoE:[-1.4,-.12],bracoD:[-1.3,-.3],seguraE:<Lanterna3D rot={[1.4,0,0]} acesa={false}/>})}</>;
  objetos=<>{camping(t)}<Brocolis3D pos={mix(from,mesaPrato,put)} esc={.67}/><Chinelo3D pos={[1.9,.08,-2.9]} esc={.75}/></>;
 }
 if(k===10){
  const eat=prog(d,dur*.3,dur*.8);
  camera=cam([-.2,3.8,7.7],[0,2.3,-3]);
  atores=<>{sentar({expr:'medo',cabeca:[.14,0],bracoD:[-1.3-eat*.8,.1],bracoE:[-1.3,-.2],boca:eat>.5?.4:0})}{Mae({pos:[1.35,0,-3.5],expr:'feliz',bracoE:[-1.4,-.12],bracoD:[-1.4,.12],seguraE:<Lanterna3D rot={[1.4,0,0]} acesa={false}/>})}</>;
  objetos=<>{camping(t)}<Brocolis3D pos={mesaPrato} esc={.67} resto={eat>.8?.7:1}/><Chinelo3D pos={[1.9,.08,-2.9]} esc={.75}/></>;
 }
 if(k===11){
  const launch=MAE_FLORESTA_DUR-.6;
  camera=cam([0,3.7,9.5],[0,2.3,-3]);
  atores=<>{sentar({expr:'feliz',bracoD:[-2.6,.3+Math.sin(t*10)*.2],bracoE:[-1.2,-.1]})}{Mae({pos:[1.35,0,-3.5],expr:'feliz',bracoD:[-2.5,.25],bracoE:[-1.4,-.12],segura:t<launch?<Chinelo3D rot={[2.5,0,0]} esc={.75}/>:undefined,seguraE:<Lanterna3D rot={[1.4,0,0]} acesa={false}/>})}</>;
  objetos=<>{camping(t)}<Brocolis3D pos={mesaPrato} esc={.67} resto={.7}/>{t>=launch&&<Chinelo3D pos={mix([1.35,2.3,-2.5],[0,3.7,9.4],prog(t,launch,MAE_FLORESTA_DUR-.01))} rot={[t*16,t*6,.2]} esc={3} brilho={.35}/>}</>;
 }
 return <><Camera {...camera}/><fog attach="fog" args={['#162738',16,55]}/><ambientLight intensity={.72}/><hemisphereLight args={['#abc7e9','#435344',.5]}/><directionalLight position={[-6,12,6]} color="#c8ddff" intensity={1.0} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16}/><Floresta3D/>{atores}{objetos}</>;
};

const titulos=['MÃE: O MONSTRO DA FLORESTA','ESSE BARULHO…','ELA VIU O BONÉ.','NÃO TEM ESCONDERIJO!','LANTERNA CONFISCADA','AGORA ELA NÃO ENTRA!','O CHINELO FAZ CURVA!','A FOGUEIRA É SEGURA?','VOCÊ NEM JANTOU!','NOITE 1 / 99','O JANTAR TE ENCONTROU.','O QUE SUA MÃE GRITARIA?'];
const Camada:React.FC=()=>{
 const {t}=useT(),k=kCena(t),d=t-S[k],dur=(S[k+1]??MAE_FLORESTA_DUR)-S[k];
 return <><Marca3D/><Faixa3D t0={k===0?.5:S[k]+.08} t1={S[k+1]??MAE_FLORESTA_DUR} txt={titulos[k]} y={260} tam={k===0?57:k===11?63:72}/>
 {k===2&&<Balao3D t0={S[k]+dur*.6} t1={S[k+1]} txt="EU CONHEÇO ESSE BONÉ." x={540} y={530} tam={47}/>}
 {k===3&&<Balao3D t0={S[k]+.15} t1={S[k+1]} txt="A SUA TAMBÉM É ASSIM?" x={540} y={550} tam={49}/>}
 {k===4&&<Balao3D t0={S[k]+dur*.65} t1={S[k+1]} txt="VAI ACABAR A PILHA!" x={540} y={540} tam={52}/>}
 {k===6&&d>dur*.54&&<Balao3D t0={S[k]+dur*.54} t1={S[k+1]} txt="ACESSO LIBERADO ✓" x={540} y={540} tam={50}/>}
 {k===8&&<Balao3D t0={S[k]+.15} t1={S[k+1]} txt="SENTA. VOCÊ NEM JANTOU." x={540} y={540} tam={45}/>}
 {k===9&&d>dur*.6&&<Faixa3D t0={S[k]+dur*.6} t1={S[k+1]} txt="BOSS FINAL: BRÓCOLIS" y={520} tam={65} cor="#8ee78a"/>}
 {k===11&&<Balao3D t0={S[k]+.15} t1={MAE_FLORESTA_DUR-.6} txt='“__________!”' x={540} y={550} tam={75}/>}
 <Legenda3D fala={F} fim={MAE_FLORESTA_DUR} top={1390}/><div style={{position:'absolute',bottom:95,left:0,right:0,textAlign:'center',fontFamily:'Poppins',fontWeight:800,fontSize:27,color:'#fff',WebkitTextStroke:'5px #1b1530',paintOrder:'stroke fill'}}>PRÉVIA VISUAL · SEM NARRAÇÃO · TEMPOS ESTIMADOS</div></>;
};

export const ImaginaSoMaeFloresta3D:React.FC=()=>{
 const {fps}=useT();
 return <AbsoluteFill style={{background:'#162738'}}><ThreeCanvas width={1080} height={1920} flat shadows camera={{fov:50,near:.1,far:150}}><Cena3D/></ThreeCanvas><Camada/><Flash picos={[.5,MAE_FLORESTA_DUR-.03]}/>
 <Sequence from={0} premountFor={fps}><Audio src={staticFile('sfx/musica.wav')} volume={.07} loop/></Sequence>
 {S.map((s,i)=><Sequence key={i} from={Math.round(s*fps)} premountFor={fps}><Audio src={staticFile(`sfx/${i===6?'plim':i===9?'erro':'whoosh'}.wav`)} volume={.3}/></Sequence>)}
 </AbsoluteFill>;
};
