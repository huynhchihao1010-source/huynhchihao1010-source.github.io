/* Richard Huynh · portfolio · v5 effects layer
   Runs after main.js. Adds: logo loop, mobile menu, nav state, cursor labels,
   portrait + case-file depth, decoding labels, signal rail, contact finale. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const lenis = () => window.__lenis;

  /* ── 1. Logo loop: clone each row once so it can drift forever ── */
  $$('.logo-loop').forEach(loop => {
    const track = $('.logo-loop__track', loop);
    if (reduce || !track) return;
    [...track.children].forEach(li => {
      const c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    });
    loop.classList.add('is-looping');
  });

  /* ── 2. Mobile menu ── */
  const burger = $('.nav__burger'), menu = $('.menu');
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    const l = lenis(); if (l) open ? l.stop() : l.start();
  };
  if (burger && menu) {
    burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    // capture phase: close (and restart smooth scroll) before main.js scrolls to the section
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); }, true);
    addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });
  }

  /* ── 3. Giant name: fit it to the page width ── */
  const big = $('.bigname span');
  const fit = () => {
    if (!big) return;
    const box = big.parentElement, cs = getComputedStyle(box);
    const room = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    big.style.fontSize = '100px';
    const w = big.getBoundingClientRect().width;
    if (w) big.style.fontSize = Math.min(260, 100 * room / w * 0.99) + 'px';
  };
  fit();
  addEventListener('resize', () => { clearTimeout(fit._t); fit._t = setTimeout(fit, 120); });
  if (document.fonts) document.fonts.ready.then(fit);

  /* ── 4. Cursor labels: View / Drag / Open / Read ── */
  $$('[data-full]').forEach(n => n.dataset.cursor = 'View');
  $$('.proof__track').forEach(n => n.dataset.cursor = 'Drag');
  $$('a[target="_blank"]:not(.orb)').forEach(n => n.dataset.cursor = 'Open');
  $$('.built__card').forEach(n => n.dataset.cursor = 'Read');
  if (fine) {
    const cur = $('.cursor'), lab = $('.cursor__label');
    addEventListener('pointerover', e => {
      const t = e.target.closest && e.target.closest('[data-cursor]');
      if (t) { lab.textContent = t.dataset.cursor; cur.classList.add('has-label'); }
      else cur.classList.remove('has-label');
    });
    $('.lightbox') && $('.lightbox').addEventListener('click', () => cur.classList.remove('has-label'));
  }

  if (!G || !ST || reduce) return; // everything below is motion

  /* ── 5. Nav: sliding active pill + reading progress ── */
  const links = $$('.nav__links a:not(.nav__cta)'), ind = $('.nav__ind');
  let active = null;
  const moveInd = a => {
    active = a;
    links.forEach(l => l.classList.toggle('is-active', l === a));
    if (!ind) return;
    if (!a || !a.offsetWidth) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1;
    ind.style.width = a.offsetWidth + 'px';
    ind.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  links.forEach(a => {
    const sec = $(a.getAttribute('href')); if (!sec) return;
    ST.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => { if (s.isActive) moveInd(a); else if (active === a) moveInd(null); } });
  });
  addEventListener('resize', () => active && moveInd(active));
  const prog = $('.nav__progress i');
  if (prog) ST.create({ start: 0, end: 'max', onUpdate: s => { prog.style.transform = `scaleX(${s.progress.toFixed(4)})`; } });

  /* ── 6. Decoding labels: mono eyebrows resolve out of noise ── */
  const glyphs = '01·#%+=/<>×◆ABCDEFGHKLMNPRSTVXZ';
  const noise = t => t.replace(/\S/g, () => glyphs[(Math.random() * glyphs.length) | 0]);
  const decode = el => {
    const final = el.dataset.text, total = 16 + Math.min(20, final.length);
    let f = 0;
    const tick = () => {
      f++;
      const p = f / total;
      el.textContent = final.split('').map((ch, i) => (ch === ' ' || i / final.length < p * 1.15 - 0.1) ? ch : glyphs[(Math.random() * glyphs.length) | 0]).join('');
      if (f < total) requestAnimationFrame(tick); else el.textContent = final;
    };
    tick();
  };
  $$('.eyebrow').forEach(e => {
    if (e.children.length || e.closest('.hero, .signal')) return;
    e.dataset.text = e.textContent;
    e.setAttribute('aria-label', e.textContent);
    e.textContent = noise(e.dataset.text);
    ST.create({ trigger: e, start: 'top 92%', once: true, onEnter: () => decode(e) });
  });

  /* ── 7. Signal chapter rail ── */
  const rail = $$('.signal__rail li'), railFill = $('.signal__rail > i');
  if (rail.length) ST.create({
    trigger: '.signal', start: 'top top', end: 'bottom bottom',
    onUpdate: s => {
      const idx = Math.min(rail.length - 1, Math.floor(s.progress * rail.length));
      rail.forEach((l, i) => l.classList.toggle('is-on', i === idx));
      if (railFill) railFill.style.transform = `scaleY(${s.progress.toFixed(4)})`;
    },
    onLeaveBack: () => rail.forEach(l => l.classList.remove('is-on'))
  });

  /* ── 8. Reveals for the new blocks ── */
  G.from('.logo-loop', { opacity: 0, y: 30, duration: 1.4, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.logos', start: 'top 85%' } });
  G.from('.built__card', { y: 50, opacity: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.built', start: 'top 88%' } });
  G.from('.orb', { scale: 0.4, rotate: -90, opacity: 0, duration: 1.4, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.contact', start: 'top 75%' } });
  if (big) G.fromTo(big, { '--reveal': '100%' }, { '--reveal': '0%', ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 70%', end: 'max', scrub: 0.6 } });

  if (!fine) return; // pointer-driven depth below

  /* ── 9. Hero light + portrait tilt ── */
  const hero = $('.hero');
  if (hero) hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--hx', (e.clientX - r.left) + 'px');
    hero.style.setProperty('--hy', (e.clientY - r.top) + 'px');
  });
  const card = $('.portrait');
  if (card) {
    const glare = document.createElement('span');
    glare.className = 'portrait__glare';
    card.appendChild(glare);
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--gx', x * 100 + '%'); card.style.setProperty('--gy', y * 100 + '%');
      G.to(card, { rotateY: (x - 0.5) * 12, rotateX: (0.5 - y) * 10, transformPerspective: 900, duration: 0.6, ease: 'power3.out' });
    });
    card.addEventListener('pointerleave', () => G.to(card, { rotateX: 0, rotateY: 0, duration: 1.1, ease: 'expo.out' }));
  }

  /* ── 10. Case files: the two images separate in depth ── */
  $$('.file__media').forEach(m => {
    const main = $('.file__main', m), fl = $('.file__float', m), no = $('.file__no', m);
    m.addEventListener('pointermove', e => {
      const r = m.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      G.to(main, { x: x * -12, y: y * -8, rotateY: x * 7, rotateX: -y * 6, transformPerspective: 1400, duration: 0.8, ease: 'power3.out' });
      if (fl) G.to(fl, { x: x * 28, y: y * 20, rotate: x * 2, duration: 0.8, ease: 'power3.out' });
      if (no) G.to(no, { x: x * -30, duration: 0.8, ease: 'power3.out' });
    });
    m.addEventListener('pointerleave', () => G.to([main, fl, no].filter(Boolean), { x: 0, y: 0, rotate: 0, rotateX: 0, rotateY: 0, duration: 1.1, ease: 'expo.out' }));
  });

  /* ── 11. Spotlight on the brief cards ── */
  $$('.briefs__row li').forEach(li => li.addEventListener('pointermove', e => {
    const r = li.getBoundingClientRect();
    li.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    li.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));
})();
