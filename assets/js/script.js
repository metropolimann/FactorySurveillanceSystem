(() => {
  'use strict';

  const canvas = document.getElementById('space');
  const ctx = canvas.getContext('2d', { alpha: false });

  const TAU = Math.PI * 2;
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, DPR = 1;
  let stars = [], shooters = [];
  let shooterTimer = 2.5;
  let last = performance.now();
  let time = 0;

  const mouse = { x: 0, y: 0, cx: 0, cy: 0 };
  const rand = (a, b) => a + Math.random() * (b - a);

  function makeSprite(rgb) {
    const S = 64;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grd.addColorStop(0.00, 'rgba(255,255,255,1)');
    grd.addColorStop(0.12, `rgba(${rgb},0.95)`);
    grd.addColorStop(0.35, `rgba(${rgb},0.26)`);
    grd.addColorStop(0.70, `rgba(${rgb},0.06)`);
    grd.addColorStop(1.00, `rgba(${rgb},0)`);
    g.fillStyle = grd;
    g.fillRect(0, 0, S, S);
    return c;
  }

  const SPRITE_COOL = makeSprite('190,215,255');
  const SPRITE_WARM = makeSprite('255,226,190');

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    buildStars();
  }

  function buildStars() {
    stars = [];
    const count = Math.min(900, Math.round((W * H) / 2200));

    for (let i = 0; i < count; i++) {
      const depth = Math.random();
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.4 + Math.pow(Math.random(), 3) * 2.6,
        a: 0.22 + Math.random() * 0.78,
        d: 0.15 + depth * 0.85,
        tw: rand(0.35, 2.2),
        ph: Math.random() * TAU,
        vx: 2 + depth * 7,
        vy: 0.6 + depth * 2.4,
        warm: Math.random() < 0.14
      });
    }

    stars.sort((s1, s2) => s1.d - s2.d);
  }

  function drawStars(t, dt) {
    ctx.globalCompositeOperation = 'lighter';

    for (const s of stars) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      if (s.x > W + 20) s.x -= W + 40;
      if (s.y > H + 20) s.y -= H + 40;

      const tw = 0.62 + 0.38 * Math.sin(t * s.tw + s.ph);
      const alpha = s.a * tw;
      if (alpha <= 0.01) continue;

      const ox = mouse.cx * s.d * 26;
      const oy = mouse.cy * s.d * 26;

      let px = (s.x + ox) % W;
      if (px < 0) px += W;
      let py = (s.y + oy) % H;
      if (py < 0) py += H;

      const size = Math.max(2, s.r * 6);

      ctx.globalAlpha = alpha;
      ctx.drawImage(
        s.warm ? SPRITE_WARM : SPRITE_COOL,
        px - size / 2,
        py - size / 2,
        size,
        size
      );
    }

    ctx.globalAlpha = 1;
  }

  function spawnShooter() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const ang = rand(0.22, 0.62);
    const speed = rand(750, 1400);

    shooters.push({
      x: dir === 1 ? rand(-W * 0.15, W * 0.55) : rand(W * 0.45, W * 1.15),
      y: rand(-H * 0.2, H * 0.45),
      vx: Math.cos(ang) * speed * dir,
      vy: Math.sin(ang) * speed,
      life: 0,
      maxLife: rand(0.9, 1.6),
      tail: rand(0.09, 0.17),
      w: rand(1.2, 2.4)
    });
  }

  function drawShooters(dt) {
    if (!REDUCE) {
      shooterTimer -= dt;
      if (shooterTimer <= 0) {
        spawnShooter();
        shooterTimer = rand(3.5, 9);
      }
    }

    ctx.globalCompositeOperation = 'lighter';

    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];

      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life += dt;

      if (s.life > s.maxLife) {
        shooters.splice(i, 1);
        continue;
      }

      const k = s.life / s.maxLife;
      const a = Math.sin(Math.PI * k);

      const tx = s.x - s.vx * s.tail;
      const ty = s.y - s.vy * s.tail;

      const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0.00, `rgba(255,255,255,${0.95 * a})`);
      g.addColorStop(0.25, `rgba(185,212,255,${0.45 * a})`);
      g.addColorStop(1.00, 'rgba(140,170,255,0)');

      ctx.strokeStyle = g;
      ctx.lineWidth = s.w;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      const hs = 18;
      ctx.globalAlpha = a * 0.9;
      ctx.drawImage(SPRITE_COOL, s.x - hs / 2, s.y - hs / 2, hs, hs);
      ctx.globalAlpha = 1;
    }
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt;

    mouse.cx += (mouse.x - mouse.cx) * 0.04;
    mouse.cy += (mouse.y - mouse.cy) * 0.04;

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    drawStars(time, REDUCE ? dt * 0.15 : dt);
    drawShooters(dt);

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / W - 0.5) * 2;
    mouse.y = (e.clientY / H - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    mouse.x = 0;
    mouse.y = 0;
  });

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) last = performance.now();
  });

  const pin = document.getElementById('pin');
  if (pin) {
    pin.addEventListener('input', () => {
      pin.value = pin.value.replace(/\D/g, '');
    });
  }

  const lost = document.getElementById('lostPassword');
  if (lost) {
    lost.addEventListener('click', () => {
      alert('Password recovery flow goes here.');
    });
  }

  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  resize();
  requestAnimationFrame(frame);
})();