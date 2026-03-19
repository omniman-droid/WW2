const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hudLeft = document.getElementById("hudLeft");
const hudCenter = document.getElementById("hudCenter");
const hudRight = document.getElementById("hudRight");
const centerMessage = document.getElementById("centerMessage");
const joinLink = document.getElementById("joinLink");
const copyJoinLinkBtn = document.getElementById("copyJoinLink");

const FOV = Math.PI / 3;
const MOVE_SPEED = 2.8;
const ROT_SPEED = 2.2;

const keys = new Set();
const mouse = { active: false, lastX: 0 };

const player = new Player(SPAWN_POINT.x, SPAWN_POINT.y);

function startMission() {
  GAME.state = "playing";
  centerMessage.classList.add("hidden");
  startWave(1);
}

function buildJoinUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("join", "1");
  return url.toString();
}

function setupJoinLink() {
  const link = buildJoinUrl();
  joinLink.href = link;
  joinLink.textContent = link;
}

copyJoinLinkBtn?.addEventListener("click", async () => {
  const link = buildJoinUrl();
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
      copyJoinLinkBtn.textContent = "Copied!";
      setTimeout(() => {
        copyJoinLinkBtn.textContent = "Copy link";
      }, 900);
    }
  } catch (err) {
    copyJoinLinkBtn.textContent = "Copy failed";
  }
});

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();
setupJoinLink();
if (new URLSearchParams(window.location.search).get("join") === "1") {
  startMission();
}

window.addEventListener("keydown", (e) => {
  keys.add(e.key.toLowerCase());

  if (e.key === "Enter" && GAME.state === "intro") {
    startMission();
  }

  if (e.key.toLowerCase() === "r") {
    player.weapon.startReload();
  }

  if (e.key === "Enter" && GAME.state === "dead") {
    player.reset();
    GAME.kills = 0;
    startMission();
  }
});

window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

canvas.addEventListener("mousedown", () => {
  mouse.active = true;
  canvas.requestPointerLock?.();
});

window.addEventListener("mouseup", () => {
  mouse.active = false;
});

window.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement === canvas) {
    player.angle += e.movementX * 0.002;
  }
});

function update(dt) {
  if (GAME.state !== "playing") return;

  const move = MOVE_SPEED * dt;
  const rot = ROT_SPEED * dt;

  if (keys.has("arrowleft")) player.angle -= rot;
  if (keys.has("arrowright")) player.angle += rot;

  const forwardX = Math.cos(player.angle);
  const forwardY = Math.sin(player.angle);
  const sideX = Math.cos(player.angle + Math.PI / 2);
  const sideY = Math.sin(player.angle + Math.PI / 2);

  if (keys.has("w")) player.move(forwardX * move, forwardY * move);
  if (keys.has("s")) player.move(-forwardX * move, -forwardY * move);
  if (keys.has("q")) player.move(-sideX * move, -sideY * move);
  if (keys.has("a")) player.angle -= rot;
  if (keys.has("d")) player.angle += rot;

  if (mouse.active || keys.has(" ") || keys.has("e")) {
    player.weapon.shoot(player, GAME.enemies);
  }

  updateGame(player);
}

function updateHud() {
  hudLeft.innerHTML = `HP: <span class="${player.hp < 30 ? "danger" : "hp"}">${player.hp}</span> | Kills ${GAME.kills}`;
  hudRight.textContent = player.weapon.reloading
    ? "Reloading..."
    : `Ammo ${player.weapon.ammo}/${player.weapon.reserve}`;

  const alive = GAME.enemies.filter(e => e.alive).length;
  hudCenter.textContent = `Wave ${GAME.wave} | Axis ${alive}`;

  if (GAME.state === "dead") {
    centerMessage.classList.remove("hidden");
    centerMessage.innerHTML = `<strong>MISSION FAILED</strong><br>${FACTIONS.allied} repelled after wave ${GAME.wave}. Axis units eliminated: ${GAME.kills}.<br><br>Press <strong>ENTER</strong> to redeploy.`;
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.035, (now - last) / 1000);
  last = now;

  update(dt);
  drawWorld(player, canvas, ctx, FOV);
  updateHud();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
