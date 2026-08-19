/* ===== PARTICLE SYSTEM ===== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: -500, y: -500 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
        this.baseY = this.y;
        this.angle = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.02 + 0.005;
        this.wobbleRange = Math.random() * 30 + 10;
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = -(Math.random() * 0.3 + 0.05);
        this.opacity = Math.random() * 0.5 + 0.1;
        this.baseY = this.y;
        this.angle = Math.random() * Math.PI * 2;
    }
    update() {
        this.angle += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.angle) * 0.3;
        this.y += this.speedY;

        if (this.y < -10) { this.y = canvas.height + 10; this.x = Math.random() * canvas.width; }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
            const force = (180 - dist) / 180;
            this.x -= dx * force * 0.035;
            this.y -= dy * force * 0.035;
            this.size = Math.min(this.size + force * 0.1, 3.5);
            this.opacity = Math.min(this.opacity + force * 0.1, 0.7);
        } else {
            this.size += (((Math.random() * 2 + 0.3) - this.size) * 0.01);
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(124,108,240,${this.opacity})`);
        gradient.addColorStop(1, `rgba(0,229,200,${this.opacity * 0.3})`);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

const particleCount = Math.min(100, Math.floor(window.innerWidth / 14));
for (let i = 0; i < particleCount; i++) particles.push(new Particle());

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
                const alpha = 0.08 * (1 - dist / 140);
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(124,108,240,${alpha})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }
        }
        // Connect to mouse if close
        const mdx = mouse.x - particles[i].x;
        const mdy = mouse.y - particles[i].y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 200) {
            const alpha = 0.12 * (1 - mdist / 200);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(0,229,200,${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ===== CURSOR GLOW ===== */
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

/* ===== CARD SPOTLIGHT (mouse-follow glow inside cards) ===== */
document.querySelectorAll('.glass-card').forEach(card => {
    const spot = document.createElement('div');
    spot.classList.add('card-spotlight');
    card.appendChild(spot);
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        spot.style.left = (e.clientX - rect.left) + 'px';
        spot.style.top = (e.clientY - rect.top) + 'px';
    });
});

/* ===== 3D TILT ON CARDS ===== */
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
});

/* ===== TYPEWRITER ===== */
const titles = [
    "Software Developer",
    "AI/ML Engineer",
    "Python & Django Developer",
    "Full-Stack Developer",
    "Java & Spring Boot Developer"
];
let tIdx = 0, cIdx = 0, deleting = false;
const twEl = document.getElementById('typewriter');

function typewrite() {
    const cur = titles[tIdx];
    twEl.textContent = cur.substring(0, cIdx);
    if (!deleting) {
        cIdx++;
        if (cIdx > cur.length) { deleting = true; setTimeout(typewrite, 1800); return; }
    } else {
        cIdx--;
        if (cIdx === 0) { deleting = false; tIdx = (tIdx + 1) % titles.length; }
    }
    setTimeout(typewrite, deleting ? 35 : 70);
}
typewrite();

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ===== ACTIVE NAV LINK ===== */
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(sec => {
        const top = sec.offsetTop;
        const id = sec.getAttribute('id');
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (link) link.classList.toggle('active', scrollY >= top && scrollY < top + sec.offsetHeight);
    });
});

/* ===== MOBILE NAV ===== */
document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'));
});

/* ===== METRIC COUNTER ===== */
const metricObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.target);
        const isFloat = el.dataset.float === 'true';
        const dur = 1800;
        const start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            el.textContent = isFloat ? (target * ease).toFixed(2) : Math.round(target * ease);
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        metricObserver.unobserve(el);
    });
}, { threshold: 0.5 });

document.querySelectorAll('.metric-value').forEach(el => metricObserver.observe(el));

/* ===== SKILL BAR + CHIP ANIMATION ===== */
const skillBarObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('.skill-bar-item').forEach((item, i) => {
            setTimeout(() => {
                const w = item.dataset.width;
                item.querySelector('.skill-bar-fill').style.width = w + '%';
            }, i * 150);
        });
        skillBarObserver.unobserve(e.target);
    });
}, { threshold: 0.25 });

document.querySelectorAll('.skill-bar-list').forEach(el => skillBarObserver.observe(el));

const chipObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('.skill-chip').forEach(c => c.classList.add('visible'));
        chipObserver.unobserve(e.target);
    });
}, { threshold: 0.2 });

document.querySelectorAll('.skill-chip-wrap').forEach(el => chipObserver.observe(el));

/* ===== CONTACT FORM (Formspree) ===== */
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button');
    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    try {
        const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
            btn.innerHTML = '<span>Message Sent! ✓</span>';
            btn.style.background = 'linear-gradient(135deg,#00e5c8,#00b894)';
            form.reset();
        } else {
            btn.innerHTML = '<span>Failed — try again</span>';
            btn.style.background = 'linear-gradient(135deg,#e74c3c,#c0392b)';
        }
    } catch {
        btn.innerHTML = '<span>Failed — try again</span>';
        btn.style.background = 'linear-gradient(135deg,#e74c3c,#c0392b)';
    }

    setTimeout(() => {
        btn.innerHTML = '<span>Send Message</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
        btn.style.background = '';
        btn.disabled = false;
    }, 3000);
});

/* ===== PARALLAX ORBS + ANTI-GRAVITY ===== */
const floatIcons = document.querySelectorAll('.float-icon');
const geoShapes = document.querySelectorAll('.geo-shape');

window.addEventListener('scroll', () => {
    const y = window.scrollY;
    document.querySelectorAll('.hero-orb').forEach((orb, i) => {
        const speed = [0.03, -0.02, 0.015][i] || 0.02;
        orb.style.transform = `translateY(${y * speed}px)`;
    });

    floatIcons.forEach((icon, i) => {
        const speed = ((i % 5) + 1) * 0.04;
        const dir = i % 2 === 0 ? 1 : -1;
        icon.style.marginTop = `${y * speed * dir * -1}px`;
    });

    geoShapes.forEach((shape, i) => {
        const speed = ((i % 3) + 1) * 0.025;
        shape.style.marginTop = `${y * speed * -1}px`;
    });
});

/* ===== ANTI-GRAVITY: MOUSE REPEL ON FLOAT ICONS ===== */
document.addEventListener('mousemove', (e) => {
    floatIcons.forEach(icon => {
        const rect = icon.getBoundingClientRect();
        const ix = rect.left + rect.width / 2;
        const iy = rect.top + rect.height / 2;
        const dx = e.clientX - ix;
        const dy = e.clientY - iy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            const force = (200 - dist) / 200;
            const moveX = -dx * force * 0.4;
            const moveY = -dy * force * 0.4;
            icon.style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + force * 0.3})`;
            icon.style.opacity = 0.05 + force * 0.25;
            icon.style.filter = `grayscale(${1 - force})`;
        }
    });
});

/* ===== MAGNETIC BUTTONS ===== */
document.querySelectorAll('.btn-glow, .btn-glass').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });
});

/* ===== SMOOTH SECTION TRANSITIONS ===== */
const sectionBgObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
        }
    });
}, { threshold: 0.05 });

document.querySelectorAll('.section').forEach(s => {
    s.style.transition = 'opacity .6s ease';
    sectionBgObserver.observe(s);
});

/* ===== NAVBAR SCROLL EFFECT ===== */
let lastScrollY = 0;
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 100) {
        navbar.style.background = 'rgba(6,6,14,.92)';
        navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,.3)';
    } else {
        navbar.style.background = 'rgba(6,6,14,.75)';
        navbar.style.boxShadow = 'none';
    }
    lastScrollY = y;
});
