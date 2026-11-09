import type React from "react";
import { Video, type CenaEspecial } from "../Shorts";
import { recortarTimeline, type Cena, type Timeline } from "../tipos";
import { codigo, em, fichas, type Linha } from "../cenas/Codigo";
import { Mascote } from "../cenas/Mascote";
import { Arena, Boneco, Carimbo, Clarao, COR, Contador, Entra, FichaClasse, Grande, Hud, Icone, ParedeCodigo, Rotulo, Seta } from "../cenas/Arena";

// "Polimorfismo em C# com Resident Evil 4": 56 cenas, 16:9, ~4:09.
// Cenário e personagens desenhados em cenas/Arena.tsx (inspirados no jogo, sem
// imagens dele). `V` = formato em pé: as cenas de arena servem aos dois vídeos.

const PASTA = "videos/polimorfismo-em-c-com-resident-evil-4-mw94fzna/";
const OK = "rgba(40,200,64,.18)";
const pop = (...t: number[]) => t.map((x) => ({ t: x, tipo: "pop" as const }));

const INIMIGOS = [
  { nome: "ALDEÃO", golpe: "FOICE!", tom: 0, arma: "foice" as const, cor: COR.ama },
  { nome: "MOTOSSERRA", golpe: "SERRA!", tom: 1, arma: "motosserra" as const, cor: COR.ver },
  { nome: "CULTISTA", golpe: "MALDIÇÃO!", tom: 2, arma: "cajado" as const, cor: COR.azul },
];
const layout = (V: boolean) => ({
  x: V ? [190, 540, 890] : [380, 960, 1540],
  chao: V ? 1100 : 836,
  h: V ? 430 : 440,
  nomeY: V ? 560 : 300,
  golpeY: V ? 400 : 200,
  tamNome: V ? 34 : 44,
  cx: V ? 540 : 960,
});

// Os três inimigos em fila; `ativo` destaca um só, que ataca em `tAtaque`.
const Trio: React.FC<{ V: boolean; tempos?: number[]; ataques?: number[]; ativo?: number }> = ({ V, tempos = [-1, -1, -1], ataques = [], ativo }) => {
  const g = layout(V);
  return (
    <>
      {INIMIGOS.map((n, i) => {
        const ta = ataques[i];
        const apagado = ativo !== undefined && ativo !== i;
        return (
          <div key={n.nome} style={{ position: "absolute", left: 0, top: 0, opacity: apagado ? 0.35 : 1 }}>
            <Boneco tipo="ganado" tom={n.tom} arma={n.arma} x={g.x[i]} y={g.chao} h={g.h} t={tempos[i]} de="baixo" ataca={ta !== undefined ? [ta, ta + 0.7] : []} />
            <Entra t={tempos[i]} x={g.x[i]} y={g.nomeY}><Rotulo txt={n.nome} fundo={n.cor} tam={g.tamNome} /></Entra>
            {ta !== undefined && <Carimbo txt={n.golpe} t={ta} x={g.x[i]} y={g.golpeY} cor={n.cor} tam={V ? 44 : 76} />}
            {ta !== undefined && <Clarao t={ta} x={g.x[i]} y={g.chao - g.h * 0.6} />}
          </div>
        );
      })}
    </>
  );
};

const Volta = (i: number, n: number): CenaEspecial => ({ cena: c, indice }) => {
  const h = c.dur > 0 ? em(c, ["foice", "avanca", "lanca"][i]) : 0;
  return (
    <Arena cena={c} indice={indice} tremor={[h]} sons={pop(h)}>
      <Entra x={960} y={60}><Rotulo txt={`volta ${n} · inimigo.Atacar()`} mono fundo={COR.beg} tam={44} /></Entra>
      <Trio V={false} ataques={[i === 0 ? h : undefined, i === 1 ? h : undefined, i === 2 ? h : undefined] as number[]} ativo={i} />
    </Arena>
  );
};
const VoltaEmPe = (i: number, n: number): CenaEspecial => ({ cena: c, indice }) => {
  const h = em(c, ["foice", "avanca", "lanca"][i]);
  return (
    <Arena cena={c} indice={indice} tremor={[h]} sons={pop(h)}>
      <Entra x={540} y={240}><Rotulo txt={`volta ${n}: Atacar()`} mono fundo={COR.beg} tam={52} /></Entra>
      <Trio V ataques={[i === 0 ? h : undefined, i === 1 ? h : undefined, i === 2 ? h : undefined] as number[]} ativo={i} />
    </Arena>
  );
};

// ── cenas de arena usadas no longo e no Short ───────────────────────────
const Cerco = (V: boolean): CenaEspecial => ({ cena: c, indice }) => {
  const g = layout(V);
  const t = em(c, "ataquem");
  return (
    <Arena cena={c} indice={indice} tremor={[t]} sons={pop(em(c, "cercam"), t)} zoom={0.1}>
      <Boneco tipo="ganado" tom={0} arma="foice" x={V ? 170 : 300} y={V ? 1000 : 836} h={V ? 400 : 440} de="esq" t={em(c, "cercam")} />
      <Boneco tipo="ganado" tom={1} arma="motosserra" x={V ? 910 : 1620} y={V ? 1000 : 836} h={V ? 400 : 440} de="dir" vira t={em(c, "cercam")} />
      <Boneco tipo="ganado" tom={2} arma="cajado" x={V ? 540 : 1280} y={V ? 880 : 836} h={V ? 340 : 400} de="dir" vira t={em(c, "cercam")} />
      <Boneco tipo="leon" x={V ? 540 : 800} y={V ? 1400 : 836} h={V ? 620 : 500} dano={[t + 0.1]} />
      <Entra t={em(c, "ordem")} x={g.cx} y={V ? 360 : 170}><Rotulo txt="inimigo.Atacar();" mono fundo={COR.ama} tam={V ? 72 : 66} /></Entra>
      <Carimbo txt="ATAQUEM!" t={t} x={g.cx} y={V ? 580 : 400} tam={V ? 120 : 130} />
    </Arena>
  );
};
const Tres = (V: boolean): CenaEspecial => ({ cena: c, indice }) => {
  const [a, b, d] = [em(c, "foice"), em(c, "avanca"), em(c, "maldicao")];
  return (
    <Arena cena={c} indice={indice} tremor={[a, b, d]} sons={pop(a, b, d)}>
      <Trio V={V} tempos={[em(c, "aldeao"), em(c, "motosserra"), em(c, "cultista")]} ataques={[a, b, d]} />
    </Arena>
  );
};
const Pergunta = (V: boolean): CenaEspecial => ({ cena: c, indice }) => {
  const g = layout(V);
  const q = em(c, "como");
  return (
    <Arena cena={c} indice={indice} sons={pop(em(c, "comando"), q)}>
      <Entra t={em(c, "comando")} x={g.cx} y={V ? 300 : 120}><Rotulo txt="1 comando → 3 ataques" fundo={COR.ama} tam={V ? 60 : 60} /></Entra>
      <Trio V={V} />
      <Entra t={q} x={g.cx} y={V ? 760 : 470}><Grande txt="?" tam={V ? 320 : 300} cor={COR.ama} /></Entra>
    </Arena>
  );
};
const Revela = (V: boolean): CenaEspecial => ({ cena: c, indice }) => {
  const t = em(c, "polimorfismo");
  return (
    <Arena cena={c} indice={indice} lugar="oficina" zoom={0.12} tremor={[t]} sons={[{ t, tipo: "plim" }]}>
      <Entra t={t} x={V ? 540 : 960} y={V ? 700 : 430}><Grande txt="POLIMORFISMO" tam={V ? 104 : 190} cor={COR.ama} /></Entra>
    </Arena>
  );
};
const MuitasFormas = (V: boolean): CenaEspecial => ({ cena: c, indice }) => {
  const t = em(c, "muitas"), f = em(c, "formas");
  const cx = V ? 540 : 960;
  return (
    <Arena cena={c} indice={indice} lugar="oficina" sons={pop(t, f)}>
      <Entra x={cx} y={V ? 350 : 190}><Grande txt="POLIMORFISMO" tam={V ? 104 : 110} /></Entra>
      <Entra t={t} x={V ? 540 : 500} y={V ? 680 : 480}><Rotulo txt="POLI = muitas" fundo={COR.ama} tam={V ? 84 : 66} /></Entra>
      <Entra t={f} x={V ? 540 : 1340} y={V ? 860 : 480}><Rotulo txt="MORFISMO = formas" fundo={COR.azul} tam={V ? 76 : 66} /></Entra>
    </Arena>
  );
};
const Regenerador = (V: boolean): CenaEspecial => ({ cena: c, indice }) => {
  const t = em(c, "regenerador"), n = em(c, "nova");
  return (
    <Arena cena={c} indice={indice} lugar="oficina" tremor={[n]} sons={[{ t, tipo: "pop" }, { t: n, tipo: "plim" }]}>
      <FichaClasse x={V ? 540 : 560} y={V ? 420 : 440} t={t} de="esq" nome="class Regenerador : Inimigo" largura={V ? 960 : 900} tam={V ? 50 : 50} linhas={[{ txt: "override Atacar()", marca: n }]} legenda="só uma classe nova" />
      <Boneco tipo="ganado" tom={2} x={V ? 540 : 1450} y={V ? 1400 : 836} h={V ? 620 : 540} t={n} de="zoom" />
    </Arena>
  );
};
const Cta = (V: boolean): CenaEspecial => ({ cena: c, indice }) => (
  <Arena cena={c} indice={indice} lugar="oficina" sons={pop(em(c, "gostei"), em(c, "inscrevase"), em(c, "compartilhe"))}>
    <Entra t={em(c, "gostei")} x={V ? 210 : 620} y={V ? 300 : 300}><Icone nome="like" tam={V ? 260 : 240} cor={COR.ama} /></Entra>
    <Entra t={em(c, "inscrevase")} x={V ? 540 : 1000} y={V ? 300 : 300}><Icone nome="sino" tam={V ? 260 : 240} cor={COR.ver} /></Entra>
    <Entra t={em(c, "compartilhe")} x={V ? 870 : 1380} y={V ? 300 : 300}><Icone nome="compartilha" tam={V ? 240 : 220} cor={COR.azul} /></Entra>
    <Entra t={em(c, "dev")} x={V ? 540 : 1000} y={V ? 560 : 560}><Rotulo txt="Dev Sobrevivente" fundo={COR.ama} tam={V ? 92 : 92} /></Entra>
    <Mascote pose="acenando" palavras={c.palavras} indice={0} fimFala={c.dur} />
  </Arena>
);

// ── código ───────────────────────────────────────────────────────────────
const BASE = (c: Cena, marca?: number): Linha[] => [
  { txt: "class Inimigo", t: em(c, "classe") },
  { txt: "{" },
  { txt: "    public virtual void Atacar()", t: em(c, "atacar"), marca },
  { txt: "    {" },
  { txt: "        Console.WriteLine(\"Ataque padrão\");" },
  { txt: "    }" },
  { txt: "}" },
];
const filha = (nome: string, msg: string, c: Cena, tudoJa = false, marca?: number): Linha[] => [
  { txt: `class ${nome} : Inimigo`, t: tudoJa ? undefined : 0 },
  { txt: "{" },
  { txt: "    public override void Atacar()", marca },
  { txt: "    {" },
  { txt: `        Console.WriteLine("${msg}");` },
  { txt: "    }" },
  { txt: "}" },
];
const LISTA: Linha[] = [
  { txt: "var inimigos = new List<Inimigo>" },
  { txt: "{" },
  { txt: "    new Aldeao()," },
  { txt: "    new Motosserra()," },
  { txt: "    new Cultista()," },
  { txt: "};" },
];

const especiais: Record<number, CenaEspecial> = {
  // ── gancho ──
  0: Cerco(false),
  1: Tres(false),
  2: Pergunta(false),
  3: Revela(false),
  4: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "polimorfismo"), em(c, "evil"))}>
      <Boneco tipo="leon" x={330} h={520} />
      <Entra t={em(c, "polimorfismo")} x={1200} y={330}><Grande txt="Polimorfismo em C#" tam={104} cor={COR.ama} /></Entra>
      <Entra t={em(c, "exemplos")} x={1200} y={520}><Rotulo txt="com exemplos inspirados em RE4" tam={50} /></Entra>
    </Arena>
  ),
  5: MuitasFormas(false),
  6: ({ cena: c, indice }) => {
    const r = em(c, "reage");
    return (
      <Arena cena={c} indice={indice} sons={pop(em(c, "botao"), r)}>
        <Entra t={em(c, "botao")} x={960} y={200}><Icone nome="controle" tam={260} cor={COR.ama} /></Entra>
        <Boneco tipo="leon" x={380} h={420} ataca={[r]} />
        <Boneco tipo="ashley" x={960} h={380} ataca={[r + 0.2]} />
        <Boneco tipo="ganado" x={1540} h={420} vira ataca={[r + 0.4]} />
      </Arena>
    );
  },
  7: ({ cena: c, indice }) => {
    const f = em(c, "forma");
    return (
      <Arena cena={c} indice={indice} lugar="oficina" sons={pop(em(c, "chamada"), f)}>
        <Entra t={em(c, "chamada")} x={420} y={460}><Rotulo txt="inimigo.Atacar()" mono fundo={COR.ama} tam={62} /></Entra>
        {INIMIGOS.map((n, i) => (
          <div key={n.nome} style={{ position: "absolute", left: 0, top: 0 }}>
            <Seta t={f + i * 0.2} x1={760} y1={460} x2={1120} y2={220 + i * 240} />
            <Entra t={f + i * 0.2} x={1440} y={220 + i * 240}><Rotulo txt={n.golpe} fundo={n.cor} tam={68} /></Entra>
          </div>
        ))}
      </Arena>
    );
  },

  // ── sem polimorfismo ──
  8: codigo((c) => ({
    titulo: "SemPolimorfismo.cs",
    linhas: [
      { txt: "foreach (var inimigo in inimigos)", t: em(c, "cada") },
      { txt: "{", t: em(c, "cada") },
      { txt: "    if (inimigo is Aldeao) ...", t: em(c, "tipo"), marca: em(c, "tipo") },
      { txt: "}", t: em(c, "tipo") },
    ],
  })),
  9: codigo((c) => ({
    titulo: "SemPolimorfismo.cs",
    linhas: [
      { txt: "if (inimigo is Aldeao)", t: em(c, "aldeao") },
      { txt: "    JogarFoice();", t: em(c, "foice"), marca: em(c, "foice") },
      { txt: "else if (inimigo is Motosserra)", t: em(c, "motosserra") },
      { txt: "    Avancar();", t: em(c, "avanca"), marca: em(c, "avanca") },
      { txt: "else if (inimigo is Cultista)", t: em(c, "cultista") },
      { txt: "    Amaldicoar();", t: em(c, "amaldicoa"), marca: em(c, "amaldicoa") },
    ],
  })),
  10: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={[{ t: em(c, "50"), tipo: "contagem" }]}>
      <Contador ate={50} t={em(c, "50")} x={960} y={360} tam={300} />
      <Entra t={em(c, "tipos")} x={960} y={600}><Rotulo txt="tipos de inimigos" fundo={COR.ver} tam={70} /></Entra>
    </Arena>
  ),
  11: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} tremor={[em(c, "repetidas")]} sons={[{ t: em(c, "condicoes"), tipo: "contagem" }, { t: em(c, "repetidas"), tipo: "erro" }]}>
      <ParedeCodigo t0={em(c, "condicoes")} passo={0.05} txt="if (inimigo is ...)" />
      <Carimbo txt="50 CONDIÇÕES" t={em(c, "repetidas")} x={960} y={420} tam={120} />
    </Arena>
  ),
  12: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} tremor={[em(c, "cacar")]} sons={[{ t: em(c, "cacar"), tipo: "erro" }]}>
      <ParedeCodigo t0={0} passo={0.02} riscar={em(c, "alterar")} txt="if (inimigo is ...)" />
      <Boneco tipo="leon" x={960} h={520} dano={[em(c, "cacar")]} />
      <Carimbo txt="CAÇAR E ALTERAR TUDO" t={em(c, "cacar")} x={960} y={250} tam={84} />
    </Arena>
  ),
  13: fichas((c) => ({
    fichas: [
      { txt: "Classes", sub: "já vimos", t: em(c, "classes") },
      { txt: "Herança", sub: "já vimos", t: em(c, "heranca") },
    ],
    extra: [{ t: em(c, "resolve"), tipo: "pose", pose: "explicando" }],
  })),

  // ── a solução ──
  14: codigo((c) => ({ titulo: "Inimigo.cs", linhas: BASE(c) })),
  15: codigo((c) => ({ titulo: "Inimigo.cs", linhas: BASE({ ...c, palavras: [] }, em(c, "virtual")) })),
  16: codigo((c) => ({
    titulo: "Inimigo.cs",
    linhas: BASE({ ...c, palavras: [] }, 0),
    saida: [{ txt: "as filhas PODEM trocar", t: em(c, "permissao"), cor: COR.ama }],
  })),
  17: codigo((c) => ({ titulo: "Aldeao.cs", linhas: [{ txt: "class Aldeao : Inimigo", t: em(c, "aldeao"), marca: em(c, "herda") }, { txt: "{", t: em(c, "herda") }, { txt: "}", t: em(c, "herda") }] })),
  18: codigo((c) => ({ titulo: "Aldeao.cs", linhas: filha("Aldeao", "Joga a foice!", c, true, em(c, "override")) })),
  19: codigo((c) => ({
    titulo: "Aldeao.cs",
    linhas: filha("Aldeao", "Joga a foice!", c, true, 0),
    saida: [{ txt: "ignore o pai, use a minha versão", t: em(c, "ignore"), cor: COR.ama }],
  })),
  20: codigo((c) => ({ titulo: "Motosserra.cs", linhas: filha("Motosserra", "Avança com a serra!", c, true, em(c, "serra")) })),
  21: codigo((c) => ({ titulo: "Cultista.cs", linhas: filha("Cultista", "Lança a maldição!", c, true, em(c, "maldicao")) })),
  22: codigo((c) => ({
    titulo: "Mesma assinatura",
    linhas: [
      { txt: "Aldeao:     override void Atacar()", marca: em(c, "nome"), corMarca: OK },
      { txt: "Motosserra: override void Atacar()", marca: em(c, "nome"), corMarca: OK },
      { txt: "Cultista:   override void Atacar()", marca: em(c, "parametros"), corMarca: OK },
    ],
  })),
  23: codigo((c) => ({ titulo: "Program.cs", linhas: [{ txt: "var inimigos = new List<Inimigo>", t: em(c, "lista"), marca: em(c, "tipo") }] })),
  24: codigo((c) => ({
    titulo: "Program.cs",
    linhas: [LISTA[0], { ...LISTA[1], t: em(c, "dentro") }, { ...LISTA[2], t: em(c, "aldeao") }, { ...LISTA[3], t: em(c, "motosserra") }, { ...LISTA[4], t: em(c, "cultista") }, { ...LISTA[5], t: em(c, "cultista") }],
  })),
  25: ({ cena: c, indice }) => {
    const t = em(c, "herdam");
    return (
      <Arena cena={c} indice={indice} lugar="oficina" sons={pop(t, em(c, "e", 1))}>
        <FichaClasse x={960} y={250} t={0} nome="class Inimigo" largura={700} tam={56} linhas={[{ txt: "virtual Atacar()" }]} />
        {INIMIGOS.map((n, i) => (
          <div key={n.nome} style={{ position: "absolute", left: 0, top: 0 }}>
            <Seta t={t} x1={[380, 960, 1540][i]} y1={560} x2={960 + (i - 1) * 170} y2={410} />
            <Entra t={t} x={[380, 960, 1540][i]} y={630}><Rotulo txt={n.nome} fundo={n.cor} tam={56} /></Entra>
          </div>
        ))}
        <Entra t={em(c, "motosserra")} x={960} y={750}><Rotulo txt="Motosserra É UM Inimigo" fundo={COR.ama} tam={56} /></Entra>
      </Arena>
    );
  },
  26: codigo((c) => ({
    titulo: "Program.cs",
    linhas: [
      { txt: "foreach (var inimigo in inimigos)", t: em(c, "foreach") },
      { txt: "{", t: em(c, "foreach") },
      { txt: "    inimigo.Atacar();", t: em(c, "atacar"), marca: em(c, "atacar"), corMarca: OK },
      { txt: "}", t: em(c, "atacar") },
    ],
  })),
  27: codigo((c) => ({
    titulo: "Program.cs",
    linhas: [
      { txt: "foreach (var inimigo in inimigos)" },
      { txt: "{" },
      { txt: "    inimigo.Atacar();", ok: em(c, "if") },
      { txt: "}" },
    ],
    saida: [{ txt: "nenhum if", t: em(c, "if"), cor: COR.vd }],
  })),
  28: Volta(0, 1),
  29: Volta(1, 2),
  30: Volta(2, 3),

  // ── por que funciona ──
  31: ({ cena: c, indice }) => <VariavelObjeto c={c} indice={indice} V={false} />,
  32: fichas((c) => ({ fichas: [{ txt: "Tipo da variável", sub: "o que PODE chamar", t: em(c, "tipo") }, { txt: "Atacar()", sub: "existe em Inimigo", t: em(c, "chamar"), cor: COR.ama }] })),
  33: codigo((c) => ({
    titulo: "Program.cs",
    linhas: [{ txt: "Inimigo i = new Motosserra();", t: 0, marca: em(c, "new") }, { txt: "i.Atacar();", t: em(c, "versao"), marca: em(c, "versao"), corMarca: OK }],
    saida: [{ txt: "Avança com a serra!", t: em(c, "rodar"), cor: COR.ama }],
  })),
  34: ({ cena: c, indice }) => {
    const t = em(c, "motosserra", 2);
    return (
      <Arena cena={c} indice={indice} tremor={[t]} sons={pop(em(c, "guardado"), t)}>
        <Entra t={em(c, "guardado")} x={520} y={320}><Rotulo txt="Inimigo i" mono fundo={COR.beg} tam={84} /></Entra>
        <Seta t={em(c, "variavel")} x1={760} y1={330} x2={1130} y2={520} />
        <Boneco tipo="ganado" tom={1} arma="motosserra" x={1400} h={560} ataca={[t]} />
        <Carimbo txt="SEGUE MOTOSSERRA" t={t} x={1320} y={190} tam={68} cor={COR.ver} />
      </Arena>
    );
  },
  35: Regenerador(false),
  36: codigo((c) => ({
    titulo: "Program.cs",
    linhas: [{ txt: "foreach (var inimigo in inimigos)" }, { txt: "{" }, { txt: "    inimigo.Atacar();", ok: em(c, "igual") }, { txt: "}" }],
    saida: [{ txt: "0 linhas alteradas", t: em(c, "nenhuma"), cor: COR.vd }],
  })),
  37: fichas((c) => ({ fichas: [{ txt: "Aberto", sub: "para novidades", t: em(c, "aberto"), cor: COR.vd }, { txt: "Fechado", sub: "para alterações", t: em(c, "fechado"), cor: COR.ama }] })),

  // ── erros ──
  38: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} tremor={[em(c, "erros")]} sons={[{ t: em(c, "erros"), tipo: "erro" }]}>
      <Carimbo txt="4 ERROS COMUNS" t={em(c, "erros")} x={960} y={430} tam={150} />
    </Arena>
  ),
  39: codigo((c) => ({
    titulo: "Erro 1 · Inimigo.cs",
    linhas: [{ txt: "public void Atacar() { }", marca: em(c, "virtual") }, { txt: "// na filha:" }, { txt: "public override void Atacar() { }", erro: em(c, "compilador") }],
  })),
  40: codigo((c) => ({
    titulo: "Erro 2 · Motosserra.cs",
    linhas: [{ txt: "public new void Atacar() { }", marca: em(c, "new"), erro: em(c, "esconde") }],
    saida: [{ txt: "só esconde o método do pai", t: em(c, "esconde"), cor: COR.ver }],
  })),
  41: codigo((c) => ({
    titulo: "Program.cs",
    linhas: [{ txt: "Inimigo i = new Motosserra();" }, { txt: "i.Atacar();" }],
    saida: [{ txt: "Ataque padrão", t: em(c, "padrao"), cor: COR.ver }],
  })),
  42: codigo((c) => ({
    titulo: "Erro 3 · Motosserra.cs",
    linhas: [{ txt: "public override void Ataca() { }", marca: em(c, "nome"), erro: em(c, "compilador") }],
    saida: [{ txt: "nada para sobrescrever", t: em(c, "sobrescrever"), cor: COR.ver }],
  })),
  43: codigo((c) => ({
    titulo: "Erro 4",
    linhas: [{ txt: "if (inimigo is Motosserra)", erro: em(c, "if") }, { txt: "    Avancar();", risca: em(c, "metodo") }],
    saida: [{ txt: "faltou um método?", t: em(c, "metodo"), cor: COR.ama }],
  })),

  // ── fora dos jogos ──
  44: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" sons={pop(em(c, "jogos"))}>
      <Entra t={em(c, "jogos")} x={960} y={430}><Grande txt="NÃO É SÓ PARA JOGOS" tam={120} cor={COR.ama} /></Entra>
    </Arena>
  ),
  45: fichas((c) => ({ fichas: [{ txt: "Cartão", sub: "Pagar()", t: em(c, "cartao") }, { txt: "Pix", sub: "Pagar()", t: em(c, "pix"), cor: COR.ama }, { txt: "Boleto", sub: "Pagar()", t: em(c, "boleto") }] })),
  46: codigo((c) => ({
    titulo: "Checkout.cs",
    linhas: [{ txt: "pagamento.Pagar(total);", t: em(c, "chama"), marca: em(c, "resolve"), corMarca: OK }],
    saida: [{ txt: "cada forma resolve do seu jeito", t: em(c, "jeito"), cor: COR.ama }],
  })),
  47: codigo((c) => ({
    titulo: "Pagamentos.cs",
    linhas: [{ txt: "class NovaForma : Pagamento", t: em(c, "classe"), ok: em(c, "classe") }, { txt: "{", t: em(c, "classe") }, { txt: "    public override void Pagar(...)", t: em(c, "classe") }, { txt: "}", t: em(c, "classe") }],
  })),
  48: codigo((c) => ({
    titulo: "Motosserra.cs",
    linhas: [{ txt: "public override void Atacar()" }, { txt: "{" }, { txt: "    base.Atacar();", t: em(c, "base"), marca: em(c, "base"), corMarca: OK }, { txt: "}" }],
  })),
  49: codigo((c) => ({
    titulo: "Motosserra.cs",
    linhas: [{ txt: "    base.Atacar();", marca: em(c, "padrao"), corMarca: OK }, { txt: "    LigarSerra();", t: em(c, "liga"), marca: em(c, "serra"), corMarca: OK }],
    saida: [{ txt: "Ataque padrão", t: em(c, "padrao") }, { txt: "Serra ligada!", t: em(c, "serra"), cor: COR.ama }],
  })),

  // ── resumo e fim ──
  50: fichas((c) => ({ fichas: [{ txt: "virtual", sub: "libera", t: em(c, "virtual"), cor: COR.ama }] })),
  51: fichas((c) => ({ fichas: [{ txt: "virtual", sub: "libera", t: 0, cor: COR.ama }, { txt: "override", sub: "troca", t: em(c, "override") }] })),
  52: fichas((c) => ({ fichas: [{ txt: "virtual", sub: "libera", t: 0, cor: COR.ama }, { txt: "override", sub: "troca", t: 0 }, { txt: "objeto real", sub: "executa", t: em(c, "objeto"), cor: COR.vd }] })),
  53: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} tremor={[em(c, "polimorfismo")]} sons={[{ t: em(c, "comando"), tipo: "pop" }, { t: em(c, "polimorfismo"), tipo: "plim" }]}>
      <Entra t={em(c, "comando")} x={960} y={70}><Grande txt="UM COMANDO" tam={84} /></Entra>
      <Entra t={em(c, "muitas")} x={960} y={180}><Grande txt="MUITAS FORMAS" tam={84} cor={COR.ama} /></Entra>
      <Trio V={false} />
    </Arena>
  ),
  54: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "encapsulamento"), em(c, "vida"))}>
      <Boneco tipo="leon" x={420} h={540} />
      <Hud nome="Vida" vida={99} x={420} y={250} t={em(c, "vida")} largura={420} />
      <Entra t={em(c, "encapsulamento")} x={1250} y={340}><Rotulo txt="PRÓXIMO VÍDEO" fundo={COR.beg} tam={52} /></Entra>
      <Entra t={em(c, "encapsulamento")} x={1250} y={490}><Grande txt="Encapsulamento" tam={110} cor={COR.ama} /></Entra>
    </Arena>
  ),
  55: Cta(false),
};

// Cena 31 reaproveitada: variável à esquerda, objeto real à direita.
const VariavelObjeto: React.FC<{ c: Cena; indice: number; V: boolean }> = ({ c, indice, V }) => {
  const r = em(c, "real");
  return (
    <Arena cena={c} indice={indice} tremor={[r]} sons={pop(em(c, "variavel"), r)}>
      <Entra t={em(c, "variavel")} x={V ? 540 : 480} y={V ? 340 : 330}><Rotulo txt="variável: Inimigo" mono fundo={COR.beg} tam={V ? 68 : 62} /></Entra>
      <Seta t={em(c, "responde")} x1={V ? 540 : 800} y1={V ? 430 : 340} x2={V ? 540 : 1160} y2={V ? 620 : 500} />
      <Boneco tipo="ganado" tom={1} arma="motosserra" x={V ? 540 : 1420} y={V ? 1400 : 836} h={V ? 700 : 560} ataca={[r]} />
      <Carimbo txt="OBJETO REAL" t={r} x={V ? 540 : 1400} y={V ? 700 : 190} tam={V ? 92 : 76} cor={COR.ama} />
    </Arena>
  );
};

export const PolimorfismoCSharp: React.FC<Timeline> = (tl) => <Video {...tl} pasta={PASTA} especiais={especiais} />;

// ── Short (9:16, ~1 min) da mesma narração ───────────────────────────────
const CENAS_SHORT = [0, 1, 2, 3, 5, 16, 19, 26, 28, 29, 30, 31, 35, 55];

export const timelineShortPolimorfismo = (tl: Timeline) =>
  recortarTimeline(tl, CENAS_SHORT, { largura: 1080, altura: 1920, legenda: { ...tl.legenda, pos: 74 } });

const porOrigem: Record<number, CenaEspecial> = {
  0: Cerco(true), 1: Tres(true), 2: Pergunta(true), 3: Revela(true), 5: MuitasFormas(true),
  28: VoltaEmPe(0, 1), 29: VoltaEmPe(1, 2), 30: VoltaEmPe(2, 3),
  31: ({ cena: c, indice }) => <VariavelObjeto c={c} indice={indice} V />,
  35: Regenerador(true), 55: Cta(true),
};
const ESPECIAIS_SHORT = Object.fromEntries(
  CENAS_SHORT.map((orig, novo) => [novo, porOrigem[orig] ?? especiais[orig]]),
) as Record<number, CenaEspecial>;

export const PolimorfismoShort: React.FC<Timeline> = (tl) => <Video {...tl} pasta={PASTA} especiais={ESPECIAIS_SHORT} />;
