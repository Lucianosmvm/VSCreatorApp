#!/usr/bin/env python3
"""
Narra um projeto direto pela ElevenLabs, sem passar pelo navegador, e entrega
a timeline para o Claude montar o video — o mesmo resultado do
"🎤 Narração" + "🤖 Enviar para o Claude" do app.

    python ferramentas/narrar.py <id-do-projeto>

A chave vem de ELEVENLABS_API_KEY no ambiente ou de uma linha
ELEVENLABS_API_KEY=... no .env da raiz (o .env esta no .gitignore).

Segue o modo "faixa" do app (narrarFaixa no index.html): o roteiro inteiro em
blocos de tamanho parecido (~1.200 caracteres), cada um com o texto vizinho
como contexto e costurado ao anterior (previous_request_ids), fatiado por cena
pelo alinhamento por caractere do /with-timestamps.

Saida: remotion/public/videos/<id>/timeline.json + cena_000.wav, cena_001.wav...
"""

import base64
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
import wave

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJETOS = os.path.join(APP_DIR, "projetos")
VIDEOS = os.path.join(APP_DIR, "remotion", "public", "videos")
EL_API = "https://api.elevenlabs.io/v1"
VOZ_PADRAO = "BY2YHOQTNuJ2oMUKv3Kg"
SEP = "\n\n"          # separador entre cenas: vira pausa natural na locucao
BLOCO = 1200
CTX_MAX = 300


def chave():
    k = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if k:
        return k
    env = os.path.join(APP_DIR, ".env")
    if os.path.isfile(env):
        with open(env, encoding="utf-8") as fh:
            for linha in fh:
                if linha.strip().startswith("ELEVENLABS_API_KEY="):
                    return linha.split("=", 1)[1].strip()
    sys.exit("Sem chave: crie o .env na raiz do app com a linha ELEVENLABS_API_KEY=...")


def ffmpeg():
    achado = shutil.which("ffmpeg")
    if achado:
        return achado
    c = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Links", "ffmpeg.exe")
    if os.path.isfile(c):
        return c
    sys.exit("ffmpeg nao encontrado (winget install ffmpeg)")


def num(v, padrao, lo, hi):
    try:
        x = float(v)
    except (TypeError, ValueError):
        return padrao
    return x if lo <= x <= hi else padrao


def blocos_da_faixa(alvos):
    """Mesma divisao do blocosDaFaixa() do app: partes de tamanho parecido."""
    total = sum(len(x["texto"]) + len(SEP) for x in alvos)
    n = max(1, math.ceil(total / BLOCO))
    cota = total / n
    blocos, atual, tam = [], [], 0
    for x in alvos:
        t = len(x["texto"]) + len(SEP)
        if atual and len(blocos) < n - 1 and tam + t - cota > cota - tam:
            blocos.append(atual)
            atual, tam = [], 0
        atual.append(x)
        tam += t
    if atual:
        blocos.append(atual)
    return blocos


def indice_do_alinhamento(chars, texto):
    """posicao no texto -> indice no alinhamento (casando so nao-brancos)."""
    if "".join(chars) == texto:
        return lambda i: i
    dt = [i for i, c in enumerate(texto) if not c.isspace()]
    da = [i for i, c in enumerate(chars) if not c.isspace()]
    if len(dt) != len(da) or not dt:
        return None

    def idx(pos):
        lo, hi, k = 0, len(dt) - 1, len(dt) - 1
        while lo <= hi:
            m = (lo + hi) // 2
            if dt[m] >= pos:
                k, hi = m, m - 1
            else:
                lo = m + 1
        return da[min(k, len(da) - 1)]
    return idx


def tts(key, voz, corpo):
    url = "%s/text-to-speech/%s/with-timestamps?output_format=mp3_44100_128" % (EL_API, voz)
    req = urllib.request.Request(url, data=json.dumps(corpo).encode("utf-8"), method="POST", headers={
        "xi-api-key": key, "Content-Type": "application/json", "Accept": "application/json"})
    ultimo = None
    for _ in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                rid = r.headers.get("request-id") or r.headers.get("x-request-id")
                return json.loads(r.read().decode("utf-8")), rid
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")[:400]
            if e.code < 500 and e.code != 429:
                sys.exit("ElevenLabs HTTP %d: %s" % (e.code, msg))
            ultimo = "HTTP %d: %s" % (e.code, msg)
        except (urllib.error.URLError, TimeoutError) as e:
            ultimo = str(e)
    sys.exit("ElevenLabs falhou 3x: %s" % ultimo)


def mp3_para_pcm(mp3, pasta):
    """Decodifica para WAV 16-bit e devolve (amostras-bytes, taxa, canais)."""
    ent, sai = os.path.join(pasta, "b.mp3"), os.path.join(pasta, "b.wav")
    with open(ent, "wb") as fh:
        fh.write(mp3)
    subprocess.run([ffmpeg(), "-y", "-v", "error", "-i", ent, "-acodec", "pcm_s16le", sai], check=True)
    with wave.open(sai, "rb") as w:
        return w.readframes(w.getnframes()), w.getframerate(), w.getnchannels()


def gravar_wav(caminho, pcm, taxa, canais):
    with wave.open(caminho, "wb") as w:
        w.setnchannels(canais)
        w.setsampwidth(2)
        w.setframerate(taxa)
        w.writeframes(pcm)


def main():
    if len(sys.argv) != 2 or not re.match(r"^[a-z0-9-]{1,80}$", sys.argv[1]):
        sys.exit(__doc__)
    pid = sys.argv[1]
    with open(os.path.join(PROJETOS, pid, "projeto.json"), encoding="utf-8") as fh:
        proj = json.load(fh)

    key = chave()
    voz = (proj.get("voiceManual") or proj.get("voiceSel") or VOZ_PADRAO).strip()
    modelo = proj.get("elModel") or "eleven_v4"
    config = {"stability": 0.65, "similarity_boost": 0.75,
              "speed": num(proj.get("elVelocidade"), 1, 0.7, 1.2)}
    fps = int(num(proj.get("fps"), 24, 1, 60))
    larg, alt = (int(x) for x in (proj.get("resolution") or "1080x1920").split("x"))
    trans = num(proj.get("transition"), 0.25, 0, 1.5)

    frames = proj.get("frames") or []
    alvos = [{"i": i, "f": f, "texto": (f.get("narration") or f.get("text") or "").strip()}
             for i, f in enumerate(frames)]
    alvos = [x for x in alvos if x["texto"]]
    if len(alvos) != len(frames):
        sys.exit("todas as cenas precisam de texto")

    destino = os.path.join(VIDEOS, pid)
    shutil.rmtree(destino, ignore_errors=True)       # renarrar substitui
    os.makedirs(destino)
    blocos = blocos_da_faixa(alvos)
    print("narrando %d cenas em %d bloco(s)" % (len(alvos), len(blocos)), flush=True)

    cenas, t_total, req_ant = [], 0.0, None
    with tempfile.TemporaryDirectory() as tmp:
        for b, bloco in enumerate(blocos):
            print("bloco %d/%d" % (b + 1, len(blocos)), flush=True)
            combinado = ""
            for x in bloco:
                if combinado:
                    combinado += SEP
                x["ini"] = len(combinado)
                combinado += x["texto"]
                x["fim"] = len(combinado)
            corpo = {"text": combinado, "model_id": modelo, "voice_settings": config}
            if b > 0:
                corpo["previous_text"] = SEP.join(x["texto"] for x in blocos[b - 1])[-CTX_MAX:]
            if b < len(blocos) - 1:
                corpo["next_text"] = SEP.join(x["texto"] for x in blocos[b + 1])[:CTX_MAX]
            if req_ant:
                corpo["previous_request_ids"] = [req_ant]
            d, req_ant = tts(key, voz, corpo)
            al = d.get("alignment") or d.get("normalized_alignment")
            if not d.get("audio_base64") or not al or not isinstance(al.get("characters"), list):
                sys.exit("ElevenLabs nao devolveu audio com alinhamento")

            pcm, taxa, canais = mp3_para_pcm(base64.b64decode(d["audio_base64"]), tmp)
            quadro = 2 * canais
            dur = len(pcm) / quadro / taxa
            chars = al["characters"]
            st = al["character_start_times_seconds"]
            idx = indice_do_alinhamento(chars, combinado)

            def tempo(pos):
                if idx:
                    return st[max(0, min(len(st) - 1, idx(pos)))]
                return pos / len(combinado) * dur

            # as fatias se encaixam: cada uma termina onde a proxima comeca
            inicios = [0.0 if k == 0 else tempo(x["ini"]) for k, x in enumerate(bloco)]
            for k, x in enumerate(bloco):
                t0 = inicios[k]
                t1 = dur if k == len(bloco) - 1 else inicios[k + 1]
                t1 = max(t0 + 0.05, t1)
                a, z = int(t0 * taxa) * quadro, min(len(pcm), int(math.ceil(t1 * taxa)) * quadro)
                nome = "cena_%03d.wav" % x["i"]
                gravar_wav(os.path.join(destino, nome), pcm[a:z], taxa, canais)
                fatia = (z - a) / quadro / taxa

                palavras = x["texto"].split()
                tempos = None
                if idx:
                    tempos, dentro = [], False
                    for c in range(idx(x["ini"]), min(idx(x["fim"]), len(chars))):
                        if chars[c].isspace():
                            dentro = False
                        elif not dentro:
                            tempos.append(max(0.0, st[c] - t0))
                            dentro = True
                    if len(tempos) != len(palavras):
                        tempos = None
                if tempos is None:
                    tempos = [i / max(1, len(palavras)) * fatia * 0.95 for i in range(len(palavras))]

                f = x["f"]
                c = {"inicio": round(t_total, 3), "dur": round(fatia, 3),
                     "janela": round(min(trans, fatia * 0.5), 3),
                     "texto": (f.get("text") or x["texto"]).strip(),
                     "palavras": [{"w": w, "t": round(t, 3)} for w, t in zip(palavras, tempos)]}
                for campo in ("mascote", "titulo", "placa"):
                    if f.get(campo):
                        c[campo] = f[campo]
                c["audio"] = nome
                cenas.append(c)
                t_total += fatia

    tl = {"fps": fps, "largura": larg, "altura": alt, "duracao": round(t_total, 3),
          "projeto": {"id": pid, "nome": proj.get("nome") or pid},
          "legenda": {"pos": int(num(proj.get("globalPos"), 80, 0, 100)),
                      "estilo": proj.get("globalStyle") or "outline"},
          "cenas": cenas}
    with open(os.path.join(destino, "timeline.json"), "w", encoding="utf-8") as fh:
        json.dump(tl, fh, ensure_ascii=False)
    print("pronto: %.1fs, %d cenas" % (t_total, len(cenas)), flush=True)


if __name__ == "__main__":
    main()
