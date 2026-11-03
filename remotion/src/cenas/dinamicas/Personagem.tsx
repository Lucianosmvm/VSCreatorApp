/** Personagem articulado vetorial: nenhuma imagem ou folha de poses. */
export const Personagem: React.FC<{
  tempo: number; passo: number; andando: number; bracoEsq: number; bracoDir: number;
  cabeca: number; roupa?: string; cabelo?: string; pele?: string;
  expressao?: "neutro" | "feliz" | "surpreso" | "triste";
}> = ({ tempo, passo, andando, bracoEsq, bracoDir, cabeca, roupa = "#4b5a35", cabelo = "#191c19", pele = "#e9be98", expressao = "neutro" }) => {
  const balanco = Math.sin(passo) * andando;
  const sobe = -Math.abs(Math.sin(passo)) * andando * 4 + Math.sin(tempo * 2.8) * 1.2;
  const contorno = { stroke: "#131a11", strokeWidth: 3.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <g transform={`translate(0 ${sobe})`} {...contorno}>
    {/* As articulações giram em torno do quadril e dos ombros. */}
    {[-1, 1].map((lado) => <g key={lado} transform={`translate(${lado * 15} -60) rotate(${lado * balanco * 26})`}>
      <path d="M-10 0 L12 0 L13 46 L-11 46 Z" fill="#252c24" />
      <path d="M-12 42 Q0 40 14 45 L19 58 L-15 58 Z" fill="#111810" />
      <path d="M-11 53 L14 53" stroke="#788164" strokeWidth="2" />
    </g>)}
    <path d="M-33 -127 Q0 -141 33 -127 L28 -57 Q0 -50 -28 -57 Z" fill={roupa} />
    <path d="M-9 -132 L-7 -59 L10 -59 L10 -132" fill="#20251c" />
    <path d="M17 -94 L26 -94 M-24 -94 L-15 -94" stroke="#b4ba8e" strokeWidth="2" />
    {[-1, 1].map((lado) => <g key={lado} transform={`translate(${lado * 31} -122) rotate(${lado === -1 ? bracoEsq - balanco * 22 : bracoDir + balanco * 22})`}>
      <path d="M-9 0 Q0 -7 9 0 L10 39 L-8 39 Z" fill={roupa} />
      <g transform={`translate(0 35) rotate(${Math.abs(lado === -1 ? bracoEsq : bracoDir) * 0.18 * lado})`}>
        <path d="M-8 0 L10 0 L9 24 L-8 24 Z" fill={roupa} />
        <rect x="-9" y="22" width="19" height="10" rx="3" fill="#1b2118" />
        <ellipse cx="0" cy="34" rx="10" ry="11" fill={pele} />
      </g>
    </g>)}
    <g transform={`translate(0 -143) rotate(${cabeca})`}>
      <rect x="-9" y="-6" width="18" height="20" rx="5" fill={pele} />
      <ellipse cy="-35" rx="43" ry="45" fill={pele} />
      <ellipse cx="40" cy="-27" rx="8" ry="12" fill={pele} />
      <path d="M-43 -25 Q-58 -65 -20 -80 L-35 -89 L-8 -85 Q16 -106 23 -83 L47 -85 L37 -72 Q60 -53 40 -22 L30 -51 L15 -67 Q-1 -32 -29 -15 L-27 -47 Z" fill={cabelo} />
      <path d="M10 -35 L10 -21" stroke="#10170f" strokeWidth={expressao === "surpreso" ? 8 : 6} />
      {expressao === "feliz" && <path d="M4 -43 Q11 -48 18 -43" fill="none" />}
      {expressao === "triste" && <path d="M4 -45 L18 -41" fill="none" />}
      {expressao === "surpreso" && <path d="M5 -50 L19 -50" fill="none" />}
      {/* Headphones desenhados; a cabeça gira independentemente do corpo. */}
      <path d="M-25 3 Q0 24 27 3" fill="none" stroke="#10170f" strokeWidth="10" />
      <rect x="-31" y="-3" width="15" height="25" rx="6" fill="#30362c" />
      <rect x="16" y="-3" width="15" height="25" rx="6" fill="#30362c" />
    </g>
  </g>;
};
