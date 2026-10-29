"""Teste local do MP4, sem consumir APIs: python tests/remotion_smoke.py [URL]."""
import io
import json
from pathlib import Path
import sys
import time
import urllib.request
import urllib.error
import wave

base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8777"


def request(route, body=None, mime="application/json"):
    if isinstance(body, dict):
        body = json.dumps(body).encode()
    req = urllib.request.Request(base + route, data=body, headers={"Content-Type": mime})
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            data = response.read()
            return json.loads(data) if "json" in response.headers.get("Content-Type", "") else data
    except urllib.error.HTTPError as error:
        raise RuntimeError(error.read().decode()) from error


audio = io.BytesIO()
with wave.open(audio, "wb") as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(44100)
    wav.writeframes(b"\0\0" * 44100)
image = (Path(__file__).resolve().parents[1] / "remotion/public/mascote/frente.png").read_bytes()

for width, height in [(432, 768), (768, 432)]:
    timeline = {"fps": 24, "largura": width, "altura": height, "duracao": 1,
                "legenda": {"pos": 80, "estilo": "outline"}, "cenas": [
                    {"inicio": 0, "dur": 1, "janela": 0, "texto": "Teste local",
                     "palavras": [{"w": "Teste", "t": 0}, {"w": "local", "t": 0.5}],
                     "imagem": "cena_000.png", "audio": "cena_000.wav"}]}
    job = request("/remotion", timeline)["job"]
    request(f"/remotion/{job}/arquivo?nome=cena_000.png", image, "image/png")
    request(f"/remotion/{job}/arquivo?nome=cena_000.wav", audio.getvalue(), "audio/wav")
    request(f"/remotion/{job}/montar", b"")
    deadline = time.monotonic() + 300
    while time.monotonic() < deadline:
        state = request(f"/remotion/{job}")
        if state["estado"] == "erro":
            raise RuntimeError(state["detalhe"])
        if state["estado"] == "pronto":
            mp4 = request(f"/remotion/{job}/mp4")
            assert mp4[4:8] == b"ftyp" and len(mp4) > 1000
            print(f"OK {width}x{height}: {len(mp4)} bytes, {job}", flush=True)
            break
        time.sleep(1)
    else:
        raise TimeoutError(job)
