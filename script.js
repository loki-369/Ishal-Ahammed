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
  spriteSheet.src = "data:image/png;base64,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";
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
    CACTUS_SMALL_1: { x: 228, y: 2, w: 17, h: 35 },
    CACTUS_SMALL_2: { x: 245, y: 2, w: 34, h: 35 },
    CACTUS_SMALL_3: { x: 279, y: 2, w: 51, h: 35 },
    CACTUS_LARGE_1: { x: 332, y: 2, w: 25, h: 50 },
    CACTUS_LARGE_2: { x: 357, y: 2, w: 50, h: 50 },
    CACTUS_LARGE_3: { x: 407, y: 2, w: 75, h: 50 },
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
      // High-fidelity fallback green cacti shape (draw 1, 2, or 3 segments depending on key)
      dinoCtx.fillStyle = "#0f766e";
      const isLarge = key.includes("LARGE");
      const segments = key.endsWith("3") ? 3 : key.endsWith("2") ? 2 : 1;
      const singleW = isLarge ? 25 : 17;
      
      for (let i = 0; i < segments; i++) {
        const offset = dx + i * singleW;
        dinoCtx.fillRect(offset + singleW / 3, dy, singleW / 3, h);
        dinoCtx.fillRect(offset, dy + h / 3, singleW, h / 4);
      }
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

  let highScore = parseInt(localStorage.getItem("dino-high-score") || "0", 10);
  const keysPressed = {};
  let horizonX1 = 0;
  let horizonX2 = 600;
  let clouds = [];
  let obstacles = [];
  let scoreFlashTimer = 0;

  const state = {
    active: false,
    over: false,
    score: 0,
    speed: 6.0, // Match original Chrome T-Rex starting speed
    runner: {
      x: 42,
      y: 85, // resting Y for standard T-Rex (132 - 47)
      w: 44,
      h: 47,
      vy: 0,
      isJumping: false,
      isDucking: false
    }
  };

  function reset() {
    state.active = true;
    state.over = false;
    state.score = 0;
    state.speed = 6.0;
    state.runner.y = 85;
    state.runner.vy = 0;
    state.runner.isJumping = false;
    state.runner.isDucking = false;
    
    horizonX1 = 0;
    horizonX2 = 600;
    clouds = [];
    obstacles = [];
    scoreFlashTimer = 0;
    game.classList.remove("night");
    statusLabel.textContent = "running";
  }

  function checkCollisions() {
    const r = state.runner;
    for (const o of obstacles) {
      // Slightly padded hitboxes for T-Rex for fairer retro gameplay feel
      const paddingX = 6;
      const paddingY = 4;
      if (
        r.x + paddingX < o.x + o.w &&
        r.x + r.w - paddingX > o.x &&
        r.y + paddingY < o.y + o.h &&
        r.y + r.h - paddingY > o.y
      ) {
        return true;
      }
    }
    return false;
  }

  function updateClouds() {
    for (const c of clouds) {
      c.x -= 0.5; // Slowly scroll clouds
    }
    if (clouds.length < 3 && Math.random() < 0.005) {
      clouds.push({
        x: dinoCanvas.width + 50,
        y: 20 + Math.random() * 40
      });
    }
    clouds = clouds.filter(c => c.x > -50);
  }

  function updateObstacles() {
    for (const o of obstacles) {
      o.x -= state.speed;
      
      // Animate flying bird wings
      if (o.type === "bird") {
        o.animTimer++;
        if (o.animTimer >= 15) {
          o.animTimer = 0;
          o.sprite = o.sprite === "PTERODACTYL1" ? "PTERODACTYL2" : "PTERODACTYL1";
        }
      }
    }

    let canSpawn = true;
    if (obstacles.length > 0) {
      const lastO = obstacles[obstacles.length - 1];
      const minGap = 200 + state.speed * 18 + Math.random() * 150;
      if (dinoCanvas.width - lastO.x < minGap) {
        canSpawn = false;
      }
    }

    if (canSpawn) {
      const printedScore = Math.floor(state.score / 5);
      let type = "cactus";
      
      // Birds spawn after 400 points
      if (printedScore >= 400 && Math.random() < 0.22) {
        type = "bird";
      }

      if (type === "cactus") {
        const isLarge = Math.random() < 0.45;
        const count = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 cacti adjacent
        let spriteKey, w, h, y;

        if (isLarge) {
          spriteKey = `CACTUS_LARGE_${count}`;
          w = count === 3 ? 75 : count === 2 ? 50 : 25;
          h = 50;
          y = 132 - 50;
        } else {
          spriteKey = `CACTUS_SMALL_${count}`;
          w = count === 3 ? 51 : count === 2 ? 34 : 17;
          h = 35;
          y = 132 - 35;
        }

        obstacles.push({
          type: "cactus",
          x: dinoCanvas.width + 50,
          y: y,
          w: w,
          h: h,
          sprite: spriteKey
        });
      } else if (type === "bird") {
        // Birds can fly at Low (requires jump), Mid (crouch or jump), or High heights
        const heights = [132 - 40, 132 - 55, 132 - 72];
        const y = heights[Math.floor(Math.random() * heights.length)];
        obstacles.push({
          type: "bird",
          x: dinoCanvas.width + 50,
          y: y,
          w: 46,
          h: 40,
          sprite: "PTERODACTYL1",
          animTimer: 0
        });
      }
    }
    obstacles = obstacles.filter(o => o.x > -80);
  }

  function drawDino() {
    dinoCtx.clearRect(0, 0, dinoCanvas.width, dinoCanvas.height);
    
    // Draw horizon ground scrolling
    if (state.active && !state.over) {
      horizonX1 -= state.speed;
      horizonX2 -= state.speed;
      if (horizonX1 <= -600) horizonX1 = horizonX2 + 600;
      if (horizonX2 <= -600) horizonX2 = horizonX1 + 600;
    }
    drawSprite("HORIZON", horizonX1, 132, 600, 12);
    drawSprite("HORIZON", horizonX2, 132, 600, 12);

    const printedScore = Math.floor(state.score / 5);

    if (state.active && !state.over) {
      // T-Rex physics
      const gravity = state.runner.isDucking ? 1.8 : 0.6;
      state.runner.vy += gravity;

      const isHoldJump = keysPressed["Space"] || keysPressed["ArrowUp"];
      if (!isHoldJump && state.runner.vy < -3) {
        state.runner.vy += 0.8; // Cut jump short
      }

      state.runner.y += state.runner.vy;

      const restY = state.runner.isDucking ? 102 : 85;
      if (state.runner.y >= restY) {
        state.runner.y = restY;
        state.runner.vy = 0;
        state.runner.isJumping = false;
      }

      // Update background and obstacles
      updateClouds();
      updateObstacles();

      const oldPrintedScore = Math.floor(state.score / 5);
      state.score += 1;
      const newPrintedScore = Math.floor(state.score / 5);
      if (newPrintedScore > 0 && newPrintedScore % 100 === 0 && oldPrintedScore < newPrintedScore) {
        playSound("score");
        scoreFlashTimer = 120; // Flash score for 2 seconds
      }

      // Day/Night Cycle inversion toggling every 700 printed points
      const isNight = Math.floor(newPrintedScore / 700) % 2 === 1;
      if (isNight) {
        game.classList.add("night");
      } else {
        game.classList.remove("night");
      }

      // Gradually increase speed
      state.speed = Math.min(13.0, state.speed + 0.0018);

      if (checkCollisions()) {
        state.over = true;
        state.active = false;
        
        // Save high score
        if (newPrintedScore > highScore) {
          highScore = newPrintedScore;
          localStorage.setItem("dino-high-score", highScore);
        }

        statusLabel.textContent = "404 hit";
        playSound("hit");
      }
    }

    // Draw Clouds
    for (const c of clouds) {
      drawSprite("CLOUD", c.x, c.y, 46, 14);
    }

    // Draw Obstacles
    for (const o of obstacles) {
      drawSprite(o.sprite, o.x, o.y, o.w, o.h);
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

    // Score display with 100-point flash logic
    const formattedScore = String(printedScore).padStart(5, "0");
    const formattedHighScore = String(highScore).padStart(5, "0");

    if (scoreFlashTimer > 0) {
      scoreFlashTimer--;
      const showScore = Math.floor(scoreFlashTimer / 15) % 2 === 0;
      if (showScore) {
        scoreLabel.textContent = `HI ${formattedHighScore} ${formattedScore}`;
      } else {
        scoreLabel.textContent = `HI ${formattedHighScore}      `; // blank out current score
      }
    } else {
      scoreLabel.textContent = `HI ${formattedHighScore} ${formattedScore}`;
    }

    if (!state.active && !state.over) {
      dinoCtx.fillStyle = "rgba(23, 23, 23, 0.48)";
      dinoCtx.font = "12px Consolas, monospace";
      dinoCtx.fillText("space / tap", 270, 82);
    }

    if (state.over) {
      // Draw GAME OVER and Replay sprites
      drawSprite("TEXT_SPRITE", 224, 50, 191, 11);
      drawSprite("RESTART", 302, 75, 36, 32);
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
