/** * --- AUDIO ENGINE (STRICTLY FROM "ONE") --- */
const AudioSys = {
    ctx: null, masterGain: null, isMuted: false,
    sequencerId: null, currentTheme: 'none', beatCount: 0,
    scales: {
        majorPent: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
        lowSad: [98.00, 110.00, 130.81, 146.83, 174.61]
    },
    init: function () {
        try {
            if (!this.ctx) {
                const AC = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AC();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = 0.4;
                const compressor = this.ctx.createDynamicsCompressor();
                this.masterGain.connect(compressor);
                compressor.connect(this.ctx.destination);
            }
            if (this.ctx.state === 'suspended') this.ctx.resume();
        } catch (e) {}
    },
    playTone: function (freq, type, dur, vol, detune = 0) {
        if (this.isMuted || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, t);
        if (detune !== 0) osc.detune.value = detune;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain); gain.connect(this.masterGain);
        osc.start(t); osc.stop(t + dur + 0.1);
        setTimeout(() => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} }, (dur + 0.2) * 1000);
    },
    playLead: function (freq, dur, volMult = 1.0) {
        this.playTone(freq, 'sawtooth', dur, 0.15 * volMult, -5);
        this.playTone(freq, 'square', dur, 0.15 * volMult, 5);
    },
    playBass: function (freq, dur, volMult = 1.0) {
        this.playTone(freq, 'sawtooth', dur, 0.3 * volMult);
        this.playTone(freq / 2, 'sine', dur, 0.4 * volMult);
    },
    startSequencer: function (theme) {
        if (this.currentTheme === theme) return;
        this.stopSequencer();
        this.currentTheme = theme;
        this.beatCount = 0;
        let tempo = 200;
        if (theme === 'menu') tempo = 150;
        if (theme === 'game') return;
        if (theme === 'gameover') return;
        this.sequencerId = setInterval(() => {
            if (this.ctx && !this.isMuted) this.tick(theme);
        }, tempo);
    },
    stopSequencer: function () {
        if (this.sequencerId) { clearInterval(this.sequencerId); this.sequencerId = null; }
        this.currentTheme = 'none';
    },
    tick: function (theme) {
        const beat = this.beatCount % 16;
        if (theme === 'menu') {
            const scale = this.scales.majorPent;
            const totalBars = 12; // 8 Bar Drop + 4 Intro
            const bar = Math.floor(this.beatCount / 16) % totalBars;
            if (beat % 4 === 0) this.playTone(60, 'sine', 0.2, 0.5);
            if (beat % 2 === 0) this.playTone(2000, 'triangle', 0.05, 0.05);
            if (bar < 4) {
                if (beat === 0) this.playBass(scale[bar % 3] / 2, 2.0);
                if (Math.random() > 0.4) this.playTone(scale[Math.floor(Math.random() * scale.length)] * 2, 'sine', 0.3, 0.2);
            } else {
                if (beat % 2 === 0) this.playBass(scale[0] / 2, 0.2, 1.2);
                if (beat % 4 === 0) {
                    this.playLead(scale[0], 0.6, 0.8); this.playLead(scale[2], 0.6, 0.8); this.playLead(scale[4], 0.6, 0.8);
                }
                this.playLead(scale[beat % 5] * 2, 0.15, 0.6);
            }
        }
        this.beatCount++;
    },
    toggleMute: function () {
        this.isMuted = !this.isMuted;
        if (this.ctx && this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime, 0.1);
        }
        return this.isMuted;
    },
    playSFX: function (type) {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.masterGain);
        switch (type) {
            case 'paddle': osc.type = 'sine'; osc.frequency.setValueAtTime(400, t); osc.frequency.linearRampToValueAtTime(600, t + 0.1); gain.gain.setValueAtTime(0.4, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); osc.start(t); osc.stop(t + 0.1); break;
            case 'brick': osc.type = 'square'; osc.frequency.setValueAtTime(200 + Math.random() * 200, t); gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); osc.start(t); osc.stop(t + 0.1); break;
            case 'wall': osc.type = 'triangle'; osc.frequency.setValueAtTime(100, t); gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); osc.start(t); osc.stop(t + 0.1); break;
            case 'heart': osc.type = 'sine'; osc.frequency.setValueAtTime(500, t); osc.frequency.linearRampToValueAtTime(1200, t + 0.2); gain.gain.setValueAtTime(0.3, t); gain.gain.linearRampToValueAtTime(0, t + 0.3); osc.start(t); osc.stop(t + 0.3); break;
            case 'loss': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, t); osc.frequency.linearRampToValueAtTime(30, t + 0.4); gain.gain.setValueAtTime(0.6, t); gain.gain.linearRampToValueAtTime(0, t + 0.4); osc.start(t); osc.stop(t + 0.4); break;
            case 'gameover': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, t); osc.frequency.linearRampToValueAtTime(50, t + 1.5); gain.gain.setValueAtTime(0.6, t); gain.gain.linearRampToValueAtTime(0, t + 1.5); osc.start(t); osc.stop(t + 1.5); break;
        }
        setTimeout(() => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} }, 2000);
    }
};

/** CONFIG */
const CONFIG = {
    easy: { paddleWidth: 140, baseSpeed: 5, maxSpeed: 8, lives: 5, rows: 4, multiBall: false },
    normal: { paddleWidth: 110, baseSpeed: 7, maxSpeed: 10, lives: 3, rows: 5, multiBall: false },
    hard: { paddleWidth: 80, baseSpeed: 9.5, maxSpeed: 13, lives: 1, rows: 6, multiBall: false },
    sandbox: { paddleWidth: 150, baseSpeed: 8, maxSpeed: 25, lives: 999, rows: 5, multiBall: false, chaos: false }
};
let currentMode = 'normal';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

const ui = document.getElementById('ui');
const uiScore = document.getElementById('score');
const uiLives = document.getElementById('lives');
const uiLevel = document.getElementById('level-num');
const uiBest = document.getElementById('best-score');
const startScreen = document.getElementById('start-screen');
const sandboxMenu = document.getElementById('sandbox-menu');
const pauseMenu = document.getElementById('pause-menu'); // NEW
const msgOverlay = document.getElementById('msg-overlay');
const muteBtn = document.getElementById('mute-btn');
const menuBtn = document.getElementById('menu-btn'); // NEW
const initOverlay = document.getElementById('init-overlay');

const btnNormal = document.getElementById('btn-story');
const btnSandbox = document.getElementById('btn-sandbox');

btnNormal.addEventListener('click', () => {
    currentMode = 'normal';
    startScreen.style.display = 'none';
    startGame('normal');
});

btnSandbox.addEventListener('click', () => {
    startScreen.style.display = 'none';
    sandboxMenu.style.display = 'flex';
    // Init Sandbox Values if needed
});

document.getElementById('btn-close-sb').addEventListener('click', () => {
    sandboxMenu.style.display = 'none';
    startScreen.style.display = 'flex';
});

document.getElementById('btn-launch-sb').addEventListener('click', () => {
    // Capture Values
    CONFIG.sandbox.paddleWidth = parseInt(document.getElementById('sb-width').value);
    CONFIG.sandbox.baseSpeed = parseInt(document.getElementById('sb-speed').value);
    CONFIG.sandbox.rows = parseInt(document.getElementById('sb-rows').value);
    CONFIG.sandbox.chaos = document.getElementById('sb-chaos').checked;
    let initialBalls = parseInt(document.getElementById('sb-count').value);

    startGame('sandbox', initialBalls);
});

// FIX: Menu Button Logic
menuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePause();
});
menuBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePause();
});

let width, height, animationId = null;
let score = 0, highScore = 0;
let lives = 3, level = 1, isPlaying = false, isPaused = false, shakeIntensity = 0; // Added isPaused
let paddle = { x: 0, y: 0, w: 100, h: 15, color: '#0ff' };
let balls = [];
let bricks = [], powerup = null, particles = [], stars = [];
let inputX = 0, keys = { left: false, right: false };

// FIX: Level Transition Flag
let levelTransition = false;

// --- LOCAL STORAGE (FEATURE FROM TWO) ---
function loadData() {
    let best = localStorage.getItem('neonBreaker_best');
    let lvl = localStorage.getItem('neonBreaker_bestLvl'); // Also load level
    if (best) {
        highScore = parseInt(best);
        uiBest.innerText = `${best} (LVL ${lvl || 1})`;
    } else {
        uiBest.innerText = "0 (LVL 1)";
    }

    let sb = localStorage.getItem('neonBreaker_sandbox');
    if (sb) {
        try {
            let s = JSON.parse(sb);
            document.getElementById('sb-width').value = s.w;
            document.getElementById('sb-speed').value = s.s;
            document.getElementById('sb-count').value = s.c;
            document.getElementById('sb-rows').value = s.r;
            document.getElementById('sb-chaos').checked = s.x;
        } catch (e) {}
    }
}

function saveData(newScore, newLevel) {
    let currentBest = parseInt(localStorage.getItem('neonBreaker_best') || 0);
    if (newScore > currentBest) {
        localStorage.setItem('neonBreaker_best', newScore);
        localStorage.setItem('neonBreaker_bestLvl', newLevel);
        uiBest.innerText = `${newScore} (LVL ${newLevel})`;
    }
}

function saveSandbox() {
    let s = {
        w: document.getElementById('sb-width').value,
        s: document.getElementById('sb-speed').value,
        c: document.getElementById('sb-count').value,
        r: document.getElementById('sb-rows').value,
        x: document.getElementById('sb-chaos').checked
    };
    localStorage.setItem('neonBreaker_sandbox', JSON.stringify(s));
}

function resize() {
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width; canvas.height = height;
    paddle.y = height - 60;
    stars = [];
    for (let i = 0; i < 60; i++) stars.push({ x: Math.random() * width, y: Math.random() * height, size: Math.random() * 2, alpha: Math.random() * 0.4 + 0.1 });
    if (paddle.x > width - paddle.w) paddle.x = width - paddle.w;
}
window.addEventListener('resize', resize); resize();

// --- SYSTEM START ---
const startSystem = () => {
    initOverlay.style.display = 'none';
    try { AudioSys.init(); AudioSys.startSequencer('menu'); } catch (e) {}
    startScreen.style.display = 'flex';
    ui.style.display = 'grid'; // Changed to Grid (from Two)
    muteBtn.style.display = 'block';
    loadData(); // Load data on start
};
initOverlay.addEventListener('click', startSystem);
initOverlay.addEventListener('touchstart', (e) => { e.preventDefault(); startSystem(); });

// --- PAUSE LOGIC (FEATURE FROM TWO) ---
const togglePause = () => {
    if (!isPlaying) return;
    isPaused = !isPaused;
    if (isPaused) {
        pauseMenu.style.display = 'flex';
        cancelAnimationFrame(animationId);
        AudioSys.stopSequencer();
    } else {
        pauseMenu.style.display = 'none';
        // In "One", sequencer is disabled during game unless menu, 
        // but we stop it entirely on pause, so no need to restart specific theme 
        // unless we had game music. "One" has silence during gameplay.
        loop();
    }
};
menuBtn.addEventListener('click', togglePause);
menuBtn.addEventListener('touchstart', (e) => { e.preventDefault(); togglePause(); });

document.getElementById('btn-resume').addEventListener('click', togglePause);
document.getElementById('btn-quit').addEventListener('click', () => {
    isPaused = false; isPlaying = false;
    pauseMenu.style.display = 'none'; menuBtn.style.display = 'block';
    startScreen.style.display = 'flex';
    AudioSys.startSequencer('menu');
});

// --- BUTTONS ---
// --- BUTTONS ---
// The specific mode buttons (easy/normal/hard) are handled by btn-story and btn-sandbox logic above.
// Previous attachBtn code was referencing non-existent IDs and causing a crash.

// --- INPUT ---
function updateInput(x) {
    // Store raw input
    inputX = x;
}

window.addEventListener('mousemove', e => updateInput(e.clientX));
window.addEventListener('touchmove', e => {
    if (isPlaying && !isPaused) {
        e.preventDefault();
    }
    updateInput(e.touches[0].clientX);
}, { passive: false });

// Add touchstart for immediate response on tap
window.addEventListener('touchstart', e => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        if (isPlaying && !isPaused) {
            e.preventDefault();
        }
        updateInput(e.touches[0].clientX);
    }
}, { passive: false });

window.addEventListener('keydown', e => { if (e.code === 'ArrowLeft') keys.left = true; if (e.code === 'ArrowRight') keys.right = true; });
window.addEventListener('keyup', e => { if (e.code === 'ArrowLeft') keys.left = false; if (e.code === 'ArrowRight') keys.right = false; });

// --- GENERATION (KEPT FROM ONE) ---
function generateLevel(levelNum) {
    bricks = []; powerup = null;
    const cfg = CONFIG[currentMode];
    const cols = Math.floor(width / (width < 600 ? 50 : 65));
    const rows = cfg.rows;
    const pad = 8;
    const bW = (width - (pad * (cols + 1))) / cols;
    const bH = 22;
    const colors = ['#ff0055', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0099ff', '#9900ff'];
    let possibleSpots = [];

    // ADDED CHAOS LOGIC
    let chaosChance = (currentMode === 'sandbox' && CONFIG.sandbox.chaos) ? 1.0 : (currentMode !== 'sandbox' ? 0.05 : 0);

    // In Sandbox, just simple grid. In Main game, patterns.
    const usePatterns = (currentMode !== 'sandbox' && levelNum > 1);

    if (!usePatterns) {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let bx = pad + c * (bW + pad); let by = 80 + r * (bH + pad);

                // Chaos Check
                let isChaos = Math.random() < chaosChance;

                bricks.push({
                    x: bx, y: by, w: bW, h: bH, active: true,
                    color: isChaos ? '#ffd700' : colors[r % colors.length], // Gold if chaos
                    type: isChaos ? 'chaos' : 'standard'
                });
                possibleSpots.push({ x: bx, y: by });
            }
        }
    } else {
        // Patterns Logic
        const patterns = ['checkers', 'columns', 'pyramid', 'diamond'];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const loopLimit = cols / 2;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < loopLimit; c++) {
                let create = false; const midCol = Math.floor(cols / 2);
                if (pattern === 'checkers' && (r + c) % 2 === 0) create = true;
                else if (pattern === 'columns' && c % 2 === 0) create = true;
                else if (pattern === 'pyramid' && c >= (midCol - r)) create = true;
                else if (pattern === 'diamond' && Math.abs(c - midCol / 2) + Math.abs(r - rows / 2) < rows / 2) create = true;
                if (!create && Math.random() > 0.6) create = true;
                if (create) {
                    let bx = pad + c * (bW + pad); let by = 80 + r * (bH + pad);
                    let isChaos1 = Math.random() < chaosChance;
                    bricks.push({
                        x: bx, y: by, w: bW, h: bH, active: true,
                        color: isChaos1 ? '#ffd700' : colors[r % colors.length],
                        type: isChaos1 ? 'chaos' : 'standard'
                    });
                    possibleSpots.push({ x: bx, y: by });

                    let mc = (cols - 1) - c;
                    if (mc !== c) {
                        let mbx = pad + mc * (bW + pad);
                        let isChaos2 = Math.random() < chaosChance;
                        bricks.push({
                            x: mbx, y: by, w: bW, h: bH, active: true,
                            color: isChaos2 ? '#ffd700' : colors[r % colors.length],
                            type: isChaos2 ? 'chaos' : 'standard'
                        });
                        possibleSpots.push({ x: mbx, y: by });
                    }
                }
            }
        }
    }

    if (levelNum > 1 && possibleSpots.length > 0 && currentMode !== 'sandbox') {
        powerup = { x: width / 2, y: 80 + (rows * bH) + 30, r: 10, active: true };
    }
}

// --- BALL SPAWNING (MODIFIED FROM ONE) ---
function spawnBall(x, y, speedOverride = null, forceDown = false) {
    if (balls.length > 150) return; // Hard Cap for performance
    let spd = speedOverride || CONFIG[currentMode].baseSpeed;

    let angle = -Math.PI / 2 + (Math.random() - 0.5);
    let vy = -Math.abs(Math.sin(angle) * spd); // Default Up
    if (forceDown) vy = Math.abs(vy); // Chaos Brick forces down

    balls.push({
        x: x, y: y, r: 7,
        vx: Math.cos(angle) * spd,
        vy: vy,
        speed: spd,
        active: true
    });
}

function resetGameBalls(count = 1) {
    balls = [];
    let spd = CONFIG[currentMode].baseSpeed;
    for (let i = 0; i < count; i++) {
        // Spawn balls slightly offset
        let bx = width / 2 + (i * 10 - (count * 5));
        balls.push({ x: bx, y: height / 2, r: 7, vx: 0, vy: spd, speed: spd, active: true });
    }
}

function spawnParticles(x, y, color) {
    if (particles.length > 50) particles.shift();
    for (let i = 0; i < 5; i++) particles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 1.0, color: color });
}

function drawHeart(x, y, size) {
    ctx.fillStyle = '#ff0055'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff0055'; ctx.beginPath();
    let topCurveHeight = size * 0.3; ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight); ctx.fill(); ctx.shadowBlur = 0;
}

function startGame(mode, initialBallCount = 1) {
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    AudioSys.stopSequencer();

    currentMode = mode;
    lives = CONFIG[mode].lives;
    paddle.w = CONFIG[mode].paddleWidth;

    // Fix: Center paddle on start
    inputX = width / 2;
    paddle.x = inputX - (paddle.w / 2);
    paddle.y = height - 60; // Ensure Y is set too

    uiLives.innerText = (mode === 'sandbox') ? "∞" : lives;
    score = 0; level = 1;
    uiScore.innerText = 0; uiLevel.innerText = 1;

    startScreen.style.display = 'none';
    sandboxMenu.style.display = 'none';
    menuBtn.style.display = 'block'; // Show menu btn
    isPlaying = true; isPaused = false; levelTransition = false;

    generateLevel(1);
    resetGameBalls(initialBallCount);
    loop();
}

function triggerGameOver() {
    isPlaying = false;
    AudioSys.playSFX('gameover');
    if (currentMode !== 'sandbox') {
        saveData(score, level); // Save data on game over
    }
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    setTimeout(() => {
        document.querySelector('#start-screen h1').innerText = "GAME OVER";
        startScreen.style.display = 'flex';
        setTimeout(() => { if (!isPlaying) AudioSys.startSequencer('menu'); }, 3000);
    }, 1000);
}

function nextLevel() {
    levelTransition = true; // FIX: Flag ON
    level++; uiLevel.innerText = level;
    msgOverlay.innerText = "LEVEL " + level; msgOverlay.style.opacity = 1;

    // Remove active balls to pause
    balls = [];

    setTimeout(() => {
        msgOverlay.style.opacity = 0;
        generateLevel(level);
        // In Sandbox, if Chaos Mode made 100 balls, reset to 1 or keep?
        // Safer to reset to initial config
        let count = (currentMode === 'sandbox') ? parseInt(document.getElementById('sb-count').value) : 1;
        resetGameBalls(count);
        levelTransition = false; // FIX: Flag OFF
    }, 2000);
}

function loop() {
    if (!isPlaying || isPaused) return; // Check Pause
    animationId = requestAnimationFrame(loop);

    // Unified Input Handling
    if (keys.left) inputX -= 10;
    if (keys.right) inputX += 10;

    // Clamp inputX
    if (inputX < paddle.w / 2) inputX = paddle.w / 2;
    if (inputX > width - paddle.w / 2) inputX = width - paddle.w / 2;

    // Apply to paddle
    paddle.x = inputX - (paddle.w / 2);

    let sx = 0, sy = 0;
    if (shakeIntensity > 0) { sx = (Math.random() - 0.5) * shakeIntensity; sy = (Math.random() - 0.5) * shakeIntensity; shakeIntensity *= 0.9; }

    ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, width, height);
    ctx.save(); ctx.translate(sx, sy);

    ctx.fillStyle = '#fff';
    stars.forEach(s => { ctx.globalAlpha = s.alpha; ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;

    let activeBricks = 0;
    bricks.forEach(b => {
        if (!b.active) return;
        activeBricks++;
        ctx.fillStyle = b.color;
        // Chaos Visuals
        ctx.shadowBlur = b.type === 'chaos' ? 15 : 10;
        ctx.shadowColor = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        if (b.type === 'chaos') {
            ctx.fillStyle = '#fff'; ctx.fillRect(b.x + b.w / 2 - 2, b.y + 2, 4, b.h - 4);
        } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(b.x, b.y, b.w, b.h / 2);
        }
    });

    if (powerup && powerup.active) drawHeart(powerup.x, powerup.y - 10, 20);

    if (activeBricks === 0 && isPlaying && balls.length > 0) nextLevel();

    // --- BALL LOOP ---
    for (let i = balls.length - 1; i >= 0; i--) {
        let b = balls[i];
        b.x += b.vx; b.y += b.vy;

        // Walls
        if (b.x < b.r) { b.x = b.r; b.vx *= -1; AudioSys.playSFX('wall'); }
        if (b.x > width - b.r) { b.x = width - b.r; b.vx *= -1; AudioSys.playSFX('wall'); }
        if (b.y < b.r) { b.y = b.r; b.vy *= -1; AudioSys.playSFX('wall'); }

        // Death
        if (b.y > height + 20) {
            balls.splice(i, 1); // Remove ball
            continue;
        }

        // Paddle
        if (b.y + b.r >= paddle.y && b.y - b.r <= paddle.y + paddle.h && b.x >= paddle.x && b.x <= paddle.x + paddle.w) {
            if (b.vy > 0) {
                b.y = paddle.y - b.r;
                let hitVal = (b.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
                b.speed = Math.min(b.speed + 0.05, CONFIG[currentMode].maxSpeed);
                b.vx = hitVal * (b.speed * 0.85);
                let vySq = (b.speed * b.speed) - (b.vx * b.vx);
                b.vy = -Math.sqrt(Math.max(0, vySq));
                if (Math.abs(b.vy) < b.speed * 0.2) {
                    b.vy = -b.speed * 0.4;
                    let remSpeed = Math.sqrt((b.speed * b.speed) - (b.vy * b.vy));
                    b.vx = (b.vx > 0 ? 1 : -1) * remSpeed;
                }
                AudioSys.playSFX('paddle');
            }
        }

        // Powerup
        if (powerup && powerup.active) {
            let dx = b.x - powerup.x; let dy = b.y - powerup.y;
            if (Math.sqrt(dx * dx + dy * dy) < b.r + 15) {
                powerup.active = false; lives++; uiLives.innerText = lives;
                AudioSys.playSFX('heart');
            }
        }

        // Bricks
        for (let j = 0; j < bricks.length; j++) {
            let br = bricks[j];
            if (!br.active) continue;
            if (b.x + b.r > br.x && b.x - b.r < br.x + br.w && b.y + b.r > br.y && b.y - b.r < br.y + br.h) {
                br.active = false; score += 10; uiScore.innerText = score;
                if (score > highScore && currentMode !== 'sandbox') {
                    highScore = score;
                    uiBest.innerText = `${highScore} (LVL ${level})`;
                }

                AudioSys.playSFX('brick');
                spawnParticles(br.x + br.w / 2, br.y + br.h / 2, br.color);
                shakeIntensity = 5;

                // Chaos Mode Spawn (Logic from One)
                if (br.type === 'chaos' || (currentMode === 'sandbox' && CONFIG.sandbox.chaos)) {
                    spawnBall(br.x + br.w / 2, br.y + br.h / 2, b.speed, true);
                }

                let prevX = b.x - b.vx;
                if (prevX + b.r < br.x || prevX - b.r > br.x + br.w) b.vx *= -1; else b.vy *= -1;
                break;
            }
        }
    }

    // --- LIFE CHECK ---
    // FIX: Added !levelTransition check to prevent life loss during level change
    if (balls.length === 0 && !levelTransition) {
        if (currentMode === 'sandbox') {
            // Auto Respawn
            resetGameBalls(1);
        } else {
            lives--; uiLives.innerText = lives; shakeIntensity = 15;
            if (lives <= 0) triggerGameOver();
            else {
                AudioSys.playSFX('loss');
                resetGameBalls(1);
            }
        }
    }

    // Draw Paddle
    ctx.shadowBlur = 15; ctx.shadowColor = '#0ff'; ctx.fillStyle = '#0ff';
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.fillStyle = '#fff'; ctx.fillRect(paddle.x + 5, paddle.y + 2, paddle.w - 10, 4);
    ctx.shadowBlur = 0;

    // Draw Balls
    balls.forEach(b => {
        ctx.shadowBlur = 10; ctx.shadowColor = '#fff'; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    });

    // Draw Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.05;
        ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4); ctx.globalAlpha = 1;
        if (p.life <= 0) particles.splice(i, 1);
    }
    ctx.restore();
}

const muteButtonFn = (e) => {
    e.preventDefault(); e.stopPropagation();
    AudioSys.init();
    const muted = AudioSys.toggleMute();
    muteBtn.classList.toggle('active');
    muteBtn.innerText = muted ? "AUDIO: OFF" : "AUDIO: ON";
};
muteBtn.addEventListener('click', muteButtonFn);
muteBtn.addEventListener('touchstart', muteButtonFn);
