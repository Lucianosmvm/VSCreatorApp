import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";

// Efeitos sonoros sintetizados (ferramentas/gerar_sfx.py -> public/sfx/).
// Volume baixo de propósito: ficam por baixo da narração, nunca competem.
export type TipoSom = "tecla" | "pop" | "plim" | "erro" | "whoosh" | "contagem";

const VOLUME: Record<TipoSom, number> = {
  tecla: 0.18,
  pop: 0.3,
  plim: 0.32,
  erro: 0.28,
  whoosh: 0.22,
  contagem: 0.22,
};

export type Efeito = { t: number; tipo: TipoSom };

/** Toca cada efeito no segundo `t` (relativo ao início da cena). */
export const Sons: React.FC<{ efeitos: Efeito[] }> = ({ efeitos }) => {
  const { fps } = useVideoConfig();
  // dois sons iguais quase juntos viram um só (ex.: várias linhas no mesmo instante)
  const vistos = new Set<string>();
  const unicos = efeitos.filter((e) => {
    const chave = `${e.tipo}@${Math.round(e.t * 8)}`;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
  return (
    <>
      {unicos.map((e, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(e.t * fps))} layout="none">
          <Audio src={staticFile(`sfx/${e.tipo}.wav`)} volume={VOLUME[e.tipo]} />
        </Sequence>
      ))}
    </>
  );
};
