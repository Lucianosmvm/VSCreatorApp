#!/usr/bin/env python3
"""
Ponte entre o ViMax e o Shorts Creator.

Usa do ViMax SO a camada de texto: extrair personagens -> desenhar storyboard.
Nada de imagem, nada de video, nada de moviepy no caminho de execucao. O que
volta e exatamente o JSON que o botao "Importar roteiro" ja aceita:

    {"scenes": [{"narration_text": "...", "image_prompt": "..."}]}

Por que passar pelo ViMax se o app ja monta roteiro com um prompt colado no
Claude: aquele prompt escreve cada cena isolada, e a consistencia de personagem
fica por conta de uma frase no campo "Personagem" das Chaves. O ViMax extrai os
personagens UMA vez (traco fisico, roupa, acessorio) e desenha o storyboard
inteiro com essa lista na mao, entao a cena 5 descreve a mesma pessoa da cena 1
com as mesmas palavras. E o que a folha de referencias tenta fazer pela imagem,
so que pelo texto e antes de gastar credito.

O que o ViMax NAO faz aqui: retrato de personagem, primeiro/ultimo quadro,
arvore de cameras, clipe por plano, concatenacao. Essa parte custa dezenas de
chamadas pagas por video e entrega 16:9 de cinema, o oposto do que este app
monta. A imagem continua saindo pela Replicate e o clipe pelo DepthFlow.

AMBIENTE
Roda na venv propria em ViMax/.venv, criada por:  python vimax_setup.py
O serve.py chama este arquivo como subprocesso com aquele interpretador.

PROTOCOLO
O job entra por STDIN e o resultado sai por STDOUT, os dois em JSON; o
andamento vai por STDERR. A chave da API viaja dentro do job, ou seja, no
stdin: nao vai para argv (que qualquer processo da maquina le no Gerenciador de
Tarefas) nem para querystring (que o log do servidor guardaria). Este arquivo
nao imprime a chave em lugar nenhum.

Uso direto, sem o servidor:
    ViMax/.venv/Scripts/python vimax_plan.py < job.json
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import sys

APP_DIR = os.path.dirname(os.path.abspath(__file__))
VIMAX_DIR = os.path.join(APP_DIR, "ViMax")

# O ViMax se importa por caminho absoluto de pacote ("from interfaces import
# ...", "from utils.retry import ..."), entao a raiz dele tem que estar no
# sys.path. Vai na frente porque "utils" e um nome que qualquer coisa usa.
if VIMAX_DIR not in sys.path:
    sys.path.insert(0, VIMAX_DIR)

# Gemini pela porta compativel com a OpenAI. E o padrao porque a chave que o app
# ja pede no janela Chaves (aistudio.google.com) serve aqui sem cadastro novo, e
# o nivel gratuito cobre este uso: o planejamento inteiro sao 4 chamadas de
# texto por roteiro.
LLM_PADRAO = {
    "model": "gemini-2.5-flash",
    "provider": "openai",
    "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
}

MAX_CENAS = 40

# A adaptacao e a ULTIMA das 4 chamadas do planejamento: quando ela falha, as
# tres anteriores ja foram pagas e a pessoa esperou minutos para receber um erro
# seco. Por isso ela tem tentativa e prazo proprios; os outros passos ja vem com
# @retry de dentro dos agentes do ViMax, este nao vinha de lugar nenhum.
ADAPTACAO_TENTATIVAS = 3
ADAPTACAO_TIMEOUT = 150   # o mesmo prazo por tentativa que os agentes do ViMax usam


def log(msg):
    print("[vimax] " + msg, file=sys.stderr, flush=True)


# -- RODIZIO DE CHAVES ----------------------------------------------------
#
# O app aceita varias chaves do Gemini e ja faz rodizio no que sai do navegador
# (withKeyRotation, no index.html). O planejamento nao fazia: recebia UMA chave,
# e um 429 no terceiro passo jogava fora as duas chamadas anteriores junto.
#
# Aqui a troca e POR PASSO. A chave estoura, a proxima refaz aquele passo, e o
# que ja ficou pronto continua pronto -- refazer o planejamento inteiro a cada
# chave seria justamente o desperdicio que o rodizio existe para evitar.

# Cada provider embrulha o erro HTTP numa excecao diferente, e o langchain
# reembrulha de novo, entao sobra olhar a mensagem. Errar para o lado do "nao e
# chave" e o certo: no maximo se perde o rodizio, enquanto o contrario queimaria
# as chaves boas repetindo um erro de prompt em todas elas.
ERROS_DE_CHAVE = (
    "429", "quota", "rate limit", "rate_limit", "too many requests",
    "resource_exhausted", "resource exhausted",
    # "valid api key" cobre de uma vez as tres redacoes que ja vieram do Gemini
    # pela porta compativel: "API key not valid", "invalid API key" e
    # "Please pass a valid API key" -- esta ultima chega como 400, nao 401
    "valid api key", "api_key_invalid", "invalid_api_key",
    "api key expired", "expired api key", "missing api key",
    "permission_denied", "permission denied", "unauthenticated",
)


def cadeia_de_erros(e):
    """O erro recebido mais tudo que estiver embrulhado dentro dele.

    Precisa existir por causa da tenacity: os agentes do ViMax tem @retry, e o
    que sobe deles nao e o erro da API, e um RetryError cujo str() mostra so o
    endereco do Future ("RetryError[<Future at 0x... raised ...>]"). Sem abrir
    esse embrulho, um 429 vindo de character_extractor, write_script ou
    storyboard passava por "nao e erro de chave" e o rodizio nunca acontecia --
    justamente nos tres passos que mais estouram cota.
    """
    # De fora para dentro (fila, nao pilha): quem embrulha costuma dizer mais do
    # que quem foi embrulhado. O RetryError guarda o OpenAIInvalidRequestError
    # ("Please pass a valid API key"), que por sua vez guarda um HTTPStatusError
    # so com "400 Bad Request" -- ir ate o fundo entregaria a pior das tres.
    vistos, fila, saida = set(), [e], []
    while fila:
        atual = fila.pop(0)
        if atual is None or id(atual) in vistos:
            continue
        vistos.add(id(atual))
        saida.append(atual)
        fila.append(getattr(atual, "__cause__", None))
        fila.append(getattr(atual, "__context__", None))
        tentativa = getattr(atual, "last_attempt", None)   # tenacity.RetryError
        if tentativa is not None:
            try:
                if tentativa.failed:
                    fila.append(tentativa.exception())
            except Exception:
                pass
    return saida


def texto_do_erro(e):
    """A mensagem mais funda da pilha; a de fora costuma ser o embrulho."""
    for err in cadeia_de_erros(e):
        texto = str(err).strip()
        if texto and not texto.startswith("RetryError"):
            return type(err).__name__ + ": " + texto
    return type(e).__name__ + ": " + str(e)


def eh_erro_de_chave(e):
    """True quando o erro e da CHAVE (cota ou credencial), nao do texto."""
    for err in cadeia_de_erros(e):
        texto = str(err).lower()
        if any(marca in texto for marca in ERROS_DE_CHAVE):
            return True
    return False


class Rodizio:
    """Uma chave por vez, com as seguintes esperando a fila."""

    def __init__(self, chaves, cfg, fabrica):
        self.chaves = chaves
        self.cfg = cfg
        self.fabrica = fabrica
        self.i = 0
        self.esgotadas = []
        self._chat = None

    def chat(self):
        if self._chat is None:
            self._chat = self.fabrica(
                model=self.cfg["model"],
                model_provider=self.cfg.get("provider") or "openai",
                api_key=self.chaves[self.i],
                base_url=self.cfg.get("base_url") or None,
                temperature=self.cfg.get("temperature", 0.7),
            )
        return self._chat

    def proxima(self):
        """Marca a chave atual como gasta e avanca. False quando acabaram."""
        if self.i not in self.esgotadas:
            self.esgotadas.append(self.i)
        if self.i + 1 >= len(self.chaves):
            return False
        self.i += 1
        self._chat = None
        return True


async def com_rodizio(rod, rotulo, passo):
    """Roda passo(chat). Se o erro for de chave, troca de chave e refaz o passo."""
    while True:
        try:
            return await passo(rod.chat())
        except Exception as e:
            if not eh_erro_de_chave(e):
                raise
            atual, quantas = rod.i + 1, len(rod.chaves)
            if not rod.proxima():
                raise ValueError(
                    "as " + str(quantas) + " chave(s) do Gemini falharam em \""
                    + rotulo + "\". Ultimo erro -- " + texto_do_erro(e)
                )
            log("chave " + str(atual) + "/" + str(quantas) + " falhou em "
                + rotulo + " (" + type(e).__name__ + "); indo para a proxima")


def responder(obj):
    """Escreve o JSON como bytes UTF-8, sem passar pelo text wrapper do stdout.

    No Windows, sys.stdout num pipe usa a codificacao do sistema (cp1252 aqui),
    e nao UTF-8. Com ensure_ascii=False, "milenios" saia com o "e" acentuado
    como byte 0xEA solto; o serve.py le o pipe como UTF-8, 0xEA nao e UTF-8
    valido, e o errors="replace" dele trocava a letra pelo caractere de
    substituicao. O roteiro chegava no navegador com "mil?nios" gravado dentro
    do JSON -- corrompido de verdade, nao so feio no console.

    Escrever em .buffer resolve na origem e vale tambem para quem rodar este
    arquivo na mao, sem o serve.py no meio.
    """
    sys.stdout.buffer.write(json.dumps(obj, ensure_ascii=False).encode("utf-8"))
    sys.stdout.buffer.flush()


# -- ADAPTACAO: storyboard do ViMax -> cena do app ------------------------
#
# O storyboard do ViMax fala a lingua do cinema: um plano tem descricao visual
# em ingles e um audio_desc no formato "[Speaker] Alice (Happy): ..." ou
# "[Sound Effect] ...". O app fala outra lingua: uma cena tem UM texto em
# portugues que e ao mesmo tempo a fala e a legenda, e UM prompt de imagem em
# ingles. Converter isso com regex daria bloco de dialogo virando legenda de 40
# palavras, entao a conversao e uma chamada de LLM so, com o storyboard inteiro
# de uma vez para o ritmo nao quebrar entre as cenas.

PROMPT_ADAPTACAO_SISTEMA = """You convert a cinematic storyboard into scenes for a narrated short-video app.

The app draws ONE still image per scene and speaks ONE line over it. The line is also printed on screen as the caption. Between scenes there is a short pause in the voice and a cross-dissolve in the image.

You receive {total} shots and must output exactly {alvo} scenes, each with exactly two fields.
- More shots than scenes: merge neighbours that belong to the same beat, write one line for the pair and keep the image of the stronger of the two.
- Fewer shots than scenes: split the richest shots into two scenes, same moment seen in two different framings.
- Never reorder the story, never drop a beat, never invent one that is not in the storyboard.

"narration_text" -- in {idioma}. It is what the voice says AND what is written on screen; they are the same string.
- 6 to 12 words. Spoken register, direct, no final period.
- A COMPLETE idea that stands on its own when said out loud. Never split one sentence across two scenes.
- Never end on a dangling connective (and, but, because, that, to, a comma, an ellipsis).
- Do not repeat the subject every scene; after introducing it, use a pronoun or go straight to the verb.
- Keep the same person and tense from start to finish.
- Similar length across scenes: scene duration comes from line length, so a 3-word line between two 12-word lines breaks the rhythm.
- If the shot carries dialogue, turn it into narration -- this app has one narrator voice, characters do not speak.
- One line pulls the next by meaning, not by repeating words. Do not start several scenes with the same word.

"image_prompt" -- in ENGLISH, one sentence. Subject + action + setting + light + framing. Concrete and cinematic.
- Carry over the character features exactly as given in the character sheet, every single time that character appears: same hair, same clothes, same build, in the same words. This is the only thing keeping the character consistent across scenes.
- Same palette, same light and same treatment across all scenes, otherwise the cross-dissolve joins two different worlds.
- No text, no letters, no logos and no watermarks in the image -- the caption is drawn on top afterwards.
- {enquadramento}
- Style, applied to every scene: {estilo}

SHAPE OF THE WHOLE SET
This is short-form video, not a film: nobody owes you the first ten seconds.
- Scene 1 is the hook. Whatever that first shot happens to show, its line must create curiosity or contradict common sense -- never a neutral sentence that only sets up the place.
- Middle scenes each carry ONE idea and move forward; no scene restates the one before it.
- The last scene closes with a short call to action.

{format_instructions}"""

PROMPT_ADAPTACAO_HUMANO = """Character sheet:
{personagens}

Storyboard ({total} shots, in order):
{planos}

Output exactly {alvo} scenes, in the same order as the shots.
In each scene, "idx" is the shot it came from -- the first one, when you merged."""


def enquadramento_de(formato):
    if formato == "16:9":
        return "Horizontal 16:9 framing: wide shots, landscape, room on the sides."
    return ("Vertical 9:16 framing: close or medium shots, subject centred, "
            "little lateral space. Never describe a wide landscape.")


def resolver_marcadores(texto, personagens):
    """Troca <Alice> pela descricao dela.

    O ViMax escreve o nome entre < > de proposito, para poder recolar a ficha do
    personagem a cada etapa. Como aqui o texto vira prompt de imagem, o marcador
    precisa sumir: um gerador de imagem que recebe "<Alice>" desenha uma pessoa
    qualquer, ou desenha as letras.
    """
    mapa = {}
    for p in personagens:
        tracos = [(p.static_features or "").strip(), (p.dynamic_features or "").strip()]
        desc = "; ".join(t for t in tracos if t)
        mapa[p.identifier_in_scene.strip().lower()] = (p.identifier_in_scene, desc)

    def troca(m):
        nome = m.group(1).strip()
        achado = mapa.get(nome.lower())
        if not achado:
            return nome
        rotulo, desc = achado
        return (rotulo + " (" + desc + ")") if desc else rotulo

    return re.sub(r"<([^<>\n]{1,80})>", troca, texto or "")


def ficha_de_personagens(personagens):
    if not personagens:
        return "(no recurring characters)"
    linhas = []
    for p in personagens:
        tracos = [(p.static_features or "").strip(), (p.dynamic_features or "").strip()]
        linhas.append("- " + p.identifier_in_scene + ": " + "; ".join(t for t in tracos if t))
    return "\n".join(linhas)


# -- PIPELINE -------------------------------------------------------------

async def planejar(job):
    # Importado aqui dentro, e nao no topo, para venv faltando sair como
    # mensagem de JSON em vez de ImportError na primeira linha do arquivo -- o
    # serve.py mostra essa mensagem no app.
    from typing import List

    from langchain.chat_models import init_chat_model
    from pydantic import BaseModel, Field

    # O parser tolerante e do proprio ViMax (utils/robust_json_parser.py), e
    # existe porque o gemini-flash pela porta compativel com a OpenAI emite
    # virgula pendente antes de "}" com frequencia. O PydanticOutputParser puro
    # estoura nisso, e aqui estourar custa o planejamento inteiro.
    from utils.robust_json_parser import (
        TrailingCommaTolerantPydanticOutputParser as PydanticOutputParser,
    )

    from agents.character_extractor import CharacterExtractor
    from agents.screenwriter import Screenwriter
    from agents.storyboard_artist import StoryboardArtist

    llm_cfg = dict(LLM_PADRAO)
    llm_cfg.update(job.get("llm") or {})

    # "api_keys" e a lista inteira do janela Chaves; "api_key" continua valendo
    # para quem chama este arquivo na mao com uma chave so.
    chaves = [str(k).strip() for k in (llm_cfg.get("api_keys") or []) if str(k).strip()]
    if not chaves and llm_cfg.get("api_key"):
        chaves = [str(llm_cfg["api_key"]).strip()]
    if not chaves:
        raise ValueError('faltou a chave da API em "llm.api_key" ou "llm.api_keys"')

    rod = Rodizio(chaves, llm_cfg, init_chat_model)
    log(str(len(chaves)) + " chave(s) na fila")

    formato = job.get("formato") or "9:16"
    estilo = (job.get("estilo") or "cinematic photograph, natural light").strip()
    idioma = job.get("idioma") or "Brazilian Portuguese"
    alvo = max(2, min(MAX_CENAS, int(job.get("cenas") or (8 if formato == "16:9" else 6))))

    requisito = (
        "Short-form video, " + formato + " aspect ratio. "
        "Exactly " + str(alvo) + " shots, no more and no less. "
        "One narrator voice over still images; do not plan shots that only work with camera movement. "
        "Every shot must be a distinct image, not a variation of the previous one. "
        + (job.get("requisito") or "")
    ).strip()

    # 1) roteiro. Ou vem pronto do usuario, ou o Screenwriter escreve a partir do
    #    tema. As duas portas existem porque quem ja tem o texto nao deve pagar
    #    duas chamadas para o modelo reescrever o que ele mesmo escreveu.
    roteiro = (job.get("roteiro") or "").strip()
    historia = ""
    if not roteiro:
        tema = (job.get("tema") or "").strip()
        if not tema:
            raise ValueError('mande "tema" (uma ideia) ou "roteiro" (o texto pronto)')
        log("escrevendo a historia a partir do tema")
        historia = await com_rodizio(rod, "historia", lambda c: Screenwriter(
            chat_model=c).develop_story(idea=tema, user_requirement=requisito))
        log("quebrando a historia em cenas")
        partes = await com_rodizio(rod, "roteiro", lambda c: Screenwriter(
            chat_model=c).write_script_based_on_story(
                story=historia, user_requirement=requisito))
        roteiro = "\n\n".join(p.strip() for p in partes if p and p.strip())

    # 2) personagens. E a etapa que justifica o ViMax estar aqui.
    log("extraindo personagens")
    personagens = await com_rodizio(rod, "personagens", lambda c: CharacterExtractor(
        chat_model=c).extract_characters(script=roteiro))
    log(str(len(personagens)) + " personagem(ns): "
        + ", ".join(p.identifier_in_scene for p in personagens))

    # 3) storyboard. Sai como ShotBriefDescription: idx, cam_idx, visual_desc,
    #    audio_desc. O decompose_visual_description do ViMax fica de fora de
    #    proposito: ele quebra o plano em primeiro/ultimo quadro para o modelo de
    #    VIDEO interpolar, e aqui cada cena e uma imagem parada.
    log("desenhando o storyboard")
    storyboard = await com_rodizio(rod, "storyboard", lambda c: StoryboardArtist(
        chat_model=c).design_storyboard(
            script=roteiro, characters=personagens, user_requirement=requisito))
    log(str(len(storyboard)) + " plano(s)")
    if not storyboard:
        raise ValueError("o storyboard voltou vazio")

    # 4) adaptacao para o formato do app
    avisos = []

    class CenaAdaptada(BaseModel):
        idx: int = Field(description="The shot this scene came from; the first one, "
                                     "when several shots were merged into one scene.")
        narration_text: str = Field(description="Spoken line, also the on-screen caption.")
        image_prompt: str = Field(description="English one-sentence image prompt.")

    class AdaptacaoResponse(BaseModel):
        scenes: List[CenaAdaptada] = Field(description="One scene per shot, in order.")

    parser = PydanticOutputParser(pydantic_object=AdaptacaoResponse)

    total = len(storyboard)

    # O idx que o modelo escreveu no storyboard nao serve como identidade: ja
    # voltou repetido e ja voltou comecando do 1. Como e ele que decide a ORDEM
    # das cenas la embaixo, o plano vai numerado pela POSICAO na lista e o idx
    # de origem e ignorado -- cena fora de ordem vira narracao sem sentido, e
    # em silencio.
    planos = []
    for i, s in enumerate(storyboard):
        visual = resolver_marcadores(s.visual_desc, personagens)
        audio = resolver_marcadores(s.audio_desc or "", personagens)
        bloco = "Shot " + str(i) + ":\nVisual: " + visual
        if audio.strip():
            bloco += "\nAudio: " + audio
        planos.append(bloco)

    if total != alvo:
        # o storyboard nao obedeceu o "exactly N shots" do requisito. Nao e
        # motivo para desistir: a adaptacao junta ou divide planos ate fechar em
        # alvo, e e ela quem tem o roteiro inteiro na frente para escolher onde.
        log("o storyboard veio com " + str(total) + " plano(s) para " + str(alvo)
            + " cena(s); a adaptacao acerta a conta")

    mensagens = [
        ("system", PROMPT_ADAPTACAO_SISTEMA.format(
            idioma=idioma,
            estilo=estilo,
            enquadramento=enquadramento_de(formato),
            format_instructions=parser.get_format_instructions(),
            total=total,
            alvo=alvo,
        )),
        ("human", PROMPT_ADAPTACAO_HUMANO.format(
            personagens=ficha_de_personagens(personagens),
            planos="\n\n".join(planos),
            alvo=alvo,
            total=total,
        )),
    ]

    async def uma_adaptacao(c):
        return await asyncio.wait_for(
            (c | parser).ainvoke(mensagens), timeout=ADAPTACAO_TIMEOUT,
        )

    resposta = None
    for tentativa in range(1, ADAPTACAO_TENTATIVAS + 1):
        log("adaptando os planos para cena do app (tentativa %d/%d)"
            % (tentativa, ADAPTACAO_TENTATIVAS))
        try:
            # erro de CHAVE troca de chave la dentro e nao gasta tentativa; o que
            # chega aqui e JSON torto, prazo estourado ou contagem errada
            resposta = await com_rodizio(rod, "adaptacao", uma_adaptacao)
            vieram = len(resposta.scenes)
            if vieram == alvo:
                break
            erro = "voltaram " + str(vieram) + " cena(s) em vez de " + str(alvo)
        except asyncio.TimeoutError:
            resposta = None
            erro = "passou de " + str(ADAPTACAO_TIMEOUT) + " s"
        except Exception as e:
            resposta = None
            erro = type(e).__name__ + ": " + str(e)

        log("adaptacao: " + erro)
        if tentativa == ADAPTACAO_TENTATIVAS:
            if resposta is None:
                raise ValueError("a adaptacao falhou nas " + str(ADAPTACAO_TENTATIVAS)
                                 + " tentativas. Ultimo erro -- " + erro)
            # veio cena boa, so na quantidade errada: entregar e avisar e melhor
            # do que jogar fora 4 chamadas ja pagas por causa da contagem
            log("entregando as " + str(len(resposta.scenes)) + " cena(s) assim mesmo")
            avisos.append("O modelo devolveu " + str(len(resposta.scenes))
                          + " cena(s) em vez das " + str(alvo) + " pedidas.")
            break
        # a espera cresce porque, depois do JSON torto, o erro mais comum aqui e
        # o 429 do nivel gratuito -- esse passa sozinho no minuto seguinte
        await asyncio.sleep(2 * tentativa)

    # Com o merge de planos o idx deixou de ser uma permutacao: virou de onde a
    # cena veio. Entao a ordem que vale e a ordem em que o modelo respondeu, e o
    # idx so serve para consertar quando ele escreveu fora de ordem mas numerou
    # certo. Fora da faixa, nao da para consertar nada -- o sorted() de antes
    # embaralhava as cenas nesse caso, e em silencio.
    cenas = list(resposta.scenes)
    idxs = [c.idx for c in cenas]
    if all(0 <= n < total for n in idxs):
        if idxs != sorted(idxs):
            log("a adaptacao respondeu fora de ordem; reordenando pelo idx dos planos")
            cenas = sorted(cenas, key=lambda c: c.idx)
    else:
        log("idx da adaptacao fora da faixa dos planos; mantendo a ordem da resposta")

    scenes = [{"narration_text": c.narration_text.strip(),
               "image_prompt": c.image_prompt.strip()}
              for c in cenas if c.narration_text.strip() or c.image_prompt.strip()]
    if not scenes:
        raise ValueError("o modelo devolveu storyboard mas nenhuma cena aproveitavel")

    # O app le "scenes" e ignora o resto. Os outros campos ficam para conferir de
    # onde a cena veio, e "ficha_personagens" da para colar direto no campo
    # "Personagem" do janela Chaves.
    if rod.esgotadas:
        avisos.append(str(len(rod.esgotadas)) + " chave(s) do Gemini estouraram durante o planejamento.")

    return {
        "scenes": scenes,
        # o app usa os dois: "avisos" vira linha no Diagnostico e "chaves_esgotadas"
        # apaga o pontinho da chave que morreu, do mesmo jeito que o rodizio do
        # navegador ja faz
        "avisos": avisos,
        "chaves_esgotadas": list(rod.esgotadas),
        "cenas_pedidas": alvo,
        "personagens": [p.model_dump() for p in personagens],
        "ficha_personagens": ficha_de_personagens(personagens),
        "roteiro": roteiro,
        "historia": historia,
        "_vimax": {
            "storyboard": [s.model_dump() for s in storyboard],
            "modelo": llm_cfg["model"],
        },
    }


def main():
    # o andamento tambem passa por um pipe; sem isto um nome de personagem
    # acentuado derrubava o log com UnicodeEncodeError no meio do planejamento
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

    bruto = sys.stdin.buffer.read()
    try:
        job = json.loads(bruto.decode("utf-8") or "{}")
    except (UnicodeDecodeError, json.JSONDecodeError) as e:
        responder({"detail": "stdin nao e JSON valido: " + str(e)})
        return 2
    if not isinstance(job, dict):
        responder({"detail": "o job precisa ser um objeto JSON"})
        return 2

    try:
        saida = asyncio.run(planejar(job))
    except ModuleNotFoundError as e:
        responder({"detail": "dependencia faltando (" + str(e.name) + "). "
                             "Rode: python vimax_setup.py"})
        return 3
    except Exception as e:
        # desembrulha antes de responder: o RetryError da tenacity so mostra o
        # endereco de um Future, e era isso que chegava no app como "o que deu
        # errado" quando qualquer agente do ViMax esgotava as tentativas
        responder({"detail": texto_do_erro(e)})
        return 1

    responder(saida)
    return 0


if __name__ == "__main__":
    sys.exit(main())
