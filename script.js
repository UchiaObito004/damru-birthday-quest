// --- SILENT MODE (Zero audio/sound. Ready for custom background music later) ---

// --- BACKGROUND CANVAS (Stars & Sky Lanterns) ---
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
let stars = [];
let lanterns = [];

function resizeBgCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeBgCanvas);
resizeBgCanvas();

for (let i = 0; i < 70; i++) {
  stars.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 2 + 0.6,
    alpha: Math.random(),
    speed: Math.random() * 0.02 + 0.005
  });
}

function spawnLantern(label = '✨') {
  lanterns.push({
    x: Math.random() * (window.innerWidth - 60) + 30,
    y: window.innerHeight + 30,
    size: Math.random() * 14 + 18,
    speedY: Math.random() * 1.3 + 0.9,
    label: label,
    alpha: 0.9
  });
}

function animateBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  stars.forEach(s => {
    s.alpha += s.speed;
    if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
    bgCtx.beginPath();
    bgCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
    bgCtx.fill();
  });

  for (let i = lanterns.length - 1; i >= 0; i--) {
    const l = lanterns[i];
    l.y -= l.speedY;
    l.x += Math.sin(l.y * 0.02) * 0.7;

    bgCtx.save();
    bgCtx.shadowBlur = 20;
    bgCtx.shadowColor = '#e50914';
    bgCtx.fillStyle = `rgba(229, 9, 20, ${l.alpha})`;
    bgCtx.beginPath();
    bgCtx.roundRect(l.x, l.y, l.size, l.size * 1.35, [4, 4, 6, 6]);
    bgCtx.fill();
    bgCtx.restore();

    if (l.y < -60) lanterns.splice(i, 1);
  }

  requestAnimationFrame(animateBg);
}
animateBg();

// --- FIREWORKS CANVAS ---
const fwCanvas = document.getElementById('fireworks-canvas');
const fwCtx = fwCanvas.getContext('2d');
let particles = [];

function resizeFwCanvas() {
  fwCanvas.width = window.innerWidth;
  fwCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFwCanvas);
resizeFwCanvas();

function triggerExplosion(x, y, count = 40) {
  const colors = ['#e50914', '#ffd700', '#ff2e93', '#00f2fe', '#ffffff', '#b81d24'];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 3.5 + 2
    });
  }
}

function animateFw() {
  fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.alpha -= 0.02;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    fwCtx.beginPath();
    fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fwCtx.fillStyle = p.color;
    fwCtx.globalAlpha = p.alpha;
    fwCtx.fill();
    fwCtx.globalAlpha = 1.0;
  }
  requestAnimationFrame(animateFw);
}
animateFw();

function blastConfetti() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      triggerExplosion(
        Math.random() * window.innerWidth,
        Math.random() * (window.innerHeight * 0.6) + 50,
        35
      );
    }, i * 160);
  }
}

// Flash Transition
function flashScreen() {
  const flash = document.getElementById('flash-overlay');
  flash.classList.add('flash');
  setTimeout(() => flash.classList.remove('flash'), 500);
}

// Navigation & Pill
function showScreen(screenId, pillText) {
  document.querySelectorAll('.level-screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (pillText) {
    document.getElementById('episode-pill').textContent = pillText;
  }
}

// Logo Home navigation
document.getElementById('nav-logo').addEventListener('click', () => {
  showScreen('screen-billboard', 'S1: HOME');
});

// ==========================================
// SCREEN 0: "WHO'S WATCHING?" INTERACTIONS
// ==========================================
document.getElementById('profile-damru').addEventListener('click', () => {
  flashScreen();
  setTimeout(() => {
    showScreen('screen-billboard', 'S1: PREVIEW');
  }, 300);
});

document.getElementById('profile-bhai').addEventListener('click', () => {
  alert("🛑 ACCESS RESTRICTED: Tonight is 100% Damru's Show! Please select Damru's profile! 👸🍿");
});

document.getElementById('btn-play-ep1').addEventListener('click', () => {
  showScreen('screen-level-1', 'S1: EP 1');
});

document.getElementById('btn-episodes-list').addEventListener('click', () => {
  alert("🍿 Damflix Season 1 Episodes:\n\n• Episode 1: The Sugar Rush Reflex\n• Episode 2: Quantum Aura Scanner\n• Episode 3: Sibling Lie Detector\n• Episode 4: The Wishing Sanctuary\n• Episode 5: Season Finale & Hinglish Shayari 👑");
});

// ==========================================
// EPISODE 1: SUGAR RUSH REFLEX ARCADE
// ==========================================
let gameScore = 0;
let comboMultiplier = 1;
let gameTimeLeft = 20;
let gameInterval = null;
let spawnInterval = null;
const gameBoard = document.getElementById('game-board');
const scoreEl = document.getElementById('game-score');
const comboEl = document.getElementById('game-combo');
const timerEl = document.getElementById('game-timer');
const overlayEl = document.getElementById('game-start-overlay');
const comboToast = document.getElementById('combo-toast');
const reward1El = document.getElementById('reward-1');

document.getElementById('btn-start-game').addEventListener('click', startGame);

function startGame() {
  gameScore = 0;
  comboMultiplier = 1;
  gameTimeLeft = 20;
  scoreEl.textContent = '0';
  comboEl.textContent = 'x1';
  timerEl.textContent = '20';
  overlayEl.classList.add('hidden');
  reward1El.classList.add('hidden');

  gameBoard.querySelectorAll('.falling-item').forEach(el => el.remove());

  gameInterval = setInterval(() => {
    gameTimeLeft--;
    timerEl.textContent = gameTimeLeft;
    if (gameTimeLeft <= 0) endGame(false);
  }, 1000);

  spawnInterval = setInterval(spawnTreat, 480);
}

function spawnTreat() {
  if (gameScore >= 8) return;
  const treats = ['🎂', '🧁', '🍦', '🍫', '🎁', '🍓', '🩴', '📚'];
  const itemChar = treats[Math.floor(Math.random() * treats.length)];
  const isRoast = itemChar === '🩴' || itemChar === '📚';

  const item = document.createElement('div');
  item.className = 'falling-item';
  item.textContent = itemChar;
  item.style.left = `${Math.random() * 80 + 5}%`;
  item.style.animationDuration = `${Math.random() * 1.1 + 1.8}s`;

  item.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (isRoast) {
      comboMultiplier = 1;
      comboEl.textContent = 'x1';
      gameScore = Math.max(0, gameScore - 1);
      item.textContent = '💥';
    } else {
      gameScore++;
      comboMultiplier = Math.min(5, comboMultiplier + 1);
      comboEl.textContent = `x${comboMultiplier}`;
      
      if (comboMultiplier >= 3) {
        comboToast.textContent = `COMBO x${comboMultiplier}! 🔥`;
        comboToast.classList.remove('hidden');
        setTimeout(() => comboToast.classList.add('hidden'), 600);
      }

      triggerExplosion(e.clientX, e.clientY, 15);
      item.textContent = '✨';
    }
    scoreEl.textContent = gameScore;
    setTimeout(() => item.remove(), 100);

    if (gameScore >= 8) endGame(true);
  });

  gameBoard.appendChild(item);
  setTimeout(() => { if (item.parentNode) item.remove(); }, 3000);
}

function endGame(won) {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  gameBoard.querySelectorAll('.falling-item').forEach(el => el.remove());

  if (won) {
    blastConfetti();
    reward1El.classList.remove('hidden');
  } else {
    overlayEl.classList.remove('hidden');
    overlayEl.querySelector('button').textContent = 'SO CLOSE! TAP TO RETRY 🔄';
  }
}

document.getElementById('btn-next-2').addEventListener('click', () => {
  showScreen('screen-level-2', 'S1: EP 2');
});

// ==========================================
// EPISODE 2: BIOMETRIC SCANNER
// ==========================================
const scanBtn = document.getElementById('scan-touch-btn');
const scanProgress = document.getElementById('scan-progress');
const scanContainer = document.getElementById('scan-photo-wrap');
const scanPrompt = document.getElementById('scan-prompt-text');
const scanResults = document.getElementById('scan-results');
let scanTimer = null;
let scanPercent = 0;

function startScanning(e) {
  e.preventDefault();
  scanContainer.classList.add('scanning');
  scanBtn.classList.add('active');
  scanPrompt.textContent = 'DAMFLIX AI: SCANNING FREQUENCIES... 📡';

  scanTimer = setInterval(() => {
    scanPercent += 3.5;
    scanProgress.style.width = `${scanPercent}%`;

    if (navigator.vibrate) {
      try { navigator.vibrate(20); } catch (err) {}
    }

    if (scanPercent >= 100) {
      clearInterval(scanTimer);
      finishScan();
    }
  }, 65);
}

function stopScanning() {
  if (scanPercent < 100) {
    clearInterval(scanTimer);
    scanPercent = 0;
    scanProgress.style.width = '0%';
    scanContainer.classList.remove('scanning');
    scanBtn.classList.remove('active');
    scanPrompt.textContent = 'PRESS & HOLD FINGER TO SCAN';
  }
}

function finishScan() {
  scanContainer.classList.remove('scanning');
  scanBtn.classList.remove('active');
  scanBtn.style.display = 'none';
  blastConfetti();
  scanResults.classList.remove('hidden');
}

scanBtn.addEventListener('pointerdown', startScanning);
window.addEventListener('pointerup', stopScanning);
window.addEventListener('pointercancel', stopScanning);

document.getElementById('btn-next-3').addEventListener('click', () => {
  showScreen('screen-level-3', 'S1: EP 3');
});

// ==========================================
// EPISODE 3: SIBLING LIE DETECTOR (5 QUESTIONS)
// ==========================================
window.handleQuizAnswer = function(questionNum, answer) {
  const feedbackEl = document.getElementById(`quiz-feedback-${questionNum}`);
  
  if (questionNum === 1) {
    feedbackEl.textContent = "TRUTH: 10% miss karna, 90% drama aur urgent gossip! 😂";
    feedbackEl.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('quiz-step-1').classList.add('hidden');
      document.getElementById('quiz-step-2').classList.remove('hidden');
    }, 1200);
  } else if (questionNum === 2) {
    feedbackEl.textContent = "100% FACT: 99% time call me sirf apni hi screen dekhti hai! 🤳😂";
    feedbackEl.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('quiz-step-2').classList.add('hidden');
      document.getElementById('quiz-step-3').classList.remove('hidden');
    }, 1200);
  } else if (questionNum === 3) {
    feedbackEl.textContent = "FACT: Gossip sunne me speed light se bhi tez hai! ⚡🍿";
    feedbackEl.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('quiz-step-3').classList.add('hidden');
      document.getElementById('quiz-step-4').classList.remove('hidden');
    }, 1200);
  } else if (questionNum === 4) {
    feedbackEl.textContent = "SCIENTIFIC FACT: Bhai's money = Damru's emergency pocket money! 💸";
    feedbackEl.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('quiz-step-4').classList.add('hidden');
      document.getElementById('quiz-step-5').classList.remove('hidden');
    }, 1200);
  } else if (questionNum === 5) {
    blastConfetti();
    feedbackEl.textContent = "VERIFIED: Chahe kitni bhi doori ho, Bhai hamesha tere saath khada hai! ❤️✨";
    feedbackEl.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('quiz-step-5').classList.add('hidden');
      document.getElementById('vault-unlocked').classList.remove('hidden');
    }, 1400);
  }
};

document.getElementById('btn-next-4').addEventListener('click', () => {
  showScreen('screen-level-4', 'S1: EP 4');
});

// ==========================================
// EPISODE 4: WISHING CAKE & CANDLE
// ==========================================
const candle = document.getElementById('interactive-candle');
const blowBtn = document.getElementById('btn-blow-candle');
const blowBtnText = document.getElementById('blow-btn-text');
const wishSuccess = document.getElementById('wish-success');
let wishMade = false;

function blowOutCandle() {
  if (wishMade) return;
  wishMade = true;

  candle.classList.add('blown');
  blowBtn.disabled = true;
  blowBtnText.textContent = '✨ WISH RECORDED & SEALED! ✨';

  for (let i = 0; i < 25; i++) {
    setTimeout(() => spawnLantern('🏮'), i * 120);
  }

  setTimeout(() => {
    blastConfetti();
    wishSuccess.classList.remove('hidden');
  }, 1200);
}

blowBtn.addEventListener('click', blowOutCandle);
candle.addEventListener('click', blowOutCandle);

document.getElementById('btn-next-5').addEventListener('click', () => {
  showScreen('screen-level-5', 'S1: FINALE');
  startGrandFinale();
});

// ==========================================
// EPISODE 5: GRAND FINALE & HINGLISH SHAYARI
// ==========================================
const shayariLines = [
  "Khushiyon ka har lamha tere daaman mein saj jaaye,",
  "Tu jo chahe wo har khwaab sach ho jaaye! ✨\n",
  "Dua hai rab se bas itni si meri behna,",
  "Teri ye pyaari si muskaan kabhi kam na hone paaye! 💖\n",
  "Tu chahe kitni bhi nautanki kare ya mujhe sataye,",
  "Par tere jaisi behen rab kismat walon ko hi banaye! 🤪❤️\n",
  "Happy Birthday Meri Pyaari Damru! 🥁🎂🎉"
];

function startGrandFinale() {
  blastConfetti();
  
  setInterval(() => {
    if (document.getElementById('screen-level-5').classList.contains('active')) {
      triggerExplosion(
        Math.random() * window.innerWidth,
        Math.random() * (window.innerHeight * 0.4) + 60,
        35
      );
      if (Math.random() > 0.5) spawnLantern('✨');
    }
  }, 1600);

  const container = document.getElementById('shayari-text');
  container.innerHTML = '';
  let lineIdx = 0;
  let charIdx = 0;

  function typeLine() {
    if (lineIdx < shayariLines.length) {
      const currentLine = shayariLines[lineIdx];
      if (charIdx < currentLine.length) {
        container.innerHTML += currentLine[charIdx] === '\n' ? '<br>' : currentLine[charIdx];
        charIdx++;
        setTimeout(typeLine, 26);
      } else {
        lineIdx++;
        charIdx = 0;
        setTimeout(typeLine, 240);
      }
    }
  }
  typeLine();

  const shareMsg = encodeURIComponent(
    "Bhai thank you so much! Ye DAMFLIX birthday surprise aur VIP pass bhot zyada mast tha 🥹❤️🥁 Best birthday ever!"
  );
  document.getElementById('btn-whatsapp-share').href = `https://api.whatsapp.com/send?text=${shareMsg}`;
}

// Secret Note Accordion Toggle
const envelopeToggle = document.getElementById('envelope-toggle');
const envelopeContent = document.getElementById('envelope-content');
const envelopeArrow = document.getElementById('envelope-arrow');

envelopeToggle.addEventListener('click', () => {
  envelopeContent.classList.toggle('hidden');
  envelopeArrow.textContent = envelopeContent.classList.contains('hidden') ? '▼' : '▲';
});

// Screenshot Hint
document.getElementById('btn-screenshot-hint').addEventListener('click', () => {
  alert('📸 Tip: Take a screenshot of this VIP Member Pass right now to save your official DAMFLIX perks!');
});

// Restart Show
document.getElementById('btn-restart').addEventListener('click', () => {
  showScreen('screen-profiles', 'S1: EP 0');
});

// Lookbook Screen Navigation
const btnViewLookbook = document.getElementById('btn-view-lookbook');
if (btnViewLookbook) {
  btnViewLookbook.addEventListener('click', () => {
    showScreen('screen-lookbook', 'VIP: LOOKBOOK');
  });
}

const navVipPerks = document.getElementById('nav-vip-perks');
if (navVipPerks) {
  navVipPerks.addEventListener('click', () => {
    showScreen('screen-lookbook', 'VIP: LOOKBOOK');
  });
}

const btnBackFromLookbook = document.getElementById('btn-back-from-lookbook');
if (btnBackFromLookbook) {
  btnBackFromLookbook.addEventListener('click', () => {
    showScreen('screen-level-5', 'S1: FINALE');
  });
}

