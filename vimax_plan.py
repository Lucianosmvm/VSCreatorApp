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


def log(msg):
    print("[vimax] " + msg, file=sys.stderr, flush=True)


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

For every shot you receive, output one scene with exactly two fields.

"narration_text" -- in {idioma}. It is what the voice says AND what is written on screen; they are the same string.
- 6 to 12 words. Spoken register, direct, no final period.
- A COMPLETE idea that stands on its own when said out loud. Never split one sentence across two scenes.
- Never end on a dangling connective (and, but, because, that, to, a comma, an ellipsis).
- Do not repeat the subject every scene; after introducing it, use a pronoun or go straight to the verb.
- Keep the same person and tense from start to finish.
- Similar length across scenes: scene duration comes from line length, so a 3-word line between two 12-word lines breaks the rhythm.
- If the shot carries dialogue, turn it into narration -- this app has one narrator voice, characters do not speak.

"image_prompt" -- in ENGLISH, one sentence. Subject + action + setting + light + framing. Concrete and cinematic.
- Carry over the character features exactly as given in the character sheet, every single time that character appears: same hair, same clothes, same build, in the same words. This is the only thing keeping the character consistent across scenes.
- Same palette, same light and same treatment across all scenes, otherwise the cross-dissolve joins two different worlds.
- No text, no letters, no logos and no watermarks in the image -- the caption is drawn on top afterwards.
- {enquadramento}
- Style, applied to every scene: {estilo}

{format_instructions}"""

PROMPT_ADAPTACAO_HUMANO = """Character sheet:
{personagens}

Storyboard ({total} shots, in order):
{planos}

Output exactly {total} scenes, in the same order, keeping "idx" as given."""


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
    from langchain_core.output_parsers import PydanticOutputParser
    from pydantic import BaseModel, Field

    from agents.character_extractor import CharacterExtractor
    from agents.screenwriter import Screenwriter
    from agents.storyboard_artist import StoryboardArtist

    llm_cfg = dict(LLM_PADRAO)
    llm_cfg.update(job.get("llm") or {})
    if not llm_cfg.get("api_key"):
        raise ValueError('faltou a chave da API em "llm.api_key"')

    chat = init_chat_model(
        model=llm_cfg["model"],
        model_provider=llm_cfg.get("provider") or "openai",
        api_key=llm_cfg["api_key"],
        base_url=llm_cfg.get("base_url") or None,
        temperature=llm_cfg.get("temperature", 0.7),
    )

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
        sw = Screenwriter(chat_model=chat)
        log("escrevendo a historia a partir do tema")
        historia = await sw.develop_story(idea=tema, user_requirement=requisito)
        log("quebrando a historia em cenas")
        partes = await sw.write_script_based_on_story(story=historia, user_requirement=requisito)
        roteiro = "\n\n".join(p.strip() for p in partes if p and p.strip())

    # 2) personagens. E a etapa que justifica o ViMax estar aqui.
    log("extraindo personagens")
    personagens = await CharacterExtractor(chat_model=chat).extract_characters(script=roteiro)
    log(str(len(personagens)) + " personagem(ns): "
        + ", ".join(p.identifier_in_scene for p in personagens))

    # 3) storyboard. Sai como ShotBriefDescription: idx, cam_idx, visual_desc,
    #    audio_desc. O decompose_visual_description do ViMax fica de fora de
    #    proposito: ele quebra o plano em primeiro/ultimo quadro para o modelo de
    #    VIDEO interpolar, e aqui cada cena e uma imagem parada.
    log("desenhando o storyboard")
    storyboard = await StoryboardArtist(chat_model=chat).design_storyboard(
        script=roteiro, characters=personagens, user_requirement=requisito,
    )
    log(str(len(storyboard)) + " plano(s)")

    # 4) adaptacao para o formato do app
    class CenaAdaptada(BaseModel):
        idx: int = Field(description="The index of the shot this scene came from.")
        narration_text: str = Field(description="Spoken line, also the on-screen caption.")
        image_prompt: str = Field(description="English one-sentence image prompt.")

    class AdaptacaoResponse(BaseModel):
        scenes: List[CenaAdaptada] = Field(description="One scene per shot, in order.")

    parser = PydanticOutputParser(pydantic_object=AdaptacaoResponse)

    planos = []
    for s in storyboard:
        visual = resolver_marcadores(s.visual_desc, personagens)
        audio = resolver_marcadores(s.audio_desc or "", personagens)
        bloco = "Shot " + str(s.idx) + ":\nVisual: " + visual
        if audio.strip():
            bloco += "\nAudio: " + audio
        planos.append(bloco)

    log("adaptando os planos para cena do app")
    cadeia = chat | parser
    resposta = await cadeia.ainvoke([
        ("system", PROMPT_ADAPTACAO_SISTEMA.format(
            idioma=idioma,
            estilo=estilo,
            enquadramento=enquadramento_de(formato),
            format_instructions=parser.get_format_instructions(),
        )),
        ("human", PROMPT_ADAPTACAO_HUMANO.format(
            personagens=ficha_de_personagens(personagens),
            planos="\n\n".join(planos),
            total=len(storyboard),
        )),
    ])

    cenas = sorted(resposta.scenes, key=lambda c: c.idx)
    scenes = [{"narration_text": c.narration_text.strip(),
               "image_prompt": c.image_prompt.strip()}
              for c in cenas if c.narration_text.strip() or c.image_prompt.strip()]
    if not scenes:
        raise ValueError("o modelo devolveu storyboard mas nenhuma cena aproveitavel")

    # O app le "scenes" e ignora o resto. Os outros campos ficam para conferir de
    # onde a cena veio, e "ficha_personagens" da para colar direto no campo
    # "Personagem" do janela Chaves.
    return {
        "scenes": scenes,
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
        responder({"detail": type(e).__name__ + ": " + str(e)})
        return 1

    responder(saida)
    return 0


if __name__ == "__main__":
    sys.exit(main())
