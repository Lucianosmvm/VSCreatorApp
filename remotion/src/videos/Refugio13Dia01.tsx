import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import type { Timeline } from "../tipos";

const ink = "#10171d";
const amber = "#ffc464";
const cyan = "#8fe6d3";
const red = "#ff796c";
const ramp = (t: number, a: number, b: number) =>
  interpolate(t, [a, Math.max(a + .08, b)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const Predio = ({ x, y, w, cor, luz = false }: {x: number; y: number; w: number; cor: string; luz?: boolean}) => (
  <g transform={`translate(${x},${y})`}>
    <path d={`M-3 14H${w+6}V34H-3Z`} fill="#121a1e" />
    <rect width={w} height="29" fill="#4c4241" />
    <path d={`M-2 0H${w+2}V18H-2Z`} fill={cor} />
    <path d={`M-2 0H${w+2}V3H-2Z M-2 14H${w+2}V17H-2Z`} fill="#000" opacity=".26" />
    <path d={`M2 7H${w-2}M2 10H${w-2}`} stroke="#e5dcca" opacity=".15" />
    {[5, w - 7].map(k => <rect key={k} x={k} y="20" width="4" height="4" fill={luz ? amber : "#26313a"} />)}
    <rect x={Math.floor(w / 2) - 3} y="20" width="6" height="9" fill={luz ? "#a56842" : ink} />
  </g>
);

export const Pessoa = ({ x, y, roupa, passo = 0, item }: {x:number; y:number; roupa:string; passo?:number; item?:string}) => (
  <g transform={`translate(${Math.round(x)},${Math.round(y)})`}>
    <rect x="-4" y="8" width="8" height="2" fill="#11181c" />
    <path d={`M-2 5v${3+passo}m4 ${-3-passo}v${3-passo}`} stroke="#181b26" strokeWidth="2" />
    <path d="M-3 1H3V6H-3Z" fill={roupa} />
    <path d="M-2 -3H2V2H-2Z" fill="#d1a38a" />
    <path d="M-2 -3H2V-1H-2Z" fill="#2b2630" />
    {item === "radio" && <path d="M3 0h2v4H3zM4-2h1v2H4z" fill={cyan}/>}
    {item === "lanterna" && <path d="M3 2h2v2H3zM5 2l6-2v6L5 4z" fill={amber} opacity=".8"/>}
    {item === "mochila" && <path d="M-5 1h3v5h-3z" fill="#a4493f"/>}
  </g>
);

const arvores = [[6,17],[16,30],[8,52],[7,74],[17,92],[8,111],[20,119],[35,120],[46,114],
  [63,121],[85,114],[95,102],[108,113],[116,94],[114,79],[114,51],[97,31],[107,8],[90,7],[37,7],[19,10]];

const Mundo = ({ etapa, t, marco }: {etapa:number; t:number; marco:number}) => {
  const noite = etapa === 0 || etapa === 4 || etapa === 5;
  const mapa = etapa >= 6;
  const perigo = etapa === 0 && t >= marco;
  const enquadramento = perigo ? "29 68 52 66" : etapa === 0 ? "50 42 36 45" : etapa === 4 ? "66 22 47 58" : mapa ? "0 0 120 126" : "10 8 104 120";
  const sinal = etapa === 0 || etapa === 4;
  const onda = 2 + (Math.floor(t * 7) % 5) * 2;
  const avancar = etapa === 1 ? ramp(t, .1, 3.8) : 1;
  return (
    <svg viewBox={enquadramento} preserveAspectRatio="xMidYMid slice" width="100%" height="100%" shapeRendering="crispEdges">
      <rect width="120" height="126" fill={noite ? "#222e36" : "#354a42"} />
      {Array.from({length: 250}, (_, i) => <rect key={i} x={(i*43)%119} y={(i*73+i%7)%125}
        width={1+i%3} height="1" fill={i%2 ? "#6f8970" : "#171f20"} opacity=".21" />)}
      <path d="M4 66H114V77H4Z M24 26H32V75H24Z M94 25H102V73H94Z" fill="#666455" />
      <path d="M4 70H115M28 29V68M98 25V68" fill="none" stroke="#afa993" strokeDasharray="3 5" opacity=".35" />
      <path d="M43 3V126M49 3V126" stroke="#949086" strokeWidth="1" />
      {Array.from({length: 31}, (_, i) => <rect key={i} x="41" y={i*4} width="10" height="1" fill="#5b4b41" />)}
      <path d="M69 83H107V111H69Z" fill="#6d8061" opacity=".52" />
      {arvores.map(([x,y]) => <g key={`${x}-${y}`} transform={`translate(${x},${y})`}>
        <path d="M-1 0H2V8H-1Z" fill="#4b3d30" />
        <path d="M-2-5H2V-3H4V0H5V4H-5V1H-4V-3H-2Z" fill={noite ? "#243d3c" : "#456654"} />
        <path d="M-2-4H2V-2H-2Z" fill="#819780" opacity=".46" />
      </g>)}
      <Predio x={14} y={25} w={24} cor="#766856" />
      <Predio x={84} y={24} w={23} cor="#596277" />
      <path d="M50 63h4v33h-4z" fill="#a19985"/>
      <path d="M42 79h7v20h-7z" fill="#84634f" stroke="#383038" strokeWidth=".8"/>
      <path d="M43 83h5m-5 4h5m-5 4h5m-5 4h5" stroke="#343845"/>
      <Predio x={53} y={44} w={27} cor="#8a5449" luz={etapa !== 0 || t >= marco} />
      <rect x="58" y="61" width="6" height="4" fill="#29252b"/>
      <text x="61" y="64" fill={amber} textAnchor="middle" fontSize="3" fontFamily="monospace">13</text>
      <path d="M15 43h15v3H15z M21 53h4v4h-4z M31 52h5v4h-5z" fill="#b18b63"/>
      <path d="M29 43l2 1-2 2z" fill={ink}/>
      <path d="M89 43h13v10H89z" fill="#47505c" stroke="#788599" strokeWidth=".5"/>
      <path d="M90 45h11m-11 2h11m-11 2h11" stroke="#202732" strokeWidth=".6"/>
      <path d="M90 52h11" stroke={cyan} strokeWidth=".6" opacity={etapa===4 ? .45+.5*Math.abs(Math.sin(t*8)) : .17}/>
      <rect x="79" y="61" width="6" height="9" fill="#354d60" stroke="#92bfba" strokeWidth=".6" />
      <rect x="80" y="67" width="4" height="2" fill={cyan} opacity=".6" />
      {etapa === 2 && <g fill={amber}><rect x="56" y="76" width="4" height="4"/><rect x="61" y="77" width="4" height="3"/></g>}
      {[{x:58,y:83,c:"#c67c61",item:"radio"},{x:65,y:88,c:"#6faab4",item:"lanterna"},{x:72,y:82,c:"#dab267",item:"mochila"}].map(({x,y,c,item},i) =>
        <Pessoa key={c} x={46+(x-46)*avancar} y={y+27*(1-avancar)} roupa={c} item={item}
          passo={etapa===1 && avancar<1 ? (Math.floor(t*8+i)%2 ? 1 : 0) : 0} />)}
      {noite && <rect width="120" height="126" fill="#101a36" opacity=".36" />}
      {noite && <path d="M61 71H72L84 91H52Z" fill={amber} opacity={etapa===0 && t<marco ? .10 : .29} />}
      {etapa === 3 && <rect x="77" y="59" width="10" height="13" fill="none" stroke={cyan} strokeDasharray="2 1" />}
      {etapa === 5 && [0,1,2,3].map(i => <Pessoa key={i} x={29+i*8+ramp(t,.25,4)*15} y={58+i%2*4}
        roupa="#4a5459" passo={Math.floor(t*7+i)%2}/>)}
      {perigo && <g transform={`translate(${43+ramp(t,marco,marco+.8)*4},96)`}>
        <path d="M-3 0h6v8h-6z M-4 2h8v3h-8z M-2 8h1v4h-1z M1 8h1v4H1z" fill="#14191e"/>
        <path d="M-2-4h4v4h-4z" fill="#303d3d"/>
        <path d="M0-2h1" stroke={red} opacity={ramp(t,marco+.15,marco+.45)}/>
      </g>}
      {sinal && !perigo && <g transform={etapa===4 ? "translate(29,-10)" : undefined} fill="none" stroke={red} opacity=".8">
        <rect x={66-onda/2} y={57-onda/2} width={onda} height={onda}/>
        <rect x={65.4} y={56.4} width="1.2" height="1.2" fill={amber} stroke="none" />
      </g>}
      {mapa && <g fill="none" strokeWidth="1.3" strokeDasharray="2 2">
        <path d="M61 73H27V56" stroke={amber}/>
        <path d="M73 73H96V55" stroke={cyan}/>
      </g>}
      {mapa && [[27,53,"A",amber],[96,53,"B",cyan]].map(([x,y,txt,cor]) =>
        <g key={txt}><rect x={Number(x)-4} y={Number(y)-5} width="8" height="8" fill={String(cor)}/>
          <text x={x} y={Number(y)+1} textAnchor="middle" fill={ink} fontFamily="monospace" fontWeight="bold" fontSize="6">{txt}</text></g>)}
    </svg>
  );
};

const cards = [
  ["NÃO ACENDAM", "A LUZ.", "RÁDIO • TRANSMISSÃO NÃO IDENTIFICADA"],
  ["DIA 01", "TRÊS SOBREVIVENTES", "ESTAÇÃO • LINHA 13"],
  ["COMIDA", "2 DIAS", "DEPÓSITO DA ESTAÇÃO"],
  ["ÁGUA", "1 DIA", "RESERVATÓRIO QUASE VAZIO"],
  ["“ESTOU NA OFICINA”", "“A PORTA NÃO VAI AGUENTAR.”", "RÁDIO • SINAL DA OFICINA"],
  ["ELES VIRAM A LUZ", "UMA SAÍDA ANTES DA NOITE", "ACESSO PELA ESTRADA"],
  ["A  •  MERCADO", "B  •  OFICINA", "BUSCAR ÁGUA  /  ENCONTRAR QUEM CHAMOU"],
  ["VOTE A OU B", "APELIDO + HABILIDADE", "QUER ENTRAR NO REFÚGIO?"],
  ["CURTA E SE INSCREVA", "VOCÊ ESCOLHE A ROTA", "RESULTADO NO DIA 02"],
];

const cenaRefugio = (i: number): CenaEspecial => ({ cena }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tarde = em(cena, "tarde");
  const aviso = i === 0 && t >= (tarde || 1.65);
  const [linha1, linha2, rodape] = cards[i];
  return (
    <AbsoluteFill style={{background:ink, color:"#f3eee0", fontFamily:"Consolas, monospace"}}>
      <div style={{position:"absolute", left:64, right:64, top:96, display:"flex", justifyContent:"space-between",
        paddingBottom:24, borderBottom:"3px solid #59645e", fontSize:35, letterSpacing:5, fontWeight:700}}>
        <span>REFÚGIO <span style={{color:amber}}>13</span></span><span style={{color:cyan}}>DIA 01</span>
      </div>
      <div style={{position:"absolute", left:i<6 ? 24 : 46, top:i<6 ? 195 : 233, width:i<6 ? 1032 : 988, height:i<6 ? 1210 : 1037, overflow:"hidden",
        background:"#354a42", border:"4px solid #657464"}}>
        <Mundo etapa={i} t={t} marco={tarde || 1.65} />
      </div>
      {i>=6 ? <div style={{position:"absolute", left:46, right:46, top:1300, display:"flex", gap:18}}>
        {[["A · MERCADO","Buscar água",amber],["B · OFICINA","Responder ao chamado",cyan]].map(([titulo,acao,cor]) =>
          <div key={titulo} style={{flex:1,border:`3px solid ${cor}`,background:"#182527",padding:"20px 18px",fontSize:32}}>
            <strong style={{color:cor}}>{titulo}</strong><div style={{fontSize:28,marginTop:10}}>{acao}</div>
          </div>)}
      </div> : <div style={{position:"absolute", left:64, right:64, top:1428, color:"#a5b7a6", fontSize:26, letterSpacing:1}}>{rodape}</div>}
      <div style={{position:"absolute", left:64, right:50, top:i>=6 ? 1488 : 1475, fontSize:linha1.length>18 ? 47 : 57, fontWeight:900,
        lineHeight:1.03, color:aviso || i===5 ? red : amber}}>
        <div>{i===6 ? "VOTE A OU B" : aviso ? "ELES VIRAM A LUZ." : linha1}</div>
        {i!==6 && !aviso && <div style={{fontSize:linha2.length>24 ? 36 : 41, marginTop:8, color:i>=6 ? cyan : "#f3eee0"}}>{linha2}</div>}
      </div>
      {i===0 && <Sons efeitos={[{t:0, tipo:"erro"}, {t:tarde || 1.65, tipo:"pop"}]} />}
      {i===4 && <Sons efeitos={[{t:.1, tipo:"erro"}]} />}
      {i===6 && <Sons efeitos={[{t:.12, tipo:"pop"}, {t:em(cena,"oficina"), tipo:"pop"}]} />}
    </AbsoluteFill>
  );
};

const especiais = Object.fromEntries(cards.map((_, i) => [i, cenaRefugio(i)]));

export const Refugio13Dia01: React.FC<Timeline> = (tl) => (
  <Video {...tl} pasta="videos/refugio-13-01-a-estacao-ainda-tem-luz-mwktp8wd/" especiais={especiais}
    legenda={{...tl.legenda, pos:90}} />
);
