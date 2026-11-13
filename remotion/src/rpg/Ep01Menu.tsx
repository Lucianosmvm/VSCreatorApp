import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Cena, Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Caixa, Cenario, Etiqueta, Faixa, Fundo, Heroi, Painel, RPG, Slime, Tela, TextoPixel, useT, type LinhaRpg } from "./Kit";

// RPG Code (C# na Unity), episódio 01: o menu do jogo e o switch. 11 cenas, 9:16, ~44 s.
const PASTA = "videos/rpg-code-01-o-menu-e-o-switch-mweva89w/";

const OPCOES = ["NOVO JOGO", "CONTINUAR", "SAIR"];

// Tela de título com menu; `sel` = opção sob o cursor; `aperta` = quando confirma.
const Menu: React.FC<{ sel: number; aperta?: number; aparece?: number; invalido?: number }> = ({ sel, aperta, aparece = -1, invalido }) => {
  const { t, f } = useT();
  const pisca = aperta !== undefined && t >= aperta && t < aperta + 0.6 && Math.floor(f / 3) % 2 === 0;
  return (
    <>
      <Cenario />
      <TextoPixel x={GX} y={20} txt="RPG CODE" tam={11} cor="#1b1020" meio />
      <TextoPixel x={GX - 0.6} y={19.4} txt="RPG CODE" tam={11} cor={RPG.amarelo} meio />
      {t >= aparece && (
        <Caixa x={38} y={50} w={59} h={38}>
          {OPCOES.map((o, i) => (
            <TextoPixel key={o} x={49} y={61 + i * 10} txt={o} tam={4.6} cor={i === sel ? (pisca ? RPG.branco : RPG.amarelo) : RPG.branco} />
          ))}
          {Math.floor(f / 8) % 2 === 0 && <TextoPixel x={42} y={61 + sel * 10} txt="▶" tam={4.6} cor={RPG.amarelo} />}
        </Caixa>
      )}
      {invalido !== undefined && t >= invalido && Math.floor(f / 5) % 3 !== 0 && (
        <Caixa x={24} y={36} w={87} h={12}><TextoPixel x={67.5} y={44.5} txt="OPÇÃO INVÁLIDA!" tam={4.6} cor={RPG.vermelho} meio /></Caixa>
      )}
    </>
  );
};
const GX = 67.5;

export const Selecao: React.FC<{ revela?: number; misterio?: number; sel?: number; selT?: number }> = ({ revela = 0, misterio, sel, selT = 0 }) => {
  const { t, f } = useT();
  const classes = ["guerreiro", "mago", "arqueiro"] as const;
  const nomes = ["GUERREIRO", "MAGO", "ARQUEIRO"];
  const escondido = misterio !== undefined && t >= misterio;
  return (
    <>
      <rect x={0} y={0} width={135} height={95} fill="#1b1446" />
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={(i * 37) % 135} y={(i * 23) % 95} width={1} height={1} fill="#8b7bd6" opacity={((f / 10 + i) % 4) / 4} />)}
      <TextoPixel x={67.5} y={14} txt="ESCOLHA SUA CLASSE" tam={5.2} cor={RPG.amarelo} meio />
      {classes.map((c, i) => {
        const x = 12 + i * 40;
        const ativo = t >= revela + i * 0.25;
        return ativo ? (
          <g key={c}>
            <Caixa x={x} y={24} w={32} h={50} />
            {sel === i && t >= selT && <rect x={x - 1.5} y={22.5} width={35} height={53} fill="none" stroke={RPG.amarelo} strokeWidth={1.4} opacity={Math.floor(f / 6) % 2 ? 1 : 0.5} />}
            <g transform={`translate(${x + 4} 32) scale(2)`}><Heroi x={0} y={0} classe={escondido ? "misterio" : c} /></g>
            <TextoPixel x={x + 16} y={70} txt={escondido ? "???" : nomes[i]} tam={escondido ? 5 : 3.4} cor={RPG.branco} meio />
          </g>
        ) : null;
      })}
      {escondido && Math.floor(f / 8) % 2 === 0 && <TextoPixel x={67.5} y={88} txt="CONTINUA..." tam={5} cor={RPG.amarelo} meio />}
    </>
  );
};

const CODIGO = [
  "int opcao = 1; // botão Novo Jogo",
  "switch (opcao)",
  "{",
  "  case 1: SceneManager.LoadScene(\"Selecao\"); break;",
  "  case 2: CarregarSave(); break;",
  "  case 3: Application.Quit(); break;",
  "  default: Debug.Log(\"Opção inválida!\"); break;",
  "}",
];
// Linhas do código com estado por cena.
const linhas = (f: (i: number, txt: string) => Partial<LinhaRpg> | null): LinhaRpg[] =>
  CODIGO.flatMap((txt, i) => {
    const r = f(i, txt);
    return r === null ? [] : [{ txt, ...r }];
  });

const Quadro: React.FC<{ c: Cena; tela: React.ReactNode; titulo?: string; codigo?: LinhaRpg[]; extra?: React.ReactNode; sons?: { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" }[] }> = ({ tela, titulo = "MenuPrincipal.cs · Unity", codigo, extra, sons = [] }) => (
  <AbsoluteFill>
    <Fundo />
    <Faixa ep="EP. 01" acao="Ação:" destaque="Menu" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo={titulo} linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons} />
  </AbsoluteFill>
);

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro c={c} tela={<Menu sel={0} aparece={em(c, "menu")} />} sons={[{ t: em(c, "menu"), tipo: "pop" }, { t: em(c, "codigo"), tipo: "whoosh" }]}
      codigo={linhas((i) => (i >= 1 ? { t: em(c, "codigo") + (i - 1) * 0.15 } : null))} />
  ),
  1: ({ cena: c }) => {
    const [a, b, d] = [em(c, "novo"), em(c, "continuar"), em(c, "sair")];
    const { t } = useT();
    const sel = t >= d ? 2 : t >= b ? 1 : 0;
    return (
      <Quadro c={c} tela={<Menu sel={sel} />} sons={[{ t: a, tipo: "tecla" }, { t: b, tipo: "tecla" }, { t: d, tipo: "tecla" }]}
        extra={<>
          <Etiqueta t={a} x={540} y={1180} txt="1 · NOVO JOGO" />
          <Etiqueta t={b} x={540} y={1340} txt="2 · CONTINUAR" cor={RPG.azul} />
          <Etiqueta t={d} x={540} y={1500} txt="3 · SAIR" cor={RPG.vermelho} />
        </>} />
    );
  },
  2: ({ cena: c }) => (
    <Quadro c={c} tela={<Menu sel={0} aperta={em(c, "novo")} />} sons={[{ t: em(c, "novo"), tipo: "plim" }]}
      extra={<Etiqueta t={em(c, "novo")} x={540} y={1340} txt="▶ NOVO JOGO" tam={44} />} />
  ),
  3: ({ cena: c }) => (
    <Quadro c={c} tela={<Menu sel={0} />} sons={[{ t: em(c, "como"), tipo: "pop" }]}
      extra={<Etiqueta t={em(c, "como")} x={540} y={1340} txt="?" tam={150} cor={RPG.amarelo} />} />
  ),
  4: ({ cena: c }) => (
    <Quadro c={c} tela={<Menu sel={0} />} sons={[{ t: em(c, "variavel"), tipo: "tecla" }, { t: em(c, "1"), tipo: "plim" }]}
      codigo={linhas((i) => (i === 0 ? { t: em(c, "variavel"), marca: em(c, "1") } : null))}
      extra={<Etiqueta t={em(c, "1")} x={540} y={1400} txt="opcao = 1" tam={46} />} />
  ),
  5: ({ cena: c }) => (
    <Quadro c={c} tela={<Menu sel={0} />} sons={[{ t: em(c, "switch"), tipo: "whoosh" }]}
      codigo={linhas((i) => (i === 0 ? {} : i === 1 ? { t: em(c, "switch"), marca: em(c, "compara") } : { t: em(c, "caso") + i * 0.12 }))} />
  ),
  6: ({ cena: c }) => {
    const [a, b, d] = [em(c, "caso", 1), em(c, "caso", 2), em(c, "caso", 3)];
    return (
      <Quadro c={c} tela={<Menu sel={0} />} sons={[{ t: a, tipo: "pop" }, { t: b, tipo: "pop" }, { t: d, tipo: "pop" }]}
        codigo={linhas((i) => ({ marca: i === 3 ? a : i === 4 ? b : i === 5 ? d : undefined, ate: i === 3 ? b : i === 4 ? d : undefined }))} />
    );
  },
  7: ({ cena: c }) => {
    const p = em(c, "primeiro"), br = em(c, "break");
    return (
      <Quadro c={c} tela={<Menu sel={0} aperta={p} />} sons={[{ t: p, tipo: "plim" }, { t: br, tipo: "pop" }]}
        codigo={linhas((i) => ({ marca: i === 3 ? p : i === 0 ? 0 : undefined, apaga: i >= 4 && i <= 6 ? p : undefined }))}
        extra={<Etiqueta t={br} x={540} y={1560} txt="break → sai do switch" cor={RPG.azul} tam={30} />} />
    );
  },
  8: ({ cena: c }) => {
    const d = em(c, "default");
    return (
      <Quadro c={c} tela={<Menu sel={0} invalido={d} />} sons={[{ t: em(c, "tecla"), tipo: "tecla" }, { t: d, tipo: "erro" }]}
        codigo={linhas((i) => ({ marca: i === 6 ? d : undefined, apaga: i >= 3 && i <= 5 ? d : undefined }))} />
    );
  },
  9: ({ cena: c }) => {
    const m = em(c, "muda");
    const { t } = useT();
    return (
      <Quadro c={c} tela={t < m ? <Menu sel={0} /> : <Selecao revela={m} />} sons={[{ t: m, tipo: "whoosh" }]}
        codigo={linhas((i) => ({ marca: i === 3 ? 0 : undefined, apaga: i >= 4 && i <= 6 ? 0 : undefined }))}
        extra={<Etiqueta t={m} x={540} y={1450} txt={'LoadScene("Selecao") ✓'} cor={RPG.verde} tam={36} />} />
    );
  },
  10: ({ cena: c }) => (
    <Quadro c={c} tela={<><Selecao revela={-1} misterio={em(c, "classe")} /><Slime x={0} y={-20} /></>} sons={[{ t: em(c, "classe"), tipo: "pop" }, { t: em(c, "episodio"), tipo: "plim" }]}
      extra={<>
        <Etiqueta t={em(c, "classe")} x={540} y={1250} txt="QUAL CLASSE?" tam={52} />
        <Etiqueta t={em(c, "proximo")} x={540} y={1450} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
      </>} />
  ),
};

export const RpgEp01: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
