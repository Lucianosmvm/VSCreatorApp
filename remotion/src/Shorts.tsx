import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { Fundo } from "./cenas/Fundo";
import { Legenda } from "./cenas/Legenda";
import { Destaque, acharDestaque } from "./cenas/Destaque";
import { FundoAnimado } from "./cenas/FundoAnimado";
import { Mascote, poseDaCena } from "./cenas/Mascote";
import { Titulo } from "./cenas/Titulo";
import type { Cena, Timeline } from "./tipos";

loadFont("normal", { weights: ["800", "900"], subsets: ["latin", "latin-ext"] });

const q = (s: number, fps: number) => Math.round(s * fps);

// Cena feita sob medida para um vídeo (gráfico, comparação, lista...). Recebe
// a cena com os tempos das palavras; o quadro 0 é o início da fala da cena.
export type CenaEspecial = React.FC<{ cena: Cena; indice: number }>;

// A cena que entra começa `janela` segundos antes do corte e aparece por
// cima da que sai — o mesmo dissolve que o app desenha, dentro da pausa.
const CenaVisual: React.FC<{ cena: Cena; indice: number; fps: number; fadeQuadros: number; duracaoQuadros: number; legenda: Timeline["legenda"]; atraso: number; especial?: CenaEspecial; pasta: string }> = ({
  cena, indice, fps, fadeQuadros, duracaoQuadros, legenda, atraso, especial: Especial, pasta,
}) => {
  const frame = useCurrentFrame();
  const opacidade = fadeQuadros > 0 ? interpolate(frame, [0, fadeQuadros], [0, 1], { extrapolateRight: "clamp" }) : 1;
  const usaDestaque = cena.template !== "imagem";
  // sem imagem nem clipe = modo mascote: fundo desenhado aqui + personagem
  const semMidia = !cena.imagem && !cena.video;
  const temNumero = usaDestaque && !!acharDestaque(cena.palavras);
  const ultima = cena.palavras[cena.palavras.length - 1];
  const fimFala = ultima ? ultima.t + 0.4 : cena.dur;
  if (Especial) {
    return (
      <AbsoluteFill style={{ opacity: opacidade }}>
        <Sequence from={atraso} layout="none">
          <Especial cena={cena} indice={indice} />
          <Legenda palavras={cena.palavras} legenda={legenda} />
        </Sequence>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: opacidade }}>
      {semMidia ? <FundoAnimado indice={indice} /> : <Fundo cena={cena} indice={indice} duracaoQuadros={duracaoQuadros} pasta={pasta} />}
      {/* tempos das palavras são relativos ao início da cena; a sequência visual
          pode ter começado `atraso` quadros antes por causa do dissolve */}
      <Sequence from={atraso} layout="none">
        {semMidia && cena.titulo && !temNumero && <Titulo texto={cena.titulo} indice={indice} />}
        {semMidia && <Mascote pose={cena.placa ? "placa" : poseDaCena(cena.mascote, cena.palavras, indice)} palavras={cena.palavras} indice={indice} fimFala={fimFala} placa={cena.placa} />}
        {usaDestaque && <Destaque palavras={cena.palavras} />}
        <Legenda palavras={cena.palavras} legenda={legenda} />
      </Sequence>
    </AbsoluteFill>
  );
};

// `pasta`: prefixo dos arquivos em public/ ("videos/<id-do-projeto>/" para os
// vídeos montados pelo Claude; vazio no render direto do app, que usa a pasta
// do job como public). `especiais`: índice da cena -> componente sob medida.
export type VideoProps = Timeline & { pasta?: string; especiais?: Record<number, CenaEspecial> };

export const Video: React.FC<VideoProps> = (tl) => {
  const { fps, cenas, legenda, pasta = "", especiais = {} } = tl;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {cenas.map((c, i) => {
        const anterior = cenas[i - 1];
        const fade = anterior ? q(anterior.janela, fps) : 0;
        const de = q(c.inicio, fps) - fade;
        const dur = q(c.dur, fps) + fade;
        return (
          <Sequence key={`v${i}`} from={de} durationInFrames={dur}>
            <CenaVisual cena={c} indice={i} fps={fps} fadeQuadros={fade} duracaoQuadros={dur} legenda={legenda} atraso={fade} especial={especiais[i]} pasta={pasta} />
          </Sequence>
        );
      })}
      {cenas.map((c, i) =>
        c.audio ? (
          <Sequence key={`a${i}`} from={q(c.inicio, fps)} layout="none">
            <Audio src={staticFile(pasta + c.audio)} />
          </Sequence>
        ) : null,
      )}
    </AbsoluteFill>
  );
};

export const Shorts: React.FC<Timeline> = (tl) => <Video {...tl} />;
