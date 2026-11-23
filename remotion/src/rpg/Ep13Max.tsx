import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Etiqueta, Faixa, Fundo, Painel, RPG, Tela, type LinhaRpg } from "./Kit";
import { Batalha } from "./Ep12Armadura";

// RPG Code (C# na Unity), episódio 13: dano nunca é negativo (Mathf.Max). 11 cenas, 9:16, ~58 s.
const PASTA = "videos/rpg-code-13-dano-nunca-negativo-mwt5y2x5/";
const FERRO = "#9aa3ad";

const CODIGO = [
  "int dano = ataque - defesa;   // 8 - 10 = -2",
  "vida -= dano;                 // 85 + 2 ?!",
  "",
  "// com if:",
  "if (dano < 0) dano = 0;",
  "",
  "// pronto na Unity:",
  "dano = Mathf.Max(dano, 0);    // 0",
];
const de = (f: (i: number) => Partial<LinhaRpg> | null): LinhaRpg[] =>
  CODIGO.flatMap((txt, i) => {
    const r = f(i);
    return r === null ? [] : [{ txt, ...r }];
  });

// Armadura de ferro: DEF 10, cor cinza.
const Ferro: React.FC<{ golpes?: { t: number; dano: number; cor?: string; txt?: string }[]; vida0?: number }> = ({ golpes, vida0 = 85 }) => (
  <Batalha armadura={0} def={10} corArmadura={FERRO} vida0={vida0} golpes={golpes} />
);

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" | "contagem" };
const Quadro: React.FC<{ tela: React.ReactNode; codigo?: LinhaRpg[]; extra?: React.ReactNode; sons?: Som[] }> = ({ tela, codigo, extra, sons = [] }) => (
  <AbsoluteFill>
    <Fundo />
    <Faixa ep="EP. 13" acao="Dano:" destaque="Mathf.Max" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo="Combate.cs · Unity" linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons as never} />
  </AbsoluteFill>
);

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro tela={<Batalha armadura={0} vida0={85} />} sons={[{ t: em(c, "maior"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={0.2} x={540} y={1150} txt="dano = ataque - defesa ✓" cor={RPG.verde} tam={32} />
        <Etiqueta t={em(c, "maior")} x={540} y={1340} txt="defesa maior que ataque?" tam={38} />
      </>} />
  ),
  1: ({ cena: c }) => (
    <Quadro tela={<Batalha armadura={em(c, "ferro")} def={10} corArmadura={FERRO} vida0={85} />} sons={[{ t: em(c, "ferro"), tipo: "plim" }, { t: em(c, "8"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={em(c, "10")} x={540} y={1200} txt="DEF 10" cor={RPG.azul} tam={56} />
        <Etiqueta t={em(c, "8")} x={540} y={1400} txt="ATQ 8" cor={RPG.vermelho} tam={56} />
      </>} />
  ),
  2: ({ cena: c }) => (
    <Quadro tela={<Ferro />} sons={[{ t: em(c, "2"), tipo: "erro" }]}
      codigo={de((i) => (i === 0 ? { t: em(c, "8"), marca: em(c, "negativo") } : null))}
      extra={<Etiqueta t={em(c, "negativo")} x={540} y={1450} txt="dano = -2 ?!" cor={RPG.vermelho} tam={60} />} />
  ),
  3: ({ cena: c }) => {
    const cura = em(c, "cura");
    return (
      <Quadro tela={<Ferro golpes={[{ t: cura, dano: -2, cor: RPG.verde, txt: "+2" }]} />} sons={[{ t: cura, tipo: "plim" }]}
        codigo={de((i) => (i <= 1 ? { t: i === 1 ? em(c, "vida") : undefined, marca: i === 1 ? em(c, "mais") : undefined } : null))}
        extra={<Etiqueta t={cura} x={540} y={1450} txt="o slime CUROU o Artur" cor={RPG.verde} tam={40} />} />
    );
  },
  4: ({ cena: c }) => (
    <Quadro tela={<Ferro vida0={87} />} sons={[{ t: em(c, "bug"), tipo: "erro" }]}
      extra={<>
        <Etiqueta t={em(c, "bug")} x={540} y={1180} txt="🐛 BUG!" cor={RPG.vermelho} tam={80} />
        <Etiqueta t={em(c, "zero")} x={540} y={1430} txt="dano nunca abaixo de 0" tam={40} />
      </>} />
  ),
  5: ({ cena: c }) => (
    <Quadro tela={<Ferro vida0={85} />} sons={[{ t: em(c, "if"), tipo: "tecla" }, { t: em(c, "zero", 2), tipo: "plim" }]}
      codigo={de((i) => (i <= 4 ? { t: i >= 3 ? em(c, "if") : undefined, marca: i === 4 ? em(c, "menor") : undefined } : null))} />
  ),
  6: ({ cena: c }) => (
    <Quadro tela={<Ferro vida0={85} />} sons={[{ t: em(c, "mathf"), tipo: "plim" }]}
      codigo={de((i) => ({ t: i >= 6 ? em(c, "pronto") : undefined, marca: i === 7 ? em(c, "mathf") : undefined }))} />
  ),
  7: ({ cena: c }) => (
    <Quadro tela={<Ferro vida0={85} golpes={[{ t: em(c, "0", 2), dano: 0, cor: RPG.branco, txt: "0" }]} />} sons={[{ t: em(c, "maior"), tipo: "pop" }, { t: em(c, "0", 2), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "dois")} x={540} y={1150} txt="Mathf.Max(a, b)" cor={RPG.azul} tam={48} />
        <Etiqueta t={em(c, "maior")} x={540} y={1330} txt="devolve o MAIOR" tam={44} />
        <Etiqueta t={em(c, "entre")} x={540} y={1510} txt="Max(-2, 0) = 0" cor={RPG.verde} tam={48} />
      </>} />
  ),
  8: ({ cena: c }) => (
    <Quadro tela={<Batalha armadura={0} vida0={85} golpes={[{ t: em(c, "devolve"), dano: 5 }]} />} sons={[{ t: em(c, "devolve"), tipo: "erro" }, { t: em(c, "igual"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "5")} x={540} y={1250} txt="Max(5, 0) = 5" cor={RPG.verde} tam={56} />
        <Etiqueta t={em(c, "igual")} x={540} y={1470} txt="dano normal continua igual" cor={RPG.azul} tam={34} />
      </>} />
  ),
  9: ({ cena: c }) => (
    <Quadro tela={<Ferro vida0={80} />} sons={[{ t: em(c, "min"), tipo: "pop" }, { t: em(c, "abs"), tipo: "pop" }, { t: em(c, "round"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={em(c, "prontos")} x={540} y={1110} txt="métodos prontos = menos código" tam={34} />
        <Etiqueta t={em(c, "min")} x={540} y={1260} txt="Mathf.Min  menor de dois" cor={RPG.verde} tam={32} />
        <Etiqueta t={em(c, "abs")} x={540} y={1380} txt="Mathf.Abs  tira o sinal" cor={RPG.azul} tam={32} />
        <Etiqueta t={em(c, "round")} x={540} y={1500} txt="Mathf.Round  arredonda" cor={RPG.laranja} tam={32} />
      </>} />
  ),
  10: ({ cena: c }) => (
    <Quadro tela={<Ferro vida0={80} />} sons={[{ t: em(c, "ponte"), tipo: "pop" }, { t: em(c, "proximo"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "protegido")} x={540} y={1150} txt="dano = Mathf.Max(dano, 0) ✓" cor={RPG.verde} tam={30} />
        <Etiqueta t={em(c, "ponte")} x={540} y={1330} txt="UM SLIME NA PONTE" tam={44} />
        <Etiqueta t={em(c, "proximo")} x={540} y={1510} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
      </>} />
  ),
};

export const RpgEp13: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
