import { Video, type CenaEspecial } from "../Shorts";
import { recortarTimeline, type Timeline } from "../tipos";
import { codigo, em, fichas } from "../cenas/Codigo";

// "For em C#: repetição controlada" — 58 cenas, 16:9, ~5:23.
// Tempos por palavra (em): acompanha a narração mesmo se refeita.

const PASTA = "videos/for-em-c-repeticao-controlada-muzfj01f/";
const VERDE = "#28c840";
const VERMELHO = "#ff5f57";
const AMARELO = "#FFD23F";
const CINZA = "#6b7358";
const OK = "rgba(40,200,64,.18)";
const ERRO = "rgba(255,95,87,.18)";

// laço do "passo a passo" (cenas 14–18)
const LACO = [
  { txt: "for (int i = 0; i < 3; i++)" },
  { txt: "{" },
  { txt: "    Console.WriteLine(i);" },
  { txt: "}" },
];

const especiais: Record<number, CenaEspecial> = {
  // 4 — cinco WriteLine na mão
  4: codigo((c) => ({
    titulo: "Sem laço",
    linhas: [1, 2, 3, 4, 5].map((n, k) => ({ txt: `Console.WriteLine(${n});`, t: em(c, "cinco") + k * 0.25 })),
  })),
  // 5 — e de 1 a mil?
  5: codigo((c) => ({
    titulo: "Sem laço: 1 a 1000",
    linhas: [
      { txt: "Console.WriteLine(1);" },
      { txt: "Console.WriteLine(2);" },
      { txt: "Console.WriteLine(3);" },
      { txt: "// ... mais 996 linhas ...", t: em(c, "mil"), erro: em(c, "merece") },
      { txt: "Console.WriteLine(1000);", t: em(c, "mil"), marca: em(c, "lugares"), corMarca: ERRO },
    ],
  })),
  // 6 — o laço resolve
  6: codigo((c) => ({
    titulo: "Com laço",
    linhas: [
      { txt: "for (int i = 1; i <= 5; i++)", t: em(c, "repetir"), marca: em(c, "controlada"), corMarca: OK },
      { txt: "{", t: em(c, "repetir") },
      { txt: "    Console.WriteLine(i);", t: em(c, "bloco"), ok: em(c, "controlada") },
      { txt: "}", t: em(c, "bloco") },
    ],
  })),
  // 7 — as três partes
  7: fichas((c) => ({
    fichas: [
      { txt: "int i = 0", sub: "1 · inicialização", t: em(c, "tres") },
      { txt: "i < 5", sub: "2 · condição", t: em(c, "partes"), cor: AMARELO },
      { txt: "i++", sub: "3 · incremento", t: em(c, "virgula"), cor: "#b7c49a" },
    ],
  })),
  // 8/9 — inicialização
  8: codigo((c) => ({
    titulo: "1 · Inicialização",
    linhas: [{ txt: "for (int i = 0; i < 5; i++)", marca: em(c, "inicializacao") }, { txt: "{ ... }" }],
    saida: [{ txt: "roda 1 vez, no começo", t: em(c, "unica"), cor: AMARELO }],
  })),
  9: codigo((c) => ({
    titulo: "1 · Inicialização",
    linhas: [
      { txt: "for (int i = 0; i < 5; i++)", marca: em(c, "int") },
      { txt: "//   ^ o contador", t: em(c, "contador") },
    ],
  })),
  // 10/11 — condição
  10: codigo((c) => ({
    titulo: "2 · Condição",
    linhas: [
      { txt: "for (int i = 0; i < 5; i++)", marca: em(c, "condicao") },
      { txt: "//             ^ testada antes de cada volta", t: em(c, "volta") },
    ],
    saida: [{ txt: "true → o bloco roda", t: em(c, "verdadeira") }],
  })),
  11: codigo((c) => ({
    titulo: "2 · Condição",
    linhas: [{ txt: "for (int i = 0; i < 5; i++)", marca: em(c, "menor") }],
    saida: [{ txt: "false → o laço termina", t: em(c, "falsa"), cor: VERMELHO }],
  })),
  // 12/13 — incremento
  12: codigo((c) => ({
    titulo: "3 · Incremento",
    linhas: [
      { txt: "for (int i = 0; i < 5; i++)", marca: em(c, "incremento") },
      { txt: "//                    ^ no fim de cada volta", t: em(c, "final") },
    ],
  })),
  13: fichas((c) => ({
    colunas: 2,
    fichas: [
      { txt: "i++", sub: "mais mais", t: em(c, "mais"), cor: "#b7c49a" },
      { txt: "i = i + 1", sub: "mesma coisa", t: em(c, "aumentam") },
    ],
  })),
  // 14–18 — passo a passo
  14: codigo((c) => ({
    titulo: "Passo a passo",
    linhas: LACO.map((l) => ({ ...l, t: em(c, "for") })),
  })),
  15: codigo((c) => ({
    titulo: "Passo a passo — volta 1",
    linhas: [
      { ...LACO[0], marca: em(c, "recebe") },
      LACO[1], { ...LACO[2], marca: em(c, "bloco"), corMarca: OK }, LACO[3],
      { txt: "// i = 0 → 0 < 3 ?", t: em(c, "zero") },
      { txt: "// true", t: em(c, "sim"), ok: em(c, "sim") },
    ],
    saida: [{ txt: "0", t: em(c, "mostra") }],
  })),
  16: codigo((c) => ({
    titulo: "Passo a passo — volta 2",
    linhas: [
      { ...LACO[0], marca: em(c, "mais") },
      LACO[1], { ...LACO[2], marca: em(c, "mostra"), corMarca: OK }, LACO[3],
      { txt: "// i = 1 → 1 < 3 ?", t: em(c, "vira") },
      { txt: "// true", t: em(c, "sim"), ok: em(c, "sim") },
    ],
    saida: [{ txt: "0", t: 0 }, { txt: "1", t: em(c, "mostra") }],
  })),
  17: codigo((c) => ({
    titulo: "Passo a passo — volta 3",
    linhas: [
      { ...LACO[0], marca: em(c, "vira") },
      LACO[1], { ...LACO[2], marca: em(c, "mostra"), corMarca: OK }, LACO[3],
      { txt: "// i = 2 → 2 < 3 ?", t: em(c, "vira") },
      { txt: "// true", t: em(c, "sim"), ok: em(c, "sim") },
    ],
    saida: [{ txt: "0", t: 0 }, { txt: "1", t: 0 }, { txt: "2", t: em(c, "mostra") }],
  })),
  18: codigo((c) => ({
    titulo: "Passo a passo — fim",
    linhas: [
      { ...LACO[0], marca: em(c, "menor"), corMarca: ERRO },
      LACO[1], { ...LACO[2], apaga: em(c, "nao") }, LACO[3],
      { txt: "// i = 3 → 3 < 3 ?", t: em(c, "vira") },
      { txt: "// false", t: em(c, "nao"), erro: em(c, "nao") },
    ],
    saida: [{ txt: "0", t: 0 }, { txt: "1", t: 0 }, { txt: "2", t: 0 }, { txt: "fim do laço", t: em(c, "termina"), cor: AMARELO }],
  })),
  // 19 — 3 voltas
  19: fichas((c) => ({
    colunas: 4,
    fichas: [
      { txt: "0", sub: "volta 1", t: em(c, "zero", 2) },
      { txt: "1", sub: "volta 2", t: em(c, "um") },
      { txt: "2", sub: "volta 3", t: em(c, "dois") },
      { txt: "3×", sub: "exatamente", t: em(c, "exatamente"), cor: AMARELO },
    ],
  })),
  // 20–22 — variações
  20: codigo((c) => ({
    titulo: "De 1 a 5",
    linhas: [{ txt: "for (int i = 1; i <= 5; i++)", t: em(c, "basta"), marca: em(c, "igual") }],
    saida: [{ txt: "1 2 3 4 5", t: em(c, "5", 2) }],
  })),
  21: codigo((c) => ({
    titulo: "Contagem regressiva",
    linhas: [{ txt: "for (int i = 10; i > 0; i--)", t: em(c, "comece"), marca: em(c, "menos") }],
    saida: [{ txt: "10 9 8 7 6 5 4 3 2 1", t: em(c, "menos", 2) }],
  })),
  22: codigo((c) => ({
    titulo: "De 2 em 2",
    linhas: [{ txt: "for (int i = 0; i <= 10; i += 2)", t: em(c, "i"), marca: em(c, "igual") }],
    saida: [{ txt: "0 2 4 6 8 10", t: em(c, "pares") }],
  })),
  // 23/24 — array
  23: fichas((c) => ({
    fichas: [
      { txt: '"Ana"', sub: "posição 0", t: em(c, "array") },
      { txt: '"Bia"', sub: "posição 1", t: em(c, "lista") },
      { txt: '"Caio"', sub: "posição 2", t: em(c, "posicoes") },
    ],
  })),
  24: fichas((c) => ({
    fichas: [
      { txt: "[0]", sub: '"Ana"', t: em(c, "zero"), cor: AMARELO },
      { txt: "[1]", sub: '"Bia"', t: em(c, "zero") },
      { txt: "[2]", sub: '"Caio"', t: em(c, "zero") },
    ],
  })),
  // 25/26 — percorrendo
  25: codigo((c) => ({
    titulo: "Percorrendo o array",
    linhas: [
      { txt: 'string[] nomes = { "Ana", "Bia", "Caio" };', t: 0 },
      { txt: "for (int i = 0; i < nomes.Length; i++)", t: em(c, "menor"), marca: em(c, "length", 2) },
    ],
    saida: [{ txt: "nomes.Length = 3", t: em(c, "length"), cor: AMARELO }],
  })),
  26: codigo((c) => ({
    titulo: "Percorrendo o array",
    linhas: [
      { txt: 'string[] nomes = { "Ana", "Bia", "Caio" };' },
      { txt: "for (int i = 0; i < nomes.Length; i++)" },
      { txt: "    Console.WriteLine(nomes[i]);", t: em(c, "nomes"), marca: em(c, "posicao") },
    ],
    saida: [
      { txt: "Ana", t: em(c, "volta") },
      { txt: "Bia", t: em(c, "volta", 2) },
      { txt: "Caio", t: em(c, "todos") },
    ],
  })),
  // 28–30 — carrinho
  28: codigo((c) => ({
    titulo: "Carrinho.cs",
    linhas: [
      { txt: "decimal[] precos = { 10, 25, 15 };", t: 0 },
      { txt: "decimal total = 0;", t: em(c, "total"), marca: em(c, "zero") },
    ],
  })),
  29: codigo((c) => ({
    titulo: "Carrinho.cs",
    linhas: [
      { txt: "decimal[] precos = { 10, 25, 15 };" },
      { txt: "decimal total = 0;" },
      { txt: "for (int i = 0; i < precos.Length; i++)", t: em(c, "for") },
      { txt: "    total += precos[i];", t: em(c, "total"), marca: em(c, "igual"), ok: em(c, "acumulando") },
    ],
  })),
  30: codigo((c) => ({
    titulo: "Carrinho.cs",
    linhas: [
      { txt: "decimal[] precos = { 10, 25, 15 };" },
      { txt: "decimal total = 0;" },
      { txt: "for (int i = 0; i < precos.Length; i++)" },
      { txt: "    total += precos[i];" },
    ],
    saida: [
      { txt: "total = 10", t: em(c, "10", 2) },
      { txt: "total = 35", t: em(c, "35") },
      { txt: "total = 50", t: em(c, "50"), cor: AMARELO },
    ],
  })),
  31: fichas((c) => ({
    fichas: [
      { txt: "soma", sub: "total += x", t: em(c, "somar") },
      { txt: "conta", sub: "qtd++", t: em(c, "contar") },
      { txt: "maior", sub: "if (x > max)", t: em(c, "maior"), cor: AMARELO },
    ],
  })),
  // 33 — <= Length
  33: codigo((c) => ({
    titulo: "Erro clássico",
    linhas: [
      { txt: 'string[] nomes = { "Ana", "Bia", "Caio" };  // 0..2', t: 0, marca: em(c, "dois") },
      { txt: "for (int i = 0; i <= nomes.Length; i++)", t: em(c, "mas"), marca: em(c, "igual"), corMarca: ERRO },
      { txt: "    Console.WriteLine(nomes[i]);", t: em(c, "mas") },
    ],
    saida: [{ txt: "i = 3 → nomes[3] ???", t: em(c, "chega"), cor: VERMELHO }],
  })),
  // 35 — regra de ouro
  35: codigo((c) => ({
    titulo: "Regra de ouro",
    linhas: [
      { txt: "for (int i = 0; i < nomes.Length; i++)", t: em(c, "use"), marca: em(c, "length"), corMarca: OK, ok: em(c, "length") },
      { txt: "for (int i = 0; i <= nomes.Length; i++)", t: em(c, "nunca"), risca: em(c, "igual"), erro: em(c, "igual") },
    ],
  })),
  // 37 — laço infinito
  37: codigo((c) => ({
    titulo: "Laço infinito",
    linhas: [
      { txt: "for (int i = 0; i < 10; )     // sem i++", t: em(c, "esquecer"), erro: em(c, "incremento") },
      { txt: "for (int i = 0; i < 10; i--)  // ao contrário", t: em(c, "incrementar"), erro: em(c, "errada") },
    ],
    saida: [{ txt: "rodando... rodando... rodando...", t: em(c, "trava"), cor: VERMELHO }],
  })),
  // 40 — break
  40: codigo((c) => ({
    titulo: "break",
    linhas: [
      { txt: "for (int i = 0; i < numeros.Length; i++)", t: 0 },
      { txt: "{", t: 0 },
      { txt: "    if (numeros[i] == alvo)", t: em(c, "procurando"), marca: em(c, "achou") },
      { txt: "        break;   // achou: para aqui", t: em(c, "da"), ok: em(c, "procurar") },
      { txt: "}", t: em(c, "da") },
    ],
  })),
  // 42 — continue
  42: codigo((c) => ({
    titulo: "continue",
    linhas: [
      { txt: "for (int i = 0; i < numeros.Length; i++)", t: 0 },
      { txt: "{", t: 0 },
      { txt: "    if (numeros[i] % 2 != 0) continue;", t: em(c, "se"), marca: em(c, "continue") },
      { txt: "    Processar(numeros[i]);   // só pares", t: em(c, "assim"), ok: em(c, "processados") },
      { txt: "}", t: em(c, "assim") },
    ],
  })),
  // 44/45 — laço aninhado
  44: codigo((c) => ({
    titulo: "Tabuada — laço aninhado",
    linhas: [
      { txt: "for (int l = 1; l <= 10; l++)", t: em(c, "fora"), marca: em(c, "linhas") },
      { txt: "{", t: em(c, "fora") },
      { txt: "    for (int c = 1; c <= 10; c++)", t: em(c, "dentro"), marca: em(c, "colunas") },
      { txt: '        Console.Write($"{l * c} ");', t: em(c, "colunas") },
      { txt: "    Console.WriteLine();", t: em(c, "perfeito") },
      { txt: "}", t: em(c, "perfeito"), ok: em(c, "tabuada") },
    ],
  })),
  45: fichas((c) => ({
    fichas: [
      { txt: "10", sub: "linhas", t: em(c, "10") },
      { txt: "× 10", sub: "colunas", t: em(c, "10", 2) },
      { txt: "= 100", sub: "execuções", t: em(c, "100"), cor: VERMELHO, texto: "#2a0806" },
    ],
  })),
  // 46/47 — escopo e duas variáveis
  46: codigo((c) => ({
    titulo: "Escopo do i",
    linhas: [
      { txt: "for (int i = 0; i < 3; i++)", t: em(c, "declare"), marca: em(c, "for") },
      { txt: "{ /* i existe aqui */ }", t: em(c, "existe") },
      { txt: "Console.WriteLine(i);  // erro: i não existe", t: em(c, "vaza"), erro: em(c, "resto") },
    ],
  })),
  47: codigo((c) => ({
    titulo: "Duas variáveis",
    linhas: [{ txt: "for (int i = 0, j = 10; i < j; i++, j--)", t: em(c, "duas"), marca: em(c, "virgula") }],
    saida: [{ txt: "use com moderação", t: em(c, "moderacao"), cor: AMARELO }],
  })),
  // 49 — quando usar for
  49: fichas((c) => ({
    colunas: 2,
    fichas: [
      { txt: "for", sub: "sei quantas vezes", t: em(c, "quantas") },
      { txt: "[i]", sub: "preciso do índice", t: em(c, "indice"), cor: AMARELO },
    ],
  })),
  // 53/54 — desafio
  53: codigo((c) => ({
    titulo: "Desafio",
    linhas: [
      { txt: "for (int i = 1; i < 10; i += 3)", t: em(c, "for"), marca: em(c, "3") },
      { txt: "    Console.WriteLine(i);", t: em(c, "3") },
    ],
  })),
  54: codigo((c) => ({
    titulo: "Desafio",
    linhas: [{ txt: "for (int i = 1; i < 10; i += 3)" }, { txt: "    Console.WriteLine(i);" }],
    saida: [{ txt: "???", t: em(c, "tela"), cor: AMARELO }],
    extra: [{ t: em(c, "responde"), tipo: "pose", pose: "pensando" }],
  })),
  // 55/56 — resumo
  55: fichas((c) => ({
    fichas: [
      { txt: "int i = 0", sub: "inicialização", t: em(c, "inicializacao") },
      { txt: "i < n", sub: "condição", t: em(c, "condicao"), cor: AMARELO },
      { txt: "i++", sub: "incremento", t: em(c, "incremento"), cor: "#b7c49a" },
    ],
  })),
  56: fichas((c) => ({
    fichas: [
      { txt: "<= Length", sub: "evite", t: em(c, "menor"), cor: VERMELHO, texto: "#2a0806" },
      { txt: "∞", sub: "laço infinito", t: em(c, "infinito"), cor: VERMELHO, texto: "#2a0806" },
      { txt: "break · continue", sub: "controle o fluxo", t: em(c, "break"), cor: VERDE, texto: "#08200c" },
    ],
  })),
};

// cenas comuns com número na fala que não deve virar cartão grande
const SEM_CARTAO = new Set([3, 34]);

const ajustar = (tl: Timeline) => ({
  ...tl,
  cenas: tl.cenas.map((c, i) => (SEM_CARTAO.has(i) ? { ...c, template: "imagem" as const } : c)),
});

export const ForCSharp: React.FC<Timeline> = (tl) => <Video {...ajustar(tl)} pasta={PASTA} especiais={especiais} />;

// ── Short (9:16) da mesma narração ───────────────────────────────────────
const CENAS_SHORT = [0, 6, 7, 14, 15, 16, 17, 18, 19, 25, 26, 33, 34, 35, 53, 54, 57];

export const timelineShortFor = (tl: Timeline) =>
  recortarTimeline(ajustar(tl), CENAS_SHORT, { largura: 1080, altura: 1920, legenda: { ...tl.legenda, pos: 56 } });

const ESPECIAIS_SHORT = Object.fromEntries(
  CENAS_SHORT.flatMap((orig, novo) => (especiais[orig] ? [[novo, especiais[orig]]] : [])),
) as Record<number, CenaEspecial>;

export const ForCSharpShort: React.FC<Timeline> = (tl) => <Video {...tl} pasta={PASTA} especiais={ESPECIAIS_SHORT} />;
