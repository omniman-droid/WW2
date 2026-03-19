class Player {
    constructor(x, y, team) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.team = team;

        this.hp = 100;
        this.alive = true;
        this.hasFlag = false;

        this.weapon = new Rifle();
    }

    move(dx, dy) {
        let nx = this.x + dx;
        let ny = this.y + dy;

        let mx = Math.floor(nx / TILE);
        let my = Math.floor(ny / TILE);

        if (MAP[my][mx] !== "#") {
            this.x = nx;
            this.y = ny;
        }
    }

    takeDamage(dmg, isHeadshot) {
        if (isHeadshot) dmg *= 2;

        this.hp -= dmg;

        if (this.hp <= 0) {
            this.alive = false;
        }
    }
}
