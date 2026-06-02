const canvas = document.querySelector("#field");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = 0;
let height = 0;
let points = [];
let pointer = { x: 0, y: 0, active: false };

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const total = Math.max(42, Math.floor((width * height) / 22000));
  points = Array.from({ length: total }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    r: Math.random() * 1.8 + 0.9,
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  for (const point of points) {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < -20) point.x = width + 20;
    if (point.x > width + 20) point.x = -20;
    if (point.y < -20) point.y = height + 20;
    if (point.y > height + 20) point.y = -20;

    if (pointer.active) {
      const dx = pointer.x - point.x;
      const dy = pointer.y - point.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 120) {
        point.x -= dx * 0.0025;
        point.y -= dy * 0.0025;
      }
    }

    ctx.beginPath();
    ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(15, 118, 110, 0.38)";
    ctx.fill();
  }

  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const a = points[i];
      const b = points[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 112) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(23, 23, 23, ${0.08 * (1 - distance / 112)})`;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}

function revealSections() {
  const sections = document.querySelectorAll(".reveal");

  if (reduceMotion) {
    sections.forEach((section) => section.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initDinoGame() {
  const dinoCanvas = document.querySelector("#dino");
  const game = document.querySelector(".dino-game");
  const scoreLabel = document.querySelector("#dino-score");
  const statusLabel = document.querySelector("#dino-status");

  if (!dinoCanvas || !game || !scoreLabel || !statusLabel) return;

  const dinoCtx = dinoCanvas.getContext("2d");
  const state = {
    active: false,
    over: false,
    score: 0,
    speed: 3.2,
    runner: { x: 42, y: 104, size: 24, vy: 0 },
    obstacle: { x: 640, y: 106, w: 16, h: 28 },
  };

  function reset() {
    state.active = true;
    state.over = false;
    state.score = 0;
    state.speed = 3.2;
    state.runner.y = 104;
    state.runner.vy = 0;
    state.obstacle.x = dinoCanvas.width + 80;
    statusLabel.textContent = "running";
  }

  function jump() {
    if (!state.active || state.over) {
      reset();
      return;
    }

    if (state.runner.y >= 104) {
      state.runner.vy = -9.8;
    }
  }

  function drawRunner() {
    const { x, y, size } = state.runner;
    dinoCtx.fillStyle = "#171717";
    dinoCtx.fillRect(x, y, size, size);
    dinoCtx.fillRect(x + size - 4, y - 8, 13, 12);
    dinoCtx.fillRect(x + 5, y + size, 5, 8);
    dinoCtx.fillRect(x + 16, y + size, 5, 8);
    dinoCtx.fillStyle = "#f8f7f2";
    dinoCtx.fillRect(x + size + 5, y - 4, 3, 3);
  }

  function drawObstacle() {
    const { x, y, w, h } = state.obstacle;
    dinoCtx.fillStyle = "#0f766e";
    dinoCtx.fillRect(x, y, w, h);
    dinoCtx.fillRect(x - 6, y + 10, 6, 5);
    dinoCtx.fillRect(x + w, y + 7, 6, 5);
  }

  function collides() {
    const runner = state.runner;
    const obstacle = state.obstacle;
    return (
      runner.x < obstacle.x + obstacle.w &&
      runner.x + runner.size > obstacle.x &&
      runner.y < obstacle.y + obstacle.h &&
      runner.y + runner.size > obstacle.y
    );
  }

  function drawDino() {
    dinoCtx.clearRect(0, 0, dinoCanvas.width, dinoCanvas.height);
    dinoCtx.strokeStyle = "rgba(23, 23, 23, 0.18)";
    dinoCtx.beginPath();
    dinoCtx.moveTo(0, 132);
    dinoCtx.lineTo(dinoCanvas.width, 132);
    dinoCtx.stroke();

    if (state.active && !state.over) {
      state.runner.vy += 0.48;
      state.runner.y = Math.min(104, state.runner.y + state.runner.vy);
      state.obstacle.x -= state.speed;
      state.score += 1;
      state.speed = Math.min(6.8, state.speed + 0.0015);

      if (state.obstacle.x < -30) {
        state.obstacle.x = dinoCanvas.width + 80 + Math.random() * 180;
      }

      if (collides()) {
        state.over = true;
        state.active = false;
        statusLabel.textContent = "404 hit";
      }
    }

    drawRunner();
    drawObstacle();
    scoreLabel.textContent = `score ${String(Math.floor(state.score / 5)).padStart(3, "0")}`;

    if (!state.active && !state.over) {
      dinoCtx.fillStyle = "rgba(23, 23, 23, 0.48)";
      dinoCtx.font = "12px Consolas, monospace";
      dinoCtx.fillText("space / tap", 270, 82);
    }

    requestAnimationFrame(drawDino);
  }

  game.addEventListener("click", jump);
  game.addEventListener("pointerdown", () => game.focus());
  window.addEventListener("keydown", (event) => {
    const bounds = game.getBoundingClientRect();
    const gameIsVisible = bounds.top < window.innerHeight && bounds.bottom > 0;
    if (event.code === "Space" && gameIsVisible) {
      event.preventDefault();
      jump();
    }
  });

  drawDino();
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});
window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

resize();
draw();
revealSections();
initDinoGame();
