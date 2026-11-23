import React from 'react';
import {AbsoluteFill,Audio,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig,interpolate} from 'remotion';
import {loadFont} from '@remotion/google-fonts/PixelifySans';
import {Legenda,Clima} from '../pixelandia/Pixelandia';
import type {CenaPixelandia,DadosPixelandia} from '../pixelandia/tipos';
import type {Timeline} from '../tipos';
import dados from '../../public/refugio-13/refugio-13-02/video.json';

const {fontFamily}=loadFont('normal',{weights:['700'],subsets:['latin','latin-ext']});
const CenaFilmada:React.FC<{cena:CenaPixelandia}>=({cena})=>{
 const f=useCurrentFrame(),{fps}=useVideoConfig();
 const zoom=interpolate(f,[0,8],[1.045,1],{extrapolateRight:'clamp'});
 const opcoes=cena.nome==='votacao'||cena.nome==='convite';
 const iniLeg=cena.tempos||cena.linhas.map((_,i)=>i*cena.dur/cena.linhas.length);
 return <AbsoluteFill>
  <AbsoluteFill style={{transform:`scale(${zoom})`}}><OffthreadVideo src={staticFile(cena.video)} muted style={{width:'100%',height:'100%',objectFit:'cover',imageRendering:'pixelated'}}/></AbsoluteFill>
  <Clima clima={cena.clima}/>
  {cena.linhas.map((linha,i)=><Sequence key={i} from={Math.round(iniLeg[i]*fps)} durationInFrames={Math.max(1,Math.round(((iniLeg[i+1]??cena.dur)-iniLeg[i])*fps))}>
   <Legenda texto={linha} cta={!!cena.cta} somPop={!cena.audio}/>
  </Sequence>)}
  {opcoes&&<div style={{position:'absolute',left:70,right:70,top:1390,display:'flex',gap:22,fontFamily}}>
   {[{letra:'A',nome:'MERCADO',texto:'Água pronta.\nRua com infectados.',cor:'#ffd23f'},{letra:'B',nome:'CISTERNA',texto:'Exige trabalho.\nÁgua ainda insegura.',cor:'#8fe6d3'}].map(o=><div key={o.letra} style={{flex:1,padding:'18px 20px',background:'rgba(12,27,24,.94)',border:`4px solid ${o.cor}`,boxShadow:'0 6px 0 #101a14'}}>
    <div style={{fontSize:46,fontWeight:700,color:o.cor}}>{o.letra} · {o.nome}</div><div style={{whiteSpace:'pre-line',fontSize:37,lineHeight:1.15,color:'#f4f1dd',marginTop:8}}>{o.texto}</div>
   </div>)}
  </div>}
  {cena.audio&&<Audio src={staticFile(cena.audio)}/>}
  {cena.nome==='desvio'&&<>
   <Sequence from={Math.round(.92*fps)} durationInFrames={Math.round(.3*fps)}><Audio src={staticFile('sfx/whoosh.wav')} volume={.22}/></Sequence>
   <Sequence from={Math.round(1.25*fps)}><Audio src={staticFile('refugio-13/refugio-13-02/impacto-madeira.wav')} volume={.48}/></Sequence>
  </>}
  <Audio src={staticFile('sfx/whoosh.wav')} volume={.18}/>
 </AbsoluteFill>;
};

export const Refugio13Filmado:React.FC<Timeline>=()=>{
 const d=dados as DadosPixelandia;
 return <AbsoluteFill style={{background:'#21362b'}}>
  {d.cenas.map((c,i)=><Sequence key={c.nome} from={Math.round(c.inicio*d.fps)} durationInFrames={Math.round(c.dur*d.fps)} premountFor={d.fps}><CenaFilmada cena={c}/></Sequence>)}
  <div style={{position:'absolute',left:30,bottom:145,padding:'8px 18px',background:'rgba(13,27,23,.87)',borderRadius:12,color:'#ffcf77',fontFamily,fontSize:34}}>☣ REFÚGIO 13 · DIA 02</div>
 </AbsoluteFill>;
};
