import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import tl from "../../public/videos/imagina-so-02-mae-dona-do-roblox-mwtmul0g/timeline.json";
import { COR, mola, rampa, useT } from "./Bloco";
import { Aura, Boneco3D, Brilhos, Caixa, Camera, Controle3D, type Expr, Mundo3D, Pia3D, tremor } from "./Bloco3D";
import { Brocolis3D, Cadeado3D, Livro3D, Lupa3D, Moeda3D, Poof3D, Relogio3D, Trono3D } from "./Objetos3D";
import { Balao3D, Faixa3D, Flash, Legenda3D, Marca3D, Sobe3D, montarFala, type Banner } from "./Camada2D";

// Imagina Só #02: "a sua MÃE fosse a DONA do Roblox". Mesma mãe e filho do #01,
// narração a 1.15x, um plano a cada ~1 s, controle na câmera no começo e no fim (loop).

const PASTA = "videos/imagina-so-02-mae-dona-do-roblox-mwtmul0g/";
const F = montarFala(tl, { vel: 1.15, inicio: 0.35 });
const { S, W } = F;
const PI = Math.PI;

type V3 = [number, number, number];
type Ator = {
  pos: V3; rotY?: number; esc?: number; expr?: Expr; bracoE?: [number, number]; bracoD?: [number, number];
  pernaE?: number; pernaD?: number; cabeca?: [number, number]; olhos?: number; segura?: React.ReactNode; seguraE?: React.ReactNode;
  boca?: number; rot?: V3; amassa?: number; coroa?: boolean; casaco?: boolean; disfarce?: boolean; some?: boolean;
};
type Plano = { pos: V3; alvo: V3; fov?: number; roll?: number };

// ── marcos ───────────────────────────────────────────────────────────────
const MAE = W(0, "mãe"), DONA = W(0, "dona"), RBX = W(0, "Roblox"), POUSO = MAE + 0.16;
const DEZ = W(1, "10"), NOITE = W(1, "noite"), PONTO = W(1, "ponto");
const COME = W(2, "come"), BROC = W(2, "brócolis"), TODINHO = W(2, "todinho");
const BANIDO = W(3, "banido"), TRES = W(3, "3");
const LE = W(4, "lê"), CHAT = W(4, "chat"), INTEIRO = W(4, "inteiro"), ATE = W(4, "até"), APAGOU = W(4, "apagou");
const ESCOLHEU = W(5, "escolheu"), CASACO = W(5, "casaco");
const ATUAL = W(6, "atualização"), MODO = W(6, "modo");
const CRIA = W(7, "cria"), FUGIR = W(7, "fugir");
const MODER = W(8, "moderadora"), ERA = W(8, "era"), TODO = W(8, "todo");
const LAVAR = W(9, "lavar"), PEDIR = W(9, "pedir");
const QUAL = W(10, "qual"), COMENTA = W(10, "comenta"), ARREMESSO = W(10, "aí") + 0.35;
export const DONA_3D_DUR = Math.max(F.fim + 0.2, ARREMESSO + 0.5);

const TRONO: V3 = [-0.7, 0, -2.4];
const SENTADA: V3 = [-0.7, 0.17, -2.3];
const FILHO: V3 = [1.0, 0, 0.6];
const ease = Easing.out(Easing.cubic);
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as V3;
const soma = (...vs: number[][]) => vs.reduce((a, b) => a.map((v, i) => v + b[i])) as V3;
const prog = (t: number, a: number, b: number) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const cenaDe = (t: number) => S.reduce((k, s, i) => (t >= s - 0.04 ? i : k), 0);

const maeSentada = (t: number, extra: Partial<Ator> = {}): Ator => ({
  pos: SENTADA, esc: 1.05, expr: "feliz", pernaE: -PI / 2, pernaD: -PI / 2, bracoE: [-0.5, -0.25], bracoD: [-0.5, 0.25],
  coroa: t >= DONA, ...extra,
});
const filho = (t: number, extra: Partial<Ator> = {}): Ator => ({ pos: FILHO, expr: "medo", casaco: t >= CASACO, ...extra });

// livros do "modo dever de casa": caem em volta do filho, o último na cabeça
const LIVROS = Array.from({ length: 9 }).map((_, i) => {
  const a = i * 2.4;
  const ultimo = i === 8;
  return {
    t0: MODO + i * 0.09, x: ultimo ? 0 : Math.cos(a) * (0.9 + (i % 2) * 0.3), z: ultimo ? 0 : Math.sin(a) * 0.8 + 0.3,
    y: ultimo ? 3.2 : 0.12 + (i % 3) * 0.22, giro: i * 0.7, cor: ["#3f8cff", "#e0364f", "#5ad35a", "#ffd23f", "#7b4bd6"][i % 5],
  };
});
// moedas da recompensa
const MOEDAS = Array.from({ length: 16 }).map((_, i) => ({
  t0: PEDIR + 0.05 + i * 0.07, x: -2.4 + ((i * 37) % 48) / 10, z: -1.6 + ((i * 53) % 30) / 10, giro: i * 1.3,
}));
// roupas bagunçadas no chão do quarto
const BAGUNCA: { p: V3; s: V3; cor: string; r: number }[] = [
  { p: [0.1, 0.06, 1.3], s: [0.7, 0.1, 0.5], cor: "#e0364f", r: 0.4 }, { p: [1.9, 0.06, 1.2], s: [0.6, 0.1, 0.6], cor: "#5ad35a", r: -0.3 },
  { p: [2.2, 0.15, 0.1], s: [0.5, 0.3, 0.3], cor: "#ffd23f", r: 0.9 }, { p: [-0.2, 0.06, 0.2], s: [0.8, 0.1, 0.4], cor: "#7b4bd6", r: -0.8 },
  { p: [1.4, 0.06, 1.8], s: [0.3, 0.12, 0.5], cor: "#ffffff", r: 0.2 },
];

type Estado = { cam: Plano; mae: Ator; filho: Ator; objs?: React.ReactNode; noite?: number; escuro?: number };

const estado = (t: number): Estado => {
  const k = cenaDe(t);

  if (k === 0) {
    const queda = interpolate(t, [MAE - 0.08, POUSO], [12, 0], { ...clamp, easing: Easing.in(Easing.quad) });
    const amassa = t > POUSO ? Math.exp(-(t - POUSO) * 7) * Math.cos((t - POUSO) * 22) * 0.22 : 0;
    const vira = rampa(t, POUSO + 0.05, POUSO + 0.3);
    let cam: Plano;
    if (t < 0.5) cam = { pos: [0, 2.2, 8], alvo: [0, 2.2, 0] };
    else if (t < MAE - 0.08) cam = { pos: lerp3([1.0, 1.95, 4.6], [1.0, 2.1, 3.6], prog(t, 0.5, MAE)), alvo: [1.0, 2.2, 0.6], roll: 0.04 };
    else if (t < RBX - 0.05) {
      const q = prog(t, POUSO + 0.05, RBX);
      cam = { pos: lerp3([-0.2, 0.8, 6.0], [-0.5, 2.6, 2.4], q), alvo: lerp3([-0.7, 3.4, -2.3], [-0.7, 3.0, -2.3], q), fov: 55 - 8 * q, roll: -0.05 * q };
    } else {
      const a = interpolate(t, [RBX, S[1]], [-0.7, 0.5]);
      cam = { pos: [-0.7 + Math.sin(a) * 4.6, 2.8, -2.3 + Math.cos(a) * 4.6], alvo: [-0.7, 2.6, -2.3] };
    }
    const v = Math.min(1, t / 0.47);
    return {
      cam,
      mae: maeSentada(t, { pos: [SENTADA[0], SENTADA[1] + queda, SENTADA[2]], amassa, olhos: t >= RBX ? 0.7 : 0,
        bracoE: t < POUSO ? [-2.7, -0.35] : t >= RBX ? [-2.6, -0.3] : [-0.5, -0.25], bracoD: t < POUSO ? [-2.7, 0.35] : t >= RBX ? [-2.6, 0.3] : [-0.5, 0.25] }),
      filho: filho(t, { rotY: interpolate(vira, [0, 1], [0, -2.61]), cabeca: [t < POUSO ? -0.3 : 0.05, 0],
        bracoE: t > 0.45 ? [-2.3, -0.35] : [0, -0.12], bracoD: t > 0.45 ? [-2.3, 0.35] : [0, 0.12] }),
      objs: (
        <>
          {t < 0.5 && <Controle3D pos={lerp3([0, 3.2, -6], [0, 2.2, 7.3], v * v)} rot={[t * 20, 0.4, t * 6]} esc={1.4} />}
          <Aura t={t} forca={rampa(t, RBX - 0.1, RBX + 0.3)} pos={TRONO} />
          {t >= DONA && t < DONA + 1 && <Brilhos t={t} pos={[SENTADA[0], 3.8, SENTADA[2]]} raio={0.8} />}
          {t >= POUSO && t < POUSO + 0.7 && <Poof3D t={t} t0={POUSO} pos={[SENTADA[0], -1, SENTADA[2] + 0.5]} />}
        </>
      ),
    };
  }

  if (k === 1) {
    // regra nº 1: o relógio bate 22h e o servidor fecha
    const h = interpolate(t, [S[1], DEZ], [21.75, 22], clamp);
    const fechado = t >= PONTO;
    const cam: Plano = t < NOITE - 0.04
      ? { pos: lerp3([0, 5.3, -1.6], [0, 5.3, -2.6], prog(t, S[1], NOITE)), alvo: [0, 5.3, -7], fov: 45 }
      : { pos: lerp3([0.3, 3.0, 8.6], [0.3, 2.9, 7.8], prog(t, NOITE, S[2])), alvo: [0.1, 2.6, -1.4] };
    return {
      cam, noite: rampa(t, NOITE - 0.1, NOITE + 0.3),
      mae: maeSentada(t, { expr: "brava", bracoD: [-2.9, 0.3] }),
      filho: filho(t, { rotY: -0.3, expr: fechado ? "medo" : "feliz", bracoD: [-1.1, 0.15], bracoE: [-1.1, -0.15],
        segura: fechado ? undefined : <Controle3D rot={[1.1, 0, 0]} esc={0.6} pos={[-0.35, 0, 0.1]} /> }),
      objs: (
        <>
          <Relogio3D pos={[0, 5.3, -6.7]} esc={0.7} h={h} />
          <Poof3D t={t} t0={PONTO} pos={[FILHO[0] - 0.3, -0.2, FILHO[2] + 0.7]} />
        </>
      ),
    };
  }

  if (k === 2) {
    // brócolis antes dos Robux
    const resto = 1 - rampa(t, COME, TODINHO + 0.3);
    const comendo = t >= COME && t < TODINHO + 0.4;
    const cam: Plano = t < BROC - 0.04
      ? { pos: lerp3([0.3, 3.0, 8.6], [0.3, 2.9, 7.8], prog(t, S[2], BROC)), alvo: [0.2, 2.0, -0.8] }
      : { pos: lerp3([1.0, 2.6, 4.4], [1.0, 2.5, 3.8], prog(t, BROC, S[3])), alvo: [1.0, 1.7, 0.8], fov: 48 };
    return {
      cam,
      mae: maeSentada(t, { expr: "brava", bracoE: [-0.2, -0.75], bracoD: [-0.2, 0.75] }),
      filho: filho(t, { expr: t >= TODINHO + 0.3 ? "feliz" : "medo", bracoD: comendo ? [-2.1 + Math.sin(t * 14) * 0.4, 0.3] : [-0.3, 0.15],
        boca: comendo ? Math.abs(Math.sin(t * 14)) * 0.7 : 0 }),
      objs: (
        <>
          <Caixa p={[FILHO[0], 0.45, FILHO[2] + 1.0]} s={[1.9, 0.9, 1.1]} cor="#a8703e" contorno={0.05} />
          <Brocolis3D pos={[FILHO[0], 0.96, FILHO[2] + 1.0]} esc={0.8} resto={resto} />
        </>
      ),
    };
  }

  if (k === 3) {
    // quarto bagunçado → banido por 3 dias
    const cai = interpolate(t, [BANIDO - 0.15, BANIDO + 0.05], [11, 1.4], { ...clamp, easing: Easing.in(Easing.quad) });
    return {
      cam: t < BANIDO - 0.04
        ? { pos: lerp3([1.0, 3.6, 5.2], [1.0, 3.2, 4.4], prog(t, S[3], BANIDO)), alvo: [1.0, 1.0, 0.8], fov: 50 }
        : { pos: lerp3([0.6, 2.8, 8.0], [0.6, 2.7, 7.2], prog(t, BANIDO, S[4])), alvo: [0.6, 2.2, -0.6] },
      mae: maeSentada(t, { expr: "brava", olhos: t >= BANIDO ? 0.8 : 0, bracoD: t >= BANIDO ? [-1.6, 0.1] : [-0.5, 0.25] }),
      filho: filho(t, { expr: "medo", cabeca: [t >= BANIDO ? -0.3 : 0.1, 0], bracoE: [-2.3, -0.35], bracoD: [-2.3, 0.35] }),
      objs: (
        <>
          {BAGUNCA.map((b, i) => <Caixa key={i} p={b.p} s={b.s} cor={b.cor} rot={[0, b.r, 0]} contorno={0.03} />)}
          {t >= BANIDO - 0.15 && <Cadeado3D pos={[FILHO[0], cai, FILHO[2] + 0.75]} esc={1.5} />}
        </>
      ),
    };
  }

  if (k === 4) {
    // ela lê o chat inteiro, até o apagado
    const lx = interpolate(t, [LE, APAGOU], [-1.6, 0.2], clamp);
    return {
      cam: { pos: lerp3([-0.4, 2.95, 1.3], [-0.55, 2.95, 0.8], prog(t, S[4], S[5])), alvo: [-0.7, 2.85, -2.3], fov: 44 },
      mae: maeSentada(t, { expr: t >= APAGOU ? "feliz" : "brava", olhos: t >= LE ? 1.2 : 0, bracoE: [-1.4, -0.1],
        seguraE: <Lupa3D rot={[1.4, 0, 0]} esc={0.6} pos={[0.2, -0.2, 0.2]} /> }),
      filho: filho(t, { some: true }),
      objs: <Lupa3D pos={[-0.7 + lx, 2.9, -1.2]} esc={0.55} />,
    };
  }

  if (k === 5) {
    // skin nova: casaco e cachecol
    return {
      cam: t < CASACO - 0.04
        ? { pos: lerp3([1.0, 2.5, 4.4], [1.0, 2.45, 3.8], prog(t, S[5], CASACO)), alvo: [1.0, 2.1, 0.6], fov: 48 }
        : { pos: lerp3([0.4, 2.9, 8.2], [0.4, 2.8, 7.4], prog(t, CASACO, S[6])), alvo: [0.2, 2.1, -0.8] },
      mae: maeSentada(t, { expr: "feliz", bracoD: t >= ESCOLHEU ? [-1.6, 0.1] : [-0.5, 0.25] }),
      filho: filho(t, { expr: t >= CASACO ? "medo" : "feliz", cabeca: [t >= CASACO ? 0.25 : 0, 0], bracoE: [0, -0.12], bracoD: [0, 0.12] }),
      objs: <Poof3D t={t} t0={CASACO} pos={[FILHO[0], -0.2, FILHO[2] + 0.4]} />,
    };
  }

  if (k === 6) {
    // atualização obrigatória: chuva de livros
    return {
      cam: t < MODO - 0.04
        ? { pos: lerp3([0.4, 2.9, 8.2], [0.4, 2.8, 7.6], prog(t, S[6], MODO)), alvo: [0.2, 2.1, -0.8] }
        : { pos: lerp3([1.4, 4.2, 6.6], [1.3, 3.8, 5.8], prog(t, MODO, S[7])), alvo: [0.9, 1.4, 0.4], fov: 52 },
      mae: maeSentada(t, { expr: "feliz", bracoE: [-2.4, -0.3] }),
      filho: filho(t, { expr: "medo", bracoE: t >= MODO ? [-2.6, -0.5] : [0, -0.12], bracoD: t >= MODO ? [-2.6, 0.5] : [0, 0.12] }),
      objs: LIVROS.map((l, i) => {
        if (t < l.t0) return null;
        const y = interpolate(t, [l.t0, l.t0 + 0.35], [10, l.y], { ...clamp, easing: Easing.in(Easing.quad) });
        return <Livro3D key={i} pos={[FILHO[0] + l.x, y, FILHO[2] + l.z]} rot={[0, l.giro, 0]} esc={0.9} cor={l.cor} />;
      }),
    };
  }

  if (k === 7) {
    // conta nova com disfarce e fuga
    const x = FILHO[0] + Math.max(0, t - FUGIR) * 4.5;
    const correndo = t >= FUGIR;
    return {
      cam: correndo
        ? { pos: [x - 0.6, 2.4, 7.2], alvo: [x + 0.6, 1.9, 0.4], fov: 50 }
        : { pos: lerp3([1.0, 2.5, 4.4], [1.0, 2.45, 3.8], prog(t, S[7], FUGIR)), alvo: [1.0, 2.2, 0.6], fov: 48 },
      mae: maeSentada(t, { expr: "brava" }),
      filho: filho(t, { pos: [x, correndo ? Math.abs(Math.sin(t * 11)) * 0.15 : 0, FILHO[2]], rotY: correndo ? PI / 2 : 0, expr: "feliz", disfarce: t >= CRIA,
        bracoE: correndo ? [Math.sin(t * 22) * 0.9, -0.1] : [0, -0.12], bracoD: correndo ? [-Math.sin(t * 22) * 0.9, 0.1] : [0, 0.12],
        pernaE: correndo ? Math.sin(t * 22) * 0.7 : 0, pernaD: correndo ? -Math.sin(t * 22) * 0.7 : 0 }),
      objs: <Poof3D t={t} t0={CRIA} pos={[FILHO[0], -0.2, FILHO[2] + 0.4]} />,
    };
  }

  if (k === 8) {
    // virada: a moderadora era ela
    const xF = Math.min(4.2, FILHO[0] + Math.max(0, t - FUGIR) * 4.5);
    const parou = t >= MODER - 0.05;
    const correndo = !parou;
    const surge = mola(t, MODER - 0.05, 30, 10, 200);
    return {
      cam: parou
        ? { pos: lerp3([4.6, 1.6, 11.4], [4.7, 1.9, 10.4], prog(t, MODER, S[9])), alvo: [5.1, 3.4, 0.4], fov: 56 }
        : { pos: [xF - 0.6, 2.4, 7.2], alvo: [xF + 0.6, 1.9, 0.4] },
      escuro: rampa(t, MODER - 0.1, MODER + 0.3),
      mae: { pos: [6.1, 0, 0.4], rotY: -0.95, esc: 1.6 * surge, expr: "brava", olhos: 1.4, coroa: true, some: !parou,
        bracoE: [0, -0.7], bracoD: [0, 0.7] },
      filho: filho(t, { pos: [xF, 0, FILHO[2]], rotY: PI / 2, expr: parou ? "medo" : "feliz", disfarce: t < TODO,
        bracoE: correndo ? [Math.sin(t * 22) * 0.9, -0.1] : [-2.3, -0.35], bracoD: correndo ? [-Math.sin(t * 22) * 0.9, 0.1] : [-2.3, 0.35],
        pernaE: correndo ? Math.sin(t * 22) * 0.7 : 0, pernaD: correndo ? -Math.sin(t * 22) * 0.7 : 0 }),
      objs: (
        <>
          <Poof3D t={t} t0={MODER - 0.05} pos={[6.1, -0.4, 0.6]} />
          <Poof3D t={t} t0={TODO} pos={[xF, 0.2, FILHO[2] + 0.4]} />
        </>
      ),
    };
  }

  const moedas = (t: number) => MOEDAS.map((m, i) => {
    if (t < m.t0) return null;
    const y = interpolate(t, [m.t0, m.t0 + 0.5], [9, 0.32], { ...clamp, easing: Easing.in(Easing.quad) });
    const parada = t > m.t0 + 0.5;
    return <Moeda3D key={i} pos={[m.x, y, m.z]} rot={parada ? [PI / 2, 0, m.giro] : [t * 6, m.giro + t * 4, 0]} esc={0.6} />;
  });

  if (k === 9) {
    // lavar a louça sem ela pedir → chuva de moedas
    const escuro = 1 - rampa(t, S[9], S[9] + 0.5);
    if (t < LAVAR - 0.04) {
      return {
        cam: { pos: lerp3([1.0, 2.6, 3.8], [1.0, 2.6, 3.2], prog(t, S[9], LAVAR)), alvo: [1.0, 2.3, 0.6], fov: 45 }, escuro,
        mae: maeSentada(t, { expr: "brava" }),
        filho: filho(t, { expr: "medo", cabeca: [0.1, 0.3], bracoD: [-2.9, -0.5] }),
      };
    }
    const esfrega = Math.sin(t * 18) * 0.25;
    const pediu = t >= PEDIR;
    return {
      cam: { pos: lerp3([0.0, 3.2, 6.6], [-0.2, 3.0, 5.8], prog(t, LAVAR, S[10])), alvo: [-0.2, 1.9, -0.6], fov: 52 }, escuro,
      mae: { pos: [1.7, 0, -1.6], rotY: -0.6, esc: 1.05, coroa: true, expr: pediu ? "feliz" : "medo", bracoE: pediu ? [-2.6, -0.4] : [0, -0.12], bracoD: pediu ? [-2.6, 0.4] : [0, 0.12] },
      filho: filho(t, { pos: [-1.0, 0, -1.0], expr: "feliz", bracoD: [-1.0, 0.1 + esfrega], bracoE: [-1.0, -0.1 - esfrega] }),
      objs: (
        <>
          <group position={[-1.0, 0, 0.15]} rotation={[0, PI / 2, 0]}><Pia3D t={t} /></group>
          {moedas(t)}
        </>
      ),
    };
  }

  // 10: chamada + controle na câmera (volta ao começo)
  const tchau = Math.sin(t * 12) * 0.35;
  const joga = t >= ARREMESSO;
  const v = Math.min(1, (t - ARREMESSO) / 0.42);
  return {
    cam: { pos: lerp3([0, 2.3, 7.0], [0, 2.3, 6.2], prog(t, S[10], DONA_3D_DUR)), alvo: [0, 2.1, -0.6] },
    mae: { pos: [-0.95, 0, -0.4], rotY: 0.3, esc: 1.05, coroa: true, expr: "feliz", bracoE: [-2.6, -0.3 + tchau],
      bracoD: joga ? [-1.0, 0.12] : [-2.6, 0.12], segura: joga ? undefined : <Controle3D rot={[PI / 2, 0, 0]} esc={0.55} /> },
    filho: filho(t, { pos: [0.95, 0, -0.4], rotY: -0.3, expr: "feliz", bracoD: [-2.6, 0.3 - tchau], bracoE: [-0.5, -0.4] }),
    objs: (
      <>
        {moedas(t)}
        {joga && <Controle3D pos={lerp3([-0.2, 3.0, -0.2], [0, 2.3, 5.6], v * v)} rot={[t * 20, 0.4, t * 6]} esc={1.4} />}
      </>
    ),
  };
};

const Personagem: React.FC<{ a: Ator; tipo: "mae" | "filho" }> = ({ a, tipo }) => {
  if (a.some) return null;
  const am = a.amassa ?? 0;
  return (
    <group position={a.pos} rotation={a.rot ?? [0, 0, 0]} scale={[1 + am * 0.6, 1 - am, 1 + am * 0.6]}>
      <Boneco3D tipo={tipo} rotY={a.rotY} esc={a.esc} expr={a.expr} bracoE={a.bracoE} bracoD={a.bracoD} pernaE={a.pernaE} pernaD={a.pernaD}
        cabeca={a.cabeca} olhosBrilho={a.olhos ?? 0} segura={a.segura} seguraE={a.seguraE} boca={a.boca}
        coroa={a.coroa} casaco={a.casaco} disfarce={a.disfarce} />
    </group>
  );
};

const TREMORES: [number, number, number][] = [[0.45, 0.5, 0.25], [POUSO, 0.45, 0.3], [PONTO, 0.4, 0.1], [BANIDO + 0.05, 0.5, 0.3], [MODER, 0.5, 0.2], [ARREMESSO + 0.4, 0.3, 0.1]];

const Cena3D: React.FC = () => {
  const { t } = useT();
  const e = estado(t);
  const n = e.noite ?? 0, r = e.escuro ?? 0;
  const apaga = Math.max(n, r);
  const tr = soma([0, 0, 0], ...TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp)));
  return (
    <>
      <Camera pos={soma(e.cam.pos, tr)} alvo={e.cam.alvo} fov={e.cam.fov ?? 50} roll={e.cam.roll ?? 0} />
      <ambientLight intensity={0.55 * (1 - 0.5 * apaga)} color={n > 0 ? "#b8c8ff" : "#ffffff"} />
      <hemisphereLight args={["#cfefff", "#7fbf5a", 0.7 * (1 - 0.65 * apaga)]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6 * (1 - 0.45 * apaga)} color={r > 0 ? "#ffb0a0" : n > 0 ? "#a8b8ff" : "#ffffff"} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
      {r > 0 && <pointLight position={[5, 5, 4]} color="#ff2040" intensity={3 * r} distance={14} />}
      <Mundo3D t={t} />
      <Trono3D pos={TRONO} />
      <Personagem a={e.mae} tipo="mae" />
      <Personagem a={e.filho} tipo="filho" />
      {e.objs}
    </>
  );
};

// ── camada 2D ────────────────────────────────────────────────────────────
const BANNERS: Banner[] = [
  { t0: DONA, t1: S[1], txt: "👑 DONA DO JOGO", y: 240, tam: 92 },
  { t0: RBX, t1: S[1], txt: "ADMIN", y: 380, tam: 120, cor: "#ffffff" },
  { t0: S[1], t1: PONTO, txt: "REGRA Nº 1", y: 230, tam: 100 },
  { t0: DEZ, t1: PONTO, txt: "22:00 ⏰", y: 370, tam: 100, cor: "#ffffff" },
  { t0: S[2], t1: S[3], txt: "QUER ROBUX? 💰", y: 230, tam: 92 },
  { t0: BROC, t1: S[3], txt: "🥦 COME O BRÓCOLIS", y: 360, tam: 76, cor: COR.verde },
  { t0: S[3], t1: S[4], txt: "QUARTO BAGUNÇADO 🧦", y: 230, tam: 72, cor: "#ffffff" },
  { t0: BANIDO, t1: S[4], txt: "BANIDO ⛔", y: 350, tam: 130, cor: COR.vermelho },
  { t0: TRES, t1: S[4], txt: "3 DIAS", y: 520, tam: 96, cor: "#ffffff" },
  { t0: S[4], t1: S[5], txt: "ELA LÊ TUDO 👀", y: 230, tam: 92 },
  { t0: S[5], t1: S[6], txt: "SKIN NOVA ✨", y: 230, tam: 96 },
  { t0: ESCOLHEU, t1: S[6], txt: "ESCOLHIDA PELA MÃE", y: 360, tam: 72, cor: "#ffffff" },
  { t0: CASACO, t1: S[6], txt: "😳 CASACO + CACHECOL", y: 480, tam: 70, cor: "#7fd3ff" },
  { t0: MODO, t1: S[7], txt: "📚 MODO DEVER DE CASA", y: 400, tam: 76, cor: "#ffffff" },
  { t0: CRIA, t1: S[8], txt: "CONTA NOVA 🥸", y: 230, tam: 96 },
  { t0: FUGIR, t1: S[8], txt: "FUGINDO… 🏃", y: 370, tam: 84, cor: "#ffffff" },
  { t0: MODER, t1: S[9], txt: "⚠ MODERADORA ⚠", y: 230, tam: 92, cor: COR.vermelho },
  { t0: ERA, t1: S[9], txt: "ERA ELA! 😱", y: 370, tam: 120, cor: "#ffffff" },
  { t0: TODO, t1: S[9], txt: "DISFARCE FALHOU ❌", y: 1130, tam: 70 },
  { t0: S[9], t1: S[10], txt: "COMO GANHAR ROBUX? 🤔", y: 230, tam: 74 },
  { t0: LAVAR, t1: S[10], txt: "🍽 LAVAR A LOUÇA", y: 360, tam: 80, cor: "#7fd3ff" },
  { t0: PEDIR, t1: S[10], txt: "SEM ELA PEDIR ✓", y: 490, tam: 76, cor: COR.verde },
  { t0: QUAL, t1: DONA_3D_DUR, txt: "QUAL SERIA A 1ª REGRA?", y: 240, tam: 66, cor: "#ffffff" },
  { t0: COMENTA, t1: DONA_3D_DUR, txt: "COMENTA AÍ 👇", y: 360, tam: 112 },
];

const Painel: React.FC<{ t0: number; t1: number; titulo: string; valor: string; pct: number; top?: number }> = ({ t0, t1, titulo, valor, pct, top = 230 }) => {
  const { t, fps } = useT();
  if (t < t0 || t >= t1) return null;
  const s = mola(t, t0, fps, 12, 200);
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top, transform: `translateY(${(1 - s) * -300}px)`, background: "#241c46",
      border: `8px solid ${COR.linha}`, borderRadius: 32, padding: "22px 34px", boxShadow: "0 14px 0 rgba(0,0,0,.3)", fontFamily: "Poppins", fontWeight: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", color: "#fff" }}>
        <span style={{ fontSize: 44 }}>{titulo}</span>
        <span style={{ fontSize: 80, color: COR.amarelo }}>{valor}</span>
      </div>
      <div style={{ height: 34, marginTop: 10, background: "#3b3060", borderRadius: 17, overflow: "hidden", border: `5px solid ${COR.linha}` }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${COR.verde}, ${COR.amarelo})` }} />
      </div>
    </div>
  );
};

/** Tela preta de servidor fechado. */
const Fechado: React.FC = () => {
  const { t, fps } = useT();
  if (t < PONTO || t >= S[2]) return null;
  const s = mola(t, PONTO, fps, 9, 220);
  return (
    <AbsoluteFill style={{ background: "rgba(8,6,20,.88)", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 900, textAlign: "center" }}>
      <div style={{ transform: `scale(${0.4 + 0.6 * s})` }}>
        <div style={{ fontSize: 76, color: COR.vermelho, WebkitTextStroke: `14px ${COR.linha}`, paintOrder: "stroke fill" }}>🔒 SERVIDOR FECHADO</div>
        <div style={{ fontSize: 130, color: "#ffffff", marginTop: 30, WebkitTextStroke: `18px ${COR.linha}`, paintOrder: "stroke fill" }}>VAI DORMIR 😴</div>
      </div>
    </AbsoluteFill>
  );
};

/** Chat do filho que a mãe lê (estilo celular), com a mensagem apagada revelada. */
const Chat: React.FC = () => {
  const { t, fps } = useT();
  if (t < CHAT - 0.05 || t >= S[5]) return null;
  const msgs = [
    { t0: CHAT, txt: "bora jogar até 3h 😎" },
    { t0: INTEIRO, txt: "não conta pra minha mãe" },
    { t0: ATE, txt: t >= APAGOU ? "fui eu que comi o pudim 🍮" : "🗑 mensagem apagada", revela: t >= APAGOU },
  ];
  return (
    <div style={{ position: "absolute", left: 50, top: 480, display: "flex", flexDirection: "column", gap: 26, fontFamily: "Poppins", fontWeight: 800 }}>
      {msgs.map((m, i) => {
        if (t < m.t0 - 0.05) return null;
        const s = mola(t, m.t0 - 0.05, fps, 10, 240);
        return (
          <div key={i} style={{ transform: `scale(${s})`, transformOrigin: "0 50%", alignSelf: "flex-start", position: "relative" }}>
            <div style={{ background: m.revela ? "#ffffff" : "#3f8cff", color: m.revela ? COR.linha : "#ffffff", fontSize: 50, padding: "18px 30px",
              borderRadius: "34px 34px 34px 8px", border: `7px solid ${m.revela ? COR.vermelho : COR.linha}`, boxShadow: "0 10px 0 rgba(0,0,0,.25)",
              fontStyle: !m.revela && i === 2 ? "italic" : "normal" }}>{m.txt}</div>
            {m.revela && (
              <div style={{ position: "absolute", right: -20, top: -34, background: COR.vermelho, color: "#fff", fontSize: 34, padding: "4px 16px", borderRadius: 14,
                border: `5px solid ${COR.linha}`, transform: "rotate(8deg)" }}>👀 VISTO</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const SONS: { t: number; s: string; v: number }[] = [
  { t: 0, s: "whoosh", v: 0.6 }, { t: 0.44, s: "impacto", v: 0.7 }, { t: MAE - 0.15, s: "whoosh", v: 0.5 }, { t: POUSO, s: "impacto", v: 0.8 },
  { t: DONA, s: "plim", v: 0.45 }, { t: RBX - 0.2, s: "aura", v: 0.45 }, { t: RBX, s: "pop", v: 0.45 },
  { t: S[1], s: "whoosh", v: 0.4 }, { t: DEZ, s: "contagem", v: 0.35 }, { t: PONTO, s: "erro", v: 0.5 }, { t: PONTO + 0.02, s: "impacto", v: 0.5 },
  { t: S[2], s: "pop", v: 0.4 }, { t: BROC, s: "pop", v: 0.4 }, { t: COME, s: "tecla", v: 0.3 }, { t: TODINHO + 0.3, s: "plim", v: 0.45 },
  { t: BANIDO - 0.15, s: "whoosh", v: 0.5 }, { t: BANIDO + 0.05, s: "impacto", v: 0.85 }, { t: TRES, s: "erro", v: 0.4 },
  { t: LE, s: "aura", v: 0.35 }, { t: CHAT, s: "pop", v: 0.4 }, { t: INTEIRO, s: "pop", v: 0.4 }, { t: ATE, s: "pop", v: 0.4 }, { t: APAGOU, s: "erro", v: 0.45 },
  { t: S[5], s: "whoosh", v: 0.4 }, { t: CASACO, s: "pop", v: 0.55 }, { t: CASACO + 0.1, s: "erro", v: 0.3 },
  { t: ATUAL, s: "contagem", v: 0.35 }, { t: ATUAL + 0.7, s: "contagem", v: 0.35 }, { t: MODO, s: "whoosh", v: 0.5 },
  ...LIVROS.map((l) => ({ t: l.t0 + 0.35, s: "pop", v: 0.3 })),
  { t: CRIA, s: "pop", v: 0.5 }, { t: FUGIR, s: "whoosh", v: 0.5 },
  { t: MODER - 0.05, s: "pop", v: 0.6 }, { t: MODER, s: "impacto", v: 0.85 }, { t: ERA, s: "erro", v: 0.4 }, { t: TODO, s: "pop", v: 0.5 },
  { t: LAVAR, s: "whoosh", v: 0.4 }, { t: PEDIR, s: "plim", v: 0.5 }, { t: PEDIR + 0.3, s: "contagem", v: 0.4 },
  { t: QUAL, s: "pop", v: 0.4 }, { t: COMENTA, s: "pop", v: 0.5 }, { t: ARREMESSO, s: "whoosh", v: 0.6 }, { t: ARREMESSO + 0.4, s: "impacto", v: 0.7 },
];

export const ImaginaSoDona3D: React.FC = () => {
  const { t } = useT();
  const tr = TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp * 100)).reduce((x, y) => soma(x, y), [0, 0, 0] as V3);
  const e = estado(t);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4fb6ff 0%, #bfe7ff 70%)" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #0b1030 0%, #2a3570 75%)", opacity: e.noite ?? 0 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #2a0710 0%, #8a1024 75%)", opacity: e.escuro ?? 0 }} />
      <ThreeCanvas width={1080} height={1920} shadows flat camera={{ fov: 50, position: [0, 2.2, 8], near: 0.1, far: 200 }}>
        <Cena3D />
      </ThreeCanvas>
      <AbsoluteFill style={{ transform: `translate(${tr[0]}px, ${tr[1]}px)` }}>
        <Marca3D />
        <Fechado />
        {BANNERS.map((b, i) => <Faixa3D key={i} {...b} />)}
        <Painel t0={COME - 0.1} t1={S[3]} titulo="🥦 BRÓCOLIS" valor={`${Math.round(rampa(t, COME, TODINHO + 0.3, 0, 100))}%`} pct={rampa(t, COME, TODINHO + 0.3, 0, 100)} top={520} />
        <Painel t0={ATUAL} t1={MODO + 0.2} titulo="⬇ ATUALIZANDO" valor={`${Math.round(rampa(t, ATUAL, MODO, 0, 100))}%`} pct={rampa(t, ATUAL, MODO, 0, 100)} />
        <Chat />
        <Sobe3D t0={TODINHO + 0.3} txt="+10 ROBUX 💰" x={700} y={760} />
        <Sobe3D t0={PEDIR + 0.3} txt="+1000 ROBUX 💰" x={540} y={680} />
        <Balao3D t0={MODER + 0.2} t1={S[9]} txt="Achou que ia fugir?" x={660} y={1000} tam={52} letra={0.04} />
        <Legenda3D fala={F} fim={DONA_3D_DUR} />
      </AbsoluteFill>
      <Flash picos={[0.45, PONTO, BANIDO + 0.05, MODER, DONA_3D_DUR - 0.05]} />

      {tl.cenas.map((c, i) => (
        <Sequence key={i} from={Math.round(S[i] * 30)} layout="none"><Audio src={staticFile(PASTA + c.audio)} playbackRate={F.vel} /></Sequence>
      ))}
      <Sequence from={14} layout="none"><Audio src={staticFile("sfx/musica.wav")} volume={0.14} loop /></Sequence>
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s.t * 30))} layout="none"><Audio src={staticFile(`sfx/${s.s}.wav`)} volume={s.v} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
