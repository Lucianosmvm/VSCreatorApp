#!/usr/bin/env python3
"""Gera plano.json do EP. 06 (a vila cresce: estrada até a mina, Bairro da Mina e estátua do Astro).

    python projetos/mundo-pixelandia-06/montar_plano.py          # plano com tempos estimados
    python projetos/mundo-pixelandia-06/montar_plano.py focos    # depois de "voz.py tempos": alinha as setas aos nomes no áudio
"""
import json
import os
import sys
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
# Pontos do mundo (pixels; CX*T = 1280, CY*T = 960)
PRACA = (1288, 968)
ESTATUA = (1488, 1004)
BORDA = (1592, 872)
ESTRADA_BAIXO = (1688, 904)
ESTRADA_MEIO = (1688, 792)
MINA = (1688, 700)
BAIRRO = (1640, 836)
VISAO = (1500, 860)
PEDRO_PEDREIRO = 4  # id: separa do Pedro médico e do Pedro do BOPE
NOVOS = [m["nome"] for m in json.load(open(os.path.join(AQUI, "novos.json"), encoding="utf-8"))]

# nome, grupo, de, para, linhas, fala, extras
CENAS = [
    ("abertura", ["Samuel", "Astro Novalite", "Lago"], ESTATUA, ESTATUA,
     ["Mundo Pixelândia #6 🗳️\nA ESTÁTUA SERÁ DO ASTRO!"],
     ["Episódio seis. A votação acabou: a estátua da praça vai ser do Astro Novalite!"],
     {"hora": 10, "durante": {"t": 1.6, "js": "firework(cam.x-40,cam.y-60);firework(cam.x+45,cam.y-75)"}}),
    ("astro", ["Astro Novalite", "Lago", "Robson"], ESTATUA, ESTATUA,
     ["Quem viu a luz primeiro…\nGANHOU UMA ESTÁTUA 🗿"],
     ["Logo ele, que viu a luz de madrugada e começou toda essa história."], {"z": 6.2}),
    ("plano", ["Samuel", "Elias", "Buzz"], PRACA, PRACA,
     ["O prefeito Samuel quis mais:\nA VILA VAI CRESCER!", "Plano do Elias e do Buzz:\nESTRADA NOVA ATÉ A MINA 🛣️"],
     ["Mas o prefeito Samuel quis mais: a vila não cabe mais na clareira.",
      "O engenheiro Elias e o arquiteto Buzz desenharam o plano: uma estrada nova até a mina."], {}),
    ("floresta", ["Bruno", "Phil", "Jean"], BORDA, BORDA,
     ["Bruno e Phil 🪓\nABRIRAM A FLORESTA"],
     ["Bruno e Phil, da serraria, abriram caminho na floresta, árvore por árvore."],
     {"z": 4.2, "obra": {"abrir": [0, 0.6]}}),
    ("estrada", [PEDRO_PEDREIRO, "Isaac", "Buzz"], ESTRADA_BAIXO, ESTRADA_MEIO,
     ["Pedro e Isaac 🔨\nASSENTARAM A ESTRADA"],
     ["Logo atrás, o Pedro pedreiro e o Isaac assentaram a estrada, pedra por pedra."],
     {"z": 4.2, "obra": {"abrir": [0.6, 1], "estrada": [0, 1]}}),
    ("pietro-oliveira", ["Pietro", "Pietro Oliveira", "Lago"], MINA, MINA,
     ["Pietro Oliveira chegou ⚔️\nO GUARDIÃO DA VILA", "Armadura top e espada grande:\nVAI GUARDAR A MINA"],
     ["Na boca da mina, chegou o Pietro Oliveira: o guardião da vila, de armadura top e espada grande.",
      "Servo do rei e explorador, ele vai guardar a mina junto com o outro Pietro."], {}),
    ("pedra", ["Victor", "Vicente", "João Pedro"], ESTRADA_MEIO, (1688, 850),
     ["Pedra da mina 🪨\nJOÃO PEDRO FEZ A ESCOLTA", "Estrada com postes 💡\nVIGIA NOTURNA GARANTIDA"],
     ["Pela estrada nova, Victor e Vicente trouxeram a pedra, com escolta do João Pedro, do Bope.",
      "E a estrada ganhou postes, para a vigia da madrugada."],
     {"durante": {"t": 3.5, "js": "window.__px6.postes()"}}),
    ("casas", [PEDRO_PEDREIRO, "Isaac", "Elias"], BAIRRO, BAIRRO,
     ["Nasceu um bairro novo 🏘️\nO BAIRRO DA MINA!"],
     ["Na beira da estrada, nasceu um bairro novo: o Bairro da Mina, com três casas."],
     {"durante": {"t": 1.0, "js": "window.__px6.casas();firework(cam.x,cam.y-70)"}}),
    ("gabriel", ["Gabriel", "Samuel", "Kyle"], BAIRRO, BAIRRO,
     ["Gabriel, político 🎩\nJÁ CHEGOU FAZENDO CAMPANHA"],
     ["O primeiro morador do bairro é o Gabriel, político. Mal chegou e já apertou a mão do prefeito e do Kyle."], {}),
    ("carlos", ["Carlos", "Dandy"], MINA, ESTRADA_MEIO,
     ["Carlos, adolescente skatista 🛹\nESTREOU A ESTRADA NOVA"],
     ["E o Carlos, adolescente que adora skate, estreou a estrada nova antes de todo mundo. O Dandy gravou tudo."], {}),
    ("flores", ["Laura", "Julia Marina", "Latifa"], PRACA, PRACA,
     ["Flores novas na praça 🌷\nLAURA E JULIA MARINA"],
     ["Na praça, a Laura e a Julia Marina plantaram flores novas."],
     {"durante": {"t": 0.6, "js": "window.__px6.flores()"}}),
    ("estatua", ["Isaac", "Elias", "Astro Novalite"], ESTATUA, ESTATUA,
     ["Com a pedra da mina…\nA ESTÁTUA DO ASTRO FICOU PRONTA! 🗿"],
     ["Com a pedra da mina, Isaac e Elias ergueram a estátua. E lá está ela: o Astro Novalite, de pedra, na praça!"],
     {"clima": "vitoria", "durante": {"t": 1.2, "js": "window.__px6.estatua('Astro Novalite');firework(cam.x-40,cam.y-70);firework(cam.x+40,cam.y-80)"}}),
    ("visao", [], VISAO, (1560, 820),
     ["Onde era floresta…\nAGORA TEM ESTRADA E BAIRRO 🏘️"],
     ["Olha a diferença: onde era floresta, agora tem estrada, postes e um bairro inteiro."],
     {"z": 2.2}),
    ("meta", ["Samuel", "Gabriel", "Carlos", "Pietro Oliveira", "Astro Novalite", "Elias"], PRACA, PRACA,
     ["54 moradores! 🎉\nPRÓXIMA META: O FAROL (100) 🗼"],
     ["Com os três novos, a vila chegou a cinquenta e quatro moradores. A próxima meta é cem, e o farol."],
     {"z": 3.8}),
    ("convite", ["Samuel", "Gabriel", "Carlos", "Pietro Oliveira", "Victor", "Elias"], PRACA, PRACA,
     ["Quer uma casa no Bairro da Mina?\nCOMENTE APELIDO + PROFISSÃO", "Curta e se inscreva!\nNO #7 VOCÊ PODE APARECER"],
     ["Quer uma casa no Bairro da Mina? Comente seu apelido e sua profissão.",
      "Curta, se inscreva, e no episódio sete você pode aparecer."],
     {"cta": True, "z": 3.8}),
    ("gancho", ["Samuel", "zHero", "Kyle", "Gabriel"], PRACA, PRACA,
     ["No #7: ELEIÇÃO! 🗳️\nSAMUEL, ZHERO, KYLE… OU GABRIEL?"],
     ["No episódio sete tem eleição. Samuel, Z-Hero, Kyle… ou o Gabriel?"],
     {"clima": "misterio", "z": 4.4}),
]


def cena_js(grupo, de, para, travel, obra):
    s = {"names": grupo, "x": de[0], "y": de[1], "endX": para[0], "endY": para[1], "travel": travel, "obra": obra}
    return f"window.__ep6scene={{...{json.dumps(s, ensure_ascii=False)},started:gtime}};"


def montar():
    ampliacao = open(os.path.join(AQUI, "ampliacao.js"), encoding="utf-8").read()
    cenario = open(os.path.join(AQUI, "cenario.js"), encoding="utf-8").read()
    cenas = []
    for i, (nome, grupo, de, para, linhas, fala, extras) in enumerate(CENAS):
        dur = round(max(2.4, sum(len(f.split()) for f in fala) * 0.42), 2)
        antes = (ampliacao + "\n" + cenario + "\n" if i == 0 else "")
        if i == len(CENAS) - 1:
            antes += "window.__px6.tudo('Astro Novalite');"  # garante a ampliação inteira no vila.json
        antes += cena_js(grupo, de, para, dur, extras.get("obra"))
        # a câmera é dirigida pelo cenário; "seguir" só ativa o modo de cena acompanhada
        alvo = next((g for g in grupo if isinstance(g, str)), "Samuel")
        c = {"nome": nome, "seguir": alvo, "z": extras.get("z", 5), "dur": dur, "linhas": linhas, "fala": fala, "antes": antes,
             "focos": [{"t": 0, "nome": None}]}
        for k in ("hora", "clima", "cta", "durante"):
            if k in extras:
                c[k] = extras[k]
        texto = " ".join(fala)
        for novo in [g for g in grupo if g in NOVOS]:
            if novo.split()[0] in texto:
                pos = len(texto[: texto.index(novo.split()[0])].split())
                c["focos"].append({"t": round(pos * 0.4, 2), "nome": novo})
        c["focos"].sort(key=lambda f: f["t"])
        cenas.append(c)
    plano = {"episodio": 6, "status": "plano", "salvarDepois": True,
             "historia": "A votação escolhe o Astro Novalite para a estátua. O prefeito Samuel manda a vila crescer: Bruno e Phil "
                         "abrem a floresta, Pedro e Isaac fazem a estrada até a mina, que ganha postes e o Bairro da Mina com três casas. "
                         "Chegam Pietro Oliveira (guardião), Gabriel (político) e Carlos (skatista). Isaac e Elias erguem a estátua de "
                         "pedra do Astro. 54 moradores; no #7, eleição.",
             "cenas": cenas}
    json.dump(plano, open(os.path.join(AQUI, "plano.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(cenas)} cenas, ~{round(sum(c['dur'] for c in cenas))} s estimados")


def sem_acento(s):
    return "".join(ch for ch in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(ch) != "Mn")


def focos():
    plano_p = os.path.join(AQUI, "plano.json")
    plano = json.load(open(plano_p, encoding="utf-8"))
    tl = json.load(open(os.path.join(RAIZ, "remotion", "public", "videos", "mundo-pixelandia-06-voz", "timeline.json"), encoding="utf-8"))
    for c, t in zip(plano["cenas"], tl["cenas"]):
        palavras = [sem_acento(p.get("w") or "") for p in t["palavras"]]
        novos = [f["nome"] for f in c["focos"] if f["nome"]]
        if not novos:
            continue
        lista = [{"t": 0, "nome": None}]
        for nome in novos:
            alvo = sem_acento(nome.split()[0])
            k = next((i for i, p in enumerate(palavras) if alvo in p), None)
            if k is not None:
                lista.append({"t": round(t["palavras"][k]["t"], 2), "nome": nome})
        c["focos"] = sorted(lista, key=lambda f: f["t"])
    json.dump(plano, open(plano_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("setas alinhadas ao áudio")


if __name__ == "__main__":
    focos() if sys.argv[1:] == ["focos"] else montar()
