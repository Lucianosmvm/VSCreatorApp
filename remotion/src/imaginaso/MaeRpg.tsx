import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Caixa, Etiqueta, Ficha, Heroi, PIXEL, RPG, Sprite, Tela, TextoPixel, rampa, useT } from "../rpg/Kit";

// Canal "Imagina Só" (@imaginasoh) — Short 01: e se a sua MÃE virasse personagem de RPG.
// Kit próprio do canal, reaproveitando as peças de pixel art do RPG Code. 12 cenas, 9:16, ~44 s.
const PASTA = "videos/imagina-so-01-mae-rpg-mwtkctmd/";

const ROXO = "#3a1d8f", ROXO_ESC = "#1a0f3a";

// ── sprites ──────────────────────────────────────────────────────────────
const MAE = [
  "....kkkk....",
  "...khhhhk...",
  "..khhhhhhk..",
  "..khssssk...",
  "..ksesseak..",
  "..kssssssk..",
  "...kssssk...",
  "..kddddddk..",
  ".kddwwwwddk.",
  ".sddwwwwdds.",
  "..kdwwwwdk..",
  "..kddddddk..",
  "..kddddddk..",
  "...kp..pk...",
  "...kk..kk...",
];
const CORES_MAE = { k: "#1b1020", h: "#6b3a2a", s: "#e8b896", e: "#1b1020", a: "#1b1020", d: "#c2185b", w: "#f5f1ff", p: "#1b1020" };
const Mae: React.FC<{ x: number; y: number; esc?: number; flip?: boolean }> = ({ x, y, esc = 1, flip }) => {
  const { f } = useT();
  const resp = Math.round(Math.sin(f * 0.16) * 0.5);
  return <g transform={`translate(${x} ${y + resp}) scale(${esc})`}><Sprite mapa={MAE} cores={CORES_MAE} x={0} y={0} flip={flip} /></g>;
};
const Filho: React.FC<{ x: number; y: number; esc?: number; cor?: string }> = ({ x, y, esc = 1, cor }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`} style={cor ? { filter: cor } : undefined}><Heroi x={0} y={0} classe="guerreiro" semArma /></g>
);
// Chinelo dourado (coordenadas da grade): sola, tira vermelha e brilho.
const Chinelo: React.FC<{ x: number; y: number; esc?: number; giro?: number }> = ({ x, y, esc = 1, giro = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${esc})`}>
    <rect x={-4} y={-7} width={8} height={14} fill="#b8860b" />
    <rect x={-3} y={-6} width={6} height={12} fill="#ffd23f" />
    <rect x={-2} y={-4} width={4} height={1.4} fill="#ff4d5e" />
    <rect x={-0.6} y={-5} width={1.2} height={5} fill="#ff4d5e" />
    <rect x={-2.4} y={-5.4} width={1} height={1} fill="#fff6c2" />
  </g>
);

// ── cozinha em pixel art (grade 135 x 95) ────────────────────────────────
const Cozinha: React.FC<{ escuro?: number; vermelho?: boolean }> = ({ escuro = 0, vermelho }) => {
  const { f } = useT();
  return (
    <g>
      <rect x={0} y={0} width={135} height={62} fill="#f2d6a8" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 16} y={0} width={1} height={62} fill="#e3c391" />)}
      <rect x={0} y={60} width={135} height={2} fill="#a8743a" />
      {Array.from({ length: 34 }, (_, i) => <rect key={`p${i}`} x={(i % 17) * 8} y={62 + Math.floor(i / 17) * 8} width={8} height={8} fill={(i + Math.floor(i / 17)) % 2 ? "#c9a46a" : "#b08a50"} />)}
      <rect x={0} y={78} width={135} height={17} fill="#b08a50" />
      {/* janela */}
      <rect x={10} y={12} width={26} height={20} fill="#6b4a2c" /><rect x={12} y={14} width={22} height={16} fill={vermelho ? "#5a1a2a" : "#8fd3ff"} />
      <rect x={22} y={14} width={2} height={16} fill="#6b4a2c" /><rect x={12} y={21} width={22} height={2} fill="#6b4a2c" />
      {/* pia e bancada */}
      <rect x={92} y={40} width={43} height={22} fill="#8a6a44" /><rect x={92} y={38} width={43} height={4} fill="#d8d8d2" />
      <rect x={104} y={39} width={14} height={3} fill="#7a8a90" /><rect x={110} y={33} width={2} height={6} fill="#9aa6aa" />
      <rect x={96} y={46} width={10} height={12} fill="#6b4a2c" /><rect x={120} y={46} width={10} height={12} fill="#6b4a2c" />
      {/* mesa */}
      <rect x={40} y={58} width={34} height={4} fill="#8b5a2b" /><rect x={42} y={62} width={3} height={10} fill="#6b4a2c" /><rect x={69} y={62} width={3} height={10} fill="#6b4a2c" />
      {/* relógio */}
      <rect x={60} y={10} width={10} height={10} fill="#fff" stroke="#1b1020" strokeWidth={0.8} /><rect x={64.6} y={12} width={0.8} height={4} fill="#1b1020" /><rect x={65} y={15} width={3} height={0.8} fill="#1b1020" transform={`rotate(${f * 2} 65 15)`} />
      {escuro > 0 && <rect x={0} y={0} width={135} height={95} fill={vermelho ? "#5a0012" : "#0a0618"} opacity={escuro} />}
    </g>
  );
};

// ── moldura do canal ─────────────────────────────────────────────────────
const Marca: React.FC = () => {
  const { f, fps } = useT();
  const s = spring({ frame: f, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 46, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, transform: `translateY(${(1 - s) * -40}px)`, opacity: s }}>
      <div style={{ fontFamily: PIXEL, fontSize: 30, color: RPG.amarelo, background: ROXO_ESC, border: `5px solid #8b5cf6`, borderRadius: 14, padding: "12px 24px" }}>💭 IMAGINA SÓ</div>
      <div style={{ fontFamily: PIXEL, fontSize: 36, color: RPG.branco, background: ROXO, border: `5px solid #8b5cf6`, borderRadius: 14, padding: "16px 26px" }}>
        E se a sua <span style={{ color: RPG.vermelho }}>MÃE</span> fosse RPG?
      </div>
    </div>
  );
};
const Fundo: React.FC = () => {
  const { f } = useT();
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% ${32 + Math.sin(f * 0.02) * 4}%, #5b2fd6 0%, ${ROXO} 42%, ${ROXO_ESC} 80%)` }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.05) 2px, transparent 2px)", backgroundSize: "48px 48px" }} />
    </div>
  );
};

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" | "contagem" };
const Quadro: React.FC<{ tela: React.ReactNode; extra?: React.ReactNode; sons?: Som[]; treme?: number }> = ({ tela, extra, sons = [], treme = 0 }) => (
  <AbsoluteFill>
    <Fundo />
    <Marca />
    <Tela y={250} treme={treme}>{tela}</Tela>
    {extra}
    <Sons efeitos={sons as never} />
  </AbsoluteFill>
);

// Barra de vida em pixel art (grade).
const Barra: React.FC<{ x: number; y: number; v: number; rotulo: string; infinita?: boolean; cor?: string }> = ({ x, y, v, rotulo, infinita, cor }) => (
  <Caixa x={x} y={y} w={44} h={12}>
    <TextoPixel x={x + 3} y={y + 5.4} txt={infinita ? `${rotulo} MÁX` : `${rotulo} ${Math.round(v)}`} tam={3} />
    <rect x={x + 3} y={y + 7} width={38} height={2.6} fill="#2a2240" />
    <rect x={x + 3} y={y + 7} width={38 * Math.max(0, Math.min(1, v / 100))} height={2.6} fill={cor ?? (v > 50 ? RPG.verde : RPG.vermelho)} />
  </Caixa>
);

const MAE_POS = { x: 74, y: 52 }, FILHO_POS = { x: 30, y: 58 };

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => {
    const r = em(c, "rpg");
    const { t, f } = useT();
    return (
      <Quadro sons={[{ t: em(c, "mae"), tipo: "pop" }, { t: r, tipo: "plim" }]}
        tela={<>
          <Cozinha />
          <Mae x={MAE_POS.x} y={MAE_POS.y - 12} esc={2} />
          {t >= r && Math.floor(f / 5) % 2 === 0 && <Caixa x={30} y={6} w={75} h={11}><TextoPixel x={67.5} y={13.8} txt="MODO RPG ATIVADO" tam={4} cor={RPG.amarelo} meio /></Caixa>}
        </>}
        extra={<Etiqueta t={em(c, "mae")} x={540} y={1180} txt="👩 MÃE" cor="#ff9ad5" tam={60} />} />
    );
  },
  1: ({ cena: c }) => (
    <Quadro sons={[{ t: em(c, "99"), tipo: "contagem" }]}
      tela={<><Cozinha /><Mae x={MAE_POS.x} y={MAE_POS.y - 12} esc={2} /></>}
      extra={<Ficha t={em(c, "nivel")} x={540} y={1060} largura={640} titulo="MÃE · PERSONAGEM" cor="#ff9ad5" campos={[{ k: "nível", v: "99", t: em(c, "99") }, { k: "XP", v: "MÁXIMO", t: em(c, "maximo") }, { k: "classe", v: "LENDÁRIA", t: em(c, "99") + 0.3 }]} />} />
  ),
  2: ({ cena: c }) => {
    const s = em(c, "sumiu");
    const { t } = useT();
    const brilho = t >= s ? rampa(t, s, s + 0.4) : 0;
    return (
      <Quadro sons={[{ t: em(c, "encontrar"), tipo: "whoosh" }, { t: s, tipo: "plim" }]}
        tela={<>
          <Cozinha />
          <Mae x={20} y={40} esc={2} />
          <Filho x={96} y={60} esc={1.7} />
          {/* controle remoto "sumido" aparece em cima da mesa */}
          <g opacity={brilho}><rect x={52} y={54} width={10} height={4} fill="#1b1020" /><rect x={54} y={55} width={1.4} height={1.4} fill={RPG.vermelho} /><circle cx={57} cy={52} r={6 * brilho} fill="none" stroke={RPG.amarelo} strokeWidth={0.8} /></g>
          {t >= em(c, "encontrar") && <g><circle cx={40} cy={44} r={5} fill="none" stroke="#1b1020" strokeWidth={1.4} /><rect x={43} y={47} width={1.4} height={6} fill="#1b1020" transform="rotate(-40 43 47)" /></g>}
        </>}
        extra={<>
          <Etiqueta t={em(c, "habilidade")} x={540} y={1150} txt="HABILIDADE 1" cor="#ff9ad5" tam={40} />
          <Etiqueta t={em(c, "encontrar")} x={540} y={1320} txt="🔎 ACHA QUALQUER COISA" tam={40} />
          <Etiqueta t={s} x={540} y={1490} txt='"tava em cima da mesa!"' cor={RPG.verde} tam={34} />
        </>} />
    );
  },
  3: ({ cena: c }) => {
    const o = em(c, "olhar"), p = em(c, "paralisa");
    const { t } = useT();
    return (
      <Quadro sons={[{ t: o, tipo: "whoosh" }, { t: p, tipo: "erro" }]}
        tela={<>
          <Cozinha escuro={t >= o ? 0.25 : 0} />
          <Mae x={88} y={40} esc={2} flip />
          <Filho x={18} y={56} esc={1.7} cor={t >= p ? "hue-rotate(180deg) saturate(2.5) brightness(1.1)" : undefined} />
          {t >= o && <g>{[0, 1].map((k) => <rect key={k} x={36} y={56 + k * 2} width={58 * rampa(t, o, o + 0.3)} height={1} fill={RPG.vermelho} />)}</g>}
          {t >= p && <Caixa x={6} y={44} w={40} h={9}><TextoPixel x={26} y={50.4} txt="PARALISADO 3s" tam={3} cor={RPG.azul} meio /></Caixa>}
        </>}
        extra={<>
          <Etiqueta t={em(c, "habilidade")} x={540} y={1150} txt="HABILIDADE 2" cor="#ff9ad5" tam={40} />
          <Etiqueta t={o} x={540} y={1330} txt="👀 O OLHAR" tam={52} />
        </>} />
    );
  },
  4: ({ cena: c }) => {
    const ch = em(c, "chinelo");
    const { t, f } = useT();
    return (
      <Quadro sons={[{ t: em(c, "lendaria"), tipo: "whoosh" }, { t: ch, tipo: "plim" }]}
        tela={<>
          <Cozinha escuro={0.55} />
          {t >= ch - 0.6 && <g>
            {Array.from({ length: 8 }, (_, k) => <rect key={k} x={67.5} y={47.5} width={1.2} height={30} fill="#ffd23f" opacity={0.35} transform={`rotate(${k * 45 + f * 2} 67.5 47.5)`} />)}
            <Chinelo x={67.5} y={47.5} esc={2.6 * rampa(t, ch - 0.6, ch)} giro={Math.sin(f * 0.12) * 12} />
          </g>}
        </>}
        extra={<>
          <Etiqueta t={em(c, "lendaria")} x={540} y={1150} txt="ITEM LENDÁRIO" cor={RPG.amarelo} tam={52} />
          <Etiqueta t={ch} x={540} y={1340} txt="🩴 O CHINELO" tam={56} />
        </>} />
    );
  },
  5: ({ cena: c }) => {
    const a = em(c, "alcance"), cv = em(c, "curva"), v = em(c, "volta");
    const { t } = useT();
    // Trajetória: sai da mão da mãe, faz uma curva pela cozinha e volta.
    const u = rampa(t, a, Math.max(a + 0.5, c.dur - 0.4));
    const ang = u * Math.PI * 2;
    const cx = 82 - Math.sin(ang) * 46, cy = 46 - Math.sin(ang / 2) * 26 + (1 - Math.cos(ang)) * 6;
    return (
      <Quadro sons={[{ t: a, tipo: "whoosh" }, { t: cv, tipo: "whoosh" }, { t: v, tipo: "plim" }]}
        tela={<>
          <Cozinha />
          <Mae x={88} y={40} esc={2} flip />
          <Filho x={22} y={56} esc={1.7} />
          {Array.from({ length: 6 }, (_, k) => { const uu = Math.max(0, u - k * 0.03); const an = uu * Math.PI * 2; return <rect key={k} x={82 - Math.sin(an) * 46} y={46 - Math.sin(an / 2) * 26 + (1 - Math.cos(an)) * 6} width={1.4} height={1.4} fill={RPG.amarelo} opacity={0.5 - k * 0.08} />; })}
          <Chinelo x={cx} y={cy} esc={1.2} giro={t * 900} />
        </>}
        extra={<>
          <Etiqueta t={a} x={540} y={1140} txt="ALCANCE INFINITO" cor={RPG.amarelo} tam={40} />
          <Etiqueta t={cv} x={540} y={1300} txt="FAZ CURVA ↪" cor={RPG.azul} tam={40} />
          <Etiqueta t={v} x={540} y={1460} txt="VOLTA PRA MÃO DELA" cor={RPG.verde} tam={38} />
        </>} />
    );
  },
  6: ({ cena: c }) => {
    const r = em(c, "recupera");
    const { t, f } = useT();
    const vida = 12 + 88 * rampa(t, r, r + 1.2);
    return (
      <Quadro sons={[{ t: em(c, "comida"), tipo: "pop" }, { t: r, tipo: "contagem" }]}
        tela={<>
          <Cozinha />
          <Mae x={84} y={40} esc={2} flip />
          <Filho x={36} y={56} esc={1.7} />
          {/* prato fumegante na mesa */}
          <rect x={52} y={54} width={12} height={3} fill="#f5f1ff" /><rect x={54} y={52} width={8} height={2} fill="#e8b830" />
          {[0, 1, 2].map((k) => <rect key={k} x={54 + k * 3} y={46 - ((f * 0.3 + k * 4) % 8)} width={1} height={2} fill="#ffffff" opacity={0.7} />)}
          <Barra x={4} y={4} v={vida} rotulo="VOCÊ" />
        </>}
        extra={<>
          <Etiqueta t={em(c, "comida")} x={540} y={1150} txt="🍲 COMIDA DE MÃE" tam={44} />
          <Etiqueta t={em(c, "cem")} x={540} y={1340} txt="+100 HP" cor={RPG.verde} tam={72} />
        </>} />
    );
  },
  7: ({ cena: c }) => {
    const fr = em(c, "gente");
    const { t } = useT();
    const txt = "A GENTE CONVERSA EM CASA.";
    const n = t < fr ? 0 : Math.min(txt.length, Math.floor((t - fr) / 0.05));
    return (
      <Quadro sons={[{ t: fr, tipo: "tecla" }, { t: em(c, "casa"), tipo: "erro" }]} treme={t >= em(c, "casa") && t < em(c, "casa") + 0.4 ? Math.sin(t * 80) * 8 : 0}
        tela={<>
          <Cozinha escuro={t >= em(c, "casa") ? 0.45 : 0} />
          <Mae x={84} y={40} esc={2} flip />
          <Filho x={36} y={56} esc={1.7} />
          {n > 0 && <Caixa x={6} y={6} w={123} h={16}><TextoPixel x={12} y={16.5} txt={txt.slice(0, n)} tam={4.4} /></Caixa>}
        </>}
        extra={<>
          <Etiqueta t={em(c, "ativacao")} x={540} y={1150} txt="FRASE DE ATIVAÇÃO" cor="#ff9ad5" tam={40} />
          <Etiqueta t={em(c, "casa")} x={540} y={1340} txt="⚠ CHEFE DESPERTOU" cor={RPG.vermelho} tam={46} />
        </>} />
    );
  },
  8: ({ cena: c }) => {
    const { t, f } = useT();
    return (
      <Quadro sons={[{ t: em(c, "batalha"), tipo: "erro" }]} treme={Math.sin(t * 40) * 3}
        tela={<>
          <Cozinha escuro={0.6} vermelho />
          <Mae x={70} y={22} esc={3.2} flip />
          <Filho x={18} y={66} esc={1.1} />
          <Barra x={88} y={4} v={100} rotulo="MÃE" infinita cor="#ff4d5e" />
          <Barra x={4} y={4} v={8 + Math.sin(f * 0.3) * 2} rotulo="VOCÊ" />
        </>}
        extra={<>
          <Etiqueta t={em(c, "batalha")} x={540} y={1150} txt="BATALHA FINAL" cor={RPG.vermelho} tam={52} />
          <Etiqueta t={em(c, "ninguem")} x={540} y={1340} txt="0 vitórias na história" tam={38} />
        </>} />
    );
  },
  9: ({ cena: c }) => {
    const l = em(c, "lavar");
    const { t, f } = useT();
    return (
      <Quadro sons={[{ t: em(c, "sobreviver"), tipo: "pop" }, { t: l, tipo: "plim" }]}
        tela={<>
          <Cozinha />
          <Filho x={100} y={44} esc={1.7} />
          {t >= l && [0, 1, 2, 3].map((k) => <rect key={k} x={100 + k * 6} y={34 - ((f * 0.4 + k * 5) % 10)} width={1.4} height={1.4} fill="#8fd3ff" />)}
          {t >= l && <Caixa x={26} y={8} w={60} h={11}><TextoPixel x={56} y={15.4} txt="MISSÃO SECRETA ✓" tam={3.6} cor={RPG.verde} meio /></Caixa>}
          <Mae x={20} y={40} esc={2} />
        </>}
        extra={<>
          <Etiqueta t={em(c, "sobreviver")} x={540} y={1150} txt="COMO SOBREVIVER?" tam={44} />
          <Etiqueta t={l} x={540} y={1340} txt="🍽 LAVAR A LOUÇA" cor={RPG.azul} tam={48} />
          <Etiqueta t={em(c, "pedir")} x={540} y={1500} txt="(sem ela pedir!)" cor={RPG.amarelo} tam={36} />
        </>} />
    );
  },
  10: ({ cena: c }) => {
    const b = em(c, "amor"), v = em(c, "videogame");
    const { t, f } = useT();
    return (
      <Quadro sons={[{ t: b, tipo: "plim" }, { t: v, tipo: "contagem" }]}
        tela={<>
          <Cozinha />
          <Mae x={70} y={40} esc={2} flip />
          <Filho x={44} y={56} esc={1.7} />
          {t >= b && [0, 1, 2].map((k) => <text key={k} x={60 + k * 8} y={40 - ((f * 0.5 + k * 6) % 14)} fontSize={6} fill="#ff4d5e">❤</text>)}
          {t >= v && <g><rect x={98} y={12} width={22} height={12} fill="#1b1033" /><rect x={100} y={14} width={18} height={8} fill="#8b5cf6" /><rect x={103} y={17} width={4} height={1.4} fill="#1b1033" /><rect x={104.3} y={15.6} width={1.4} height={4} fill="#1b1033" /><rect x={112} y={16} width={2} height={2} fill="#ffd23f" /></g>}
        </>}
        extra={<>
          <Etiqueta t={b} x={540} y={1150} txt="+❤ BÔNUS DE AMOR" cor="#ff9ad5" tam={46} />
          <Etiqueta t={v} x={540} y={1340} txt="🎮 +1 HORA DE GAME" cor={RPG.verde} tam={46} />
        </>} />
    );
  },
  11: ({ cena: c }) => (
    <Quadro sons={[{ t: em(c, "secreta"), tipo: "pop" }, { t: em(c, "comenta"), tipo: "plim" }]}
      tela={<><Cozinha /><Mae x={MAE_POS.x - 16} y={MAE_POS.y - 12} esc={2} /></>}
      extra={<>
        <Ficha t={em(c, "mae")} x={540} y={1040} largura={680} titulo="A SUA MÃE" cor="#ff9ad5" campos={[{ k: "nível", v: "99" }, { k: "habilidade secreta", v: "???", t: em(c, "secreta") }]} />
        <Etiqueta t={em(c, "comenta")} x={540} y={1450} txt="COMENTA AÍ 👇" cor={RPG.amarelo} tam={56} />
      </>} />
  ),
};

export const ImaginaSoMae: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 91 }} pasta={PASTA} especiais={especiais} />;
