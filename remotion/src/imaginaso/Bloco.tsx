// Kit "Bloco" do canal Imagina Só: cartoon chapado e grande, personagens de bloco com contorno
// grosso, etiqueta de nome sobre a cabeça e painéis de HUD — inspirado no formato "E se…"
// dos canais de animação de bloco, com desenho próprio (sem marcas de terceiros).
// Coordenadas em pixels reais de 1080x1920.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const COR = {
  linha: "#1b1530", ceu1: "#4fb6ff", ceu2: "#bfe7ff", sol: "#ffd93d", parede: "#ffd9a6", faixa: "#ff8a3d",
  janela: "#a6dcff", chao: "#ece8df", grade: "#d9d3c6", pele: "#f3c79b", branco: "#ffffff",
  azul: "#3f8cff", vermelho: "#ff4d5e", amarelo: "#ffd23f", verde: "#5ad35a", roxo: "#7b4bd6", rosa: "#ff5fa2",
};
export const L = 7; // espessura do contorno

export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: f / fps, f, fps };
};
export const rampa = (t: number, a: number, b: number, de = 0, ate = 1) =>
  interpolate(t, [a, b], [de, ate], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
export const mola = (t: number, t0: number, fps: number, d = 11, s = 170) =>
  t < t0 ? 0 : spring({ frame: Math.round((t - t0) * fps), fps, config: { damping: d, stiffness: s } });

// ── cenário: céu, sol, nuvens, casa e pátio ──────────────────────────────
export const Cenario: React.FC<{ escuro?: number; vermelho?: number }> = ({ escuro = 0, vermelho = 0 }) => {
  const { t, f } = useT();
  const nuvem = (x: number, y: number, k: number) => {
    const xx = ((x + f * 0.6 * k) % 1400) - 200;
    return (
      <g key={x} transform={`translate(${xx} ${y})`}>
        <rect x={0} y={20} width={170} height={56} rx={28} fill="#fff" stroke={COR.linha} strokeWidth={5} />
        <circle cx={60} cy={28} r={34} fill="#fff" stroke={COR.linha} strokeWidth={5} />
        <circle cx={110} cy={22} r={28} fill="#fff" stroke={COR.linha} strokeWidth={5} />
        <rect x={10} y={30} width={150} height={40} fill="#fff" />
      </g>
    );
  };
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COR.ceu1} /><stop offset="1" stopColor={COR.ceu2} /></linearGradient>
      </defs>
      <rect x={0} y={0} width={1080} height={1160} fill="url(#ceu)" />
      <g transform={`translate(830 300) rotate(${t * 20})`}>
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-8} y={-190} width={16} height={46} rx={8} fill={COR.sol} transform={`rotate(${i * 36})`} />)}
      </g>
      <circle cx={830} cy={300} r={118} fill={COR.sol} stroke={COR.linha} strokeWidth={L} />
      {nuvem(80, 210, 1)}{nuvem(620, 470, 0.7)}{nuvem(1100, 330, 0.9)}
      {/* casa */}
      <rect x={-20} y={760} width={1120} height={420} fill={COR.parede} stroke={COR.linha} strokeWidth={L} />
      <rect x={-20} y={760} width={1120} height={48} fill={COR.faixa} stroke={COR.linha} strokeWidth={L} />
      {[70, 300, 760, 990].map((x) => (
        <g key={x}>
          <rect x={x - 80} y={870} width={160} height={150} rx={10} fill={COR.janela} stroke={COR.linha} strokeWidth={L} />
          <rect x={x - 4} y={870} width={8} height={150} fill={COR.linha} />
          <rect x={x - 80} y={940} width={160} height={8} fill={COR.linha} />
          <rect x={x - 60} y={884} width={30} height={14} rx={7} fill="#fff" opacity={0.8} />
        </g>
      ))}
      <rect x={470} y={900} width={140} height={280} rx={12} fill="#a0612f" stroke={COR.linha} strokeWidth={L} />
      <circle cx={588} cy={1050} r={9} fill={COR.amarelo} stroke={COR.linha} strokeWidth={4} />
      {/* pátio */}
      <rect x={0} y={1176} width={1080} height={744} fill={COR.chao} />
      {Array.from({ length: 12 }, (_, i) => <rect key={`v${i}`} x={i * 96} y={1176} width={5} height={744} fill={COR.grade} />)}
      {Array.from({ length: 9 }, (_, i) => <rect key={`h${i}`} x={0} y={1176 + i * 88} width={1080} height={5} fill={COR.grade} />)}
      <rect x={0} y={1172} width={1080} height={L} fill={COR.linha} />
      {/* árvore */}
      <rect x={952} y={1000} width={44} height={180} fill="#8a5a2b" stroke={COR.linha} strokeWidth={L} />
      <circle cx={974} cy={960} r={110} fill="#5ac35a" stroke={COR.linha} strokeWidth={L} />
      {[[930, 930], [1010, 980], [960, 1010]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={12} fill="#ff9f43" stroke={COR.linha} strokeWidth={4} />)}
      {vermelho > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#b0001e" opacity={0.55 * vermelho} />}
      {escuro > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#0b0720" opacity={escuro} />}
    </svg>
  );
};

// ── personagem de bloco ──────────────────────────────────────────────────
export type Expr = "normal" | "feliz" | "bravo" | "medo" | "surpreso";
export type Tipo = "filho" | "mae";
export const Boneco: React.FC<{
  x: number; y: number; tipo: Tipo; esc?: number; expr?: Expr; nome?: string; t0?: number; braco?: number;
  tremor?: boolean; congelado?: boolean; olhos?: "laser" | null; flip?: boolean;
}> = ({ x, y, tipo, esc = 1, expr = "normal", nome, t0 = -1, braco = 0, tremor, congelado, olhos, flip }) => {
  const { t, f, fps } = useT();
  const s = t0 < 0 ? 1 : mola(t, t0, fps);
  if (s <= 0) return null;
  const bob = Math.sin(f * 0.15 + x) * 4;
  const dx = tremor ? Math.sin(t * 70) * 6 : 0;
  const camisa = tipo === "mae" ? COR.rosa : COR.azul;
  const calca = tipo === "mae" ? "#b0175f" : "#2b3a8f";
  const k = esc;
  const ol = expr === "bravo" ? "M -40 -12 L -14 -2 M 40 -12 L 14 -2" : expr === "medo" ? "M -40 -2 L -14 -12 M 40 -2 L 14 -12" : "M -38 -10 L -16 -10 M 38 -10 L 16 -10";
  const boca = expr === "feliz" ? "M -26 30 Q 0 52 26 30" : expr === "bravo" ? "M -24 40 Q 0 26 24 40" : expr === "medo" || expr === "surpreso" ? "" : "M -20 34 L 20 34";
  return (
    <g transform={`translate(${x + dx} ${y}) scale(${(flip ? -1 : 1) * k * s} ${k * s})`}>
      <g transform={`translate(0 ${bob})`} style={congelado ? { filter: "hue-rotate(170deg) saturate(1.6) brightness(1.15)" } : undefined}>
        {/* sombra */}
        <ellipse cx={0} cy={4} rx={90} ry={16} fill="#000" opacity={0.18} />
        {/* pernas */}
        <rect x={-58} y={-130} width={52} height={130} rx={8} fill={calca} stroke={COR.linha} strokeWidth={L} />
        <rect x={6} y={-130} width={52} height={130} rx={8} fill={calca} stroke={COR.linha} strokeWidth={L} />
        <rect x={-62} y={-24} width={60} height={26} rx={10} fill="#2a2a2a" stroke={COR.linha} strokeWidth={L} />
        <rect x={2} y={-24} width={60} height={26} rx={10} fill="#2a2a2a" stroke={COR.linha} strokeWidth={L} />
        {/* braços */}
        <g transform={`rotate(${-braco} -78 -270)`}>
          <rect x={-112} y={-280} width={44} height={140} rx={14} fill={camisa} stroke={COR.linha} strokeWidth={L} />
          <rect x={-110} y={-158} width={40} height={36} rx={10} fill={COR.pele} stroke={COR.linha} strokeWidth={L} />
        </g>
        <rect x={68} y={-280} width={44} height={140} rx={14} fill={camisa} stroke={COR.linha} strokeWidth={L} />
        <rect x={70} y={-158} width={40} height={36} rx={10} fill={COR.pele} stroke={COR.linha} strokeWidth={L} />
        {/* tronco */}
        <rect x={-74} y={-292} width={148} height={172} rx={18} fill={camisa} stroke={COR.linha} strokeWidth={L} />
        {tipo === "mae" ? (
          <path d="M -40 -250 h 80 v 120 h -80 z" fill="#fff" stroke={COR.linha} strokeWidth={5} />
        ) : (
          <>
            <rect x={-6} y={-288} width={12} height={160} fill="#2b5fcf" />
            <path d="M -20 -230 l 20 22 l 20 -22 l -20 -20 z" fill={COR.amarelo} stroke={COR.linha} strokeWidth={4} />
          </>
        )}
        {/* cabeça */}
        <g transform="translate(0 -372)">
          {tipo === "mae" && <circle cx={0} cy={-92} r={40} fill="#6b3a2a" stroke={COR.linha} strokeWidth={L} />}
          {tipo === "mae" && <rect x={-94} y={-74} width={188} height={178} rx={30} fill="#6b3a2a" stroke={COR.linha} strokeWidth={L} />}
          <rect x={-76} y={-66} width={152} height={140} rx={26} fill={COR.pele} stroke={COR.linha} strokeWidth={L} />
          {tipo === "mae" && <path d="M -76 -20 Q -40 -70 0 -40 Q 40 -70 76 -20 L 76 -50 Q 0 -110 -76 -50 Z" fill="#6b3a2a" stroke={COR.linha} strokeWidth={5} />}
          {tipo === "filho" && (
            <g>
              <rect x={-84} y={-86} width={168} height={58} rx={22} fill={COR.azul} stroke={COR.linha} strokeWidth={L} />
              <rect x={-20} y={-52} width={128} height={26} rx={13} fill="#2b5fcf" stroke={COR.linha} strokeWidth={L} />
              <circle cx={-30} cy={-62} r={12} fill={COR.amarelo} stroke={COR.linha} strokeWidth={4} />
            </g>
          )}
          {/* rosto */}
          <path d={ol} stroke={COR.linha} strokeWidth={8} strokeLinecap="round" />
          {expr === "medo" || expr === "surpreso" ? (
            <><circle cx={-27} cy={10} r={13} fill="#fff" stroke={COR.linha} strokeWidth={5} /><circle cx={27} cy={10} r={13} fill="#fff" stroke={COR.linha} strokeWidth={5} /><circle cx={-27} cy={10} r={5} fill={COR.linha} /><circle cx={27} cy={10} r={5} fill={COR.linha} /><ellipse cx={0} cy={44} rx={14} ry={18} fill={COR.linha} /></>
          ) : (
            <><ellipse cx={-27} cy={10} rx={9} ry={13} fill={olhos === "laser" ? COR.vermelho : COR.linha} /><ellipse cx={27} cy={10} rx={9} ry={13} fill={olhos === "laser" ? COR.vermelho : COR.linha} /></>
          )}
          {boca && <path d={boca} stroke={tipo === "mae" ? "#c2185b" : COR.linha} strokeWidth={tipo === "mae" ? 9 : 7} fill="none" strokeLinecap="round" />}
          {tipo === "mae" && <><circle cx={-48} cy={34} r={11} fill="#ff8fb8" opacity={0.75} /><circle cx={48} cy={34} r={11} fill="#ff8fb8" opacity={0.75} /><path d="M -38 0 l -10 -8 M -30 -3 l -6 -10 M 38 0 l 10 -8 M 30 -3 l 6 -10" stroke={COR.linha} strokeWidth={4} strokeLinecap="round" /></>}
          {tipo === "mae" && <circle cx={-80} cy={20} r={8} fill={COR.amarelo} stroke={COR.linha} strokeWidth={3} />}
          {expr === "medo" && <path d="M 66 -30 q 10 18 0 30 q -10 -12 0 -30" fill="#7fd3ff" stroke={COR.linha} strokeWidth={3} />}
        </g>
      </g>
      {congelado && <rect x={-110} y={-470} width={220} height={480} rx={30} fill="#bfe9ff" opacity={0.45} stroke="#7fd3ff" strokeWidth={6} />}
      {nome && (
        <g transform={`translate(0 ${-500 + bob}) scale(${flip ? -1 : 1} 1)`}>
          <rect x={-70} y={-30} width={140} height={52} rx={18} fill="#2b2140" stroke="#fff" strokeWidth={4} />
          <text x={0} y={6} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={30} fill={COR.amarelo}>{nome}</text>
        </g>
      )}
    </g>
  );
};

// ── itens ────────────────────────────────────────────────────────────────
export const Chinelo: React.FC<{ x: number; y: number; esc?: number; giro?: number; brilho?: boolean }> = ({ x, y, esc = 1, giro = 0, brilho }) => {
  const { f } = useT();
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${esc})`}>
      {brilho && Array.from({ length: 12 }, (_, i) => <rect key={i} x={-10} y={-240} width={20} height={120} rx={10} fill="#fff3a6" opacity={0.55} transform={`rotate(${i * 30 + f * 1.5})`} />)}
      <rect x={-48} y={-92} width={96} height={184} rx={46} fill="#e6a800" stroke={COR.linha} strokeWidth={L} />
      <rect x={-36} y={-80} width={72} height={160} rx={36} fill={COR.amarelo} />
      <path d="M -34 -30 Q 0 10 34 -30" stroke={COR.vermelho} strokeWidth={14} fill="none" strokeLinecap="round" />
      <rect x={-7} y={-36} width={14} height={50} rx={7} fill={COR.vermelho} />
      <rect x={-24} y={-66} width={14} height={26} rx={7} fill="#fff" opacity={0.7} />
    </g>
  );
};

// Painel de HUD no estilo "placar" (px reais).
export const Painel: React.FC<{ x: number; y: number; titulo: string; children: React.ReactNode; largura?: number; t0?: number; cor?: string }> = ({ x, y, titulo, children, largura = 380, t0 = 0, cor = "#6c4bd8" }) => {
  const { t, fps } = useT();
  const s = mola(t, t0, fps, 12, 180);
  if (s <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: largura, transform: `scale(${s})`, transformOrigin: "top right", fontFamily: "Poppins", fontWeight: 900 }}>
      <div style={{ position: "relative", background: "#241c46", border: "6px solid #1b1530", borderRadius: 26, padding: "34px 22px 18px", boxShadow: "0 10px 0 rgba(0,0,0,.25)" }}>
        <div style={{ position: "absolute", left: "50%", top: -24, transform: "translateX(-50%)", background: cor, color: "#fff", border: "5px solid #1b1530", borderRadius: 20, padding: "4px 18px", fontSize: 26, whiteSpace: "nowrap" }}>{titulo}</div>
        {children}
      </div>
    </div>
  );
};

// Faixa grande no meio da tela (ex.: "ITEM LENDÁRIO").
export const Faixa: React.FC<{ t0: number; txt: string; cor?: string; y?: number; tam?: number; gira?: number }> = ({ t0, txt, cor = COR.amarelo, y = 640, tam = 76, gira = -4 }) => {
  const { t, fps } = useT();
  const s = mola(t, t0, fps, 9, 200);
  if (s <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `scale(${s}) rotate(${gira}deg)`, background: cor, border: "8px solid #1b1530", borderRadius: 26, padding: "14px 34px", fontFamily: "Poppins", fontWeight: 900, fontSize: tam, color: "#1b1530", boxShadow: "0 12px 0 rgba(0,0,0,.25)", whiteSpace: "nowrap" }}>{txt}</div>
    </div>
  );
};

// Balão de fala (px reais).
export const Balao: React.FC<{ t0: number; x: number; y: number; txt: string; tam?: number; letra?: number }> = ({ t0, x, y, txt, tam = 44, letra }) => {
  const { t, fps } = useT();
  const s = mola(t, t0, fps, 12, 200);
  if (s <= 0) return null;
  const n = letra ? Math.min(txt.length, Math.floor((t - t0) / letra)) : txt.length;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-100%) scale(${s})`, transformOrigin: "bottom center" }}>
      <div style={{ position: "relative", background: "#fff", border: "7px solid #1b1530", borderRadius: 30, padding: "18px 28px", fontFamily: "Poppins", fontWeight: 900, fontSize: tam, color: "#1b1530", whiteSpace: "nowrap" }}>
        {txt.slice(0, n)}<span style={{ opacity: 0 }}>{txt.slice(n)}</span>
        <div style={{ position: "absolute", left: "50%", bottom: -30, width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderTop: "30px solid #1b1530", transform: "translateX(-50%)" }} />
      </div>
    </div>
  );
};

// Número que sobe (ex.: "+100 HP").
export const Sobe: React.FC<{ t0: number; x: number; y: number; txt: string; cor?: string; tam?: number }> = ({ t0, x, y, txt, cor = COR.verde, tam = 90 }) => {
  const { t } = useT();
  if (t < t0) return null;
  const u = rampa(t, t0, t0 + 1.1);
  return <div style={{ position: "absolute", left: x, top: y - u * 140, transform: "translate(-50%,-50%)", opacity: 1 - rampa(t, t0 + 1.4, t0 + 2), fontFamily: "Poppins", fontWeight: 900, fontSize: tam, color: cor, WebkitTextStroke: "8px #1b1530", paintOrder: "stroke fill", whiteSpace: "nowrap" }}>{txt}</div>;
};
