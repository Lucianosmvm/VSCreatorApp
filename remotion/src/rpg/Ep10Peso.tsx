import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Etiqueta, Faixa, Ficha, Fundo, Painel, RPG, Tela, type LinhaRpg } from "./Kit";
import { Campo } from "./Ep07Moeda";

// RPG Code (C# na Unity), episódio 10: dano e peso da espada (int × float). 11 cenas, 9:16, ~57 s.
const PASTA = "videos/rpg-code-10-dano-e-peso-mwkkq4dv/";

const CODIGO = [
  "public class Espada",
  "{",
  "    public int dano = 5;",
  "    public float peso = 1.5f;",
  "}",
  "",
  "float velocidade = 3f - espada.peso * 0.2f;",
  "// 3 - 0.3 = 2.7",
];
const de = (f: (i: number) => Partial<LinhaRpg> | null): LinhaRpg[] =>
  CODIGO.flatMap((txt, i) => {
    const r = f(i);
    return r === null ? [] : [{ txt, ...r }];
  });

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" | "contagem" };
const Quadro: React.FC<{ tela: React.ReactNode; codigo?: LinhaRpg[]; extra?: React.ReactNode; sons?: Som[] }> = ({ tela, codigo, extra, sons = [] }) => (
  <AbsoluteFill>
    <Fundo />
    <Faixa ep="EP. 10" acao="Espada:" destaque="float" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo="Espada.cs · Unity" linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons as never} />
  </AbsoluteFill>
);

const Parado: React.FC = () => <Campo moedas={[]} ini={[60, 62]} total0={39} />;
const FICHA = (t: number, dano?: number, peso?: number) => (
  <Ficha t={t} x={540} y={1080} largura={620} titulo="⚔ ESPADA DE MADEIRA" cor={RPG.laranja}
    campos={[{ k: "dano", v: dano === undefined ? "?" : "5", t: dano }, { k: "peso", v: peso === undefined ? "?" : "1,5 kg", t: peso }]} />
);

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro tela={<Parado />} sons={[{ t: em(c, "espada"), tipo: "pop" }, { t: em(c, "batalha"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={0.2} x={540} y={1150} txt="if / else ✓" cor={RPG.verde} tam={36} />
        <Etiqueta t={em(c, "espada")} x={540} y={1330} txt="⚔ espada de madeira" tam={42} />
        <Etiqueta t={em(c, "batalha")} x={540} y={1500} txt="quanto ela vale?" cor={RPG.azul} tam={40} />
      </>} />
  ),
  1: ({ cena: c }) => (
    <Quadro tela={<Parado />} sons={[{ t: em(c, "dano"), tipo: "pop" }, { t: em(c, "peso"), tipo: "pop" }]}
      extra={<>
        <Ficha t={em(c, "numeros")} x={540} y={1080} largura={620} titulo="⚔ ESPADA DE MADEIRA" cor={RPG.laranja}
          campos={[{ k: "dano", v: "?", t: em(c, "dano") }, { k: "peso", v: "?", t: em(c, "peso") }]} />
      </>} />
  ),
  2: ({ cena: c }) => (
    <Quadro tela={<Parado />} sons={[{ t: em(c, "5"), tipo: "pop" }, { t: em(c, "int"), tipo: "plim" }]}
      codigo={de((i) => (i <= 2 || i === 4 ? { t: i === 2 ? em(c, "int") : undefined, marca: i === 2 ? em(c, "int") : undefined } : null))}
      extra={<Etiqueta t={em(c, "5")} x={540} y={1520} txt="dano = 5  (inteiro)" cor={RPG.verde} tam={40} />} />
  ),
  3: ({ cena: c }) => (
    <Quadro tela={<Parado />} sons={[{ t: em(c, "15"), tipo: "pop" }]}
      extra={<>
        {FICHA(0, 0, em(c, "15"))}
        <Etiqueta t={em(c, "redondo")} x={540} y={1450} txt="1,5 não é redondo" cor={RPG.azul} tam={44} />
      </>} />
  ),
  4: ({ cena: c }) => (
    <Quadro tela={<Parado />} sons={[{ t: em(c, "erro"), tipo: "erro" }]}
      codigo={[
        { txt: "int dano = 5;      // ok ✓", t: 0, cor: RPG.verde },
        { txt: "int peso = 1.5;    // erro ✗", t: em(c, "tentar"), marca: em(c, "erro"), cor: RPG.vermelho },
      ]}
      extra={<Etiqueta t={em(c, "virgula")} x={540} y={1450} txt="int não guarda vírgula" cor={RPG.vermelho} tam={40} />} />
  ),
  5: ({ cena: c }) => (
    <Quadro tela={<Parado />} sons={[{ t: em(c, "float"), tipo: "plim" }, { t: em(c, "f"), tipo: "tecla" }]}
      codigo={de((i) => (i <= 4 ? { t: i === 3 ? em(c, "float") : undefined, marca: i === 3 ? em(c, "f") : undefined } : null))}
      extra={<Etiqueta t={em(c, "f")} x={540} y={1520} txt="1.5f: o f é de float" cor={RPG.amarelo} tam={38} />} />
  ),
  6: ({ cena: c }) => (
    <Quadro tela={<Parado />} sons={[{ t: em(c, "ponto"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "virgula")} x={540} y={1180} txt="no jogo: 1,5" cor={RPG.azul} tam={56} />
        <Etiqueta t={em(c, "ponto")} x={540} y={1400} txt="no código: 1.5" cor={RPG.verde} tam={56} />
      </>} />
  ),
  7: ({ cena: c }) => {
    const p = em(c, "pesada");
    return (
      <Quadro tela={<Campo moedas={[]} ini={[18, 62]} total0={39} trechos={[{ t0: 0.2, t1: c.dur - 0.2, dx: 70, dy: 0 }]} />} sons={[{ t: p, tipo: "pop" }]}
        extra={<>
          {FICHA(0, 0, 0)}
          <Etiqueta t={p} x={540} y={1450} txt="mais peso = mais devagar" cor={RPG.laranja} tam={40} />
        </>} />
    );
  },
  8: ({ cena: c }) => {
    const v = em(c, "27");
    return (
      <Quadro tela={<Campo moedas={[]} ini={[18, 62]} total0={39} trechos={[{ t0: 0.2, t1: c.dur, dx: 50, dy: 0 }]} />} sons={[{ t: v, tipo: "contagem" }]}
        codigo={de((i) => (i <= 4 ? {} : i === 6 ? { t: em(c, "velocidade"), marca: em(c, "3") } : i === 7 ? { t: v, marca: v } : {}))}
        extra={<Etiqueta t={v} x={540} y={900} txt="velocidade: 3 vira 2.7" cor={RPG.laranja} tam={36} />} />
    );
  },
  9: ({ cena: c }) => (
    <Quadro tela={<Parado />} sons={[{ t: em(c, "int"), tipo: "pop" }, { t: em(c, "float"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={em(c, "int")} x={540} y={1180} txt="int: 5, 39, 99" cor={RPG.verde} tam={48} />
        <Etiqueta t={em(c, "float")} x={540} y={1400} txt="float: 1.5f, 2.7f" cor={RPG.azul} tam={48} />
      </>} />
  ),
  10: ({ cena: c }) => (
    <Quadro tela={<Parado />} sons={[{ t: em(c, "equipada"), tipo: "pop" }, { t: em(c, "proximo"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "pronta")} x={540} y={1150} txt="dano 5 · peso 1.5f ✓" cor={RPG.verde} tam={36} />
        <Etiqueta t={em(c, "equipada")} x={540} y={1330} txt="EQUIPADA OU NÃO?" tam={46} />
        <Etiqueta t={em(c, "proximo")} x={540} y={1510} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
      </>} />
  ),
};

export const RpgEp10: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
