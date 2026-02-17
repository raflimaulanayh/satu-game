/**
 * AUDIO ENGINE (Procedural Sound Generation)
 */
const AudioSys = {
    ctx: null,
    masterGain: null,
    bgmOsc1: null,
    bgmOsc2: null,
    bgmGain: null,
    isMuted: false,

    init: function () {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.4;
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },

    toggleMute: function () {
        this.isMuted = !this.isMuted;
        if (this.ctx) {
            this.isMuted ? this.masterGain.disconnect() : this.masterGain.connect(this.ctx.destination);
        }
        return this.isMuted;
    },

    startBGM: function () {
        if (!this.ctx || this.bgmOsc1) return;
        this.bgmOsc1 = this.ctx.createOscillator();
        this.bgmOsc2 = this.ctx.createOscillator();
        this.bgmGain = this.ctx.createGain();
        this.bgmOsc1.type = 'triangle';
        this.bgmOsc1.frequency.value = 45;
        this.bgmOsc2.type = 'sawtooth';
        this.bgmOsc2.frequency.value = 46;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 250;
        this.bgmOsc1.connect(this.bgmGain);
        this.bgmOsc2.connect(this.bgmGain);
        this.bgmGain.connect(filter);
        filter.connect(this.masterGain);
        this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.bgmGain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 2);
        this.bgmOsc1.start();
        this.bgmOsc2.start();
    },

    stopBGM: function () {
        if (this.bgmOsc1) {
            try {
                const t = this.ctx.currentTime;
                this.bgmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                this.bgmOsc1.stop(t + 0.5);
                this.bgmOsc2.stop(t + 0.5);
            } catch (e) {}
            this.bgmOsc1 = null;
        }
    },

    playSFX: function (type) {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        if (type === 'catch') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, t);
            osc.frequency.exponentialRampToValueAtTime(1760, t + 0.1);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.start(t);
            osc.stop(t + 0.3);
        }
        else if (type === 'damage') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.start(t);
            osc.stop(t + 0.2);
        }
        else if (type === 'gameover') {
            this.stopBGM();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(10, t + 0.8);
            gain.gain.setValueAtTime(0.5, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.8);
            osc.start(t);
            osc.stop(t + 0.8);
        }
    }
};

/**
 * GAME CONFIGURATION
 */
const CONFIG = {
    easy: { basketWidth: 100, gravity: 3, spawnRate: 60, lives: 5 }, // EASY ADDED
    normal: { basketWidth: 90, gravity: 4, spawnRate: 50, lives: 3 },
    hard: { basketWidth: 65, gravity: 7, spawnRate: 35, lives: 1 }
};
let currentMode = 'normal';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const uiScore = document.getElementById('score');
const uiLives = document.getElementById('lives-box');
const uiBest = document.getElementById('high-score');
const uiMenuBest = document.getElementById('menu-highscore');
const startScreen = document.getElementById('start-screen');
const titleText = document.querySelector('#start-screen h1');
const damageOverlay = document.getElementById('damage-overlay');
const muteBtn = document.getElementById('mute-btn');

// State Variables
let width, height;
let score = 0;
let lives = 3;
let highScore = localStorage.getItem('neonCatcher_best') || 0;
let isPlaying = false;
let animationId;
let spawnTimer = 0;
let shakeIntensity = 0;
let lastOrbX = 0;

// Inputs
let keys = { left: false, right: false };
let mouseActive = false;

// Game Objects
let player = { x: 0, y: 0, w: 0, h: 15, color: '#0ff', speed: 12 };
let orbs = [];
let particles = [];
let stars = [];

// --- SETUP & UTILS ---
uiBest.innerText = highScore;
uiMenuBest.innerText = highScore;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    player.y = height - 80;
    lastOrbX = width / 2;

    // Regenerate stars
    stars = [];
    for (let i = 0; i < 60; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            alpha: Math.random() * 0.5 + 0.1,
            speed: Math.random() * 0.5 + 0.2
        });
    }
}
window.addEventListener('resize', resize);
resize();

// Mute Toggle
muteBtn.addEventListener('click', () => {
    AudioSys.init();
    const muted = AudioSys.toggleMute();
    muteBtn.classList.toggle('active');
    muteBtn.innerText = muted ? "AUDIO: OFF" : "AUDIO: ON";
});

// --- INPUT HANDLING ---

// 1. Mouse/Touch (Instant)
function handlePointer(x) {
    if (!isPlaying) return;
    mouseActive = true;
    player.x = x - (player.w / 2);
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > width) player.x = width - player.w;
}

canvas.addEventListener('touchmove', e => { e.preventDefault(); handlePointer(e.touches[0].clientX); }, { passive: false });
canvas.addEventListener('mousemove', e => handlePointer(e.clientX));

// 2. Keyboard (Smooth)
window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft') { keys.left = true; mouseActive = false; }
    if (e.code === 'ArrowRight') { keys.right = true; mouseActive = false; }
});
window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
});

// --- CLASSES ---
class Orb {
    constructor() {
        this.r = Math.random() * 5 + 8;

        // Fairness Algorithm
        const maxTravel = width * 0.7;
        let minX = lastOrbX - maxTravel;
        let maxX = lastOrbX + maxTravel;

        if (minX < this.r) minX = this.r;
        if (maxX > width - this.r) maxX = width - this.r;

        this.x = Math.random() * (maxX - minX) + minX;

        if (this.x < this.r) this.x = this.r;
        if (this.x > width - this.r) this.x = width - this.r;

        lastOrbX = this.x;

        this.y = -20;
        const settings = CONFIG[currentMode];
        this.speed = Math.random() * 2 + settings.gravity + (score / 150);
        this.color = `hsl(${Math.random() * 60 + 280}, 100%, 60%)`;
        this.trail = [];
    }
    update() {
        this.y += this.speed;
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();
    }
    draw() {
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            for (let t of this.trail) ctx.lineTo(t.x, t.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.color = color;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.05;
    }
    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.globalAlpha = 1;
    }
}

// --- GAME ENGINE ---
function startGame(mode) {
    AudioSys.init();
    AudioSys.startBGM();

    currentMode = mode;
    lives = CONFIG[mode].lives;
    player.w = CONFIG[mode].basketWidth;
    player.x = width / 2 - player.w / 2;
    lastOrbX = width / 2;

    score = 0;
    uiScore.innerText = "0";
    updateLivesUI();

    orbs = [];
    particles = [];
    spawnTimer = 0;
    isPlaying = true;
    startScreen.style.display = 'none';

    loop();
}

function updateLivesUI() {
    let hearts = "";
    for (let i = 0; i < lives; i++) hearts += "❤";
    uiLives.innerText = hearts;
}

function takeDamage() {
    lives--;
    updateLivesUI();
    AudioSys.playSFX('damage');
    shakeIntensity = 15;

    damageOverlay.style.opacity = 0.6;
    setTimeout(() => damageOverlay.style.opacity = 0, 100);

    if (lives <= 0) {
        gameOver();
    }
}

function gameOver() {
    isPlaying = false;
    AudioSys.playSFX('gameover');
    shakeIntensity = 20;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neonCatcher_best', highScore);
        uiBest.innerText = highScore;
        uiMenuBest.innerText = highScore;
    }

    setTimeout(() => {
        titleText.innerText = "GAME OVER";
        startScreen.style.display = 'flex';
    }, 1000);
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function loop() {
    if (!isPlaying && shakeIntensity <= 0.1) return;
    requestAnimationFrame(loop);

    // Keyboard Movement
    if (!mouseActive && isPlaying) {
        if (keys.left) player.x -= player.speed;
        if (keys.right) player.x += player.speed;
        if (player.x < 0) player.x = 0;
        if (player.x + player.w > width) player.x = width - player.w;
    }

    // Screen Shake
    let shakeX = 0, shakeY = 0;
    if (shakeIntensity > 0) {
        shakeX = (Math.random() - 0.5) * shakeIntensity;
        shakeY = (Math.random() - 0.5) * shakeIntensity;
        shakeIntensity *= 0.9;
    }

    // Draw BG
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Draw Stars
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    stars.forEach(s => {
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (isPlaying) {
        let safeToSpawn = true;
        if (orbs.length > 0 && orbs[orbs.length - 1].y < 60) safeToSpawn = false;

        spawnTimer++;
        let currentSpawnRate = CONFIG[currentMode].spawnRate - Math.min(20, Math.floor(score / 10));

        if (spawnTimer > currentSpawnRate && safeToSpawn) {
            orbs.push(new Orb());
            spawnTimer = 0;
        }

        for (let i = orbs.length - 1; i >= 0; i--) {
            let o = orbs[i];
            o.update();
            o.draw();

            if (o.y + o.r >= player.y && o.y - o.r <= player.y + player.h &&
                o.x >= player.x && o.x <= player.x + player.w) {
                score++;
                uiScore.innerText = score;
                createExplosion(o.x, o.y, o.color);
                AudioSys.playSFX('catch');
                orbs.splice(i, 1);
                continue;
            }

            if (o.y - o.r > height) {
                orbs.splice(i, 1);
                takeDamage();
            }
        }

        // Draw Player
        ctx.shadowBlur = 20;
        ctx.shadowColor = player.color;
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.fillRect(player.x, player.y - 10, 4, 10);
        ctx.fillRect(player.x + player.w - 4, player.y - 10, 4, 10);
        ctx.shadowBlur = 0;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0) particles.splice(i, 1);
    }

    ctx.restore();
}

// Listeners
document.getElementById('btn-easy').addEventListener('click', () => startGame('easy'));
document.getElementById('btn-normal').addEventListener('click', () => startGame('normal'));
document.getElementById('btn-hard').addEventListener('click', () => startGame('hard'));
