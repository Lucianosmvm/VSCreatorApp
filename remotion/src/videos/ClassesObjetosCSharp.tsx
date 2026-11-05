import { Video, type CenaEspecial } from "../Shorts";
import { recortarTimeline, type Timeline } from "../tipos";
import { codigo, em, fichas } from "../cenas/Codigo";
import { Mascote } from "../cenas/Mascote";
import { Arena, Boneco, Carimbo, Casa, Clarao, COR, Contador, Entra, Fabrica, FichaClasse, FichaObjeto, Grande, Hud, Icone, ParedeCodigo, Planta, Rotulo, Seta, type LinhaFicha } from "../cenas/Arena";

// "Classes e Objetos em C# com Resident Evil 4" — 58 cenas, 16:9, ~4:04.
// Reaproveita a narração já gerada. Cenário e personagens desenhados em
// cenas/Arena.tsx (inspirados no jogo, sem imagens dele); a classe é sempre a
// ficha azul de projeto, o objeto é sempre um personagem colorido com valores.

const PASTA = "videos/classes-e-objetos-em-c-com-resident-evil-mw0m04aw/";
const OK = "rgba(40,200,64,.18)";

const PROPS: LinhaFicha[] = [{ txt: "string Nome" }, { txt: "int Vida" }, { txt: "float Velocidade" }];
const pop = (...t: number[]) => t.map((x) => ({ t: x, tipo: "pop" as const }));

const especiais: Record<number, CenaEspecial> = {
  // ── introdução ──────────────────────────────────────────────────────────
  0: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "criados"))} zoom={0.1}>
      <Boneco tipo="leon" x={960} h={520} molde={em(c, "criados")} />
      <Entra t={em(c, "pensou")} x={1330} y={400} sai={em(c, "criados")}><Grande txt="?" tam={260} cor={COR.ama} /></Entra>
      <Entra t={em(c, "pensou")} x={590} y={480} sai={em(c, "criados")}><Grande txt="?" tam={170} /></Entra>
    </Arena>
  ),
  1: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "Leon"), em(c, "Ashley"), em(c, "inimigos"))}>
      <Boneco tipo="leon" x={350} h={480} t={em(c, "Leon")} de="esq" />
      <Entra t={em(c, "Leon")} x={350} y={280}><Rotulo txt="LEON" fundo={COR.ama} /></Entra>
      <Boneco tipo="ashley" x={740} h={420} t={em(c, "Ashley")} de="zoom" />
      <Entra t={em(c, "Ashley")} x={740} y={340}><Rotulo txt="ASHLEY" /></Entra>
      <Boneco tipo="ganado" x={1570} h={450} t={em(c, "varios")} de="dir" vira />
      <Boneco tipo="ganado" tom={1} x={1240} h={420} t={em(c, "inimigos")} de="dir" vira />
      <Entra t={em(c, "inimigos")} x={1400} y={270}><Rotulo txt="INIMIGOS" fundo={COR.ver} /></Entra>
    </Arena>
  ),
  2: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "vida"), em(c, "velocidade"), em(c, "ataques"))}>
      <Boneco tipo="leon" x={480} h={440} />
      <Boneco tipo="ganado" x={1440} h={440} vira ataca={[em(c, "ataques")]} />
      <Hud nome="Vida" vida={100} x={480} y={330} t={em(c, "vida")} />
      <Hud nome="Vida" vida={50} x={1440} y={330} t={em(c, "vida")} />
      <Hud nome="Velocidade" vida={80} x={480} y={210} t={em(c, "velocidade")} />
      <Hud nome="Velocidade" vida={40} x={1440} y={210} t={em(c, "velocidade")} />
      <Entra t={em(c, "ataques")} x={960} y={500}><Rotulo txt="ataques diferentes" fundo={COR.ama} tam={46} /></Entra>
    </Arena>
  ),
  3: fichas((c) => ({
    fichas: [
      { txt: "Leon.cs", sub: "do zero?", t: em(c, "programadores") },
      { txt: "Ashley.cs", sub: "do zero?", t: em(c, "cada") },
      { txt: "Ganado.cs", sub: "do zero?", t: em(c, "zero"), cor: COR.ama },
    ],
    extra: [{ t: em(c, "zero"), tipo: "pose", pose: "desconfiado" }],
  })),
  4: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} tremor={[em(c, "vezes")]} sons={[{ t: em(c, "centenas"), tipo: "contagem" }, { t: em(c, "vezes"), tipo: "erro" }]}>
      <ParedeCodigo t0={em(c, "centenas")} passo={0.05} riscar={em(c, "vezes")} />
      <Carimbo txt="MESMO CÓDIGO?" t={em(c, "vezes")} x={960} y={420} tam={110} />
    </Arena>
  ),
  5: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={[{ t: em(c, "classes"), tipo: "plim" }, { t: em(c, "objetos"), tipo: "plim" }]} tremor={[em(c, "objetos")]}>
      <FichaClasse x={520} y={460} t={em(c, "classes")} de="esq" linhas={PROPS} largura={680} tam={48} />
      <Entra t={em(c, "classes")} x={520} y={240}><Grande txt="CLASSE" cor={COR.azul} /></Entra>
      <Boneco tipo="leon" x={1390} h={520} t={em(c, "objetos")} de="dir" />
      <Entra t={em(c, "objetos")} x={1390} y={250}><Grande txt="OBJETO" cor={COR.ama} /></Entra>
    </Arena>
  ),

  // ── o que é uma classe ──────────────────────────────────────────────────
  6: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "sobrevivencia"))}>
      <Entra t={em(c, "sobrevivencia")} x={960} y={330}><Grande txt="NOSSO JOGO DE SOBREVIVÊNCIA" tam={78} cor={COR.ver} /></Entra>
      <Boneco tipo="leon" x={200} h={380} molde0 t={em(c, "criando")} de="esq" anda={[em(c, "criando"), c.dur, 880]} />
      <Boneco tipo="ganado" x={1680} h={380} molde0 t={em(c, "sobrevivencia")} de="dir" vira />
    </Arena>
  ),
  7: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" sons={pop(em(c, "caracteristicas"))}>
      <Boneco tipo="leon" x={420} y={790} h={520} molde0 />
      <Entra t={em(c, "criar")} x={420} y={150}><Grande txt="?" tam={150} cor={COR.ama} /></Entra>
      <FichaClasse x={1240} y={430} nome="personagem = ???" t={em(c, "definimos")} de="dir" largura={760} tam={50}
        linhas={[{ txt: "???", marca: em(c, "caracteristicas") }, { txt: "???", marca: em(c, "caracteristicas") }, { txt: "???", marca: em(c, "caracteristicas") }]} />
    </Arena>
  ),
  8: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" sons={pop(em(c, "nome"), em(c, "vida"), em(c, "velocidade"))}>
      <Boneco tipo="leon" x={420} y={790} h={520} molde0 />
      <FichaClasse x={1270} y={430} nome="personagem" largura={720} tam={52}
        linhas={[{ txt: "Nome", t: em(c, "nome") }, { txt: "Vida", t: em(c, "vida") }, { txt: "Velocidade", t: em(c, "velocidade") }]} />
      <Seta t={em(c, "nome")} x1={900} y1={385} x2={540} y2={330} />
      <Seta t={em(c, "vida")} x1={900} y1={455} x2={540} y2={490} />
      <Seta t={em(c, "velocidade")} x1={900} y1={525} x2={520} y2={700} />
    </Arena>
  ),
  9: ({ cena: c, indice }) => {
    const junta = em(c, "modelo");
    return (
      <Arena cena={c} indice={indice} lugar="oficina" zoom={0.09} tremor={[em(c, "classe")]} sons={[{ t: junta, tipo: "whoosh" }, { t: em(c, "classe"), tipo: "plim" }]}>
        <Entra x={330} y={250} sai={junta}><Rotulo txt="Nome" tam={60} /></Entra>
        <Entra x={1590} y={250} sai={junta}><Rotulo txt="Vida" tam={60} /></Entra>
        <Entra x={960} y={700} sai={junta}><Rotulo txt="Velocidade" tam={60} /></Entra>
        <FichaClasse x={960} y={440} t={junta} nome="modelo" trocaNome={{ t: em(c, "classe"), txt: "class Personagem" }} largura={860} tam={66} linhas={PROPS} />
      </Arena>
    );
  },
  10: codigo((c) => ({
    titulo: "Personagem.cs",
    linhas: [
      { txt: "class Personagem", t: em(c, "classe"), marca: em(c, "classe") },
      { txt: "{", t: em(c, "classe") },
      { txt: "    string Nome;", t: em(c, "caracteristicas") },
      { txt: "    int Vida;", t: em(c, "caracteristicas") },
      { txt: "    void Atacar() { }", t: em(c, "comportamentos"), marca: em(c, "comportamentos"), corMarca: OK },
      { txt: "}", t: em(c, "comportamentos") },
    ],
  })),
  11: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" zoom={0.02} sons={[{ t: em(c, "fabrica"), tipo: "pop" }, { t: em(c, "bonecos"), tipo: "pop" }]}>
      <Fabrica t0={0} saidas={[em(c, "molde"), em(c, "fabrica"), em(c, "bonecos")]} />
    </Arena>
  ),
  12: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" tremor={[em(c, "nao")]} sons={[{ t: em(c, "nao"), tipo: "erro" }]}>
      <FichaClasse x={600} y={430} largura={760} tam={58} linhas={PROPS} legenda="é só o molde" />
      <Boneco tipo="leon" x={1420} y={790} h={520} molde0 />
      <Carimbo txt="NÃO É O PERSONAGEM" t={em(c, "nao")} x={1380} y={480} tam={56} />
    </Arena>
  ),

  // ── o que é um objeto ───────────────────────────────────────────────────
  13: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} tremor={[em(c, "Leon")]} sons={[{ t: em(c, "Leon"), tipo: "plim" }]}>
      <FichaClasse x={500} y={470} t={em(c, "molde")} de="esq" linhas={PROPS} largura={660} tam={46} />
      <Seta t={em(c, "criar")} x1={860} y1={470} x2={1200} y2={520} />
      <Boneco tipo="leon" x={1450} h={560} t={em(c, "Leon")} de="zoom" />
    </Arena>
  ),
  14: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "nome"), em(c, "vida"), em(c, "comportamentos"))}>
      <Boneco tipo="leon" x={520} h={600} ataca={[em(c, "comportamentos")]} />
      <FichaObjeto nome="objeto: leon" x={1300} y={430} largura={720} tam={52} campos={[
        { k: "Nome", v: "\"Leon\"", t: em(c, "nome") }, { k: "Vida", v: "100", t: em(c, "vida") }, { k: "Ação", v: "Atacar()", t: em(c, "comportamentos") },
      ]} />
    </Arena>
  ),
  15: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} tremor={[em(c, "objeto")]} sons={[{ t: em(c, "objeto"), tipo: "plim" }, { t: em(c, "instancia"), tipo: "pop" }]}>
      <FichaClasse x={440} y={450} linhas={PROPS} largura={620} tam={44} />
      <Seta t={0.1} x1={780} y1={450} x2={1130} y2={520} />
      <Boneco tipo="leon" x={1380} h={560} />
      <Carimbo txt="OBJETO" t={em(c, "objeto")} x={1380} y={230} cor={COR.ama} tam={96} />
      <Entra t={em(c, "instancia")} x={440} y={700}><Rotulo txt="instância da classe" fundo={COR.ama} tam={48} /></Entra>
    </Arena>
  ),
  16: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={[{ t: em(c, "planta"), tipo: "pop" }, { t: em(c, "construida"), tipo: "plim" }]}>
      <Planta x={500} y={450} t={em(c, "planta")} tracar={em(c, "planta")} largura={660} />
      <Entra t={em(c, "classe")} x={500} y={130}><Grande txt="CLASSE" cor={COR.azul} tam={72} /></Entra>
      <Seta t={em(c, "objeto")} x1={860} y1={470} x2={1100} y2={520} />
      <Entra t={em(c, "objeto")} x={1400} y={130}><Grande txt="OBJETO" cor={COR.ama} tam={72} /></Entra>
      <Casa x={1400} t={em(c, "construida")} h={560} />
    </Arena>
  ),
  17: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} tremor={[em(c, "nao")]} sons={[{ t: em(c, "nao"), tipo: "erro" }]}>
      <Planta x={960} y={440} largura={800} tracar={-2} />
      <Carimbo txt="NÃO DÁ PARA MORAR!" t={em(c, "nao")} x={960} y={340} tam={76} />
      <Entra t={em(c, "projeto")} x={960} y={720}><Rotulo txt="só o projeto" fundo={COR.ama} tam={58} /></Entra>
    </Arena>
  ),
  18: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "modelo"), em(c, "objeto"))}>
      <FichaClasse x={520} y={480} linhas={PROPS} largura={700} tam={50} />
      <Entra t={em(c, "modelo")} x={520} y={200}><Grande txt="MODELO" cor={COR.azul} /></Entra>
      <Boneco tipo="leon" x={1400} h={560} t={em(c, "Leon")} de="dir" />
      <Entra t={em(c, "objeto")} x={1400} y={200}><Grande txt="OBJETO" cor={COR.ama} /></Entra>
      <Seta t={em(c, "criado")} x1={890} y1={480} x2={1130} y2={520} />
    </Arena>
  ),

  // ── vários objetos ──────────────────────────────────────────────────────
  19: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "Ganados"))}>
      <Boneco tipo="leon" x={330} h={500} />
      <Boneco tipo="ganado" x={2050} h={460} vira tom={0} t={em(c, "inimigos")} anda={[em(c, "inimigos"), em(c, "inimigos") + 1.6, 1040]} />
      <Boneco tipo="ganado" x={2300} h={480} vira tom={1} t={em(c, "inimigos")} anda={[em(c, "inimigos"), em(c, "inimigos") + 2.1, 1360]} />
      <Boneco tipo="ganado" x={2550} h={500} vira tom={2} t={em(c, "inimigos")} anda={[em(c, "inimigos"), em(c, "inimigos") + 2.5, 1690]} />
      <Entra t={em(c, "Ganados")} x={1360} y={230}><Rotulo txt="GANADOS" fundo={COR.ver} tam={64} /></Entra>
    </Arena>
  ),
  20: ({ cena: c, indice }) => {
    const liga = em(c, "compartilham");
    return (
      <Arena cena={c} indice={indice} sons={[{ t: liga, tipo: "plim" }]}>
        <FichaClasse x={960} y={140} largura={720} tam={62} de="cima" />
        <Seta t={liga} x1={800} y1={210} x2={360} y2={380} cor={COR.azul} />
        <Seta t={liga + 0.1} x1={900} y1={210} x2={820} y2={420} cor={COR.azul} />
        <Seta t={liga + 0.2} x1={1020} y1={210} x2={1190} y2={420} cor={COR.azul} />
        <Seta t={liga + 0.3} x1={1120} y1={210} x2={1560} y2={380} cor={COR.azul} />
        <Boneco tipo="leon" x={320} h={430} />
        <Boneco tipo="ganado" x={780} h={390} vira />
        <Boneco tipo="ganado" tom={1} x={1190} h={390} vira />
        <Boneco tipo="ganado" tom={2} x={1590} h={430} vira />
      </Arena>
    );
  },
  21: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={[{ t: em(c, "100"), tipo: "contagem" }, { t: em(c, "50"), tipo: "contagem" }]}>
      <Boneco tipo="leon" x={520} h={500} />
      <Boneco tipo="ganado" x={1400} h={500} vira />
      <Hud nome="Leon" vida={100} x={520} y={200} t={em(c, "100")} largura={560} />
      <Hud nome="Ganado" vida={50} x={1400} y={200} t={em(c, "50")} largura={560} />
    </Arena>
  ),
  22: ({ cena: c, indice }) => {
    const v = em(c, "classe");
    return (
      <Arena cena={c} indice={indice} sons={pop(v)}>
        <FichaClasse x={960} y={140} largura={720} tam={62} de="cima" />
        <Boneco tipo="leon" x={330} h={330} />
        <Boneco tipo="ganado" x={960} h={330} vira />
        <Boneco tipo="ganado" tom={1} x={1590} h={330} vira />
        <Hud nome="Leon" vida={100} x={330} y={410} t={v} largura={400} />
        <Hud nome="Ganado A" vida={50} x={960} y={410} t={v + 0.15} largura={400} />
        <Hud nome="Ganado B" vida={70} x={1590} y={410} t={v + 0.3} largura={400} />
      </Arena>
    );
  },
  23: ({ cena: c, indice }) => {
    const d = em(c, "dano");
    return (
      <Arena cena={c} indice={indice} tremor={[d]} sons={[{ t: d, tipo: "erro" }, { t: em(c, "muda"), tipo: "plim" }]}>
        <Boneco tipo="leon" x={430} h={480} dano={[d]} />
        <Boneco tipo="ganado" x={1240} h={440} vira />
        <Boneco tipo="ganado" tom={1} x={1640} h={440} vira />
        <Hud nome="Leon" vida={80} de={100} em={d} x={430} y={230} largura={520} />
        <Hud nome="Ganado A" vida={50} em={-1} x={1240} y={280} largura={380} />
        <Hud nome="Ganado B" vida={70} em={-1} x={1640} y={280} largura={380} />
        <Entra t={d} x={620} y={350}><Grande txt="-20" cor={COR.ver} tam={90} /></Entra>
        <Carimbo txt="NÃO MUDA" t={em(c, "muda")} x={1440} y={150} cor={COR.vd} tam={70} gira={3} />
      </Arena>
    );
  },
  24: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "estado"), em(c, "estrutura"))}>
      <Entra t={em(c, "estado")} x={960} y={110}><Grande txt="CADA OBJETO, SEU ESTADO" tam={70} cor={COR.ama} /></Entra>
      <Boneco tipo="leon" x={330} h={340} />
      <Boneco tipo="ganado" x={960} h={340} vira />
      <Boneco tipo="ganado" tom={1} x={1590} h={340} vira cai={em(c, "compartilhando")} />
      <Hud nome="Leon" vida={80} em={-1} x={330} y={400} largura={400} />
      <Hud nome="Ganado A" vida={50} em={-1} x={960} y={400} largura={400} />
      <Hud nome="Ganado B" vida={0} de={70} em={em(c, "compartilhando")} x={1590} y={400} largura={400} />
      <FichaClasse x={960} y={240} t={em(c, "estrutura")} largura={560} tam={40} />
    </Arena>
  ),

  // ── propriedades ────────────────────────────────────────────────────────
  25: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" sons={pop(em(c, "propriedades"), em(c, "caracteristicas"))}>
      <FichaClasse x={720} y={500} largura={800} tam={58} linhas={[{ txt: "string Nome", marca: em(c, "propriedades") }, { txt: "int Vida", marca: em(c, "propriedades") }, { txt: "float Velocidade", marca: em(c, "propriedades") }]} />
      <Boneco tipo="leon" x={1520} y={790} h={520} molde={em(c, "caracteristicas")} />
    </Arena>
  ),
  26: fichas((c) => ({
    fichas: [
      { txt: "Nome", sub: "quem é", t: em(c, "Nome") },
      { txt: "Vida", sub: "quanto aguenta", t: em(c, "Vida"), cor: COR.ama },
      { txt: "Velocidade", sub: "como se move", t: em(c, "Velocidade"), cor: "#b7c49a" },
    ],
  })),
  27: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "nome"), em(c, "100"), em(c, "5"))}>
      <Boneco tipo="leon" x={500} h={600} />
      <FichaObjeto nome="leon" x={1300} y={430} largura={740} tam={58} campos={[
        { k: "Nome", v: "\"Leon\"", t: em(c, "nome"), marca: em(c, "nome") }, { k: "Vida", v: "100", t: em(c, "100"), marca: em(c, "100") }, { k: "Velocidade", v: "5", t: em(c, "5"), marca: em(c, "5") },
      ]} />
    </Arena>
  ),
  28: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "50"), em(c, "3"))}>
      <Boneco tipo="ganado" x={1420} h={600} vira />
      <FichaObjeto nome="ganado" cor={COR.ver} x={620} y={430} largura={740} tam={58} campos={[
        { k: "Nome", v: "\"Ganado\"", t: em(c, "Ganado") }, { k: "Vida", v: "50", t: em(c, "50"), marca: em(c, "50") }, { k: "Velocidade", v: "3", t: em(c, "3"), marca: em(c, "3") },
      ]} />
    </Arena>
  ),
  29: ({ cena: c, indice }) => {
    const d = em(c, "valores");
    return (
      <Arena cena={c} indice={indice} sons={pop(em(c, "propriedades"), d)}>
        <FichaObjeto nome="leon" x={560} y={400} largura={700} tam={56} t={em(c, "dois")} de="esq" campos={[{ k: "Nome", v: "\"Leon\"" }, { k: "Vida", v: "100", marca: d }, { k: "Velocidade", v: "5", marca: d }]} />
        <FichaObjeto nome="ganado" cor={COR.ver} x={1360} y={400} largura={700} tam={56} t={em(c, "dois")} de="dir" campos={[{ k: "Nome", v: "\"Ganado\"" }, { k: "Vida", v: "50", marca: d }, { k: "Velocidade", v: "3", marca: d }]} />
        <Entra t={em(c, "propriedades")} x={960} y={150}><Grande txt="MESMAS PROPRIEDADES" tam={68} cor={COR.azul} /></Entra>
        <Entra t={d} x={960} y={700}><Grande txt="VALORES DIFERENTES" tam={68} cor={COR.ama} /></Entra>
      </Arena>
    );
  },
  30: codigo((c) => ({
    titulo: "Tipos de dados",
    linhas: [
      { txt: "class Personagem" },
      { txt: "{" },
      { txt: "    string Nome;      // texto", t: em(c, "string"), marca: em(c, "string") },
      { txt: "    int    Vida;      // inteiro", t: em(c, "int"), marca: em(c, "int") },
      { txt: "    float  Velocidade; // decimal", t: em(c, "float"), marca: em(c, "float") },
      { txt: "}" },
    ],
  })),

  // ── métodos ─────────────────────────────────────────────────────────────
  31: ({ cena: c, indice }) => {
    const a = em(c, "atacar");
    return (
      <Arena cena={c} indice={indice} tremor={[a]} sons={[{ t: em(c, "caminhar"), tipo: "pop" }, { t: a, tipo: "erro" }, { t: em(c, "equipamentos"), tipo: "pop" }]}>
        <Boneco tipo="leon" x={200} h={470} anda={[em(c, "caminhar"), a - 0.1, 880]} ataca={[a]} />
        <Boneco tipo="ganado" x={1450} h={470} vira dano={[a + 0.05]} />
        <Clarao t={a + 0.05} x={1120} y={500} />
        <Entra t={em(c, "caminhar")} x={330} y={230}><Rotulo txt="caminhar" tam={54} /></Entra>
        <Entra t={a} x={730} y={230}><Rotulo txt="atacar" fundo={COR.ver} tam={54} /></Entra>
        <Entra t={em(c, "equipamentos")} x={1270} y={230}><Rotulo txt="usar equipamentos" fundo={COR.ama} tam={54} /></Entra>
        <Entra t={em(c, "equipamentos")} x={1750} y={510}><Icone nome="erva" tam={210} /></Entra>
      </Arena>
    );
  },
  32: ({ cena: c, indice }) => {
    const m = em(c, "acoes");
    return (
      <Arena cena={c} indice={indice} lugar="oficina" sons={pop(m)}>
        <FichaClasse x={560} y={450} largura={760} tam={54} linhas={[...PROPS.map((l) => ({ ...l, cor: "#8fa2b0" })), { txt: "Atacar()", t: m, marca: m }, { txt: "Caminhar()", t: m + 0.15, marca: m + 0.15 }, { txt: "ReceberDano()", t: m + 0.3, marca: m + 0.3 }]} />
        <Boneco tipo="leon" x={1460} y={790} h={540} ataca={[m + 0.2]} />
        <Entra t={m} x={1460} y={170}><Grande txt="MÉTODOS = AÇÕES" tam={68} cor={COR.ama} /></Entra>
      </Arena>
    );
  },
  33: codigo((c) => ({
    titulo: "Personagem.cs",
    linhas: [
      { txt: "class Personagem" },
      { txt: "{" },
      { txt: "    public int Vida;" },
      { txt: "    public void Atacar()", t: em(c, "chamado"), marca: em(c, "Atacar"), corMarca: OK },
      { txt: "    {", t: em(c, "chamado") },
      { txt: "        // lógica do ataque", t: em(c, "Atacar") },
      { txt: "    }", t: em(c, "Atacar") },
      { txt: "}" },
    ],
  })),
  34: ({ cena: c, indice }) => {
    const a = em(c, "Leon", 2);
    return (
      <Arena cena={c} indice={indice} tremor={[a]} sons={[{ t: a, tipo: "erro" }]}>
        <Boneco tipo="leon" x={440} h={520} ataca={[a]} />
        <Clarao t={a + 0.05} x={740} y={500} />
        <Boneco tipo="ganado" x={1400} h={500} vira dano={[a + 0.05]} />
        <Hud nome="Ganado" vida={30} de={50} em={a} x={1400} y={230} largura={460} />
        <Entra t={em(c, "metodo")} x={600} y={190}><Rotulo txt="leon.Atacar();" mono fundo={COR.ama} tam={62} /></Entra>
      </Arena>
    );
  },
  35: ({ cena: c, indice }) => {
    const a = em(c, "reduzir");
    return (
      <Arena cena={c} indice={indice} tremor={[a]} sons={[{ t: a, tipo: "erro" }, { t: em(c, "80"), tipo: "contagem" }]}>
        <Boneco tipo="leon" x={480} h={500} dano={[a]} />
        <Boneco tipo="ganado" x={1000} h={500} vira ataca={[a - 0.2]} />
        <Hud nome="Leon" vida={80} de={100} em={a} x={480} y={230} largura={560} />
        <Entra t={em(c, "metodo")} x={1400} y={250}><Rotulo txt="ReceberDano(20);" mono fundo={COR.ama} tam={52} /></Entra>
        <Entra t={a} x={760} y={380}><Grande txt="-20" cor={COR.ver} tam={110} /></Entra>
        <Entra t={a + 0.4} x={1460} y={500}><Grande txt="100 → 80" tam={92} cor={COR.ver} /></Entra>
      </Arena>
    );
  },
  36: ({ cena: c, indice }) => {
    const p = em(c, "Propriedades"), m = em(c, "metodos");
    return (
      <Arena cena={c} indice={indice} lugar="oficina" tremor={[m]} sons={pop(p, m)}>
        <div style={{ position: "absolute", left: 958, top: 0, width: 4, height: 800, background: COR.oli }} />
        <Entra t={p} x={480} y={130}><Grande txt="PROPRIEDADES" cor={COR.azul} tam={76} /></Entra>
        <Hud nome="Vida" vida={80} x={480} y={300} t={p} largura={620} />
        <Boneco tipo="leon" x={480} y={790} h={400} t={p} />
        <Entra t={m} x={1440} y={130}><Grande txt="MÉTODOS" cor={COR.ama} tam={76} /></Entra>
        <Entra t={m} x={1440} y={300}><Rotulo txt="Atacar()" mono fundo={COR.ama} tam={60} /></Entra>
        <Boneco tipo="leon" x={1440} y={790} h={400} t={m} ataca={[m + 0.3, m + 1.2]} />
      </Arena>
    );
  },

  // ── na prática ──────────────────────────────────────────────────────────
  37: codigo((c) => ({
    linhas: [
      { txt: "class Personagem", t: em(c, "class"), marca: em(c, "class") },
      { txt: "{", t: em(c, "declarar") },
      { txt: "}", t: em(c, "declarar") },
    ],
  })),
  38: codigo((c) => ({
    titulo: "Personagem.cs",
    linhas: [
      { txt: "class Personagem" },
      { txt: "{" },
      { txt: "    public string Nome;", t: em(c, "Nome"), marca: em(c, "Nome") },
      { txt: "    public int Vida;", t: em(c, "Vida"), marca: em(c, "Vida") },
      { txt: "    public void Atacar() { }", t: em(c, "Atacar"), marca: em(c, "Atacar"), corMarca: OK },
      { txt: "}" },
    ],
  })),
  39: codigo((c) => ({
    titulo: "Program.cs",
    linhas: [{ txt: "var leon = new Personagem();", t: em(c, "criar"), marca: em(c, "new") }],
    saida: [{ txt: "nova instância criada", t: em(c, "instancia") }],
  })),
  40: ({ cena: c, indice }) => {
    const a = em(c, "objeto"), b = em(c, "objeto", 2);
    return (
      <Arena cena={c} indice={indice} tremor={[a, b]} sons={[{ t: a, tipo: "tecla" }, { t: a + 0.1, tipo: "pop" }, { t: b, tipo: "tecla" }, { t: b + 0.1, tipo: "pop" }]}>
        <Entra t={a} x={500} y={170}><Rotulo txt="var leon = new Personagem();" mono tam={42} fundo={COR.ama} /></Entra>
        <Boneco tipo="leon" x={500} h={420} t={a} de="zoom" />
        <Hud nome="Vida" vida={100} x={500} y={290} t={a + 0.2} largura={420} />
        <Entra t={b} x={1420} y={170}><Rotulo txt="var ganado = new Personagem();" mono tam={42} /></Entra>
        <Boneco tipo="ganado" x={1420} h={420} t={b} vira de="zoom" />
        <Hud nome="Vida" vida={50} x={1420} y={290} t={b + 0.2} largura={420} />
      </Arena>
    );
  },
  41: ({ cena: c, indice }) => {
    const a = em(c, "Atacar");
    return (
      <Arena cena={c} indice={indice} tremor={[a + 0.1]} sons={[{ t: a, tipo: "tecla" }, { t: a + 0.15, tipo: "erro" }]}>
        <Entra t={em(c, "Chamar")} x={960} y={180}><Rotulo txt="leon.Atacar();" mono fundo={COR.ama} tam={80} /></Entra>
        <Boneco tipo="leon" x={520} h={500} ataca={[a + 0.1, a + 1.3]} />
        <Clarao t={a + 0.15} x={830} y={510} />
        <Clarao t={a + 1.35} x={830} y={510} />
        <Boneco tipo="ganado" x={1440} h={480} vira dano={[a + 0.15, a + 1.35]} />
      </Arena>
    );
  },
  42: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "classes"), em(c, "componentes"), em(c, "animacoes"), em(c, "principio"))}>
      <Boneco tipo="leon" x={260} h={460} />
      <Boneco tipo="ganado" x={1660} h={460} vira />
      <Entra t={em(c, "classes")} x={600} y={200} gira={-3}><Rotulo txt="classes" tam={60} /></Entra>
      <Entra t={em(c, "componentes")} x={960} y={300} gira={2}><Rotulo txt="componentes" tam={60} /></Entra>
      <Entra t={em(c, "animacoes")} x={1320} y={200} gira={-2}><Rotulo txt="animações" tam={60} /></Entra>
      <Entra t={em(c, "principio")} x={960} y={520}><Grande txt="O PRINCÍPIO É O MESMO" tam={78} cor={COR.ama} /></Entra>
    </Arena>
  ),

  // ── por que usar ────────────────────────────────────────────────────────
  43: ({ cena: c, indice }) => {
    const n = em(c, "200");
    const horda = Array.from({ length: 24 }, (_, i) => i);
    return (
      <Arena cena={c} indice={indice} sons={[{ t: n, tipo: "contagem" }, { t: em(c, "organizacao"), tipo: "erro" }]}>
        {horda.map((i) => <Boneco key={i} tipo="ganado" tom={i} x={70 + ((i * 7) % 24) * 78} y={600 + (i % 4) * 75} h={190 + (i % 4) * 34} t={n + i * 0.04} vira={i % 2 === 0} />)}
        <Contador ate={200} t={n} x={960} y={270} tam={210} sufixo=" inimigos" />
        <Carimbo txt="SEM ORGANIZAÇÃO" t={em(c, "organizacao")} x={960} y={460} tam={68} />
      </Arena>
    );
  },
  44: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" tremor={[em(c, "varias")]} sons={[{ t: em(c, "repetiriamos"), tipo: "tecla" }, { t: em(c, "varias"), tipo: "erro" }]}>
      <ParedeCodigo t0={0} passo={0.06} txt="int vida; int vel;" />
      <Carimbo txt="COPIAR E COLAR" t={em(c, "varias")} x={960} y={420} tam={100} />
    </Arena>
  ),
  45: ({ cena: c, indice }) => {
    const r = em(c, "vez");
    return (
      <Arena cena={c} indice={indice} lugar="oficina" tremor={[em(c, "estrutura")]} sons={[{ t: em(c, "estrutura"), tipo: "plim" }, ...pop(r, r + 0.2, r + 0.4)]}>
        <FichaClasse x={960} y={200} t={em(c, "classes")} de="cima" largura={700} tam={58} />
        <Entra t={em(c, "vez")} x={1490} y={200}><Rotulo txt="uma vez" fundo={COR.ama} tam={52} /></Entra>
        <Boneco tipo="leon" x={300} y={790} h={380} t={r} de="zoom" />
        <Boneco tipo="ganado" x={750} y={790} h={380} t={r + 0.2} de="zoom" vira />
        <Boneco tipo="ganado" tom={1} x={1170} y={790} h={380} t={r + 0.4} de="zoom" vira />
        <Boneco tipo="ganado" tom={2} x={1620} y={790} h={380} t={r + 0.6} de="zoom" vira />
      </Arena>
    );
  },
  46: ({ cena: c, indice }) => {
    const n = em(c, "classe");
    return (
      <Arena cena={c} indice={indice} tremor={[n]} sons={[{ t: em(c, "outro"), tipo: "tecla" }, { t: n, tipo: "plim" }]}>
        <FichaClasse x={540} y={320} largura={700} tam={50} de="esq" />
        <Entra t={em(c, "outro")} x={540} y={520}><Rotulo txt="var novo = new Personagem();" mono tam={38} fundo={COR.ama} /></Entra>
        <Seta t={em(c, "usar")} x1={920} y1={480} x2={1180} y2={530} />
        <Boneco tipo="ganado" tom={2} x={1460} h={560} t={n} de="zoom" vira />
      </Arena>
    );
  },
  47: fichas((c) => ({
    colunas: 2,
    fichas: [
      { txt: "Organizado", sub: "projeto em ordem", t: em(c, "organiza"), cor: COR.ama },
      { txt: "Manutenção", sub: "muda em um só lugar", t: em(c, "manutencao"), cor: "#b7c49a" },
    ],
  })),

  // ── recapitulação ───────────────────────────────────────────────────────
  48: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "classe"), em(c, "objeto"))}>
      <FichaClasse x={520} y={490} t={em(c, "classe")} de="esq" largura={720} tam={52} linhas={PROPS} />
      <Entra t={em(c, "modelo")} x={520} y={220}><Grande txt="CLASSE = MODELO" cor={COR.azul} tam={66} /></Entra>
      <Boneco tipo="leon" x={1400} h={520} t={em(c, "objeto")} de="dir" />
      <Entra t={em(c, "instancia")} x={1270} y={220}><Grande txt="OBJETO = INSTÂNCIA" cor={COR.ama} tam={66} /></Entra>
    </Arena>
  ),
  49: fichas((c) => ({
    colunas: 2,
    fichas: [
      { txt: "Propriedades", sub: "guardam informações", t: em(c, "Propriedades") },
      { txt: "Métodos", sub: "representam ações", t: em(c, "metodos"), cor: COR.ama },
    ],
  })),
  50: ({ cena: c, indice }) => {
    const v = em(c, "compartilhar");
    return (
      <Arena cena={c} indice={indice} sons={pop(em(c, "estrutura"), v)}>
        <FichaClasse x={960} y={140} t={em(c, "estrutura")} largura={720} tam={62} de="cima" />
        <Boneco tipo="leon" x={360} h={340} />
        <Boneco tipo="ganado" x={960} h={340} vira />
        <Boneco tipo="ganado" tom={1} x={1560} h={340} vira />
        <Hud nome="Leon" vida={100} x={360} y={410} t={v} largura={400} />
        <Hud nome="Ganado A" vida={50} x={960} y={410} t={v + 0.15} largura={400} />
        <Hud nome="Ganado B" vida={70} x={1560} y={410} t={v + 0.3} largura={400} />
      </Arena>
    );
  },
  51: ({ cena: c, indice }) => {
    const l = em(c, "Leon"), g = em(c, "Ganados");
    return (
      <Arena cena={c} indice={indice} zoom={0.08} sons={pop(em(c, "molde"), l, g)}>
        <FichaClasse x={960} y={150} t={em(c, "classe")} largura={720} tam={62} de="cima" legenda="o molde" />
        <Boneco tipo="leon" x={360} h={460} t={l} />
        <Seta t={l} x1={800} y1={260} x2={480} y2={340} cor={COR.azul} />
        <Boneco tipo="ganado" x={1290} h={440} t={g} vira />
        <Boneco tipo="ganado" tom={1} x={1640} h={440} t={g + 0.15} vira />
        <Seta t={g} x1={1120} y1={260} x2={1400} y2={350} cor={COR.azul} />
      </Arena>
    );
  },

  // ── encerramento ────────────────────────────────────────────────────────
  52: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" sons={pop(em(c, "classes"), em(c, "objetos"))}>
      <Mascote pose="comemorando" palavras={c.palavras} indice={0} fimFala={c.dur} />
      <FichaClasse x={1000} y={430} t={em(c, "classes")} largura={560} tam={44} linhas={PROPS} />
      <Boneco tipo="leon" x={1560} y={790} h={500} t={em(c, "objetos")} de="dir" />
    </Arena>
  ),
  53: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "jogar"), em(c, "objeto"))}>
      <Entra t={em(c, "jogar")} x={960} y={340}><Icone nome="controle" tam={420} /></Entra>
      <Boneco tipo="leon" x={280} h={430} />
      <Boneco tipo="ganado" x={1640} h={430} vira />
      <Carimbo txt="TUDO OBJETO?" t={em(c, "objeto")} x={960} y={640} cor={COR.ama} tam={70} gira={-3} />
    </Arena>
  ),
  54: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "arma"), em(c, "inimigo"), em(c, "cura"))}>
      <Entra t={em(c, "arma")} x={360} y={420} de="baixo"><Icone nome="pistola" tam={320} /></Entra>
      <Entra t={em(c, "arma")} x={360} y={190}><Rotulo txt="Arma" fundo={COR.ama} tam={54} /></Entra>
      <Boneco tipo="ganado" x={960} h={560} t={em(c, "inimigo")} />
      <Entra t={em(c, "inimigo")} x={960} y={190}><Rotulo txt="Inimigo" fundo={COR.ver} tam={54} /></Entra>
      <Entra t={em(c, "cura")} x={1560} y={460} de="baixo"><Icone nome="erva" tam={380} /></Entra>
      <Entra t={em(c, "cura")} x={1560} y={190}><Rotulo txt="Item de cura" tam={54} /></Entra>
    </Arena>
  ),
  55: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" sons={pop(em(c, "jogos"), em(c, "comerciais"))}>
      <Entra t={em(c, "jogos")} x={520} y={400}><Icone nome="controle" tam={480} /></Entra>
      <Entra t={em(c, "jogos")} x={520} y={700}><Rotulo txt="Jogos" fundo={COR.ama} tam={60} /></Entra>
      <Entra t={em(c, "comerciais")} x={1400} y={400}><Icone nome="caixa" tam={440} /></Entra>
      <Entra t={em(c, "comerciais")} x={1400} y={700}><Rotulo txt="Sistemas comerciais" tam={60} /></Entra>
    </Arena>
  ),
  56: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" sons={pop(em(c, "like"), em(c, "inscreva"), em(c, "compartilhe"))}>
      <Mascote pose="acenando" palavras={c.palavras} indice={0} fimFala={c.dur} />
      <Entra t={em(c, "like")} x={880} y={300}><Icone nome="like" tam={240} cor={COR.ama} /></Entra>
      <Entra t={em(c, "inscreva")} x={1270} y={300}><Icone nome="sino" tam={240} cor={COR.ver} /></Entra>
      <Entra t={em(c, "compartilhe")} x={1650} y={300}><Icone nome="compartilha" tam={220} cor={COR.azul} /></Entra>
      <Entra t={em(c, "canal")} x={1260} y={570}><Rotulo txt="Dev Sobrevivente" fundo={COR.ama} tam={78} /></Entra>
    </Arena>
  ),
  57: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" sons={pop(em(c, "conceito"), em(c, "proximo"))}>
      <Mascote pose="acenando" palavras={c.palavras} indice={0} fimFala={c.dur} />
      <Entra t={em(c, "conceito")} x={1200} y={330}>
        <div style={{ position: "relative" }}>
          <Icone nome="balao" tam={520} cor={COR.cre} />
          <div style={{ position: "absolute", inset: "12% 6% 28% 6%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: "Poppins", fontWeight: 900, fontSize: 52, color: COR.esc }}>Qual o próximo conceito?</div>
        </div>
      </Entra>
      <Entra t={em(c, "proximo")} x={1200} y={700}><Grande txt="Até o próximo vídeo!" tam={72} cor={COR.ama} /></Entra>
    </Arena>
  ),
};

export const ClassesObjetosCSharp: React.FC<Timeline> = (tl) => <Video {...tl} pasta={PASTA} especiais={especiais} />;

// ── Short (9:16, ~55 s) da mesma narração ────────────────────────────────
// Palco próprio em 1080x1920: pés em y=1400, legenda logo abaixo (pos 74).
const CENAS_SHORT = [0, 4, 5, 9, 12, 13, 15, 39, 21, 23, 35, 36, 56];
const CHAO = 1400;

export const timelineShortClasses = (tl: Timeline) =>
  recortarTimeline(tl, CENAS_SHORT, { largura: 1080, altura: 1920, legenda: { ...tl.legenda, pos: 74 } });

const porOrigem: Record<number, CenaEspecial> = {
  0: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={pop(em(c, "criados"))} zoom={0.1}>
      <Boneco tipo="leon" x={540} y={CHAO} h={860} molde={em(c, "criados")} />
      <Entra t={em(c, "pensou")} x={880} y={500} sai={em(c, "criados")}><Grande txt="?" tam={260} cor={COR.ama} /></Entra>
      <Entra t={em(c, "pensou")} x={190} y={620} sai={em(c, "criados")}><Grande txt="?" tam={170} /></Entra>
    </Arena>
  ),
  4: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} tremor={[em(c, "vezes")]} sons={[{ t: em(c, "centenas"), tipo: "contagem" }, { t: em(c, "vezes"), tipo: "erro" }]}>
      <ParedeCodigo t0={em(c, "centenas")} passo={0.05} riscar={em(c, "vezes")} />
      <Carimbo txt="MESMO CÓDIGO?" t={em(c, "vezes")} x={540} y={760} tam={92} />
    </Arena>
  ),
  5: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={[{ t: em(c, "classes"), tipo: "plim" }, { t: em(c, "objetos"), tipo: "plim" }]} tremor={[em(c, "objetos")]}>
      <Entra t={em(c, "classes")} x={540} y={230}><Grande txt="CLASSE" cor={COR.azul} /></Entra>
      <FichaClasse x={540} y={460} t={em(c, "classes")} de="esq" linhas={PROPS} largura={800} tam={52} />
      <Entra t={em(c, "objetos")} x={540} y={720}><Grande txt="OBJETO" cor={COR.ama} /></Entra>
      <Boneco tipo="leon" x={540} y={CHAO} h={600} t={em(c, "objetos")} de="zoom" />
    </Arena>
  ),
  9: ({ cena: c, indice }) => {
    const junta = em(c, "modelo");
    return (
      <Arena cena={c} indice={indice} lugar="oficina" zoom={0.09} tremor={[em(c, "classe")]} sons={[{ t: junta, tipo: "whoosh" }, { t: em(c, "classe"), tipo: "plim" }]}>
        <Entra x={270} y={420} sai={junta}><Rotulo txt="Nome" tam={72} /></Entra>
        <Entra x={800} y={700} sai={junta}><Rotulo txt="Vida" tam={72} /></Entra>
        <Entra x={480} y={1040} sai={junta}><Rotulo txt="Velocidade" tam={72} /></Entra>
        <FichaClasse x={540} y={720} t={junta} nome="modelo" trocaNome={{ t: em(c, "classe"), txt: "class Personagem" }} largura={940} tam={72} linhas={PROPS} />
      </Arena>
    );
  },
  12: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" tremor={[em(c, "nao")]} sons={[{ t: em(c, "nao"), tipo: "erro" }]}>
      <FichaClasse x={540} y={350} largura={880} tam={62} linhas={PROPS} legenda="é só o molde" />
      <Boneco tipo="leon" x={540} y={CHAO} h={760} molde0 />
      <Carimbo txt="NÃO É O PERSONAGEM" t={em(c, "nao")} x={540} y={1000} tam={68} />
    </Arena>
  ),
  13: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} tremor={[em(c, "Leon")]} sons={[{ t: em(c, "Leon"), tipo: "plim" }]}>
      <FichaClasse x={540} y={380} t={em(c, "molde")} de="esq" linhas={PROPS} largura={800} tam={52} />
      <Seta t={em(c, "criar")} x1={540} y1={570} x2={540} y2={690} />
      <Boneco tipo="leon" x={540} y={CHAO} h={680} t={em(c, "Leon")} de="zoom" />
    </Arena>
  ),
  15: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} tremor={[em(c, "objeto")]} sons={[{ t: em(c, "objeto"), tipo: "plim" }, { t: em(c, "instancia"), tipo: "pop" }]}>
      <Entra t={em(c, "instancia")} x={540} y={170}><Rotulo txt="instância da classe" fundo={COR.ama} tam={60} /></Entra>
      <FichaClasse x={540} y={410} linhas={PROPS} largura={800} tam={52} />
      <Boneco tipo="leon" x={540} y={CHAO} h={620} />
      <Carimbo txt="OBJETO" t={em(c, "objeto")} x={540} y={720} cor={COR.ama} tam={110} />
    </Arena>
  ),
  21: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} sons={[{ t: em(c, "100"), tipo: "contagem" }, { t: em(c, "50"), tipo: "contagem" }]}>
      <Boneco tipo="leon" x={280} y={CHAO} h={700} />
      <Boneco tipo="ganado" x={800} y={CHAO} h={700} vira />
      <Hud nome="Leon" vida={100} x={540} y={320} t={em(c, "100")} largura={860} />
      <Hud nome="Ganado" vida={50} x={540} y={490} t={em(c, "50")} largura={860} />
    </Arena>
  ),
  23: ({ cena: c, indice }) => {
    const d = em(c, "dano");
    return (
      <Arena cena={c} indice={indice} tremor={[d]} sons={[{ t: d, tipo: "erro" }, { t: em(c, "muda"), tipo: "plim" }]}>
        <Boneco tipo="leon" x={260} y={CHAO} h={640} dano={[d]} />
        <Boneco tipo="ganado" x={640} y={CHAO} h={560} vira />
        <Boneco tipo="ganado" tom={1} x={920} y={CHAO} h={560} vira />
        <Hud nome="Leon" vida={80} de={100} em={d} x={540} y={250} largura={860} />
        <Hud nome="Ganado A" vida={50} em={-1} x={540} y={390} largura={860} />
        <Hud nome="Ganado B" vida={70} em={-1} x={540} y={530} largura={860} />
        <Entra t={d} x={270} y={690}><Grande txt="-20" cor={COR.ver} tam={110} /></Entra>
        <Carimbo txt="NÃO MUDA" t={em(c, "muda")} x={760} y={720} cor={COR.vd} tam={78} gira={3} />
      </Arena>
    );
  },
  35: ({ cena: c, indice }) => {
    const a = em(c, "reduzir");
    return (
      <Arena cena={c} indice={indice} tremor={[a]} sons={[{ t: a, tipo: "erro" }, { t: em(c, "80"), tipo: "contagem" }]}>
        <Entra t={em(c, "metodo")} x={540} y={200}><Rotulo txt="ReceberDano(20);" mono fundo={COR.ama} tam={72} /></Entra>
        <Hud nome="Leon" vida={80} de={100} em={a} x={540} y={390} largura={860} />
        <Entra t={a + 0.4} x={540} y={590}><Grande txt="100 → 80" tam={130} cor={COR.ver} /></Entra>
        <Boneco tipo="leon" x={290} y={CHAO} h={640} dano={[a]} />
        <Boneco tipo="ganado" x={800} y={CHAO} h={640} vira ataca={[a - 0.2]} />
      </Arena>
    );
  },
  36: ({ cena: c, indice }) => {
    const p = em(c, "Propriedades"), m = em(c, "metodos");
    return (
      <Arena cena={c} indice={indice} lugar="oficina" tremor={[m]} sons={pop(p, m)}>
        <Entra t={p} x={540} y={200}><Grande txt="PROPRIEDADES" cor={COR.azul} tam={100} /></Entra>
        <Hud nome="Vida" vida={80} x={540} y={350} t={p} largura={860} />
        <Entra t={m} x={540} y={560}><Grande txt="MÉTODOS" cor={COR.ama} tam={100} /></Entra>
        <Entra t={m} x={540} y={700}><Rotulo txt="Atacar()" mono fundo={COR.ama} tam={72} /></Entra>
        <Boneco tipo="leon" x={540} y={CHAO} h={600} ataca={[m + 0.3, m + 1.2]} />
      </Arena>
    );
  },
  56: ({ cena: c, indice }) => (
    <Arena cena={c} indice={indice} lugar="oficina" sons={pop(em(c, "like"), em(c, "inscreva"), em(c, "compartilhe"))}>
      <Entra t={em(c, "like")} x={210} y={300}><Icone nome="like" tam={260} cor={COR.ama} /></Entra>
      <Entra t={em(c, "inscreva")} x={540} y={300}><Icone nome="sino" tam={260} cor={COR.ver} /></Entra>
      <Entra t={em(c, "compartilhe")} x={870} y={300}><Icone nome="compartilha" tam={240} cor={COR.azul} /></Entra>
      <Entra t={em(c, "canal")} x={540} y={560}><Rotulo txt="Dev Sobrevivente" fundo={COR.ama} tam={92} /></Entra>
      <Mascote pose="acenando" palavras={c.palavras} indice={0} fimFala={c.dur} />
    </Arena>
  ),
};

// a cena 39 é painel de código: `codigo` já se ajusta ao formato em pé
const ESPECIAIS_SHORT = Object.fromEntries(
  CENAS_SHORT.map((orig, novo) => [novo, porOrigem[orig] ?? especiais[orig]]),
) as Record<number, CenaEspecial>;

export const ClassesObjetosShort: React.FC<Timeline> = (tl) => <Video {...tl} pasta={PASTA} especiais={ESPECIAIS_SHORT} />;
