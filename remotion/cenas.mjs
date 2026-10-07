// Gera um clipe curto (com som) e uma miniatura de CADA cena de um vídeo
// montado pelo Claude, para o app mostrar a animação dentro do card da cena.
//
//   node cenas.mjs <composição> <id-do-projeto> [cena...]
//
// Sem lista de cenas, gera todas. Saída em public/videos/<projeto>/cenas/:
//   cena_000.mp4, cena_000.jpg, ...  e index.json (o que existe + quando)
//
// Um bundle e um navegador só para todas as cenas: bem mais rápido que chamar
// `remotion render` 46 vezes.
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [comp, projeto, ...somente] = process.argv.slice(2);
if (!comp || !/^[a-z0-9-]+$/i.test(projeto || "")) {
  console.error("uso: node cenas.mjs <composição> <id-do-projeto> [índices...]");
  process.exit(1);
}

const raiz = path.dirname(fileURLToPath(import.meta.url));
const saida = path.join(raiz, "public", "videos", projeto, "cenas");
fs.mkdirSync(saida, { recursive: true });

const ESCALA = 1 / 3; // 1920x1080 -> 640x360: leve para o card

const serveUrl = await bundle({ entryPoint: path.join(raiz, "src", "index.ts") });
const browser = await openBrowser("chrome");
const composition = await selectComposition({ serveUrl, id: comp, puppeteerInstance: browser });
const { cenas, fps } = composition.props;

const indices = somente.length ? somente.map(Number) : cenas.map((_, i) => i);
const indicePath = path.join(saida, "index.json");
const indice = fs.existsSync(indicePath) ? JSON.parse(fs.readFileSync(indicePath, "utf8")) : { cenas: {} };

for (const i of indices) {
  const c = cenas[i];
  const ini = Math.round(c.inicio * fps);
  const fim = Math.min(composition.durationInFrames - 1, Math.round((c.inicio + c.dur) * fps) - 1);
  const nome = `cena_${String(i).padStart(3, "0")}`;
  // miniatura perto do fim da fala: o painel e os destaques já estão na tela
  const ultima = c.palavras[c.palavras.length - 1];
  const tPoster = Math.min(c.dur - 0.3, (ultima ? ultima.t : c.dur) + 0.2);
  await renderStill({
    composition, serveUrl, puppeteerInstance: browser, scale: ESCALA,
    frame: Math.min(fim, ini + Math.round(tPoster * fps)),
    output: path.join(saida, nome + ".jpg"), imageFormat: "jpeg", jpegQuality: 80,
  });
  await renderMedia({
    composition, serveUrl, puppeteerInstance: browser, scale: ESCALA,
    codec: "h264", crf: 28, frameRange: [ini, fim],
    outputLocation: path.join(saida, nome + ".mp4"),
  });
  indice.cenas[i] = { quando: Date.now() };
  fs.writeFileSync(indicePath, JSON.stringify({ ...indice, composicao: comp, total: cenas.length }));
  console.log(`cena ${i + 1}/${cenas.length}`);
}

await browser.close({ silent: true });
console.log("pronto");
