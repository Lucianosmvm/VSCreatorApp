// Estilo "Mundo Pixelândia": cenas filmadas do jogo + legendas de impacto
// (frase branca com contorno e faixa amarela), clima por cena, sem narração.
import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PixelifySans";
import type { CenaPixelandia, DadosPixelandia } from "./tipos";

const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] });

const TINTA = "#1a1206";
const AMARELO = "#ffd23f";
const VERMELHO = "#ff5a3c";

const maiusculas = (t: string) =>
  t.split(/\s+/).map((w) => (w.startsWith("@") ? w : w.toLocaleUpperCase("pt-BR"))).join(" ");

// Contorno grosso em volta do texto (funciona com qualquer fonte).
const contorno = (r: number, cor: string) =>
  Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `${(Math.cos(a) * r).toFixed(1)}px ${(Math.sin(a) * r).toFixed(1)}px 0 ${cor}`;
  }).join(",") + `,0 ${r + 4}px ${r + 6}px rgba(0,0,0,.45)`;

const Legenda: React.FC<{ texto: string; cta: boolean; somPop: boolean }> = ({ texto, cta, somPop }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const [cima, ...resto] = texto.split("\n");
  const faixa = resto.join(" ");
  const k = width / 1080;
  const p1 = spring({ frame, fps, config: { damping: 9, stiffness: 190, mass: 0.6 } });
  const p2 = spring({ frame: frame - 4, fps, config: { damping: 8, stiffness: 200, mass: 0.6 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 165 * k, fontFamily }}>
      {somPop ? <Sequence from={4}><Audio src={staticFile("sfx/pop.wav")} volume={0.55} /></Sequence> : null}
      {cima ? (
        <div
          style={{
            color: "#fff",
            fontSize: 74 * k,
            lineHeight: 1.08,
            textAlign: "center",
            maxWidth: width * 0.9,
            textShadow: contorno(7 * k, TINTA),
            transform: `scale(${0.35 + 0.65 * p1})`,
            opacity: Math.min(1, frame / 3),
          }}
        >
          {maiusculas(cima)}
        </div>
      ) : null}
      {faixa ? (
        <div
          style={{
            marginTop: 14 * k,
            background: cta ? VERMELHO : AMARELO,
            color: cta ? "#fff" : TINTA,
            // faixa longa encolhe para caber numa linha só
            fontSize: Math.max(68, Math.min(84, (84 * 17) / Math.max(1, faixa.length))) * k,
            whiteSpace: faixa.length <= 22 ? "nowrap" : "normal",
            lineHeight: 1.15,
            padding: `${4 * k}px ${30 * k}px ${8 * k}px`,
            maxWidth: width * 0.9,
            textAlign: "center",
            border: `${7 * k}px solid ${TINTA}`,
            boxShadow: `0 ${10 * k}px ${22 * k}px rgba(0,0,0,.45)`,
            transform: `rotate(-1.4deg) scale(${Math.max(0, 0.3 + 0.7 * p2)})`,
            opacity: frame < 4 ? 0 : 1,
          }}
        >
          {maiusculas(faixa)}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Clima: React.FC<{ clima: CenaPixelandia["clima"] }> = ({ clima }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (!clima) return null;
  const entra = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  if (clima === "ameaca") {
    const pulso = 0.85 + 0.15 * Math.sin(frame / 5);
    return (
      <AbsoluteFill style={{ opacity: entra }}>
        <AbsoluteFill style={{ background: `rgba(255,40,0,${0.13 * pulso})` }} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(120,10,0,0) 35%, rgba(110,8,0,${0.7 * pulso}) 100%)` }} />
        {Array.from({ length: 40 }, (_, i) => {
          const vel = 4 + random("v" + i) * 6;
          const y = height - ((frame * vel + random("y" + i) * height) % (height + 40));
          return <div key={i} style={{ position: "absolute", left: random("x" + i) * width, top: y, width: 9, height: 9, borderRadius: 9, background: i % 3 ? "#ff6a1a" : AMARELO }} />;
        })}
      </AbsoluteFill>
    );
  }
  if (clima === "misterio") {
    return (
      <AbsoluteFill style={{ opacity: entra }}>
        <AbsoluteFill style={{ background: "rgba(10,20,60,.24)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(5,10,40,0) 30%, rgba(5,10,40,.78) 100%)" }} />
        {Array.from({ length: 18 }, (_, i) => {
          const brilho = 0.5 + 0.5 * Math.sin(frame / 4 + i * 1.7);
          const s = 8 + random("s" + i) * 8;
          return (
            <div key={i} style={{ position: "absolute", left: random("mx" + i) * width, top: random("my" + i) * height * 0.8 - frame * 0.4, opacity: brilho }}>
              <div style={{ position: "absolute", width: s / 3, height: s * 1.6, left: -s / 6, top: -s * 0.8, background: "#bfe3ff" }} />
              <div style={{ position: "absolute", width: s * 1.6, height: s / 3, left: -s * 0.8, top: -s / 6, background: "#bfe3ff" }} />
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  const cores = ["#ff5e5b", AMARELO, "#7cc04a", "#4fc3f7", "#c06cf0", "#ff9ad5"];
  return (
    <AbsoluteFill style={{ opacity: entra }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, rgba(255,220,120,.3) 0%, rgba(255,200,80,0) 70%)" }} />
      {Array.from({ length: 70 }, (_, i) => {
        const vel = 6 + random("cv" + i) * 7;
        const y = ((frame * vel + random("cy" + i) * height) % (height + 60)) - 30;
        const x = random("cx" + i) * width + Math.sin(frame / 9 + i) * 24;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 9, background: cores[i % cores.length], transform: `rotate(${frame * (4 + (i % 5)) + i * 40}deg)` }} />;
      })}
    </AbsoluteFill>
  );
};

// Seta amarela pulando sobre o morador que a câmera segue (centro da tela).
const Foco: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const k = width / 1080;
  const entra = spring({ frame: frame - 3, fps, config: { damping: 10, stiffness: 160 } });
  const pulo = Math.abs(Math.sin(frame / 5)) * 18 * k;
  return (
    <div style={{ position: "absolute", left: width / 2, top: height / 2 - 150 * k - pulo, transform: `translate(-50%,0) scale(${entra})` }}>
      <svg width={70 * k} height={62 * k} viewBox="0 0 70 62">
        <polygon points="6,6 64,6 35,56" fill={AMARELO} stroke={TINTA} strokeWidth="6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const Selo: React.FC<{ texto: string }> = ({ texto }) => {
  const { width, height } = useVideoConfig();
  const k = width / 1080;
  return (
    <div style={{ position: "absolute", left: 24 * k, top: height * 0.74, fontFamily, fontSize: 32 * k, color: AMARELO, background: "rgba(16,10,4,.72)", padding: `${8 * k}px ${22 * k}px`, borderRadius: 40 * k }}>
      {texto}
    </div>
  );
};

const Cena: React.FC<{ cena: CenaPixelandia; indice: number }> = ({ cena, indice }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = Math.round(cena.dur * fps);
  const seg = Math.floor(total / cena.linhas.length);
  // Corte com "soco": a cena entra levemente ampliada.
  const zoom = interpolate(frame, [0, 8], [1.07, 1], { extrapolateRight: "clamp" });
  const flash = indice === 0 ? interpolate(frame, [0, 6], [0.6, 0], { extrapolateRight: "clamp" }) : interpolate(frame, [0, 4], [0.25, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <OffthreadVideo src={staticFile(cena.video)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <Clima clima={cena.clima} />
      {cena.foco ? <Foco /> : null}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <Audio src={staticFile("sfx/whoosh.wav")} volume={cena.audio ? 0.25 : 0.45} />
      {cena.audio ? <Audio src={staticFile(cena.audio)} /> : null}
      {cena.linhas.map((l, i) => {
        // com narração, cada legenda entra quando a fala dela começa
        const ini = cena.tempos ? Math.round(cena.tempos[i] * fps) : i * seg;
        const fim = cena.tempos && i < cena.linhas.length - 1 ? Math.round(cena.tempos[i + 1] * fps) : i === cena.linhas.length - 1 ? total : (i + 1) * seg;
        return (
          <Sequence key={i} from={ini} durationInFrames={Math.max(1, fim - ini)}>
            <Legenda texto={l} cta={!!cena.cta && i === 0} somPop={!cena.audio} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const PixelandiaVideo: React.FC<DadosPixelandia> = (d) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {d.cenas.map((c, i) => (
        <Sequence key={i} from={Math.round(c.inicio * fps)} durationInFrames={Math.round(c.dur * fps)}>
          <Cena cena={c} indice={i} />
        </Sequence>
      ))}
      <Selo texto={`📺 #${d.episodio} · ${d.vila.toLocaleUpperCase("pt-BR")}`} />
    </AbsoluteFill>
  );
};
