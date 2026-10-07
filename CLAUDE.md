# VSCreatorApp — como o Claude monta os vídeos

App de Shorts (9:16) com narração ElevenLabs e animação no Remotion. O usuário
fala em português; responda em português.

## Fluxo (tema → vídeo)

1. **Usuário passa o tema** ("faz um vídeo sobre a armadilha das parcelas").
2. **Claude escreve o roteiro** (regras abaixo), salva num JSON no scratchpad e cria o projeto:
   ```bash
   python ferramentas/novo_projeto.py <roteiro.json>
   ```
   Imprime o id do projeto (ex.: `armadilha-das-parcelas-muy7p1o4`). O projeto
   nasce em modo mascote + Remotion, herdando voz e estilo do projeto mais recente.
3. **Usuário, no app** (`python serve.py` → http://localhost:8777):
   📁 Projetos → abrir o projeto → **🎤 Narração** → **🤖 Enviar para o Claude**.
   Claude NÃO gera narração: a chave da ElevenLabs fica no navegador do usuário.
4. **Claude monta o vídeo** a partir de `remotion/public/videos/<id>/timeline.json`
   (tempo real de cada cena e de cada palavra) — seção "Montar o vídeo".
5. **Claude publica no app** (não renderiza o vídeo inteiro): grava
   `remotion/public/videos/<id>/composicoes.json`:
   ```json
   [{"id": "<comp-id>", "titulo": "Vídeo longo (YouTube)", "formato": "16:9", "duracao": 264.9},
    {"id": "<comp-id>-short", "titulo": "Short (Shorts, Reels, TikTok)", "formato": "9:16", "duracao": 85.7}]
   ```
   e gera o clipe de cada cena para os cards do app (com som, 640x360):
   ```bash
   cd remotion && node cenas.mjs <comp-id> <id-do-projeto>            # todas
   cd remotion && node cenas.mjs <comp-id> <id-do-projeto> 3 7 12     # só essas (índices 0-based)
   ```
   No app, cada card mostra a animação da cena + campo **💬 Ajuste pro Claude**; o passo 5
   tem **🎬 Longo / 📱 Short** para o usuário renderizar quando aprovar (MP4 em
   `remotion/out/<comp-id>.mp4`, ⬇ para baixar).
6. **"aplica a revisão"**: ler `projetos/<id>/revisao.json` (`[{cena: n|"geral", fala, texto}]`,
   cena 1-based = índice+1 na timeline do vídeo longo), aplicar, conferir com stills,
   regerar os clipes SÓ das cenas mudadas (`node cenas.mjs ... <índices>`), limpar os itens
   aplicados do revisao.json e avisar para o usuário conferir nos cards e renderizar. Se o comentário muda a FALA, editar `projeto.json`
   (atualizar `salvoEm`) e pedir para narrar e enviar de novo.

Ao editar um `projetos/<id>/projeto.json` existente, **sempre atualize `salvoEm`**
(ISO UTC, ex. `2026-10-07T15:00:00.000Z`): o app compara esse campo e, se o disco
mudou, recarrega a versão do disco em vez de sobrescrevê-la.

Se o usuário pedir ajuste de texto depois da narração, o áudio precisa ser
refeito no app (passo 3) — avisar antes de mudar fala.

## Regras do roteiro

Formato que `novo_projeto.py` aceita:
```json
{
  "nome": "Armadilha das parcelas",
  "cenas": [
    {"texto": "Parcelar parece barato.", "titulo": "Parcelar é barato?", "mascote": "frente"},
    {"texto": "Mas no fim você paga R$ 1.200 a mais.", "mascote": "determinado"}
  ]
}
```
- `texto` = o que a voz fala E a legenda. Uma ideia por cena, 6–18 palavras.
- 6–12 cenas, ~30–60 s no total. Gancho forte na cena 1, CTA na última.
- Números escritos como dígitos (`R$ 1.200`, `35%`, `12x`): viram cartão animado sozinhos.
- `titulo` (opcional): 2–5 palavras, frase grande no topo.
- `mascote` (opcional). Corpo inteiro: `frente`, `lado`, `costas`, `apontando`, `digitando`,
  `pensando`, `comemorando`, `surpreso`, `desconfiado`, `cocando`, `bracos`, `acenando`, `sentado`.
  Busto: `neutro`, `feliz`, `determinado`. Sem o campo, é escolhido sozinho.
  Nas cenas especiais (`codigo`/`fichas` em `cenas/Codigo.tsx`) a pose reage sozinha:
  digitando com o código, apontando no realce, comemorando no ✓, surpreso no ✗.
  Reações extras à mão: `extra: [{ t: em(c, "palavra"), tipo: "pose", pose: "pensando" }]`.
- Poses novas: `python ferramentas/gerar_poses.py --folha N` (Replicate, ~US$ 0,04 por folha
  de 5 poses, token em `.env`) e recorte para `remotion/public/mascote/`.
- Sem `imagem`: não usamos mais Replicate.
- **Escreva "C sharp", nunca "C#", no `texto`** — a ElevenLabs pronuncia errado. A legenda
  do Remotion junta "C sharp" de volta em "C#" (`juntarParaTela` em `Legenda.tsx`);
  em títulos e cenas especiais pode escrever "C#" direto.
- `"resolucao"` no topo: `"1080x1920"` para Shorts (máx. 3 min) ou `"1920x1080"` para vídeo longo do YouTube.
  Vídeo de 5 min ≈ 55 cenas (~4.800 caracteres de fala; o app aceita até 60 cenas).

## Montar o vídeo

Peças prontas em `remotion/src/`:

| Arquivo | O quê |
|---|---|
| `Shorts.tsx` → `Video` | Monta tudo: cenas na hora certa, dissolve, áudio. Props `pasta` e `especiais` |
| `cenas/FundoAnimado.tsx` | Fundo verde-oliva com grade e símbolos de código |
| `cenas/Mascote.tsx` | Mascote com entrada, respiração e pulinho a cada palavra |
| `cenas/Legenda.tsx` | Legenda karaokê (sempre presente, inclusive em cena especial) |
| `cenas/Destaque.tsx` | Cartão com número contando (`acharDestaque` detecta) |
| `cenas/Titulo.tsx` | Frase grande no topo |

Para cada projeto:
1. Ler `remotion/public/videos/<id>/timeline.json` (cenas, `inicio`, `dur`, `palavras[].t`).
2. Criar `remotion/src/videos/<Nome>.tsx`:
   ```tsx
   import { Video, type CenaEspecial } from "../Shorts";
   import type { Timeline } from "../tipos";

   const GraficoJuros: CenaEspecial = ({ cena, indice }) => { /* useCurrentFrame()... */ };

   export const ArmadilhaParcelas: React.FC<Timeline> = (tl) => (
     <Video {...tl} pasta="videos/<id>/" especiais={{ 3: GraficoJuros }} />
   );
   ```
   - Cenas sem entrada em `especiais` usam o padrão (fundo + mascote + título/número).
   - Em cena especial, o quadro 0 é o início da cena; sincronize com `cena.palavras[i].t * fps`
     (ex.: a barra cresce quando a palavra "juros" é dita).
   - Use a paleta do mascote: `#1d2416`, `#4b5a35`, `#d8c3a0`, `#f2ead8`, destaque `#FFD23F`.
   - Fonte: Poppins 800/900 (já carregada em `Shorts.tsx`).
   - Deixe espaço para a legenda (faixa em `legenda.pos`% da altura) e para o mascote (canto inferior).
3. Registrar em `remotion/src/videos/index.ts`:
   ```ts
   import tlArmadilha from "../../public/videos/<id>/timeline.json";
   { id: "armadilha-parcelas", timeline: tlArmadilha as Timeline, componente: ArmadilhaParcelas },
   ```
4. Conferir: `cd remotion && npx tsc -p .`, depois quadros soltos das cenas especiais:
   ```bash
   cd remotion && npx remotion still src/index.ts <comp-id> out/q.png --frame=<n>
   ```
   Olhar a imagem antes de renderizar o vídeo inteiro.
5. Render:
   ```bash
   cd remotion && npx remotion render src/index.ts <comp-id> out/<comp-id>.mp4
   ```

Skills do Remotion instaladas em `.claude/skills/` (best-practices, captions,
multimedia, render...) — consultar para APIs do Remotion.

## Outros caminhos (sem o Claude)

- App → "🎬 Gerar vídeo" com Remotion ligado: render automático com os templates padrão (`/remotion` no `serve.py`).
- Mascote recortado de `MascoteRef/mascote.jpeg` em `remotion/public/mascote/*.png`.

## Short a partir do vídeo longo

Mesma narração, sem gastar ElevenLabs: escolha as cenas (gancho + núcleo + CTA,
60–120 s) e use `recortarTimeline(tl, [índices], { largura: 1080, altura: 1920, legenda: {...tl.legenda, pos: 56} })`
(`src/tipos.ts`). Remapeie `especiais` e poses do índice original para o novo
(ver `CondicionaisShort` em `src/videos/CondicionaisCSharp.tsx`) e registre como
`<id>-short`. Painel, fichas e mascote se ajustam sozinhos ao formato em pé.
