import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";

// Fundo sem imagem de IA, nas cores do mascote: verde-oliva, preto e areia.
// Grade que desliza, símbolos de código flutuando e uma mancha de pincel —
// a mesma linguagem da folha de personagem.
const PALETAS = [
  { a: "#1d2416", b: "#0c0f09", tinta: "#4b5a35", luz: "#d8c3a0" },
  { a: "#2a2f22", b: "#101208", tinta: "#5d6e42", luz: "#e8d9bb" },
  { a: "#16191c", b: "#08090a", tinta: "#4b5a35", luz: "#c9b48c" },
];
const SIMBOLOS = ["{ }", "</>", "( )", "=>", "#", ";", "[ ]", "&&"];

export const FundoAnimado: React.FC<{ indice: number }> = ({ indice }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const p = PALETAS[indice % PALETAS.length];
  const passo = Math.min(width, height) / 9;
  const desliza = (frame * 0.6) % passo;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 35%, ${p.a}, ${p.b})`, overflow: "hidden" }}>
      {/* grade */}
      <AbsoluteFill
        style={{
          opacity: 0.18,
          backgroundImage: `linear-gradient(${p.tinta} 2px, transparent 2px), linear-gradient(90deg, ${p.tinta} 2px, transparent 2px)`,
          backgroundSize: `${passo}px ${passo}px`,
          backgroundPosition: `${desliza}px ${desliza}px`,
        }}
      />
      {/* mancha de pincel atrás do personagem */}
      <div
        style={{
          position: "absolute",
          left: "-10%",
          top: "38%",
          width: "120%",
          height: "34%",
          background: p.tinta,
          opacity: 0.55,
          transform: `rotate(${-8 + (indice % 2) * 14}deg) scaleX(${interpolate(frame, [0, 0.5 * fps], [0, 1], { extrapolateRight: "clamp" })})`,
          transformOrigin: indice % 2 ? "right center" : "left center",
          clipPath: "polygon(0 18%, 6% 0, 30% 10%, 55% 2%, 80% 12%, 100% 0, 97% 70%, 100% 100%, 72% 88%, 45% 100%, 20% 86%, 3% 100%)",
        }}
      />
      {/* símbolos de código */}
      {Array.from({ length: 10 }).map((_, i) => {
        const semente = `s${indice}-${i}`;
        const x = random(semente + "x") * width;
        const y0 = random(semente + "y") * height;
        const vel = 0.4 + random(semente + "v") * 0.9;
        const y = ((y0 - frame * vel) % height + height) % height;
        const tam = Math.min(width, height) * (0.04 + random(semente + "t") * 0.05);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: tam,
              color: p.luz,
              opacity: 0.08 + random(semente + "o") * 0.12,
              transform: `rotate(${(random(semente + "r") - 0.5) * 30}deg)`,
            }}
          >
            {SIMBOLOS[i % SIMBOLOS.length]}
          </div>
        );
      })}
      {/* vinheta */}
      <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 50%, transparent 55%, rgba(0,0,0,.6))" }} />
    </AbsoluteFill>
  );
};
