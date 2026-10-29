"""Download após reiniciar o servidor só aceita renders concluídos."""
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("creator_server", Path(__file__).resolve().parents[1] / "serve.py")
server = importlib.util.module_from_spec(spec)
with patch.object(sys, "argv", ["serve.py"]):
    spec.loader.exec_module(server)


class Response:
    def _json(self, status, body):
        return status, body

    def _responder(self, status, body, mime):
        return status, body


class RenderResultadoTest(unittest.TestCase):
    def test_resultado_concluido_sobrevive_ao_restart(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent) as folder, patch.object(server, "remotion_dir", return_value=folder):
            Path(folder, "saida.mp4").write_bytes(b"video-teste")
            Path(folder, "pronto.json").write_text(json.dumps({"duracao": 1, "bytes": 11}))
            result = server.Handler._remotion(Response(), "GET", "/remotion/rmt-123/mp4")
            self.assertEqual(result, (200, b"video-teste"))

    def test_mp4_parcial_nao_e_exibido_como_pronto(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent) as folder, patch.object(server, "remotion_dir", return_value=folder):
            Path(folder, "saida.mp4").write_bytes(b"video-incompleto")
            result = server.Handler._remotion(Response(), "GET", "/remotion/rmt-123/mp4")
            self.assertEqual(result[0], 404)


if __name__ == "__main__":
    unittest.main()
