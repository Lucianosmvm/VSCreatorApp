# Estilo "Mundo Pixelândia"

Shorts 9:16 da vila pixel art do jogo **Mundo Pixelândia** (`D:/Nova pasta/mundo-pixelandia`).
Não usa narração nem mascote: as cenas são filmadas do próprio jogo e o Remotion põe
legendas de impacto por cima (frase branca com contorno e faixa amarela, faixa vermelha
no convite final), clima por cena (mistério, vitória, ameaça), selo `#N` e efeitos sonoros.
Não mexe nos estilos Dev Sobrevivente nem RPG Code.

## Peças

| Arquivo | O quê |
|---|---|
| `ferramentas/pixelandia/filmar.mjs` | Abre o jogo no Chrome headless, cria ou carrega a vila, avança a simulação, filma 6 tomadas e escreve `video.json` |
| `remotion/src/pixelandia/Pixelandia.tsx` | Composição: vídeo da cena, legenda, clima, selo e sons |
| `remotion/src/pixelandia/registro.ts` | Gerado pelo filmador; o `Root.tsx` registra uma composição por vídeo |
| `projetos/<id>/vila.json` | Estado da vila depois do episódio (base do próximo) |
| `projetos/<id>/roteiro.json` | Legendas usadas (só para conferência) |

## Episódio novo (vila nova)

```bash
node ferramentas/pixelandia/filmar.mjs --id mundo-pixelandia-01 --novos 40
cd remotion && node node_modules/@remotion/cli/remotion-cli.js render src/index.ts mundo-pixelandia-01 out/mundo-pixelandia-01.mp4
```

## Continuação (próximo episódio)

O usuário passa os novos inscritos (nome + profissão). Salvar em `novos.json`:

```json
[{"nome": "Lucas", "prof": "pedreiro", "sexo": "m"}, {"nome": "Mari", "prof": "padeiro", "sexo": "f"}]
```

Profissões válidas: as chaves de `PROF` no jogo (`lenhador`, `pedreiro`, `pescador`, `fazendeiro`,
`minerador`, `cozinheiro`, `policial`, `comerciante`, `medico`, `professor`, `padeiro`, `ferreiro`...).
Outra profissão: `"prof": "pedreiro", "custom": "Astronauta"`.

```bash
node ferramentas/pixelandia/filmar.mjs --id mundo-pixelandia-02 --vila projetos/mundo-pixelandia-01/vila.json --novos-json novos.json --episodio 2
```

Os textos das legendas saem de `roteiro()` em `filmar.mjs` com os números da vila
(moradores, obras prontas, fila, um morador em destaque). Para outro tipo de episódio
(boas-vindas dos novos, evento, votação), ajuste `roteiro()` e as tomadas em `cenas`.

## Conferir

```bash
cd remotion && node node_modules/typescript/bin/tsc -p .
cd remotion && node node_modules/@remotion/cli/remotion-cli.js still src/index.ts <id> jobs/<id>/q.png --frame=<n>
```

Prévias e quadros em `remotion/jobs/<id>/`; vídeo final em `remotion/out/<id>.mp4`.

## Série

Roteiro, elenco e ponto de retomada: `docs/pixelandia-roteiro.md` (consultar antes de cada episódio e atualizar depois).

## Com narração (padrão desde o #3)

Escrever `fala` (uma frase por legenda) em cada cena do `plano.json` e rodar:

```bash
python ferramentas/pixelandia/voz.py preparar NN      # cria projetos/mundo-pixelandia-NN-voz (voz BY2YHOQTNuJ2oMUKv3Kg, eleven_v4, 0.92)
python ferramentas/narrar.py mundo-pixelandia-NN-voz  # ElevenLabs
python ferramentas/pixelandia/voz.py tempos NN        # copia dur, audio e tempos de cada legenda para o plano
```

Depois filmar e renderizar. Exemplo: `projetos/mundo-pixelandia-03/plano.json`.

## Extras do plano

- `seguir: "Nome"` (ou id): câmera acompanha o morador; nome repetido → o mais novo.
- `estatua: "Nome"`: ergue uma estátua pronta perto da praça e mira a câmera nela.
- `hora: 23.5`: madrugada (as cenas seguintes continuam à noite).
- `durante: {t, js}`: efeito no meio da cena (fogos `firework(x,y)`, discurso `work(9,'speech',...)`).
