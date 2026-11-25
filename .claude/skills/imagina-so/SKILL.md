---
name: imagina-so
description: Gera um Short do canal Imagina Só (@imaginasoh) — "Imagina só se…/E se…" em 3D de bloco (bonecos de cubo com contorno, câmera dinâmica, gancho no 1º segundo, loop) com a família fixa do canal (mãe, pai, filho, avó) no VSCreatorApp — roteiro viral, narração ElevenLabs, montagem Remotion + three.js e texto do YouTube com SEO. Use quando o usuário chamar /imagina-so ou pedir um Short do Imagina Só / "estilo bloco 3D" passando um tema ("e se a sua força dobrasse a cada dia").
argument-hint: "<tema: 'e se…' ou situação hipotética>"
---

# Short Imagina Só (3D de bloco)

Projeto: `D:/Nova pasta/VSCreatorApp`. Responder em português. Pedido do usuário: **$ARGUMENTS**

Leia o `CLAUDE.md`. Não altere os outros estilos (Dev Sobrevivente, RPG Code, Pixelândia, Refúgio 13).
Nunca recrie peça que já existe: confira a lista do kit abaixo antes de desenhar objeto ou personagem.

## Vídeos produzidos (referências de código)

| # | Tema | Arquivo (`remotion/src/imaginaso/`) | Comp | Formato | Use como base para |
|---|---|---|---|---|---|
| 01 | Mãe personagem de RPG | `MaeRpg3D.tsx` | `imagina-so-01-3d` | família, 1.15x, ~39 s | habilidades/poderes, luta lateral, laser, gelo |
| 02 | Mãe dona do Roblox | `MaeDona3D.tsx` | `imagina-so-02-3d` | família, 1.15x, ~34 s | regras/punições, chat 2D, virada com céu vermelho |
| 03 | Pai deu 10 mil Robux | `PaiRobux3D.tsx` | `imagina-so-03-3d` | história longa, **1.0x**, ~53 s | sequência longa, placar, fila de figurantes, noite no sofá |
| 04 | Velocidade dobra a cada dia | `Velocidade3D.tsx` | `imagina-so-04-3d` | **escalada DIA N**, 1.15x, ~49 s | HUD dia + medidor, rua que corre, céu, espaço |
| 05 | Avó controla o Roblox | `Avo3D.tsx` | `imagina-so-05-3d` | família, 1.15x, ~41 s | família inteira, batalha mãe × avó, TV, "jogo travado" |
| 06 | QI dobra todo dia | `QI3D.tsx` | `imagina-so-06-3d` | **escalada DIA N**, 1.15x, ~41 s | HUD de QI, lousa, robô, cachorro, portal, mãe acha o controle |
| 07 | QI infinito | `QIInfinito3D.tsx` | `imagina-so-07-3d` | família, 1.15x, ~36 s | robô escrevendo, spray de chocolate, pausa do tempo, foguete de papelão, clone perfeito |
| 08 | Mentiras viram realidade | `Mentiras3D.tsx` | `imagina-so-08-3d` | família, 1.15x, ~37 s | cachorro engole mochila, escola some, chuva de dinheiro, dinossauro rompe piscina, mãe gigante e limpeza |
| 09 | Mãe monstro de 99 Noites | `MaeFlorestaGameplay3D.tsx` | `imagina-so-09-3d` | gameplay, 1.15x, ~38 s | inventário, combustível, zona segura, mãe sopra fogueira e pai recusa resgate |
| 10 | Mãe motorista de Uber (v2) | `MaeUber3D.tsx` | `imagina-so-10-3d` | família, **1.05x**, ~38 s | 1º da série "Se a sua mãe fosse…"; **referência de comédia visual**: freada amassa, derrete/congela, barba de espera, cavalo de pau visto de cima, carro pulando no grave, estátua com passarinho, tribunal |
| 11 | E se a internet acabasse | `Internet3D.tsx` | `imagina-so-11-3d` | família, 1.05x, ~42 s | falando com quem assiste; Wi-Fi que quebra, roteador com contador, pai no telhado, vampiro no sol, avó de 40 min + estátua, jornal, mãe desmaia; callback 47× → 48× |
| 12 | E se os dinossauros não fossem extintos | `Dinos3D.tsx` | `imagina-so-12-3d` | família, 1.05x, ~42 s | T-rex na câmera (loop), asteroide no espaço, ônibus de pescoço comprido, raptor no sofá, T-rex rouba a picanha, fuga na escola, pterodátilo, T-rex obedece a mãe |

MP4 e texto do YouTube de cada um em `exportacoes/imagina-so/` (`imagina-so-NN-*.mp4`, `imagina-so-NN-youtube.txt`).
Os EP07 a EP12 estão exportados e narrados; publicação no YouTube pendente. Do #10 vale a **v2** (`imagina-so-10-mae-motorista-uber-3d-v2.mp4`). Próximo número disponível: **13**.

O EP09 revisado está narrado e exportado em `exportacoes/imagina-so/imagina-so-09-mae-99-noites-3d.mp4`. Projeto: `projetos/imagina-so-09-mae-monstro-da-floresta-mwutrfij`. Fonte ATIVA: `remotion/src/imaginaso/MaeFlorestaGameplay3D.tsx`; timeline real `timeline.json`. A versão antiga `MaeFloresta3D.tsx` não é a composição ativa. Publicação pendente; próximo episódio 13.

O usuário vai comparar a retenção do #03 (53 s) com os de ~40 s; até haver dado, prefira ~40 s.

## Série "Se a sua mãe fosse…"

Buscas reais no autocompletar: "se minha mãe fosse uber" (feito no #10), "…professora", "…psicóloga", "…policial", "…médica", "…caixa de supermercado". Um episódio por profissão, ~35 s, mãe com o adereço da profissão, regras de mãe aplicadas ao trabalho, virada no fim e pergunta de nota/relato. Interior de carro: câmera pelo para-brisa (`pos [7, 2.7, 0.3]`, alvo `[0, 2.2, 0]`) mostra mãe e filho de frente.

## O que deixa engraçado (lições do #10 v2)

- **A piada tem que estar na IMAGEM, não só na fala.** Para cada fala, ache o exagero físico de desenho animado: amassar, derreter, congelar, crescer barba esperando, virar estátua (passarinho pousa), carro pular no ritmo, tribunal com martelo. A legenda só confirma.
- **Primeiros 2 s = a gag mais física** (ex.: freada que amassa o filho), não uma apresentação.
- **Varie os planos**: no máximo 2 seguidos iguais; alterne close de reação, de cima, lateral e aberto.
- **Pouco texto ao mesmo tempo**: nada de banner repetindo o que a legenda diz. Banner/cartão só para o que a fala não diz (relógio, placar, nota, "CULPADO").
- **Fale com quem assiste** (preferência do usuário): "você", "seu pai", "sua mãe" em todas as falas; o filho na tela é o "você".
- **Callback**: repita no fim uma gag do começo com a mãe (ex.: 47× → 48×).
- **Sons de comédia** em cada gag (freio, buzina, grave, risco de disco, martelo, piu).

## Legenda (obrigatória)

- Fica sempre: muita gente assiste o Short **sem som**, e a legenda segura a retenção.
- `montarFala` monta **frases de até 6 palavras / 26 letras (2 linhas)** e junta blocos com menos de `LEGENDA_MIN` (1 s) na tela. Antes eram 1–3 palavras trocando a cada ~0,6 s, rápido demais para ler.
- Prefira narração a **1.05x** (1.15x deixa a leitura apertada). Confira num still se a frase quebra em 2 linhas sem sair da tela.

## A família fixa (personagens recorrentes)

- **Filho** (`tipo: "filho"`): boné azul. É o "você" dos vídeos. Skins: `casaco` (bege + cachecol), `trico` (blusa listrada), `disfarce` (óculos escuros + bigode).
- **Mãe** (`"mae"`): cabelo comprido, rosa. Desde o #02 usa `coroa`; arma = **chinelo dourado** (`Chinelo3D` na mão, brilho). Brava = `expr: "brava"`, `olhos` vermelhos.
- **Pai** (`"pai"`): bigode e barriga. Skin `social` (camisa, gravata, bermuda, meia e chinelo) + `avental`; vive no **churrasco** (`Churrasqueira3D`, dourada).
- **Avó** (`"avo"`): coque grisalho, óculos, xale lilás; **cadeira de balanço**; mima o neto, vence a mãe com "deixa o menino!".
- **Figurantes**: `tipo: "filho"` com `camisaCor`, `boneCor`, `calcaCor` (ver `FIGURANTES` em `PaiRobux3D.tsx`).
- Piadas que voltam: chinelo que nunca erra, **lavar a louça sem ela pedir**, pai no churrasco, mãe × avó. Use 1–2 por vídeo como gancho de série.

## 1. Roteiro (o que faz viralizar)

- **Interação (preferência do usuário):** Não depender de votação para continuar. Cada vídeo fecha a própria história. Estimule relatos e frases nos comentários; não prometa usar o mais votado nem espere apuração. Direção em `docs/imagina-so-direcao.md`.

- **Tema** com busca real: consulte o autocompletar do YouTube pt-BR antes com
  `python ferramentas/yt_sugestoes.py "e se a sua mãe" "se minha mãe fosse" "mãe vs"` (o `curl` com acento volta vazio no Git Bash do Windows).
  Temas com busca real ainda não feitos: série **"Se a sua mãe fosse…"** (professora, psicóloga, policial, médica, diretora, caixa de supermercado),
  "se a mãe fosse sincera", "mãe vs pai" / "mãe vs pai cozinhando" / "mãe vs pai dirigindo", "e se você pudesse parar o tempo" (+ "mãe descobriu que o tempo para"), "e se você pudesse ver 10 segundos no futuro", "e se você tivesse dinheiro infinito", "quando sua mãe te pega jogando de madrugada", "quando sua mãe pega seu celular", "coisas que toda mãe fala",
  "e se a sua força dobrasse", "e se a escola não existisse",  "e se o seu tempo de reação fosse 10 vezes mais rápido", "e se as crianças governassem o mundo".
  Nunca use personagem de outra obra (ex.: "mãe vs sukuna" é muito buscado, mas não pode).
- Pode citar Roblox/Robux no texto e no título, mas **nunca** desenhar marca, logo ou personagem real.
- Dois formatos:
  - **Família/situação** (#01, #02, #03, #05): 12–14 cenas, gancho → escalada → virada → recompensa → pergunta.
  - **Escalada DIA N** (#04): "Dia 1: …", "Dia 4: …" com número dobrando e comparação **real** em cada cena (confira as contas e diga ao usuário).
- Uma ideia por cena, 6–14 palavras; números em dígitos (`10 mil`, `4 minutos`); horários falados por extenso ("às 10 da noite") para a ElevenLabs; unidades como "por hora" depois da 1ª vez. Sem `<`/`>`.
- Cena 1 = gancho ("Imagina só se…"/"E se…"). Última = pergunta + "Comenta aí!".
- Cada cena com **uma ação visual concreta** (algo voa, cai, congela, cresce, explode, poof).
- Mostre ao usuário a tabela **fala | o que aparece na tela** e espere o ok antes de narrar (custa ElevenLabs). Se ele pedir ideias, ofereça opções e reescreva.

Salve o JSON no scratchpad (`"resolucao": "1080x1920"`, nome `Imagina So NN - <tema>`) e rode:
```bash
python ferramentas/novo_projeto.py <roteiro.json>     # imprime o id
python ferramentas/narrar.py <id-do-projeto>           # ElevenLabs (ELEVENLABS_API_KEY do .env)
# se cair com RemoteDisconnected/timeout, rode o narrar.py de novo (o projeto já existe; não recrie)
```
Confira em `projetos/<id>/projeto.json`: voz `BY2YHOQTNuJ2oMUKv3Kg`, `eleven_v4`, 0.92. Depois leia os tempos de
`remotion/public/videos/<id>/timeline.json` (cenas e palavras).

## 2. Montagem

Peças prontas em `remotion/src/imaginaso/`:

| Arquivo | O quê |
|---|---|
| `Bloco3D.tsx` | `Caixa` (toon + contorno), `Camera`, `Boneco3D` (tipos `mae/filho/pai/avo`; `expr` `feliz/brava/medo/sono`; `bracoE/D [rotX, rotZ]`, `pernaE/D`, `cabeca`, `olhosBrilho`, `boca` (fala), `segura/seguraE`, `gelo`, `pele`, `coroa`, `casaco`, `trico`, `disfarce`, `social`, `avental`, `oculos`, `barba` 0..1, `pedra` (estátua cinza), cores; `amassa` = escala [x,y,z] no grupo do ator para esticar/achatar), `Mundo3D` (pátio + casa), `Aura`, `Poeira`, `Brilhos`, `Laser`, `Chinelo3D`, `Controle3D`, `Tigela3D`, `Coracao3D`, `Pia3D`, `tremor` |
| `Objetos3D.tsx` | `Trono3D`, `Relogio3D` (h decimal), `Brocolis3D`, `Cadeado3D`, `Lupa3D`, `Livro3D`, `Moeda3D`, `Poof3D`, `Porquinho3D`, `Pergaminho3D`, `Churrasqueira3D` (dourada), `Trofeu3D`, `Explosao3D`, `Holofote3D`, `Sofa3D`, `Espeto3D`, `CadeiraBalanco3D`, `Bolo3D` (inteiro/fatia), `Monstro3D` (cobertor), `Xicara3D`, `TV3D`, `Nota3D`, `Celular3D`, `Casaco3D`, `Lousa3D` (cheia, ✓), `Robo3D`, `Cachorro3D` (fala), `Portal3D`, `Lampada3D`, `Lapis3D`, `Mesa3D`, `Caderno3D`, `Spray3D`, `Botao3D`, `Mochila3D`, `Tradutor3D`, `FoguetePapelao3D`, `Bandeja3D`, `Esfregao3D`, `Balde3D`, `Marmita3D`, `Salgadinho3D`, `Martelo3D`, `Passaro3D` (voando), `Teia3D`, `WifiIcone3D` (`quebra` 0..1), `Roteador3D` (luzes; `morto`), `Antena3D`, `Jornal3D`, `Foto3D`, `Sanduiche3D` |
| `Cenarios3D.tsx` | `Rua3D` (mundo que corre com `desloc`, janelas quebráveis), `Nuvens3D`, `Onibus3D`, `Guepardo3D`, `CarroCorrida3D`, `Aviao3D`, `Estrelas3D`, `Terra3D`, `Lua3D`, `Riscos3D` (velocidade da luz), `ConeSom3D`, `Anel3D`, `Rastro3D`, `Cacos3D`, `Dinossauro3D` (T-rex, frente +z; `boca`, `andando`, `pisao`), `PescocoLongo3D` (frente +x, costas planas y≈3.5 para passageiros), `Raptor3D`, `Pterodatilo3D`, `Asteroide3D`, `Escola3D`, `Piscina3D`, `Onda3D`, `CarroFamilia3D` (vidros transparentes, só o banco do motorista na frente; motorista x 0.75 z −0.5, banco de trás x −1.0 z 0.5; `janela`), `Mercado3D` |
| `Floresta3D.tsx` | `Floresta3D`, `ArvoreFloresta3D`, `Fogueira3D`, `Lanterna3D`, `FeixeLanterna3D`, `PortaoMadeira3D`, `BancoTronco3D` |
| `Sobrevivencia3D.tsx` | `Machado3D`, `Lenha3D`, `Tenda3D`, `AcampamentoGameplay3D`, `GalhosCoroa3D`, `CavernaResgate3D` |
| `Camada2D.tsx` | `montarFala(tl, {vel, inicio})` → `S[k]` (início da cena), `W(k, "palavra", n)` (instante da palavra, sem acento/pontuação), `Legenda3D`, `Faixa3D` (banners), `Balao3D` (digitado), `Sobe3D`, `Flash`, `Marca3D` |

Passos:
1. Copie o vídeo publicado mais parecido (tabela acima) para `<Nome>3D.tsx`; troque o import da timeline, `PASTA` e o nome do export.
2. `montarFala(tl, { vel: 1.05, inicio: 0.35 })` (1.0 se o usuário quiser ~1 min). Marcos com `W(k, "palavra")`.
3. `estado(t)` por cena (`cenaDe(t)`): câmera, atores (`{ tipo, a: Ator }`), objetos, `noite`/`escuro`.
   - **corte a cada ~1–1,5 s** (troca de plano numa palavra-chave);
   - quadro 0: objeto voando na câmera + flash + tremor; fim: algo vindo na câmera (loop com o começo);
   - painéis 2D (contadores, placar, chat, player de áudio) como componentes locais no arquivo do vídeo.
4. `BANNERS` (y 230–560; 60–130 px), `SONS` (sfx em `public/sfx/`: whoosh, impacto, aura, plim, pop, erro, contagem, tecla, freio, buzina, grave, risco, martelo, piu; `musica.wav` em loop a 0.14). Sons novos → `ferramentas/gerar_sfx.py` (síntese numpy) e rodar.
5. Registre em `remotion/src/Root.tsx`: import + `<Composition id="imagina-so-NN-3d" … durationInFrames={Math.round(DUR * 30)} />`.
6. Peça nova (objeto/cenário/personagem): acrescente em `Objetos3D.tsx`/`Cenarios3D.tsx`/`Boneco3D` com a paleta `C3`, contorno da `Caixa` e sem marcas — nunca duplique dentro do arquivo do vídeo.

Convenções e armadilhas (todas já aconteceram):
- Braço erguido/à frente: `rotX` **negativo** (−2.6 erguido, −1.3 à frente); para fora: esquerdo `rotZ` negativo, direito positivo; braços cruzados: `bracoE [-1.45, 0.95]`, `bracoD [-1.45, -0.95]`.
- Sentado: `pernaE/D = -PI/2` e o ator em y ≈ 0.17–0.22 sobre trono/cadeira/sofá.
- Deitado de barriga para cima: `rot: [-PI/2, 0, 0]`. Voando de super-herói para +x: `rotY: PI/2` + `rot: [0, 0, -PI/2]` — o corpo fica à **direita** dos pés (centro ≈ x + 1.5): mire a câmera ali.
- Objeto na mão gira junto com o braço: compense com `rot` (ex.: braço −1.3 → objeto `rot [1.3, 0, 0]`).
- O HUD/banners ocupam o terço de cima da tela: mire a câmera **mais alto** (alvo y ≈ 2.2–2.6) e afaste (8–12 unidades para dois personagens; a largura visível é ~0,47 × a distância).
- Câmera não pode atravessar objetos (TV, grelha na frente do rosto): suba ou desloque a câmera.
- Luz pontual forte lava o rosto: aura `intensity` ≤ 1.2. Olhos vermelhos (`olhos`) leem como **vilão** — use só para brava/chefe; empolgação = `Brilhos`.
- Texto amarelo sobre fundo amarelo some: contorno (`WebkitTextStroke`).

## 3. Conferir (obrigatório olhar as imagens)

```bash
cd remotion && node node_modules/typescript/bin/tsc -p .
node node_modules/@remotion/cli/remotion-cli.js render src/index.ts imagina-so-NN-3d jobs/<id>/rascunho.mp4 --gl=angle --scale=0.4 --muted
```
Monte a grade de conferência (2 quadros por cena, 40% e 88%), **na raiz do projeto**:
```bash
python ferramentas/imagina_so_grade.py <id-do-projeto> remotion/jobs/<id>/rascunho.mp4 <vel>
```
Ele imprime "quadro → cena" e salva `grade0.png`, `grade1.png`… ao lado do rascunho. **Abra os PNGs e olhe**
(no Codex, anexe/abra as imagens; se não conseguir ver imagens, peça ao usuário para conferir as grades antes do render final).
Na grade, procure:
personagem cortado, câmera perto/dentro de objeto, objeto escondido atrás da casa, legenda estourando,
rosto lavado de luz. Ajuste e confira só o trecho (`--frames=a-b` ou `still … --frame=N --scale=0.4`).

Render final (sempre `--gl=angle` por causa do three.js):
```bash
node node_modules/@remotion/cli/remotion-cli.js render src/index.ts imagina-so-NN-3d out/imagina-so-NN-3d.mp4 --gl=angle
```
Obs.: o `npm` do PATH está quebrado; para instalar pacotes use
`node "/c/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" i ...`.

## 4. Entregar

- Copiar para `exportacoes/imagina-so/imagina-so-NN-<tema>-3d.mp4` (pasta fora do git) e escrever
  `exportacoes/imagina-so/imagina-so-NN-youtube.txt`: TÍTULO `E se … 😱 Imagina só #shorts` (frase exata do
  autocompletar quando existir), DESCRIÇÃO (resumo + "💬 … Comenta aí!" + "🔔 Inscreva-se no Imagina Só…" + hashtags),
  TAGS (buscas reais do autocompletar). Nunca `<` ou `>`.
- Ao refazer um vídeo já exportado, salve como `…-v2.mp4` (não apague a v1) e diga ao usuário qual publicar.
- Atualize a tabela de vídeos desta skill **e** a cópia (`.claude/skills/imagina-so/SKILL.md` ↔ `.agents/skills/imagina-so/SKILL.md`; a do Codex só troca `CLAUDE.md` por `AGENTS.md`).
- Responder com o caminho do vídeo e o texto do YouTube pronto para copiar.
- Não commitar nem publicar sem o usuário pedir.
