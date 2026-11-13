import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Caixa, Etiqueta, Faixa, Fundo, Heroi, Painel, RPG, Tela, TextoPixel, rampa, useT, type LinhaRpg } from "./Kit";

// RPG Code (C# na Unity), episódio 05: andar com as setas (Update, Input System e deltaTime).
// 11 cenas, 9:16, ~52 s. Input System novo (padrão da Unity 6): Keyboard.current.
const PASTA = "videos/rpg-code-05-andando-com-as-setas-mweyvx5j/";

const CODIGO = [
  "void Update()",
  "{",
  "    var teclado = Keyboard.current;",
  "    Vector2 dir = Vector2.zero;",
  "    if (teclado.rightArrowKey.isPressed) dir.x = 1;",
  "    if (teclado.upArrowKey.isPressed) dir.y = 1;",
  "    // ← e ↓: dir = -1",
  "    transform.Translate(dir * 3 * Time.deltaTime);",
  "}",
];
const de = (f: (i: number) => Partial<LinhaRpg> | null): LinhaRpg[] =>
  CODIGO.flatMap((txt, i) => {
    const r = f(i);
    return r === null ? [] : [{ txt, ...r }];
  });

// Trecho de movimento: de t0 a t1 anda (dx, dy) casas da grade.
type Trecho = { t0: number; t1: number; dx: number; dy: number };
const posicao = (t: number, ini: [number, number], trechos: Trecho[]) => {
  let [x, y] = ini;
  let dir: [number, number] = [0, 0];
  for (const tr of trechos) {
    const k = rampa(t, tr.t0, tr.t1);
    x += tr.dx * k;
    y += tr.dy * k;
    if (t >= tr.t0 && t < tr.t1) dir = [Math.sign(tr.dx), Math.sign(tr.dy)];
  }
  return { x, y, dir };
};

const Seta: React.FC<{ x: number; y: number; txt: string; acesa: boolean }> = ({ x, y, txt, acesa }) => (
  <g>
    <rect x={x} y={y} width={9} height={9} fill={acesa ? RPG.amarelo : "#1b1446"} stroke={RPG.branco} strokeWidth={0.6} />
    <TextoPixel x={x + 4.5} y={y + 6.8} txt={txt} tam={5} cor={acesa ? "#1b1020" : RPG.branco} meio />
  </g>
);

// Mapa visto de cima: grama, cerca à direita e as setas do teclado no canto.
const Mapa: React.FC<{ trechos?: Trecho[]; ini?: [number, number]; teclas?: boolean }> = ({ trechos = [], ini = [40, 60], teclas = true }) => {
  const { t, f } = useT();
  const p = posicao(t, ini, trechos);
  const andando = p.dir[0] !== 0 || p.dir[1] !== 0;
  const pulo = andando ? Math.abs(Math.sin((f % 8) / 8 * Math.PI)) * 1.6 : 0;
  return (
    <>
      <rect x={0} y={0} width={135} height={95} fill="#3fa34d" />
      {Array.from({ length: 50 }, (_, i) => <rect key={i} x={(i * 23) % 135} y={(i * 13) % 95} width={2} height={1} fill="#5cc366" />)}
      <path d="M0 78 h135 v6 h-135z" fill="#c9a46a" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}><rect x={112} y={6 + i * 9} width={3} height={8} fill="#8b5a2b" /><rect x={110} y={8 + i * 9} width={7} height={1.4} fill="#a8743a" /></g>
      ))}
      {[[12, 14], [26, 30], [90, 18]].map(([x, y]) => <g key={x}><rect x={x} y={y} width={8} height={8} fill="#2f7a3a" /><rect x={x + 3} y={y + 8} width={2} height={3} fill="#5a3a1a" /></g>)}
      <g transform={`translate(${p.x - 6} ${p.y - 15 - pulo})`}><Heroi x={0} y={0} classe="guerreiro" flip={p.dir[0] < 0} /></g>
      {teclas && (
        <g>
          <Seta x={99} y={66} txt="↑" acesa={p.dir[1] < 0} />
          <Seta x={89} y={76} txt="←" acesa={p.dir[0] < 0} />
          <Seta x={99} y={76} txt="↓" acesa={p.dir[1] > 0} />
          <Seta x={109} y={76} txt="→" acesa={p.dir[0] > 0} />
        </g>
      )}
    </>
  );
};

// Corrida entre um PC lento (30 FPS) e um rápido (120 FPS).
// Sem deltaTime, cada quadro anda o mesmo tanto: o rápido corre 4x mais.
const Corrida: React.FC<{ t0: number; comDelta: boolean }> = ({ t0, comDelta }) => {
  const { t } = useT();
  const pista = (fps: number, y: number, rotulo: string, cor: string) => {
    const quadros = Math.max(0, Math.floor((t - t0) * fps));
    const passo = comDelta ? 22 / fps : 0.75; // casas por quadro
    const x = Math.min(112, 14 + quadros * passo);
    return (
      <g>
        <rect x={0} y={y} width={135} height={30} fill={y < 40 ? "#3fa34d" : "#379a46"} />
        <rect x={0} y={y + 24} width={135} height={6} fill="#c9a46a" />
        <rect x={122} y={y + 2} width={2} height={28} fill={RPG.branco} />
        <Caixa x={3} y={y + 2} w={70} h={9}><TextoPixel x={6} y={y + 8.2} txt={rotulo} tam={3.1} cor={cor} /></Caixa>
        <g transform={`translate(${x - 6} ${y + 10})`}><Heroi x={0} y={0} classe="guerreiro" /></g>
      </g>
    );
  };
  return (
    <>
      <rect x={0} y={0} width={135} height={95} fill="#1b1446" />
      {pista(30, 12, "PC LENTO 30 FPS", RPG.laranja)}
      {pista(120, 52, "PC RÁPIDO 120 FPS", RPG.azul)}
      <TextoPixel x={67.5} y={8} txt={comDelta ? "COM deltaTime" : "SEM deltaTime"} tam={4.4} cor={comDelta ? RPG.verde : RPG.vermelho} meio />
    </>
  );
};

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" };
const Quadro: React.FC<{ tela: React.ReactNode; codigo?: LinhaRpg[]; extra?: React.ReactNode; sons?: Som[] }> = ({ tela, codigo, extra, sons = [] }) => (
  <AbsoluteFill>
    <Fundo />
    <Faixa ep="EP. 05" acao="Andar:" destaque="Update" />
    <Tela y={270}>{tela}</Tela>
    {codigo && <Painel titulo="Movimento.cs · Unity" linhas={codigo} y={1050} altura={610} />}
    {extra}
    <Sons efeitos={sons} />
  </AbsoluteFill>
);

const Contador: React.FC<{ t0: number }> = ({ t0 }) => {
  const { t } = useT();
  if (t < t0) return null;
  const n = Math.floor((t - t0) * 60);
  return <Etiqueta t={t0} x={540} y={1380} txt={`Update() × ${n}`} cor={RPG.verde} tam={56} />;
};

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => (
    <Quadro tela={<Mapa teclas={false} />} sons={[{ t: em(c, "setas"), tipo: "pop" }]}
      extra={<>
        <Etiqueta t={0.2} x={540} y={1150} txt="posição = (x, y) ✓" cor={RPG.verde} tam={34} />
        <Etiqueta t={em(c, "setas")} x={540} y={1350} txt="← ↑ → ↓" tam={72} />
      </>} />
  ),
  1: ({ cena: c }) => (
    <Quadro tela={<Mapa />} sons={[{ t: em(c, "update"), tipo: "whoosh" }]}
      codigo={de((i) => (i <= 1 || i === 8 ? { t: em(c, "update"), marca: i === 0 ? em(c, "sozinho") : undefined } : null))}
      extra={<Contador t0={em(c, "dezenas")} />} />
  ),
  2: ({ cena: c }) => (
    <Quadro tela={<Mapa />} sons={[{ t: em(c, "seta"), tipo: "pop" }]}
      codigo={de((i) => (i <= 1 || i === 8 ? {} : null))}
      extra={<Etiqueta t={em(c, "seta")} x={540} y={1400} txt="alguma seta apertada?" tam={40} />} />
  ),
  3: ({ cena: c }) => (
    <Quadro tela={<Mapa />} sons={[{ t: em(c, "keyboard"), tipo: "tecla" }, { t: em(c, "ispressed"), tipo: "plim" }]}
      codigo={de((i) => (i <= 1 || i === 8 ? {} : i === 2 ? { t: em(c, "keyboard"), marca: em(c, "teclado") } : null))}
      extra={<Etiqueta t={em(c, "ispressed")} x={540} y={1450} txt="isPressed → true / false" cor={RPG.azul} tam={34} />} />
  ),
  4: ({ cena: c }) => {
    const d = em(c, "direita");
    return (
      <Quadro tela={<Mapa trechos={[{ t0: d, t1: d + 2.4, dx: 30, dy: 0 }]} />} sons={[{ t: d, tipo: "tecla" }]}
        codigo={de((i) => (i <= 2 || i === 8 ? {} : i === 3 ? { t: em(c, "zero"), marca: em(c, "zero"), ate: d } : i === 4 ? { t: em(c, "se"), marca: d } : null))} />
    );
  },
  5: ({ cena: c }) => {
    const s = em(c, "cima"), e = em(c, "esquerda");
    return (
      <Quadro tela={<Mapa ini={[70, 60]} trechos={[{ t0: s, t1: s + 1.6, dx: 0, dy: -24 }, { t0: e, t1: e + 1.4, dx: -26, dy: 0 }, { t0: e + 1.5, t1: e + 2.6, dx: 0, dy: 20 }]} />} sons={[{ t: s, tipo: "tecla" }, { t: e, tipo: "tecla" }]}
        codigo={de((i) => (i <= 4 || i === 8 ? {} : i === 5 ? { t: s - 0.3, marca: s, ate: e } : i === 6 ? { t: e, marca: e } : null))} />
    );
  },
  6: ({ cena: c }) => {
    const m = em(c, "move");
    return (
      <Quadro tela={<Mapa ini={[44, 64]} trechos={[{ t0: m, t1: m + 1.8, dx: 34, dy: 0 }, { t0: m + 1.9, t1: m + 3, dx: 0, dy: -20 }]} />} sons={[{ t: m, tipo: "whoosh" }]}
        codigo={de((i) => ({ marca: i === 7 ? em(c, "translate") : undefined }))} />
    );
  },
  7: ({ cena: c }) => {
    const r = em(c, "rapido");
    return (
      <Quadro tela={<Corrida t0={r} comDelta={false} />} sons={[{ t: em(c, "problema"), tipo: "erro" }, { t: em(c, "corre"), tipo: "erro" }]}
        codigo={de((i) => ({ marca: i === 7 ? em(c, "problema") : undefined }))}
        extra={<Etiqueta t={em(c, "corre")} x={540} y={1610} txt="PC rápido = Artur mais rápido ✗" cor={RPG.vermelho} tam={28} />} />
    );
  },
  8: ({ cena: c }) => (
    <Quadro tela={<Corrida t0={-10} comDelta={false} />} sons={[{ t: em(c, "deltatime"), tipo: "plim" }]}
      codigo={de((i) => ({ marca: i === 7 ? em(c, "multiplicamos") : undefined }))}
      extra={<Etiqueta t={em(c, "tempo")} x={540} y={1610} txt="deltaTime = tempo do quadro" cor={RPG.azul} tam={30} />} />
  ),
  9: ({ cena: c }) => (
    <Quadro tela={<Corrida t0={0.2} comDelta />} sons={[{ t: em(c, "mesma"), tipo: "plim" }]}
      extra={<Etiqueta t={em(c, "mesma")} x={540} y={1300} txt="mesma velocidade ✓" cor={RPG.verde} tam={46} />} />
  ),
  10: ({ cena: c }) => {
    const a = em(c, "atravessa");
    return (
      <Quadro tela={<Mapa ini={[60, 50]} trechos={[{ t0: 0.3, t1: a + 0.6, dx: 70, dy: 0 }]} />} sons={[{ t: a, tipo: "erro" }, { t: em(c, "proximo"), tipo: "plim" }]}
        extra={<>
          <Etiqueta t={em(c, "anda")} x={540} y={1150} txt="Update + Input ✓" cor={RPG.verde} tam={36} />
          <Etiqueta t={a} x={540} y={1330} txt="ATRAVESSOU A CERCA?!" cor={RPG.vermelho} tam={40} />
          <Etiqueta t={em(c, "proximo")} x={540} y={1510} txt="PRÓXIMO EPISÓDIO ▶" cor={RPG.verde} tam={38} />
        </>} />
    );
  },
};

export const RpgEp05: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
