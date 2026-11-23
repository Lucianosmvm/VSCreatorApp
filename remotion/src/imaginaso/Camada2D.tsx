import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COR, mola, useT } from "./Bloco";

// Camada 2D dos vídeos 3D do Imagina Só: fala acelerada, legenda grande em blocos,
// faixas, balões, números subindo e flash.

type TimelineFala = { cenas: { dur: number; palavras: { w: string; t: number }[] }[] };
export type Palavra = { w: string; t: number; k: number };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]/g, "").toLowerCase();

/** Reposiciona a narração com velocidade `vel`, começando em `inicio` (s).
 *  S[k] = início da cena k; W(k, palavra, n) = instante da n-ésima ocorrência da palavra na cena k. */
export const montarFala = (tl: TimelineFala, { vel = 1.15, inicio = 0.35 } = {}) => {
  const S: number[] = [];
  let acc = inicio;
  tl.cenas.forEach((c) => { S.push(acc); acc += c.dur / vel; });
  const palavras: Palavra[] = tl.cenas.flatMap((c, k) => c.palavras.map((p) => ({ w: p.w, t: S[k] + p.t / vel, k })));
  const W = (k: number, w: string, n = 0) => {
    let c = 0;
    for (const p of tl.cenas[k].palavras) if (norm(p.w) === norm(w) && c++ === n) return S[k] + p.t / vel;
    throw new Error(`palavra "${w}" (#${n}) não está na cena ${k}`);
  };
  // blocos de legenda: até 3 palavras / 13 letras, quebra em pontuação e troca de cena
  const blocos: number[][] = [];
  let atual: number[] = [];
  const tam = (ids: number[]) => ids.map((j) => palavras[j].w).join(" ").length;
  palavras.forEach((p, i) => {
    if (atual.length && tam([...atual, i]) > 15) {
      blocos.push(atual);
      atual = [];
    }
    atual.push(i);
    const prox = palavras[i + 1];
    if (/[.,:;?!]$/.test(p.w) || atual.length >= 3 || tam(atual) >= 13 || !prox || prox.k !== p.k) {
      blocos.push(atual);
      atual = [];
    }
  });
  return { S, W, vel, palavras, blocos, fim: acc };
};
export type Fala = ReturnType<typeof montarFala>;

const contorno = (px: number) => ({ WebkitTextStroke: `${px}px ${COR.linha}`, paintOrder: "stroke fill" as const });

export const Legenda3D: React.FC<{ fala: Fala; fim: number; top?: number }> = ({ fala, fim, top = 1290 }) => {
  const { t } = useT();
  const { palavras, blocos } = fala;
  let atual = -1;
  blocos.forEach((b, i) => { if (t >= palavras[b[0]].t - 0.05) atual = i; });
  if (atual < 0) return null;
  const b = blocos[atual];
  const ate = atual + 1 < blocos.length ? palavras[blocos[atual + 1][0]].t : fim;
  if (t > ate + 0.3 && atual + 1 < blocos.length) return null;
  const ultima = palavras[b[b.length - 1]];
  if (t > ultima.t + 1.2) return null;
  const pop = mola(t, palavras[b[0]].t - 0.05, 30, 9, 260);
  const letras = b.map((i) => palavras[i].w).join(" ").length;
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top, textAlign: "center", transform: `scale(${0.6 + 0.4 * pop}) rotate(${(atual % 2 ? 1 : -1) * 2}deg)`,
      fontFamily: "Poppins", fontWeight: 900, fontSize: letras > 11 ? 104 : 130, lineHeight: 1.05, textTransform: "uppercase", ...contorno(22) }}>
      {b.map((i) => (
        <span key={i} style={{ color: t >= palavras[i].t ? COR.amarelo : "#ffffff", margin: "0 13px" }}>{palavras[i].w.replace(/[.,:;!]/g, "")}</span>
      ))}
    </div>
  );
};

export type Banner = { t0: number; t1: number; txt: string; y: number; tam: number; cor?: string };

export const Faixa3D: React.FC<Banner> = ({ t0, t1, txt, y, tam, cor = COR.amarelo }) => {
  const { t, fps } = useT();
  if (t < t0 || t > t1) return null;
  const s = mola(t, t0, fps, 8, 220);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", transform: `scale(${0.3 + 0.7 * s}) rotate(-4deg)`,
      fontFamily: "Poppins", fontWeight: 900, fontSize: tam, color: cor, lineHeight: 1, whiteSpace: "nowrap", textShadow: `0 12px 0 ${COR.roxo}`, ...contorno(18) }}>{txt}</div>
  );
};

/** Balão de fala com texto digitado (`letra` = segundos por letra; 0 = tudo de uma vez). */
export const Balao3D: React.FC<{ t0: number; t1: number; txt: string; x: number; y: number; tam?: number; letra?: number }> = ({ t0, t1, txt, x, y, tam = 64, letra = 0 }) => {
  const { t, fps } = useT();
  if (t < t0 || t > t1) return null;
  const s = mola(t, t0, fps, 10, 240);
  const n = letra > 0 ? Math.min(txt.length, Math.floor((t - t0) / letra) + 1) : txt.length;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, 0) scale(${s})`, transformOrigin: "50% 100%" }}>
      <div style={{ background: "#ffffff", border: `8px solid ${COR.linha}`, borderRadius: 36, padding: "20px 34px", fontFamily: "Poppins", fontWeight: 900,
        fontSize: tam, color: COR.linha, whiteSpace: "nowrap", boxShadow: "0 12px 0 rgba(0,0,0,.25)" }}>
        {txt.slice(0, n)}<span style={{ opacity: 0 }}>{txt.slice(n)}</span>
      </div>
      <div style={{ position: "absolute", left: "50%", bottom: -34, width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent",
        borderTop: `40px solid ${COR.linha}`, transform: "translateX(-50%)" }} />
    </div>
  );
};

/** Número/texto que sobe e some (+100 HP). */
export const Sobe3D: React.FC<{ t0: number; txt: string; x: number; y: number; cor?: string; tam?: number }> = ({ t0, txt, x, y, cor = COR.amarelo, tam = 96 }) => {
  const { t } = useT();
  const d = t - t0;
  if (d < 0 || d > 1.6) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y - d * 160, transform: `translateX(-50%) scale(${Math.min(1, d * 6)})`, opacity: d > 1.1 ? 1 - (d - 1.1) / 0.5 : 1,
      fontFamily: "Poppins", fontWeight: 900, fontSize: tam, color: cor, whiteSpace: "nowrap", ...contorno(16) }}>{txt}</div>
  );
};

/** Clarão branco nos instantes `picos`. */
export const Flash: React.FC<{ picos: number[] }> = ({ picos }) => {
  const { t } = useT();
  const o = Math.max(0, ...picos.map((p) => interpolate(t, [p - 0.02, p, p + 0.2], [0, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  return <AbsoluteFill style={{ background: "#ffffff", opacity: o, pointerEvents: "none" }} />;
};

export const Marca3D: React.FC = () => (
  <div style={{ position: "absolute", left: 30, top: 54, background: "#241c46", border: "6px solid #1b1530", borderRadius: 22, padding: "10px 22px",
    fontFamily: "Poppins", fontWeight: 900, fontSize: 34, color: COR.amarelo, boxShadow: "0 8px 0 rgba(0,0,0,.25)" }}>💭 IMAGINA SÓ</div>
);
