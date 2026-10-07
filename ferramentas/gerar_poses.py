#!/usr/bin/env python3
"""
Gera poses novas do mascote na Replicate, usando a folha de personagem
(MascoteRef/mascote.jpeg) como referencia para manter o visual.

Cada chamada gera UMA folha com varias poses lado a lado (mais barato que uma
imagem por pose); depois as poses sao recortadas para remotion/public/mascote/.

    python ferramentas/gerar_poses.py --schema          # confere o modelo (nao cobra)
    python ferramentas/gerar_poses.py --folha 1         # gera a folha 1 (cobra 1 imagem)

O token NAO e passado na linha de comando nem impresso: vem da variavel
REPLICATE_API_TOKEN ou de uma linha REPLICATE_API_TOKEN=... no arquivo .env
na raiz do app (o .env esta no .gitignore).
"""

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELO = "google/nano-banana"
REF = os.path.join(APP_DIR, "MascoteRef", "mascote.jpeg")
SAIDA = os.path.join(APP_DIR, "MascoteRef", "geradas")

BASE = (
    "Character turnaround sheet of EXACTLY this same chibi character from the reference image: "
    "same face (two vertical black line eyes, no mouth), same messy black hair covering one eye, "
    "olive green bomber jacket with sand-colored cuffs, black t-shirt, black headphones around the neck, "
    "black fingerless gloves, black cargo pants, black combat boots, same 2D cartoon line art and colors. "
    "Plain flat light gray background (#ECEAE5), no scenery, no text, no labels, no shadows on the floor. "
    "Full body, each pose separated with generous empty space, all poses the same size, in one single row: "
)
FOLHAS = {
    1: BASE + "(1) pointing to the right with one arm extended, (2) typing on an open laptop held in one arm, "
              "(3) thinking with hand on chin, (4) celebrating with both fists raised, (5) giving a thumbs up.",
    2: BASE + "(1) surprised with both hands up, (2) scratching the back of the head confused, "
              "(3) arms crossed confident, (4) waving hello, (5) sitting cross-legged with laptop on lap.",
    3: BASE + "(1) explaining with one open palm extended to the side like presenting something, "
              "(2) index finger pointing straight up having an idea, (3) facepalm with one hand covering the face, "
              "(4) shrugging with both palms up, (5) giving a clear thumbs up with one hand in front of the chest.",
    4: BASE + "(1) leaning forward investigating with a magnifying glass, (2) holding a coffee mug with both hands, "
              "(3) sad and slumped with head down and arms hanging, (4) jumping in the air excited with both feet off the ground, "
              "(5) running to the right.",
    5: BASE + "(1) holding a large BLANK white rectangular sign board with both hands in front of the body, the board is completely empty with no writing, "
              "(2) a glowing yellow lightbulb floating above the head, looking up with an idea, (3) yawning tired with one arm stretching up, "
              "(4) making a peace sign V with two fingers, (5) bowing politely to say thank you.",
}


def token():
    t = os.environ.get("REPLICATE_API_TOKEN", "").strip()
    if t:
        return t
    env = os.path.join(APP_DIR, ".env")
    if os.path.isfile(env):
        with open(env, encoding="utf-8") as fh:
            for linha in fh:
                if linha.strip().startswith("REPLICATE_API_TOKEN="):
                    return linha.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("Sem token: crie o arquivo .env na raiz do app com a linha REPLICATE_API_TOKEN=r8_...")


def api(metodo, caminho, corpo=None):
    req = urllib.request.Request(
        "https://api.replicate.com/v1/" + caminho,
        data=json.dumps(corpo).encode() if corpo is not None else None,
        method=metodo,
        # sem User-Agent o Cloudflare da Replicate responde 403 ao urllib
        headers={"Authorization": "Bearer " + token(), "Content-Type": "application/json",
                 "Prefer": "wait", "User-Agent": "vscreator-gerar-poses/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit("Replicate respondeu %d: %s" % (e.code, e.read().decode("utf-8", "replace")[:400]))


def schema():
    m = api("GET", "models/" + MODELO)
    entrada = m["latest_version"]["openapi_schema"]["components"]["schemas"]["Input"]["properties"]
    for nome, p in entrada.items():
        print("%-16s %s %s" % (nome, p.get("type", ""), p.get("enum", p.get("default", ""))))


def gerar(n):
    with open(REF, "rb") as fh:
        ref = "data:image/jpeg;base64," + base64.b64encode(fh.read()).decode()
    pred = api("POST", "models/%s/predictions" % MODELO, {
        "input": {"prompt": FOLHAS[n], "image_input": [ref], "aspect_ratio": "16:9", "output_format": "png"},
    })
    while pred["status"] not in ("succeeded", "failed", "canceled"):
        time.sleep(2)
        pred = api("GET", "predictions/" + pred["id"])
    if pred["status"] != "succeeded":
        sys.exit("falhou: %s" % pred.get("error"))
    url = pred["output"] if isinstance(pred["output"], str) else pred["output"][0]
    os.makedirs(SAIDA, exist_ok=True)
    destino = os.path.join(SAIDA, "folha_%d.png" % n)
    urllib.request.urlretrieve(url, destino)
    print(destino)
    print("tempo de GPU: %ss" % (pred.get("metrics", {}).get("predict_time")))


if __name__ == "__main__":
    if sys.argv[1:] == ["--schema"]:
        schema()
    elif len(sys.argv) == 3 and sys.argv[1] == "--folha" and int(sys.argv[2]) in FOLHAS:
        gerar(int(sys.argv[2]))
    else:
        sys.exit(__doc__)
