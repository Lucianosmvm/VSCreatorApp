# Refúgio 13

**Ponto de retomada:** Dia 03 — A cisterna da estação, exportado com narração em 19/11/2026. Arquivo: `remotion/out/refugio-13-03.mp4`, 96 s, 1080x1920. Apuração do EP02: A = 0, B = 1 (cisterna). Cisterna recuperada com calha; barreira de tábuas na rua leste (tábuas acabaram); filtro de baldes e fogueira. Água segura até a noite do dia 4; comida acaba na noite do dia 3. Elenco sem mudança: Lia, Nilo, Eva, ULISSES e Velho Giu. Diretor `ferramentas/refugio-13/mundo/dia03.js`, filmar com `node ferramentas/refugio-13/filmar.mjs --dia 03`, composição `refugio-13-03` (`remotion/src/refugio/RefugioDia03.tsx`). Estado em `projetos/refugio-13-03/estado.json` e `mundo.json`. Publicação pendente. Próximo: Dia 04, dependendo da votação do EP03: A = mercado (comida, rua com infectados), B = rádio (trocar água por comida, revela o abrigo). Para o Dia 04, criar `dia04.js` no mesmo molde e `--dia 04`.

Uma estação de trem abandonada começa com três sobreviventes durante um surto zumbi; o elenco cresce pelas participações e acontecimentos confirmados. A câmera vê de cima um mapa em pixel art com a estação, o mercado e a oficina. De dia, acompanhe os personagens trabalhando. À noite, a iluminação da estação, o rádio e os ruídos da cidade criam tensão. Mostre os zumbis como silhuetas ou sprites distantes. Use o painel de dia, sobreviventes e suprimentos apenas quando a informação mudar ou explicar uma escolha.

## Participação

- Voto simples: `A` ou `B`. Para entrar no elenco: `Luna | eletricista | B`. Use apelidos e habilidades que as pessoas oferecerem para a ficção.
- Apresente as duas opções na tela e na descrição. No capítulo seguinte, mostre o resultado confirmado e a consequência logo na abertura. Use a habilidade de um novo integrante em uma ação que ele possa influenciar.
- Registre a fonte da apuração no estado do episódio. Se os votos ainda estiverem pendentes, prepare as duas aberturas sem fixar uma rota e solicite o resultado. Se houver zero votos ou empate confirmado quando a votação encerrar, a liderança do abrigo escolhe pela necessidade imediata. Identifique a decisão como sendo dos personagens.
- Guarde no estado o efeito da escolha sobre o mundo. Por exemplo, um resgate pode aumentar o elenco enquanto a água continua em um dia.

## Dia 01 — A estação ainda tem luz

Short de 45 a 60 segundos. Abra com a cidade apagada e a estação iluminada. O grupo segue os trilhos e encontra comida para dois dias. O rádio capta uma voz na oficina. O reservatório da estação está quase vazio e só há tempo para uma saída antes de escurecer.

**A — Ir ao mercado buscar água.**  
**B — Ir à oficina encontrar quem chamou no rádio.**

Feche com as duas rotas identificadas no mapa. Use a chamada **Vote A ou B. Quer entrar no abrigo? Comente apelido + habilidade + voto.**


## Dia 02 — Um voto, duas vidas

A escolha B leva ao resgate na oficina. ULISSES ajuda Nilo com um ferimento. Velho Giu inventa uma discussão para o gravador; os infectados seguem o som, não entendem a mentira. O grupo sai pelos fundos. Tubos, conexões e tábuas são recuperados. Na estação, Nilo e ULISSES montam uma bancada de primeiros socorros. A água continua escassa. A votação seguinte apresenta custos claros: mercado com água pronta e exposição aos infectados, ou recuperar a cisterna com trabalho e tratamento ainda necessários. Estado do roteiro: cinco sobreviventes, água racionada até o meio-dia, cerca de um dia de comida. Aguardar aprovação visual.

**Identificação:** nomes em tags centralizadas diretamente acima da cabeça de cada sobrevivente visível. Sem linhas nem pontos ligando o nome ao personagem. Afastar os personagens o suficiente para evitar sobreposição de tags, mantendo o movimento contínuo.


## Direção visual solicitada — 18/11/2026

Usar o método de Mundo Pixelândia: mundo Canvas filmável, pixel art detalhada, ações no cenário e montagem em tela inteira. Refúgio 13 conserva seu próprio universo, mapa, elenco e estado. As prévias SVG do EP02 são storyboard; o mundo Canvas já está implementado em `ferramentas/refugio-13/mundo/index.html`. Não tomar aprovação do roteiro como aprovação dessas prévias visuais. Detalhes e comparação em `docs/refugio-13-estilo-producao.md`. Nomes somente em tags sobre as cabeças, sem linhas de ligação. Nova prévia antes de gastar créditos de narração.


## Motor Canvas implementado

O EP02 ativo agora é uma filmagem do mundo Canvas. Usar `ferramentas/refugio-13/README.md` para os comandos e `projetos/refugio-13-02/mundo.json` para preservar a evolução. O mundo reutiliza o renderizador de tiles, prédios e personagens do motor de Pixelândia, em uma cópia isolada, com dados próprios. Não retomar a montagem SVG como estilo principal. O compositor reutiliza as legendas de impacto de Pixelândia sobre vídeo em tela inteira e mantém a identidade Refúgio 13. A prévia Canvas do EP02 foi aprovada e a narração foi concluída. Nos próximos episódios, manter aprovação visual antes da ElevenLabs.


## Dia 03 — A cisterna da estação ✅

B venceu (1 voto). Nilo, Eva e Lia recuperam a cisterna com as peças da oficina e a calha do telhado. As marteladas atraem três infectados; Nilo e Velho Giu fecham a rua leste com as últimas tábuas, os infectados batem e recuam. Água turva: Ulisses proíbe beber, Eva monta filtro (pano, areia, carvão) e Velho Giu ferve. Água segura até amanhã à noite; comida acaba hoje.

**A — Ir ao mercado buscar comida** (rua com infectados).  
**B — Chamar no rádio e trocar água por comida** (revela onde fica o abrigo).
