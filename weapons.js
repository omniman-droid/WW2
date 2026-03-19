class Rifle {
    constructor() {
        this.damage = 40;
        this.fireRate = 500; // ms
        this.lastShot = 0;
        this.spread = 0.05;
    }

    shoot(player, others) {
        let now = Date.now();
        if (now - this.lastShot < this.fireRate) return;

        this.lastShot = now;

        for (let id in others) {
            let p = others[id];

            let dx = p.x - player.x;
            let dy = p.y - player.y;
            let dist = Math.sqrt(dx*dx + dy*dy);

            let angle = Math.atan2(dy, dx);

            let spread = (Math.random() - 0.5) * this.spread;

            if (Math.abs(angle - player.angle + spread) < 0.2) {
                let headshot = dist < 150;
                p.takeDamage(this.damage, headshot);
            }
        }
    }
}
