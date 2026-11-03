export type TipoObjeto = "porta" | "arvore" | "caixa" | "moeda" | "monitor" | "livro" | "nuvem" | "arma" | "coracao" | "controle";

/** Vocabulário inicial extensível em SVG. abertura é contínua, de 0 a 1. */
export const Objeto: React.FC<{ tipo: TipoObjeto; cor: string; abertura: number }> = ({ tipo, cor, abertura }) => {
  const traco = { stroke: "#182012", strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const bege = "#d8c3a0", amarelo = "#FFD23F";
  return <g {...traco}>
    {tipo === "porta" && <>
      <path d="M-65 0 V-197 Q0 -218 65 -197 V0" fill={bege} />
      <path d="M-54 0 V-186 Q0 -204 54 -186 V0" fill="#10170e" />
      <g transform={`translate(-54 0) scale(${1 - abertura * 0.82} 1)`}>
        <path d="M0 0 V-186 Q54 -204 108 -186 V0 Z" fill={cor} />
        <path d="M12 -173 L96 -173 L96 -25 L12 -25 Z" fill="none" stroke={bege} strokeWidth="2" />
        <circle cx="88" cy="-89" r="6" fill={amarelo} />
      </g>
    </>}
    {tipo === "arvore" && <>
      <path d="M-12 0 L-9 -115 L14 -115 L19 0" fill={bege} />
      <path d="M2 -70 L-32 -101 M5 -89 L32 -123" fill="none" />
      <path d="M-70 -103 Q-100 -150 -54 -167 Q-40 -222 5 -202 Q58 -218 65 -169 Q108 -131 65 -99 Z" fill={cor} />
      <path d="M-52 -150 Q-18 -183 18 -169" fill="none" stroke="#a2ae70" strokeWidth="5" />
    </>}
    {tipo === "caixa" && <>
      <path d="M-83 -103 L26 -130 L95 -97 L-15 -66 Z" fill="#9aa36a" />
      <path d="M-83 -103 L-15 -66 L-15 0 L-83 -33 Z" fill={cor} />
      <path d="M-15 -66 L95 -97 L95 -30 L-15 0 Z" fill={cor} />
      <path d={`M-83 -103 L26 -130 L${26 - abertura * 18} ${-144 - abertura * 35} L${-83 - abertura * 18} ${-117 - abertura * 35} Z`} fill={bege} />
    </>}
    {tipo === "moeda" && <>
      <ellipse cx="7" cy="-58" rx="57" ry="59" fill="#b39325" />
      <circle cy="-60" r="57" fill={amarelo} />
      <circle cy="-60" r="45" fill="none" stroke="#b39325" strokeWidth="3" />
      <text y="-41" textAnchor="middle" fontSize="57" fontWeight="900" stroke="none" fill="#4b5a35">$</text>
    </>}
    {tipo === "monitor" && <>
      <path d="M-20 -42 L-26 -8 L30 -8 L23 -42" fill={bege} />
      <rect x="-35" y="-9" width="77" height="9" rx="4" fill={cor} />
      <rect x="-90" y="-159" width="180" height="120" rx="12" fill={cor} />
      <rect x="-78" y="-146" width="156" height="91" rx="4" fill="#151e12" />
      <path d="M-58 -119 L-30 -101 L-58 -83 M56 -119 L28 -101 L56 -83 M10 -127 L-6 -76" fill="none" stroke={amarelo} strokeWidth="6" />
    </>}
    {tipo === "livro" && <>
      <path d="M0 -11 Q-45 -35 -86 -17 V-139 Q-44 -155 0 -130 Q45 -155 86 -139 V-17 Q44 -35 0 -11 Z" fill={bege} />
      <path d="M0 -130 V-11 M-68 -116 L-19 -107 M-68 -96 L-19 -87 M19 -107 L68 -116 M19 -87 L68 -96" stroke={cor} fill="none" />
    </>}
    {tipo === "nuvem" && <path d="M-76 -23 Q-99 -56 -59 -76 Q-53 -123 -10 -108 Q32 -143 54 -97 Q105 -94 89 -47 Q97 -19 56 -18 Z" fill={cor} stroke="none" />}
    {tipo === "arma" && <g transform={`rotate(${-28 + abertura * 10})`}>
      <path d="M-66 -12 L58 -40 L68 -24 L66 -12 L10 2 Z" fill={cor} />
      <rect x="-80" y="-18" width="20" height="16" rx="4" fill="#20251c" />
      <circle cx="40" cy="-26" r="6" fill={amarelo} />
    </g>}
    {tipo === "coracao" && <path d="M0 -8 Q-62 -62 -58 -108 Q-55 -148 -18 -148 Q0 -148 0 -120 Q0 -148 18 -148 Q55 -148 58 -108 Q62 -62 0 -8 Z" fill={cor} />}
    {tipo === "controle" && <>
      <path d="M-86 -60 Q-98 -10 -70 2 Q-48 10 -38 -14 L38 -14 Q48 10 70 2 Q98 -10 86 -60 Q74 -96 0 -96 Q-74 -96 -86 -60 Z" fill={cor} />
      <path d="M-62 -60 L-62 -40 M-72 -50 L-52 -50" stroke={bege} strokeWidth="6" />
      <circle cx="46" cy="-66" r="7" fill={amarelo} />
      <circle cx="64" cy="-48" r="7" fill={bege} />
    </>}
  </g>;
};
