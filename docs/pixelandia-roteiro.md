# Mundo Pixelândia — roteiro da série

## Objetivo principal — direção confirmada em 18/11/2026

**Evoluir o mundo com a comunidade:** criar coisas novas, construir e ampliar a vila,
desenvolver recursos e serviços e realizar eventos com consequências no jogo.
A história conecta essas mudanças e dá sentido às ações dos moradores. Não transformar
a série apenas em contação de histórias ou em uma investigação que nunca termina.

- O caso do Astro é um arco temporário. Concluí-lo e voltar à evolução concreta da vila.
- Depois desse caso, priorizar o Parque já desbloqueado, novas construções, infraestrutura,
  criações dos moradores e eventos. Escolher o próximo avanço com base no estado real do jogo.
- Cada episódio deve mostrar um avanço visível ou uma etapa clara rumo a ele: terreno
  preparado, materiais reunidos, obra iniciada, construção entregue ou evento realizado.
  Só receber moradores e aumentar o contador não substitui a evolução do mundo.
- Integrar antigos e novos às obras e atividades conforme suas profissões. As decisões
  do público devem ter consequências visíveis nos episódios seguintes.
- Mistérios e ganchos são recursos ocasionais. Uma obra a inaugurar ou uma criação a testar
  também pode motivar o público a acompanhar o próximo episódio.

Série de Shorts 9:16 (em torno de 2 min, até 3 min) da vila pixel art onde **cada inscrito vira morador**.
Cenas filmadas do jogo + legendas de impacto + voz do usuário desde o #3 (estilo em `docs/estilo-pixelandia.md`).
Cada episódio continua a vila do anterior (`--vila projetos/<ep anterior>/vila.json`), recebe os
inscritos que comentaram e termina com um gancho que **os comentários decidem**.

**Ponto de retomada:** EP. 06 — narrado e exportado em 23/11/2026, publicação pendente.
Vídeo: `remotion/out/mundo-pixelandia-06.mp4`, 1 min 45 s, 1080x1920.
Título: *Mundo Pixelândia #6: a vila CRESCEU até a mina (e a estátua é do Astro!)*.
A votação escolheu o **Astro Novalite** para a estátua. O prefeito Samuel mandou a vila crescer:
Bruno e Phil abriram a floresta a nordeste, Pedro pedreiro (ID 4) e Isaac fizeram a **estrada até a
mina**, que ganhou **postes** e o **Bairro da Mina** (3 casas). Victor e Vicente trouxeram a pedra com
escolta do João Pedro (BOPE, já morador desde o #5: comentou de novo, não foi duplicado). Isaac e Elias
ergueram a **estátua de pedra do Astro** (CX+12, CY+3; no jogo é a estátua padrão, o cenário pinta de
pedra com placa "ASTRO"). Chegaram **Pietro Oliveira** (guardião, espada e armadura), **Gabriel**
(político) e **Carlos** (adolescente skatista). Vila com **54 moradores**; próxima meta: farol (100).
**Tudo isso está salvo no jogo** em `projetos/mundo-pixelandia-06/vila.json` (estrada, postes, casas,
clareira e estátua pronta). Direção: `ampliacao.js` (mudanças no mundo) + `cenario.js` + `montar_plano.py`.
Próximo: **EP. 07 — Eleição**: Samuel (reeleição) × zHero × Kyle × **Gabriel** (o político novo).
Pedir voto nos comentários e receber os novos moradores no Bairro da Mina.

*Episódio anterior (#5):* narrado e exportado em 19/11/2026, publicação pendente.
Vídeo: `remotion/out/mundo-pixelandia-05.mp4`, 1 min 36 s, 1080x1920.
Título: *Mundo Pixelândia #5: a entrada entre as raízes era uma MINA*.
Victor reconheceu a entrada: era a mina antiga dos fundadores. Vicente (amigo do Victor),
Davi e Victor entraram e acharam pedra boa e ferramentas antigas. **Caso do Astro encerrado**
(a luz era o drone do Robson; a entrada, a mina). Sete moradores chegaram e a vila foi a **51**:
a meta da **estátua (50)** foi batida. A pedra da mina vai para a próxima estátua da praça
(Isaac e Elias). **Arthur/Biólogo e ArthurMendes_ eram a mesma pessoa:** unidos no ID 42 com o nome
ArthurMendes_ (ID 45 removido). No #5 ele aparece como "o biólogo do #4" que vai estudar as plantas da mina.
Pedido nos comentários: **votar de quem será a estátua** + apelido e profissão para morar.
Estado salvo: `projetos/mundo-pixelandia-05/vila.json`. Plano em `plano.json` (gerado por
`montar_plano.py`, que também alinha as setas ao áudio) e direção em `cenario.js`.
Próximo: **EP. 06 — a obra da estátua começa**, com o vencedor da votação, Isaac, Elias,
Victor e a pedra da mina. A eleição do prefeito (Samuel × zHero × Kyle) pode vir no #7.
Consultar `docs/pixelandia-moradores.md` antes de cadastrar nomes.

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


## Chegaram no #4

| Morador | Profissão real · representação no jogo | Participação |
|---|---|---|
| Thiago | Fotógrafo · comerciante | Fotografa o drone e observa o registro |
| Livinha | Caçadora de aranhas · caçadora | Acompanha a equipe e cuida da aranha |
| Buzz | Arquiteto · pedreiro | Chega pela estrada e vai conhecer a vila |
| Molossi | Pescador | Chega com Buzz e Jefferson |
| Pedro | Policial do BOPE · policial | Reforça a equipe de Jean |
| Jefferson | Almirante · marinheiro | Quer comandar a marinha |
| Arthur (= ArthurMendes_) | Biólogo · professor | Examina os vestígios na clareira. Mesma pessoa que ArthurMendes_ |
| Durplejoga | Aventureiro · caçador | Promete proteger a cidade e reforça a equipe de Jean e Pedro |
| Julia Marina | Gestora Ambiental · jardineira | Ajuda Elias a preservar a floresta na escolha do caminho |
| ArthurMendes_ | (mesma pessoa que Arthur, unidos no #5) | No vídeo do #4 aparece duas vezes; no #5 já é um só |

## Chegaram no #5

| Morador | Profissão real · representação no jogo | Participação |
|---|---|---|
| Abraão | Bombeiro | Confere a segurança da entrada com José Alvaro |
| Pietro | Guarda noturno · policial | Vigia a mina com o Lago (enfim, parceiro de madrugada) |
| João Pedro | Policial do BOPE · policial | Reforça a equipe do Jean; "quatro Pedros" |
| Davi | Assassino furtivo · caçador | "Ninguém viu ele chegar"; entra na mina com o trio |
| Vicente | Explorador de cavernas · minerador | Amigo do Victor; acende a lanterna e guia a entrada |
| Brites | Empresário · comerciante | Quer investir na pedra da mina; fala com o prefeito Samuel |
| Laura | Florista · jardineira | Planeja flores para a praça com Julia Marina |

## Chegaram no #6

| Morador | Profissão real · representação no jogo | Participação |
|---|---|---|
| Pietro Oliveira | Guardião da vila · caçador | "Já que tem outro Pietro": guardião de armadura top e espada grande, servo do rei e explorador. Guarda a mina com o Pietro (guarda noturno) |
| Gabriel | Político · comerciante | Primeiro morador do Bairro da Mina; chegou fazendo campanha → candidato no #7 |
| Carlos | Adolescente skatista · jardineiro | Estreou a estrada nova de skate; o Dandy gravou |

João Pedro (Policial do BOPE) comentou de novo: já mora desde o #5, apareceu escoltando a pedra.

## Histórico de protagonismo

- #3: recém-chegados, Samuel (posse e estátua), Astro e Lago (testemunhas da luz).
- #4: Astro, Lago e Jean conduzem a expedição. Robson explica a luz e recupera a imagem.
  Thiago, Arthur e Livinha colaboram com os antigos.
- #6: Bruno e Phil (floresta), Pedro pedreiro e Isaac (estrada), Elias e Buzz (plano), Laura e Julia
  Marina (flores), Isaac e Elias (estátua), Astro (homenageado). Ainda com pouco destaque: Stanley,
  Previseg, Soluco, An tenna, Neguin, Rian, médicos.
- #5: Victor (reconhece a mina), Vicente e Davi (entram), Astro (caso encerrado). Nos seguintes, considerar antigos com pouco
  destaque, como Bruno, Phil, Stanley e Latifa, conforme o acontecimento do capítulo.

## Fios abertos (retomar no #7)

- **Eleição no #7:** Samuel (reeleição) × zHero × Kyle × Gabriel. Pedir voto nos comentários.
- **Bairro da Mina:** 3 casas na estrada da mina; próximos moradores podem ir para lá. A clareira
  aberta ainda tem espaço para mais casas, praça do bairro ou serviços.
- **Restaurante e cabana** estão na fila de obras do jogo (podem virar a próxima entrega).
- **Estátua do Astro (pronta no #6)** com pedra da mina; Samuel já tinha a estátua dourada.
- **Mina dos fundadores:** reaberta; Pietro e Lago vigiam; Brites quer investir (recurso de pedra).
- **Prefeito Samuel:** mandato com prazo; eleição no EP. 06 (Samuel × zHero × Kyle).
- **Parque:** liberado no #3 (35 moradores); a obra pode ser inaugurada no #4 ou #5.
- **Três Luiz** e **dois Pedros:** piadas para usar quando der.
- **Formato dos episódios desde o #3:** narrado com a voz do usuário, até 2 min, boas-vindas
  individuais, convite com "curta e se inscreva" e gancho de mistério na última cena.

## Regras de cada episódio

- **Título:** `Mundo Pixelândia #N: <acontecimento>`. Selo `📺 #N` no vídeo.
- **Cena 1 = gancho** em 1 frase (lembra o anterior ou mostra o problema). Até 3 s.
- **Boas-vindas** aos inscritos que comentaram no episódio anterior (nome + profissão),
  integradas ao acontecimento do capítulo. Apresente em pequenos grupos quando isso preservar
  a continuidade da ação. Faça os recém-chegados colaborarem com moradores antigos.
- **Rodízio de protagonismo:** registre após cada episódio quais moradores tiveram ações
  relevantes. No seguinte, dê espaço a antigos que ainda tiveram pouco destaque.
  O EP. 04 é conduzido por Astro, Lago e Jean, com uma contribuição decisiva de Robson.
- **Seta de identificação somente nos moradores novos daquele episódio.** Ela serve
  para o recém-chegado se reconhecer. Antigos continuam participando e tendo destaque
  na história, mas sem seta. Diferenciar homônimos por profissão/ID.
- **Um acontecimento por episódio**, com avanço concreto do mundo (criação, construção,
  recursos, serviços ou evento). Um arco de mistério deve ser curto e ter conclusão.
- **Contador da meta:** "faltam X moradores para o PARQUE" (metas do jogo: 30 parque,
  50 estátua (a do Samuel já existe: aos 50 a vila vota quem ganha a próxima), 100 farol, 200 roda-gigante).
- **Final:** consequência da ação e próximo objetivo do mundo, com convite para
  comentar NOME + PROFISSÃO. Use votação quando surgir uma decisão concreta na história.
  Sempre prometer o próximo: "no #N+1 você pode aparecer".
- **Horário marcado** quando houver revelação ("domingo 18h sai o resultado").

## Temporada 1 — Rumo ao Parque (19 → 30 moradores)

As linhas ainda não produzidas abaixo são ideias de planejamento. A direção confirmada
em 18/11 tem prioridade: concluir o caso do Astro e priorizar a evolução da vila.
Antecipar o Parque já desbloqueado; replanejar a numeração de eleição e obras conforme
o próximo avanço escolhido. Não prolongar a investigação para cumprir a tabela antiga.

| EP | Título | Acontecimento | Quem brilha | Gancho / pedido nos comentários |
|---|---|---|---|---|
| 01 | Conheça quem mora aqui ✅ | Apresentação dos 19 | todos | Comente nome + profissão para morar |
| 02 | Ninguém chegou… ainda ✅ | Sem inscritos novos: a vila espera na praça; faltam 11 para o Parque | zHero, Pedro, Latifa, Luiz | "De madrugada, o Astro viu uma luz no céu…" |
| 03 | A estrada encheu! ✅ | 16 novos, Parque liberado, Samuel 1º prefeito + estátua; a luz volta e desce na floresta | novos, Samuel, Astro, Lago | "O que caiu na floresta?" |
| 03b | (ideia original) O que o Astro viu | Neve fora de época, voto OVNI ou dragão | Astro, Stanley | aproveitar no #4 |
| 04 | Astro encontrou a luz da floresta ✅ | Expedição encontra o drone e a imagem de uma entrada | Astro, Lago, Jean e Robson | Victor foi chamado |
| 05 | A entrada entre as raízes ✅ | Victor reconhece a mina antiga; caso do Astro encerrado; 51 moradores, estátua liberada | Victor, Vicente, Davi, Astro | **Vote** de quem será a estátua |
| 06 | A vila cresceu até a mina ✅ | Estátua do Astro (votada); floresta aberta, estrada até a mina, postes, Bairro da Mina; 54 moradores | Bruno, Phil, Pedro, Isaac, Elias, novos | "No #7: eleição!" |
| 07 | Eleição em Pixelândia 🗳️ | Fim do mandato do Samuel; candidatos: Samuel (reeleição), zHero, Kyle, Gabriel | candidatos | **Vote** no prefeito; resultado com horário marcado |
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
