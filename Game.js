const GAME = {
  wave: 1,
  kills: 0,
  enemies: [],
  state: "intro",
  spawnCooldownUntil: 0
};

const FACTIONS = {
  allied: "Allied Rangers",
  axis: "Axis Garrison"
};

function tileAt(tx, ty) {
  const row = MAP[Math.floor(ty)];
  if (!row) return "#";
  return row[Math.floor(tx)] || "#";
}

function isWall(x, y, radius = 0) {
  const points = [
    [x - radius, y - radius],
    [x + radius, y - radius],
    [x - radius, y + radius],
    [x + radius, y + radius]
  ];

  return points.some(([px, py]) => {
    const cell = tileAt(px, py);
    return cell !== ".";
  });
}

function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

function hasLineOfSight(x1, y1, x2, y2) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 16);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    if (tileAt(x, y) !== ".") return false;
  }
  return true;
}

class Guard {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 0.012 + Math.random() * 0.008;
    this.hp = 70;
    this.alive = true;
    this.hitWidth = 0.2;
    this.attackRange = 5.2;
    this.lastAttack = 0;
    this.hurtFlashUntil = 0;
    this.faction = "axis";
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.hurtFlashUntil = performance.now() + 80;
    if (this.hp <= 0) {
      this.alive = false;
      GAME.kills += 1;
    }
  }

  update(player) {
    if (!this.alive || !player.alive) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.attackRange && hasLineOfSight(this.x, this.y, player.x, player.y)) {
      const ux = dx / Math.max(dist, 0.001);
      const uy = dy / Math.max(dist, 0.001);
      const nx = this.x + ux * this.speed;
      const ny = this.y + uy * this.speed;
      if (!isWall(nx, ny, 0.18)) {
        this.x = nx;
        this.y = ny;
      }

      if (dist < 1.35 && performance.now() - this.lastAttack > 650) {
        this.lastAttack = performance.now();
        player.takeDamage(9 + Math.floor(Math.random() * 4));
      }
    }
  }
}

function randomOpenCell() {
  for (let i = 0; i < 300; i++) {
    const x = 1 + Math.random() * (MAP[0].length - 2);
    const y = 1 + Math.random() * (MAP.length - 2);
    if (tileAt(x, y) === "." && Math.hypot(x - SPAWN_POINT.x, y - SPAWN_POINT.y) > 5) {
      return { x, y };
    }
  }
  return { x: 3.5, y: 3.5 };
}

function startWave(wave) {
  GAME.wave = wave;
  GAME.enemies = [];
  const count = 5 + wave * 2;
  for (let i = 0; i < count; i++) {
    const pos = randomOpenCell();
    GAME.enemies.push(new Guard(pos.x, pos.y));
  }
}

function updateGame(player) {
  player.weapon.update();
  GAME.enemies.forEach(enemy => enemy.update(player));

  const aliveCount = GAME.enemies.filter(e => e.alive).length;
  if (aliveCount === 0 && GAME.state === "playing") {
    GAME.state = "intermission";
    GAME.spawnCooldownUntil = performance.now() + 1300;
  }

  if (GAME.state === "intermission" && performance.now() >= GAME.spawnCooldownUntil) {
    startWave(GAME.wave + 1);
    GAME.state = "playing";
  }

  if (!player.alive && GAME.state !== "dead") {
    GAME.state = "dead";
  }
}
