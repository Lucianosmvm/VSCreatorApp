import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Palavra, Timeline } from "../tipos";


// A narração fala "C sharp" (a ElevenLabs erra "C#"), mas na tela fica "C#".
// Junta as duas palavras na hora da primeira; pontuação do "sharp" é mantida.
export function juntarParaTela(palavras: Palavra[]): Palavra[] {
  const out: Palavra[] = [];
  for (let i = 0; i < palavras.length; i++) {
    const p = palavras[i];
    const prox = palavras[i + 1];
    const m = prox && /^c$/i.test(p.w) && prox.w.match(/^sharp([.,;:!?]*)$/i);
    if (m) {
      out.push({ w: "C#" + m[1], t: p.t });
      i++;
    } else out.push(p);
  }
  return out;
}

// Frases de leitura, cortadas pelo TEMPO de leitura: uma frase só termina numa
// pausa natural (vírgula, ponto...) depois de ficar ~2,2 s na tela, e nunca
// passa de MAX_FRASE palavras (2 linhas). Cortar em toda vírgula deixava
// metade das legendas com menos de 1,5 s — rápido demais para quem só lê.
const MAX_FRASE = 12;
const LEITURA_MIN = 2.2; // segundos

export function frasesDe(palavras: Palavra[]): Palavra[][] {
  const frases: Palavra[][] = [];
  let atual: Palavra[] = [];
  palavras.forEach((p, i) => {
    atual.push(p);
    const prox = palavras[i + 1];
    const duracao = (prox ? prox.t : p.t + 0.6) - atual[0].t;
    const pausa = /[.,;:!?]$/.test(p.w);
    const fimDeFrase = /[.!?]$/.test(p.w);
    if (atual.length >= MAX_FRASE || (pausa && duracao >= LEITURA_MIN) || (fimDeFrase && duracao >= LEITURA_MIN * 0.7)) {
      frases.push(atual);
      atual = [];
    }
  });
  if (atual.length) {
    // sobra curtinha no fim cola na anterior, se ainda couber em 2 linhas
    const ant = frases[frases.length - 1];
    if (ant && atual.length < 4 && ant.length + atual.length <= MAX_FRASE + 2) ant.push(...atual);
    else frases.push(atual);
  }
  return frases;
}

// Legenda de LEITURA com destaque karaokê. Antes eram 3 palavras por vez, cada
// uma surgindo só quando falada: a cada ~1 s o bloco sumia, e quem assiste sem
// som (no ônibus, sem fone) não conseguia acompanhar. Agora a frase inteira
// aparece de uma vez, em até 2 linhas, e fica até a próxima começar; a palavra
// falada continua acesa em amarelo.
export const Legenda: React.FC<{ palavras: Palavra[]; legenda: Timeline["legenda"] }> = ({ palavras: faladas, legenda }) => {
  const palavras = juntarParaTela(faladas);
  const frame = useCurrentFrame();
  // tamanhos pelo lado menor: vale igual para 9:16 e 16:9
  const { fps, width: largura, height } = useVideoConfig();
  const width = Math.min(largura, height);
  const t = frame / fps;
  if (!palavras.length) return null;

  const frases = frasesDe(palavras);
  // a frase entra um pouco antes da 1ª palavra: o olho chega junto com a voz
  const ANTES = 0.15;
  let fi = -1;
  while (fi + 1 < frases.length && frases[fi + 1][0].t - ANTES <= t) fi++;
  if (fi < 0) return null;
  const frase = frases[fi];

  // palavra sendo falada agora (para o destaque)
  let atual = -1;
  for (let k = 0; k < frase.length; k++) if (frase[k].t <= t) atual = k;

  // cabe em 2 linhas: pelo total de letras, e a palavra mais longa numa linha
  const letras = frase.reduce((a, p) => a + p.w.length + 1, 0);
  const maior = Math.max(...frase.map((p) => p.w.length));
  const linhaUtil = largura * 0.86;
  const tamanho = Math.round(Math.min(width * 0.07, (linhaUtil * 2) / (letras * 0.66), linhaUtil / (maior * 0.68)));
  const caixa = legenda.estilo === "box";

  // entrada suave da frase (uma vez só, sem pulo por palavra)
  const iniFrase = Math.round((frase[0].t - ANTES) * fps);
  // começa em 0,5 de opacidade: na troca de frase a tela nunca fica vazia
  const entra = interpolate(frame - iniFrase, [0, 0.15 * fps], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: `${legenda.pos}%`,
          transform: `translateY(calc(-50% + ${(1 - entra) * 12}px))`,
          opacity: entra,
          width: "88%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `0 ${tamanho * 0.32}px`,
          fontFamily: "Poppins",
          fontWeight: 800,
          fontSize: tamanho,
          lineHeight: 1.2,
          textTransform: "uppercase",
          // fundo escuro discreto atrás da frase: lê em qualquer cena
          background: caixa ? undefined : "rgba(10,12,8,.45)",
          borderRadius: tamanho * 0.3,
          padding: `${tamanho * 0.12}px ${tamanho * 0.35}px`,
          boxSizing: "border-box",
        }}
      >
        {frase.map((p, k) => {
          const ativa = k === atual;
          return (
            <span
              key={k}
              style={{
                display: "inline-block",
                color: ativa ? "#FFD23F" : "white",
                WebkitTextStroke: caixa ? undefined : `${tamanho * 0.08}px black`,
                paintOrder: "stroke fill",
                background: caixa ? "rgba(0,0,0,.65)" : undefined,
                padding: caixa ? "0 .15em" : undefined,
                borderRadius: caixa ? 12 : undefined,
                textShadow: caixa ? undefined : "0 4px 12px rgba(0,0,0,.5)",
              }}
            >
              {p.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
