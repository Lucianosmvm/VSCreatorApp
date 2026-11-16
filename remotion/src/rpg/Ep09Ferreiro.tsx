import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Caixa, Etiqueta, Faixa, Fundo, Heroi, Painel, RPG, Tela, TextoPixel, useT, type LinhaRpg } from "./Kit";

// RPG Code (C# na Unity), episódio 09: o ferreiro (if / else). 11 cenas, 9:16, ~57 s.
const PASTA = "videos/rpg-code-09-o-ferreiro-mwj4fp8p/";

const CODIGO = [
  "void Comprar(int preco)",
  "{",
  "    if (moedas >= preco)",
  "    {",
  "        moedas -= preco;",
  "        Debug.Log(\"Espada comprada!\");",
  "    }",
  "    else",
  "    {",
  "        Debug.Log(\"Moedas insuficientes!\");",
  "    }",
  "}",
];
const de = (f: (i: number) => Partial<LinhaRpg> | null): LinhaRpg[] =>
  CODIGO.flatMap((txt, i) => {
    const r = f(i);
    return r === null ? [] : [{ txt, ...r }];
  });
const IF = [2, 3, 4, 5, 6], ELSE = [7, 8, 9, 10];

const ITENS = [{ nome: "ESPADA FERRO", preco: 120 }, { nome: "ESPADA MADEIRA", preco: 60 }];

const Espada: React.FC<{ x: number; y: number; madeira?: boolean }> = ({ x, y, madeira }) => (
  <g>
    <rect x={x} y={y} width={1.6} height={9} fill={madeira ? "#b07a3a" : "#dfe6ee"} />
    <rect x={x - 1.6} y={y + 9} width={4.8} height={1.2} fill="#e8b830" />
    <rect x={x + 0.2} y={y + 10.2} width={1.2} height={2.4} fill="#5a3a1a" />
  </g>
);

// Loja: ferreiro atrás do balcão, menu de itens, bolsa e diálogo.
const Loja: React.FC<{ sel?: number; selT?: number; moedas: (t: number) => number; fala?: { t: number; txt: string; cor?: string }; temEspada?: number }> = ({ sel, selT = 0, moedas, fala, temEspada }) => {
  const { t, f } = useT();
  const m = moedas(t);
  return (
    <>
      <rect x={0} y={0} width={135} height={95} fill="#5a3a2a" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={0} y={i * 6} width={135} height={0.6} fill="#4a2e20" />)}
      <rect x={6} y={8} width={20} height={14} fill="#2a1a12" /><rect x={9} y={14} width={14} height={6} fill={Math.floor(f / 5) % 2 ? "#ff8a3d" : "#ffb03d"} />
      <rect x={8} y={36} width={16} height={6} fill="#555b66" /><rect x={12} y={42} width={8} height={4} fill="#3a3f48" />
      <g transform="translate(36 22) scale(1.4)"><Heroi x={0} y={0} classe="arqueiro" flip /></g>
      <rect x={0} y={46} width={70} height={8} fill="#8b5a2b" /><rect x={0} y={46} width={70} height={1.4} fill="#b07a3a" />
      <Espada x={20} y={24} /><Espada x={60} y={24} madeira />
      <g transform="translate(10 62) scale(1.3)"><Heroi x={0} y={0} classe="guerreiro" /></g>
      {temEspada !== undefined && t >= temEspada && <Espada x={28} y={66} madeira />}
      <Caixa x={74} y={4} w={58} h={34}>
        {ITENS.map((it, i) => (
          <g key={it.nome}>
            <TextoPixel x={80} y={15 + i * 12} txt={it.nome} tam={2.9} cor={sel === i && t >= selT ? RPG.amarelo : RPG.branco} />
            <TextoPixel x={80} y={20.4 + i * 12} txt={`${it.preco} moedas`} tam={2.7} cor={it.preco > m && temEspada === undefined ? RPG.vermelho : RPG.verde} />
          </g>
        ))}
        {sel !== undefined && t >= selT && Math.floor(f / 8) % 2 === 0 && <TextoPixel x={76} y={15 + sel * 12} txt="▶" tam={3} cor={RPG.amarelo} />}
      </Caixa>
      <Caixa x={74} y={42} w={58} h={11}>
        <rect x={78} y={45} width={5} height={5} fill="#e8b830" />
        <TextoPixel x={86} y={50.4} txt={`x ${m}`} tam={4.4} cor={RPG.amarelo} />
      </Caixa>
      {fala && t >= fala.t && (
        <Caixa x={46} y={62} w={86} h={28}>
          <TextoPixel x={50} y={72} txt="FERREIRO:" tam={3.2} cor={RPG.laranja} />
          <TextoPixel x={50} y={82} txt={fala.txt.slice(0, Math.floor((t - fala.t) / 0.04))} tam={3.4} cor={fala.cor ?? RPG.branco} />
        </Caixa>
      )}
    </>
  );
};

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" | "contagem" };
const Quadro: React.FC<{ tela: React.ReactNode; codigo?: LinhaRpg[]; extra?: React.ReactNode; sons?: Som[] }> = ({ tela, codigo, extra, sons = [] }) => (
  <AbsoluteFill>
    <Fundo />
    <Faixa ep="EP. 09" acao="Comprar:" destaque="if/else" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo="Loja.cs · Unity" linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons as never} />
  </AbsoluteFill>
);
const fixo = (n: number) => () => n;

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro tela={<Loja moedas={fixo(99)} fala={{ t: em(c, "ferreiro"), txt: "BEM-VINDO!" }} />} sons={[{ t: em(c, "ferreiro"), tipo: "pop" }]}
      extra={<Etiqueta t={0.2} x={540} y={1250} txt="bolsa: 99/99 ✓" cor={RPG.verde} tam={40} />} />
  ),
  1: ({ cena: c }) => (
    <Quadro tela={<Loja sel={0} selT={em(c, "espada")} moedas={fixo(99)} />} sons={[{ t: em(c, "120"), tipo: "pop" }, { t: em(c, "comprar"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={em(c, "120")} x={540} y={1180} txt="preço: 120" tam={56} />
        <Etiqueta t={em(c, "comprar")} x={540} y={1400} txt="99 moedas dá?" cor={RPG.azul} tam={44} />
      </>} />
  ),
  2: ({ cena: c }) => (
    <Quadro tela={<Loja sel={0} moedas={fixo(99)} />} sons={[{ t: em(c, "if"), tipo: "tecla" }]}
      codigo={de((i) => (i <= 2 || i === 11 ? { t: i === 2 ? em(c, "if") : undefined, marca: i === 2 ? em(c, "maiores") : undefined } : null))} />
  ),
  3: ({ cena: c }) => (
    <Quadro tela={<Loja sel={0} moedas={fixo(99)} />} sons={[{ t: em(c, "bloco"), tipo: "tecla" }, { t: em(c, "espada"), tipo: "pop" }]}
      codigo={de((i) => (i <= 2 || i === 11 ? {} : IF.includes(i) ? { t: em(c, "bloco"), marca: i === 4 ? em(c, "tira") : i === 5 ? em(c, "espada") : undefined } : null))} />
  ),
  4: ({ cena: c }) => {
    const fa = em(c, "falso"), p = em(c, "pulado");
    return (
      <Quadro tela={<Loja sel={0} moedas={fixo(99)} />} sons={[{ t: fa, tipo: "erro" }, { t: p, tipo: "whoosh" }]}
        codigo={de((i) => (i <= 6 || i === 11 ? { marca: i === 2 ? em(c, "99") : undefined, ate: fa, apaga: i >= 3 && i <= 6 ? p : undefined } : null))}
        extra={<Etiqueta t={fa} x={540} y={1560} txt="99 >= 120 → false" cor={RPG.vermelho} tam={40} />} />
    );
  },
  5: ({ cena: c }) => (
    <Quadro tela={<Loja sel={0} moedas={fixo(99)} />} sons={[{ t: em(c, "else"), tipo: "plim" }]}
      codigo={de((i) => ({ apaga: i >= 3 && i <= 6 ? 0 : undefined, t: ELSE.includes(i) ? em(c, "else") : undefined, marca: i === 7 ? em(c, "senao") : undefined }))}
      extra={<Etiqueta t={em(c, "senao")} x={540} y={1640} txt="else = senão" cor={RPG.amarelo} tam={34} />} />
  ),
  6: ({ cena: c }) => (
    <Quadro tela={<Loja sel={0} moedas={fixo(99)} fala={{ t: em(c, "avisa"), txt: "MOEDAS INSUFICIENTES!", cor: RPG.vermelho }} />} sons={[{ t: em(c, "insuficientes"), tipo: "erro" }]}
      codigo={de((i) => ({ apaga: i >= 3 && i <= 6 ? 0 : undefined, marca: i === 9 ? em(c, "avisa") : undefined }))} />
  ),
  7: ({ cena: c }) => (
    <Quadro tela={<Loja sel={1} selT={em(c, "madeira")} moedas={fixo(99)} />} sons={[{ t: em(c, "madeira"), tipo: "tecla" }, { t: em(c, "60"), tipo: "pop" }]}
      extra={<Etiqueta t={em(c, "60")} x={540} y={1300} txt="preço: 60" cor={RPG.verde} tam={56} />} />
  ),
  8: ({ cena: c }) => {
    const v = em(c, "verdadeiro"), s = em(c, "39");
    return (
      <Quadro tela={<Loja sel={1} moedas={(t) => (t >= s - 0.3 ? 39 : 99)} temEspada={s} fala={{ t: s, txt: "ESPADA COMPRADA!", cor: RPG.verde }} />} sons={[{ t: v, tipo: "plim" }, { t: s - 0.3, tipo: "contagem" }]}
        codigo={de((i) => ({ apaga: ELSE.includes(i) ? v : undefined, marca: i === 2 ? v : i === 4 ? em(c, "roda") : undefined }))}
        extra={<Etiqueta t={s} x={250} y={930} txt="99 - 60 = 39" cor={RPG.verde} tam={30} />} />
    );
  },
  9: ({ cena: c }) => (
    <Quadro tela={<Loja moedas={fixo(39)} temEspada={0} />} sons={[{ t: em(c, "verdadeiro"), tipo: "pop" }, { t: em(c, "falso"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={em(c, "verdadeiro")} x={540} y={1150} txt="if → quando é true" cor={RPG.verde} tam={40} />
        <Etiqueta t={em(c, "falso")} x={540} y={1340} txt="else → quando é false" cor={RPG.vermelho} tam={40} />
        <Etiqueta t={em(c, "so")} x={540} y={1530} txt="sempre roda UM só" tam={40} />
      </>} />
  ),
  10: ({ cena: c }) => (
    <Quadro tela={<Loja moedas={fixo(39)} temEspada={0} />} sons={[{ t: em(c, "dano"), tipo: "pop" }, { t: em(c, "proximo"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "espada")} x={540} y={1150} txt="⚔ espada de madeira ✓" cor={RPG.verde} tam={36} />
        <Etiqueta t={em(c, "dano")} x={540} y={1330} txt="QUANTO DANO ELA CAUSA?" tam={36} />
        <Etiqueta t={em(c, "proximo")} x={540} y={1510} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
      </>} />
  ),
};

export const RpgEp09: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
