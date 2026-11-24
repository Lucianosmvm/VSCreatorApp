import { Composition } from "remotion";
import { Shorts } from "./Shorts";
import { TIMELINE_VAZIA, type Timeline } from "./tipos";
import { VIDEOS } from "./videos";
import { PIXELANDIA } from "./pixelandia/registro";
import { PixelandiaVideo } from "./pixelandia/Pixelandia";
import { ImaginaSoMae3D, MAE_3D_DUR } from "./imaginaso/MaeRpg3D";
import { ImaginaSoDona3D, DONA_3D_DUR } from "./imaginaso/MaeDona3D";
import { ImaginaSoPai3D, PAI_3D_DUR } from "./imaginaso/PaiRobux3D";
import { ImaginaSoVelocidade3D, VEL_3D_DUR } from "./imaginaso/Velocidade3D";
import { ImaginaSoAvo3D, AVO_3D_DUR } from "./imaginaso/Avo3D";

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
  <Composition id="imagina-so-01-3d" component={ImaginaSoMae3D} width={1080} height={1920} fps={30}
    durationInFrames={Math.round(MAE_3D_DUR * 30)} />
  <Composition id="imagina-so-02-3d" component={ImaginaSoDona3D} width={1080} height={1920} fps={30}
    durationInFrames={Math.round(DONA_3D_DUR * 30)} />
  <Composition id="imagina-so-03-3d" component={ImaginaSoPai3D} width={1080} height={1920} fps={30}
    durationInFrames={Math.round(PAI_3D_DUR * 30)} />
  <Composition id="imagina-so-04-3d" component={ImaginaSoVelocidade3D} width={1080} height={1920} fps={30}
    durationInFrames={Math.round(VEL_3D_DUR * 30)} />
  <Composition id="imagina-so-05-3d" component={ImaginaSoAvo3D} width={1080} height={1920} fps={30}
    durationInFrames={Math.round(AVO_3D_DUR * 30)} />
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
  {/* Estilo "Mundo Pixelândia" (ferramentas/pixelandia/filmar.mjs) */}
  {PIXELANDIA.map((d) => (
    <Composition
      key={d.id}
      id={d.id}
      component={PixelandiaVideo}
      defaultProps={d}
      width={d.largura}
      height={d.altura}
      fps={d.fps}
      durationInFrames={Math.max(1, Math.round(d.duracao * d.fps))}
    />
  ))}
  </>
);
