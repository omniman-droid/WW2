class SMG {
  constructor() {
    this.name = "M1944 SMG";
    this.damage = 18;
    this.fireRateMs = 92;
    this.magSize = 32;
    this.reserve = 96;
    this.ammo = 32;
    this.reloadMs = 1350;
    this.lastShot = 0;
    this.reloadUntil = 0;
    this.muzzleUntil = 0;
    this.spread = 0.03;
  }

  get reloading() {
    return performance.now() < this.reloadUntil;
  }

  shoot(player, enemies) {
    const now = performance.now();
    if (this.reloading || now - this.lastShot < this.fireRateMs || this.ammo <= 0) return;

    this.lastShot = now;
    this.muzzleUntil = now + 45;
    this.ammo -= 1;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.hypot(dx, dy);
      const angleToEnemy = Math.atan2(dy, dx);
      const diff = normalizeAngle(angleToEnemy - player.angle + (Math.random() - 0.5) * this.spread);

      if (Math.abs(diff) < enemy.hitWidth / Math.max(dist, 0.5)) {
        if (hasLineOfSight(player.x, player.y, enemy.x, enemy.y)) {
          const falloff = Math.max(0.5, 1 - dist * 0.07);
          enemy.takeDamage(Math.round(this.damage * falloff));
          break;
        }
      }
    }
  }

  startReload() {
    if (this.reloading || this.ammo === this.magSize || this.reserve <= 0) return;
    this.reloadUntil = performance.now() + this.reloadMs;
  }

  update() {
    if (this.reloading && performance.now() >= this.reloadUntil) {
      const needed = this.magSize - this.ammo;
      const load = Math.min(needed, this.reserve);
      this.ammo += load;
      this.reserve -= load;
      this.reloadUntil = 0;
    }
  }

  reset() {
    this.reserve = 96;
    this.ammo = 32;
    this.reloadUntil = 0;
    this.lastShot = 0;
    this.muzzleUntil = 0;
  }
}
