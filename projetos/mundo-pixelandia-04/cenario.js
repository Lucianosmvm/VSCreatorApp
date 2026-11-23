// Direção exclusiva do episódio 04, executada dentro da cópia filmada do jogo.
window.__ep4pump = window.__pump;
window.__ep4hidden = [];
window.__pump = function (ms) {
  for (const n of window.__ep4hidden) n.inside = false;
  window.__ep4hidden = [];
  const scene = window.__ep4scene;
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
      // Abra a área de filmagem em torno do corpo e das copas à frente dele.
      // O arquivo do jogo e o estado salvo anterior permanecem independentes da tomada.
      const tileX = Math.floor(n.x / T);
      const tileY = Math.floor(n.y / T);
      for (let y = tileY - 3; y <= tileY + 6; y++) {
        for (let x = tileX - 3; x <= tileX + 3; x++) {
          if (x >= 0 && x < W && y >= 0 && y < H && obj[idx(x, y)] === O_TREE) {
            obj[idx(x, y)] = 0;
          }
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
        window.__ep4hidden.push(n);
        n.inside = true;
      }
    }
  }
  window.__ep4pump(ms);
  if (!scene?.forest) return;
  const x = (CX + 25) * T + 8;
  const y = (CY - 20) * T + 8;
  ctx.save();
  ctx.setTransform(cam.z * dpr, 0, 0, cam.z * dpr,
    Math.round((cw / 2 - cam.x * cam.z) * dpr), Math.round((ch / 2 - cam.y * cam.z) * dpr));
  ctx.strokeStyle = "#57462c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, 25, 12, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (scene.prop !== "marcas") {
    // Drone de reconhecimento: quatro braços, hélices, câmera e lâmpada avariada.
    ctx.strokeStyle = "#87959d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 16, y - 11);
    ctx.lineTo(x + 16, y + 8);
    ctx.moveTo(x + 16, y - 11);
    ctx.lineTo(x - 16, y + 8);
    ctx.stroke();
    for (const [dx, dy] of [[-18,-12],[18,-12],[-18,9],[18,9]]) {
      ctx.fillStyle = "#262e3d";
      ctx.fillRect(x + dx - 7, y + dy - 1, 14, 2);
      ctx.fillStyle = "#aab5b1";
      ctx.fillRect(x + dx - 1, y + dy - 2, 2, 4);
    }
    ctx.fillStyle = "#71899b";
    ctx.fillRect(x - 9, y - 9, 18, 16);
    ctx.fillStyle = "#c5d0d1";
    ctx.fillRect(x - 6, y - 7, 12, 3);
    ctx.fillStyle = "#163244";
    ctx.fillRect(x - 3, y + 2, 6, 5);
    ctx.fillStyle = "#65eee7";
    ctx.fillRect(x + 4, y - 3, 3, 2);
    ctx.fillStyle = "#ffe46c";
    ctx.font = "bold 5px monospace";
    ctx.textAlign = "center";
    ctx.fillText("R", x - 3, y - 1);
    if (scene.prop === "camera") {
      // Registro do voo mostrado na tela de campo de Robson.
      const sy = y + 5;
      ctx.fillStyle = "#252732";
      ctx.fillRect(x - 29, sy - 31, 58, 33);
      ctx.fillStyle = "#3c584b";
      ctx.fillRect(x - 27, sy - 29, 54, 28);
      ctx.fillStyle = "#645b50";
      ctx.fillRect(x - 11, sy - 25, 22, 24);
      ctx.fillStyle = "#141d22";
      ctx.fillRect(x - 7, sy - 21, 14, 20);
      ctx.strokeStyle = "#8fbd79";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 16, sy - 27);
      ctx.lineTo(x, sy - 9);
      ctx.lineTo(x + 14, sy - 28);
      ctx.stroke();
    }
  }
  ctx.restore();
};
