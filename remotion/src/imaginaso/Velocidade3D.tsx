import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import tl from "../../public/videos/imagina-so-04-velocidade-dobra-a-cada-di-mwuj20v9/timeline.json";
import { COR, mola, rampa, useT } from "./Bloco";
import { Boneco3D, Brilhos, Camera, Chinelo3D, type Expr, Mundo3D, Poeira, tremor } from "./Bloco3D";
import { Poof3D } from "./Objetos3D";
import {
  Anel3D, Aviao3D, Cacos3D, CarroCorrida3D, ConeSom3D, Estrelas3D, Guepardo3D, Lua3D, Nuvens3D, Onibus3D, Rastro3D, Riscos3D, Rua3D, Terra3D,
} from "./Cenarios3D";
import { Faixa3D, Flash, Legenda3D, Marca3D, montarFala, type Banner } from "./Camada2D";

// Imagina Só #04: "E se a sua velocidade dobrasse a cada dia?" — formato de escalada
// (DIA N + velocímetro), no 3D de bloco com o filho; a mãe e o chinelo fecham a piada.

const PASTA = "videos/imagina-so-04-velocidade-dobra-a-cada-di-mwuj20v9/";
const F = montarFala(tl, { vel: 1.15, inicio: 0.35 });
const { S, W } = F;
const PI = Math.PI;

type V3 = [number, number, number];
type Ator = {
  pos: V3; rotY?: number; esc?: number; expr?: Expr; bracoE?: [number, number]; bracoD?: [number, number];
  pernaE?: number; pernaD?: number; cabeca?: [number, number]; olhos?: number; segura?: React.ReactNode; rot?: V3; coroa?: boolean; some?: boolean;
};
type Plano = { pos: V3; alvo: V3; fov?: number; roll?: number };
type Mundo = "rua" | "ceu" | "espaco" | "patio";

// ── marcos ───────────────────────────────────────────────────────────────
const DOBR = W(0, "dobrasse");
const ONIBUS = W(2, "ônibus"), GUEP = W(3, "guepardo"), CORRIDA = W(4, "corrida");
const QUEBRA = W(5, "quebra"), BUM = W(5, "bum");
const JANELAS = W(6, "janelas"), ESTOURAM = W(6, "estouram"), MAE_T = W(6, "mãe");
const AVIAO = W(7, "avião");
const BRASIL = W(8, "brasil"), MEIA = W(8, "meia");
const ESCAPA = W(9, "escapa"), TERRA = W(9, "terra");
const LUA = W(10, "lua"), MINUTOS = W(10, "minutos");
const LUZ = W(11, "luz"), IMPOS = W(11, "impossível");
const ALCANCA = W(12, "alcança"), CHIN = W(12, "chinelo");
const PARARIA = W(13, "pararia"), COMENTA = W(13, "comenta"), FIM = W(13, "aí") + 0.35;
export const VEL_3D_DUR = Math.max(F.fim + 0.2, FIM + 0.5);
const JOGA_MAE = S[12] + 0.7; // até aqui a mãe arremessa do pátio; depois é o espaço

// dia e velocidade (km/h) mostrados em cada cena (velocidade do dia N = 5 × 2^(N−1))
const HUD: ([number, number] | null)[] = [null, [1, 5], [4, 40], [6, 160], [7, 320], [9, 1280], [9, 1280], [10, 2560], [12, 10240],
  [14, 40960], [21, 5242880], [29, 1342177280], [29, 1342177280], null];
const LINHAS = [1, 0, 0.3, 0.5, 0.7, 1, 0.1, 0.8, 0.4, 0.6, 0, 1, 0.6, 0];

const ease = Easing.out(Easing.cubic);
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as V3;
const soma = (...vs: number[][]) => vs.reduce((a, b) => a.map((v, i) => v + b[i])) as V3;
const prog = (t: number, a: number, b: number) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const cenaDe = (t: number) => S.reduce((k, s, i) => (t >= s - 0.04 ? i : k), 0);

/** pose de corrida para +x; `f` = passadas por segundo (rad/s), `inclina` joga o corpo para frente */
const corre = (t: number, f: number, amp = 0.9, inclina = 0.15): Partial<Ator> => ({
  rotY: PI / 2, rot: [0, 0, -inclina],
  pernaE: Math.sin(t * f) * amp, pernaD: -Math.sin(t * f) * amp,
  bracoE: [-Math.sin(t * f) * amp, -0.15], bracoD: [Math.sin(t * f) * amp, 0.15],
});
/** voando de "super-herói" para +x (cara para baixo, braços à frente) */
const voaX: Partial<Ator> = { rotY: PI / 2, rot: [0, 0, -PI / 2], bracoE: [-2.95, -0.15], bracoD: [-2.95, 0.15], pernaE: 0, pernaD: 0, expr: "feliz" };
const CAM_RUA: Plano = { pos: [1.5, 2.6, 11], alvo: [0.6, 2.5, -0.6] };

type Estado = { cam: Plano; mundo: Mundo; atores: { a: Ator; tipo: "mae" | "filho" }[]; objs?: React.ReactNode; desloc?: number; quebrado?: boolean };

const estado = (t: number): Estado => {
  const k = cenaDe(t);
  const dt = t - S[k];

  if (k === 0) {
    // borrão passando na câmera e depois a pose de largada
    const passa = t < 0.55;
    const x = interpolate(t, [0, 0.5], [-30, 30], clamp);
    return {
      mundo: "rua", desloc: t * 3,
      cam: passa ? { pos: [0, 1.8, 6.5], alvo: [0, 1.6, 0] } : { pos: lerp3([3.6, 2.0, 8.2], [3.0, 2.0, 7.0], prog(t, 0.55, S[1])), alvo: [0.3, 2.0, 0.4], fov: 48, roll: 0.06 },
      atores: [{ tipo: "filho", a: passa ? { pos: [x, 0, 0.4], ...corre(t, 30, 1.1, 0.3) }
        : { pos: [0, 0, 0.4], rotY: PI / 2, rot: [0, 0, -0.35], expr: "brava", pernaE: -0.8, pernaD: 0.6, bracoE: [0.9, -0.2], bracoD: [-1.0, 0.2] } }],
      objs: (
        <>
          {passa && <Rastro3D pos={[x, 0, 0.4]} comp={14} />}
          <Anel3D t={t} t0={0.25} pos={[0, 1.6, 0.4]} />
          {t >= DOBR && <Brilhos t={t} pos={[0, 1.6, 0.4]} raio={1.4} n={10} cor="#bfe9ff" />}
        </>
      ),
    };
  }

  if (k <= 5) {
    const vis = [0, 1.3, 9, 16, 24, 34][k];
    const freq = [0, 6, 16, 22, 28, 34][k];
    const amp = k === 1 ? 0.45 : 1.0;
    const filho: Ator = { pos: [0, k >= 2 ? Math.abs(Math.sin(t * freq)) * 0.12 : 0, 0.4], expr: k === 1 ? "feliz" : k >= 4 ? "brava" : "feliz", ...corre(t, freq, amp, k === 1 ? 0 : 0.12 + k * 0.03) };
    let cam = CAM_RUA;
    let objs: React.ReactNode = null;
    if (k === 2) {
      const bx = 3.5 - dt * 2.4;
      objs = <Onibus3D pos={[bx, 0, -1.5]} rodas={t * 8} />;
      cam = { pos: [0.8, 3.2, 12.4], alvo: [0.4, 2.6, -0.8] };
    } else if (k === 3) {
      objs = <Guepardo3D pos={[2.0 - dt * 2.0, 0, -1.4]} passo={t * 20} esc={1.2} />;
      cam = { pos: lerp3([1.6, 2.2, 10.4], [1.3, 2.2, 9.4], prog(t, S[3], S[4])), alvo: [0.6, 2.3, -0.5] };
    } else if (k === 4) {
      const cx = interpolate(t, [S[4], CORRIDA, S[5]], [-1.2, 0.6, -2.5], clamp);
      objs = <CarroCorrida3D pos={[cx, 0, -1.4]} rodas={t * 30} />;
      cam = { pos: [1.0, 1.7, 10], alvo: [0.3, 2.2, -0.6], fov: 52, roll: -0.04 };
    } else if (k === 5) {
      const cone = rampa(t, QUEBRA - 0.1, QUEBRA + 0.3);
      cam = t < BUM - 0.04 ? { pos: [1.8, 2.4, 9.6], alvo: [0.4, 2.4, 0] } : { pos: lerp3([4, 3.2, 13], [4.5, 3.4, 14], prog(t, BUM, S[6])), alvo: [0, 1.8, -1] };
      objs = (
        <>
          <ConeSom3D pos={[0.2, 1.6, 0.4]} forca={cone} t={t} />
          <Anel3D t={t} t0={BUM} pos={[0, 1.6, 0.4]} dur={0.8} />
          <Anel3D t={t} t0={BUM + 0.12} pos={[-0.5, 1.6, 0.4]} dur={0.8} cor="#bfe9ff" />
          <Rastro3D pos={[0, 0, 0.4]} comp={10} />
        </>
      );
    }
    if (k >= 3 && k !== 5) objs = <>{objs}<Rastro3D pos={[0, 0, 0.4]} comp={2 + k * 1.2} op={0.4} /></>;
    return { mundo: "rua", desloc: dt * vis + k * 13, cam, atores: [{ tipo: "filho", a: filho }], objs };
  }

  if (k === 6) {
    // janelas estouram; a mãe aparece brava
    const quebrado = t >= ESTOURAM;
    const passa = interpolate(t, [S[6], S[6] + 0.35], [-30, 30], clamp);
    return {
      mundo: "rua", desloc: 0, quebrado,
      cam: t < MAE_T - 0.04 ? { pos: lerp3([0.6, 3.0, 6.0], [0.4, 3.1, 4.6], prog(t, S[6], MAE_T)), alvo: [0, 3.0, -5.5] }
        : { pos: lerp3([0.6, 2.4, 4.4], [0.5, 2.4, 3.6], prog(t, MAE_T, S[7])), alvo: [0, 2.4, -3.6], fov: 48 },
      atores: [
        { tipo: "filho", a: { pos: [passa, 0, 0.4], ...corre(t, 34, 1.0, 0.3), some: t > S[6] + 0.4 } },
        { tipo: "mae", a: { pos: [0, 0, -3.9], esc: 1.05, coroa: true, expr: "brava", olhos: 1, bracoE: [0, -0.7], bracoD: [-2.7, 0.2],
          segura: <Chinelo3D rot={[PI / 2, 0, 0]} esc={0.75} brilho={0.5} />, some: t < MAE_T - 0.05 } },
      ],
      objs: (
        <>
          {t < S[6] + 0.4 && <Rastro3D pos={[passa, 0, 0.4]} comp={14} />}
          {[-9, 0, 9].map((hx, i) => [-2, 2].map((wx) => (
            <Cacos3D key={`${hx}${wx}`} t={t} t0={ESTOURAM - 0.1 + i * 0.08 + (wx > 0 ? 0.05 : 0)} pos={[hx + wx, 3.3, -5.4]} />
          )))}
          <Poof3D t={t} t0={MAE_T - 0.05} pos={[0, -0.2, -3.6]} />
        </>
      ),
    };
  }

  if (k === 7) {
    // no céu, passando um avião
    return {
      mundo: "ceu", desloc: dt * 30,
      cam: { pos: lerp3([2.2, 1.8, 12.5], [1.9, 1.6, 11.2], prog(t, S[7], S[8])), alvo: [1.5, 1.0, -1.5] },
      atores: [{ tipo: "filho", a: { pos: [0, 0, 0.5], ...voaX } }],
      objs: (
        <>
          <Aviao3D pos={[7 - dt * 4.5, -2.6, -3.5]} esc={1.1} />
          <Rastro3D pos={[-1.6, -1.0, 0.5]} comp={8} />
        </>
      ),
    };
  }

  if (k === 8) {
    // atravessando o Brasil: arco de luz sobre a Terra
    const arco = rampa(t, BRASIL - 0.3, MEIA + 0.2) * PI * 0.7;
    return {
      mundo: "espaco",
      cam: { pos: lerp3([0, 2.0, 17], [0, 1.8, 15.5], prog(t, S[8], S[9])), alvo: [0, 1.6, 0] },
      atores: [],
      objs: (
        <>
          <Terra3D raio={3} giro={0.4 + dt * 0.1} brasil />
          {arco > 0.01 && (
            <mesh rotation={[0.2, 0, -0.6]}>
              <torusGeometry args={[3.9, 0.16, 8, 60, arco]} />
              <meshBasicMaterial color={COR.amarelo} />
            </mesh>
          )}
        </>
      ),
    };
  }

  if (k === 9) {
    // escapa da gravidade: a Terra fica para trás
    return {
      mundo: "espaco",
      cam: { pos: [2.6, 2.2, 10.5], alvo: [0, 0.6, 0] },
      atores: [{ tipo: "filho", a: { pos: [0, 0, 0], expr: "feliz", bracoE: [-2.95, -0.1], bracoD: [-2.95, 0.1] } }],
      objs: (
        <>
          <Terra3D pos={[0, -8.5 - dt * 3, -4]} raio={7} giro={dt * 0.2} />
          <group rotation={[0, 0, PI / 2]}><Rastro3D pos={[0, 0, 0]} comp={6} op={0.35} /></group>
          {t >= ESCAPA && <Brilhos t={t} pos={[0, 1.6, 0]} raio={1.4} n={10} cor="#bfe9ff" />}
        </>
      ),
    };
  }

  if (k === 10) {
    // pouso na Lua
    const y = interpolate(t, [S[10], LUA + 0.1], [9, 0], { ...clamp, easing: Easing.in(Easing.quad) });
    const pousou = t >= LUA + 0.1;
    return {
      mundo: "espaco",
      cam: { pos: lerp3([3.2, 2.4, 8.6], [2.8, 2.2, 7.6], prog(t, S[10], S[11])), alvo: [0, 1.4, 0] },
      atores: [{ tipo: "filho", a: { pos: [0, y, 0], rotY: 0.3, expr: "feliz", bracoE: pousou ? [-2.7, -0.4] : [-2.95, -0.1], bracoD: pousou ? [-2.7, 0.4] : [-2.95, 0.1] } }],
      objs: (
        <>
          <Lua3D pos={[0, -5, 0]} raio={5} />
          <Terra3D pos={[-9, 7, -28]} raio={2.4} giro={t * 0.2} />
          <Poeira t={t} t0={LUA + 0.1} pos={[0, 0, 0]} />
        </>
      ),
    };
  }

  if (k === 11) {
    // mais rápido que a luz: túnel de riscos
    return {
      mundo: "espaco",
      cam: { pos: [0, 2.4, 9.5 + Math.sin(t * 40) * 0.03], alvo: [0, 2.2, 0], fov: 55 },
      atores: [{ tipo: "filho", a: { pos: [0, 0, 0], rot: [0.45, 0, 0], expr: "brava", bracoE: [-1.7, -0.25], bracoD: [-1.7, 0.25], pernaE: 0.5, pernaD: 0.2 } }],
      objs: (
        <>
          <Riscos3D t={t} vel={70} />
          {t >= LUZ && <Brilhos t={t} pos={[0, 1.6, 0.4]} raio={1.8} n={12} cor="#fff6c2" />}
        </>
      ),
    };
  }

  if (k === 12) {
    if (t < JOGA_MAE) {
      // a mãe arremessa o chinelo para o céu
      const sobe = prog(t, S[12] + 0.25, JOGA_MAE);
      return {
        mundo: "patio",
        cam: { pos: [0.8, 1.2, 5.4], alvo: [0, 3.2, -1], fov: 55 },
        atores: [{ tipo: "mae", a: { pos: [0, 0, -1], esc: 1.05, coroa: true, expr: "brava", olhos: 1.2, bracoE: [0, -0.7],
          bracoD: [t < S[12] + 0.25 ? -1.6 : -3.05, 0.15], segura: t < S[12] + 0.25 ? <Chinelo3D rot={[PI / 2, 0, 0]} esc={0.75} brilho={0.8} /> : undefined } }],
        objs: t >= S[12] + 0.25 ? <Chinelo3D pos={[0.9, 3.2 + sobe * 14, -0.6]} rot={[t * 20, 0, 0]} esc={1.2} brilho={1} /> : null,
      };
    }
    // no espaço: o chinelo alcança e acerta
    const cx = interpolate(t, [JOGA_MAE, CHIN], [-22, 0.9], { ...clamp, easing: Easing.in(Easing.quad) });
    const acertou = t >= CHIN;
    return {
      mundo: "espaco",
      cam: { pos: [1.6, 2.0, 11.5], alvo: [1.2, 1.0, 0] },
      atores: [{ tipo: "filho", a: { pos: [0, 0, 0.5], ...voaX, expr: acertou ? "medo" : "feliz", rot: [acertou ? (t - CHIN) * 10 : 0, 0, -PI / 2] } }],
      objs: (
        <>
          {!acertou && <Chinelo3D pos={[cx, 0.2, 0.5]} rot={[0, t * 30, PI / 2]} esc={1.4} brilho={1} />}
          {!acertou && <Rastro3D pos={[cx - 0.4, -0.8, 0.5]} comp={10} cor={COR.amarelo} />}
          {acertou && <Brilhos t={t} pos={[1.4, 0, 0.5]} raio={1.2} n={8} cor={COR.amarelo} />}
          <Riscos3D t={t} vel={20} n={40} />
        </>
      ),
    };
  }

  // 13: caiu de volta no pátio; a mãe acena; borrão sai correndo (volta ao começo)
  const cai = interpolate(t, [S[13], S[13] + 0.3], [12, 0.3], { ...clamp, easing: Easing.in(Easing.quad) });
  const sai = t >= FIM;
  const sx = interpolate(t, [FIM, FIM + 0.4], [0.8, 30], clamp);
  return {
    mundo: "patio",
    cam: { pos: lerp3([0, 2.6, 8.4], [0, 2.5, 7.6], prog(t, S[13], VEL_3D_DUR)), alvo: [0, 1.2, -0.6] },
    atores: [
      { tipo: "mae", a: { pos: [-1.5, 0, -0.8], rotY: 0.4, esc: 1.05, coroa: true, expr: "feliz", bracoE: [-2.6, -0.3 + Math.sin(t * 12) * 0.35], bracoD: [-2.6, 0.15],
        segura: <Chinelo3D rot={[PI / 2, 0, 0]} esc={0.75} brilho={0.6} /> } },
      { tipo: "filho", a: sai ? { pos: [sx, 0, 0.6], ...corre(t, 30, 1.1, 0.3) } : { pos: [0.8, cai, -0.2], rot: [-PI / 2, 0, 0], expr: "medo" } },
    ],
    objs: (
      <>
        <Poeira t={t} t0={S[13] + 0.3} pos={[0.8, 0, -1.4]} />
        {!sai && t > S[13] + 0.3 && <Brilhos t={t} pos={[0.8, 0.9, -2.4]} raio={0.6} n={5} cor={COR.amarelo} />}
        {sai && <Rastro3D pos={[sx, 0, 0.6]} comp={14} />}
      </>
    ),
  };
};

const Personagem: React.FC<{ a: Ator; tipo: "mae" | "filho" }> = ({ a, tipo }) => {
  if (a.some) return null;
  return (
    <group position={a.pos} rotation={a.rot ?? [0, 0, 0]}>
      <Boneco3D tipo={tipo} rotY={a.rotY} esc={a.esc} expr={a.expr} bracoE={a.bracoE} bracoD={a.bracoD} pernaE={a.pernaE} pernaD={a.pernaD}
        cabeca={a.cabeca} olhosBrilho={a.olhos ?? 0} segura={a.segura} coroa={a.coroa} />
    </group>
  );
};

const TREMORES: [number, number, number][] = [[0.25, 0.4, 0.2], [BUM, 0.7, 0.35], [ESTOURAM, 0.4, 0.12], [MAE_T, 0.3, 0.1], [LUA + 0.1, 0.4, 0.15],
  [CHIN, 0.5, 0.3], [S[13] + 0.3, 0.4, 0.25], [FIM + 0.1, 0.3, 0.15]];

const Cena3D: React.FC = () => {
  const { t } = useT();
  const e = estado(t);
  const tr = soma([0, 0, 0], ...TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp)));
  const espaco = e.mundo === "espaco";
  return (
    <>
      <Camera pos={soma(e.cam.pos, tr)} alvo={e.cam.alvo} fov={e.cam.fov ?? 50} roll={e.cam.roll ?? 0} />
      <ambientLight intensity={espaco ? 0.45 : 0.55} />
      <hemisphereLight args={["#cfefff", espaco ? "#30335a" : "#7fbf5a", 0.7]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} />
      {e.mundo === "rua" && <Rua3D desloc={e.desloc ?? 0} quebrado={e.quebrado} />}
      {e.mundo === "ceu" && <Nuvens3D desloc={e.desloc ?? 0} />}
      {e.mundo === "espaco" && <Estrelas3D />}
      {e.mundo === "patio" && <Mundo3D t={t} />}
      {e.atores.map((x, i) => <Personagem key={i} a={x.a} tipo={x.tipo} />)}
      {e.objs}
    </>
  );
};

// ── camada 2D ────────────────────────────────────────────────────────────
const BANNERS: Banner[] = [
  { t0: DOBR, t1: S[1], txt: "VELOCIDADE ×2 TODO DIA", y: 430, tam: 70 },
  { t0: S[1] + 0.3, t1: S[2], txt: "🚶 NORMAL", y: 430, tam: 90, cor: "#ffffff" },
  { t0: ONIBUS - 0.2, t1: S[3], txt: "🚌 GANHOU DO ÔNIBUS", y: 430, tam: 76, cor: "#ffffff" },
  { t0: GUEP - 0.2, t1: S[4], txt: "🐆 GUEPARDO: ~110 km/h", y: 430, tam: 66, cor: "#ffffff" },
  { t0: CORRIDA - 0.3, t1: S[5], txt: "🏎 CARRO DE CORRIDA", y: 430, tam: 76, cor: "#ffffff" },
  { t0: QUEBRA, t1: S[6], txt: "🔊 BARREIRA DO SOM", y: 430, tam: 76, cor: "#7fd3ff" },
  { t0: BUM, t1: S[6], txt: "BUM!", y: 560, tam: 200, cor: COR.vermelho },
  { t0: JANELAS, t1: S[7], txt: "💥 TODAS AS JANELAS", y: 430, tam: 76, cor: "#ffffff" },
  { t0: MAE_T, t1: S[7], txt: "MÃE: 😡", y: 560, tam: 110 },
  { t0: AVIAO - 0.2, t1: S[8], txt: "✈ AVIÃO: ~900 km/h", y: 430, tam: 72, cor: "#ffffff" },
  { t0: BRASIL - 0.2, t1: S[9], txt: "🇧🇷 4.300 km", y: 430, tam: 90, cor: "#ffffff" },
  { t0: MEIA - 0.2, t1: S[9], txt: "⏱ 25 MINUTOS", y: 560, tam: 90, cor: COR.verde },
  { t0: ESCAPA, t1: S[10], txt: "🚀 VELOCIDADE DE ESCAPE", y: 430, tam: 66, cor: "#ffffff" },
  { t0: TERRA, t1: S[10], txt: "TCHAU, TERRA 👋", y: 560, tam: 84 },
  { t0: LUA, t1: S[11], txt: "🌕 384 MIL km", y: 430, tam: 84, cor: "#ffffff" },
  { t0: MINUTOS - 0.2, t1: S[11], txt: "EM 4 MINUTOS", y: 560, tam: 84, cor: COR.verde },
  { t0: LUZ, t1: S[12], txt: "⚡ MAIS RÁPIDO QUE A LUZ", y: 430, tam: 66, cor: "#ffffff" },
  { t0: IMPOS, t1: S[12], txt: "IMPOSSÍVEL ⚠", y: 560, tam: 110, cor: COR.vermelho },
  { t0: ALCANCA, t1: S[13], txt: "🩴 ALCANCE INFINITO", y: 430, tam: 80 },
  { t0: S[13] + 0.1, t1: VEL_3D_DUR, txt: "EM QUE DIA VOCÊ PARARIA?", y: 240, tam: 62, cor: "#ffffff" },
  { t0: COMENTA, t1: VEL_3D_DUR, txt: "COMENTA AÍ 👇", y: 370, tam: 112 },
];

const contorno = (px: number) => ({ WebkitTextStroke: `${px}px ${COR.linha}`, paintOrder: "stroke fill" as const });

/** "DIA N" grande + velocímetro, contando a partir da cena anterior. */
const Hud: React.FC = () => {
  const { t, fps } = useT();
  const k = cenaDe(t);
  const h = HUD[k];
  if (!h) return null;
  const ant = HUD[k - 1] ?? [h[0], h[1]];
  const q = prog(t, S[k] + 0.1, S[k] + 0.7);
  const dia = Math.round(ant[0] + (h[0] - ant[0]) * q);
  const v = Math.round(ant[1] + (h[1] - ant[1]) * q);
  const pop = mola(t, S[k] + 0.1, fps, 9, 240);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Poppins", fontWeight: 900 }}>
      <div style={{ fontSize: 150, lineHeight: 1, color: "#ffffff", transform: `scale(${0.85 + 0.15 * pop})`, textShadow: `0 12px 0 ${COR.roxo}`, ...contorno(20) }}>DIA {dia}</div>
      <div style={{ marginTop: 14, background: "#241c46", border: `8px solid ${COR.linha}`, borderRadius: 30, padding: "8px 30px", fontSize: 64, color: COR.amarelo,
        boxShadow: "0 10px 0 rgba(0,0,0,.3)" }}>⚡ {v.toLocaleString("pt-BR")} km/h</div>
    </div>
  );
};

/** Linhas de velocidade passando pela tela. */
const Linhas: React.FC = () => {
  const { t } = useT();
  const k = cenaDe(t);
  const f = LINHAS[k];
  if (f <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 16 }).map((_, i) => {
        const y = 120 + ((i * 397) % 1700);
        const w = 180 + ((i * 131) % 260);
        const x = 1200 - (((t * (2200 + i * 90)) + i * 333) % 1700);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: 8, borderRadius: 4, background: "#ffffff", opacity: 0.55 * f }} />;
      })}
    </AbsoluteFill>
  );
};

const SONS: { t: number; s: string; v: number }[] = [
  { t: 0, s: "whoosh", v: 0.7 }, { t: 0.25, s: "impacto", v: 0.6 }, { t: DOBR, s: "aura", v: 0.4 },
  ...[1, 2, 3, 4, 5, 7, 8, 9, 10, 11].map((k) => ({ t: S[k] + 0.1, s: "contagem", v: 0.3 })),
  ...[2, 3, 4, 5].map((k) => ({ t: S[k] + 0.05, s: "whoosh", v: 0.4 })),
  { t: ONIBUS, s: "pop", v: 0.4 }, { t: GUEP, s: "pop", v: 0.4 }, { t: CORRIDA, s: "whoosh", v: 0.5 },
  { t: QUEBRA, s: "aura", v: 0.4 }, { t: BUM, s: "impacto", v: 0.95 }, { t: BUM + 0.05, s: "impacto", v: 0.6 },
  { t: S[6], s: "whoosh", v: 0.5 }, { t: ESTOURAM, s: "erro", v: 0.4 }, { t: ESTOURAM + 0.05, s: "pop", v: 0.4 }, { t: MAE_T - 0.05, s: "pop", v: 0.55 },
  { t: AVIAO, s: "whoosh", v: 0.5 }, { t: BRASIL, s: "plim", v: 0.4 }, { t: MEIA, s: "plim", v: 0.4 },
  { t: ESCAPA, s: "whoosh", v: 0.55 }, { t: TERRA, s: "pop", v: 0.4 }, { t: LUA + 0.1, s: "impacto", v: 0.6 }, { t: MINUTOS, s: "plim", v: 0.4 },
  { t: LUZ, s: "aura", v: 0.5 }, { t: IMPOS, s: "erro", v: 0.45 },
  { t: S[12] + 0.25, s: "whoosh", v: 0.6 }, { t: CHIN, s: "impacto", v: 0.9 }, { t: CHIN + 0.05, s: "plim", v: 0.4 },
  { t: S[13] + 0.3, s: "impacto", v: 0.7 }, { t: PARARIA, s: "pop", v: 0.4 }, { t: COMENTA, s: "pop", v: 0.5 }, { t: FIM, s: "whoosh", v: 0.7 },
];

const CEU_ESPACO = (m: Mundo) => (m === "espaco" ? 1 : 0);

export const ImaginaSoVelocidade3D: React.FC = () => {
  const { t } = useT();
  const tr = TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp * 100)).reduce((x, y) => soma(x, y), [0, 0, 0] as V3);
  const e = estado(t);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4fb6ff 0%, #bfe7ff 70%)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1b1f4a 0%, #070814 75%)", opacity: CEU_ESPACO(e.mundo) }} />
      <ThreeCanvas width={1080} height={1920} shadows flat camera={{ fov: 50, position: [0, 2.2, 8], near: 0.1, far: 300 }}>
        <Cena3D />
      </ThreeCanvas>
      <Linhas />
      <AbsoluteFill style={{ transform: `translate(${tr[0]}px, ${tr[1]}px)` }}>
        <Marca3D />
        <Hud />
        {BANNERS.map((b, i) => <Faixa3D key={i} {...b} />)}
        <Legenda3D fala={F} fim={VEL_3D_DUR} />
      </AbsoluteFill>
      <Flash picos={[0.25, BUM, CHIN, S[13] + 0.3, VEL_3D_DUR - 0.05]} />

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
