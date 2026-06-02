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

  // Chrome Dino Sprite sheet details (1x resolution)
  const spriteSheet = new Image();
  spriteSheet.crossOrigin = "anonymous";
  spriteSheet.src = "https://raw.githubusercontent.com/wayou/t-rex-runner/master/assets/default_100_percent/100-offline-sprite.png";
  let spriteLoaded = false;
  spriteSheet.onload = () => {
    spriteLoaded = true;
  };

  const spriteCoords = {
    TREX_IDLE: { x: 848, y: 2, w: 44, h: 47 },
    TREX_RUN1: { x: 892, y: 2, w: 44, h: 47 },
    TREX_RUN2: { x: 936, y: 2, w: 44, h: 47 },
    TREX_CRASH: { x: 980, y: 2, w: 44, h: 47 },
    TREX_DUCK1: { x: 1112, y: 19, w: 59, h: 30 },
    TREX_DUCK2: { x: 1171, y: 19, w: 59, h: 30 },
    CACTUS_SMALL: { x: 228, y: 2, w: 17, h: 35 },
    CACTUS_LARGE: { x: 332, y: 2, w: 25, h: 50 },
    PTERODACTYL1: { x: 134, y: 2, w: 46, h: 40 },
    PTERODACTYL2: { x: 180, y: 2, w: 46, h: 40 },
    CLOUD: { x: 86, y: 2, w: 46, h: 14 },
    HORIZON: { x: 2, y: 54, w: 600, h: 12 },
    TEXT_SPRITE: { x: 655, y: 2, w: 191, h: 11 },
    RESTART: { x: 2, y: 2, w: 36, h: 32 }
  };

  function drawSprite(key, dx, dy, dw, dh) {
    const s = spriteCoords[key];
    if (!s) return;
    const w = dw || s.w;
    const h = dh || s.h;

    if (spriteLoaded) {
      dinoCtx.drawImage(spriteSheet, s.x, s.y, s.w, s.h, Math.round(dx), Math.round(dy), w, h);
    } else {
      drawFallback(key, dx, dy, w, h);
    }
  }

  function drawFallback(key, dx, dy, w, h) {
    dinoCtx.fillStyle = "#171717";
    if (key.startsWith("TREX")) {
      // High fidelity vector fallback of T-Rex
      dinoCtx.beginPath();
      if (key.includes("DUCK")) {
        // Crouch/ducking shape
        dinoCtx.rect(dx, dy + 10, w, h);
      } else {
        // Standard dino body shape
        dinoCtx.rect(dx + 10, dy, w - 10, h - 15);
        dinoCtx.rect(dx + 25, dy - 8, 15, 12); // head
        dinoCtx.rect(dx, dy + 20, 10, 10); // tail
      }
      dinoCtx.fill();
      // Eye
      dinoCtx.fillStyle = "#f8f7f2";
      dinoCtx.fillRect(dx + 28, dy - 5, 2, 2);
    } else if (key.startsWith("CACTUS")) {
      // High-fidelity fallback green cacti shape
      dinoCtx.fillStyle = "#0f766e";
      dinoCtx.fillRect(dx + w / 3, dy, w / 3, h);
      dinoCtx.fillRect(dx, dy + h / 3, w, h / 4);
    } else if (key.startsWith("PTERODACTYL")) {
      // Bird shape
      dinoCtx.beginPath();
      dinoCtx.moveTo(dx, dy + h / 2);
      dinoCtx.lineTo(dx + w / 2, dy + (key.includes("1") ? 0 : h));
      dinoCtx.lineTo(dx + w, dy + h / 2);
      dinoCtx.stroke();
    } else if (key === "CLOUD") {
      dinoCtx.fillStyle = "rgba(23, 23, 23, 0.18)";
      dinoCtx.fillRect(dx, dy, w, h);
    } else if (key === "HORIZON") {
      dinoCtx.strokeStyle = "rgba(23, 23, 23, 0.18)";
      dinoCtx.beginPath();
      dinoCtx.moveTo(dx, dy);
      dinoCtx.lineTo(dx + w, dy);
      dinoCtx.stroke();
    } else if (key === "TEXT_SPRITE") {
      dinoCtx.fillStyle = "#171717";
      dinoCtx.font = "bold 12px Consolas, monospace";
      dinoCtx.fillText("G A M E  O V E R", dx, dy + 10);
    } else if (key === "RESTART") {
      dinoCtx.fillStyle = "#171717";
      dinoCtx.beginPath();
      dinoCtx.arc(dx + w / 2, dy + h / 2, w / 2 - 2, 0, Math.PI * 1.7);
      dinoCtx.stroke();
    }
  }

  let audioCtx = null;

  function playSound(type) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === "jump") {
        osc.type = "square";
        osc.frequency.setValueAtTime(170, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "hit") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(20, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "score") {
        osc.type = "square";
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);

        setTimeout(() => {
          try {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            const now2 = audioCtx.currentTime;
            osc2.type = "square";
            osc2.frequency.setValueAtTime(880, now2);
            gain2.gain.setValueAtTime(0.05, now2);
            gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.08);
            osc2.start(now2);
            osc2.stop(now2 + 0.08);
          } catch (err) {}
        }, 120);
      }
    } catch (err) {
      console.warn("Web Audio API not supported or blocked", err);
    }
  }

  const keysPressed = {};

  const state = {
    active: false,
    over: false,
    score: 0,
    speed: 3.2,
    runner: {
      x: 42,
      y: 85, // resting Y for standard T-Rex (132 - 47)
      w: 44,
      h: 47,
      vy: 0,
      isJumping: false,
      isDucking: false
    },
    obstacle: { x: 640, y: 106, w: 16, h: 28 },
  };

  function reset() {
    state.active = true;
    state.over = false;
    state.score = 0;
    state.speed = 3.2;
    state.runner.y = 85;
    state.runner.vy = 0;
    state.runner.isJumping = false;
    state.runner.isDucking = false;
    state.obstacle.x = dinoCanvas.width + 80;
    statusLabel.textContent = "running";
  }

  function collides() {
    const r = state.runner;
    const o = state.obstacle;
    
    // Exact bounding box collision
    return (
      r.x < o.x + o.w &&
      r.x + r.w > o.x &&
      r.y < o.y + o.h &&
      r.y + r.h > o.y
    );
  }

  function drawDino() {
    dinoCtx.clearRect(0, 0, dinoCanvas.width, dinoCanvas.height);
    
    // Draw horizon ground line using sprite
    drawSprite("HORIZON", 0, 132, dinoCanvas.width, 12);

    if (state.active && !state.over) {
      // Physics calculations
      const gravity = state.runner.isDucking ? 1.8 : 0.6;
      state.runner.vy += gravity;

      // Variable jump height control (hold to jump higher)
      const isHoldJump = keysPressed["Space"] || keysPressed["ArrowUp"];
      if (!isHoldJump && state.runner.vy < -3) {
        state.runner.vy += 0.8; // Cut jump short
      }

      state.runner.y += state.runner.vy;

      // Landing bounds
      const restY = state.runner.isDucking ? 102 : 85;
      if (state.runner.y >= restY) {
        state.runner.y = restY;
        state.runner.vy = 0;
        state.runner.isJumping = false;
      }

      state.obstacle.x -= state.speed;
      
      const oldPrintedScore = Math.floor(state.score / 5);
      state.score += 1;
      const newPrintedScore = Math.floor(state.score / 5);
      if (newPrintedScore > 0 && newPrintedScore % 100 === 0 && oldPrintedScore < newPrintedScore) {
        playSound("score");
      }

      state.speed = Math.min(6.8, state.speed + 0.0015);

      if (state.obstacle.x < -30) {
        state.obstacle.x = dinoCanvas.width + 80 + Math.random() * 180;
      }

      if (collides()) {
        state.over = true;
        state.active = false;
        statusLabel.textContent = "404 hit";
        playSound("hit");
      }
    }

    // Determine current dino running frame
    let runnerSprite = "TREX_IDLE";
    state.runner.w = 44;
    state.runner.h = 47;

    if (state.over) {
      runnerSprite = "TREX_CRASH";
    } else if (state.runner.isDucking) {
      state.runner.w = 59;
      state.runner.h = 30;
      runnerSprite = Math.floor(state.score / 6) % 2 === 0 ? "TREX_DUCK1" : "TREX_DUCK2";
    } else if (state.runner.isJumping) {
      runnerSprite = "TREX_IDLE";
    } else if (state.active) {
      runnerSprite = Math.floor(state.score / 6) % 2 === 0 ? "TREX_RUN1" : "TREX_RUN2";
    }
    
    // Draw dinosaur using spritesheet/fallback
    drawSprite(runnerSprite, state.runner.x, state.runner.y, state.runner.w, state.runner.h);

    // Draw obstacle using spritesheet/fallback
    drawSprite("CACTUS_SMALL", state.obstacle.x, state.obstacle.y, state.obstacle.w, state.obstacle.h);

    scoreLabel.textContent = `score ${String(Math.floor(state.score / 5)).padStart(3, "0")}`;

    if (!state.active && !state.over) {
      dinoCtx.fillStyle = "rgba(23, 23, 23, 0.48)";
      dinoCtx.font = "12px Consolas, monospace";
      dinoCtx.fillText("space / tap", 270, 82);
    }

    requestAnimationFrame(drawDino);
  }

  // Keyboard Event Listeners for jumps & ducking
  window.addEventListener("keydown", (event) => {
    const bounds = game.getBoundingClientRect();
    const gameIsVisible = bounds.top < window.innerHeight && bounds.bottom > 0;
    if (!gameIsVisible) return;

    if (event.code === "Space" || event.code === "ArrowUp") {
      event.preventDefault();
      keysPressed[event.code] = true;
      if (!state.active || state.over) {
        reset();
      } else if (!state.runner.isJumping) {
        state.runner.vy = -10;
        state.runner.isJumping = true;
        playSound("jump");
      }
    }
    if (event.code === "ArrowDown") {
      event.preventDefault();
      keysPressed[event.code] = true;
      if (state.active && !state.over) {
        state.runner.isDucking = true;
      }
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "ArrowDown") {
      keysPressed[event.code] = false;
      if (event.code === "ArrowDown") {
        state.runner.isDucking = false;
      }
    }
  });

  // Tap & Click support
  game.addEventListener("pointerdown", (event) => {
    game.focus();
    if (!state.active || state.over) {
      reset();
    } else if (!state.runner.isJumping) {
      state.runner.vy = -10;
      state.runner.isJumping = true;
      playSound("jump");
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
