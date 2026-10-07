import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Cena } from "../tipos";
import { FundoAnimado } from "./FundoAnimado";
import { Mascote, poseDaCena, type Reacao } from "./Mascote";

// ── tempo pela palavra ───────────────────────────────────────────────────
// As cenas especiais marcam os eventos pela PALAVRA falada, não por segundo
// fixo: se a narração for refeita, a animação acompanha sozinha.
const limpa = (w: string) =>
  w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9#&|!?=<>]/g, "")
    // "aparece?" e "true!" = palavra; "?" e "!" sozinhos continuam símbolo
    .replace(/([a-z0-9])[?!]+$/, "$1");

/** segundo (relativo à cena) em que a n-ésima ocorrência de `palavra` é dita */
export function em(cena: Cena, palavra: string, ocorrencia = 1): number {
  const alvo = limpa(palavra);
  let n = 0;
  for (const p of cena.palavras) {
    if (limpa(p.w) === alvo && ++n === ocorrencia) return p.t;
  }
  return 0; // não achou: mostra desde o início em vez de nunca
}

// ── realce de sintaxe simples (C#) ──────────────────────────────────────
const CORES = {
  palavra: "#ff8f6b",
  tipo: "#7fc8ff",
  texto: "#b7e07a",
  numero: "#ffd23f",
  comentario: "#6f7a63",
  op: "#f2ead8",
  base: "#e8e2d2",
};
const CHAVES = new Set(["if", "else", "return", "switch", "true", "false", "null", "new", "var"]);
const TIPOS = new Set(["int", "string", "bool", "Console", "void"]);

function colorir(linha: string) {
  const partes: { t: string; c: string }[] = [];
  const re = /(\/\/.*$)|("[^"]*")|(\b\d+\b)|([A-Za-z_]\w*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(linha))) {
    const [tok, com, str, num, id] = m;
    let c = CORES.op;
    if (com) c = CORES.comentario;
    else if (str) c = CORES.texto;
    else if (num) c = CORES.numero;
    else if (id) c = CHAVES.has(id) ? CORES.palavra : TIPOS.has(id) ? CORES.tipo : CORES.base;
    partes.push({ t: tok, c });
  }
  return partes;
}

// ── painel de código ─────────────────────────────────────────────────────
export type Linha = {
  txt: string;
  t?: number;          // quando a linha é digitada (padrão: já está lá)
  marca?: number;      // quando ganha realce de fundo
  corMarca?: string;
  risca?: number;      // quando é riscada (código errado / ignorado)
  apaga?: number;      // quando fica apagada (bloco pulado)
  ok?: number;         // quando ganha ✓
  erro?: number;       // quando ganha ✗
};
export type Saida = { txt: string; t: number; cor?: string };

const Painel: React.FC<{ titulo: string; linhas: Linha[]; saida?: Saida[]; escala?: number }> = ({ titulo, linhas, saida = [], escala = 1 }) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const t = frame / fps;
  // 16:9: painel à direita do mascote; 9:16: painel no alto, largura toda
  const empe = height > width;
  const larguraPainel = width * (empe ? 0.92 : 0.63);
  // a linha mais longa tem que caber: monoespaçada ≈ 0,6 da fonte por caractere
  const maiorLinha = Math.max(16, ...linhas.map((l) => l.txt.length + (l.ok !== undefined || l.erro !== undefined ? 2 : 0)));
  const fonte = Math.min(height * 0.042, (larguraPainel * 0.9) / (maiorLinha * 0.6)) * escala;
  const entra = spring({ frame, fps, config: { damping: 14, stiffness: 130 } });

  return (
    <div
      style={{
        position: "absolute",
        left: empe ? "4%" : "33%",
        right: "4%",
        top: empe ? "7%" : "9%",
        maxHeight: empe ? "44%" : "62%",
        background: "rgba(14,16,11,.92)",
        border: "2px solid #4b5a35",
        borderRadius: fonte * 0.6,
        boxShadow: "0 30px 70px rgba(0,0,0,.55)",
        overflow: "hidden",
        transform: `translateY(${(1 - entra) * 60}px) scale(${0.94 + 0.06 * entra})`,
        opacity: entra,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: fonte * 0.3, padding: `${fonte * 0.45}px ${fonte * 0.7}px`, background: "#1d2416", borderBottom: "2px solid #2e3823" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: fonte * 0.42, height: fonte * 0.42, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ marginLeft: fonte * 0.4, fontFamily: "Poppins", fontWeight: 800, fontSize: fonte * 0.62, color: "#d8c3a0" }}>{titulo}</div>
      </div>
      <div style={{ padding: `${fonte * 0.6}px ${fonte * 0.8}px`, fontFamily: "Consolas, 'Courier New', monospace", fontSize: fonte, lineHeight: 1.45 }}>
        {linhas.map((l, i) => {
          const ini = l.t ?? -1;
          if (t < ini) return null;
          // digitação rápida (~0,3 s): a linha precisa estar inteira antes do corte
          const vis = ini < 0 ? l.txt.length : Math.floor(interpolate(t - ini, [0, 0.3], [0, l.txt.length], { extrapolateRight: "clamp" }));
          let resto = vis;
          const marcada = l.marca !== undefined && t >= l.marca;
          const riscada = l.risca !== undefined && t >= l.risca;
          const apagada = l.apaga !== undefined && t >= l.apaga;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                whiteSpace: "pre",
                borderRadius: fonte * 0.2,
                padding: `0 ${fonte * 0.2}px`,
                background: marcada ? l.corMarca ?? "rgba(255,210,63,.18)" : "transparent",
                opacity: apagada ? 0.28 : 1,
                textDecoration: riscada ? "line-through" : undefined,
                textDecorationColor: "#ff5f57",
                textDecorationThickness: fonte * 0.09,
              }}
            >
              <span>
                {colorir(l.txt).map((p, k) => {
                  const pedaco = p.t.slice(0, Math.max(0, resto));
                  resto -= p.t.length;
                  return (
                    <span key={k} style={{ color: p.c }}>
                      {pedaco}
                    </span>
                  );
                })}
              </span>
              {l.ok !== undefined && t >= l.ok && <Selo txt="✓" cor="#28c840" desde={l.ok} fonte={fonte} />}
              {l.erro !== undefined && t >= l.erro && <Selo txt="✗" cor="#ff5f57" desde={l.erro} fonte={fonte} />}
            </div>
          );
        })}
        {saida.some((s) => t >= s.t) && (
          <div style={{ marginTop: fonte * 0.5, paddingTop: fonte * 0.4, borderTop: "2px dashed #2e3823" }}>
            {saida.map((s, i) =>
              t >= s.t ? (
                <div key={i} style={{ color: s.cor ?? "#28c840", fontWeight: 700 }}>
                  {"> "}
                  {s.txt}
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Selo: React.FC<{ txt: string; cor: string; desde: number; fonte: number }> = ({ txt, cor, desde, fonte }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - Math.round(desde * fps), fps, config: { damping: 10, stiffness: 200 } });
  return (
    <span style={{ marginLeft: fonte * 0.5, color: cor, fontWeight: 900, fontFamily: "Poppins", transform: `scale(${s})`, display: "inline-block" }}>{txt}</span>
  );
};

// ── fichas: blocos grandes que entram na hora da palavra ─────────────────
export type Ficha = { txt: string; t: number; sub?: string; cor?: string; texto?: string; risca?: number };

const Fichas: React.FC<{ fichas: Ficha[]; colunas?: number }> = ({ fichas, colunas }) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const empe = height > width;
  const fonte = Math.min(width, height) * (empe ? 0.1 : 0.075);
  const cols = Math.min(colunas ?? Math.min(fichas.length, 3), empe ? 3 : 5);
  const celula = (width * (empe ? 0.9 : 0.63)) / cols;
  return (
    <div
      style={{
        position: "absolute",
        left: empe ? "5%" : "33%",
        right: empe ? "5%" : "4%",
        top: empe ? "8%" : "8%",
        height: empe ? "40%" : "62%",
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        alignContent: "center",
        gap: fonte * 0.35,
      }}
    >
      {fichas.map((f, i) => {
        const s = spring({ frame: frame - Math.round(f.t * fps), fps, config: { damping: 12, stiffness: 170 } });
        const riscada = f.risca !== undefined && frame / fps >= f.risca;
        return (
          <div
            key={i}
            style={{
              opacity: s,
              transform: `translateY(${(1 - s) * 50}px) scale(${0.7 + 0.3 * s})`,
              background: f.cor ?? "#d8c3a0",
              color: f.texto ?? "#14170f",
              borderRadius: fonte * 0.3,
              padding: `${fonte * 0.35}px ${fonte * 0.3}px`,
              textAlign: "center",
              boxShadow: "0 18px 40px rgba(0,0,0,.45)",
              textDecoration: riscada ? "line-through" : undefined,
            }}
          >
            <div style={{ fontFamily: "Consolas, monospace", fontWeight: 900, fontSize: Math.min(fonte, (celula * 0.8) / (f.txt.length * 0.6)), lineHeight: 1.1 }}>{f.txt}</div>
            {f.sub && <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: fonte * 0.32, marginTop: fonte * 0.12, textTransform: "uppercase" }}>{f.sub}</div>}
          </div>
        );
      })}
    </div>
  );
};

// ── layouts prontos para usar como cena especial ─────────────────────────
// Mascote à esquerda, conteúdo à direita, legenda embaixo (vem do Video).
const Base: React.FC<{ cena: Cena; indice: number; reacoes: Reacao[]; tipoConteudo: "codigo" | "fichas"; children: React.ReactNode }> = ({ cena, indice, reacoes, tipoConteudo, children }) => {
  const ultima = cena.palavras[cena.palavras.length - 1];
  // de corpo inteiro, vira de lado para "olhar" o painel à direita
  const pedida = poseDaCena(cena.mascote, cena.palavras, indice);
  // painel de código: digitando no notebook; fichas: braços cruzados, conferindo
  // ao lado de painel sempre corpo inteiro (busto ficaria cortado e sem as
  // poses de reação); a pose pedida só vale se já for de corpo
  const corpo = !["neutro", "feliz", "determinado", "frente", "costas", "lado"].includes(pedida);
  const pose = corpo ? pedida : tipoConteudo === "codigo" ? "digitando" : "bracos";
  return (
    <AbsoluteFill>
      <FundoAnimado indice={indice} />
      {/* indice 0 = mascote sempre à esquerda, longe do painel */}
      <Mascote pose={pose} palavras={cena.palavras} indice={0} fimFala={ultima ? ultima.t + 0.4 : cena.dur} reacoes={reacoes} />
      {children}
    </AbsoluteFill>
  );
};

type Montador<T> = (cena: Cena) => T;

// Reações tiradas do próprio conteúdo: ✓ comemora, ✗ / saída vermelha treme,
// linha marcada ou ficha nova = olha para o painel. `extra` soma reações à mão.
function reacoesDoCodigo(linhas: Linha[], saida: Saida[] = []): Reacao[] {
  const r: Reacao[] = [];
  for (const l of linhas) {
    if (l.ok !== undefined) r.push({ t: l.ok, tipo: "ok" });
    if (l.erro !== undefined) r.push({ t: l.erro, tipo: "erro" });
    if (l.marca !== undefined) r.push({ t: l.marca, tipo: "olha" });
  }
  for (const s of saida) r.push({ t: s.t, tipo: s.cor && s.cor !== "#28c840" ? "erro" : "ok" });
  return r;
}

export const codigo =
  (f: Montador<{ titulo?: string; linhas: Linha[]; saida?: Saida[]; escala?: number; extra?: Reacao[] }>) =>
  ({ cena, indice }: { cena: Cena; indice: number }) => {
    const bruto = f(cena);
    // linha que começasse a ser digitada colada no corte terminaria a cena pela
    // metade ("Dia úti") ou sem tempo de ler: nada começa no último 1 s
    const limite = Math.max(0, cena.dur - 1.0);
    const d = { ...bruto, linhas: bruto.linhas.map((l) => (l.t !== undefined && l.t > limite ? { ...l, t: limite } : l)) };
    return (
      <Base cena={cena} indice={indice} reacoes={[...reacoesDoCodigo(d.linhas, d.saida), ...(d.extra ?? [])]} tipoConteudo="codigo">
        <Painel titulo={d.titulo ?? cena.titulo ?? "Program.cs"} linhas={d.linhas} saida={d.saida} escala={d.escala} />
      </Base>
    );
  };

export const fichas =
  (f: Montador<{ fichas: Ficha[]; colunas?: number; extra?: Reacao[] }>) =>
  ({ cena, indice }: { cena: Cena; indice: number }) => {
    const d = f(cena);
    const reacoes: Reacao[] = d.fichas.map((x) => ({ t: x.t, tipo: x.cor === "#ff5f57" ? "erro" : "olha" }));
    return (
      <Base cena={cena} indice={indice} reacoes={[...reacoes, ...(d.extra ?? [])]} tipoConteudo="fichas">
        <Fichas fichas={d.fichas} colunas={d.colunas} />
      </Base>
    );
  };
