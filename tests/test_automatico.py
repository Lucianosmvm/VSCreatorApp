"""Partes puras da narracao no servidor (ferramentas/narrar.py)."""
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ferramentas"))
import narrar  # noqa: E402


class Blocos(unittest.TestCase):
    def test_um_bloco_quando_cabe(self):
        self.assertEqual(len(narrar.blocos_da_faixa([{"texto": "oi"}] * 3)), 1)

    def test_blocos_de_tamanho_parecido(self):
        b = narrar.blocos_da_faixa([{"texto": "x" * 500} for _ in range(7)])
        self.assertEqual(sum(len(x) for x in b), 7)
        self.assertLessEqual(max(len(x) for x in b) - min(len(x) for x in b), 1)


class Alinhamento(unittest.TestCase):
    def test_identidade(self):
        self.assertEqual(narrar.indice_do_alinhamento(list("ab c"), "ab c")(3), 3)

    def test_brancos_diferentes(self):
        idx = narrar.indice_do_alinhamento(list("ab  c"), "ab c")
        self.assertEqual(idx(3), 4)

    def test_sem_casamento(self):
        self.assertIsNone(narrar.indice_do_alinhamento(list("abc"), "abcd"))


if __name__ == "__main__":
    unittest.main()
