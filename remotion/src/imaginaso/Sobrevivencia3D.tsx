import React from 'react';
import {Caixa,C3} from './Bloco3D';
import {Mesa3D} from './Objetos3D';
import {Fogueira3D} from './Floresta3D';
type V3=[number,number,number];

/** Elementos originais de uma interface de sobrevivência; nenhum recurso do jogo é importado. */
export const Machado3D:React.FC<{pos?:V3;rot?:V3;esc?:number}>=({pos=[0,0,0],rot=[0,0,0],esc=1})=><group position={pos} rotation={rot} scale={esc}>
 <Caixa p={[0,.35,0]} s={[.12,1.15,.12]} cor="#a77b43" contorno={.018}/><Caixa p={[.18,.91,0]} s={[.7,.42,.13]} rot={[0,0,-.12]} cor="#a8b2b4" contorno={.025}/><Caixa p={[.48,.88,0]} s={[.08,.45,.15]} cor="#e0e5df" contorno={.01}/>
</group>;
export const Lenha3D:React.FC<{pos?:V3;rot?:V3;esc?:number}>=({pos=[0,0,0],rot=[0,0,0],esc=1})=><group position={pos} rotation={rot} scale={esc}>
 <Caixa s={[.4,.4,1.05]} cor="#785336" contorno={.025}/><Caixa p={[0,0,.54]} s={[.34,.34,.025]} cor="#d0a16b" contorno={.01}/><Caixa p={[0,0,-.54]} s={[.34,.34,.025]} cor="#d0a16b" contorno={.01}/>
</group>;
export const Tenda3D:React.FC<{pos?:V3;rotY?:number;cor?:string}>=({pos=[0,0,0],rotY=0,cor='#b94838'})=><group position={pos} rotation={[0,rotY,0]}>
 <mesh position={[0,1.03,0]} rotation={[0,Math.PI/4,0]} castShadow><coneGeometry args={[1.8,2.1,4]}/><meshStandardMaterial color={cor} flatShading roughness={1}/></mesh><Caixa p={[0,.57,1.12]} s={[.75,1.12,.04]} cor="#252f2b" contorno={.02}/><Caixa p={[0,.03,0]} s={[2.5,.06,2.6]} cor="#6b5a3b" contorno={.02}/>
</group>;
export const AcampamentoGameplay3D:React.FC<{t:number;fogo?:number;zona?:number}>=({t,fogo=1,zona=1})=><group>
 <Fogueira3D t={t} forca={fogo}/>
 {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <mesh key={i} position={[Math.cos(a)*1.04,.12,Math.sin(a)*1.04]} rotation={[0,a,0]} castShadow><dodecahedronGeometry args={[.19,0]}/><meshStandardMaterial color={i%2?'#818579':'#a1a292'} flatShading roughness={1}/></mesh>;})}
 {zona>0&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.025,0]}><ringGeometry args={[2.96,3.02,64]}/><meshBasicMaterial color={fogo>.05?'#fff2b4':'#eb6868'} transparent opacity={zona*.7}/></mesh>}
 <Tenda3D pos={[-3.4,0,-3.8]} rotY={.35}/><Tenda3D pos={[3.8,0,-4.8]} rotY={-.4} cor="#8b9e59"/>
 <Mesa3D pos={[3.6,0,-1.6]} esc={.8}/><Machado3D pos={[3.6,1.4,-1.4]} rot={[0,0,-Math.PI/2]} esc={.65}/>
 {[0,1,2,3].map(i=><Lenha3D key={i} pos={[-2.8+(i%2)*.38,.2+Math.floor(i/2)*.35,-1.8]} rot={[0,.3,0]} esc={.75}/>)}
 <Caixa p={[-3.5,2.3,-2.7]} s={[1.6,1.2,.12]} cor="#8f704b" contorno={.025}/>
 {[0,1,2,3].map(i=><group key={i} position={[-4.02+i*.35,2.35,-2.61]}><Caixa s={[.28,.55,.025]} cor="#ded7b8" contorno={.01}/><Caixa p={[0,.05,.02]} s={[.13,.16,.015]} cor={['#f7ca7e','#a8ce88','#dd9b97','#86b8c6'][i]} contorno={0}/></group>)}
</group>;
export const GalhosCoroa3D:React.FC=()=> <group position={[0,3.35,-.12]}>
 {[-1,1].map(l=><group key={l} position={[l*.55,0,0]}><Caixa p={[l*.2,.4,0]} s={[.13,.9,.13]} rot={[0,0,-l*.35]} cor="#a88552" contorno={.018}/><Caixa p={[l*.42,.72,0]} s={[.5,.12,.13]} cor="#c1a173" contorno={.018}/><Caixa p={[l*.12,.75,0]} s={[.12,.35,.13]} cor="#c1a173" contorno={.015}/></group>)}
</group>;
export const CavernaResgate3D:React.FC<{aberta?:number}>=({aberta=0})=><group>
 <Caixa p={[0,.015,-.8]} s={[4.7,.03,4]} cor="#8a6852" contorno={0}/>
 {[-1,1].map(l=><Caixa key={l} p={[l*1.8,2,-1]} s={[1.0,4,2.8]} rot={[0,0,l*.08]} cor="#925849" contorno={.035}/>)}<Caixa p={[0,4.05,-1]} s={[4.5,.9,2.8]} rot={[0,0,.03]} cor="#a26953" contorno={.035}/><Caixa p={[0,2,-2.32]} s={[3.6,4,.15]} cor="#1d2929" contorno={0}/>
 {[-1,1].map(l=><Caixa key={l} p={[l*1.25,1.28,.8]} s={[.18,2.56,.2]} cor="#787d7c" contorno={.02}/>)}
 <group position={[-1.24,0,.8]} rotation={[0,-aberta*Math.PI*.5,0]}>
  {Array.from({length:7},(_,i)=><Caixa key={i} p={[.2+i*.35,1.28,0]} s={[.075,2.45,.07]} cor="#a5aeaa" contorno={.008}/>)}
  {[.15,2.4].map(y=><Caixa key={y} p={[1.25,y,0]} s={[2.5,.12,.1]} cor="#787d7c" contorno={.015}/>)}
 </group>
</group>;
