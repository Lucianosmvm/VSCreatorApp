#!/usr/bin/env python3
"""
Sugestões do autocompletar do YouTube (pt-BR) para achar temas e montar título/tags com SEO.

    python ferramentas/yt_sugestoes.py "e se a sua mãe" "se minha mãe fosse" "mãe vs"

Usa urllib com UTF-8 de propósito: no Git Bash do Windows o `curl` com acento (ã, é…)
volta vazio. Imprime uma linha por consulta: `== consulta → sugestão | sugestão | …`.
"""

import json
import sys
import urllib.parse
import urllib.request

URL = "https://suggestqueries.google.com/complete/search?"


def sugestoes(consulta: str, n: int = 10) -> list[str]:
    q = urllib.parse.urlencode({"client": "firefox", "ds": "yt", "hl": "pt-BR", "gl": "BR", "q": consulta})
    with urllib.request.urlopen(URL + q, timeout=10) as r:
        dados = json.loads(r.read().decode("utf-8", "replace"))
    return dados[1][:n]


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    for c in sys.argv[1:]:
        try:
            print(f"== {c} → " + " | ".join(sugestoes(c)))
        except Exception as e:  # rede instável: segue para a próxima
            print(f"== {c} → ERRO {e}")
