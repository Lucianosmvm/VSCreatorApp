---
name: imagina-so
description: Gera um Short do canal Imagina Só (@imaginasoh) — "Imagina só se…/E se…" em 3D de bloco (bonecos de cubo com contorno, câmera dinâmica, gancho no 1º segundo, loop) no VSCreatorApp — roteiro viral, narração ElevenLabs, montagem Remotion + three.js e texto do YouTube com SEO. Use quando o usuário chamar /imagina-so ou pedir um Short do Imagina Só / "estilo bloco 3D" passando um tema ("e se o seu pai te desse 10 mil Robux").
argument-hint: "<tema: 'e se…' ou situação hipotética>"
---

# Short Imagina Só (3D de bloco)

Projeto: `D:/Nova pasta/VSCreatorApp`. Responder em português. Pedido do usuário: **$ARGUMENTS**

Leia o `CLAUDE.md`. Referência pronta (copiar como base): `remotion/src/imaginaso/MaeRpg3D.tsx`
(Short #01, a mãe RPG). Não altere os outros estilos (Dev Sobrevivente, RPG Code, Pixelândia, Refúgio 13).

## 1. Roteiro (o que faz viralizar)

- **Tema** que a criança/adolescente brasileiro vive: mãe, pai, escola, irmão, Robux, Free Fire, Wi-Fi.
  Pode citar Roblox/Robux no texto e no título, mas **nunca** desenhar marca ou personagem real.
- **11–12 cenas, ~40–45 s narrados** (com 1.15x vira ~35–39 s). Uma ideia por cena, 6–14 palavras.
- **Cena 1 = gancho**: "Imagina só se…" + o absurdo em uma frase.
- **Escalada**: cada cena mais absurda; uma cena de **virada** perto do fim (chefe final, consequência).
- **Penúltima**: recompensa/solução engraçada. **Última**: pergunta que puxa comentário
  ("E o seu pai, o que faria? Comenta aí!").
- Números como dígitos (`99`, `100%`, `10 mil`). Sem "C#"/sinais `<`/`>`.
- Cada cena precisa de **uma ação visual concreta** (algo voa, cai, congela, cresce, explode) —
  anote a ação ao lado da fala antes de narrar.
- Mostre o roteiro + ações ao usuário e espere o ok antes de narrar (custa ElevenLabs).

Formato de `ferramentas/novo_projeto.py` com `"resolucao": "1080x1920"` e nome `Imagina So NN - <tema>`:
```bash
python ferramentas/novo_projeto.py <roteiro.json>
python ferramentas/narrar.py <id-do-projeto>
```
Voz do usuário (`BY2YHOQTNuJ2oMUKv3Kg`, `eleven_v4`, 0.92) herdada do projeto anterior; a montagem
acelera para **1.15x** (`montarFala(tl, { vel: 1.15, inicio: 0.35 })`), sem nova narração.

## 2. Montagem

Peças em `remotion/src/imaginaso/`:

| Arquivo | O quê |
|---|---|
| `Bloco3D.tsx` | Kit 3D: `Caixa` (toon + contorno), `Camera`, `Boneco3D` (`mae`/`filho`, expr `feliz/brava/medo`, `bracoE/D [rotX, rotZ]`, `cabeca`, `olhosBrilho`, `segura/seguraE`, `gelo`, `pele`, `boca`), `Mundo3D` (pátio, casa, árvore, nuvens, sol), `Aura`, `Poeira`, `Brilhos`, `Laser`, `Chinelo3D`, `Controle3D`, `Tigela3D`, `Coracao3D`, `Pia3D`, `tremor` |
| `Camada2D.tsx` | `montarFala` (S[k] início da cena, `W(k, "palavra", n)` instante da palavra), `Legenda3D` (blocos de até 3 palavras, palavra falada em amarelo), `Faixa3D`, `Balao3D`, `Sobe3D`, `Flash`, `Marca3D` |
| `MaeRpg3D.tsx` | Vídeo completo de referência: `estado(t)` por cena → câmera, atores, objetos; `BANNERS`, painéis, `SONS` |

Passos:
1. Copie `MaeRpg3D.tsx` para `remotion/src/imaginaso/<Nome>3D.tsx`, troque o import da timeline e `PASTA`.
2. Reescreva os marcos (`W(k, "palavra")`) e o `estado(t)` cena a cena:
   - **corte a cada ~1–1,5 s** (troca de plano dentro da cena em palavras-chave);
   - abra o vídeo com objeto voando na câmera + flash + tremor no quadro 0;
   - termine com algo vindo na câmera (casando com o começo = loop).
   Personagens novos: estenda `Boneco3D` (novo `tipo` com cores/cabelo/acessório) e objetos novos
   como funções de `Caixa` no `Bloco3D.tsx` (paleta `C3`, sem marcas).
3. `BANNERS` (faixas de 60–130 px no topo, y 230–560), `SONS` (sfx em `public/sfx/`: whoosh, impacto,
   aura, plim, pop, erro, contagem, tecla; música `musica.wav` em loop a 0.14). Sons novos: adicionar
   em `ferramentas/gerar_sfx.py` (síntese numpy) e rodar.
4. Registrar em `remotion/src/Root.tsx` como `<Composition id="imagina-so-NN-3d" … durationInFrames={Math.round(DUR * 30)} />`.

Convenções do boneco (fácil errar):
- Braço para cima/frente: `rotX` **negativo** (−2.6 = erguido); para fora: esquerdo `rotZ` negativo, direito positivo.
- Cabeça olha para cima com `cabeca[0]` negativo; `rotY` 0 = de frente para +z (câmera).
- Deitado de barriga para cima: `rot: [-PI/2, 0, 0]` no grupo do ator.
- Tela em pé (fov vertical 50): a largura visível é só ~0,47 × a distância — enquadre dois
  personagens a ≥ 8 unidades de distância.
- Luz pontual forte lava o rosto de amarelo: aura com `intensity` ≤ 1.2.

## 3. Conferir

```bash
cd remotion && node node_modules/typescript/bin/tsc -p .
node node_modules/@remotion/cli/remotion-cli.js render src/index.ts imagina-so-NN-3d jobs/<id>/rascunho.mp4 --gl=angle --scale=0.4 --muted
```
Extraia 2 quadros por cena com `ffmpeg -vf "select=eq(n\,N)"`, junte numa grade (PIL) e olhe:
personagem cortado, câmera dentro de objeto, objeto escondido atrás da casa, legenda estourando,
texto amarelo sobre fundo amarelo. Ajuste e rerenderize só o trecho (`--frames=a-b`).

Render final (sempre `--gl=angle` por causa do three.js):
```bash
node node_modules/@remotion/cli/remotion-cli.js render src/index.ts imagina-so-NN-3d out/imagina-so-NN-3d.mp4 --gl=angle
```
Obs.: o `npm` do PATH está quebrado; para instalar pacotes use
`node "/c/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" i ...`.

## 4. Entregar

- Copiar para `exportacoes/imagina-so/imagina-so-NN-<tema>-3d.mp4` e escrever
  `exportacoes/imagina-so/imagina-so-NN-youtube.txt` (TÍTULO `Imagina só se … 😱 #shorts`,
  DESCRIÇÃO, TAGS) com SEO pelo autocompletar do YouTube pt-BR (ver memória youtube-seo) e sem `<`/`>`.
- Responder com o caminho do vídeo e o texto do YouTube pronto para copiar.
- Não commitar nem publicar sem o usuário pedir.
