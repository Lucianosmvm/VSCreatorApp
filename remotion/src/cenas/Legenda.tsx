import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Palavra, Timeline } from "../tipos";

const POR_GRUPO = 3;

// Legenda estilo karaokê: mostra um grupo de até 3 palavras por vez, e cada
// palavra "pula" no quadro exato em que é falada (tempo vindo da ElevenLabs).
export const Legenda: React.FC<{ palavras: Palavra[]; legenda: Timeline["legenda"] }> = ({ palavras, legenda }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  if (!palavras.length) return null;

  // última palavra já falada
  let atual = -1;
  while (atual + 1 < palavras.length && palavras[atual + 1].t <= t) atual++;
  if (atual < 0) return null;

  const g0 = Math.floor(atual / POR_GRUPO) * POR_GRUPO;
  const grupo = palavras.slice(g0, g0 + POR_GRUPO);
  const tamanho = Math.round(width * 0.085);
  const caixa = legenda.estilo === "box";

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: `${legenda.pos}%`,
          transform: "translateY(-50%)",
          width: "88%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `0 ${tamanho * 0.28}px`,
          fontFamily: "Poppins",
          fontWeight: 800,
          fontSize: tamanho,
          lineHeight: 1.15,
          textTransform: "uppercase",
        }}
      >
        {grupo.map((p, i) => {
          const idx = g0 + i;
          if (idx > atual) return null;
          const ini = Math.round(p.t * fps);
          const s = spring({ frame: frame - ini, fps, config: { damping: 12, stiffness: 220 } });
          const ativa = idx === atual;
          return (
            <span
              key={idx}
              style={{
                display: "inline-block",
                transform: `scale(${interpolate(s, [0, 1], [0.5, ativa ? 1.12 : 1])}) translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
                opacity: s,
                color: ativa ? "#FFD23F" : "white",
                WebkitTextStroke: caixa ? undefined : `${tamanho * 0.09}px black`,
                paintOrder: "stroke fill",
                background: caixa ? "rgba(0,0,0,.65)" : undefined,
                padding: caixa ? "0 .15em" : undefined,
                borderRadius: caixa ? 12 : undefined,
                textShadow: caixa ? undefined : "0 6px 18px rgba(0,0,0,.55)",
              }}
            >
              {p.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
