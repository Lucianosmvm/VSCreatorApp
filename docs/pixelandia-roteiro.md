# Mundo Pixelândia — roteiro da série

Série de Shorts 9:16 (até 2 min; o limite do YouTube para Shorts é 3 min) da vila pixel art onde **cada inscrito vira morador**. Sem
narração: cenas filmadas do jogo + legendas de impacto (estilo em `docs/estilo-pixelandia.md`).
Cada episódio continua a vila do anterior (`--vila projetos/<ep anterior>/vila.json`), recebe os
inscritos que comentaram e termina com um gancho que **os comentários decidem**.

**Ponto de retomada:** EP. 03 — *A estrada encheu!* produzido (`mundo-pixelandia-03`, 1 min 35 s, narrado).
Chegaram 16 moradores (15 profissões + o prefeito Samuel), a vila foi a 35 e o Parque foi liberado.
Samuel discursou e ganhou a **Estátua do 1º Prefeito** na praça; o mandato tem prazo (nova eleição depois).
De madrugada o Astro viu a luz de novo, agora com o Lago (guarda noturno) de testemunha; ela desceu
atrás da floresta e deixou marcas na grama. Estado salvo: `projetos/mundo-pixelandia-03/vila.json`.
Próximo: **EP. 04 — O que caiu na floresta** (receber os comentaristas do #3).

## Elenco atual (o que cada um rende de história)

| Morador | Profissão | Papel na série |
|---|---|---|
| zHero | caçador | Fundador nº 1. Candidato natural a prefeito ("eu cheguei primeiro") |
| Astro Novalite | polissonografista | Único acordado de madrugada: **testemunha** do mistério da temporada |
| Bruno | lenhador | Trabalha com o Phil na serraria; dupla cômica |
| Pedro | pedreiro | Constrói tudo; aparece em toda obra nova |
| An tenna | apresentador de TV | **Âncora do "Plantão Pixelândia"**: abre os episódios de notícia |
| Kyle | advogado | Candidato a prefeito; "resolve toda treta" |
| Dandy | youtuber | "Grava tudo": desculpa para replay e bastidores |
| Neguin | vendedor de brechó | Veste a vila em festas e casamentos |
| Soluco | domador de dragões | Ainda sem dragão; a cada mistério jura que "agora é dragão" |
| Robson | criador de robôs | Inventor; "o próximo robô funciona" (nunca funciona) |
| Stanley | pescador | Lago e peixaria; vê coisas estranhas na água |
| Latifa | cuidadora de pet | Abre o arco dos pets; única moradora mulher até agora |
| Previseg | corretor de seguros | "Eu avisei": comenta todo desastre |
| Sprout | médico | Clínica; atende após incêndio e resgate |
| Phil | operador de serra | Dupla com Bruno |
| Luiz e Luiz | professores | Piada recorrente: ninguém sabe qual Luiz é qual |
| Victor | minerador | Pedra para as obras; acha algo na mina (gancho futuro) |
| Rian | fazendeiro | Plantação e celeiro; padaria depende dele |

### Chegaram no #3 (16) — profissão real · profissão usada no jogo

| Morador | Profissão (jogo) | Papel na série |
|---|---|---|
| **Samuel** | prefeito (`prefeito`) | **1º prefeito**, tem estátua dourada na praça. Mandato com prazo: no EP. 06 tenta a reeleição |
| Lucas | socorrista do SAMU (`enfermeiro`) | Primeiro a chegar em qualquer acidente; dupla com os médicos |
| Isaac | pedreiro (`pedreiro`) | Parceiro de obra do Pedro pedreiro |
| Elias | engenheiro civil (`pedreiro`) | Planeja as obras grandes (Parque, estátuas, farol) |
| Luiz (3º) | engenheiro civil (`pedreiro`) | **O terceiro Luiz**: piada recorrente com os dois professores |
| Jean | guerreiro (`cacador`) | Defende a vila quando o mistério da floresta virar ameaça |
| Ana | médica (`medico`) | Segunda moradora mulher (ao lado da Latifa) |
| Alex, Diogo | médicos (`medico`) | Clínica lotada: "4 médicos novos" |
| Pedro (médico) | médico (`medico`) | **Segundo Pedro** — diferenciar sempre: "Pedro pedreiro" × "Pedro médico" |
| Gideão | agricultor (`fazendeiro`) | Dupla com o Rian na plantação |
| Stan | dentista (`medico`) | Fala: escrever "Stén" para a voz pronunciar certo |
| Abner | pizzaiolo (`cozinheiro`) | "Sexta tem pizza na vila": festas e eventos |
| José Alvaro | bombeiro (`bombeiro`) | **1º bombeiro**: protagonista do incêndio do EP. 09 |
| Jefingomesrs | gari (`jardineiro`) | Fala: "Jéfin Gomes". Limpa a vila depois das festas |
| Lago | guarda noturno (`policial`) | **Segunda testemunha** da luz, junto com o Astro (de madrugada) |

Profissões fora do jogo usam a mais parecida (coluna "jogo") e a real vai em `custom` no `novos.json`;
legenda e fala sempre dizem a profissão real.


## Fios abertos (retomar no #4)

- **A luz na floresta:** desceu atrás da floresta e deixou marcas na grama; testemunhas Astro e Lago.
  O #4 mostra o que é (sugestão: o Jean, o Lago e o Astro vão ver de dia; a ideia original do
  voto "OVNI ou dragão?" com o Soluco cabe aqui).
- **Prefeito Samuel:** mandato com prazo; eleição no EP. 06 (Samuel × zHero × Kyle).
- **Parque:** liberado no #3 (35 moradores); a obra pode ser inaugurada no #4 ou #5.
- **Três Luiz** e **dois Pedros:** piadas para usar quando der.
- **Formato dos episódios desde o #3:** narrado com a voz do usuário, até 2 min, boas-vindas
  individuais, convite com "curta e se inscreva" e gancho de mistério na última cena.

## Regras de cada episódio

- **Título:** `Mundo Pixelândia #N: <acontecimento>`. Selo `📺 #N` no vídeo.
- **Cena 1 = gancho** em 1 frase (lembra o anterior ou mostra o problema). Até 3 s.
- **Boas-vindas** aos inscritos que comentaram no episódio anterior (nome + profissão,
  2–2,5 s cada; mais de 8 → agrupar de 4 em 4).
- **Um acontecimento por episódio** (evento, eleição, obra, mistério).
- **Contador da meta:** "faltam X moradores para o PARQUE" (metas do jogo: 30 parque,
  50 estátua (a do Samuel já existe: aos 50 a vila vota quem ganha a próxima), 100 farol, 200 roda-gigante).
- **Final:** pergunta que os comentários respondem + "comente NOME + PROFISSÃO".
  Sempre prometer o próximo: "no #N+1 você pode aparecer".
- **Horário marcado** quando houver revelação ("domingo 18h sai o resultado").

## Temporada 1 — Rumo ao Parque (19 → 30 moradores)

| EP | Título | Acontecimento | Quem brilha | Gancho / pedido nos comentários |
|---|---|---|---|---|
| 01 | Conheça quem mora aqui ✅ | Apresentação dos 19 | todos | Comente nome + profissão para morar |
| 02 | Ninguém chegou… ainda ✅ | Sem inscritos novos: a vila espera na praça; faltam 11 para o Parque | zHero, Pedro, Latifa, Luiz | "De madrugada, o Astro viu uma luz no céu…" |
| 03 | A estrada encheu! ✅ | 16 novos, Parque liberado, Samuel 1º prefeito + estátua; a luz volta e desce na floresta | novos, Samuel, Astro, Lago | "O que caiu na floresta?" |
| 03b | (ideia original) O que o Astro viu | Neve fora de época, voto OVNI ou dragão | Astro, Stanley | aproveitar no #4 |
| 04 | Ele voltou 👽 | OVNI aparece e leva um morador | morador mais citado nos comentários | "Quem vai resgatar?" — meta de curtidas |
| 05 | O resgate | Robson tenta um robô (falha) e o morador volta; festa (nuvens + confete) | Robson, Soluco | "A vila precisa de alguém no comando…" |
| 06 | Eleição em Pixelândia 🗳️ | Fim do mandato do Samuel; candidatos: Samuel (reeleição), zHero, Kyle | candidatos | **Vote** no prefeito; resultado com horário marcado |
| 07 | Temos um prefeito! 🎖️ | Posse e festa na praça | prefeito eleito | "Primeira decisão: qual obra construir?" |
| 08 | A primeira obra do prefeito | Votação de construção (3 opções) | Pedro, Victor | **Vote** 1, 2 ou 3 |
| 09 | FOGO na vila 🔥 | Incêndio na obra escolhida (clima ameaça) | Previseg ("eu avisei"), Sprout | "A vila não tem bombeiro. Comente BOMBEIRO para ser o primeiro" |
| 10 | O Parque chegou 🌳 | Bombeiros dos comentários apagam o fogo; meta de 30 moradores → Parque inaugurado | novos bombeiros | Final de temporada: "algo foi encontrado na mina…" |

Se a vila passar de 30 antes do EP. 10, antecipar a inauguração do Parque e manter o fogo.

## Temporada 2 — Rumo à Estátua (30 → 50), ideias

- **O segredo da mina** (Victor acha algo; estátua misteriosa coberta na praça até os 50).
- **Pets para todos:** Latifa abre o abrigo; comentários escolhem nome e pet de cada morador.
- **A grande fuga das galinhas** (arco pronto do jogo) — Rian perde o galinheiro.
- **Primeiro casamento** — só com casal que **os próprios inscritos** pedirem nos comentários.
- **Plantão Pixelândia** com An tenna: resumo da semana a cada 5 episódios.
- **Qual Luiz é qual?** — episódio curto de humor para manter ritmo entre arcos.

## Produção

O usuário pede cada episódio ao Claude. Recursos que o episódio precisar (noite, eventos,
prefeito, votação) são ajustados no `filmar.mjs` na hora de gerar aquele vídeo, não antes.

Ao terminar um episódio: atualizar o **ponto de retomada** acima (nome do projeto, dia,
moradores, o que aconteceu) e marcar ✅ na tabela.
