---
name: refugio-13
description: Gera um episódio da série Refúgio 13 (sobrevivência zumbi interativa em pixel art vista de cima, Short 9:16 com votação A/B) no VSCreatorApp — roteiro com a apuração do voto anterior, filmagem do mundo Canvas próprio da série, prévia visual, narração ElevenLabs depois da aprovação e texto do YouTube. Use quando o usuário chamar /refugio-13 ou pedir um episódio/dia do Refúgio 13 passando o número, o resultado da votação, novos sobreviventes ou uma descrição.
argument-hint: "<número do dia/episódio> [resultado da votação: A=n B=n] [novos: Apelido | habilidade | voto]"
---

# Episódio Refúgio 13

Projeto: `D:/Nova pasta/VSCreatorApp`. Responder em português. Pedido do usuário: **$ARGUMENTS**

Antes de tudo, leia:
- `docs/refugio-13-continuidade.md` — **ponto de retomada**, elenco, estado e regras de encenação;
- `.agents/skills/refugio-13/references/serie.md` — universo, participação, regras da votação e roteiro de cada dia;
- `docs/refugio-13-estilo-producao.md` — direção visual;
- `ferramentas/refugio-13/README.md` — comandos do filmador.

Universo próprio: **não misturar com Mundo Pixelândia** (mapa, elenco, estado e motor são da série;
o motor é uma cópia em `ferramentas/refugio-13/mundo/index.html`). Não alterar Dev Sobrevivente,
RPG Code nem Mundo Pixelândia.

## 1. Qual episódio

- **Número** (`3`, `03`): esse dia. **Vazio ou "próximo"**: o indicado no ponto de retomada.
- Use o estado do episódio imediatamente anterior (`projetos/refugio-13-NN/estado.json` e `mundo.json`).
  Se faltar um capítulo no meio, diga qual falta; não invente o resultado de episódios que não existem.
- **Votação:** precisa da apuração do episódio anterior (A × B). Se o usuário não passou, **pergunte**.
  Zero votos ou empate confirmado: a liderança do abrigo decide pela necessidade imediata, e o roteiro
  diz que foi decisão dos personagens. Nunca reaplicar automaticamente um voto antigo.
- **Novos sobreviventes** (`Apelido | habilidade | voto`): entram no elenco com uma ação em que a habilidade conta.

## 2. Roteiro e plano

Criar `projetos/refugio-13-NN/plano.json` (exemplo: `projetos/refugio-13-02/plano.json`), até 3 min:
- **Abertura** com a consequência do voto anterior (resultado na tela).
- **Um acontecimento principal**; papel para quem entrou no elenco.
- Infectados no caminho sempre provocam **reação visível** (desvio, bloqueio, combate ou fuga) e consequência;
  nunca atravessar um infectado.
- Nomes só em tags sobre a cabeça, sem linhas e sem sobreposição.
- **Final:** decisão **A/B** com custo claro nas duas opções + "Vote A ou B. Quer entrar no abrigo?
  Comente apelido + habilidade + voto." e curta/inscreva-se.
- Atualizar `estado.json` (dia, elenco, suprimentos, escolha pendente, fonte da apuração).

## 3. Filmar e prévia (sem narração)

O `filmar.mjs` foi escrito para o EP02: adapte só o que este episódio precisar (plano, estado de origem,
ações novas). Depois:
```bash
node ferramentas/refugio-13/filmar.mjs --conferir
node ferramentas/refugio-13/filmar.mjs --validar-tags
node ferramentas/refugio-13/filmar.mjs --validar-estado
node ferramentas/refugio-13/filmar.mjs
```
Montagem em `remotion/src/refugio/RefugioFilmado.tsx`. Conferir quadros em `remotion/jobs/refugio-13-NN/`,
renderizar a prévia e **enviar ao usuário. Aguardar aprovação antes de gastar ElevenLabs.**

## 4. Narração e render final

Depois da aprovação: mesma voz/modelo/velocidade do EP01 (registrados no plano do EP02), projeto de voz
`projetos/refugio-13-NN-voz` + `python ferramentas/narrar.py refugio-13-NN-voz`. Reaproveitar áudio quando a
fala não mudou. Sincronizar as cenas com a duração real da fala, refilmar só cenas alteradas
(`--cenas=3,10`) e exportar `remotion/out/refugio-13-NN.mp4`. Verificar duração, áudio e quadros.

## 5. Entregar

- Enviar o MP4, **título**, **descrição** (resumo, opções A/B, chamada para entrar no elenco, ◀ episódio
  anterior, hashtags; sem os sinais de maior e menor), **tags** e o **comentário de votação para fixar**.
  Salvar em `projetos/refugio-13-NN/youtube.md`.
- Atualizar o ponto de retomada em `docs/refugio-13-continuidade.md` e em
  `.agents/skills/refugio-13/references/serie.md` (publicação no YouTube como estado separado).
- Não commitar nem publicar sem o usuário pedir.
