"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const loadingScreen = document.getElementById("loadingScreen");

const game = {
  width: 1280,
  height: 720,
  time: 0,
  lastTime: 0,
  running: true
};

const stage = {
  floorY: 570,
  lightPhase: 0
};

const characters = [
  {
    name: "OPPONENT",
    x: 350,
    y: 425,
    color: "#a855f7",
    accent: "#ffffff",
    phase: 0,
    side: "left"
  },
  {
    name: "BOYFRIEND",
    x: 900,
    y: 425,
    color: "#1688ff",
    accent: "#ff304f",
    phase: 1.5,
    side: "right"
  }
];

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);

  ctx.setTransform(
    canvas.width / game.width,
    0,
    0,
    canvas.height / game.height,
    0,
    0
  );
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(
    0, 0, 0, game.height
  );

  gradient.addColorStop(0, "#252044");
  gradient.addColorStop(0.65, "#111827");
  gradient.addColorStop(1, "#05070c");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, game.width, game.height);

  // Background buildings.

  for (let i = 0; i < 12; i++) {
    const x = i * 120;
    const height = 100 + (i * 37 % 180);

    ctx.fillStyle = i % 2 === 0
      ? "#17182a"
      : "#202037";

    ctx.fillRect(
      x,
      stage.floorY - height,
      95,
      height
    );

    // Building windows.

    ctx.fillStyle = "#45415e";

    for (let wy = stage.floorY - height + 18;
         wy < stage.floorY - 15;
         wy += 28) {
      for (let wx = x + 12; wx < x + 80; wx += 25) {
        ctx.fillRect(wx, wy, 8, 12);
      }
    }
  }

  // Stage floor.

  ctx.fillStyle = "#25202d";
  ctx.fillRect(
    0,
    stage.floorY,
    game.width,
    game.height - stage.floorY
  );

  ctx.fillStyle = "#ec008c";
  ctx.fillRect(
    0,
    stage.floorY,
    game.width,
    5
  );

  // Floor perspective lines.

  ctx.strokeStyle = "#3b2946";
  ctx.lineWidth = 2;

  for (let x = -500; x <= 1800; x += 120) {
    ctx.beginPath();
    ctx.moveTo(game.width / 2, stage.floorY);
    ctx.lineTo(x, game.height);
    ctx.stroke();
  }

  for (let y = stage.floorY + 40; y < game.height; y += 35) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(game.width, y);
    ctx.stroke();
  }
}

function drawSpotlight(x, color, radius) {
  const gradient = ctx.createRadialGradient(
    x, 300, 10,
    x, 300, radius
  );

  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(
    x - radius,
    80,
    radius * 2,
    500
  );
}

function drawCharacter(character) {
  const bounce = Math.sin(
    game.time * 5 + character.phase
  ) * 8;

  const x = character.x;
  const y = character.y + bounce;

  ctx.save();
  ctx.translate(x, y);

  // Shadow.

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(
    0, 145 - bounce, 65, 16, 0, 0, Math.PI * 2
  );
  ctx.fill();

  // Legs.

  ctx.fillStyle = "#171717";
  ctx.fillRect(-32, 65, 26, 70);
  ctx.fillRect(8, 65, 26, 70);

  // Shoes.

  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(-38, 125, 35, 15);
  ctx.fillRect(5, 125, 35, 15);

  // Body.

  ctx.fillStyle = character.color;
  ctx.fillRect(-42, -5, 84, 85);

  // Shirt details.

  ctx.fillStyle = character.accent;
  ctx.fillRect(-35, 20, 70, 7);

  // Arms.

  ctx.fillStyle = character.color;
  ctx.fillRect(-62, 5, 20, 65);
  ctx.fillRect(42, 5, 20, 65);

  // Head.

  ctx.fillStyle = "#f1c6a5";
  ctx.fillRect(-38, -65, 76, 65);

  // Hair.

  ctx.fillStyle = character.side === "right"
    ? "#2474e8"
    : "#252525";

  ctx.fillRect(-42, -75, 84, 23);
  ctx.fillRect(-42, -60, 15, 28);

  // Eyes.

  ctx.fillStyle = "#111111";
  ctx.fillRect(-22, -43, 10, 8);
  ctx.fillRect(12, -43, 10, 8);

  // Mouth.

  ctx.fillStyle = "#7d3030";
  ctx.fillRect(-9, -20, 18, 5);

  // Character label.

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 17px Arial";
  ctx.textAlign = "center";
  ctx.fillText(character.name, 0, 170);

  ctx.restore();
}

function drawStage() {
  drawBackground();

  drawSpotlight(
    350,
    "rgba(168,85,247,0.18)",
    300
  );

  drawSpotlight(
    900,
    "rgba(0,217,255,0.15)",
    300
  );

  for (const character of characters) {
    drawCharacter(character);
  }

  // Top-left stage information.

  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px Arial";

  ctx.fillText("FRIDAY NIGHT FUNKIN'", 25, 38);

  ctx.fillStyle = "#00d9ff";
  ctx.font = "15px Arial";

  ctx.fillText("STAGE PREVIEW", 27, 62);
}

function frame(timestamp) {
  if (!game.running) return;

  if (game.lastTime === 0) {
    game.lastTime = timestamp;
  }

  const delta = Math.min(
    (timestamp - game.lastTime) / 1000,
    0.05
  );

  game.lastTime = timestamp;
  game.time += delta;

  ctx.clearRect(0, 0, game.width, game.height);

  drawStage();

  requestAnimationFrame(frame);
}

function startGame() {
  resizeCanvas();

  loadingScreen.style.display = "none";

  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeCanvas);

startGame();
