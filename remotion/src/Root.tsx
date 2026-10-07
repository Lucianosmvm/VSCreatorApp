import { Composition } from "remotion";
import { Shorts } from "./Shorts";
import { TIMELINE_VAZIA, type Timeline } from "./tipos";

// Tamanho, fps e duração saem da própria timeline: o vídeo dura exatamente o
// que a narração dura.
export const Root: React.FC = () => (
  <Composition
    id="Shorts"
    component={Shorts}
    defaultProps={TIMELINE_VAZIA}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={90}
    calculateMetadata={({ props }: { props: Timeline }) => ({
      fps: props.fps,
      width: props.largura,
      height: props.altura,
      durationInFrames: Math.max(1, Math.round(props.duracao * props.fps)),
    })}
  />
);
