import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import tl from "../../public/videos/imagina-so-06-qi-dobra-todo-dia-mwumgvez/timeline.json";
import { COR, mola, rampa, useT } from "./Bloco";
import { Aura, Boneco3D, Brilhos, Caixa, Camera, Controle3D, type Expr, Mundo3D, tremor } from "./Bloco3D";
import { Cachorro3D, Livro3D, Lampada3D, Lousa3D, Poof3D, Portal3D, Robo3D, Sofa3D } from "./Objetos3D";
import { Terra3D } from "./Cenarios3D";
import { Balao3D, Faixa3D, Flash, Legenda3D, Marca3D, montarFala, type Banner } from "./Camada2D";

// Imagina Só #06: "E se o seu QI dobrasse todo dia?" — escalada DIA N (como o #04) com HUD de QI.
// A virada é a mãe achando o controle em 2 segundos (callback do #01). Livro na câmera no começo e no fim.

const PASTA = "videos/imagina-so-06-qi-dobra-todo-dia-mwumgvez/";
const F = montarFala(tl, { vel: 1.15, inicio: 0.35 });
const { S, W } = F;
const PI = Math.PI;

type V3 = [number, number, number];
type Tipo = "mae" | "filho" | "pai" | "avo";
type Ator = {
  pos: V3; rotY?: number; esc?: number; expr?: Expr; bracoE?: [number, number]; bracoD?: [number, number];
  pernaE?: number; pernaD?: number; cabeca?: [number, number]; olhos?: number; segura?: React.ReactNode; seguraE?: React.ReactNode;
  boca?: number; rot?: V3; coroa?: boolean; oculos?: boolean; some?: boolean; camisaCor?: string; boneCor?: string; calcaCor?: string;
};
type Plano = { pos: V3; alvo: V3; fov?: number; roll?: number };

// ── marcos ───────────────────────────────────────────────────────────────
const DOBR = W(0, "dobrasse");
const MEDIA = W(1, "média");
const EINSTEIN = W(2, "einstein");
const LICAO = W(3, "lição"), MINUTO = W(3, "minuto");
const PROF = W(4, "professor"), AJUDA = W(4, "ajuda");
const ROBO = W(5, "robô"), ARRUMA = W(5, "arruma");
const LINGUAS = W(6, "línguas");
const CACHORRO = W(7, "cachorro"), COMIDA = W(7, "comida");
const CIENTISTAS = W(8, "cientistas"), FILA = W(8, "fila");
const RESOLVE = W(9, "resolve"), CEM = W(9, "100");
const INVENTA = W(10, "inventa"), TEMPO = W(10, "tempo");
const CONTROLE = W(11, "controle"), MAE_T = W(11, "mãe"), SEG = W(11, "segundos");
const INVENTARIA = W(12, "inventaria"), COMENTA = W(12, "comenta"), FIM = W(12, "aí") + 0.35;
export const QI_3D_DUR = Math.max(F.fim + 0.2, FIM + 0.5);

// dia e QI de cada cena (QI do dia N = 100 × 2^(N−1))
const HUD: ([number, number] | null)[] = [null, [1, 100], [2, 200], [3, 400], [4, 800], [6, 3200], [8, 12800], [10, 51200], [13, 409600],
  [15, 1638400], [20, 52428800], null, null];

const FILHO: V3 = [0.6, 0, 0];
const ease = Easing.out(Easing.cubic);
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as V3;
const soma = (...vs: number[][]) => vs.reduce((a, b) => a.map((v, i) => v + b[i])) as V3;
const prog = (t: number, a: number, b: number) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const cenaDe = (t: number) => S.reduce((k, s, i) => (t >= s - 0.04 ? i : k), 0);
const filho = (extra: Partial<Ator> = {}): Ator => ({ pos: FILHO, expr: "feliz", ...extra });
const CIENT = [
  { tipo: "pai" as Tipo, oculos: true }, { tipo: "avo" as Tipo, oculos: true }, { tipo: "filho" as Tipo, oculos: true, bone: "#f4f4f4" },
  { tipo: "pai" as Tipo, oculos: false }, { tipo: "filho" as Tipo, oculos: true, bone: "#9aa5b1" }, { tipo: "avo" as Tipo, oculos: true },
];
const ROUPAS: { p: V3; cor: string }[] = [
  { p: [-1.8, 0.08, 1.2], cor: "#e0364f" }, { p: [-0.6, 0.08, 1.7], cor: "#5ad35a" }, { p: [1.9, 0.08, 1.4], cor: "#ffd23f" }, { p: [2.4, 0.08, -0.4], cor: "#7b4bd6" },
];

type Estado = { cam: Plano; atores: { a: Ator; tipo: Tipo }[]; objs?: React.ReactNode; brilho?: number };

const estado = (t: number): Estado => {
  const k = cenaDe(t);
  const dt = t - S[k];
  const lampada = (on: boolean) => <Lampada3D pos={[FILHO[0], 3.6 + Math.sin(t * 4) * 0.08, FILHO[2]]} esc={0.9} acesa={on} />;

  if (k === 0) {
    const v = Math.min(1, t / 0.47);
    return {
      cam: t < 0.5 ? { pos: [0, 2.2, 8], alvo: [0, 2.2, 0] } : { pos: lerp3([0.6, 2.4, 5.6], [0.6, 2.5, 4.6], prog(t, 0.5, S[1])), alvo: [0.6, 2.5, 0], roll: 0.04 },
      atores: [{ tipo: "filho", a: filho({ expr: t >= DOBR ? "feliz" : "medo", cabeca: [-0.15, 0] }) }],
      objs: (
        <>
          {t < 0.5 && <Livro3D pos={lerp3([0, 3.2, -6], [0, 2.2, 7.3], v * v)} rot={[t * 20, 0.4, t * 6]} esc={1.8} cor={COR.vermelho} />}
          {t >= DOBR - 0.1 && lampada(true)}
          {t >= DOBR && <Brilhos t={t} pos={[FILHO[0], 3.6, FILHO[2]]} raio={0.8} n={8} />}
        </>
      ),
    };
  }

  if (k === 1 || k === 2) {
    // dia 1 coçando a cabeça diante de 2 + 2; dia 2 o cérebro acende
    const esperto = k === 2;
    return {
      brilho: esperto ? rampa(t, S[2] + 0.2, S[2] + 0.6) : 0,
      cam: esperto ? { pos: lerp3([0.8, 2.8, 5.2], [0.7, 2.7, 4.4], prog(t, S[2], S[3])), alvo: [0.6, 2.5, 0] }
        : { pos: lerp3([-0.3, 2.9, 8.2], [-0.3, 2.8, 7.4], prog(t, S[1], S[2])), alvo: [-0.4, 2.3, -0.8] },
      atores: [{ tipo: "filho", a: filho({ rotY: esperto ? 0 : -0.5, expr: esperto ? "feliz" : "medo",
        bracoD: esperto ? [-2.7, 0.3] : [-2.9, -0.6], bracoE: esperto ? [-2.7, -0.3] : [0, -0.12] }) }],
      objs: (
        <>
          {!esperto && <Lousa3D pos={[-1.6, 0, -1.6]} rotY={0.4} cheia={0.1} />}
          {esperto && <Aura t={t} forca={rampa(t, S[2] + 0.2, S[2] + 0.6)} pos={FILHO} />}
          {esperto && <Brilhos t={t} pos={[FILHO[0], 2.6, FILHO[2]]} raio={1.0} n={10} cor="#7fd3ff" />}
          {lampada(esperto)}
        </>
      ),
    };
  }

  if (k === 3) {
    // lição da semana inteira em 1 minuto: cadernos girando e se empilhando
    const junta = prog(t, MINUTO - 0.3, MINUTO + 0.3);
    return {
      cam: { pos: lerp3([0.6, 3.0, 7.6], [0.6, 2.9, 6.8], prog(t, S[3], S[4])), alvo: [0.6, 2.2, 0] },
      atores: [{ tipo: "filho", a: filho({ expr: "feliz", bracoE: [-1.6 + Math.sin(t * 24) * 0.5, -0.2], bracoD: [-1.6 - Math.sin(t * 24) * 0.5, 0.2] }) }],
      objs: (
        <>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const a = i * (2 * PI / 7) + t * 5;
            const voo: V3 = [FILHO[0] + Math.cos(a) * 1.8, 2.0 + Math.sin(a * 2) * 0.4, FILHO[2] + Math.sin(a) * 1.2];
            const pilha: V3 = [FILHO[0] + 1.6, 0.14 + i * 0.24, FILHO[2] + 0.6];
            return <Livro3D key={i} pos={lerp3(voo, pilha, junta)} rot={[0, junta < 1 ? t * 6 + i : 0.2, 0]} esc={0.8} cor={["#3f8cff", "#e0364f", "#5ad35a", "#ffd23f", "#7b4bd6"][i % 5]} />;
          })}
          {lampada(true)}
        </>
      ),
    };
  }

  if (k === 4) {
    // o professor pede ajuda
    const resolveu = t >= AJUDA + 0.2;
    return {
      cam: { pos: lerp3([0.2, 3.0, 8.4], [0.2, 2.9, 7.6], prog(t, S[4], S[5])), alvo: [0, 2.4, -0.8] },
      atores: [
        { tipo: "pai", a: { pos: [-1.6, 0, -0.4], rotY: 0.5, expr: resolveu ? "feliz" : "medo", oculos: true, camisaCor: "#8d6e63", calcaCor: "#4e342e",
          bracoD: [-1.8, 0.2], cabeca: [0, resolveu ? 0 : Math.sin(t * 5) * 0.3] } },
        { tipo: "filho", a: filho({ pos: [1.4, 0, 0], rotY: -0.5, bracoE: [-2.3, -0.3] }) },
      ],
      objs: <Lousa3D pos={[0, 0, -2.2]} cheia={rampa(t, S[4], AJUDA + 0.2, 0.3, 1)} certo={resolveu} />,
    };
  }

  if (k === 5) {
    // robô arruma o quarto; a mãe aprova
    const rx = interpolate(t, [S[5], S[6]], [-2.0, 2.4], clamp);
    return {
      cam: { pos: lerp3([0.3, 3.2, 9.4], [0.3, 3.1, 8.6], prog(t, S[5], S[6])), alvo: [0.3, 2.0, -0.2] },
      atores: [
        { tipo: "filho", a: filho({ pos: [-2.4, 0, -0.8], rotY: 0.5, bracoE: [0, -0.7], bracoD: [0, 0.7] }) },
        { tipo: "mae", a: { pos: [2.6, 0, -1.2], rotY: -0.5, esc: 1.05, coroa: true, expr: "feliz", bracoE: [-2.6, -0.3], bracoD: [-2.6, 0.3], some: t < ARRUMA } },
      ],
      objs: (
        <>
          <Robo3D t={t} pos={[rx, 0, 0.6]} rotY={0.3} bracos={1} />
          {ROUPAS.map((r, i) => (rx < r.p[0] - 0.3 ? <Caixa key={i} p={r.p} s={[0.7, 0.12, 0.5]} rot={[0, i, 0]} cor={r.cor} contorno={0.03} /> : null))}
          <Poof3D t={t} t0={ARRUMA - 0.05} pos={[2.6, -0.2, -1.0]} />
          {t >= ARRUMA && <Brilhos t={t} pos={[2.6, 3.4, -1.2]} raio={0.8} n={6} cor="#ff9ec4" />}
        </>
      ),
    };
  }

  if (k === 6) {
    // todas as línguas: o planeta gira em cima da cabeça
    return {
      cam: { pos: lerp3([0.6, 3.6, 9.0], [0.6, 3.5, 8.2], prog(t, S[6], S[7])), alvo: [0.6, 3.1, 0] },
      atores: [{ tipo: "filho", a: filho({ expr: "feliz", bracoE: [-2.6, -0.4], bracoD: [-2.6, 0.4] }) }],
      objs: (
        <>
          <Terra3D pos={[FILHO[0], 4.0, FILHO[2]]} raio={0.7} giro={t * 2} />
          <Brilhos t={t} pos={[FILHO[0], 2.4, FILHO[2]]} raio={1.6} n={12} cor="#7fd3ff" />
        </>
      ),
    };
  }

  if (k === 7) {
    // o cachorro fala: só quer comida
    const fala = t >= COMIDA - 0.6 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 14)) : 0;
    return {
      cam: t < CACHORRO - 0.04 ? { pos: [0.4, 2.8, 7.6], alvo: [0.2, 1.9, 0] }
        : { pos: lerp3([-0.6, 1.8, 4.4], [-0.6, 1.8, 3.8], prog(t, CACHORRO, S[8])), alvo: [-0.6, 1.3, 0.4], fov: 48 },
      atores: [{ tipo: "filho", a: filho({ pos: [1.2, 0, -0.4], rotY: -0.6, expr: t >= COMIDA ? "medo" : "feliz" }) }],
      objs: <Cachorro3D t={t} pos={[-0.6, 0, 0]} rotY={0.3} boca={fala} />,
    };
  }

  if (k === 8) {
    // fila de cientistas
    return {
      cam: { pos: lerp3([2.0, 3.8, 14.6], [2.0, 3.7, 13.6], prog(t, S[8], S[9])), alvo: [2.1, 2.4, -0.4] },
      atores: [
        { tipo: "filho", a: filho({ pos: [-0.8, 0, 0], rotY: 0.7, expr: "medo" }) },
        ...CIENT.map((c, i) => {
          const chega = S[8] + 0.15 + i * 0.2;
          const x = interpolate(t, [chega, chega + 0.7], [12 + i, 0.6 + i * 1.15], clamp);
          const anda = t < chega + 0.7;
          return { tipo: c.tipo, a: { pos: [x, 0, -0.3 + (i % 2) * 0.4] as V3, rotY: anda ? -PI / 2 : -1.3, expr: "feliz" as Expr, oculos: c.oculos,
            camisaCor: "#f4f4f4", calcaCor: "#5b6070", boneCor: c.bone, pernaE: anda ? Math.sin(t * 20 + i) * 0.6 : 0, pernaD: anda ? -Math.sin(t * 20 + i) * 0.6 : 0,
            bracoD: !anda && t >= FILA ? [-2.6, 0.3] as [number, number] : [0, 0.12] as [number, number] } };
        }),
      ],
    };
  }

  if (k === 9) {
    // problema de 100 anos: lousa gigante e ✓
    const resolveu = t >= CEM;
    return {
      cam: { pos: lerp3([0.4, 3.6, 10.4], [0.4, 3.5, 9.4], prog(t, S[9], S[10])), alvo: [0, 3.0, -1.6] },
      atores: [{ tipo: "filho", a: filho({ pos: [1.8, 0, 0.4], rotY: -0.4, bracoD: [-2.5, 0.2], expr: resolveu ? "feliz" : "brava" }) }],
      objs: (
        <>
          <Lousa3D pos={[-0.6, 0, -2.4]} esc={1.5} cheia={rampa(t, S[9], CEM, 0.2, 1)} certo={resolveu} />
          {resolveu && <Brilhos t={t} pos={[-0.6, 4.0, -2.0]} raio={2.2} n={14} cor={COR.amarelo} />}
        </>
      ),
    };
  }

  if (k === 10) {
    // máquina do tempo: entra no portal
    const entra = prog(t, TEMPO, TEMPO + 0.5);
    return {
      cam: { pos: lerp3([1.8, 3.0, 8.6], [1.6, 2.9, 7.8], prog(t, S[10], S[11])), alvo: [0.3, 2.1, -1] },
      atores: [{ tipo: "filho", a: filho({ pos: lerp3([1.8, 0, 0.6], [0.3, 0.6, -1.1], entra), esc: 1 - entra * 0.8, rotY: -1.0 - entra, expr: "feliz",
        bracoE: [-2.6, -0.3], bracoD: [-2.6, 0.3], some: entra >= 0.98 }) }],
      objs: <Portal3D t={t} pos={[0.3, 2.0, -1.2]} esc={1.1} forca={rampa(t, INVENTA - 0.1, INVENTA + 0.4)} />,
    };
  }

  if (k === 11) {
    // não acha o controle; a mãe acha em 2 segundos
    const achou = t >= MAE_T + 0.2;
    return {
      cam: t < MAE_T - 0.04 ? { pos: lerp3([0.6, 3.0, 7.6], [0.6, 2.9, 6.8], prog(t, S[11], MAE_T)), alvo: [0.6, 2.0, -0.6] }
        : { pos: lerp3([-0.4, 3.4, 10.4], [-0.4, 3.3, 9.6], prog(t, MAE_T, S[12])), alvo: [-0.4, 2.8, -0.6] },
      atores: [
        { tipo: "filho", a: filho({ pos: [0.6, 0, -0.2], rot: [achou ? 0 : 0.5, 0, 0], expr: "medo", cabeca: [0, Math.sin(t * 6) * 0.5],
          bracoE: [-1.0 + Math.sin(t * 12) * 0.4, -0.2], bracoD: [-1.0 - Math.sin(t * 12) * 0.4, 0.2] }) },
        { tipo: "mae", a: { pos: [-1.8, 0, 0], rotY: 0.5, esc: 1.05, coroa: true, expr: "feliz", some: t < MAE_T - 0.05,
          bracoE: achou ? [-2.8, -0.2] : [0, -0.12], seguraE: achou ? <Controle3D rot={[PI / 2, 0, 0]} esc={0.6} brilho={0.6} /> : undefined } },
      ],
      objs: (
        <>
          <Sofa3D pos={[0.6, 0, -1.6]} />
          <Poof3D t={t} t0={MAE_T - 0.05} pos={[-1.8, -0.2, 0.2]} />
          {achou && <Brilhos t={t} pos={[-1.8, 3.4, 0]} raio={0.6} n={8} />}
        </>
      ),
    };
  }

  // 12: acenam + livro na câmera (volta ao começo)
  const tchau = Math.sin(t * 12) * 0.35;
  const joga = t >= FIM;
  const v = Math.min(1, (t - FIM) / 0.42);
  return {
    cam: { pos: lerp3([0, 2.8, 9.0], [0, 2.7, 8.2], prog(t, S[12], QI_3D_DUR)), alvo: [0, 2.1, -0.4] },
    atores: [
      { tipo: "filho", a: filho({ pos: [0.9, 0, 0], rotY: -0.25, bracoD: [-2.6, 0.3 - tchau], bracoE: joga ? [-1.0, -0.12] : [-2.6, -0.2] }) },
      { tipo: "mae", a: { pos: [-1.0, 0, -0.3], rotY: 0.3, esc: 1.05, coroa: true, expr: "feliz", bracoE: [-2.6, -0.3 + tchau], bracoD: [0, 0.12] } },
    ],
    objs: (
      <>
        {lampada(true)}
        {joga && <Livro3D pos={lerp3([0.6, 3.0, 0.2], [0, 2.4, 7.4], v * v)} rot={[t * 20, 0.4, t * 6]} esc={1.8} cor={COR.vermelho} />}
      </>
    ),
  };
};

const Personagem: React.FC<{ a: Ator; tipo: Tipo }> = ({ a, tipo }) => {
  if (a.some) return null;
  return (
    <group position={a.pos} rotation={a.rot ?? [0, 0, 0]}>
      <Boneco3D tipo={tipo} rotY={a.rotY} esc={a.esc} expr={a.expr} bracoE={a.bracoE} bracoD={a.bracoD} pernaE={a.pernaE} pernaD={a.pernaD}
        cabeca={a.cabeca} olhosBrilho={a.olhos ?? 0} segura={a.segura} seguraE={a.seguraE} boca={a.boca} coroa={a.coroa} oculos={a.oculos}
        camisaCor={a.camisaCor} boneCor={a.boneCor} calcaCor={a.calcaCor} />
    </group>
  );
};

const TREMORES: [number, number, number][] = [[0.45, 0.5, 0.25], [AJUDA + 0.2, 0.3, 0.08], [CEM, 0.4, 0.15], [TEMPO, 0.4, 0.12], [MAE_T, 0.35, 0.1], [FIM + 0.4, 0.3, 0.1]];

const Cena3D: React.FC = () => {
  const { t } = useT();
  const e = estado(t);
  const tr = soma([0, 0, 0], ...TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp)));
  return (
    <>
      <Camera pos={soma(e.cam.pos, tr)} alvo={e.cam.alvo} fov={e.cam.fov ?? 50} roll={e.cam.roll ?? 0} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#cfefff", "#7fbf5a", 0.7]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
      <Mundo3D t={t} />
      {e.atores.map((x, i) => <Personagem key={i} a={x.a} tipo={x.tipo} />)}
      {e.objs}
    </>
  );
};

// ── camada 2D ────────────────────────────────────────────────────────────
const BANNERS: Banner[] = [
  { t0: DOBR, t1: S[1], txt: "🧠 QI ×2 TODO DIA", y: 430, tam: 84 },
  { t0: S[1] + 0.3, t1: S[2], txt: "2 + 2 = ? 🤔", y: 430, tam: 110, cor: "#ffffff" },
  { t0: MEDIA, t1: S[2], txt: "A MÉDIA", y: 570, tam: 80 },
  { t0: EINSTEIN - 0.2, t1: S[3], txt: "EINSTEIN: ~160 (ESTIMADO)", y: 430, tam: 62, cor: "#ffffff" },
  { t0: LICAO, t1: S[4], txt: "📚 LIÇÃO DA SEMANA", y: 430, tam: 80 },
  { t0: PROF, t1: S[5], txt: "👨‍🏫 PROFESSOR: SOCORRO", y: 430, tam: 70, cor: "#ffffff" },
  { t0: AJUDA + 0.2, t1: S[5], txt: "RESOLVIDO ✓", y: 560, tam: 90, cor: COR.verde },
  { t0: ROBO, t1: S[6], txt: "🤖 ROBÔ ARRUMADOR", y: 430, tam: 80 },
  { t0: ARRUMA + 0.3, t1: S[6], txt: "MÃE: 😍", y: 560, tam: 100 },
  { t0: LINGUAS, t1: S[7], txt: "🌍 TODAS AS LÍNGUAS", y: 430, tam: 80 },
  { t0: CACHORRO, t1: S[8], txt: "🐶 TRADUTOR DE CACHORRO", y: 430, tam: 66, cor: "#ffffff" },
  { t0: CIENTISTAS, t1: S[9], txt: "🔬 FILA DE CIENTISTAS", y: 430, tam: 74 },
  { t0: RESOLVE, t1: S[10], txt: "PROBLEMA DE 100 ANOS", y: 430, tam: 72, cor: "#ffffff" },
  { t0: CEM, t1: S[10], txt: "✓ RESOLVIDO", y: 560, tam: 110, cor: COR.verde },
  { t0: INVENTA, t1: S[11], txt: "⏳ MÁQUINA DO TEMPO", y: 430, tam: 80 },
  { t0: CONTROLE, t1: S[12], txt: "🎮 CADÊ O CONTROLE?", y: 240, tam: 84, cor: "#ffffff" },
  { t0: MAE_T + 0.2, t1: S[12], txt: "MÃE: ⏱ 2 SEGUNDOS", y: 380, tam: 84 },
  { t0: INVENTARIA, t1: QI_3D_DUR, txt: "O QUE VOCÊ INVENTARIA?", y: 240, tam: 66, cor: "#ffffff" },
  { t0: COMENTA, t1: QI_3D_DUR, txt: "COMENTA AÍ 👇", y: 370, tam: 112 },
];

const contorno = (px: number) => ({ WebkitTextStroke: `${px}px ${COR.linha}`, paintOrder: "stroke fill" as const });

/** "DIA N" + medidor de QI, contando a partir da cena anterior. */
const Hud: React.FC = () => {
  const { t, fps } = useT();
  const k = cenaDe(t);
  const h = HUD[k];
  if (!h) return null;
  const ant = HUD[k - 1] ?? [h[0], h[1]];
  const q = prog(t, S[k] + 0.1, S[k] + 0.7);
  const dia = Math.round(ant[0] + (h[0] - ant[0]) * q);
  const qi = Math.round(ant[1] + (h[1] - ant[1]) * q);
  const pop = mola(t, S[k] + 0.1, fps, 9, 240);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Poppins", fontWeight: 900 }}>
      <div style={{ fontSize: 150, lineHeight: 1, color: "#ffffff", transform: `scale(${0.85 + 0.15 * pop})`, textShadow: `0 12px 0 ${COR.roxo}`, ...contorno(20) }}>DIA {dia}</div>
      <div style={{ marginTop: 14, background: "#241c46", border: `8px solid ${COR.linha}`, borderRadius: 30, padding: "8px 30px", fontSize: 64, color: COR.amarelo,
        boxShadow: "0 10px 0 rgba(0,0,0,.3)" }}>🧠 QI {qi.toLocaleString("pt-BR")}</div>
    </div>
  );
};

/** Cronômetro da lição (59 s) e da mãe (2 s). */
const Cronometro: React.FC = () => {
  const { t } = useT();
  let txt = "";
  if (t >= LICAO && t < S[4]) txt = `⏱ 0:${String(Math.min(59, Math.floor(rampa(t, LICAO, MINUTO + 0.3, 0, 59)))).padStart(2, "0")}`;
  else if (t >= MAE_T && t < S[12]) txt = `⏱ 0:0${Math.min(2, Math.floor(rampa(t, MAE_T, SEG, 0, 2.99)))}`;
  if (!txt) return null;
  return (
    <div style={{ position: "absolute", right: 50, top: 1100, background: "#ffffff", border: `7px solid ${COR.linha}`, borderRadius: 24, padding: "6px 22px",
      fontFamily: "Poppins", fontWeight: 900, fontSize: 64, color: COR.linha, boxShadow: "0 8px 0 rgba(0,0,0,.25)" }}>{txt}</div>
  );
};

/** Balões de várias línguas girando. */
const Linguas: React.FC = () => {
  const { t, fps } = useT();
  if (t < LINGUAS - 0.2 || t >= S[7]) return null;
  const palavras = ["Hello!", "¡Hola!", "Bonjour!", "Ciao!", "Hallo!", "Olá!", "Konnichiwa!", "Privet!"];
  return (
    <>
      {palavras.map((p, i) => {
        const a = i * (2 * PI / palavras.length) + t * 0.8;
        const s = mola(t, LINGUAS - 0.2 + i * 0.06, fps, 10, 240);
        return (
          <div key={p} style={{ position: "absolute", left: 540 + Math.cos(a) * 360, top: 1000 + Math.sin(a) * 220, transform: `translate(-50%, -50%) scale(${s})`,
            background: "#ffffff", border: `6px solid ${COR.linha}`, borderRadius: 26, padding: "6px 20px", fontFamily: "Poppins", fontWeight: 900, fontSize: 44,
            color: [COR.azul, COR.vermelho, COR.roxo, "#2e7d32"][i % 4], boxShadow: "0 8px 0 rgba(0,0,0,.25)" }}>{p}</div>
        );
      })}
    </>
  );
};

const SONS: { t: number; s: string; v: number }[] = [
  { t: 0, s: "whoosh", v: 0.6 }, { t: 0.44, s: "impacto", v: 0.7 }, { t: DOBR, s: "plim", v: 0.5 },
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => ({ t: S[k] + 0.1, s: "contagem", v: 0.3 })),
  { t: MEDIA, s: "erro", v: 0.35 }, { t: S[2] + 0.2, s: "aura", v: 0.45 }, { t: EINSTEIN, s: "plim", v: 0.4 },
  { t: LICAO, s: "whoosh", v: 0.45 }, { t: MINUTO, s: "pop", v: 0.45 }, { t: MINUTO + 0.2, s: "plim", v: 0.4 },
  { t: PROF, s: "pop", v: 0.4 }, { t: AJUDA + 0.2, s: "plim", v: 0.5 },
  { t: ROBO, s: "tecla", v: 0.35 }, { t: ARRUMA - 0.05, s: "pop", v: 0.5 }, { t: ARRUMA + 0.3, s: "plim", v: 0.4 },
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ t: LINGUAS - 0.2 + i * 0.06, s: "pop", v: 0.22 })),
  { t: CACHORRO, s: "whoosh", v: 0.4 }, { t: COMIDA - 0.6, s: "pop", v: 0.4 }, { t: COMIDA, s: "erro", v: 0.3 },
  ...CIENT.map((_, i) => ({ t: S[8] + 0.15 + i * 0.2, s: "whoosh", v: 0.25 })), { t: FILA, s: "pop", v: 0.4 },
  { t: RESOLVE, s: "tecla", v: 0.35 }, { t: CEM, s: "impacto", v: 0.6 }, { t: CEM + 0.05, s: "plim", v: 0.5 },
  { t: INVENTA, s: "aura", v: 0.5 }, { t: TEMPO, s: "whoosh", v: 0.55 },
  { t: CONTROLE, s: "erro", v: 0.4 }, { t: MAE_T - 0.05, s: "pop", v: 0.55 }, { t: MAE_T + 0.2, s: "plim", v: 0.5 },
  { t: INVENTARIA, s: "pop", v: 0.4 }, { t: COMENTA, s: "pop", v: 0.5 }, { t: FIM, s: "whoosh", v: 0.6 }, { t: FIM + 0.4, s: "impacto", v: 0.7 },
];

export const ImaginaSoQI3D: React.FC = () => {
  const { t } = useT();
  const tr = TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp * 100)).reduce((x, y) => soma(x, y), [0, 0, 0] as V3);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4fb6ff 0%, #bfe7ff 70%)" }}>
      <ThreeCanvas width={1080} height={1920} shadows flat camera={{ fov: 50, position: [0, 2.2, 8], near: 0.1, far: 200 }}>
        <Cena3D />
      </ThreeCanvas>
      <AbsoluteFill style={{ transform: `translate(${tr[0]}px, ${tr[1]}px)` }}>
        <Marca3D />
        <Hud />
        {BANNERS.map((b, i) => <Faixa3D key={i} {...b} />)}
        <Linguas />
        <Cronometro />
        <Balao3D t0={COMIDA - 0.7} t1={S[8]} txt="COMIDA. COMIDA. COMIDA. 🍖" x={540} y={700} tam={48} letra={0.03} />
        <Legenda3D fala={F} fim={QI_3D_DUR} />
      </AbsoluteFill>
      <Flash picos={[0.45, CEM, TEMPO + 0.4, QI_3D_DUR - 0.05]} />

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
