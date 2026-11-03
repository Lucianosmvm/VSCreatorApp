import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CenaEspecial } from "../../Shorts";
import type { Cena } from "../../tipos";
import { Personagem } from "./Personagem";
import { Objeto, type TipoObjeto } from "./Objeto";
import { estadoEm, segundo, type Chave, type Estado, type Momento } from "./movimento";

type ElementoBase = {
  id: string; tamanho?: number; cor?: string; estado?: Partial<Estado>; chaves?: Chave[];
  aparece?: Momento; sai?: Momento;
};
export type Elemento = ElementoBase & (
  | { tipo: "personagem"; cabelo?: string; pele?: string; expressao?: "neutro" | "feliz" | "surpreso" | "triste" }
  | { tipo: "objeto"; objeto: TipoObjeto }
  | { tipo: "texto"; texto: string; trocas?: { em: Momento; texto: string }[]; cartao?: boolean }
  | { tipo: "forma"; forma: "retangulo" | "elipse" | "caminho"; caminho?: string; largura?: number; altura?: number }
);
export type PlanoCena = {
  titulo?: string; subtitulo?: string;
  ambiente?: "estudio" | "campo" | "noite";
  elementos: Elemento[];
  camera?: Chave[];
};

/** Direção por cena. Coordenadas x/y em %, y é o chão/pé do elemento.
 * Chaves chegam ao estado no instante `em`; repita o estado antes para esperar.
 * Todos os movimentos são funções do relógio do Remotion, inclusive ao buscar quadros.
 */
export const CenaDinamica: React.FC<{ cena: Cena; plano: PlanoCena }> = ({ cena, plano }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const vertical = height > width;
  const W = vertical ? 1000 : 1600, H = vertical ? 1000 : 720;
  const camera = estadoEm({ x: 50, y: 50 }, plano.camera ?? [], t, cena.palavras);
  const campo = plano.ambiente === "campo";
  const noite = plano.ambiente === "noite";
  return <AbsoluteFill style={{ overflow: "hidden", fontFamily: "Poppins", color: "#f2ead8", background: noite ? "#111b25" : "radial-gradient(ellipse at 55% 40%, #38452a, #12190e)" }}>
    <AbsoluteFill style={{ opacity: 0.12, backgroundImage: "linear-gradient(#a4b37c 1px, transparent 1px), linear-gradient(90deg, #a4b37c 1px, transparent 1px)", backgroundSize: `${width / 14}px ${width / 14}px` }} />
    <div style={{ position: "absolute", top: "5%", left: "6%", width: "88%", textAlign: "center", fontWeight: 900, lineHeight: 1.05, fontSize: Math.min(width * 0.088, height * 0.085), opacity: interpolate(t, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }) }}>
      {plano.titulo || cena.titulo}
      {plano.subtitulo && <div style={{ color: "#FFD23F", fontSize: "0.74em", marginTop: "0.18em" }}>{plano.subtitulo}</div>}
    </div>
    {/* Área reservada acima da legenda: desenhar a cena não desenha outra legenda. */}
    <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: "3%", top: vertical ? "19%" : "18%", width: "94%", height: vertical ? "55%" : "57%", overflow: "hidden" }}>
      <defs>
        <radialGradient id="luz-dinamica"><stop stopColor="#FFD23F" stopOpacity="0.22" /><stop offset="1" stopColor="#FFD23F" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform={`translate(${W / 2} ${H / 2}) scale(${camera.escala}) translate(${-camera.x * W / 100} ${-camera.y * H / 100})`}>
        {campo || noite ? <>
          <circle cx={W * 0.82} cy={H * 0.14} r={H * 0.08} fill={noite ? "#f2ead8" : "#FFD23F"} opacity="0.8" />
          <path d={`M0 ${H * 0.7} Q${W * 0.2} ${H * 0.4} ${W * 0.52} ${H * 0.72} Q${W * 0.8} ${H * 0.47} ${W} ${H * 0.65} V${H} H0 Z`} fill={noite ? "#23382c" : "#4b5a35"} />
          <path d={`M0 ${H * 0.86} Q${W * 0.5} ${H * 0.63} ${W} ${H * 0.84} V${H} H0 Z`} fill="#2b3721" />
        </> : <>
          <ellipse cx={W * 0.5} cy={H * 0.48} rx={W * 0.5} ry={H * 0.55} fill="url(#luz-dinamica)" />
          <ellipse cx={W * 0.5} cy={H * 0.88} rx={W * 0.43} ry={H * 0.06} fill="#0b120a" opacity="0.5" />
          <path d={`M${W * 0.08} ${H * 0.88} H${W * 0.92}`} stroke="#8b9861" strokeWidth="2" opacity="0.4" />
        </>}
        {plano.elementos.map((e) => {
          const estado = estadoEm(e.estado ?? {}, e.chaves ?? [], t, cena.palavras);
          const antes = estadoEm(e.estado ?? {}, e.chaves ?? [], Math.max(0, t - 0.04), cena.palavras);
          const inicio = e.aparece === undefined ? 0 : segundo(e.aparece, cena.palavras);
          const fim = e.sai === undefined ? Infinity : segundo(e.sai, cena.palavras);
          if (t < inicio || t >= fim) return null;
          const entrada = Math.min(1, Math.max(0, (t - inicio) / 0.3));
          const tamanho = (e.tamanho ?? 45) / 100 * H / 210 * estado.escala;
          const velocidade = Math.abs(estado.x - antes.x) / 0.04;
          const andando = Math.min(1, velocidade / 9);
          // Passos acompanham distância, não fps; sem tremedeira em personagem parado.
          const passo = (estado.x - (e.estado?.x ?? 50)) * 0.28;
          let texto = e.tipo === "texto" ? e.texto : "";
          if (e.tipo === "texto") for (const troca of [...(e.trocas ?? [])].sort((a, b) => segundo(a.em, cena.palavras) - segundo(b.em, cena.palavras))) {
            if (t >= segundo(troca.em, cena.palavras)) texto = troca.texto;
          }
          return <g key={e.id} opacity={estado.opacidade * entrada} transform={`translate(${estado.x * W / 100} ${estado.y * H / 100 + (1 - entrada) * 16}) rotate(${estado.giro}) scale(${tamanho})`}>
            {e.tipo === "personagem" && <>
              <ellipse cy="4" rx="46" ry="8" fill="#0a1008" opacity="0.35" />
              <Personagem tempo={t} passo={passo} andando={andando} bracoEsq={estado.bracoEsq} bracoDir={estado.bracoDir} cabeca={estado.cabeca} roupa={e.cor} cabelo={e.cabelo} pele={e.pele} expressao={e.expressao} />
            </>}
            {e.tipo === "objeto" && <Objeto tipo={e.objeto} cor={e.cor ?? "#647345"} abertura={Math.min(1, Math.max(0, estado.abertura))} />}
            {e.tipo === "forma" && <g fill={e.cor ?? "#FFD23F"} stroke="#d8c3a0" strokeWidth="2">
              {e.forma === "retangulo" && <rect x={-(e.largura ?? 160) / 2} y={-(e.altura ?? 100)} width={e.largura ?? 160} height={e.altura ?? 100} rx="10" />}
              {e.forma === "elipse" && <ellipse cy={-(e.altura ?? 100) / 2} rx={(e.largura ?? 160) / 2} ry={(e.altura ?? 100) / 2} />}
              {e.forma === "caminho" && <path d={e.caminho} />}
            </g>}
            {e.tipo === "texto" && <>
              {e.cartao && <rect x="-88" y="-94" width="176" height="90" rx="18" fill="#26311d" stroke="#a0ac70" strokeWidth="3" />}
              <text y={e.cartao ? -36 : -6} textAnchor="middle" xmlSpace="preserve" fill={e.cor ?? "#FFD23F"} fontFamily={texto.includes("=") ? "monospace" : undefined} fontWeight="900" fontSize={Math.min(48, 150 / Math.max(1, texto.length * 0.68))}>{texto}</text>
            </>}
          </g>;
        })}
      </g>
    </svg>
  </AbsoluteFill>;
};

/** Encaixa em Video.especiais; a legenda e o áudio existentes continuam sincronizados. */
export function criarCenaDinamica(plano: PlanoCena): CenaEspecial {
  return function CenaDirigida({ cena }) { return <CenaDinamica cena={cena} plano={plano} />; };
}
