/**
 * ==========================================
 * THE BINUS-BEAT ENGINE (Restored)
 * ==========================================
 */
const MusicEngine = {
    ctx: null, masterGain: null, isPlaying: false,
    nextNoteTime: 0.0, step: 0, tempo: 110.0,
    lookahead: 25.0, scheduleAheadTime: 0.1, timerID: null, bassNote: 36,

    init() {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.value = -10; compressor.knee.value = 40; compressor.ratio.value = 12;
        this.masterGain.connect(compressor); compressor.connect(this.ctx.destination);
    },
    toggle() {
        if (this.isPlaying) this.stop(); else this.start();
        return this.isPlaying;
    },
    start() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.isPlaying = true;
        this.step = 0;
        this.nextNoteTime = this.ctx.currentTime;
        this.scheduler();
    },
    stop() {
        this.isPlaying = false;
        window.clearTimeout(this.timerID);
    },
    scheduler() {
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.step, this.nextNoteTime);
            this.nextStep();
        }
        this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    },
    nextStep() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat;
        this.step = (this.step + 1) % 16;
    },
    scheduleNote(step, time) {
        if (step % 4 === 0) {
            this.triggerKick(time);
            setTimeout(() => pulseScreen(), Math.max(0, (time - this.ctx.currentTime) * 1000));
        }
        if (step === 4 || step === 12) this.triggerSnare(time);
        if (step % 2 === 0) this.triggerHat(time, step % 4 === 0 ? 0.05 : 0.1);
        if (step % 4 !== 0) this.triggerBass(time, this.bassNote);
        if ([0, 3, 6, 9, 12, 15].includes(step)) {
            let note = this.bassNote + 24;
            if (step === 3 || step === 9) note += 3;
            if (step === 12) note += 7;
            this.triggerArp(time, note);
        }
    },
    // --- SYNTHS ---
    triggerKick(time) {
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.masterGain);
        osc.frequency.setValueAtTime(150, time); osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(1.0, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.start(time); osc.stop(time + 0.5);
    },
    triggerSnare(time) {
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 1000;
        const gain = this.ctx.createGain();
        noise.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
        gain.gain.setValueAtTime(0.4, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        noise.start(time);
    },
    triggerHat(time, vol) {
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 5000;
        const gain = this.ctx.createGain();
        noise.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
        gain.gain.setValueAtTime(vol * 0.5, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        noise.start(time);
    },
    triggerBass(time, freq) {
        const osc = this.ctx.createOscillator(); const filter = this.ctx.createBiquadFilter(); const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const f = 440 * Math.pow(2, (freq - 69) / 12); osc.frequency.value = f;
        filter.type = 'lowpass'; filter.frequency.setValueAtTime(200, time);
        filter.frequency.linearRampToValueAtTime(800, time + 0.1); filter.frequency.linearRampToValueAtTime(200, time + 0.2);
        gain.gain.setValueAtTime(0.3, time); gain.gain.linearRampToValueAtTime(0, time + 0.2);
        osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
        osc.start(time); osc.stop(time + 0.2);
    },
    triggerArp(time, freq) {
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        const delay = this.ctx.createDelay(); const feedback = this.ctx.createGain();
        delay.delayTime.value = 0.25; feedback.gain.value = 0.3;
        osc.type = 'square';
        const f = 440 * Math.pow(2, (freq - 69) / 12); osc.frequency.value = f;
        gain.gain.setValueAtTime(0.05, time); gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        osc.connect(gain); gain.connect(this.masterGain);
        gain.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(this.masterGain);
        osc.start(time); osc.stop(time + 0.3);
    },
    playSFX(type) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.masterGain);
        if (type === 'hover') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(1000, t); osc.frequency.linearRampToValueAtTime(2000, t + 0.05);
            gain.gain.setValueAtTime(0.05, t); gain.gain.linearRampToValueAtTime(0, t + 0.05);
            osc.start(t); osc.stop(t + 0.05);
        } else if (type === 'click') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, t); osc.frequency.exponentialRampToValueAtTime(10, t + 0.1);
            gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.start(t); osc.stop(t + 0.1);
        }
    }
};

/**
 * ------------------------------------------------------------------
 * VISUALS & PHYSICS ENGINE (Canvas)
 * ------------------------------------------------------------------
 */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
const fpsDisplay = document.getElementById('fps-counter');
const coordDisplay = document.getElementById('coord-display');
const panel = document.querySelector('.panel');

let width, height;
let particles = [];
let mouse = { x: -1000, y: -1000 };
let beatScale = 1.0;

const PARTICLE_COUNT = 100;
const CONNECT_DISTANCE = 150;
const MOUSE_REPULSION = 150;

class Particle {
    constructor() {
        this.x = Math.random() * width; this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.5; this.vy = (Math.random() - 0.5) * 1.5;
        this.size = Math.random() * 3 + 2; // Increased size (2px to 5px)
        // Updated Colors for BINUS Theme (Red, Orange, White)
        const rand = Math.random();
        if (rand < 0.5) this.color = '#ff3333';        // Red
        else if (rand < 0.8) this.color = '#ff9900';   // Orange
        else this.color = '#ffffff';                  // White
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        const dx = this.x - mouse.x; const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPULSION) {
            const force = (MOUSE_REPULSION - dist) / MOUSE_REPULSION;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 5; this.y += Math.sin(angle) * force * 5;
        }
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
        ctx.shadowBlur = 10; ctx.shadowColor = this.color; // Add Glow
        ctx.fillStyle = this.color; ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
}

function resize() {
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width; canvas.height = height;
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
}
window.addEventListener('resize', resize);
resize();

function pulseScreen() { beatScale = 1.05; }

function animate() {
    beatScale += (1.0 - beatScale) * 0.1;
    canvas.style.transform = `scale(${beatScale})`;
    // Panel Pulse
    const currentTransform = panel.style.transform || 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    if (currentTransform.includes('scale')) {
        panel.style.transform = currentTransform.replace(/scale\([0-9.]+\)/, `scale(${1 + (beatScale - 1) * 0.5})`);
    } else {
        panel.style.transform = currentTransform + ` scale(${1 + (beatScale - 1) * 0.5})`;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1.5; // Thicker lines
    for (let i = 0; i < particles.length; i++) {
        let p1 = particles[i]; p1.update();
        for (let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j];
            let dx = p1.x - p2.x; let dy = p1.y - p2.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECT_DISTANCE) {
                let alpha = 1 - (dist / CONNECT_DISTANCE);
                ctx.strokeStyle = `rgba(255, 80, 80, ${alpha})`; // Visible Red connections
                ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            }
        }
        p1.draw();
    }
    requestAnimationFrame(animate);
}
animate();

// --- EVENTS ---
const initScreen = document.getElementById('init-screen');
const muteToggle = document.getElementById('mute-toggle');
const gameBtns = document.querySelectorAll('.game-btn');

initScreen.addEventListener('click', () => {
    initScreen.style.opacity = '0';
    setTimeout(() => initScreen.style.display = 'none', 500);
    MusicEngine.start();
});

muteToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isPlaying = MusicEngine.toggle();
    muteToggle.classList.toggle('active');
    muteToggle.innerText = isPlaying ? "AUDIO: ON" : "AUDIO: OFF";
    MusicEngine.playSFX('click');
});

// 3D Tilt Effect
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    coordDisplay.innerText = `${mouse.x.toString().padStart(3, '0')}:${mouse.y.toString().padStart(3, '0')}`; // Coordinate Tracker

    const x = (window.innerWidth / 2 - e.pageX) / 25;
    const y = (window.innerHeight / 2 - e.pageY) / 25;
    if (!panel.style.transform.includes('scale')) {
        panel.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
    } else {
        // Preserve Beat Pulse Scale if active
        const scalePart = panel.style.transform.match(/scale\([0-9.]+\)/);
        panel.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) ${scalePart ? scalePart[0] : ''}`;
    }
});

gameBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => MusicEngine.playSFX('hover'));
    btn.addEventListener('click', () => MusicEngine.playSFX('click'));
});
