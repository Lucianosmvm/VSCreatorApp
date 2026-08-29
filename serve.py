#!/usr/bin/env python3
"""
Servidor local do Shorts Creator.

Faz tres coisas:
  1. serve o index.html em http://localhost:8777
  2. repassa /replicate/* para https://api.replicate.com/v1/*
  3. baixa a imagem de saida em /fetch?url=...

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
import socket
import sys
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
        if self.path.startswith(PREFIX) or self.path.split("?")[0] == FETCH_PREFIX:
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
        if self.path.split("?")[0] == FETCH_PREFIX:
            return self._fetch()
        return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path.startswith(PREFIX):
            return self._proxy("POST")
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
    def log_message(self, fmt, *args):
        msg = fmt % args
        if "?" in msg:
            msg = msg.split("?")[0] + " [query omitida]"
        sys.stderr.write("%s - %s\n" % (self.log_date_time_string(), msg))


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
    print("Servindo os arquivos de  %s" % APP_DIR)
    print("Ctrl+C para parar.")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nparando…")
        srv.server_close()
