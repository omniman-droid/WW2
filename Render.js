const WALL_STRIP = 2;

function castRay(px, py, angle, maxDepth = 24) {
  const step = 0.02;
  for (let d = 0; d < maxDepth; d += step) {
    const x = px + Math.cos(angle) * d;
    const y = py + Math.sin(angle) * d;
    const cell = tileAt(x, y);
    if (cell !== ".") {
      return { dist: d, wall: cell, x, y };
    }
  }
  return { dist: maxDepth, wall: "#", x: px, y: py };
}

function drawWorld(player, canvas, ctx, fov) {
  const w = canvas.width;
  const h = canvas.height;

  const ceiling = ctx.createLinearGradient(0, 0, 0, h / 2);
  ceiling.addColorStop(0, "#1d2129");
  ceiling.addColorStop(1, "#2a2d34");
  ctx.fillStyle = ceiling;
  ctx.fillRect(0, 0, w, h / 2);

  const floor = ctx.createLinearGradient(0, h / 2, 0, h);
  floor.addColorStop(0, "#3a3830");
  floor.addColorStop(1, "#1e1c19");
  ctx.fillStyle = floor;
  ctx.fillRect(0, h / 2, w, h / 2);

  const depthBuffer = [];

  for (let sx = 0; sx < w; sx += WALL_STRIP) {
    const t = sx / w;
    const rayAngle = player.angle - fov / 2 + t * fov;
    const hit = castRay(player.x, player.y, rayAngle);

    const corrected = hit.dist * Math.cos(rayAngle - player.angle);
    depthBuffer.push(corrected);

    const wallHeight = Math.min(h, (h * 0.9) / Math.max(0.1, corrected));
    const y = h / 2 - wallHeight / 2;

    const base = WALL_TYPES[hit.wall]?.color || "#808080";
    const shade = Math.max(0.2, 1 - corrected / 10);
    ctx.fillStyle = shadeColor(base, shade);
    ctx.fillRect(sx, y, WALL_STRIP + 1, wallHeight);
  }

  drawEnemies(player, canvas, ctx, depthBuffer, fov);
  drawWeapon(ctx, canvas, player.weapon);
  drawCrosshair(ctx, canvas);

  if (performance.now() < player.hitFlashUntil) {
    ctx.fillStyle = "rgba(255, 40, 40, 0.18)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawEnemies(player, canvas, ctx, depthBuffer, fov) {
  const visible = [];

  for (const enemy of GAME.enemies) {
    if (!enemy.alive) continue;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.hypot(dx, dy);
    const rel = normalizeAngle(Math.atan2(dy, dx) - player.angle);

    if (Math.abs(rel) <= fov * 0.7) {
      visible.push({ enemy, dist, rel });
    }
  }

  visible.sort((a, b) => b.dist - a.dist);

  for (const { enemy, dist, rel } of visible) {
    const size = Math.min(canvas.height * 0.9, (canvas.height * 0.8) / Math.max(dist, 0.1));
    const sx = (rel / fov + 0.5) * canvas.width;
    const sy = canvas.height / 2 - size / 2;

    const depthIdx = Math.floor(Math.max(0, Math.min(depthBuffer.length - 1, sx / WALL_STRIP)));
    if (dist > depthBuffer[depthIdx]) continue;

    const hurt = performance.now() < enemy.hurtFlashUntil;
    ctx.fillStyle = hurt ? "#ff8a8a" : "#6f7470";
    ctx.fillRect(sx - size * 0.2, sy, size * 0.4, size);

    ctx.fillStyle = "#2f3d2f";
    ctx.fillRect(sx - size * 0.2, sy + size * 0.42, size * 0.4, size * 0.4);

    ctx.fillStyle = "#232323";
    ctx.fillRect(sx - size * 0.14, sy + size * 0.1, size * 0.28, size * 0.1);
  }
}

function drawCrosshair(ctx, canvas) {
  const x = canvas.width / 2;
  const y = canvas.height / 2;
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x + 10, y);
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x, y + 10);
  ctx.stroke();
}

function drawWeapon(ctx, canvas, weapon) {
  const h = canvas.height;
  const w = canvas.width;
  const yBob = Math.sin(performance.now() * 0.01) * 3;

  ctx.fillStyle = "#2f2f2f";
  ctx.fillRect(w * 0.62, h * 0.76 + yBob, w * 0.28, h * 0.24);
  ctx.fillStyle = "#454545";
  ctx.fillRect(w * 0.69, h * 0.72 + yBob, w * 0.2, h * 0.08);

  if (performance.now() < weapon.muzzleUntil) {
    ctx.fillStyle = "rgba(255, 206, 94, 0.8)";
    ctx.beginPath();
    ctx.arc(w * 0.9, h * 0.76 + yBob, 30, 0, Math.PI * 2);
    ctx.fill();
  }
}

function shadeColor(hex, shade) {
  const c = hex.replace("#", "");
  const r = Math.floor(parseInt(c.substring(0, 2), 16) * shade);
  const g = Math.floor(parseInt(c.substring(2, 4), 16) * shade);
  const b = Math.floor(parseInt(c.substring(4, 6), 16) * shade);
  return `rgb(${r}, ${g}, ${b})`;
}
