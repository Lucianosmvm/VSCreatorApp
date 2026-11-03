# Cenas vetoriais dinâmicas

**Desativado a pedido do usuário.** O `Video` voltou ao visual anterior e
ignora `direcao`. Estes arquivos foram preservados apenas porque um projeto
criado posteriormente importa seus tipos. Não usar este motor em novas montagens.
As instruções abaixo são referência da implementação desativada.

Motor sem imagens, sprites ou poses armazenadas. O desenho é SVG; pernas,
braços e cabeça do personagem têm articulações independentes. As trilhas
de posição, escala, rotação, opacidade e abertura são calculadas pelo tempo
local da cena, inclusive ao voltar ou avançar na prévia.

## Usar em um vídeo narrado

Passe `direcao={{ 0: planoDaPrimeiraCena, 1: planoDaSegundaCena }}` ao `Video`.
Os índices são 0-based. A narração, a duração, o dissolve e a legenda continuam
vindo da timeline existente. `especiais` tem prioridade sobre `direcao`.
Cenas sem direção mantêm o comportamento anterior.

Veja `src/videos/DemoDinamica.tsx`: história, programação e finanças com o mesmo
motor. No Studio, abra `demo-dinamica` ou `demo-dinamica-horizontal`.
A demonstração não tem narração; os tempos de palavra são ilustrativos.

```tsx
import { Video } from "../Shorts";
import type { PlanoCena } from "../cenas/dinamicas/CenaDinamica";

const jardim: PlanoCena = {
  titulo: "UMA DESCOBERTA",
  ambiente: "campo",
  elementos: [
    { id: "porta", tipo: "objeto", objeto: "porta", tamanho: 55,
      estado: { x: 75, y: 85 }, chaves: [
        { em: { palavra: "abriu" }, abertura: 0 },
        { em: { palavra: "porta" }, abertura: 1 },
      ] },
    { id: "lia", tipo: "personagem", tamanho: 43, cor: "#9c7650",
      estado: { x: 25, y: 88 }, chaves: [
        { em: 0.5, x: 25 }, { em: 3, x: 58 },
        { em: 3, bracoDir: 0 }, { em: 3.5, bracoDir: -80 },
      ] },
  ],
};
// No componente do vídeo: <Video {...tl} direcao={{ 0: jardim }} />
```

## Direção e sincronismo

- `x` e `y`: porcentagens do palco. `y` é a base/pé do objeto, não o centro.
- `tamanho`: altura aproximada em % do palco (personagem de 43 ocupa 43%).
- `em`: segundo local ou `{ palavra, ocorrencia: 1, deslocamento: 0 }`.
  Acentos e pontuação são ignorados ao procurar a palavra. Palavra ausente
  não dispara uma ação. Use as palavras reais da timeline.
- Uma chave indica **quando chegar** ao estado. Para segurar uma posição,
  repita o estado no início do movimento, como nos exemplos.
- Propriedades: `x`, `y`, `escala`, `giro`, `opacidade`, `bracoEsq`,
  `bracoDir`, `cabeca`, `abertura` (0–1). Ângulos em graus.
- `aparece` / `sai`: entrada e saída do elemento. Ordem da lista = camadas.
- `camera`: chaves de x/y/escala; 50/50 é o centro.
- `tipo: "texto"`: `texto`, `cartao` e `trocas: [{ em, texto }]`.
- `tipo: "forma"`: retângulo, elipse ou caminho SVG próprio. Caminhos usam
  coordenadas locais (aproximadamente x=-100..100, y=-210..0).
- Objetos iniciais: porta, árvore, caixa, moeda, monitor, livro e nuvem.
  Acrescente desenhos a `Objeto.tsx` conforme o roteiro. Para layouts próprios,
  use `criarCenaDinamica(plano)` em `especiais` ou uma `CenaEspecial` em SVG.

O motor executa direção explícita; ele não entende sozinho qualquer história.
Na montagem, o agente lê a fala e cria os planos. Para novos vídeos, encene
ações e relações, varie ambientes e personagens, use os tempos reais das
palavras e desenhe elementos específicos quando necessário. Não substitua
todas as histórias por uma caminhada ou por um ícone genérico.

No recorte de um longo, remapeie `direcao` pelos mesmos índices usados em
`recortarTimeline`. Ajuste a legenda conforme o formato e confira os dois
formatos em stills. A prévia usa legenda em 83%; o palco vai até 74% no vertical
e 75% no horizontal. Se a timeline usar outra posição, ajuste o layout ou a
posição da legenda para evitar sobreposição.

## Verificação

`node node_modules/typescript/bin/tsc -p .`

`node --test tests/movimento.test.cjs`

`node node_modules/@remotion/cli/remotion-cli.js studio src/index.ts`
