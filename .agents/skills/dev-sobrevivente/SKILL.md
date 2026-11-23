---
name: dev-sobrevivente
description: Gera um vídeo do canal Dev Sobrevivente (programação e informática) no VSCreatorApp — vídeo longo 16:9 + Short 9:16, 3D isométrico no EffectCraft montado com mascote, legendas e narração ElevenLabs. Use quando o usuário chamar /dev-sobrevivente ou pedir um vídeo do Dev Sobrevivente passando um tema ou o número da semana do roteiro do canal.
argument-hint: "<tema do vídeo ou número da semana do roteiro>"
---

# Vídeo Dev Sobrevivente

Projeto: `D:/Nova pasta/VSCreatorApp`. Responder em português. Pedido do usuário: **$ARGUMENTS**

Antes de tudo, leia no projeto: `AGENTS.md`, `AGENTS.md` (estilo visual atual),
`docs/roteiro-canal.md` (séries e estrutura) e `docs/estilo-ti-ninja.md` (plano `cenas-ec.json`).
Não altere os estilos RPG Code nem Mundo Pixelândia.

## 1. Entender o pedido

- **Número** (ex.: `5`): é a semana em `docs/roteiro-canal.md` → use título, gancho, Short e estilo dessa linha.
- **Texto**: é o tema. Encaixe na série mais próxima do roteiro do canal, se houver.
- Ambíguo (tema muito amplo, não dá para saber o formato)? Pergunte uma vez e siga.

## 2. Roteiro

Siga "Estrutura de cada longo" do `docs/roteiro-canal.md` (gancho com caso real → promessa →
2–3 capítulos numerados → erros comuns ✗/✓ → resumo e CTA) e as "Regras do roteiro" do `AGENTS.md`:
- Longo: ~55–66 cenas, ~4.700 caracteres, `"resolucao": "1920x1080"`.
- Short: roteiro próprio, ~17 cenas, ~900 caracteres, `"resolucao": "1080x1920"`, uma ideia só e CTA para o longo.
- Escreva "C sharp" (nunca "C#") no `texto` falado; números em dígitos.

Salve cada roteiro em JSON no scratchpad e crie os projetos:
```bash
python ferramentas/novo_projeto.py <roteiro.json>
```

## 3. Narração (voz do usuário)

```bash
python ferramentas/narrar.py <id-do-projeto>
```
Usa a chave do `.env`, a voz e o modelo `eleven_v4` herdados do projeto. Gera
`remotion/public/videos/<id>/timeline.json`. Gasta créditos da ElevenLabs: narre só depois do roteiro fechado.

## 4. Montagem (estilo atual: 3D isométrico)

- Plano visual em `projetos/<id>/cenas-ec.json` (modelos em `docs/estilo-ti-ninja.md`; cenas `rede3d`
  isométricas como em `ferramentas/effectcraft/prototipo-rede.mjs`).
- Conferir: `node ferramentas/effectcraft/montar-video.mjs <id> --stills` e olhar `exportacoes/<id>/stills/`.
- Renderizar: `node ferramentas/effectcraft/montar-video.mjs <id>` (longo) e `... <id-short> --short`.
- Mascote, legendas e narração seguem o fluxo "Montar o vídeo" do `AGENTS.md` quando a cena for Remotion.
- Gravar `remotion/public/videos/<id>/composicoes.json` e gerar os clipes dos cards (`node cenas.mjs`).

## 5. Entregar

- Verificar os MP4 finais (duração, áudio, alguns quadros) antes de anunciar.
- Escrever `exportacoes/<id>/youtube.txt` com **TÍTULO**, **DESCRIÇÃO** (capítulos, fontes oficiais,
  ◀ anterior / ▶ próximo, hashtags) e **TAGS**, para o longo e para o Short.
- Responder com os caminhos dos vídeos e o texto do YouTube pronto para copiar.
- Não commitar nem publicar sem o usuário pedir.
