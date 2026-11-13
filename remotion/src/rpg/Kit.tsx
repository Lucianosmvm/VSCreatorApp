// Kit "RPG Code": série em pixel art 16-bit (9:16). Isolado do resto do app:
// nada aqui é usado pelos vídeos no estilo atual, e nada de lá é alterado.
// A tela do jogo é desenhada numa grade de baixa resolução (1 px = 8 px reais).
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as fontePixel } from "@remotion/google-fonts/PressStart2P";
import { loadFont as fonteCodigo } from "@remotion/google-fonts/VT323";

const { fontFamily: PIXEL } = fontePixel("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const { fontFamily: MONO } = fonteCodigo("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
export { PIXEL, MONO };

export const RPG = {
  fundo: "#160d26", roxo: "#2a1b4a", roxo2: "#3b2766", borda: "#8b5cf6", borda2: "#5b3aa8",
  amarelo: "#ffd23f", branco: "#f5f1ff", verde: "#7cff4f", vermelho: "#ff4d5e", azul: "#6ab8ff",
  laranja: "#ff9f43", cinza: "#8a84a3",
};

export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: f / fps, f, fps };
};
const rampa = (t: number, a: number, b: number, de = 0, ate = 1) =>
  interpolate(t, [a, b], [de, ate], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ── sprites ──────────────────────────────────────────────────────────────
type Paleta = Record<string, string>;
export const Sprite: React.FC<{ mapa: string[]; cores: Paleta; x: number; y: number; flip?: boolean }> = ({ mapa, cores, x, y, flip }) => {
  const w = mapa[0].length;
  return (
    <g transform={`translate(${x} ${y})${flip ? ` translate(${w} 0) scale(-1 1)` : ""}`}>
      {mapa.flatMap((linha, j) => [...linha].map((ch, i) => (cores[ch] ? <rect key={`${i}-${j}`} x={i} y={j} width={1.02} height={1.02} fill={cores[ch]} /> : null)))}
    </g>
  );
};

const HEROI = [
  "....kkkk....",
  "...khhhhk...",
  "..khhhhhhk..",
  "..khssshhk..",
  "..ksesseak..",
  "..kssssssk..",
  "...kssssk...",
  "..rkbbbbkr..",
  ".rrkbgbbkrr.",
  ".rrkbbbbkrr.",
  ".rrskbbksrr.",
  "..rkbbbbkr..",
  "...kppppk...",
  "...kp..pk...",
  "...kk..kk...",
];
const CHAPEU = ["....kk......", "...kmmk.....", "..kmmmmk....", ".kmmmmmmk...", "kkkkkkkkkk.."];
export type Classe = "guerreiro" | "mago" | "arqueiro" | "misterio";
const CORES_CLASSE: Record<Classe, Paleta> = {
  guerreiro: { k: "#1b1020", h: "#7a4a24", s: "#f2c29a", e: "#1b1020", a: "#1b1020", r: "#d23a3a", b: "#3a5ad8", g: "#e8b830", p: "#2a2a48" },
  mago: { k: "#1b1020", h: "#d9d9e8", s: "#f2c29a", e: "#1b1020", a: "#1b1020", r: "#3b2766", b: "#7b4bd6", g: "#ffd23f", p: "#2a1b4a", m: "#5b3aa8" },
  arqueiro: { k: "#1b1020", h: "#e0a040", s: "#f2c29a", e: "#1b1020", a: "#1b1020", r: "#2f6b34", b: "#4caf50", g: "#8b5a2b", p: "#3a2a18" },
  misterio: { k: "#2a2240", h: "#2a2240", s: "#2a2240", e: "#8b5cf6", a: "#8b5cf6", r: "#2a2240", b: "#2a2240", g: "#2a2240", p: "#2a2240" },
};
export const Heroi: React.FC<{ x: number; y: number; classe?: Classe; flip?: boolean; pulo?: number }> = ({ x, y, classe = "guerreiro", flip, pulo = 0 }) => {
  const { f } = useT();
  const resp = Math.round(Math.sin(f * 0.18 + x) * 0.6);
  return (
    <g>
      <Sprite mapa={HEROI} cores={CORES_CLASSE[classe]} x={x} y={y + resp - pulo} flip={flip} />
      {classe === "mago" && <Sprite mapa={CHAPEU} cores={CORES_CLASSE.mago} x={x + 1} y={y - 4 + resp - pulo} />}
      {classe === "guerreiro" && <rect x={x + 11} y={y + 5 + resp - pulo} width={1} height={7} fill="#dfe6ee" />}
      {classe === "arqueiro" && <path d={`M${x + 11} ${y + 4 + resp - pulo}q3 4 0 8`} stroke="#8b5a2b" strokeWidth={0.8} fill="none" />}
    </g>
  );
};

const SLIME = [
  "....kkkk....",
  "..kkbbbbkk..",
  ".kbbwwbbbbk.",
  "kbbwbbbbbbbk",
  "kbbbebbebbbk",
  "kbbbbbbbbbbk",
  "kbbbbbbbbbbk",
  ".kkkkkkkkkk.",
];
export const Slime: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const { f } = useT();
  const pula = Math.abs(Math.round(Math.sin(f * 0.15) * 1.4));
  return <Sprite mapa={SLIME} cores={{ k: "#10204a", b: "#3a8cff", w: "#bfe6ff", e: "#10204a" }} x={x} y={y - pula} />;
};

// ── cenário 16-bit (coordenadas da grade: 135 x 95) ───────────────────────
export const GW = 135, GH = 95;
export const Cenario: React.FC<{ noite?: boolean }> = ({ noite }) => {
  const { f } = useT();
  const ceu = noite ? ["#1b1446", "#2a1f5e", "#3b2b72", "#4d3a86"] : ["#4aa8ff", "#66b8ff", "#86c8ff", "#a8dcff"];
  const nuvem = (cx: number, cy: number) => (
    <g fill={noite ? "#5b4a9a" : "#ffffff"} opacity={noite ? 0.6 : 0.95}>
      <rect x={cx} y={cy} width={14} height={3} /><rect x={cx + 3} y={cy - 2} width={8} height={2} /><rect x={cx + 5} y={cy - 3} width={4} height={1} />
    </g>
  );
  const desliza = (f * 0.03) % (GW + 30);
  return (
    <g>
      {ceu.map((c, i) => <rect key={c} x={0} y={i * 10} width={GW} height={10} fill={c} />)}
      <rect x={0} y={40} width={GW} height={20} fill={ceu[3]} />
      {noite ? <g fill="#fff8c8"><rect x={120} y={30} width={8} height={8} /><rect x={119} y={31} width={10} height={6} /></g> : <g fill="#ffe36b"><rect x={120} y={30} width={9} height={9} /><rect x={119} y={31} width={11} height={7} /></g>}
      {nuvem(((10 + desliza) % (GW + 30)) - 20, 14)}
      {nuvem(((70 + desliza * 0.7) % (GW + 30)) - 20, 24)}
      {/* montanhas */}
      <path d="M0 58 L18 38 L30 50 L46 30 L64 52 L80 36 L98 54 L114 34 L135 56 V70 H0Z" fill={noite ? "#2b2560" : "#6f8fd6"} />
      <path d="M0 64 L14 52 L30 60 L50 46 L70 62 L92 50 L112 62 L135 52 V72 H0Z" fill={noite ? "#1f3a4a" : "#4f9a6a"} />
      {/* castelo */}
      <g fill={noite ? "#3a3256" : "#9a8fb8"}>
        <rect x={52} y={38} width={30} height={26} />
        <rect x={46} y={30} width={8} height={34} /><rect x={80} y={30} width={8} height={34} />
        {[46, 50, 80, 84, 54, 60, 66, 72].map((x) => <rect key={x} x={x} y={x < 54 || x > 78 ? 28 : 36} width={2} height={2} />)}
        <rect x={63} y={24} width={8} height={14} /><rect x={65} y={20} width={4} height={4} fill={RPG.vermelho} />
      </g>
      <rect x={64} y={54} width={6} height={10} fill="#2a1f3a" />
      {[[49, 36], [83, 36], [66, 30]].map(([x, y]) => <rect key={x} x={x} y={y} width={2} height={3} fill={noite ? "#ffd23f" : "#3a3256"} />)}
      {/* grama em blocos */}
      <rect x={0} y={64} width={GW} height={31} fill={noite ? "#1d4a2a" : "#3fa34d"} />
      {Array.from({ length: 34 }, (_, i) => <rect key={i} x={(i * 7) % GW} y={66 + ((i * 5) % 26)} width={2} height={1} fill={noite ? "#2a6a3a" : "#5cc366"} />)}
      <path d="M58 64 h18 l8 31 h-34z" fill={noite ? "#5a4a3a" : "#c9a46a"} />
      {/* árvores */}
      {[8, 22, 112, 124].map((x, i) => (
        <g key={x}>
          <rect x={x + 3} y={68 + (i % 2) * 6} width={2} height={6} fill="#5a3a1a" />
          <rect x={x} y={60 + (i % 2) * 6} width={8} height={8} fill={noite ? "#16402a" : "#2f7a3a"} />
          <rect x={x + 1} y={58 + (i % 2) * 6} width={6} height={2} fill={noite ? "#16402a" : "#2f7a3a"} />
        </g>
      ))}
    </g>
  );
};

// Tela do jogo: moldura roxa + SVG em grade, posicionada em px reais.
export const Tela: React.FC<{ y?: number; children: React.ReactNode; treme?: number }> = ({ y = 250, children, treme = 0 }) => {
  const { width } = useVideoConfig();
  const esc = (width - 40) / GW;
  return (
    <div style={{ position: "absolute", left: 20 + treme, top: y, width: width - 40, height: GH * esc, border: `6px solid ${RPG.borda}`, borderRadius: 18, overflow: "hidden", boxShadow: `0 0 0 6px ${RPG.roxo}, 0 20px 50px rgba(0,0,0,.6)` }}>
      <svg viewBox={`0 0 ${GW} ${GH}`} width="100%" height="100%" shapeRendering="crispEdges" style={{ display: "block" }}>{children}</svg>
    </div>
  );
};

// Caixa de diálogo / menu no estilo SNES (coordenadas da grade).
export const Caixa: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode }> = ({ x, y, w, h, children }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#1b1446" />
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#f5f1ff" strokeWidth={1} />
    <rect x={x + 1.5} y={y + 1.5} width={w - 3} height={h - 3} fill="none" stroke="#6b5bd6" strokeWidth={0.6} />
    {children}
  </g>
);
export const TextoPixel: React.FC<{ x: number; y: number; txt: string; tam?: number; cor?: string; meio?: boolean }> = ({ x, y, txt, tam = 5, cor = RPG.branco, meio }) => (
  <text x={x} y={y} fontFamily={PIXEL} fontSize={tam} fill={cor} textAnchor={meio ? "middle" : "start"} style={{ textRendering: "geometricPrecision" }}>{txt}</text>
);

// ── faixa do topo ────────────────────────────────────────────────────────
export const Faixa: React.FC<{ ep: string; acao: string; destaque: string }> = ({ ep, acao, destaque }) => {
  const { f, fps } = useT();
  const s = spring({ frame: f, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, transform: `translateY(${(1 - s) * -40}px)`, opacity: s }}>
      <div style={{ fontFamily: PIXEL, fontSize: 34, color: RPG.branco, background: RPG.roxo, border: `5px solid ${RPG.borda}`, borderRadius: 14, padding: "14px 26px" }}>🎮 RPG CODE · {ep}</div>
      <div style={{ fontFamily: PIXEL, fontSize: 44, color: RPG.branco, background: RPG.roxo2, border: `5px solid ${RPG.borda}`, borderRadius: 14, padding: "18px 28px", letterSpacing: 1 }}>
        {acao} <span style={{ color: RPG.amarelo }}>{destaque}</span>
      </div>
    </div>
  );
};

// ── painel de código ─────────────────────────────────────────────────────
export type LinhaRpg = { txt: string; t?: number; marca?: number; ate?: number; apaga?: number; cor?: string };
const CHAVES = new Set(["switch", "case", "break", "default", "int", "void", "public", "private", "class", "if", "else", "return", "new", "string", "bool", "true", "false", "enum", "var"]);
const TIPOS = new Set(["SceneManager", "Application", "Debug", "MonoBehaviour", "GameObject", "Input", "Vector2", "Vector3", "Time", "Random", "TMP_InputField", "TMP_Text", "Keyboard"]);
const pinta = (txt: string) =>
  (txt.match(/"[^"]*"|\/\/.*$|\d+|[A-Za-z_]\w*|\s+|./g) ?? []).map((s, i, arr) => {
    const c = s.startsWith('"') ? RPG.laranja : s.startsWith("//") ? RPG.cinza : /^\d/.test(s) ? RPG.verde
      : CHAVES.has(s) ? "#c792ff" : TIPOS.has(s) ? "#4ec9b0" : /^[A-Z]/.test(s) && arr[i + 1] === "(" ? RPG.amarelo : RPG.branco;
    return { s, c };
  });

export const Painel: React.FC<{ titulo: string; linhas: LinhaRpg[]; y?: number; altura?: number; extra?: React.ReactNode }> = ({ titulo, linhas, y = 1040, altura = 640, extra }) => {
  const { t, f, fps } = useT();
  const s = spring({ frame: f, fps, config: { damping: 15, stiffness: 120 } });
  const alturaLinha = Math.min(46, (altura - 120) / Math.max(linhas.length, 8));
  const maior = Math.max(16, ...linhas.map((l) => l.txt.length));
  const tam = Math.min(alturaLinha * 1.12, 930 / (maior * 0.5));
  return (
    <div style={{ position: "absolute", left: 20, right: 20, top: y, height: altura, background: "#120b20", border: `6px solid ${RPG.borda}`, borderRadius: 22, boxShadow: `0 0 0 6px ${RPG.roxo}`, transform: `translateY(${(1 - s) * 60}px)`, opacity: s, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: RPG.roxo, padding: "16px 24px", borderBottom: `4px solid ${RPG.borda2}` }}>
        <span style={{ fontFamily: PIXEL, fontSize: 26, color: RPG.branco, background: "#7b4bd6", borderRadius: 10, padding: "10px 14px" }}>C#</span>
        <span style={{ fontFamily: PIXEL, fontSize: 24, color: RPG.branco }}>{titulo}</span>
      </div>
      <div style={{ padding: "18px 10px 0 0" }}>
        {linhas.map((l, i) => {
          const aparece = l.t === undefined ? 1 : rampa(t, l.t, l.t + 0.25);
          const marcada = l.marca !== undefined && t >= l.marca && (l.ate === undefined || t < l.ate);
          const apagada = l.apaga !== undefined && t >= l.apaga;
          const cursor = l.t !== undefined && t >= l.t && t < l.t + 0.5 && Math.floor(f / 6) % 2 === 0;
          return (
            <div key={i} style={{ display: "flex", height: alturaLinha, alignItems: "center", opacity: aparece * (apagada ? 0.28 : 1), background: marcada ? "rgba(255,210,63,.18)" : "transparent", borderLeft: marcada ? `8px solid ${RPG.amarelo}` : "8px solid transparent" }}>
              <span style={{ width: 70, textAlign: "right", paddingRight: 22, fontFamily: MONO, fontSize: tam * 0.86, color: "#5b5478" }}>{i + 1}</span>
              <span style={{ fontFamily: MONO, fontSize: tam, whiteSpace: "pre", color: l.cor }}>
                {l.cor ? l.txt : pinta(l.txt).map((p, k) => <span key={k} style={{ color: p.c }}>{p.s}</span>)}
                {cursor && <span style={{ color: RPG.amarelo }}>█</span>}
              </span>
            </div>
          );
        })}
      </div>
      {extra}
    </div>
  );
};

// Etiqueta que salta (ex.: "opcao = 1") em px reais.
export const Etiqueta: React.FC<{ t: number; x: number; y: number; txt: string; cor?: string; tam?: number }> = ({ t: t0, x, y, txt, cor = RPG.amarelo, tam = 34 }) => {
  const { t, fps } = useT();
  if (t < t0) return null;
  const s = spring({ frame: Math.round((t - t0) * fps), fps, config: { damping: 10, stiffness: 180 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, fontFamily: PIXEL, fontSize: tam, color: "#1b1020", background: cor, border: "5px solid #1b1020", borderRadius: 12, padding: "14px 18px", whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,.4)" }}>{txt}</div>
  );
};

export const Fundo: React.FC = () => {
  const { f } = useT();
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% ${30 + Math.sin(f * 0.02) * 4}%, #2c1a52 0%, ${RPG.fundo} 70%)` }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,.07) 2px, transparent 2px), linear-gradient(90deg, rgba(139,92,246,.07) 2px, transparent 2px)", backgroundSize: "40px 40px" }} />
    </div>
  );
};

export { rampa };

// Ficha de status de um objeto (px reais): título + linhas campo/valor.
export const Ficha: React.FC<{ t: number; x: number; y: number; titulo: string; campos: { k: string; v: string; t?: number }[]; cor?: string; largura?: number }> = ({ t: t0, x, y, titulo, campos, cor = RPG.amarelo, largura = 460 }) => {
  const { t, fps } = useT();
  if (t < t0) return null;
  const s = spring({ frame: Math.round((t - t0) * fps), fps, config: { damping: 12, stiffness: 170 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: largura, transform: `translate(-50%,0) scale(${s})`, background: "#1b1446", border: `5px solid ${cor}`, borderRadius: 16, boxShadow: "0 12px 0 rgba(0,0,0,.45)", overflow: "hidden" }}>
      <div style={{ fontFamily: PIXEL, fontSize: 24, color: "#1b1020", background: cor, padding: "12px 16px" }}>{titulo}</div>
      {campos.map((c) => (
        <div key={c.k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 18px", fontFamily: MONO, fontSize: 44, color: RPG.branco, opacity: c.t === undefined || t >= c.t ? 1 : 0 }}>
          <span style={{ color: RPG.cinza }}>{c.k}</span><span style={{ color: /^\d/.test(c.v) ? RPG.verde : RPG.laranja }}>{c.v}</span>
        </div>
      ))}
    </div>
  );
};
