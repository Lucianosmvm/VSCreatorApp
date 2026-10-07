import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Frase grande da cena (campo "titulo" do roteiro). Entra palavra por palavra
// logo no começo da cena, no alto, longe da legenda e do mascote.
export const Titulo: React.FC<{ texto: string; indice: number }> = ({ texto, indice }) => {
  const frame = useCurrentFrame();
  // tamanhos pelo lado menor: vale igual para 9:16 e 16:9
  const { fps, width: largura, height } = useVideoConfig();
  const width = Math.min(largura, height);
  const palavras = texto.split(/\s+/).filter(Boolean);
  const tamanho = width * (texto.length > 22 ? 0.085 : 0.11);

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          marginTop: height > largura ? "16%" : "4%",
          width: "86%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: indice % 2 ? "flex-start" : "flex-end",
          gap: `0 ${tamanho * 0.25}px`,
          fontFamily: "Poppins",
          fontWeight: 900,
          fontSize: tamanho,
          lineHeight: 1.05,
          textTransform: "uppercase",
          textAlign: indice % 2 ? "left" : "right",
        }}
      >
        {palavras.map((w, i) => {
          const s = spring({ frame: frame - 4 - i * 4, fps, config: { damping: 12, stiffness: 180 } });
          const destaque = i === palavras.length - 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) rotate(${interpolate(s, [0, 1], [-6, 0])}deg)`,
                color: destaque ? "#1a1a1a" : "#f2ead8",
                background: destaque ? "#d8c3a0" : undefined,
                padding: destaque ? "0 .18em" : undefined,
                borderRadius: destaque ? tamanho * 0.12 : undefined,
                textShadow: destaque ? undefined : "0 6px 0 rgba(0,0,0,.45)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
