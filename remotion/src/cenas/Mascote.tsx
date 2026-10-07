import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Palavra } from "../tipos";
import { acharDestaque } from "./Destaque";

// Recortes da folha de personagem (MascoteRef/mascote.jpeg).
const CORPO = ["frente", "lado", "costas",
  // geradas na Replicate a partir da folha (MascoteRef/geradas/)
  "apontando", "digitando", "pensando", "comemorando", "surpreso",
  "desconfiado", "cocando", "bracos", "acenando", "sentado",
  "explicando", "confiante", "tapando", "alcas", "lupa", "cafe", "triste", "pulando", "correndo",
  "placa", "ideia", "animado", "paz", "perfil"];
// desenhadas olhando/apontando para a esquerda: espelhar quando o conteúdo está à direita
const OLHA_ESQ = ["apontando", "explicando", "lupa", "perfil"];

// Área branca da placa em placa.png, em % do sprite (medida no recorte).
const PLACA = { x: 5.4, y: 37.4, w: 88.8, h: 37.9 };
const PLACA_PROPORCAO = 0.572; // largura / altura do sprite
const BUSTO = ["neutro", "feliz", "determinado"];
export const POSES = [...CORPO, ...BUSTO];

// Sem pose no roteiro, escolhe uma: número na fala pede cara de determinado;
// pergunta ou exclamação pede feliz; o resto alterna o corpo inteiro.
export function poseDaCena(pedida: string | undefined, palavras: Palavra[], indice: number): string {
  if (pedida && POSES.includes(pedida)) return pedida;
  if (acharDestaque(palavras)) return "determinado";
  const txt = palavras.map((p) => p.w).join(" ");
  if (/\?\s*$/.test(txt)) return "pensando";
  if (/!\s*$/.test(txt)) return "feliz";
  return ["frente", "bracos", "lado", "neutro", "acenando", "pensando"][indice % 6];
}

// Reação a algo que acontece na cena, no segundo em que acontece:
//   ok    → pulo alto de comemoração (e cara de feliz, se for busto)
//   erro  → tremida (e cara de determinado, se for busto)
//   olha  → inclina na direção do conteúdo, como quem confere
//   pose  → troca de pose a partir dali (ex.: { t: 2.1, tipo: "pose", pose: "feliz" })
export type Reacao = { t: number; tipo: "ok" | "erro" | "olha" | "pose"; pose?: string };

const DUR = { ok: 0.7, erro: 0.6, olha: 0.9 };

// O mascote não tem boca, então "falar" é corpo: um pulinho curto a cada
// palavra dita, respiração quando está calado, e entrada com mola.
export const Mascote: React.FC<{ pose: string; palavras: Palavra[]; indice: number; fimFala: number; reacoes?: Reacao[]; placa?: string }> = ({ pose: poseBase, palavras, indice, fimFala, reacoes = [], placa }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const lado = indice % 2 === 0 ? "esq" : "dir";
  const dirConteudo = lado === "esq" ? 1 : -1; // o conteúdo fica do lado oposto

  // pose atual: a base, trocada pela última reação "pose" já ocorrida, e por
  // um rosto temporário durante ok/erro quando o mascote está de busto
  let pose = poseBase;
  for (const r of reacoes) if (r.tipo === "pose" && r.pose && t >= r.t) pose = r.pose;
  let comemora = 0, treme = 0, olha = 0;
  for (const r of reacoes) {
    const dt = t - r.t;
    if (dt < 0) continue;
    if (r.tipo === "ok" && dt < DUR.ok) comemora = Math.max(comemora, Math.sin((dt / DUR.ok) * Math.PI));
    if (r.tipo === "erro" && dt < DUR.erro) treme = Math.max(treme, 1 - dt / DUR.erro);
    if (r.tipo === "olha" && dt < DUR.olha) olha = Math.max(olha, Math.sin((dt / DUR.olha) * Math.PI));
  }
  // durante a reação a pose muda: de busto troca o rosto, de corpo inteiro
  // usa as poses geradas (comemora no ✓, surpreso no ✗, aponta no destaque)
  const deBusto = BUSTO.includes(pose);
  let ultimaReacao = -1;
  for (const r of reacoes) {
    const dt = t - r.t;
    if (dt < 0 || r.t < ultimaReacao) continue;
    // alterna entre duas poses para a mesma reação não ficar repetitiva
    const vez = Math.round(r.t * 10) % 2;
    if (r.tipo === "ok" && dt < 1.4) { pose = deBusto ? "feliz" : vez ? "pulando" : "comemorando"; ultimaReacao = r.t; }
    if (r.tipo === "erro" && dt < 1.4) { pose = deBusto ? "determinado" : vez ? "tapando" : "surpreso"; ultimaReacao = r.t; }
    if (r.tipo === "olha" && dt < 1.0 && !deBusto) { pose = "apontando"; ultimaReacao = r.t; }
  }
  const busto = BUSTO.includes(pose);

  const entrada = spring({ frame, fps, config: { damping: 13, stiffness: 120 } });
  const respira = Math.sin(t * Math.PI * 1.1) * 0.012;

  // Falando: balanço suave e contínuo (~1 por segundo), que entra e sai
  // devagar com a fala. Um pulinho por palavra ficava frenético (~3/s).
  const inicioFala = palavras.length ? palavras[0].t : 0;
  const envelope =
    interpolate(t, [inicioFala, inicioFala + 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(t, [fimFala - 0.3, fimFala + 0.3], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const balanco = Math.sin((t - inicioFala) * Math.PI * 2 * 0.9) * envelope;
  // pulinho só no começo de cada frase: 1ª palavra e a que vem depois de , . : ? !
  let pulo = 0;
  palavras.forEach((p, i) => {
    const comecaFrase = i === 0 || /[,.;:!?]$/.test(palavras[i - 1].w);
    const dt = t - p.t;
    if (comecaFrase && dt >= 0 && dt < 0.35) pulo = Math.max(pulo, Math.sin((dt / 0.35) * Math.PI));
  });
  // no 16:9 sobra largura: o mascote pode ocupar bem mais da altura
  const deitado = width > height;
  // em pé o mascote fica embaixo, abaixo da legenda e do painel
  const altura = busto ? height * (deitado ? 0.55 : 0.3) : height * (deitado ? 0.78 : 0.4);
  const sobe = pulo * height * 0.014 + Math.abs(balanco) * height * 0.004 + comemora * height * 0.09;
  const inclina = balanco * 1.6 + (lado === "esq" ? -1 : 1) * pulo * 1.2 + dirConteudo * olha * 6 + comemora * dirConteudo * -4;
  const tremeX = treme * Math.sin(t * 60) * height * 0.012;
  const estica = 1 + comemora * 0.05;
  // "lado" foi desenhado olhando para a direita; do lado direito da tela vira
  const olhaDir = !OLHA_ESQ.includes(pose);
  // poses de perfil olham para o centro da tela: "lado"/"correndo" vão para a direita,
  // as de OLHA_ESQ para a esquerda — espelha quando estiverem do lado errado
  const perfil = pose === "lado" || pose === "correndo" || OLHA_ESQ.includes(pose);
  const espelha = perfil && (olhaDir ? lado === "dir" : lado === "esq") ? -1 : 1;

  const deslocX = interpolate(entrada, [0, 1], [lado === "esq" ? -width * 0.5 : width * 0.5, 0]) + tremeX + dirConteudo * olha * width * 0.015;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          bottom: busto ? "-2%" : "4%",
          [lado === "esq" ? "left" : "right"]: busto ? "-3%" : "2%",
          height: altura,
          transform: `translateX(${deslocX}px) translateY(${-sobe}px) rotate(${inclina}deg) scaleY(${(1 + respira) * estica}) scaleX(${espelha / estica})`,
          transformOrigin: "bottom center",
          filter: "drop-shadow(0 18px 24px rgba(0,0,0,.55))",
        }}
      >
        <Img src={staticFile(`mascote/${pose}.png`)} style={{ height: "100%" }} />
        {pose === "placa" && placa && (
          <div
            style={{
              position: "absolute",
              left: `${PLACA.x}%`, top: `${PLACA.y}%`, width: `${PLACA.w}%`, height: `${PLACA.h}%`,
              display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
              padding: "6%", boxSizing: "border-box",
              fontFamily: "Poppins", fontWeight: 900, color: "#1d2416", lineHeight: 1.05,
              textTransform: "uppercase", overflowWrap: "anywhere",
              // cabe na placa: pela altura e pelo comprimento do texto
              fontSize: Math.min(altura * 0.12, (altura * PLACA_PROPORCAO * PLACA.w / 100 * 0.85) / (Math.max(4, Math.min(placa.length, 12)) * 0.62)),
            }}
          >
            {placa}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
