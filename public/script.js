/* ════════════════════════════════════════════════════
   DEBTIRTHO PORTFOLIO — script.js
   Sections:
   1. Scroll Progress
   2. Background Particle Canvas
   3. Globe Canvas
   4. Terminal Typer
   5. Custom Cursor
   6. Magnetic Buttons
   7. Navigation (scroll + mobile)
   8. Reveal on Scroll (AOS-lite)
   9. Counter Animation
   10. Skill Tooltip
   11. Tilt Cards
   12. Contact Form
   13. Chat Widget
════════════════════════════════════════════════════ */

/* ════════════════════
   1. SCROLL PROGRESS
════════════════════ */
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    if (progressBar) progressBar.style.width = pct + '%';
}, { passive: true });

/* ════════════════════════════
   2. BACKGROUND PARTICLE CANVAS
════════════════════════════ */
(function() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x  = Math.random() * W;
            this.y  = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.25;
            this.vy = (Math.random() - 0.5) * 0.25;
            this.a  = Math.random() * 0.4 + 0.05;
            this.r  = Math.random() * 1.2 + 0.4;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,255,200,${this.a})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 90; i++) particles.push(new Particle());

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 110) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,255,200,${0.07 * (1 - d / 110)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
        requestAnimationFrame(animate);
    }
    animate();
})();

/* ════════════════════
   3. GLOBE CANVAS
════════════════════ */
(function() {
    const canvas = document.getElementById('globe-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 220, H = 220;
    canvas.width = W; canvas.height = H;

    const R = 80;          // sphere radius
    const CX = W / 2, CY = H / 2;
    let angle = 0;

    // Generate dots on a sphere surface
    const dots = [];
    const TOTAL = 240;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < TOTAL; i++) {
        const theta = Math.acos(1 - 2 * (i + 0.5) / TOTAL);
        const phi   = 2 * Math.PI * i / goldenRatio;
        dots.push({ theta, phi });
    }

    function project(theta, phi, rotation) {
        const x = R * Math.sin(theta) * Math.cos(phi + rotation);
        const y = R * Math.cos(theta);
        const z = R * Math.sin(theta) * Math.sin(phi + rotation);
        return { x: CX + x, y: CY - y, z };
    }

    // Latitude/longitude lines
    const latLines = [];
    for (let lat = -60; lat <= 60; lat += 30) {
        const points = [];
        const latRad = (lat * Math.PI) / 180;
        for (let lon = 0; lon <= 360; lon += 5) {
            const lonRad = (lon * Math.PI) / 180;
            points.push({ theta: Math.PI / 2 - latRad, phi: lonRad });
        }
        latLines.push(points);
    }
    const lonLines = [];
    for (let lon = 0; lon < 360; lon += 30) {
        const points = [];
        const lonRad = (lon * Math.PI) / 180;
        for (let lat = -90; lat <= 90; lat += 5) {
            const latRad = (lat * Math.PI) / 180;
            points.push({ theta: Math.PI / 2 - latRad, phi: lonRad });
        }
        lonLines.push(points);
    }

    function drawFrame() {
        ctx.clearRect(0, 0, W, H);

        // Draw grid lines
        [...latLines, ...lonLines].forEach(line => {
            ctx.beginPath();
            let first = true;
            line.forEach(p => {
                const { x, y, z } = project(p.theta, p.phi, angle);
                if (z > -R * 0.2) {
                    const alpha = 0.03 + 0.1 * ((z + R) / (2 * R));
                    ctx.strokeStyle = `rgba(0,255,200,${alpha})`;
                    if (first) { ctx.moveTo(x, y); first = false; }
                    else ctx.lineTo(x, y);
                } else { first = true; }
            });
            ctx.lineWidth = 0.5;
            ctx.stroke();
        });

        // Draw dots
        const projected = dots.map(d => ({ ...project(d.theta, d.phi, angle) }));
        projected.sort((a, b) => a.z - b.z);
        projected.forEach(({ x, y, z }) => {
            const visibility = (z + R) / (2 * R);
            const size  = 0.8 + 1.8 * visibility;
            const alpha = 0.1 + 0.7 * visibility;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            if (z > 0) {
                ctx.fillStyle = `rgba(0,255,200,${alpha})`;
                ctx.shadowBlur  = 4;
                ctx.shadowColor = 'rgba(0,255,200,0.5)';
            } else {
                ctx.fillStyle   = `rgba(100,200,180,${alpha * 0.3})`;
                ctx.shadowBlur  = 0;
            }
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        angle += 0.003;
        requestAnimationFrame(drawFrame);
    }
    drawFrame();
})();

/* ════════════════════
   4. TERMINAL TYPER
════════════════════ */
(function() {
    const body = document.getElementById('termBody');
    if (!body) return;

    const lines = [
        { text: '<span style="color:#7b2fff">~</span> <span style="color:#00ffc8">whoami</span>', delay: 400 },
        { text: '<span style="color:#c8d6f0">debtirtho — dev &amp; security</span>', delay: 600 },
        { text: '', delay: 300 },
        { text: '<span style="color:#7b2fff">~</span> <span style="color:#00ffc8">cat skills.txt</span>', delay: 800 },
        { text: '<span style="color:#8a9abf">Python · Node.js · MongoDB</span>', delay: 500 },
        { text: '<span style="color:#8a9abf">C/C++ · SQL · Linux · SecOps</span>', delay: 400 },
        { text: '', delay: 300 },
        { text: '<span style="color:#7b2fff">~</span> <span style="color:#00ffc8">echo $STATUS</span>', delay: 600 },
        { text: '<span style="color:#00ffc8">✓ Available for opportunities</span>', delay: 400 },
        { text: '<span style="color:#4a5a7a">▮</span>', delay: 200, cursor: true },
    ];

    let totalDelay = 0;
    lines.forEach(({ text, delay, cursor }) => {
        totalDelay += delay;
        setTimeout(() => {
            const line = document.createElement('div');
            line.innerHTML = text + (cursor ? '' : '');
            if (cursor) line.style.animation = 'blink 1.1s step-end infinite';
            body.appendChild(line);
            body.scrollTop = body.scrollHeight;
        }, totalDelay);
    });
})();

/* ════════════════════
   5. CUSTOM CURSOR
════════════════════ */
(function() {
    const dot  = document.getElementById('dot');
    const ring = document.getElementById('ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
    }, { passive: true });

    (function animateRing() {
        rx += (mx - rx) * 0.10;
        ry += (my - ry) * 0.10;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(animateRing);
    })();
})();

/* ════════════════════
   6. MAGNETIC BUTTONS
════════════════════ */
document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const strength = 0.3;
        this.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });
    el.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

/* ═══════════════════════════════
   7. NAVIGATION — scroll + mobile
═══════════════════════════════ */
const nav         = document.getElementById('nav');
const menuToggle  = document.getElementById('menuToggle');
const navLinks    = document.getElementById('navLinks');

// Scroll state
window.addEventListener('scroll', () => {
    if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }
}, { passive: true });

// Mobile toggle
if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        menuToggle.classList.toggle('open', open);
        menuToggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuToggle.classList.remove('open');
        });
    });
}

// Active nav link on scroll
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navAnchors.forEach(a => a.classList.remove('active'));
            const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
            if (active) active.classList.add('active');
        }
    });
}, { threshold: 0.4 });
sections.forEach(s => sectionObserver.observe(s));

/* ═══════════════════════════════
   8. REVEAL ON SCROLL (AOS-lite)
═══════════════════════════════ */
// Section reveals
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.08 });
revealEls.forEach(el => revealObs.observe(el));

// Hero data-aos
(function() {
    const aosEls = document.querySelectorAll('[data-aos]');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.aosDelay || 0, 10);
                setTimeout(() => entry.target.classList.add('aos-in'), delay);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    aosEls.forEach(el => obs.observe(el));
})();

/* ═════════════════════
   9. COUNTER ANIMATION
═════════════════════ */
(function() {
    const counters = document.querySelectorAll('.stat-num');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el  = entry.target;
            const end = parseInt(el.dataset.count, 10);
            const dur = 1800;
            const start = performance.now();
            function step(now) {
                const p = Math.min((now - start) / dur, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.floor(ease * end);
                if (p < 1) requestAnimationFrame(step);
                else el.textContent = end;
            }
            requestAnimationFrame(step);
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
})();

/* ══════════════════
   10. SKILL TOOLTIP
══════════════════ */
(function() {
    const tooltip = document.getElementById('skillDetail');
    if (!tooltip) return;
    const sdName = tooltip.querySelector('.sd-name');
    const sdFill = tooltip.querySelector('.sd-fill');
    const sdPct  = tooltip.querySelector('.sd-pct');

    document.querySelectorAll('.hex-item').forEach(item => {
        item.addEventListener('mouseenter', e => {
            const skill = item.dataset.skill;
            const lvl   = item.dataset.level;
            sdName.textContent = skill;
            sdPct.textContent  = lvl + '%';
            tooltip.classList.add('show');
            // Animate bar after show
            setTimeout(() => { sdFill.style.width = lvl + '%'; }, 10);
        });
        item.addEventListener('mousemove', e => {
            tooltip.style.left = (e.clientX + 16) + 'px';
            tooltip.style.top  = (e.clientY - 10) + 'px';
        });
        item.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
            sdFill.style.width = '0%';
        });
    });
})();

/* ═══════════════
   11. TILT CARDS
═══════════════ */
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        const intensity = 6;
        this.style.transform = `perspective(800px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateY(-6px)`;

        // Move glow spotlight
        const glow = this.querySelector('.pc-glow, .more-glow');
        if (glow) {
            const px = ((e.clientX - rect.left) / rect.width)  * 100;
            const py = ((e.clientY - rect.top)  / rect.height) * 100;
            glow.style.setProperty('--mx', px + '%');
            glow.style.setProperty('--my', py + '%');
        }
    });
    card.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

/* ═══════════════════
   12. CONTACT FORM
═══════════════════ */
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        const btn  = contactForm.querySelector('.btn-send');
        const text = btn.querySelector('.btn-text');
        const data = Object.fromEntries(new FormData(contactForm));

        text.textContent = 'Sending...';
        btn.disabled = true;

        try {
            const res = await fetch('/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                text.textContent = 'Message Sent ✓';
                formStatus.textContent = '// Message delivered. Talk soon!';
                formStatus.className = 'form-status ok';
                contactForm.reset();
            } else { throw new Error('Server error'); }
        } catch {
            text.textContent = 'Error — Retry';
            formStatus.textContent = '// Error sending. Try emailing directly.';
            formStatus.className = 'form-status err';
        }

        setTimeout(() => {
            text.textContent = 'Send Message';
            btn.disabled = false;
            if (formStatus) { formStatus.textContent = ''; formStatus.className = 'form-status'; }
        }, 4000);
    });
}

/* ═════════════════
   13. CHAT WIDGET
═════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('vf-toggle');
    if (!toggleBtn) return;
    let open = false;

    function buildChat() {
        const box = document.createElement('div');
        box.id = 'dev-chat-box';
        Object.assign(box.style, {
            position: 'fixed', bottom: '96px', right: '28px',
            width: '320px', maxHeight: '420px',
            background: 'rgba(8,13,24,0.95)',
            border: '1px solid rgba(0,255,200,0.25)',
            borderRadius: '8px', display: 'flex', flexDirection: 'column',
            overflow: 'hidden', zIndex: '9999',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(0,255,200,0.1)',
            backdropFilter: 'blur(20px)',
            fontFamily: "'JetBrains Mono', monospace",
            animation: 'fadeIn 0.3s ease',
        });
        box.innerHTML = `
            <div style="background:rgba(0,255,200,0.08);border-bottom:1px solid rgba(0,255,200,0.15);padding:12px 16px;display:flex;align-items:center;gap:10px;">
                <span style="width:8px;height:8px;background:#00ffc8;border-radius:50%;box-shadow:0 0 8px #00ffc8;animation:pulse 2s infinite;flex-shrink:0;"></span>
                <span style="flex:1;font-size:0.75rem;color:#c8d6f0;letter-spacing:1px;">Terminal Chat</span>
                <button id="chat-close" style="background:none;border:none;color:#4a5a7a;cursor:pointer;font-size:1rem;line-height:1;padding:0;">✕</button>
            </div>
            <div id="chat-msgs" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(0,255,200,0.2) transparent;">
                <div style="align-self:flex-start;background:rgba(0,255,200,0.06);border:1px solid rgba(0,255,200,0.15);padding:8px 12px;border-radius:4px;max-width:85%;font-size:0.78rem;color:#c8d6f0;line-height:1.6;"><strong style="color:#00ffc8;">Bot:</strong> Systems online. How can I assist you?</div>
            </div>
            <div style="display:flex;border-top:1px solid rgba(0,255,200,0.1);">
                <input id="chat-input" placeholder="Type a message..." autocomplete="off"
                    style="flex:1;padding:10px 14px;border:none;outline:none;background:rgba(0,0,0,0.4);color:#c8d6f0;font-family:inherit;font-size:0.78rem;"/>
                <button id="chat-send" style="background:rgba(0,255,200,0.1);border:none;border-left:1px solid rgba(0,255,200,0.15);color:#00ffc8;padding:0 14px;cursor:pointer;font-size:0.75rem;letter-spacing:1px;transition:background 0.2s;">→</button>
            </div>
        `;
        document.body.appendChild(box);

        const msgs  = box.querySelector('#chat-msgs');
        const input = box.querySelector('#chat-input');
        const send  = box.querySelector('#chat-send');
        const close = box.querySelector('#chat-close');

        close.addEventListener('click', () => {
            box.style.display = 'none';
            open = false;
            toggleBtn.querySelector('.vf-icon').textContent = '💬';
        });

        async function sendMsg() {
            const msg = input.value.trim();
            if (!msg) return;
            msgs.innerHTML += `<div style="align-self:flex-end;background:rgba(0,255,200,0.12);border:1px solid rgba(0,255,200,0.25);padding:8px 12px;border-radius:4px;max-width:85%;font-size:0.78rem;color:#c8d6f0;line-height:1.6;"><strong style="color:#00ffc8;">You:</strong> ${msg}</div>`;
            input.value = '';
            msgs.scrollTop = msgs.scrollHeight;

            try {
                const res  = await fetch('/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg }) });
                const data = await res.json();
                const reply = data.reply || JSON.stringify(data);
                msgs.innerHTML += `<div style="align-self:flex-start;background:rgba(0,255,200,0.06);border:1px solid rgba(0,255,200,0.15);padding:8px 12px;border-radius:4px;max-width:85%;font-size:0.78rem;color:#c8d6f0;line-height:1.6;"><strong style="color:#00ffc8;">Bot:</strong> ${reply}</div>`;
            } catch (err) {
                msgs.innerHTML += `<div style="align-self:flex-start;color:#ff3d6e;font-size:0.75rem;padding:6px 12px;">Connection error: ${err.message}</div>`;
            }
            msgs.scrollTop = msgs.scrollHeight;
        }

        send.addEventListener('click', sendMsg);
        input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(); });
    }

    toggleBtn.addEventListener('click', () => {
        let box = document.getElementById('dev-chat-box');
        if (!box) { buildChat(); open = true; }
        else {
            open = !open;
            box.style.display = open ? 'flex' : 'none';
        }
        toggleBtn.querySelector('.vf-icon').textContent = open ? '✕' : '💬';
    });
});