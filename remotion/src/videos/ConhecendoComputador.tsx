import { Video } from "../Shorts";
import { recortarTimeline, type Timeline } from "../tipos";

// "Conhecendo o computador" — 47 cenas, 16:9. Vídeo só explicativo (sem
// código/fichas/gráfico): todas as cenas usam o padrão fundo + mascote +
// título/número, já que `mascote`/`titulo`/`placa` vêm prontos no timeline.

export const ConhecendoComputador: React.FC<Timeline> = (tl) => (
  <Video {...tl} pasta="videos/conhecendo-o-computador-mvtty7ty/" />
);

// ── Short (9:16, ~1:05) tirado do vídeo longo ─────────────────────────────
// Mesma narração; só as cenas abaixo, nesta ordem: gancho, visão geral,
// hardware, software, sistema operacional, exemplo do celular, recap e CTA.
const CENAS_SHORT = [0, 3, 4, 7, 8, 9, 17, 18, 19, 21, 26, 28, 30, 32, 36, 38, 39, 43, 44, 45, 46];

export const timelineShortComputador = (tl: Timeline) =>
  recortarTimeline(tl, CENAS_SHORT, { largura: 1080, altura: 1920, legenda: { ...tl.legenda, pos: 56 } });

export const ConhecendoComputadorShort: React.FC<Timeline> = (tl) => (
  <Video {...tl} pasta="videos/conhecendo-o-computador-mvtty7ty/" />
);
