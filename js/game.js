
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

const boyfriend = document.getElementById("boyfriend");
const girlfriend = document.getElementById("girlfriend");

const laneSymbols = ["←", "↓", "↑", "→"];
const laneKeys = [
  "ArrowLeft",
  "ArrowDown",
  "ArrowUp",
  "ArrowRight"
];

let notes = [];
let score = 0;
let combo = 0;
let hits = 0;
let attempts = 0;
let misses = 0;

let startTime = 0;
let animationFrame = 0;
let running = false;
let songDuration = 45000;
let lastPoseTimer = null;
let lastGirlfriendBeat = 0;

const noteSpeed = 240;
const noteInterval = 650;
const hitPosition = 62;
const approachTime = 1300;

function resetGame() {
  notes = [];
  score = 0;
  combo = 0;
  hits = 0;
  attempts = 0;
  misses = 0;

  notesElement.replaceChildren();

  scoreElement.textContent = "0";
  comboElement.textContent = "0";
  accuracyElement.textContent = "100%";
  judgmentElement.textContent = "READY?";

  progressFill.style.width = "0%";

  boyfriend.classList.remove(
    "singing-left",
    "singing-down",
    "singing-up",
    "singing-right"
  );

  clearTimeout(lastPoseTimer);
}

function createChart() {
  // A fixed practice chart so the arrows have predictable timing.
  const pattern = [
    0, 1, 2, 3,
    0, 2, 1, 3,
    0, 1, 0, 2,
    3, 2, 1, 3,
    1, 0, 2, 3,
    0, 1, 2, 1,
    3, 0, 3, 2,
    1, 2, 0, 3,
    0, 1, 2, 3,
    2, 1, 3, 0,
    1, 3, 2, 0,
    3, 2, 1, 0,
    0, 2, 3, 1,
    2, 0, 1, 3,
    1, 2, 0, 3,
    3, 1, 2, 0
  ];

  notes = pattern.map((lane, i) => ({
    lane,
    time: approachTime + 1000 + i * noteInterval,
    judged: false,
    element: null
  }));
}

function startGame() {
  cancelAnimationFrame(animationFrame);
  resetGame();

  menu.classList.add("hidden");
  game.classList.remove("hidden");

  createChart();

  for (const note of notes) {
    const element = document.createElement("div");
    element.className = "note";
    element.dataset.lane = note.lane;
    element.textContent = laneSymbols[note.lane];
    element.style.left = `calc(${note.lane * 25}% + 2px)`;

    notesElement.appendChild(element);
    note.element = element;
  }

  running = true;
  startTime = performance.now();

  animationFrame = requestAnimationFrame(updateGame);
}

function updateGame(now) {
  if (!running) return;

  const elapsed = now - startTime;

  for (const note of notes) {
    if (note.judged) continue;

    const timeUntilHit = note.time - elapsed;
    const y =
      hitPosition +
      (noteSpeed * (approachTime - timeUntilHit)) / 1000;

    note.element.style.transform = `translateY(${y}px)`;

    // Count a miss if the player lets the note pass.
    if (timeUntilHit < -180) {
      note.judged = true;
      note.element.remove();

      attempts++;
      misses++;
      combo = 0;

      judgmentElement.textContent = "MISS!";
      updateStats();
    }
  }

  progressFill.style.width =
    `${Math.min(100, elapsed / songDuration * 100)}%`;

  // Girlfriend's gentle idle animation is in CSS.
  // Give her an occasional extra bounce during gameplay.
  if (elapsed - lastGirlfriendBeat > 900) {
    girlfriend.style.filter = "brightness(1.15)";
    setTimeout(() => {
      girlfriend.style.filter = "";
    }, 130);

    lastGirlfriendBeat = elapsed;
  }

  if (elapsed >= songDuration) {
    endGame();
    return;
  }

  animationFrame = requestAnimationFrame(updateGame);
}

function sing(lane) {
  const poses = [
    "singing-left",
    "singing-down",
    "singing-up",
    "singing-right"
  ];

  boyfriend.classList.remove(...poses);

  // Force a fresh pose even when the same arrow is hit twice.
  void boyfriend.offsetWidth;

  boyfriend.classList.add(poses[lane]);

  clearTimeout(lastPoseTimer);

  lastPoseTimer = setTimeout(() => {
    boyfriend.classList.remove(...poses);
  }, 190);
}

function pressLane(lane) {
  if (!running) return;

  sing(lane);

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

  // Pressing an empty lane counts as a miss.
  if (!closest || closestDistance > 180) {
    attempts++;
    misses++;
    combo = 0;

    judgmentElement.textContent = "MISS!";
    updateStats();
    return;
  }

  closest.judged = true;
  closest.element.remove();

  attempts++;
  hits++;
  combo++;

  if (closestDistance <= 55) {
    score += 350;
    judgmentElement.textContent = "SICK!";
  } else if (closestDistance <= 110) {
    score += 200;
    judgmentElement.textContent = "GOOD!";
  } else {
    score += 100;
    judgmentElement.textContent = "BAD";
  }

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

  for (const note of notes) {
    if (!note.judged) {
      note.element.remove();
      note.judged = true;
    }
  }
}

function returnToMenu() {
  running = false;
  cancelAnimationFrame(animationFrame);
  clearTimeout(lastPoseTimer);

  menu.classList.remove("hidden");
  game.classList.add("hidden");

  boyfriend.classList.remove(
    "singing-left",
    "singing-down",
    "singing-up",
    "singing-right"
  );
}

document.addEventListener("keydown", (event) => {
  const lane = laneKeys.indexOf(event.key);

  if (lane !== -1 && running) {
    event.preventDefault();

    if (!event.repeat) {
      pressLane(lane);
    }
  }
});

playButton.addEventListener("click", startGame);
backButton.addEventListener("click", returnToMenu);
