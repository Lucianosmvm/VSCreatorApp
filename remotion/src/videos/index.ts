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
import { EncapsulamentoCSharp, EncapsulamentoShort, timelineShortEncapsulamento } from "./EncapsulamentoCSharp";
import tlEncapsulamento from "../../public/videos/encapsulamento-em-c-com-resident-evil-4-mwc6ogy3/timeline.json";
import { SwitchRoteador, SwitchRoteadorShort, timelineShortSwitchRoteador } from "./SwitchRoteador";
import tlSwitchRoteador from "../../public/videos/switch-vs-roteador-por-onde-seus-dados-p-mwdhmy6y/timeline.json";
import { RpgEp01 } from "../rpg/Ep01Menu";
import { RpgEp02 } from "../rpg/Ep02Classe";
import { RpgEp03 } from "../rpg/Ep03Nome";
import { RpgEp04 } from "../rpg/Ep04Passo";
import { RpgEp05 } from "../rpg/Ep05Setas";
import { RpgEp06 } from "../rpg/Ep06Cerca";
import tlRpg06 from "../../public/videos/rpg-code-06-a-cerca-parou-o-artur-mwfawv18/timeline.json";
import tlRpg05 from "../../public/videos/rpg-code-05-andando-com-as-setas-mweyvx5j/timeline.json";
import tlRpg04 from "../../public/videos/rpg-code-04-o-primeiro-passo-mwey4rdo/timeline.json";
import tlRpg03 from "../../public/videos/rpg-code-03-o-nome-do-heroi-mwewnug7/timeline.json";
import tlRpg02 from "../../public/videos/rpg-code-02-classe-e-objeto-mwevyeqc/timeline.json";
import tlRpg01 from "../../public/videos/rpg-code-01-o-menu-e-o-switch-mweva89w/timeline.json";

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
  { id: "rpg-code-01", timeline: tlRpg01 as Timeline, componente: RpgEp01 },
  { id: "rpg-code-02", timeline: tlRpg02 as Timeline, componente: RpgEp02 },
  { id: "rpg-code-03", timeline: tlRpg03 as Timeline, componente: RpgEp03 },
  { id: "rpg-code-04", timeline: tlRpg04 as Timeline, componente: RpgEp04 },
  { id: "rpg-code-05", timeline: tlRpg05 as Timeline, componente: RpgEp05 },
  { id: "rpg-code-06", timeline: tlRpg06 as Timeline, componente: RpgEp06 },
  { id: "encapsulamento-csharp", timeline: tlEncapsulamento as Timeline, componente: EncapsulamentoCSharp },
  { id: "encapsulamento-csharp-short", timeline: timelineShortEncapsulamento(tlEncapsulamento as Timeline), componente: EncapsulamentoShort },
  { id: "switch-roteador", timeline: tlSwitchRoteador as Timeline, componente: SwitchRoteador },
  { id: "switch-roteador-short", timeline: timelineShortSwitchRoteador(tlSwitchRoteador as Timeline), componente: SwitchRoteadorShort },
];
