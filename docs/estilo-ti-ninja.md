# Padrão visual "TI Ninja" (referência para vídeos no EffectCraft)

Analisado em 06/11/2026 a partir de dois vídeos do canal TI Ninja:
- Sub-rede: https://www.youtube.com/watch?v=RhcK3UOElqQ (11 min)
- TCP/IP e OSI: https://www.youtube.com/watch?v=H_rdvDNLzdA (14,5 min)

O objetivo é seguir a linguagem, não copiar: nada de logo, nome, frases ou cenas idênticas.

## Estrutura do vídeo

1. **Gancho com caso real** (0:00–1:10): um problema concreto ("a impressora só imprime pra
   metade", "dois comentários dizendo que eu errei"). Mostrado como cena 3D ou celular com
   comentários.
2. **Quem sou eu** curto (~20 s).
3. **Capítulos de 1–2 min**, cada um com número e nome (`07 · INTERNET`). A descrição do
   YouTube traz a lista de capítulos e "O que você vai ver" com ✅.
4. **Prova com fonte oficial**: recorte da RFC/Microsoft Learn com o trecho realçado e rodapé
   `Fonte: ...`.
5. **Prática**: terminal (PowerShell/ipconfig/ping) com a linha importante realçada.
6. **Fecho**: resumo, "onde isso vira dinheiro" e link para o vídeo relacionado.

## Elementos fixos em toda cena

| Elemento | Como é |
|---|---|
| Fundo | Quase preto esverdeado (`#0d1210`), vinheta verde suave no topo |
| Marca-d'água | Palavra-chave do capítulo gigante, translúcida, no rodapé ("FIREWALL", "CAMADA") |
| Rótulo de seção | Canto superior esquerdo, monoespaçada verde: `11 · DIAGNÓSTICO` |
| Indicador de progresso | Canto superior direito: pilha de barras coloridas (a camada atual acende) |
| Troca visual | Algo muda a cada 3–5 s (entra cartão, acende objeto, câmera anda) |

## Tipos de cena

- **Cena 3D isométrica**: escritório (piso azul-petróleo em grade, mesas, monitores emissivos,
  switch, servidor, impressora) ou palco escuro com objetos low-poly brancos (roteadores,
  nuvem, câmera IP, celular) ligados por cabos. Anéis azuis brilhantes no chão sob o nó em foco.
  Pacote = esfera dourada que viaja pelo cabo; setas azuis mostram o caminho; X vermelho 3D na
  falha; parede vermelha translúcida = firewall.
- **Frase de impacto**: centrada, branca, Poppins Black, palavra-chave colorida
  ("ping falhou ✗ ≠ máquina desligada").
- **Cartões neon**: retângulos escuros com borda colorida (laranja TCP, amarelo UDP, roxo,
  azul), ligados por curvas brancas; número/porta numa pílula à direita.
- **Tabela de configuração**: janela com três bolinhas, linhas IP/Máscara/Gateway; linha com
  erro fica vermelha.
- **Checklist**: itens marcados ✓ ou riscados ✗.
- **Pílulas de status**: verde `✓ chega`, vermelha `✗ não reenvia`, âmbar `! perdido`.
  Legenda de nós em pílulas com bolinha (`● Windows ● OPNsense ● nuvem`).
- **Pilha de camadas**: blocos coloridos empilhados (roxo aplicação, laranja transporte, azul
  internet, verde enlace), 3D ou lista numerada.
- **Documento/terminal**: janela de navegador ou PowerShell, trecho realçado em verde
  (certo) ou vermelho (erro), rodapé de fonte.
- **Celular com comentários**: balões brancos com palavra realçada em amarelo, badge numérico.
- **Comparação/balança** e **lista de capítulos** com o item atual em destaque.

## Paleta e tipografia

| Uso | Cor |
|---|---|
| Fundo | `#0d1210`, painéis `#151c18`, bordas `#2a3a30` |
| Verde (ok, rótulos) | `#7cff4f` |
| Vermelho (erro) | `#ff4d5e` |
| Laranja | `#ff8a3d` |
| Amarelo (realce) | `#ffd23f` |
| Azul (rede, anéis) | `#4da3ff` |
| Roxo | `#8b5cf6` |
| Texto | `#f2ead8` |

Títulos em Poppins 800/900; rótulos, IPs e código em monoespaçada (Consolas / JetBrains Mono).

## Diferenças em relação ao nosso padrão atual

- Eles **não queimam legenda palavra a palavra**; o texto na tela é o conceito, não a fala.
  Decidir: manter nossa legenda (bom para quem assiste sem som) ou só no Short.
- **Sem mascote**: o apresentador aparece só no "quem sou eu". Podemos usar o mascote nesse
  trecho e no CTA.
- Vídeos longos (11–15 min). Nosso limite de 60 cenas cobre ~5 min; para esse formato o
  roteiro precisa de ~150 cenas ou cenas mais longas.

## Como montar (pipeline)

```bash
node ferramentas/effectcraft/montar-video.mjs <id-do-projeto> --stills   # monta e gera 1 still por cena (segundos)
node ferramentas/effectcraft/montar-video.mjs <id-do-projeto>            # render na GPU (~1 min por 5 s de 3D; --cpu ~10x mais lento), + narração + efeitos + clipes + composicoes.json
node ferramentas/effectcraft/montar-video.mjs <id-do-projeto> --short    # versão 1080x1920
```

Lê `remotion/public/videos/<id>/timeline.json` e o plano `projetos/<id>/cenas-ec.json`.
Saídas: `exportacoes/<id>/` (`.ecproj` editável no EffectCraft, stills), `remotion/out/<id>-ec.mp4`,
clipes dos cards em `remotion/public/videos/<id>/cenas/`, entrada `motor: "effectcraft"` no
`composicoes.json` (o botão 🎬 do app renderiza por este script).

### Plano `cenas-ec.json`

```json
{"legenda": false, "cenas": [ {...cena 0...}, {...cena 1...} ]}
```

Uma entrada por cena da timeline, na mesma ordem. Sem entrada → `frase` com o texto da fala.
Campos comuns (herdados pelas cenas seguintes até mudar): `secao` ("07 · internet"),
`marca` (palavra gigante do rodapé), `camada` (0–3 acende a barra no canto; `null` esconde).
Campos comuns não herdados: `legenda` (true/false), `pilulas: [{texto, tipo, em}]`.
`em` = palavra da fala que dispara a animação (início da palavra; aceita número em segundos).
Cores aceitam nomes da paleta (`verde`, `laranja`, `azul`...) ou `#rrggbb`.
`tipo`/`estado`: `ok` (verde ✓), `erro` (vermelho ✗), `alerta` (amarelo !), `info` (azul).

| modelo | campos |
|---|---|
| `frase` | `texto`, `destaque` (trecho em cor), `cor`, `em` |
| `titulo` | `numero` ("07"), `texto` — abertura de capítulo |
| `lista` | `titulo`, `itens: [texto]`, `atual` (índice) — capítulos/roteiro |
| `checklist` | `itens: [{texto, estado, em}]` — ✓ / riscado |
| `tabela` | `titulo`, `linhas: [[rótulo, valor]]`, `erro`/`ok` (índice), `em`, `titulo_grande` |
| `cartoes` | `itens: [{titulo, sub, cor, em, estado}]`, `entre` ("×") |
| `pilha` | `camadas: [nome]`, `cores`, `ativa`, `seta: "sobe"/"desce"`, `seta_em`, `seta_texto` |
| `terminal` | `titulo`, `linhas: [texto | {texto, realce: ok/erro, em, cor}]` |
| `documento` | `fonte`, `url`, `titulo`, `texto`, `realce` (trecho), `em`, `rodape` |
| `comentarios` | `itens: [{texto, destaque, em}]`, `badge`, `titulo` |
| `grafo` | `ramos: [{nome, cor}]`, `commits: [{id, ramo, pai, x, msg, em}]`, `merges: [{de, para, em}]`, `head: [{alvo, em}]` |
| `fluxo` | `caixas: [{titulo, sub, cor, em}]`, `setas: [{de, para, rotulo, em}]`, `itens: [{texto, cor, passos: [{caixa, em}]}]` |
| `rede3d` | ver abaixo |

`rede3d`: `cenario` (`escritorio` azul-petróleo | `palco` escuro), `pcs` (escritório padrão:
servidor `srv`, switch `sw`, impressora `imp`, `pc1..pcN`) ou `nos: [{id, tipo, x, z, cor}]`
(tipos `pc servidor switch impressora roteador nuvem celular camera firewall`; x de −900 a 900,
z de −600 a 600, z menor = mais perto), `ligacoes: [[a, b]]`, `alvo` (câmera centraliza), `zoom`,
`eventos: [{acao, alvo, em}]` — `cor` (telas: `verde/vermelho/azul/apagado`, alvo `pc*` ou `*`,
`passo`), `anel` (anel azul no chão, `cor: vermelho`), `pacote` (`rota: [ids]`, `perde`,
`duracao`), `falha` (X vermelho). HUD: `cartao: {rotulo, texto, tipo, em}`, `legenda_nos: [texto]`.

Use um mesmo cenário em várias cenas seguidas mudando só os eventos: dá a sensação de
"mesma rede" que a referência tem.
