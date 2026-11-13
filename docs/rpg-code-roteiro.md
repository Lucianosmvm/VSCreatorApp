# RPG Code — roteiro da série (C# na Unity)

Série de Shorts 9:16 (40–55 s) em pixel art 16-bit. Cada episódio mostra **um acontecimento
do jogo** e **o código que faz ele acontecer**, e termina com um gancho para o próximo.
Kit: `remotion/src/rpg/`. Um episódio = um projeto + `remotion/src/rpg/EpNN<Nome>.tsx`.

**Episódios publicados:** 01 menu (`switch`) · 02 criar o herói (classe e objeto) ·
03 nome do herói (`string`, interpolação).

## Regras de cada episódio

- **11 cenas, ~45 s.** Cena 1 lembra o episódio anterior em uma frase. A penúltima resume o
  conceito numa frase só. A última faz a pergunta que o próximo episódio responde.
- **Um conceito por episódio.** O código aparece em até 8 linhas curtas (cabem no celular).
- **O código é Unity de verdade** (`MonoBehaviour`, `Update`, `Input`, `Debug.Log`...), mas o
  conceito é sempre de C#, que também vale fora da Unity.
- **A história continua:** Artur atravessa o reino; cada temporada termina num chefe.
- **Antes de cada temporada nova**, revisar o que o código usa (por exemplo, o Input System
  novo da Unity × o `Input.GetAxis` antigo) e manter um padrão na série toda.

## Temporada 1 — A vila (o básico)

| EP | Acontecimento no jogo | Conceito | Código central | Gancho |
|---|---|---|---|---|
| 04 | Artur dá o primeiro passo no mapa | `Vector2` e posição | `transform.position = new Vector2(3, 2);` | E para ele andar sozinho com as setas? |
| 05 | As setas movem Artur | `Update`, `Input` e `Time.deltaTime` | `transform.Translate(dir * velocidade * Time.deltaTime);` | Por que ele atravessa as paredes? |
| 06 | Artur bate na cerca e para | Colisão (`Rigidbody2D`, `Collider2D`) | `rb.linearVelocity = dir * velocidade;` | Tem algo brilhando na grama... |
| 07 | Artur encontra uma moeda | `int` e `+=` | `moedas += 1;` | Quantas moedas cabem na bolsa? |
| 08 | A bolsa enche: máximo 99 | Operadores de comparação | `if (moedas > 99) moedas = 99;` | O ferreiro tem uma espada à venda |
| 09 | Comprar a espada | `if / else` | `if (moedas >= preco) ... else ...` | A espada vale mesmo a pena? |
| 10 | A espada tem dano e peso | `float` × `int` | `float peso = 2.5f;` | Como guardar se ela está equipada? |
| 11 | Equipar a espada | `bool` | `bool equipada = true;` | Agora ele precisa de uma armadura |
| 12 | Armadura reduz o dano | Operadores aritméticos | `int dano = ataque - defesa;` | E se o dano ficar negativo? |
| 13 | Dano nunca é negativo | `Mathf.Max` e métodos prontos | `dano = Mathf.Max(dano, 0);` | Um slime bloqueia a ponte |
| 14 | Primeiro inimigo: o slime | Métodos com parâmetro | `alvo.ReceberDano(dano);` | Como o slime sabe que morreu? |
| 15 | O slime some quando a vida chega a 0 | Método com retorno `bool` | `bool EstaMorto() => vida <= 0;` | O slime deixou cair algo |
| 16 | Drop aleatório | `Random.Range` | `int sorte = Random.Range(0, 100);` | Para onde vai esse item? |
| 17 | Chefe da vila: Rei Slime | Revisão: classe, métodos e `if` | luta com 3 ataques | O baú do rei está trancado... |

## Temporada 2 — A floresta (coleções e repetição)

| EP | Acontecimento no jogo | Conceito | Código central | Gancho |
|---|---|---|---|---|
| 18 | Abrir o inventário | `List<T>` | `List<Item> inventario = new();` | Como guardar mais um item? |
| 19 | Pegar uma poção | `Add` e `Count` | `inventario.Add(pocao);` | E quando a poção acaba? |
| 20 | Usar a poção | `Remove` e `Contains` | `if (inventario.Contains(pocao))` | Mostrar todos os itens na tela |
| 21 | Listar o inventário | `foreach` | `foreach (var item in inventario)` | Por que a mochila tem só 10 espaços? |
| 22 | Mochila com espaços fixos | Array × `List` | `Item[] slots = new Item[10];` | Um enxame de morcegos aparece |
| 23 | Cinco morcegos de uma vez | `for` | `for (int i = 0; i < 5; i++) Instantiate(...)` | Eles atacam até alguém cair |
| 24 | Combate em turnos | `while` | `while (heroi.Vivo && inimigo.Vivo)` | E se o herói fugir no meio? |
| 25 | Fugir da batalha | `break` e `continue` | `if (fugiu) break;` | O mercador vende por nome... |
| 26 | Loja do mercador | `Dictionary` | `precos["Poção"] = 15;` | Como ordenar pelo mais barato? |
| 27 | Ordenar a loja | LINQ básico (`OrderBy`, `Where`) | `itens.OrderBy(i => i.preco)` | Os itens têm raridade... |
| 28 | Comum, raro, lendário | `enum` | `enum Raridade { Comum, Raro, Lendario }` | Cada raridade tem uma cor |
| 29 | Cor por raridade | `switch` expression | `cor = raridade switch { ... };` | A floresta tem um labirinto |
| 30 | Labirinto em grade | Matriz `[,]` | `int[,] mapa = new int[10, 10];` | No centro, o Guardião da Floresta |
| 31 | Chefe: Guardião da Floresta | Revisão: listas e laços | turnos com `while` e `foreach` | Artur subiu de nível! |

## Temporada 3 — O castelo (orientação a objetos)

| EP | Acontecimento no jogo | Conceito | Código central | Gancho |
|---|---|---|---|---|
| 32 | Subir de nível | Propriedades `get / set` | `public int Nivel { get; private set; }` | Ninguém pode mexer na vida de fora |
| 33 | Vida protegida | Encapsulamento | `private int vida; public void Curar(int x)` | Todos os inimigos têm vida e ataque |
| 34 | Família de inimigos | Herança | `class Esqueleto : Inimigo` | Mas cada um ataca de um jeito |
| 35 | Cada inimigo ataca diferente | `virtual` e `override` | `public override void Atacar()` | Um inimigo que nunca existe sozinho |
| 36 | Inimigo genérico | Classe abstrata | `abstract class Inimigo` | Baús e portas também podem ser usados |
| 37 | "Usar" baú, porta e alavanca | Interface | `interface IInteragivel { void Usar(); }` | O que é um MonoBehaviour, afinal? |
| 38 | Componentes do Artur | `MonoBehaviour` e `GetComponent` | `GetComponent<Animator>()` | Como ligar objetos pelo Inspector? |
| 39 | Arrastar no Inspector | `[SerializeField]` | `[SerializeField] private int velocidade;` | Espadas diferentes, mesmo molde |
| 40 | Banco de armas | `ScriptableObject` | `class Arma : ScriptableObject` | Uma armadilha dispara quando ele pisa |
| 41 | Armadilha no chão | `OnTriggerEnter2D` | `void OnTriggerEnter2D(Collider2D outro)` | A barra de vida não atualiza... |
| 42 | Vida na tela | Eventos (`Action`) | `public event Action<int> AoMudarVida;` | Quem avisa o placar? |
| 43 | Placar ouve o evento | Inscrever e cancelar evento | `heroi.AoMudarVida += AtualizarBarra;` | Chefe: o Cavaleiro Sombrio |
| 44 | Chefe: Cavaleiro Sombrio | Revisão de POO | herança, interface e eventos | O cavaleiro tinha um mapa... |

## Temporada 4 — O reino (jogo de verdade)

| EP | Acontecimento no jogo | Conceito | Código central | Gancho |
|---|---|---|---|---|
| 45 | Mudar de cena (vila → castelo) | `SceneManager` e `DontDestroyOnLoad` | `DontDestroyOnLoad(gameObject);` | Ao trocar de cena, as moedas sumiram |
| 46 | Moedas que não somem | `static` e Singleton | `public static Jogo Instancia;` | E se fechar o jogo? |
| 47 | Salvar o jogo | `PlayerPrefs` | `PlayerPrefs.SetInt("moedas", moedas);` | E salvar o inventário inteiro? |
| 48 | Salvar tudo | JSON (`JsonUtility`) | `JsonUtility.ToJson(save);` | O arquivo de save sumiu? |
| 49 | Save corrompido | `try / catch` | `try { Carregar(); } catch { NovoJogo(); }` | A porta do castelo demora a abrir |
| 50 | Porta que abre devagar | Coroutine | `yield return new WaitForSeconds(2f);` | Inimigos que perseguem Artur |
| 51 | Inimigo persegue o herói | Distância e direção | `Vector2.Distance(a, b)` | Ele precisa contornar as paredes |
| 52 | Estados do inimigo | Máquina de estados com `enum` | `Patrulha, Perseguir, Atacar` | Uma conversa com o rei |
| 53 | Diálogo com o rei | Array de falas e índice | `falas[indice++]` | O rei pede uma missão |
| 54 | Missão: 3 cristais | Classe `Missao` com progresso | `if (cristais == 3) Concluir();` | O último cristal está com o dragão |
| 55 | Chefe final: o Dragão | Revisão geral | tudo junto num combate | Temporada 2 da série? Comenta! |

## Ideias para depois do EP. 55

Mapas com Tilemap, partículas de magia, som com `AudioSource`, pathfinding (A*), menu de
pausa com `Time.timeScale`, build para celular e um episódio "monte o seu próprio RPG".

## Como produzir cada episódio

1. Escrever as 11 falas (6–18 palavras cada) no formato de `ferramentas/novo_projeto.py`, com
   `"resolucao": "1080x1920"`.
2. `python ferramentas/novo_projeto.py <roteiro.json>`, depois `python ferramentas/narrar.py <id>`.
3. Criar `remotion/src/rpg/EpNN<Nome>.tsx` a partir de um episódio anterior e registrar em
   `remotion/src/videos/index.ts` como `rpg-code-NN`.
4. Conferir stills, renderizar e exportar para `exportacoes/rpg-code-NN/` com `youtube.txt`.
