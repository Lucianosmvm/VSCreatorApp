# Refúgio 13 — produção no estilo de Mundo Pixelândia

Direção solicitada pelo usuário em 18/11/2026: mesmo tipo de mundo vivo e de filmagem
de Mundo Pixelândia, em um universo independente de sobrevivência zumbi.

## Como Mundo Pixelândia é produzido

1. O jogo Canvas em `D:/Nova pasta/mundo-pixelandia/index.html` desenha terreno,
   árvores, prédios e moradores em uma grade de tiles de 16 pixels. Possui sprites
   detalhados, caminhos, rotinas de trabalho, animações, iluminação e estado salvo.
2. `ferramentas/pixelandia/filmar.mjs` abre o jogo no Chrome, carrega o estado
   anterior, adiciona moradores e executa o plano de tomadas. A simulação avança
   quadro a quadro, com câmera acompanhando pessoas e lugares.
3. A captura em 540x960 é ampliada para 1080x1920 com nearest-neighbor,
   preservando os pixels. São gerados os clipes das tomadas e um `video.json`.
4. `remotion/src/pixelandia/Pixelandia.tsx` usa os clipes como fundo de tela inteira.
   Acrescenta legendas de impacto, faixa de destaque, selo do episódio, clima,
   efeitos e a narração. A voz não produz a animação: ela define a sincronização.
5. O estado do mundo permanece salvo para o episódio seguinte. As construções
   e os moradores não são recriados do zero em cada vídeo.

## Por que a prévia SVG anterior parecia diferente

| Aspecto | Mundo Pixelândia | Prévia SVG anterior de Refúgio 13 |
|---|---|---|
| Base visual | Jogo Canvas capturado | Formas SVG animadas no Remotion |
| Tela | Mundo ocupando o fundo inteiro | Mundo em um painel com bastante espaço de texto |
| Cenário | Terreno, objetos, arquitetura e detalhes do jogo | Representação simplificada dos locais |
| Personagens | Sprites do jogo, poses, acessórios e atividades | Figuras simplificadas com deslocamentos por tomada |
| Movimento | Caminhos e ações no mundo, dirigidos para a filmagem | Posições calculadas para cada cena |
| Continuidade | Estado executado pelo jogo e salvo | Estado narrativo em JSON e encenação separada |

As prévias SVG em `remotion/src/refugio/MundoDia02.tsx` e
`remotion/src/videos/Refugio13Dia02.tsx` servem como storyboard do roteiro.
Elas ainda não implementam a produção visual pedida. Trocar apenas as tags,
as cores ou a moldura não equivale a filmar um mundo como Mundo Pixelândia.

## Direção para a reformulação

- Reaproveitar o mecanismo de renderização/filmagem compatível com Pixelândia,
  em uma base isolada de Refúgio 13 dentro deste projeto. Não alterar o jogo,
  o elenco nem os arquivos de estado originais de Mundo Pixelândia.
- Preservar o mapa próprio: estação, trilhos, mercado, oficina e clareira de expansão.
  O mundo deve preencher a tela vertical, com a interface sobreposta.
- Usar pixel art com a mesma riqueza de detalhes: chão texturizado, vegetação,
  portas, interiores, telhados, ferramentas, caixas e objetos carregados.
- Criar aparência de sobrevivência: edifícios gastos, barricadas, entulho,
  reservatório, oficina e posto de socorros. Luz quente no abrigo e exteriores
  mais frios, com noite legível.
- Mostrar ações concretas: caminhar por caminhos, pegar materiais, carregar
  objetos, trabalhar em construções e reagir aos infectados. Evitar arrastar
  figuras entre pontos como substituto dessas ações.
- Integrar zumbis ao mesmo mundo, reagindo a som e luz. O causo de Velho Giu
  funciona como distração sonora; os infectados não compreendem a mentira.
- Câmera de jogo acompanhando a ação, com planos gerais e aproximações que
  mantenham os personagens visíveis e em escala consistente.
- Nomes em tags centralizadas diretamente acima das cabeças, sem linhas,
  pontos ou chamadas laterais. Afastar personagens quando necessário.
- Montagem semelhante à de Pixelândia: legendas de impacto sobre o cenário,
  pouca interface permanente e informações de recursos quando mudarem ou
  explicarem a votação. Preservar a identidade e os dados de Refúgio 13.
- Salvar o mapa, elenco, construções, itens e consequências para os episódios
  seguintes. O crescimento do abrigo deve aparecer no mundo.

## EP02: o que preservar

- Apuração fornecida pelo usuário: **A = 0, B = 1**. A rota vencedora é a oficina.
- Elenco próprio: Lia, Nilo, Eva, **ULISSES / Doutor** e **Velho Giu / safo,
  contador de histórias e inventor de boas mentiras**.
- Resgate, contribuição dos dois novos participantes, materiais recuperados,
  bancada de socorros e custo da decisão: a água do mercado ficou para depois.
- Nova escolha proposta: A = mercado com água pronta e risco de infectados;
  B = recuperar cisterna com trabalho e tratamento ainda necessários.
- O roteiro permanece revisável; a prévia SVG anterior não representa uma
  aprovação do novo estilo. Preparar nova prévia visual antes da ElevenLabs.

## Implementação concluída

### Interação com os infectados

Quando um infectado estiver no caminho, mostrar uma reação dos sobreviventes:
desvio, bloqueio, confronto ou fuga, com antecipação e consequência visível.
Nunca atravessar o sprite de um zumbi. No EP02 revisado, a dupla contorna o
cerco e, na saída, Nilo usa uma tábua para afastar um infectado enquanto os
demais recuam. O inimigo cai, sem morte confirmada. A distração de Velho Giu
continua determinante para afastar os outros cinco. Manter o combate sem
sangue e as tags legíveis; validar os trajetos e o espaçamento quadro a quadro.

O EP02 foi refeito com mundo Canvas filmado e montagem em tela inteira. Motor e sprites em `ferramentas/refugio-13/mundo/index.html`, direção e ações em `refugio.js`, captura em `ferramentas/refugio-13/filmar.mjs` e compositor em `remotion/src/refugio/RefugioFilmado.tsx`. As ações são dirigidas pelo plano de tomadas, como na produção de Pixelândia. O universo e o estado são independentes.

Prévia: `remotion/jobs/refugio-13-02/previa-ep02-estilo-pixelandia.mp4`. Mundo salvo: `projetos/refugio-13-02/mundo.json`. Restauro de terreno, personagens e construções testado. As prévias SVG continuam arquivadas como storyboard. O visual foi aprovado; o EP02 está narrado e exportado em `remotion/out/refugio-13-02.mp4`.
