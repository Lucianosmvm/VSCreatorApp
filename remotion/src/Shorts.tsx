import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { Fundo } from "./cenas/Fundo";
import { Legenda } from "./cenas/Legenda";
import { Destaque } from "./cenas/Destaque";
import type { Cena, Timeline } from "./tipos";

loadFont("normal", { weights: ["800", "900"], subsets: ["latin", "latin-ext"] });

const q = (s: number, fps: number) => Math.round(s * fps);

// A cena que entra começa `janela` segundos antes do corte e aparece por
// cima da que sai — o mesmo dissolve que o app desenha, dentro da pausa.
const CenaVisual: React.FC<{ cena: Cena; indice: number; fps: number; fadeQuadros: number; duracaoQuadros: number; legenda: Timeline["legenda"]; atraso: number }> = ({
  cena, indice, fps, fadeQuadros, duracaoQuadros, legenda, atraso,
}) => {
  const frame = useCurrentFrame();
  const opacidade = fadeQuadros > 0 ? interpolate(frame, [0, fadeQuadros], [0, 1], { extrapolateRight: "clamp" }) : 1;
  const usaDestaque = cena.template !== "imagem";
  return (
    <AbsoluteFill style={{ opacity: opacidade }}>
      <Fundo cena={cena} indice={indice} duracaoQuadros={duracaoQuadros} />
      {/* tempos das palavras são relativos ao início da cena; a sequência visual
          pode ter começado `atraso` quadros antes por causa do dissolve */}
      <Sequence from={atraso} layout="none">
        {usaDestaque && <Destaque palavras={cena.palavras} />}
        <Legenda palavras={cena.palavras} legenda={legenda} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Shorts: React.FC<Timeline> = (tl) => {
  const { fps, cenas, legenda } = tl;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {cenas.map((c, i) => {
        const anterior = cenas[i - 1];
        const fade = anterior ? q(anterior.janela, fps) : 0;
        const de = q(c.inicio, fps) - fade;
        const dur = q(c.dur, fps) + fade;
        return (
          <Sequence key={`v${i}`} from={de} durationInFrames={dur}>
            <CenaVisual cena={c} indice={i} fps={fps} fadeQuadros={fade} duracaoQuadros={dur} legenda={legenda} atraso={fade} />
          </Sequence>
        );
      })}
      {cenas.map((c, i) =>
        c.audio ? (
          <Sequence key={`a${i}`} from={q(c.inicio, fps)} layout="none">
            <Audio src={staticFile(c.audio)} />
          </Sequence>
        ) : null,
      )}
    </AbsoluteFill>
  );
};
