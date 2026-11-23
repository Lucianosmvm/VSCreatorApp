import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Caixa, Etiqueta, Faixa, Fundo, Painel, RPG, Slime, Tela, TextoPixel, rampa, useT, type LinhaRpg } from "./Kit";
import { Campo } from "./Ep07Moeda";
import { Espada } from "./Ep09Ferreiro";

// RPG Code (C# na Unity), episódio 12: a armadura reduz o dano (operadores aritméticos). 11 cenas, 9:16, ~61 s.
const PASTA = "videos/rpg-code-12-a-armadura-mwt55ovz/";

const CODIGO = [
  "int ataque = 8;   // força do slime",
  "int defesa = 3;   // armadura de couro",
  "",
  "int dano = ataque - defesa;   // 5",
  "vida -= dano;                 // 95",
  "",
  "int critico = dano * 2;       // 10",
  "int metade = dano / 2;        // 2 (!)",
];
const de = (f: (i: number) => Partial<LinhaRpg> | null): LinhaRpg[] =>
  CODIGO.flatMap((txt, i) => {
    const r = f(i);
    return r === null ? [] : [{ txt, ...r }];
  });

type Golpe = { t: number; dano: number; cor?: string };

// Barra de vida em pixel art (coordenadas da grade).
const Barra: React.FC<{ x: number; y: number; vida: number; max: number; rotulo: string }> = ({ x, y, vida, max, rotulo }) => (
  <Caixa x={x} y={y} w={40} h={12}>
    <TextoPixel x={x + 3} y={y + 5.4} txt={`${rotulo} ${Math.round(vida)}`} tam={3} />
    <rect x={x + 3} y={y + 7} width={34} height={2.6} fill="#2a2240" />
    <rect x={x + 3} y={y + 7} width={34 * Math.max(0, vida) / max} height={2.6} fill={vida / max > 0.5 ? RPG.verde : RPG.amarelo} />
  </Caixa>
);

// Batalha: Artur com espada e armadura à esquerda, slime à direita; cada golpe tira vida do Artur.
const Batalha: React.FC<{ armadura?: number; golpes?: Golpe[]; vida0?: number }> = ({ armadura, golpes = [], vida0 = 100 }) => {
  const { t } = useT();
  const vida = golpes.reduce((v, g) => v - (t >= g.t ? g.dano : 0), vida0);
  const atual = golpes.filter((g) => t >= g.t && t < g.t + 0.9).pop();
  const tremor = atual && t < atual.t + 0.25 ? Math.sin(t * 90) * 1.2 : 0;
  const salto = (g: Golpe) => rampa(t, g.t, g.t + 0.9);
  return (
    <>
      <Campo moedas={[]} ini={[40 + tremor, 64]} total0={0} contador={false} semArma />
      <g transform="translate(46 48) rotate(-20)"><Espada x={0} y={0} madeira /></g>
      {armadura !== undefined && t >= armadura && (
        <g opacity={rampa(t, armadura, armadura + 0.3)}>
          <rect x={36.5} y={56} width={7} height={5} fill="#8b5a2b" stroke="#3a2418" strokeWidth={0.4} />
          <Caixa x={20} y={22} w={22} h={9}><TextoPixel x={31} y={28.4} txt="DEF 3" tam={3.4} cor={RPG.azul} meio /></Caixa>
        </g>
      )}
      <g transform="translate(78 52) scale(1.4)"><Slime x={0} y={0} /></g>
      <Caixa x={79} y={22} w={22} h={9}><TextoPixel x={90} y={28.4} txt="ATQ 8" tam={3.4} cor={RPG.vermelho} meio /></Caixa>
      <Barra x={4} y={4} vida={vida} max={100} rotulo="ARTUR" />
      {golpes.map((g, i) => (t >= g.t && t < g.t + 0.9 ? (
        <TextoPixel key={i} x={40} y={46 - salto(g) * 10} txt={`-${g.dano}`} tam={7} cor={g.cor ?? RPG.vermelho} meio />
      ) : null))}
    </>
  );
};

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" | "contagem" };
const Quadro: React.FC<{ tela: React.ReactNode; codigo?: LinhaRpg[]; extra?: React.ReactNode; sons?: Som[] }> = ({ tela, codigo, extra, sons = [] }) => (
  <AbsoluteFill>
    <Fundo />
    <Faixa ep="EP. 12" acao="Dano:" destaque="+ - * /" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo="Combate.cs · Unity" linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons as never} />
  </AbsoluteFill>
);

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro tela={<Batalha />} sons={[{ t: em(c, "proteger"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={0.2} x={540} y={1150} txt="equipada = true ✓" cor={RPG.verde} tam={36} />
        <Etiqueta t={em(c, "proteger")} x={540} y={1340} txt="e a proteção?" tam={46} />
      </>} />
  ),
  1: ({ cena: c }) => (
    <Quadro tela={<Batalha armadura={em(c, "armadura")} />} sons={[{ t: em(c, "armadura"), tipo: "plim" }, { t: em(c, "3"), tipo: "pop" }]}
      codigo={de((i) => (i === 1 ? { t: em(c, "3"), marca: em(c, "defesa") } : null))}
      extra={<Etiqueta t={em(c, "3")} x={540} y={1450} txt="defesa = 3" cor={RPG.azul} tam={56} />} />
  ),
  2: ({ cena: c }) => (
    <Quadro tela={<Batalha armadura={0} />} sons={[{ t: em(c, "8"), tipo: "erro" }]}
      codigo={de((i) => (i <= 1 ? { t: i === 0 ? em(c, "8") : undefined, marca: i === 0 ? em(c, "8") : undefined } : null))}
      extra={<Etiqueta t={em(c, "quanto")} x={540} y={1520} txt="quanto de dano?" cor={RPG.amarelo} tam={44} />} />
  ),
  3: ({ cena: c }) => {
    const r = em(c, "5");
    return (
      <Quadro tela={<Batalha armadura={0} />} sons={[{ t: em(c, "menos"), tipo: "tecla" }, { t: r, tipo: "contagem" }]}
        codigo={de((i) => (i <= 2 ? {} : i === 3 ? { t: em(c, "dano"), marca: r } : null))}
        extra={<Etiqueta t={em(c, "8", 1) || r} x={540} y={1560} txt="8 - 3 = 5" cor={RPG.verde} tam={56} />} />
    );
  },
  4: ({ cena: c }) => {
    const p = em(c, "perde");
    return (
      <Quadro tela={<Batalha armadura={0} golpes={[{ t: p, dano: 5 }]} />} sons={[{ t: p, tipo: "erro" }, { t: em(c, "95"), tipo: "pop" }]}
        codigo={de((i) => (i <= 3 ? {} : i === 4 ? { t: p, marca: em(c, "95") } : null))}
        extra={<Etiqueta t={em(c, "95")} x={540} y={1610} txt="100 - 5 = 95" cor={RPG.amarelo} tam={44} />} />
    );
  },
  5: ({ cena: c }) => {
    const ops: [string, string, string][] = [["mais", "+", "soma"], ["menos", "-", "subtrai"], ["vezes", "*", "multiplica"], ["dividido", "/", "divide"], ["resto", "%", "resto"]];
    return (
      <Quadro tela={<Batalha armadura={0} vida0={95} />} sons={ops.map(([w]) => ({ t: em(c, w), tipo: "pop" as const }))}
        extra={<>{ops.map(([w, s, n], i) => <Etiqueta key={s} t={em(c, w)} x={540} y={1110 + i * 110} txt={`${s}   ${n}`} cor={[RPG.verde, RPG.vermelho, RPG.amarelo, RPG.azul, RPG.laranja][i]} tam={44} />)}</>} />
    );
  },
  6: ({ cena: c }) => {
    const d = em(c, "dobra");
    return (
      <Quadro tela={<Batalha armadura={0} vida0={95} golpes={[{ t: em(c, "10"), dano: 10, cor: RPG.amarelo }]} />} sons={[{ t: d, tipo: "tecla" }, { t: em(c, "10"), tipo: "erro" }]}
        codigo={de((i) => (i <= 5 ? {} : i === 6 ? { t: em(c, "critico"), marca: d } : null))}
        extra={<Etiqueta t={em(c, "10")} x={540} y={1610} txt="CRÍTICO: 5 * 2 = 10" cor={RPG.amarelo} tam={40} />} />
    );
  },
  7: ({ cena: c }) => {
    const n = em(c, "nao");
    return (
      <Quadro tela={<Batalha armadura={0} vida0={85} />} sons={[{ t: em(c, "divisao"), tipo: "tecla" }, { t: n, tipo: "erro" }]}
        codigo={de((i) => (i <= 6 ? {} : { t: em(c, "divisao"), marca: em(c, "2") }))}
        extra={<Etiqueta t={n} x={540} y={940} txt="int: 5 / 2 = 2 (não 2,5!)" cor={RPG.vermelho} tam={36} />} />
    );
  },
  8: ({ cena: c }) => (
    <Quadro tela={<Batalha armadura={0} vida0={85} />} sons={[{ t: em(c, "fora"), tipo: "erro" }, { t: em(c, "float"), tipo: "plim" }]}
      codigo={[
        { txt: "int a = 5 / 2;       // 2  ✗ perde o ,5", t: em(c, "int"), marca: em(c, "fora"), ate: em(c, "float"), cor: RPG.vermelho },
        { txt: "float b = 5f / 2;    // 2.5 ✓", t: em(c, "float"), marca: em(c, "float"), cor: RPG.verde },
      ]} />
  ),
  9: ({ cena: c }) => (
    <Quadro tela={<Batalha armadura={0} vida0={85} />} sons={[{ t: em(c, "contas"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "aritmeticos")} x={540} y={1150} txt="+  -  *  /  %" tam={72} />
        <Etiqueta t={em(c, "dano")} x={540} y={1360} txt="dano · vida · crítico · defesa" cor={RPG.verde} tam={34} />
      </>} />
  ),
  10: ({ cena: c }) => (
    <Quadro tela={<Batalha armadura={0} vida0={85} />} sons={[{ t: em(c, "maior"), tipo: "pop" }, { t: em(c, "negativo"), tipo: "erro" }, { t: em(c, "proximo"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "maior")} x={540} y={1150} txt="defesa 10 · ataque 8" cor={RPG.azul} tam={40} />
        <Etiqueta t={em(c, "negativo")} x={540} y={1330} txt="8 - 10 = -2 ?!" cor={RPG.vermelho} tam={56} />
        <Etiqueta t={em(c, "proximo")} x={540} y={1510} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
      </>} />
  ),
};

export const RpgEp12: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
