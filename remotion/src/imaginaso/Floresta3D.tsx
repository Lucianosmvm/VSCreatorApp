import React from 'react';
import * as THREE from 'three';
import {Caixa,C3} from './Bloco3D';
type V3=[number,number,number];

/** Pinheiro de blocos original, sem marcas ou elementos extraídos de jogos. */
export const ArvoreFloresta3D:React.FC<{pos?:V3;esc?:number;troncoLargo?:boolean;lowPoly?:boolean}>=({pos=[0,0,0],esc=1,troncoLargo=false,lowPoly=false})=><group position={pos} scale={esc}>
 <Caixa p={[0,2,0]} s={[troncoLargo?1.25:.65,4,troncoLargo?1.05:.65]} cor="#765136" contorno={.045}/>
 {[0,1,2].map(i=>lowPoly?<mesh key={i} position={[0,3.7+i*1.05,0]} castShadow><coneGeometry args={[2-i*.4,2.5,6]}/><meshStandardMaterial color={['#315d35','#3f7043','#52804c'][i]} flatShading roughness={1}/></mesh>:<Caixa key={i} p={[0,(troncoLargo?5.1:3.8)+i*.95,0]} s={[3.1-i*.7,1.4,2.8-i*.65]} cor={['#325e4a','#3d7657','#4b8663'][i]} contorno={.06}/>)}
</group>;
export const Floresta3D:React.FC<{gameplay?:boolean}>=({gameplay=false})=> <group>
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[120,120]}/><meshToonMaterial color={gameplay?'#527843':'#31463b'}/></mesh>
 {gameplay?<mesh rotation={[-Math.PI/2,0,0]} position={[0,.014,0]} receiveShadow><circleGeometry args={[3.2,12]}/><meshStandardMaterial color="#7c7560" roughness={1} flatShading/></mesh>:<Caixa p={[0,.012,0]} s={[5,.02,30]} cor="#655b47" contorno={0}/>}
 {[-1,1].flatMap(l=>Array.from({length:gameplay?13:9},(_,i)=><ArvoreFloresta3D key={`${l}-${i}`} pos={[l*(5+(i%3)*1.4),0,(gameplay?14:4)-i*3.7]} esc={1+(i%3)*.12} lowPoly={gameplay}/>))}
 <Caixa p={[-7,11,-24]} s={[2.4,2.4,.4]} cor="#e0e8e2" brilho="#c8dce7" forca={.3} contorno={.05}/>
 {Array.from({length:15},(_,i)=><Caixa key={i} p={[-18+(i*3.71)%36,8+(i*2.3)%9,-32]} s={[.07,.07,.07]} cor="#d4e4fa" contorno={0} sombra={false}/>)}
</group>;

/** Lanterna: frente +z. O estado desligado preserva o objeto confiscado. */
export const Lanterna3D:React.FC<{pos?:V3;rot?:V3;esc?:number;acesa?:boolean}>=({pos=[0,0,0],rot=[0,0,0],esc=1,acesa=true})=><group position={pos} rotation={rot} scale={esc}>
 <Caixa s={[.26,.28,.7]} cor="#4b5a63" contorno={.025}/><Caixa p={[0,0,.42]} s={[.42,.42,.22]} cor="#6b7d83" contorno={.03}/><Caixa p={[0,0,.55]} s={[.33,.33,.03]} cor={acesa?'#fff3ad':'#6d7e87'} brilho={acesa?'#ffe8a0':undefined} forca={.5} contorno={.01}/><Caixa p={[0,.16,-.05]} s={[.12,.045,.18]} cor={C3.amarelo} contorno={.01}/>
</group>;
export const FeixeLanterna3D:React.FC<{origem:V3;destino:V3;aceso?:boolean}>=({origem,destino,aceso=true})=>{
 if(!aceso)return null;
 const a=new THREE.Vector3(...origem),b=new THREE.Vector3(...destino),delta=b.clone().sub(a),len=delta.length();
 const quat=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());
 return <group><mesh position={a.clone().add(b).multiplyScalar(.5)} quaternion={quat}><cylinderGeometry args={[.12,.7,len,10,1,true]}/><meshBasicMaterial color="#ffebac" transparent opacity={.11} depthWrite={false} side={THREE.DoubleSide}/></mesh><pointLight position={destino} color="#fff1be" intensity={.45} distance={3}/></group>;
};

/** Portão abre na dobradiça da esquerda, com botão físico na coluna direita. */
export const PortaoMadeira3D:React.FC<{pos?:V3;aberto?:number;construcao?:number;apertado?:boolean}>=({pos=[0,0,0],aberto=0,construcao=1,apertado=false})=><group position={pos}>
 {[-1,1].map(l=><Caixa key={l} p={[l*2.2,1.35,0]} s={[.35,2.7,.35]} cor="#805632" contorno={.035}/>)}
 <group position={[-2.1,0,0]} rotation={[0,-aberto*Math.PI*.49,0]}>
  {Array.from({length:7},(_,i)=>{const p=Math.max(0,Math.min(1,construcao*7-i));return p>0?<Caixa key={i} p={[.3+i*.58,1.15+(1-p)*3,0]} s={[.48,2.3,.18]} cor={i%2?'#b3814e':'#a16b40'} contorno={.03}/>:null;})}
  {construcao>.9&&<>{[.6,1.75].map(y=><Caixa key={y} p={[2.05,y,.12]} s={[4.1,.16,.12]} cor="#674830" contorno={.025}/>)}</>}
 </group>
 <Caixa p={[2.6,1.3,.05]} s={[.6,.65,.26]} cor="#435760" contorno={.03}/><Caixa p={[2.6,1.3,apertado?.19:.24]} s={[.34,.34,.13]} cor={apertado?'#5ad35a':'#ff5d56'} brilho={apertado?'#5ad35a':undefined} forca={.3} contorno={.02}/>
</group>;
export const BancoTronco3D:React.FC<{pos?:V3;rotY?:number}>=({pos=[0,0,0],rotY=0})=><group position={pos} rotation={[0,rotY,0]}>
 <Caixa p={[0,.55,0]} s={[1.4,1.1,1.1]} cor="#805735" contorno={.05}/><Caixa p={[0,1.12,0]} s={[1.45,.08,1.15]} cor="#c39662" contorno={.03}/><Caixa p={[0,1.17,0]} s={[.8,.01,.65]} cor="#ab7d50" contorno={0}/>
</group>;
export const Fogueira3D:React.FC<{t:number;pos?:V3;esc?:number;forca?:number}>=({t,pos=[0,0,0],esc=1,forca=1})=><group position={pos} scale={esc}>
 {[0,1].map(i=><Caixa key={i} p={[0,.18,0]} s={[1.45,.25,.32]} rot={[0,i*Math.PI/2,0]} cor="#634832" contorno={.03}/>)}
 {forca>0&&<group scale={forca}>
 {[0,1,2].map(i=><Caixa key={i} p={[Math.sin(t*5+i)*.1,.5+i*.27,0]} s={[.75-i*.16,.65+Math.sin(t*12+i)*.1,.6-i*.12]} rot={[0,Math.sin(t*6+i)*.15,0]} cor={i===2?'#fff5ae':i===1?'#ffd05b':'#ee8547'} brilho={i===2?'#fff5ae':'#ff9c42'} forca={.7} contorno={0} sombra={false}/>)}
 {Array.from({length:8},(_,i)=>{const y=(t*.9+i*.23)%2.6;return <Caixa key={i} p={[Math.sin(i*2+t)*y*.16,.8+y,Math.cos(i*3)*.18]} s={[.045,.06,.045]} cor="#ffd675" contorno={0} opacidade={1-y/2.6} sombra={false}/>;})}
 </group>}
 <pointLight position={[0,1.5,.2]} intensity={1.05*forca} distance={8} color="#ffc581"/>
</group>;
