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
  impacto   pancada grave (chinelo, pouso)
  aura      brilho subindo (poder ativado)
  musica    batida curta em loop para fundo de gancho
  freio     pneu cantando (freada)
  buzina    fom-fom
  grave     tum-tum de som automotivo
  risco     risco de disco (virada)
  martelo   batida de martelo de juiz
  piu       passarinho
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


def impacto():
    """pancada grave com estalo (chinelo batendo, pouso)"""
    x = t(0.7)
    freq = 140 * np.exp(-x * 9) + 42
    fase = 2 * np.pi * np.cumsum(freq) / TAXA
    corpo = np.sin(fase) * env(len(x), 0.001, 6)
    estalo = rng.normal(0, 1, len(x)) * env(len(x), 0.0005, 60)
    return corpo + estalo * 0.6


def aura():
    """brilho subindo (poder ativado)"""
    x = t(0.9)
    freq = 300 + 1500 * (x / x[-1]) ** 2
    fase = 2 * np.pi * np.cumsum(freq) / TAXA
    tremolo = 0.75 + 0.25 * np.sin(2 * np.pi * 18 * x)
    forma = np.sin(np.pi * x / x[-1]) ** 0.6
    return (np.sin(fase) + 0.35 * np.sin(2 * fase)) * tremolo * forma


def musica():
    """batida curta em loop (2 compassos, 140 bpm) para fundo de gancho"""
    bpm = 140
    tempo = 60 / bpm
    total = np.zeros(int(TAXA * tempo * 8))
    for k in range(8):
        i = int(k * tempo * TAXA)
        if k % 2 == 0:   # bumbo
            b = impacto()[: int(TAXA * 0.3)] * 0.7
        else:            # caixa
            xx = t(0.18)
            b = rng.normal(0, 1, len(xx)) * env(len(xx), 0.001, 25) * 0.5
        total[i:i + len(b)] += b[: len(total) - i]
        h = clique(dur=0.03, tom=7000) * 0.25   # chimbal no contratempo
        j = int((k + 0.5) * tempo * TAXA)
        total[j:j + len(h)] += h[: len(total) - j]
    notas = [220, 220, 261.6, 196]
    xx = t(tempo * 2)
    for k, f in enumerate(notas):
        i = int(k * tempo * 2 * TAXA)
        baixo = np.sign(np.sin(2 * np.pi * f / 2 * xx)) * env(len(xx), 0.005, 3) * 0.18
        total[i:i + len(baixo)] += baixo[: len(total) - i]
    return total


def freio():
    """pneu cantando: chiado agudo que oscila e cai"""
    x = t(0.8)
    ruido = rng.normal(0, 1, len(x))
    freq = 2600 - 900 * (x / x[-1]) + 180 * np.sin(2 * np.pi * 9 * x)
    tom = np.sin(2 * np.pi * np.cumsum(freq) / TAXA)
    return (tom * 0.7 + ruido * 0.25) * env(len(x), 0.01, 2.2)


def buzina():
    """fom-fom: duas notas quadradas curtas"""
    total = np.zeros(int(TAXA * 0.6))
    for k, ini in enumerate([0.0, 0.3]):
        xx = t(0.22)
        nota = (np.sign(np.sin(2 * np.pi * 415 * xx)) + np.sign(np.sin(2 * np.pi * 523 * xx))) * 0.5 * env(len(xx), 0.005, 4)
        i = int(ini * TAXA)
        total[i:i + len(nota)] += nota[: len(total) - i]
    return total


def grave():
    """tum-tum de som automotivo (2 batidas fortes)"""
    total = np.zeros(int(TAXA * 0.5))
    for ini in [0.0, 0.22]:
        xx = t(0.2)
        f = 70 * np.exp(-xx * 8) + 45
        b = np.sin(2 * np.pi * np.cumsum(f) / TAXA) * env(len(xx), 0.002, 9)
        i = int(ini * TAXA)
        total[i:i + len(b)] += b[: len(total) - i]
    return total


def risco():
    """risco de disco: ruído que sobe e desce rápido"""
    x = t(0.45)
    ruido = rng.normal(0, 1, len(x))
    freq = 600 + 1800 * np.abs(np.sin(2 * np.pi * 3.2 * x))
    tom = np.sin(2 * np.pi * np.cumsum(freq) / TAXA)
    return (tom * 0.6 + ruido * 0.4) * env(len(x), 0.005, 3)


def martelo():
    """batida seca de madeira (martelo de juiz)"""
    x = t(0.25)
    corpo = np.sin(2 * np.pi * 320 * x) * env(len(x), 0.001, 35)
    estalo = rng.normal(0, 1, len(x)) * env(len(x), 0.0005, 120)
    return corpo + estalo * 0.5


def piu():
    """piu-piu de passarinho"""
    total = np.zeros(int(TAXA * 0.4))
    for ini in [0.0, 0.18]:
        xx = t(0.12)
        f = 2800 + 1400 * (xx / xx[-1])
        c = np.sin(2 * np.pi * np.cumsum(f) / TAXA) * env(len(xx), 0.003, 25)
        i = int(ini * TAXA)
        total[i:i + len(c)] += c[: len(total) - i]
    return total


if __name__ == "__main__":
    salvar("tecla", tecla(), 0.55)
    salvar("pop", pop(), 0.7)
    salvar("plim", plim(), 0.6)
    salvar("erro", erro(), 0.55)
    salvar("whoosh", whoosh(), 0.6)
    salvar("contagem", contagem(), 0.5)
    salvar("impacto", impacto(), 0.8)
    salvar("aura", aura(), 0.5)
    salvar("musica", musica(), 0.6)
    salvar("freio", freio(), 0.6)
    salvar("buzina", buzina(), 0.55)
    salvar("grave", grave(), 0.8)
    salvar("risco", risco(), 0.55)
    salvar("martelo", martelo(), 0.7)
    salvar("piu", piu(), 0.5)
