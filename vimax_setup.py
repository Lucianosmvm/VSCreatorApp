#!/usr/bin/env python3
"""
Cria a venv do planejamento de roteiro (ViMax) e instala o minimo dela.

Uso:
    python vimax_setup.py

Fica numa venv separada, e nao no Python do serve.py, pelo mesmo motivo do
AIImage: o serve.py e stdlib puro de proposito -- ele sobe em qualquer Python
sem instalar nada, e quem nunca for usar o planejamento nao paga por isso.

O que entra aqui e so a cadeia de texto do ViMax (~200 MB, quase tudo numpy e
opencv). O ViMax completo passa de 2 GB por causa do torch, e aquela parte
(imagem, clipe, concatenacao) nao e usada -- ver o cabecalho do vimax_plan.py.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
VIMAX_DIR = SCRIPT_DIR / "ViMax"
VENV_DIR = VIMAX_DIR / ".venv"
REQUIREMENTS = SCRIPT_DIR / "vimax_requirements.txt"
REPO = "https://github.com/HKUDS/ViMax.git"


def info(msg: str) -> None:
    print(f"[vimax-setup] {msg}")


def run(cmd: list[str], **kwargs) -> None:
    info(f"Executando: {' '.join(cmd)}")
    env = dict(os.environ, PYTHONUTF8="1", PYTHONIOENCODING="utf-8")
    subprocess.run(cmd, check=True, env=env, **kwargs)


def find_python() -> str:
    """O ViMax pede >=3.12. Tenta pelo uv antes de cair no Python atual."""
    if sys.version_info >= (3, 12):
        return sys.executable
    try:
        r = subprocess.run(["uv", "python", "find", "3.12"],
                           capture_output=True, text=True, check=True)
        caminho = r.stdout.strip()
        if caminho:
            return caminho
    except (FileNotFoundError, subprocess.CalledProcessError):
        pass
    info("AVISO: o ViMax pede Python 3.12+, e este e "
         f"{sys.version_info.major}.{sys.version_info.minor}. Tentando assim mesmo.")
    return sys.executable


def main() -> int:
    # Clone raso: o historico do ViMax nao interessa e a arvore inteira sao
    # 6,7 MB. Sem --depth 1 vem muito mais so em commit antigo.
    if not (VIMAX_DIR / "agents").is_dir():
        info(f"Clonando o ViMax em {VIMAX_DIR} ...")
        run(["git", "clone", "--depth", "1", REPO, str(VIMAX_DIR)])
    else:
        info("ViMax ja clonado.")

    python = find_python()
    info(f"Python: {python}")

    if not VENV_DIR.exists():
        info("Criando ambiente virtual em ViMax/.venv ...")
        run([python, "-m", "venv", str(VENV_DIR)])
    else:
        info("Ambiente virtual ViMax/.venv ja existe.")

    venv_python = (VENV_DIR / "Scripts" / "python.exe" if sys.platform == "win32"
                   else VENV_DIR / "bin" / "python")

    info("Atualizando pip...")
    run([str(venv_python), "-m", "pip", "install", "--upgrade", "pip"])

    info("Instalando dependencias (pode demorar, ~200MB)...")
    run([str(venv_python), "-m", "pip", "install", "-r", str(REQUIREMENTS)])

    # A verificacao importa a cadeia inteira de agentes, e nao so o langchain:
    # o que quebra aqui e import de topo de modulo do ViMax (cv2, moviepy), e um
    # "import langchain" que passasse diria "pronto" para algo que ainda falha.
    info("Verificando a cadeia de agentes do ViMax...")
    run([str(venv_python), "-c",
         "import sys; sys.path.insert(0, r'" + str(VIMAX_DIR) + "');"
         "from agents.screenwriter import Screenwriter;"
         "from agents.character_extractor import CharacterExtractor;"
         "from agents.storyboard_artist import StoryboardArtist;"
         "print('agentes ok')"])

    print()
    info("Pronto. O serve.py ja acha esta venv sozinho.")
    info("Teste sem o navegador:")
    info('  echo {"tema":"por que o ceu e azul","cenas":4,'
         '"llm":{"api_key":"SUA_CHAVE_GEMINI"}} | '
         f'{venv_python} vimax_plan.py')
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except subprocess.CalledProcessError as exc:
        print(f"[vimax-setup] ERRO: comando falhou (codigo {exc.returncode})", file=sys.stderr)
        raise SystemExit(exc.returncode) from exc
