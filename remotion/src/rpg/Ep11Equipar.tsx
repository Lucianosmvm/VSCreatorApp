import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Caixa, Etiqueta, Faixa, Fundo, Painel, RPG, Tela, TextoPixel, useT, type LinhaRpg } from "./Kit";
import { Campo } from "./Ep07Moeda";
import { Espada } from "./Ep09Ferreiro";

// RPG Code (C# na Unity), episódio 11: equipar a espada (bool). 11 cenas, 9:16, ~56 s.
const PASTA = "videos/rpg-code-11-equipar-a-espada-mwt4rmjz/";

const CODIGO = [
  "bool equipada = false;",
  "",
  "void Update()",
  "{",
  "    if (Keyboard.current.eKey.wasPressedThisFrame)",
  "        equipada = !equipada;",
  "    espadaNaMao.SetActive(equipada);",
  "}",
];
const de = (f: (i: number) => Partial<LinhaRpg> | null): LinhaRpg[] =>
  CODIGO.flatMap((txt, i) => {
    const r = f(i);
    return r === null ? [] : [{ txt, ...r }];
  });

// Valor do bool no tempo t: começa em `ini` e inverte a cada aperto de E.
const valor = (t: number, ini: boolean, apertos: number[]) => apertos.reduce((v, a) => (t >= a ? !v : v), ini);

// Campo com o Artur parado; espada na mão quando equipada, senão ícone na bolsa; tecla E no canto.
const Cena: React.FC<{ ini?: boolean; apertos?: number[]; tecla?: boolean }> = ({ ini = false, apertos = [], tecla = true }) => {
  const { t } = useT();
  const eq = valor(t, ini, apertos);
  const apertando = apertos.some((a) => t >= a && t < a + 0.35);
  return (
    <>
      <Campo moedas={[]} ini={[60, 62]} total0={39} semArma />
      {eq && <g transform="translate(66 46) rotate(-25)"><Espada x={0} y={0} madeira /></g>}
      <Caixa x={96} y={58} w={34} h={18}>
        <TextoPixel x={99} y={64} txt="BOLSA" tam={3} cor={RPG.cinza} />
        {!eq && <g transform="translate(110 64) rotate(90)"><Espada x={0} y={-8} madeira /></g>}
      </Caixa>
      {tecla && (
        <g>
          <rect x={6} y={74} width={11} height={11} fill={apertando ? RPG.amarelo : "#1b1446"} stroke={RPG.branco} strokeWidth={0.6} />
          <TextoPixel x={11.5} y={82} txt="E" tam={6} cor={apertando ? "#1b1020" : RPG.branco} meio />
        </g>
      )}
    </>
  );
};

// Etiqueta que mostra o valor atual do bool e troca de cor.
const Chip: React.FC<{ ini?: boolean; apertos?: number[]; t0?: number; y?: number }> = ({ ini = false, apertos = [], t0 = 0, y = 1500 }) => {
  const { t } = useT();
  const eq = valor(t, ini, apertos);
  return <Etiqueta t={t0} x={540} y={y} txt={`equipada = ${eq}`} cor={eq ? RPG.verde : RPG.vermelho} tam={44} />;
};

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" | "contagem" };
const Quadro: React.FC<{ tela: React.ReactNode; codigo?: LinhaRpg[]; extra?: React.ReactNode; sons?: Som[] }> = ({ tela, codigo, extra, sons = [] }) => (
  <AbsoluteFill>
    <Fundo />
    <Faixa ep="EP. 11" acao="Equipar:" destaque="bool" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo="Equipamento.cs · Unity" linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons as never} />
  </AbsoluteFill>
);

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro tela={<Cena tecla={false} />} sons={[{ t: em(c, "mao"), tipo: "pop" }, { t: em(c, "bolsa"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={0.2} x={540} y={1150} txt="dano 5 · peso 1.5f ✓" cor={RPG.verde} tam={36} />
        <Etiqueta t={em(c, "mao")} x={540} y={1340} txt="na mão ou na bolsa?" tam={44} />
      </>} />
  ),
  1: ({ cena: c }) => (
    <Quadro tela={<Cena tecla={false} />} sons={[{ t: em(c, "sim"), tipo: "pop" }, { t: em(c, "bool"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "sim")} x={360} y={1180} txt="SIM" cor={RPG.verde} tam={60} />
        <Etiqueta t={em(c, "nao")} x={720} y={1180} txt="NÃO" cor={RPG.vermelho} tam={60} />
        <Etiqueta t={em(c, "bool")} x={540} y={1420} txt="bool" tam={110} />
      </>} />
  ),
  2: ({ cena: c }) => (
    <Quadro tela={<Cena tecla={false} />} sons={[{ t: em(c, "true"), tipo: "pop" }, { t: em(c, "false"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={em(c, "true")} x={540} y={1200} txt="true = verdadeiro" cor={RPG.verde} tam={48} />
        <Etiqueta t={em(c, "false")} x={540} y={1420} txt="false = falso" cor={RPG.vermelho} tam={48} />
      </>} />
  ),
  3: ({ cena: c }) => (
    <Quadro tela={<Cena tecla={false} />} sons={[{ t: em(c, "bool"), tipo: "tecla" }, { t: em(c, "guardada"), tipo: "pop" }]}
      codigo={de((i) => (i === 0 ? { t: em(c, "bool"), marca: em(c, "false") } : null))}
      extra={<Chip t0={em(c, "false")} y={1450} />} />
  ),
  4: ({ cena: c }) => {
    const e = em(c, "e");
    return (
      <Quadro tela={<Cena />} sons={[{ t: em(c, "tecla"), tipo: "tecla" }, { t: em(c, "inverte"), tipo: "whoosh" }]}
        codigo={de((i) => (i <= 4 || i === 7 ? { t: i >= 2 && i !== 7 ? em(c, "jogador") : undefined, marca: i === 4 ? e : undefined } : null))} />
    );
  },
  5: ({ cena: c }) => {
    const a = em(c, "nao");
    return (
      <Quadro tela={<Cena />} sons={[{ t: em(c, "exclamacao"), tipo: "pop" }, { t: em(c, "vira"), tipo: "plim" }, { t: em(c, "vira", 2), tipo: "plim" }]}
        codigo={de((i) => (i <= 5 || i === 7 ? { t: i === 5 ? em(c, "exclamacao") : undefined, marca: i === 5 ? a : undefined } : null))}
        extra={<>
          <Etiqueta t={em(c, "vira")} x={290} y={1590} txt="!false = true" cor={RPG.verde} tam={26} />
          <Etiqueta t={em(c, "vira", 2)} x={790} y={1590} txt="!true = false" cor={RPG.vermelho} tam={26} />
        </>} />
    );
  },
  6: ({ cena: c }) => {
    const m = em(c, "mostra");
    return (
      <Quadro tela={<Cena apertos={[m - 0.3]} />} sons={[{ t: m - 0.3, tipo: "tecla" }, { t: m, tipo: "plim" }]}
        codigo={de((i) => ({ t: i === 6 ? em(c, "setactive") : undefined, marca: i === 6 ? m : undefined }))}
        extra={<Etiqueta t={m} x={900} y={950} txt="true ✓" cor={RPG.verde} tam={34} />} />
    );
  },
  7: ({ cena: c }) => {
    const a = em(c, "apertou");
    return (
      <Quadro tela={<Cena ini apertos={[a + 0.2]} />} sons={[{ t: a + 0.2, tipo: "tecla" }, { t: em(c, "some"), tipo: "whoosh" }]}
        codigo={de((i) => ({ marca: i === 5 ? a + 0.2 : i === 6 ? em(c, "some") : undefined }))}
        extra={<Chip ini apertos={[a + 0.2]} y={950} />} />
    );
  },
  8: ({ cena: c }) => {
    const b = em(c, "basta");
    return (
      <Quadro tela={<Cena ini tecla={false} />} sons={[{ t: em(c, "precisa"), tipo: "erro" }, { t: b, tipo: "plim" }]}
        codigo={[
          { txt: "if (equipada == true)  // funciona", t: em(c, "if"), marca: em(c, "precisa"), ate: b, cor: RPG.cinza },
          { txt: "if (equipada)          // mais limpo ✓", t: em(c, "so"), marca: b, cor: RPG.verde },
          { txt: "    Atacar();", t: em(c, "so") },
        ]} />
    );
  },
  9: ({ cena: c }) => (
    <Quadro tela={<Cena ini apertos={[0.8, 1.6, 2.4]} />} sons={[{ t: em(c, "interruptor"), tipo: "plim" }, { t: em(c, "equipada"), tipo: "pop" }, { t: em(c, "porta"), tipo: "pop" }, { t: em(c, "pausado"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={em(c, "interruptor")} x={540} y={1130} txt="bool = interruptor" tam={46} />
        <Etiqueta t={em(c, "equipada")} x={540} y={1290} txt="bool equipada" cor={RPG.verde} tam={34} />
        <Etiqueta t={em(c, "porta")} x={540} y={1410} txt="bool portaAberta" cor={RPG.azul} tam={34} />
        <Etiqueta t={em(c, "pausado")} x={540} y={1530} txt="bool jogoPausado" cor={RPG.laranja} tam={34} />
      </>} />
  ),
  10: ({ cena: c }) => (
    <Quadro tela={<Cena ini tecla={false} />} sons={[{ t: em(c, "slime"), tipo: "erro" }, { t: em(c, "proximo"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={0.3} x={540} y={1150} txt="equipada = true ✓" cor={RPG.verde} tam={36} />
        <Etiqueta t={em(c, "armadura")} x={540} y={1330} txt="🛡 FALTA A ARMADURA" tam={40} />
        <Etiqueta t={em(c, "proximo")} x={540} y={1510} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
      </>} />
  ),
};

export const RpgEp11: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
