import { Composition } from "remotion";
import { Shorts } from "./Shorts";
import { TIMELINE_VAZIA, type Timeline } from "./tipos";
import { VIDEOS } from "./videos";

const metadados = ({ props }: { props: Timeline }) => ({
  fps: props.fps,
  width: props.largura,
  height: props.altura,
  durationInFrames: Math.max(1, Math.round(props.duracao * props.fps)),
});

// Tamanho, fps e duração saem da própria timeline: o vídeo dura exatamente o
// que a narração dura.
export const Root: React.FC = () => (
  <>
  <Composition
    id="Shorts"
    component={Shorts}
    defaultProps={TIMELINE_VAZIA}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={90}
    calculateMetadata={metadados}
  />
  {VIDEOS.map((v) => (
    <Composition
      key={v.id}
      id={v.id}
      component={v.componente}
      defaultProps={v.timeline}
      width={v.timeline.largura}
      height={v.timeline.altura}
      fps={v.timeline.fps}
      durationInFrames={Math.max(1, Math.round(v.timeline.duracao * v.timeline.fps))}
    />
  ))}
  </>
);
