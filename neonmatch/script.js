// --- DATA ---
// Questions translated to Indonesian and expanded to 8 items
const questions = [
    {
        text: "Apa yang paling kamu nikmati saat waktu luang?",
        options: [
            { text: "Mengutak-atik kode atau memecahkan teka-teki logika", scores: { "Informatika": 3, "Sistem Informasi": 1 } },
            { text: "Menggambar, desain grafis, atau fotografi", scores: { "DKV": 3 } },
            { text: "Curhat atau mengamati perilaku orang lain", scores: { "Psikologi": 3, "Management": 1 } },
            { text: "Mengatur keuangan atau merencanakan jadwal liburan", scores: { "Akuntansi": 3, "Management": 2 } }
        ]
    },
    {
        text: "Jika kamu harus membuat sebuah proyek, apa yang akan kamu buat?",
        options: [
            { text: "Aplikasi mobile atau game canggih", scores: { "Informatika": 3, "DKV": 1 } },
            { text: "Rencana bisnis startup yang inovatif", scores: { "Management": 3, "Sistem Informasi": 2 } },
            { text: "Laporan audit keuangan yang detail", scores: { "Akuntansi": 3 } },
            { text: "Program sosial atau konseling komunitas", scores: { "Psikologi": 3 } }
        ]
    },
    {
        text: "Pelajaran apa yang paling membuatmu bersemangat di sekolah?",
        options: [
            { text: "Matematika, Fisika, atau Komputer", scores: { "Informatika": 3, "Akuntansi": 2 } },
            { text: "Seni Budaya, Keterampilan, atau Bahasa", scores: { "DKV": 3 } },
            { text: "Sosiologi, Biologi, atau Sejarah", scores: { "Psikologi": 3 } },
            { text: "Ekonomi, Kewirausahaan, atau PKn", scores: { "Management": 3, "Sistem Informasi": 1 } }
        ]
    },
    {
        text: "Bagaimana cara andalanmu dalam menyelesaikan masalah?",
        options: [
            { text: "Analisis data dan cari letak kesalahan logisnya", scores: { "Informatika": 3, "Sistem Informasi": 2, "Akuntansi": 1 } },
            { text: "Visualisasikan solusi dengan sketsa atau diagram", scores: { "DKV": 3 } },
            { text: "Diskusi dari hati ke hati untuk paham sumber masalah", scores: { "Psikologi": 3, "Management": 1 } },
            { text: "Buat strategi, delegasikan tugas, dan eksekusi", scores: { "Management": 3, "Sistem Informasi": 2 } }
        ]
    },
    {
        text: "Apa peranmu biasanya dalam kerja kelompok?",
        options: [
            { text: "Si Teknis: Yang ngerjain bagian rumit di belakang layar", scores: { "Informatika": 3, "Akuntansi": 2 } },
            { text: "Si Kreatif: Yang bikin tampilan presentasi jadi estetik", scores: { "DKV": 3 } },
            { text: "Si Penengah: Menjaga mood dan komunikasi tim", scores: { "Psikologi": 3 } },
            { text: "Si Leader: Yang mengatur deadline dan pembagian tugas", scores: { "Management": 3, "Sistem Informasi": 2 } }
        ]
    },
    {
        text: "Lingkungan kerja seperti apa yang kamu impikan?",
        options: [
            { text: "Startup teknologi fast-paced dengan banyak layar", scores: { "Informatika": 3, "Sistem Informasi": 2 } },
            { text: "Studio seni yang bebas, penuh warna, dan musik", scores: { "DKV": 3 } },
            { text: "Ruang konsultasi yang tenang dan privat", scores: { "Psikologi": 3, "Akuntansi": 1 } },
            { text: "Kantor korporat modern di gedung tinggi", scores: { "Management": 3, "Akuntansi": 2, "Sistem Informasi": 1 } }
        ]
    },
    {
        text: "Apa pendapatmu tentang teknologi?",
        options: [
            { text: "Saya ingin tahu cara kerjanya dan membuatnya (Coding/AI)", scores: { "Informatika": 3 } },
            { text: "Teknologi adalah alat untuk berkarya seni (Multimedia)", scores: { "DKV": 3 } },
            { text: "Teknologi harus membantu efisiensi bisnis (Sistem)", scores: { "Sistem Informasi": 3, "Management": 1 } },
            { text: "Teknologi memudahkan interaksi antar manusia (Sosial)", scores: { "Psikologi": 2, "Management": 1 } }
        ]
    },
    {
        text: "Karir impianmu di masa depan adalah...",
        options: [
            { text: "Software Engineer, Hacker, atau AI Developer", scores: { "Informatika": 3 } },
            { text: "Creative Director, Illustrator, atau Animator", scores: { "DKV": 3 } },
            { text: "Psikolog, HR Manager, atau Konselor", scores: { "Psikologi": 3 } },
            { text: "CEO, Business Analyst, atau Akuntan Publik", scores: { "Management": 2, "Akuntansi": 3, "Sistem Informasi": 2 } }
        ]
    }
];

const results = {
    "Informatika": {
        faculty: "FAKULTAS TEKNOLOGI KREATIF",
        desc: "Kamu adalah pemikir logis yang suka membangun solusi dengan kode. Dunia algoritma, AI, dan pengembangan software adalah tempat bermainmu yang sesungguhnya."
    },
    "Sistem Informasi": {
        faculty: "FAKULTAS TEKNOLOGI KREATIF",
        desc: "Kamu adalah jembatan antara bisnis dan teknologi. Kamu mengerti bagaimana menggunakan sistem IT untuk memecahkan masalah organisasi dan meningkatkan efisiensi."
    },
    "Desain Komunikasi Visual": {
        faculty: "FAKULTAS TEKNOLOGI KREATIF",
        desc: "Kamu adalah kreator visioner. Kamu punya bakat untuk mengkomunikasikan ide kompleks melalui visual, branding, dan ekspresi artistik yang memukau."
    },
    "Psikologi": {
        faculty: "FAKULTAS HUMANIORA",
        desc: "Kamu memiliki empati tinggi dan ketertarikan mendalam pada perilaku manusia. Kamu termotivasi untuk memahami, membantu, dan mengembangkan potensi orang lain."
    },
    "Akuntansi": {
        faculty: "FAKULTAS HUMANIORA",
        desc: "Kamu teliti, analitis, dan jago dengan angka. Kamu adalah penjaga integritas finansial yang memastikan kesehatan bisnis melalui data yang akurat."
    },
    "Management": {
        faculty: "FAKULTAS HUMANIORA",
        desc: "Kamu adalah pemimpin alami. Kamu unggul dalam mengorganisir tim, merencanakan strategi bisnis, dan menggerakkan organisasi menuju kesuksesan."
    }
};

// Normalize keys
const majorKeys = ["Informatika", "Sistem Informasi", "DKV", "Psikologi", "Akuntansi", "Management"];

// State
let currentQuestion = 0;
let scores = {};
majorKeys.forEach(k => scores[k] = 0);

// --- AUDIO ENGINE ---
const AudioSys = {
    ctx: null, gain: null,
    init: function () {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AC();
            this.gain = this.ctx.createGain();
            this.gain.connect(this.ctx.destination);
            this.gain.gain.value = 0.3;
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },
    playClick: function () {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.15);
        g.gain.setValueAtTime(0.1, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(g); g.connect(this.gain);
        osc.start(); osc.stop(this.ctx.currentTime + 0.15);
    },
    playSuccess: function () {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // Simple Arpeggio
        [440, 554, 659].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0.1, now + i * 0.1);
            g.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.3);
            osc.connect(g); g.connect(this.gain);
            osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.3);
        });
    },
    toggleMute: function () {
        if (this.gain) {
            this.gain.gain.value = this.gain.gain.value > 0 ? 0 : 0.3;
            return this.gain.gain.value === 0;
        }
        return false;
    }
};

// --- LOGIC ---
function startQuiz() {
    AudioSys.init();
    AudioSys.playClick();
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    document.getElementById('progress-container').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    const q = questions[currentQuestion];
    document.getElementById('question-text').innerText = q.text;
    document.getElementById('question-counter').innerText = `PERTANYAAN ${currentQuestion + 1}/${questions.length}`;

    // Progress Bar
    const prog = ((currentQuestion) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${prog}%`;

    const opts = document.getElementById('options-container');
    opts.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn fade-in';
        btn.style.animationDelay = `${idx * 0.05}s`;
        btn.innerText = opt.text;
        btn.onclick = () => selectOption(opt.scores);
        opts.appendChild(btn);
    });
}

function selectOption(points) {
    AudioSys.playClick();

    // Add scores
    for (let major in points) {
        if (scores[major] !== undefined) {
            scores[major] += points[major];
        }
    }

    currentQuestion++;
    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    AudioSys.playSuccess();
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('progress-bar').style.width = '100%';

    // Calculate winner
    let maxScore = -1;
    let winner = "Informatika";

    // Add simple randomization for ties to retain interest? 
    // Better to stick to first max found or specific priority.
    // Priority: IF > DKV > SI > MGT > AKT > PSI (Arbitrary tie break)

    for (let major in scores) {
        if (scores[major] > maxScore) {
            maxScore = scores[major];
            winner = major;
        }
    }

    // Map DKV key if needed
    let displayKey = winner;
    if (winner === "DKV") displayKey = "Desain Komunikasi Visual";

    const data = results[displayKey];
    document.getElementById('result-faculty').innerText = data.faculty;
    document.getElementById('result-major').innerText = displayKey;

    // Color coding based on Faculty
    const resultTitle = document.getElementById('result-major');
    if (data.faculty.includes("HUMANIORA")) {
        resultTitle.style.color = "#ff9900"; // Orange for humanities
        resultTitle.style.textShadow = "0 0 40px rgba(255, 153, 0, 0.6)";
    } else {
        resultTitle.style.color = "#00f2ff"; // Cyan for Tech
        resultTitle.style.textShadow = "0 0 40px rgba(0, 242, 255, 0.6)";
    }

    document.getElementById('result-desc').innerText = data.desc;
}

// --- BACKGROUND FX ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            size: Math.random() * 2.5,
            alpha: Math.random() * 0.5 + 0.1,
            color: Math.random() > 0.5 ? '#00f2ff' : '#d000ff'
        });
    }
}

window.addEventListener('resize', resize);
resize();

function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Connections
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 - (dist / 120) * 0.15})`;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}
animate();

// Mute Btn
const muteBtn = document.getElementById('mute-btn');
muteBtn.onclick = () => {
    let isMuted = AudioSys.toggleMute();
    muteBtn.innerText = isMuted ? "AUDIO: OFF" : "AUDIO: ON";
};
