function checkRoundEnd(player) {
    let enemiesAlive = false;

    for (let id in others) {
        if (others[id].team !== player.team && others[id].alive) {
            enemiesAlive = true;
        }
    }

    if (!enemiesAlive) {
        alert("ROUND WIN");
        resetRound(player);
    }
}

function resetRound(player) {
    player.hp = 100;
    player.alive = true;
    player.hasFlag = false;
}
