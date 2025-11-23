// Year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

// Scroll progress bar
const scrollBar = document.getElementById("scroll-progress");
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollBar.style.width = progress + "%";
});

// Scroll animations
const animatedSections = document.querySelectorAll(".animate-on-scroll");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

animatedSections.forEach((section) => observer.observe(section));

// Stats counters
const statNumbers = document.querySelectorAll(".stat-number");
let statsStarted = false;

function startCounters() {
  if (statsStarted) return;
  statsStarted = true;

  statNumbers.forEach((el) => {
    const target = Number(el.dataset.target || "0");
    const duration = 1200;
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString("en-IN");
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}

const statsSection = document.getElementById("stats");
if (statsSection) {
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCounters();
          statsObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );
  statsObserver.observe(statsSection);
}

// Verification form summary
const verificationForm = document.getElementById("verificationForm");
const verificationResult = document.getElementById("verificationResult");

if (verificationForm && verificationResult) {
  verificationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(verificationForm);
    const fullName = formData.get("fullName") || "";
    const telegram = formData.get("telegram") || "";
    const upi = formData.get("upi") || "";
    const type = formData.get("verificationType") || "";
    const contactPref = formData.get("contactPref") || "";
    const notes = (formData.get("notes") || "").toString().trim();

    const typeLabel =
      type === "advanced"
        ? "Advanced Verified (VIP)"
        : "Verified (Basic)";

    const summary = [
      "TrueWin Verification Request",
      "---------------------------",
      `Name: ${fullName}`,
      `Telegram: ${telegram}`,
      `UPI ID: ${upi}`,
      `Verification Type: ${typeLabel}`,
      `Preferred Contact: ${contactPref}`,
      notes ? `Notes: ${notes}` : "",
      "",
      "I confirm that the above details belong to me and are not fake or stolen.",
    ]
      .filter(Boolean)
      .join("\n");

    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(summary)
        .then(() => {
          verificationResult.textContent =
            "Summary generated and copied. Paste it in DM to @tanish_parikh or WhatsApp.";
        })
        .catch(() => {
          verificationResult.textContent =
            "Summary generated. Copy it from here and send in DM:";
        });
    } else {
      verificationResult.textContent =
        "Summary generated. Copy it from here and send in DM:";
    }

    console.log(summary);
  });
}

// Game tabs
const gameTabs = document.querySelectorAll(".game-tab");
const gamePanels = document.querySelectorAll(".game-panel");

gameTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.game;
    gameTabs.forEach((t) => t.classList.remove("active"));
    gamePanels.forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    const panel = document.getElementById(target);
    if (panel) panel.classList.add("active");
  });
});

/* Runner Dash Game */
let runnerRunning = false;
let runnerScore = 0;
let runnerInterval = null;
let obstacleSpeed = 3;

const runnerPlayer = document.getElementById("runnerPlayer");
const runnerObstacle = document.getElementById("runnerObstacle");
const runnerScoreEl = document.getElementById("runnerScore");
const runnerMessageEl = document.getElementById("runnerMessage");
const runnerJumpBtn = document.getElementById("runnerJumpBtn");
const runnerResetBtn = document.getElementById("runnerResetBtn");

function startRunnerGame() {
  if (runnerRunning) return;
  runnerRunning = true;
  runnerScore = 0;
  obstacleSpeed = 3;
  runnerMessageEl.textContent = "Avoid the obstacle!";
  runnerObstacle.style.right = "-40px";

  runnerInterval = setInterval(() => {
    const currentRight = parseFloat(
      getComputedStyle(runnerObstacle).right || "0"
    );
    let nextRight = currentRight + obstacleSpeed;
    if (nextRight > window.innerWidth + 60) {
      nextRight = -40;
      runnerScore += 1;
      runnerScoreEl.textContent = String(runnerScore);
      obstacleSpeed = Math.min(obstacleSpeed + 0.4, 10);
    }
    runnerObstacle.style.right = nextRight + "px";
    checkRunnerCollision();
  }, 20);
}

let jumping = false;

function runnerJump() {
  if (!runnerRunning) startRunnerGame();
  if (jumping) return;
  jumping = true;
  const startBottom = 40;
  const jumpHeight = 70;
  const duration = 420;
  const startTime = performance.now();

  function animate(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const angle = Math.sin(progress * Math.PI);
    const newBottom = startBottom + jumpHeight * angle;
    runnerPlayer.style.bottom = newBottom + "px";
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      jumping = false;
    }
  }

  requestAnimationFrame(animate);
}

function checkRunnerCollision() {
  const playerRect = runnerPlayer.getBoundingClientRect();
  const obstacleRect = runnerObstacle.getBoundingClientRect();

  const overlap =
    playerRect.left < obstacleRect.right &&
    playerRect.right > obstacleRect.left &&
    playerRect.bottom > obstacleRect.top;

  if (overlap) {
    endRunnerGame();
  }
}

function endRunnerGame() {
  runnerRunning = false;
  clearInterval(runnerInterval);
  runnerMessageEl.textContent = `Game over. Score: ${runnerScore}`;
}

if (runnerJumpBtn) {
  runnerJumpBtn.addEventListener("click", runnerJump);
}

if (runnerResetBtn) {
  runnerResetBtn.addEventListener("click", () => {
    clearInterval(runnerInterval);
    runnerRunning = false;
    runnerScore = 0;
    obstacleSpeed = 3;
    runnerScoreEl.textContent = "0";
    runnerMessageEl.textContent = "Tap Jump to start";
    runnerPlayer.style.bottom = "40px";
    runnerObstacle.style.right = "-40px";
  });
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    runnerJump();
  }
});

/* Reaction Tap Game */
const reactionArea = document.getElementById("reactionArea");
const reactionText = document.getElementById("reactionText");
const reactionStartBtn = document.getElementById("reactionStartBtn");
const reactionTapBtn = document.getElementById("reactionTapBtn");
const reactionLast = document.getElementById("reactionLast");
const reactionBest = document.getElementById("reactionBest");

let reactionState = "idle";
let readyTime = 0;
let bestTime = null;
let timeoutId = null;

function startReactionGame() {
  if (!reactionArea || !reactionText) return;
  reactionState = "waiting";
  reactionArea.classList.remove("ready");
  reactionText.textContent = "Wait for green...";
  const delay = 800 + Math.random() * 2200;
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    reactionState = "ready";
    reactionArea.classList.add("ready");
    reactionText.textContent = "TAP NOW!";
    readyTime = performance.now();
  }, delay);
}

function tapReactionGame() {
  if (!reactionArea || !reactionText) return;

  if (reactionState === "waiting") {
    // Tapped too early
    reactionText.textContent = "Too early! Press Start again.";
    reactionArea.classList.remove("ready");
    reactionState = "idle";
    clearTimeout(timeoutId);
  } else if (reactionState === "ready") {
    const now = performance.now();
    const diff = Math.round(now - readyTime);
    reactionLast.textContent = diff + "";
    if (bestTime === null || diff < bestTime) {
      bestTime = diff;
      reactionBest.textContent = bestTime + "";
    }
    reactionText.textContent = "Good reflex! Press Start to play again.";
    reactionArea.classList.remove("ready");
    reactionState = "idle";
    clearTimeout(timeoutId);
  }
}

if (reactionStartBtn) {
  reactionStartBtn.addEventListener("click", startReactionGame);
}
if (reactionTapBtn) {
  reactionTapBtn.addEventListener("click", tapReactionGame);
}

/* Number Hunt Game */
const numberGrid = document.getElementById("numberGrid");
const numberTargetEl = document.getElementById("numberTarget");
const numberTimeEl = document.getElementById("numberTime");
const numberScoreEl = document.getElementById("numberScore");
const numberStartBtn = document.getElementById("numberStartBtn");
const numberMessageEl = document.getElementById("numberMessage");

let numberTarget = null;
let numberScore = 0;
let numberTimer = null;
let numberTimeLeft = 0;

function generateNumberGrid() {
  if (!numberGrid) return;
  numberGrid.innerHTML = "";
  const numbers = [];
  for (let i = 0; i < 25; i++) {
    numbers.push(Math.floor(Math.random() * 50) + 1);
  }
  numberTarget = numbers[Math.floor(Math.random() * numbers.length)];
  numberTargetEl.textContent = String(numberTarget);

  numbers.forEach((num) => {
    const btn = document.createElement("button");
    btn.textContent = String(num);
    btn.addEventListener("click", () => handleNumberClick(num, btn));
    numberGrid.appendChild(btn);
  });
}

function handleNumberClick(num, btn) {
  if (numberTimeLeft <= 0) return;
  if (num === numberTarget) {
    numberScore += 1;
    numberScoreEl.textContent = String(numberScore);
    numberMessageEl.textContent = "Correct! New round starting...";
    btn.style.background =
      "linear-gradient(135deg, #2de39f, #1a764b)";
    clearInterval(numberTimer);
    setTimeout(startNumberRound, 800);
  } else {
    btn.style.opacity = "0.3";
    numberMessageEl.textContent = "Wrong number, try again.";
  }
}

function startNumberRound() {
  generateNumberGrid();
  numberTimeLeft = 10;
  numberTimeEl.textContent = String(numberTimeLeft);
  numberMessageEl.textContent = "Find the target before time ends.";
  clearInterval(numberTimer);
  numberTimer = setInterval(() => {
    numberTimeLeft -= 1;
    numberTimeEl.textContent = String(numberTimeLeft);
    if (numberTimeLeft <= 0) {
      clearInterval(numberTimer);
      numberMessageEl.textContent = "Time up! Press start for new round.";
    }
  }, 1000);
}

if (numberStartBtn) {
  numberStartBtn.addEventListener("click", () => {
    startNumberRound();
  });
}
