import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Palavra } from "../tipos";

// Acha o primeiro número dito na cena ("R$ 1.200", "35%", "1997", "12x") e o
// tempo em que ele é falado. É o que vira o cartão grande no meio da tela.
export function acharDestaque(palavras: Palavra[]): { texto: string; t: number; valor: number; prefixo: string; sufixo: string } | null {
  for (let i = 0; i < palavras.length; i++) {
    const w = palavras[i].w.replace(/[,.;:!?]+$/, "");
    const m = w.match(/^(R\$)?(\d[\d.]*(?:,\d+)?)(%|x|mil)?$/i);
    if (!m) continue;
    let prefixo = m[1] || "";
    let sufixo = m[3] || "";
    // "R$" falado como palavra separada antes do número
    if (!prefixo && i > 0 && /^R\$$/i.test(palavras[i - 1].w)) prefixo = "R$";
    const prox = palavras[i + 1]?.w.toLowerCase().replace(/[,.;:!?]+$/, "");
    if (!sufixo && prox === "mil") sufixo = " mil";
    if (!sufixo && (prox === "%" || prox === "porcento")) sufixo = "%";
    if (sufixo.toLowerCase() === "mil") sufixo = " mil";
    const valor = parseFloat(m[2].replace(/\./g, "").replace(",", "."));
    if (!isFinite(valor)) continue;
    const texto = `${prefixo}${prefixo ? " " : ""}${m[2]}${sufixo}`;
    return { texto, t: palavras[i].t, valor, prefixo, sufixo };
  }
  return null;
}

const formatar = (n: number, ref: string) => {
  const casas = ref.includes(",") ? ref.split(",")[1].length : 0;
  // ano não leva separador de milhar
  if (/^\d{4}$/.test(ref)) return String(Math.round(n));
  return n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
};

// Cartão com o número contando até o valor, entrando no quadro em que ele é dito.
export const Destaque: React.FC<{ palavras: Palavra[] }> = ({ palavras }) => {
  const frame = useCurrentFrame();
  // tamanhos pelo lado menor: vale igual para 9:16 e 16:9
  const { fps, width: largura, height } = useVideoConfig();
  const width = Math.min(largura, height);
  const d = acharDestaque(palavras);
  if (!d) return null;

  const ini = Math.round(d.t * fps) - 3;   // 3 quadros antes: o olho chega junto com a voz
  const s = spring({ frame: frame - ini, fps, config: { damping: 11, stiffness: 160 } });
  if (frame < ini) return null;

  const contagem = interpolate(frame - ini, [0, 0.7 * fps], [0, d.valor], { extrapolateRight: "clamp" });
  const ref = d.texto.replace(/^R\$\s*/, "").replace(/(%| mil|x)$/i, "");
  const numero = /^\d{4}$/.test(ref) ? ref : formatar(contagem, ref);
  const tremor = Math.sin((frame - ini) * 1.3) * interpolate(frame - ini, [0, 10], [6, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          marginTop: "-25%",
          transform: `scale(${s}) rotate(${-3 + tremor * 0.3}deg)`,
          background: "linear-gradient(135deg,#FFD23F,#FF8A00)",
          color: "#1a1a1a",
          fontFamily: "Poppins",
          fontWeight: 900,
          fontSize: width * 0.16,
          padding: `${width * 0.02}px ${width * 0.06}px`,
          borderRadius: width * 0.04,
          boxShadow: "0 30px 60px rgba(0,0,0,.45)",
          border: `${width * 0.008}px solid #1a1a1a`,
          whiteSpace: "nowrap",
        }}
      >
        {d.prefixo && <span style={{ fontSize: "0.5em", marginRight: "0.15em" }}>{d.prefixo}</span>}
        {numero}
        {d.sufixo && <span style={{ fontSize: "0.55em" }}>{d.sufixo}</span>}
      </div>
    </AbsoluteFill>
  );
};
