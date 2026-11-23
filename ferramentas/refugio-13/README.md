# Mundo filmável de Refúgio 13

O mundo usa uma cópia independente do motor Canvas e dos sprites empregados em
Mundo Pixelândia. O mapa, o elenco, o armazenamento e a evolução são próprios.
A cópia do motor está em `mundo/index.html`; a origem e o hash estão em
`mundo/origem.json`. O jogo externo de Pixelândia não é alterado nem precisa
estar instalado para filmar esta cópia.

```powershell
node ferramentas/refugio-13/filmar.mjs --conferir
node ferramentas/refugio-13/filmar.mjs --validar-tags
node ferramentas/refugio-13/filmar.mjs --validar-estado
node ferramentas/refugio-13/filmar.mjs
# Refilmar apenas cenas alteradas (índices 1-based), mantendo o estado entre tomadas:
node ferramentas/refugio-13/filmar.mjs --cenas=3,10
```

Os comandos partem da raiz do VSCreatorApp. O filmador atual monta o EP02 com
`projetos/refugio-13-02/plano.json`, conferindo a rota B no estado do EP01.
As tomadas ficam em `remotion/public/refugio-13/refugio-13-02/`; a montagem
em tela inteira é `remotion/src/refugio/RefugioFilmado.tsx`.

`projetos/refugio-13-02/mundo.json` salva terreno, prédios, sobreviventes,
posições, infectados, materiais, posto de socorros e suprimentos. O runtime
expõe `r13.loadWorld(estado)` para continuar esse mundo após inicializar os
renderizadores. O EP03 ainda requer seu roteiro e a apuração da nova votação.

`--validar-tags` também verifica a distância entre sobreviventes visíveis e
infectados em todos os quadros. No EP02 revisado, a aproximação contorna o
cerco, e Nilo cobre a retirada usando uma tábua contra um infectado. O golpe
tem antecipação, impacto e recuo; o inimigo cai, sem morte confirmada.
O áudio da narração permanece integralmente reaproveitado. Nos próximos
episódios, nenhum personagem deve atravessar um infectado sem reação.

Para atualizar a cópia do motor a partir do original local, existe
`preparar-motor.mjs`. Esse comando é de manutenção; não é necessário para
filmar o mundo já incluído no projeto.

Narração: somente após aprovação da nova prévia visual. A voz, o modelo e a
velocidade do EP01 estão registrados no plano do EP02.
