// ------------ ON LOAD ------------ //
document.addEventListener("DOMContentLoaded", () => {
  const topNav = document.getElementById("topNav");
  const hero = document.getElementById("hero");
  const navMenuBtn = document.getElementById("navMenuBtn");
  const navLinks = document.getElementById("navLinks");
  const yearSpan = document.getElementById("year");

  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // show mini nav when scrolled past hero
  function onScroll() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom <= 40) {
      topNav.classList.add("visible");
    } else {
      topNav.classList.remove("visible");
    }
  }
  window.addEventListener("scroll", onScroll);
  onScroll();

  // mobile nav
  if (navMenuBtn && navLinks) {
    navMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => navLinks.classList.remove("open"))
    );
  }

  // fade-in on scroll
  const fadeSections = document.querySelectorAll(".scroll-fade");
  const fadeObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          fadeObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.25 }
  );
  fadeSections.forEach((sec) => fadeObs.observe(sec));

  initStats();
  initVerificationForm();
  initFeedbackForm();
  initSkyStack();
  initNeonRunner();
  initReflexTap();
});

// ------------ STATS ------------ //
function initStats() {
  const statEls = document.querySelectorAll(".stat-value[data-target]");
  if (!statEls.length) return;

  const obs = new IntersectionObserver(
    (entries, o) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10) || 0;
        let current = 0;
        const step = Math.max(1, Math.round(target / 60));

        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          el.textContent = current.toString();
        }, 20);

        o.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  statEls.forEach((el) => obs.observe(el));
}

// ------------ VERIFICATION FORM ------------ //
function initVerificationForm() {
  const form = document.getElementById("verifyForm");
  const result = document.getElementById("verifyResult");
  if (!form || !result) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("vName").value.trim();
    const tg = document.getElementById("vTelegram").value.trim();
    const upi = document.getElementById("vUpi").value.trim();
    const type = document.getElementById("vType").value;
    const notes = document.getElementById("vNotes").value.trim();

    if (!name || !tg || !upi) {
      result.textContent = "Please fill all required fields.";
      return;
    }

    const typeLabel =
      type === "advanced" ? "Advanced Verified (VIP)" : "Verified";

    const msg =
      "— TrueWin Verification Request —\n\n" +
      `Name: ${name}\n` +
      `Telegram: ${tg}\n` +
      `UPI: ${upi}\n` +
      `Type: ${typeLabel}\n` +
      (notes ? `Notes: ${notes}\n` : "") +
      "\nI confirm that this UPI and details belong to me and are genuine. " +
      "I agree that providing fake details can lead to a permanent ban.";

    result.textContent = msg;

    // Try to copy to clipboard for convenience
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(msg)
        .then(() => {
          result.textContent += "\n\nCopied to clipboard ✅ Paste this in Telegram / WhatsApp.";
        })
        .catch(() => {
          // ignore if blocked
        });
    }
  });
}

// ------------ FEEDBACK FORM ------------ //
function initFeedbackForm() {
  const form = document.getElementById("feedbackForm");
  const out = document.getElementById("feedbackResult");
  if (!form || !out) return;

  const badWords = [
    "gandu",
    "madarchod",
    "chod",
    "bhosdi",
    "mc",
    "bc",
    "fuck",
    "bitch",
    "chutiya"
  ];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const rating = parseInt(document.getElementById("fbRating").value, 10);
    const text = document.getElementById("fbText").value.toLowerCase();

    if (isNaN(rating) || rating < 1 || rating > 5) {
      out.textContent = "Rating must be between 1 and 5.";
      return;
    }

    if (badWords.some((w) => text.includes(w))) {
      out.textContent = "Please avoid bad words in feedback 😊";
      return;
    }

    out.textContent =
      "Thank you! Your feedback is saved. We use it internally to improve the site.";
    form.reset();
  });
}

// ------------ GAME 1: SKY STACK (frame-rate safe) ------------ //
function initSkyStack() {
  const canvas = document.getElementById("stackCanvas");
  const btn = document.getElementById("stackStart");
  const scoreLabel = document.getElementById("stackScore");
  if (!canvas || !btn || !scoreLabel) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;

  let stack = [];
  let currentBlock = null;
  let speed = 2.5;
  let direction = 1;
  let running = false;
  let gameOver = false;
  let lastTime = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = 200;
    canvas.width = width;
    canvas.height = height;
    resetGame();
    draw();
  }
  window.addEventListener("resize", resize);
  resize();

  function resetGame() {
    const baseHeight = 20;
    stack = [
      {
        x: width / 2 - 60,
        y: height - baseHeight,
        width: 120
      }
    ];
    spawnBlock();
    speed = 2.5;
    direction = 1;
    running = false;
    gameOver = false;
    lastTime = 0;
    updateScore();
  }

  function spawnBlock() {
    const last = stack[stack.length - 1];
    currentBlock = {
      x: 0,
      y: last.y - 20,
      width: last.width
    };
  }

  function updateScore() {
    scoreLabel.textContent = "Height: " + (stack.length - 1);
  }

  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "#020617");
    grad.addColorStop(1, "#020617");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  function drawStack() {
    stack.forEach((b, i) => {
      ctx.fillStyle = i === 0 ? "#22c55e" : "#4ade80";
      ctx.fillRect(b.x, b.y, b.width, 20);
    });
  }

  function drawCurrent() {
    if (!currentBlock) return;
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.width, 20);
  }

  function draw() {
    drawBackground();
    drawStack();
    drawCurrent();

    if (!running && !gameOver) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "13px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(
        "Tap / click or press Space to drop the block",
        width / 2,
        height / 2
      );
    }

    if (gameOver) {
      ctx.fillStyle = "rgba(15,23,42,0.72)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", width / 2, height / 2 - 10);
      ctx.font = "13px system-ui";
      ctx.fillText(
        "Tap / Space to restart",
        width / 2,
        height / 2 + 12
      );
    }
  }

  function update(timestamp) {
    if (!running || gameOver) return;

    if (!lastTime) lastTime = timestamp;
    let delta = (timestamp - lastTime) / 16.67; // 1 ≈ 60fps frame
    delta = Math.max(0.7, Math.min(delta, 1.3)); // clamp
    lastTime = timestamp;

    currentBlock.x += speed * direction * delta;
    if (currentBlock.x <= 0 || currentBlock.x + currentBlock.width >= width) {
      direction *= -1;
    }

    draw();
    requestAnimationFrame(update);
  }

  function placeBlock() {
    if (!running) {
      running = true;
      lastTime = 0;
      requestAnimationFrame(update);
      return;
    }

    const last = stack[stack.length - 1];
    const overlapStart = Math.max(last.x, currentBlock.x);
    const overlapEnd = Math.min(
      last.x + last.width,
      currentBlock.x + currentBlock.width
    );
    const overlapWidth = overlapEnd - overlapStart;

    if (overlapWidth <= 10) {
      gameOver = true;
      draw();
      return;
    }

    stack.push({
      x: overlapStart,
      y: currentBlock.y,
      width: overlapWidth
    });

    updateScore();

    currentBlock.width = overlapWidth;
    currentBlock.y -= 22;

    if (currentBlock.y < 40) {
      stack.forEach((b) => (b.y += 22));
      currentBlock.y += 22;
    }

    speed = Math.min(5, speed + 0.18);
  }

  function handleTap() {
    if (gameOver) {
      resetGame();
      draw();
      return;
    }
    placeBlock();
  }

  btn.addEventListener("click", handleTap);
  canvas.addEventListener("click", handleTap);
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      handleTap();
    }
  });

  draw();
}

// ------------ GAME 2: NEON RUNNER (clamped delta) ------------ //
function initNeonRunner() {
  const canvas = document.getElementById("runnerCanvas");
  const startBtn = document.getElementById("runnerStart");
  const scoreLabel = document.getElementById("runnerScore");
  if (!canvas || !startBtn || !scoreLabel) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;

  let groundY;
  let player;
  let obstacles;
  let speed;
  let running = false;
  let lastTime = 0;
  let score = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = 180;
    canvas.width = width;
    canvas.height = height;
    groundY = height - 30;
    resetGame();
    drawIdle();
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function resetGame() {
    player = {
      x: 40,
      y: groundY - 20,
      size: 24,
      vy: 0,
      color: "#ffcf33"
    };
    obstacles = [];
    speed = 4;
    score = 0;
    updateScore(0);
  }

  function updateScore(val) {
    score = val;
    scoreLabel.textContent = "Score: " + Math.floor(score);
  }

  function drawGround() {
    const gradient = ctx.createLinearGradient(0, groundY, 0, height);
    gradient.addColorStop(0, "#1e293b");
    gradient.addColorStop(1, "#020617");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, groundY, width, height - groundY);

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();
  }

  function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.roundRect(
      player.x - player.size / 2,
      player.y - player.size,
      player.size,
      player.size,
      6
    );
    ctx.fill();
  }

  function drawObstacles() {
    ctx.fillStyle = "#fb7185";
    obstacles.forEach((o) => {
      ctx.fillRect(o.x, groundY - o.height, o.width, o.height);
    });
  }

  function drawIdle() {
    ctx.clearRect(0, 0, width, height);
    drawGround();
    drawPlayer();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      "Tap button / canvas or press Space to start",
      width / 2,
      height / 2
    );
  }

  function spawnObstacle() {
    const widthObs = 18 + Math.random() * 18;
    const heightObs = 20 + Math.random() * 22;
    obstacles.push({
      x: width + widthObs,
      width: widthObs,
      height: heightObs
    });
  }

  function jump() {
    if (!running) return;
    if (player.y >= groundY - 1) {
      player.vy = -9;
    }
  }

  function showGameOver() {
    running = false;
    ctx.fillStyle = "rgba(15,23,42,0.7)";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "16px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", width / 2, height / 2 - 10);
    ctx.font = "13px system-ui";
    ctx.fillText(
      "Tap button / canvas or press Space to restart",
      width / 2,
      height / 2 + 12
    );
  }

  function loop(timestamp) {
    if (!running) return;
    if (!lastTime) lastTime = timestamp;

    let delta = (timestamp - lastTime) / 16.67;
    delta = Math.max(0.7, Math.min(delta, 1.3));
    lastTime = timestamp;

    // physics
    player.vy += 0.5 * delta;
    player.y += player.vy * delta;
    if (player.y > groundY) {
      player.y = groundY;
      player.vy = 0;
    }

    obstacles.forEach((o) => {
      o.x -= speed * delta;
    });
    obstacles = obstacles.filter((o) => o.x + o.width > -10);

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < width - 140) {
      if (Math.random() < 0.045 * delta) {
        spawnObstacle();
      }
    }

    const px = player.x;
    const pyBottom = player.y;
    const pHalf = player.size / 2;

    for (const o of obstacles) {
      const ox1 = o.x;
      const ox2 = o.x + o.width;
      const oyTop = groundY - o.height;
      const colliding =
        px + pHalf > ox1 && px - pHalf < ox2 && pyBottom > oyTop;
      if (colliding) {
        showGameOver();
        return;
      }
    }

    updateScore(score + 0.2 * delta);
    if (score > 60) speed = 7;
    else if (score > 35) speed = 6;
    else if (score > 15) speed = 5;

    ctx.clearRect(0, 0, width, height);
    drawGround();
    drawObstacles();
    drawPlayer();

    requestAnimationFrame(loop);
  }

  function startGame() {
    resetGame();
    running = true;
    lastTime = 0;
    requestAnimationFrame(loop);
  }

  function handleTap() {
    if (!running) {
      startGame();
    } else {
      jump();
    }
  }

  startBtn.addEventListener("click", handleTap);
  canvas.addEventListener("click", handleTap);
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      handleTap();
    }
  });
}

// ------------ GAME 3: REFLEX TAP ------------ //
function initReflexTap() {
  const canvas = document.getElementById("reflexCanvas");
  const btn = document.getElementById("reflexStart");
  const scoreLabel = document.getElementById("reflexScore");
  if (!canvas || !btn || !scoreLabel) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;

  let circles = [];
  let activeIndex = -1;
  let score = 0;
  let running = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = 180;
    canvas.width = width;
    canvas.height = height;
    drawIdle();
  }
  window.addEventListener("resize", resize);
  resize();

  function createCircles() {
    const cols = 3;
    const rows = 2;
    const radius = 26;
    const marginX = width / (cols + 1);
    const marginY = height / (rows + 1);

    circles = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        circles.push({
          x: marginX * (c + 1),
          y: marginY * (r + 1),
          radius
        });
      }
    }
  }

  function drawIdle() {
    ctx.clearRect(0, 0, width, height);
    createCircles();
    circles.forEach((c) => {
      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4b5563";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      "Tap Start, then tap the glowing circles fast!",
      width / 2,
      height - 18
    );
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    circles.forEach((c, idx) => {
      const isActive = idx === activeIndex;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      if (isActive) {
        const grad = ctx.createRadialGradient(
          c.x - 5,
          c.y - 5,
          5,
          c.x,
          c.y,
          c.radius
        );
        grad.addColorStop(0, "#22c55e");
        grad.addColorStop(1, "#15803d");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = "#020617";
      }
      ctx.fill();
      ctx.strokeStyle = isActive ? "#4ade80" : "#4b5563";
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }

  function pickNextCircle() {
    const next = Math.floor(Math.random() * circles.length);
    activeIndex = next;
    draw();
  }

  function startGame() {
    running = true;
    score = 0;
    updateScore();
    createCircles();
    pickNextCircle();
  }

  function updateScore() {
    scoreLabel.textContent = "Score: " + score;
  }

  function endGame() {
    running = false;
    ctx.fillStyle = "rgba(15,23,42,0.76)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", width / 2, height / 2 - 10);
    ctx.font = "13px system-ui";
    ctx.fillText(
      "Final score: " + score + " • Tap Start to play again",
      width / 2,
      height / 2 + 12
    );
  }

  function handleTap(x, y) {
    if (!running) return;
    const c = circles[activeIndex];
    const dist = Math.hypot(x - c.x, y - c.y);
    if (dist <= c.radius) {
      score++;
      updateScore();
      pickNextCircle();
    } else {
      endGame();
    }
  }

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleTap(x, y);
  });

  btn.addEventListener("click", () => {
    if (!running) {
      startGame();
    }
  });

  drawIdle();
}

