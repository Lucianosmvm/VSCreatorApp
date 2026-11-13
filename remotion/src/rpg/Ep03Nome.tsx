import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Caixa, Etiqueta, Faixa, Fundo, Heroi, Painel, RPG, Tela, TextoPixel, useT, type LinhaRpg } from "./Kit";
import { Campo } from "./Ep02Classe";

// RPG Code (C# na Unity), episódio 03: o nome do herói (string). 11 cenas, 9:16, ~48 s.
const PASTA = "videos/rpg-code-03-o-nome-do-heroi-mwewnug7/";
const NOME = "ARTUR";
const PASSO = 0.18; // segundos entre letras

const CODIGO = [
  "public TMP_InputField campoNome;",
  "",
  "string nome = campoNome.text;",
  "heroi.nome = nome;",
  "",
  "string msg = \"Bem-vindo, \" + nome + \"!\";",
  "string msg2 = $\"Bem-vindo, {nome}!\";",
  "textoTela.text = msg2;",
];
const de = (f: (i: number) => Partial<LinhaRpg> | null): LinhaRpg[] =>
  CODIGO.flatMap((txt, i) => {
    const r = f(i);
    return r === null ? [] : [{ txt, ...r }];
  });

// Tela de nome com teclado SNES; as letras de NOME entram a partir de `digita`.
const TelaNome: React.FC<{ digita?: number; pronto?: boolean }> = ({ digita, pronto }) => {
  const { t, f } = useT();
  const n = pronto ? NOME.length : digita === undefined ? 0 : Math.max(0, Math.min(NOME.length, Math.floor((t - digita) / PASSO) + 1));
  const atual = !pronto && digita !== undefined && t >= digita && n <= NOME.length ? NOME[n - 1] : undefined;
  const linhas = ["ABCDEFGHI", "JKLMNOPQR", "STUVWXYZ"];
  return (
    <>
      <rect x={0} y={0} width={135} height={95} fill="#1b1446" />
      <TextoPixel x={67.5} y={11} txt="NOME DO HERÓI" tam={5.2} cor={RPG.amarelo} meio />
      <g transform="translate(10 17) scale(1.6)"><Heroi x={0} y={0} classe="guerreiro" /></g>
      <Caixa x={36} y={20} w={90} h={16}>
        <TextoPixel x={42} y={31} txt={NOME.slice(0, n)} tam={6.5} cor={RPG.branco} />
        {Math.floor(f / 8) % 2 === 0 && <rect x={42 + n * 6.6} y={25} width={4} height={7} fill={RPG.amarelo} />}
      </Caixa>
      <Caixa x={8} y={46} w={119} h={44}>
        {linhas.map((l, j) => [...l].map((ch, i) => {
          const x = 16 + i * 12, y = 58 + j * 12;
          const ativo = ch === atual && t - (digita ?? 0) < NOME.length * PASSO + 0.2;
          return (
            <g key={ch}>
              {ativo && <rect x={x - 3} y={y - 6.5} width={9} height={9} fill={RPG.amarelo} />}
              <TextoPixel x={x + 1.5} y={y} txt={ch} tam={5} cor={ativo ? "#1b1020" : RPG.branco} meio />
            </g>
          );
        }))}
      </Caixa>
    </>
  );
};

// Caixa de diálogo no rodapé da tela do jogo, com efeito máquina de escrever.
const Dialogo: React.FC<{ t0: number; txt: string }> = ({ t0, txt }) => {
  const { t } = useT();
  if (t < t0) return null;
  const n = Math.min(txt.length, Math.floor((t - t0) / 0.045));
  return <Caixa x={6} y={4} w={123} h={17}><TextoPixel x={12} y={15} txt={txt.slice(0, n)} tam={5.2} /></Caixa>;
};

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" };
const Quadro: React.FC<{ tela: React.ReactNode; codigo?: LinhaRpg[]; extra?: React.ReactNode; sons?: Som[] }> = ({ tela, codigo, extra, sons = [] }) => (
  <AbsoluteFill>
    <Fundo />
    <Faixa ep="EP. 03" acao="Nome:" destaque="string" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo="NomeHeroi.cs · Unity" linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons} />
  </AbsoluteFill>
);
const teclas = (t0: number): Som[] => [...NOME].map((_, i) => ({ t: t0 + i * PASSO, tipo: "tecla" as const }));

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro tela={<Campo herois={[{ classe: "guerreiro", nome: "???" }]} />} sons={[{ t: em(c, "nome"), tipo: "pop" }, { t: em(c, "escolher"), tipo: "whoosh" }]}
      extra={<Etiqueta t={em(c, "nome")} x={540} y={1300} txt="nome = ???" tam={50} />} />
  ),
  1: ({ cena: c }) => {
    const d = em(c, "artur");
    return (
      <Quadro tela={<TelaNome digita={d} />} sons={teclas(d)}
        extra={<Etiqueta t={em(c, "caixa")} x={540} y={1300} txt="campo de texto" cor={RPG.azul} tam={40} />} />
    );
  },
  2: ({ cena: c }) => (
    <Quadro tela={<TelaNome pronto />} sons={[{ t: em(c, "string"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "texto")} x={540} y={1180} txt="texto = string" tam={52} />
        <Etiqueta t={em(c, "string")} x={540} y={1390} txt='"ARTUR"' cor={RPG.laranja} tam={64} />
      </>} />
  ),
  3: ({ cena: c }) => (
    <Quadro tela={<TelaNome pronto />} sons={[{ t: em(c, "nome"), tipo: "tecla" }, { t: em(c, "digitou"), tipo: "plim" }]}
      codigo={de((i) => (i === 0 ? { t: 0 } : i === 2 ? { t: em(c, "nome"), marca: em(c, "digitou") } : i === 1 ? {} : null))} />
  ),
  4: ({ cena: c }) => {
    const a = em(c, "aspas"), s = em(c, "sem");
    return (
      <Quadro tela={<TelaNome pronto />} sons={[{ t: a, tipo: "plim" }, { t: s, tipo: "erro" }]}
        codigo={[
          { txt: "string nome = \"Artur\";  // texto ✓", t: a, marca: a, ate: s },
          { txt: "string nome = Artur;    // erro ✗", t: s, marca: s, cor: RPG.vermelho },
        ]}
        extra={<Etiqueta t={em(c, "variavel")} x={540} y={1440} txt="Artur? que variável é essa?" cor={RPG.vermelho} tam={28} />} />
    );
  },
  5: ({ cena: c }) => {
    const r = em(c, "recebe");
    return (
      <Quadro tela={<Campo herois={[{ classe: "guerreiro", nome: "???" }]} />} sons={[{ t: r, tipo: "tecla" }, { t: em(c, "nome", 2), tipo: "plim" }]}
        codigo={de((i) => (i <= 2 ? {} : i === 3 ? { t: r, marca: em(c, "heroi") } : null))}
        extra={<Etiqueta t={em(c, "nome", 2)} x={540} y={1450} txt='heroi.nome = "Artur" ✓' cor={RPG.verde} tam={32} />} />
    );
  },
  6: ({ cena: c }) => (
    <Quadro tela={<Campo herois={[{ classe: "guerreiro", nome: "ARTUR" }]} />} sons={[{ t: em(c, "mais"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={em(c, "frase")} x={540} y={1180} txt='"Bem-vindo, " + nome' tam={40} />
        <Etiqueta t={em(c, "mais")} x={540} y={1400} txt="+ junta textos" cor={RPG.azul} tam={46} />
      </>} />
  ),
  7: ({ cena: c }) => {
    const b = em(c, "bemvindo"), j = em(c, "jogo");
    return (
      <Quadro tela={<><Campo herois={[{ classe: "guerreiro", nome: "ARTUR" }]} /><Dialogo t0={j - 0.4} txt="BEM-VINDO, ARTUR!" /></>} sons={[{ t: b, tipo: "tecla" }, { t: j, tipo: "plim" }]}
        codigo={de((i) => (i <= 3 ? {} : i === 5 ? { t: b, marca: em(c, "nome") } : i === 4 ? {} : null))} />
    );
  },
  8: ({ cena: c }) => {
    const k = em(c, "cifrao"), ch = em(c, "chaves");
    return (
      <Quadro tela={<><Campo herois={[{ classe: "guerreiro", nome: "ARTUR" }]} /><Dialogo t0={0} txt="BEM-VINDO, ARTUR!" /></>} sons={[{ t: k, tipo: "tecla" }, { t: ch, tipo: "pop" }]}
        codigo={de((i) => (i <= 4 ? {} : i === 5 ? { apaga: k } : i === 6 ? { t: k, marca: ch } : null))}
        extra={<>
          <Etiqueta t={k} x={330} y={1610} txt="$ antes" tam={36} />
          <Etiqueta t={ch} x={750} y={1610} txt="{nome}" cor={RPG.azul} tam={36} />
        </>} />
    );
  },
  9: ({ cena: c }) => (
    <Quadro tela={<><Campo herois={[{ classe: "guerreiro", nome: "ARTUR" }]} /><Dialogo t0={0} txt="BEM-VINDO, ARTUR!" /></>} sons={[{ t: em(c, "interpolacao"), tipo: "plim" }]}
      codigo={de((i) => (i === 5 ? { apaga: 0 } : i === 6 || i === 7 ? { marca: i === 6 ? em(c, "mesma") : em(c, "ler") } : {}))}
      extra={<Etiqueta t={em(c, "interpolacao")} x={540} y={1610} txt="INTERPOLAÇÃO ✓" cor={RPG.verde} tam={36} />} />
  ),
  10: ({ cena: c }) => (
    <Quadro tela={<Campo herois={[{ classe: "guerreiro", nome: "ARTUR" }]} />} sons={[{ t: em(c, "andar"), tipo: "pop" }, { t: em(c, "proximo"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "aventura")} x={540} y={1150} txt='nome = "Artur" ✓' cor={RPG.verde} tam={36} />
        <Etiqueta t={em(c, "andar")} x={540} y={1320} txt="COMO ELE ANDA?" tam={50} />
        <Etiqueta t={em(c, "proximo")} x={540} y={1500} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
      </>} />
  ),
};

export const RpgEp03: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
