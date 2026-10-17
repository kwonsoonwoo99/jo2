const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const messageElement = document.getElementById("message");
const announcementElement = document.getElementById("announcement");

const width = canvas.width;
const height = canvas.height;
const player = { x: 76, y: 76, radius: 15, speed: 230 };
const startingCoins = [
  { x: 185, y: 94 }, { x: 324, y: 80 }, { x: 493, y: 105 },
  { x: 690, y: 82 }, { x: 111, y: 216 }, { x: 268, y: 225 },
  { x: 430, y: 205 }, { x: 625, y: 234 }, { x: 190, y: 389 },
  { x: 365, y: 343 }, { x: 548, y: 408 }, { x: 714, y: 365 }
];
const keys = new Set();
const keyDirections = {
  arrowup: "up", w: "up",
  arrowdown: "down", s: "down",
  arrowleft: "left", a: "left",
  arrowright: "right", d: "right"
};
const buttons = document.querySelectorAll("[data-direction]");
let coins = [];
let score = 0;
let finished = false;
let previousTime = 0;

function resetGame() {
  player.x = 76;
  player.y = 76;
  coins = startingCoins.map((coin) => ({ ...coin, collected: false }));
  score = 0;
  finished = false;
  keys.clear();
  scoreElement.innerHTML = `${score} <span>/ ${coins.length}</span>`;
  messageElement.textContent = "초원을 달려 코인을 모두 모아 보세요.";
  announcementElement.textContent = "게임을 다시 시작했습니다.";
  draw();
}

function isPressed(direction) {
  for (const key of keys) {
    if (keyDirections[key] === direction) return true;
  }
  return false;
}

function update(deltaTime) {
  if (finished) return;

  let horizontal = Number(isPressed("right")) - Number(isPressed("left"));
  let vertical = Number(isPressed("down")) - Number(isPressed("up"));
  const magnitude = Math.hypot(horizontal, vertical) || 1;
  horizontal /= magnitude;
  vertical /= magnitude;

  player.x += horizontal * player.speed * deltaTime;
  player.y += vertical * player.speed * deltaTime;
  player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

  for (const coin of coins) {
    if (coin.collected) continue;
    if (Math.hypot(player.x - coin.x, player.y - coin.y) < player.radius + 13) {
      coin.collected = true;
      score += 1;
      scoreElement.innerHTML = `${score} <span>/ ${coins.length}</span>`;
      messageElement.textContent = "좋아요! 다른 코인도 찾아보세요.";
      announcementElement.textContent = `코인을 모았습니다. ${score}개 수집.`;
    }
  }

  if (score === coins.length) {
    finished = true;
    messageElement.textContent = "모든 코인을 찾았어요! 멋진 수확이에요.";
    announcementElement.textContent = "축하합니다. 코인 12개를 모두 모았습니다.";
  }
}

function drawBackground() {
  context.fillStyle = "#e8f0d8";
  context.fillRect(0, 0, width, height);

  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 14; column += 1) {
      const x = 24 + column * 58 + (row % 2) * 17;
      const y = 22 + row * 58;
      context.fillStyle = (row + column) % 2 === 0 ? "#dce9cd" : "#e1ebd2";
      context.beginPath();
      context.ellipse(x, y, 2.5, 1.5, -0.5, 0, Math.PI * 2);
      context.fill();
    }
  }

  const patches = [
    [65, 164, 27], [396, 120, 35], [739, 162, 29],
    [70, 328, 36], [316, 445, 28], [463, 284, 28], [748, 465, 35]
  ];
  for (const [x, y, radius] of patches) {
    context.fillStyle = "#d2e3c0";
    context.beginPath();
    context.ellipse(x, y, radius, radius * 0.6, -0.35, 0, Math.PI * 2);
    context.fill();
  }

  context.strokeStyle = "#b8c9a9";
  context.lineWidth = 3;
  context.strokeRect(1.5, 1.5, width - 3, height - 3);
}

function drawCoin(coin, time) {
  if (coin.collected) return;
  const pulse = Math.sin(time / 230 + coin.x) * 1.5;
  const radius = 11 + pulse;

  context.fillStyle = "#a77725";
  context.beginPath();
  context.ellipse(coin.x, coin.y + 13, 12, 4, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#e6a92f";
  context.beginPath();
  context.arc(coin.x, coin.y, radius, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#bd7e20";
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = "#ffdf77";
  context.beginPath();
  context.arc(coin.x - 3, coin.y - 4, 3, 0, Math.PI * 2);
  context.fill();
}

function drawPlayer() {
  context.fillStyle = "#47625335";
  context.beginPath();
  context.ellipse(player.x, player.y + 14, 15, 6, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#397d67";
  context.beginPath();
  context.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#285e4e";
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = "#fffdf3";
  context.beginPath();
  context.arc(player.x - 5, player.y - 2, 2.4, 0, Math.PI * 2);
  context.arc(player.x + 4, player.y - 2, 2.4, 0, Math.PI * 2);
  context.fill();
}

function draw(time = 0) {
  drawBackground();
  for (const coin of coins) drawCoin(coin, time);
  drawPlayer();

  if (finished) {
    context.fillStyle = "#26352d99";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#fffef8";
    context.textAlign = "center";
    context.font = "700 34px 'Malgun Gothic', sans-serif";
    context.fillText("모두 모았어요!", width / 2, height / 2);
    context.font = "18px 'Malgun Gothic', sans-serif";
    context.fillText("다시 시작을 눌러 한 판 더", width / 2, height / 2 + 38);
  }
}

function frame(time) {
  const deltaTime = Math.min((time - previousTime) / 1000 || 0, 0.04);
  previousTime = time;
  update(deltaTime);
  draw(time);
  requestAnimationFrame(frame);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key in keyDirections) {
    event.preventDefault();
    keys.add(key);
  }
});

document.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

window.addEventListener("blur", () => keys.clear());

for (const button of buttons) {
  const directionKey = button.dataset.direction;
  const movementKey = { up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright" }[directionKey];
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    keys.add(movementKey);
    button.setPointerCapture(event.pointerId);
  });
  const release = () => keys.delete(movementKey);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}

document.getElementById("restart").addEventListener("click", resetGame);
resetGame();
requestAnimationFrame(frame);