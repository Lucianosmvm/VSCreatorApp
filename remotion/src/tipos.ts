// Formato do timeline.json que o index.html exporta DEPOIS da narração.
// Todos os tempos já estão no relógio do vídeo final: silêncio das pontas
// cortado, pausas e transições aplicadas. O Remotion não recalcula nada disso,
// só converte segundos em quadros — é isso que garante o sincronismo.

export type Palavra = {
  w: string;
  // segundo, relativo ao início da cena, em que a palavra começa a ser falada
  t: number;
};

export type Cena = {
  inicio: number;     // segundo em que a cena começa no vídeo
  dur: number;        // duração da cena (inclui a pausa depois da fala)
  janela: number;     // dissolve no fim desta cena, dentro da pausa
  texto: string;
  palavras: Palavra[];
  imagem?: string;    // arquivo dentro da pasta do job
  video?: string;
  audio?: string;
  template?: "auto" | "imagem" | "destaque";
  // modo mascote (sem imagem de IA)
  mascote?: string;   // frente | lado | costas | neutro | feliz | determinado
  titulo?: string;    // frase grande da cena
  placa?: string;     // texto na placa que o mascote segura (pose "placa")
};

export type Timeline = {
  fps: number;
  largura: number;
  altura: number;
  duracao: number;
  legenda: {
    pos: number;      // 0–100, altura da legenda em % da tela
    estilo: string;   // estilo de legenda do app (outline, box…)
  };
  cenas: Cena[];
};

export const TIMELINE_VAZIA: Timeline = {
  fps: 30,
  largura: 1080,
  altura: 1920,
  duracao: 3,
  legenda: { pos: 80, estilo: "outline" },
  cenas: [
    {
      inicio: 0,
      dur: 3,
      janela: 0,
      texto: "Gere a narração no app e exporte para o Remotion",
      palavras: "Gere a narração no app e exporte para o Remotion"
        .split(" ")
        .map((w, i) => ({ w, t: 0.2 + i * 0.22 })),
    },
  ],
};

// Corte de um vídeo já narrado: mantém só as cenas escolhidas, na ordem dada,
// e recalcula o início de cada uma. Os áudios são os mesmos (cada cena tem o
// seu), então a sincronia continua exata. Serve para tirar um Short do longo.
export function recortarTimeline(tl: Timeline, indices: number[], formato: Partial<Pick<Timeline, "largura" | "altura" | "legenda">>): Timeline {
  let inicio = 0;
  const cenas = indices.map((i) => {
    const c = { ...tl.cenas[i], inicio };
    inicio += c.dur;
    return c;
  });
  // a última cena não dissolve em nada
  if (cenas.length) cenas[cenas.length - 1] = { ...cenas[cenas.length - 1], janela: 0 };
  return { ...tl, ...formato, cenas, duracao: +inicio.toFixed(3) };
}
