const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE = 64;
const FOV = Math.PI / 3;

let player = new Player(100, 100, "A");

document.addEventListener("keydown", e => {
    if (!player.alive) return;

    if (e.key === "a") player.angle -= 0.1;
    if (e.key === "d") player.angle += 0.1;

    let dx = Math.cos(player.angle) * 3;
    let dy = Math.sin(player.angle) * 3;

    if (e.key === "w") player.move(dx, dy);
    if (e.key === "s") player.move(-dx, -dy);

    if (e.key === " ") player.weapon.shoot(player, others);
});

function loop() {
    requestAnimationFrame(loop);

    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawPlayers(player);

    if (conn && conn.open) {
        conn.send(player);
    }

    checkRoundEnd(player);
}

loop();
