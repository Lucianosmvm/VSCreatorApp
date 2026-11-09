import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Cena } from "../tipos";
import { Sons, type Efeito } from "./Som";

// Kit de cena "jogo de sobrevivência": cenário noturno, personagens em SVG,
// barra de vida, ficha de classe e peças de palco. Coordenadas em px de um
// quadro 1920x1080. A legenda fica em y >= 864: pés dos bonecos até ~840.

export const COR = { esc: "#1d2416", oli: "#4b5a35", beg: "#d8c3a0", cre: "#f2ead8", ama: "#FFD23F", ver: "#ff5f57", vd: "#5fd36a", azul: "#7fc8ff", prof: "#0e110a" };
const FONTE = "Poppins";
const MONO = "Consolas, 'Courier New', monospace";

export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: f / fps, f, fps };
};

/** 0→1 com mola a partir do segundo `t0` */
export const useSurge = (t0 = 0, dureza = 170, amortece = 13) => {
  const { f, fps } = useT();
  return spring({ frame: f - Math.round(t0 * fps), fps, config: { damping: amortece, stiffness: dureza } });
};

const rampa = (t: number, a: number, b: number, de = 0, para = 1) =>
  interpolate(t, [a, b], [de, para], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ── cenários ─────────────────────────────────────────────────────────────
const Vila: React.FC<{ indice: number }> = ({ indice }) => {
  const { f } = useT();
  const { width, height } = useVideoConfig();
  const luaX = height > width ? 1000 : 1640; // em pé o cenário é cortado nas laterais
  const px = (k: number) => -f * k * (indice % 2 ? 1 : -1);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0a0e09 0%,#1b2415 52%,#34402a 74%,#141a0f 75%,#0c1009 100%)" }}>
      <div style={{ position: "absolute", left: luaX + px(0.03), top: 60, width: 210, height: 210, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%,#f2ead8,#d8c3a0 62%,#a99270)", boxShadow: "0 0 120px 40px rgba(216,195,160,.3)" }} />
      <svg width={2200} height={1080} style={{ position: "absolute", left: -140 + px(0.08), top: 0 }}>
        <g fill="#141b10">
          <path d="M0 810V560l70-70 70 70v250zM190 810V600h190v210zM175 610l110-90 110 90z" />
          <path d="M1120 810V330l-30 0 56-170 56 170-30 0V810z" />
          <path d="M1185 810V580h240v230zM1165 590l140-110 140 110z" />
          <path d="M1570 810V620h200v190zM1550 630l120-100 120 100z" />
          <path d="M500 810V640h170v170zM485 650l100-80 100 80z" />
          <path d="M1140 170h12v-50h-12zM1124 138h44v10h-44z" />
        </g>
        <g fill="#ffb84d" opacity={0.75 + 0.2 * Math.sin(f * 0.4)}>
          <rect x="255" y="660" width="34" height="44" /><rect x="1275" y="640" width="30" height="44" /><rect x="1645" y="680" width="30" height="40" />
        </g>
        <path d="M800 810c8-120 0-190-34-280m26 110c-30-22-60-34-92-38m80-20c20-34 44-54 74-70" stroke="#0e130b" strokeWidth={16} fill="none" strokeLinecap="round" />
      </svg>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: -500 + ((f * (0.9 + i * 0.5) + i * 800) % 2600) - 300, top: 640 + i * 40, width: 1300, height: 190, borderRadius: "50%", background: "rgba(216,195,160,.09)", filter: "blur(45px)" }} />
      ))}
      {Array.from({ length: 20 }, (_, i) => {
        const y = (random(`y${i}`) * 900 - f * (0.7 + random(`v${i}`) * 1.6)) % 900;
        return <div key={i} style={{ position: "absolute", left: random(`x${i}`) * 1920 + Math.sin(f * 0.04 + i) * 26, top: y < 0 ? y + 900 : y, width: 5, height: 5, borderRadius: 5, background: "#ffb84d", opacity: 0.25 + 0.5 * random(`o${i}`) }} />;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,.72) 100%)" }} />
    </AbsoluteFill>
  );
};

const Oficina: React.FC = () => {
  const { f } = useT();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%,#39462a 0%,#1d2416 62%,#10140b 100%)" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(216,195,160,.07) 2px,transparent 2px),linear-gradient(90deg,rgba(216,195,160,.07) 2px,transparent 2px)", backgroundSize: "80px 80px", backgroundPosition: `${f * 0.4}px ${f * 0.4}px` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, bottom: 0, background: "linear-gradient(#141a0f,#0b0e08)", borderTop: `4px solid ${COR.oli}` }} />
    </AbsoluteFill>
  );
};

// ── palco: cenário + câmera lenta + título do capítulo + sons ─────────────
export const Arena: React.FC<{
  cena: Cena; indice: number; lugar?: "vila" | "oficina"; zoom?: number; tremor?: number[]; sons?: Efeito[];
  children: React.ReactNode;
}> = ({ cena, indice, lugar = "vila", zoom = 0.05, tremor = [], sons = [], children }) => {
  const { t } = useT();
  const { width, height } = useVideoConfig();
  const empe = height > width;
  const empurra = rampa(t, 0, Math.max(cena.dur, 1), 1, 1 + zoom);
  const treme = tremor.reduce((s, x) => {
    const d = t - x;
    return d >= 0 && d < 0.35 ? s + Math.sin(d * 75) * 16 * (1 - d / 0.35) : s;
  }, 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${treme}px) scale(${empurra})`, transformOrigin: indice % 2 ? "38% 58%" : "62% 58%" }}>
        {/* em pé: o cenário de 1920x1080 cobre a altura e fica centrado */}
        <div style={empe ? { position: "absolute", left: (width - 1920 * (height / 1080)) / 2, top: 0, width: 1920, height: 1080, transform: `scale(${height / 1080})`, transformOrigin: "0 0" } : { position: "absolute", inset: 0 }}>
          {lugar === "vila" ? <Vila indice={indice} /> : <Oficina />}
        </div>
        {children}
      </AbsoluteFill>
      {cena.titulo && <Capitulo texto={cena.titulo} />}
      <Sons efeitos={[...(cena.titulo ? [{ t: 0, tipo: "whoosh" as const }] : []), ...sons]} />
    </AbsoluteFill>
  );
};

const Capitulo: React.FC<{ texto: string }> = ({ texto }) => {
  const s = useSurge(0.05, 190, 15);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 34, display: "flex", justifyContent: "center", transform: `translateY(${(s - 1) * 150}px)` }}>
      <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 62, color: COR.esc, background: COR.ama, padding: "8px 44px", borderRadius: 16, textAlign: "center", transform: "rotate(-1deg)", boxShadow: "0 14px 40px rgba(0,0,0,.6)" }}>{texto}</div>
    </div>
  );
};

// ── posicionamento com entrada ───────────────────────────────────────────
export const Entra: React.FC<{ t?: number; x: number; y: number; de?: "zoom" | "baixo" | "esq" | "dir" | "cima"; sai?: number; gira?: number; children: React.ReactNode }> = ({ t = -1, x, y, de = "zoom", sai, gira = 0, children }) => {
  const { t: agora } = useT();
  const s = useSurge(t);
  if (agora < t) return null;
  const fora = sai !== undefined ? rampa(agora, sai, sai + 0.22, 1, 0) : 1;
  const dx = de === "esq" ? (s - 1) * 500 : de === "dir" ? (1 - s) * 500 : 0;
  const dy = de === "baixo" ? (1 - s) * 280 : de === "cima" ? (s - 1) * 280 : 0;
  const esc = de === "zoom" ? s : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, s * 1.4) * fora, transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(${esc}) rotate(${gira}deg)` }}>{children}</div>
  );
};

export const Rotulo: React.FC<{ txt: string; cor?: string; fundo?: string; tam?: number; mono?: boolean }> = ({ txt, cor = COR.esc, fundo = COR.beg, tam = 40, mono }) => (
  <div style={{ fontFamily: mono ? MONO : FONTE, fontWeight: 900, fontSize: tam, color: cor, background: fundo, padding: `${tam * 0.18}px ${tam * 0.55}px`, borderRadius: tam * 0.3, whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(0,0,0,.5)" }}>{txt}</div>
);

export const Grande: React.FC<{ txt: string; cor?: string; tam?: number }> = ({ txt, cor = COR.cre, tam = 92 }) => (
  <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: tam, color: cor, whiteSpace: "nowrap", textShadow: "0 6px 0 #0b0e08,0 14px 40px rgba(0,0,0,.8)", lineHeight: 1.05, textAlign: "center" }}>{txt}</div>
);

export const Carimbo: React.FC<{ txt: string; t: number; x: number; y: number; cor?: string; tam?: number; gira?: number }> = ({ txt, t, x, y, cor = COR.ver, tam = 76, gira = -8 }) => {
  const { t: agora, f, fps } = useT();
  if (agora < t) return null;
  const s = spring({ frame: f - Math.round(t * fps), fps, config: { damping: 11, stiffness: 240 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${gira}deg) scale(${2.1 - 1.1 * s})`, opacity: Math.min(1, s * 1.6), fontFamily: FONTE, fontWeight: 900, fontSize: tam, color: cor, border: `8px solid ${cor}`, padding: "2px 28px", borderRadius: 14, background: "rgba(10,12,8,.86)", whiteSpace: "nowrap" }}>{txt}</div>
  );
};

/** linha que se desenha de (x1,y1) até (x2,y2) */
export const Seta: React.FC<{ t: number; x1: number; y1: number; x2: number; y2: number; cor?: string; ponta?: boolean }> = ({ t, x1, y1, x2, y2, cor = COR.ama, ponta = true }) => {
  const { t: agora } = useT();
  const { width, height } = useVideoConfig();
  const p = rampa(agora, t, t + 0.3);
  if (p <= 0) return null;
  const xf = x1 + (x2 - x1) * p, yf = y1 + (y2 - y1) * p;
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <line x1={x1} y1={y1} x2={xf} y2={yf} stroke={cor} strokeWidth={8} strokeDasharray="18 14" strokeLinecap="round" />
      {ponta && <path d="M-28-20L6 0l-34 20z" fill={cor} transform={`translate(${xf} ${yf}) rotate(${ang})`} />}
    </svg>
  );
};

// ── personagens ──────────────────────────────────────────────────────────
export type TipoBoneco = "leon" | "ganado" | "ashley";

type Membros = { passo: number; braco: number };

const Leon: React.FC<Membros> = ({ passo, braco }) => (
  <g strokeLinejoin="round">
    <g transform={`rotate(${passo} -22 -170)`}><path d="M-42-178h40l-4 150h-30z" fill="#2c3440" /><path d="M-40-34h36v34h-46z" fill="#1a1510" /></g>
    <g transform={`rotate(${-passo} 22 -170)`}><path d="M2-178h40l-2 150h-30z" fill="#343d4a" /><path d="M10-34h32l12 34h-44z" fill="#1a1510" /></g>
    <path d="M-54-310l108 0 8 142h-124z" fill="#6b4a2c" />
    <path d="M-20-312h40l-6 142h-28z" fill="#33414f" />
    <path d="M-52-186h104v16h-104z" fill="#4e351f" />
    <path d="M-44-182h88v-8h-88z" fill="#c4a35e" />
    <path d="M-60-312c20-20 100-20 120 0l-16 28h-88z" fill="#e5d8bd" />
    <g transform="rotate(8 -56 -296)"><path d="M-78-300h34l-4 118h-26z" fill="#5d4026" /><circle cx="-61" cy="-172" r="14" fill="#e3b58f" /></g>
    <g transform={`rotate(${braco} 58 -296)`}>
      <path d="M44-300h32l6 118h-26z" fill="#5d4026" /><circle cx="69" cy="-172" r="14" fill="#e3b58f" />
      <path d="M58-164h22v-16h44v-16h-66z" fill="#16181a" transform="rotate(90 69 -172)" />
    </g>
    <path d="M-34-312h68v-24h-68z" fill="#d5a780" />
    <path d="M-42-378c0-22 84-22 84 0v28c0 28-24 42-42 42s-42-14-42-42z" fill="#e8bd97" />
    <path d="M-48-352c-8-46 30-60 62-52 30 6 44 30 36 56l-10-20c-22 4-38-8-44-24-2 26-16 30-28 22z" fill="#b08a4e" />
    <path d="M-48-352c-2-14 4-30 14-40 0 18 2 30 8 38-8 6-18 6-22 2z" fill="#8d6c3a" />
    <circle cx="-16" cy="-348" r="5" fill="#1a2c3d" /><circle cx="20" cy="-348" r="5" fill="#1a2c3d" />
    <path d="M-10-324c6 4 14 4 20 0" stroke="#7a4a30" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

export type Arma = "forcado" | "foice" | "motosserra" | "cajado";

// Arma na mão direita (a origem do braço é o ombro; a mão fica em 68,-176).
const ArmaGanado: React.FC<{ arma: Arma }> = ({ arma }) => {
  const { f } = useT();
  if (arma === "foice") return (
    <>
      <path d="M68-322v220" stroke="#3a2a17" strokeWidth={10} strokeLinecap="round" />
      <path d="M62-326c58-44 142-26 164 42-44-38-104-46-162-18z" fill="#c9cdc0" stroke="#6f7468" strokeWidth={3} />
    </>
  );
  if (arma === "motosserra") return (
    <>
      <path d="M108-206h156c12 0 20 8 20 16s-8 16-20 16H108z" fill="#aeb4aa" stroke="#555a50" strokeWidth={3} />
      <path d="M108-210h172M108-170h172" stroke="#20231e" strokeWidth={8} strokeDasharray="12 9" strokeDashoffset={-f * 6} />
      <path d="M36-222h78v76H36z" fill="#d9661f" stroke="#7d3610" strokeWidth={4} />
      <path d="M50-222c0-34 52-34 52 0" fill="none" stroke="#20231e" strokeWidth={10} />
      <path d="M48-196h54M48-178h54" stroke="#7d3610" strokeWidth={5} />
    </>
  );
  if (arma === "cajado") return (
    <>
      <path d="M68-352c-8 60 8 120 0 180s6 100 0 132" stroke="#4a331c" strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d="M40-370c0 40 56 40 56 0" fill="none" stroke="#4a331c" strokeWidth={9} strokeLinecap="round" />
      <circle cx="68" cy="-386" r={44 + Math.sin(f * 0.25) * 6} fill="#a56bff" opacity={0.28} />
      <circle cx="68" cy="-386" r="23" fill="#c9a2ff" stroke="#6b39bd" strokeWidth={4} />
    </>
  );
  return (
    <>
      <path d="M68-330v290" stroke="#3a2a17" strokeWidth={10} strokeLinecap="round" />
      <path d="M44-390v50h48v-50M68-394v54" stroke="#9aa090" strokeWidth={8} fill="none" strokeLinecap="round" />
    </>
  );
};

const Ganado: React.FC<Membros & { tom: number; arma: Arma }> = ({ passo, braco, tom, arma }) => {
  const camisa = arma === "cajado" ? "#34264d" : ["#5b4a33", "#44503a", "#60402f"][tom % 3];
  return (
    <g strokeLinejoin="round" transform="rotate(4 0 -180)">
      <g transform={`rotate(${passo} -22 -170)`}><path d="M-44-176h40l-6 150h-30z" fill="#2b2519" /><path d="M-42-34h34v34h-44z" fill="#14100a" /></g>
      <g transform={`rotate(${-passo} 22 -170)`}><path d="M4-176h40l-6 150h-30z" fill="#352d1f" /><path d="M8-34h32l12 34h-44z" fill="#14100a" /></g>
      <path d="M-58-302c30-14 86-14 116 0l8 136-20-8-18 10-24-10-20 10-22-10-20 8z" fill={camisa} />
      <path d="M-20-302l12 60-14 40" stroke="#1d170f" strokeWidth={5} fill="none" />
      <g transform="rotate(6 -58 -290)"><path d="M-78-296h32l-4 110h-26z" fill={camisa} /><circle cx="-62" cy="-176" r="14" fill="#9aa377" /></g>
      <g transform={`rotate(${arma === "foice" || arma === "cajado" ? -16 - braco : braco} 58 -290)`}>
        <path d="M46-296h32l4 110h-26z" fill={camisa} /><circle cx="68" cy="-176" r="15" fill="#9aa377" />
        <ArmaGanado arma={arma} />
      </g>
      {arma === "motosserra" && <path d="M-38-290h76l8 126H-46z" fill="#77725f" stroke="#3a372b" strokeWidth={4} />}
      {arma === "cajado" && <path d="M-60-196h120l14 186H-74z" fill="#34264d" />}
      {arma === "cajado" && <path d="M-62-292c-20-136 144-136 124 0z" fill="#241a38" />}
      <path d="M-30-306h60v-22h-60z" fill="#858e65" />
      <path d="M-40-376c0-24 80-24 80 0v30c0 26-22 40-40 40s-40-14-40-40z" fill="#9aa377" />
      {arma !== "cajado" && <path d="M-44-368c-4-34 24-44 46-42 26 2 46 14 42 42-10-16-30-20-46-18s-34 4-42 18z" fill="#211b12" />}
      {arma !== "cajado" && <path d="M-38-338c6 30 20 40 38 40s32-10 38-40c-10 10-20 12-38 12s-28-2-38-12z" fill="#2c2418" />}
      {arma === "motosserra" && <path d="M-46-386c20-30 72-30 92 0l-4 74c-24 22-60 22-84 0z" fill="#9c8558" stroke="#5e4f32" strokeWidth={4} />}
      {arma === "motosserra" && <path d="M-34-322h68" stroke="#5e4f32" strokeWidth={5} strokeDasharray="8 6" />}
      {arma === "cajado" && <path d="M-46-380c20-52 72-52 92 0-24-20-68-20-92 0z" fill="#241a38" />}
      <circle cx="-16" cy="-350" r="7" fill="#ff3b2f" /><circle cx="18" cy="-350" r="7" fill="#ff3b2f" />
      <circle cx="-16" cy="-350" r="14" fill="#ff3b2f" opacity={0.25} /><circle cx="18" cy="-350" r="14" fill="#ff3b2f" opacity={0.25} />
    </g>
  );
};

const Ashley: React.FC<Membros> = ({ passo, braco }) => (
  <g strokeLinejoin="round" transform="translate(0 0)">
    <g transform={`rotate(${passo} -18 -150)`}><path d="M-32-160h26l-2 128h-22z" fill="#e6bb95" /><path d="M-34-40h28v40h-36z" fill="#5a3a22" /></g>
    <g transform={`rotate(${-passo} 18 -150)`}><path d="M6-160h26l-2 128h-22z" fill="#d9ad88" /><path d="M6-40h28l8 40h-36z" fill="#5a3a22" /></g>
    <path d="M-44-196h88l16 56h-120z" fill="#3d5c3a" /><path d="M-30-196v56M0-196v56M30-196v56M-52-168h104" stroke="#28402a" strokeWidth={5} />
    <path d="M-46-296c26-10 66-10 92 0l4 104h-100z" fill="#d97f2e" />
    <g transform="rotate(8 -46 -284)"><path d="M-66-290h28l-2 100h-24z" fill="#c97225" /><circle cx="-52" cy="-182" r="12" fill="#e6bb95" /></g>
    <g transform={`rotate(${braco} 46 -284)`}><path d="M38-290h28l2 100h-24z" fill="#c97225" /><circle cx="56" cy="-182" r="12" fill="#e6bb95" /></g>
    <path d="M-20-300h40v-22h-40z" fill="#e6bb95" />
    <path d="M-38-364c0-22 76-22 76 0v26c0 24-20 36-38 36s-38-12-38-36z" fill="#efc7a3" />
    <path d="M-46-310c-14-50 8-92 46-92s60 42 46 92l-12-4c4-26-4-42-16-52-18 12-38 12-52 10-6 12-6 28-2 42z" fill="#e8cf79" />
    <circle cx="-14" cy="-342" r="5" fill="#2f4c30" /><circle cx="16" cy="-342" r="5" fill="#2f4c30" />
    <path d="M-8-320c6 4 12 4 18 0" stroke="#a65c45" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

const brilho = (t: number, x: number) => t >= x && t < x + 0.12;

export const Boneco: React.FC<{
  tipo: TipoBoneco; x: number; y?: number; h?: number; t?: number; de?: "baixo" | "zoom" | "dir" | "esq"; vira?: boolean; tom?: number;
  ataca?: number[]; dano?: number[]; cai?: number; anda?: [number, number, number]; molde?: number; molde0?: boolean; sai?: number; arma?: Arma;
}> = ({ arma = "forcado", tipo, x, y = 836, h = 420, t = -1, de = "baixo", vira, tom = 0, ataca = [], dano = [], cai, anda, molde, molde0, sai }) => {
  const { t: agora, f } = useT();
  const s = useSurge(t, 160, 12);
  if (agora < t) return null;
  const k = h / 410;
  // respiração própria de cada personagem, para o grupo não andar em sincronia
  const fase = x * 0.013 + tom;
  const resp = Math.sin(f * 0.11 + fase) * 0.012;
  const andando = anda && agora >= anda[0] && agora <= anda[1];
  const xAgora = anda ? interpolate(agora, [anda[0], anda[1]], [x, anda[2]], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : x;
  const passo = andando ? Math.sin(f * 0.75) * 24 : 0;
  // braço ergue e desce em 0,45 s a cada ataque; o direito aponta para a frente
  const golpe = ataca.reduce((m, a) => Math.max(m, agora >= a - 0.05 ? rampa(agora, a - 0.05, a + 0.1) * rampa(agora, a + 0.25, a + 0.55, 1, 0) : 0), 0);
  const braco = -8 - golpe * 88;
  const tremeu = dano.reduce((m, d) => (agora >= d && agora < d + 0.4 ? Math.sin((agora - d) * 60) * 16 * (1 - (agora - d) / 0.4) : m), 0);
  const ferido = dano.some((d) => brilho(agora, d) || brilho(agora, d + 0.2));
  const queda = cai !== undefined ? rampa(agora, cai, cai + 0.35) : 0;
  const clareia = molde !== undefined ? rampa(agora, molde, molde + 0.35) : molde0 ? 0 : 1;
  const fora = sai !== undefined ? rampa(agora, sai, sai + 0.2, 1, 0) : 1;
  const entrada = de === "baixo" ? `translateY(${(1 - s) * 200}px)` : de === "esq" ? `translateX(${(s - 1) * 520}px)` : de === "dir" ? `translateX(${(1 - s) * 520}px)` : `scale(${s})`;
  const corpo = (
    <g transform={`scale(${vira ? -k : k} ${k * (1 + resp)})`}>
      {tipo === "leon" && <Leon passo={passo} braco={braco} />}
      {tipo === "ganado" && <Ganado passo={passo} braco={braco} tom={tom} arma={arma} />}
      {tipo === "ashley" && <Ashley passo={passo} braco={braco} />}
    </g>
  );
  const larg = h * 1.4;
  return (
    <div style={{ position: "absolute", left: xAgora - larg / 2 + tremeu, top: y - h * 1.15, width: larg, height: h * 1.15 + 20, opacity: Math.min(1, s * 1.5) * fora * (1 - queda * 0.65), transform: `${entrada} rotate(${(vira ? -1 : 1) * queda * 84}deg)`, transformOrigin: "50% 95%" }}>
      <svg width={larg} height={h * 1.15 + 20} style={{ overflow: "visible" }}>
        <ellipse cx={larg / 2} cy={h * 1.15 + 2} rx={h * 0.22} ry={h * 0.035} fill="rgba(0,0,0,.45)" />
        <g transform={`translate(${larg / 2} ${h * 1.15})`}>
          {clareia < 1 && <g style={{ filter: "brightness(0) invert(.82) sepia(.5)", opacity: 0.4 * (1 - clareia) }}>{corpo}</g>}
          {clareia > 0 && <g style={{ opacity: clareia, filter: ferido ? "brightness(.7) sepia(1) saturate(9) hue-rotate(-40deg)" : undefined }}>{corpo}</g>}
        </g>
      </svg>
    </div>
  );
};

/** clarão do disparo, na altura da mão de quem atira */
export const Clarao: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const { t: agora } = useT();
  if (agora < t || agora > t + 0.16) return null;
  return <svg width={200} height={200} style={{ position: "absolute", left: x - 100, top: y - 100 }}><path d="M100 0l22 66 66-26-40 60 52 30-66 2 6 68-40-54-40 54 6-68-66-2 52-30-40-60 66 26z" fill={COR.ama} /><circle cx="100" cy="100" r="30" fill="#fff" /></svg>;
};

// ── barra de vida ────────────────────────────────────────────────────────
export const Hud: React.FC<{ nome: string; vida: number; x: number; y: number; de?: number; em?: number; t?: number; largura?: number; max?: number }> = ({ nome, vida, x, y, de, em: quando, t = -1, largura = 340, max = 100 }) => {
  const { t: agora } = useT();
  const inicio = quando ?? t;
  const v = de !== undefined ? interpolate(agora, [inicio, inicio + 0.5], [de, vida], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : quando === undefined ? interpolate(agora, [t, t + 0.55], [0, vida], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : vida;
  const cor = v > 60 ? COR.vd : v > 30 ? COR.ama : COR.ver;
  return (
    <Entra t={t} x={x} y={y} de="zoom">
      <div style={{ width: largura, background: "rgba(10,12,8,.9)", border: `3px solid ${COR.oli}`, borderRadius: 14, padding: "10px 16px", boxShadow: "0 14px 34px rgba(0,0,0,.55)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTE, fontWeight: 900, fontSize: 30, color: COR.cre }}><span>{nome}</span><span style={{ color: cor }}>{Math.round(v)}</span></div>
        <div style={{ height: 20, background: "#2a2a22", borderRadius: 10, overflow: "hidden", marginTop: 6 }}><div style={{ width: `${(v / max) * 100}%`, height: "100%", background: cor, borderRadius: 10 }} /></div>
      </div>
    </Entra>
  );
};

// ── ficha de classe (projeto) e ficha de objeto (valores) ────────────────
export type LinhaFicha = { txt: string; t?: number; marca?: number; cor?: string };

export const FichaClasse: React.FC<{ nome?: string; trocaNome?: { t: number; txt: string }; linhas?: LinhaFicha[]; x: number; y: number; t?: number; largura?: number; tam?: number; de?: "zoom" | "baixo" | "esq" | "dir" | "cima"; sai?: number; legenda?: string }> = ({ nome = "class Personagem", trocaNome, linhas = [], x, y, t = -1, largura = 560, tam = 40, de = "zoom", sai, legenda }) => {
  const { t: agora } = useT();
  const titulo = trocaNome && agora >= trocaNome.t ? trocaNome.txt : nome;
  return (
    <Entra t={t} x={x} y={y} de={de} sai={sai}>
      <div style={{ width: largura, borderRadius: 18, overflow: "hidden", background: "#14304a", border: `4px solid ${COR.azul}`, boxShadow: "0 24px 60px rgba(0,0,0,.6)", backgroundImage: "linear-gradient(rgba(127,200,255,.11) 2px,transparent 2px),linear-gradient(90deg,rgba(127,200,255,.11) 2px,transparent 2px)", backgroundSize: "30px 30px" }}>
        <div style={{ background: COR.azul, color: "#0b1d2c", fontFamily: MONO, fontWeight: 900, fontSize: tam, padding: `${tam * 0.22}px ${tam * 0.5}px`, whiteSpace: "nowrap" }}>{titulo}</div>
        {legenda && <div style={{ fontFamily: FONTE, fontWeight: 800, color: COR.azul, fontSize: tam * 0.6, padding: `${tam * 0.2}px ${tam * 0.5}px 0` }}>{legenda}</div>}
        <div style={{ padding: linhas.length ? `${tam * 0.3}px ${tam * 0.5}px` : 0 }}>
          {linhas.map((l, i) => {
            const vis = l.t === undefined || agora >= l.t;
            const dest = l.marca !== undefined && agora >= l.marca;
            const s = vis ? rampa(agora, l.t ?? -1, (l.t ?? -1) + 0.2) : 0;
            return <div key={i} style={{ fontFamily: MONO, fontWeight: 700, fontSize: tam * 0.86, lineHeight: 1.45, color: dest ? COR.esc : l.cor ?? COR.cre, background: dest ? COR.ama : "transparent", borderRadius: 8, padding: "0 10px", opacity: s, transform: `translateX(${(1 - s) * -30}px)`, whiteSpace: "nowrap" }}>{vis ? l.txt : " "}</div>;
          })}
        </div>
      </div>
    </Entra>
  );
};

export const FichaObjeto: React.FC<{ nome: string; campos: { k: string; v: string; t?: number; marca?: number }[]; x: number; y: number; t?: number; largura?: number; tam?: number; cor?: string; de?: "zoom" | "baixo" | "esq" | "dir" | "cima" }> = ({ nome, campos, x, y, t = -1, largura = 420, tam = 36, cor = COR.ama, de = "zoom" }) => {
  const { t: agora } = useT();
  return (
    <Entra t={t} x={x} y={y} de={de}>
      <div style={{ width: largura, borderRadius: 18, overflow: "hidden", background: "rgba(14,17,10,.94)", border: `4px solid ${cor}`, boxShadow: "0 24px 60px rgba(0,0,0,.6)" }}>
        <div style={{ background: cor, color: COR.esc, fontFamily: FONTE, fontWeight: 900, fontSize: tam, padding: `${tam * 0.15}px ${tam * 0.5}px`, whiteSpace: "nowrap" }}>{nome}</div>
        <div style={{ padding: `${tam * 0.3}px ${tam * 0.5}px` }}>
          {campos.map((c, i) => {
            const vis = c.t === undefined || agora >= c.t;
            const dest = c.marca !== undefined && agora >= c.marca && agora < c.marca + 1.2;
            return <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 20, fontFamily: FONTE, fontWeight: 800, fontSize: tam * 0.86, lineHeight: 1.5, color: COR.beg }}><span>{c.k}</span><span style={{ fontFamily: MONO, fontWeight: 900, color: vis ? (dest ? COR.ver : COR.cre) : "#4d5245", transform: dest ? "scale(1.25)" : undefined }}>{vis ? c.v : "—"}</span></div>;
          })}
        </div>
      </div>
    </Entra>
  );
};

// ── objetos desenhados ───────────────────────────────────────────────────
export const Icone: React.FC<{ nome: "pistola" | "erva" | "controle" | "caixa" | "like" | "sino" | "balao" | "compartilha"; tam?: number; cor?: string }> = ({ nome, tam = 180, cor = COR.cre }) => (
  <svg viewBox="0 0 100 100" width={tam} height={tam} style={{ filter: "drop-shadow(0 12px 18px rgba(0,0,0,.6))" }}>
    {nome === "pistola" && <path d="M8 30h78v18H52l-4 8h-12l-4 28H14l6-34H8z" fill="#2a2d30" stroke={COR.beg} strokeWidth={3} strokeLinejoin="round" />}
    {nome === "erva" && <g><path d="M30 92h40l6-30H24z" fill="#a8653a" stroke="#5f3a20" strokeWidth={3} /><path d="M50 64C48 44 50 30 50 12" stroke="#2f6f2e" strokeWidth={5} fill="none" /><path d="M50 40C30 42 20 32 16 18c18-2 32 4 34 22zM50 46c20 0 30-12 34-26-18-2-34 6-34 26zM50 26C42 18 42 8 50 2c8 6 8 16 0 24z" fill="#58b64f" stroke="#2f6f2e" strokeWidth={2.5} /></g>}
    {nome === "controle" && <g><path d="M24 30h52c12 0 18 12 20 34 1 14-12 20-20 8l-8-12H32l-8 12c-8 12-21 6-20-8 2-22 8-34 20-34z" fill="#2a2d30" stroke={COR.beg} strokeWidth={3} /><path d="M26 40v14M19 47h14" stroke={COR.cre} strokeWidth={4} /><circle cx="68" cy="42" r="4" fill={COR.ama} /><circle cx="76" cy="50" r="4" fill={COR.ver} /></g>}
    {nome === "caixa" && <g><rect x="10" y="30" width="80" height="58" rx="5" fill={COR.oli} stroke={COR.beg} strokeWidth={3} /><rect x="24" y="10" width="52" height="20" fill="#2a2d30" stroke={COR.beg} strokeWidth={3} /><rect x="20" y="42" width="60" height="18" fill={COR.prof} /><text x="50" y="56" textAnchor="middle" fontSize="14" fontWeight="900" fontFamily={FONTE} fill={COR.vd}>R$ 42</text><circle cx="30" cy="74" r="4" fill={COR.beg} /><circle cx="50" cy="74" r="4" fill={COR.beg} /><circle cx="70" cy="74" r="4" fill={COR.beg} /></g>}
    {nome === "like" && <path d="M12 46h16v42H12zM34 88V46l18-36c8 0 12 6 10 14l-4 18h24c6 0 10 6 8 12l-8 30c-1 4-4 6-8 6z" fill={cor} stroke={COR.esc} strokeWidth={3} strokeLinejoin="round" />}
    {nome === "sino" && <path d="M50 10c-18 0-26 14-26 32 0 18-8 24-12 30h76c-4-6-12-12-12-30 0-18-8-32-26-32zM40 78c0 14 20 14 20 0z" fill={cor} stroke={COR.esc} strokeWidth={3} strokeLinejoin="round" />}
    {nome === "compartilha" && <g fill={cor} stroke={COR.esc} strokeWidth={3}><path d="M28 50L72 22M28 50l44 28" stroke={cor} strokeWidth={8} /><circle cx="26" cy="50" r="15" /><circle cx="74" cy="22" r="15" /><circle cx="74" cy="78" r="15" /></g>}
    {nome === "balao" && <path d="M12 16h76a6 6 0 0 1 6 6v46a6 6 0 0 1-6 6H44L24 92V74H12a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z" fill={cor} stroke={COR.esc} strokeWidth={3} strokeLinejoin="round" />}
  </svg>
);

/** planta baixa: `tracar` = quando as linhas terminam de ser desenhadas */
export const Planta: React.FC<{ x: number; y: number; t?: number; tracar?: number; largura?: number }> = ({ x, y, t = -1, tracar = 0, largura = 620 }) => {
  const { t: agora } = useT();
  const p = rampa(agora, tracar, tracar + 0.9);
  return (
    <Entra t={t} x={x} y={y}>
      <svg viewBox="0 0 320 240" width={largura} style={{ background: "#14304a", borderRadius: 16, border: `5px solid ${COR.azul}`, boxShadow: "0 24px 60px rgba(0,0,0,.6)" }}>
        <defs><pattern id="gr" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(127,200,255,.16)" strokeWidth="1" /></pattern></defs>
        <rect width="320" height="240" fill="url(#gr)" />
        <path d="M30 30h260v180H30zM160 30v76M160 136v74M30 110h80M140 110h150" fill="none" stroke={COR.cre} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <g opacity={p} fontFamily={FONTE} fontWeight={800} fontSize={14} fill={COR.azul} textAnchor="middle"><text x="95" y="72">sala</text><text x="225" y="72">quarto</text><text x="95" y="166">cozinha</text><text x="225" y="166">banho</text></g>
      </svg>
    </Entra>
  );
};

/** casa de verdade: sobe do chão a partir de `t` */
export const Casa: React.FC<{ x: number; y?: number; t: number; h?: number }> = ({ x, y = 836, t, h = 460 }) => {
  const { t: agora } = useT();
  const s = useSurge(t, 120, 15);
  if (agora < t) return null;
  return (
    <svg viewBox="0 0 300 300" width={h} height={h} style={{ position: "absolute", left: x - h / 2, top: y - h, clipPath: `inset(${(1 - Math.min(1, s)) * 100}% 0 0 0)`, filter: "drop-shadow(0 18px 24px rgba(0,0,0,.55))" }}>
      <path d="M40 130h220v170H40z" fill="#c98a4b" stroke="#6b4422" strokeWidth={6} />
      <path d="M14 136L150 22l136 114z" fill="#8c3f2c" stroke="#54241a" strokeWidth={6} strokeLinejoin="round" />
      <path d="M124 196h54v104h-54z" fill="#54341b" /><circle cx="166" cy="250" r="5" fill={COR.ama} />
      <path d="M62 172h44v44H62zM194 172h44v44h-44z" fill="#ffd97a" stroke="#6b4422" strokeWidth={5} />
    </svg>
  );
};

/** prensa + esteira: a cada instante de `saidas`, um boneco desce do molde e anda */
export const Fabrica: React.FC<{ t0: number; saidas: number[] }> = ({ t0, saidas }) => {
  const { t, f } = useT();
  const desce = saidas.reduce((m, s) => Math.max(m, t >= s - 0.25 && t < s + 0.2 ? rampa(t, s - 0.25, s - 0.03) * rampa(t, s + 0.03, s + 0.2, 1, 0) : 0), 0);
  return (
    <>
      <Entra t={t0} x={1140} y={740} de="baixo">
        <svg width={1500} height={80}><rect width={1500} height={80} rx={40} fill="#20261a" stroke={COR.beg} strokeWidth={4} />
          {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={40 + i * 96} cy={40} r={22} fill="none" stroke={COR.oli} strokeWidth={6} strokeDasharray="12 8" transform={`rotate(${f * 7} ${40 + i * 96} 40)`} />)}
        </svg>
      </Entra>
      {saidas.map((s, i) => {
        const x = interpolate(t, [s, s + 2.4], [430, 760 + (saidas.length - i - 1) * 330], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return t >= s ? <div key={i} style={{ position: "absolute", left: 0, top: 0 }}><Boneco tipo={i % 3 === 1 ? "ganado" : "leon"} tom={i} x={x} y={700} h={300} de="zoom" t={s} /></div> : null;
      })}
      <Entra t={t0} x={430} y={260} de="cima">
        <div style={{ transform: `translateY(${desce * 140}px)` }}>
          <div style={{ width: 16, height: 120, margin: "-120px auto 0", background: "#6b7358" }} />
          <div style={{ width: 380, height: 150, background: "#14304a", border: `5px solid ${COR.azul}`, borderRadius: "16px 16px 70px 70px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 900, fontSize: 44, color: COR.azul, boxShadow: "0 24px 50px rgba(0,0,0,.6)" }}>MOLDE</div>
        </div>
      </Entra>
    </>
  );
};

/** parede de arquivos repetidos que vai enchendo a tela */
export const ParedeCodigo: React.FC<{ t0: number; passo?: number; total?: number; riscar?: number; txt?: string }> = ({ t0, passo = 0.075, total = 42, riscar, txt = "class Ganado { ... }" }) => {
  const { width: largo, height: alto } = useVideoConfig();
  const { t } = useT();
  return (
    <>
      {Array.from({ length: total }, (_, i) => {
        const cols = alto > largo ? 3 : 6;
        const ini = t0 + i * passo;
        if (t < ini) return null;
        const x = (cols === 3 ? 190 : 180) + (i % cols) * (cols === 3 ? 350 : 310) + random(`px${i}`) * 34;
        const y = 150 + Math.floor(i / cols) * 95 + random(`py${i}`) * 26;
        return <Entra key={i} t={ini} x={x} y={y} gira={(random(`g${i}`) - 0.5) * 9}><div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, background: "rgba(14,17,10,.94)", color: COR.ver, border: `3px solid ${riscar !== undefined && t >= riscar ? COR.ver : COR.oli}`, borderRadius: 10, padding: "8px 16px", whiteSpace: "nowrap", textDecoration: riscar !== undefined && t >= riscar ? "line-through" : undefined }}>{txt}</div></Entra>;
      })}
    </>
  );
};

export const Contador: React.FC<{ de?: number; ate: number; t: number; dur?: number; x: number; y: number; tam?: number; cor?: string; sufixo?: string }> = ({ de = 0, ate, t, dur = 0.8, x, y, tam = 150, cor = COR.ama, sufixo = "" }) => {
  const { t: agora } = useT();
  const v = interpolate(agora, [t, t + dur], [de, ate], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <Entra t={t} x={x} y={y}><Grande txt={`${Math.round(v)}${sufixo}`} cor={cor} tam={tam} /></Entra>;
};
