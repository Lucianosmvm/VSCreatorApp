---
name: mundo-pixelandia
description: Gera um episódio da série Mundo Pixelândia (vila pixel art onde cada inscrito vira morador) no VSCreatorApp — filma a vila salva rodando o jogo, monta Short 9:16 com legendas de impacto no Remotion e, se pedido, narra com a voz do usuário na ElevenLabs. Use quando o usuário chamar /mundo-pixelandia ou pedir um vídeo/episódio da vila passando o número do episódio, novos moradores ou uma descrição.
argument-hint: "<número do episódio, novos moradores (nome + profissão) ou descrição> [com narração]"
---

# Episódio Mundo Pixelândia

Projeto: `D:/Nova pasta/VSCreatorApp`. Jogo: `D:/Nova pasta/mundo-pixelandia/index.html`.
Responder em português. Pedido do usuário: **$ARGUMENTS**

Antes de tudo, leia `docs/pixelandia-roteiro.md` (elenco, regras, temporadas e **ponto de retomada**)
e `docs/estilo-pixelandia.md` (comandos). Não altere os estilos Dev Sobrevivente nem RPG Code.
Não prepare recursos do filmador com antecedência: ajuste `ferramentas/pixelandia/filmar.mjs` só no
que o episódio pedido precisar (noite, evento, prefeito, votação...).

## 1. Qual episódio

- **Número** (ex.: `3`): a linha desse EP na tabela da temporada.
- **Vazio ou "próximo"**: o indicado no ponto de retomada.
- **Nomes + profissões**: são os novos moradores; entram neste episódio (boas-vindas).
- **Backup JSON** da vila do usuário: usar como `--vila` no lugar do estado salvo.
- Sem novos moradores? Transformar a falta em história e reforçar a chamada (como no EP. 02).

## 2. Plano do episódio

Criar `projetos/mundo-pixelandia-NN/plano.json` (exemplo completo: `projetos/mundo-pixelandia-02/plano.json`):
- Cena 1 = gancho (até 3 s) com `📺 Mundo Pixelândia #NN`.
- Boas-vindas aos novos (`seguir: <id>`, 2–2,5 s cada; mais de 8 → grupos de 4).
- Um acontecimento por episódio; contador da meta (30 parque, 50 estátua, 100 farol...).
- CTA em faixa vermelha (`"cta": true`): "Comente NOME + PROFISSÃO" e "no #NN+1 você pode aparecer".
- Terminar com o gancho do próximo episódio (tabela do roteiro).
- Legenda: `"linha de cima\nfaixa em destaque"`. Câmeras: `abertura`, `estrada`, `multidao`, `obras`,
  `vazio`, `final` ou `seguir`; extras: `hora`, `sair`, `durante`, `clima` (`misterio`, `vitoria`, `ameaca`).
- Novos moradores em `novos.json` (`[{"nome","prof","sexo"}]`; profissão fora da lista → `"custom"`).

## 3. Filmar e montar

```bash
node ferramentas/pixelandia/filmar.mjs --id mundo-pixelandia-NN --episodio NN \
  --vila projetos/<episódio anterior>/vila.json --novos-json novos.json --novos 0 \
  --avancar 200 --plano projetos/mundo-pixelandia-NN/plano.json
```
Conferir stills em `remotion/jobs/mundo-pixelandia-NN/` (morador em destaque visível, fora de prédios,
de dia salvo se a cena for noturna), depois:
```bash
cd remotion && node node_modules/typescript/bin/tsc -p .
cd remotion && node node_modules/@remotion/cli/remotion-cli.js render src/index.ts mundo-pixelandia-NN out/mundo-pixelandia-NN.mp4
```

**Com narração** (só se o usuário pedir): seguir "Com narração" em `docs/estilo-pixelandia.md` —
`fala` por legenda no plano, `projetos/mundo-pixelandia-NN-voz/projeto.json` com voz
`BY2YHOQTNuJ2oMUKv3Kg`, `eleven_v4`, velocidade `0.92`, `python ferramentas/narrar.py`, copiar
`dur`/`audio`/`tempos` para o plano e refilmar. Nomes difíceis: escrever como se fala só na `fala`
(ex.: "Z-Hero"), a legenda mantém o nome real.

## 4. Entregar

- Verificar o MP4 (duração, áudio, quadros) e enviar o arquivo ao usuário.
- Dar **título** (`Mundo Pixelândia #NN: … #shorts`), **descrição** (resumo, chamada para comentar,
  gancho, ◀ episódio anterior, hashtags) e **tags**.
- Atualizar o ponto de retomada e marcar ✅ o episódio em `docs/pixelandia-roteiro.md`.
- Não commitar nem publicar sem o usuário pedir.
