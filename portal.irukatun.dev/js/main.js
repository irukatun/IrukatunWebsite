// ── CURSOR ──────────────────────────────────────────────
const cur  = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let rx = mx, ry = my;

document.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  mx = e.clientX; my = e.clientY;
  if (cur.style.opacity === '0' || cur.style.opacity === '') {
    cur.style.opacity  = '1';
    ring.style.opacity = '1';
  }
  gsap.to(cur, { x: mx, y: my, duration: .08, ease: 'none' });
});

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

(function tickRing() {
  rx += (mx - rx) * .12;
  ry += (my - ry) * .12;
  gsap.set(ring, { x: rx, y: ry });
  requestAnimationFrame(tickRing);
})();

// ── TRAIL DOTS ──────────────────────────────────────────
const TRAIL = 9;
const dots  = [];
for (let i = 0; i < TRAIL; i++) {
  const d = document.createElement('div');
  d.className = 'trail-dot';
  const s = (5.5 - i * .4);
  d.style.cssText = `width:${s}px;height:${s}px;opacity:${(1 - i / TRAIL) * .38}`;
  document.body.appendChild(d);
  dots.push({ el: d, x: mx, y: my });
}
(function tickTrail() {
  let px = mx, py = my;
  dots.forEach((t, i) => {
    const ease = .2 - i * .014;
    t.x += (px - t.x) * ease;
    t.y += (py - t.y) * ease;
    gsap.set(t.el, { x: t.x, y: t.y });
    px = t.x; py = t.y;
  });
  requestAnimationFrame(tickTrail);
})();

// ── PORTAL MAP ─────────────────────────────────────────
(function initSiteMap() {
  const section = document.getElementById('sitemap');
  if (!section) return;

  // ── Node data ────────────────────────────────────────────
  // 5 spokes radiate from origin (1500,1500) at equal 72° intervals, r=1000.
  // Starting at 270° (top, www), clockwise: lucillaai(342°), others(54°), status(126°), mc(198°).
  // Leaf children fan ±36° from their hub's spoke direction, r=570.
  const NODES = [
    // ── Centre ──────────────────────────────────────────────
    { id:'origin',    tag:'PORTAL',    title:'服務入口',  sub:'選擇一個你所需要的',         x:1500, y:1500, color:'#4aaed4', type:'origin', connects:['www','mc','lucillaai','status','others'] },

    // ── 270° Top: 個人主網站 ────────────────────────────────
    { id:'www',       tag:'WEBSITE',   title:'豚豚的個人網站',  sub:'irukatun.dev',               x:1500, y:500,  color:'#f5c542', type:'portal', url:'https://www.irukatun.dev',      access:'public',  connects:['origin'] },

    // ── 198° Upper-left: Lunar Illusion MC hub ──────────────
    // Children fan at 162° (luni) and 234° (lunimap), r=570
    { id:'mc',        tag:'MINECRAFT', title:'Lunar Illusion 伺服器',    sub:'Lunar Illusion Server', x:549,  y:1191, color:'#5eae47', type:'hub',    connects:['origin','luni','lunimap'] },
    { id:'luni',      tag:'Lunar Illusion',      title:'官方網站',        sub:'伺服器官網 · 籌備中',   x:7,    y:1367, color:'#5eae47', type:'portal', url:null,                            access:'public',  connects:['mc'] },
    { id:'lunimap',   tag:'LUNIMAP',   title:'即時 3D 地圖',              sub:'BlueMap',               x:214,  y:730,  color:'#5eae47', type:'portal', url:'https://lunimap.irukatun.dev',  access:'public',  connects:['mc'] },

    // ── 342° Upper-right: LucillaAI hub ─────────────────────
    // Children fan at 306° (lucilla) and 18° (llamacpp), r=570
    { id:'lucillaai', tag:'LUCILLA AI', title:'Lucilla AI 小鹿熙',        sub:'小鹿熙人工智慧工作室',   x:2451, y:1191, color:'#b57bf0', type:'hub',    connects:['origin','lucilla','llamacpp'] },
    { id:'lucilla',   tag:'Prompt Engineering',   title:'提示詞工程中心',  sub:'SillyTavern',           x:2786, y:730,  color:'#b57bf0', type:'portal', url:'https://sillytavern.irukatun.dev',  access:'private', connects:['lucillaai'] },
    { id:'llamacpp',  tag:'LLAMACPP',  title:'推理運算引擎',               sub:'llama.cpp',             x:2993, y:1367, color:'#b57bf0', type:'portal', url:'https://llamacpp.irukatun.dev', access:'private', connects:['lucillaai'] },

    // ── 126° Lower-left: Status (standalone) ────────────────
    { id:'status',    tag:'STATUS',    title:'Status 狀態中心',  sub:'Uptime Kuma',             x:912,  y:2309, color:'#34d399', type:'portal', url:'https://status.irukatun.dev',   access:'public',  connects:['origin'] },

    // ── 54° Lower-right: 其他服務 hub ───────────────────────
    // Child continues along 54°, r=620
    { id:'others',    tag:'OTHERS',    title:'其他',              sub:'其他獨立服務',             x:2088, y:2309, color:'#f07050', type:'hub',    connects:['origin','vocard'] },
    { id:'vocard',    tag:'MUSIC DASH',    title:'DC 音樂控制台',  sub:'Vocard',                   x:2453, y:2811, color:'#f07050', type:'portal', url:'https://vocard.irukatun.dev',   access:'private', connects:['others'] },
  ];
  const nodeMap = {};
  NODES.forEach(n => nodeMap[n.id] = n);

  // ── State ─────────────────────────────────────────────────
  let currentId  = 'origin';
  let navHistory = ['origin'];
  let zoomLevel  = 1.0;
  const ZOOM_MIN  = 0.40;
  const ZOOM_MAX  = 1.90;
  const ZOOM_STEP = 0.15;

  // ── DOM refs ──────────────────────────────────────────────
  const viewport = document.getElementById('smap-viewport');
  const canvas   = document.getElementById('smap-canvas');
  const svg      = document.getElementById('smap-svg');
  const flash    = document.getElementById('smap-flash');

  // ── Stars ─────────────────────────────────────────────────
  for (let i = 0; i < 160; i++) {
    const s   = document.createElement('span');
    s.className = 'smap-star';
    const sz  = Math.random() * 2.2 + 0.6;
    const opA = (Math.random() * 0.12 + 0.06).toFixed(2);
    const opB = (Math.random() * 0.45 + 0.35).toFixed(2);
    const dur = (2 + Math.random() * 5).toFixed(1) + 's';
    const del = (Math.random() * 8).toFixed(1) + 's';
    s.style.cssText = `left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 100).toFixed(2)}%;`
      + `width:${sz.toFixed(1)}px;height:${sz.toFixed(1)}px;`
      + `--opA:${opA};--opB:${opB};--dur:${dur};--delay:${del};`;
    section.appendChild(s);
  }

  // ── Lines ─────────────────────────────────────────────────
  const lineMap = {};
  function lineKey(a, b) { return [a, b].sort().join('--'); }

  function buildLines() {
    const drawn = new Set();
    NODES.forEach(node => {
      node.connects.forEach(tid => {
        const key = lineKey(node.id, tid);
        if (drawn.has(key)) return;
        drawn.add(key);
        const t  = nodeMap[tid];
        const mx = (node.x + t.x) / 2, my = (node.y + t.y) / 2;
        const dx = t.x - node.x,        dy = t.y - node.y;
        const ox = -dy * 0.1,            oy =  dx * 0.1;
        const d  = `M ${node.x} ${node.y} Q ${mx+ox} ${my+oy} ${t.x} ${t.y}`;
        const color = node.id === 'origin' ? nodeMap[tid].color : node.color;

        const base = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        base.setAttribute('d', d); base.setAttribute('fill', 'none');
        base.setAttribute('stroke', 'transparent'); base.setAttribute('stroke-width', '1.5');
        base.style.opacity = '0';

        const flow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        flow.setAttribute('d', d); flow.setAttribute('fill', 'none');
        flow.setAttribute('stroke', 'transparent'); flow.setAttribute('stroke-width', '2');
        flow.setAttribute('stroke-dasharray', '6 60');
        flow.style.opacity = '0';

        svg.appendChild(base); svg.appendChild(flow);
        lineMap[key] = { base, flow, color };
      });
    });
  }

  // ── Nodes ─────────────────────────────────────────────────
  const nodeEls = {};

  function buildNodes() {
    NODES.forEach(node => {
      const el = document.createElement('div');
      el.className  = 'smap-node';
      el.id         = `smap-n-${node.id}`;
      el.style.left = node.x + 'px';
      el.style.top  = node.y + 'px';
      el.style.setProperty('--nc', node.color);

      const dot    = `<div class="smap-dot"></div>`;
      const tag    = `<div class="smap-ntag">${node.tag}</div>`;
      const title  = `<div class="smap-ntitle">${node.title}</div>`;
      const sub    = `<div class="smap-nsub">${node.sub.replace(/\n/g, '<br>')}</div>`;
      const access = node.access
        ? `<span class="smap-access smap-access--${node.access}">${node.access === 'public' ? '公開' : '私人'}</span>`
        : '';
      let   btns  = '';

      if (node.type === 'origin' || node.type === 'hub') {
        btns = `<div class="smap-btns" id="smap-btns-${node.id}"></div>`;
      } else if (node.type === 'portal') {
        const label    = node.url ? '進入 →' : '即將推出';
        const disabled = node.url ? '' : ' disabled';
        btns = `<div class="smap-btns">
          <button class="smap-enter-btn"${disabled}>${label}</button>
          <button class="smap-back-btn">← 返回</button>
        </div>`;
      }

      el.innerHTML = dot + tag + access + title + sub + btns;
      canvas.appendChild(el);
      nodeEls[node.id] = el;
    });
  }

  // ── Navigation ────────────────────────────────────────────
  function panTo(id, animate = true) {
    const n  = nodeMap[id];
    const tx = viewport.offsetWidth  / 2 - n.x * zoomLevel;
    const ty = viewport.offsetHeight / 2 - n.y * zoomLevel;
    if (animate) {
      gsap.to(canvas, { x: tx, y: ty, scale: zoomLevel, duration: 1.1, ease: 'power3.inOut' });
    } else {
      gsap.set(canvas, { x: tx, y: ty, scale: zoomLevel });
    }
  }

  function setZoom(z, animate = true) {
    zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(z * 100) / 100));
    document.getElementById('smap-zoom-level').textContent = Math.round(zoomLevel * 100) + '%';
    panTo(currentId, animate);
  }

  function navigateTo(id) {
    if (id === currentId) return;
    currentId = id;
    navHistory.push(id);
    panTo(id);
    updateUI();
  }

  function goBack() {
    if (navHistory.length <= 1) return;
    navHistory.pop();
    const prev = navHistory[navHistory.length - 1];
    navHistory.pop();
    navigateTo(prev);
  }

  // Force reload on bfcache restore so entrance animation always plays cleanly
  window.addEventListener('pageshow', e => {
    if (e.persisted) window.location.reload();
  });

  // ── Portal animation → navigate current tab ─────────────
  function runPortalTransition(url) {
    gsap.to(canvas, { scale: 5, duration: 0.9, ease: 'power3.in' });
    gsap.to(flash, {
      opacity: 1, duration: 0.3, delay: 0.65,
      onComplete() {
        if (url) window.location.href = url;
      }
    });
  }

  // ── UI update ─────────────────────────────────────────────
  function updateUI() {
    const cur = nodeMap[currentId];

    NODES.forEach(n => {
      const el  = nodeEls[n.id];
      const dot = el.querySelector('.smap-dot');
      el.classList.remove('current', 'connected', 'dimmed');
      dot.classList.remove('pulse');
      if (n.id === currentId) {
        el.classList.add('current'); dot.classList.add('pulse');
      } else if (cur.connects.includes(n.id)) {
        el.classList.add('connected');
      } else {
        el.classList.add('dimmed');
      }
    });

    Object.entries(lineMap).forEach(([key, { base, flow, color }]) => {
      const ids      = key.split('--');
      const isActive = ids.includes(currentId);
      base.setAttribute('stroke', isActive ? color + '88' : color + '1c');
      base.setAttribute('stroke-width', isActive ? '2' : '1.5');
      if (isActive) {
        base.setAttribute('filter', 'url(#smap-glow)');
        flow.setAttribute('stroke', color + '70');
        flow.style.animation = 'smap-flow 1.5s linear infinite';
      } else {
        base.removeAttribute('filter');
        flow.setAttribute('stroke', 'transparent');
        flow.style.animation = 'none';
      }
    });

    rebuildBtns('origin');
    NODES.filter(n => n.type === 'hub').forEach(n => rebuildBtns(n.id));

    document.getElementById('smap-hud-label').textContent = cur.tag;
    const trail = document.getElementById('smap-trail');
    trail.innerHTML = '';
    navHistory.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'smap-trail-dot' + (i === navHistory.length - 1 ? ' active' : '');
      trail.appendChild(d);
    });
    document.getElementById('smap-trail-mirror').innerHTML = trail.innerHTML;
  }

  function rebuildBtns(nodeId) {
    const el = document.getElementById(`smap-btns-${nodeId}`);
    if (!el) return;
    el.innerHTML = '';
    const node  = nodeMap[nodeId];
    const prevId = navHistory.length >= 2 ? navHistory[navHistory.length - 2] : null;

    let backBtn = null;
    node.connects.forEach(cid => {
      const tgt = nodeMap[cid];
      const btn = document.createElement('button');
      if (cid === prevId || tgt.type === 'origin') {
        btn.className   = 'smap-nav-btn smap-back-btn';
        btn.textContent = `← 返回`;
        btn.addEventListener('click', e => { e.stopPropagation(); goBack(); });
        backBtn = btn;
      } else {
        btn.className   = 'smap-nav-btn';
        btn.textContent = `→ ${tgt.title}`;
        btn.addEventListener('click', e => { e.stopPropagation(); navigateTo(cid); });
        el.appendChild(btn);
      }
    });
    if (backBtn) el.appendChild(backBtn);
  }

  // ── Event delegation ──────────────────────────────────────
  canvas.addEventListener('click', e => {
    const enterBtn = e.target.closest('.smap-enter-btn');
    if (enterBtn && !enterBtn.disabled && !enterBtn.hasAttribute('disabled')) {
      runPortalTransition(nodeMap[currentId].url);
      return;
    }
    if (e.target.closest('.smap-back-btn')) { e.stopPropagation(); goBack(); return; }
    const nodeEl = e.target.closest('.smap-node');
    if (nodeEl && !nodeEl.classList.contains('dimmed') && nodeEl.id !== `smap-n-${currentId}`) {
      navigateTo(nodeEl.id.replace('smap-n-', ''));
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && currentId !== 'origin') goBack();
  });

  window.addEventListener('resize', () => panTo(currentId, false));

  section.addEventListener('mouseover', e => {
    if (e.target.closest('.smap-node, button, a')) document.body.classList.add('cursor-hover');
  });
  section.addEventListener('mouseout', e => {
    if (e.target.closest('.smap-node, button, a')) document.body.classList.remove('cursor-hover');
  });

  const copyrightBtn  = document.getElementById('smap-copyright-btn');
  const footerPanel   = document.getElementById('smap-footer-panel');
  const footerLicense = document.getElementById('smap-footer-license');
  const footerWrapper = document.getElementById('smap-footer');
  copyrightBtn.addEventListener('click', () => {
    const isOpen = footerPanel.classList.toggle('open');
    footerLicense.classList.toggle('open', isOpen);
    footerWrapper.classList.toggle('open', isOpen);
    footerPanel.setAttribute('aria-hidden', String(!isOpen));
    footerLicense.setAttribute('aria-hidden', String(!isOpen));
  });
  copyrightBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyrightBtn.click(); }
  });

  // ── Zoom controls ─────────────────────────────────────────
  gsap.set(canvas, { transformOrigin: '0 0' });

  document.getElementById('smap-zoom-in').addEventListener('click',    () => setZoom(zoomLevel + ZOOM_STEP));
  document.getElementById('smap-zoom-out').addEventListener('click',   () => setZoom(zoomLevel - ZOOM_STEP));
  document.getElementById('smap-zoom-level').addEventListener('click', () => setZoom(1.0));

  viewport.addEventListener('wheel', e => {
    e.preventDefault();
    setZoom(zoomLevel + (e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP) * 0.7, false);
  }, { passive: false });

  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === '=' || e.key === '+') { e.preventDefault(); setZoom(zoomLevel + ZOOM_STEP); }
    else if (e.key === '-')             { e.preventDefault(); setZoom(zoomLevel - ZOOM_STEP); }
    else if (e.key === '0')             { e.preventDefault(); setZoom(1.0); }
  });

  // ── Init ──────────────────────────────────────────────────
  buildLines();
  buildNodes();
  panTo('origin', false);
  updateUI();

  const vEl = document.getElementById('smap-cache-version');
  if (vEl) {
    const v = (document.querySelector('script[src*="main.js"]')?.src.match(/[?&]v=(\w+)/) || [])[1];
    if (v) vEl.textContent = v;
  }

  // ── Entrance animation ────────────────────────────────────
  gsap.set('#smap-n-origin',                 { opacity: 0, scale: 0.82 });
  gsap.set('.smap-node:not(#smap-n-origin)', { opacity: 0, scale: 0.88 });
  gsap.set('.smap-corner-label',             { opacity: 0 });
  gsap.set('#smap-hud',                      { opacity: 0, y: 8 });
  gsap.set('#smap-zoom',                     { opacity: 0, y: 8 });
  gsap.set('#smap-footer',                   { opacity: 0, y: 10 });

  gsap.to('#smap-n-origin', {
    opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.4)', delay: 0.3,
    onComplete() {
      const allLines = Object.values(lineMap);
      allLines.forEach(({ base }, i) => {
        gsap.to(base, { opacity: 1, duration: 1.0, ease: 'power2.out', delay: i * 0.1 });
      });
      gsap.to('.smap-node:not(#smap-n-origin)', {
        opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)',
        stagger: 0.08, delay: 0.1
      });
      gsap.to('.smap-corner-label', { opacity: 1, duration: 0.5, delay: 0.2 });
      gsap.to('#smap-hud',          { opacity: 1, y: 0, duration: 0.5, delay: 0.3 });
      gsap.to('#smap-zoom',         { opacity: 1, y: 0, duration: 0.5, delay: 0.35 });
      gsap.to('#smap-footer',       { opacity: 1, y: 0, duration: 0.5, delay: 0.4 });
      setTimeout(() => updateUI(), 1800);
    }
  });
})();

// ── THEME TOGGLE ─────────────────────────────────────────
(function initTheme() {
  const smapBtn = document.getElementById('smap-theme-btn');
  const root    = document.documentElement;

  function applyTheme(dark) {
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    smapBtn.setAttribute('aria-label', dark ? '切換淺色模式' : '切換深色模式');
  }

  smapBtn.addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') !== 'dark';
    sessionStorage.setItem('theme', dark ? 'dark' : 'light');
    applyTheme(dark);
  });

  window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', e => {
    if (!sessionStorage.getItem('theme')) applyTheme(e.matches);
  });

  smapBtn.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  smapBtn.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
})();
