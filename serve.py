#!/usr/bin/env python3
"""
Servidor local do Shorts Creator.

Faz duas coisas:
  1. serve o index.html em http://localhost:8777
  2. repassa /replicate/* para https://api.replicate.com/v1/*

O item 2 existe porque a API da Replicate nao manda cabecalhos CORS: chamada
direta do navegador falha com "TypeError: Failed to fetch" mesmo sem token.
Este proxy so acrescenta os cabecalhos CORS e repassa a requisicao.

O token NAO fica aqui. Ele continua no navegador e viaja no cabecalho
Authorization, que este script apenas encaminha sem ler nem registrar.

Por isso o socket escuta em 127.0.0.1: qualquer um na mesma rede que
alcancasse esta porta poderia usar o proxy. Nao troque para 0.0.0.0.

Uso:  python serve.py [porta]
"""

import json
import sys
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8777
HOST = "127.0.0.1"
PREFIX = "/replicate/"
UPSTREAM = "https://api.replicate.com/v1/"
FORWARD_HEADERS = ("Authorization", "Content-Type", "Prefer")


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    # ---- CORS ----------------------------------------------------------
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type, Prefer")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Max-Age", "86400")

    def do_OPTIONS(self):
        if self.path.startswith(PREFIX):
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

        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self._cors()
        self.end_headers()
        self.wfile.write(data)

    # nao registrar querystring (as keys do Gemini viajam ali)
    def log_message(self, fmt, *args):
        msg = fmt % args
        if "?" in msg:
            msg = msg.split("?")[0] + " [query omitida]"
        sys.stderr.write("%s - %s\n" % (self.log_date_time_string(), msg))


if __name__ == "__main__":
    srv = ThreadingHTTPServer((HOST, PORT), Handler)
    print("Shorts Creator em  http://%s:%d" % (HOST, PORT))
    print("Proxy da Replicate em  %s%s  ->  %s" % (PREFIX, "*", UPSTREAM))
    print("Ctrl+C para parar.")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nparando…")
        srv.server_close()
