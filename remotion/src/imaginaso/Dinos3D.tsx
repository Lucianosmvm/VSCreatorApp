import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import tl from "../../public/videos/imagina-so-12-dinossauros-nao-extintos-mwwhct84/timeline.json";
import { COR, mola, rampa, useT } from "./Bloco";
import { Boneco3D, Brilhos, Caixa, Camera, Chinelo3D, Controle3D, type Expr, Mundo3D, Poeira, tremor } from "./Bloco3D";
import { CadeiraBalanco3D, Churrasqueira3D, Espeto3D, Poof3D, Sanduiche3D, Sofa3D } from "./Objetos3D";
import { Asteroide3D, Dinossauro3D, Estrelas3D, PescocoLongo3D, Pterodatilo3D, Raptor3D, Rua3D, Terra3D } from "./Cenarios3D";
import { Balao3D, Faixa3D, Flash, Legenda3D, Marca3D, montarFala, type Banner } from "./Camada2D";

// Imagina Só #12: "E se os dinossauros não fossem extintos?" — falando com quem assiste.
// T-rex na câmera no começo e no fim (loop); a virada é o T-rex com medo do chinelo da mãe.

const PASTA = "videos/imagina-so-12-dinossauros-nao-extintos-mwwhct84/";
const F = montarFala(tl, { vel: 1.05, inicio: 0.35 });
const { S, W } = F;
const PI = Math.PI;

type V3 = [number, number, number];
type Tipo = "mae" | "filho" | "pai" | "avo";
type Ator = {
  pos: V3; rotY?: number; esc?: number; expr?: Expr; bracoE?: [number, number]; bracoD?: [number, number];
  pernaE?: number; pernaD?: number; cabeca?: [number, number]; olhos?: number; segura?: React.ReactNode; seguraE?: React.ReactNode;
  boca?: number; rot?: V3; coroa?: boolean; social?: boolean; avental?: boolean; amassa?: V3; some?: boolean;
  camisaCor?: string; boneCor?: string; calcaCor?: string;
};
type Plano = { pos: V3; alvo: V3; fov?: number; roll?: number };
type Mundo = "patio" | "espaco" | "rua";

// ── marcos ───────────────────────────────────────────────────────────────
const EXTINTOS = W(0, "extintos");
const ERROU = W(1, "errou"), POUCO = W(1, "pouco");
const PESCOCO = W(2, "pescoço");
const VELOCI = W(3, "velociraptor"), SOFA = W(3, "sofá");
const TREX4 = W(4, "t-rex"), PICANHA = W(4, "picanha");
const FUGIR = W(5, "fugir");
const PTERO = W(6, "pterodátilos"), ROUBAM = W(6, "roubam");
const BRACO = W(7, "braço"), CONTROLE = W(7, "controle");
const INVADE = W(8, "invade");
const MENOS = W(9, "menos"), MAE_T = W(9, "mãe");
const LIMPA = W(10, "limpa"), ENTRAR = W(10, "entrar");
const LIMPA2 = W(11, "limpa"), CHINELO = W(11, "chinelo");
const ESTIMACAO = W(12, "estimação"), COMENTA = W(12, "comenta"), FIM = W(12, "aí") + 0.35;
export const DINOS_3D_DUR = Math.max(F.fim + 0.2, FIM + 0.5);

const ease = Easing.out(Easing.cubic);
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as V3;
const soma = (...vs: number[][]) => vs.reduce((a, b) => a.map((v, i) => v + b[i])) as V3;
const prog = (t: number, a: number, b: number) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const cenaDe = (t: number) => S.reduce((k, s, i) => (t >= s - 0.04 ? i : k), 0);
const DE_PE = (pos: V3, rotY: number, extra: Partial<Ator> = {}): Ator => ({ pos, rotY, expr: "feliz", ...extra });
const corre = (t: number, f = 20): Partial<Ator> => ({ pernaE: Math.sin(t * f) * 0.7, pernaD: -Math.sin(t * f) * 0.7,
  bracoE: [-Math.sin(t * f) * 0.9, -0.1], bracoD: [Math.sin(t * f) * 0.9, 0.1] });
const FIGS = [{ cam: "#ff8a3d", bone: "#c0392b" }, { cam: "#5ad35a", bone: "#2e7d32" }, { cam: "#7b4bd6", bone: "#4a2a8a" }];
const rugido = (t: number, t0: number) => (t >= t0 ? 0.6 + 0.4 * Math.abs(Math.sin((t - t0) * 9)) : 0.15);

type Estado = { cam: Plano; mundo: Mundo; atores: { a: Ator; tipo: Tipo }[]; objs?: React.ReactNode; desloc?: number };

const estado = (t: number): Estado => {
  const k = cenaDe(t);
  const dt = t - S[k];

  if (k === 0) {
    // o T-rex enfia a cabeça na câmera e ruge
    const avanca = prog(t, 0, 0.6);
    return {
      mundo: "patio",
      cam: { pos: lerp3([0, 4.6, 9.0], [0, 4.6, 6.6], prog(t, 0, S[1])), alvo: [0, 4.4, 0], fov: 50 },
      atores: [],
      objs: (
        <>
          <Dinossauro3D t={t} pos={lerp3([0, 0, -6], [0, 0, -1.2], avanca)} esc={1.25} boca={rugido(t, 0.6)} andando={1 - avanca} />
          {t >= 0.6 && [0, 1, 2, 3, 4].map((i) => {
            const d = ((t - 0.6) * 2 + i * 0.2) % 1;
            return <Caixa key={i} p={[(i - 2) * 0.35, 5.0 - d * 1.5, 2.0 + d * 3]} s={[0.12, 0.2, 0.12]} cor="#e8f6ff" contorno={0} sombra={false} opacidade={1 - d} />;
          })}
        </>
      ),
    };
  }

  if (k === 1) {
    // o asteroide passa raspando na Terra
    const x = interpolate(t, [S[1], ERROU + 0.4, S[2]], [-6, 0, 7], clamp);
    return {
      mundo: "espaco",
      cam: { pos: lerp3([0, 1.2, 13], [0, 1.4, 11.5], prog(t, S[1], S[2])), alvo: [0, 1.6, 0] },
      atores: [],
      objs: (
        <>
          <Terra3D raio={3} giro={t * 0.3} />
          <Asteroide3D t={t} pos={[x, 4.0, 1.8]} esc={1.0} />
          {t >= POUCO && <Brilhos t={t} pos={[0, 3.2, 1.5]} raio={1.6} n={10} cor={COR.amarelo} />}
        </>
      ),
    };
  }

  if (k === 2) {
    // o ônibus escolar é um dinossauro de pescoço comprido
    const sentados = [-1.2, 0, 1.2].map((x, i) => ({ tipo: "filho" as Tipo, a: {
      pos: [x, 3.5, i === 1 ? 0.5 : -0.4] as V3, rotY: PI / 2, expr: "feliz" as Expr, pernaE: -PI / 2, pernaD: -PI / 2,
      camisaCor: i === 1 ? undefined : FIGS[i].cam, boneCor: i === 1 ? undefined : FIGS[i].bone, calcaCor: i === 1 ? undefined : "#33384a",
      bracoE: i === 1 ? [-2.6, -0.3] as [number, number] : [-0.5, -0.2] as [number, number], bracoD: [-0.5, 0.2] as [number, number] } }));
    const balanca = Math.sin(t * 5) * 0.08;
    return {
      mundo: "rua", desloc: dt * 3,
      cam: { pos: lerp3([2.0, 5.2, 14.5], [2.0, 5.0, 13.0], prog(t, S[2], S[3])), alvo: [1.0, 4.2, 0] },
      atores: sentados.map((s) => ({ ...s, a: { ...s.a, pos: [s.a.pos[0], s.a.pos[1] + balanca, s.a.pos[2]] as V3 } })),
      objs: <PescocoLongo3D t={t} pos={[0, balanca, 0]} andando={1} />,
    };
  }

  if (k === 3) {
    // o cachorro é um velociraptor que destrói o sofá
    const destruido = t >= SOFA;
    return {
      mundo: "patio",
      cam: { pos: lerp3([0.2, 2.8, 8.4], [0.2, 2.7, 7.6], prog(t, S[3], S[4])), alvo: [0, 1.6, -0.6] },
      atores: [{ tipo: "filho", a: DE_PE([-2.2, 0, 0.2], 0.6, { expr: "medo", bracoE: [-2.6, -0.4], bracoD: [-2.6, 0.4] }) }],
      objs: (
        <>
          <Sofa3D pos={[0.6, 0, -1.6]} />
          <Raptor3D t={t} pos={[0.6, 0, 0.6]} rotY={-0.3 + Math.sin(t * 6) * 0.3} esc={1.2} boca={0.6} pulando={1} />
          <Caixa p={[0.5, 2.1, 1.6]} s={[0.7, 0.35, 0.5]} rot={[0, Math.sin(t * 6) * 0.4, 0]} cor="#5a3d86" contorno={0.03} />
          {destruido && [0, 1, 2, 3, 4, 5, 6].map((i) => {
            const d = ((t - SOFA) * 1.4 + i * 0.14) % 1;
            return <Caixa key={i} p={[0.6 + Math.cos(i * 2.4) * d * 2, 1.4 + d * 2.2, -1.2 + Math.sin(i * 2.4) * d]} s={[0.25, 0.25, 0.25]} cor="#ffffff" contorno={0} sombra={false} opacidade={1 - d} />;
          })}
        </>
      ),
    };
  }

  if (k === 4) {
    // o T-rex pega a picanha do churrasco do pai
    const chega = prog(t, TREX4 - 0.3, TREX4 + 0.6);
    const pegou = t >= PICANHA + 0.15;
    return {
      mundo: "patio",
      cam: { pos: lerp3([2.4, 4.6, 14.0], [2.4, 4.4, 12.6], prog(t, S[4], S[5])), alvo: [2.0, 3.2, 0] },
      atores: [{ tipo: "pai", a: DE_PE([0.2, 0, -0.5], 0.5, { social: true, avental: true, expr: pegou ? "medo" : "feliz",
        bracoD: pegou ? [-2.6, 0.4] : [-1.2 + Math.sin(t * 9) * 0.3, 0.2], bracoE: pegou ? [-2.6, -0.4] : [0, -0.7],
        segura: pegou ? undefined : <Espeto3D rot={[PI / 2, 0, 0]} esc={0.6} pos={[0, 0, 0.6]} /> }) }],
      objs: (
        <>
          <Churrasqueira3D t={t} pos={[0.2, 0, 0.7]} dourada={1} />
          <group position={lerp3([10, 0, -0.5], [3.6, 0, -0.5], chega)} rotation={[0, -PI / 2, 0]}>
            <Dinossauro3D t={t} esc={1.1} boca={pegou ? 0.2 : rugido(t, TREX4)} andando={chega < 1 ? 1 : 0} />
            {pegou && <Espeto3D pos={[0, 4.4, 3.0]} rot={[0, 0, PI / 2]} esc={0.9} />}
          </group>
          {pegou && [0, 1].map((i) => <Caixa key={i} p={[0.0 + i * 0.4, 2.4 - ((t * 2 + i * 0.5) % 1), 0.0]} s={[0.1, 0.18, 0.1]} cor="#7fd3ff" contorno={0} sombra={false} />)}
        </>
      ),
    };
  }

  if (k === 5) {
    // educação física: fugir do T-rex
    const alunos = [0, 1, 2, 3].map((i) => ({ tipo: "filho" as Tipo, a: { pos: [1.0 + i * 1.4, Math.abs(Math.sin(t * 20 + i)) * 0.15, (i % 2) * 0.8 - 0.4] as V3,
      rotY: PI / 2, expr: "medo" as Expr, camisaCor: i === 0 ? undefined : FIGS[(i - 1) % 3].cam, boneCor: i === 0 ? undefined : FIGS[(i - 1) % 3].bone,
      calcaCor: i === 0 ? undefined : "#33384a", ...corre(t + i) } }));
    return {
      mundo: "rua", desloc: dt * 12,
      cam: { pos: [1.2, 4.6, 15.5], alvo: [0.8, 2.8, 0], fov: 50 },
      atores: alunos,
      objs: <group position={[-4.2, 0, 0]} rotation={[0, PI / 2, 0]}><Dinossauro3D t={t} esc={1.1} boca={rugido(t, FUGIR)} andando={1} /></group>,
    };
  }

  if (k === 6) {
    // o pterodátilo rouba o seu lanche
    const ataque = prog(t, ROUBAM - 0.4, ROUBAM + 0.1);
    const foge = prog(t, ROUBAM + 0.1, S[7]);
    const roubou = t >= ROUBAM + 0.1;
    const pt = roubou ? lerp3([1.3, 2.6, 0.6], [7, 9, -4], foge) : lerp3([-7, 9, -4], [1.3, 2.6, 0.6], ataque);
    return {
      mundo: "patio",
      cam: { pos: lerp3([0.8, 3.4, 8.8], [0.8, 3.3, 8.0], prog(t, S[6], S[7])), alvo: [0.8, 2.8, 0] },
      atores: [{ tipo: "filho", a: DE_PE([0.6, 0, 0], 0, { expr: roubou ? "medo" : "feliz", bracoD: [-1.4, 0.2],
        segura: roubou ? undefined : <Sanduiche3D rot={[1.4, 0, 0]} pos={[0, 0, 0.15]} esc={1.1} /> }) }],
      objs: (
        <>
          {t >= PTERO - 0.6 && <Pterodatilo3D t={t} pos={pt} rotY={roubou ? PI / 2 : PI / 2} esc={1.4} />}
          {roubou && <Sanduiche3D pos={[pt[0], pt[1] - 0.3, pt[2] + 0.5]} esc={1.1} />}
        </>
      ),
    };
  }

  if (k === 7) {
    // braço curto: não alcança o controle
    const estica = Math.sin(t * 6) * 0.12;
    return {
      mundo: "patio",
      cam: t < CONTROLE - 0.2 ? { pos: [12.5, 5.0, 0.6], alvo: [0.2, 2.8, 0.1], fov: 50 } : { pos: [9.0, 3.2, 0.0], alvo: [0.0, 2.0, -0.4], fov: 50 },
      atores: [],
      objs: (
        <>
          <Sofa3D pos={[0, 0, -1.4]} />
          <Controle3D pos={[0, 1.0, -1.1]} rot={[0, 0.3, 0]} esc={0.8} />
          <group position={[0.4, 0, 1.6]} rotation={[0.35 + estica, PI, 0]}>
            <Dinossauro3D t={t} esc={1.0} boca={t >= BRACO ? 0.5 : 0.15} />
          </group>
        </>
      ),
    };
  }

  if (k === 8) {
    // ele invade a sua casa
    const entra = prog(t, S[8], INVADE + 0.5);
    return {
      mundo: "patio",
      cam: { pos: lerp3([3.0, 3.6, 11.0], [3.0, 3.4, 10.0], prog(t, S[8], S[9])), alvo: [0, 3.0, -1] },
      atores: [
        { tipo: "pai", a: DE_PE([1.6, 0, 0.6], -0.4, { expr: "medo", bracoE: [-2.6, -0.5], bracoD: [-2.6, 0.5] }) },
        { tipo: "filho", a: DE_PE([2.8, 0, 0.2], -0.5, { expr: "medo", bracoE: [-2.6, -0.5], bracoD: [-2.6, 0.5] }) },
        { tipo: "mae", a: DE_PE([0.6, 0, 1.4], -0.3, { coroa: true, expr: "medo" }) },
      ],
      objs: (
        <>
          <group position={lerp3([-12, 0, -1.2], [-3.4, 0, -1.2], entra)} rotation={[0, PI / 2, 0]}>
            <Dinossauro3D t={t} esc={1.3} boca={rugido(t, INVADE)} andando={entra < 1 ? 1 : 0} pisao={entra >= 1 ? 0 : Math.abs(Math.sin(t * 7))} />
          </group>
          {t >= INVADE && <Poeira t={t} t0={INVADE + 0.4} pos={[-3.4, 0, -1.2]} />}
        </>
      ),
    };
  }

  if (k === 9) {
    // todo mundo corre, menos a sua mãe
    const fugindo = Math.max(0, t - S[9]) * 4;
    return {
      mundo: "patio",
      cam: t < MENOS - 0.04 ? { pos: [3.0, 3.6, 11.5], alvo: [2.0, 2.4, 0] } : { pos: lerp3([2.4, 2.8, 6.6], [2.2, 2.7, 5.8], prog(t, MENOS, S[10])), alvo: [0.6, 2.4, 0.6] },
      atores: [
        { tipo: "pai", a: DE_PE([1.6 + fugindo, 0, 0.6], PI / 2, { expr: "medo", ...corre(t) }) },
        { tipo: "filho", a: DE_PE([2.8 + fugindo, 0, 0.2], PI / 2, { expr: "medo", ...corre(t + 1) }) },
        { tipo: "avo", a: DE_PE([0.4 + fugindo * 1.2, 0.22, -1.4], PI / 2, { expr: "medo", pernaE: -PI / 2, pernaD: -PI / 2 }) },
        { tipo: "mae", a: DE_PE([0.6, 0, 1.4], -PI / 2, { coroa: true, expr: "brava", bracoE: [-1.45, 0.95], bracoD: [-1.45, -0.95] }) },
      ],
      objs: (
        <>
          <group position={[0.4 + fugindo * 1.2, 0, -1.5]} rotation={[0, PI / 2, 0]}><CadeiraBalanco3D /></group>
          <group position={[-3.4, 0, -1.2]} rotation={[0, PI / 2, 0]}><Dinossauro3D t={t} esc={1.3} boca={0.5} /></group>
        </>
      ),
    };
  }

  if (k === 10 || k === 11) {
    // "limpa o pé antes de entrar!" e o T-rex obedece, com medo do chinelo
    const obedece = k === 11;
    const encolhe = obedece ? 1.3 - 0.45 * prog(t, LIMPA2, CHINELO) : 1.3;
    const recua = obedece ? prog(t, CHINELO, S[12]) * 4 : 0;
    const passo = obedece && t >= LIMPA2 ? Math.abs(Math.sin(t * 8)) : 0;
    return {
      mundo: "patio",
      cam: obedece ? { pos: lerp3([2.6, 3.4, 9.6], [2.4, 3.2, 8.8], prog(t, S[11], S[12])), alvo: [-1.2, 2.4, -0.2] }
        : { pos: lerp3([3.6, 2.4, 7.0], [3.4, 2.4, 6.2], prog(t, S[10], S[11])), alvo: [-1.4, 3.4, -0.6], fov: 52 },
      atores: [{ tipo: "mae", a: DE_PE([0.6, 0, 1.4], -PI / 2, { coroa: true, expr: "brava", olhos: 1, boca: !obedece && t >= LIMPA ? 0.5 + 0.5 * Math.abs(Math.sin(t * 14)) : 0,
        bracoE: [0, -0.7], bracoD: [-2.8, 0.2], segura: <Chinelo3D rot={[PI / 2, 0, 0]} esc={0.85} brilho={1} /> }) }],
      objs: (
        <>
          <group position={[-3.4 - recua, 0, -1.2]} rotation={[0, PI / 2, 0]}>
            <Dinossauro3D t={t} esc={encolhe} boca={obedece ? 0.1 : 0.6} pisao={passo} />
          </group>
          {obedece && <Caixa p={[-3.0, 0.03, -1.2]} s={[2.2, 0.06, 1.6]} cor="#9aa5b1" contorno={0.03} />}
          {obedece && t >= LIMPA2 && <Brilhos t={t} pos={[-3.4 - recua, 4.5 * encolhe / 1.3, -1.2]} raio={0.8} n={5} cor="#7fd3ff" />}
        </>
      ),
    };
  }

  // 12: a família com o raptor + o T-rex na câmera (loop)
  const tchau = Math.sin(t * 12) * 0.35;
  const volta = t >= FIM;
  const v = prog(t, FIM, FIM + 0.45);
  return {
    mundo: "patio",
    cam: volta ? { pos: [0, 4.6, 7.0], alvo: [0, 4.4, 0] } : { pos: lerp3([0, 2.9, 11.0], [0, 2.8, 10.0], prog(t, S[12], DINOS_3D_DUR)), alvo: [0, 2.0, -0.6] },
    atores: volta ? [] : [
      { tipo: "mae", a: DE_PE([-2.0, 0, -0.6], 0.35, { coroa: true, bracoE: [-2.6, -0.3 + tchau] }) },
      { tipo: "pai", a: DE_PE([2.0, 0, -0.6], -0.35, { bracoD: [-2.6, 0.3 - tchau] }) },
      { tipo: "filho", a: DE_PE([0, 0, 0.2], 0, { bracoD: [-2.6, 0.3 - tchau], bracoE: [-1.2, -0.2] }) },
    ],
    objs: volta ? <Dinossauro3D t={t} pos={lerp3([0, 0, -6], [0, 0, -1.2], v)} esc={1.25} boca={rugido(t, FIM + 0.2)} andando={1 - v} />
      : <Raptor3D t={t} pos={[0.8, 0, 1.2]} rotY={-0.3} esc={0.7} pulando={1} boca={0.3} />,
  };
};

const Personagem: React.FC<{ a: Ator; tipo: Tipo }> = ({ a, tipo }) => {
  if (a.some) return null;
  return (
    <group position={a.pos} rotation={a.rot ?? [0, 0, 0]} scale={a.amassa ?? [1, 1, 1]}>
      <Boneco3D tipo={tipo} rotY={a.rotY} esc={a.esc} expr={a.expr} bracoE={a.bracoE} bracoD={a.bracoD} pernaE={a.pernaE} pernaD={a.pernaD}
        cabeca={a.cabeca} olhosBrilho={a.olhos ?? 0} segura={a.segura} seguraE={a.seguraE} boca={a.boca} coroa={a.coroa}
        social={a.social} avental={a.avental} camisaCor={a.camisaCor} boneCor={a.boneCor} calcaCor={a.calcaCor} />
    </group>
  );
};

const TREMORES: [number, number, number][] = [[0.6, 0.6, 0.25], [ERROU + 0.4, 0.4, 0.15], [TREX4, 0.4, 0.12], [FUGIR, 0.5, 0.1],
  [INVADE + 0.4, 0.6, 0.3], [CHINELO, 0.3, 0.1], [FIM + 0.6, 0.4, 0.25]];

const Cena3D: React.FC = () => {
  const { t } = useT();
  const e = estado(t);
  const tr = soma([0, 0, 0], ...TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp)));
  return (
    <>
      <Camera pos={soma(e.cam.pos, tr)} alvo={e.cam.alvo} fov={e.cam.fov ?? 50} roll={e.cam.roll ?? 0} />
      <ambientLight intensity={e.mundo === "espaco" ? 0.45 : 0.55} />
      <hemisphereLight args={["#cfefff", e.mundo === "espaco" ? "#30335a" : "#7fbf5a", 0.7]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} />
      {e.mundo === "patio" && <Mundo3D t={t} />}
      {e.mundo === "rua" && <Rua3D desloc={e.desloc ?? 0} />}
      {e.mundo === "espaco" && <Estrelas3D />}
      {e.atores.map((x, i) => <Personagem key={i} a={x.a} tipo={x.tipo} />)}
      {e.objs}
    </>
  );
};

// ── camada 2D (só o que a legenda não diz) ─────────────────────────────────
const BANNERS: Banner[] = [
  { t0: EXTINTOS, t1: S[1], txt: "🦖 RAWR!", y: 240, tam: 130, cor: COR.verde },
  { t0: S[1] + 0.2, t1: S[2], txt: "66 MILHÕES DE ANOS ATRÁS", y: 240, tam: 62, cor: "#ffffff" },
  { t0: POUCO, t1: S[2], txt: "ERROU! 😅", y: 360, tam: 100 },
  { t0: PESCOCO - 0.3, t1: S[3], txt: "🚌 ESCOLAR", y: 240, tam: 110 },
  { t0: SOFA, t1: S[4], txt: "🛋 SOFÁ: 0 × RAPTOR: 1", y: 240, tam: 66, cor: "#ffffff" },
  { t0: FUGIR, t1: S[6], txt: "⏱ ED. FÍSICA", y: 240, tam: 100 },
  { t0: CONTROLE, t1: S[8], txt: "🦖💪 NÃO ALCANÇA", y: 240, tam: 80, cor: "#ffffff" },
  { t0: MENOS, t1: S[10], txt: "MENOS A MÃE 😐", y: 240, tam: 96 },
  { t0: CHINELO, t1: S[12], txt: "🩴 RESPEITA A MÃE", y: 240, tam: 90, cor: COR.amarelo },
  { t0: ESTIMACAO - 0.3, t1: DINOS_3D_DUR, txt: "QUAL DINOSSAURO DE ESTIMAÇÃO?", y: 240, tam: 56, cor: "#ffffff" },
  { t0: COMENTA, t1: DINOS_3D_DUR, txt: "COMENTA AÍ 👇", y: 360, tam: 112 },
];

const SONS: { t: number; s: string; v: number }[] = [
  { t: 0, s: "whoosh", v: 0.5 }, { t: 0.6, s: "impacto", v: 0.8 }, { t: 0.62, s: "grave", v: 0.6 }, { t: EXTINTOS, s: "erro", v: 0.35 },
  { t: S[1] + 0.3, s: "whoosh", v: 0.55 }, { t: ERROU + 0.3, s: "aura", v: 0.4 }, { t: POUCO, s: "plim", v: 0.5 },
  ...[0, 1, 2, 3].map((i) => ({ t: S[2] + 0.2 + i * 0.6, s: "grave", v: 0.3 })), { t: PESCOCO, s: "buzina", v: 0.4 },
  { t: VELOCI, s: "pop", v: 0.4 }, { t: SOFA, s: "impacto", v: 0.45 }, { t: SOFA + 0.1, s: "pop", v: 0.4 },
  { t: TREX4, s: "grave", v: 0.55 }, { t: PICANHA + 0.15, s: "pop", v: 0.5 }, { t: PICANHA + 0.3, s: "erro", v: 0.35 },
  { t: FUGIR, s: "grave", v: 0.5 }, { t: FUGIR + 0.1, s: "whoosh", v: 0.45 },
  { t: PTERO - 0.3, s: "whoosh", v: 0.5 }, { t: ROUBAM + 0.1, s: "pop", v: 0.5 }, { t: ROUBAM + 0.15, s: "piu", v: 0.45 },
  { t: BRACO, s: "erro", v: 0.35 }, { t: CONTROLE, s: "risco", v: 0.4 },
  ...[0, 1, 2].map((i) => ({ t: INVADE - 0.2 + i * 0.3, s: "grave", v: 0.55 })), { t: INVADE + 0.4, s: "impacto", v: 0.85 },
  { t: S[9], s: "whoosh", v: 0.5 }, { t: MENOS, s: "risco", v: 0.45 },
  { t: LIMPA, s: "martelo", v: 0.5 }, { t: ENTRAR, s: "impacto", v: 0.45 },
  { t: LIMPA2, s: "tecla", v: 0.35 }, { t: CHINELO, s: "plim", v: 0.5 },
  { t: ESTIMACAO, s: "pop", v: 0.4 }, { t: COMENTA, s: "pop", v: 0.5 }, { t: FIM, s: "whoosh", v: 0.5 }, { t: FIM + 0.55, s: "impacto", v: 0.8 }, { t: FIM + 0.57, s: "grave", v: 0.6 },
];

export const ImaginaSoDinos3D: React.FC = () => {
  const { t } = useT();
  const tr = TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp * 100)).reduce((x, y) => soma(x, y), [0, 0, 0] as V3);
  const e = estado(t);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4fb6ff 0%, #bfe7ff 70%)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1b1f4a 0%, #070814 75%)", opacity: e.mundo === "espaco" ? 1 : 0 }} />
      <ThreeCanvas width={1080} height={1920} shadows flat camera={{ fov: 50, position: [0, 2.2, 8], near: 0.1, far: 300 }}>
        <Cena3D />
      </ThreeCanvas>
      <AbsoluteFill style={{ transform: `translate(${tr[0]}px, ${tr[1]}px)` }}>
        <Marca3D />
        {BANNERS.map((b, i) => <Faixa3D key={i} {...b} />)}
        <Balao3D t0={LIMPA - 0.1} t1={S[11]} txt="Limpa o pé antes de entrar! 🩴" x={540} y={520} tam={48} letra={0.03} />
        <Legenda3D fala={F} fim={DINOS_3D_DUR} />
      </AbsoluteFill>
      <Flash picos={[0.6, ERROU + 0.4, INVADE + 0.4, DINOS_3D_DUR - 0.05]} />

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
