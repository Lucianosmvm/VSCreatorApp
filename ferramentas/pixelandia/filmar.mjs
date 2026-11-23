// Estilo "Mundo Pixelândia": filma a vila rodando o próprio jogo (Chrome headless)
// e gera as cenas + o roteiro que o Remotion monta (src/pixelandia/).
//
// Uso:
//   node ferramentas/pixelandia/filmar.mjs --id mundo-pixelandia-01 --novos 40
//   node ferramentas/pixelandia/filmar.mjs --id mundo-pixelandia-02 --vila projetos/mundo-pixelandia-01/vila.json --novos-json novos.json --episodio 2
//
//   --id          id do vídeo (pasta em projetos/ e remotion/public/pixelandia/)
//   --jogo        index.html do jogo (padrão: D:/Nova pasta/mundo-pixelandia/index.html)
//   --vila        estado salvo de um episódio anterior (continuação)
//   --novos N     cria N moradores com nomes de exemplo (vila nova)
//   --novos-json  arquivo [{"nome":"Ana","prof":"pedreiro","sexo":"f"}] com os novos inscritos
//   --episodio N  número do episódio (padrão 1)
//   --avancar S   segundos de simulação antes de filmar (padrão 1500)
//
// Saída:
//   projetos/<id>/vila.json                 estado da vila depois do episódio (use em --vila no próximo)
//   remotion/public/pixelandia/<id>/cena-N.mp4 + video.json
//   remotion/src/pixelandia/registro.ts     (regerado com todos os vídeos do estilo)
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const ID = arg("id");
if (!ID || !/^[a-z0-9-]+$/.test(ID)) { console.error("Informe --id (letras minúsculas, números e hífen)."); process.exit(1); }
const JOGO = arg("jogo", "D:/Nova pasta/mundo-pixelandia/index.html");
const VILA = arg("vila");
const EPISODIO = Number(arg("episodio", "1"));
const AVANCAR = Number(arg("avancar", "1500"));
// --plano arquivo.json: roteiro próprio {cenas:[{nome,dur,linhas,clima,cta,camera|seguir}]}.
// camera: abertura | multidao | obras | vazio | final; seguir: id do morador.
const PLANO = arg("plano");
// Filma em 540x960 (zoom parecido com o do celular) e amplia 2x sem borrar o pixel art.
const LARG = 1080, ALT = 1920, FPS = 30, CAP_L = 540, CAP_A = 960;
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((p) => fs.existsSync(p));

const NOMES_F = ["Ana", "Bia", "Carla", "Duda", "Elisa", "Fernanda", "Gabi", "Helena", "Isa", "Julia", "Karen", "Lara", "Manu", "Nina", "Olivia", "Paula", "Rita", "Sofia", "Tati", "Vivi"];
const NOMES_M = ["Arthur", "Bruno", "Caio", "Davi", "Enzo", "Felipe", "Gui", "Heitor", "Igor", "João", "Leo", "Miguel", "Nico", "Otávio", "Pedro", "Rafa", "Samuel", "Theo", "Vitor", "Zeca"];
const PROFS = ["pedreiro", "lenhador", "pedreiro", "fazendeiro", "lenhador", "pedreiro", "minerador", "pescador", "fazendeiro", "comerciante", "cozinheiro", "pedreiro", "lenhador", "padeiro", "professor", "medico", "policial", "ferreiro", "pecuarista", "cacador"];

function novosMoradores() {
  const j = arg("novos-json");
  if (j) return JSON.parse(fs.readFileSync(path.resolve(j), "utf8")).map((m) => ({ nome: m.nome, prof: m.prof || "pedreiro", sexo: m.sexo === "f" ? "f" : "m", custom: m.custom || "" }));
  const n = Number(arg("novos", VILA ? "0" : "40"));
  return Array.from({ length: n }, (_, i) => {
    const f = i % 2 === 0;
    const lista = f ? NOMES_F : NOMES_M;
    return { nome: lista[Math.floor(i / 2) % lista.length] + (i >= 40 ? " " + (Math.floor(i / 40) + 1) : ""), prof: PROFS[i % PROFS.length], sexo: f ? "f" : "m", custom: "" };
  });
}

// ---------- Chrome via DevTools ----------
async function abrirChrome() {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "pixelandia-"));
  const porta = 9500 + Math.floor(Math.random() * 400);
  const proc = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`, "--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required", "about:blank"], { stdio: "ignore" });
  let alvo;
  for (let i = 0; i < 40 && !alvo; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try { alvo = (await (await fetch(`http://127.0.0.1:${porta}/json`)).json()).find((t) => t.type === "page"); } catch {}
  }
  if (!alvo) throw new Error("Chrome não abriu.");
  const ws = new WebSocket(alvo.webSocketDebuggerUrl, { maxPayload: 1 << 30 });
  await new Promise((r) => (ws.onopen = r));
  let n = 0; const pend = new Map(); const erros = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    else if (m.method === "Runtime.exceptionThrown") erros.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  };
  const cmd = (method, params = {}) => new Promise((r) => { const id = ++n; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  const js = async (expr) => {
    const r = await cmd("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };
  const fechar = () => { try { ws.close(); } catch {} proc.kill(); try { fs.rmSync(perfil, { recursive: true, force: true }); } catch {} };
  return { cmd, js, erros, fechar };
}

// ---------- roteiro (textos no estilo do app) ----------
function roteiro(st, cenas) {
  const nomeVila = st.vila;
  const destaque = st.destaque;
  const obraTxt = st.prontas > 0
    ? `E juntos já construíram\n${st.prontas} ${st.prontas === 1 ? "obra" : "obras"} 🔨`
    : `As primeiras obras\njá começaram 🔨`;
  const textos = {
    abertura: [`📺 ${nomeVila} #${EPISODIO}\nCada inscrito vira um morador`],
    multidao: [`Hoje a vila já tem\n${st.pop} moradores`, `E cada um é\num inscrito de verdade`],
    morador: [`${destaque.nome} chegou\ncomo ${destaque.prof}`, `Cada morador\ntem uma profissão`],
    obras: [obraTxt, st.fila ? `Ainda faltam\n${st.fila} construções na fila` : `A vila não para\nde crescer`],
    vazio: [`Mas olha quanto espaço\nainda vazio 👀`],
    final: [`Quer morar aqui?\nComente NOME + PROFISSÃO 👇`, `Segue pra ver\no episódio #${EPISODIO + 1}`],
  };
  const clima = { vazio: "misterio", final: "vitoria" };
  return cenas.map((c) => ({ ...c, linhas: textos[c.nome], clima: clima[c.nome] || null, cta: c.nome === "final" }));
}

// ---------- principal ----------
const pasta = path.join(RAIZ, "remotion/public/pixelandia", ID);
const pastaProj = path.join(RAIZ, "projetos", ID);
fs.mkdirSync(pasta, { recursive: true });
fs.mkdirSync(pastaProj, { recursive: true });

const cr = await abrirChrome();
try {
  await cr.cmd("Page.enable");
  await cr.cmd("Runtime.enable");
  await cr.cmd("Emulation.setDeviceMetricsOverride", { width: CAP_L, height: CAP_A, deviceScaleFactor: 1, mobile: false });
  // O jogo passa a andar só quando a gente manda: cada quadro é calculado e fotografado.
  await cr.cmd("Page.addScriptToEvaluateOnNewDocument", { source: "window.__rafCb=null;window.__T=0;window.requestAnimationFrame=cb=>{window.__rafCb=cb;return 1};window.cancelAnimationFrame=()=>{};" });
  await cr.cmd("Page.navigate", { url: pathToFileURL(JOGO).href });
  await new Promise((r) => setTimeout(r, 4000));
  await cr.js(`document.fonts.ready.then(()=>true)`);

  await cr.js(`window.__pump=(ms)=>{const cb=window.__rafCb;window.__rafCb=null;window.__T+=ms;if(cb)cb(window.__T)};
    window.__ff=(n,ms,scale)=>{timeScale=scale;for(let i=0;i<n;i++)window.__pump(ms);timeScale=1;return true};
    true`);
  if (VILA) {
    const dados = fs.readFileSync(path.resolve(VILA), "utf8");
    await cr.js(`load(${dados});tlReset&&tlReset();true`);
  }
  const novos = novosMoradores();
  await cr.js(`(()=>{const lista=${JSON.stringify(novos)};for(const m of lista)addNPC(m.nome,PROF[m.prof]||m.prof==='custom'?m.prof:'pedreiro',m.sexo,m.custom,true);assignHomes&&assignHomes();return npcs.length})()`);
  // "seguir" no plano aceita o nome do morador; com nomes repetidos, vale o mais novo.
  const idsPorNome = JSON.parse(await cr.js(`JSON.stringify(npcs.map(m=>[m.id,m.name]))`));
  const idDe = (s) => (typeof s === "string" ? (idsPorNome.filter(([, n]) => n === s).pop() ?? [null])[0] : s);

  // Avança a simulação para a vila trabalhar e construir.
  const passos = Math.ceil(AVANCAR / 0.4);
  for (let feito = 0; feito < passos; feito += 250) {
    await cr.js(`window.__ff(${Math.min(250, passos - feito)},50,8)`);
    process.stdout.write(`\rSimulando a vila: ${Math.min(100, Math.round(((feito + 250) / passos) * 100))}%   `);
  }
  console.log();
  // Grava de dia: pula a noite se for preciso.
  await cr.js(`(()=>{const h=hour();if(h<7||h>15.5){mins=(day()-(h<7?1:0))*1440+8.5*60;for(const n of npcs){n.sleeping=false;if(n.inside)n.inside=false;n.plan=[];n.step=null}}stopEventsQuiet();return hour()})()`);
  await cr.js(`window.__ff(120,50,1)`);
  fs.writeFileSync(path.join(pastaProj, "vila.json"), await cr.js(`serialize()`));

  const st = await cr.js(`(()=>{
    const ativos=npcs.filter(n=>n.active&&!n.inside);
    const pref=['pedreiro','lenhador','fazendeiro','pescador','minerador'];
    let d=null;for(const p of pref){d=ativos.find(n=>n.prof===p&&n.anim);if(d)break}
    d=d||ativos[0]||npcs[0];
    const prontas=buildings.filter(b=>b.done);
    const obras=buildings.filter(b=>!b.done);
    return {vila:villageName,pop:npcs.length,prontas:prontas.length,fila:queue.length+obras.length,
      destaque:{id:d.id,nome:d.name,prof:profLabel(d)},
      alvosObra:[...prontas.slice(-2),...obras.slice(0,1)].map(b=>({x:(b.x+b.w/2)*T,y:(b.y+b.h/2)*T})),
      praca:{x:CX*T+8,y:CY*T+8},chegada:(()=>{const a=arrivalTile();return {x:a.x*T+8,y:a.y*T+8}})(),dia:day()}
  })()`);
  console.log(`Vila: ${st.pop} moradores, ${st.prontas} obras prontas, ${st.fila} na fila, dia ${st.dia}.`);

  // Tomadas de câmera. "de/para" em pixels do mundo; z = zoom.
  const P = st.praca, o = st.alvosObra;
  const longe = { x: P.x + 32 * 16, y: P.y - 22 * 16 };
  // Tomadas prontas que o --plano pode usar pelo nome.
  const TOMADAS = {
    abertura: { de: { ...P, z: 2.2 }, para: { ...P, z: 3.2 }, reunir: true },
    // estrada de chegada vazia, subindo em direção à praça
    estrada: { de: { ...st.chegada, z: 3.4 }, para: { x: (st.chegada.x * 2 + P.x) / 3, y: (st.chegada.y * 2 + P.y) / 3, z: 3 } },
    multidao: { de: { x: P.x - 50, y: P.y + 30, z: 3.5 }, para: { x: P.x + 50, y: P.y - 20, z: 3.8 }, reunir: true },
    obras: { caminho: (o.length ? o : [P]).map((a) => ({ ...a, z: 3.2 })) },
    vazio: { de: { x: P.x + 10 * 16, y: P.y - 8 * 16, z: 2.8 }, para: { ...longe, z: 2.1 } },
    final: { de: { ...P, z: 3.4 }, para: { ...P, z: 2.5 }, reunir: true },
  };
  const plano = PLANO ? JSON.parse(fs.readFileSync(path.resolve(PLANO), "utf8")) : null;
  const cenas = plano ? plano.cenas.map((c) => ({ ...c, ...(c.seguir != null ? { seguir: idDe(c.seguir), z: c.z || 6 } : TOMADAS[c.camera || "abertura"]) })) : [
    { nome: "abertura", dur: 3.6, de: { ...P, z: 2.2 }, para: { ...P, z: 3.2 }, reunir: true },
    { nome: "multidao", dur: 5.2, de: { x: P.x - 50, y: P.y + 30, z: 3.5 }, para: { x: P.x + 50, y: P.y - 20, z: 3.8 }, reunir: true },
    { nome: "morador", dur: 5.2, seguir: st.destaque.id, z: 4.4 },
    { nome: "obras", dur: 5.2, caminho: (o.length ? o : [P]).map((a) => ({ ...a, z: 3.2 })) },
    { nome: "vazio", dur: 3.8, de: { x: P.x + 10 * 16, y: P.y - 8 * 16, z: 2.8 }, para: { ...longe, z: 2.1 } },
    { nome: "final", dur: 5.6, de: { ...P, z: 3.4 }, para: { ...P, z: 2.5 }, reunir: true },
  ];

  const suave = (t) => t * t * (3 - 2 * t);
  for (const [i, c] of cenas.entries()) {
    // "hora": muda o relógio do jogo (ex.: 23.5 = madrugada) e deixa a vila reagir.
    // "estatua": "Nome" ergue uma estátua pronta perto da praça e mira a câmera nela.
    if (c.estatua) {
      const e = JSON.parse(await cr.js(`(()=>{const d=BT.estatua;const s=findSpot(d.w,d.h);if(!s)return JSON.stringify(null);const b={id:nextBid++,type:'estatua',x:s.x,y:s.y,w:d.w,h:d.h,done:true,progress:d.time,need:d.time,manual:true,owner:null,startedAt:gtime,nome:${JSON.stringify(c.estatua)}};placeBuilding(b);buildings.push(b);bById.set(b.id,b);EV.party=Math.max(EV.party||0,30);window.__ff(40,50,1);return JSON.stringify({x:(s.x+1)*T,y:(s.y+1)*T})})()`));
      if (e) { c.de = { x: e.x, y: e.y + 10, z: 4.6 }; c.para = { x: e.x, y: e.y, z: 3.4 }; delete c.caminho; }
    }
    if (c.hora != null) await cr.js(`mins=Math.floor(mins/1440)*1440+${c.hora}*60;window.__ff(160,50,1);true`);
    // "antes": JS rodado no jogo logo antes de filmar a cena (efeitos pontuais do episódio).
    if (c.antes) await cr.js(`(()=>{${c.antes}})();true`);
    // Morador em destaque: garante que está na rua, acordado, e a câmera já começa nele.
    if (c.seguir != null) await cr.js(`(()=>{const n=npcs.find(m=>m.id===${c.seguir});if(!n)return false;if(!n.active){n.active=true;activeCount++}const dentro=n.inside||${!!c.sair};n.inside=false;n.sleeping=false;if(dentro||(!n.plan.length&&!n.step)){n.plan=[goNear(CX,CY,8),work(8,null,null)];n.step=null}window.__ff(dentro?70:20,50,1);return true})()`);
    if (c.reunir) await cr.js(`EV.gather=14;for(const n of npcs)if(n.active){n.plan=[];n.step=null;n.idle=Math.random()};window.__ff(180,50,1)`);
    const quadros = Math.round(c.dur * FPS);
    const saida = path.join(pasta, `cena-${i + 1}.mp4`);
    const rastreioFoco = [];
    const ff = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-vf", `scale=${LARG}:${ALT}:flags=neighbor`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "18", "-r", String(FPS), saida], { stdio: ["pipe", "inherit", "inherit"] });
    for (let q = 0; q < quadros; q++) {
      // "durante": {t: segundos, js}: efeito disparado no meio da cena.
      if (c.durante && q === Math.round(c.durante.t * FPS)) await cr.js(`(()=>{${c.durante.js}})();true`);
      const t = suave(q / Math.max(1, quadros - 1));
      let cam;
      if (c.seguir != null) cam = `{const n=npcs.find(m=>m.id===${c.seguir});if(n){cam.x+=(n.x-cam.x)*${q === 0 ? 1 : 0.12};cam.y+=(n.y-12-cam.y)*${q === 0 ? 1 : 0.12}}cam.z=${c.z}}`;
      else if (c.caminho) {
        const k = c.caminho.length - 1, pos = t * k, a = c.caminho[Math.floor(pos)], b = c.caminho[Math.min(k, Math.floor(pos) + 1)], u = pos - Math.floor(pos);
        cam = `cam.x=${a.x + (b.x - a.x) * u};cam.y=${a.y + (b.y - a.y) * u};cam.z=${a.z}`;
      } else cam = `cam.x=${c.de.x + (c.para.x - c.de.x) * t};cam.y=${c.de.y + (c.para.y - c.de.y) * t};cam.z=${c.de.z + (c.para.z - c.de.z) * t}`;
      const alvo = c.focos?.filter(f => f.t <= q / FPS).at(-1)?.nome;
      const tomada = await cr.js(`(()=>{follow=null;TOUR=null;${cam};window.__pump(${1000 / FPS});const nome=${JSON.stringify(alvo ?? null)};const n=nome?npcs.filter(m=>m.name===nome).at(-1):null;return {imagem:cv.toDataURL('image/jpeg',0.9).slice(23),foco:n&&!n.inside?{nome:n.name,x:+((cw/2+(n.x-cam.x)*cam.z)/cw).toFixed(6),y:+((ch/2+(n.y-22-cam.y)*cam.z)/ch).toFixed(6)}:null}})()`);
      if (c.focos) rastreioFoco.push(tomada.foco);
      if (!ff.stdin.write(Buffer.from(tomada.imagem, "base64"))) await new Promise((r) => ff.stdin.once("drain", r));
    }
    ff.stdin.end();
    await new Promise((r) => ff.on("close", r));
    c.video = `pixelandia/${ID}/cena-${i + 1}.mp4`;
    if (c.focos) c.rastreioFoco = rastreioFoco;
    process.stdout.write(`\rFilmando cenas: ${i + 1}/${cenas.length}   `);
  }
  console.log();
  // "salvarDepois" no plano: o episódio muda o mundo durante as cenas (obras, bairro...),
  // então o vila.json do próximo episódio é gravado depois de filmar.
  if (plano?.salvarDepois) {
    fs.writeFileSync(path.join(pastaProj, "vila.json"), await cr.js(`(()=>{window.__ep6scene=null;window.__ep5scene=null;for(const n of npcs){n.inside=false;n.plan=[];n.step=null}return serialize()})()`));
  }

  let inicio = 0;
  const final = (plano ? cenas : roteiro(st, cenas)).map((c) => { const r = { nome: c.nome, video: c.video, inicio: +inicio.toFixed(3), dur: c.dur, linhas: c.linhas, clima: c.clima ?? null, cta: c.cta, foco: c.seguir != null, rastreioFoco: c.rastreioFoco, audio: c.audio, tempos: c.tempos }; inicio += c.dur; return r; });
  const video = { id: ID, episodio: EPISODIO, vila: st.vila, largura: LARG, altura: ALT, fps: FPS, duracao: +inicio.toFixed(3), estatisticas: st, cenas: final };
  fs.writeFileSync(path.join(pasta, "video.json"), JSON.stringify(video, null, 2));
  fs.writeFileSync(path.join(pastaProj, "roteiro.json"), JSON.stringify(final.map((c) => ({ cena: c.nome, linhas: c.linhas })), null, 2));
  if (cr.erros.length) console.log("Avisos do jogo:", cr.erros.slice(0, 3));
} finally {
  cr.fechar();
}

// Registro com todos os vídeos do estilo (o Root do Remotion lê daqui).
const base = path.join(RAIZ, "remotion/public/pixelandia");
const ids = fs.readdirSync(base).filter((d) => fs.existsSync(path.join(base, d, "video.json"))).sort();
const nome = (d) => "v_" + d.replace(/-/g, "_");
fs.writeFileSync(path.join(RAIZ, "remotion/src/pixelandia/registro.ts"),
  `// Gerado por ferramentas/pixelandia/filmar.mjs — não editar à mão.\nimport type { DadosPixelandia } from "./tipos";\n` +
  ids.map((d) => `import ${nome(d)} from "../../public/pixelandia/${d}/video.json";`).join("\n") +
  `\n\nexport const PIXELANDIA: DadosPixelandia[] = [\n` + ids.map((d) => `  ${nome(d)} as DadosPixelandia,`).join("\n") + `\n];\n`);
console.log(`Pronto: remotion/public/pixelandia/${ID}/video.json (composição "${ID}")`);
