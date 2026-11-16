---
name: rpg-code
description: Gera um episódio da série RPG Code (C# na Unity 6, Shorts 9:16 em pixel art 16-bit com o herói Artur) no VSCreatorApp — roteiro, narração ElevenLabs, montagem Remotion e texto do YouTube. Use quando o usuário chamar /rpg-code ou pedir um episódio do RPG Code passando o número do episódio ou uma descrição.
argument-hint: "<número do episódio (ex.: 10) ou descrição>"
---

# Episódio RPG Code

Projeto: `D:/Nova pasta/VSCreatorApp`. Responder em português. Pedido do usuário: **$ARGUMENTS**

Antes de tudo, leia `docs/rpg-code-roteiro.md` (ponto de retomada, regras, temporadas) e o
`CLAUDE.md`. Não altere os estilos Dev Sobrevivente nem Mundo Pixelândia.

## 1. Qual episódio

- **Número** (ex.: `10`): use a linha desse EP na tabela da temporada (acontecimento, conceito,
  código central, gancho).
- **Vazio ou "próximo"**: o episódio indicado no **ponto de retomada**.
- **Descrição**: ache o EP da tabela que corresponde; se for um tema fora da tabela, encaixe como
  episódio extra mantendo a história do Artur e avise o usuário.
- Confira que o episódio anterior já existe (`remotion/src/rpg/EpNN*.tsx`); se faltar, avise.

## 2. Roteiro (regras da série)

- **11 cenas, ~45 s.** Cena 1 lembra o episódio anterior em uma frase. Penúltima resume o conceito.
  Última faz a pergunta que o próximo episódio responde (o "Gancho" da tabela).
- Um conceito por episódio; código Unity 6 real em até 8 linhas curtas
  (Input System novo, `Rigidbody2D.linearVelocity`).
- Fala com 6–18 palavras por cena; escreva "C sharp" no `texto`, nunca "C#".
- Formato de `ferramentas/novo_projeto.py` com `"resolucao": "1080x1920"`. Salve no scratchpad e rode:
```bash
python ferramentas/novo_projeto.py <roteiro.json>
python ferramentas/narrar.py <id-do-projeto>
```
A narração usa a voz do usuário (`BY2YHOQTNuJ2oMUKv3Kg`, `eleven_v4`, velocidade 0.92), herdada do
projeto anterior. Confira em `projetos/<id>/projeto.json` antes de narrar.

## 3. Montagem

- Copie o episódio anterior (`remotion/src/rpg/EpNN<Nome>.tsx`) como base e use o kit `remotion/src/rpg/Kit.tsx`.
- Registre em `remotion/src/videos/index.ts` como `rpg-code-NN` (import da timeline + linha em `VIDEOS`).
- `cd remotion && node node_modules/typescript/bin/tsc -p .` e stills das cenas com código em `remotion/jobs/rpg-code-NN/`.
- Render: `cd remotion && node node_modules/@remotion/cli/remotion-cli.js render src/index.ts rpg-code-NN out/rpg-code-NN.mp4`.

## 4. Entregar

- Copiar o MP4 para `exportacoes/rpg-code-NN/` e escrever `youtube.txt` no mesmo formato do episódio
  anterior (TÍTULO `… | RPG Code #NN #shorts`, DESCRIÇÃO com ◀ anterior / ▶ próximo, TAGS).
- Atualizar o **ponto de retomada** e a lista de publicados em `docs/rpg-code-roteiro.md`.
- Responder com o caminho do vídeo e o texto do YouTube pronto para copiar.
- Não commitar nem publicar sem o usuário pedir.
