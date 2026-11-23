// Direção exclusiva do episódio 05, executada dentro da cópia filmada do jogo.
// Mesmo esquema do #4: o grupo da cena fica parado (ou caminha) num ponto fixo,
// a câmera centraliza nele e moradores de fora da cena saem do quadro.
window.__ep5pump = window.__pump;
window.__ep5hidden = [];
window.__pump = function (ms) {
  for (const n of window.__ep5hidden) n.inside = false;
  window.__ep5hidden = [];
  const scene = window.__ep5scene;
  if (scene) {
    const elapsed = Math.max(0, gtime - scene.started);
    const walk = Math.min(1, elapsed / scene.travel);
    const centerX = scene.x + (scene.endX - scene.x) * walk;
    const centerY = scene.y + (scene.endY - scene.y) * walk;
    cam.x = centerX;
    cam.y = centerY + 26 + Math.floor((scene.names.length - 1) / 3) * 13.5;
    const ids = [];
    for (const [i, name] of scene.names.entries()) {
      const n = npcs.filter(n => n.name === name).at(-1);
      if (!n) continue;
      ids.push(n.id);
      n.x = centerX + (i % 3 - 1) * 21;
      n.y = centerY + 38 + Math.floor(i / 3) * 27;
      const tileX = Math.floor(n.x / T);
      const tileY = Math.floor(n.y / T);
      for (let y = tileY - 3; y <= tileY + 6; y++) {
        for (let x = tileX - 3; x <= tileX + 3; x++) {
          if (x >= 0 && x < W && y >= 0 && y < H && obj[idx(x, y)] === O_TREE) obj[idx(x, y)] = 0;
        }
      }
      n.inside = false;
      n.sleeping = false;
      n.active = true;
      n.plan = [work(300, null, null)];
      n.step = null;
      n.dir = walk < 1 ? "right" : "up";
      n.walkT = walk < 1 ? gtime * 7 : 0;
    }
    for (const n of npcs) {
      if (!ids.includes(n.id) && Math.abs(n.x - centerX) < 105 && Math.abs(n.y - centerY) < 145) {
        window.__ep5hidden.push(n);
        n.inside = true;
      }
    }
  }
  window.__ep5pump(ms);
  if (!scene?.prop) return;
  // A entrada fica na mesma clareira do #4.
  const x = (CX + 25) * T + 8;
  const y = (CY - 20) * T + 8;
  ctx.save();
  ctx.setTransform(cam.z * dpr, 0, 0, cam.z * dpr,
    Math.round((cw / 2 - cam.x * cam.z) * dpr), Math.round((ch / 2 - cam.y * cam.z) * dpr));
  // Raízes em volta da entrada.
  ctx.strokeStyle = "#5a3f24";
  ctx.lineWidth = 3;
  for (const [a, b, c, d] of [[-30, 6, -14, -4], [30, 6, 14, -4], [-26, 14, -10, 8], [26, 14, 10, 8], [-6, -22, -2, -14], [8, -22, 3, -14]]) {
    ctx.beginPath();
    ctx.moveTo(x + a, y + b);
    ctx.quadraticCurveTo(x + (a + c) / 2, y + Math.min(b, d) - 6, x + c, y + d);
    ctx.stroke();
  }
  // Arco de pedra com a boca da mina.
  ctx.fillStyle = "#7d828a";
  ctx.fillRect(x - 18, y - 16, 36, 26);
  ctx.fillStyle = "#9aa0a8";
  for (const [dx, dy] of [[-18, -16], [-6, -18], [6, -16], [-18, -4], [12, -4]]) ctx.fillRect(x + dx, y + dy, 8, 6);
  ctx.fillStyle = scene.prop === "aberta" || scene.prop === "pedras" ? "#2b2118" : "#121212";
  ctx.fillRect(x - 9, y - 8, 18, 18);
  if (scene.prop === "aberta" || scene.prop === "pedras") {
    // Lamparina dos fundadores acesa na boca da mina.
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(x - 2, y - 4, 4, 4);
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(x, y - 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (scene.prop === "pedras") {
    // Pedra de qualidade empilhada e uma picareta antiga.
    for (const [dx, dy, c] of [[22, 6, "#b9bec6"], [30, 6, "#9aa0a8"], [26, 0, "#c9ced6"], [-34, 6, "#b9bec6"], [-26, 6, "#9aa0a8"]]) {
      ctx.fillStyle = c;
      ctx.fillRect(x + dx, y + dy, 8, 6);
      ctx.fillStyle = "#6b7078";
      ctx.fillRect(x + dx, y + dy + 5, 8, 1);
    }
    ctx.strokeStyle = "#7a5530";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 40, y + 14);
    ctx.lineTo(x - 30, y + 2);
    ctx.stroke();
    ctx.strokeStyle = "#aab0b8";
    ctx.beginPath();
    ctx.moveTo(x - 35, y);
    ctx.quadraticCurveTo(x - 30, y - 1, x - 25, y + 4);
    ctx.stroke();
  }
  ctx.restore();
};
