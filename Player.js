class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = -Math.PI / 2;
    this.hp = 100;
    this.alive = true;
    this.radius = 0.22;
    this.weapon = new SMG();
    this.hitFlashUntil = 0;
  }

  move(dx, dy) {
    const nx = this.x + dx;
    const ny = this.y + dy;

    if (!isWall(nx, this.y, this.radius)) {
      this.x = nx;
    }

    if (!isWall(this.x, ny, this.radius)) {
      this.y = ny;
    }
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp = Math.max(0, this.hp - amount);
    this.hitFlashUntil = performance.now() + 130;
    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  reset() {
    this.x = SPAWN_POINT.x;
    this.y = SPAWN_POINT.y;
    this.angle = -Math.PI / 2;
    this.hp = 100;
    this.alive = true;
    this.weapon.reset();
  }
}
