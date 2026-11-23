// Formato do video.json gerado por ferramentas/pixelandia/filmar.mjs.
export type CenaPixelandia = {
  nome: string;
  video: string;          // caminho dentro de public/
  inicio: number;         // segundo em que a cena começa
  dur: number;
  linhas: string[];       // legendas; "linha de cima\nfaixa em destaque"
  clima: "ameaca" | "misterio" | "vitoria" | null;
  cta?: boolean;          // última legenda em faixa vermelha
  audio?: string;         // narração da cena (dentro de public/)
  tempos?: number[];      // segundo em que cada legenda entra (sincronia com a fala)
  foco?: boolean;         // câmera segue um morador: seta no centro da tela
  // Posição normalizada da cabeça, capturada no jogo a cada quadro. null oculta a seta.
  rastreioFoco?: ({ nome: string; x: number; y: number } | null)[];
};

export type DadosPixelandia = {
  id: string;
  episodio: number;
  vila: string;
  largura: number;
  altura: number;
  fps: number;
  duracao: number;
  cenas: CenaPixelandia[];
};
