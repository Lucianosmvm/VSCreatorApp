import type { Palavra } from "../../tipos";

/** Segundos locais ou uma palavra da narração. Ocorrências começam em 1. */
export type Momento = number | { palavra: string; ocorrencia?: number; deslocamento?: number };
export type Estado = {
  x: number; y: number; escala: number; giro: number; opacidade: number;
  bracoEsq: number; bracoDir: number; cabeca: number; abertura: number;
};
export type Chave = Partial<Estado> & { em: Momento; curva?: "suave" | "linear" };
export const BASE: Estado = {
  x: 50, y: 80, escala: 1, giro: 0, opacidade: 1,
  bracoEsq: 0, bracoDir: 0, cabeca: 0, abertura: 0,
};
const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Palavra ausente não dispara uma ação: fica no fim, fora da cena. */
export function segundo(em: Momento, palavras: Palavra[]): number {
  if (typeof em === "number") return em;
  let faltam = em.ocorrencia ?? 1;
  for (const p of palavras) {
    if (normalizar(p.w) === normalizar(em.palavra) && --faltam === 0) {
      return Math.max(0, p.t + (em.deslocamento ?? 0));
    }
  }
  return Infinity;
}

/** Cada propriedade tem sua própria trilha; chaves esparsas não interrompem outras. */
export function estadoEm(base: Partial<Estado>, chaves: Chave[], t: number, palavras: Palavra[]): Estado {
  const estado = { ...BASE, ...base };
  const ordenadas = chaves.map((c) => ({ ...c, tempo: segundo(c.em, palavras) }))
    .filter((c) => Number.isFinite(c.tempo)).sort((a, b) => a.tempo - b.tempo);
  for (const campo of Object.keys(BASE) as (keyof Estado)[]) {
    let anterior = { tempo: 0, valor: estado[campo] };
    for (const c of ordenadas) {
      const valor = c[campo];
      if (valor === undefined) continue;
      if (t >= c.tempo) { anterior = { tempo: c.tempo, valor }; continue; }
      const p = Math.max(0, Math.min(1, (t - anterior.tempo) / Math.max(0.001, c.tempo - anterior.tempo)));
      const curva = c.curva === "linear" ? p : p * p * (3 - 2 * p);
      estado[campo] = anterior.valor + (valor - anterior.valor) * curva;
      break;
    }
    // Depois da última chave, mantém o último estado.
    if (!ordenadas.some((c) => c[campo] !== undefined && c.tempo > t)) estado[campo] = anterior.valor;
  }
  return estado;
}
