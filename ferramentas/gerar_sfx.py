#!/usr/bin/env python3
"""
Gera os efeitos sonoros dos vídeos por síntese (numpy), sem arquivo de
terceiros: nada de direito autoral, nada de download.

    python ferramentas/gerar_sfx.py

Saída: remotion/public/sfx/*.wav (44,1 kHz, mono, 16 bits)
  tecla     rajada curta de cliques de teclado (linha de código digitada)
  pop       entrada de ficha, placa, saída do console
  plim      acerto (✓)
  erro      "bzzt" grave (✗, bug, exceção)
  whoosh    abertura de cena com título
  contagem  tic-tic subindo (cartão de número contando)
"""

import os
import wave

import numpy as np

TAXA = 44100
APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(APP_DIR, "remotion", "public", "sfx")
rng = np.random.default_rng(7)   # semente fixa: o mesmo som em toda execução


def t(dur):
    return np.arange(int(TAXA * dur)) / TAXA


def env(n, ataque=0.005, queda=8.0):
    """envelope: ataque rápido e decaimento exponencial"""
    x = np.arange(n) / TAXA
    a = np.clip(x / ataque, 0, 1)
    return a * np.exp(-x * queda)


def clique(dur=0.035, tom=2400):
    x = t(dur)
    ruido = rng.normal(0, 1, len(x))
    corpo = np.sin(2 * np.pi * tom * x) * 0.4
    return (ruido * 0.6 + corpo) * env(len(x), 0.0005, 140)


def salvar(nome, sinal, pico=0.8):
    sinal = np.asarray(sinal, dtype=float)
    sinal = sinal / (np.max(np.abs(sinal)) or 1) * pico
    # 4 ms de fade nas pontas: sem estalo no corte
    f = min(len(sinal) // 2, int(TAXA * 0.004))
    sinal[:f] *= np.linspace(0, 1, f)
    sinal[-f:] *= np.linspace(1, 0, f)
    os.makedirs(SAIDA, exist_ok=True)
    with wave.open(os.path.join(SAIDA, nome + ".wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TAXA)
        w.writeframes((sinal * 32767).astype(np.int16).tobytes())
    print(nome)


def tecla():
    total = np.zeros(int(TAXA * 0.34))
    pos = 0.0
    for _ in range(6):
        c = clique(tom=rng.uniform(1800, 3200)) * rng.uniform(0.6, 1.0)
        i = int(pos * TAXA)
        total[i:i + len(c)] += c[: len(total) - i]
        pos += rng.uniform(0.045, 0.065)
    return total


def pop():
    x = t(0.12)
    freq = 900 * np.exp(-x * 18) + 380            # cai rápido: "bloop"
    fase = 2 * np.pi * np.cumsum(freq) / TAXA
    return np.sin(fase) * env(len(x), 0.002, 30)


def plim():
    x = t(0.55)
    som = np.zeros(len(x))
    for f, a, atraso in [(1318.5, 1.0, 0.0), (1975.5, 0.7, 0.07)]:   # mi6 + si6
        y = np.zeros(len(x))
        i = int(atraso * TAXA)
        xx = x[: len(x) - i]
        y[i:] = (np.sin(2 * np.pi * f * xx) + 0.3 * np.sin(2 * np.pi * f * 2 * xx)) * env(len(xx), 0.002, 7)
        som += y * a
    return som


def erro():
    x = t(0.32)
    onda = np.sign(np.sin(2 * np.pi * 110 * x)) * 0.6 + np.sin(2 * np.pi * 116 * x) * 0.4   # áspero, levemente desafinado
    corte = np.where(x < 0.14, 1.0, np.where(x < 0.17, 0.0, 1.0))                          # "bzz-bzz"
    return onda * corte * env(len(x), 0.004, 6)


def whoosh():
    x = t(0.45)
    ruido = rng.normal(0, 1, len(x))
    # filtro passa-banda que varre: média móvel de janela decrescente
    saida = np.zeros(len(x))
    for i in range(len(x)):
        j = int(40 - 34 * (i / len(x)))
        saida[i] = ruido[max(0, i - j): i + 1].mean()
    forma = np.sin(np.pi * x / x[-1]) ** 2
    return saida * forma


def contagem():
    total = np.zeros(int(TAXA * 0.75))
    for k in range(9):
        c = clique(dur=0.03, tom=1400 + k * 180)
        i = int(k * 0.075 * TAXA)
        total[i:i + len(c)] += c[: len(total) - i] * (0.6 + k * 0.05)
    return total


if __name__ == "__main__":
    salvar("tecla", tecla(), 0.55)
    salvar("pop", pop(), 0.7)
    salvar("plim", plim(), 0.6)
    salvar("erro", erro(), 0.55)
    salvar("whoosh", whoosh(), 0.6)
    salvar("contagem", contagem(), 0.5)
