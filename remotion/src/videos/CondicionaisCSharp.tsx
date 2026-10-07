import { Video, type CenaEspecial } from "../Shorts";
import { recortarTimeline, type Timeline } from "../tipos";
import { codigo, em, fichas } from "../cenas/Codigo";

// "Condicionais em C#: if, else e ternário" — 56 cenas, 16:9.
// Cenas sem entrada aqui usam o padrão: fundo + mascote + título/número.
// Os tempos vêm de em(cena, "palavra"): segue a narração mesmo se refeita.

const VERDE = "#28c840";
const VERMELHO = "#ff5f57";
const MARCA_OK = "rgba(40,200,64,.18)";
const MARCA_ERRO = "rgba(255,95,87,.18)";

const especiais: Record<number, CenaEspecial> = {
  // 4 — true ou false
  4: fichas((c) => ({
    fichas: [
      { txt: "true", sub: "verdadeiro", t: em(c, "true"), cor: VERDE, texto: "#08200c" },
      { txt: "false", sub: "falso", t: em(c, "false"), cor: VERMELHO, texto: "#2a0806" },
    ],
  })),
  // 6 — == e !=
  6: fichas((c) => ({
    fichas: [
      { txt: "==", sub: "igual", t: em(c, "dois") },
      { txt: "!=", sub: "diferente", t: em(c, "exclamacao") },
    ],
  })),
  // 7 — maior / menor
  7: fichas((c) => ({
    colunas: 4,
    fichas: [
      { txt: ">", sub: "maior", t: em(c, "maior") },
      { txt: "<", sub: "menor", t: em(c, "menor") },
      { txt: ">=", sub: "maior ou igual", t: em(c, "maior", 2) },
      { txt: "<=", sub: "menor ou igual", t: em(c, "menor", 2) },
    ],
  })),
  // 8 — erro clássico = vs ==
  8: codigo((c) => ({
    titulo: "Erro clássico",
    linhas: [
      { txt: "if (idade = 18)   // atribui!", t: em(c, "um"), risca: em(c, "atribui"), erro: em(c, "atribui") },
      { txt: "if (idade == 18)  // compara", t: em(c, "comparar"), ok: em(c, "dois"), marca: em(c, "dois"), corMarca: MARCA_OK },
    ],
  })),
  // 10 — estrutura do if
  10: codigo((c) => ({
    titulo: "Estrutura do if",
    linhas: [
      { txt: "if (condição)", t: em(c, "palavra"), marca: em(c, "condicao") },
      { txt: "{", t: em(c, "chaves") },
      { txt: "    // seu código aqui", t: em(c, "chaves") },
      { txt: "}", t: em(c, "chaves") },
    ],
  })),
  // 11 — exemplo da idade
  11: codigo((c) => ({
    linhas: [
      { txt: "int idade = 20;", t: 0 },
      { txt: "if (idade >= 18)", t: em(c, "se"), marca: em(c, "18") },
      { txt: "{", t: em(c, "programa") },
      { txt: '    Console.WriteLine("Acesso liberado");', t: em(c, "programa") },
      { txt: "}", t: em(c, "programa") },
    ],
    saida: [{ txt: "Acesso liberado", t: em(c, "liberado") }],
  })),
  // 12 — idade 15: bloco pulado
  12: codigo((c) => ({
    linhas: [
      { txt: "int idade = 15;", t: 0, marca: em(c, "15") },
      { txt: "if (idade >= 18)   // false", erro: em(c, "false"), marca: em(c, "false"), corMarca: MARCA_ERRO },
      { txt: "{", apaga: em(c, "pula") },
      { txt: '    Console.WriteLine("Acesso liberado");', apaga: em(c, "pula") },
      { txt: "}", apaga: em(c, "pula") },
    ],
  })),
  // 13 — sempre use chaves
  13: codigo((c) => ({
    titulo: "Use as chaves",
    linhas: [
      { txt: "if (logado)", t: 0 },
      { txt: "    Salvar();", t: 0 },
      { txt: "    Enviar();   // roda SEMPRE!", t: em(c, "linha"), erro: em(c, "linha") },
      { txt: "", t: em(c, "use") },
      { txt: "if (logado)", t: em(c, "use") },
      { txt: "{", t: em(c, "use") },
      { txt: "    Salvar();", t: em(c, "use") },
      { txt: "    Enviar();", t: em(c, "use"), ok: em(c, "evita") },
      { txt: "}", t: em(c, "use") },
    ],
    escala: 0.85,
  })),
  // 16 — if / else completo
  16: codigo((c) => ({
    linhas: [
      { txt: "if (idade >= 18)", t: em(c, "se"), marca: em(c, "se"), corMarca: MARCA_OK },
      { txt: "{", t: em(c, "acesso") },
      { txt: '    Console.WriteLine("Acesso liberado");', t: em(c, "acesso") },
      { txt: "}", t: em(c, "acesso") },
      { txt: "else", t: em(c, "senao"), marca: em(c, "senao"), corMarca: MARCA_ERRO },
      { txt: "{", t: em(c, "senao") },
      { txt: '    Console.WriteLine("Acesso negado");', t: em(c, "acesso", 2) },
      { txt: "}", t: em(c, "acesso", 2) },
    ],
    escala: 0.9,
  })),
  // 17 — um ou outro
  17: fichas((c) => ({
    fichas: [
      { txt: "if", sub: "ou...", t: em(c, "nunca") },
      { txt: "else", sub: "...outro", t: em(c, "dois") },
      { txt: "if + else", sub: "juntos? nunca", t: em(c, "juntos"), cor: VERMELHO, texto: "#2a0806", risca: em(c, "sempre") },
    ],
  })),
  // 20 — else if da nota
  20: codigo((c) => ({
    titulo: "Nota.cs",
    linhas: [
      { txt: "if (nota >= 7)", t: em(c, "se"), marca: em(c, "7") },
      { txt: '    resultado = "Aprovado";', t: em(c, "aprovado") },
      { txt: "else if (nota >= 5)", t: em(c, "senao"), marca: em(c, "5") },
      { txt: '    resultado = "Recuperação";', t: em(c, "recuperacao") },
    ],
  })),
  // 21 — else final
  21: codigo((c) => ({
    titulo: "Nota.cs",
    linhas: [
      { txt: "if (nota >= 7)" },
      { txt: '    resultado = "Aprovado";' },
      { txt: "else if (nota >= 5)" },
      { txt: '    resultado = "Recuperação";' },
      { txt: "else", t: em(c, "else"), marca: em(c, "resto") },
      { txt: '    resultado = "Reprovado";', t: em(c, "reprovado") },
    ],
  })),
  // 22 — para no primeiro verdadeiro (nota 6)
  22: codigo((c) => ({
    titulo: "nota = 6",
    linhas: [
      { txt: "if (nota >= 7)       // false", marca: em(c, "cima"), corMarca: MARCA_ERRO, erro: em(c, "cima") },
      { txt: "else if (nota >= 5)  // true", marca: em(c, "primeiro"), corMarca: MARCA_OK, ok: em(c, "verdadeiro") },
      { txt: "else                 // ignorado", apaga: em(c, "verdadeiro") },
    ],
  })),
  // 23 — ordem errada com nota 9
  23: codigo((c) => ({
    titulo: "nota = 9  (ordem errada)",
    linhas: [
      { txt: "if (nota >= 5)", t: 0, marca: em(c, "primeiro"), corMarca: MARCA_ERRO },
      { txt: '    resultado = "Recuperação";', t: 0, erro: em(c, "recuperacao") },
      { txt: "else if (nota >= 7)", t: 0, apaga: em(c, "cai") },
      { txt: '    resultado = "Aprovado";', t: 0, apaga: em(c, "cai") },
    ],
    saida: [{ txt: "Recuperação  ← nota 9?! BUG", t: em(c, "bug"), cor: VERMELHO }],
  })),
  // 26 — && (E)
  26: fichas((c) => ({
    colunas: 2,
    fichas: [
      { txt: "&&", sub: "E", t: 0 },
      { txt: "true && true", sub: "true", t: em(c, "verdadeira"), cor: VERDE, texto: "#08200c" },
      { txt: "true && false", sub: "false", t: em(c, "lados"), cor: VERMELHO, texto: "#2a0806" },
    ],
  })),
  // 27 — exemplo logado && admin
  27: codigo((c) => ({
    linhas: [
      { txt: "if (logado && admin)", t: em(c, "se"), marca: em(c, "administrador") },
      { txt: "{", t: em(c, "mostra") },
      { txt: "    MostrarPainel();", t: em(c, "mostra"), ok: em(c, "painel") },
      { txt: "}", t: em(c, "mostra") },
    ],
  })),
  // 28 — || (OU)
  28: fichas((c) => ({
    colunas: 2,
    fichas: [
      { txt: "||", sub: "OU", t: 0 },
      { txt: "true || false", sub: "true", t: em(c, "basta"), cor: VERDE, texto: "#08200c" },
      { txt: "false || false", sub: "false", t: em(c, "verdadeiro"), cor: VERMELHO, texto: "#2a0806" },
    ],
  })),
  // 29 — ! (NÃO)
  29: fichas((c) => ({
    fichas: [
      { txt: "!", sub: "NÃO", t: em(c, "exclamacao") },
      { txt: "!true", sub: "= false", t: em(c, "true"), cor: VERMELHO, texto: "#2a0806" },
      { txt: "!false", sub: "= true", t: em(c, "false", 2), cor: VERDE, texto: "#08200c" },
    ],
  })),
  // 30 — curto-circuito
  30: codigo((c) => ({
    titulo: "Curto-circuito",
    linhas: [
      { txt: "false && QualquerCoisa()", t: em(c, "para"), marca: em(c, "avaliar"), corMarca: MARCA_ERRO },
      { txt: "//       ^ nem é executado", t: em(c, "resposta") },
      { txt: "true || QualquerCoisa()", t: em(c, "isso"), marca: em(c, "curtocircuito"), corMarca: MARCA_OK },
      { txt: "//      ^ nem é executado", t: em(c, "curtocircuito") },
    ],
  })),
  // 31 — null antes de acessar
  31: codigo((c) => ({
    linhas: [
      { txt: "if (usuario != null && usuario.Ativo)", t: em(c, "teste"), marca: em(c, "nulo"), ok: em(c, "evita") },
      { txt: "{", t: em(c, "if") },
      { txt: "    Entrar(usuario);", t: em(c, "if") },
      { txt: "}", t: em(c, "if") },
    ],
    saida: [{ txt: "sem NullReferenceException", t: em(c, "excecao") }],
  })),
  // 32 — escada de if
  32: codigo((c) => ({
    titulo: "Escada de if",
    linhas: [
      { txt: "if (a) {", t: em(c, "aninhar") },
      { txt: "    if (b) {", t: em(c, "if", 2) },
      { txt: "        if (c) {", t: em(c, "if", 3) },
      { txt: "            Fazer();", t: em(c, "if", 3) },
      { txt: "        }", t: em(c, "escada"), erro: em(c, "escada") },
      { txt: "    }", t: em(c, "escada") },
      { txt: "}", t: em(c, "escada") },
    ],
    escala: 0.9,
  })),
  // 33 — retorno antecipado
  33: codigo((c) => ({
    titulo: "Retorno antecipado",
    linhas: [
      { txt: "if (!a) return;", t: em(c, "trate"), marca: em(c, "saia"), corMarca: MARCA_OK },
      { txt: "if (!b) return;", t: em(c, "invalidos") },
      { txt: "if (!c) return;", t: em(c, "primeiro") },
      { txt: "", t: em(c, "funcao") },
      { txt: "Fazer();", t: em(c, "funcao"), ok: em(c, "funcao") },
    ],
  })),
  // 37 — estrutura do ternário
  37: fichas((c) => ({
    colunas: 5,
    fichas: [
      { txt: "cond", sub: "condição", t: em(c, "condicao") },
      { txt: "?", sub: "interrogação", t: em(c, "interrogacao"), cor: "#FFD23F" },
      { txt: "a", sub: "se true", t: em(c, "verdadeiro"), cor: VERDE, texto: "#08200c" },
      { txt: ":", sub: "dois pontos", t: em(c, "dois"), cor: "#FFD23F" },
      { txt: "b", sub: "se false", t: em(c, "falso"), cor: VERMELHO, texto: "#2a0806" },
    ],
  })),
  // 38 — exemplo do ternário
  38: codigo((c) => ({
    titulo: "Ternário",
    linhas: [
      { txt: "string msg = idade >= 18", t: em(c, "mensagem"), marca: em(c, "18") },
      { txt: '    ? "Maior de idade"', t: em(c, "maior"), ok: em(c, "mais") },
      { txt: '    : "Menor de idade";', t: em(c, "senao") },
    ],
  })),
  // 39 — 6 linhas viram 1
  39: codigo((c) => ({
    titulo: "6 linhas → 1",
    linhas: [
      { txt: "if (idade >= 18)", risca: em(c, "agora") },
      { txt: '    msg = "Maior";', risca: em(c, "agora") },
      { txt: "else", risca: em(c, "agora") },
      { txt: '    msg = "Menor";', risca: em(c, "agora") },
      { txt: "", t: em(c, "cabe") },
      { txt: 'msg = idade >= 18 ? "Maior" : "Menor";', t: em(c, "cabe"), marca: em(c, "1"), corMarca: MARCA_OK, ok: em(c, "1") },
    ],
    escala: 0.85,
  })),
  // 40 — mesmo tipo
  40: codigo((c) => ({
    titulo: "Mesmo tipo",
    linhas: [
      { txt: 'var x = ok ? "sim" : 0;', t: em(c, "valores"), erro: em(c, "reclama"), marca: em(c, "compilador"), corMarca: MARCA_ERRO },
      { txt: 'var y = ok ? "sim" : "não";', t: em(c, "reclama"), ok: em(c, "reclama") },
    ],
    saida: [{ txt: "erro CS0173: tipos incompatíveis", t: em(c, "compilador"), cor: VERMELHO }],
  })),
  // 41 — ternário dentro de ternário
  41: codigo((c) => ({
    titulo: "Sem exagero",
    linhas: [
      { txt: "var r = a ? b ? x : y : c ? z : w;", t: em(c, "evite"), erro: em(c, "ninguem"), marca: em(c, "ternario", 2), corMarca: MARCA_ERRO },
    ],
  })),
  // 42/43 — quando usar cada um
  42: fichas((c) => ({
    colunas: 2,
    fichas: [
      { txt: "? :", sub: "escolher um valor", t: em(c, "use"), cor: "#FFD23F" },
      { txt: "if / else", sub: "ações e lógica", t: em(c, "quando"), cor: "#d8c3a0" },
    ],
  })),
  // 45 — ??
  45: fichas((c) => ({
    fichas: [{ txt: "??", sub: "coalescência nula", t: em(c, "duas"), cor: "#FFD23F" }],
  })),
  // 47 — exemplo do ??
  47: codigo((c) => ({
    linhas: [
      { txt: 'string nome = usuario.Nome ?? "visitante";', t: em(c, "nome"), marca: em(c, "visitante"), ok: em(c, "linha") },
    ],
    saida: [{ txt: "visitante   (quando Nome é null)", t: em(c, "vazio") }],
  })),
  // 48/49/50 — switch
  49: codigo((c) => ({
    titulo: "switch",
    linhas: [
      { txt: "string nome = dia switch", t: 0 },
      { txt: "{", t: 0 },
      { txt: '    1 => "Domingo",', t: em(c, "linha"), marca: em(c, "seta") },
      { txt: '    2 => "Segunda",', t: em(c, "seta") },
      { txt: '    _ => "Outro dia"', t: em(c, "sublinhado"), marca: em(c, "else") },
      { txt: "};", t: em(c, "sublinhado") },
    ],
  })),
  50: codigo((c) => ({
    titulo: "switch",
    linhas: [
      { txt: "string nome = dia switch" },
      { txt: "{" },
      { txt: '    1 => "Domingo",', marca: em(c, "domingo"), ok: em(c, "domingo") },
      { txt: '    2 => "Segunda",', marca: em(c, "segunda"), ok: em(c, "segunda") },
      { txt: '    _ => "Outro dia"' },
      { txt: "};" },
    ],
  })),
  // 52 — desafio
  52: codigo((c) => ({
    titulo: "Desafio: nota = 6",
    linhas: [
      { txt: "int nota = 6;", t: em(c, "nota") },
      { txt: "if (nota >= 5)", t: em(c, "teste"), marca: em(c, "primeiro") },
      { txt: '    resultado = "Recuperação";', t: em(c, "teste") },
      { txt: "else if (nota >= 7)", t: em(c, "teste") },
      { txt: '    resultado = "Aprovado";', t: em(c, "teste") },
    ],
    saida: [{ txt: "???", t: em(c, "aparece"), cor: "#FFD23F" }],
  })),
  // 54 — resumo
  54: fichas((c) => ({
    colunas: 4,
    fichas: [
      { txt: "if", sub: "testa", t: em(c, "if") },
      { txt: "else", sub: "alternativa", t: em(c, "else") },
      { txt: "else if", sub: "encadeia", t: em(c, "else", 2) },
      { txt: "? :", sub: "resume", t: em(c, "ternario"), cor: "#FFD23F" },
    ],
  })),
};

// Pose das cenas comuns (sem painel), escolhida pela fala de cada uma.
const POSES: Record<number, string> = {
  0: "acenando", 1: "comemorando", 2: "desconfiado", 3: "pensando", 5: "apontando",
  9: "frente", 14: "cocando", 15: "bracos", 18: "pensando", 19: "apontando",
  24: "comemorando", 25: "bracos", 34: "comemorando", 35: "comemorando", 36: "digitando",
  43: "bracos", 44: "comemorando", 46: "pensando", 48: "apontando", 51: "desconfiado",
  53: "pensando", 55: "acenando",
};

export const CondicionaisCSharp: React.FC<Timeline> = (tl) => (
  <Video
    {...tl}
    cenas={tl.cenas.map((c, i) => (POSES[i] ? { ...c, mascote: POSES[i] } : c))}
    pasta="videos/condicionais-em-c-if-else-e-ternario-muy7zibr/"
    especiais={especiais}
  />
);

// ── Short (9:16, ~1:30) tirado do vídeo longo ─────────────────────────────
// Mesma narração e mesmas cenas especiais; só as cenas abaixo, nesta ordem.
const CENAS_SHORT = [0, 9, 11, 16, 19, 20, 21, 22, 23, 35, 37, 38, 39, 42, 43, 52, 53, 55];

export const timelineShort = (tl: Timeline) =>
  recortarTimeline(tl, CENAS_SHORT, { largura: 1080, altura: 1920, legenda: { ...tl.legenda, pos: 56 } });

const remapear = <T,>(porOrigem: Record<number, T>) =>
  Object.fromEntries(CENAS_SHORT.flatMap((orig, novo) => (porOrigem[orig] !== undefined ? [[novo, porOrigem[orig]]] : []))) as Record<number, T>;

const ESPECIAIS_SHORT = remapear(especiais);
const POSES_SHORT = remapear(POSES);

export const CondicionaisShort: React.FC<Timeline> = (tl) => (
  <Video
    {...tl}
    cenas={tl.cenas.map((c, i) => (POSES_SHORT[i] ? { ...c, mascote: POSES_SHORT[i] } : c))}
    pasta="videos/condicionais-em-c-if-else-e-ternario-muy7zibr/"
    especiais={ESPECIAIS_SHORT}
  />
);
