
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const playButton = document.getElementById("play");
const backButton = document.getElementById("back");

const notesElement = document.getElementById("notes");
const scoreElement = document.getElementById("score");
const comboElement = document.getElementById("combo");
const accuracyElement = document.getElementById("accuracy");
const judgmentElement = document.getElementById("judgment");
const progressFill = document.getElementById("progressFill");

const laneSymbols = ["←", "↓", "↑", "→"];
const laneKeys = ["ArrowLeft", "ArrowDown", "ArrowUp", "ArrowRight"];

let notes = [];
let score = 0;
let combo = 0;
let hits = 0;
let attempts = 0;
let startTime = 0;
let animationFrame = 0;
let running = false;

const noteSpeed = 240;
const noteInterval = 650;
const hitPosition = 62;
const songLength = 45000;

function resetGame() {
  notes = [];
  score = 0;
  combo = 0;
  hits = 0;
  attempts = 0;
  notesElement.replaceChildren();

  scoreElement.textContent = "0";
  comboElement.textContent = "0";
  accuracyElement.textContent = "100%";
  judgmentElement.textContent = "READY?";

  progressFill.style.width = "0%";
}

function startGame() {
  cancelAnimationFrame(animationFrame);
  resetGame();

  menu.classList.add("hidden");
  game.classList.remove("hidden");

  running = true;
  startTime = performance.now();

  // A short original practice chart.
  for (let i = 0; i < 64; i++) {
    const lane = Math.floor(Math.random() * 4);

    notes.push({
      lane,
      time: 1300 + i * noteInterval,
      judged: false,
      element: null
    });
  }

  for (const note of notes) {
    const element = document.createElement("div");
    element.className = "note";
    element.dataset.lane = note.lane;
    element.textContent = laneSymbols[note.lane];
    element.style.left = `calc(${note.lane * 25}% + 2px)`;
    notesElement.appendChild(element);
    note.element = element;
  }

  animationFrame = requestAnimationFrame(updateGame);
}

function updateGame(now) {
  if (!running) return;

  const elapsed = now - startTime;
  const laneHeight = notesElement.clientHeight;

  for (const note of notes) {
    if (note.judged) continue;

    const timeUntilHit = note.time - elapsed;
    const y = hitPosition + (noteSpeed * (1300 - timeUntilHit)) / 1000;

    note.element.style.transform = `translateY(${y}px)`;

    if (timeUntilHit < -180) {
      note.judged = true;
      note.element.remove();
      attempts++;
      combo = 0;
      judgmentElement.textContent = "MISS!";
      updateStats();
    }
  }

  progressFill.style.width =
    `${Math.min(100, elapsed / songLength * 100)}%`;

  if (elapsed >= songLength) {
    endGame();
    return;
  }

  animationFrame = requestAnimationFrame(updateGame);
}

function pressLane(lane) {
  if (!running) return;

  const elapsed = performance.now() - startTime;

  let closest = null;
  let closestDistance = Infinity;

  for (const note of notes) {
    if (note.judged || note.lane !== lane) continue;

    const distance = Math.abs(note.time - elapsed);

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = note;
    }
  }

  attempts++;

  if (!closest || closestDistance > 180) {
    combo = 0;
    judgmentElement.textContent = "MISS!";
    updateStats();
    return;
  }

  closest.judged = true;
  closest.element.remove();

  if (closestDistance <= 65) {
    score += 350;
    judgmentElement.textContent = "SICK!";
  } else if (closestDistance <= 115) {
    score += 200;
    judgmentElement.textContent = "GOOD!";
  } else {
    score += 100;
    judgmentElement.textContent = "BAD";
  }

  combo++;
  hits++;
  updateStats();
}

function updateStats() {
  scoreElement.textContent = score.toLocaleString();
  comboElement.textContent = combo;
  accuracyElement.textContent =
    `${Math.round(hits / Math.max(1, attempts) * 100)}%`;
}

function endGame() {
  running = false;
  cancelAnimationFrame(animationFrame);
  judgmentElement.textContent = `SONG COMPLETE! SCORE: ${score}`;
  progressFill.style.width = "100%";
}

function returnToMenu() {
  running = false;
  cancelAnimationFrame(animationFrame);

  menu.classList.remove("hidden");
  game.classList.add("hidden");
}

document.addEventListener("keydown", (event) => {
  const lane = laneKeys.indexOf(event.key);

  if (lane !== -1 && running) {
    event.preventDefault();
    if (!event.repeat) pressLane(lane);
  }
});

playButton.addEventListener("click", startGame);
backButton.addEventListener("click", returnToMenu);
