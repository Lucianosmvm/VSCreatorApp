#!/usr/bin/env python3
"""
Narração dos episódios do Mundo Pixelândia (voz do usuário na ElevenLabs).

    python ferramentas/pixelandia/voz.py preparar NN   # plano.json (com "fala") -> projetos/mundo-pixelandia-NN-voz/projeto.json
    python ferramentas/narrar.py mundo-pixelandia-NN-voz
    python ferramentas/pixelandia/voz.py tempos NN     # timeline da narração -> dur, audio e tempos no plano.json

Cada cena do plano precisa de "fala": uma frase por item de "linhas" (mesma quantidade).
Nomes difíceis: escrever como se fala só na "fala" (ex.: "Jéfin Gomes"); a legenda mantém o real.
A voz, o modelo e a velocidade vêm do projeto de voz do episódio 02 (BY2YHOQTNuJ2oMUKv3Kg,
eleven_v4, 0.92), para todos os episódios soarem iguais.
"""
import copy
import json
import os
import sys
import time

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELO_VOZ = os.path.join(RAIZ, "projetos", "mundo-pixelandia-02-voz", "projeto.json")


def caminhos(ep):
    nn = f"{int(ep):02d}"
    pid = f"mundo-pixelandia-{nn}"
    return nn, os.path.join(RAIZ, "projetos", pid, "plano.json"), f"{pid}-voz"


def preparar(ep):
    nn, plano_p, voz = caminhos(ep)
    plano = json.load(open(plano_p, encoding="utf-8"))
    for c in plano["cenas"]:
        fala = c.get("fala")
        if not fala or len(fala) != len(c["linhas"]):
            sys.exit(f'cena "{c["nome"]}": "fala" precisa ter uma frase por legenda ({len(c["linhas"])})')
    proj = copy.deepcopy(json.load(open(MODELO_VOZ, encoding="utf-8")))
    proj["nome"] = f"Mundo Pixelândia #{int(ep)} (narração)"
    proj["frames"] = [{"id": f"px{nn}-{i}", "text": " ".join(c["fala"]), "narration": " ".join(c["fala"])}
                      for i, c in enumerate(plano["cenas"])]
    if "frameCount" in proj:
        proj["frameCount"] = len(proj["frames"])
    proj["salvoEm"] = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
    pasta = os.path.join(RAIZ, "projetos", voz)
    os.makedirs(pasta, exist_ok=True)
    json.dump(proj, open(os.path.join(pasta, "projeto.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{voz}: {len(proj['frames'])} cenas, {sum(len(f['narration']) for f in proj['frames'])} caracteres")
    print(f"agora: python ferramentas/narrar.py {voz}")


def tempos(ep):
    _, plano_p, voz = caminhos(ep)
    tl = json.load(open(os.path.join(RAIZ, "remotion", "public", "videos", voz, "timeline.json"), encoding="utf-8"))
    plano = json.load(open(plano_p, encoding="utf-8"))
    if len(tl["cenas"]) != len(plano["cenas"]):
        sys.exit("a narração e o plano têm números de cenas diferentes: rode preparar e narrar de novo")
    for c, t in zip(plano["cenas"], tl["cenas"]):
        c["dur"] = round(t["dur"], 2)
        c["audio"] = f"videos/{voz}/{t['audio']}"
        # cada legenda entra quando começa a primeira palavra da sua frase
        marcas, n = [0], 0
        for frase in c["fala"][:-1]:
            n += len(frase.split())
            marcas.append(round(t["palavras"][min(n, len(t["palavras"]) - 1)]["t"], 2))
        c["tempos"] = marcas
    json.dump(plano, open(plano_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"plano atualizado: {round(sum(c['dur'] for c in plano['cenas']), 1)} s")


if __name__ == "__main__":
    if len(sys.argv) != 3 or sys.argv[1] not in ("preparar", "tempos"):
        sys.exit(__doc__)
    {"preparar": preparar, "tempos": tempos}[sys.argv[1]](sys.argv[2])
