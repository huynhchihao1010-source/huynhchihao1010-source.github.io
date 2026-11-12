/* Richard Huynh · portfolio interactions */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  $('#year').textContent = new Date().getFullYear();

  /* ── 1. Portrait art: a lacquer "fingerprint" of ripples ── */
  (function portrait() {
    const svg = $('.portrait__art');
    if (!svg) return;
    const cx = 150, cy = 170;
    const g = el('g', {}, svg);
    for (let i = 0; i < 26; i++) {
      const base = 12 + i * 7.2;
      let d = '';
      for (let a = 0; a <= 360; a += 4) {
        const rad = a * Math.PI / 180;
        const wob = Math.sin(rad * 3 + i * 0.7) * (1.5 + i * 0.25) + Math.sin(rad * 7 - i) * 1.2;
        const r = base + wob;
        const x = cx + Math.cos(rad) * r * 0.86, y = cy + Math.sin(rad) * r;
        d += (a ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
      }
      el('path', {
        d: d + 'Z', fill: 'none',
        stroke: i === 9 ? '#c2412a' : '#c9a35a',
        'stroke-width': i === 9 ? 1.4 : 0.7,
        opacity: (0.85 - i * 0.025).toFixed(2),
        class: 'ring', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1
      }, g);
    }
    const wrap = svg.closest('.portrait'), photo = wrap && wrap.querySelector('img');
    const hasPhoto = photo && (photo.complete ? photo.naturalWidth > 0 : true);
    if (hasPhoto) wrap.classList.add('has-photo');
    if (photo) photo.addEventListener('error', () => { wrap.classList.remove('has-photo'); });
    const txt = el('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', fill: '#ecd29a', 'font-family': 'Cormorant Garamond, serif', 'font-style': 'italic', 'font-size': 46 }, svg);
    txt.textContent = hasPhoto ? '' : 'Hào';
    const lab = el('text', { x: 276, y: 30, 'text-anchor': 'end', fill: 'rgba(237,227,209,.6)', 'font-family': 'JetBrains Mono, monospace', 'font-size': 8, 'letter-spacing': 2 }, svg);
    lab.textContent = 'N 33.77° · E 151.11° · MACQUARIE PARK';
    svg._rings = $$('.ring', svg);
  })();

  /* ── 2. Case-study art (drawn on scroll) ── */
  const caseArt = {
    drop(svg) { // water drop ripples for the luxury tapware brand
      for (let i = 0; i < 6; i++) el('ellipse', { cx: 200, cy: 168, rx: 26 + i * 30, ry: 8 + i * 9, class: i % 2 ? 'art-faint' : 'art-stroke', pathLength: 1, 'data-draw': '' }, svg);
      el('path', { d: 'M200 30 C 214 62, 222 78, 222 92 a22 22 0 0 1 -44 0 c0 -14 8 -30 22 -62Z', class: 'art-stroke', pathLength: 1, 'data-draw': '' }, svg);
      el('circle', { cx: 200, cy: 168, r: 3, class: 'art-fill' }, svg);
      const l = el('text', { x: 18, y: 226, class: 'art-label' }, svg); l.textContent = 'BRAND · SOCIAL · AI VIDEO';
    },
    canvas(svg) { // strategy canvas: two value curves crossing
      const f = ['PRICE', 'UTILITY', 'ESG', 'DATA', 'PLAY', 'SHELF'];
      f.forEach((n, i) => {
        const x = 40 + i * 64;
        el('line', { x1: x, y1: 40, x2: x, y2: 190, class: 'art-faint' }, svg);
        const t = el('text', { x, y: 212, 'text-anchor': 'middle', class: 'art-label' }, svg); t.textContent = n;
      });
      const a = [150, 140, 160, 150, 165, 140], b = [120, 70, 55, 80, 50, 60];
      const pts = arr => arr.map((y, i) => `${40 + i * 64},${y}`).join(' ');
      el('polyline', { points: pts(a), class: 'art-faint', 'stroke-dasharray': '3 4' }, svg);
      el('polyline', { points: pts(b), class: 'art-stroke', 'stroke-width': 1.8, pathLength: 1, 'data-draw': '' }, svg);
      b.forEach((y, i) => el('circle', { cx: 40 + i * 64, cy: y, r: 3.5, fill: i === 4 ? '#c2412a' : '#c9a35a', 'data-pop': '' }, svg));
    },
    podium(svg) {
      const bars = [[110, 90, '2'], [180, 130, '1'], [250, 60, '3']];
      bars.forEach(([x, h, n]) => {
        el('rect', { x: x - 28, y: 200 - h, width: 56, height: h, fill: n === '2' ? 'rgba(194,65,42,.85)' : 'rgba(201,163,90,.18)', stroke: '#c9a35a', 'stroke-width': 1, 'data-grow': '' }, svg);
        const t = el('text', { x, y: 220, 'text-anchor': 'middle', class: 'art-label' }, svg); t.textContent = n === '2' ? '1ST RUNNER-UP' : '';
      });
      el('line', { x1: 40, y1: 200, x2: 360, y2: 200, class: 'art-stroke' }, svg);
      const s = el('path', { d: 'M110 60 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1z', class: 'art-stroke', fill: 'rgba(236,210,154,.15)', 'data-pop': '' }, svg);
    },
    orbit(svg) {
      el('circle', { cx: 200, cy: 120, r: 16, fill: '#c2412a' }, svg);
      const lab = el('text', { x: 200, y: 124, 'text-anchor': 'middle', class: 'art-label', fill: '#ede3d1' }, svg); lab.textContent = 'MOV';
      [46, 78].forEach(r => el('ellipse', { cx: 200, cy: 120, rx: r * 1.8, ry: r, class: 'art-faint' }, svg));
      const g = el('g', { class: 'spin' }, svg);
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2, r = i % 2 ? 46 : 78;
        el('circle', { cx: 200 + Math.cos(a) * r * 1.8, cy: 120 + Math.sin(a) * r, r: 5, fill: '#c9a35a', 'data-pop': '' }, g);
        el('line', { x1: 200, y1: 120, x2: 200 + Math.cos(a) * r * 1.8, y2: 120 + Math.sin(a) * r, class: 'art-faint', 'stroke-dasharray': '2 4' }, g);
      }
      const t = el('text', { x: 18, y: 226, class: 'art-label' }, svg); t.textContent = '8 TOUCHPOINTS · 1 COMMUNITY';
    },
    retention(svg) {
      el('line', { x1: 40, y1: 200, x2: 370, y2: 200, class: 'art-faint' }, svg);
      el('line', { x1: 40, y1: 30, x2: 40, y2: 200, class: 'art-faint' }, svg);
      el('path', { d: 'M40 50 C 80 120, 110 135, 160 140 S 260 150, 370 160', class: 'art-faint', 'stroke-dasharray': '3 4' }, svg);
      el('path', { d: 'M40 50 C 70 70, 110 80, 160 84 S 260 92, 370 96', class: 'art-stroke', 'stroke-width': 1.8, pathLength: 1, 'data-draw': '' }, svg);
      el('circle', { cx: 160, cy: 84, r: 4, fill: '#c2412a', 'data-pop': '' }, svg);
      const a = el('text', { x: 168, y: 76, class: 'art-label' }, svg); a.textContent = 'NEW HOOK';
      const b = el('text', { x: 46, y: 222, class: 'art-label' }, svg); b.textContent = 'WATCH TIME →';
      // play icon
      el('path', { d: 'M318 30 l18 11 -18 11z', fill: '#c9a35a' }, svg);
    },
    cup(svg) {
      el('ellipse', { cx: 200, cy: 206, rx: 92, ry: 11, class: 'art-faint' }, svg);
      el('path', { d: 'M148 118 L160 196 Q200 212 240 196 L252 118', class: 'art-stroke', pathLength: 1, 'data-draw': '' }, svg);
      el('ellipse', { cx: 200, cy: 118, rx: 52, ry: 9, class: 'art-stroke', pathLength: 1, 'data-draw': '' }, svg);
      el('path', { d: 'M251 132 C 292 132 290 178 244 180', class: 'art-stroke', pathLength: 1, 'data-draw': '' }, svg);
      el('path', { d: 'M200 124 c-6 -8 -18 -4 -12 4 l12 8 l12 -8 c6 -8 -6 -12 -12 -4z', fill: '#c2412a', 'data-pop': '' }, svg);
      [176, 200, 224].forEach((x, i) => el('path', { d: `M${x} 102 c-10 -14 10 -22 0 -36 s10 -22 0 -36`, class: 'art-faint steam', style: `animation-delay:${i * .6}s` }, svg));
      const t = el('text', { x: 18, y: 226, class: 'art-label' }, svg); t.textContent = 'SHIFTS · PEOPLE · CUSTOMERS';
    },
    voice(svg) {
      const n = 44;
      for (let i = 0; i < n; i++) {
        const x = 30 + i * 7.9, h = 10 + Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21)) * 120;
        el('rect', { x, y: 120 - h / 2, width: 2.4, height: h, rx: 1.2, fill: i === 22 ? '#c2412a' : '#c9a35a', opacity: 0.4 + (h / 130) * 0.6, 'data-wave': '', style: `transform-origin:${x}px 120px` }, svg);
      }
      const t = el('text', { x: 18, y: 226, class: 'art-label' }, svg); t.textContent = 'PLATINUM · GOLD · SILVER · BRONZE';
    }
  };
  $$('.case').forEach(c => { const f = caseArt[c.dataset.art], svg = $('svg', c); if (f && svg) f(svg); });

  /* ── 2a. FORME: units by quarter + store count ── */
  (function formeChart() {
    const svg = $('.file__chart'); if (!svg) return;
    const data = [['Q4', 2085, 2], ['Q5', 17722, 9], ['Q6', 25313, 9]];
    const max = 26000, base = 186, h = 130;
    data.forEach(([q, u], i) => {
      const x = 70 + i * 110, bh = Math.max(3, u / max * h);
      el('rect', { x, y: base - bh, width: 54, height: bh, fill: i === 2 ? '#c2412a' : 'rgba(201,163,90,.75)', 'data-grow': '' }, svg);
      const t = el('text', { x: x + 27, y: base - bh - 8, 'text-anchor': 'middle', class: 'art-label', fill: '#ecd29a' }, svg); t.textContent = u.toLocaleString('en-AU');
      const l = el('text', { x: x + 27, y: 204, 'text-anchor': 'middle', class: 'art-label' }, svg); l.textContent = q;
    });
    el('line', { x1: 50, y1: base, x2: 380, y2: base, class: 'art-faint' }, svg);
    const a = el('text', { x: 18, y: 26, class: 'art-label', fill: '#c9a35a' }, svg); a.textContent = 'UNITS SOLD · FORME';
    const b = el('text', { x: 382, y: 26, class: 'art-label', 'text-anchor': 'end', fill: '#c2412a' }, svg); b.textContent = '#1 TOTAL PERFORMANCE';
  })();

  /* ── 2b. Skyline: Sài Gòn → Sydney, one gold line ── */
  (function skyline() {
    const svg = $('.skyline svg'); if (!svg) return;
    const P = (d, cls = 'sk') => el('path', { d, class: cls, pathLength: 1, 'data-sk': '' }, svg);
    P('M0 238 C 200 226, 400 250, 600 236 S 1000 226, 1200 240');
    P('M40 248 C 240 238, 420 256, 620 246 S 980 238, 1160 250', 'sk-faint');
    P('M60 230 L60 186 L92 186 L92 230 M100 230 L100 200 L118 200 L118 230');
    P('M132 230 L138 82 Q151 40 164 82 L170 230 M140 114 L182 104 L182 112 L140 120 M151 50 L151 26');
    P('M206 230 L206 150 L222 150 L222 230');
    P('M232 230 L232 92 L240 92 L240 72 L248 72 L248 52 L256 52 L256 32 L264 32 L264 52 L272 52 L272 72 L280 72 L280 92 L288 92 L288 230 M260 32 L260 8');
    P('M300 230 L300 172 L330 172 L330 202 L356 202 L356 230 M366 230 L366 190 L384 190 L384 230');
    P('M700 230 Q800 112 900 230 M712 230 Q800 132 888 230 M690 200 L910 200 M690 230 L690 184 L708 184 L708 230 M892 230 L892 184 L910 184 L910 230');
    let v = '';
    for (let x = 724; x <= 876; x += 19) {
      const t = (x - 700) / 200, y = (1 - t) * (1 - t) * 230 + 2 * (1 - t) * t * 112 + t * t * 230;
      if (y < 200) v += `M${x} 200 L${x} ${y.toFixed(1)} `;
    }
    if (v) P(v, 'sk-faint');
    P('M936 230 L1166 230 L1166 214 L936 214 Z');
    P('M956 214 Q972 140 1010 118 Q998 170 1018 214 M968 214 Q984 160 1006 132');
    P('M1004 214 Q1028 128 1070 106 Q1058 164 1078 214 M1016 214 Q1036 150 1064 122');
    P('M1064 214 Q1088 150 1124 138 Q1108 180 1128 214 M1076 214 Q1094 168 1118 150');
    el('path', { d: 'M262 8 Q 660 -70 1040 104', class: 'sk-red', 'stroke-dasharray': '4 7', 'data-fly': '' }, svg);
    el('circle', { cx: 1040, cy: 104, r: 4.5, class: 'sk-dot', 'data-pop': '' }, svg);
    const a = el('text', { x: 60, y: 258, class: 'sk-label' }, svg); a.textContent = 'SÀI GÒN';
    const b = el('text', { x: 1166, y: 258, class: 'sk-label', 'text-anchor': 'end' }, svg); b.textContent = 'SYDNEY';
    const c = el('text', { x: 640, y: -22, class: 'sk-label', 'text-anchor': 'middle' }, svg); c.textContent = 'SGN → SYD · 2024';
    $$('[data-sk]', svg).forEach(p => { p.setAttribute('stroke-dasharray', 1); p.setAttribute('stroke-dashoffset', 1); });
  })();

  /* ── 2c. Lotus above the water quote ── */
  (function lotus() {
    const svg = $('.lotus'); if (!svg) return;
    const P = (d, cls = 'lt') => el('path', { d, class: cls, pathLength: 1, 'data-lt': '' }, svg);
    [[120, 12], [168, 18], [210, 24]].forEach(([rx, ry]) => el('ellipse', { cx: 200, cy: 236, rx, ry, class: 'lt', opacity: .35, pathLength: 1, 'data-lt': '' }, svg));
    P('M200 226 C 120 228 70 196 60 162 C 112 160 168 190 200 226 Z', 'lt lt-fill');
    P('M200 226 C 280 228 330 196 340 162 C 288 160 232 190 200 226 Z', 'lt lt-fill');
    P('M200 226 C 146 206 116 150 124 110 C 164 128 194 176 200 226 Z', 'lt lt-fill');
    P('M200 226 C 254 206 284 150 276 110 C 236 128 206 176 200 226 Z', 'lt lt-fill');
    P('M200 226 C 168 184 170 112 200 70 C 230 112 232 184 200 226 Z', 'lt lt-fill');
    P('M200 216 L200 104', 'lt');
    P('M200 70 L200 52', 'lt-red');
    el('circle', { cx: 200, cy: 44, r: 4, fill: '#c2412a', 'data-pop': '' }, svg);
    $$('[data-lt]', svg).forEach(p => { p.setAttribute('stroke-dasharray', 1); p.setAttribute('stroke-dashoffset', 1); });
  })();

  /* ── 3. Split headings into words ── */
  $$('.split').forEach(h => {
    const walk = node => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR') {
          if (ch.tagName === 'EM') { // keep the gold gradient on the whole word
            const w = document.createElement('span'); w.className = 'w';
            ch.replaceWith(w); const i = document.createElement('span'); i.appendChild(ch); w.appendChild(i);
          } else walk(ch);
        }
      });
    };
    walk(h);
  });

  /* ── 4. No GSAP? Show everything and stop here. ── */
  const loader = $('.loader');
  if (!hasGSAP || reduce) {
    loader && loader.remove();
    document.body.classList.remove('is-loading');
    $$('.portrait__art .ring').forEach(r => r.setAttribute('stroke-dashoffset', 0));
    $$('[data-draw], [data-sk], [data-lt]').forEach(r => r.setAttribute('stroke-dashoffset', 0));
    $$('[data-count]').forEach(n => n.textContent = (+n.dataset.count).toFixed(+(n.dataset.dec || 0)) + (n.dataset.suffix || ''));
    if (reduce && hasGSAP) { /* still drive art opacity simply */ }
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  let lenis = null;
  if (window.Lenis) {
    lenis = window.__lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      e.preventDefault(); lenis.scrollTo(id === '#top' ? 0 : id, { duration: 1.6 });
    }));
  }

  /* ── 5. Loader → hero intro ── */
  gsap.set($$('.hero .split .w > span'), { yPercent: 110 });
  gsap.set($$('.hero .reveal-up'), { y: 30, opacity: 0 });
  const counter = { v: 0 };
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .to('.loader__ring circle', { strokeDashoffset: 0, duration: 1.6, stagger: 0.15, ease: 'power2.inOut' }, 0)
    .to(counter, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate: () => { $('.loader__count span').textContent = Math.round(counter.v); } }, 0)
    .to('.loader__name', { opacity: 1, y: 0, duration: 1 }, 0.4)
    .to('.loader__ring', { scale: 1.6, opacity: 0, duration: 0.9, ease: 'power3.in' }, 1.8)
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, 2.0)
    .add(() => { document.body.classList.remove('is-loading'); lenis && lenis.start(); loader.remove(); }, 3.0)
    .to($$('.hero .split .w > span'), { yPercent: 0, duration: 1.4, stagger: 0.07 }, 2.35)
    .to($$('.hero .reveal-up'), { y: 0, opacity: 1, duration: 1.2, stagger: 0.1 }, 2.6)
    .to($$('.portrait__art .ring'), { attr: { 'stroke-dashoffset': 0 }, duration: 2.4, stagger: 0.04, ease: 'power2.out' }, 2.5)
    .from('.seal', { scale: 0, rotate: -120, duration: 1.4, ease: 'back.out(1.6)' }, 3.0);

  /* ── 6. Generic reveals ── */
  $$('.split').forEach(h => {
    if (h.closest('.hero')) return;
    gsap.from($$('.w > span', h), {
      yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: h, start: 'top 85%' }
    });
  });
  $$('.reveal-up').forEach(r => {
    if (r.closest('.hero')) return;
    gsap.from(r, { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 88%' } });
  });

  /* counters */
  $$('[data-count]').forEach(n => {
    const end = +n.dataset.count, suf = n.dataset.suffix || '', dec = +(n.dataset.dec || 0), o = { v: 0 };
    ScrollTrigger.create({
      trigger: n, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: end > 100 ? 2.2 : 1.2, ease: 'power3.out', onUpdate: () => { n.textContent = (dec ? o.v.toFixed(dec) : Math.round(o.v)) + suf; } })
    });
  });
  gsap.from('.stat', { y: 40, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 88%' } });

  /* ── 7. The signature art follows the story ── */
  const steps = $$('.signal__step');
  ScrollTrigger.create({
    trigger: '.signal', start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: self => {
      const p = self.progress;
      window.Art && Art.set({ morph: Math.min(1, p * 1.15) });
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
      steps.forEach((s, i) => {
        const on = i === idx;
        gsap.to(s, { opacity: on ? 1 : 0, y: on ? 0 : (i < idx ? -30 : 30), duration: 0.6, ease: 'power3.out', overwrite: true });
      });
      gsap.to('.signal__axis', { opacity: p > 0.55 ? 1 : 0, duration: 0.5, overwrite: true });
    },
    onLeaveBack: () => window.Art && Art.set({ morph: 0 })
  });
  // dim the art behind dense content, bring it back for "Be like water"
  ScrollTrigger.create({
    trigger: '.files', start: 'top 70%', endTrigger: '.journey', end: 'bottom 40%',
    onToggle: self => window.Art && Art.set({ opacity: self.isActive ? 0.16 : 1 })
  });
  ScrollTrigger.create({
    trigger: '.water', start: 'top 60%',
    onEnter: () => window.Art && Art.set({ morph: 0, opacity: 1 }),
    onLeaveBack: () => window.Art && Art.set({ morph: 1, opacity: 0.16 })
  });

  /* ── 8. Case cards: draw art, tilt, light ── */
  $$('.case').forEach(c => {
    const svg = $('svg', c) || c;
    const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 80%' } });
    tl.from(c, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' })
      .fromTo($$('[data-draw]', svg), { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.8, stagger: 0.12, ease: 'power2.inOut' }, 0.2)
      .from($$('[data-pop]', svg), { scale: 0, transformOrigin: 'center', duration: 0.7, stagger: 0.06, ease: 'back.out(2)' }, 0.8)
      .from($$('[data-grow]', svg), { scaleY: 0, transformOrigin: 'bottom', duration: 1.1, stagger: 0.12, ease: 'expo.out' }, 0.3)
      .from($$('[data-wave]', svg), { scaleY: 0.05, duration: 1, stagger: { each: 0.015, from: 'center' }, ease: 'expo.out' }, 0.3);
    const spin = $('.spin', svg);
    if (spin) gsap.to(spin, { rotate: 360, svgOrigin: '200 120', duration: 40, repeat: -1, ease: 'none' });
    const wave = $$('[data-wave]', svg);
    if (wave.length) gsap.to(wave, { scaleY: () => gsap.utils.random(0.4, 1.15), duration: 0.9, ease: 'sine.inOut', stagger: { each: 0.03, repeat: -1, yoyo: true } });

    if (matchMedia('(hover: hover)').matches) {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
        gsap.to(c, { rotateY: (x - 0.5) * 5, rotateX: (0.5 - y) * 5, transformPerspective: 1200, duration: 0.6, ease: 'power3.out' });
      });
      c.addEventListener('pointerleave', () => gsap.to(c, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'expo.out' }));
    }
  });

  /* honours + journey */
  /* proof gallery: swipe, drag, arrows, trackpad */
  const track = $('.proof__track');
  let dragMoved = false;
  if (track) {
    const bar = $('.proof__bar span');
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth, w = Math.max(.12, track.clientWidth / track.scrollWidth);
      if (bar) { bar.style.width = (w * 100) + '%'; bar.style.transform = `translateX(${max > 0 ? (track.scrollLeft / max) * (1 / w - 1) * 100 : 0}%)`; }
    };
    track.addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
    // sideways trackpad gestures belong to the strip, not to the page scroller
    track.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation(); }, { passive: true });
    // mouse drag to scroll
    let down = false, sx = 0, sl = 0, vx = 0, lx = 0;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; dragMoved = false; sx = lx = e.clientX; sl = track.scrollLeft; vx = 0;
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 5 && !dragMoved) { dragMoved = true; track.classList.add('is-drag'); }
      if (dragMoved) { track.scrollLeft = sl - dx; vx = e.clientX - lx; lx = e.clientX; }
    });
    addEventListener('pointerup', () => {
      if (!down) return; down = false;
      track.classList.remove('is-drag');
      if (dragMoved) gsap.to(track, { scrollLeft: track.scrollLeft - vx * 14, duration: 0.9, ease: 'power3.out' });
      setTimeout(() => { dragMoved = false; }, 0);
    });
    const step = () => Math.min(track.clientWidth * 0.8, 520);
    $$('.proof__btn').forEach(b => b.addEventListener('click', () => gsap.to(track, { scrollLeft: track.scrollLeft + step() * +b.dataset.dir, duration: 0.9, ease: 'power3.inOut' })));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); gsap.to(track, { scrollLeft: track.scrollLeft + step() * (e.key === 'ArrowRight' ? 1 : -1), duration: 0.7, ease: 'power3.out' }); }
    });
    // a gentle nudge the first time it comes into view, so people see it moves
    ScrollTrigger.create({ trigger: track, start: 'top 70%', once: true, onEnter: () => {
      gsap.timeline().to(track, { scrollLeft: 140, duration: 1.1, ease: 'power2.inOut', delay: 0.8 }).to(track, { scrollLeft: 0, duration: 1, ease: 'power2.inOut' });
    } });
  }
  gsap.from('.frame', { y: 80, rotate: i => (i % 2 ? 3 : -3), opacity: 0, duration: 1.3, stagger: 0.09, ease: 'expo.out', scrollTrigger: { trigger: '.proof', start: 'top 70%' } });

  /* lightbox */
  const lb = $('.lightbox'), lbImg = lb && $('img', lb);
  $$('[data-full]').forEach(f => f.addEventListener('click', () => {
    if (dragMoved) return;
    lbImg.src = f.dataset.full; lbImg.alt = (f.tagName === 'IMG' ? f.alt : ($('img', f) || {}).alt) || '';
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lenis && lenis.stop();
  }));
  const closeLb = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lenis && lenis.start(); };
  if (lb) lb.addEventListener('click', closeLb);
  addEventListener('keydown', e => { if (e.key === 'Escape' && lb && lb.classList.contains('is-open')) closeLb(); });

  /* case files */
  $$('.file').forEach(f => {
    const main = $('.file__main', f), fl = $('.file__float', f), no = $('.file__no', f);
    gsap.timeline({ scrollTrigger: { trigger: f, start: 'top 78%' } })
      .from(main, { clipPath: 'inset(0 100% 0 0)', duration: 1.4, ease: 'expo.inOut' })
      .from(fl || [], { y: 80, opacity: 0, rotate: 4, duration: 1.2, ease: 'expo.out' }, 0.6)
      .from(no, { y: 40, opacity: 0, duration: 1, ease: 'expo.out' }, 0.3)
      .from($$('.file__body > *', f), { y: 30, opacity: 0, duration: 1, stagger: 0.07, ease: 'expo.out' }, 0.3)
      .from($$('[data-grow]', f), { scaleY: 0, transformOrigin: 'bottom', duration: 1.1, stagger: 0.15, ease: 'expo.out' }, 0.8);
    if (fl) gsap.to(fl, { yPercent: -14, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.from('.briefs__row li', { y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.briefs', start: 'top 85%' } });

  /* skyline draws itself as you scroll into the journey */
  const sk = $$('.skyline [data-sk]');
  if (sk.length) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.skyline', start: 'top 85%', end: 'bottom 45%', scrub: 1 } });
    tl.to(sk, { attr: { 'stroke-dashoffset': 0 }, stagger: 0.08, ease: 'none', duration: 1 })
      .from('.skyline [data-fly]', { opacity: 0, duration: 0.6 }, 0.6)
      .from('.skyline [data-pop], .skyline .sk-label', { opacity: 0, duration: 0.4, stagger: 0.1 }, 0.9);
  }
  const lt = $$('.lotus [data-lt]');
  if (lt.length) gsap.timeline({ scrollTrigger: { trigger: '.water', start: 'top 70%' } })
    .to(lt, { attr: { 'stroke-dashoffset': 0 }, duration: 2.2, stagger: 0.12, ease: 'power2.inOut' })
    .from('.lotus [data-pop]', { scale: 0, transformOrigin: 'center', duration: 0.8, ease: 'back.out(3)' }, 1.4)
    .from('.lotus .lt-fill', { fillOpacity: 0, duration: 1.2 }, 1);
  const jp = $('.journey__line path');
  if (jp) {
    const len = jp.getTotalLength();
    gsap.fromTo(jp, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.journey__list', start: 'top 70%', end: 'bottom 60%', scrub: true } });
  }
  $$('.journey__list li').forEach(li => gsap.from(li, { x: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 85%' } }));
  gsap.from('.contact__item', { y: 30, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.contact__grid', start: 'top 90%' } });

  /* hero parallax */
  gsap.to('.hero__card', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__inner', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* marquee speeds up with scroll velocity */
  const mtrack = $('.marquee__track');
  if (mtrack) ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: s => { const v = Math.min(4, 1 + Math.abs(s.getVelocity()) / 800); mtrack.style.animationDuration = (38 / v) + 's'; }
  });

  /* ── 9. Cursor + magnetic buttons ── */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const dot = $('.cursor__dot'), ring = $('.cursor__ring'), cur = $('.cursor');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
    addEventListener('pointermove', e => { cur.classList.add('is-on'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    $$('a, button, .case, .frame, .logos__row li, [data-full]').forEach(a => {
      a.addEventListener('pointerenter', () => cur.classList.add('is-hover'));
      a.addEventListener('pointerleave', () => cur.classList.remove('is-hover'));
    });
    $$('.magnetic').forEach(m => {
      m.addEventListener('pointermove', e => {
        const r = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' });
      });
      m.addEventListener('pointerleave', () => gsap.to(m, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, .4)' }));
    });
  }
})();
