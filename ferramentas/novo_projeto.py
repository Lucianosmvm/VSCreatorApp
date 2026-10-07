#!/usr/bin/env python3
"""
Cria um projeto do app a partir de um roteiro JSON — usado pelo Claude Code
quando voce pede "faz um video sobre <tema>".

    python ferramentas/novo_projeto.py roteiro.json

Formato do roteiro:
    {
      "nome": "Cartao de credito",
      "resolucao": "1920x1080",          (opcional; padrao: do ultimo projeto)
      "cenas": [
        {"texto": "fala da cena", "titulo": "frase grande", "mascote": "frente"},
        ...
      ]
    }

As configuracoes (voz, modelo da ElevenLabs, fonte, legenda...) vem do projeto
salvo mais recente, para o video novo soar igual aos anteriores. O projeto ja
nasce em modo mascote + Remotion: no app basta abrir, narrar e clicar em
"Enviar para o Claude".
"""

import json
import os
import re
import sys
import time
import unicodedata

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJETOS = os.path.join(APP_DIR, "projetos")
POSES = {"frente", "lado", "costas", "neutro", "feliz", "determinado",
         "apontando", "digitando", "pensando", "comemorando", "surpreso",
         "desconfiado", "cocando", "bracos", "acenando", "sentado"}

# campos de cena e de chaves que nao podem vazar do projeto-modelo
NAO_COPIAR = {"frames", "nome", "salvoEm", "vmTema", "vmRoteiro", "apiKeys", "elKey"}


def base36(n):
    d = "0123456789abcdefghijklmnopqrstuvwxyz"
    s = ""
    while n:
        n, r = divmod(n, 36)
        s = d[r] + s
    return s or "0"


def slug(nome):
    s = unicodedata.normalize("NFD", nome)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:40]
    return s or "projeto"


def modelo():
    """projeto.json mais recente, para herdar voz e estilo."""
    melhor, quando = {}, 0
    for nome in os.listdir(PROJETOS) if os.path.isdir(PROJETOS) else []:
        caminho = os.path.join(PROJETOS, nome, "projeto.json")
        if nome.startswith(".") or not os.path.isfile(caminho):
            continue
        if os.path.getmtime(caminho) > quando:
            try:
                with open(caminho, encoding="utf-8") as fh:
                    melhor, quando = json.load(fh), os.path.getmtime(caminho)
            except (OSError, ValueError):
                pass
    return {k: v for k, v in melhor.items() if k not in NAO_COPIAR}


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    with open(sys.argv[1], encoding="utf-8") as fh:
        roteiro = json.load(fh)
    nome = str(roteiro.get("nome") or "").strip()
    cenas = roteiro.get("cenas") or []
    if not nome or not cenas:
        sys.exit("roteiro precisa de \"nome\" e de \"cenas\"")

    agora = int(time.time() * 1000)
    frames = []
    for i, c in enumerate(cenas):
        texto = str(c.get("texto") or "").strip()
        if not texto:
            sys.exit("cena %d sem \"texto\"" % (i + 1))
        f = {"id": "f%s-%d" % (base36(agora), i), "prompt": "", "text": texto, "narration": ""}
        pose = str(c.get("mascote") or "").strip().lower()
        if pose:
            if pose not in POSES:
                sys.exit("cena %d: mascote \"%s\" nao existe (%s)" % (i + 1, pose, ", ".join(sorted(POSES))))
            f["mascote"] = pose
        if c.get("titulo"):
            f["titulo"] = str(c["titulo"]).strip()
        frames.append(f)

    projeto = modelo()
    projeto.update({
        "nome": nome,
        "frames": frames,
        "frameCount": str(len(frames)),
        "motorRemotion": True,
        "modoMascote": True,
        "renderServidor": True,
        "vidOn": False,
        "appVersao": projeto.get("appVersao", 2),
        # 1080x1920 (Shorts, ate 3 min) ou 1920x1080 (YouTube normal)
        "resolution": roteiro.get("resolucao") or projeto.get("resolution", "1080x1920"),
        "salvoEm": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
    })

    pid = "%s-%s" % (slug(nome), base36(agora))
    pasta = os.path.join(PROJETOS, pid)
    os.makedirs(pasta)
    with open(os.path.join(pasta, "projeto.json"), "w", encoding="utf-8") as fh:
        json.dump(projeto, fh, ensure_ascii=False, indent=1)
    print(pid)


if __name__ == "__main__":
    main()
