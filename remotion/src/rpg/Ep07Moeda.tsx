import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Caixa, Etiqueta, Faixa, Fundo, Heroi, Painel, RPG, Tela, TextoPixel, rampa, useT, type LinhaRpg } from "./Kit";

// RPG Code (C# na Unity), episódio 07: a primeira moeda (int e +=). 11 cenas, 9:16, ~50 s.
const PASTA = "videos/rpg-code-07-a-primeira-moeda-mwj3piwm/";

const CODIGO = [
  "int moedas = 0;",
  "",
  "void ColetarMoeda()",
  "{",
  "    moedas += 1;",
  "    textoMoedas.text = $\"x {moedas}\";",
  "}",
  "",
  "// moeda grande: moedas += 5;",
];
const de = (f: (i: number) => Partial<LinhaRpg> | null): LinhaRpg[] =>
  CODIGO.flatMap((txt, i) => {
    const r = f(i);
    return r === null ? [] : [{ txt, ...r }];
  });

type Moeda = { x: number; y: number; pega?: number; valor?: number };
type Trecho = { t0: number; t1: number; dx: number; dy: number };

export const MoedaPixel: React.FC<{ x: number; y: number; grande?: boolean }> = ({ x, y, grande }) => {
  const { f } = useT();
  const k = grande ? 2.8 : 1.8;
  const larg = Math.max(0.8, Math.abs(Math.cos(f * 0.12)) * 5 * k);
  const brilho = Math.floor(f / 10) % 6 === 0;
  return (
    <g>
      <rect x={x - larg / 2} y={y - 2.5 * k} width={larg} height={5 * k} fill="#e8b830" />
      <rect x={x - larg / 2} y={y - 2.5 * k} width={Math.max(0.4, larg * 0.35)} height={5 * k} fill="#fff1a0" />
      {brilho && <rect x={x + 2 * k} y={y - 4 * k} width={1} height={1} fill="#ffffff" />}
    </g>
  );
};

// Campo com cerca, moedas e o contador no canto; `ini` + trechos movem o Artur.
export const Campo: React.FC<{ moedas: Moeda[]; ini?: [number, number]; trechos?: Trecho[]; total0?: number; contador?: boolean; ajuste?: (total: number, t: number) => number; limite?: number }> = ({ moedas, ini = [28, 62], trechos = [], total0 = 0, contador = true, ajuste, limite }) => {
  const { t, f } = useT();
  let [x, y] = ini;
  let andando = false, esquerda = false;
  for (const tr of trechos) {
    const k = rampa(t, tr.t0, tr.t1);
    x += tr.dx * k; y += tr.dy * k;
    if (t >= tr.t0 && t < tr.t1) { andando = true; esquerda = tr.dx < 0; }
  }
  const pulo = andando ? Math.abs(Math.sin((f % 8) / 8 * Math.PI)) * 1.6 : 0;
  const bruto = total0 + moedas.reduce((s, m) => s + (m.pega !== undefined && t >= m.pega ? m.valor ?? 1 : 0), 0);
  const total = ajuste ? ajuste(bruto, t) : bruto;
  const estourou = limite !== undefined && total > limite;
  return (
    <>
      <rect x={0} y={0} width={135} height={95} fill="#3fa34d" />
      {Array.from({ length: 50 }, (_, i) => <rect key={i} x={(i * 23) % 135} y={(i * 13) % 95} width={2} height={1} fill="#5cc366" />)}
      <path d="M0 78 h135 v6 h-135z" fill="#c9a46a" />
      {Array.from({ length: 9 }, (_, i) => <g key={i}><rect x={124} y={6 + i * 9} width={3} height={8} fill="#8b5a2b" /><rect x={122} y={8 + i * 9} width={7} height={1.4} fill="#a8743a" /></g>)}
      {[[10, 30], [96, 14]].map(([a, b]) => <g key={a}><rect x={a} y={b} width={8} height={8} fill="#2f7a3a" /><rect x={a + 3} y={b + 8} width={2} height={3} fill="#5a3a1a" /></g>)}
      {moedas.map((m, i) => {
        if (m.pega !== undefined && t >= m.pega + 0.6) return null;
        if (m.pega !== undefined && t >= m.pega) {
          const k = rampa(t, m.pega, m.pega + 0.6);
          return <TextoPixel key={i} x={m.x} y={m.y - 4 - k * 8} txt={`+${m.valor ?? 1}`} tam={5} cor={RPG.amarelo} meio />;
        }
        return <MoedaPixel key={i} x={m.x} y={m.y} grande={(m.valor ?? 1) > 1} />;
      })}
      <g transform={`translate(${x - 6} ${y - 15 - pulo})`}><Heroi x={0} y={0} classe="guerreiro" flip={esquerda} /></g>
      {contador && (
        <Caixa x={3} y={3} w={limite !== undefined ? 58 : 30} h={11}>
          <rect x={7} y={6} width={5} height={5} fill="#e8b830" />
          <TextoPixel x={15} y={11.6} txt={`x ${total}${limite !== undefined ? `/${limite}` : ""}`} tam={4.6} cor={estourou ? RPG.vermelho : RPG.amarelo} />
        </Caixa>
      )}
    </>
  );
};

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" | "contagem" };
const Quadro: React.FC<{ tela: React.ReactNode; codigo?: LinhaRpg[]; extra?: React.ReactNode; sons?: Som[] }> = ({ tela, codigo, extra, sons = [] }) => (
  <AbsoluteFill>
    <Fundo />
    <Faixa ep="EP. 07" acao="Moeda:" destaque="int" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo="Bolsa.cs · Unity" linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons as never} />
  </AbsoluteFill>
);

const M1: Moeda = { x: 70, y: 60 };

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro tela={<Campo moedas={[M1]} ini={[110, 62]} contador={false} />} sons={[{ t: em(c, "brilhava"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={0.2} x={540} y={1150} txt="colisão ✓" cor={RPG.verde} tam={36} />
        <Etiqueta t={em(c, "brilhava")} x={540} y={1350} txt="✨ ?" tam={72} />
      </>} />
  ),
  1: ({ cena: c }) => (
    <Quadro tela={<Campo moedas={[M1]} ini={[110, 62]} contador={false} />} sons={[{ t: em(c, "moeda"), tipo: "plim" }, { t: em(c, "contar"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={em(c, "moeda")} x={540} y={1180} txt="UMA MOEDA!" tam={56} />
        <Etiqueta t={em(c, "contar")} x={540} y={1400} txt="quantas ele já pegou?" cor={RPG.azul} tam={36} />
      </>} />
  ),
  2: ({ cena: c }) => (
    <Quadro tela={<Campo moedas={[M1]} ini={[110, 62]} />} sons={[{ t: em(c, "int"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "int")} x={540} y={1180} txt="int" tam={110} />
        <Etiqueta t={em(c, "inteiros")} x={540} y={1430} txt="0, 1, 2, 3... sem vírgula" cor={RPG.verde} tam={36} />
      </>} />
  ),
  3: ({ cena: c }) => (
    <Quadro tela={<Campo moedas={[M1]} ini={[110, 62]} />} sons={[{ t: em(c, "int"), tipo: "tecla" }, { t: em(c, "zero"), tipo: "pop" }]}
      codigo={de((i) => (i === 0 ? { t: em(c, "int"), marca: em(c, "zero") } : null))}
      extra={<Etiqueta t={em(c, "nenhuma")} x={540} y={1450} txt="moedas = 0" tam={56} />} />
  ),
  4: ({ cena: c }) => {
    const p = em(c, "encosta");
    return (
      <Quadro tela={<Campo moedas={[{ ...M1, pega: p + 0.9 }]} ini={[110, 62]} trechos={[{ t0: p - 0.6, t1: p + 0.9, dx: -40, dy: -2 }]} />} sons={[{ t: p + 0.9, tipo: "plim" }]}
        codigo={de((i) => (i === 0 || i === 1 ? {} : i >= 2 && i <= 3 || i === 6 ? { t: em(c, "coletarmoeda"), marca: i === 2 ? em(c, "coletarmoeda") : undefined } : null))} />
    );
  },
  5: ({ cena: c }) => {
    const s = em(c, "soma");
    return (
      <Quadro tela={<Campo moedas={[{ ...M1, pega: s }]} ini={[70, 62]} />} sons={[{ t: s, tipo: "plim" }]}
        codigo={de((i) => (i <= 3 || i === 6 ? {} : i === 4 ? { t: em(c, "moedas"), marca: em(c, "1") } : null))}
        extra={<Etiqueta t={s} x={540} y={1460} txt="0 + 1 = 1" cor={RPG.verde} tam={60} />} />
    );
  },
  6: ({ cena: c }) => (
    <Quadro tela={<Campo moedas={[]} ini={[70, 62]} total0={1} />} sons={[{ t: em(c, "igual"), tipo: "tecla" }, { t: em(c, "curto"), tipo: "plim" }]}
      codigo={de((i) => (i <= 6 ? { marca: i === 4 ? em(c, "curto") : undefined } : null))}
      extra={<>
        <Etiqueta t={em(c, "igual")} x={540} y={1545} txt="moedas = moedas + 1;" cor={RPG.azul} tam={30} />
        <Etiqueta t={em(c, "curto")} x={540} y={1625} txt="moedas += 1;  (mais curto ✓)" cor={RPG.verde} tam={26} />
      </>} />
  ),
  7: ({ cena: c }) => {
    const a = em(c, "outra"), g = em(c, "grande");
    return (
      <Quadro tela={<Campo total0={1} moedas={[{ x: 52, y: 60, pega: a + 0.7 }, { x: 98, y: 58, pega: em(c, "5") + 0.3, valor: 5 }]} ini={[30, 62]} trechos={[{ t0: a - 0.2, t1: a + 0.7, dx: 22, dy: 0 }, { t0: g - 0.5, t1: em(c, "5") + 0.3, dx: 46, dy: -2 }]} />}
        sons={[{ t: a + 0.7, tipo: "plim" }, { t: em(c, "5") + 0.3, tipo: "contagem" }]}
        codigo={de((i) => (i <= 6 ? { marca: i === 4 ? a : undefined, ate: g } : { t: g, marca: em(c, "5") }))} />
    );
  },
  8: ({ cena: c }) => (
    <Quadro tela={<Campo moedas={[]} ini={[98, 62]} total0={7} />} sons={[{ t: em(c, "interpolacao"), tipo: "plim" }]}
      codigo={de((i) => ({ marca: i === 5 ? em(c, "interpolacao") : undefined }))}
      extra={<Etiqueta t={em(c, "tela")} x={540} y={1630} txt='$"x {moedas}" → x 7' cor={RPG.amarelo} tam={32} />} />
  ),
  9: ({ cena: c }) => (
    <Quadro tela={<Campo moedas={[]} ini={[98, 62]} total0={7} />} sons={[{ t: em(c, "int"), tipo: "pop" }, { t: em(c, "soma"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "int")} x={540} y={1180} txt="int = número inteiro" tam={44} />
        <Etiqueta t={em(c, "soma")} x={540} y={1400} txt="+= soma ao que já tem" cor={RPG.verde} tam={40} />
      </>} />
  ),
  10: ({ cena: c }) => (
    <Quadro tela={<Campo moedas={[]} ini={[98, 62]} total0={7} />} sons={[{ t: em(c, "bolsa"), tipo: "pop" }, { t: em(c, "proximo"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "7")} x={540} y={1150} txt="moedas = 7" cor={RPG.amarelo} tam={44} />
        <Etiqueta t={em(c, "bolsa")} x={540} y={1330} txt="QUANTAS CABEM NA BOLSA?" tam={34} />
        <Etiqueta t={em(c, "proximo")} x={540} y={1510} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
      </>} />
  ),
};

export const RpgEp07: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
