import { Freeze, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video, type CenaEspecial } from "../Shorts";
import { Arena, Boneco, Carimbo, Clarao, COR, Entra, Grande, Hud, Icone, Rotulo, Seta } from "../cenas/Arena";
import { codigo, em, fichas, type Linha } from "../cenas/Codigo";
import { recortarTimeline, type Timeline } from "../tipos";

const pasta = "videos/encapsulamento-em-c-com-resident-evil-4-mwc6ogy3/";
const verde = "rgba(95,211,106,.22)";
const vermelho = "rgba(255,95,87,.23)";

const PainelEffectCraft: React.FC<{ bloqueado: boolean; resultadoEm: number }> = ({ bloqueado, resultadoEm }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arquivo = bloqueado ? "escrita-bloqueada" : "escrita-livre";
  const playbackRate = 1.17 / resultadoEm;
  return (
    <Freeze frame={Math.min(frame, Math.floor(2.92 * fps / playbackRate))}>
      <OffthreadVideo
        src={staticFile(`encapsulamento/${arquivo}.mp4`)}
        playbackRate={playbackRate}
        muted
        style={{ width: "100%", display: "block", borderRadius: 20, boxShadow: "0 16px 48px #0e110a" }}
      />
    </Freeze>
  );
};

const Escrita = (bloqueado: boolean, palavra: string): CenaEspecial => ({ cena, indice }) => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const resultadoEm = Math.max(.8, Math.min(cena.dur - .8, 3.5, em(cena, palavra) || 1.17));
  return (
    <Arena cena={cena} indice={indice} lugar="oficina" zoom={0.025} sons={[{ t: resultadoEm, tipo: "erro" }]}>
      <Boneco tipo="leon" x={vertical ? width / 2 : 360} y={vertical ? 1290 : 806} h={vertical ? 470 : 505} />
      <div style={{ position: "absolute", left: vertical ? 66 : 715, top: vertical ? 340 : 337, width: vertical ? 948 : 1100 }}>
        <PainelEffectCraft bloqueado={bloqueado} resultadoEm={resultadoEm} />
      </div>
    </Arena>
  );
};

type EventoVida = {
  antes: number;
  depois: number;
  palavra: string;
  acao: string;
  cura?: boolean;
  derrota?: boolean;
};

const Vida = ({ antes, depois, palavra, acao, cura, derrota }: EventoVida): CenaEspecial =>
  ({ cena, indice }) => {
    const { width, height } = useVideoConfig();
    const vertical = height > width;
    const t = Math.min(em(cena, palavra), Math.max(0, cena.dur - 1.05));
    const leon = vertical ? 385 : 650;
    const outro = vertical ? 818 : 1390;
    const chao = vertical ? 1190 : 820;
    const hudY = vertical ? 520 : 278;
    return (
      <Arena cena={cena} indice={indice} tremor={cura ? [] : [t]} sons={[{ t, tipo: cura ? "plim" : "pop" }]}>
        <Hud nome="Leon" vida={depois} de={antes} em={t} x={leon} y={hudY} largura={vertical ? 450 : 510} />
        <Boneco tipo="leon" x={leon} y={chao} h={vertical ? 490 : 458} dano={cura ? [] : [t]} cai={derrota ? t + 0.38 : undefined} />
        {cura ? (
          <Entra t={t} x={outro} y={vertical ? 900 : 557}><Icone nome="erva" tam={vertical ? 143 : 200} cor={COR.vd} /></Entra>
        ) : (
          <Boneco tipo="ganado" arma="foice" x={outro} y={chao} h={vertical ? 425 : 430} vira ataca={[t]} />
        )}
        <Clarao t={t} x={leon} y={chao - 260} />
        <Carimbo txt={acao} t={t + 0.12} x={vertical ? width / 2 : 1320} y={vertical ? 690 : 233} tam={vertical ? 55 : 69} cor={cura ? COR.vd : COR.ama} />
      </Arena>
    );
  };

const Dupla = (comDano: boolean): CenaEspecial => ({ cena, indice }) => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const t = em(cena, comDano ? "dano" : "Ashley");
  const xLeon = width * 0.29;
  const xAshley = width * 0.71;
  const chao = vertical ? 1160 : 824;
  const hud = vertical ? 520 : 273;
  return (
    <Arena cena={cena} indice={indice} sons={[{ t, tipo: "pop" }]}>
      <Boneco tipo="leon" x={xLeon} y={chao} h={vertical ? 464 : 480} dano={comDano ? [t] : []} />
      <Boneco tipo="ashley" x={xAshley} y={chao} h={vertical ? 416 : 435} />
      <Hud nome="Leon" vida={comDano ? 70 : 100} de={comDano ? 100 : undefined} em={t} x={xLeon} y={hud} largura={vertical ? 360 : 420} />
      <Hud nome="Ashley" vida={60} max={60} t={comDano ? -1 : t} x={xAshley} y={hud} largura={vertical ? 360 : 420} />
      {comDano && <Carimbo txt="SEM ALTERAÇÃO" t={t} x={xAshley} y={hud + 115} tam={vertical ? 39 : 53} cor={COR.vd} />}
    </Arena>
  );
};

const Abertura: CenaEspecial = ({ cena, indice }) => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const t = Math.min(em(cena, "999"), cena.dur - 1);
  const x = width * (vertical ? 0.5 : 0.29);
  return (
    <Arena cena={cena} indice={indice} zoom={0.08} tremor={[t]} sons={[{ t, tipo: "erro" }]}>
      <Boneco tipo="leon" x={x} y={vertical ? 1250 : 830} h={vertical ? 560 : 526} />
      <Entra t={t} x={vertical ? width / 2 : 1320} y={vertical ? 420 : 360}><Rotulo txt="Vida = 999;" mono fundo={COR.ama} tam={vertical ? 63 : 87} /></Entra>
      <Carimbo txt="QUEM AUTORIZOU?" t={t + 0.35} x={vertical ? width / 2 : 1320} y={vertical ? 630 : 570} tam={vertical ? 52 : 82} />
    </Arena>
  );
};

const Fechamento: CenaEspecial = ({ cena, indice }) => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const t = em(cena, "inscreva-se");
  return (
    <Arena cena={cena} indice={indice} lugar="oficina" sons={[{ t, tipo: "plim" }]}>
      <Boneco tipo="leon" x={vertical ? width / 2 : 490} y={vertical ? 1275 : 825} h={vertical ? 550 : 552} />
      <Entra x={vertical ? width / 2 : 1300} y={vertical ? 450 : 355}><Grande txt="Dev Sobrevivente" tam={vertical ? 75 : 90} cor={COR.ama} /></Entra>
      <Entra t={t} x={vertical ? width / 2 : 1300} y={vertical ? 610 : 522}><Rotulo txt="INSCREVA-SE" fundo={COR.ama} tam={vertical ? 54 : 59} /></Entra>
    </Arena>
  );
};

const destaque = (txt: string, t: number, erro = false): Linha => ({
  txt, marca: t, corMarca: erro ? vermelho : verde, ...(erro ? { erro: t } : {}),
});
const painel = (linhas: Linha[]) => codigo(() => ({ titulo: "Personagem.cs", linhas }));
const campo = "public int vida = 100;";
const propriedade = "public int Vida { get; private set; }";
const dano = "Vida = Math.Max(0, Vida - quantidade);";
const cura = "Vida = (int)Math.Min((long)Vida + quantidade,";
const valida = "if (quantidade < 0)";
const excecao = "    throw new ArgumentOutOfRangeException();";
const fichasDe = (entradas: [string, string, string][]) => fichas((c) => ({
  fichas: entradas.map(([txt, sub, palavra]) => ({ txt, sub, t: em(c, palavra) })),
}));

const especiais: Record<number, CenaEspecial> = {
  0: Abertura,
  1: Dupla(false),
  2: Escrita(false, "imortal"),
  3: fichasDe([["ESTADO", "Vida do personagem", "estado"], ["OPERAÇÕES", "ReceberDano e Curar", "operações"]]),
  4: fichasDe([["Atacar()", "Uma ordem", "ordem"], ["ALDEÃO", "Golpe de foice", "inimigo"], ["CULTISTA", "Maldição", "ataque"]]),
  5: Vida({ antes: 100, depois: 70, palavra: "dano", acao: "QUEM ALTERA?" }),
  6: painel([{ txt: "class Personagem" }, { txt: "{" }, { txt: `    ${campo}`, t: .55 }, { txt: "}" }]),
  7: codigo((c) => ({ titulo: "Acesso direto", linhas: [{ txt: campo }, destaque("int atual = leon.vida;", em(c, "leia")), destaque("leon.vida = 70;", em(c, "escreva"))] })),
  8: Escrita(false, "absurdo"),
  9: codigo((c) => ({ titulo: "Estado inválido", linhas: [{ txt: campo }, destaque("leon.vida = -40;", em(c, "40"), true)], saida: [{ txt: "vida = -40", t: em(c, "negativa"), cor: COR.ver }] })),
  10: Escrita(false, "999"),
  11: fichasDe([["COMBATE", "Valida a vida", "verificações"], ["MENU", "Repete a regra", "lugares"], ["ATUALIZAÇÃO", "Uma verificação faltou", "esquecer"]]),
  12: fichasDe([["PERSONAGEM", "Uma regra para cada instância", "Personagem"], ["VIDA", "Estado guardado pela classe", "proteção"]]),
  13: codigo((c) => ({ titulo: "Personagem.cs", linhas: [{ txt: campo, risca: em(c, "propriedade") }, { txt: propriedade, t: em(c, "propriedade"), marca: em(c, "privada"), corMarca: verde }] })),
  14: fichasDe([["get", "O código externo pode ler", "get"], ["private set", "A classe controla a escrita", "private"]]),
  15: codigo((c) => ({ titulo: "Interface do jogo", linhas: [{ txt: propriedade }, destaque("hud.Exibir(leon.Vida);", em(c, "ler"))], saida: [{ txt: "HUD: Vida 100", t: em(c, "Vida"), cor: COR.vd }] })),
  16: Escrita(true, "bloqueia"),
  17: painel([{ txt: "public void ReceberDano(int quantidade)", t: .25 }, { txt: "{" }, { txt: "    // Aplica as regras do personagem" }, { txt: "}" }]),
  18: painel([{ txt: "leon.ReceberDano(30);" }, { txt: "// Dentro da classe Personagem" }, { txt: dano, t: .8 }]),
  19: codigo((c) => ({ titulo: "ReceberDano", linhas: [destaque(valida, em(c, "negativo")), { txt: excecao, t: .6 }], saida: [{ txt: "Quantidade negativa rejeitada", t: em(c, "negativo"), cor: COR.ver }] })),
  20: codigo((c) => ({ titulo: "ReceberDano", linhas: [destaque(dano, em(c, "zero"))], saida: [{ txt: "Math.Max(0, -20) → 0", t: em(c, "maior"), cor: COR.vd }] })),
  21: Vida({ antes: 100, depois: 70, palavra: "30", acao: "−30 DE VIDA" }),
  22: Vida({ antes: 70, depois: 0, palavra: "90", acao: "PISO: ZERO", derrota: true }),
  23: Vida({ antes: 70, depois: 0, palavra: "Zero", acao: "DERROTADO", derrota: true }),
  24: Vida({ antes: 70, depois: 100, palavra: "erva", acao: "CURAR", cura: true }),
  25: painel([{ txt: "public void ReceberDano(int quantidade)" }, { txt: "public void Curar(int quantidade)" }, destaque(valida, .75), { txt: excecao }]),
  26: codigo((c) => ({ titulo: "Curar", linhas: [destaque(cura, em(c, "Min")), { txt: "                     VidaMax);" }], saida: [{ txt: "Math.Min(120, 100) → 100", t: em(c, "máxima"), cor: COR.vd }] })),
  27: Vida({ antes: 70, depois: 100, palavra: "50", acao: "TETO: 100", cura: true }),
  28: fichasDe([["DANO", "Piso em 0", "Dano"], ["CURA", "Teto em VidaMax", "Cura"]]),
  29: painel([{ txt: "// Válido em todos os estados" }, destaque("0 <= Vida && Vida <= VidaMax", .9)]),
  30: painel([{ txt: "public Personagem(int vidaMax)" }, { txt: "{" }, destaque("    if (vidaMax <= 0)", .8), { txt: `    ${excecao}` }, { txt: "    Vida = VidaMax = vidaMax;" }, { txt: "}" }]),
  31: painel([{ txt: "public int VidaMax { get; }" }, { txt: propriedade }, { txt: "// Dentro do construtor:" }, destaque("Vida = VidaMax = vidaMax;", .7)]),
  32: Dupla(false),
  33: Dupla(true),
  34: painel([{ txt: propriedade }, { txt: "public bool Derrotado => Vida == 0;", t: .65 }]),
  35: codigo((c) => ({ titulo: "Estado calculado", linhas: [destaque("public bool Derrotado => Vida == 0;", em(c, "zero"))], saida: [{ txt: "Vida = 0 → Derrotado = true", t: em(c, "verdadeiro"), cor: COR.vd }] })),
  36: fichasDe([["VIDA: 0", "A barra mostra derrota", "vida"], ["EM PÉ?", "O segundo estado contradiz", "contradição"]]),
  37: painel([{ txt: "public bool Derrotado => Vida == 0;" }, { txt: "if (leon.Derrotado) FimDaPartida();", t: .65 }]),
  38: fichasDe([["Recarregar()", "Respeita a capacidade", "Recarregar"], ["MUNIÇÃO", "Entre 0 e o máximo", "limite"]]),
  39: fichasDe([["Adicionar(item)", "Verifica espaço livre", "Adicionar"], ["INVENTÁRIO", "Controla os próprios itens", "espaço"]]),
  40: fichasDe([["Depositar()", "Entrada de saldo", "Depósito"], ["Sacar()", "Verifica saldo disponível", "saque"]]),
  41: painel([{ txt: "leon.Vida = 70;", risca: 1 }, destaque("leon.ReceberDano(30);", 1.05)]),
  42: painel([{ txt: "public string Apelido { get; set; }" }, { txt: "// Aqui, o jogo permite troca direta.", t: .55 }]),
  43: Escrita(true, "reservada"),
  44: fichasDe([["PROTEJA", "Declare as invariantes", "Proteja"], ["EXPONHA", "Métodos com intenção", "exponha"], ["TESTE", "Exercite os limites", "teste"]]),
  45: painel([{ txt: "var leon = new Personagem(100);" }, { txt: "leon.ReceberDano(30);", t: .45 }, { txt: "leon.Curar(50);", t: 1.1 }]),
  46: Vida({ antes: 70, depois: 100, palavra: "100", acao: "TESTE PASSOU", cura: true }),
  47: Vida({ antes: 70, depois: 0, palavra: "zero", acao: "DERROTADO", derrota: true }),
  48: fichasDe([["Disparar()", "Bloqueia quando está vazio", "disparar"], ["Recarregar()", "Respeita a capacidade", "recarregar"]]),
  49: ({ cena, indice }) => {
    const { width, height } = useVideoConfig();
    const vertical = height > width;
    const t = em(cena, "ação");
    return (
      <Arena cena={cena} indice={indice} lugar="oficina" sons={[{ t, tipo: "plim" }]}>
        <Entra x={vertical ? width / 2 : 460} y={440}><Rotulo txt="JOGO PEDE" fundo={COR.beg} tam={65} /></Entra>
        <Seta t={t} x1={vertical ? width / 2 : 700} x2={vertical ? width / 2 : 1150} y1={vertical ? 530 : 440} y2={vertical ? 785 : 440} />
        <Entra t={t} x={vertical ? width / 2 : 1450} y={vertical ? 900 : 440}><Rotulo txt="OBJETO VALIDA" fundo={COR.ama} tam={65} /></Entra>
      </Arena>
    );
  },
  50: Fechamento,
};

const corte = [0, 2, 3, 13, 14, 16, 17, 20, 21, 24, 26, 27, 28, 48, 49, 50];
const especiaisShort = Object.fromEntries(corte.map((origem, indice) => [indice, especiais[origem]]));

export const timelineShortEncapsulamento = (timeline: Timeline) =>
  recortarTimeline(timeline, corte, { largura: 1080, altura: 1920, legenda: { ...timeline.legenda, pos: 74 } });

export const EncapsulamentoCSharp: React.FC<Timeline> = (tl) => <Video {...tl} pasta={pasta} especiais={especiais} />;
export const EncapsulamentoShort: React.FC<Timeline> = (tl) => <Video {...tl} pasta={pasta} especiais={especiaisShort} />;
