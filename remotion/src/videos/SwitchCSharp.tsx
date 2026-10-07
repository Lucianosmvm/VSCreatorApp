import { Video, type CenaEspecial } from "../Shorts";
import { recortarTimeline, type Timeline } from "../tipos";
import { codigo, em, fichas } from "../cenas/Codigo";

// "Switch e Switch Expression em C#" — 46 cenas, 16:9, ~3:43.
// Tempos por palavra (em): acompanha a narração mesmo se refeita.

const PASTA = "videos/switch-e-switch-expression-em-c-muydj4v4/";
const VERDE = "#28c840";
const VERMELHO = "#ff5f57";
const AMARELO = "#FFD23F";
const OK = "rgba(40,200,64,.18)";
const ERRO = "rgba(255,95,87,.18)";

const especiais: Record<number, CenaEspecial> = {
  // 4 — o problema com else if
  4: codigo((c) => ({
    titulo: "Dia.cs — com else if",
    linhas: [
      { txt: 'if (dia == 1) nome = "Domingo";', t: em(c, "1"), marca: em(c, "domingo") },
      { txt: 'else if (dia == 2) nome = "Segunda";', t: em(c, "2"), marca: em(c, "segunda") },
      { txt: 'else if (dia == 3) nome = "Terça";', t: em(c, "assim") },
      { txt: 'else if (dia == 4) nome = "Quarta";', t: em(c, "por") },
      { txt: "// ...", t: em(c, "diante") },
    ],
  })),
  // 5 — sete comparações
  5: codigo((c) => ({
    titulo: "Dia.cs — 7 comparações",
    linhas: [
      { txt: 'if (dia == 1) nome = "Domingo";', marca: em(c, "repetindo") },
      { txt: 'else if (dia == 2) nome = "Segunda";', marca: em(c, "repetindo") },
      { txt: 'else if (dia == 3) nome = "Terça";', marca: em(c, "mesma") },
      { txt: 'else if (dia == 4) nome = "Quarta";', marca: em(c, "mesma") },
      { txt: 'else if (dia == 5) nome = "Quinta";', marca: em(c, "variavel") },
      { txt: 'else if (dia == 6) nome = "Sexta";', marca: em(c, "variavel") },
      { txt: 'else if (dia == 7) nome = "Sábado";', marca: em(c, "variavel"), erro: em(c, "cansativo") },
    ],
    escala: 0.85,
  })),
  // 7 — avalia uma vez e pula direto
  7: fichas((c) => ({
    colunas: 4,
    fichas: [
      { txt: "dia = 3", sub: "avalia 1 vez", t: em(c, "avalia"), cor: AMARELO },
      { txt: "case 1", sub: "pula", t: em(c, "pula"), cor: "#6b7358", texto: "#d8d3c2" },
      { txt: "case 2", sub: "pula", t: em(c, "direto"), cor: "#6b7358", texto: "#d8d3c2" },
      { txt: "case 3", sub: "combina!", t: em(c, "combina"), cor: VERDE, texto: "#08200c" },
    ],
  })),
  // 8 — estrutura
  8: codigo((c) => ({
    titulo: "Estrutura do switch",
    linhas: [
      { txt: "switch (valor)", t: em(c, "palavra"), marca: em(c, "parenteses") },
      { txt: "{", t: em(c, "chaves") },
      { txt: "    // casos aqui", t: em(c, "chaves") },
      { txt: "}", t: em(c, "chaves") },
    ],
  })),
  // 9 — case
  9: codigo((c) => ({
    titulo: "case",
    linhas: [
      { txt: "switch (valor)" },
      { txt: "{" },
      { txt: "    case 1:", t: em(c, "case"), marca: em(c, "dois") },
      { txt: "}" },
    ],
  })),
  // 10 — código e break
  10: codigo((c) => ({
    titulo: "break",
    linhas: [
      { txt: "switch (valor)" },
      { txt: "{" },
      { txt: "    case 1:" },
      { txt: "        // código que roda", t: em(c, "codigo") },
      { txt: "        break;", t: em(c, "break"), marca: em(c, "break"), corMarca: OK },
      { txt: "}" },
    ],
  })),
  // 11 — exemplo dos dias
  11: codigo((c) => ({
    titulo: "Dia.cs — com switch",
    linhas: [
      { txt: "switch (dia)", t: 0 },
      { txt: "{", t: 0 },
      { txt: "    case 1:", t: em(c, "case"), marca: em(c, "1") },
      { txt: '        nome = "Domingo";', t: em(c, "nome") },
      { txt: "        break;", t: em(c, "break") },
      { txt: "    case 2:", t: em(c, "case", 2), marca: em(c, "2") },
      { txt: '        nome = "Segunda";', t: em(c, "nome", 2) },
      { txt: "        break;", t: em(c, "break", 2), ok: em(c, "break", 2) },
      { txt: "}", t: em(c, "break", 2) },
    ],
    escala: 0.85,
  })),
  // 12 — default
  12: codigo((c) => ({
    titulo: "default",
    linhas: [
      { txt: "switch (dia)" },
      { txt: "{" },
      { txt: "    case 1: /* ... */ break;" },
      { txt: "    case 2: /* ... */ break;" },
      { txt: "    default:", t: em(c, "default"), marca: em(c, "else") },
      { txt: '        nome = "Dia inválido";', t: em(c, "funciona") },
      { txt: "        break;", t: em(c, "funciona") },
      { txt: "}" },
    ],
    escala: 0.9,
  })),
  // 14 — fall-through em C / JavaScript
  14: codigo((c) => ({
    titulo: "JavaScript (e C)",
    linhas: [
      { txt: "switch (dia) {" },
      { txt: "  case 1:" },
      { txt: '    nome = "Domingo";   // sem break', t: em(c, "esquecer"), erro: em(c, "break") },
      { txt: "  case 2:", marca: em(c, "caindo"), corMarca: ERRO },
      { txt: '    nome = "Segunda";   // roda também!', t: em(c, "caindo"), marca: em(c, "proximo"), corMarca: ERRO },
      { txt: "}" },
    ],
  })),
  // 15 — no C# não compila
  15: codigo((c) => ({
    titulo: "C# — sem break",
    linhas: [
      { txt: "case 1:" },
      { txt: '    nome = "Domingo";', erro: em(c, "compila"), marca: em(c, "compila"), corMarca: ERRO },
      { txt: "case 2:" },
      { txt: "", t: em(c, "todo") },
      { txt: "case 1:", t: em(c, "todo") },
      { txt: '    nome = "Domingo";', t: em(c, "todo") },
      { txt: "    break;   // ou return / throw", t: em(c, "break"), ok: em(c, "return"), marca: em(c, "break"), corMarca: OK },
    ],
    saida: [{ txt: "CS0163: o controle não pode cair para outro case", t: em(c, "compila"), cor: VERMELHO }],
    escala: 0.9,
  })),
  // 17/18 — agrupando casos
  17: codigo((c) => ({
    titulo: "Agrupando casos",
    linhas: [
      { txt: "case 1:", t: em(c, "agrupar") },
      { txt: "case 7:", t: em(c, "seguidos"), marca: em(c, "seguidos") },
      { txt: '    tipo = "Fim de semana";', t: em(c, "entre") },
      { txt: "    break;", t: em(c, "entre") },
    ],
  })),
  18: codigo((c) => ({
    titulo: "Agrupando casos",
    linhas: [
      { txt: "case 1:", marca: em(c, "1") },
      { txt: "case 7:", marca: em(c, "7") },
      { txt: '    tipo = "Fim de semana";', ok: em(c, "semana") },
      { txt: "    break;" },
      { txt: "case 2: case 3: case 4: case 5: case 6:", t: em(c, "do"), marca: em(c, "6") },
      { txt: '    tipo = "Dia útil";', t: em(c, "dia"), ok: em(c, "util") },
      { txt: "    break;", t: em(c, "dia") },
    ],
    escala: 0.9,
  })),
  // 19 — tipos aceitos
  19: fichas((c) => ({
    colunas: 4,
    fichas: [
      { txt: "int", sub: "números", t: em(c, "numeros") },
      { txt: "string", sub: "textos", t: em(c, "textos") },
      { txt: "char", sub: "caracteres", t: em(c, "caracteres") },
      { txt: "enum", sub: "combina muito!", t: em(c, "enums"), cor: AMARELO },
    ],
  })),
  // 21 — executa × devolve
  21: fichas((c) => ({
    colunas: 2,
    fichas: [
      { txt: "switch", sub: "executa comandos", t: em(c, "executa"), cor: "#6b7358", texto: "#d8d3c2" },
      { txt: "switch expr.", sub: "devolve um valor", t: em(c, "devolve"), cor: AMARELO },
    ],
  })),
  // 22 — sintaxe
  22: codigo((c) => ({
    titulo: "Switch expression",
    linhas: [
      { txt: "string nome = dia switch", t: em(c, "primeiro"), marca: em(c, "switch") },
      { txt: "{", t: em(c, "chaves") },
      { txt: "    // casos", t: em(c, "chaves") },
      { txt: "};", t: em(c, "chaves") },
    ],
  })),
  // 23 — valor => resultado,
  23: codigo((c) => ({
    titulo: "Switch expression",
    linhas: [
      { txt: "string nome = dia switch" },
      { txt: "{" },
      { txt: '    1 => "Domingo",', t: em(c, "valor"), marca: em(c, "seta") },
      { txt: '    2 => "Segunda",', t: em(c, "resultado"), ok: em(c, "virgula") },
      { txt: "};" },
    ],
  })),
  // 24 — descarte
  24: codigo((c) => ({
    titulo: "O descarte _",
    linhas: [
      { txt: "string nome = dia switch" },
      { txt: "{" },
      { txt: '    1 => "Domingo",' },
      { txt: '    2 => "Segunda",' },
      { txt: '    _ => "Dia inválido"', t: em(c, "sublinhado"), marca: em(c, "descarte"), ok: em(c, "default") },
      { txt: "};" },
    ],
  })),
  // 25 — 20 linhas → 8
  25: fichas((c) => ({
    colunas: 2,
    fichas: [
      { txt: "20 linhas", sub: "case + break", t: em(c, "vinte"), cor: VERMELHO, texto: "#2a0806", risca: em(c, "vira") },
      { txt: "8 linhas", sub: "switch expression", t: em(c, "bloco"), cor: VERDE, texto: "#08200c" },
    ],
  })),
  // 26 — atribuir ou return direto
  26: codigo((c) => ({
    linhas: [
      { txt: "string NomeDoDia(int dia) =>", t: em(c, "expressao") },
      { txt: "    dia switch", t: em(c, "atribuir") },
      { txt: "    {", t: em(c, "atribuir") },
      { txt: '        1 => "Domingo",', t: em(c, "direto") },
      { txt: '        _ => "Outro"', t: em(c, "direto") },
      { txt: "    };", t: em(c, "return"), ok: em(c, "hora") },
    ],
  })),
  // 29 — padrões relacionais
  29: codigo((c) => ({
    titulo: "Padrões relacionais",
    linhas: [
      { txt: "string r = nota switch" },
      { txt: "{" },
      { txt: '    < 5 => "Reprovado",', t: em(c, "nota"), marca: em(c, "5") },
      { txt: '    < 7 => "Recuperação",', t: em(c, "menor", 2), marca: em(c, "7") },
      { txt: '    _   => "Aprovado"', t: em(c, "resto"), ok: em(c, "aprovado") },
      { txt: "};" },
    ],
  })),
  // 30 — and / or
  30: codigo((c) => ({
    titulo: "and / or",
    linhas: [
      { txt: "string fase = idade switch" },
      { txt: "{" },
      { txt: '    < 18           => "Jovem",', t: em(c, "combinar") },
      { txt: '    >= 18 and < 60 => "Adulto",', t: em(c, "18"), marca: em(c, "and", 2), ok: em(c, "60") },
      { txt: '    _              => "Idoso"', t: em(c, "60") },
      { txt: "};" },
    ],
  })),
  // 31 — padrão de tipo
  31: codigo((c) => ({
    titulo: "Padrão por tipo",
    linhas: [
      { txt: "string d = obj switch" },
      { txt: "{" },
      { txt: '    int n    => $"número {n}",', t: em(c, "tipo"), marca: em(c, "guardar") },
      { txt: '    string s => $"texto {s}",', t: em(c, "variavel") },
      { txt: '    _        => "outro"', t: em(c, "linha"), ok: em(c, "linha") },
      { txt: "};" },
    ],
  })),
  // 32 — when
  32: codigo((c) => ({
    titulo: "when",
    linhas: [
      { txt: "string d = obj switch" },
      { txt: "{" },
      { txt: '    int n when n > 100 => "número grande",', t: em(c, "when"), marca: em(c, "extra") },
      { txt: '    int n              => "número",', t: em(c, "padrao") },
      { txt: '    _                  => "outro"', t: em(c, "basta") },
      { txt: "};" },
    ],
    escala: 0.9,
  })),
  // 33/34 — cobrir todos os casos
  33: codigo((c) => ({
    titulo: "Cubra todos os casos",
    linhas: [
      { txt: "string acao = luz switch" },
      { txt: "{" },
      { txt: '    Luz.Verde    => "Siga",', t: em(c, "switch") },
      { txt: '    Luz.Vermelho => "Pare",', t: em(c, "precisa") },
      { txt: "    // e o Amarelo?", t: em(c, "todos"), marca: em(c, "possiveis"), corMarca: ERRO },
      { txt: "};" },
    ],
  })),
  34: codigo((c) => ({
    titulo: "Cubra todos os casos",
    linhas: [
      { txt: "string acao = luz switch" },
      { txt: "{" },
      { txt: '    Luz.Verde    => "Siga",' },
      { txt: '    Luz.Vermelho => "Pare",' },
      { txt: "    // e o Amarelo?", marca: 0, corMarca: ERRO },
      { txt: "};" },
    ],
    saida: [
      { txt: "aviso CS8509: não cobre todos os valores", t: em(c, "avisa"), cor: AMARELO },
      { txt: "SwitchExpressionException", t: em(c, "excecao"), cor: VERMELHO },
    ],
  })),
  // 35 — termine com _
  35: codigo((c) => ({
    titulo: "Cubra todos os casos",
    linhas: [
      { txt: "string acao = luz switch" },
      { txt: "{" },
      { txt: '    Luz.Verde    => "Siga",' },
      { txt: '    Luz.Vermelho => "Pare",' },
      { txt: '    _            => "Atenção"', t: em(c, "descarte"), marca: em(c, "sublinhado"), ok: em(c, "sobrou") },
      { txt: "};" },
    ],
  })),
  // 36 — a ordem importa
  36: codigo((c) => ({
    titulo: "A ordem importa",
    linhas: [
      { txt: "string t = n switch" },
      { txt: "{" },
      { txt: '    > 0  => "positivo",', t: 0, marca: em(c, "primeiro"), corMarca: OK },
      { txt: '    > 10 => "grande",    // nunca chega aqui', t: 0, erro: em(c, "vale"), marca: em(c, "vale"), corMarca: ERRO },
      { txt: '    _    => "zero ou negativo"', t: 0 },
      { txt: "};" },
    ],
    escala: 0.9,
  })),
  // 38/39/40 — quando usar cada um (acumula)
  38: fichas((c) => ({
    colunas: 3,
    fichas: [{ txt: "if/else", sub: "condições diferentes", t: em(c, "if") }],
  })),
  39: fichas((c) => ({
    colunas: 3,
    fichas: [
      { txt: "if/else", sub: "condições diferentes", t: 0 },
      { txt: "switch", sub: "várias ações", t: em(c, "switch"), cor: "#b7c49a" },
    ],
  })),
  40: fichas((c) => ({
    colunas: 3,
    fichas: [
      { txt: "if/else", sub: "condições diferentes", t: 0 },
      { txt: "switch", sub: "várias ações", t: 0, cor: "#b7c49a" },
      { txt: "switch expr.", sub: "valor → valor", t: em(c, "expression"), cor: AMARELO },
    ],
  })),
  // 41 — regra de bolso
  41: codigo((c) => ({
    titulo: "Regra de bolso",
    linhas: [
      { txt: 'case 1: nome = "Domingo"; break;', t: em(c, "case"), marca: em(c, "atribuicao"), risca: em(c, "troque") },
      { txt: 'case 2: nome = "Segunda"; break;', t: em(c, "case"), risca: em(c, "troque") },
      { txt: "", t: em(c, "troque") },
      { txt: '1 => "Domingo",', t: em(c, "switch"), ok: em(c, "expression") },
      { txt: '2 => "Segunda",', t: em(c, "switch") },
    ],
  })),
  // 42 — desafio
  42: codigo((c) => ({
    titulo: "Desafio: temp = 30",
    linhas: [
      { txt: "int temp = 30;", t: em(c, "temperatura") },
      { txt: "string s = temp switch", t: em(c, "primeiro") },
      { txt: "{", t: em(c, "primeiro") },
      { txt: '    > 20 => "morno",', t: em(c, "maior"), marca: em(c, "morno") },
      { txt: '    > 28 => "quente",', t: em(c, "maior", 2), marca: em(c, "quente") },
      { txt: '    _    => "frio"', t: em(c, "quente") },
      { txt: "};", t: em(c, "quente") },
    ],
    extra: [{ t: em(c, "quente"), tipo: "pose", pose: "pensando" }],
  })),
  43: codigo((c) => ({
    titulo: "Desafio: temp = 30",
    linhas: [
      { txt: "int temp = 30;" },
      { txt: "string s = temp switch" },
      { txt: "{" },
      { txt: '    > 20 => "morno",' },
      { txt: '    > 28 => "quente",' },
      { txt: '    _    => "frio"' },
      { txt: "};" },
    ],
    saida: [{ txt: "s = ???", t: em(c, "devolve"), cor: AMARELO }],
  })),
  // 44 — resumo
  44: fichas((c) => ({
    colunas: 3,
    fichas: [
      { txt: "switch", sub: "executa ações", t: em(c, "switch"), cor: "#b7c49a" },
      { txt: "switch expr.", sub: "devolve valores", t: em(c, "expression"), cor: AMARELO },
      { txt: "padrões", sub: "< > and or when", t: em(c, "padroes") },
    ],
  })),
};

export const SwitchCSharp: React.FC<Timeline> = (tl) => <Video {...tl} pasta={PASTA} especiais={especiais} />;

// ── Short (9:16) da mesma narração ───────────────────────────────────────
const CENAS_SHORT = [0, 4, 5, 6, 11, 15, 20, 21, 22, 23, 24, 25, 29, 40, 41, 42, 43, 45];

export const timelineShortSwitch = (tl: Timeline) =>
  recortarTimeline(tl, CENAS_SHORT, { largura: 1080, altura: 1920, legenda: { ...tl.legenda, pos: 56 } });

const ESPECIAIS_SHORT = Object.fromEntries(
  CENAS_SHORT.flatMap((orig, novo) => (especiais[orig] ? [[novo, especiais[orig]]] : [])),
) as Record<number, CenaEspecial>;

export const SwitchCSharpShort: React.FC<Timeline> = (tl) => <Video {...tl} pasta={PASTA} especiais={ESPECIAIS_SHORT} />;
