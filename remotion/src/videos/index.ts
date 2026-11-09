import type React from "react";
import type { Timeline } from "../tipos";
import { ForCSharp, ForCSharpShort, timelineShortFor } from "./ForCSharp";
import tlFor from "../../public/videos/for-em-c-repeticao-controlada-muzfj01f/timeline.json";
import { SwitchCSharp, SwitchCSharpShort, timelineShortSwitch } from "./SwitchCSharp";
import tlSwitch from "../../public/videos/switch-e-switch-expression-em-c-muydj4v4/timeline.json";
import { CondicionaisCSharp, CondicionaisShort, timelineShort } from "./CondicionaisCSharp";
import tlCondicionais from "../../public/videos/condicionais-em-c-if-else-e-ternario-muy7zibr/timeline.json";
import { ConhecendoComputador, ConhecendoComputadorShort, timelineShortComputador } from "./ConhecendoComputador";
import tlComputador from "../../public/videos/conhecendo-o-computador-mvtty7ty/timeline.json";
import { ClassesObjetosCSharp, ClassesObjetosShort, timelineShortClasses } from "./ClassesObjetosCSharp";
import tlClasses from "../../public/videos/classes-e-objetos-em-c-com-resident-evil-mw0m04aw/timeline.json";
import { PolimorfismoCSharp, PolimorfismoShort, timelineShortPolimorfismo } from "./PolimorfismoCSharp";
import tlPolimorfismo from "../../public/videos/polimorfismo-em-c-com-resident-evil-4-mw94fzna/timeline.json";

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
  { id: "for-csharp", timeline: tlFor as Timeline, componente: ForCSharp },
  { id: "for-csharp-short", timeline: timelineShortFor(tlFor as Timeline), componente: ForCSharpShort },
  { id: "conhecendo-computador", timeline: tlComputador as Timeline, componente: ConhecendoComputador },
  { id: "conhecendo-computador-short", timeline: timelineShortComputador(tlComputador as Timeline), componente: ConhecendoComputadorShort },
  { id: "classes-objetos-csharp", timeline: tlClasses as Timeline, componente: ClassesObjetosCSharp },
  { id: "classes-objetos-csharp-short", timeline: timelineShortClasses(tlClasses as Timeline), componente: ClassesObjetosShort },
  { id: "polimorfismo-csharp", timeline: tlPolimorfismo as Timeline, componente: PolimorfismoCSharp },
  { id: "polimorfismo-csharp-short", timeline: timelineShortPolimorfismo(tlPolimorfismo as Timeline), componente: PolimorfismoShort },
];
