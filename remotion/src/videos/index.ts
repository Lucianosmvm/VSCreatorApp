import type React from "react";
import type { Timeline } from "../tipos";
import { SwitchCSharp, SwitchCSharpShort, timelineShortSwitch } from "./SwitchCSharp";
import tlSwitch from "../../public/videos/switch-e-switch-expression-em-c-muydj4v4/timeline.json";
import { CondicionaisCSharp, CondicionaisShort, timelineShort } from "./CondicionaisCSharp";
import tlCondicionais from "../../public/videos/condicionais-em-c-if-else-e-ternario-muy7zibr/timeline.json";

// Um vídeo por projeto do app. Para cada um o Claude Code cria
// src/videos/<Nome>.tsx e registra aqui. A timeline (tempo de cada cena e de
// cada palavra) vem de public/videos/<id-do-projeto>/timeline.json, que o
// botão "Enviar para o Claude" do app grava.
export type VideoRegistrado = {
  id: string;            // id da composição (só letras, números e hífen)
  timeline: Timeline;
  componente: React.FC<Timeline>;
};

export const VIDEOS: VideoRegistrado[] = [
  { id: "condicionais-csharp", timeline: tlCondicionais as Timeline, componente: CondicionaisCSharp },
  { id: "condicionais-csharp-short", timeline: timelineShort(tlCondicionais as Timeline), componente: CondicionaisShort },
  { id: "switch-csharp", timeline: tlSwitch as Timeline, componente: SwitchCSharp },
  { id: "switch-csharp-short", timeline: timelineShortSwitch(tlSwitch as Timeline), componente: SwitchCSharpShort },
];
