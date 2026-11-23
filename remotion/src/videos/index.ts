import type React from "react";
import type { Timeline } from "../tipos";
import { Refugio13Filmado } from "../refugio/RefugioFilmado";
import { Refugio13Dia03 } from "../refugio/RefugioDia03";
import tlRefugio03 from "../../public/videos/refugio-13-03/timeline.json";
import tlRefugio02 from "../../public/videos/refugio-13-02/timeline.json";
import { Refugio13Dia01 } from "./Refugio13Dia01";
import tlRefugio01 from "../../public/videos/refugio-13-01-a-estacao-ainda-tem-luz-mwktp8wd/timeline.json";
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
import { RpgEp07 } from "../rpg/Ep07Moeda";
import { RpgEp08 } from "../rpg/Ep08Bolsa";
import { RpgEp09 } from "../rpg/Ep09Ferreiro";
import { RpgEp10 } from "../rpg/Ep10Peso";
import { RpgEp11 } from "../rpg/Ep11Equipar";
import { RpgEp12 } from "../rpg/Ep12Armadura";
import tlRpg12 from "../../public/videos/rpg-code-12-a-armadura-mwt55ovz/timeline.json";
import tlRpg11 from "../../public/videos/rpg-code-11-equipar-a-espada-mwt4rmjz/timeline.json";
import tlRpg10 from "../../public/videos/rpg-code-10-dano-e-peso-mwkkq4dv/timeline.json";
import tlRpg09 from "../../public/videos/rpg-code-09-o-ferreiro-mwj4fp8p/timeline.json";
import tlRpg08 from "../../public/videos/rpg-code-08-a-bolsa-cheia-mwj3znis/timeline.json";
import tlRpg07 from "../../public/videos/rpg-code-07-a-primeira-moeda-mwj3piwm/timeline.json";
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
  { id: "refugio-13-02", timeline: tlRefugio02 as Timeline, componente: Refugio13Filmado },
  { id: "refugio-13-03", timeline: tlRefugio03 as Timeline, componente: Refugio13Dia03 },
  {
    id: "refugio-13-01",
    timeline: {
      ...tlRefugio01,
      duracao: tlRefugio01.duracao + 2.5,
      cenas: tlRefugio01.cenas.map((cena, i, cenas) =>
        i === cenas.length - 1 ? { ...cena, dur: cena.dur + 2.5 } : cena),
    } as Timeline,
    componente: Refugio13Dia01,
  },
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
  { id: "rpg-code-07", timeline: tlRpg07 as Timeline, componente: RpgEp07 },
  { id: "rpg-code-08", timeline: tlRpg08 as Timeline, componente: RpgEp08 },
  { id: "rpg-code-09", timeline: tlRpg09 as Timeline, componente: RpgEp09 },
  { id: "rpg-code-10", timeline: tlRpg10 as Timeline, componente: RpgEp10 },
  { id: "rpg-code-11", timeline: tlRpg11 as Timeline, componente: RpgEp11 },
  { id: "rpg-code-12", timeline: tlRpg12 as Timeline, componente: RpgEp12 },
  { id: "encapsulamento-csharp", timeline: tlEncapsulamento as Timeline, componente: EncapsulamentoCSharp },
  { id: "encapsulamento-csharp-short", timeline: timelineShortEncapsulamento(tlEncapsulamento as Timeline), componente: EncapsulamentoShort },
  { id: "switch-roteador", timeline: tlSwitchRoteador as Timeline, componente: SwitchRoteador },
  { id: "switch-roteador-short", timeline: timelineShortSwitchRoteador(tlSwitchRoteador as Timeline), componente: SwitchRoteadorShort },
];
