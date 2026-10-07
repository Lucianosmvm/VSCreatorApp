import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Cena } from "../tipos";

// Imagem parada ganha Ken Burns: zoom lento e um pouco de deriva. A direção
// alterna por cena para o vídeo não parecer um zoom só repetido.
export const Fundo: React.FC<{ cena: Cena; indice: number; duracaoQuadros: number }> = ({ cena, indice, duracaoQuadros }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (cena.video) {
    return (
      <AbsoluteFill style={{ backgroundColor: "black" }}>
        <OffthreadVideo src={staticFile(cena.video)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    );
  }
  if (!cena.imagem) return <AbsoluteFill style={{ backgroundColor: "#111" }} />;

  const p = interpolate(frame, [0, Math.max(1, duracaoQuadros)], [0, 1], { extrapolateRight: "clamp" });
  const entrando = indice % 2 === 0;
  const escala = entrando ? 1.04 + 0.12 * p : 1.16 - 0.12 * p;
  const deriva = (indice % 3 - 1) * 30 * p;
  // tranco de entrada curtinho: dá vida ao corte sem roubar a atenção da fala
  const pulso = interpolate(frame, [0, 0.25 * fps], [1.04, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <Img
        src={staticFile(cena.imagem)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${escala * pulso}) translateX(${deriva}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
