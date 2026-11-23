// EP. 06 — ampliação real da vila (fica salva no vila.json do episódio).
// Bairro da Mina: floresta aberta a nordeste, estrada até a boca da mina, postes,
// três casas novas, flores na praça e a estátua do Astro concluída com pedra da mina.
window.__px6 = (() => {
  const REG = { x0: CX + 19, x1: CX + 31, y0: CY - 21, y1: CY - 4 };
  const ESTRADA_X = CX + 25;
  const CASAS = [[CX + 21, CY - 9], [CX + 21, CY - 14], [CX + 27, CY - 11]];
  const POSTES = [[CX + 24, CY - 6], [CX + 26, CY - 8], [CX + 24, CY - 12], [CX + 26, CY - 15], [CX + 24, CY - 18]];
  const redraw = (x, y) => { try { drawGroundTile(x, y); } catch (e) {} };
  const dentro = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

  // Árvores da região, da borda da vila para dentro da floresta.
  const arvores = [];
  for (let y = REG.y0; y <= REG.y1; y++) for (let x = REG.x0; x <= REG.x1; x++)
    if (dentro(x, y) && obj[idx(x, y)] === O_TREE) arvores.push([x, y]);
  arvores.sort((a, b) => Math.hypot(a[0] - (CX + 20), a[1] - (CY - 4)) - Math.hypot(b[0] - (CX + 20), b[1] - (CY - 4)));

  // Estrada: sai da estrada leste (y = CY-3) e sobe até a mina (y = CY-18).
  const estrada = [];
  for (let x = CX + 21; x <= ESTRADA_X; x++) estrada.push([x, CY - 3]);
  for (let y = CY - 4; y >= CY - 18; y--) estrada.push([ESTRADA_X, y]);

  let abertas = 0, assentadas = 0;
  return {
    REG, ESTRADA_X,
    abrir(f) {
      const alvo = Math.round(arvores.length * Math.min(1, f));
      for (; abertas < alvo; abertas++) {
        const [x, y] = arvores[abertas]; obj[idx(x, y)] = 0; redraw(x, y);
        if (abertas % 2 === 0) try { burst(x * T + 8, y * T + 2, '#6b8e23', 5); } catch (e) {}
      }
    },
    estrada(f) {
      const alvo = Math.round(estrada.length * Math.min(1, f));
      for (; assentadas < alvo; assentadas++) {
        const [x, y] = estrada[assentadas], i = idx(x, y);
        if (obj[i] === O_TREE || obj[i] === O_ROCK || obj[i] === O_FLOWER) obj[i] = 0;
        ground[i] = G_PATH; redraw(x, y);
      }
    },
    postes() {
      for (const [x, y] of POSTES) { const i = idx(x, y); if (bld[i] < 0 && obj[i] !== O_LAMP) { obj[i] = O_LAMP; lampCount++; redraw(x, y); } }
    },
    casas() {
      const feitas = [];
      for (const [x, y] of CASAS) {
        if (buildings.some(b => b.x === x && b.y === y)) continue;
        for (let yy = y; yy < y + 3; yy++) for (let xx = x; xx < x + 3; xx++) { const i = idx(xx, yy); obj[i] = 0; ground[i] = G_GRASS; redraw(xx, yy); }
        const d = BT.casa;
        const b = { id: nextBid++, type: 'casa', x, y, w: d.w, h: d.h, done: true, progress: d.time, need: d.time, manual: true, owner: null, startedAt: gtime, bairro: 'Bairro da Mina' };
        placeBuilding(b); buildings.push(b); bById.set(b.id, b); feitas.push(b.id);
      }
      try { assignHomes(); } catch (e) {}
      return feitas;
    },
    flores() {
      let n = 0;
      for (let r = 3; r <= 7 && n < 40; r++) for (let a = 0; a < 24 && n < 40; a++) {
        const x = Math.round(CX + Math.cos(a / 24 * Math.PI * 2) * r), y = Math.round(CY + Math.sin(a / 24 * Math.PI * 2) * r), i = idx(x, y);
        if (ground[i] === G_GRASS && obj[i] === 0 && bld[i] < 0 && (a + r) % 2 === 0) { obj[i] = O_FLOWER; flowerCount++; n++; redraw(x, y); }
      }
      return n;
    },
    estatua(nome) {
      const b = buildings.find(b => b.type === 'estatua' && !b.done) || buildings.filter(b => b.type === 'estatua').at(-1);
      if (!b) return null;
      b.done = true; b.progress = b.need || BT.estatua.time; b.nome = nome; b.material = 'pedra da mina'; b._cache = null;
      return { x: (b.x + 1) * T, y: (b.y + 1) * T, id: b.id };
    },
    tudo(nome) { this.abrir(1); this.estrada(1); this.postes(); this.casas(); this.flores(); return this.estatua(nome); },
  };
})();
true;
