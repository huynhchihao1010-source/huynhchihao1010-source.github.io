/* ─────────────────────────────────────────────
   "Signal from noise" — the signature artwork.
   Gold-leaf flakes drift on lacquer like water.
   As you scroll the method section they gather
   into a scatter plot, then tighten into one
   rising line: the signal.
   API: window.Art.set({ morph: 0..1, opacity: 0..1 })
   ───────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('art');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const BG = [14, 11, 9];
  const GOLDS = [[201, 163, 90], [236, 210, 154], [170, 128, 62], [226, 196, 128], [237, 227, 209]];
  const RED = [194, 65, 42];

  let W = 0, H = 0, DPR = 1, parts = [], t = 0, running = true;
  let morph = 0, morphTarget = 0, opacity = 1, opacityTarget = 1;
  const mouse = { x: -9999, y: -9999, px: -9999, py: -9999 };

  const rand = (a, b) => a + Math.random() * (b - a);
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

  // layered sines: cheap, organic "water" flow
  function flow(x, y) {
    const s = 0.0016;
    return Math.sin(x * s + t * 0.00021) * 1.7 +
           Math.cos(y * s * 1.3 - t * 0.00017) * 1.5 +
           Math.sin((x + y) * s * 0.55 + t * 0.00011) * 1.2;
  }

  function trendY(r) {
    // gentle S-curve rising from bottom-left to top-right
    const s = 1 / (1 + Math.exp(-(r - 0.5) * 6));
    return H * 0.80 - s * H * 0.52 - r * H * 0.04;
  }

  function build() {
    const n = W < 700 ? 900 : Math.min(2200, Math.round(W * H / 900));
    parts = [];
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      const red = Math.random() < 0.035;
      parts.push({
        x: rand(0, W), y: rand(0, H), px: 0, py: 0,
        r,
        jit: gauss() * H * 0.11,
        jx: gauss() * 6,
        c: red ? RED : GOLDS[(Math.random() * GOLDS.length) | 0],
        a: rand(0.25, 0.85),
        w: red ? rand(1.4, 2.2) : rand(0.5, 1.6),
        sp: rand(0.5, 1.4)
      });
    }
    parts.forEach(p => { p.px = p.x; p.py = p.y; });
    ctx.fillStyle = `rgb(${BG})`;
    ctx.fillRect(0, 0, W, H);
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function step() {
    t += 16;
    morph += (morphTarget - morph) * 0.06;
    opacity += (opacityTarget - opacity) * 0.08;
    canvas.style.opacity = opacity.toFixed(3);

    const gather = smooth(0.02, 0.55, morph);      // flakes pulled to the plot
    const clarity = smooth(0.5, 1, morph);         // scatter tightens to a line
    const fade = 0.07 + gather * 0.22;             // shorter trails as it settles
    ctx.fillStyle = `rgba(${BG},${fade})`;
    ctx.fillRect(0, 0, W, H);

    const left = W * (W < 700 ? 0.08 : 0.42), right = W * 0.94;
    const mvx = mouse.x - mouse.px, mvy = mouse.y - mouse.py;
    mouse.px += (mouse.x - mouse.px) * 0.3; mouse.py += (mouse.y - mouse.py) * 0.3;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.px = p.x; p.py = p.y;

      // water drift
      const ang = flow(p.x, p.y);
      let vx = Math.cos(ang) * p.sp * 0.9 + 0.25;
      let vy = Math.sin(ang) * p.sp * 0.9;

      // the plot
      const tx = left + p.r * (right - left) + p.jx * (1 - clarity);
      const ty = trendY(p.r) + p.jit * (1 - clarity * 0.8) + Math.sin(t * 0.0012 + p.r * 40) * 3 * gather;
      vx = vx * (1 - gather) + (tx - p.x) * 0.07 * gather;
      vy = vy * (1 - gather) + (ty - p.y) * 0.07 * gather;

      // the cursor stirs the surface
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 22000) {
        const f = (1 - d2 / 22000);
        vx += (dx / Math.sqrt(d2 + 1)) * f * 3 + mvx * f * 0.08;
        vy += (dy / Math.sqrt(d2 + 1)) * f * 3 + mvy * f * 0.08;
      }

      p.x += vx; p.y += vy;

      if (gather < 0.05) {
        if (p.x > W + 10) { p.x = -10; p.px = p.x; }
        if (p.x < -10) { p.x = W + 10; p.px = p.x; }
        if (p.y > H + 10) { p.y = -10; p.py = p.y; }
        if (p.y < -10) { p.y = H + 10; p.py = p.y; }
      }

      ctx.strokeStyle = `rgba(${p.c},${p.a})`;
      ctx.lineWidth = p.w;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x + 0.1, p.y + 0.1);
      ctx.stroke();
      if (gather > 0.3) { // settled flakes become data points
        const s = p.w * 1.8 * gather;
        ctx.fillStyle = `rgba(${p.c},${p.a * gather})`;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
    }

    // the signal line draws itself once the data is clear
    if (clarity > 0.15) {
      const k = smooth(0.15, 0.9, clarity);
      ctx.save();
      ctx.strokeStyle = `rgba(236,210,154,${0.9 * k})`;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = 'rgba(236,210,154,.6)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      const steps = 80, end = Math.max(1, Math.round(steps * k));
      for (let s = 0; s <= end; s++) {
        const r = s / steps, x = left + r * (right - left), y = trendY(r);
        s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      // the vermilion seal at the tip
      const r = end / steps, x = left + r * (right - left), y = trendY(r);
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(194,65,42,${k})`;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(194,65,42,${0.4 * k})`;
      ctx.beginPath(); ctx.arc(x, y, 12 + Math.sin(t * 0.004) * 3, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  function loop() {
    if (running && opacity > 0.01 || opacityTarget > 0.01) step();
    requestAnimationFrame(loop);
  }

  addEventListener('resize', () => { clearTimeout(resize._t); resize._t = setTimeout(resize, 150); });
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });

  resize();
  if (reduce) {
    for (let i = 0; i < 160; i++) step(); // one settled still frame
  } else {
    loop();
  }

  window.Art = {
    set(o) {
      if (o.morph != null) morphTarget = o.morph;
      if (o.opacity != null) opacityTarget = o.opacity;
      if (reduce) { morph = morphTarget; opacity = opacityTarget; for (let i = 0; i < 60; i++) step(); }
    }
  };
})();
