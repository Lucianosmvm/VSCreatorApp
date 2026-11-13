import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Cena, Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Caixa, Cenario, Etiqueta, Faixa, Ficha, Fundo, Heroi, Painel, RPG, Tela, TextoPixel, useT, type Classe, type LinhaRpg } from "./Kit";
import { Selecao } from "./Ep01Menu";

// RPG Code (C# na Unity), episódio 02: classe e objeto. 11 cenas, 9:16, ~49 s.
const PASTA = "videos/rpg-code-02-classe-e-objeto-mwevyeqc/";

const CLASSE = [
  "public class Heroi",
  "{",
  "    public string nome;",
  "    public int vida;",
  "    public int ataque;",
  "",
  "    public Heroi(string nome, int vida, int ataque)",
  "    {",
  "        this.nome = nome;",
  "        this.vida = vida;",
  "        this.ataque = ataque;",
  "    }",
  "}",
];
const CRIA = [
  "Heroi guerreiro =",
  "    new Heroi(\"Guerreiro\", 120, 8);",
  "Heroi mago =",
  "    new Heroi(\"Mago\", 70, 14);",
];
const de = (fonte: string[], f: (i: number) => Partial<LinhaRpg> | null): LinhaRpg[] =>
  fonte.flatMap((txt, i) => {
    const r = f(i);
    return r === null ? [] : [{ txt, ...r }];
  });

// Campo com heróis andando em fila (coordenadas da grade).
export const Campo: React.FC<{ herois: { classe: Classe; t?: number; nome?: string }[] }> = ({ herois }) => {
  const { t } = useT();
  return (
    <>
      <Cenario />
      {herois.map((h, i) => {
        const x = 67.5 - (herois.length * 14) / 2 + i * 28 - 4;
        if (h.t !== undefined && t < h.t) return null;
        return (
          <g key={i}>
            <g transform={`translate(${x} 62) scale(1.6)`}><Heroi x={0} y={0} classe={h.classe} /></g>
            {h.nome && <Caixa x={x - 4} y={52} w={28} h={8}><TextoPixel x={x + 10} y={57.6} txt={h.nome} tam={3.4} meio /></Caixa>}
          </g>
        );
      })}
    </>
  );
};

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" };
const Quadro: React.FC<{ tela: React.ReactNode; titulo?: string; codigo?: LinhaRpg[]; extra?: React.ReactNode; sons?: Som[] }> = ({ tela, titulo = "Heroi.cs · Unity", codigo, extra, sons = [] }) => (
  <AbsoluteFill>
    <Fundo />
    <Faixa ep="EP. 02" acao="Criar:" destaque="Herói" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo={titulo} linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons} />
  </AbsoluteFill>
);
const CAMPOS = (c: Cena, nome: string, vida: string, ataque: string, tn?: number, tv?: number, ta?: number) => [
  { k: "nome", v: `"${nome}"`, t: tn }, { k: "vida", v: vida, t: tv }, { k: "ataque", v: ataque, t: ta },
];

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro tela={<Selecao revela={em(c, "classe") - 0.5} />} sons={[{ t: em(c, "passado"), tipo: "pop" }, { t: em(c, "classe"), tipo: "whoosh" }]}
      extra={<>
        <Etiqueta t={em(c, "passado")} x={540} y={1200} txt="EP. 01 · switch ✓" cor={RPG.verde} tam={36} />
        <Etiqueta t={em(c, "classe")} x={540} y={1400} txt="ESCOLHA A CLASSE" tam={42} />
      </>} />
  ),
  1: ({ cena: c }) => {
    const [g, m, a] = [em(c, "guerreiro"), em(c, "mago"), em(c, "arqueiro")];
    const { t } = useT();
    return (
      <Quadro tela={<Selecao revela={-1} sel={t >= a ? 2 : t >= m ? 1 : 0} selT={g} />} sons={[{ t: g, tipo: "tecla" }, { t: m, tipo: "tecla" }, { t: a, tipo: "tecla" }, { t: em(c, "diferentes"), tipo: "pop" }]}
        extra={<>
          {t < m && <Ficha t={g} x={540} y={1060} largura={620} titulo="GUERREIRO" campos={CAMPOS(c, "Guerreiro", "120", "8")} cor={RPG.vermelho} />}
          {t >= m && t < a && <Ficha t={m} x={540} y={1060} largura={620} titulo="MAGO" campos={CAMPOS(c, "Mago", "70", "14")} cor={RPG.borda} />}
          {t >= a && <Ficha t={a} x={540} y={1060} largura={620} titulo="ARQUEIRO" campos={CAMPOS(c, "Arqueiro", "90", "11")} cor={RPG.verde} />}
          <Etiqueta t={em(c, "diferentes")} x={540} y={1530} txt="mesmos campos, valores diferentes" tam={26} />
        </>} />
    );
  },
  2: ({ cena: c }) => (
    <Quadro tela={<Campo herois={[{ classe: "misterio" }]} />} sons={[{ t: em(c, "nome"), tipo: "pop" }, { t: em(c, "vida"), tipo: "pop" }, { t: em(c, "ataque"), tipo: "pop" }]}
      extra={<Ficha t={em(c, "todo")} x={540} y={1080} largura={620} titulo="TODO HERÓI TEM" campos={[{ k: "nome", v: "texto", t: em(c, "nome") }, { k: "vida", v: "número", t: em(c, "vida") }, { k: "ataque", v: "número", t: em(c, "ataque") }]} />} />
  ),
  3: ({ cena: c }) => {
    const m = em(c, "molde");
    return (
      <Quadro tela={<Campo herois={[{ classe: "misterio" }, { classe: "misterio" }, { classe: "misterio" }]} />} sons={[{ t: em(c, "tres"), tipo: "erro" }, { t: m, tipo: "plim" }]}
        codigo={de(CLASSE, (i) => (i === 0 || i === 1 || i === 12 ? { t: m, marca: i === 0 ? em(c, "classe") : undefined } : null))}
        extra={<Etiqueta t={em(c, "tres")} x={540} y={1440} txt="copiar 3 vezes? ✗" cor={RPG.vermelho} tam={34} />} />
    );
  },
  4: ({ cena: c }) => {
    const [n, v, a] = [em(c, "nome"), em(c, "vida"), em(c, "ataque")];
    return (
      <Quadro tela={<Campo herois={[{ classe: "misterio" }]} />} sons={[{ t: n, tipo: "tecla" }, { t: v, tipo: "tecla" }, { t: a, tipo: "tecla" }]}
        codigo={de(CLASSE, (i) => (i === 2 ? { t: n, marca: n, ate: v } : i === 3 ? { t: v, marca: v, ate: a } : i === 4 ? { t: a, marca: a } : i <= 1 || i === 12 ? {} : null))} />
    );
  },
  5: ({ cena: c }) => {
    const k = em(c, "construtor");
    return (
      <Quadro tela={<Campo herois={[{ classe: "misterio" }]} />} sons={[{ t: k, tipo: "whoosh" }]}
        codigo={de(CLASSE, (i) => (i >= 6 && i <= 11 ? { t: k + (i - 6) * 0.12, marca: i === 6 ? em(c, "recebe") : undefined } : {}))} />
    );
  },
  6: ({ cena: c }) => {
    const g = em(c, "guerreiro"), n = em(c, "new");
    return (
      <Quadro tela={<Selecao revela={-1} sel={0} selT={g} />} titulo="SelecaoClasse.cs · Unity" sons={[{ t: g, tipo: "plim" }, { t: n, tipo: "tecla" }]}
        codigo={de(CRIA, (i) => (i <= 1 ? { t: n, marca: em(c, "objeto") } : null))} />
    );
  },
  7: ({ cena: c }) => {
    const [g, v, a] = [em(c, "guerreiro"), em(c, "120"), em(c, "8")];
    return (
      <Quadro tela={<Campo herois={[{ classe: "guerreiro", t: em(c, "new") }]} />} titulo="SelecaoClasse.cs · Unity" sons={[{ t: em(c, "new"), tipo: "plim" }, { t: v, tipo: "pop" }, { t: a, tipo: "pop" }]}
        codigo={de(CRIA, (i) => (i <= 1 ? { marca: 0 } : null))}
        extra={<Ficha t={em(c, "new")} x={540} y={1290} largura={620} titulo="objeto: guerreiro" campos={CAMPOS(c, "Guerreiro", "120", "8", g, v, a)} cor={RPG.vermelho} />} />
    );
  },
  8: ({ cena: c }) => {
    const m = em(c, "mago");
    return (
      <Quadro tela={<Campo herois={[{ classe: "guerreiro" }, { classe: "mago", t: m }]} />} titulo="SelecaoClasse.cs · Unity" sons={[{ t: m, tipo: "plim" }, { t: em(c, "70"), tipo: "pop" }]}
        codigo={de(CRIA, (i) => (i <= 1 ? {} : { t: m, marca: em(c, "70") }))}
        extra={<Ficha t={em(c, "70")} x={540} y={1340} largura={620} titulo="objeto: mago" campos={CAMPOS(c, "Mago", "70", "14")} cor={RPG.borda} />} />
    );
  },
  9: ({ cena: c }) => {
    const o = em(c, "objeto");
    return (
      <Quadro tela={<Campo herois={[{ classe: "guerreiro", nome: "OBJETO" }, { classe: "mago", nome: "OBJETO" }]} />} sons={[{ t: em(c, "molde"), tipo: "pop" }, { t: o, tipo: "plim" }]}
        extra={<>
          <Etiqueta t={em(c, "molde")} x={540} y={1130} txt="class Heroi = MOLDE" cor={RPG.azul} tam={40} />
          <Ficha t={o} x={290} y={1260} largura={480} titulo="guerreiro" campos={[{ k: "vida", v: "120" }, { k: "ataque", v: "8" }]} cor={RPG.vermelho} />
          <Ficha t={o + 0.2} x={790} y={1260} largura={480} titulo="mago" campos={[{ k: "vida", v: "70" }, { k: "ataque", v: "14" }]} cor={RPG.borda} />
        </>} />
    );
  },
  10: ({ cena: c }) => (
    <Quadro tela={<Campo herois={[{ classe: "guerreiro", nome: "???" }]} />} sons={[{ t: em(c, "nome"), tipo: "pop" }, { t: em(c, "proximo"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "criado")} x={540} y={1150} txt="new Heroi(...) ✓" cor={RPG.verde} tam={36} />
        <Etiqueta t={em(c, "nome")} x={540} y={1320} txt="QUAL O NOME?" tam={52} />
        <Etiqueta t={em(c, "proximo")} x={540} y={1500} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
      </>} />
  ),
};

export const RpgEp02: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
