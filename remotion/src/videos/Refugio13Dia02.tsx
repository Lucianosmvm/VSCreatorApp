import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Cena as CenaTimeline, Timeline} from '../tipos';
import {MundoDia02} from '../refugio/MundoDia02';
import {Sons} from '../cenas/Som';
import {frasesDe} from '../cenas/Legenda';
import plano from '../../../projetos/refugio-13-02/plano.json';

const ink='#10171d',amber='#ffc464',cyan='#8fe6d3',red='#ff796c';
const legenda=(c:CenaTimeline,t:number)=>{
 if(c.palavras.length){
  const grupos=frasesDe(c.palavras);
  const anteriores=grupos.filter(g=>g[0].t<=t);
  return (anteriores[anteriores.length-1]||grupos[0]||[]).map(p=>p.w).join(' ').replace(/Jiu/g,'Giu');
 }
 const palavras=c.texto.replace(/Jiu/g,'Giu').split(/\s+/);
 const blocos=Array.from({length:Math.ceil(palavras.length/11)},(_,i)=>palavras.slice(i*11,(i+1)*11).join(' '));
 return blocos[Math.min(blocos.length-1,Math.floor(t/c.dur*blocos.length))];
};

const CenaRefugio:React.FC<{cena:CenaTimeline;indice:number}>=({cena,indice})=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
 const c=plano.cenas[indice];
 const escolha=['opcao-a','opcao-b','votacao','convite'].includes(c.acao);
 const entra=interpolate(f,[0,8],[0,1],{extrapolateRight:'clamp'});
 const perigo=['resultado','porta','ameaca'].includes(c.acao);
 return <AbsoluteFill style={{background:ink,color:'#f3eee0',fontFamily:'Consolas, monospace'}}>
  <div style={{position:'absolute',left:80,right:80,top:96,display:'flex',justifyContent:'space-between',borderBottom:'3px solid #59645e',paddingBottom:22,fontSize:36,fontWeight:700,letterSpacing:4}}>
   <span>REFÚGIO <span style={{color:amber}}>13</span></span><span style={{color:cyan}}>DIA 02</span>
  </div>
  <div style={{position:'absolute',left:80,right:80,top:190,opacity:entra,transform:`translateY(${(1-entra)*12}px)`}}>
   <div style={{fontSize:c.titulo.length>25?54:68,lineHeight:1.1,fontWeight:900,color:perigo?red:amber}}>{c.titulo}</div>
   <div style={{fontSize:38,lineHeight:1.2,marginTop:16,color:cyan,whiteSpace:'pre-wrap'}}>{c.destaque}</div>
  </div>
  <div style={{position:'absolute',left:64,top:390,width:952,height:940,overflow:'hidden',border:'4px solid #657464',background:'#354a42'}}>
   <MundoDia02 acao={c.acao} t={t} dur={cena.dur}/>
  </div>
  {escolha?<div style={{position:'absolute',left:80,right:80,top:1360,display:'flex',gap:20}}>
   {[{letra:'A',titulo:'MERCADO',custo:'Água pronta.\nRua com infectados.',cor:amber},{letra:'B',titulo:'CISTERNA',custo:'Exige trabalho.\nÁgua ainda insegura.',cor:cyan}].map(o=><div key={o.letra} style={{flex:1,padding:'16px 18px',border:`3px solid ${o.cor}`,background:'#182527',opacity:c.acao===`opcao-${o.letra.toLowerCase()}`||c.acao==='votacao'||c.acao==='convite'?1:.5}}>
    <strong style={{fontSize:39,color:o.cor}}>{o.letra} · {o.titulo}</strong><div style={{whiteSpace:'pre-line',fontSize:31,lineHeight:1.22,marginTop:9}}>{o.custo}</div>
   </div>)}
  </div>:<div style={{position:'absolute',left:80,right:80,top:1365,borderLeft:`5px solid ${cyan}`,padding:'12px 22px',fontSize:32,color:'#b8c9b8',lineHeight:1.3}}>
   {c.acao==='encontro'?<><span style={{color:cyan}}>ULISSES</span> · Doutor<br/><span style={{color:amber}}>VELHO GIU</span> · Contador de histórias e safo</>:
    c.acao==='resultado'||c.acao==='custo'?'VOTAÇÃO ANTERIOR: A · 0 VOTOS  /  B · 1 VOTO':
    c.acao==='amanhecer'?'LIA · NILO · EVA · ULISSES · VELHO GIU':
    c.acao==='posto'?'NOVA CONSTRUÇÃO · BANCADA DE PRIMEIROS SOCORROS':
    c.acao==='reservas'?'5 SOBREVIVENTES · ÁGUA RACIONADA · MERCADO NÃO VISITADO':
    c.acao==='giu'?'A HISTÓRIA ERA INVENTADA. A DISTRAÇÃO ERA REAL.':
    c.acao==='rota'?'ROTA B · ESTAÇÃO → OFICINA':
    c.acao==='retorno'?'DE VOLTA À ESTAÇÃO · A SAÍDA DO RESGATE':
    'OFICINA · RESGATE DE SOBREVIVENTES'}
  </div>}
  <div style={{position:'absolute',left:80,right:80,top:1582,fontSize:43,lineHeight:1.32,fontWeight:600,textShadow:'0 3px 0 #000',minHeight:160}}>{legenda(cena,t)}</div>
  <div style={{position:'absolute',left:80,right:80,bottom:95,fontSize:25,color:'#81978c',letterSpacing:1}}>REFÚGIO 13 · SOBREVIVER É DECIDIR.</div>
  {cena.audio&&<Audio src={staticFile(`videos/refugio-13-02/${cena.audio}`)}/>}
  {c.acao==='resultado'&&<Sons efeitos={[{t:.05,tipo:'erro'}]}/>}
  {c.acao==='porta'&&<Sons efeitos={[{t:1.3,tipo:'pop'}]}/>}
  {c.acao==='giu'&&<Sons efeitos={[{t:.6,tipo:'tecla'}]}/>}
  {c.acao==='posto'&&<Sons efeitos={[{t:2,tipo:'plim'}]}/>}
  {c.acao==='votacao'&&<Sons efeitos={[{t:.1,tipo:'pop'}]}/>}
 </AbsoluteFill>;
};

export const Refugio13Dia02:React.FC<Timeline>=(tl)=><AbsoluteFill>
 {tl.cenas.map((c,i)=><Sequence key={plano.cenas[i].acao} from={Math.round(c.inicio*tl.fps)} durationInFrames={Math.round(c.dur*tl.fps)} premountFor={tl.fps}><CenaRefugio cena={c} indice={i}/></Sequence>)}
</AbsoluteFill>;
