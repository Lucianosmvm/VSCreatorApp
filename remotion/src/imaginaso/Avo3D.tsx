import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import tl from "../../public/videos/imagina-so-05-avo-controla-o-roblox-mwukp955/timeline.json";
import { COR, mola, rampa, useT } from "./Bloco";
import { Aura, Boneco3D, Brilhos, Caixa, Camera, Chinelo3D, Controle3D, type Expr, Mundo3D, tremor } from "./Bloco3D";
import {
  Bolo3D, CadeiraBalanco3D, Casaco3D, Celular3D, Churrasqueira3D, Espeto3D, Explosao3D, Moeda3D, Monstro3D, Nota3D, Poof3D, TV3D, Xicara3D,
} from "./Objetos3D";
import { Balao3D, Faixa3D, Flash, Legenda3D, Marca3D, montarFala, type Banner } from "./Camada2D";

// Imagina Só #05: "E se o Roblox fosse controlado pela sua AVÓ". A avó entra para a família;
// mãe, pai e filho aparecem. Controle na câmera no começo e no fim (loop).

const PASTA = "videos/imagina-so-05-avo-controla-o-roblox-mwukp955/";
const F = montarFala(tl, { vel: 1.15, inicio: 0.35 });
const { S, W } = F;
const PI = Math.PI;

type V3 = [number, number, number];
type Tipo = "mae" | "filho" | "pai" | "avo";
type Ator = {
  pos: V3; rotY?: number; esc?: number; expr?: Expr; bracoE?: [number, number]; bracoD?: [number, number];
  pernaE?: number; pernaD?: number; cabeca?: [number, number]; olhos?: number; segura?: React.ReactNode; seguraE?: React.ReactNode;
  boca?: number; rot?: V3; coroa?: boolean; social?: boolean; avental?: boolean; casaco?: boolean; trico?: boolean; gelo?: boolean; some?: boolean;
  camisaCor?: string; boneCor?: string; calcaCor?: string;
};
type Plano = { pos: V3; alvo: V3; fov?: number; roll?: number };

// ── marcos ───────────────────────────────────────────────────────────────
const AVO_T = W(0, "avó");
const INF = W(1, "infinito"), MAS = W(1, "mas"), COMER = W(1, "comer"), POUQ = W(1, "pouquinho");
const ESCOND = W(2, "escondido"), TOMA = W(2, "toma"), CONTA = W(2, "conta");
const PERGUNTA = W(3, "pergunta"), AGAS = W(3, "agasalhado");
const CHA = W(4, "chá"), COBERTOR = W(4, "cobertor");
const TRICO = W(5, "tricô"), FEZ = W(5, "fez");
const BOLO = W(6, "bolo");
const PAUSA = W(7, "pausa"), NOVELA = W(7, "novela");
const TRAVA = W(8, "trava"), AUDIO = W(8, "áudio");
const MAE_T = W(9, "mãe"), DEZ = W(9, "10");
const BATALHA = W(10, "batalha"), CONTRA = W(10, "contra");
const DEIXA = W(11, "deixa");
const CHURR = W(12, "churrasco");
const FARIA = W(13, "faria"), COMENTA = W(13, "comenta"), FIM = W(13, "aí") + 0.35;
export const AVO_3D_DUR = Math.max(F.fim + 0.2, FIM + 0.5);

const CADEIRA: V3 = [-1.0, 0, -1.4];
const SENTADA: V3 = [-1.0, 0.22, -1.35];
const FILHO: V3 = [1.0, 0, -0.2];
const ease = Easing.out(Easing.cubic);
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as V3;
const soma = (...vs: number[][]) => vs.reduce((a, b) => a.map((v, i) => v + b[i])) as V3;
const prog = (t: number, a: number, b: number) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const cenaDe = (t: number) => S.reduce((k, s, i) => (t >= s - 0.04 ? i : k), 0);

const balanco = (t: number) => Math.sin(t * 2.2) * 0.08;
const avoSentada = (t: number, extra: Partial<Ator> = {}): Ator => ({
  pos: [SENTADA[0], SENTADA[1], SENTADA[2]], rot: [balanco(t), 0, 0], expr: "feliz", pernaE: -PI / 2, pernaD: -PI / 2,
  bracoE: [-0.5, -0.25], bracoD: [-0.5, 0.25], ...extra,
});
const filho = (t: number, extra: Partial<Ator> = {}): Ator => ({ pos: FILHO, rotY: -0.3, expr: "feliz", casaco: t >= AGAS && t < TRICO, trico: t >= TRICO, ...extra });
const FIGURANTES = [
  { cam: "#ff8a3d", bone: "#c0392b" }, { cam: "#5ad35a", bone: "#2e7d32" }, { cam: "#7b4bd6", bone: "#4a2a8a" }, { cam: "#00b3b3", bone: "#006d6d" },
];
const MOEDAS = Array.from({ length: 16 }).map((_, i) => ({ t0: INF - 0.3 + i * 0.06, x: -2.6 + ((i * 37) % 52) / 10, z: -1.8 + ((i * 53) % 34) / 10, giro: i * 1.3 }));
const chuvaMoedas = (t: number) => MOEDAS.map((m, i) => {
  if (t < m.t0) return null;
  const y = interpolate(t, [m.t0, m.t0 + 0.5], [9, 0.32], { ...clamp, easing: Easing.in(Easing.quad) });
  return <Moeda3D key={i} pos={[m.x, y, m.z]} rot={t > m.t0 + 0.5 ? [PI / 2, 0, m.giro] : [t * 6, m.giro + t * 4, 0]} esc={0.6} />;
});
const RAIOS = [0, 1, 2, 3, 4, 5].map((i) => S[10] + 0.25 + i * 0.5);

type Estado = { cam: Plano; atores: { a: Ator; tipo: Tipo }[]; objs?: React.ReactNode; noite?: number; escuro?: number; travado?: boolean };

const estado = (t: number): Estado => {
  const k = cenaDe(t);
  const cadeira = <CadeiraBalanco3D pos={CADEIRA} balanco={balanco(t)} />;

  if (k === 0) {
    const chegou = t >= AVO_T - 0.05;
    const v = Math.min(1, t / 0.47);
    let cam: Plano;
    if (t < 0.5) cam = { pos: [0, 2.2, 8], alvo: [0, 2.2, 0] };
    else if (!chegou) cam = { pos: lerp3([1.0, 2.0, 4.4], [1.0, 2.15, 3.6], prog(t, 0.5, AVO_T)), alvo: [1.0, 2.2, -0.2], roll: 0.04 };
    else cam = { pos: lerp3([-0.2, 2.6, 7.4], [-0.6, 2.7, 5.4], prog(t, AVO_T, S[1])), alvo: [-0.9, 2.4, -1.3] };
    return {
      cam,
      atores: [
        { tipo: "avo", a: avoSentada(t, { some: !chegou, bracoE: [-2.6, -0.3], seguraE: <Controle3D rot={[PI / 2, 0, 0]} esc={0.55} /> }) },
        { tipo: "filho", a: filho(t, { rotY: chegou ? -2.4 : 0, expr: chegou ? "feliz" : "medo" }) },
      ],
      objs: (
        <>
          {chegou && cadeira}
          {t < 0.5 && <Controle3D pos={lerp3([0, 3.2, -6], [0, 2.2, 7.3], v * v)} rot={[t * 20, 0.4, t * 6]} esc={1.4} />}
          <Poof3D t={t} t0={AVO_T - 0.05} pos={[CADEIRA[0], -0.2, CADEIRA[2] + 0.5]} />
          {chegou && <Aura t={t} forca={rampa(t, AVO_T, AVO_T + 0.3)} pos={CADEIRA} />}
        </>
      ),
    };
  }

  if (k === 1) {
    // Robux infinito → prato que nunca esvazia
    const prato = t >= MAS - 0.04;
    const pilha = Math.floor(rampa(t, COMER, POUQ + 0.5, 1, 9));
    return {
      cam: prato ? { pos: lerp3([1.3, 2.7, 5.6], [1.2, 2.6, 4.8], prog(t, MAS, S[2])), alvo: [0.8, 1.6, 0.3] }
        : { pos: lerp3([0, 3.0, 9.6], [0, 2.9, 8.8], prog(t, S[1], MAS)), alvo: [0, 2.0, -0.8] },
      atores: [
        { tipo: "avo", a: prato ? { pos: [-0.5, 0, -0.2], rotY: 0.7, expr: "feliz", bracoD: [-1.6 + Math.sin(t * 10) * 0.25, 0.1] } : avoSentada(t, { bracoE: [-2.6, -0.3], bracoD: [-2.6, 0.3] }) },
        { tipo: "filho", a: filho(t, { rotY: 0, expr: prato ? "medo" : "feliz", bracoE: prato ? [0, -0.12] : [-2.8, -0.4], bracoD: prato ? [-1.4, 0.15] : [-2.8, 0.4] }) },
      ],
      objs: (
        <>
          {!prato && cadeira}
          {chuvaMoedas(t)}
          {prato && (
            <group position={[FILHO[0], 0, FILHO[2] + 1.0]}>
              <Caixa p={[0, 0.45, 0]} s={[1.9, 0.9, 1.1]} cor="#a8703e" contorno={0.05} />
              <Caixa p={[0, 0.95, 0]} s={[1.3, 0.08, 0.9]} cor="#ffffff" contorno={0.03} />
              {Array.from({ length: pilha }).map((_, i) => (
                <Caixa key={i} p={[((i * 37) % 5 - 2) * 0.12, 1.1 + i * 0.2, ((i * 53) % 3 - 1) * 0.12]} s={[0.6 - i * 0.03, 0.22, 0.5 - i * 0.02]}
                  cor={i % 3 === 0 ? "#f5f0e0" : i % 3 === 1 ? "#6b3a1f" : "#e08a3a"} contorno={0.02} />
              ))}
            </group>
          )}
        </>
      ),
    };
  }

  if (k === 2) {
    // dinheiro escondido: "toma, não conta pra sua mãe"
    const q = prog(t, TOMA, TOMA + 0.45);
    const nota = lerp3([-0.2, 1.7, 0.4], [0.5, 1.6, 0.4], q);
    return {
      cam: { pos: lerp3([0.25, 2.6, 5.4], [0.2, 2.5, 4.6], prog(t, S[2], S[3])), alvo: [0.15, 2.1, -0.3] },
      atores: [
        { tipo: "avo", a: { pos: [-0.7, 0, -0.4], rotY: 0.6, expr: "feliz", cabeca: [0, t < TOMA ? Math.sin(t * 6) * 0.5 : 0.3], bracoD: [-1.4, 0.1] } },
        { tipo: "filho", a: filho(t, { pos: [0.9, 0, -0.2], rotY: -0.6, bracoE: [-1.3, -0.2], expr: t >= TOMA ? "feliz" : "medo" }) },
      ],
      objs: (
        <>
          {t >= TOMA - 0.1 && <Nota3D pos={nota} esc={1.2} rot={[0, 0.4, 0]} />}
          {t >= CONTA && <Brilhos t={t} pos={[0.5, 1.8, 0.4]} raio={0.5} n={6} cor={COR.verde} />}
        </>
      ),
    };
  }

  if (k === 3) {
    // game over → "tá agasalhado?"
    const ax = interpolate(t, [PERGUNTA - 0.3, PERGUNTA + 0.4], [-6, -0.6], clamp);
    const correndo = t < PERGUNTA + 0.4;
    const levanta = t >= AGAS;
    return {
      cam: { pos: lerp3([0.2, 3.0, 8.8], [0.2, 2.9, 8.0], prog(t, S[3], S[4])), alvo: [0.2, 1.6, -0.2] },
      atores: [
        { tipo: "avo", a: { pos: [ax, 0, 0.2], rotY: correndo ? PI / 2 : 0.6, expr: "medo", bracoE: [-1.3, -0.2], bracoD: [-1.3, 0.2],
          pernaE: correndo ? Math.sin(t * 16) * 0.5 : 0, pernaD: correndo ? -Math.sin(t * 16) * 0.5 : 0,
          segura: levanta ? undefined : <Casaco3D rot={[1.3, 0, 0]} pos={[-0.4, 0, 0.2]} esc={1.1} /> } },
        { tipo: "filho", a: levanta ? filho(t, { pos: [0.9, 0, 0], rotY: -0.4, expr: "feliz" }) : filho(t, { pos: [0.9, 0.3, 0.5], rot: [-PI / 2, 0, 0], expr: "medo" }) },
      ],
      objs: <Poof3D t={t} t0={AGAS} pos={[0.9, -0.2, 0.4]} />,
    };
  }

  if (k === 4) {
    // monstro de terror ganha chá e cobertor
    const manso = t >= COBERTOR;
    const xq = prog(t, CHA - 0.2, CHA + 0.3);
    return {
      noite: 1,
      cam: { pos: lerp3([0.3, 3.0, 9.8], [0.3, 2.9, 9.0], prog(t, S[4], S[5])), alvo: [0.3, 2.5, -0.6] },
      atores: [
        { tipo: "avo", a: { pos: [-1.0, 0, 0], rotY: 0.7, expr: "feliz", bracoD: [-1.5, 0.1] } },
        { tipo: "filho", a: filho(t, { pos: [-2.2, 0, -0.6], rotY: 0.6, expr: "medo", bracoE: [-2.6, -0.4], bracoD: [-2.6, 0.4] }) },
      ],
      objs: (
        <>
          <Monstro3D pos={[1.4, 0, -1.0]} esc={1.15} rotY={-0.4} boca={manso ? 0 : 0.5 + 0.5 * Math.abs(Math.sin(t * 9))} cobertor={manso} feliz={manso} />
          {t >= CHA - 0.2 && <Xicara3D t={t} pos={lerp3([-0.2, 1.6, 0.7], [0.5, 2.0, 0.2], xq)} esc={1.1} />}
          {manso && <Brilhos t={t} pos={[1.4, 3.4, -1.0]} raio={1.2} n={8} cor="#ffb3d1" />}
        </>
      ),
    };
  }

  if (k === 5) {
    // skin nova: blusa de tricô
    return {
      cam: { pos: lerp3([0, 2.6, 6.6], [-0.05, 2.5, 5.8], prog(t, S[5], S[6])), alvo: [-0.1, 2.0, -0.2] },
      atores: [
        { tipo: "avo", a: { pos: [-1.2, 0, -0.4], rotY: 0.5, expr: "feliz", bracoE: [-2.6, -0.3], bracoD: [-2.6, 0.3] } },
        { tipo: "filho", a: filho(t, { pos: [0.7, 0, 0], rotY: -0.2, expr: t >= TRICO ? "medo" : "feliz", cabeca: [t >= TRICO ? 0.3 : 0, 0] }) },
      ],
      objs: <Poof3D t={t} t0={TRICO} pos={[0.7, -0.2, 0.2]} />,
    };
  }

  if (k === 6) {
    // bolo para todo jogador novo
    const fila = FIGURANTES.map((f, i) => {
      const t0 = S[6] + 0.25 + i * 0.3;
      const tem = t >= t0;
      return { tipo: "filho" as Tipo, a: { pos: [0.9 + i * 1.25, tem ? Math.abs(Math.sin((t - t0) * 7)) * 0.25 : 0, 0.2 + (i % 2) * 0.5] as V3, rotY: -0.5,
        expr: (tem ? "feliz" : "medo") as Expr, camisaCor: f.cam, boneCor: f.bone, calcaCor: "#33384a",
        bracoD: tem ? [-1.4, 0.15] as [number, number] : [0, 0.12] as [number, number],
        segura: tem ? <Bolo3D fatia rot={[1.4, 0, 0]} pos={[-0.3, 0, 0.1]} esc={0.9} /> : undefined } };
    });
    return {
      cam: { pos: lerp3([1.6, 3.0, 10.4], [1.5, 2.9, 9.6], prog(t, S[6], S[7])), alvo: [1.2, 2.0, -0.4] },
      atores: [{ tipo: "avo", a: { pos: [-1.3, 0, -0.6], rotY: 0.5, expr: "feliz", bracoD: [-1.6, 0.2] } }, ...fila],
      objs: (
        <>
          <Caixa p={[-1.0, 0.45, 0.6]} s={[1.6, 0.9, 1.1]} cor="#a8703e" contorno={0.05} />
          <Bolo3D pos={[-1.0, 0.9, 0.6]} esc={0.7} />
        </>
      ),
    };
  }

  if (k === 7) {
    // hora da novela: servidor pausado, todo mundo na frente da TV
    const frente = t >= PAUSA - 0.04;
    const plateia = FIGURANTES.slice(0, 3).map((f, i) => ({ tipo: "filho" as Tipo, a: { pos: [-0.6 + i * 1.3, 0, 3.8 + (i % 2) * 0.4] as V3, rotY: PI,
      expr: "feliz" as Expr, camisaCor: f.cam, boneCor: f.bone, calcaCor: "#33384a" } }));
    return {
      noite: 1,
      cam: frente ? { pos: lerp3([0.5, 5.8, -4.6], [0.5, 5.6, -4.2], prog(t, PAUSA, S[8])), alvo: [0, 1.9, 3.4], fov: 62 }
        : { pos: lerp3([0, 7.6, 13], [0, 7.2, 12], prog(t, S[7], PAUSA)), alvo: [0, 2.4, -3.0], fov: 55 },
      atores: [
        { tipo: "avo", a: { pos: [-1.6, 0.22, 2.85], rot: [balanco(t), PI, 0], expr: "feliz", pernaE: -PI / 2, pernaD: -PI / 2, bracoE: [-0.5, -0.25], bracoD: [-0.5, 0.25] } },
        { tipo: "filho", a: filho(t, { pos: [1.7, 0, 3.0], rotY: PI, expr: "medo" }) },
        ...plateia,
      ],
      objs: (
        <>
          <TV3D t={t} pos={[0, 0, -3.6]} esc={1.1} />
          <group position={[-1.6, 0, 2.9]} rotation={[balanco(t), PI, 0]}><CadeiraBalanco3D /></group>
        </>
      ),
    };
  }

  if (k === 8) {
    // jogo travado: tudo congela, menos a avó gravando o áudio
    const fala = 0.4 + 0.6 * Math.abs(Math.sin(t * 15));
    const congelados = FIGURANTES.slice(0, 2).map((f, i) => ({ tipo: "filho" as Tipo, a: { pos: [2.4 + i * 1.3, 0.5, -1.2] as V3, rotY: -0.4, gelo: true,
      expr: "feliz" as Expr, camisaCor: f.cam, boneCor: f.bone, bracoE: [-2.6, -0.4] as [number, number], bracoD: [-2.6, 0.4] as [number, number], pernaE: 0.6, pernaD: -0.4 } }));
    return {
      travado: true,
      cam: { pos: lerp3([0.6, 2.9, 9.6], [0.5, 2.8, 8.8], prog(t, S[8], S[9])), alvo: [0.6, 2.0, -0.6] },
      atores: [
        { tipo: "avo", a: { pos: [-1.2, 0, -0.2], rotY: 0.4, expr: "feliz", boca: t >= AUDIO ? fala : 0, bracoD: [-2.4, 0.5],
          segura: <Celular3D rot={[2.4, 0, 0]} pos={[0, 0, 0.1]} esc={1.2} /> } },
        { tipo: "filho", a: filho(t, { pos: [1.0, 0.6, 0], rotY: -0.3, gelo: true, bracoE: [-2.7, -0.4], bracoD: [-2.7, 0.4], pernaE: 0.5, pernaD: -0.5 }) },
        ...congelados,
      ],
    };
  }

  if (k <= 11) {
    // a mãe chega → batalha mãe × avó → "deixa o menino!"
    const escuro = k === 11 ? 1 - rampa(t, DEIXA + 0.2, DEIXA + 0.8) : rampa(t, MAE_T - 0.1, MAE_T + 0.3);
    const lado = k >= 10;
    const ko = t >= DEIXA;
    const mae: Ator = lado
      ? { pos: [-1.9, 0, -1], rotY: PI / 2, esc: 1.1, coroa: true, expr: ko ? "medo" : "brava", olhos: ko ? 0 : 1, gelo: ko, bracoE: [0, -0.7],
        bracoD: [-2.6, 0.15], segura: <Chinelo3D rot={[PI / 2, 0, 0]} esc={0.75} brilho={0.6} /> }
      : { pos: [1.6, 0, -0.4], rotY: -0.9, esc: 1.1, coroa: true, expr: "brava", olhos: 1, bracoE: [0, -0.7], bracoD: [-2.6, 0.15],
        segura: <Chinelo3D rot={[PI / 2, 0, 0]} esc={0.75} brilho={0.6} />, some: t < MAE_T - 0.05 };
    const avo: Ator = lado
      ? { pos: [1.9, 0, -1], rotY: -PI / 2, expr: ko ? "feliz" : "brava", olhos: ko ? 0 : 0.8, bracoE: [0, -0.7], bracoD: ko ? [-2.8, 0.2] : [-1.4, 0.2] }
      : { pos: [-1.2, 0, -0.4], rotY: 0.9, expr: "medo", bracoE: [0, -0.7], bracoD: [0, 0.7] };
    let cam: Plano;
    if (k === 9) cam = { pos: lerp3([0.2, 2.9, 9.4], [0.2, 2.8, 8.4], prog(t, S[9], S[10])), alvo: [0.2, 2.3, -0.4] };
    else if (k === 10) cam = { pos: lerp3([0, 2.7, 11.2], [0, 2.6, 10.2], prog(t, S[10], S[11])), alvo: [0, 2.2, -1] };
    else cam = ko ? { pos: lerp3([1.6, 3.0, 8.0], [1.5, 2.9, 7.2], prog(t, DEIXA, S[12])), alvo: [0.9, 2.4, -1] } : { pos: [0, 2.6, 10.2], alvo: [0, 2.2, -1] };
    return {
      escuro, cam,
      atores: [
        { tipo: "mae", a: mae },
        { tipo: "avo", a: avo },
        { tipo: "filho", a: filho(t, { pos: [0.2, ko ? Math.abs(Math.sin(t * 8)) * 0.4 : 0, -3.2], rotY: 0, expr: ko ? "feliz" : "medo",
          bracoE: ko ? [-2.8, -0.4] : [-2.3, -0.35], bracoD: ko ? [-2.8, 0.4] : [-2.3, 0.35] }) },
      ],
      objs: (
        <>
          <Poof3D t={t} t0={MAE_T - 0.05} pos={[1.6, -0.2, -0.2]} />
          {k === 10 && RAIOS.map((r, i) => <Explosao3D key={i} t={t} t0={r} pos={[((i % 3) - 1) * 0.5, 2.0 + (i % 2) * 0.6, -1]} esc={1.3} />)}
          {ko && <Aura t={t} forca={rampa(t, DEIXA, DEIXA + 0.3)} pos={[1.9, 0, -1]} />}
        </>
      ),
    };
  }

  if (k === 12) {
    // enquanto isso, o pai no churrasco
    return {
      cam: { pos: lerp3([1.6, 3.0, 6.8], [1.5, 2.9, 6.0], prog(t, S[12], S[13])), alvo: [0.6, 1.8, 0.0] },
      atores: [{ tipo: "pai", a: { pos: [0.6, 0, -0.5], expr: "feliz", social: true, avental: true, bracoD: [-1.2 + Math.sin(t * 9) * 0.35, 0.2], bracoE: [0, -0.7],
        segura: <Espeto3D rot={[PI / 2, 0, 0]} esc={0.6} pos={[0, 0, 0.6]} /> } }],
      objs: (
        <>
          <Churrasqueira3D t={t} pos={[0.6, 0, 0.7]} dourada={1} />
          <Brilhos t={t} pos={[0.6, 1.6, 0.7]} raio={1.3} n={10} />
        </>
      ),
    };
  }

  // 13: a família toda acena + controle na câmera (volta ao começo)
  const tchau = Math.sin(t * 12) * 0.35;
  const joga = t >= FIM;
  const v = Math.min(1, (t - FIM) / 0.42);
  return {
    cam: { pos: lerp3([0, 2.9, 11.6], [0, 2.8, 10.6], prog(t, S[13], AVO_3D_DUR)), alvo: [0, 2.0, -0.8] },
    atores: [
      { tipo: "avo", a: avoSentada(t, { pos: [0, 0.22, -1.25], bracoE: [-2.6, -0.3 + tchau], bracoD: joga ? [-1.0, 0.2] : [-2.6, 0.2],
        segura: joga ? undefined : <Controle3D rot={[PI / 2, 0, 0]} esc={0.55} /> }) },
      { tipo: "mae", a: { pos: [-2.2, 0, -0.6], rotY: 0.35, esc: 1.05, coroa: true, expr: "feliz", bracoE: [-2.6, -0.3 + tchau], bracoD: [0, 0.12] } },
      { tipo: "pai", a: { pos: [2.2, 0, -0.6], rotY: -0.35, expr: "feliz", social: true, avental: true, bracoD: [-2.6, 0.3 - tchau], bracoE: [0, -0.7] } },
      { tipo: "filho", a: filho(t, { pos: [1.0, 0, 0.6], rotY: -0.2, bracoD: [-2.6, 0.3 - tchau] }) },
    ],
    objs: (
      <>
        <group position={[0, 0, -1.3]} rotation={[balanco(t), 0, 0]}><CadeiraBalanco3D /></group>
        {joga && <Controle3D pos={lerp3([0.6, 2.6, -0.8], [0, 2.4, 10.2], v * v)} rot={[t * 20, 0.4, t * 6]} esc={1.4} />}
      </>
    ),
  };
};

const Personagem: React.FC<{ a: Ator; tipo: Tipo }> = ({ a, tipo }) => {
  if (a.some) return null;
  return (
    <group position={a.pos} rotation={a.rot ?? [0, 0, 0]}>
      <Boneco3D tipo={tipo} rotY={a.rotY} esc={a.esc} expr={a.expr} bracoE={a.bracoE} bracoD={a.bracoD} pernaE={a.pernaE} pernaD={a.pernaD}
        cabeca={a.cabeca} olhosBrilho={a.olhos ?? 0} segura={a.segura} seguraE={a.seguraE} boca={a.boca} coroa={a.coroa}
        social={a.social} avental={a.avental} casaco={a.casaco} trico={a.trico} gelo={a.gelo} camisaCor={a.camisaCor} boneCor={a.boneCor} calcaCor={a.calcaCor} />
    </group>
  );
};

const TREMORES: [number, number, number][] = [[0.45, 0.5, 0.25], [AVO_T, 0.35, 0.12], [S[3], 0.4, 0.15], [MAE_T, 0.4, 0.15],
  ...RAIOS.map((r) => [r, 0.3, 0.1] as [number, number, number]), [DEIXA, 0.5, 0.25], [FIM + 0.4, 0.3, 0.1]];

const Cena3D: React.FC = () => {
  const { t } = useT();
  const e = estado(t);
  const n = e.noite ?? 0, r = e.escuro ?? 0;
  const apaga = Math.max(n, r);
  const tr = soma([0, 0, 0], ...TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp)));
  return (
    <>
      <Camera pos={soma(e.cam.pos, tr)} alvo={e.cam.alvo} fov={e.cam.fov ?? 50} roll={e.cam.roll ?? 0} />
      <ambientLight intensity={0.55 * (1 - 0.45 * apaga)} color={n > 0 ? "#c8b8ff" : "#ffffff"} />
      <hemisphereLight args={["#cfefff", "#7fbf5a", 0.7 * (1 - 0.6 * apaga)]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6 * (1 - 0.4 * apaga)} color={r > 0 ? "#ffb0a0" : n > 0 ? "#b0a8ff" : "#ffffff"} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
      {n > 0 && <pointLight position={[0, 3, 2]} color="#ff9ec4" intensity={2.2 * n} distance={10} />}
      {r > 0 && <pointLight position={[0, 5, 3]} color="#ff2040" intensity={3 * r} distance={14} />}
      <Mundo3D t={t} />
      {e.atores.map((x, i) => <Personagem key={i} a={x.a} tipo={x.tipo} />)}
      {e.objs}
    </>
  );
};

// ── camada 2D ────────────────────────────────────────────────────────────
const BANNERS: Banner[] = [
  { t0: AVO_T, t1: S[1], txt: "ADMIN: VOVÓ 👵", y: 240, tam: 100 },
  { t0: INF, t1: MAS, txt: "💰 ROBUX INFINITO", y: 240, tam: 92 },
  { t0: POUQ - 0.2, t1: S[2], txt: "COME MAIS UM POUQUINHO 🍛", y: 240, tam: 62, cor: "#ffffff" },
  { t0: ESCOND, t1: S[3], txt: "🤫 SEGREDO", y: 240, tam: 100 },
  { t0: CONTA, t1: S[3], txt: "NÃO CONTA PRA SUA MÃE", y: 380, tam: 70, cor: "#ffffff" },
  { t0: PERGUNTA + 0.2, t1: S[4], txt: "TÁ AGASALHADO? 🧥", y: 560, tam: 84 },
  { t0: S[4], t1: S[5], txt: "👻 JOGO DE TERROR", y: 240, tam: 90, cor: "#ffffff" },
  { t0: COBERTOR, t1: S[5], txt: "☕ AGORA É BONZINHO", y: 380, tam: 76 },
  { t0: TRICO, t1: S[6], txt: "🧶 SKIN FEITA À MÃO", y: 240, tam: 86 },
  { t0: FEZ, t1: S[6], txt: "PELA VOVÓ ❤️", y: 380, tam: 84, cor: "#ffffff" },
  { t0: BOLO - 0.4, t1: S[7], txt: "🎂 BOLO PRA TODO MUNDO", y: 240, tam: 74 },
  { t0: NOVELA, t1: S[8], txt: "📺 HORA DA NOVELA", y: 240, tam: 90 },
  { t0: TRAVA, t1: S[9], txt: "⚠ JOGO TRAVADO", y: 240, tam: 96, cor: "#7fd3ff" },
  { t0: MAE_T, t1: S[10], txt: "MÃE CHEGOU 😡", y: 240, tam: 96, cor: COR.vermelho },
  { t0: DEZ, t1: S[10], txt: "22:00 ⏰", y: 380, tam: 96, cor: "#ffffff" },
  { t0: BATALHA, t1: S[11], txt: "⚔ MÃE × AVÓ", y: 420, tam: 100, cor: COR.vermelho },
  { t0: DEIXA + 0.3, t1: S[12], txt: "K.O. 🏆 VOVÓ", y: 420, tam: 110 },
  { t0: S[12] + 0.1, t1: S[13], txt: "🔥 PAI: AINDA NO CHURRASCO", y: 240, tam: 62 },
  { t0: FARIA, t1: AVO_3D_DUR, txt: "O QUE A SUA AVÓ FARIA?", y: 240, tam: 68, cor: "#ffffff" },
  { t0: COMENTA, t1: AVO_3D_DUR, txt: "COMENTA AÍ 👇", y: 370, tam: 112 },
];

const contorno = (px: number) => ({ WebkitTextStroke: `${px}px ${COR.linha}`, paintOrder: "stroke fill" as const });

/** Tela de "GAME OVER". */
const GameOver: React.FC = () => {
  const { t, fps } = useT();
  if (t < S[3] || t >= PERGUNTA) return null;
  const s = mola(t, S[3], fps, 8, 220);
  return (
    <AbsoluteFill style={{ background: "rgba(40,0,10,.45)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${s}) rotate(-4deg)`, fontFamily: "Poppins", fontWeight: 900, fontSize: 150, color: COR.vermelho, ...contorno(20) }}>GAME OVER 💀</div>
    </AbsoluteFill>
  );
};

/** Pausa da novela. */
const Pausado: React.FC = () => {
  const { t, fps } = useT();
  if (t < PAUSA || t >= S[8]) return null;
  const s = mola(t, PAUSA, fps, 9, 220);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", transform: `scale(${s})`, fontFamily: "Poppins", fontWeight: 900 }}>
      <div style={{ display: "inline-block", background: "rgba(36,28,70,.9)", border: `8px solid ${COR.linha}`, borderRadius: 30, padding: "14px 40px", fontSize: 90, color: "#fff" }}>⏸ PAUSADO</div>
    </div>
  );
};

/** Jogo travado: tela azulada + player de áudio de 4 minutos. */
const Travado: React.FC = () => {
  const { t, fps } = useT();
  if (t < TRAVA || t >= S[9]) return null;
  const s = mola(t, AUDIO - 0.1, fps, 10, 220);
  const seg = Math.floor(Math.max(0, t - AUDIO) * 3);
  return (
    <AbsoluteFill style={{ background: "rgba(120,190,255,.22)" }}>
      {t >= AUDIO - 0.1 && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 400, transform: `scale(${s})`, background: "#dcf8c6", border: `8px solid ${COR.linha}`,
          borderRadius: 34, padding: "18px 28px", display: "flex", alignItems: "center", gap: 20, fontFamily: "Poppins", fontWeight: 900, boxShadow: "0 12px 0 rgba(0,0,0,.25)" }}>
          <div style={{ fontSize: 64 }}>▶</div>
          <div style={{ flex: 1, display: "flex", gap: 6, alignItems: "center", height: 70 }}>
            {Array.from({ length: 26 }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 14 + ((i * 37) % 50), borderRadius: 5, background: i < seg ? "#2e7d32" : "#8fbf9a" }} />
            ))}
          </div>
          <div style={{ fontSize: 50, color: COR.linha }}>4:00</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Barras de vida mãe × avó. */
const Luta: React.FC = () => {
  const { t } = useT();
  if (t < S[10] || t >= S[12]) return null;
  const mae = t >= DEIXA ? 0 : 100 - Math.abs(Math.sin(t * 3)) * 12;
  const avo = 100 - Math.abs(Math.cos(t * 3)) * 12;
  const barra = (nome: string, pct: number, cor: string, dir: boolean) => (
    <div style={{ flex: 1, textAlign: dir ? "right" : "left" }}>
      <div style={{ fontSize: 44, color: "#fff", ...contorno(9) }}>{nome}</div>
      <div style={{ height: 40, background: "#3b3060", border: `6px solid ${COR.linha}`, borderRadius: 12, overflow: "hidden", display: "flex", justifyContent: dir ? "flex-end" : "flex-start" }}>
        <div style={{ width: `${pct}%`, background: cor }} />
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 200, display: "flex", gap: 30, alignItems: "flex-end", fontFamily: "Poppins", fontWeight: 900 }}>
      {barra("MÃE 👑", mae, COR.vermelho, false)}
      <div style={{ fontSize: 70, color: COR.amarelo, ...contorno(10) }}>VS</div>
      {barra("AVÓ 👵", avo, "#9b6fc6", true)}
    </div>
  );
};

const SONS: { t: number; s: string; v: number }[] = [
  { t: 0, s: "whoosh", v: 0.6 }, { t: 0.44, s: "impacto", v: 0.7 }, { t: AVO_T - 0.05, s: "pop", v: 0.55 }, { t: AVO_T, s: "aura", v: 0.4 }, { t: AVO_T + 0.1, s: "plim", v: 0.4 },
  { t: INF - 0.3, s: "contagem", v: 0.35 }, { t: INF, s: "plim", v: 0.4 }, { t: MAS, s: "whoosh", v: 0.4 },
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ t: COMER + i * ((POUQ + 0.5 - COMER) / 8), s: "pop", v: 0.22 })),
  { t: ESCOND, s: "pop", v: 0.4 }, { t: TOMA + 0.4, s: "plim", v: 0.45 },
  { t: S[3], s: "erro", v: 0.5 }, { t: PERGUNTA - 0.3, s: "whoosh", v: 0.45 }, { t: AGAS, s: "pop", v: 0.5 },
  { t: S[4], s: "impacto", v: 0.5 }, { t: CHA, s: "pop", v: 0.4 }, { t: COBERTOR, s: "plim", v: 0.5 },
  { t: TRICO, s: "pop", v: 0.55 }, { t: TRICO + 0.1, s: "erro", v: 0.3 }, { t: FEZ, s: "plim", v: 0.4 },
  ...FIGURANTES.map((_, i) => ({ t: S[6] + 0.25 + i * 0.3, s: "pop", v: 0.3 })),
  { t: PAUSA, s: "erro", v: 0.4 }, { t: NOVELA, s: "plim", v: 0.4 },
  { t: TRAVA, s: "erro", v: 0.45 }, { t: AUDIO, s: "pop", v: 0.4 },
  { t: MAE_T - 0.05, s: "pop", v: 0.55 }, { t: MAE_T, s: "impacto", v: 0.6 }, { t: DEZ, s: "contagem", v: 0.35 },
  { t: BATALHA, s: "whoosh", v: 0.5 }, ...RAIOS.map((r) => ({ t: r, s: "impacto", v: 0.4 })), { t: CONTRA, s: "aura", v: 0.4 },
  { t: DEIXA, s: "impacto", v: 0.85 }, { t: DEIXA + 0.3, s: "plim", v: 0.5 },
  { t: S[12], s: "whoosh", v: 0.4 }, { t: CHURR, s: "plim", v: 0.35 },
  { t: FARIA, s: "pop", v: 0.4 }, { t: COMENTA, s: "pop", v: 0.5 }, { t: FIM, s: "whoosh", v: 0.6 }, { t: FIM + 0.4, s: "impacto", v: 0.7 },
];

export const ImaginaSoAvo3D: React.FC = () => {
  const { t } = useT();
  const tr = TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp * 100)).reduce((x, y) => soma(x, y), [0, 0, 0] as V3);
  const e = estado(t);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4fb6ff 0%, #bfe7ff 70%)" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #1a0f3a 0%, #4a2a6a 75%)", opacity: e.noite ?? 0 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #2a0710 0%, #8a1024 75%)", opacity: e.escuro ?? 0 }} />
      <ThreeCanvas width={1080} height={1920} shadows flat camera={{ fov: 50, position: [0, 2.2, 8], near: 0.1, far: 200 }}>
        <Cena3D />
      </ThreeCanvas>
      <AbsoluteFill style={{ transform: `translate(${tr[0]}px, ${tr[1]}px)` }}>
        <Marca3D />
        <GameOver />
        <Travado />
        {BANNERS.map((b, i) => <Faixa3D key={i} {...b} />)}
        <Pausado />
        <Luta />
        <Balao3D t0={TOMA - 0.1} t1={S[3]} txt="Toma, não conta pra sua mãe! 🤫" x={540} y={560} tam={46} letra={0.03} />
        <Balao3D t0={DEIXA - 0.2} t1={S[12]} txt="Deixa o menino!" x={680} y={580} tam={64} letra={0.04} />
        <Legenda3D fala={F} fim={AVO_3D_DUR} />
      </AbsoluteFill>
      <Flash picos={[0.45, S[3], DEIXA, AVO_3D_DUR - 0.05]} />

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
