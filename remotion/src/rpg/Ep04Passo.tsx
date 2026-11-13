import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Caixa, Etiqueta, Faixa, Fundo, Heroi, Painel, RPG, Tela, TextoPixel, rampa, useT, type LinhaRpg } from "./Kit";
import { Campo } from "./Ep02Classe";

// RPG Code (C# na Unity), episódio 04: o primeiro passo (Vector2 e posição). 11 cenas, 9:16, ~48 s.
const PASTA = "videos/rpg-code-04-o-primeiro-passo-mwey4rdo/";

const CODIGO = [
  "Vector2 posicao = new Vector2(3, 2);",
  "transform.position = posicao;",
  "",
  "posicao.x += 1; // passo à direita",
  "transform.position = posicao;",
  "",
  "posicao.y += 1; // passo para cima",
  "transform.position = posicao;",
];
const de = (f: (i: number) => Partial<LinhaRpg> | null): LinhaRpg[] =>
  CODIGO.flatMap((txt, i) => {
    const r = f(i);
    return r === null ? [] : [{ txt, ...r }];
  });

// Grade do mapa: origem no canto inferior esquerdo, 1 casa = 10 px da grade.
const O = { x: 18, y: 86 }, CASA = 10;
const px = (x: number) => O.x + x * CASA, py = (y: number) => O.y - y * CASA;
type Passo = { t: number; x: number; y: number };

const Grade: React.FC<{ aparece?: number; eixos?: [number, number]; passos?: Passo[]; guias?: number; rotulo?: boolean }> = ({ aparece = -1, eixos, passos = [], guias, rotulo = true }) => {
  const { t, f } = useT();
  const g = rampa(t, aparece, aparece + 0.5);
  // posição atual: anda 0,35 s entre um passo e o próximo
  let pos = passos[0] ?? { x: 3, y: 2, t: 0 };
  let x = pos.x, y = pos.y;
  for (let i = 1; i < passos.length; i++) {
    const p = passos[i];
    if (t >= p.t) {
      const k = rampa(t, p.t, p.t + 0.35);
      x = pos.x + (p.x - pos.x) * k;
      y = pos.y + (p.y - pos.y) * k;
      pos = { ...p, x: k >= 1 ? p.x : pos.x, y: k >= 1 ? p.y : pos.y };
      if (k >= 1) { x = p.x; y = p.y; }
    }
  }
  const andando = passos.some((p, i) => i > 0 && t >= p.t && t < p.t + 0.35);
  const pulo = andando ? Math.abs(Math.sin((f % 9) / 9 * Math.PI)) * 2 : 0;
  const ex = eixos ? rampa(t, eixos[0], eixos[0] + 0.4) : 0, ey = eixos ? rampa(t, eixos[1], eixos[1] + 0.4) : 0;
  return (
    <>
      <rect x={0} y={0} width={135} height={95} fill="#3fa34d" />
      {Array.from({ length: 40 }, (_, i) => <rect key={i} x={(i * 17) % 135} y={(i * 11) % 95} width={2} height={1} fill="#5cc366" />)}
      <g opacity={g}>
        {Array.from({ length: 12 }, (_, i) => <rect key={`v${i}`} x={px(i)} y={py(7)} width={0.4} height={70} fill="#2a6a3a" />)}
        {Array.from({ length: 8 }, (_, j) => <rect key={`h${j}`} x={O.x} y={py(j)} width={110} height={0.4} fill="#2a6a3a" />)}
        {Array.from({ length: 11 }, (_, i) => <TextoPixel key={`nx${i}`} x={px(i)} y={O.y + 6} txt={String(i)} tam={3} cor="#1b1020" meio />)}
        {Array.from({ length: 7 }, (_, j) => <TextoPixel key={`ny${j}`} x={O.x - 5} y={py(j) + 1.2} txt={String(j)} tam={3} cor="#1b1020" meio />)}
      </g>
      {ex > 0 && <g opacity={ex}><rect x={O.x} y={O.y - 0.8} width={108 * ex} height={1.6} fill={RPG.vermelho} /><TextoPixel x={O.x + 108 * ex + 3} y={O.y + 1.6} txt="X" tam={5} cor={RPG.vermelho} /></g>}
      {ey > 0 && <g opacity={ey}><rect x={O.x - 0.8} y={O.y - 70 * ey} width={1.6} height={70 * ey} fill={RPG.azul} /><TextoPixel x={O.x - 1.8} y={O.y - 70 * ey - 2} txt="Y" tam={5} cor={RPG.azul} /></g>}
      {guias !== undefined && t >= guias && (
        <g opacity={rampa(t, guias, guias + 0.3)}>
          <rect x={O.x} y={py(y) - 0.4} width={x * CASA} height={0.8} fill={RPG.amarelo} opacity={0.8} />
          <rect x={px(x) - 0.4} y={py(y)} width={0.8} height={y * CASA} fill={RPG.amarelo} opacity={0.8} />
        </g>
      )}
      <rect x={px(x) - 1.6} y={py(y) - 1.6} width={3.2} height={3.2} fill={RPG.amarelo} />
      <g transform={`translate(${px(x) - 6} ${py(y) - 15 - pulo})`}><Heroi x={0} y={0} classe="guerreiro" /></g>
      {rotulo && (
        <Caixa x={px(x) - 11} y={py(y) - 25} w={22} h={8}>
          <TextoPixel x={px(x)} y={py(y) - 19.4} txt={`(${Math.round(x)},${Math.round(y)})`} tam={3.6} cor={RPG.amarelo} meio />
        </Caixa>
      )}
    </>
  );
};

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" };
const Quadro: React.FC<{ tela: React.ReactNode; codigo?: LinhaRpg[]; extra?: React.ReactNode; sons?: Som[] }> = ({ tela, codigo, extra, sons = [] }) => (
  <AbsoluteFill>
    <Fundo />
    <Faixa ep="EP. 04" acao="Andar:" destaque="Vector2" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo="Movimento.cs · Unity" linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons} />
  </AbsoluteFill>
);
const P0: Passo = { t: 0, x: 3, y: 2 };

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro tela={<Campo herois={[{ classe: "guerreiro", nome: "ARTUR" }]} />} sons={[{ t: em(c, "passo"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={0.2} x={540} y={1150} txt='nome = "Artur" ✓' cor={RPG.verde} tam={34} />
        <Etiqueta t={em(c, "passo")} x={540} y={1350} txt="1º PASSO NO MAPA" tam={48} />
      </>} />
  ),
  1: ({ cena: c }) => (
    <Quadro tela={<Grade aparece={em(c, "grade")} passos={[P0]} rotulo={false} />} sons={[{ t: em(c, "grade"), tipo: "whoosh" }, { t: em(c, "x"), tipo: "pop" }, { t: em(c, "y"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={em(c, "grade")} x={540} y={1180} txt="mapa = grade" tam={48} />
        <Etiqueta t={em(c, "x")} x={360} y={1400} txt="x" cor={RPG.vermelho} tam={80} />
        <Etiqueta t={em(c, "y")} x={720} y={1400} txt="y" cor={RPG.azul} tam={80} />
      </>} />
  ),
  2: ({ cena: c }) => (
    <Quadro tela={<Grade eixos={[em(c, "x"), em(c, "y")]} passos={[P0]} rotulo={false} />} sons={[{ t: em(c, "x"), tipo: "whoosh" }, { t: em(c, "y"), tipo: "whoosh" }]}
      extra={<>
        <Etiqueta t={em(c, "lados")} x={540} y={1180} txt="x → para os lados" cor={RPG.vermelho} tam={40} />
        <Etiqueta t={em(c, "cima")} x={540} y={1380} txt="y ↑ para cima" cor={RPG.azul} tam={40} />
      </>} />
  ),
  3: ({ cena: c }) => (
    <Quadro tela={<Grade eixos={[0, 0]} passos={[P0]} guias={em(c, "tres")} />} sons={[{ t: em(c, "3"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "3")} x={540} y={1180} txt="(3, 2)" tam={80} />
        <Etiqueta t={em(c, "tres")} x={540} y={1420} txt="3 → direita · 2 ↑ cima" tam={32} />
      </>} />
  ),
  4: ({ cena: c }) => (
    <Quadro tela={<Grade eixos={[0, 0]} passos={[P0]} guias={0} />} sons={[{ t: em(c, "vector2"), tipo: "plim" }]}
      codigo={de((i) => (i === 0 ? { t: em(c, "vector2"), marca: em(c, "vector2") } : null))}
      extra={<Etiqueta t={em(c, "vector2")} x={540} y={1400} txt="Vector2 = (x, y)" cor={RPG.azul} tam={46} />} />
  ),
  5: ({ cena: c }) => {
    const p = em(c, "position");
    return (
      <Quadro tela={<Grade eixos={[0, 0]} passos={[P0]} />} sons={[{ t: em(c, "new"), tipo: "tecla" }, { t: p, tipo: "plim" }]}
        codigo={de((i) => (i === 0 ? { marca: em(c, "new"), ate: p } : i === 1 ? { t: em(c, "transform"), marca: p } : null))} />
    );
  },
  6: ({ cena: c }) => (
    <Quadro tela={<Grade eixos={[0, 0]} passos={[P0]} />} sons={[{ t: em(c, "somamos"), tipo: "tecla" }]}
      codigo={de((i) => (i <= 2 ? {} : i === 3 ? { t: em(c, "somamos"), marca: em(c, "x") } : null))}
      extra={<Etiqueta t={em(c, "x")} x={540} y={1450} txt="x + 1" cor={RPG.vermelho} tam={60} />} />
  ),
  7: ({ cena: c }) => {
    const a = em(c, "anda");
    return (
      <Quadro tela={<Grade eixos={[0, 0]} passos={[P0, { t: a, x: 4, y: 2 }]} />} sons={[{ t: em(c, "4"), tipo: "pop" }, { t: a, tipo: "whoosh" }]}
        codigo={de((i) => (i <= 2 ? {} : i === 3 || i === 4 ? { marca: i === 3 ? em(c, "4") : a } : null))}
        extra={<Etiqueta t={em(c, "4")} x={540} y={1500} txt="x: 3 → 4" cor={RPG.vermelho} tam={52} />} />
    );
  },
  8: ({ cena: c }) => {
    const s = em(c, "somamos") + 0.6;
    return (
      <Quadro tela={<Grade eixos={[0, 0]} passos={[{ t: 0, x: 4, y: 2 }, { t: s, x: 4, y: 3 }]} />} sons={[{ t: s, tipo: "whoosh" }, { t: em(c, "cresce"), tipo: "pop" }]}
        codigo={de((i) => (i <= 5 ? {} : { t: em(c, "somamos"), marca: i === 6 ? em(c, "y") : s }))}
        extra={<Etiqueta t={em(c, "cresce")} x={540} y={1610} txt="na Unity, y ↑ cresce para cima" cor={RPG.azul} tam={28} />} />
    );
  },
  9: ({ cena: c }) => (
    <Quadro tela={<Grade eixos={[0, 0]} passos={[{ t: 0, x: 4, y: 3 }]} guias={em(c, "x")} />} sons={[{ t: em(c, "posicao"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "posicao")} x={540} y={1180} txt="posição = (x, y)" tam={52} />
        <Etiqueta t={em(c, "mudam")} x={540} y={1400} txt="muda durante o jogo" cor={RPG.verde} tam={38} />
      </>} />
  ),
  10: ({ cena: c }) => (
    <Quadro tela={<Grade eixos={[0, 0]} passos={[{ t: 0, x: 4, y: 3 }]} rotulo={false} />} sons={[{ t: em(c, "setas"), tipo: "pop" }, { t: em(c, "proximo"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "digitar")} x={540} y={1150} txt="digitar números? ✗" cor={RPG.vermelho} tam={34} />
        <Etiqueta t={em(c, "setas")} x={540} y={1330} txt="← ↑ → ↓ ?" tam={64} />
        <Etiqueta t={em(c, "proximo")} x={540} y={1510} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
      </>} />
  ),
};

export const RpgEp04: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
