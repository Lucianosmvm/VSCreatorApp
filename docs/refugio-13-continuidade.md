# Refúgio 13 — continuidade

**Ponto de retomada:** Dia 04 — O mercado, exportado com narração em 23/11/2026. Arquivo: `remotion/out/refugio-13-04.mp4`, 87 s, 1080x1920. Apuração do EP03: A = 1, B = 1 (empate); a liderança decidiu A (mercado) pela necessidade imediata, com o argumento do Velho Giu de que o rádio só traria mais gente e dobraria os problemas. Velho Giu atraiu os infectados com uma lata e uma mentira; Nilo forçou a porta lateral; Eva trouxe latas, arroz e sal; um infectado voltou e Nilo o derrubou com um carrinho (sem morte confirmada); Ulisses examinou todos, ninguém mordido. Comida para 3 dias; água filtrada acaba na noite do dia 4; céu fechando. Elenco sem mudança: Lia, Nilo, Eva, ULISSES e Velho Giu. Diretor `ferramentas/refugio-13/mundo/dia04.js`, filmar com `node ferramentas/refugio-13/filmar.mjs --dia 04`, composição `refugio-13-04` (`remotion/src/refugio/RefugioDia04.tsx`). Estado em `projetos/refugio-13-04/estado.json` e `mundo.json`; texto do YouTube em `projetos/refugio-13-04/youtube.md`. Publicação pendente. Próximo: Dia 05, dependendo da votação do EP04: A = esperar a chuva (todos seguros; se não chover, sem água), B = ir ao rio (água garantida; grupo dividido e margem com infectados). Para o Dia 05, criar `dia05.js` no mesmo molde, carregar no `mundo/index.html` e filmar com `--dia 05`.

## Elenco do roteiro do Dia 02

| Nome | Habilidade |
|---|---|
| Lia | rádio |
| Nilo | manutenção |
| Eva | suprimentos |
| ULISSES | Doutor |
| Velho Giu | Contador de histórias, inventa boas mentiras e é safo. |

Não misturar o universo com Mundo Pixelândia. Preservar mapa, elenco e estado próprios. Prévia visual antes de gastar créditos de narração. A configuração de voz do Dia 01 está registrada no plano.


## Direção visual solicitada — 18/11/2026

Usar o método de Mundo Pixelândia: mundo Canvas filmável, pixel art detalhada, ações no cenário e montagem em tela inteira. Refúgio 13 conserva seu próprio universo, mapa, elenco e estado. As prévias SVG do EP02 são storyboard; o mundo Canvas já está implementado em `ferramentas/refugio-13/mundo/index.html`. Não tomar aprovação do roteiro como aprovação dessas prévias visuais. Detalhes e comparação em `docs/refugio-13-estilo-producao.md`. Nomes somente em tags sobre as cabeças, sem linhas de ligação. Nova prévia antes de gastar créditos de narração.


## Motor Canvas implementado

O EP02 ativo agora é uma filmagem do mundo Canvas. Usar `ferramentas/refugio-13/README.md` para os comandos e `projetos/refugio-13-02/mundo.json` para preservar a evolução. O mundo reutiliza o renderizador de tiles, prédios e personagens do motor de Pixelândia, em uma cópia isolada, com dados próprios. Não retomar a montagem SVG como estilo principal. O compositor reutiliza as legendas de impacto de Pixelândia sobre vídeo em tela inteira e mantém a identidade Refúgio 13. A prévia Canvas do EP02 foi aprovada e a narração foi concluída. Nos próximos episódios, manter aprovação visual antes da ElevenLabs.


## Revisão do EP02 — contato com os infectados

Nilo usa uma tábua para afastar um infectado que não seguiu a distração e cobre a fuga do grupo. O infectado cai, sem morte confirmada. O resgate, o elenco de cinco, o ferimento já tratado e os suprimentos não mudam. Nenhuma fala foi alterada.

Regra de encenação para os próximos episódios: infectados presentes no caminho devem provocar reação visível — desvio, bloqueio, combate ou fuga — e uma consequência. Nunca mover sobreviventes através deles. Mostrar antecipação, contato/reação e retirada; conferir trajetos e tags quadro a quadro.
