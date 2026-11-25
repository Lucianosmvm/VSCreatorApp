import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import tl from "../../public/videos/imagina-so-11-se-a-internet-acabasse-mwwgacm0/timeline.json";
import { COR, mola, rampa, useT } from "./Bloco";
import { Boneco3D, Brilhos, Caixa, Camera, Controle3D, Coracao3D, type Expr, Mundo3D, tremor } from "./Bloco3D";
import { Antena3D, CadeiraBalanco3D, Celular3D, Foto3D, Jornal3D, Livro3D, Mesa3D, Passaro3D, Roteador3D, Sofa3D, WifiIcone3D } from "./Objetos3D";
import { Balao3D, Faixa3D, Flash, Legenda3D, Marca3D, montarFala, type Banner } from "./Camada2D";

// Imagina Só #11: "E se a internet acabasse?" — falando com quem assiste. Piada na imagem
// (Wi-Fi que quebra, roteador 47×, pai no telhado, vampiro no sol, avó de 40 minutos, jornal de 2009)
// e virada com a mãe sem o grupo da família (48×). Pedaço do Wi-Fi na câmera no começo e no fim.

const PASTA = "videos/imagina-so-11-se-a-internet-acabasse-mwwgacm0/";
const F = montarFala(tl, { vel: 1.05, inicio: 0.35 });
const { S, W } = F;
const PI = Math.PI;

type V3 = [number, number, number];
type Tipo = "mae" | "filho" | "pai" | "avo";
type Ator = {
  pos: V3; rotY?: number; esc?: number; expr?: Expr; bracoE?: [number, number]; bracoD?: [number, number];
  pernaE?: number; pernaD?: number; cabeca?: [number, number]; olhos?: number; segura?: React.ReactNode; seguraE?: React.ReactNode;
  boca?: number; rot?: V3; coroa?: boolean; pedra?: boolean; amassa?: V3; some?: boolean; social?: boolean;
};
type Plano = { pos: V3; alvo: V3; fov?: number; roll?: number };

// ── marcos ───────────────────────────────────────────────────────────────
const ACABASSE = W(0, "acabasse");
const REINICIA = W(1, "reinicia"), N47 = W(1, "47");
const TELHADO = W(2, "telhado"), RESOLVE = W(2, "resolve");
const ROSTO = W(3, "rosto");
const LUGAR = W(4, "lugar"), FORA = W(4, "fora");
const SOL = W(5, "sol"), PAUSA = W(5, "pausa");
const AVO_T = W(6, "avó");
const QUARENTA = W(7, "40");
const JORNAL = W(8, "jornal"), ANO = W(8, "2009");
const FELIZ = W(9, "feliz");
const GRUPO = W(10, "grupo"), ACABOU = W(10, "acabou");
const REINICIA2 = W(11, "reinicia"), N48 = W(11, "48");
const FARIA = W(12, "faria"), COMENTA = W(12, "comenta"), FIM = W(12, "aí") + 0.35;
export const INTERNET_3D_DUR = Math.max(F.fim + 0.2, FIM + 0.5);
const QUEBRA = 0.35;

const ease = Easing.out(Easing.cubic);
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as V3;
const soma = (...vs: number[][]) => vs.reduce((a, b) => a.map((v, i) => v + b[i])) as V3;
const prog = (t: number, a: number, b: number) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const cenaDe = (t: number) => S.reduce((k, s, i) => (t >= s - 0.04 ? i : k), 0);
const balanco = (t: number) => Math.sin(t * 2.2) * 0.08;

const FILHO: V3 = [0.6, 0, 0];
const DE_PE = (pos: V3, rotY: number, extra: Partial<Ator> = {}): Ator => ({ pos, rotY, expr: "feliz", ...extra });
const SENTADO = { pernaE: -PI / 2, pernaD: -PI / 2 };
const apertando = (t: number, vel = 26): [number, number] => [-1.25 + Math.abs(Math.sin(t * vel)) * 0.35, 0.1];

type Estado = { cam: Plano; atores: { a: Ator; tipo: Tipo }[]; objs?: React.ReactNode; noite?: number; sol?: number };

const estado = (t: number): Estado => {
  const k = cenaDe(t);
  const dt = t - S[k];

  if (k === 0) {
    // o Wi-Fi gigante racha e cai; você grita
    const q = prog(t, QUEBRA, QUEBRA + 1.2);
    return {
      cam: t < ACABASSE - 0.04 ? { pos: [0.3, 3.4, 9.5], alvo: [0.3, 3.6, -1] } : { pos: lerp3([0.6, 2.6, 4.4], [0.6, 2.6, 3.8], prog(t, ACABASSE, S[1])), alvo: [0.6, 2.4, 0], fov: 46 },
      atores: [{ tipo: "filho", a: DE_PE(FILHO, 0, { expr: "medo", boca: t >= QUEBRA ? 0.6 + 0.4 * Math.abs(Math.sin(t * 18)) : 0,
        bracoE: [-2.8, -0.6], bracoD: [-2.8, 0.6], cabeca: [-0.25, 0] }) }],
      objs: <WifiIcone3D pos={[0.3, 4.8, -1.2]} esc={1.6} quebra={q} />,
    };
  }

  if (k === 1) {
    // reinicia o roteador 47 vezes
    const suor = [0, 1, 2].map((i) => {
      const y = 3.0 - ((t * 2.4 + i * 0.4) % 1.2);
      return <Caixa key={i} p={[FILHO[0] - 0.3 + i * 0.3, y, FILHO[2] + 0.4]} s={[0.1, 0.16, 0.1]} cor="#7fd3ff" contorno={0} sombra={false} />;
    });
    return {
      cam: { pos: lerp3([1.6, 2.9, 5.4], [1.4, 2.8, 4.6], prog(t, S[1], S[2])), alvo: [0.6, 1.8, 0.6] },
      atores: [{ tipo: "filho", a: DE_PE(FILHO, -0.3, { expr: "brava", bracoD: apertando(t), bracoE: apertando(t + 0.06, 26).map((v, i) => (i ? -v : v)) as [number, number] }) }],
      objs: (
        <>
          <Mesa3D pos={[FILHO[0], 0, FILHO[2] + 1.4]} esc={0.75} />
          <Roteador3D t={t} pos={[FILHO[0], 0.98, FILHO[2] + 1.4]} esc={0.9} morto={Math.floor(t * 6) % 2 === 0} />
          {suor}
        </>
      ),
    };
  }

  if (k === 2) {
    // o pai no telhado com a antena, se equilibrando
    const balanca = Math.sin(t * 5) * 0.18;
    return {
      cam: { pos: lerp3([2.2, 1.0, 7.0], [2.0, 1.4, 6.2], prog(t, S[2], S[3])), alvo: [-1.6, 6.2, -7.2], fov: 54 },
      atores: [{ tipo: "pai", a: DE_PE([-1.6, 7.6, -7.3], 0.2, { rot: [0, 0, balanca], expr: t >= RESOLVE ? "feliz" : "medo",
        bracoE: [-2.8, -0.2], bracoD: [-2.8, 0.2], seguraE: <Antena3D rot={[PI, 0, 0]} pos={[0.3, 0, 0]} esc={0.9} />, pernaE: balanca, pernaD: -balanca }) }],
      objs: t >= TELHADO ? <Brilhos t={t} pos={[-1.3, 10.2, -7.2]} raio={0.6} n={5} cor="#bfe9ff" /> : null,
    };
  }

  if (k === 3) {
    // a mãe finalmente vê o seu rosto
    const aperta = t >= ROSTO - 0.2 ? 0.85 + Math.abs(Math.sin(t * 6)) * 0.05 : 1;
    return {
      cam: { pos: lerp3([0, 2.7, 6.0], [0, 2.6, 5.2], prog(t, S[3], S[4])), alvo: [0, 2.4, -0.2] },
      atores: [
        { tipo: "mae", a: DE_PE([-0.75, 0, -0.2], 0.8, { coroa: true, expr: "feliz", bracoE: [-1.5, 0.2], bracoD: [-1.5, -0.2] }) },
        { tipo: "filho", a: DE_PE([0.75, 0, -0.2], -0.8, { expr: "medo", amassa: [aperta, 1, 1] }) },
      ],
      objs: t >= ROSTO ? <>{[0, 1, 2].map((i) => <Coracao3D key={i} pos={[-0.2 + i * 0.3, 3.4 + ((t * 1.2 + i * 0.5) % 1.3), -0.2]} esc={0.45} />)}</> : null,
    };
  }

  if (k === 4) {
    // descobre "lá fora": a luz cega e você recua como vampiro
    const sai = prog(t, S[4], LUGAR + 0.4);
    const ceguinho = t >= FORA - 0.1;
    return {
      sol: ceguinho ? 1 : 0,
      cam: { pos: lerp3([0.3, 2.6, 0.2], [0.3, 2.5, -1.0], prog(t, S[4], S[5])), alvo: [0, 2.0, -6.2] },
      atores: [{ tipo: "filho", a: DE_PE(lerp3([0, 0, -7.7], [0, 0, -5.4], sai), 0, { expr: "medo",
        bracoE: ceguinho ? [-2.0, 0.9] : [0, -0.12], bracoD: ceguinho ? [-2.0, -0.9] : [0, 0.12], rot: [ceguinho ? -0.2 : 0, 0, 0] }) }],
    };
  }

  if (k === 5) {
    // "pausa" no sol não funciona: você derrete
    const derrete = rampa(t, PAUSA - 0.2, S[6]);
    const close = t >= PAUSA - 0.2;
    return {
      sol: 1,
      cam: close ? { pos: [0.6, 2.4, 5.0], alvo: [0.6, 1.6, 0], fov: 48 } : { pos: [-1.2, 1.0, 4.2], alvo: [3.5, 6.5, -14], fov: 58 },
      atores: [{ tipo: "filho", a: DE_PE(FILHO, close ? 0 : PI * 0.8, { expr: close ? "medo" : "brava", amassa: [1 + derrete * 0.4, 1 - derrete * 0.5, 1 + derrete * 0.4],
        bracoD: close ? [0, 0.3] : [-2.6, 0.2], segura: <Controle3D rot={[2.6, 0, 0]} esc={0.6} /> }) }],
      objs: close ? <>{[0, 1, 2, 3].map((i) => <Caixa key={i} p={[0.2 + i * 0.25, 2.4 - ((t * 2 + i * 0.3) % 1.4), 0.5]} s={[0.1, 0.16, 0.1]} cor="#7fd3ff" contorno={0} sombra={false} />)}</> : null,
    };
  }

  if (k === 6 || k === 7) {
    // a avó responde em 40 minutos, com o álbum da família; você vira estátua
    const quarenta = k === 7;
    const pedra = quarenta && t >= QUARENTA + 0.3;
    const pouso = prog(t, QUARENTA + 0.8, QUARENTA + 1.4);
    const fala = 0.4 + 0.6 * Math.abs(Math.sin(t * 13));
    return {
      cam: quarenta ? { pos: lerp3([1.4, 3.0, 8.0], [1.3, 2.9, 7.2], prog(t, S[7], S[8])), alvo: [0.3, 1.8, -0.6] }
        : { pos: lerp3([0.8, 2.8, 7.4], [0.7, 2.7, 6.6], prog(t, S[6], S[7])), alvo: [-0.2, 1.9, -0.8] },
      atores: [
        { tipo: "avo", a: { pos: [-1.0, 0.22, -1.35], rot: [balanco(t), 0.4, 0], expr: "feliz", ...SENTADO, boca: t >= AVO_T ? fala : 0,
          bracoE: [-1.2, -0.2], bracoD: [-1.2, 0.2] } },
        { tipo: "filho", a: DE_PE([1.2, 0, 0.6], -0.7, { expr: "medo", pedra, cabeca: [0.15, 0] }) },
      ],
      objs: (
        <>
          <group position={[-1.0, 0, -1.4]} rotation={[balanco(t), 0.4, 0]}><CadeiraBalanco3D /></group>
          <Livro3D pos={[-0.55, 2.0, -0.5]} rot={[1.2, 0.4, 0]} esc={1.6} cor="#8a5a3c" />
          {quarenta && [0, 1, 2, 3, 4, 5].map((i) => {
            const a = i * (2 * PI / 6) + t * 0.8;
            return <Foto3D key={i} pos={[-0.4 + Math.cos(a) * 2.0, 2.6 + Math.sin(a * 2) * 0.4, -0.6 + Math.sin(a) * 1.2]} rot={[0, -a, 0]} cor={["#7fd3ff", "#ffd23f", "#ff9ec4", "#5ad35a"][i % 4]} />;
          })}
          {quarenta && t >= QUARENTA + 0.8 && <Passaro3D t={t} pos={lerp3([-4, 6, 2], [1.2, 3.55, 0.6], pouso)} rotY={1.2} esc={0.9} voando={pouso < 1} />}
        </>
      ),
    };
  }

  if (k === 8) {
    // o pai volta ao jornal de 2009
    return {
      cam: { pos: lerp3([0.2, 2.6, 6.2], [0.2, 2.5, 5.4], prog(t, S[8], S[9])), alvo: [0, 2.0, -1.0] },
      atores: [{ tipo: "pai", a: { pos: [0, 0.02, -1.0], expr: "feliz", ...SENTADO, bracoE: [-1.4, -0.3], bracoD: [-1.4, 0.3], social: false } }],
      objs: (
        <>
          <Sofa3D pos={[0, 0, -1.3]} />
          {t >= JORNAL - 0.1 && <Jornal3D pos={[0, 1.55, 0.35]} esc={1.25} />}
        </>
      ),
    };
  }

  if (k === 9) {
    // a mãe dança: ninguém pede pra jogar
    return {
      cam: { pos: lerp3([0.3, 2.8, 8.2], [0.3, 2.7, 7.4], prog(t, S[9], S[10])), alvo: [0, 2.1, -0.6] },
      atores: [
        { tipo: "mae", a: DE_PE([-0.5, Math.abs(Math.sin(t * 7)) * 0.3, -0.2], t * 3, { coroa: true, expr: "feliz", bracoE: [-2.7, -0.4 + Math.sin(t * 7) * 0.3], bracoD: [-2.7, 0.4 - Math.sin(t * 7) * 0.3] }) },
        { tipo: "filho", a: { pos: [1.6, 0.02, -1.0], rotY: -0.4, expr: "sono", ...SENTADO, bracoE: [-0.4, -0.2], bracoD: [-0.4, 0.2] } },
      ],
      objs: <Sofa3D pos={[1.0, 0, -1.3]} />,
    };
  }

  if (k === 10) {
    // o grupo da família acabou: ela desmaia
    const desmaio = prog(t, ACABOU, ACABOU + 0.5);
    return {
      cam: t < ACABOU - 0.04 ? { pos: [0.4, 2.9, 4.4], alvo: [-0.3, 2.5, -0.2], fov: 44 } : { pos: lerp3([0.6, 3.0, 7.6], [0.6, 2.9, 7.0], prog(t, ACABOU, S[11])), alvo: [-0.3, 1.2, -0.6] },
      atores: [{ tipo: "mae", a: { pos: [-0.3, desmaio * 0.3, -0.2], rot: [-PI / 2 * desmaio, 0, 0], esc: 1, coroa: true, expr: "medo",
        bracoE: [-1.4 - desmaio, -0.3], bracoD: desmaio > 0.5 ? [-2.9, 0.6] : [-1.4, 0.1], segura: desmaio < 0.5 ? <Celular3D rot={[1.4, 0, 0]} pos={[0, 0, 0.15]} esc={1.3} /> : undefined } }],
      objs: desmaio > 0.4 ? <Brilhos t={t} pos={[-0.3, 0.9, -2.6]} raio={0.6} n={5} cor={COR.amarelo} /> : null,
    };
  }

  if (k === 11) {
    // agora é ela que reinicia o roteador, 48 vezes
    return {
      cam: { pos: lerp3([1.4, 2.9, 6.6], [1.3, 2.8, 5.8], prog(t, S[11], S[12])), alvo: [0.2, 1.9, 0.2] },
      atores: [
        { tipo: "mae", a: DE_PE([-0.2, 0, -0.2], 0.1, { coroa: true, expr: "brava", olhos: 0.6, bracoD: apertando(t, 32), bracoE: [-1.25, -0.1] }) },
        { tipo: "filho", a: DE_PE([1.9, 0, -0.6], -0.6, { expr: "medo" }) },
        { tipo: "pai", a: DE_PE([-2.2, 0, -0.8], 0.6, { expr: "medo" }) },
      ],
      objs: (
        <>
          <Mesa3D pos={[-0.2, 0, 1.2]} esc={0.75} />
          <Roteador3D t={t} pos={[-0.2, 0.98, 1.2]} esc={0.9} morto={Math.floor(t * 8) % 2 === 0} />
        </>
      ),
    };
  }

  // 12: a família acena + pedaço do Wi-Fi vem na câmera (loop)
  const tchau = Math.sin(t * 12) * 0.35;
  const joga = t >= FIM;
  const v = Math.min(1, (t - FIM) / 0.42);
  return {
    cam: { pos: lerp3([0, 2.9, 11.6], [0, 2.8, 10.6], prog(t, S[12], INTERNET_3D_DUR)), alvo: [0, 2.0, -0.8] },
    atores: [
      { tipo: "avo", a: { pos: [0, 0.22, -1.25], rot: [balanco(t), 0, 0], expr: "feliz", ...SENTADO, bracoE: [-2.6, -0.3 + tchau], bracoD: [-0.5, 0.25] } },
      { tipo: "mae", a: DE_PE([-2.2, 0, -0.6], 0.35, { coroa: true, bracoE: [-2.6, -0.3 + tchau] }) },
      { tipo: "pai", a: DE_PE([2.2, 0, -0.6], -0.35, { bracoD: [-2.6, 0.3 - tchau] }) },
      { tipo: "filho", a: DE_PE([1.0, 0, 0.6], -0.2, { bracoD: [-2.6, 0.3 - tchau] }) },
    ],
    objs: (
      <>
        <group position={[0, 0, -1.3]} rotation={[balanco(t), 0, 0]}><CadeiraBalanco3D /></group>
        <WifiIcone3D pos={[0, 5.6, -2]} esc={0.9} quebra={0} />
        {joga && <group position={lerp3([0, 5.6, -2], [0, 2.6, 10.2], v * v)} rotation={[t * 6, t * 4, 0]}><WifiIcone3D esc={1.2} quebra={0} /></group>}
      </>
    ),
  };
};

const Personagem: React.FC<{ a: Ator; tipo: Tipo }> = ({ a, tipo }) => {
  if (a.some) return null;
  return (
    <group position={a.pos} rotation={a.rot ?? [0, 0, 0]} scale={a.amassa ?? [1, 1, 1]}>
      <Boneco3D tipo={tipo} rotY={a.rotY} esc={a.esc} expr={a.expr} bracoE={a.bracoE} bracoD={a.bracoD} pernaE={a.pernaE} pernaD={a.pernaD}
        cabeca={a.cabeca} olhosBrilho={a.olhos ?? 0} segura={a.segura} seguraE={a.seguraE} boca={a.boca} coroa={a.coroa} pedra={a.pedra} social={a.social} />
    </group>
  );
};

const TREMORES: [number, number, number][] = [[QUEBRA, 0.6, 0.25], [FORA, 0.3, 0.1], [QUARENTA + 0.3, 0.3, 0.08], [ACABOU + 0.3, 0.4, 0.15], [FIM + 0.4, 0.3, 0.12]];

const Cena3D: React.FC = () => {
  const { t } = useT();
  const e = estado(t);
  const tr = soma([0, 0, 0], ...TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp)));
  const sol = e.sol ?? 0;
  return (
    <>
      <Camera pos={soma(e.cam.pos, tr)} alvo={e.cam.alvo} fov={e.cam.fov ?? 50} roll={e.cam.roll ?? 0} />
      <ambientLight intensity={0.55 + 0.25 * sol} />
      <hemisphereLight args={["#cfefff", "#7fbf5a", 0.7]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6 + 0.6 * sol} color={sol > 0 ? "#fff1c0" : "#ffffff"} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
      <Mundo3D t={t} />
      {e.atores.map((x, i) => <Personagem key={i} a={x.a} tipo={x.tipo} />)}
      {e.objs}
    </>
  );
};

// ── camada 2D (só o que a legenda não diz) ─────────────────────────────────
const BANNERS: Banner[] = [
  { t0: ACABASSE + 0.1, t1: S[1], txt: "📶 SEM INTERNET", y: 240, tam: 100, cor: COR.vermelho },
  { t0: PAUSA, t1: S[6], txt: "⏸ ❌", y: 240, tam: 130 },
  { t0: ANO - 0.1, t1: S[9], txt: "📰 2009", y: 240, tam: 130, cor: "#ffffff" },
  { t0: FARIA, t1: INTERNET_3D_DUR, txt: "O QUE VOCÊ FARIA SEM INTERNET?", y: 240, tam: 56, cor: "#ffffff" },
  { t0: COMENTA, t1: INTERNET_3D_DUR, txt: "COMENTA AÍ 👇", y: 360, tam: 112 },
];

const contorno = (px: number) => ({ WebkitTextStroke: `${px}px ${COR.linha}`, paintOrder: "stroke fill" as const });
const cartao: React.CSSProperties = { background: "#ffffff", border: `8px solid ${COR.linha}`, borderRadius: 30, boxShadow: "0 12px 0 rgba(0,0,0,.25)",
  fontFamily: "Poppins", fontWeight: 900, color: COR.linha };

/** Contador de reinícios do roteador: 1 → 47 (você) e 1 → 48 (a mãe). */
const Contador: React.FC = () => {
  const { t } = useT();
  let n = 0;
  if (t >= REINICIA - 0.2 && t < S[2]) n = Math.round(rampa(t, REINICIA - 0.2, N47 + 0.3, 1, 47));
  else if (t >= REINICIA2 - 0.2 && t < S[12]) n = Math.round(rampa(t, REINICIA2 - 0.2, N48 + 0.3, 1, 48));
  if (!n) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center" }}>
      <span style={{ ...cartao, padding: "10px 34px", fontSize: 110, display: "inline-block" }}>🔁 {n}×</span>
    </div>
  );
};

/** Clarão do "lá fora" + tela amarelada de calor. */
const Clarao: React.FC = () => {
  const { t } = useT();
  const o = interpolate(t, [FORA - 0.15, FORA, FORA + 0.8], [0, 1, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const calor = t >= SOL - 0.2 && t < S[6] ? 0.18 : 0;
  if (t < FORA - 0.15 || t >= S[6]) return null;
  return <AbsoluteFill style={{ background: "#fffbe0", opacity: Math.max(o * (t < S[5] ? 1 : 0), calor), pointerEvents: "none" }} />;
};

/** Relógio da avó: 0:01 → 40:00. */
const Relogio40: React.FC = () => {
  const { t } = useT();
  if (t < S[7] || t >= S[8]) return null;
  const m = Math.floor(rampa(t, S[7], QUARENTA + 0.6, 1, 40));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center" }}>
      <span style={{ ...cartao, padding: "10px 34px", fontSize: 120, display: "inline-block" }}>⏱ {m}:00</span>
    </div>
  );
};

/** Celular da mãe: grupo da família sem conexão. */
const SemConexao: React.FC = () => {
  const { t, fps } = useT();
  if (t < GRUPO - 0.3 || t >= S[11]) return null;
  const s = mola(t, GRUPO - 0.3, fps, 10, 220);
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top: 240, transform: `scale(${s})`, ...cartao, padding: "20px 28px", textAlign: "center" }}>
      <div style={{ fontSize: 40, color: "#6b6f80" }}>👨‍👩‍👧 GRUPO DA FAMÍLIA</div>
      <div style={{ fontSize: 76, color: COR.vermelho }}>❌ SEM CONEXÃO</div>
    </div>
  );
};

/** Notas musicais da dança da mãe. */
const Notas: React.FC = () => {
  const { t } = useT();
  if (t < FELIZ - 0.2 || t >= S[10]) return null;
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => {
        const d = (t * 0.7 + i * 0.13) % 1;
        return (
          <div key={i} style={{ position: "absolute", left: 140 + (i * 113) % 780 + Math.sin(t * 3 + i) * 40, top: 1150 - d * 800, opacity: 1 - d,
            fontSize: 100, color: [COR.amarelo, COR.rosa, "#7fd3ff", COR.verde][i % 4], ...contorno(10) }}>{i % 2 ? "♪" : "♫"}</div>
        );
      })}
    </>
  );
};

const SONS: { t: number; s: string; v: number }[] = [
  { t: 0.05, s: "whoosh", v: 0.5 }, { t: QUEBRA, s: "impacto", v: 0.8 }, { t: QUEBRA + 0.05, s: "erro", v: 0.5 }, { t: ACABASSE, s: "risco", v: 0.45 },
  ...Array.from({ length: 10 }).map((_, i) => ({ t: REINICIA - 0.2 + i * 0.22, s: "tecla", v: 0.25 })), { t: N47, s: "erro", v: 0.4 },
  { t: TELHADO, s: "whoosh", v: 0.4 }, { t: RESOLVE, s: "piu", v: 0.4 },
  { t: ROSTO - 0.2, s: "plim", v: 0.45 },
  { t: FORA - 0.15, s: "aura", v: 0.5 }, { t: FORA, s: "impacto", v: 0.5 },
  { t: PAUSA - 0.2, s: "erro", v: 0.45 },
  { t: AVO_T, s: "pop", v: 0.4 }, { t: S[7], s: "contagem", v: 0.35 }, { t: QUARENTA + 0.3, s: "erro", v: 0.35 }, { t: QUARENTA + 1.3, s: "piu", v: 0.55 },
  { t: JORNAL - 0.1, s: "whoosh", v: 0.4 }, { t: ANO, s: "risco", v: 0.4 },
  ...[0, 1, 2, 3].map((i) => ({ t: FELIZ - 0.2 + i * 0.33, s: "grave", v: 0.35 })),
  { t: GRUPO - 0.3, s: "pop", v: 0.45 }, { t: ACABOU, s: "erro", v: 0.5 }, { t: ACABOU + 0.3, s: "impacto", v: 0.6 },
  ...Array.from({ length: 12 }).map((_, i) => ({ t: REINICIA2 - 0.2 + i * 0.2, s: "tecla", v: 0.25 })), { t: N48, s: "buzina", v: 0.35 },
  { t: FARIA, s: "pop", v: 0.4 }, { t: COMENTA, s: "pop", v: 0.5 }, { t: FIM, s: "whoosh", v: 0.6 }, { t: FIM + 0.4, s: "impacto", v: 0.6 },
];

export const ImaginaSoInternet3D: React.FC = () => {
  const { t } = useT();
  const tr = TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp * 100)).reduce((x, y) => soma(x, y), [0, 0, 0] as V3);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4fb6ff 0%, #bfe7ff 70%)" }}>
      <ThreeCanvas width={1080} height={1920} shadows flat camera={{ fov: 50, position: [0, 2.2, 8], near: 0.1, far: 200 }}>
        <Cena3D />
      </ThreeCanvas>
      <Clarao />
      <AbsoluteFill style={{ transform: `translate(${tr[0]}px, ${tr[1]}px)` }}>
        <Marca3D />
        {BANNERS.map((b, i) => <Faixa3D key={i} {...b} />)}
        <Contador />
        <Relogio40 />
        <SemConexao />
        <Notas />
        <Balao3D t0={ROSTO - 0.2} t1={S[4]} txt="Que rosto lindo! 😍" x={420} y={520} tam={54} letra={0.03} />
        <Legenda3D fala={F} fim={INTERNET_3D_DUR} />
      </AbsoluteFill>
      <Flash picos={[QUEBRA, ACABOU + 0.3, INTERNET_3D_DUR - 0.05]} />

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
