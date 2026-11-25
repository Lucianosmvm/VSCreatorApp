#!/usr/bin/env python3
"""
Grade de conferência dos Shorts do Imagina Só: 2 quadros por cena (40% e 88%) de um rascunho
renderizado, juntos em PNGs para olhar de uma vez.

    python ferramentas/imagina_so_grade.py <id-do-projeto> <rascunho.mp4> [vel] [inicio]

- <id-do-projeto>: pasta em remotion/public/videos/<id>/ (lê timeline.json)
- <rascunho.mp4>: render em baixa (ex.: --scale=0.4 --muted)
- vel: a mesma de montarFala (padrão 1.05); inicio: padrão 0.35

Saída: <pasta do rascunho>/grade0.png, grade1.png… (12 quadros por grade) e a lista
"quadro → cena" impressa, para conferir cena por cena e renderizar só o trecho com
`--frames=a-b` depois de corrigir. Precisa de ffmpeg no PATH e de Pillow.
"""

import json
import os
import subprocess
import sys

from PIL import Image

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    pid, video = sys.argv[1], os.path.abspath(sys.argv[2])
    vel = float(sys.argv[3]) if len(sys.argv) > 3 else 1.05
    ini = float(sys.argv[4]) if len(sys.argv) > 4 else 0.35
    tl = json.load(open(os.path.join(APP, "remotion", "public", "videos", pid, "timeline.json"), encoding="utf-8"))
    pasta = os.path.dirname(video)
    S, acc = [], ini
    for c in tl["cenas"]:
        S.append(acc)
        acc += c["dur"] / vel
    quadros = []
    for k, c in enumerate(tl["cenas"]):
        d = c["dur"] / vel
        for p in (0.4, 0.88):
            quadros.append((round((S[k] + d * p) * 30), k))
    ims = []
    for f, k in quadros:
        png = os.path.join(pasta, f"f{f}.png")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf", f"select=eq(n\\,{f})", "-frames:v", "1", png], check=True)
        ims.append(Image.open(png))
        print(f"quadro {f:5d} → cena {k} ({tl['cenas'][k].get('texto', '')[:50]})")
    w, h = ims[0].size
    por = 12
    for g in range(0, len(ims), por):
        lote = ims[g:g + por]
        cols = 6
        linhas = (len(lote) + cols - 1) // cols
        grade = Image.new("RGB", (w * cols, h * linhas))
        for i, im in enumerate(lote):
            grade.paste(im, ((i % cols) * w, (i // cols) * h))
        saida = os.path.join(pasta, f"grade{g // por}.png")
        grade.save(saida)
        print("grade:", saida)


if __name__ == "__main__":
    main()
