import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Etiqueta, Faixa, Fundo, Painel, RPG, Tela, type LinhaRpg } from "./Kit";
import { Campo } from "./Ep07Moeda";

// RPG Code (C# na Unity), episódio 08: a bolsa cheia (operadores de comparação). 11 cenas, 9:16, ~58 s.
const PASTA = "videos/rpg-code-08-a-bolsa-cheia-mwj3znis/";

const CODIGO = [
  "int moedas = 98;",
  "int limite = 99;",
  "",
  "void ColetarMoeda()",
  "{",
  "    moedas += 5;",
  "    if (moedas > limite)",
  "        moedas = limite;",
  "}",
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
    <Faixa ep="EP. 08" acao="Comparar:" destaque="> <" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo="Bolsa.cs · Unity" linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons as never} />
  </AbsoluteFill>
);

// Campo parado com o contador fixo (com ou sem limite).
const Parado: React.FC<{ total: number; limite?: number }> = ({ total, limite }) => <Campo moedas={[]} ini={[60, 62]} total0={total} limite={limite} />;
const GRANDE = { x: 92, y: 58, valor: 5 };

const COMPARADORES: [string, string][] = [["<", "menor"], [">=", "maior ou igual"], ["<=", "menor ou igual"], ["==", "igual"], ["!=", "diferente"]];

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro tela={<Parado total={7} />} sons={[{ t: em(c, "limite"), tipo: "erro" }]}
      extra={<>
        <Etiqueta t={0.2} x={540} y={1150} txt="moedas += 1 ✓" cor={RPG.verde} tam={36} />
        <Etiqueta t={em(c, "limite")} x={540} y={1350} txt="A BOLSA TEM LIMITE" tam={44} />
      </>} />
  ),
  1: ({ cena: c }) => (
    <Quadro tela={<Parado total={7} limite={99} />} sons={[{ t: em(c, "99"), tipo: "pop" }, { t: em(c, "variavel"), tipo: "tecla" }]}
      codigo={de((i) => (i === 1 ? { t: em(c, "variavel"), marca: em(c, "variavel") } : null))}
      extra={<Etiqueta t={em(c, "99")} x={540} y={1450} txt="máximo: 99" tam={56} />} />
  ),
  2: ({ cena: c }) => (
    <Quadro tela={<Campo moedas={[GRANDE]} ini={[40, 62]} total0={98} limite={99} />} sons={[{ t: em(c, "98"), tipo: "pop" }, { t: em(c, "grande"), tipo: "plim" }]}
      codigo={de((i) => (i <= 1 ? { t: i === 0 ? em(c, "98") : undefined, marca: i === 0 ? em(c, "98") : undefined } : null))}
      extra={<Etiqueta t={em(c, "5")} x={540} y={1450} txt="moeda grande = 5" cor={RPG.amarelo} tam={44} />} />
  ),
  3: ({ cena: c }) => {
    const p = em(c, "103");
    return (
      <Quadro tela={<Campo moedas={[{ ...GRANDE, pega: p }]} ini={[40, 62]} total0={98} limite={99} trechos={[{ t0: 0, t1: p, dx: 52, dy: -2 }]} />} sons={[{ t: p, tipo: "contagem" }, { t: em(c, "passou"), tipo: "erro" }]}
        codigo={de((i) => (i <= 4 || i === 8 ? {} : i === 5 ? { t: em(c, "mais"), marca: p } : null))}
        extra={<Etiqueta t={em(c, "passou")} x={540} y={1530} txt="103 > 99 ✗" cor={RPG.vermelho} tam={56} />} />
    );
  },
  4: ({ cena: c }) => (
    <Quadro tela={<Parado total={103} limite={99} />} sons={[{ t: em(c, "maior"), tipo: "tecla" }]}
      codigo={de((i) => (i <= 5 || i === 8 ? {} : i === 6 ? { t: em(c, "comparamos"), marca: em(c, "maior") } : null))}
      extra={<Etiqueta t={em(c, "limite")} x={540} y={1570} txt="moedas > limite ?" cor={RPG.azul} tam={40} />} />
  ),
  5: ({ cena: c }) => {
    const v = em(c, "verdadeiro", 2);
    return (
      <Quadro tela={<Parado total={103} limite={99} />} sons={[{ t: em(c, "verdadeiro"), tipo: "pop" }, { t: v, tipo: "plim" }]}
        extra={<>
          <Etiqueta t={em(c, "verdadeiro")} x={360} y={1180} txt="true" cor={RPG.verde} tam={60} />
          <Etiqueta t={em(c, "falso")} x={720} y={1180} txt="false" cor={RPG.vermelho} tam={60} />
          <Etiqueta t={em(c, "103")} x={540} y={1400} txt="103 > 99" tam={64} />
          <Etiqueta t={v} x={540} y={1570} txt="→ true" cor={RPG.verde} tam={56} />
        </>} />
    );
  },
  6: ({ cena: c }) => {
    const k = em(c, "99");
    return (
      <Quadro tela={<Campo moedas={[]} ini={[92, 62]} total0={103} limite={99} ajuste={(tot, t) => (t >= k ? 99 : tot)} />} sons={[{ t: em(c, "corta"), tipo: "whoosh" }, { t: k, tipo: "plim" }]}
        codigo={de((i) => ({ marca: i === 6 ? em(c, "if") : i === 7 ? em(c, "recebe") : undefined }))}
        extra={<Etiqueta t={k} x={540} y={1610} txt="moedas = 99 ✓" cor={RPG.verde} tam={36} />} />
    );
  },
  7: ({ cena: c }) => {
    const ts = [em(c, "menor"), em(c, "maior"), em(c, "menor", 2), em(c, "igual", 2), em(c, "diferente")];
    return (
      <Quadro tela={<Parado total={99} limite={99} />} sons={ts.map((t) => ({ t, tipo: "pop" as const }))}
        extra={<>
          <Etiqueta t={0.1} x={540} y={1110} txt="> maior" cor={RPG.verde} tam={34} />
          {COMPARADORES.map(([s, n], i) => <Etiqueta key={s} t={ts[i]} x={540} y={1200 + i * 88} txt={`${s} ${n}`} cor={i % 2 ? RPG.azul : RPG.amarelo} tam={34} />)}
        </>} />
    );
  },
  8: ({ cena: c }) => {
    const um = em(c, "sinal", 2);
    return (
      <Quadro tela={<Parado total={99} limite={99} />} sons={[{ t: em(c, "dois"), tipo: "plim" }, { t: um, tipo: "erro" }]}
        extra={<>
          <Etiqueta t={em(c, "dois")} x={540} y={1200} txt="moedas == 99  → compara" cor={RPG.verde} tam={34} />
          <Etiqueta t={um} x={540} y={1420} txt="moedas = 99  → guarda" cor={RPG.laranja} tam={34} />
        </>} />
    );
  },
  9: ({ cena: c }) => (
    <Quadro tela={<Parado total={99} limite={99} />} sons={[{ t: em(c, "sim"), tipo: "pop" }, { t: em(c, "if"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "sim")} x={540} y={1180} txt="comparar = sim ou não" tam={44} />
        <Etiqueta t={em(c, "if")} x={540} y={1400} txt="if decide o que fazer" cor={RPG.verde} tam={40} />
      </>} />
  ),
  10: ({ cena: c }) => (
    <Quadro tela={<Parado total={99} limite={99} />} sons={[{ t: em(c, "espada"), tipo: "pop" }, { t: em(c, "proximo"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "cheia")} x={540} y={1150} txt="bolsa: 99/99" cor={RPG.amarelo} tam={40} />
        <Etiqueta t={em(c, "espada")} x={540} y={1330} txt="⚔ ESPADA À VENDA" tam={44} />
        <Etiqueta t={em(c, "proximo")} x={540} y={1510} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
      </>} />
  ),
};

export const RpgEp08: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
