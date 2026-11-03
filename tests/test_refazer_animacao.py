"""Refazer animação reutiliza áudio/timeline e nunca entra no caminho de narração."""
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("animation_server", Path(__file__).resolve().parents[1] / "serve.py")
server = importlib.util.module_from_spec(spec)
with patch.object(sys, "argv", ["serve.py"]):
    spec.loader.exec_module(server)


class Response:
    def __init__(self, body):
        self.body = body

    def _ler_corpo(self, limit):
        return json.dumps(self.body).encode()

    def _json(self, status, body):
        return status, body


class RefazerAnimacaoTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent)
        self.addCleanup(self.tmp.cleanup)
        root = Path(self.tmp.name)
        self.pid = "projeto-teste"
        self.project = root / "projetos" / self.pid
        self.video = root / "videos" / self.pid
        self.project.mkdir(parents=True)
        self.video.mkdir(parents=True)
        (self.project / "projeto.json").write_text('{"nome":"Teste","salvoEm":"original"}')
        self.timeline = {"fps": 30, "largura": 1080, "altura": 1920, "duracao": 2,
                         "cenas": [{"audio": "cena_000.wav", "inicio": 0, "dur": 2,
                                    "palavras": [{"w": "Oi", "t": 0.2}], "texto": "Oi"}]}
        self.salvar_timeline()
        (self.video / "cena_000.wav").write_bytes(b"audio-existente")
        (self.video / "composicoes.json").write_text('[{"id":"teste"}]')
        for name, value in (("PROJETOS_DIR", str(root / "projetos")),
                            ("REMOTION_VIDEOS", str(root / "videos")),
                            ("auto_jobs", {}), ("claude_renders", {})):
            p = patch.object(server, name, value)
            p.start()
            self.addCleanup(p.stop)

    def salvar_timeline(self):
        (self.video / "timeline.json").write_text(json.dumps(self.timeline), encoding="utf-8")

    def post(self, body):
        return server.Handler._auto(Response(body), "POST", "/auto")

    def test_inicia_sem_chave_e_sem_narrar(self):
        with patch.object(server, "auto_claude_bin", return_value="claude"), \
             patch.object(server, "remotion_status", return_value={"instalado": True}), \
             patch.object(server, "auto_chave", side_effect=AssertionError("nao consultar ElevenLabs")), \
             patch.object(server, "auto_iniciar") as iniciar:
            status, job = self.post({"animacao": self.pid, "orientacao": "Mais movimento"})
        self.assertEqual(status, 202)
        self.assertEqual(job["tipo"], "animacao")
        self.assertEqual(job["etapa"], 2)
        self.assertEqual(job["orientacao"], "Mais movimento")
        iniciar.assert_called_once()

    def test_execucao_e_retry_preservam_audio_timeline_e_projeto(self):
        files = [self.video / "cena_000.wav", self.video / "timeline.json", self.project / "projeto.json"]
        before = [p.read_bytes() for p in files]
        job = {"id": "auto-123456", "tipo": "animacao", "pid": self.pid, "log": [], "estado": "erro"}
        with patch.object(server, "auto_claude", return_value="Animação refeita") as montar, \
             patch.object(server, "auto_rodar", side_effect=AssertionError("nao chamar narrar.py")):
            server.auto_executar(job)
        self.assertEqual(job["estado"], "pronto")
        self.assertEqual([p.read_bytes() for p in files], before)
        self.assertIn("NAO execute ferramentas/narrar.py", montar.call_args.args[1])

    def test_recusa_audio_ausente_antes_de_iniciar(self):
        (self.video / "cena_000.wav").unlink()
        with patch.object(server, "auto_claude_bin", return_value="claude"), patch.object(server, "auto_iniciar") as iniciar:
            status, _ = self.post({"animacao": self.pid})
        self.assertEqual(status, 400)
        iniciar.assert_not_called()

    def test_bloqueia_caminho_externo_e_timeline_invalida(self):
        for audio in ("../audio.wav", "cena_000.mp4", "", None):
            with self.subTest(audio=audio):
                self.timeline["cenas"][0]["audio"] = audio
                self.salvar_timeline()
                with self.assertRaises(ValueError):
                    server.auto_timeline_animacao(self.pid)
        (self.video / "timeline.json").write_text("null")
        with self.assertRaises(ValueError):
            server.auto_timeline_animacao(self.pid)

    def test_recusa_outra_montagem_em_andamento(self):
        server.auto_jobs["auto-999999"] = {"estado": "rodando"}
        with patch.object(server, "auto_claude_bin", return_value="claude"), patch.object(server, "auto_iniciar") as iniciar:
            status, _ = self.post({"animacao": self.pid})
        self.assertEqual(status, 409)
        iniciar.assert_not_called()

    def test_falha_pode_ser_retentada_sem_cair_na_narracao(self):
        job = {"id": "auto-123456", "tipo": "animacao", "pid": self.pid, "log": [], "estado": "rodando"}
        with patch.object(server, "auto_claude", side_effect=RuntimeError("falhou")):
            server.auto_executar(job)
        self.assertEqual(job["estado"], "erro")
        server.auto_jobs[job["id"]] = job
        with patch.object(server, "auto_iniciar") as iniciar:
            status, _ = server.Handler._auto(Response({}), "POST", "/auto/auto-123456/continuar")
        self.assertEqual(status, 202)
        self.assertEqual(iniciar.call_args.args[0]["tipo"], "animacao")


if __name__ == "__main__":
    unittest.main()
