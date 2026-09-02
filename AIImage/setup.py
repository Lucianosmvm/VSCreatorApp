#!/usr/bin/env python3
"""
Cria a venv e instala dependencias do DepthFlow.

Uso:
    python setup.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
VENV_DIR = SCRIPT_DIR / ".venv"
REQUIREMENTS = SCRIPT_DIR / "requirements.txt"
INPUT_DIR = SCRIPT_DIR / "input"
OUTPUT_DIR = SCRIPT_DIR / "output"


def info(msg: str) -> None:
    print(f"[setup] {msg}")


def run(cmd: list[str], **kwargs) -> None:
    info(f"Executando: {' '.join(cmd)}")
    subprocess.run(cmd, check=True, **kwargs)


def find_python() -> str:
    """Prefere Python 3.12/3.13 via uv (torch ainda pode falhar no 3.14)."""
    try:
        result = subprocess.run(
            ["uv", "python", "find", "3.13"],
            capture_output=True,
            text=True,
            check=True,
        )
        path = result.stdout.strip()
        if path:
            return path
    except (FileNotFoundError, subprocess.CalledProcessError):
        pass

    return sys.executable


def main() -> int:
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    python = find_python()
    info(f"Python: {python}")

    if not VENV_DIR.exists():
        info("Criando ambiente virtual em .venv ...")
        run([python, "-m", "venv", str(VENV_DIR)])
    else:
        info("Ambiente virtual .venv ja existe.")

    venv_python = (
        VENV_DIR / "Scripts" / "python.exe"
        if sys.platform == "win32"
        else VENV_DIR / "bin" / "python"
    )

    info("Atualizando pip...")
    run([str(venv_python), "-m", "pip", "install", "--upgrade", "pip"])

    info("Instalando dependencias (pode demorar, ~500MB)...")
    run([str(venv_python), "-m", "pip", "install", "-r", str(REQUIREMENTS)])

    info("Verificando instalacao...")
    run([str(venv_python), "-m", "depthflow", "--help"])

    print()
    info("Pronto! Proximos passos:")
    info("  1. Instale FFmpeg se ainda nao tiver: winget install Gyan.FFmpeg --source winget")
    info("  2. Coloque fotos em input/")
    info("  3. Rode: .venv\\Scripts\\python parallax.py input\\foto.jpg 15")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except subprocess.CalledProcessError as exc:
        print(f"[setup] ERRO: comando falhou (codigo {exc.returncode})", file=sys.stderr)
        raise SystemExit(exc.returncode) from exc
