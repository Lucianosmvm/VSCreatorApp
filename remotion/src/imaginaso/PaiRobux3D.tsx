import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import tl from "../../public/videos/imagina-so-03-pai-10-mil-robux-mwtnfzd3/timeline.json";
import { COR, mola, rampa, useT } from "./Bloco";
import { Boneco3D, Brilhos, Caixa, Camera, Chinelo3D, Controle3D, type Expr, Mundo3D, tremor } from "./Bloco3D";
import { Churrasqueira3D, Espeto3D, Explosao3D, Holofote3D, Moeda3D, Pergaminho3D, Poof3D, Porquinho3D, Sofa3D, Trofeu3D } from "./Objetos3D";
import { Balao3D, Faixa3D, Flash, Legenda3D, Marca3D, Sobe3D, montarFala, type Banner } from "./Camada2D";

// Imagina Só #03: "o seu PAI te desse 10 mil Robux". Versão longa (~53 s, narração em 1.0x)
// com o pai novo; a mãe do #01/#02 aparece no fim. Moeda na câmera no começo e no fim (loop).

const PASTA = "videos/imagina-so-03-pai-10-mil-robux-mwtnfzd3/";
const F = montarFala(tl, { vel: 1.0, inicio: 0.35 });
const { S, W } = F;
const PI = Math.PI;

type V3 = [number, number, number];
type Ator = {
  pos: V3; rotY?: number; esc?: number; expr?: Expr; bracoE?: [number, number]; bracoD?: [number, number];
  pernaE?: number; pernaD?: number; cabeca?: [number, number]; olhos?: number; segura?: React.ReactNode; seguraE?: React.ReactNode;
  boca?: number; rot?: V3; coroa?: boolean; social?: boolean; avental?: boolean; some?: boolean;
  camisaCor?: string; calcaCor?: string; boneCor?: string;
};
type Plano = { pos: V3; alvo: V3; fov?: number; roll?: number };

// ── marcos ───────────────────────────────────────────────────────────────
const PAI_T = W(0, "pai"), DEZ = W(0, "10"), RBX = W(0, "Robux");
const NUNCA = W(1, "nunca");
const RENDE = W(2, "rende"), POUP = W(2, "poupança");
const TERMOS = W(3, "termos"), TODOS = W(3, "todos"), VOZ = W(3, "voz");
const CRIA = W(4, "cria"), AJUDAR = W(4, "ajudar");
const ADIC = W(5, "adicionou"), AMIGOS = W(5, "amigos");
const BOMDIA = W(6, "bom"), FIGURA = W(6, "figurinha");
const PARADO = W(7, "parado"), CRUZ = W(7, "cruzados");
const DESCOBRE = W(8, "descobre"), CHURR = W(8, "churrasco"), SAI = W(8, "sai");
const GASTA = W(9, "gasta"), VIRTUAL = W(9, "virtual");
const ZERO = W(10, "zero"), MELHOR = W(10, "melhor");
const FAMOSO = W(11, "famoso"), TIOZAO = W(11, "tiozão");
const BORA = W(12, "bora");
const MAE_T = W(13, "mãe"), LAVAR = W(13, "lavar");
const QUE = W(14, "quê"), COMENTA = W(14, "comenta"), ARREMESSO = W(14, "aí") + 0.35;
export const PAI_3D_DUR = Math.max(F.fim + 0.2, ARREMESSO + 0.5);

const PAI: V3 = [-0.9, 0, -0.6];
const FILHO: V3 = [1.0, 0, -0.2];
const GRELHA: V3 = [0.6, 0, 0.7];
const ease = Easing.out(Easing.cubic);
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as V3;
const soma = (...vs: number[][]) => vs.reduce((a, b) => a.map((v, i) => v + b[i])) as V3;
const prog = (t: number, a: number, b: number) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const cenaDe = (t: number) => S.reduce((k, s, i) => (t >= s - 0.04 ? i : k), 0);

const pai = (t: number, extra: Partial<Ator> = {}): Ator => ({ pos: PAI, rotY: 0.25, expr: "feliz", social: t >= CRIA, avental: t >= CHURR, ...extra });
const filho = (extra: Partial<Ator> = {}): Ator => ({ pos: FILHO, rotY: -0.25, expr: "feliz", ...extra });
const controle = (invertido = false) => <Controle3D rot={[invertido ? 1.3 + PI : 1.3, 0, 0]} esc={0.6} pos={[-0.4, 0, 0.1]} />;
const BRACOS_CRUZADOS: { bracoE: [number, number]; bracoD: [number, number] } = { bracoE: [-1.45, 0.95], bracoD: [-1.45, -0.95] };

const MOEDAS = Array.from({ length: 18 }).map((_, i) => ({ t0: DEZ + i * 0.06, x: -2.6 + ((i * 37) % 52) / 10, z: -1.8 + ((i * 53) % 34) / 10, giro: i * 1.3 }));
const chuvaMoedas = (t: number) => MOEDAS.map((m, i) => {
  if (t < m.t0) return null;
  const y = interpolate(t, [m.t0, m.t0 + 0.5], [9, 0.32], { ...clamp, easing: Easing.in(Easing.quad) });
  return <Moeda3D key={i} pos={[m.x, y, m.z]} rot={t > m.t0 + 0.5 ? [PI / 2, 0, m.giro] : [t * 6, m.giro + t * 4, 0]} esc={0.6} />;
});
const EXPLOSOES = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ t0: S[7] + 0.15 + i * 0.45, p: [PAI[0] + Math.cos(i * 2.1) * 2.2, 1.2 + (i % 3) * 0.7, PAI[2] + Math.sin(i * 2.1) * 1.6] as V3 }));
const FIGURANTES = [
  { cam: "#ff8a3d", bone: "#c0392b" }, { cam: "#5ad35a", bone: "#2e7d32" }, { cam: "#7b4bd6", bone: "#4a2a8a" },
  { cam: "#ff5fa2", bone: "#c2185b" }, { cam: "#00b3b3", bone: "#006d6d" },
];

type Estado = { cam: Plano; atores: { a: Ator; tipo: "mae" | "filho" | "pai" }[]; objs?: React.ReactNode; noite?: number };

const estado = (t: number): Estado => {
  const k = cenaDe(t);

  if (k <= 1) {
    const chegou = t >= PAI_T - 0.05;
    const pulo = t >= RBX ? Math.abs(Math.sin((t - RBX) * 8)) * 0.6 : 0;
    let cam: Plano;
    if (t < 0.5) cam = { pos: [0, 2.2, 8], alvo: [0, 2.2, 0] };
    else if (t < PAI_T - 0.05) cam = { pos: lerp3([1.0, 2.0, 4.4], [1.0, 2.15, 3.5], prog(t, 0.5, PAI_T)), alvo: [1.0, 2.2, -0.2], roll: 0.04 };
    else if (k === 0) cam = { pos: lerp3([0, 2.9, 9.4], [0, 2.7, 8.4], prog(t, PAI_T, S[1])), alvo: [0, 2.0, -0.6] };
    else cam = { pos: lerp3([-0.6, 2.7, 3.4], [-0.75, 2.6, 2.8], prog(t, S[1], S[2])), alvo: [-0.9, 2.3, -0.6], fov: 46 };
    const v = Math.min(1, t / 0.47);
    const confuso = k === 1;
    return {
      cam,
      atores: [
        { tipo: "pai", a: pai(t, { some: !chegou, expr: confuso && t >= NUNCA ? "medo" : "feliz",
          bracoE: confuso ? [-1.3, -0.1] : [-2.4, -0.6], bracoD: confuso ? [-1.3, 0.1] : [-2.4, 0.6],
          cabeca: confuso ? [0, Math.sin(t * 4) * 0.3] : [0, 0], segura: confuso ? controle(true) : undefined }) },
        { tipo: "filho", a: filho({ pos: [FILHO[0], pulo, FILHO[2]], expr: t >= PAI_T ? "feliz" : "medo",
          bracoE: t >= RBX ? [-2.8, -0.4] : [0, -0.12], bracoD: t >= RBX ? [-2.8, 0.4] : [0, 0.12] }) },
      ],
      objs: (
        <>
          {t < 0.5 && <Moeda3D pos={lerp3([0, 3.2, -6], [0, 2.2, 7.3], v * v)} rot={[t * 12, t * 20, 0]} esc={1.6} />}
          <Poof3D t={t} t0={PAI_T - 0.05} pos={[PAI[0], -0.2, PAI[2] + 0.4]} />
          {chuvaMoedas(t)}
        </>
      ),
    };
  }

  if (k === 2) {
    // poupança: moeda no porquinho
    const q = prog(t, RENDE - 0.2, RENDE + 0.3);
    const moeda = lerp3([PAI[0] + 0.7, 2.6, PAI[2] + 0.8], [0.3, 2.2, 0.8], q);
    return {
      cam: { pos: lerp3([0.0, 2.8, 7.2], [0.0, 2.7, 6.4], prog(t, S[2], S[3])), alvo: [-0.2, 1.7, 0.0] },
      atores: [
        { tipo: "pai", a: pai(t, { rotY: 0.7, expr: "feliz", bracoD: [-1.7, 0.2] }) },
        { tipo: "filho", a: filho({ pos: [1.9, 0, -0.6], rotY: -0.6, expr: "medo", bracoD: [-2.9, -0.6] }) },
      ],
      objs: (
        <>
          <Porquinho3D pos={[0.3, 0, 0.8]} esc={0.95} rotY={-0.3} />
          {t < RENDE + 0.35 && <Moeda3D pos={moeda} rot={[0, t * 8, 0]} esc={0.55} />}
          {t >= POUP && <Brilhos t={t} pos={[0.3, 1.9, 0.8]} raio={0.9} />}
        </>
      ),
    };
  }

  if (k === 3) {
    // termos de uso, todos, em voz alta
    const comp = interpolate(t, [TERMOS, S[4]], [0, 10], clamp);
    const fala = t >= TERMOS ? 0.4 + 0.6 * Math.abs(Math.sin(t * 15)) : 0;
    return {
      cam: t < TODOS - 0.04
        ? { pos: lerp3([-0.7, 2.6, 3.6], [-0.75, 2.55, 3.0], prog(t, S[3], TODOS)), alvo: [-0.9, 2.2, -0.6], fov: 48 }
        : { pos: lerp3([3.2, 6.8, 10.5], [3.0, 6.2, 9.6], prog(t, TODOS, S[4])), alvo: [-0.2, 0.6, 2.2], fov: 55 },
      atores: [
        { tipo: "pai", a: pai(t, { rotY: 0, expr: "feliz", boca: fala, bracoE: [-1.5, 0.3], bracoD: [-1.5, -0.3] }) },
        { tipo: "filho", a: filho({ pos: [2.0, 0, -0.4], expr: "sono", cabeca: [0.3, 0.25], rotY: -0.4 }) },
      ],
      objs: t >= TERMOS ? (
        <>
          <Caixa p={[PAI[0], 1.0, PAI[2] + 0.75]} s={[1.2, 1.4, 0.04]} cor="#f6ecd2" contorno={0.03} />
          <Pergaminho3D pos={[PAI[0], 0.1, PAI[2] + 0.8]} comp={comp} />
        </>
      ) : null,
    };
  }

  if (k === 4) {
    // conta própria: skin social com meia e chinelo
    return {
      cam: { pos: lerp3([-0.6, 2.2, 5.6], [-0.7, 2.1, 4.8], prog(t, S[4], S[5])), alvo: [-0.9, 1.5, -0.6], fov: 50 },
      atores: [
        { tipo: "pai", a: pai(t, { rotY: 0.1, expr: "feliz", bracoE: t >= CRIA ? [0, -0.75] : [0, -0.12], bracoD: t >= CRIA ? [-2.7, 0.3] : [0, 0.12] }) },
        { tipo: "filho", a: filho({ expr: "medo" }) },
      ],
      objs: <Poof3D t={t} t0={CRIA} pos={[PAI[0], -0.2, PAI[2] + 0.4]} />,
    };
  }

  if (k === 5) {
    // adicionou todos os amigos
    return {
      cam: { pos: lerp3([0, 2.8, 8.4], [0, 2.7, 7.6], prog(t, S[5], S[6])), alvo: [0, 2.0, -0.4] },
      atores: [
        { tipo: "pai", a: pai(t, { expr: "feliz", bracoE: [-1.3, -0.1], bracoD: [-1.3 + Math.sin(t * 20) * 0.08, 0.1], segura: controle() }) },
        { tipo: "filho", a: filho({ expr: "medo", bracoD: [-2.9, -0.6] }) },
      ],
    };
  }

  if (k === 6) {
    // bom dia, grupo! com figurinha de flor
    const filhoClose = t >= FIGURA - 0.04;
    return {
      cam: filhoClose
        ? { pos: lerp3([1.1, 2.5, 3.6], [1.05, 2.5, 3.0], prog(t, FIGURA, S[7])), alvo: [1.0, 2.3, -0.2], fov: 46 }
        : { pos: lerp3([-0.6, 2.6, 3.8], [-0.7, 2.55, 3.2], prog(t, S[6], FIGURA)), alvo: [-0.9, 2.3, -0.6], fov: 46 },
      atores: [
        { tipo: "pai", a: pai(t, { expr: "feliz", bracoE: [-1.3, -0.1], bracoD: [-2.7, 0.3], segura: undefined, seguraE: controle() }) },
        { tipo: "filho", a: filho({ expr: "medo", bracoE: [-2.8, -0.45], bracoD: [-2.8, 0.45], cabeca: [0.25, 0] }) },
      ],
    };
  }

  if (k === 7) {
    // jogo de luta: explosões e o pai parado de braços cruzados
    const a = interpolate(t, [S[7], S[8]], [-0.9, 0.7]);
    const soco = Math.sin(t * 16);
    return {
      cam: { pos: [PAI[0] + Math.sin(a) * 5.2 + 0.8, 2.3, PAI[2] + Math.cos(a) * 5.2], alvo: [PAI[0] + 0.8, 1.8, PAI[2]], fov: 52 },
      atores: [
        { tipo: "pai", a: pai(t, { rotY: 0, expr: t >= PARADO ? "brava" : "feliz", ...BRACOS_CRUZADOS }) },
        { tipo: "filho", a: filho({ pos: [1.4, Math.abs(soco) * 0.3, -0.4], rotY: -0.9, expr: "brava", bracoE: [-1.6 + soco * 0.4, -0.1], bracoD: [-1.6 - soco * 0.4, 0.1] }) },
      ],
      objs: <>{EXPLOSOES.map((e, i) => <Explosao3D key={i} t={t} t0={e.t0} pos={e.p} esc={1.4} />)}</>,
    };
  }

  if (k <= 10) {
    // modo churrasco → gasta tudo → churrasqueira dourada
    const temGrelha = t >= CHURR - 0.05;
    const dourada = rampa(t, MELHOR - 0.1, MELHOR + 0.3);
    const vira = Math.sin(t * 9) * 0.35;
    let cam: Plano;
    if (k === 8 && t < CHURR - 0.04) cam = { pos: lerp3([-0.6, 2.6, 3.4], [-0.7, 2.6, 2.8], prog(t, S[8], CHURR)), alvo: [-0.9, 2.4, -0.6], fov: 46 };
    else if (k === 8) cam = { pos: lerp3([1.6, 3.0, 7.4], [1.5, 2.9, 6.6], prog(t, CHURR, S[9])), alvo: [0.6, 1.8, 0.0] };
    else if (k === 9) cam = { pos: lerp3([1.0, 4.0, 4.2], [0.9, 3.7, 3.6], prog(t, S[9], S[10])), alvo: [0.6, 1.4, 0.6], fov: 52 };
    else cam = { pos: lerp3([0.4, 2.8, 8.6], [0.4, 2.7, 7.8], prog(t, S[10], S[11])), alvo: [0.5, 1.9, -0.2] };
    const moedas = k === 9 ? Array.from({ length: 12 }).map((_, i) => {
      const t0 = GASTA + i * 0.15;
      const q = (t - t0) / 0.5;
      if (q < 0 || q > 1) return null;
      const p = lerp3([PAI[0] + 0.3, 2.8, PAI[2]], [GRELHA[0], 1.5, GRELHA[2]], q);
      return <Moeda3D key={i} pos={[p[0], p[1] + Math.sin(PI * q) * 1.2, p[2]]} rot={[t * 8, t * 6, 0]} esc={0.45} />;
    }) : null;
    return {
      cam,
      atores: [
        { tipo: "pai", a: pai(t, { pos: temGrelha ? [0.6, 0, -0.5] : PAI, rotY: 0, expr: "feliz",
          bracoD: temGrelha ? [-1.2 + vira, 0.2] : [-2.6, 0.3], bracoE: k === 9 ? [-2.3, -0.3] : [0, -0.7],
          segura: temGrelha ? <Espeto3D rot={[PI / 2, 0, 0]} esc={0.6} pos={[0, 0, 0.6]} /> : undefined }) },
        { tipo: "filho", a: filho({ pos: [2.3, 0, -0.1], rotY: -0.5, expr: k === 10 ? "medo" : "medo", cabeca: [k === 10 ? 0.3 : 0, 0],
          bracoE: k === 9 ? [-2.9, 0.6] : [0, -0.12], bracoD: k === 9 ? [-2.9, -0.6] : [0, 0.12] }) },
      ],
      objs: (
        <>
          {temGrelha && <Churrasqueira3D t={t} pos={GRELHA} dourada={dourada} />}
          <Poof3D t={t} t0={CHURR - 0.05} pos={[GRELHA[0], -0.4, GRELHA[2] + 0.4]} />
          {moedas}
          {dourada > 0 && <Brilhos t={t} pos={[GRELHA[0], 1.6, GRELHA[2]]} raio={1.3} n={10} />}
          {k === 8 && t >= DESCOBRE && t < CHURR && <Brilhos t={t} pos={[PAI[0], 2.6, PAI[2]]} raio={0.9} n={10} />}
        </>
      ),
    };
  }

  if (k === 11) {
    // tiozão do churrasco: fila de jogadores, holofote e troféu
    const fila = FIGURANTES.map((f, i) => {
      const chegada = S[11] + i * 0.25;
      const x = interpolate(t, [chegada, chegada + 0.9], [9 + i, 2.4 + i * 1.15], clamp);
      const anda = t < chegada + 0.9;
      return { tipo: "filho" as const, a: { pos: [x, 0, 0.4 + (i % 2) * 0.5] as V3, rotY: anda ? -PI / 2 : -1.2, expr: "feliz" as Expr, camisaCor: f.cam, boneCor: f.bone,
        calcaCor: "#33384a", pernaE: anda ? Math.sin(t * 20 + i) * 0.6 : 0, pernaD: anda ? -Math.sin(t * 20 + i) * 0.6 : 0,
        bracoD: !anda && t >= TIOZAO ? [-2.7, 0.3] as [number, number] : [0, 0.12] as [number, number] } };
    });
    return {
      cam: t < FAMOSO - 0.04
        ? { pos: lerp3([3.0, 3.2, 10.5], [2.8, 3.0, 9.6], prog(t, S[11], FAMOSO)), alvo: [3.2, 1.8, 0.2] }
        : { pos: lerp3([2.4, 3.6, 7.0], [2.2, 3.4, 6.2], prog(t, FAMOSO, S[12])), alvo: [0.8, 2.4, -0.5], fov: 54 },
      atores: [
        { tipo: "pai", a: pai(t, { pos: [0.6, 0, -0.5], rotY: 0, expr: "feliz", bracoE: [-2.8, -0.3], bracoD: [-1.2, 0.2],
          seguraE: <Trofeu3D esc={0.7} rotY={0} pos={[0, -0.3, 0]} />, segura: <Espeto3D rot={[PI / 2, 0, 0]} esc={0.6} pos={[0, 0, 0.6]} /> }) },
        ...fila,
      ],
      objs: (
        <>
          <Churrasqueira3D t={t} pos={GRELHA} dourada={1} />
          {t >= FAMOSO && <Holofote3D pos={[0.6, 0, -0.5]} />}
          {t >= TIOZAO && <Brilhos t={t} pos={[0.6, 3.6, -0.5]} raio={1.2} n={10} />}
        </>
      ),
    };
  }

  if (k === 12) {
    // noite no sofá: o pai quer jogar, o filho morrendo de sono
    const pula = Math.abs(Math.sin(t * 7)) * 0.12;
    return {
      cam: { pos: lerp3([0, 2.4, 7.0], [0, 2.3, 6.2], prog(t, S[12], S[13])), alvo: [0, 1.6, -1.0] },
      noite: rampa(t, S[12] - 0.05, S[12] + 0.3),
      atores: [
        { tipo: "pai", a: pai(t, { pos: [-0.8, 0.02 + pula, -1.0], rotY: 0.15, expr: "feliz", pernaE: -PI / 2, pernaD: -PI / 2,
          bracoE: [-1.3, -0.1], bracoD: [-1.3, 0.1], segura: controle(), avental: false }) },
        { tipo: "filho", a: filho({ pos: [0.9, 0.02, -1.0], rotY: -0.15, expr: "sono", cabeca: [0.35, -0.3], pernaE: -PI / 2, pernaD: -PI / 2,
          bracoE: [-0.4, -0.2], bracoD: [-0.4, 0.2] }) },
      ],
      objs: <Sofa3D pos={[0, 0, -1.3]} />,
    };
  }

  if (k === 13) {
    // a mãe chega: quem vai lavar a louça?
    return {
      cam: t < LAVAR - 0.04
        ? { pos: lerp3([-1.0, 2.7, 5.4], [-1.2, 2.6, 4.6], prog(t, S[13], LAVAR)), alvo: [-2.0, 2.3, 0.3], fov: 50 }
        : { pos: lerp3([-0.4, 2.8, 8.4], [-0.4, 2.7, 7.6], prog(t, LAVAR, S[14])), alvo: [-0.6, 1.9, -0.6] },
      noite: 1,
      atores: [
        { tipo: "mae", a: { pos: [-2.2, 0, 0.4], rotY: 0.6, esc: 1.1, expr: "brava", coroa: true, olhos: t >= LAVAR ? 0.8 : 0,
          bracoE: [0, -0.7], bracoD: [-2.6, 0.2], segura: <Chinelo3D rot={[PI / 2, 0, 0]} esc={0.75} brilho={0.6} />, some: t < MAE_T - 0.05 } },
        { tipo: "pai", a: pai(t, { pos: [-0.8, 0.02, -1.0], rotY: -0.4, expr: "medo", pernaE: -PI / 2, pernaD: -PI / 2, avental: false,
          bracoE: [-2.5, -0.4], bracoD: [-2.5, 0.4], segura: undefined }) },
        { tipo: "filho", a: filho({ pos: [0.9, 0.02, -1.0], rotY: -0.5, expr: "medo", pernaE: -PI / 2, pernaD: -PI / 2, bracoE: [-2.5, -0.4], bracoD: [-2.5, 0.4] }) },
      ],
      objs: (
        <>
          <Sofa3D pos={[0, 0, -1.3]} />
          <Poof3D t={t} t0={MAE_T - 0.05} pos={[-2.2, -0.2, 0.6]} />
        </>
      ),
    };
  }

  // 14: chamada com a família toda + moeda na câmera (volta ao começo)
  const tchau = Math.sin(t * 12) * 0.35;
  const joga = t >= ARREMESSO;
  const v = Math.min(1, (t - ARREMESSO) / 0.42);
  return {
    cam: { pos: lerp3([0, 2.6, 10.6], [0, 2.5, 9.6], prog(t, S[14], PAI_3D_DUR)), alvo: [0, 2.0, -0.5] },
    noite: 1 - rampa(t, S[14], S[14] + 0.4),
    atores: [
      { tipo: "mae", a: { pos: [-1.9, 0, -0.6], rotY: 0.3, esc: 1.05, expr: "feliz", coroa: true, bracoE: [-2.6, -0.3 + tchau], bracoD: [0, 0.12] } },
      { tipo: "pai", a: pai(t, { pos: [0, 0, -0.4], rotY: 0, expr: "feliz", bracoE: [0, -0.7], bracoD: joga ? [-1.0, 0.12] : [-2.6, 0.12],
        segura: joga ? undefined : <Moeda3D esc={0.5} /> }) },
      { tipo: "filho", a: filho({ pos: [1.8, 0, -0.3], rotY: -0.3, expr: "feliz", bracoD: [-2.6, 0.3 - tchau] }) },
    ],
    objs: joga ? <Moeda3D pos={lerp3([0.8, 3.0, -0.2], [0, 2.4, 9.0], v * v)} rot={[t * 12, t * 20, 0]} esc={1.6} /> : null,
  };
};

const Personagem: React.FC<{ a: Ator; tipo: "mae" | "filho" | "pai" }> = ({ a, tipo }) => {
  if (a.some) return null;
  return (
    <group position={a.pos} rotation={a.rot ?? [0, 0, 0]}>
      <Boneco3D tipo={tipo} rotY={a.rotY} esc={a.esc} expr={a.expr} bracoE={a.bracoE} bracoD={a.bracoD} pernaE={a.pernaE} pernaD={a.pernaD}
        cabeca={a.cabeca} olhosBrilho={a.olhos ?? 0} segura={a.segura} seguraE={a.seguraE} boca={a.boca} coroa={a.coroa}
        social={a.social} avental={a.avental} camisaCor={a.camisaCor} calcaCor={a.calcaCor} boneCor={a.boneCor} />
    </group>
  );
};

const TREMORES: [number, number, number][] = [[0.45, 0.5, 0.25], [PAI_T, 0.35, 0.12], ...EXPLOSOES.map((e) => [e.t0, 0.3, 0.08] as [number, number, number]),
  [CHURR, 0.3, 0.1], [ZERO, 0.4, 0.12], [MAE_T, 0.4, 0.15], [ARREMESSO + 0.4, 0.3, 0.1]];

const Cena3D: React.FC = () => {
  const { t } = useT();
  const e = estado(t);
  const n = e.noite ?? 0;
  const tr = soma([0, 0, 0], ...TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp)));
  return (
    <>
      <Camera pos={soma(e.cam.pos, tr)} alvo={e.cam.alvo} fov={e.cam.fov ?? 50} roll={e.cam.roll ?? 0} />
      <ambientLight intensity={0.55 * (1 - 0.45 * n)} color={n > 0 ? "#b8c8ff" : "#ffffff"} />
      <hemisphereLight args={["#cfefff", "#7fbf5a", 0.7 * (1 - 0.6 * n)]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6 * (1 - 0.4 * n)} color={n > 0 ? "#a8b8ff" : "#ffffff"} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
      {n > 0 && <pointLight position={[0, 2.2, 2.5]} color="#7fb0ff" intensity={2.5 * n} distance={8} />}
      <Mundo3D t={t} />
      {e.atores.map((x, i) => <Personagem key={i} a={x.a} tipo={x.tipo} />)}
      {e.objs}
    </>
  );
};

// ── camada 2D ────────────────────────────────────────────────────────────
const BANNERS: Banner[] = [
  { t0: DEZ, t1: S[1], txt: "+10.000 ROBUX 💰", y: 240, tam: 96 },
  { t0: S[1], t1: S[2], txt: "SÓ UM DETALHE…", y: 230, tam: 84, cor: "#ffffff" },
  { t0: NUNCA, t1: S[2], txt: "NUNCA JOGOU 🤔", y: 360, tam: 96 },
  { t0: RENDE, t1: S[3], txt: "RENDE NA POUPANÇA? 🐷", y: 230, tam: 74 },
  { t0: POUP + 0.2, t1: S[3], txt: "0,5% AO MÊS 📈", y: 360, tam: 76, cor: "#ffffff" },
  { t0: TERMOS, t1: S[4], txt: "📜 TERMOS DE USO", y: 230, tam: 88 },
  { t0: TODOS, t1: S[4], txt: "PÁGINA 1 DE 847", y: 360, tam: 72, cor: "#ffffff" },
  { t0: VOZ, t1: S[4], txt: "EM VOZ ALTA 🗣", y: 480, tam: 76, cor: "#7fd3ff" },
  { t0: CRIA, t1: S[5], txt: "NOVO JOGADOR: PAI 😎", y: 230, tam: 80 },
  { t0: AJUDAR, t1: S[5], txt: "SKIN: MEIA COM CHINELO 🧦", y: 360, tam: 64, cor: "#ffffff" },
  { t0: S[7], t1: S[8], txt: "⚔ JOGO DE LUTA", y: 230, tam: 92, cor: COR.vermelho },
  { t0: PARADO, t1: S[8], txt: "O PAI: PARADO 😐", y: 360, tam: 84, cor: "#ffffff" },
  { t0: CRUZ, t1: S[8], txt: "DE BRAÇOS CRUZADOS", y: 480, tam: 66 },
  { t0: CHURR, t1: S[9], txt: "🔥 MODO CHURRASCO", y: 230, tam: 92 },
  { t0: SAI, t1: S[9], txt: "E NÃO SAI MAIS", y: 360, tam: 84, cor: "#ffffff" },
  { t0: GASTA, t1: S[10], txt: "GASTOU TUDO 💸", y: 230, tam: 96, cor: COR.vermelho },
  { t0: MELHOR, t1: S[11], txt: "A MELHOR DO SERVIDOR 🏆", y: 500, tam: 66 },
  { t0: FAMOSO, t1: S[12], txt: "👑 JOGADOR Nº 1", y: 230, tam: 92 },
  { t0: TIOZAO, t1: S[12], txt: "TIOZÃO DO CHURRASCO 🔥", y: 360, tam: 70, cor: "#ffffff" },
  { t0: S[12], t1: S[13], txt: "🌙 23:47", y: 230, tam: 100, cor: "#ffffff" },
  { t0: MAE_T, t1: S[14], txt: "E A MÃE? 👀", y: 230, tam: 100 },
  { t0: QUE, t1: PAI_3D_DUR, txt: "GASTARIA EM QUÊ? 🤔", y: 240, tam: 76, cor: "#ffffff" },
  { t0: COMENTA, t1: PAI_3D_DUR, txt: "COMENTA AÍ 👇", y: 370, tam: 112 },
];

const Painel: React.FC<{ t0: number; t1: number; titulo: string; valor: string; pct: number; top?: number; cor?: string }> = ({ t0, t1, titulo, valor, pct, top = 230, cor }) => {
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
        <div style={{ width: `${pct}%`, height: "100%", background: cor ?? `linear-gradient(90deg, ${COR.verde}, ${COR.amarelo})` }} />
      </div>
    </div>
  );
};

/** "+1 AMIGO" pipocando do lado direito. */
const Notificacoes: React.FC = () => {
  const { t, fps } = useT();
  if (t < ADIC || t >= S[6]) return null;
  const n = Math.min(14, Math.floor((t - ADIC) / 0.12) + 1);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const t0 = ADIC + i * 0.12;
        const s = mola(t, t0, fps, 12, 260);
        return (
          <div key={i} style={{ position: "absolute", right: 40 + (i % 2) * 60, top: 520 + (i % 7) * 92, transform: `translateX(${(1 - s) * 500}px)`,
            background: "#ffffff", border: `6px solid ${COR.linha}`, borderRadius: 22, padding: "8px 22px", fontFamily: "Poppins", fontWeight: 900,
            fontSize: 40, color: COR.linha, boxShadow: "0 8px 0 rgba(0,0,0,.25)" }}>✅ +1 AMIGO</div>
        );
      })}
    </>
  );
};

/** Mensagem "Bom dia, grupo!" com figurinha de flor gigante. */
const BomDia: React.FC = () => {
  const { t, fps } = useT();
  if (t < BOMDIA - 0.05 || t >= S[7]) return null;
  const s = mola(t, BOMDIA - 0.05, fps, 10, 240);
  const f = mola(t, FIGURA, fps, 7, 180);
  return (
    <div style={{ position: "absolute", left: 60, top: 400, fontFamily: "Poppins", fontWeight: 900 }}>
      <div style={{ transform: `scale(${s})`, transformOrigin: "0 50%", background: "#dcf8c6", border: `7px solid ${COR.linha}`, borderRadius: "34px 34px 34px 8px",
        padding: "18px 32px", fontSize: 62, color: COR.linha, boxShadow: "0 10px 0 rgba(0,0,0,.25)", display: "inline-block" }}>
        <div style={{ fontSize: 30, color: "#2e7d32" }}>~ Pai 👨</div>Bom dia, grupo! ☀️
      </div>
      {t >= FIGURA && (
        <div style={{ position: "absolute", left: 760, top: -40, fontSize: 230, lineHeight: 1, transform: `scale(${f}) rotate(${Math.sin(t * 6) * 10}deg)`, transformOrigin: "50% 50%" }}>🌻</div>
      )}
    </div>
  );
};

/** Placar "VOCÊ 0 × PAI 🏆". */
const Placar: React.FC = () => {
  const { t, fps } = useT();
  if (t < ZERO || t >= S[11]) return null;
  const s = mola(t, ZERO, fps, 10, 220);
  const lado = (nome: string, valor: string, cor: string) => (
    <div style={{ background: cor, border: `7px solid ${COR.linha}`, borderRadius: 24, padding: "10px 26px", textAlign: "center", minWidth: 280 }}>
      <div style={{ fontSize: 40, color: "#fff" }}>{nome}</div>
      <div style={{ fontSize: 96, color: COR.amarelo, lineHeight: 1, WebkitTextStroke: `10px ${COR.linha}`, paintOrder: "stroke fill" }}>{valor}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", alignItems: "center", gap: 24,
      transform: `scale(${s})`, fontFamily: "Poppins", fontWeight: 900 }}>
      {lado("VOCÊ", "0", COR.azul)}
      <div style={{ fontSize: 80, color: "#fff", WebkitTextStroke: `10px ${COR.linha}`, paintOrder: "stroke fill" }}>×</div>
      {lado("PAI", "🏆", "#3a9d5d")}
    </div>
  );
};

const SONS: { t: number; s: string; v: number }[] = [
  { t: 0, s: "whoosh", v: 0.6 }, { t: 0.44, s: "impacto", v: 0.7 }, { t: PAI_T - 0.05, s: "pop", v: 0.55 }, { t: DEZ, s: "contagem", v: 0.4 },
  { t: DEZ + 0.3, s: "plim", v: 0.45 }, { t: RBX, s: "plim", v: 0.4 },
  { t: S[1], s: "whoosh", v: 0.4 }, { t: NUNCA, s: "erro", v: 0.4 },
  { t: RENDE + 0.3, s: "plim", v: 0.45 }, { t: POUP, s: "pop", v: 0.4 },
  { t: TERMOS, s: "whoosh", v: 0.4 }, { t: TODOS, s: "erro", v: 0.35 }, { t: VOZ, s: "pop", v: 0.4 },
  { t: CRIA, s: "pop", v: 0.55 }, { t: AJUDAR, s: "plim", v: 0.35 },
  ...Array.from({ length: 14 }).map((_, i) => ({ t: ADIC + i * 0.12, s: "pop", v: 0.22 })),
  { t: BOMDIA, s: "pop", v: 0.5 }, { t: FIGURA, s: "plim", v: 0.5 }, { t: FIGURA + 0.1, s: "erro", v: 0.3 },
  ...EXPLOSOES.map((e) => ({ t: e.t0, s: "impacto", v: 0.45 })),
  { t: DESCOBRE, s: "aura", v: 0.4 }, { t: CHURR - 0.05, s: "pop", v: 0.55 }, { t: CHURR, s: "plim", v: 0.45 }, { t: SAI, s: "whoosh", v: 0.35 },
  ...Array.from({ length: 12 }).map((_, i) => ({ t: GASTA + i * 0.15 + 0.5, s: "pop", v: 0.25 })), { t: GASTA, s: "contagem", v: 0.35 },
  { t: ZERO, s: "erro", v: 0.45 }, { t: MELHOR, s: "aura", v: 0.4 }, { t: MELHOR + 0.3, s: "plim", v: 0.45 },
  { t: S[11], s: "whoosh", v: 0.4 }, { t: FAMOSO, s: "impacto", v: 0.5 }, { t: TIOZAO, s: "plim", v: 0.5 },
  { t: S[12], s: "whoosh", v: 0.35 }, { t: BORA, s: "pop", v: 0.45 },
  { t: MAE_T - 0.05, s: "pop", v: 0.55 }, { t: MAE_T, s: "impacto", v: 0.6 }, { t: LAVAR, s: "erro", v: 0.4 },
  { t: QUE, s: "pop", v: 0.4 }, { t: COMENTA, s: "pop", v: 0.5 }, { t: ARREMESSO, s: "whoosh", v: 0.6 }, { t: ARREMESSO + 0.4, s: "impacto", v: 0.7 },
];

export const ImaginaSoPai3D: React.FC = () => {
  const { t } = useT();
  const tr = TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp * 100)).reduce((x, y) => soma(x, y), [0, 0, 0] as V3);
  const e = estado(t);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4fb6ff 0%, #bfe7ff 70%)" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #0b1030 0%, #2a3570 75%)", opacity: e.noite ?? 0 }} />
      <ThreeCanvas width={1080} height={1920} shadows flat camera={{ fov: 50, position: [0, 2.2, 8], near: 0.1, far: 200 }}>
        <Cena3D />
      </ThreeCanvas>
      <AbsoluteFill style={{ transform: `translate(${tr[0]}px, ${tr[1]}px)` }}>
        <Marca3D />
        {BANNERS.map((b, i) => <Faixa3D key={i} {...b} />)}
        <Painel t0={ADIC - 0.1} t1={S[6]} titulo="👥 AMIGOS" valor={`${Math.round(rampa(t, ADIC, AMIGOS + 0.4, 0, 47))}`} pct={rampa(t, ADIC, AMIGOS + 0.4, 0, 100)} />
        <Painel t0={GASTA - 0.1} t1={S[10]} titulo="💰 ROBUX" valor={Math.round(rampa(t, GASTA, VIRTUAL + 0.4, 10000, 0)).toLocaleString("pt-BR")}
          pct={rampa(t, GASTA, VIRTUAL + 0.4, 100, 0)} top={380} cor={COR.vermelho} />
        <Notificacoes />
        <BomDia />
        <Placar />
        {[TODOS, TODOS + 0.7, VOZ].map((z, i) => <Sobe3D key={i} t0={z} txt="Zzz" x={830 + i * 30} y={900} cor="#ffffff" tam={80} />)}
        <Sobe3D t0={NUNCA + 0.1} txt="???" x={420} y={700} cor="#ffffff" tam={110} />
        <Balao3D t0={BORA - 0.1} t1={S[13]} txt="Filho, bora jogar? 🎮" x={420} y={560} tam={54} letra={0.035} />
        <Balao3D t0={LAVAR - 0.15} t1={S[14]} txt="Quem vai lavar a louça?" x={540} y={420} tam={54} letra={0.035} />
        <Legenda3D fala={F} fim={PAI_3D_DUR} />
      </AbsoluteFill>
      <Flash picos={[0.45, CHURR, MAE_T, PAI_3D_DUR - 0.05]} />

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
