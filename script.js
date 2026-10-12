// --- ADVANCED AUDIO ENGINE (Web Audio API + Melody Synthesizer) ---
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
    this.playTone(587.33, 'triangle', 0.12, 0.25);
    this.vibrate(30);
  }

  playCatch(combo = 1) {
    if (this.muted) return;
    this.init();
    const baseFreq = 440 + combo * 80;
    this.playTone(baseFreq, 'sine', 0.15, 0.2);
    setTimeout(() => this.playTone(baseFreq * 1.25, 'triangle', 0.18, 0.2), 60);
    this.vibrate(40);
  }

  playRoast() {
    this.playTone(160, 'sawtooth', 0.35, 0.25);
    this.vibrate([80, 50, 80]);
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    const melody = [523.25, 659.25, 783.99, 1046.50];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.3, 0.22), i * 110);
    });
    this.vibrate([60, 40, 100]);
  }

  playHappyBirthdayChime() {
    if (this.muted) return;
    this.init();
    // G4 G4 A4 G4 C5 B4
    const notes = [
      { f: 392, d: 250 }, { f: 392, d: 250 }, { f: 440, d: 400 },
      { f: 392, d: 400 }, { f: 523, d: 400 }, { f: 493.88, d: 700 }
    ];
    let offset = 0;
    notes.forEach(n => {
      setTimeout(() => this.playTone(n.f, 'triangle', n.d / 1000, 0.25), offset);
      offset += n.d + 50;
    });
  }

  playBlowWind() {
    if (this.muted) return;
    this.init();
    try {
      const bufferSize = this.ctx.sampleRate * 1.6;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 1.4);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.4);
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
      [329.63, 440, 554.37],
      [293.66, 369.99, 440],
      [392.00, 493.88, 587.33],
      [440.00, 554.37, 659.25]
    ];
    let chordIdx = 0;
    this.bgInterval = setInterval(() => {
      if (!this.muted && this.ctx) {
        const chord = chords[chordIdx % chords.length];
        chord.forEach((freq, i) => {
          setTimeout(() => this.playTone(freq, 'sine', 2.0, 0.025), i * 160);
        });
        chordIdx++;
      }
    }, 3400);
  }

  vibrate(pattern) {
    if (navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }
}

const sound = new SoundEngine();

// --- BACKGROUND COSMIC CANVAS (Stars & Glowing Floating Sky Lanterns) ---
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
let stars = [];
let lanterns = [];
let shootingStars = [];

function resizeBgCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeBgCanvas);
resizeBgCanvas();

for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 2.2 + 0.6,
    alpha: Math.random(),
    speed: Math.random() * 0.02 + 0.005
  });
}

function spawnShootingStar() {
  shootingStars.push({
    x: Math.random() * window.innerWidth * 0.8,
    y: Math.random() * window.innerHeight * 0.3,
    length: Math.random() * 80 + 50,
    speed: Math.random() * 10 + 12,
    angle: Math.PI / 4,
    alpha: 1
  });
}
setInterval(spawnShootingStar, 4000);

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

  // Stars
  stars.forEach(s => {
    s.alpha += s.speed;
    if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
    bgCtx.beginPath();
    bgCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
    bgCtx.fill();
  });

  // Shooting Stars
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const ss = shootingStars[i];
    ss.x += Math.cos(ss.angle) * ss.speed;
    ss.y += Math.sin(ss.angle) * ss.speed;
    ss.alpha -= 0.025;

    bgCtx.save();
    bgCtx.strokeStyle = `rgba(255, 230, 150, ${ss.alpha})`;
    bgCtx.lineWidth = 2;
    bgCtx.beginPath();
    bgCtx.moveTo(ss.x, ss.y);
    bgCtx.lineTo(ss.x - Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length);
    bgCtx.stroke();
    bgCtx.restore();

    if (ss.alpha <= 0) shootingStars.splice(i, 1);
  }

  // Floating Lanterns
  for (let i = lanterns.length - 1; i >= 0; i--) {
    const l = lanterns[i];
    l.y -= l.speedY;
    l.x += Math.sin(l.y * 0.02) * 0.7;

    bgCtx.save();
    bgCtx.shadowBlur = 22;
    bgCtx.shadowColor = '#ffbe3b';
    bgCtx.fillStyle = `rgba(255, 175, 45, ${l.alpha})`;
    bgCtx.beginPath();
    bgCtx.roundRect(l.x, l.y, l.size, l.size * 1.35, [4, 4, 6, 6]);
    bgCtx.fill();

    // Glow center
    bgCtx.fillStyle = `rgba(255, 255, 220, ${l.alpha})`;
    bgCtx.beginPath();
    bgCtx.arc(l.x + l.size / 2, l.y + l.size * 0.85, l.size * 0.26, 0, Math.PI * 2);
    bgCtx.fill();
    bgCtx.restore();

    if (l.y < -60) lanterns.splice(i, 1);
  }

  requestAnimationFrame(animateBg);
}
animateBg();

// --- FIREWORKS CANVAS ENGINE ---
const fwCanvas = document.getElementById('fireworks-canvas');
const fwCtx = fwCanvas.getContext('2d');
let particles = [];

function resizeFwCanvas() {
  fwCanvas.width = window.innerWidth;
  fwCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFwCanvas);
resizeFwCanvas();

function triggerExplosion(x, y, count = 45) {
  const colors = ['#ff2a85', '#ffbe3b', '#00f2fe', '#a855f7', '#ffffff', '#ffd700'];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 7 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.02 + 0.015,
      size: Math.random() * 3.2 + 2
    });
  }
}

function animateFireworks() {
  fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.09;
    p.alpha -= p.decay;

    fwCtx.beginPath();
    fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fwCtx.fillStyle = p.color;
    fwCtx.globalAlpha = Math.max(0, p.alpha);
    fwCtx.shadowBlur = 10;
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
  flashScreen();
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      triggerExplosion(
        Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1,
        Math.random() * (window.innerHeight * 0.5) + window.innerHeight * 0.1,
        50
      );
    }, i * 220);
  }
}

function flashScreen() {
  const flash = document.getElementById('flash-overlay');
  flash.style.opacity = '0.4';
  setTimeout(() => { flash.style.opacity = '0'; }, 150);
}

// --- SCREEN NAVIGATION CONTROLLER ---
const levelIndicator = document.getElementById('level-indicator');

function showScreen(screenId, levelNum = 0) {
  document.querySelectorAll('.level-screen').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    levelIndicator.textContent = `LVL ${levelNum}/5`;
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
  showScreen('screen-level-1', 1);
});

// ==========================================
// LEVEL 1: SUGAR RUSH REFLEX ARCADE
// ==========================================
let gameScore = 0;
let comboMultiplier = 1;
let gameTimeLeft = 15;
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
  sound.init();
  gameScore = 0;
  comboMultiplier = 1;
  gameTimeLeft = 15;
  scoreEl.textContent = '0';
  comboEl.textContent = 'x1';
  timerEl.textContent = '15';
  overlayEl.classList.add('hidden');
  reward1El.classList.add('hidden');

  gameBoard.querySelectorAll('.falling-item').forEach(el => el.remove());

  gameInterval = setInterval(() => {
    gameTimeLeft--;
    timerEl.textContent = gameTimeLeft;
    if (gameTimeLeft <= 0) endGame(false);
  }, 1000);

  spawnInterval = setInterval(spawnTreat, 500);
}

function spawnTreat() {
  if (gameScore >= 10) return;
  const treats = ['🎂', '🧁', '🍦', '🍫', '🎁', '🍓', '🩴', '📚'];
  const itemChar = treats[Math.floor(Math.random() * treats.length)];
  const isRoast = itemChar === '🩴' || itemChar === '📚';

  const item = document.createElement('div');
  item.className = 'falling-item';
  item.textContent = itemChar;
  item.style.left = `${Math.random() * 80 + 5}%`;
  item.style.animationDuration = `${Math.random() * 1.1 + 1.6}s`;

  item.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (isRoast) {
      sound.playRoast();
      comboMultiplier = 1;
      comboEl.textContent = 'x1';
      gameScore = Math.max(0, gameScore - 1);
      item.textContent = '💥';
    } else {
      sound.playCatch(comboMultiplier);
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

    if (gameScore >= 10) endGame(true);
  });

  gameBoard.appendChild(item);
  setTimeout(() => { if (item.parentNode) item.remove(); }, 2800);
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
  showScreen('screen-level-2', 2);
});

// ==========================================
// LEVEL 2: QUANTUM BIOMETRIC AURA SCANNER
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
  sound.init();
  scanContainer.classList.add('scanning');
  scanBtn.classList.add('active');
  scanPrompt.textContent = 'ANALYZING CELESTIAL FREQUENCIES... 📡';

  scanTimer = setInterval(() => {
    scanPercent += 3.5;
    scanProgress.style.width = `${scanPercent}%`;
    sound.playTone(320 + scanPercent * 8, 'sine', 0.08, 0.06);
    sound.vibrate(20);

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
  sound.playPop();
  showScreen('screen-level-3', 3);
});

// ==========================================
// LEVEL 3: SIBLING LIE DETECTOR & TRUTH TEST
// ==========================================
let currentQuizStep = 1;

window.handleQuizAnswer = function(questionNum, answer) {
  sound.init();
  const feedbackEl = document.getElementById(`quiz-feedback-${questionNum}`);
  
  if (questionNum === 1) {
    sound.playCatch(2);
    feedbackEl.textContent = "LIE DETECTOR: 100% FACT! Bhai waited for 3 hours! 😂";
    feedbackEl.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('quiz-step-1').classList.add('hidden');
      document.getElementById('quiz-step-2').classList.remove('hidden');
      currentQuizStep = 2;
    }, 1200);
  } else if (questionNum === 2) {
    sound.playCatch(3);
    feedbackEl.textContent = "TRUTH VERIFIED: Household enters ceasefire when Damru sleeps! 😴🕊️";
    feedbackEl.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('quiz-step-2').classList.add('hidden');
      document.getElementById('quiz-step-3').classList.remove('hidden');
      currentQuizStep = 3;
    }, 1200);
  } else if (questionNum === 3) {
    blastConfetti();
    feedbackEl.textContent = "CORRECT! Damru is the world's most loved sister! ❤️✨";
    feedbackEl.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('quiz-step-3').classList.add('hidden');
      document.getElementById('vault-unlocked').classList.remove('hidden');
    }, 1300);
  }
};

document.getElementById('btn-next-4').addEventListener('click', () => {
  sound.playPop();
  showScreen('screen-level-4', 4);
});

// ==========================================
// LEVEL 4: 3D WISH SANCTUARY & CANDLE
// ==========================================
const candle = document.getElementById('interactive-candle');
const blowBtn = document.getElementById('btn-blow-candle');
const blowBtnText = document.getElementById('blow-btn-text');
const wishSuccess = document.getElementById('wish-success');
let wishMade = false;

// Attempt Microphone Blow Detection
let micStream = null;
let audioContext = null;
let analyser = null;

async function setupMicDetection() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(micStream);
    source.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function checkBlow() {
      if (wishMade) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      let avg = sum / bufferLength;

      // Blow sound causes broad high average noise
      if (avg > 65) {
        blowOutCandle();
        if (micStream) micStream.getTracks().forEach(t => t.stop());
      } else {
        requestAnimationFrame(checkBlow);
      }
    }
    checkBlow();
  } catch (err) {
    // Mic permission denied or unsupported - button fallback works seamlessly
    console.log('Mic fallback active');
  }
}

function blowOutCandle() {
  if (wishMade) return;
  wishMade = true;

  sound.playBlowWind();
  candle.classList.add('blown');
  blowBtn.disabled = true;
  blowBtnText.textContent = '✨ WISH RECORDED & SEALED! ✨';

  // Play Happy Birthday chime
  setTimeout(() => {
    sound.playHappyBirthdayChime();
  }, 400);

  // Release sky lanterns into night sky
  for (let i = 0; i < 25; i++) {
    setTimeout(() => spawnLantern('🏮'), i * 120);
  }

  setTimeout(() => {
    blastConfetti();
    wishSuccess.classList.remove('hidden');
  }, 1200);
}

blowBtn.addEventListener('click', () => {
  sound.init();
  blowOutCandle();
});
candle.addEventListener('click', () => {
  sound.init();
  blowOutCandle();
});

// Setup mic when reaching Level 4
document.getElementById('btn-next-4').addEventListener('click', () => {
  setTimeout(setupMicDetection, 1000);
});

document.getElementById('btn-next-5').addEventListener('click', () => {
  sound.playPop();
  showScreen('screen-level-5', 5);
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
  blastConfetti();
  
  // Continuous celebratory fireworks & lanterns
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
        setTimeout(typeLine, 26);
      } else {
        lineIdx++;
        charIdx = 0;
        setTimeout(typeLine, 240);
      }
    }
  }
  typeLine();

  // Prefill WhatsApp Share Message
  const shareMsg = encodeURIComponent(
    "Bhai thank you so much! Ye birthday surprise aur Golden VIP pass bhot zyada mast tha 🥹❤️🥁 Best birthday ever!"
  );
  document.getElementById('btn-whatsapp-share').href = `https://api.whatsapp.com/send?text=${shareMsg}`;
}

// Secret Envelope Toggle
const envelopeToggle = document.getElementById('envelope-toggle');
const envelopeContent = document.getElementById('envelope-content');
const envelopeArrow = document.getElementById('envelope-arrow');

envelopeToggle.addEventListener('click', () => {
  sound.playPop();
  envelopeContent.classList.toggle('hidden');
  envelopeArrow.textContent = envelopeContent.classList.contains('hidden') ? '▼' : '▲';
});

// Screenshot Hint
document.getElementById('btn-screenshot-hint').addEventListener('click', () => {
  alert('📸 Tip: Take a screenshot of your screen right now to save your official Golden VIP Pass and show it to Bhai whenever you want to redeem your perks!');
});

// Restart Quest
document.getElementById('btn-restart').addEventListener('click', () => {
  sound.playPop();
  showScreen('screen-intro', 0);
});
