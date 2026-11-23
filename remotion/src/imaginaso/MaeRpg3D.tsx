import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import tl from "../../public/videos/imagina-so-01-mae-rpg-mwtkctmd/timeline.json";
import { COR, mola, rampa, useT } from "./Bloco";
import {
  Aura, Boneco3D, Brilhos, Caixa, Camera, Chinelo3D, Controle3D, Coracao3D, type Expr, Laser, Mundo3D, Pia3D, Poeira, Tigela3D, tremor,
} from "./Bloco3D";
import { Balao3D, Faixa3D, Flash, Legenda3D, Marca3D, Sobe3D, montarFala, type Banner } from "./Camada2D";

// Imagina Só #01 em 3D de bloco: mesma narração (1.15x), um plano a cada ~1 s,
// gancho com o chinelo na câmera e final que volta para o começo (loop).

const PASTA = "videos/imagina-so-01-mae-rpg-mwtkctmd/";
const F = montarFala(tl, { vel: 1.15, inicio: 0.35 });
const { S, W } = F;
const PI = Math.PI;

type V3 = [number, number, number];
type Ator = {
  pos: V3; rotY?: number; esc?: number; expr?: Expr; bracoE?: [number, number]; bracoD?: [number, number];
  pernaE?: number; pernaD?: number; cabeca?: [number, number]; olhos?: number; segura?: React.ReactNode; seguraE?: React.ReactNode;
  gelo?: boolean; pele?: string; boca?: number; rot?: V3; amassa?: number; some?: boolean;
};
type Plano = { pos: V3; alvo: V3; fov?: number; roll?: number };

// ── marcos de tempo ──────────────────────────────────────────────────────
const MAE_T = W(0, "mãe"), RPG_T = W(0, "RPG"), POUSO = MAE_T + 0.16;
const CONTA_T = W(1, "nível"), NIVEL2 = W(1, "nível", 1), NOVE_T = W(1, "99");
const ACHA = W(2, "encontrar") + 0.3, SUMIU = W(2, "sumiu");
const OLHAR = W(3, "olhar"), PARA = W(3, "paralisa");
const LEND = W(4, "lendária"), ERRA = W(4, "erra"), CHIN = W(4, "chinelo");
const JOGA = S[5] + 0.05, INF = W(5, "infinito") + 0.25, CURVA = W(5, "curva"), VOLTA = W(5, "volta"), MAO = W(5, "mão");
const COMIDA = W(6, "comida"), CEM = W(6, "cem"), VIDA = W(6, "vida"), DOENTE = W(6, "doente");
const CUIDADO = W(7, "cuidado"), GENTE = W(7, "gente") - 0.14, CASA = W(7, "casa");
const BATALHA = W(8, "batalha"), ATAQUE = W(8, "que"), GOLPE = W(8, "ninguém"), NUNCA = W(8, "nunca");
const SOBREV = W(9, "sobreviver"), LAVAR = W(9, "lavar"), PEDIR = W(9, "pedir");
const BONUS = W(10, "bônus"), LIBERA = W(10, "libera"), GAME = W(10, "videogame");
const QUAL = W(11, "qual"), COMENTA = W(11, "comenta"), ARREMESSO = W(11, "aí") + 0.35;
export const MAE_3D_DUR = Math.max(F.fim + 0.2, ARREMESSO + 0.5);

const M: V3 = [0, 0, -1];
const FILHO: V3 = [2.6, 0, 0.6];
const ease = Easing.out(Easing.cubic);
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as V3;
const soma = (...vs: number[][]) => vs.reduce((a, b) => a.map((v, i) => v + b[i])) as V3;
const prog = (t: number, a: number, b: number) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const chineloMao = (brilho = 0) => <Chinelo3D rot={[PI / 2, 0, 0]} esc={0.75} brilho={brilho} />;
const MAE_PADRAO: Partial<Ator> = { esc: 1.05, bracoE: [0, -0.12], bracoD: [-0.15, 0.12], segura: chineloMao() };

// trajetória do chinelo-bumerangue (cena 5): elipse que sai da mão, vai longe e volta
const voo = (t: number): V3 => {
  const th = interpolate(t, [JOGA, INF, CURVA, MAO], [-0.434, -PI, -1.5 * PI, -0.434 - 2 * PI], clamp);
  const y = interpolate(t, [JOGA, INF, CURVA, MAO], [2.9, 5.5, 4.5, 2.95], clamp);
  return [3 + 5 * Math.sin(th), y, -3.5 + 3.2 * Math.cos(th)];
};

type Estado = { cam: Plano; mae: Ator; filho: Ator; objs?: React.ReactNode; escuro?: number };

const cenaDe = (t: number) => {
  let k = 0;
  S.forEach((s, i) => { if (t >= s - 0.04) k = i; });
  return k;
};

// ── cada cena: câmera, poses e objetos ───────────────────────────────────
const estado = (t: number): Estado => {
  const k = cenaDe(t);
  const filhoPadrao: Ator = { pos: FILHO, rotY: -2.13, expr: "medo" };

  if (k <= 1) {
    const queda = interpolate(t, [MAE_T - 0.08, POUSO], [12, 0], { ...clamp, easing: Easing.in(Easing.quad) });
    const amassa = t > POUSO ? Math.exp(-(t - POUSO) * 7) * Math.cos((t - POUSO) * 22) * 0.25 : 0;
    const ergue = rampa(t, RPG_T - 0.1, RPG_T + 0.2);
    const caindo = t < POUSO;
    const brilho = t >= RPG_T ? 0.6 + 0.4 * Math.sin(t * 12) + (t >= NOVE_T ? 0.6 : 0) : 0;
    const vira = rampa(t, POUSO + 0.05, POUSO + 0.3);
    let cam: Plano;
    if (t < 0.5) cam = { pos: [0, 2.2, 8], alvo: [0, 2.2, 0] };
    else if (t < MAE_T - 0.08) cam = { pos: lerp3([2.6, 1.7, 6.2], [2.6, 1.95, 4.3], prog(t, 0.5, MAE_T)), alvo: [2.6, 2.1, 0.6], roll: 0.04 };
    else if (t < RPG_T - 0.05) {
      const q = prog(t, POUSO + 0.1, RPG_T);
      cam = { pos: lerp3([0.8, 0.7, 6.5], [0.35, 2.3, 2.7], q), alvo: lerp3([0, 3.2, -1], [0, 2.45, -1], q), fov: 55 - 8 * q, roll: -0.06 * q };
    } else if (t < S[1]) {
      const a = interpolate(t, [RPG_T, S[1]], [-0.8, 0.55]);
      cam = { pos: [Math.sin(a) * 4, 2.5, -1 + Math.cos(a) * 4], alvo: [0, 2.1, -1] };
    } else if (t < NIVEL2 - 0.05) {
      const a = interpolate(t, [S[1], NIVEL2], [-0.65, 0.15]);
      cam = { pos: [Math.sin(a) * 6.5, 0.45, -1 + Math.cos(a) * 6.5], alvo: [0.3, 2.5, -1], fov: 48 };
    } else cam = { pos: lerp3([0.4, 2.7, 2.9], [0.25, 2.6, 2.3], prog(t, NIVEL2, S[2])), alvo: [0, 2.45, -1], fov: 45, roll: 0.07 };
    const v = Math.min(1, t / 0.47);
    return {
      cam,
      mae: {
        pos: [M[0], queda, M[2]], esc: 1.05, amassa, expr: t >= RPG_T ? "brava" : "feliz", olhos: brilho,
        bracoE: caindo ? [-2.7, -0.35] : [0, -0.12 - ergue * 0.6], bracoD: caindo ? [-2.7, 0.35] : [-0.15 - ergue * 2.5, 0.12 + ergue * 0.1],
        pernaE: caindo ? 0.3 : 0, pernaD: caindo ? -0.3 : 0, segura: chineloMao(t >= RPG_T ? 0.6 : 0),
      },
      filho: { pos: [FILHO[0] + (t > 0.45 ? Math.sin(t * 60) * 0.03 : 0), 0, FILHO[2]], rotY: interpolate(vira, [0, 1], [0, -2.13]), expr: "medo",
        cabeca: [t < POUSO ? -0.3 : 0.05, 0], bracoE: t > 0.45 ? [-2.3, -0.35] : [0, -0.12], bracoD: t > 0.45 ? [-2.3, 0.35] : [0, 0.12] },
      objs: (
        <>
          {t < 0.5 && <Chinelo3D pos={lerp3([0, 3.2, -6], [0, 2.2, 7.4], v * v)} rot={[t * 26, 0.3, t * 4]} esc={1.2} />}
          <Aura t={t} forca={rampa(t, RPG_T - 0.1, RPG_T + 0.3)} pos={M} />
          <Poeira t={t} t0={POUSO} pos={M} />
        </>
      ),
    };
  }

  if (k === 2) {
    // habilidade 1: acha tudo — o filho procura, ela tira o controle do nada
    const ergue = mola(t, ACHA, 30, 12, 200);
    const mae: Ator = { ...MAE_PADRAO, pos: [0.95, 0, -1], rotY: -0.35, expr: t >= SUMIU ? "feliz" : "brava",
      bracoE: [-2.6 * ergue, -0.12 - 0.15 * ergue], seguraE: ergue > 0.05 ? <Controle3D rot={[PI / 2, 0, 0]} esc={0.7} brilho={0.5} /> : undefined };
    const procura = t < ACHA + 0.2 ? Math.sin(t * 7) * 0.7 : -0.5;
    const cam: Plano = t < ACHA - 0.05
      ? { pos: lerp3([-1.1, 2.2, 4.2], [-1.1, 2.4, 3.4], prog(t, S[2], ACHA)), alvo: [-1.1, 2.3, -0.6], fov: 48 }
      : { pos: lerp3([0, 2.5, 7.2], [0, 2.4, 6.3], prog(t, ACHA, S[3])), alvo: [0, 2.1, -0.8] };
    return {
      cam, mae,
      filho: { pos: [-1.1, 0, -0.6], rotY: 0.35, expr: "medo", cabeca: [0, procura], bracoE: [-0.4, -0.5], bracoD: [-0.4, 0.5] },
      objs: t >= ACHA ? <Brilhos t={t} pos={[0.1, 3.4, -0.6]} raio={0.7} /> : null,
    };
  }

  if (k === 3) {
    // habilidade 2: o olhar que paralisa
    const gelo = t >= PARA;
    const olhos = t >= OLHAR ? 1.6 : 0;
    const cam: Plano = t < PARA - 0.04
      ? { pos: lerp3([0, 2.66, 2.4], [0, 2.66, 1.5], prog(t, S[3], PARA)), alvo: [0, 2.66, -1], fov: 40 }
      : { pos: lerp3([3.2, 4.2, 9.5], [3.0, 4.0, 8.6], prog(t, PARA, S[4])), alvo: [1.3, 1.8, -0.2], fov: 50 };
    const s = mola(t, PARA, 30, 10, 240);
    return {
      cam,
      mae: { ...MAE_PADRAO, pos: M, expr: "brava", olhos },
      filho: { ...filhoPadrao, gelo, bracoE: [-2.3, -0.35], bracoD: [-2.3, 0.35] },
      objs: (
        <>
          {t >= OLHAR + 0.15 && [-1, 1].map((l) => (
            <Laser key={l} a={[l * 0.23, 2.67, -0.42]} b={[FILHO[0] + l * 0.15, 2.5, FILHO[2]]} op={0.7 + 0.3 * Math.sin(t * 30)} />
          ))}
          {gelo && <group position={[FILHO[0], 1.6 * s, FILHO[2]]} scale={s}>
            <Caixa s={[1.9, 3.4, 1.4]} cor="#8fd3ff" opacidade={0.4} contorno={0.05} sombra={false} />
          </group>}
        </>
      ),
    };
  }

  if (k === 4) {
    // arma lendária: o chinelo brilhando no alto
    const ergue = prog(t, S[4], S[4] + 0.3);
    const a = interpolate(t, [S[4], CHIN], [-0.9, 0.9], clamp);
    const cam: Plano = t < CHIN - 0.04
      ? { pos: [Math.sin(a) * 4.6 + 0.4, interpolate(t, [S[4], CHIN], [1.6, 3.2], clamp), -0.9 + Math.cos(a) * 4.6], alvo: [0.4, 2.5, -0.9], fov: 50 }
      : { pos: lerp3([2.2, 3.4, 2.9], [1.9, 3.3, 2.3], prog(t, CHIN, S[5])), alvo: [0.6, 2.8, -0.7], fov: 42, roll: -0.08 };
    return {
      cam,
      mae: { ...MAE_PADRAO, pos: M, expr: "brava", olhos: 0.8, bracoD: [-0.15 - 2.5 * ergue, 0.12], segura: chineloMao(1.2) },
      filho: filhoPadrao,
      objs: (
        <>
          <Aura t={t} forca={rampa(t, LEND - 0.2, LEND + 0.2)} pos={M} />
          {t >= LEND && <Brilhos t={t} pos={[0.85, 3.05, -0.6]} raio={0.8} n={10} />}
        </>
      ),
    };
  }

  if (k === 5) {
    // alcance infinito, faz curva e volta para a mão
    const voando = t >= JOGA && t < MAO;
    const p = voo(t);
    const bracoD: [number, number] = t < JOGA ? [-2.6, 0.12] : t < MAO - 0.45 ? [-1.2, 0.12] : [-2.6, 0.12];
    const cam: Plano = t < VOLTA - 0.04
      ? { pos: [2.6, 6.5, 9.5], alvo: lerp3([2, 2.6, -3], [3, 3.2, -4], prog(t, JOGA, CURVA)), fov: 60 }
      : { pos: [1.7, 2.9, 3.2], alvo: [0.5, 2.7, -0.8], fov: 46 };
    const rastro = [1, 2, 3, 4, 5, 6].map((i) => voo(t - i * 0.03));
    return {
      cam,
      mae: { ...MAE_PADRAO, pos: M, expr: t >= MAO ? "feliz" : "brava", bracoD, segura: voando ? undefined : chineloMao(0.8) },
      filho: { ...filhoPadrao, cabeca: [-0.2, 0] },
      objs: voando ? (
        <>
          <Chinelo3D pos={p} rot={[0, t * 22, 0]} esc={2.4} brilho={0.8} />
          {rastro.map((r, i) => (
            <mesh key={i} position={r}><boxGeometry args={[0.6 - i * 0.07, 0.6 - i * 0.07, 0.6 - i * 0.07]} /><meshBasicMaterial color="#ffd23f" transparent opacity={0.8 - i * 0.12} /></mesh>
          ))}
        </>
      ) : null,
    };
  }

  if (k === 6) {
    // comida de mãe: o filho doente levanta com 100% de vida
    const sobe = mola(t, VIDA, 30, 9, 180);
    const pulo = t > VIDA ? Math.max(0, Math.sin((t - VIDA) * 7)) * 0.8 * Math.exp(-(t - VIDA) * 1.5) : 0;
    const cam: Plano = t < VIDA - 0.04
      ? { pos: lerp3([3.2, 4.6, 4.8], [2.8, 4.2, 4.2], prog(t, S[6], VIDA)), alvo: [0, 0.9, -1.2], fov: 55 }
      : { pos: lerp3([1.6, 2.3, 6.2], [1.4, 2.2, 5.4], prog(t, VIDA, S[7])), alvo: [0.6, 1.8, -0.6], fov: 50 };
    return {
      cam,
      mae: { ...MAE_PADRAO, pos: [-1.2, 0, -1.6], rotY: 0.5, expr: "feliz", bracoD: [-1.3, 0.15], bracoE: [-1.3, -0.15],
        segura: <Tigela3D t={t} rot={[1.3, 0, 0]} pos={[-0.35, 0, 0.1]} esc={0.65} /> },
      filho: {
        pos: [1.2, 0.3 * (1 - sobe) + pulo, 0.2], rot: [-PI / 2 * (1 - sobe), 0, 0], rotY: -0.2,
        expr: t >= VIDA ? "feliz" : "medo", pele: t >= VIDA ? undefined : "#b9d98a",
        bracoE: t >= VIDA ? [-2.7, -0.4] : [0, -0.12], bracoD: t >= VIDA ? [-2.7, 0.4] : [0, 0.12],
      },
      objs: t >= VIDA ? <Brilhos t={t} pos={[1.2, 1.6 + pulo, 0.2]} raio={1.3} n={10} cor="#7dff8a" /> : null,
    };
  }

  if (k === 7 || k === 8) {
    const escuro = Math.min(rampa(t, CUIDADO - 0.1, CUIDADO + 0.4), 1);
    if (k === 7) {
      // frase de ativação: céu escurece, a mãe cresce
      const cresce = 1.05 + 0.3 * mola(t, CUIDADO, 30, 12, 160);
      const falando = t >= GENTE && t < CASA + 0.35;
      const cam: Plano = t < W(7, "ativação") - 0.04
        ? { pos: lerp3([0, 0.6, 6.8], [0, 1.0, 4.6], prog(t, S[7], W(7, "ativação"))), alvo: [0, 3, -1], fov: 54 }
        : { pos: lerp3([0.4, 3.3, 3.4], [0.3, 3.3, 2.7], prog(t, W(7, "ativação"), S[8])), alvo: [0, 3.2, -1], fov: 46, roll: 0.05 };
      return {
        cam, escuro,
        mae: { ...MAE_PADRAO, pos: M, esc: cresce, expr: "brava", olhos: t >= CUIDADO ? 1.4 : 0, boca: falando ? 0.5 + 0.5 * Math.abs(Math.sin(t * 16)) : 0 },
        filho: { ...filhoPadrao, pos: [FILHO[0] + Math.sin(t * 60) * 0.04, 0, FILHO[2]] },
      };
    }
    // batalha: visão lateral de jogo de luta
    const x = interpolate(t, [S[8], ATAQUE, GOLPE, GOLPE + 0.6], [1.9, 1.9, 0.0, 3.2], clamp);
    const voa = t > GOLPE && t < GOLPE + 0.6 ? Math.sin(PI * (t - GOLPE) / 0.6) * 2.2 : 0;
    const caido = t >= GOLPE + 0.6;
    const correndo = t >= ATAQUE && t < GOLPE;
    const swing = interpolate(t, [GOLPE - 0.12, GOLPE + 0.04], [-2.7, -0.3], clamp);
    return {
      cam: { pos: lerp3([0.1, 2.4, 11.2], [0.1, 2.3, 10.4], prog(t, S[8], S[9])), alvo: [0.1, 1.9, -1], fov: 52 },
      escuro,
      mae: { ...MAE_PADRAO, pos: [-1.6, 0, -1], rotY: PI / 2, esc: 1.25, expr: "brava", olhos: 1.2, bracoE: [0, -0.7], bracoD: [swing, 0.12], segura: chineloMao(1) },
      filho: {
        pos: [x, voa + (caido ? 0.3 : 0), -1], rotY: -PI / 2, rot: caido ? [0, 0, -PI / 2] : t > GOLPE ? [0, 0, -(t - GOLPE) * 9] : [0, 0, 0],
        expr: t > GOLPE ? "medo" : "brava", bracoE: correndo ? [-1.5, -0.2] : [-0.6, -0.3], bracoD: correndo ? [-1.5, 0.2] : [-0.6, 0.3],
        pernaE: correndo ? Math.sin(t * 22) * 0.7 : 0, pernaD: correndo ? -Math.sin(t * 22) * 0.7 : 0,
      },
      objs: caido ? <Brilhos t={t} pos={[3.2 - 1.6, 1.0, -1]} raio={0.5} n={5} cor="#ffd23f" /> : null,
    };
  }

  if (k === 9) {
    const escuro = 1 - rampa(t, S[9], S[9] + 0.5);
    if (t < LAVAR - 0.04) {
      return {
        cam: { pos: lerp3([0.6, 2.6, 3.8], [0.6, 2.6, 3.2], prog(t, S[9], LAVAR)), alvo: [0.6, 2.3, 0.2], fov: 45 }, escuro,
        mae: { ...MAE_PADRAO, pos: [-2.4, 0, -3.5], rotY: 0.4, expr: "brava" },
        filho: { pos: [0.6, 0, 0.2], expr: "medo", cabeca: [0.1, 0.3], bracoD: [-2.9, -0.5], bracoE: [0, -0.12] },
      };
    }
    const esfrega = Math.sin(t * 18) * 0.25;
    return {
      cam: { pos: lerp3([0.0, 3.2, 6.0], [-0.2, 3.0, 5.2], prog(t, LAVAR, S[10])), alvo: [-0.4, 1.9, -0.6], fov: 52 }, escuro,
      mae: { ...MAE_PADRAO, pos: [1.7, 0, -1.6], rotY: -0.6, expr: t >= PEDIR ? "feliz" : "medo" },
      filho: { pos: [-1.0, 0, -1.0], rotY: 0, expr: "feliz", bracoD: [-1.0, 0.1 + esfrega], bracoE: [-1.0, -0.1 - esfrega] },
      objs: <group position={[-1.0, 0, 0.15]} rotation={[0, PI / 2, 0]}><Pia3D t={t} /></group>,
    };
  }

  if (k === 10) {
    // bônus de amor e +1 hora de videogame
    const pulo = t >= GAME ? Math.abs(Math.sin((t - GAME) * 8)) * 0.5 : 0;
    const desce = interpolate(t, [LIBERA, GAME + 0.1], [7, 3.9], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
    return {
      cam: { pos: lerp3([0, 2.3, 7.2], [0, 2.4, 6.0], prog(t, S[10], S[11])), alvo: [0, 2.2, -0.6] },
      mae: { ...MAE_PADRAO, pos: [-0.95, 0, -0.6], rotY: 0.3, expr: "feliz", bracoE: [-1.2, -0.6] },
      filho: { pos: [0.95, pulo, -0.6], rotY: -0.3, expr: "feliz", bracoE: t >= GAME ? [-2.8, -0.3] : [0, -0.12], bracoD: t >= GAME ? [-2.8, 0.3] : [0, 0.12] },
      objs: (
        <>
          {t >= BONUS && [0, 1, 2, 3, 4].map((i) => {
            const q = (t - BONUS - i * 0.22) / 0.9;
            if (q < 0 || q > 1.15) return null;
            const qq = Math.min(1, q);
            return <Coracao3D key={i} pos={[-0.8 + 1.7 * qq, 2.2 + Math.sin(PI * qq) * 1.2 + i * 0.1, -0.2]} esc={0.7 * (q > 1 ? (1.15 - q) / 0.15 : 1)} rotY={Math.sin(t * 5 + i) * 0.4} />;
          })}
          {t >= LIBERA && <>
            <Controle3D pos={[0.95, desce + pulo, -0.4]} rot={[0.3, t * 2, 0]} esc={0.9} brilho={0.6} />
            <Brilhos t={t} pos={[0.95, desce + pulo, -0.4]} raio={0.9} />
          </>}
        </>
      ),
    };
  }

  // 11: chamada para comentar + chinelo na câmera (volta para o começo)
  const tchau = Math.sin(t * 12) * 0.35;
  const joga = t >= ARREMESSO;
  const v = Math.min(1, (t - ARREMESSO) / 0.42);
  return {
    cam: { pos: lerp3([0, 2.3, 6.6], [0, 2.3, 6.0], prog(t, S[11], MAE_3D_DUR)), alvo: [0, 2.1, -0.6] },
    mae: { ...MAE_PADRAO, pos: [-0.95, 0, -0.6], rotY: 0.3, expr: "feliz", bracoE: [-2.6, -0.3 + tchau],
      bracoD: joga ? [-1.0, 0.12] : [-2.6, 0.12], segura: joga ? undefined : chineloMao(0.6) },
    filho: { pos: [0.95, 0, -0.6], rotY: -0.3, expr: "feliz", bracoD: [-2.6, 0.3 - tchau], bracoE: [-0.5, -0.4] },
    objs: joga ? <Chinelo3D pos={lerp3([-0.1, 3, -0.3], [0, 2.3, 5.4], v * v)} rot={[t * 26, 0.3, t * 4]} esc={1.2} /> : null,
  };
};

const Personagem: React.FC<{ a: Ator; tipo: "mae" | "filho" }> = ({ a, tipo }) => {
  const am = a.amassa ?? 0;
  return (
    <group position={a.pos} rotation={a.rot ?? [0, 0, 0]} scale={[1 + am * 0.6, 1 - am, 1 + am * 0.6]}>
      <Boneco3D tipo={tipo} rotY={a.rotY} esc={a.esc} expr={a.expr} bracoE={a.bracoE} bracoD={a.bracoD} pernaE={a.pernaE} pernaD={a.pernaD}
        cabeca={a.cabeca} olhosBrilho={a.olhos ?? 0} segura={a.segura} seguraE={a.seguraE} gelo={a.gelo} pele={a.pele} boca={a.boca} />
    </group>
  );
};

const TREMORES: [number, number, number][] = [[0.45, 0.5, 0.25], [POUSO, 0.45, 0.3], [NOVE_T, 0.5, 0.12], [CHIN, 0.4, 0.08], [CASA, 0.5, 0.12], [GOLPE, 0.5, 0.25]];

const Cena3D: React.FC = () => {
  const { t } = useT();
  const e = estado(t);
  const esc = e.escuro ?? 0;
  const tr = soma([0, 0, 0], ...TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp)));
  return (
    <>
      <Camera pos={soma(e.cam.pos, tr)} alvo={e.cam.alvo} fov={e.cam.fov ?? 50} roll={e.cam.roll ?? 0} />
      <ambientLight intensity={0.55 * (1 - 0.55 * esc)} />
      <hemisphereLight args={["#cfefff", "#7fbf5a", 0.7 * (1 - 0.7 * esc)]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6 * (1 - 0.45 * esc)} color={esc > 0 ? "#ffb0a0" : "#ffffff"} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
      {esc > 0 && <pointLight position={[0, 5, 3]} color="#ff2040" intensity={3 * esc} distance={14} />}
      <Mundo3D t={t} />
      {!e.mae.some && <Personagem a={e.mae} tipo="mae" />}
      {!e.filho.some && <Personagem a={e.filho} tipo="filho" />}
      {e.objs}
    </>
  );
};

// ── camada 2D ────────────────────────────────────────────────────────────
const BANNERS: Banner[] = [
  { t0: RPG_T, t1: S[1], txt: "MODO RPG ATIVADO!", y: 250, tam: 96 },
  { t0: NOVE_T, t1: S[2], txt: "NÍVEL 99", y: 230, tam: 190 },
  { t0: NOVE_T + 0.25, t1: S[2], txt: "MÁXIMO 😱", y: 450, tam: 84, cor: "#ffffff" },
  { t0: S[2], t1: S[3], txt: "HABILIDADE 1", y: 230, tam: 96 },
  { t0: ACHA, t1: S[3], txt: "ACHA TUDO 🔍", y: 360, tam: 76, cor: "#ffffff" },
  { t0: S[3], t1: S[4], txt: "HABILIDADE 2", y: 230, tam: 96 },
  { t0: OLHAR, t1: S[4], txt: "O OLHAR 👀", y: 360, tam: 76, cor: "#ffffff" },
  { t0: PARA, t1: S[4], txt: "PARALISADO! 🧊", y: 500, tam: 84, cor: "#7fd3ff" },
  { t0: LEND, t1: S[5], txt: "⭐ ITEM LENDÁRIO ⭐", y: 230, tam: 80 },
  { t0: ERRA, t1: S[5], txt: "DANO: 9999", y: 360, tam: 80, cor: COR.vermelho },
  { t0: CHIN, t1: S[5], txt: "O CHINELO", y: 500, tam: 130, cor: "#ffffff" },
  { t0: S[5], t1: S[6], txt: "ALCANCE INFINITO", y: 230, tam: 84 },
  { t0: CURVA - 0.2, t1: S[6], txt: "FAZ CURVA ↪", y: 360, tam: 80, cor: "#7fd3ff" },
  { t0: VOLTA, t1: S[6], txt: "E VOLTA! 🪃", y: 490, tam: 80, cor: COR.verde },
  { t0: COMIDA, t1: S[7], txt: "🍲 COMIDA DE MÃE", y: 230, tam: 84 },
  { t0: DOENTE, t1: S[7], txt: "CURA ATÉ GRIPE 🤧", y: 520, tam: 70, cor: "#ffffff" },
  { t0: CUIDADO, t1: S[8], txt: "⚠ CHEFE DESPERTOU ⚠", y: 230, tam: 80, cor: COR.vermelho },
  { t0: BATALHA, t1: S[9], txt: "⚔ BATALHA FINAL ⚔", y: 420, tam: 84, cor: COR.vermelho },
  { t0: NUNCA, t1: S[9], txt: "0 VITÓRIAS", y: 560, tam: 84, cor: "#ffffff" },
  { t0: SOBREV - 0.3, t1: S[10], txt: "COMO SOBREVIVER? 🤔", y: 230, tam: 76 },
  { t0: LAVAR, t1: S[10], txt: "🍽 LAVAR A LOUÇA", y: 360, tam: 80, cor: "#7fd3ff" },
  { t0: PEDIR, t1: S[10], txt: "MISSÃO SECRETA ✓", y: 490, tam: 76, cor: COR.verde },
  { t0: BONUS, t1: S[11], txt: "+ BÔNUS DE AMOR ❤️", y: 230, tam: 80, cor: COR.rosa },
  { t0: GAME, t1: S[11], txt: "+1 HORA DE GAME 🎮", y: 380, tam: 80 },
  { t0: QUAL, t1: MAE_3D_DUR, txt: "QUAL O PODER DA SUA MÃE?", y: 240, tam: 62, cor: "#ffffff" },
  { t0: COMENTA, t1: MAE_3D_DUR, txt: "COMENTA AÍ 👇", y: 360, tam: 112 },
];

const Painel: React.FC<{ t0: number; t1: number; titulo: string; valor: string; pct: number; cor?: string; top?: number }> = ({ t0, t1, titulo, valor, pct, cor, top = 230 }) => {
  const { t, fps } = useT();
  if (t < t0 || t >= t1) return null;
  const s = mola(t, t0, fps, 12, 200);
  return (
    <div style={{ position: "absolute", left: 140, right: 140, top, transform: `translateY(${(1 - s) * -300}px)`, background: "#241c46",
      border: `8px solid ${COR.linha}`, borderRadius: 32, padding: "22px 34px", boxShadow: "0 14px 0 rgba(0,0,0,.3)", fontFamily: "Poppins", fontWeight: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", color: "#fff" }}>
        <span style={{ fontSize: 46 }}>{titulo}</span>
        <span style={{ fontSize: 84, color: COR.amarelo }}>{valor}</span>
      </div>
      <div style={{ height: 34, marginTop: 10, background: "#3b3060", borderRadius: 17, overflow: "hidden", border: `5px solid ${COR.linha}` }}>
        <div style={{ width: `${pct}%`, height: "100%", background: cor ?? `linear-gradient(90deg, ${COR.verde}, ${COR.amarelo})` }} />
      </div>
    </div>
  );
};

const Luta: React.FC = () => {
  const { t } = useT();
  if (t < S[8] || t >= S[9]) return null;
  const hp = t >= GOLPE ? 3 : 100;
  const barra = (nome: string, pct: number, cor: string, txt: string, dir: boolean) => (
    <div style={{ flex: 1, textAlign: dir ? "right" : "left" }}>
      <div style={{ fontSize: 44, color: "#fff", WebkitTextStroke: `9px ${COR.linha}`, paintOrder: "stroke fill" }}>{nome} <span style={{ color: COR.amarelo }}>{txt}</span></div>
      <div style={{ height: 40, background: "#3b3060", border: `6px solid ${COR.linha}`, borderRadius: 12, overflow: "hidden", display: "flex", justifyContent: dir ? "flex-end" : "flex-start" }}>
        <div style={{ width: `${pct}%`, background: cor }} />
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 200, display: "flex", gap: 30, alignItems: "flex-end", fontFamily: "Poppins", fontWeight: 900 }}>
      {barra("VOCÊ", hp, COR.azul, `${hp}%`, false)}
      <div style={{ fontSize: 70, color: COR.amarelo, WebkitTextStroke: `10px ${COR.linha}`, paintOrder: "stroke fill" }}>VS</div>
      {barra("MÃE", 100, COR.vermelho, "MÁX", true)}
    </div>
  );
};

const SONS: { t: number; s: string; v: number }[] = [
  { t: 0, s: "whoosh", v: 0.6 }, { t: 0.44, s: "impacto", v: 0.7 }, { t: MAE_T - 0.15, s: "whoosh", v: 0.5 },
  { t: POUSO, s: "impacto", v: 0.8 }, { t: RPG_T - 0.2, s: "aura", v: 0.45 }, { t: RPG_T, s: "plim", v: 0.4 },
  { t: S[1] + 0.1, s: "pop", v: 0.4 }, { t: CONTA_T, s: "contagem", v: 0.35 }, { t: CONTA_T + 0.7, s: "contagem", v: 0.35 },
  { t: NOVE_T, s: "impacto", v: 0.8 }, { t: NOVE_T + 0.05, s: "plim", v: 0.45 },
  { t: S[2], s: "whoosh", v: 0.4 }, { t: ACHA, s: "plim", v: 0.45 }, { t: SUMIU, s: "pop", v: 0.45 },
  { t: S[3], s: "whoosh", v: 0.4 }, { t: OLHAR, s: "aura", v: 0.4 }, { t: PARA, s: "erro", v: 0.4 }, { t: PARA + 0.05, s: "pop", v: 0.5 },
  { t: LEND - 0.2, s: "aura", v: 0.45 }, { t: LEND, s: "plim", v: 0.4 }, { t: CHIN, s: "impacto", v: 0.7 },
  { t: JOGA, s: "whoosh", v: 0.6 }, { t: CURVA - 0.2, s: "whoosh", v: 0.5 }, { t: MAO, s: "pop", v: 0.5 }, { t: MAO + 0.05, s: "plim", v: 0.4 },
  { t: COMIDA, s: "pop", v: 0.4 }, { t: CEM, s: "contagem", v: 0.35 }, { t: VIDA, s: "plim", v: 0.5 }, { t: DOENTE, s: "pop", v: 0.4 },
  { t: CUIDADO, s: "erro", v: 0.45 }, { t: CASA, s: "impacto", v: 0.7 },
  { t: BATALHA, s: "whoosh", v: 0.5 }, { t: GOLPE, s: "impacto", v: 0.85 }, { t: NUNCA, s: "erro", v: 0.4 },
  { t: SOBREV, s: "pop", v: 0.4 }, { t: LAVAR, s: "whoosh", v: 0.4 }, { t: PEDIR, s: "plim", v: 0.5 },
  { t: BONUS, s: "pop", v: 0.45 }, { t: BONUS + 0.3, s: "plim", v: 0.4 }, { t: GAME, s: "plim", v: 0.5 },
  { t: QUAL, s: "pop", v: 0.4 }, { t: COMENTA, s: "pop", v: 0.5 }, { t: ARREMESSO, s: "whoosh", v: 0.6 }, { t: ARREMESSO + 0.4, s: "impacto", v: 0.7 },
];

export const ImaginaSoMae3D: React.FC = () => {
  const { t } = useT();
  const tr = TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp * 100)).reduce((x, y) => soma(x, y), [0, 0, 0] as V3);
  const escuro = estado(t).escuro ?? 0;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4fb6ff 0%, #bfe7ff 70%)" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #2a0710 0%, #8a1024 75%)", opacity: escuro }} />
      <ThreeCanvas width={1080} height={1920} shadows flat camera={{ fov: 50, position: [0, 2.2, 8], near: 0.1, far: 200 }}>
        <Cena3D />
      </ThreeCanvas>
      <AbsoluteFill style={{ transform: `translate(${tr[0]}px, ${tr[1]}px)` }}>
        <Marca3D />
        {BANNERS.map((b, i) => <Faixa3D key={i} {...b} />)}
        <Painel t0={S[1] + 0.1} t1={NOVE_T} titulo="NÍVEL DA MÃE" valor={`${Math.round(rampa(t, CONTA_T, NOVE_T, 1, 99))}`} pct={rampa(t, CONTA_T, NOVE_T, 1, 99)} />
        <Painel t0={S[6] + 0.1} t1={S[7]} top={1000} titulo="VIDA DO FILHO" valor={`${Math.round(rampa(t, CEM, VIDA + 0.2, 5, 100))}%`} pct={rampa(t, CEM, VIDA + 0.2, 5, 100)} />
        <Luta />
        <Balao3D t0={SUMIU - 0.1} t1={S[3]} txt="TAVA AQUI! 😏" x={640} y={640} />
        <Balao3D t0={GENTE} t1={S[8]} txt="A gente conversa em casa." x={540} y={400} tam={52} letra={0.045} />
        <Sobe3D t0={VIDA} txt="+100 HP" x={780} y={620} cor={COR.verde} />
        <Legenda3D fala={F} fim={MAE_3D_DUR} />
      </AbsoluteFill>
      <Flash picos={[0.45, NOVE_T, CASA, GOLPE, MAE_3D_DUR - 0.05]} />

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
