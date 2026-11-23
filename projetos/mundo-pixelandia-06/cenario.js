// Direção exclusiva do episódio 06, executada dentro da cópia filmada do jogo.
// Mesmo esquema do #5: o grupo da cena fica num ponto (ou caminha), a câmera centraliza
// nele e quem não está na cena sai do quadro. Novidades do #6:
//  - nomes do grupo aceitam id (número) para separar homônimos (Pedro pedreiro = 4);
//  - "obra": a ampliação acontece durante a cena (__px6, ver ampliacao.js);
//  - adereços: boca da mina, estátua de pedra do Astro, espada/armadura do Pietro Oliveira
//    e skate do Carlos.
window.__ep6pump = window.__pump;
window.__ep6hidden = [];
const ep6npc = (k) => (typeof k === "number" ? npcs.find((n) => n.id === k) : npcs.filter((n) => n.name === k).at(-1));
window.__pump = function (ms) {
  for (const n of window.__ep6hidden) n.inside = false;
  window.__ep6hidden = [];
  const scene = window.__ep6scene;
  if (scene) {
    const elapsed = Math.max(0, gtime - scene.started);
    const walk = Math.min(1, elapsed / scene.travel);
    const centerX = scene.x + (scene.endX - scene.x) * walk;
    const centerY = scene.y + (scene.endY - scene.y) * walk;
    if (scene.obra) {
      const f = (a) => a[0] + (a[1] - a[0]) * walk;
      if (scene.obra.abrir) window.__px6.abrir(f(scene.obra.abrir));
      if (scene.obra.estrada) window.__px6.estrada(f(scene.obra.estrada));
    }
    cam.x = centerX;
    cam.y = centerY + (scene.names.length ? 26 + Math.floor((scene.names.length - 1) / 3) * 13.5 : 0);
    const ids = [];
    for (const [i, name] of scene.names.entries()) {
      const n = ep6npc(name);
      if (!n) continue;
      ids.push(n.id);
      n.x = centerX + (i % 3 - 1) * 21;
      n.y = centerY + 38 + Math.floor(i / 3) * 27;
      n.inside = false;
      n.sleeping = false;
      n.active = true;
      n.plan = [work(300, null, null)];
      n.step = null;
      const anda = scene.endX !== scene.x || scene.endY !== scene.y;
      n.dir = anda && walk < 1 ? (scene.endY < scene.y ? "up" : scene.endX < scene.x ? "left" : "right") : "down";
      n.walkT = anda && walk < 1 ? gtime * 7 : 0;
    }
    if (scene.names.length) {
      for (const n of npcs) {
        if (!ids.includes(n.id) && Math.abs(n.x - centerX) < 105 && Math.abs(n.y - centerY) < 145) {
          window.__ep6hidden.push(n);
          n.inside = true;
        }
      }
    }
  }
  window.__ep6pump(ms);
  ctx.save();
  ctx.setTransform(cam.z * dpr, 0, 0, cam.z * dpr,
    Math.round((cw / 2 - cam.x * cam.z) * dpr), Math.round((ch / 2 - cam.y * cam.z) * dpr));
  ep6mina();
  ep6estatua();
  ep6adereco("Pietro Oliveira", ep6espada);
  ep6adereco("Carlos", ep6skate);
  ctx.restore();
};

function ep6visivel(x, y) {
  return Math.abs(x - cam.x) * cam.z < cw / 2 + 80 && Math.abs(y - cam.y) * cam.z < ch / 2 + 80;
}

// Boca da mina no fim da estrada nova (mesmo ponto do #4 e #5).
function ep6mina() {
  const x = (CX + 25) * T + 8, y = (CY - 20) * T + 8;
  if (!ep6visivel(x, y)) return;
  ctx.strokeStyle = "#5a3f24";
  ctx.lineWidth = 3;
  for (const [a, b, c, d] of [[-30, 6, -14, -4], [30, 6, 14, -4], [-26, 14, -10, 8], [26, 14, 10, 8]]) {
    ctx.beginPath(); ctx.moveTo(x + a, y + b); ctx.quadraticCurveTo(x + (a + c) / 2, y + Math.min(b, d) - 6, x + c, y + d); ctx.stroke();
  }
  ctx.fillStyle = "#7d828a"; ctx.fillRect(x - 18, y - 16, 36, 26);
  ctx.fillStyle = "#9aa0a8";
  for (const [dx, dy] of [[-18, -16], [-6, -18], [6, -16], [-18, -4], [12, -4]]) ctx.fillRect(x + dx, y + dy, 8, 6);
  ctx.fillStyle = "#2b2118"; ctx.fillRect(x - 9, y - 8, 18, 18);
  ctx.fillStyle = "#ffd23f"; ctx.fillRect(x - 2, y - 4, 4, 4);
}

// A estátua do Astro é de pedra da mina: cinza, com placa.
function ep6estatua() {
  const b = buildings.find((b) => b.type === "estatua" && b.done && b.nome === "Astro Novalite");
  if (!b) return;
  const x = b.x * T, y = b.y * T;
  if (!ep6visivel(x + 16, y + 16)) return;
  const g = "#a9aeb6", gd = "#7d828a", fx = x + 13;
  ctx.fillStyle = "#b5bac2"; ctx.fillRect(x + 5, y + 16, 22, 3);
  ctx.fillStyle = "#949aa3"; ctx.fillRect(x + 7, y + 19, 18, 10);
  ctx.fillStyle = g; ctx.fillRect(fx, y - 6, 6, 6); ctx.fillRect(fx - 1, y, 8, 9); ctx.fillRect(fx, y + 9, 3, 7); ctx.fillRect(fx + 4, y + 9, 3, 7);
  ctx.fillStyle = gd; ctx.fillRect(fx + 4, y - 6, 2, 6); ctx.fillRect(fx + 5, y, 2, 9);
  // Braço apontando para o céu (o Astro viu a luz).
  ctx.fillStyle = g; ctx.fillRect(fx + 7, y - 10, 2, 10); ctx.fillRect(fx + 8, y - 13, 2, 3);
  // Placa
  ctx.fillStyle = "#5e3b1c"; ctx.fillRect(x + 8, y + 21, 16, 6);
  ctx.fillStyle = "#ffd23f"; ctx.font = "bold 4px monospace"; ctx.textAlign = "center"; ctx.fillText("ASTRO", x + 16, y + 26);
}

function ep6adereco(nome, desenho) {
  const n = ep6npc(nome);
  if (!n || n.inside || !ep6visivel(n.x, n.y)) return;
  desenho(n.x, n.y);
}

// Pietro Oliveira: espada grande nas costas e elmo prateado.
function ep6espada(x, y) {
  ctx.fillStyle = "#c9ced6"; ctx.fillRect(x + 4, y - 30, 2, 20);
  ctx.fillStyle = "#e8ecf2"; ctx.fillRect(x + 4, y - 30, 1, 20);
  ctx.fillStyle = "#7a5530"; ctx.fillRect(x + 2, y - 11, 6, 2); ctx.fillRect(x + 4, y - 9, 2, 4);
  ctx.fillStyle = "#ffd23f"; ctx.fillRect(x + 4, y - 5, 2, 1);
  ctx.fillStyle = "rgba(200,206,214,.95)"; ctx.fillRect(x - 4, y - 22, 8, 3);
  ctx.fillStyle = "#e8ecf2"; ctx.fillRect(x - 1, y - 25, 2, 3);
}

// Carlos: skate debaixo dos pés.
function ep6skate(x, y) {
  ctx.fillStyle = "#d63a2a"; ctx.fillRect(x - 7, y + 1, 14, 2);
  ctx.fillStyle = "#222"; ctx.fillRect(x - 6, y + 3, 2, 2); ctx.fillRect(x + 4, y + 3, 2, 2);
}
