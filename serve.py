#!/usr/bin/env python3
"""
Servidor local do Shorts Creator.

Faz quatro coisas:
  1. serve o index.html em http://localhost:8777
  2. repassa /replicate/* para https://api.replicate.com/v1/*
  3. baixa a imagem de saida em /fetch?url=...
  4. roda o DepthFlow local em /parallax (imagem -> MP4 com parallax 3D)

Os itens 2 e 3 existem pelo mesmo motivo: nem a API da Replicate nem o CDN onde
ela publica a imagem mandam cabecalhos CORS, entao o navegador recusa as duas
chamadas com "TypeError: Failed to fetch". Este proxy so acrescenta os
cabecalhos CORS e repassa. Sem o item 3 a imagem era gerada e cobrada, mas
morria no download.

O token NAO fica aqui. Ele continua no navegador e viaja no cabecalho
Authorization, que este script apenas encaminha sem ler nem registrar.

Por isso o socket escuta em 127.0.0.1: qualquer um na mesma rede que
alcancasse esta porta poderia usar o proxy. Nao troque para 0.0.0.0.

Uso:  python serve.py [porta]
"""

import ipaddress
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8777
HOST = "127.0.0.1"
PREFIX = "/replicate/"
UPSTREAM = "https://api.replicate.com/v1/"
FORWARD_HEADERS = ("Authorization", "Content-Type", "Prefer")

# servir a partir da pasta do script, nao do diretorio onde o terminal estava:
# rodar "python D:\...\serve.py" de outra pasta devolvia 404 no index.html.
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# /fetch?url=... baixa a imagem e devolve com CORS.
#
# Existe porque a Replicate entrega a saida num CDN que NAO manda
# Access-Control-Allow-Origin (hoje ai-gateway-outputs...r2.cloudflarestorage.com;
# antes era replicate.delivery, que mandava). Sem cabecalho de CORS o navegador
# recusa o download antes de ler um byte, com a imagem ja gerada e ja cobrada.
# Aqui fora do sandbox do navegador o download passa normalmente.
#
# O host de saida ja mudou uma vez e vai mudar de novo, entao a regra nao e uma
# lista de dominios: aceita qualquer https publico, recusa endereco privado
# (nada de usar isto para varrer a rede local) e so repassa imagem ou video.
FETCH_PREFIX = "/fetch"
FETCH_TYPES = ("image/", "video/", "application/octet-stream")

# /parallax roda o DepthFlow desta maquina: recebe os bytes da imagem de uma
# cena e devolve o MP4 com o movimento 3D. Existe para animar sem pagar clipe
# na Replicate — e sem internet.
#
# Isto executa um processo, entao nada do que chega vira comando: os parametros
# entram pela querystring, cada um e validado contra faixa ou lista fixa, e o
# subprocess recebe uma LISTA de argumentos (nunca shell=True). O corpo da
# requisicao e tratado como bytes de imagem e so isso — vai para um arquivo com
# nome gerado aqui, nunca com nome vindo do cliente.
PARALLAX_PREFIX = "/parallax"
AIIMAGE_DIR = os.path.join(APP_DIR, "AIImage")
PARALLAX_SCRIPT = os.path.join(AIIMAGE_DIR, "parallax.py")
PARALLAX_INPUT = os.path.join(AIIMAGE_DIR, "input")
PARALLAX_OUTPUT = os.path.join(AIIMAGE_DIR, "output")
PARALLAX_EFFECTS = ("horizontal", "zoom", "circle", "vertical", "dolly", "orbital")
PARALLAX_EXT = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
PARALLAX_MAX_BODY = 40 * 1024 * 1024
PARALLAX_TIMEOUT = 900          # 15 min: primeira rodada baixa o modelo de profundidade

# DepthFlow renderiza em OpenGL. Dois renders ao mesmo tempo disputam a mesma
# placa e o segundo morre com erro de contexto — uma cena por vez.
parallax_lock = threading.Lock()

# ── PROJETOS ─────────────────────────────────────────────────────────────
#
# Um diretorio por video. Ate aqui o app guardava tudo no navegador
# (localStorage + IndexedDB): limpar os dados do site levava junto todas as
# imagens ja pagas, e nao dava para abrir o mesmo roteiro em outro navegador.
#
#   projetos/<id>/projeto.json     roteiro + configuracao
#   projetos/<id>/imagens/<cena>.webp
#   projetos/<id>/audios/<cena>.mp3
#   projetos/<id>/videos/<cena>.mp4
#
# Isto grava arquivos a partir de requisicao HTTP, entao NENHUM nome vem do
# cliente: o id do projeto e o id da cena passam por uma regex fechada, a
# extensao sai do Content-Type contra uma tabela fixa, e o caminho final ainda
# e conferido com realpath para ter certeza de que caiu dentro de projetos/.
PROJETOS_PREFIX = "/projetos"
PROJETOS_DIR = os.path.join(APP_DIR, "projetos")
PROJETOS_LIXEIRA = os.path.join(PROJETOS_DIR, ".lixeira")
PROJETO_JSON = "projeto.json"
PROJETO_MAX_JSON = 16 * 1024 * 1024
PROJETO_MAX_ASSET = 200 * 1024 * 1024
PROJETO_ID_OK = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$")

# tipo -> (subpasta, {content-type: extensao})
PROJETO_TIPOS = {
    "imagem": ("imagens", {"image/webp": ".webp", "image/png": ".png",
                           "image/jpeg": ".jpg", "image/gif": ".gif"}),
    "audio":  ("audios",  {"audio/mpeg": ".mp3", "audio/mp3": ".mp3",
                           "audio/wav": ".wav", "audio/ogg": ".ogg"}),
    "video":  ("videos",  {"video/mp4": ".mp4", "video/webm": ".webm"}),
}


def projeto_dir(pid):
    """Caminho da pasta do projeto, ou None se o id nao for aceitavel.

    O realpath no fim nao e paranoia repetida: a regex ja barra '..' e barras,
    mas um link simbolico dentro de projetos/ apontando para fora passaria pela
    regex e nao pelo prefixo. Melhor conferir onde o caminho REALMENTE cai.
    """
    if not pid or not PROJETO_ID_OK.match(pid):
        return None
    destino = os.path.realpath(os.path.join(PROJETOS_DIR, pid))
    raiz = os.path.realpath(PROJETOS_DIR)
    if destino != raiz and not destino.startswith(raiz + os.sep):
        return None
    return destino


def projeto_meta(pid):
    """Resumo para a lista: nome, datas, quantas cenas, quanto ocupa."""
    pasta = projeto_dir(pid)
    if not pasta or not os.path.isdir(pasta):
        return None
    caminho = os.path.join(pasta, PROJETO_JSON)
    nome, cenas, modificado = pid, 0, 0
    if os.path.isfile(caminho):
        modificado = os.path.getmtime(caminho)
        try:
            with open(caminho, encoding="utf-8") as fh:
                dados = json.load(fh)
            nome = dados.get("nome") or pid
            cenas = len(dados.get("frames") or [])
        except (OSError, ValueError):
            pass
    bytes_totais = 0
    for raiz, _, arquivos in os.walk(pasta):
        for a in arquivos:
            try:
                bytes_totais += os.path.getsize(os.path.join(raiz, a))
            except OSError:
                pass
    return {
        "id": pid, "nome": nome, "cenas": cenas,
        "modificado": modificado,
        "criado": os.path.getctime(pasta),
        "bytes": bytes_totais,
    }


def projetos_listar():
    if not os.path.isdir(PROJETOS_DIR):
        return []
    saida = []
    for nome in os.listdir(PROJETOS_DIR):
        if nome.startswith("."):          # .lixeira e afins ficam de fora
            continue
        meta = projeto_meta(nome)
        if meta:
            saida.append(meta)
    saida.sort(key=lambda m: m["modificado"], reverse=True)
    return saida


def parallax_python():
    """Interpretador da venv do AIImage, ou None se o setup.py ainda nao rodou."""
    partes = ("Scripts", "python.exe") if sys.platform == "win32" else ("bin", "python")
    caminho = os.path.join(AIIMAGE_DIR, ".venv", *partes)
    return caminho if os.path.isfile(caminho) else None


def parallax_depthflow():
    """O pacote em si. O interpretador existir nao basta: o setup.py cria a venv
    em segundos e passa vinte minutos instalando o torch, e nessa janela um
    status so por python.exe dizia 'pronto' para algo que ainda falharia."""
    partes = ("Scripts", "depthflow.exe") if sys.platform == "win32" else ("bin", "depthflow")
    caminho = os.path.join(AIIMAGE_DIR, ".venv", *partes)
    return caminho if os.path.isfile(caminho) else None


def parallax_ffmpeg():
    """Mesma busca do parallax.py: PATH primeiro, depois o link que o winget cria."""
    achado = shutil.which("ffmpeg")
    if achado:
        return achado
    if sys.platform == "win32":
        candidatos = (
            os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Links", "ffmpeg.exe"),
            os.path.join(os.environ.get("ProgramFiles", ""), "ffmpeg", "bin", "ffmpeg.exe"),
        )
        for c in candidatos:
            if c and os.path.isfile(c):
                return c
    return None


def parallax_limpar_entradas():
    """Apaga as copias que o /parallax deixou para tras.

    O render normal remove a sua no `finally`, mas matar o serve.py no meio de
    uma cena pula esse caminho e a imagem fica em input/ — que e tambem onde o
    usuario guarda as fotos dele. Por isso o filtro e pelo prefixo 'cena-', que
    so este arquivo escreve: nada que voce colocou ali e tocado.
    """
    if not os.path.isdir(PARALLAX_INPUT):
        return 0
    n = 0
    for nome in os.listdir(PARALLAX_INPUT):
        if nome.startswith("cena-") and os.path.splitext(nome)[1] in PARALLAX_EXT.values():
            try:
                os.remove(os.path.join(PARALLAX_INPUT, nome))
                n += 1
            except OSError:
                pass
    return n


def parallax_status():
    return {
        "script": os.path.isfile(PARALLAX_SCRIPT),
        "venv": bool(parallax_python() and parallax_depthflow()),
        "ffmpeg": bool(parallax_ffmpeg()),
        "efeitos": list(PARALLAX_EFFECTS),
        "ocupado": parallax_lock.locked(),
    }


def endereco_publico(host):
    """False para localhost, IP privado, link-local — evita virar scanner de rede."""
    try:
        infos = socket.getaddrinfo(host, None)
    except Exception:
        return False
    for info in infos:
        try:
            ip = ipaddress.ip_address(info[4][0])
        except ValueError:
            return False
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False
    return bool(infos)


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *a, **kw):
        SimpleHTTPRequestHandler.__init__(self, *a, directory=APP_DIR, **kw)

    def end_headers(self):
        # o index.html muda a cada correcao; sem isto o navegador serve a copia
        # velha e a impressao e de que o conserto nao pegou.
        self.send_header("Cache-Control", "no-store")
        SimpleHTTPRequestHandler.end_headers(self)

    # ---- CORS ----------------------------------------------------------
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type, Prefer")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Max-Age", "86400")

    def do_OPTIONS(self):
        rota = self.path.split("?")[0]
        if (self.path.startswith(PREFIX) or rota == FETCH_PREFIX
                or rota.startswith(PARALLAX_PREFIX) or rota.startswith(PROJETOS_PREFIX)):
            self.send_response(204)
            self._cors()
            self.send_header("Content-Length", "0")
            self.end_headers()
        else:
            self.send_error(404)

    # ---- roteamento ----------------------------------------------------
    def do_GET(self):
        if self.path.startswith(PREFIX):
            return self._proxy("GET")
        rota = self.path.split("?")[0]
        if rota == FETCH_PREFIX:
            return self._fetch()
        if rota == PARALLAX_PREFIX + "/status":
            return self._parallax_status()
        if rota.startswith(PROJETOS_PREFIX):
            return self._projetos("GET", rota)
        return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path.startswith(PREFIX):
            return self._proxy("POST")
        rota = self.path.split("?")[0]
        if rota == PARALLAX_PREFIX:
            return self._parallax()
        if rota.startswith(PROJETOS_PREFIX):
            return self._projetos("POST", rota)
        self.send_error(404)

    def do_DELETE(self):
        rota = self.path.split("?")[0]
        if rota.startswith(PROJETOS_PREFIX):
            return self._projetos("DELETE", rota)
        self.send_error(404)

    # ---- proxy ---------------------------------------------------------
    def _proxy(self, method):
        upstream_path = self.path[len(PREFIX):]
        url = UPSTREAM + upstream_path

        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None

        req = urllib.request.Request(url, data=body, method=method)
        for name in FORWARD_HEADERS:
            value = self.headers.get(name)
            if value:
                req.add_header(name, value)
        req.add_header("User-Agent", "shorts-creator-local-proxy")

        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data, status = resp.read(), resp.status
                ctype = resp.headers.get("Content-Type", "application/json")
        except urllib.error.HTTPError as e:
            # repassa o erro da Replicate como veio: o app mostra a mensagem crua
            data, status = e.read(), e.code
            ctype = e.headers.get("Content-Type", "application/json")
        except Exception as e:
            data = json.dumps({"detail": "proxy local: %s" % e}).encode("utf-8")
            status, ctype = 502, "application/json"

        self._responder(status, data, ctype)

    # ---- download da imagem de saida ------------------------------------
    def _fetch(self):
        alvo = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query).get("url", [""])[0]
        parts = urllib.parse.urlparse(alvo)

        def recusa(motivo):
            corpo = json.dumps({"detail": "/fetch recusou: %s" % motivo}).encode("utf-8")
            self._responder(403, corpo, "application/json")

        if parts.scheme != "https":
            return recusa("so aceito https (recebi %r)" % (parts.scheme or alvo[:60]))
        if not parts.hostname:
            return recusa("faltou o parametro url")
        if not endereco_publico(parts.hostname):
            return recusa("%s nao e um endereco publico" % parts.hostname)

        req = urllib.request.Request(alvo, method="GET")
        # Cloudflare devolve 403 (erro 1010) para o User-Agent padrao do urllib.
        req.add_header("User-Agent", "shorts-creator-local-proxy")
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data, status = resp.read(), resp.status
                ctype = resp.headers.get("Content-Type", "application/octet-stream")
        except urllib.error.HTTPError as e:
            data, status = e.read(), e.code
            ctype = e.headers.get("Content-Type", "text/plain")
        except Exception as e:
            data = json.dumps({"detail": "proxy local: %s" % e}).encode("utf-8")
            status, ctype = 502, "application/json"

        if status == 200 and not ctype.split(";")[0].strip().lower().startswith(FETCH_TYPES):
            return recusa("%s devolveu %s, e /fetch so repassa imagem ou video" % (parts.hostname, ctype))
        self._responder(status, data, ctype)

    # ---- DepthFlow local -------------------------------------------------
    def _parallax_status(self):
        self._responder(200, json.dumps(parallax_status()).encode("utf-8"), "application/json")

    def _parallax_erro(self, status, motivo, detalhe=""):
        corpo = json.dumps({"detail": motivo, "stderr": detalhe}).encode("utf-8")
        self._responder(status, corpo, "application/json")

    def _parallax(self):
        # O corpo sai do socket ANTES de qualquer validacao, de proposito.
        # Recusando cedo (sem venv, efeito invalido) os bytes da imagem ficavam
        # na conexao, e o keep-alive do HTTP/1.1 lia o PNG como se fosse a
        # requisicao seguinte: "Bad request syntax ('\x89PNG')" e a proxima
        # chamada do app morria sem explicacao. Medido no /parallax/status.
        tamanho = int(self.headers.get("Content-Length") or 0)
        if tamanho > PARALLAX_MAX_BODY:
            # drenar 100 MB so para preservar o keep-alive nao vale; fecha
            self.close_connection = True
            return self._parallax_erro(413, "imagem maior que %d MB" % (PARALLAX_MAX_BODY // 1048576))
        imagem = self.rfile.read(tamanho) if tamanho > 0 else b""

        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)

        def num(nome, padrao, minimo, maximo, tipo):
            try:
                v = tipo(q.get(nome, [padrao])[0])
            except (TypeError, ValueError):
                return None
            return v if minimo <= v <= maximo else None

        tempo = num("tempo", 8, 1, 120, float)
        altura = num("altura", 1080, 240, 3840, int)
        largura = num("largura", 1920, 240, 3840, int)
        fps = num("fps", 30, 1, 60, int)
        qualidade = num("qualidade", 70, 0, 100, int)
        voltas = num("voltas", 1.0, 0.1, 4.0, float)
        efeito = q.get("efeito", ["horizontal"])[0]

        if None in (tempo, altura, largura, fps, qualidade, voltas):
            return self._parallax_erro(400, "tempo/altura/largura/fps/qualidade/voltas fora da faixa aceita")
        if efeito not in PARALLAX_EFFECTS:
            return self._parallax_erro(400, "efeito invalido: %r" % efeito[:40])

        if not imagem:
            return self._parallax_erro(400, "corpo vazio: mande os bytes da imagem")

        ctype = (self.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        ext = PARALLAX_EXT.get(ctype)
        if ext is None:
            return self._parallax_erro(415, "Content-Type %r nao e imagem que eu aceite" % ctype[:40])

        python = parallax_python()
        if not python:
            return self._parallax_erro(503, "DepthFlow nao instalado. Rode: python AIImage/setup.py")
        if not parallax_depthflow():
            return self._parallax_erro(503, "A venv existe mas o DepthFlow ainda nao. O setup.py terminou? Rode de novo: python AIImage/setup.py")
        if not os.path.isfile(PARALLAX_SCRIPT):
            return self._parallax_erro(503, "AIImage/parallax.py nao encontrado")
        if not parallax_ffmpeg():
            return self._parallax_erro(503, "FFmpeg nao encontrado. Rode: winget install Gyan.FFmpeg")

        # nao enfileira: o app pede uma cena por vez, e uma fila aqui so
        # esconderia o gargalo atras de um timeout de 15 min por cena parada
        if not parallax_lock.acquire(blocking=False):
            return self._parallax_erro(409, "ja tem uma cena renderizando; espere ela terminar")

        os.makedirs(PARALLAX_INPUT, exist_ok=True)
        os.makedirs(PARALLAX_OUTPUT, exist_ok=True)
        marca = "cena-%d" % int(time.time() * 1000)
        entrada = os.path.join(PARALLAX_INPUT, marca + ext)
        saida = os.path.join(PARALLAX_OUTPUT, marca + "-parallax.mp4")

        try:
            with open(entrada, "wb") as fh:
                fh.write(imagem)

            cmd = [
                python, PARALLAX_SCRIPT, entrada, str(tempo),
                "--efeito", efeito,
                "--fps", str(fps),
                "--altura", str(altura),
                "--largura", str(largura),
                "--voltas", str(voltas),
                "--qualidade", str(qualidade),
                "--saida", saida,
            ]
            env = dict(os.environ, PYTHONUTF8="1", PYTHONIOENCODING="utf-8")
            print("[parallax] %s %ss efeito=%s voltas=%s %dx%d" % (os.path.basename(entrada), tempo, efeito, voltas, largura, altura))
            try:
                proc = subprocess.run(
                    cmd, cwd=AIIMAGE_DIR, env=env, timeout=PARALLAX_TIMEOUT,
                    capture_output=True, text=True, encoding="utf-8", errors="replace",
                )
            except subprocess.TimeoutExpired:
                return self._parallax_erro(504, "DepthFlow passou de %d s e foi encerrado" % PARALLAX_TIMEOUT)

            log = ((proc.stdout or "") + (proc.stderr or "")).strip()
            if proc.returncode != 0:
                return self._parallax_erro(500, "DepthFlow falhou (codigo %d)" % proc.returncode, log[-1500:])
            if not os.path.isfile(saida):
                return self._parallax_erro(500, "DepthFlow terminou sem gravar o MP4", log[-1500:])

            with open(saida, "rb") as fh:
                video = fh.read()
            print("[parallax] pronto: %s (%.1f MB)" % (os.path.basename(saida), len(video) / 1048576))
            self._responder(200, video, "video/mp4")
        finally:
            # a imagem foi copia do que o app ja tem; o MP4 fica em output/ para
            # quem quiser o arquivo solto (o app guarda a copia dele no IndexedDB)
            try:
                os.remove(entrada)
            except OSError:
                pass
            parallax_lock.release()

    # ---- projetos --------------------------------------------------------
    def _json(self, status, obj):
        self._responder(status, json.dumps(obj, ensure_ascii=False).encode("utf-8"),
                        "application/json; charset=utf-8")

    def _ler_corpo(self, limite):
        """Tira o corpo do socket ou devolve None (e ja respondeu o erro).

        Mesmo cuidado do /parallax: recusar antes de drenar deixaria os bytes na
        conexao, e o keep-alive leria o restante como se fosse a proxima
        requisicao.
        """
        tamanho = int(self.headers.get("Content-Length") or 0)
        if tamanho > limite:
            self.close_connection = True
            self._json(413, {"detail": "corpo maior que %d MB" % (limite // 1048576)})
            return None
        return self.rfile.read(tamanho) if tamanho > 0 else b""

    def _projetos(self, metodo, rota):
        partes = [p for p in rota[len(PROJETOS_PREFIX):].split("/") if p]

        # O corpo sai do socket ANTES de qualquer validacao — mesma armadilha do
        # /parallax. Recusar cedo ("tipo invalido", "id invalido") deixava os
        # bytes na conexao, e o keep-alive do HTTP/1.1 lia o proximo pedaco do
        # arquivo como se fosse a requisicao seguinte: a chamada seguinte
        # voltava com uma pagina de erro 400 em HTML, sem relacao com o que se
        # tinha pedido. Foi assim que apareceu no teste.
        corpo = None
        if metodo == "POST":
            limite = PROJETO_MAX_JSON if partes[-1:] == [PROJETO_JSON] else PROJETO_MAX_ASSET
            corpo = self._ler_corpo(limite)
            if corpo is None:
                return

        # GET /projetos  -> lista
        if not partes:
            if metodo != "GET":
                return self._json(405, {"detail": "use GET para listar projetos"})
            return self._json(200, {"projetos": projetos_listar()})

        pid = partes[0]
        pasta = projeto_dir(pid)
        if pasta is None:
            return self._json(400, {"detail": "id de projeto invalido"})
        resto = partes[1:]

        # DELETE /projetos/<id>  -> vai para a lixeira, nao some
        if metodo == "DELETE" and not resto:
            if not os.path.isdir(pasta):
                return self._json(404, {"detail": "projeto nao encontrado"})
            # Mover em vez de apagar: aqui dentro tem imagem que custou dinheiro
            # para gerar, e um clique errado nao pode ser definitivo.
            os.makedirs(PROJETOS_LIXEIRA, exist_ok=True)
            destino = os.path.join(PROJETOS_LIXEIRA, "%s-%d" % (pid, int(time.time())))
            try:
                shutil.move(pasta, destino)
            except OSError as e:
                return self._json(500, {"detail": "nao consegui mover para a lixeira: %s" % e})
            print("[projeto] %s -> lixeira (%s)" % (pid, os.path.basename(destino)))
            return self._json(200, {"ok": True, "lixeira": os.path.basename(destino)})

        # /projetos/<id>/projeto.json
        if resto == [PROJETO_JSON]:
            caminho = os.path.join(pasta, PROJETO_JSON)
            if metodo == "GET":
                if not os.path.isfile(caminho):
                    return self._json(404, {"detail": "projeto nao encontrado"})
                with open(caminho, "rb") as fh:
                    return self._responder(200, fh.read(), "application/json; charset=utf-8")
            if metodo == "POST":
                try:
                    json.loads(corpo.decode("utf-8"))     # so grava JSON valido
                except (ValueError, UnicodeDecodeError) as e:
                    return self._json(400, {"detail": "corpo nao e JSON valido: %s" % e})
                os.makedirs(pasta, exist_ok=True)
                # grava num temporario e troca: interromper no meio da escrita
                # deixaria o projeto.json truncado, e com ele o roteiro inteiro
                tmp = caminho + ".tmp"
                with open(tmp, "wb") as fh:
                    fh.write(corpo)
                os.replace(tmp, caminho)
                return self._json(200, {"ok": True, "bytes": len(corpo)})
            return self._json(405, {"detail": "use GET ou POST"})

        # /projetos/<id>/asset?tipo=&cena=
        if resto == ["asset"]:
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            tipo = q.get("tipo", [""])[0]
            cena = q.get("cena", [""])[0]
            if tipo not in PROJETO_TIPOS:
                return self._json(400, {"detail": "tipo deve ser imagem, audio ou video"})
            if not PROJETO_ID_OK.match(cena or ""):
                return self._json(400, {"detail": "id de cena invalido"})
            sub, tabela = PROJETO_TIPOS[tipo]
            destino = os.path.join(pasta, sub)

            if metodo == "GET":
                if not os.path.isdir(destino):
                    return self._json(404, {"detail": "sem %s neste projeto" % tipo})
                for ext in dict.fromkeys(tabela.values()):
                    caminho = os.path.join(destino, cena + ext)
                    if os.path.isfile(caminho):
                        ctype = next(c for c, e in tabela.items() if e == ext)
                        with open(caminho, "rb") as fh:
                            return self._responder(200, fh.read(), ctype)
                return self._json(404, {"detail": "cena %s nao tem %s" % (cena, tipo)})

            if metodo == "POST":
                ctype = (self.headers.get("Content-Type") or "").split(";")[0].strip().lower()
                ext = tabela.get(ctype)
                if ext is None:
                    return self._json(415, {"detail": "Content-Type %r nao vale para %s" % (ctype[:40], tipo)})
                if not corpo:
                    return self._json(400, {"detail": "corpo vazio"})
                os.makedirs(destino, exist_ok=True)
                # a mesma cena pode trocar de formato ao ser refeita; sem isto
                # sobraria a versao antiga em outra extensao e o GET acharia ela
                for velha in dict.fromkeys(tabela.values()):
                    if velha != ext:
                        try:
                            os.remove(os.path.join(destino, cena + velha))
                        except OSError:
                            pass
                caminho = os.path.join(destino, cena + ext)
                tmp = caminho + ".tmp"
                with open(tmp, "wb") as fh:
                    fh.write(corpo)
                os.replace(tmp, caminho)
                return self._json(200, {"ok": True, "arquivo": sub + "/" + cena + ext, "bytes": len(corpo)})

            if metodo == "DELETE":
                sumiram = []
                for ext in dict.fromkeys(tabela.values()):
                    caminho = os.path.join(destino, cena + ext)
                    if os.path.isfile(caminho):
                        try:
                            os.remove(caminho)
                            sumiram.append(os.path.basename(caminho))
                        except OSError:
                            pass
                return self._json(200, {"ok": True, "apagados": sumiram})

        return self._json(404, {"detail": "rota de projeto desconhecida"})

    # ---- resposta --------------------------------------------------------
    def _responder(self, status, data, ctype):
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self._cors()
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            # a aba cancelou o download; nao e erro do servidor
            pass

    def handle_one_request(self):
        # o navegador fecha conexoes keep-alive quando quer; sem isto cada
        # fechamento despeja um traceback de ConnectionResetError no terminal
        # e da a impressao de que o servidor quebrou.
        try:
            SimpleHTTPRequestHandler.handle_one_request(self)
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            self.close_connection = True

    # nao registrar querystring (as keys do Gemini viajam ali)
    @staticmethod
    def _sem_query(texto):
        if "?" not in texto:
            return texto
        inicio, _, resto = texto.partition("?")
        fim = resto.find(" ")                       # onde acaba a query e volta o " HTTP/1.1"
        return inicio + " [query omitida]" + (resto[fim:] if fim >= 0 else "")

    def log_message(self, fmt, *args):
        # Redige so a QUERY, nao a linha inteira. A versao antiga cortava tudo a
        # partir do primeiro "?", e junto ia o codigo de status: todo POST em
        # /parallax aparecia como '"POST /parallax [query omitida]', sem dizer se
        # tinha dado 200, 409 ou 503 — foi assim que um render duplicado passou
        # despercebido. So argumento de texto e higienizado: o log_error usa %d.
        limpos = tuple(self._sem_query(a) if isinstance(a, str) else a for a in args)
        sys.stderr.write("%s - %s\n" % (self.log_date_time_string(), fmt % limpos))


if __name__ == "__main__":
    try:
        srv = ThreadingHTTPServer((HOST, PORT), Handler)
    except OSError as e:
        print("Nao consegui abrir a porta %d: %s" % (PORT, e))
        if e.errno in (48, 98, 10048):
            print("Ja existe um serve.py rodando? Tente abrir http://localhost:%d" % PORT)
            print("Se for outro programa na porta, rode:  python serve.py 8778")
        sys.exit(1)
    print("Shorts Creator em  http://%s:%d" % (HOST, PORT))
    print("Proxy da Replicate em  %s%s  ->  %s" % (PREFIX, "*", UPSTREAM))
    print("Download de imagem em  %s?url=...  (https publico, so imagem/video)" % FETCH_PREFIX)
    st = parallax_status()
    print("DepthFlow local em  %s  ->  venv:%s ffmpeg:%s" % (
        PARALLAX_PREFIX, "ok" if st["venv"] else "FALTA", "ok" if st["ffmpeg"] else "FALTA"))
    if not st["venv"]:
        print("  (para animar sem pagar clipe:  python AIImage\\setup.py)")
    sobras = parallax_limpar_entradas()
    if sobras:
        print("  (limpei %d imagem(ns) de render interrompido em AIImage/input)" % sobras)
    os.makedirs(PROJETOS_DIR, exist_ok=True)
    print("Projetos em  %s  ->  %s (%d salvos)" % (
        PROJETOS_PREFIX, PROJETOS_DIR, len(projetos_listar())))
    print("Servindo os arquivos de  %s" % APP_DIR)
    print("Ctrl+C para parar.")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nparando…")
        srv.server_close()
