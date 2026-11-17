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

Criar `projetos/mundo-pixelandia-NN/plano.json` (exemplo completo e mais recente: `projetos/mundo-pixelandia-03/plano.json`).
Duração: **até 2 min** (Shorts aceitam 3 min); não encurtar só para caber em 60 s.
- Cena 1 = gancho (até 3 s) com `📺 Mundo Pixelândia #NN`.
- Boas-vindas aos novos **um por um** (`seguir: "Nome"` — aceita o nome; com nome repetido vale o mais novo), ~2,5 s cada,
  com uma piada quando houver gancho no elenco (ver "Fios abertos" em `docs/pixelandia-roteiro.md`).
- Um acontecimento por episódio; contador da meta (30 parque, 50 estátua, 100 farol...).
- CTA em faixa vermelha (`"cta": true`): "Comente NOME + PROFISSÃO" e "Curta e se inscreva".
- Terminar com uma cena curta de gancho de mistério ("descubra no #NN+1").
- Legenda: `"linha de cima\nfaixa em destaque"`. Câmeras: `abertura`, `estrada`, `multidao`, `obras`,
  `vazio`, `final` ou `seguir`; extras: `hora`, `sair`, `durante`, `clima` (`misterio`, `vitoria`, `ameaca`),
  `estatua: "Nome"` (ergue uma estátua pronta perto da praça e mira a câmera nela). Morador parado/discursando:
  `durante` com `n.plan=[work(9,'speech',...)]` (ver cena `samuel` do #3). Clarão no céu: `durante` com `firework(cam.x+..., cam.y-...)`.
- Novos moradores em `projetos/mundo-pixelandia-NN/novos.json` (`[{"nome","prof","sexo","custom"}]`; profissão fora do
  jogo → a mais parecida em `prof` e a real em `custom`; ver tabela do elenco no roteiro).

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

**Narração** (padrão desde o #3, com a voz do usuário): `fala` = uma frase por legenda em cada cena, depois
```bash
python ferramentas/pixelandia/voz.py preparar NN
python ferramentas/narrar.py mundo-pixelandia-NN-voz
python ferramentas/pixelandia/voz.py tempos NN
```
e só então filmar (as cenas ficam com a duração da fala). Nomes difíceis: escrever como se fala só na
`fala` ("Z-Hero", "Stén", "Jéfin Gomes"); a legenda mantém o nome real.

## 4. Entregar

- Verificar o MP4 (duração, áudio, quadros) e enviar o arquivo ao usuário.
- Dar **título** (`Mundo Pixelândia #NN: … #shorts`), **descrição** (resumo, chamada para comentar,
  gancho, ◀ episódio anterior, hashtags) e **tags**.
- Atualizar o ponto de retomada e marcar ✅ o episódio em `docs/pixelandia-roteiro.md`.
- Não commitar nem publicar sem o usuário pedir.
