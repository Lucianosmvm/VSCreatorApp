import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import tl from "../../public/videos/imagina-so-10-mae-motorista-de-uber-mwvz7h87/timeline.json";
import { COR, mola, rampa, useT } from "./Bloco";
import { Boneco3D, Brilhos, Caixa, Camera, Coracao3D, type Expr, tremor } from "./Bloco3D";
import { Marmita3D, Martelo3D, Passaro3D, Poof3D, Salgadinho3D, Teia3D } from "./Objetos3D";
import { CarroFamilia3D, Mercado3D, Rua3D } from "./Cenarios3D";
import { Balao3D, Faixa3D, Flash, Legenda3D, Marca3D, montarFala, type Banner } from "./Camada2D";

// Imagina Só #10 (v2): "E se a sua mãe fosse motorista de Uber?" — 1º da série "Se a sua mãe fosse…".
// v2: a piada está na IMAGEM (freada amassa o filho, derrete e congela, barba de 40 minutos, cavalo de pau,
// carro pulando no grave, vira estátua com passarinho, tribunal do tapete), menos texto na tela,
// legenda em frases e narração a 1.05x para dar tempo de ler.

const PASTA = "videos/imagina-so-10-mae-motorista-de-uber-mwvz7h87/";
const F = montarFala(tl, { vel: 1.05, inicio: 0.35 });
const { S, W } = F;
const PI = Math.PI;

type V3 = [number, number, number];
type Ator = {
  pos: V3; rotY?: number; esc?: number; expr?: Expr; bracoE?: [number, number]; bracoD?: [number, number];
  pernaE?: number; pernaD?: number; cabeca?: [number, number]; olhos?: number; segura?: React.ReactNode; seguraE?: React.ReactNode;
  boca?: number; rot?: V3; coroa?: boolean; gelo?: boolean; pedra?: boolean; barba?: number; amassa?: V3; some?: boolean;
};
type Plano = { pos: V3; alvo: V3; fov?: number; roll?: number };
type Carro = { pos: V3; rotY?: number; rot?: V3; janela?: number; mae?: Partial<Ator> | null; filho?: Partial<Ator> | null; luz?: boolean; esc?: V3 };

// ── marcos ───────────────────────────────────────────────────────────────
const UBER = W(0, "uber");
const PERGUNTA = W(1, "pergunta");
const JANELA = W(2, "janela"), COMER = W(2, "comer");
const RECLAMAR = W(3, "reclamar");
const MERCADO = W(4, "mercado"), MINUTINHO = W(4, "minutinho");
const QUARENTA = W(5, "40");
const FALTA = W(6, "falta"), RESPONDE = W(6, "responde"), VOLTA = W(6, "volta");
const MUSICA = W(7, "música");
const ATRASADO = W(8, "atrasado"), SERMAO = W(8, "sermão");
const ZERO = W(9, "zero"), TENIS = W(9, "tênis");
const GRACA = W(10, "graça"), LANCHE = W(10, "lanche");
const NOTA = W(11, "nota"), COMENTA = W(11, "comenta"), FIM = W(11, "aí") + 0.35;
export const UBER_3D_DUR = Math.max(F.fim + 0.2, FIM + 0.5);
const FREIO = 0.55;

const ease = Easing.out(Easing.cubic);
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as V3;
const soma = (...vs: number[][]) => vs.reduce((a, b) => a.map((v, i) => v + b[i])) as V3;
const prog = (t: number, a: number, b: number) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const cenaDe = (t: number) => S.reduce((k, s, i) => (t >= s - 0.04 ? i : k), 0);
function lerpPlano(a: Plano, b: Plano, q: number): Plano {
  return { pos: lerp3(a.pos, b.pos, q), alvo: lerp3(a.alvo, b.alvo, q), fov: (a.fov ?? 50) + ((b.fov ?? 50) - (a.fov ?? 50)) * q };
}

// planos (carro na origem, frente para +x)
const PARABRISA: Plano = { pos: [7.0, 2.7, 0.3], alvo: [0, 2.2, 0], fov: 46 };
const FILHO_CLOSE: Plano = { pos: [6.0, 2.7, 1.1], alvo: [-1.0, 2.1, 0.5], fov: 38 };
const FORA: Plano = { pos: [6.5, 3.6, 10.5], alvo: [0, 1.8, 0], fov: 50 };

const MAE_CARRO: Ator = { pos: [0.75, 0.15, -0.5], rotY: PI / 2, esc: 0.95, coroa: true, expr: "feliz", pernaE: -PI / 2, pernaD: -PI / 2,
  bracoE: [-1.3, -0.15], bracoD: [-1.3, 0.15] };
const FILHO_CARRO: Ator = { pos: [-1.0, 0.15, 0.5], rotY: PI / 2, esc: 0.95, expr: "feliz", pernaE: -PI / 2, pernaD: -PI / 2,
  bracoE: [-0.5, -0.2], bracoD: [-0.5, 0.2] };
const DE_PE = (pos: V3, rotY: number, extra: Partial<Ator> = {}): Ator => ({ pos, rotY, esc: 1, expr: "feliz", ...extra });

type Estado = { cam: Plano; carro?: Carro; atores?: { a: Ator; tipo: "mae" | "filho" }[]; objs?: React.ReactNode; desloc?: number; noite?: number; rodas?: number };

const estado = (t: number): Estado => {
  const k = cenaDe(t);
  const dt = t - S[k];

  if (k === 0) {
    // freada: o filho voa do banco de trás e amassa no banco da frente
    const x = interpolate(t, [0, FREIO], [-18, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
    const voo = t > FREIO ? Math.max(0, Math.sin(Math.min(1, (t - FREIO) / 0.5) * PI)) : 0;
    const bico = t > FREIO ? -Math.exp(-(t - FREIO) * 5) * Math.sin((t - FREIO) * 16) * 0.12 : 0;
    return {
      cam: t < UBER - 0.04 ? { pos: [8.5, 2.2, 2.4], alvo: [0, 1.9, 0], fov: 46 } : PARABRISA,
      desloc: x * 2, rodas: x * 1.5,
      carro: { pos: [x, 0, 0], rot: [0, 0, bico], luz: true, mae: { expr: "feliz" },
        filho: { pos: [-1.0 + voo * 0.8, 0.15 + voo * 0.3, 0.5], expr: "medo", amassa: [1 - voo * 0.45, 1 + voo * 0.25, 1 + voo * 0.25],
          bracoE: [-2.6, -0.5], bracoD: [-2.6, 0.5] } },
    };
  }

  if (k === 1) {
    // "já foi no banheiro?" — ele cruza as pernas e se contorce
    const vira = t >= PERGUNTA;
    return {
      cam: lerpPlano(PARABRISA, { pos: [6.4, 2.7, 0.2], alvo: [0, 2.3, 0], fov: 46 }, prog(t, S[1], S[2])),
      carro: { pos: [0, 0, 0], mae: { rotY: vira ? 0.1 : PI / 2, bracoD: vira ? [-2.9, 0.55] : [-1.3, 0.15], expr: "brava" },
        filho: { expr: "medo", cabeca: [0, Math.sin(t * 14) * 0.25], pernaE: -PI / 2 + 0.25, pernaD: -PI / 2 - 0.25 } },
    };
  }

  if (k === 2) {
    // cinto, janela, e o salgadinho é confiscado pela janela
    const janela = rampa(t, JANELA, JANELA + 0.5);
    const voa = prog(t, COMER, COMER + 0.8);
    const fora = t >= COMER;
    return {
      cam: fora ? { pos: [2.5, 3.2, 11.5], alvo: [-0.5, 2.4, 2.0], fov: 50 } : PARABRISA,
      carro: { pos: [0, 0, 0], janela: fora ? 1 : janela,
        mae: { expr: "brava", olhos: fora ? 0.8 : 0, rotY: fora ? 0.4 : PI / 2, bracoD: fora ? [-1.6, -0.6] : [-1.3, 0.15] },
        filho: { expr: fora ? "medo" : "feliz", bracoD: fora ? [-0.5, 0.2] : [-1.3, 0.15],
          segura: fora ? undefined : <Salgadinho3D rot={[1.3, 0, 0]} pos={[0, 0, 0.2]} esc={0.9} /> } },
      objs: (
        <>
          <Caixa p={[-0.95, 1.55, 0.5]} s={[0.08, 1.1, 0.06]} rot={[0.7, 0, 0]} cor="#222" contorno={0} />
          {fora && voa < 1 && <Salgadinho3D pos={lerp3([-0.6, 2.4, 1.3], [-2.5, 0.3, 6.5], voa)} rot={[t * 12, t * 8, 0]} esc={1.4} />}
          {fora && voa >= 1 && <Salgadinho3D pos={[-2.5, 0.3, 6.5]} rot={[PI / 2, 0, 0.6]} esc={1.4} />}
        </>
      ),
    };
  }

  if (k === 3) {
    // reclamando, ele DERRETE de calor; calado, vira bloco de gelo
    const calado = t >= RECLAMAR + 0.1;
    const derrete = calado ? 0 : rampa(t, S[3], RECLAMAR, 0, 1);
    const reclama = !calado ? 0.4 + 0.6 * Math.abs(Math.sin(t * 14)) : 0;
    const treme = calado ? Math.sin(t * 60) * 0.03 : 0;
    return {
      cam: lerpPlano(FILHO_CLOSE, { pos: [5.4, 2.7, 1.0], alvo: [-1.0, 2.1, 0.5], fov: 35 }, prog(t, S[3], S[4])),
      carro: { pos: [0, 0, 0], janela: 1, mae: { expr: "brava" },
        filho: { pos: [-1.0 + treme, 0.15, 0.5], expr: calado ? "medo" : "brava", boca: reclama, gelo: calado,
          amassa: [1 + derrete * 0.35, 1 - derrete * 0.45, 1 + derrete * 0.35],
          bracoE: calado ? [-0.3, -0.1] : [-1.5, -0.4], bracoD: calado ? [-0.3, 0.1] : [-1.5, 0.4] } },
      objs: (
        <>
          {!calado && [0, 1, 2, 3].map((i) => {
            const y = 2.8 - ((t * 2.2 + i * 0.35) % 1.4);
            return <Caixa key={i} p={[-0.7 + (i % 2) * 0.15, y, 0.5 + (i - 1.5) * 0.25]} s={[0.1, 0.16, 0.1]} cor="#7fd3ff" contorno={0} sombra={false} />;
          })}
          {calado && <Caixa p={[-1.0, 1.55, 0.5]} s={[1.3, 2.4, 1.2]} cor="#bfe9ff" contorno={0.03} opacidade={0.4} sombra={false} />}
        </>
      ),
    };
  }

  if (k === 4) {
    // parada no mercado: "só um minutinho"
    const estaciona = prog(t, S[4], MERCADO + 0.2);
    const sai = t >= MINUTINHO - 0.3;
    const andando = prog(t, MINUTINHO - 0.3, S[5]);
    return {
      cam: { pos: lerp3([4.0, 4.2, 12.0], [3.4, 4.0, 11.0], prog(t, S[4], S[5])), alvo: [0, 2.2, -2.0] },
      desloc: (1 - estaciona) * 12, rodas: (1 - estaciona) * 8,
      carro: { pos: [0, 0, 0.6], janela: 1, mae: sai ? null : { expr: "feliz" }, filho: { expr: "medo" } },
      atores: sai ? [{ tipo: "mae", a: DE_PE(lerp3([0.8, 0, -1.2], [0.2, 0, -3.6], andando), PI, { coroa: true,
        pernaE: Math.sin(t * 12) * 0.5, pernaD: -Math.sin(t * 12) * 0.5, some: andando >= 0.98 }) }] : [],
      objs: <Mercado3D pos={[0, 0, -4.6]} />,
    };
  }

  if (k === 5) {
    // 40 minutos: cresce barba branca, aparecem teias, cai uma folha seca
    const barba = rampa(t, S[5] + 0.2, QUARENTA + 0.6);
    const folha = prog(t, S[5] + 0.3, S[6]);
    return {
      noite: 0.6 * rampa(t, S[5], QUARENTA + 0.3),
      cam: lerpPlano(FILHO_CLOSE, { pos: [5.4, 2.7, 1.0], alvo: [-1.0, 2.1, 0.5], fov: 33 }, prog(t, S[5], S[6])),
      carro: { pos: [0, 0, 0.6], janela: 1, mae: null, filho: { expr: "sono", barba, cabeca: [0.25, 0.2] } },
      objs: (
        <>
          <Mercado3D pos={[0, 0, -4.6]} />
          <Teia3D pos={[-1.6, 3.0, 1.75]} esc={0.9 * barba} op={0.9} />
          <Teia3D pos={[1.5, 3.0, -0.5]} rot={[0, PI, 0]} esc={0.9 * barba} op={0.9} />
          <Caixa p={[-0.4 + Math.sin(t * 4) * 0.3, 3.2 - folha * 1.6, 1.6]} s={[0.25, 0.04, 0.18]} rot={[t * 3, t * 2, 0]} cor="#c97a2a" contorno={0.015} />
        </>
      ),
    };
  }

  if (k === 6) {
    // "falta muito?" → cavalo de pau de 180° visto de cima, com fumaça
    const giro = prog(t, VOLTA - 0.1, VOLTA + 0.6) * PI;
    const drift = t >= VOLTA - 0.15;
    return {
      cam: drift ? { pos: [0.6, 14, 4.5], alvo: [0, 0, 0], fov: 55 } : PARABRISA,
      desloc: dt * 9, rodas: t * 8,
      carro: { pos: [0, 0, 0], rotY: giro, janela: 1, mae: { expr: t >= RESPONDE ? "brava" : "feliz", olhos: t >= RESPONDE ? 0.8 : 0 },
        filho: { expr: drift ? "medo" : "feliz", boca: t >= FALTA && t < RESPONDE ? 0.6 : 0 } },
      objs: drift ? (
        <>
          {[0, 1, 2, 3].map((i) => <Poof3D key={i} t={t} t0={VOLTA + i * 0.12} pos={[Math.cos(giro + i) * 2.2, -0.6, Math.sin(giro + i) * 1.4]} />)}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * giro;
            return <Caixa key={i} p={[Math.cos(a + PI) * 1.8, 0.04, Math.sin(a + PI) * 1.8]} s={[0.6, 0.02, 0.25]} rot={[0, -a, 0]} cor="#2a2a2a" contorno={0} sombra={false} />;
          })}
        </>
      ) : null,
    };
  }

  if (k === 7) {
    // a música é dela: o carro pula no grave; depois o close do filho tapando os ouvidos
    const batida = Math.abs(Math.sin(t * 9.4));
    const close = dt > (S[8] - S[7]) * 0.55;
    return {
      cam: close ? FILHO_CLOSE : { pos: [1.0, 2.6, 10.5], alvo: [0, 2.0, 0], fov: 48 },
      desloc: dt * 9, rodas: t * 8,
      carro: { pos: [0, batida * 0.28, 0], rot: [Math.sin(t * 9.4) * 0.04, 0, 0], esc: [1 + batida * 0.06, 1 - batida * 0.05, 1 + batida * 0.06], janela: 1,
        mae: { expr: "feliz", boca: 0.4 + 0.6 * batida, cabeca: [Math.sin(t * 9.4) * 0.2, 0] },
        filho: { expr: "medo", bracoE: [-2.9, -0.65], bracoD: [-2.9, 0.65] } },
    };
  }

  if (k === 8) {
    // atrasado: corre até o carro; o sermão o transforma em estátua e um passarinho pousa
    const sermao = t >= SERMAO - 0.3;
    const x = interpolate(t, [S[8], SERMAO - 0.3], [-9, -0.2], clamp);
    const pedra = t >= SERMAO + 0.5;
    const pouso = prog(t, SERMAO + 0.7, SERMAO + 1.3);
    const fala = 0.4 + 0.6 * Math.abs(Math.sin(t * 15));
    return {
      cam: sermao ? { pos: lerp3([1.2, 2.7, 8.2], [1.1, 2.7, 7.4], prog(t, SERMAO, S[9])), alvo: [0.6, 2.0, 1.4] } : FORA,
      carro: { pos: [-3.4, 0, -1.8], rotY: 0.2, janela: 1, mae: null, filho: null },
      atores: [
        { tipo: "mae", a: DE_PE([1.6, 0, 1.0], -0.6, { coroa: true, expr: "brava", boca: sermao ? fala : 0, bracoD: sermao ? [-2.3 + Math.sin(t * 8) * 0.4, 0.3] : [0, 0.7], bracoE: [0, -0.7] }) },
        { tipo: "filho", a: sermao
          ? DE_PE([-0.2, 0, 1.4], 0.5, { expr: "medo", pedra, cabeca: [0.15, 0] })
          : DE_PE([x, 0, 1.6], PI / 2, { expr: "medo", pernaE: Math.sin(t * 18) * 0.7, pernaD: -Math.sin(t * 18) * 0.7,
            bracoE: [-Math.sin(t * 18) * 0.8, -0.1], bracoD: [Math.sin(t * 18) * 0.8, 0.1] }) },
      ],
      objs: sermao && t >= SERMAO + 0.7 ? <Passaro3D t={t} pos={lerp3([-3.5, 6, 2], [-0.2, 3.55, 1.4], pouso)} rotY={1.2} esc={0.9} voando={pouso < 1} /> : null,
    };
  }

  if (k === 9) {
    // tribunal do tapete: martelo e "CULPADO"
    const mostra = t >= TENIS - 0.1;
    const bate = t >= ZERO ? Math.max(0, Math.sin(Math.min(1, (t - ZERO) / 0.25) * PI)) : 0;
    return {
      cam: mostra ? { pos: lerp3([1.0, 2.6, 7.4], [0.9, 2.5, 6.6], prog(t, TENIS, S[10])), alvo: [0.8, 2.0, 1.4] } : { pos: [1.2, 2.8, 8.4], alvo: [0.8, 2.1, 1.0] },
      carro: { pos: [-3.4, 0, -1.8], rotY: 0.2, janela: 1, mae: null, filho: null },
      atores: [
        { tipo: "mae", a: DE_PE([0, 0, 1.0], 0.4, { coroa: true, expr: "brava", olhos: 0.6,
          bracoE: mostra ? [-1.5, -0.1] : [0, -0.7], bracoD: [-2.4 + bate * 1.3, 0.2],
          segura: <Martelo3D rot={[2.4 - bate * 1.3, 0, 0]} pos={[0, 0, 0.1]} esc={1.1} /> }) },
        { tipo: "filho", a: DE_PE([2.0, 0, 1.2], -0.5, { expr: "medo", cabeca: [0.2, 0] }) },
      ],
      objs: mostra ? (
        <group position={[0.35, 1.9, 2.1]} rotation={[0.1, 0.4, 0]}>
          <Caixa s={[1.6, 1.1, 0.06]} cor="#9aa5b1" contorno={0.04} />
          {[[-0.4, 0.25], [-0.1, -0.05], [0.25, 0.2], [0.5, -0.15]].map(([x, y], i) => (
            <Caixa key={i} p={[x, y, 0.04]} s={[0.18, 0.28, 0.02]} rot={[0, 0, 0.3]} cor="#5a3a1f" contorno={0} sombra={false} />
          ))}
        </group>
      ) : null,
    };
  }

  if (k === 10) {
    // de graça e ainda vem com lanche: ele pula de alegria
    const entrega = prog(t, LANCHE - 0.4, LANCHE + 0.1);
    const pulo = t >= LANCHE ? Math.abs(Math.sin((t - LANCHE) * 8)) * 0.4 : 0;
    return {
      cam: { pos: lerp3([1.0, 2.7, 7.4], [0.9, 2.6, 6.6], prog(t, S[10], S[11])), alvo: [1.0, 2.1, 1.2] },
      carro: { pos: [-3.4, 0, -1.8], rotY: 0.2, janela: 1, mae: null, filho: null },
      atores: [
        { tipo: "mae", a: DE_PE([0, 0, 1.0], 0.6, { coroa: true, bracoD: [-1.4, 0.1] }) },
        { tipo: "filho", a: DE_PE([2.0, pulo, 1.2], -0.6, { expr: t >= LANCHE ? "feliz" : "medo", bracoE: [-1.3, -0.1], bracoD: t >= LANCHE ? [-2.8, 0.3] : [0, 0.12] }) },
      ],
      objs: (
        <>
          {t >= GRACA - 0.2 && <Marmita3D pos={lerp3([0.9, 1.7, 1.7], [1.4, 1.7 + pulo, 1.9], entrega)} esc={1.1} />}
          {t >= LANCHE && [0, 1, 2].map((i) => <Coracao3D key={i} pos={[1.0 + i * 0.4, 2.6 + ((t * 1.2 + i * 0.4) % 1.4), 1.6]} esc={0.5} />)}
          {t >= LANCHE && <Brilhos t={t} pos={[1.6, 2.0, 1.6]} raio={1.0} n={8} />}
        </>
      ),
    };
  }

  // 11: tchau + o carro arranca na câmera (volta ao começo)
  const tchau = Math.sin(t * 12) * 0.3;
  const sai = t >= FIM;
  const x = interpolate(t, [FIM, FIM + 0.45], [0, 9], { ...clamp, easing: Easing.in(Easing.quad) });
  return {
    cam: sai ? { pos: [8.5, 2.2, 2.4], alvo: [0, 1.9, 0], fov: 46 } : lerpPlano(PARABRISA, { pos: [6.0, 2.7, 0.3], alvo: [0, 2.3, 0], fov: 46 }, prog(t, S[11], FIM)),
    desloc: sai ? x * 2 : 0, rodas: x * 1.5,
    carro: { pos: [x, 0, 0], janela: 1, luz: true, mae: { expr: "feliz", bracoE: [-2.4, -0.3 + tchau] }, filho: { expr: "feliz", bracoD: [-2.4, 0.3 - tchau] } },
  };
};

const Pessoa: React.FC<{ a: Ator; tipo: "mae" | "filho" }> = ({ a, tipo }) => {
  if (a.some) return null;
  return (
    <group position={a.pos} rotation={a.rot ?? [0, 0, 0]} scale={a.amassa ?? [1, 1, 1]}>
      <Boneco3D tipo={tipo} rotY={a.rotY} esc={a.esc} expr={a.expr} bracoE={a.bracoE} bracoD={a.bracoD} pernaE={a.pernaE} pernaD={a.pernaD}
        cabeca={a.cabeca} olhosBrilho={a.olhos ?? 0} segura={a.segura} seguraE={a.seguraE} boca={a.boca} coroa={a.coroa} gelo={a.gelo}
        pedra={a.pedra} barba={a.barba} />
    </group>
  );
};

/** carro + mãe e filho sentados dentro, no mesmo grupo (andam, pulam e giram juntos) */
const CarroComGente: React.FC<{ c: Carro; rodas: number }> = ({ c, rodas }) => (
  <group position={c.pos} rotation={c.rot ? [c.rot[0], c.rotY ?? 0, c.rot[2]] : [0, c.rotY ?? 0, 0]} scale={c.esc ?? [1, 1, 1]}>
    <CarroFamilia3D janela={c.janela ?? 0} rodas={rodas} luz={c.luz} />
    {c.mae !== null && <Pessoa tipo="mae" a={{ ...MAE_CARRO, ...(c.mae ?? {}) }} />}
    {c.filho !== null && <Pessoa tipo="filho" a={{ ...FILHO_CARRO, ...(c.filho ?? {}) }} />}
  </group>
);

const TREMORES: [number, number, number][] = [[FREIO, 0.5, 0.3], [COMER, 0.3, 0.08], [RECLAMAR + 0.1, 0.4, 0.1], [VOLTA, 0.7, 0.2],
  [ZERO, 0.3, 0.15], [TENIS, 0.3, 0.12], [FIM + 0.3, 0.3, 0.12]];

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
      <directionalLight position={[6, 12, 8]} intensity={1.6 * (1 - 0.45 * n)} color={n > 0 ? "#a8b8ff" : "#ffffff"} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} />
      {n > 0 && <pointLight position={[0, 5, -2]} color="#ffe9a8" intensity={2 * n} distance={12} />}
      <Rua3D desloc={e.desloc ?? 0} />
      {e.carro && <CarroComGente c={e.carro} rodas={e.rodas ?? 0} />}
      {(e.atores ?? []).map((x, i) => <Pessoa key={i} a={x.a} tipo={x.tipo} />)}
      {e.objs}
    </>
  );
};

// ── camada 2D (só o que a legenda não diz) ─────────────────────────────────
const BANNERS: Banner[] = [
  { t0: MINUTINHO, t1: S[5], txt: "SÓ 1 MINUTINHO 🤏", y: 240, tam: 90 },
  { t0: VOLTA, t1: S[7], txt: "↩ VOLTANDO PRA CASA", y: 240, tam: 76, cor: COR.vermelho },
  { t0: TENIS, t1: S[10], txt: "⚖ CULPADO", y: 240, tam: 130, cor: COR.vermelho },
  { t0: LANCHE, t1: S[11], txt: "+ LANCHE 🍱", y: 240, tam: 110 },
  { t0: NOTA - 0.2, t1: UBER_3D_DUR, txt: "QUE NOTA VOCÊ DARIA? ⭐", y: 240, tam: 68, cor: "#ffffff" },
  { t0: COMENTA, t1: UBER_3D_DUR, txt: "COMENTA AÍ 👇", y: 370, tam: 112 },
];

const contorno = (px: number) => ({ WebkitTextStroke: `${px}px ${COR.linha}`, paintOrder: "stroke fill" as const });
const cartao: React.CSSProperties = { background: "#ffffff", border: `8px solid ${COR.linha}`, borderRadius: 30, boxShadow: "0 12px 0 rgba(0,0,0,.25)",
  fontFamily: "Poppins", fontWeight: 900, color: COR.linha };

/** Cartão de app de corrida: motorista MÃE ⭐ 5,0 / nota do passageiro ⭐ 0,0. */
const CartaoApp: React.FC = () => {
  const { t, fps } = useT();
  const k = cenaDe(t);
  const inicio = k === 0 && t >= UBER - 0.2;
  const nota = k === 9 && t >= ZERO - 0.2 && t < TENIS - 0.1;
  if (!inicio && !nota) return null;
  const t0 = inicio ? UBER - 0.2 : ZERO - 0.2;
  const s = mola(t, t0, fps, 10, 220);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 240, transform: `scale(${s})`, ...cartao, padding: "22px 30px", display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ fontSize: 90 }}>{inicio ? "🚗" : "⭐"}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 34, color: "#6b6f80" }}>{inicio ? "SUA MOTORISTA" : "NOTA DA MOTORISTA PRA VOCÊ"}</div>
        <div style={{ fontSize: 62 }}>{inicio ? "MÃE 👑 ⭐ 5,0" : "☆☆☆☆☆ 0,0"}</div>
      </div>
    </div>
  );
};

/** Termômetro: 35 °C derretendo → −5 °C congelado. */
const Termometro: React.FC = () => {
  const { t } = useT();
  if (t < S[3] || t >= S[4]) return null;
  const frio = t >= RECLAMAR + 0.1;
  return <div style={{ position: "absolute", right: 50, top: 240, ...cartao, padding: "8px 24px", fontSize: 72, color: frio ? COR.azul : COR.vermelho }}>{frio ? "❄ -5°C" : "🌡 35°C"}</div>;
};

/** Relógio do "minutinho": 0:01 → 40:00. */
const Minutinho: React.FC = () => {
  const { t } = useT();
  if (t < S[5] || t >= S[6]) return null;
  const m = Math.floor(rampa(t, S[5], QUARENTA + 0.4, 1, 40));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center" }}>
      <span style={{ ...cartao, padding: "10px 34px", fontSize: 120, display: "inline-block" }}>⏱ {m}:00</span>
    </div>
  );
};

/** Notas musicais pulando no ritmo. */
const Notas: React.FC = () => {
  const { t } = useT();
  if (t < MUSICA - 0.2 || t >= S[8]) return null;
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => {
        const d = (t * 0.7 + i * 0.13) % 1;
        return (
          <div key={i} style={{ position: "absolute", left: 160 + (i * 113) % 760 + Math.sin(t * 3 + i) * 40, top: 1150 - d * 800, opacity: 1 - d,
            fontSize: 100 + Math.abs(Math.sin(t * 9.4)) * 30, color: [COR.amarelo, COR.rosa, "#7fd3ff", COR.verde][i % 4], ...contorno(10) }}>{i % 2 ? "♪" : "♫"}</div>
        );
      })}
    </>
  );
};

/** Player do sermão de 10 minutos. */
const Sermao: React.FC = () => {
  const { t, fps } = useT();
  if (t < SERMAO - 0.3 || t >= S[9]) return null;
  const s = mola(t, SERMAO - 0.3, fps, 10, 220);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 240, transform: `scale(${s})`, ...cartao, background: "#dcf8c6", padding: "18px 28px", display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ fontSize: 64 }}>🗣</div>
      <div style={{ flex: 1, display: "flex", gap: 6, alignItems: "center", height: 70 }}>
        {Array.from({ length: 24 }).map((_, i) => <div key={i} style={{ width: 10, height: 14 + ((i * 37) % 50), borderRadius: 5, background: "#2e7d32" }} />)}
      </div>
      <div style={{ fontSize: 54 }}>10:00</div>
    </div>
  );
};

const SONS: { t: number; s: string; v: number }[] = [
  { t: 0, s: "whoosh", v: 0.6 }, { t: 0.15, s: "freio", v: 0.6 }, { t: FREIO + 0.08, s: "impacto", v: 0.7 }, { t: UBER - 0.2, s: "buzina", v: 0.5 },
  { t: PERGUNTA, s: "pop", v: 0.4 }, { t: S[2], s: "tecla", v: 0.35 }, { t: JANELA, s: "whoosh", v: 0.35 }, { t: COMER, s: "whoosh", v: 0.55 }, { t: COMER + 0.8, s: "pop", v: 0.45 },
  { t: S[3], s: "erro", v: 0.3 }, { t: RECLAMAR + 0.1, s: "impacto", v: 0.45 }, { t: RECLAMAR + 0.12, s: "plim", v: 0.4 },
  { t: MERCADO, s: "freio", v: 0.35 }, { t: MINUTINHO, s: "pop", v: 0.45 }, { t: S[5], s: "contagem", v: 0.35 }, { t: QUARENTA, s: "risco", v: 0.45 },
  { t: FALTA, s: "pop", v: 0.4 }, { t: RESPONDE, s: "erro", v: 0.35 }, { t: VOLTA - 0.15, s: "freio", v: 0.7 }, { t: VOLTA + 0.5, s: "impacto", v: 0.4 },
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ t: S[7] + 0.1 + i * (PI / 9.4), s: "grave", v: 0.45 })),
  { t: ATRASADO, s: "whoosh", v: 0.45 }, { t: SERMAO - 0.3, s: "pop", v: 0.45 }, { t: SERMAO + 0.5, s: "erro", v: 0.35 }, { t: SERMAO + 1.1, s: "piu", v: 0.55 },
  { t: ZERO, s: "martelo", v: 0.7 }, { t: TENIS, s: "martelo", v: 0.7 }, { t: TENIS + 0.25, s: "martelo", v: 0.6 },
  { t: GRACA, s: "plim", v: 0.45 }, { t: LANCHE, s: "plim", v: 0.5 },
  { t: NOTA, s: "pop", v: 0.4 }, { t: COMENTA, s: "pop", v: 0.5 }, { t: FIM - 0.1, s: "buzina", v: 0.5 }, { t: FIM, s: "freio", v: 0.45 },
];

export const ImaginaSoUber3D: React.FC = () => {
  const { t } = useT();
  const tr = TREMORES.map(([a, d, amp]) => tremor(t, a, d, amp * 100)).reduce((x, y) => soma(x, y), [0, 0, 0] as V3);
  const e = estado(t);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4fb6ff 0%, #bfe7ff 70%)" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #0b1030 0%, #2a3570 75%)", opacity: e.noite ?? 0 }} />
      <ThreeCanvas width={1080} height={1920} shadows flat camera={{ fov: 50, position: [0, 2.2, 8], near: 0.1, far: 300 }}>
        <Cena3D />
      </ThreeCanvas>
      <AbsoluteFill style={{ transform: `translate(${tr[0]}px, ${tr[1]}px)` }}>
        <Marca3D />
        {BANNERS.map((b, i) => <Faixa3D key={i} {...b} />)}
        <CartaoApp />
        <Termometro />
        <Minutinho />
        <Notas />
        <Sermao />
        <Balao3D t0={PERGUNTA} t1={S[2]} txt="Já foi no banheiro? 🚽" x={600} y={560} tam={54} letra={0.03} />
        <Balao3D t0={FALTA - 0.1} t1={RESPONDE} txt="Falta muito? 😩" x={380} y={560} tam={56} letra={0.03} />
        <Balao3D t0={RESPONDE} t1={VOLTA - 0.15} txt="Se perguntar de novo, volta pra casa!" x={540} y={560} tam={40} letra={0.025} />
        <Legenda3D fala={F} fim={UBER_3D_DUR} />
      </AbsoluteFill>
      <Flash picos={[FREIO, RECLAMAR + 0.1, ZERO, UBER_3D_DUR - 0.05]} />

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
