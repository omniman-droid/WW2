function drawSprite(img, x, y, size) {
    ctx.drawImage(img, x - size/2, y - size/2, size, size);
}

function drawPlayers(player) {
    for (let id in others) {
        let p = others[id];
        if (!p.alive) continue;

        let dx = p.x - player.x;
        let dy = p.y - player.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        let angle = Math.atan2(dy, dx) - player.angle;

        let size = 5000 / dist;
        let x = (angle / FOV) * canvas.width + canvas.width/2;

        ctx.fillStyle = p.team === "A" ? "blue" : "red";
        ctx.fillRect(x, canvas.height/2 - size/2, size/2, size);
    }
}
