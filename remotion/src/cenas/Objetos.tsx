import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Palavra } from "../tipos";

// Objetos da fala: quando a narração diz "monitor", "teclado", "rede", "software"...
// aparece o desenho daquilo no meio da tela, no quadro em que a palavra é dita.
// Até 3 por cena, lado a lado. Ícones em SVG (viewBox 100x100) na paleta do mascote.

const ESC = "#1d2416";
const OLI = "#4b5a35";
const BEG = "#d8c3a0";
const CRE = "#f2ead8";
const AMA = "#FFD23F";

// `f` = quadros desde que o objeto apareceu (para a animação interna)
type Icone = (f: number) => React.ReactNode;

const traco = { stroke: ESC, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const ICONES: Record<string, Icone> = {
  monitor: (f) => (
    <>
      <rect x="8" y="14" width="84" height="56" rx="6" fill={OLI} {...traco} />
      <rect x="15" y="21" width="70" height="42" rx="2" fill={ESC} />
      <rect x="21" y="28" width={Math.min(40, f * 1.5)} height="5" rx="2" fill={AMA} />
      <rect x="21" y="38" width={Math.min(30, Math.max(0, f * 1.5 - 20))} height="5" rx="2" fill={BEG} />
      {Math.floor(f / 12) % 2 === 0 && <rect x="21" y="48" width="4" height="8" fill={CRE} />}
      <path d="M42 70 L38 84 L62 84 L58 70" fill={BEG} {...traco} />
      <rect x="28" y="82" width="44" height="6" rx="3" fill={OLI} {...traco} />
    </>
  ),
  teclado: (f) => (
    <>
      <rect x="6" y="30" width="88" height="44" rx="6" fill={OLI} {...traco} />
      {[0, 1, 2].map((l) =>
        Array.from({ length: 8 - l }).map((_, c) => {
          const aceso = Math.floor(f / 5) % 22 === l * 7 + c;
          return <rect key={`${l}-${c}`} x={13 + c * 10 + l * 5} y={37 + l * 10} width="7" height="7" rx="1.5" fill={aceso ? AMA : CRE} />;
        }),
      )}
      <rect x="28" y="63" width="44" height="6" rx="2" fill={CRE} />
    </>
  ),
  mouse: (f) => (
    <>
      <path d="M50 10 C80 10 80 30 80 40 L80 64 C80 82 66 92 50 92 C34 92 20 82 20 64 L20 40 C20 30 20 10 50 10 Z" fill={BEG} {...traco} />
      <path d="M20 42 L80 42 M50 10 L50 42" {...traco} fill="none" />
      <path d="M22 40 L22 34 C22 18 34 12 48 12 L48 40 Z" fill={Math.floor(f / 10) % 2 ? AMA : BEG} />
      <rect x="46" y="20" width="8" height="14" rx="4" fill={ESC} />
    </>
  ),
  processador: (f) => {
    const brilho = 0.5 + 0.5 * Math.sin(f / 5);
    return (
      <>
        {[22, 36, 50, 64, 78].map((p) => (
          <g key={p} stroke={ESC} strokeWidth="4" strokeLinecap="round">
            <line x1={p} y1="6" x2={p} y2="20" /><line x1={p} y1="80" x2={p} y2="94" />
            <line x1="6" y1={p} x2="20" y2={p} /><line x1="80" y1={p} x2="94" y2={p} />
          </g>
        ))}
        <rect x="18" y="18" width="64" height="64" rx="6" fill={OLI} {...traco} />
        <rect x="32" y="32" width="36" height="36" rx="3" fill={AMA} opacity={0.55 + brilho * 0.45} stroke={ESC} strokeWidth="3" />
        <text x="50" y="56" textAnchor="middle" fontFamily="Poppins" fontWeight="900" fontSize="15" fill={ESC}>CPU</text>
      </>
    );
  },
  memoria: (f) => (
    <>
      <rect x="4" y="30" width="92" height="36" rx="3" fill={OLI} {...traco} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={11 + i * 21} y="37" width="15" height="18" rx="2" fill={Math.floor(f / 6) % 4 === i ? AMA : ESC} />
      ))}
      {Array.from({ length: 15 }).map((_, i) => (
        <rect key={i} x={8 + i * 5.8} y="66" width="3.5" height="8" fill={AMA} stroke={ESC} strokeWidth="1" />
      ))}
      <rect x="47" y="64" width="6" height="12" fill={CRE} />
    </>
  ),
  disco: (f) => (
    <>
      <rect x="12" y="8" width="76" height="84" rx="8" fill={OLI} {...traco} />
      <circle cx="50" cy="44" r="28" fill={BEG} {...traco} />
      <g transform={`rotate(${f * 12} 50 44)`}>
        <path d="M50 16 A28 28 0 0 1 76 34 L50 44 Z" fill={CRE} opacity="0.8" />
      </g>
      <circle cx="50" cy="44" r="6" fill={ESC} />
      <path d="M72 82 L58 60" stroke={ESC} strokeWidth="5" strokeLinecap="round" />
      <circle cx="76" cy="84" r="4" fill={Math.floor(f / 8) % 2 ? AMA : ESC} />
    </>
  ),
  placa: (f) => (
    <>
      <rect x="6" y="10" width="88" height="80" rx="5" fill={OLI} {...traco} />
      <path d="M14 28 H40 V50 M60 20 V40 H86 M14 74 H50 V60 M70 82 V60 H86" stroke={AMA} strokeWidth="2.5" fill="none"
        strokeDasharray="200" strokeDashoffset={Math.max(0, 200 - f * 6)} />
      <rect x="40" y="36" width="24" height="24" rx="2" fill={ESC} />
      <rect x="16" y="56" width="22" height="10" rx="2" fill={BEG} stroke={ESC} strokeWidth="2" />
      <rect x="66" y="66" width="18" height="10" rx="2" fill={CRE} stroke={ESC} strokeWidth="2" />
      <circle cx="74" cy="24" r="6" fill={BEG} stroke={ESC} strokeWidth="2" />
    </>
  ),
  computador: (f) => (
    <>
      <rect x="4" y="18" width="58" height="42" rx="4" fill={OLI} {...traco} />
      <rect x="10" y="24" width="46" height="30" fill={ESC} />
      <rect x="15" y="30" width={Math.min(30, f)} height="4" rx="2" fill={AMA} />
      <path d="M28 60 L26 72 H40 L38 60" fill={BEG} {...traco} />
      <rect x="18" y="72" width="30" height="5" rx="2" fill={OLI} {...traco} />
      <rect x="68" y="12" width="28" height="70" rx="4" fill={BEG} {...traco} />
      <circle cx="82" cy="26" r="5" fill={Math.floor(f / 10) % 2 ? AMA : OLI} stroke={ESC} strokeWidth="2" />
      <line x1="74" y1="44" x2="90" y2="44" {...traco} /><line x1="74" y1="54" x2="90" y2="54" {...traco} />
    </>
  ),
  software: (f) => (
    <>
      <rect x="6" y="12" width="88" height="76" rx="6" fill={CRE} {...traco} />
      <path d="M6 28 H94" {...traco} />
      <circle cx="16" cy="20" r="3" fill="#e0533d" /><circle cx="26" cy="20" r="3" fill={AMA} /><circle cx="36" cy="20" r="3" fill={OLI} />
      <text x="50" y="68" textAnchor="middle" fontFamily="Poppins" fontWeight="900" fontSize="30" fill={OLI}>
        {"</>".slice(0, Math.min(3, Math.floor(f / 5) + 1))}
      </text>
    </>
  ),
  sistema: (f) => (
    <>
      <rect x="6" y="12" width="88" height="66" rx="6" fill={ESC} {...traco} />
      {[0, 1, 2, 3].map((i) => {
        const s = Math.min(1, Math.max(0, (f - i * 4) / 8));
        return <rect key={i} x={30 + (i % 2) * 21} y={22 + Math.floor(i / 2) * 21} width="18" height="18" rx="2" fill={i === 0 ? AMA : BEG} opacity={s} />;
      })}
      <rect x="6" y="78" width="88" height="12" rx="3" fill={OLI} {...traco} />
      <rect x="12" y="81" width="8" height="6" rx="1" fill={AMA} />
    </>
  ),
  internet: (f) => {
    const g = (f * 2) % 60;
    return (
      <>
        <circle cx="50" cy="50" r="40" fill={OLI} {...traco} />
        <ellipse cx="50" cy="50" rx={Math.abs(30 - g)} ry="40" fill="none" stroke={CRE} strokeWidth="3" />
        <ellipse cx="50" cy="50" rx="16" ry="40" fill="none" stroke={BEG} strokeWidth="3" />
        <path d="M12 36 H88 M12 64 H88 M10 50 H90" stroke={CRE} strokeWidth="3" />
        <circle cx="50" cy="50" r="40" fill="none" {...traco} />
      </>
    );
  },
  rede: (f) => {
    const nos: [number, number][] = [[50, 18], [16, 50], [84, 50], [30, 84], [70, 84]];
    const ligacoes: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [0, 3], [0, 4]];
    return (
      <>
        {ligacoes.map(([a, b], i) => {
          const desenho = Math.min(1, Math.max(0, (f - i * 2) / 8));
          const [x1, y1] = nos[a]; const [x2, y2] = nos[b];
          const p = ((f / 20 + i * 0.37) % 1);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * desenho} y2={y1 + (y2 - y1) * desenho} stroke={ESC} strokeWidth="4" strokeLinecap="round" />
              {desenho === 1 && <circle cx={x1 + (x2 - x1) * p} cy={y1 + (y2 - y1) * p} r="3.5" fill={AMA} stroke={ESC} strokeWidth="1.5" />}
            </g>
          );
        })}
        {nos.map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 11} y={y - 9} width="22" height="15" rx="2" fill={i === 0 ? AMA : OLI} {...traco} strokeWidth="3" />
            <rect x={x - 5} y={y + 6} width="10" height="4" fill={ESC} />
          </g>
        ))}
      </>
    );
  },
  wifi: (f) => (
    <>
      {[36, 24, 12].map((r, i) => (
        <path key={r} d={`M${50 - r} ${74 - r * 0.9} A${r * 1.3} ${r * 1.3} 0 0 1 ${50 + r} ${74 - r * 0.9}`} fill="none"
          stroke={Math.floor(f / 6) % 4 > i ? AMA : OLI} strokeWidth="9" strokeLinecap="round" transform="translate(0 0)" />
      ))}
      <circle cx="50" cy="78" r="8" fill={ESC} />
    </>
  ),
  jogo: (f) => (
    <>
      <path d="M22 30 H78 C92 30 98 56 94 72 C91 84 80 86 72 74 L66 66 H34 L28 74 C20 86 9 84 6 72 C2 56 8 30 22 30 Z" fill={OLI} {...traco} />
      <path d="M20 46 V60 M13 53 H27" stroke={CRE} strokeWidth="5" strokeLinecap="round" />
      <circle cx="72" cy="46" r="5" fill={Math.floor(f / 7) % 2 ? AMA : BEG} />
      <circle cx="82" cy="56" r="5" fill={Math.floor(f / 7) % 2 ? BEG : AMA} />
      <rect x="42" y="44" width="16" height="5" rx="2" fill={ESC} />
    </>
  ),
  documento: (f) => (
    <>
      <path d="M18 6 H64 L84 26 V94 H18 Z" fill={CRE} {...traco} />
      <path d="M64 6 V26 H84" fill={BEG} {...traco} />
      {[38, 50, 62, 74].map((y, i) => (
        <rect key={y} x="28" y={y} width={Math.min(i === 3 ? 28 : 46, Math.max(0, f * 3 - i * 20))} height="5" rx="2" fill={i === 0 ? OLI : ESC} />
      ))}
    </>
  ),
  celular: (f) => (
    <>
      <rect x="26" y="4" width="48" height="92" rx="9" fill={ESC} {...traco} />
      <rect x="31" y="14" width="38" height="70" rx="3" fill={OLI} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={35 + (i % 2) * 17} y={20 + Math.floor(i / 2) * 18} width="13" height="13" rx="3"
          fill={i === Math.floor(f / 8) % 6 ? AMA : BEG} />
      ))}
      <rect x="42" y="88" width="16" height="3" rx="1.5" fill={BEG} />
    </>
  ),
  nuvem: (f) => (
    <>
      <path d="M26 74 C10 74 8 52 24 50 C22 32 46 26 54 40 C62 28 84 34 80 52 C96 54 94 74 78 74 Z" fill={CRE} {...traco}
        transform={`translate(0 ${Math.sin(f / 10) * 2})`} />
      <path d="M50 66 V86 M42 78 L50 86 L58 78" stroke={OLI} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"
        transform={`translate(0 ${((f * 0.6) % 8) - 4})`} />
    </>
  ),
  codigo: (f) => (
    <>
      <rect x="6" y="12" width="88" height="76" rx="6" fill={ESC} {...traco} />
      {[[16, 26, 30, AMA], [24, 38, 40, BEG], [24, 50, 28, CRE], [16, 62, 20, AMA], [16, 74, 36, OLI]].map(([x, y, w, c], i) => (
        <rect key={i} x={x as number} y={y as number} width={Math.min(w as number, Math.max(0, f * 2.5 - i * 12))} height="6" rx="3" fill={c as string} />
      ))}
    </>
  ),
  dados: (f) => (
    <>
      {[66, 46, 26].map((y, i) => (
        <g key={y} transform={`translate(0 ${Math.max(0, 20 - (f - i * 4) * 3) * -1})`} opacity={Math.min(1, Math.max(0, (f - i * 4) / 6))}>
          <path d={`M18 ${y} V${y + 16} C18 ${y + 26} 82 ${y + 26} 82 ${y + 16} V${y}`} fill={i === 2 ? AMA : OLI} {...traco} />
          <ellipse cx="50" cy={y} rx="32" ry="10" fill={BEG} {...traco} />
        </g>
      ))}
    </>
  ),
  seguranca: (f) => {
    const fecha = Math.min(1, f / 14);
    return (
      <>
        <path d={`M32 46 V${34 - (1 - fecha) * 0} C32 14 68 14 68 34 V${46 - (1 - fecha) * 12}`} fill="none" stroke={ESC} strokeWidth="8"
          transform={`translate(0 ${(1 - fecha) * -10})`} />
        <rect x="20" y="44" width="60" height="46" rx="6" fill={fecha === 1 ? AMA : OLI} {...traco} />
        <circle cx="50" cy="62" r="6" fill={ESC} />
        <rect x="47" y="64" width="6" height="14" rx="2" fill={ESC} />
      </>
    );
  },
  virus: (f) => (
    <g transform={`rotate(${f * 2} 50 50)`}>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <g key={i}>
            <line x1={50 + Math.cos(a) * 26} y1={50 + Math.sin(a) * 26} x2={50 + Math.cos(a) * 42} y2={50 + Math.sin(a) * 42} stroke={ESC} strokeWidth="4" />
            <circle cx={50 + Math.cos(a) * 42} cy={50 + Math.sin(a) * 42} r="5" fill="#e0533d" stroke={ESC} strokeWidth="2" />
          </g>
        );
      })}
      <circle cx="50" cy="50" r="28" fill="#e0533d" {...traco} />
      <circle cx="42" cy="44" r="5" fill={ESC} /><circle cx="58" cy="56" r="4" fill={ESC} />
    </g>
  ),
  mensagem: (f) => (
    <>
      <path d="M10 16 H74 V58 H34 L20 72 V58 H10 Z" fill={CRE} {...traco} />
      <path d="M30 40 H90 V78 H80 V90 L66 78 H30 Z" fill={OLI} {...traco} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={48 + i * 12} cy="60" r="4" fill={AMA} transform={`translate(0 ${Math.floor(f / 6) % 3 === i ? -4 : 0})`} />
      ))}
    </>
  ),
  email: (f) => (
    <>
      <rect x="8" y="22" width="84" height="58" rx="5" fill={CRE} {...traco} />
      <path d={`M8 24 L50 ${58 - Math.min(1, f / 10) * 0} L92 24`} fill="none" {...traco} />
      <circle cx="84" cy="26" r="10" fill={AMA} stroke={ESC} strokeWidth="3" transform={`scale(${Math.min(1, f / 8)})`} style={{ transformOrigin: "84px 26px" }} />
    </>
  ),
  servidor: (f) => (
    <>
      {[10, 38, 66].map((y, i) => (
        <g key={y}>
          <rect x="14" y={y} width="72" height="24" rx="4" fill={OLI} {...traco} />
          <circle cx="26" cy={y + 12} r="4" fill={Math.floor(f / 5 + i) % 3 === 0 ? AMA : ESC} />
          <line x1="50" y1={y + 12} x2="76" y2={y + 12} stroke={BEG} strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}
    </>
  ),
  impressora: (f) => (
    <>
      <rect x="28" y="8" width="44" height="28" fill={CRE} {...traco} />
      <rect x="8" y="32" width="84" height="36" rx="6" fill={OLI} {...traco} />
      <circle cx="80" cy="44" r="4" fill={AMA} />
      <rect x="26" y="60" width="48" height={Math.min(32, 6 + f * 1.2)} fill={CRE} {...traco} />
    </>
  ),
  usb: () => (
    <>
      <rect x="30" y="34" width="40" height="58" rx="6" fill={OLI} {...traco} />
      <rect x="36" y="8" width="28" height="28" fill={BEG} {...traco} />
      <rect x="42" y="16" width="6" height="6" fill={ESC} /><rect x="52" y="16" width="6" height="6" fill={ESC} />
      <circle cx="50" cy="66" r="7" fill={AMA} stroke={ESC} strokeWidth="2" />
    </>
  ),
  calculadora: (f) => (
    <>
      <rect x="18" y="6" width="64" height="88" rx="8" fill={OLI} {...traco} />
      <rect x="26" y="14" width="48" height="20" rx="3" fill={CRE} />
      <text x="70" y="30" textAnchor="end" fontFamily="Poppins" fontWeight="900" fontSize="14" fill={ESC}>{(f * 7) % 1000}</text>
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={26 + (i % 3) * 17} y={42 + Math.floor(i / 3) * 16} width="13" height="12" rx="2" fill={i === 8 ? AMA : BEG} />
      ))}
    </>
  ),
  relogio: (f) => (
    <>
      <circle cx="50" cy="50" r="40" fill={CRE} {...traco} />
      <line x1="50" y1="50" x2="50" y2="26" stroke={ESC} strokeWidth="5" strokeLinecap="round" transform={`rotate(${f * 6} 50 50)`} />
      <line x1="50" y1="50" x2="68" y2="50" stroke={OLI} strokeWidth="5" strokeLinecap="round" transform={`rotate(${f * 0.5} 50 50)`} />
      <circle cx="50" cy="50" r="5" fill={AMA} stroke={ESC} strokeWidth="2" />
    </>
  ),
  dinheiro: (f) => (
    <>
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx="50" cy={78 - i * 10} rx="34" ry="10" fill={AMA} {...traco} opacity={Math.min(1, Math.max(0, (f - i * 4) / 5))} />
      ))}
      <circle cx="50" cy="34" r="24" fill={AMA} {...traco} transform={`translate(0 ${Math.sin(f / 6) * 3})`} />
      <text x="50" y={42 + Math.sin(f / 6) * 3} textAnchor="middle" fontFamily="Poppins" fontWeight="900" fontSize="22" fill={ESC}>$</text>
    </>
  ),
  engrenagem: (f) => (
    <g transform={`rotate(${f * 3} 50 50)`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="43" y="6" width="14" height="18" rx="3" fill={OLI} {...traco} transform={`rotate(${i * 45} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="30" fill={OLI} {...traco} />
      <circle cx="50" cy="50" r="11" fill={CRE} {...traco} />
    </g>
  ),
};

// Palavra falada (sem acento, minúscula) -> ícone. Expressões de 2–3 palavras
// são testadas antes das soltas ("sistema operacional" não vira "sistema").
const EXPRESSOES: [RegExp, string, string][] = [
  [/^sistemas? operacional|^sistemas? operacionais/, "sistema", "Sistema operacional"],
  [/^banco de dados|^bancos de dados/, "dados", "Banco de dados"],
  [/^placa[- ]mae/, "placa", "Placa-mãe"],
  [/^redes? de computadores/, "rede", "Rede"],
  [/^pen ?drive/, "usb", "Pendrive"],
];
const PALAVRAS: [RegExp, string, string?][] = [
  [/^(monitor|monitores|tela|telas)$/, "monitor"],
  [/^(teclado|teclados|digitar|digita)$/, "teclado"],
  [/^(mouse|ponteiro)$/, "mouse"],
  [/^(processador|processadores|cpu|chip)$/, "processador", "Processador"],
  [/^(memoria|memorias|ram)$/, "memoria", "Memória"],
  [/^(disco|discos|hd|ssd|armazenamento)$/, "disco", "Disco"],
  [/^(hardware|pecas?|componentes?)$/, "placa", "Hardware"],
  [/^(computador|computadores|pc|notebook|maquina)$/, "computador", "Computador"],
  [/^(software|softwares|programas?|aplicativos?|apps?)$/, "software", "Software"],
  [/^(windows|linux|macos)$/, "sistema"],
  [/^(internet|navegador|navegadores|site|sites|web|online|google)$/, "internet", "Internet"],
  [/^(rede|redes|conexao|conectados?|roteador)$/, "rede", "Rede"],
  [/^(wi-?fi|wireless)$/, "wifi", "Wi-Fi"],
  [/^(jogo|jogos|game|games)$/, "jogo", "Jogo"],
  [/^(documento|documentos|texto|arquivo|arquivos|editor)$/, "documento"],
  [/^(celular|celulares|smartphone|telefone)$/, "celular", "Celular"],
  [/^(nuvem|cloud)$/, "nuvem", "Nuvem"],
  [/^(codigo|codigos|programar|programacao|programador)$/, "codigo", "Código"],
  [/^(dados|database)$/, "dados", "Dados"],
  [/^(senha|senhas|seguranca|seguro|protegido|cadeado|hacker)$/, "seguranca", "Segurança"],
  [/^(virus|malware)$/, "virus", "Vírus"],
  [/^(conversar|mensagem|mensagens|chat|whatsapp)$/, "mensagem"],
  [/^(email|e-mail|emails)$/, "email", "E-mail"],
  [/^(servidor|servidores)$/, "servidor", "Servidor"],
  [/^(impressora|imprimir)$/, "impressora", "Impressora"],
  [/^(usb)$/, "usb", "USB"],
  [/^(calcular|calculos?|calculadora|contas)$/, "calculadora"],
  [/^(tempo|horas?|minutos?|relogio)$/, "relogio"],
  [/^(dinheiro|salario|grana|pagar|pagamento)$/, "dinheiro"],
  [/^(configurar|configuracao|configuracoes|ajustes|engrenagem)$/, "engrenagem"],
];

const normalizar = (w: string) =>
  w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^[^\w$-]+|[^\w-]+$/g, "");

const capitalizar = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export type Objeto = { icone: string; t: number; rotulo: string };

// Objetos citados na fala, em ordem, sem repetir ícone, no máximo 3.
export function acharObjetos(palavras: Palavra[], max = 3): Objeto[] {
  const achados: Objeto[] = [];
  const usados = new Set<string>();
  for (let i = 0; i < palavras.length && achados.length < max; i++) {
    const trecho = palavras.slice(i, i + 3).map((p) => normalizar(p.w)).join(" ");
    let achou: [string, string] | null = null;
    for (const [re, icone, rotulo] of EXPRESSOES) if (re.test(trecho)) { achou = [icone, rotulo]; break; }
    if (!achou) {
      const w = normalizar(palavras[i].w);
      for (const [re, icone, rotulo] of PALAVRAS) if (re.test(w)) {
        achou = [icone, rotulo ?? capitalizar(palavras[i].w.replace(/[^\p{L}\p{N}-]/gu, ""))];
        break;
      }
    }
    if (achou && !usados.has(achou[0])) {
      usados.add(achou[0]);
      achados.push({ icone: achou[0], t: palavras[i].t, rotulo: achou[1] });
    }
  }
  return achados;
}

// Cartões com os objetos, cada um entrando no quadro em que é dito. Os que já
// estão na tela deslizam para abrir espaço (posição pelo total de springs).
export const Objetos: React.FC<{ palavras?: Palavra[]; objetos?: Objeto[]; topo?: number }> = ({ palavras = [], objetos, topo }) => {
  const frame = useCurrentFrame();
  const { fps, width: largura, height } = useVideoConfig();
  const lado = Math.min(largura, height);
  const lista = objetos ?? acharObjetos(palavras);
  if (!lista.length) return null;

  const em = (o: Objeto) => Math.round(o.t * fps) - 3;
  const molas = lista.map((o) => (frame < em(o) ? 0 : spring({ frame: frame - em(o), fps, config: { damping: 12, stiffness: 170 } })));
  const visiveis = molas.reduce((a, b) => a + b, 0);
  if (visiveis <= 0) return null;

  const deitado = largura > height;
  const tam = lado * (lista.length === 1 ? 0.36 : lista.length === 2 ? 0.3 : 0.25);
  const passo = tam * 1.3;
  const centroY = height * (topo ?? (deitado ? 0.44 : 0.33));

  return (
    <AbsoluteFill>
      {lista.map((o, i) => {
        const s = molas[i];
        if (s <= 0) return null;
        const f = frame - em(o);
        const x = largura / 2 + (i - (visiveis - 1) / 2) * passo;
        const flutua = Math.sin((frame + i * 20) / 18) * tam * 0.025;
        return (
          <div
            key={o.icone}
            style={{
              position: "absolute",
              left: x - tam / 2,
              top: centroY - tam / 2 + flutua,
              width: tam,
              transform: `scale(${s}) rotate(${interpolate(s, [0, 1], [-14, i % 2 ? 3 : -3])}deg)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: tam,
                height: tam,
                background: CRE,
                borderRadius: tam * 0.16,
                border: `${tam * 0.025}px solid ${ESC}`,
                boxShadow: `0 ${tam * 0.06}px 0 ${ESC}, 0 ${tam * 0.12}px ${tam * 0.2}px rgba(0,0,0,.35)`,
                padding: tam * 0.1,
                boxSizing: "border-box",
              }}
            >
              <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: "visible" }}>
                {ICONES[o.icone](f)}
              </svg>
            </div>
            <div
              style={{
                marginTop: tam * 0.1,
                fontFamily: "Poppins",
                fontWeight: 900,
                fontSize: tam * 0.13 * Math.min(1, 11 / o.rotulo.length),
                color: ESC,
                background: AMA,
                padding: `0 ${tam * 0.06}px`,
                borderRadius: tam * 0.05,
                border: `${tam * 0.015}px solid ${ESC}`,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                opacity: interpolate(f, [6, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              {o.rotulo}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
