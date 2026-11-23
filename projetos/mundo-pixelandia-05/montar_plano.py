#!/usr/bin/env python3
"""Gera plano.json do EP. 05 a partir da lista de cenas abaixo.

    python projetos/mundo-pixelandia-05/montar_plano.py          # plano com tempos estimados
    python projetos/mundo-pixelandia-05/montar_plano.py focos    # depois de "voz.py tempos": alinha as setas aos nomes no áudio
"""
import json
import os
import sys
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
CLAREIRA = (1688, 648)
FLORESTA = (1656, 696)
VILA = (1288, 968)
NOVOS = [m["nome"] for m in json.load(open(os.path.join(AQUI, "novos.json"), encoding="utf-8"))]

# nome, seguir, grupo, local, prop, linhas, fala, extras
CENAS = [
    ("abertura", "Victor", ["Victor", "Jean", "Astro Novalite"], CLAREIRA, "entrada",
     ["A entrada entre as raízes…\nVICTOR CHEGOU."],
     ["Victor chegou à clareira para ver a entrada de pedra."], {"hora": 10, "clima": "misterio"}),
    ("reconhece", "Victor", ["Victor", "Jean", "Astro Novalite"], CLAREIRA, "entrada",
     ["Victor reconheceu na hora:\nA MINA ANTIGA DA VILA!"],
     ["Victor reconheceu na hora: era a entrada da mina antiga, fechada desde a fundação da vila."], {}),
    ("vicente", "Vicente", ["Victor", "Vicente", "Jean"], CLAREIRA, "entrada",
     ["Vicente, explorador de cavernas!\nO AMIGO DO VICTOR CHEGOU. 🔦"],
     ["Victor não veio sozinho. Vicente, explorador de cavernas, é amigo dele e veio entrar junto."], {}),
    ("abraao", "Abraão", ["José Alvaro", "Abraão", "Victor"], CLAREIRA, "entrada",
     ["Abraão, bombeiro! 🧯\nSEGURANÇA PRIMEIRO."],
     ["Abraão, bombeiro, conferiu a entrada com o José Alvaro antes de todo mundo. Segurança primeiro."], {}),
    ("joao-pedro", "João Pedro", ["Pedro", "João Pedro", "Jean"], CLAREIRA, "entrada",
     ["João Pedro, policial do BOPE!\nAGORA SÃO QUATRO PEDROS."],
     ["João Pedro, policial do Bope, reforçou a equipe do Jean. Agora a vila tem quatro Pedros!"], {}),
    ("davi", "Davi", ["Jean", "Davi", "Durplejoga"], CLAREIRA, "entrada",
     ["Davi, assassino furtivo 🥷\nNINGUÉM VIU ELE CHEGAR."],
     ["E o Davi, assassino furtivo? Ninguém viu ele chegar. Quando perceberam, já estava na equipe."], {}),
    ("dentro", "Vicente", ["Victor", "Vicente", "Davi"], CLAREIRA, "aberta",
     ["Vicente acendeu a lanterna.\nO TRIO ENTROU NA MINA."],
     ["Vicente acendeu a lanterna, e o trio entrou devagar pela boca da mina."], {"clima": "misterio"}),
    ("pedras", "Victor", ["Victor", "Vicente", "Davi"], CLAREIRA, "pedras",
     ["Lá dentro, nada assustador:\nPEDRA BOA E FERRAMENTAS ANTIGAS!"],
     ["Lá dentro não havia nada assustador: só pedra de ótima qualidade e as ferramentas dos fundadores."], {}),
    ("encerrado", "Astro Novalite", ["Astro Novalite", "Lago", "Victor"], CLAREIRA, "pedras",
     ["Caso do Astro: ENCERRADO! ✅\nA LUZ ERA O DRONE. A ENTRADA, A MINA."],
     ["O caso do Astro estava encerrado. A luz era o drone, e a entrada era a velha mina da vila."], {"clima": "vitoria"}),
    ("pietro", "Pietro", ["Lago", "Pietro", "Victor"], VILA, None,
     ["Pietro, guarda noturno 🌙\nO LAGO GANHOU PARCEIRO."],
     ["Na volta, Pietro, guarda noturno, assumiu a vigia da mina com o Lago. Finalmente, companhia na madrugada!"], {}),
    ("brites", "Brites", ["Samuel", "Brites", "Victor"], VILA, None,
     ["Brites, empresário 💼\nQUER INVESTIR NA PEDRA DA MINA."],
     ["Brites, empresário, foi direto falar com o prefeito Samuel: quer investir na pedra da mina."], {}),
    ("laura", "Laura", ["Julia Marina", "Laura", "Latifa"], VILA, None,
     ["Laura, da floricultura 🌷\nFLORES NOVAS PARA A PRAÇA."],
     ["Laura, da floricultura, já planeja flores novas para a praça, com a ajuda da Julia Marina."], {}),
    ("arthurs", "ArthurMendes_", ["ArthurMendes_", "Julia Marina", "Laura"], VILA, None,
     ["ArthurMendes_, o biólogo do #4 🔬\nVAI ESTUDAR AS PLANTAS DA MINA."],
     ["E o Arthur Mendes, o biólogo que chegou no episódio quatro, já quer estudar as plantas da mina."], {}),
    ("meta", "Samuel", ["Samuel", "Abraão", "Pietro", "João Pedro", "Davi", "Vicente", "Brites", "Laura", "Victor"], VILA, None,
     ["51 moradores! 🎉\nA META DA ESTÁTUA FOI BATIDA!"],
     ["Com os sete novos, a vila chegou a cinquenta e um moradores. A meta da estátua foi batida!"],
     {"clima": "vitoria", "z": 3.6, "durante": {"t": 1.5, "js": "firework(cam.x-40,cam.y-70);firework(cam.x+50,cam.y-80)"}}),
    ("destino", "Isaac", ["Isaac", "Elias", "Victor"], VILA, None,
     ["A pedra da mina tem destino:\nA PRÓXIMA ESTÁTUA DA PRAÇA. 🗿"],
     ["E a pedra da mina já tem destino: Isaac e Elias vão usar para erguer a próxima estátua da praça."], {}),
    ("convite", "Samuel", ["Samuel", "Victor", "Vicente", "Astro Novalite", "Lago", "Jean"], VILA, None,
     ["De quem vai ser a estátua?\nVOTE NOS COMENTÁRIOS!", "Comente APELIDO + PROFISSÃO\nCURTA E SE INSCREVA."],
     ["Mas de quem vai ser a estátua? Vote nos comentários com o nome do morador.",
      "E para morar na vila, comente seu apelido e sua profissão. Curta e se inscreva."], {"cta": True, "z": 3.6}),
    ("gancho", "Victor", ["Victor", "Isaac", "Elias"], VILA, None,
     ["No #6, a obra começa.\nDE QUEM SERÁ A ESTÁTUA?"],
     ["No episódio seis, a obra começa. De quem será a estátua?"], {"clima": "misterio"}),
]


def cena_js(grupo, local, prop, travel):
    s = {"names": grupo, "x": local[0], "y": local[1], "endX": local[0], "endY": local[1], "travel": travel, "prop": prop}
    return f"window.__ep5scene={{...{json.dumps(s, ensure_ascii=False)},started:gtime}};"


def montar():
    cenario = open(os.path.join(AQUI, "cenario.js"), encoding="utf-8").read()
    limpa = "for(let y=CY-23;y<=CY-15;y++)for(let x=CX+21;x<=CX+29;x++)obj[idx(x,y)]=0;\n"
    cenas = []
    for i, (nome, seguir, grupo, local, prop, linhas, fala, extras) in enumerate(CENAS):
        dur = round(max(2.4, sum(len(f.split()) for f in fala) * 0.42), 2)
        antes = (limpa + cenario + "\n" if i == 0 else "") + cena_js(grupo, local, prop, dur)
        c = {"nome": nome, "seguir": seguir, "z": extras.get("z", 5), "dur": dur, "linhas": linhas, "fala": fala, "antes": antes,
             "focos": [{"t": 0, "nome": None}]}
        for k in ("hora", "clima", "cta", "durante"):
            if k in extras:
                c[k] = extras[k]
        # setas estimadas (≈0,4 s por palavra); "focos" depois da narração usa o tempo real
        for novo in [g for g in grupo if g in NOVOS]:
            texto = " ".join(fala)
            if novo in texto:
                pos = len(texto[: texto.index(novo)].split())
                c["focos"].append({"t": round(pos * 0.4, 2), "nome": novo})
        c["focos"].sort(key=lambda f: f["t"])
        cenas.append(c)
    plano = {"episodio": 5, "status": "plano",
             "historia": "Victor reconhece a entrada: é a mina antiga dos fundadores. Vicente, Davi e Victor entram e acham pedra boa "
                         "e ferramentas. O caso do Astro é encerrado. Sete novos chegam, a vila passa de 50 e libera a estátua; "
                         "o público vota de quem será.",
             "cenas": cenas}
    json.dump(plano, open(os.path.join(AQUI, "plano.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(cenas)} cenas, ~{round(sum(c['dur'] for c in cenas))} s estimados")


def sem_acento(s):
    return "".join(ch for ch in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(ch) != "Mn")


def focos():
    plano_p = os.path.join(AQUI, "plano.json")
    plano = json.load(open(plano_p, encoding="utf-8"))
    tl = json.load(open(os.path.join(RAIZ, "remotion", "public", "videos", "mundo-pixelandia-05-voz", "timeline.json"), encoding="utf-8"))
    for c, t in zip(plano["cenas"], tl["cenas"]):
        palavras = [sem_acento(p.get("w") or p.get("texto") or p.get("palavra") or "") for p in t["palavras"]]
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
