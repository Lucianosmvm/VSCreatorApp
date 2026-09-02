#!/usr/bin/env python3
"""
Gera video parallax 3D a partir de uma foto usando DepthFlow.

Uso:
    python parallax.py foto.jpg 15
    python parallax.py foto.jpg 20 --efeito zoom --fps 30
"""

from __future__ import annotations

import argparse
import math
import os
import re
import shutil
import sys
import time
from pathlib import Path
from typing import TYPE_CHECKING

SCRIPT_DIR = Path(__file__).resolve().parent
VENV_DIR = SCRIPT_DIR / ".venv"
OUTPUT_DIR = SCRIPT_DIR / "output"
INPUT_DIR = SCRIPT_DIR / "input"

EFFECTS = ("horizontal", "zoom", "circle", "vertical", "dolly", "orbital")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}

if TYPE_CHECKING:
    from depthflow.scene import DepthScene


def info(msg: str) -> None:
    print(f"[parallax] {msg}")


def ok(msg: str) -> None:
    print(f"[parallax] OK: {msg}")


def warn(msg: str) -> None:
    print(f"[parallax] AVISO: {msg}")


def err(msg: str) -> None:
    print(f"[parallax] ERRO: {msg}", file=sys.stderr)


def setup_utf8() -> None:
    os.environ["PYTHONUTF8"] = "1"
    os.environ["PYTHONIOENCODING"] = "utf-8"
    if sys.platform == "win32":
        os.system("chcp 65001 >nul 2>&1")

    # As variaveis acima so valem para processos FILHOS: o sys.stdout deste
    # processo ja foi criado com o cp1252 do console. Sem reconfigurar, a barra
    # de progresso do DepthFlow (desenhada com `rich`) derrubava o render
    # inteiro no primeiro '|' de moldura:
    #   ERRO: Falha ao renderizar: 'charmap' codec can't encode character
    #   '│' in position 0
    # Acontecia so rodando o parallax.py direto no terminal; pelo serve.py nao,
    # porque la o PYTHONUTF8 e posto no env ANTES do processo nascer.
    for fluxo in (sys.stdout, sys.stderr):
        try:
            fluxo.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass


def configure_opengl_cpu() -> bool:
    """Tenta usar Mesa llvmpipe (OpenGL em software/CPU) no Windows.

    Requer Mesa3D instalado. Veja: https://moderngl.readthedocs.io/en/stable/install/installation.html
    """
    if sys.platform == "win32":
        candidates = [
            os.environ.get("GLCONTEXT_WIN_LIBGL"),
            str(SCRIPT_DIR / "mesa" / "opengl32.dll"),
            r"C:\msys64\mingw64\bin\opengl32.dll",
        ]
        for path in candidates:
            if path and Path(path).is_file():
                resolved = str(Path(path).resolve())
                os.environ["GLCONTEXT_WIN_LIBGL"] = resolved
                os.environ.setdefault("GALLIUM_DRIVER", "llvmpipe")
                info(f"OpenGL software (CPU): {resolved}")
                return True
    elif sys.platform.startswith("linux"):
        os.environ.setdefault("LIBGL_ALWAYS_SOFTWARE", "1")
        os.environ.setdefault("GALLIUM_DRIVER", "llvmpipe")
        info("OpenGL software (CPU): LIBGL_ALWAYS_SOFTWARE=1")
        return True

    return False


def configure_device(mode: str, cpu_only: bool = False) -> None:
    """Configura CPU/GPU para a estimativa de profundidade (PyTorch).

    Deve rodar antes de importar torch/depthflow.
    """
    if cpu_only or mode == "cpu":
        os.environ["CUDA_VISIBLE_DEVICES"] = ""
        if cpu_only:
            info("Modo cpu-only: IA + encode no CPU")
            if configure_opengl_cpu():
                info("Tentando render 3D via Mesa (CPU)")
            else:
                warn("Render 3D (OpenGL) ainda usara a placa de video.")
                warn("DepthFlow nao tem render CPU nativo.")
                warn("Para testar 100% CPU no Windows, instale Mesa3D:")
                warn("  1. Instale MSYS2: https://www.msys2.org/")
                warn("  2. No MSYS2 MINGW64: pacman -S mingw-w64-x86_64-mesa")
                warn("  3. Copie opengl32.dll para AIImage\\mesa\\")
                warn("  Ou defina GLCONTEXT_WIN_LIBGL=C:\\msys64\\mingw64\\bin\\opengl32.dll")
        else:
            info("Dispositivo IA: CPU (forcado)")
        return

    if mode == "gpu":
        os.environ.pop("CUDA_VISIBLE_DEVICES", None)
        info("Dispositivo IA: GPU (se disponivel)")
        return

    info("Dispositivo IA: automatico")


def detect_device_label() -> str:
    import torch

    acc = torch.accelerator.current_accelerator(check_available=True)
    if acc is not None:
        return str(acc)
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def ensure_venv() -> None:
    venv_python = (
        VENV_DIR / "Scripts" / "python.exe"
        if sys.platform == "win32"
        else VENV_DIR / "bin" / "python"
    )
    if not venv_python.exists():
        err("Ambiente virtual nao encontrado.")
        info("Rode primeiro: python setup.py")
        sys.exit(1)

    depthflow_bin = (
        VENV_DIR / "Scripts" / "depthflow.exe"
        if sys.platform == "win32"
        else VENV_DIR / "bin" / "depthflow"
    )
    if not depthflow_bin.exists():
        err("DepthFlow nao instalado na venv.")
        info("Rode: python setup.py")
        sys.exit(1)


def find_ffmpeg() -> str | None:
    found = shutil.which("ffmpeg")
    if found:
        return found

    if sys.platform == "win32":
        candidates = [
            Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "WinGet" / "Links" / "ffmpeg.exe",
            Path(os.environ.get("ProgramFiles", "")) / "ffmpeg" / "bin" / "ffmpeg.exe",
        ]
        for candidate in candidates:
            if candidate.is_file():
                ffmpeg_dir = str(candidate.parent)
                os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
                return str(candidate)

    return None


def check_ffmpeg() -> None:
    if find_ffmpeg():
        return

    err("FFmpeg nao encontrado no PATH.")
    info("Instale com: winget install Gyan.FFmpeg --source winget")
    info("Depois feche e reabra o terminal.")
    info("Ou rode no CMD: set PATH=%LOCALAPPDATA%\\Microsoft\\WinGet\\Links;%PATH%")
    sys.exit(1)


def resolve_image(path: str) -> Path:
    image = Path(path).expanduser().resolve()
    if not image.is_file():
        err(f"Foto nao encontrada: {image}")
        sys.exit(1)

    if image.suffix.lower() not in IMAGE_EXTENSIONS:
        warn(f"Extensao '{image.suffix}' incomum. Tentando mesmo assim...")

    return image


def default_output(image: Path) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = re.sub(r"[^\w\-]", "_", image.stem).strip("_") or "video"
    return OUTPUT_DIR / f"{safe_name}-parallax.mp4"


def resolve_output(image: Path, output: str | None) -> Path:
    if not output:
        return default_output(image)

    out = Path(output).expanduser()
    if out.suffix.lower() != ".mp4":
        out = out.with_suffix(".mp4")

    out.parent.mkdir(parents=True, exist_ok=True)
    return out.resolve()


def get_scene_class(efeito: str) -> type[DepthScene]:
    from depthflow.examples.presets import (
        Circle,
        Dolly,
        Horizontal,
        Orbital,
        Vertical,
        Zoom,
    )

    mapping = {
        "horizontal": Horizontal,
        "vertical": Vertical,
        "circle": Circle,
        "dolly": Dolly,
        "orbital": Orbital,
        "zoom": Zoom,
    }
    return mapping[efeito]


def escalar_ciclo(base: type[DepthScene], voltas: float) -> type[DepthScene]:
    """Quantas voltas do movimento cabem no video inteiro.

    Os presets leem `self.cycle`, que o ShaderFlow define como
    `(time/runtime) % 1 * 2pi`: um ciclo completo ja se estica sobre a duracao
    pedida, entao o movimento NUNCA se repete dentro do clipe. Medido com um
    clipe de 3 s e um de 9 s: os dois desenham a mesma curva, so mais esticada.

    O que muda com `voltas` e o quanto desse ciclo e percorrido:

      1.0  ciclo inteiro. No Horizontal/Vertical o sin passa pelos DOIS lados
           (centro, direita, centro, esquerda, centro) — e isso que da a
           impressao de que a animacao "foi e voltou duas vezes".
      0.5  meio ciclo: centro, direita, centro. Um vaivem so.

    Dolly e Zoom ja fazem um vaivem unico em 1.0 (as formulas deles usam
    1-cos e sin^2), e Circle/Orbital precisam do ciclo inteiro para a volta
    fechar — por isso 1.0 continua o padrao.
    """
    if voltas == 1.0:
        return base

    class CicloEscalado(base):  # type: ignore[misc, valid-type]
        @property
        def cycle(self) -> float:
            return self.tau * math.tau * voltas

    CicloEscalado.__name__ = base.__name__
    CicloEscalado.__qualname__ = base.__qualname__
    return CicloEscalado


def render(args: argparse.Namespace, image: Path, output: Path) -> dict[str, float | str]:
    from shaderflow.scene import WindowBackend

    timings: dict[str, float | str] = {}

    scene_class = escalar_ciclo(get_scene_class(args.efeito), args.voltas)
    scene = scene_class(backend=WindowBackend.Headless)

    if args.nvenc and not args.cpu_only:
        scene.ffmpeg.h264_nvenc()
        timings["encode"] = "gpu (nvenc)"
    else:
        scene.ffmpeg.h264(preset="veryfast")
        timings["encode"] = "cpu (libx264)"

    device = detect_device_label()
    timings["ia"] = device
    info(f"PyTorch (profundidade): {device}")
    info(f"Encode MP4: {timings['encode']}")

    info("Estimando profundidade da imagem...")
    t0 = time.perf_counter()
    scene.input(image=image)
    timings["profundidade_s"] = time.perf_counter() - t0

    if scene.opengl is not None:
        renderer = scene.opengl.info.get("GL_RENDERER", "desconhecido")
        timings["opengl"] = str(renderer)
        info(f"OpenGL (render 3D): {renderer}")

    info("Gerando frames do video...")
    t1 = time.perf_counter()
    # scene.main() tem width=1920 fixo por padrao. Passando so a altura, uma foto
    # 1080x1920 saia como video 1920x840: a largura ficava no padrao e o
    # enquadramento virava paisagem. Com --largura os dois lados sao explicitos.
    extra = {} if args.largura is None else {"width": args.largura}
    scene.main(
        output=output,
        time=args.tempo,
        fps=args.fps,
        height=args.altura,
        quality=args.qualidade,
        **extra,
    )
    timings["render_s"] = time.perf_counter() - t1
    return timings


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Gera video parallax 3D a partir de uma foto (DepthFlow).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python parallax.py input/prato.jpg 15
  python parallax.py foto.png 20 --efeito zoom
  python parallax.py foto.jpg 10 --cpu-only
  python parallax.py foto.jpg 10 --device gpu --nvenc
        """,
    )
    parser.add_argument("foto", help="Caminho da imagem (jpg, png, webp...)")
    parser.add_argument(
        "tempo",
        type=float,
        help="Duracao do video em segundos (recomendado: ate 20)",
    )
    parser.add_argument(
        "--saida",
        "-o",
        default=None,
        help="Caminho do MP4 de saida (padrao: output/<nome>-parallax.mp4)",
    )
    parser.add_argument(
        "--efeito",
        "-e",
        choices=EFFECTS,
        default="horizontal",
        help="Tipo de movimento da camera (padrao: horizontal)",
    )
    parser.add_argument(
        "--fps",
        "-f",
        type=int,
        default=30,
        help="Frames por segundo (padrao: 30)",
    )
    parser.add_argument(
        "--altura",
        "-H",
        type=int,
        default=1080,
        help="Altura do video em pixels (padrao: 1080)",
    )
    parser.add_argument(
        "--voltas",
        "-v",
        type=float,
        default=1.0,
        help="Quantas voltas do movimento cabem no video (padrao: 1.0 = ciclo "
             "inteiro). 0.5 faz um vaivem so, sem passar pelos dois lados",
    )
    parser.add_argument(
        "--largura",
        "-W",
        type=int,
        default=None,
        help="Largura do video em pixels (padrao do DepthFlow: 1920). "
             "Sem isto, uma foto em pe sai enquadrada como paisagem",
    )
    parser.add_argument(
        "--qualidade",
        "-q",
        type=int,
        default=70,
        help="Qualidade de render 0-100 (padrao: 70)",
    )
    parser.add_argument(
        "--cpu-only",
        action="store_true",
        help="Forca IA e encode no CPU (render 3D ainda usa GPU via OpenGL)",
    )
    parser.add_argument(
        "--device",
        "-d",
        choices=("auto", "cpu", "gpu"),
        default="auto",
        help="Dispositivo para estimativa de profundidade (IA): auto, cpu ou gpu",
    )
    parser.add_argument(
        "--nvenc",
        action="store_true",
        help="Usar GPU NVIDIA para encode do video (NVENC). Sem isso, encode usa CPU",
    )
    return parser.parse_args()


def main() -> int:
    setup_utf8()
    args = parse_args()

    if args.cpu_only:
        args.device = "cpu"
        if args.nvenc:
            warn("--nvenc ignorado no modo --cpu-only")

    configure_device(args.device, cpu_only=args.cpu_only)

    ensure_venv()
    check_ffmpeg()

    if args.tempo <= 0 or args.tempo > 120:
        err("Tempo deve estar entre 1 e 120 segundos.")
        return 1

    if not 0.1 <= args.voltas <= 4.0:
        err("Voltas deve estar entre 0.1 e 4.0.")
        return 1

    image = resolve_image(args.foto)
    output = resolve_output(image, args.saida)

    info(f"Foto   : {image}")
    info(f"Saida  : {output}")
    info(f"Tempo  : {args.tempo}s | Efeito: {args.efeito} | Voltas: {args.voltas} | FPS: {args.fps}")
    info("Renderizando...")

    started = time.perf_counter()

    try:
        timings = render(args, image, output)
    except Exception as exc:
        err(f"Falha ao renderizar: {exc}")
        warn("Em notebooks hibridos, force a GPU NVIDIA dedicada no Painel NVIDIA.")
        return 1

    if args.device == "gpu" and timings.get("ia") == "cpu":
        warn("GPU solicitada para IA, mas PyTorch nao detectou CUDA.")

    if not output.is_file():
        err(f"Arquivo de saida nao foi criado: {output}")
        return 1

    elapsed = time.perf_counter() - started
    size_mb = output.stat().st_size / (1024 * 1024)
    ok(f"Video gerado: {output} ({size_mb:.2f} MB)")
    info(f"Tempo profundidade (IA): {timings['profundidade_s']:.1f}s")
    info(f"Tempo render + encode:   {timings['render_s']:.1f}s")
    info(f"Tempo total:             {elapsed:.1f}s")
    return 0


if __name__ == "__main__":
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    sys.exit(main())
