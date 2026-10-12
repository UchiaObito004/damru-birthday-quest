// --- AUDIO ENGINE (Pure Web Audio API - Zero External Dependencies) ---
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.2, gainVal = 0.15) {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn(e);
    }
  }

  playPop() {
    this.playTone(587.33, 'triangle', 0.12, 0.2); // D5
  }

  playCatch() {
    if (this.muted) return;
    this.init();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.12), idx * 60);
    });
  }

  playRoast() {
    this.playTone(180, 'sawtooth', 0.25, 0.15);
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.35, 0.2), i * 110);
    });
  }

  playBlowWind() {
    if (this.muted) return;
    this.init();
    try {
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 1.2);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {
      console.warn(e);
    }
  }

  startAmbientChimes() {
    if (this.bgInterval) return;
    const chords = [
      [329.63, 440, 554.37], // E4, A4, C#5
      [293.66, 369.99, 440], // D4, F#4, A4
      [392.00, 493.88, 587.33], // G4, B4, D5
      [440.00, 554.37, 659.25]  // A4, C#5, E5
    ];
    let chordIdx = 0;
    this.bgInterval = setInterval(() => {
      if (!this.muted && this.ctx) {
        const chord = chords[chordIdx % chords.length];
        chord.forEach((freq, i) => {
          setTimeout(() => this.playTone(freq, 'sine', 1.8, 0.03), i * 150);
        });
        chordIdx++;
      }
    }, 3200);
  }
}

const sound = new SoundEngine();

// --- BACKGROUND CANVAS (STARS & FLOATING LANTERNS) ---
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

// Init Stars
for (let i = 0; i < 70; i++) {
  stars.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 2 + 0.8,
    alpha: Math.random(),
    speed: Math.random() * 0.02 + 0.005
  });
}

function spawnLantern() {
  lanterns.push({
    x: Math.random() * (window.innerWidth - 60) + 30,
    y: window.innerHeight + 20,
    size: Math.random() * 12 + 14,
    speedY: Math.random() * 1.2 + 0.8,
    swing: Math.random() * 2,
    alpha: 0.85
  });
}

function animateBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  // Draw Stars
  stars.forEach(s => {
    s.alpha += s.speed;
    if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
    bgCtx.beginPath();
    bgCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
    bgCtx.fill();
  });

  // Draw Floating Sky Lanterns
  for (let i = lanterns.length - 1; i >= 0; i--) {
    const l = lanterns[i];
    l.y -= l.speedY;
    l.x += Math.sin(l.y * 0.02) * 0.5;

    // Glowing Lantern Body
    bgCtx.save();
    bgCtx.shadowBlur = 18;
    bgCtx.shadowColor = '#ffbe3b';
    bgCtx.fillStyle = `rgba(255, 170, 50, ${l.alpha})`;
    bgCtx.beginPath();
    bgCtx.roundRect(l.x, l.y, l.size, l.size * 1.3, [3, 3, 5, 5]);
    bgCtx.fill();

    // Inner bright flame core
    bgCtx.fillStyle = `rgba(255, 255, 220, ${l.alpha})`;
    bgCtx.beginPath();
    bgCtx.arc(l.x + l.size / 2, l.y + l.size * 0.9, l.size * 0.25, 0, Math.PI * 2);
    bgCtx.fill();
    bgCtx.restore();

    if (l.y < -50) lanterns.splice(i, 1);
  }

  requestAnimationFrame(animateBg);
}
animateBg();

// --- FIREWORKS CANVAS ENGINE ---
const fwCanvas = document.getElementById('fireworks-canvas');
const fwCtx = fwCanvas.getContext('2d');
let particles = [];
let fireworkActive = false;

function resizeFwCanvas() {
  fwCanvas.width = window.innerWidth;
  fwCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFwCanvas);
resizeFwCanvas();

function triggerExplosion(x, y, count = 40) {
  const colors = ['#ff3377', '#ffbe3b', '#00f2fe', '#a855f7', '#ffffff', '#ffd700'];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.02 + 0.015,
      size: Math.random() * 3 + 2
    });
  }
}

function animateFireworks() {
  fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08; // gravity
    p.alpha -= p.decay;

    fwCtx.beginPath();
    fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fwCtx.fillStyle = p.color;
    fwCtx.globalAlpha = Math.max(0, p.alpha);
    fwCtx.shadowBlur = 8;
    fwCtx.shadowColor = p.color;
    fwCtx.fill();
    fwCtx.globalAlpha = 1;

    if (p.alpha <= 0) particles.splice(i, 1);
  }
  requestAnimationFrame(animateFireworks);
}
animateFireworks();

function blastConfetti() {
  sound.playFanfare();
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      triggerExplosion(
        Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1,
        Math.random() * (window.innerHeight * 0.5) + window.innerHeight * 0.1,
        50
      );
    }, i * 250);
  }
}

// --- SCREEN NAVIGATION CONTROLLER ---
function showScreen(screenId) {
  document.querySelectorAll('.level-screen').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Sound Button Toggle
const soundBtn = document.getElementById('sound-toggle');
const soundIcon = document.getElementById('sound-icon');
soundBtn.addEventListener('click', () => {
  const isMuted = sound.toggleMute();
  soundIcon.textContent = isMuted ? '🔇' : '🔊';
});

// START QUEST BUTTON
document.getElementById('btn-start').addEventListener('click', () => {
  sound.init();
  sound.startAmbientChimes();
  sound.playPop();
  showScreen('screen-level-1');
});

// ==========================================
// LEVEL 1: SUGAR RUSH REFLEX MINI-GAME
// ==========================================
let gameScore = 0;
let gameTimeLeft = 15;
let gameInterval = null;
let spawnInterval = null;
const gameBoard = document.getElementById('game-board');
const scoreEl = document.getElementById('game-score');
const timerEl = document.getElementById('game-timer');
const overlayEl = document.getElementById('game-start-overlay');
const reward1El = document.getElementById('reward-1');

document.getElementById('btn-start-game').addEventListener('click', startGame);

function startGame() {
  sound.init();
  gameScore = 0;
  gameTimeLeft = 15;
  scoreEl.textContent = '0';
  timerEl.textContent = '15';
  overlayEl.classList.add('hidden');
  reward1El.classList.add('hidden');

  // Clear previous items
  gameBoard.querySelectorAll('.falling-item').forEach(el => el.remove());

  // Timer loop
  gameInterval = setInterval(() => {
    gameTimeLeft--;
    timerEl.textContent = gameTimeLeft;
    if (gameTimeLeft <= 0) {
      endGame(false);
    }
  }, 1000);

  // Spawn loop
  spawnInterval = setInterval(spawnTreat, 550);
}

function spawnTreat() {
  if (gameScore >= 10) return;
  const treats = ['🎂', '🧁', '🍦', '🍫', '🎁', '🍓', '📚'];
  const itemChar = treats[Math.floor(Math.random() * treats.length)];
  const isBook = itemChar === '📚';

  const item = document.createElement('div');
  item.className = 'falling-item';
  item.textContent = itemChar;
  item.style.left = `${Math.random() * 80 + 5}%`;
  item.style.animationDuration = `${Math.random() * 1.2 + 1.8}s`;

  item.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (isBook) {
      sound.playRoast();
      gameScore = Math.max(0, gameScore - 1);
      item.textContent = '💨';
    } else {
      sound.playCatch();
      gameScore++;
      triggerExplosion(e.clientX, e.clientY, 15);
      item.textContent = '✨';
    }
    scoreEl.textContent = gameScore;
    setTimeout(() => item.remove(), 100);

    if (gameScore >= 10) {
      endGame(true);
    }
  });

  gameBoard.appendChild(item);

  // Auto remove after animation
  setTimeout(() => {
    if (item.parentNode) item.remove();
  }, 3000);
}

function endGame(won) {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  gameBoard.querySelectorAll('.falling-item').forEach(el => el.remove());

  if (won) {
    blastConfetti();
    reward1El.classList.remove('hidden');
  } else {
    sound.playRoast();
    overlayEl.classList.remove('hidden');
    overlayEl.querySelector('button').textContent = 'SO CLOSE! TAP TO RETRY 🔄';
  }
}

document.getElementById('btn-next-2').addEventListener('click', () => {
  sound.playPop();
  showScreen('screen-level-2');
});

// ==========================================
// LEVEL 2: AURA & VIBE SCANNER
// ==========================================
const scanBtn = document.getElementById('scan-touch-btn');
const scanProgress = document.getElementById('scan-progress');
const scanContainer = document.querySelector('.scanner-photo-wrap');
const scanPrompt = document.getElementById('scan-prompt-text');
const scanResults = document.getElementById('scan-results');
let scanTimer = null;
let scanPercent = 0;

function startScanning(e) {
  e.preventDefault();
  sound.init();
  scanContainer.classList.add('scanning');
  scanBtn.classList.add('active');
  scanPrompt.textContent = 'SCANNING DAMRU FREQUENCIES... 📡';

  scanTimer = setInterval(() => {
    scanPercent += 4;
    scanProgress.style.width = `${scanPercent}%`;
    sound.playTone(300 + scanPercent * 6, 'sine', 0.08, 0.05);

    if (scanPercent >= 100) {
      clearInterval(scanTimer);
      finishScan();
    }
  }, 70);
}

function stopScanning() {
  if (scanPercent < 100) {
    clearInterval(scanTimer);
    scanPercent = 0;
    scanProgress.style.width = '0%';
    scanContainer.classList.remove('scanning');
    scanBtn.classList.remove('active');
    scanPrompt.textContent = 'PRESS & HOLD TO SCAN ✨';
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
  sound.playPop();
  showScreen('screen-level-3');
});

// ==========================================
// LEVEL 3: POLAROID VAULT
// ==========================================
const cards = document.querySelectorAll('.polaroid-card');
const vaultUnlocked = document.getElementById('vault-unlocked');
let flippedCards = new Set();

cards.forEach(card => {
  card.addEventListener('click', () => {
    sound.playPop();
    card.classList.toggle('flipped');
    const id = card.getAttribute('data-card');
    flippedCards.add(id);

    if (flippedCards.size >= 3) {
      setTimeout(() => {
        if (vaultUnlocked.classList.contains('hidden')) {
          blastConfetti();
          vaultUnlocked.classList.remove('hidden');
        }
      }, 500);
    }
  });
});

document.getElementById('btn-next-4').addEventListener('click', () => {
  sound.playPop();
  showScreen('screen-level-4');
});

// ==========================================
// LEVEL 4: THE WISH SANCTUARY & CANDLE
// ==========================================
const candle = document.querySelector('.candle');
const blowBtn = document.getElementById('btn-blow-candle');
const wishSuccess = document.getElementById('wish-success');
let wishMade = false;

function blowOutCandle() {
  if (wishMade) return;
  wishMade = true;

  sound.playBlowWind();
  candle.classList.add('blown');
  blowBtn.disabled = true;
  blowBtn.textContent = '✨ WISH GRANTED & SEALED! ✨';

  // Release sky lanterns into night sky
  for (let i = 0; i < 20; i++) {
    setTimeout(spawnLantern, i * 140);
  }

  setTimeout(() => {
    blastConfetti();
    wishSuccess.classList.remove('hidden');
  }, 1000);
}

blowBtn.addEventListener('click', blowOutCandle);
candle.addEventListener('click', blowOutCandle);

document.getElementById('btn-next-5').addEventListener('click', () => {
  sound.playPop();
  showScreen('screen-level-5');
  startGrandFinale();
});

// ==========================================
// LEVEL 5: GRAND FINALE & HINGLISH SHAYARI
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
  // Continuous celebration fireworks
  blastConfetti();
  setInterval(() => {
    if (document.getElementById('screen-level-5').classList.contains('active')) {
      triggerExplosion(
        Math.random() * window.innerWidth,
        Math.random() * (window.innerHeight * 0.4) + 60,
        35
      );
    }
  }, 1800);

  // Typewriter effect for Shayari
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
        setTimeout(typeLine, 28);
      } else {
        lineIdx++;
        charIdx = 0;
        setTimeout(typeLine, 220);
      }
    }
  }
  typeLine();

  // Prefill WhatsApp Share Message
  const shareMsg = encodeURIComponent(
    "Bhai thank you so much! Ye birthday quest aur Golden VIP pass bhot mast tha 🥹❤️🥁 Best surprise ever!"
  );
  document.getElementById('btn-whatsapp-share').href = `https://api.whatsapp.com/send?text=${shareMsg}`;
}

// Screenshot Hint
document.getElementById('btn-screenshot-hint').addEventListener('click', () => {
  alert('📸 Tip: Take a screenshot of your screen right now to save your official Golden VIP Pass and show it to Bhai whenever you want to redeem your perks!');
});

// Restart Quest
document.getElementById('btn-restart').addEventListener('click', () => {
  sound.playPop();
  showScreen('screen-intro');
});
