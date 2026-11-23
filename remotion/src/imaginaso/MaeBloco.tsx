import React from "react";
import { AbsoluteFill } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import type { Timeline } from "../tipos";
import { em } from "../cenas/Codigo";
import { Sons } from "../cenas/Som";
import { Balao, Boneco, Cenario, Chinelo, COR, Faixa, Painel, Sobe, mola, rampa, useT } from "./Bloco";

// Imagina Só #01 no estilo "Bloco" (cartoon grande): mesma narração do Short em pixel art.
const PASTA = "videos/imagina-so-01-mae-rpg-mwtkctmd/";
const PISO = 1560, MAE_X = 760, FILHO_X = 300;

const Marca: React.FC = () => (
  <div style={{ position: "absolute", left: 30, top: 54, background: "#241c46", border: "6px solid #1b1530", borderRadius: 22, padding: "10px 22px", fontFamily: "Poppins", fontWeight: 900, fontSize: 34, color: COR.amarelo, boxShadow: "0 8px 0 rgba(0,0,0,.25)" }}>💭 IMAGINA SÓ</div>
);
// Painel fixo do canto: nível da mãe.
const NivelMae: React.FC<{ t0?: number; conta?: number }> = ({ t0 = 0, conta }) => {
  const { t } = useT();
  const n = conta === undefined ? 99 : Math.round(rampa(t, conta, conta + 1.2, 1, 99));
  return (
    <Painel x={640} y={70} largura={400} titulo="NÍVEL DA MÃE" t0={t0}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: COR.rosa, border: "5px solid #1b1530", display: "grid", placeItems: "center", fontSize: 34 }}>👩</div>
        <div style={{ fontSize: 64, color: "#fff", lineHeight: 1 }}>{n}</div>
        <div style={{ fontSize: 26, color: COR.amarelo, marginTop: 18 }}>MÁX</div>
      </div>
      <div style={{ marginTop: 12, height: 16, background: "#3b3060", borderRadius: 8, overflow: "hidden" }}><div style={{ width: `${n}%`, height: "100%", background: COR.verde }} /></div>
    </Painel>
  );
};
const Placar: React.FC<{ voce: number; mae: string; t0?: number; y?: number }> = ({ voce, mae, t0 = 0, y = 300 }) => (
  <Painel x={640} y={y} largura={400} titulo="VIDA" cor="#e0364f" t0={t0}>
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, fontSize: 34 }}>
      <span style={{ background: COR.azul, color: "#fff", borderRadius: 16, padding: "4px 14px", border: "4px solid #1b1530" }}>VOCÊ {voce}</span>
      <span style={{ color: "#fff" }}>×</span>
      <span style={{ background: COR.vermelho, color: "#fff", borderRadius: 16, padding: "4px 14px", border: "4px solid #1b1530" }}>MÃE {mae}</span>
    </div>
  </Painel>
);

type Som = { t: number; tipo: "pop" | "plim" | "erro" | "whoosh" | "tecla" | "contagem" };
const Quadro: React.FC<{ cena?: { escuro?: number; vermelho?: number }; svg?: React.ReactNode; extra?: React.ReactNode; sons?: Som[]; treme?: number }> = ({ cena = {}, svg, extra, sons = [], treme = 0 }) => (
  <AbsoluteFill style={{ background: "#bfe7ff", transform: `translateX(${treme}px)` }}>
    <Cenario escuro={cena.escuro} vermelho={cena.vermelho} />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>{svg}</svg>
    <Marca />
    {extra}
    <Sons efeitos={sons as never} />
  </AbsoluteFill>
);

const especiais: Record<number, CenaEspecial> = {
  0: ({ cena: c }) => {
    const r = em(c, "rpg");
    const { t, f } = useT();
    return (
      <Quadro sons={[{ t: em(c, "mae"), tipo: "pop" }, { t: r, tipo: "plim" }]}
        svg={<Boneco x={540} y={PISO} tipo="mae" esc={1.3} expr="feliz" nome="Mãe" t0={em(c, "mae")} />}
        extra={t >= r && Math.floor(f / 6) % 2 === 0 ? <Faixa t0={r} txt="MODO RPG ATIVADO!" y={430} tam={64} /> : null} />
    );
  },
  1: ({ cena: c }) => (
    <Quadro sons={[{ t: em(c, "99"), tipo: "contagem" }]}
      svg={<Boneco x={540} y={PISO} tipo="mae" esc={1.3} expr="feliz" nome="Mãe" />}
      extra={<><NivelMae t0={em(c, "nivel")} conta={em(c, "nivel")} /><Faixa t0={em(c, "99")} txt="NÍVEL 99" y={470} tam={110} cor={COR.verde} /></>} />
  ),
  2: ({ cena: c }) => {
    const s = em(c, "sumiu");
    const { t } = useT();
    return (
      <Quadro sons={[{ t: em(c, "encontrar"), tipo: "whoosh" }, { t: s, tipo: "plim" }]}
        svg={<>
          <Boneco x={MAE_X} y={PISO} tipo="mae" esc={1.15} expr="normal" nome="Mãe" braco={40} />
          <Boneco x={FILHO_X} y={PISO} tipo="filho" esc={1.15} expr="surpreso" nome="Você" />
          {/* lupa gigante */}
          <g transform={`translate(${MAE_X - 150} 1130) rotate(-20)`}><circle cx={0} cy={0} r={70} fill="#bfe9ff" opacity={0.6} stroke={COR.linha} strokeWidth={10} /><rect x={-10} y={66} width={20} height={110} rx={8} fill="#8a5a2b" stroke={COR.linha} strokeWidth={7} /></g>
          {/* controle remoto achado */}
          {t >= s && <g transform={`translate(540 ${1250 - mola(t, s, 30) * 60})`}><rect x={-34} y={-70} width={68} height={140} rx={16} fill="#2a2a2a" stroke={COR.linha} strokeWidth={7} /><circle cx={0} cy={-40} r={12} fill={COR.vermelho} /><rect x={-18} y={-10} width={36} height={10} rx={5} fill="#888" /><rect x={-18} y={10} width={36} height={10} rx={5} fill="#888" /></g>}
        </>}
        extra={<><NivelMae /><Faixa t0={em(c, "habilidade")} txt="HABILIDADE 1: ACHA TUDO" y={440} tam={56} /><Balao t0={s} x={MAE_X} y={880} txt="TAVA AQUI!" /></>} />
    );
  },
  3: ({ cena: c }) => {
    const o = em(c, "olhar"), p = em(c, "paralisa");
    const { t } = useT();
    const u = rampa(t, o, o + 0.3);
    return (
      <Quadro cena={{ escuro: t >= o ? 0.25 : 0 }} sons={[{ t: o, tipo: "whoosh" }, { t: p, tipo: "erro" }]}
        svg={<>
          <Boneco x={MAE_X} y={PISO} tipo="mae" esc={1.15} expr="bravo" nome="Mãe" olhos={t >= o ? "laser" : null} />
          <Boneco x={FILHO_X} y={PISO} tipo="filho" esc={1.15} expr="medo" nome="Você" congelado={t >= p} />
          {t >= o && [0, 1].map((k) => <rect key={k} x={MAE_X - 40 - 460 * u} y={1128 + k * 22} width={460 * u} height={12} rx={6} fill={COR.vermelho} stroke="#fff" strokeWidth={3} />)}
        </>}
        extra={<><NivelMae /><Faixa t0={em(c, "habilidade")} txt="HABILIDADE 2: O OLHAR 👀" y={440} tam={56} />{t >= p && <Faixa t0={p} txt="PARALISADO!" y={600} tam={70} cor="#7fd3ff" gira={4} />}</>} />
    );
  },
  4: ({ cena: c }) => {
    const ch = em(c, "chinelo");
    const { t, f } = useT();
    return (
      <Quadro cena={{ escuro: 0.45 }} sons={[{ t: em(c, "lendaria"), tipo: "whoosh" }, { t: ch, tipo: "plim" }]}
        svg={t >= ch - 0.5 ? <Chinelo x={540} y={1060} esc={2.3 * mola(t, ch - 0.5, 30, 10, 160)} giro={Math.sin(f * 0.1) * 10} brilho /> : null}
        extra={<><Faixa t0={em(c, "lendaria")} txt="⭐ ITEM LENDÁRIO ⭐" y={360} tam={68} /><Faixa t0={ch} txt="O CHINELO" y={1360} tam={90} cor={COR.vermelho} gira={3} /></>} />
    );
  },
  5: ({ cena: c }) => {
    const a = em(c, "alcance"), cv = em(c, "curva"), v = em(c, "volta");
    const { t } = useT();
    const u = rampa(t, a, Math.max(a + 0.5, c.dur - 0.4));
    const ang = u * Math.PI * 2;
    const cx = MAE_X - Math.sin(ang) * 520, cy = 1120 - Math.sin(ang / 2) * 520 + (1 - Math.cos(ang)) * 60;
    return (
      <Quadro sons={[{ t: a, tipo: "whoosh" }, { t: cv, tipo: "whoosh" }, { t: v, tipo: "plim" }]}
        svg={<>
          <Boneco x={MAE_X} y={PISO} tipo="mae" esc={1.15} expr="bravo" nome="Mãe" braco={70} />
          <Boneco x={FILHO_X - 40} y={PISO} tipo="filho" esc={1.15} expr="medo" nome="Você" />
          {Array.from({ length: 8 }, (_, k) => { const uu = Math.max(0, u - k * 0.025), an = uu * Math.PI * 2; return <circle key={k} cx={MAE_X - Math.sin(an) * 520} cy={1120 - Math.sin(an / 2) * 520 + (1 - Math.cos(an)) * 60} r={18 - k * 2} fill={COR.amarelo} opacity={0.6 - k * 0.07} />; })}
          <Chinelo x={cx} y={cy} esc={0.9} giro={t * 900} />
        </>}
        extra={<><NivelMae /><Faixa t0={a} txt="ALCANCE INFINITO" y={360} tam={58} /><Faixa t0={cv} txt="FAZ CURVA ↪" y={500} tam={58} cor="#7fd3ff" gira={3} /><Faixa t0={v} txt="E VOLTA!" y={640} tam={58} cor={COR.verde} /></>} />
    );
  },
  6: ({ cena: c }) => {
    const r = em(c, "recupera");
    const { t, f } = useT();
    const vida = Math.round(12 + 88 * rampa(t, r, r + 1.2));
    return (
      <Quadro sons={[{ t: em(c, "comida"), tipo: "pop" }, { t: r, tipo: "contagem" }]}
        svg={<>
          <Boneco x={MAE_X} y={PISO} tipo="mae" esc={1.15} expr="feliz" nome="Mãe" braco={60} />
          <Boneco x={FILHO_X} y={PISO} tipo="filho" esc={1.15} expr={t >= r ? "feliz" : "normal"} nome="Você" />
          {/* prato fumegante */}
          <g transform="translate(540 1300)"><ellipse cx={0} cy={0} rx={110} ry={34} fill="#fff" stroke={COR.linha} strokeWidth={7} /><ellipse cx={0} cy={-8} rx={74} ry={20} fill="#e8b830" stroke={COR.linha} strokeWidth={5} />
            {[0, 1, 2].map((k) => <path key={k} d={`M ${-40 + k * 40} ${-40 - ((f * 2 + k * 30) % 60)} q 16 -20 0 -40 q -16 -20 0 -40`} stroke="#fff" strokeWidth={8} fill="none" opacity={0.8} strokeLinecap="round" />)}</g>
        </>}
        extra={<><Placar voce={vida} mae="MÁX" /><Faixa t0={em(c, "comida")} txt="🍲 COMIDA DE MÃE" y={560} tam={64} /><Sobe t0={em(c, "cem")} x={FILHO_X} y={880} txt="+100 HP" /></>} />
    );
  },
  7: ({ cena: c }) => {
    const fr = em(c, "gente"), ca = em(c, "casa");
    const { t } = useT();
    return (
      <Quadro cena={{ escuro: t >= ca ? 0.45 : 0 }} treme={t >= ca && t < ca + 0.4 ? Math.sin(t * 80) * 14 : 0} sons={[{ t: fr, tipo: "tecla" }, { t: ca, tipo: "erro" }]}
        svg={<>
          <Boneco x={MAE_X} y={PISO} tipo="mae" esc={1.15} expr={t >= ca ? "bravo" : "normal"} nome="Mãe" />
          <Boneco x={FILHO_X} y={PISO} tipo="filho" esc={1.15} expr={t >= ca ? "medo" : "normal"} nome="Você" />
        </>}
        extra={<><NivelMae /><Balao t0={fr} x={MAE_X - 120} y={900} txt="A gente conversa em casa." tam={40} letra={0.05} />{t >= ca && <Faixa t0={ca} txt="⚠ CHEFE DESPERTOU" y={440} tam={70} cor={COR.vermelho} />}</>} />
    );
  },
  8: ({ cena: c }) => {
    const { t } = useT();
    return (
      <Quadro cena={{ vermelho: 1 }} treme={Math.sin(t * 40) * 5} sons={[{ t: em(c, "batalha"), tipo: "erro" }]}
        svg={<>
          <Boneco x={700} y={PISO + 60} tipo="mae" esc={2.1} expr="bravo" nome="Mãe" olhos="laser" />
          <Boneco x={210} y={PISO} tipo="filho" esc={0.85} expr="medo" nome="Você" tremor />
        </>}
        extra={<><Placar voce={5} mae="MÁX" y={70} /><Faixa t0={em(c, "batalha")} txt="BATALHA FINAL" y={330} tam={80} cor={COR.vermelho} /><Faixa t0={em(c, "ninguem")} txt="0 VITÓRIAS NA HISTÓRIA" y={470} tam={50} gira={3} /></>} />
    );
  },
  9: ({ cena: c }) => {
    const l = em(c, "lavar");
    const { t, f } = useT();
    return (
      <Quadro sons={[{ t: em(c, "sobreviver"), tipo: "pop" }, { t: l, tipo: "plim" }]}
        svg={<>
          <Boneco x={FILHO_X + 60} y={PISO} tipo="filho" esc={1.15} expr={t >= l ? "feliz" : "normal"} nome="Você" braco={t >= l ? 30 + Math.sin(f * 0.6) * 25 : 0} />
          {/* pilha de louça */}
          <g transform="translate(620 1380)">
            {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={0} cy={-k * 30} rx={90} ry={22} fill="#fff" stroke={COR.linha} strokeWidth={6} />)}
            {t >= l && [0, 1, 2, 3, 4].map((k) => <path key={k} d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill="#fff" stroke="#7fd3ff" strokeWidth={3} transform={`translate(${-80 + k * 40} ${-150 - ((f * 1.5 + k * 20) % 60)})`} />)}
          </g>
        </>}
        extra={<><Faixa t0={em(c, "sobreviver")} txt="COMO SOBREVIVER?" y={360} tam={64} /><Faixa t0={l} txt="🍽 LAVAR A LOUÇA" y={500} tam={64} cor="#7fd3ff" gira={3} />{t >= l + 0.6 && <Faixa t0={l + 0.6} txt="MISSÃO SECRETA ✓" y={640} tam={54} cor={COR.verde} />}</>} />
    );
  },
  10: ({ cena: c }) => {
    const b = em(c, "amor"), v = em(c, "videogame");
    const { t, f } = useT();
    return (
      <Quadro sons={[{ t: b, tipo: "plim" }, { t: v, tipo: "contagem" }]}
        svg={<>
          <Boneco x={MAE_X} y={PISO} tipo="mae" esc={1.15} expr="feliz" nome="Mãe" />
          <Boneco x={FILHO_X} y={PISO} tipo="filho" esc={1.15} expr="feliz" nome="Você" />
          {t >= b && [0, 1, 2, 3].map((k) => <text key={k} x={440 + k * 70} y={1000 - ((f * 3 + k * 40) % 220)} fontSize={80}>❤️</text>)}
          {t >= v && <g transform={`translate(540 ${800 - mola(t, v, 30) * 40}) scale(${mola(t, v, 30)})`}><rect x={-120} y={-60} width={240} height={120} rx={50} fill={COR.roxo} stroke={COR.linha} strokeWidth={8} /><rect x={-80} y={-12} width={60} height={20} rx={6} fill={COR.linha} /><rect x={-60} y={-32} width={20} height={60} rx={6} fill={COR.linha} /><circle cx={50} cy={-12} r={14} fill={COR.amarelo} stroke={COR.linha} strokeWidth={4} /><circle cx={80} cy={14} r={14} fill={COR.vermelho} stroke={COR.linha} strokeWidth={4} /></g>}
        </>}
        extra={<><Faixa t0={b} txt="+ BÔNUS DE AMOR ❤️" y={360} tam={60} cor={COR.rosa} /><Sobe t0={v} x={540} y={720} txt="+1 HORA DE GAME" cor={COR.amarelo} tam={66} /></>} />
    );
  },
  11: ({ cena: c }) => (
    <Quadro sons={[{ t: em(c, "secreta"), tipo: "pop" }, { t: em(c, "comenta"), tipo: "plim" }]}
      svg={<Boneco x={540} y={PISO} tipo="mae" esc={1.3} expr="feliz" nome="Sua mãe" />}
      extra={<>
        <Painel x={640} y={70} largura={400} titulo="HABILIDADE SECRETA" t0={em(c, "secreta")}><div style={{ fontSize: 72, color: "#fff", textAlign: "center" }}>???</div></Painel>
        <Faixa t0={em(c, "comenta")} txt="COMENTA AÍ 👇" y={470} tam={84} cor={COR.amarelo} />
      </>} />
  ),
};

export const ImaginaSoMaeBloco: React.FC<Timeline> = (tl) => <Video {...tl} legenda={{ ...tl.legenda, pos: 88 }} pasta={PASTA} especiais={especiais} />;
