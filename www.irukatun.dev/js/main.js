history.scrollRestoration = 'manual';
gsap.registerPlugin(ScrollTrigger);

// 時間軸預設從最上方（最舊）開始，往下滾動時間往後（越新）
document.querySelectorAll('.proj-tline').forEach(tl => {
  const updateMask = () => {
    tl.classList.toggle('tline-at-top',    tl.scrollTop <= 1);
    tl.classList.toggle('tline-at-bottom', tl.scrollTop + tl.clientHeight >= tl.scrollHeight - 1);
  };
  updateMask();
  tl.addEventListener('scroll', updateMask);
});


// ── HAMBURGER MENU ───────────────────────────────────────
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');

let _navWasHidden = false;
let _navUnlocked  = false;

function unlockNavLinks() {
  if (_navUnlocked) return;
  _navUnlocked = true;
  gsap.to(['.nav-links', '.nav-hamburger'], {
    opacity: 1, pointerEvents: 'auto',
    duration: .8, ease: 'power3.out'
  });
}

function setNavbarHidden(hidden) {
  // Keep navbar accessible while the mobile menu is open.
  if (mobileMenu.classList.contains('open')) hidden = false;
  navbar.style.pointerEvents = hidden ? 'none' : 'auto';
  document.body.classList.toggle('nav-hidden', hidden);
  gsap.to(navbar, {
    yPercent: hidden ? -130 : 0,
    autoAlpha: hidden ? 0 : 1,
    duration: 1,
    ease: hidden ? 'power3.in' : 'power3.out',
    overwrite: true
  });
  if (hidden) { _navWasHidden = true; }
  else if (_navWasHidden) { unlockNavLinks(); }
}

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  setNavbarHidden(false);
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    setNavbarHidden(false);
  });
});

// ── SET INITIAL STATES via GSAP (not CSS) ───────────────
gsap.set(['.nav-links', '.nav-hamburger'], { opacity:0, pointerEvents:'none' });
gsap.set(['#lbl-about','#lbl-skills','#lbl-certs','#lbl-projects'], { opacity:0, x:-18 });
gsap.set('#about .tword, #skills .tword, #certs .tword, #projects .tword', { y:'110%' });
gsap.set(['#about-card','#about-right'], { opacity:0, y:60 });
gsap.set('.skill-row', { opacity:0, y:48, scale:.95 });
gsap.set(['.skills-map-label','.skills-map-hint'], { opacity:0, y:12 });
gsap.set('#skill-desc', { opacity:0, y:24 });
gsap.set(['.cert-scope-label','.cert-filter'], { opacity:0, y:12 });
gsap.set('#terminal', { opacity:0, scale:.86, y:0 });
gsap.set('.term-hint', { clipPath:'inset(0% 0% 100% 0%)', y:-6 });
gsap.set('.cert-nav-group', { opacity:0, y:8 });
gsap.set('.cert-card', { opacity:0, y:48, scale:.95 });
gsap.set('.proj-row', { opacity:0, y:56 });
gsap.set('.proj-visual', { scale:.91 });
gsap.set('.proj-name', { y:20 });
gsap.set('.proj-desc', { y:14 });
gsap.set('.proj-tline', { y:14 });
gsap.set('.proj-blog-link', { y:10 });

// ── CURSOR ──────────────────────────────────────────────
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = window.innerWidth/2, my = window.innerHeight/2;
let rx = mx, ry = my;

document.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  mx = e.clientX; my = e.clientY;
  if (cur.style.opacity === '0' || cur.style.opacity === '') {
    cur.style.opacity = '1';
    ring.style.opacity = '1';
  }
  gsap.to(cur, { x: mx, y: my, duration: .08, ease: 'none' });
});


document.querySelectorAll('a, button, .cert-card, .chip, .stag[data-tip]').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── SKILL TAG CAROUSEL ───────────────────────────────────
const skillDesc = document.getElementById('skill-desc');
const strip = document.getElementById('skill-desc-strip');
const skillTags = [...document.querySelectorAll('.stag[data-tip]')];
let skillIdx = 0;
let carouselTimer = null;
let isAnimating = false;
let ITEM_H = 0;

function tagAt(offset) {
  return skillTags[(skillIdx + offset + skillTags.length * 100) % skillTags.length];
}

const DIM = 0.35;

function makeItem(tag, isCur) {
  const el = document.createElement('div');
  el.className = 'skill-desc-item' + (isCur ? ' sd-cur' : '');
  el.innerHTML = `<span class="sdi-name">${tag.textContent}</span><span class="sdi-text">${tag.dataset.tip}</span>`;
  gsap.set(el, { opacity: isCur ? 1 : DIM });
  return el;
}

function updateActiveTag() {
  skillTags.forEach((t, i) => t.classList.toggle('active', i === skillIdx));
}

function initStrip() {
  strip.innerHTML = '';
  strip.appendChild(makeItem(tagAt(-1), false));
  strip.appendChild(makeItem(tagAt(0),  true));
  strip.appendChild(makeItem(tagAt(1),  false));
  gsap.set(strip, { y: 0 });
  ITEM_H = strip.firstChild.offsetHeight;
  updateActiveTag();
}

function setStripOpacities() {
  [...strip.children].forEach((el, i) => gsap.set(el, { opacity: i === 1 ? 1 : DIM }));
}

function advance() {
  if (isAnimating) return;
  isAnimating = true;

  const curEl = strip.children[1];
  curEl.classList.remove('sd-cur');
  skillTags.forEach(t => t.classList.remove('active'));

  // 淡出後才開始推
  gsap.to(curEl, { opacity: DIM, duration: 0.6, ease: 'power1.out', onComplete: () => {
    skillIdx = (skillIdx + 1) % skillTags.length;
    strip.appendChild(makeItem(tagAt(1), false));

    gsap.to(strip, {
      y: `-=${ITEM_H}`, duration: 0.6, ease: 'power2.inOut',
      onComplete: () => {
        strip.removeChild(strip.firstChild);
        gsap.set(strip, { y: 0 });
        [...strip.children].forEach((el, i) => el.classList.toggle('sd-cur', i === 1));
        // 淡入新中間那排 + 亮起標籤
        gsap.to(strip.children[1], { opacity: 1, duration: 0.6, ease: 'power1.in' });
        updateActiveTag();
        isAnimating = false;
      }
    });
  }});
}

let touchResumeTimer = null;

function showTagInCenter(tag) {
  const cur = strip.querySelector('.sd-cur');
  gsap.to(cur, { opacity: 0, duration: 0.15, onComplete: () => {
    cur.querySelector('.sdi-name').textContent = tag.textContent;
    cur.querySelector('.sdi-text').textContent = tag.dataset.tip;
    gsap.to(cur, { opacity: 1, duration: 0.2 });
  }});
  skillTags.forEach(t => t.classList.remove('active'));
  tag.classList.add('active');
}

function restoreCenter() {
  const cur = strip.querySelector('.sd-cur');
  const current = skillTags[skillIdx];
  gsap.to(cur, { opacity: 0, duration: 0.15, onComplete: () => {
    cur.querySelector('.sdi-name').textContent = current.textContent;
    cur.querySelector('.sdi-text').textContent = current.dataset.tip;
    setStripOpacities();
  }});
  updateActiveTag();
}

skillTags.forEach(tag => {
  // 桌機：滑鼠懸停
  tag.addEventListener('mouseenter', () => {
    clearInterval(carouselTimer);
    showTagInCenter(tag);
  });
  tag.addEventListener('mouseleave', () => {
    if (touchResumeTimer) return; // 已點擊鎖定，讓 timer 自己還原
    restoreCenter();
    startCarousel();
  });
  // 點擊（桌機 click / 手機 touchstart）：顯示 5 秒後恢復
  tag.addEventListener('click', () => {
    clearInterval(carouselTimer);
    clearTimeout(touchResumeTimer);
    showTagInCenter(tag);
    touchResumeTimer = setTimeout(() => {
      touchResumeTimer = null;
      restoreCenter();
      startCarousel();
    }, 5000);
  });
  tag.addEventListener('touchstart', () => {
    clearInterval(carouselTimer);
    clearTimeout(touchResumeTimer);
    showTagInCenter(tag);
    touchResumeTimer = setTimeout(() => {
      touchResumeTimer = null;
      restoreCenter();
      startCarousel();
    }, 5000);
  }, { passive: true });
});

function startCarousel() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(advance, 3500);
}

initStrip();
startCarousel();

(function tickRing() {
  rx += (mx - rx) * .12;
  ry += (my - ry) * .12;
  gsap.set(ring, { x: rx, y: ry });
  requestAnimationFrame(tickRing);
})();

// ── TRAIL DOTS ──────────────────────────────────────────
const TRAIL = 9;
const dots = [];
for (let i = 0; i < TRAIL; i++) {
  const d = document.createElement('div');
  d.className = 'trail-dot';
  const s = (5.5 - i * .4);
  d.style.cssText = `width:${s}px;height:${s}px;opacity:${(1 - i/TRAIL) * .38}`;
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

// ── NAV ENTRANCE ────────────────────────────────────────
gsap.fromTo('#navbar',
  { yPercent: -130, autoAlpha: 0 },
  { yPercent: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', delay: .7, overwrite: true }
);

// ── SITEMAP NAV HIDE ─────────────────────────────────────
// #sitemap is the last section (100lvh). Use scroll progress so the trigger
// point is always precise regardless of browser scroll boundary behaviour.
(function initSitemapNavHide() {
  function check() {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    setNavbarHidden(window.scrollY >= maxScroll - 1);
  }
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

// ── HERO ENTRANCE (staggered, weighty) ──────────────────
const heroTL = gsap.timeline({ delay: .25 });

heroTL
  .fromTo('#hero-mono-text',
    { y: '110%' },
    { y: '0%', duration: .85, ease: 'power3.out' }
  )
  .fromTo('.hero-title',
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: .9, ease: 'power3.out' },
    '-=.45'
  )
  .call(() => startTypewriter(), null, '<')
  .fromTo('#hero-sub',
    { opacity: 0, y: 22 },
    { opacity: 1, y: 0, duration: .9, ease: 'power3.out' },
    '-=.5'
  )
  .fromTo('#hero-chips',
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: .75, ease: 'power3.out' },
    '-=.55'
  )
  .fromTo('#hero-scroll',
    { opacity: 0 },
    { opacity: 1, duration: .6 },
    '-=.2'
  );

// ── TYPEWRITER ───────────────────────────────────────────
// Each phrase: array of segments { t: text, c: optional css class }
// \n in text = new .line block
const TW_PHRASES = [
  [{ t: '作業可以晚交，\n但Deploy\n' }, { t: '不行', c: 'ow' }, { t: '。' }], 
  [{ t: '別人高中在刷題，\n我在刷\n' }, { t: 'Git commit。', c: 'ow' }],
  [{ t: '不是資優生，\n但伺服器\n' }, { t: '從不當機', c: 'ow' }, { t: '。' }],
];

function twPhraseLen(segs) {
  return segs.reduce((s, seg) => s + seg.t.length, 0);
}

function twRender(segs, pos) {
  // collect chars with their class
  const chars = [];
  let rem = pos;
  for (const seg of segs) {
    if (rem <= 0) break;
    const slice = seg.t.slice(0, rem);
    for (const ch of slice) chars.push({ ch, c: seg.c });
    rem -= seg.t.length;
  }
  // split into lines at \n
  const lines = [[]];
  for (const item of chars) {
    if (item.ch === '\n') lines.push([]);
    else lines[lines.length - 1].push(item);
  }
  // drop trailing empty line (caused by a \n not yet followed by text)
  if (lines.length > 1 && lines[lines.length - 1].length === 0) lines.pop();
  // render each line as a .line span with optional .ow spans
  return lines.map((line, idx) => {
    let html = '';
    let i = 0;
    while (i < line.length) {
      const c = line[i].c;
      let j = i;
      while (j < line.length && line[j].c === c) j++;
      const text = line.slice(i, j).map(x => x.ch).join('');
      html += c ? `<span class="${c}">${text}</span>` : text;
      i = j;
    }
    if (idx === lines.length - 1) html += '<span class="tw-cursor">|</span>';
    return `<span class="line">${html}</span>`;
  }).join('');
}

const twEl = document.getElementById('tw-text');
let twPhrase = 0, twPos = 0, twDeleting = false;

function startTypewriter() { twTick(); }

function twTick() {
  const segs = TW_PHRASES[twPhrase];
  const len = twPhraseLen(segs);
  if (!twDeleting) {
    twPos++;
    twEl.innerHTML = twRender(segs, twPos);
    if (twPos === len) {
      setTimeout(() => { twDeleting = true; twTick(); }, 2600);
      return;
    }
    setTimeout(twTick, 40 + Math.random() * 25);
  } else {
    twPos--;
    twEl.innerHTML = twRender(segs, twPos);
    if (twPos === 0) {
      twDeleting = false;
      twPhrase = (twPhrase + 1) % TW_PHRASES.length;
      setTimeout(twTick, 450);
      return;
    }
    setTimeout(twTick, 30 + Math.random() * 20);
  }
}

// ── BALL EXPAND ON SCROLL ────────────────────────────────
const ballOverlay = document.getElementById('ball-overlay');
const startR = () => parseFloat(getComputedStyle(document.documentElement).fontSize) * 14;

const getLvh = () => {
  const t = document.createElement('div');
  t.style.position = 'fixed';
  t.style.height = '100lvh';
  t.style.width = '0';
  t.style.top = '0';
  t.style.pointerEvents = 'none';
  t.style.visibility = 'hidden';
  document.body.appendChild(t);
  const h = t.getBoundingClientRect().height;
  document.body.removeChild(t);
  return h;
};

const maxR = () => {
  const w = window.innerWidth;
  const h = getLvh();
  const cx = w * 0.92;
  const cy = h * 0.84;
  return Math.max(
    Math.hypot(cx, cy),
    Math.hypot(w - cx, cy),
    Math.hypot(cx, h - cy),
    Math.hypot(w - cx, h - cy)
  ) + 2;
};

ScrollTrigger.create({
  trigger: '#hero-wrap',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1.8,
  onUpdate: ({ progress }) => {
    const r = startR() + progress * (maxR() - startR());
    ballOverlay.style.clipPath = `circle(${r}px at 92% 84%)`;
  }
});
// ── CERT MODAL ────────────────────────────────────────────
const CERT_DATA = {
  1: {
    tag: '程式設計能力檢測',
    title: 'APCS 大學程式設計先修檢測',
    issuer: '教育部 / 國立臺灣師範大學',
    date: '2026/03',
    intro: 'APCS（Advanced Placement Computer Science）是由教育部委託國立臺灣師範大學資訊工程學系辦理的程式設計能力檢測，分為「觀念題」與「實作題」兩科，各分為五個級分，主要考察程式邏輯觀念與實際解題，供高中生了解自身程式設計能力，並作為大學申請入學的參考依據',
    scores: ['觀念第四級（2026年3月8日場）', '實作第二級（2024年6月16日場）'],
    chartImg: 'img/cert_apcs_chart.jpg',
    img: 'img/cert_apcs_score.png',
    body: '從小就立志考要往資訊方向發展的我，在進入高中前就已打聽到了 APCS 檢測，高一上的我帶著幾分不熟悉，去嘗試參加了第一次的檢定，這是我人生中第一次經歷標準的程式檢測，甚至進入考場後因為缺乏熟悉的開發環境還讓當時的我顯得有些不適應。在這三年的期間，我多次讓自己去參賽，這增加了我許多的臨場經驗，慢慢地熟悉了考試的流程，而我的程式能力也隨著我不斷的開發、實作，特別是從高二下以後自主學習專題開始，我持續累積實作經驗，在 2025 年 6 月的檢測後，經歷接近一年的學測準備，在學測結束的兩個月的 2026 年 3 月再次應考，觀念題從原先的二級直接略過了三級，直接躍升至第四級，這給了我大量的成就感，也讓我對持續精進保有動力，就在打下這篇心得的這兩天，我正報名了 2026 年 7 月的檢測（Python題本+中高級），期待自己在學測後的這段時間，可以經由繼續的努力，讓自己的實作水平成功克服中高級題本的難度！',
  },
  2: {
    tag: '資訊',
    title: 'Azure AI Fundamentals',
    issuer: 'Microsoft 微軟',
    date: '2025/08',
    intro: 'Azure AI Fundamentals（AI-900）是 Microsoft 針對 AI 基礎概念所推出的入門認證，涵蓋機器學習、電腦視覺、自然語言處理及 Azure 相關 AI 服務的核心知識，適合初步建立 AI 領域認知的學習者。',
    body: '準備 AI-900 的過程中，我第一次系統性地接觸了機器學習與 Azure 雲端服務的架構，對於 AI 的應用場景有了更全面的認識。雖然是入門級認證，但它讓我建立起後續深入學習 AI 的基礎框架。',
    img: '',
  },
  3: {
    tag: '資訊',
    title: '生成式AI能力認證',
    issuer: '財團法人資訊工業策進會',
    date: '2025/07',
    intro: '生成式AI能力認證由財團法人資訊工業策進會（資策會）辦理，針對生成式 AI 的原理、應用與倫理議題進行評量，旨在協助學習者掌握 LLM、提示工程及 AI 工具實際應用的基本能力。',
    body: '取得此認證讓我對生成式 AI 的運作原理與實務應用有更紮實的理解，尤其在提示工程與 AI 工具的有效運用上收穫最多，也進一步強化了我對 AI 輔助開發的興趣。',
    img: '',
  },
  4: { tag: '資訊', title: '學生自主學習動態展', issuer: '財團法人桃園市復旦高級中等學校', date: '2025/07', body: '', img: '' },
  5: { tag: '國語文寫作', title: '生活寫作優良獎狀', issuer: '財團法人桃園市復旦高級中等學校', date: '2025/06', body: '', img: '' },
  6: { tag: '醫學', title: '心肺復甦術(CPR)急救證書', issuer: '台灣急救教育推廣與諮詢中心', date: '2024/10', body: '', img: '' },
};

const certGrid = document.querySelector('.cert-grid');
document.getElementById('cert-nav-prev').addEventListener('click', () => {
  certGrid.scrollBy({ left: -300, behavior: 'smooth' });
});
document.getElementById('cert-nav-next').addEventListener('click', () => {
  certGrid.scrollBy({ left: 300, behavior: 'smooth' });
});

const certBackdrop = document.getElementById('cert-modal-backdrop');
const certModal    = document.getElementById('cert-modal');

function openCertModal(id) {
  const d = CERT_DATA[id];
  document.getElementById('cert-modal-tag').textContent   = d.tag;
  document.getElementById('cert-modal-title').textContent = d.title;
  document.getElementById('cert-modal-meta').textContent  = d.issuer + '　·　' + d.date;
  const content = document.getElementById('cert-modal-content');
  content.innerHTML = '';
  function addSection(title, buildFn) {
    const sec = document.createElement('div');
    sec.className = 'cert-modal-section';
    const h = document.createElement('div');
    h.className = 'cert-section-title'; h.textContent = title;
    sec.appendChild(h);
    buildFn(sec);
    content.appendChild(sec);
  }
  if (d.intro) {
    addSection('檢測介紹', sec => {
      const p = document.createElement('div');
      p.className = 'cert-modal-plain'; p.textContent = d.intro;
      sec.appendChild(p);
    });
  }
  if (d.scores?.length) {
    addSection('歷年最高成績', sec => {
      d.scores.forEach(line => {
        const item = document.createElement('div');
        item.className = 'cert-grade-item'; item.textContent = line;
        sec.appendChild(item);
      });
    });
  }
  if (d.body) {
    addSection('心得', sec => {
      const p = document.createElement('div');
      p.className = 'cert-modal-plain'; p.textContent = d.body;
      sec.appendChild(p);
    });
  } else {
    const notice = document.createElement('div');
    notice.className = 'cert-modal-incomplete';
    notice.textContent = '✏️ 此部分尚未撰寫完成，敬請期待。';
    content.appendChild(notice);
  }
  if (d.chartImg) {
    addSection('歷年成績', sec => {
      const img = document.createElement('img');
      img.src = d.chartImg; img.alt = '歷年成績'; img.className = 'cert-section-img';
      sec.appendChild(img);
    });
  }
  if (d.img) {
    addSection('最新成績單（2026年3月8日場）', sec => {
      const img = document.createElement('img');
      img.src = d.img; img.alt = d.title; img.className = 'cert-section-img';
      sec.appendChild(img);
    });
  } else if (d.body) {
    const notice = document.createElement('div');
    notice.className = 'cert-modal-incomplete';
    notice.textContent = '✏️ 此部分尚未撰寫完成，敬請期待。';
    content.appendChild(notice);
  }
  certBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  gsap.fromTo(certModal,
    { y: '100%' },
    { y: 0, duration: 0.55, ease: 'expo.out' }
  );
}

function closeCertModal() {
  gsap.to(certModal, {
    y: '100%',
    duration: 0.35,
    ease: 'power2.in',
    onComplete() {
      certBackdrop.classList.remove('open');
      document.querySelectorAll('.cert-card').forEach(c => c.classList.remove('active'));
      document.body.style.overflow = '';
    }
  });
}

document.querySelectorAll('.cert-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.add('active');
    openCertModal(card.dataset.cert);
  });
});
certBackdrop.addEventListener('click', closeCertModal);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeCertModal(); });


function onEnterOnce(trigger, fn, start = 'top 70%') {
  ScrollTrigger.create({ trigger, start, once: true, onEnter: fn });
}

// ── ABOUT ────────────────────────────────────────────────
onEnterOnce('#lbl-about', () =>
  gsap.to('#lbl-about', { opacity:1, x:0, duration:1, ease:'power3.out' }), 'top 70%'
);
onEnterOnce('#about .s-title', () =>
  gsap.to('#about .tword', { y:'0%', duration:1.4, ease:'power4.out', stagger:.1 }), 'top 70%'
);
onEnterOnce('#about-card', () => {
  gsap.to('#about-card',  { opacity:1, y:0, duration:1.4, ease:'power3.out' });
  gsap.to('#about-right', { opacity:1, y:0, duration:1.4, ease:'power3.out', delay:.18 });
}, 'top 70%');

// ── SKILLS ───────────────────────────────────────────────
onEnterOnce('#lbl-skills', () =>
  gsap.to('#lbl-skills', { opacity:1, x:0, duration:1, ease:'power3.out' }), 'top 70%'
);
onEnterOnce('#skills .s-title', () =>
  gsap.to('#skills .tword', { y:'0%', duration:1.4, ease:'power4.out', stagger:.1 }), 'top 70%'
);
onEnterOnce('.skills-map-label', () =>
  gsap.to(['.skills-map-label:not(.cert-scope-label)','.skills-map-hint'], { opacity:1, y:0, duration:1.1, ease:'power3.out', stagger:.18 }), 'top 80%'
);
onEnterOnce('.skill-domains', () =>
  gsap.to('.skill-row', { opacity:1, y:0, scale:1, duration:1.2, ease:'back.out(1.4)', stagger:.1 }), 'top 70%'
);
onEnterOnce('#skill-desc', () =>
  gsap.to('#skill-desc', { opacity:1, y:0, duration:1.1, ease:'power3.out', delay:.3 }), 'top 80%'
);
onEnterOnce('#terminal', () => {
  gsap.to('#terminal', { opacity:1, scale:1, duration:.75, ease:'back.out(1.25)', delay:.2 });
  gsap.to('.term-hint', { clipPath:'inset(0% 0% 0% 0%)', y:0, duration:.65, ease:'power2.out', delay:1.0 });
}, 'top 90%');

// ── CERTS ────────────────────────────────────────────────
onEnterOnce('#lbl-certs', () =>
  gsap.to('#lbl-certs', { opacity:1, x:0, duration:1, ease:'power3.out' }), 'top 70%'
);
onEnterOnce('#certs .s-title', () => {
  gsap.to('#certs .tword', { y:'0%', duration:1.4, ease:'power4.out', stagger:.1 });
  gsap.to(['.cert-scope-label','.cert-filter'], { opacity:1, y:0, duration:1.1, ease:'power3.out', stagger:.18, delay:.5 });
}, 'top 70%');
onEnterOnce('.cert-grid', () => {
  gsap.to('.cert-card', { opacity:1, y:0, scale:1, duration:1.2, ease:'back.out(1.4)', stagger:.1 });
  gsap.to('.cert-nav-group', { opacity:1, y:0, duration:.6, ease:'power2.out', delay:1.1 });
}, 'top 70%');

// ── CERT DOMAIN FILTER ───────────────────────────────────
(function() {
  const toggle = document.getElementById('cert-filter-toggle');
  const cards  = [...document.querySelectorAll('.cert-card')];
  toggle.addEventListener('change', () => {
    cards.forEach(card => {
      const isInfo = [...card.querySelectorAll('.cert-tag')].some(t => t.textContent.trim() === '資訊');
      if (toggle.checked && !isInfo) {
        gsap.to(card, { opacity:.08, scale:.93, duration:.3, ease:'power2.out', pointerEvents:'none' });
      } else {
        gsap.to(card, { opacity:1, scale:1, duration:.3, ease:'power2.out', clearProps:'pointerEvents' });
      }
    });
  });
})();

// ── PROJECTS ─────────────────────────────────────────────
onEnterOnce('#lbl-projects', () =>
  gsap.to('#lbl-projects', { opacity:1, x:0, duration:1, ease:'power3.out' }), 'top 70%'
);
onEnterOnce('#projects .s-title', () =>
  gsap.to('#projects .tword', { y:'0%', duration:1.4, ease:'power4.out', stagger:.1 }), 'top 70%'
);
document.querySelectorAll('.proj-row').forEach(row => {
  onEnterOnce(row, () => {
    const visual  = row.querySelector('.proj-visual');
    const bodyEls = row.querySelectorAll('.proj-tag,.proj-name,.proj-desc,.proj-tline,.proj-stacks,.proj-blog-link');
    gsap.to(row,     { opacity:1, y:0, duration:.65, ease:'power3.out' });
    gsap.to(visual,  { scale:1, duration:1.15, ease:'back.out(1.3)', delay:.1 });
    gsap.to(bodyEls, { y:0, duration:.9, ease:'power3.out', stagger:.07, delay:.18 });
  }, 'top 65%');
});

// Project detail pages are not ready yet; show a temporary notice instead of navigating.
let projToastTimer = null;
let projToastEl = null;

function showProjectToast(msg = '此內容尚未撰寫完成，敬請期待。') {
  if (!projToastEl) {
    projToastEl = document.createElement('div');
    projToastEl.className = 'proj-toast';
    document.body.appendChild(projToastEl);
  }

  projToastEl.textContent = msg;
  gsap.killTweensOf(projToastEl);
  gsap.fromTo(projToastEl,
    { y: 14, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out' }
  );

  clearTimeout(projToastTimer);
  projToastTimer = setTimeout(() => {
    gsap.to(projToastEl, { y: 10, opacity: 0, duration: 0.24, ease: 'power2.in' });
  }, 1800);
}

document.querySelectorAll('.proj-blog-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showProjectToast();
  });
});


// ── INTERACTIVE TERMINAL ──────────────────────────────────────
(function initTerminal() {
  const USER      = 'irukatun';
  const HOST      = 'iruka_pc_studio';
  const promptStr = () => `<span class="tp">${USER}@${HOST}</span><span class="tc">:~$ </span>`;

  /* ── DOM REFS ── */
  const termEl      = document.getElementById('terminal');
  const termBody    = termEl.querySelector('.term-body');
  const promptLabel = document.getElementById('term-prompt-label');
  const inputMirror = document.getElementById('term-input-mirror');
  const promptLine  = document.getElementById('term-prompt-line');

  promptLabel.innerHTML = promptStr();

  /* ── LAST LOGIN ── */
  (function() {
    const d = new Date(Date.now() - 9000000); // 150 min ago
    const D = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const pad = n => String(n).padStart(2,'0');
    const str = `${D[d.getDay()]} ${M[d.getMonth()]} ${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getFullYear()} from 127.0.0.1`;
    document.getElementById('term-last-login').innerHTML = `<span class="tco">Last login: ${str}</span>`;
  })();

  let currentInput = '';
  let cmdHistory = [], histIdx = -1;
  let sudoMode = false, sudoTries = 0;
  let busy = false;

  /* ── HIDDEN TEXTAREA（喚起手機虛擬鍵盤）──
     使用 textarea 而非 input[type=search]：
     textarea 能正確回報游標位置給 Android InputConnection API，
     避免 IME 誤判插入點為 0 導致字元反序。 */
  const termInput = document.createElement('textarea');
  termInput.rows = 1;
  ['autocomplete','autocorrect','autocapitalize'].forEach(a => termInput.setAttribute(a,'off'));
  termInput.setAttribute('spellcheck','false');
  termInput.setAttribute('inputmode','text');
  termInput.setAttribute('tabindex','-1');
  termInput.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;bottom:0;left:0;border:none;outline:none;background:transparent;resize:none;overflow:hidden;';
  termEl.style.position = 'relative';
  termEl.appendChild(termInput);

  const syncEnd = () => termInput.setSelectionRange(termInput.value.length, termInput.value.length);

  termEl.addEventListener('click', () => { termInput.focus(); syncEnd(); });
  termInput.addEventListener('focus', () => termEl.classList.add('focused'));
  termInput.addEventListener('blur',  () => termEl.classList.remove('focused'));

  let isComposing = false;
  termInput.addEventListener('compositionstart', () => { isComposing = true; });
  termInput.addEventListener('compositionend', () => {
    isComposing = false;
    const val = termInput.value.replace(/[\r\n]/g, '');
    if (val !== termInput.value) termInput.value = val;
    currentInput = val;
    inputMirror.textContent = currentInput;
    syncEnd();
  });

  termInput.addEventListener('input', () => {
    if (busy)     { termInput.value = currentInput; return; }
    if (sudoMode) { termInput.value = ''; return; }
    const val = termInput.value.replace(/[\r\n]/g, '');
    if (val !== termInput.value) termInput.value = val;
    currentInput = val;
    inputMirror.textContent = currentInput;
    if (!isComposing) syncEnd();
  });

  termInput.addEventListener('keydown', e => {
    if (busy) { e.preventDefault(); return; }
    if (e.key === 'Enter')     { e.preventDefault(); onEnter(); return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); navHistory(1);  return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); navHistory(-1); return; }
    if (e.key === 'Tab')       { e.preventDefault(); return; }
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      if (sudoMode) {
        appendLine('<span class="tco">[sudo] 請輸入 irukatun 的密碼：</span><span class="term-err">^C</span>');
        sudoMode = false; sudoTries = 0; resetPrompt();
      } else {
        appendLine(`${promptStr()}${esc(currentInput)}<span class="term-err">^C</span>`);
        currentInput = ''; termInput.value = ''; inputMirror.textContent = '';
      }
      return;
    }
    if (e.ctrlKey && e.key === 'l') { e.preventDefault(); clearTerm(); return; }
  });

  function navHistory(dir) {
    if (!cmdHistory.length) return;
    histIdx = Math.max(-1, Math.min(cmdHistory.length - 1, histIdx + dir));
    currentInput = histIdx >= 0 ? cmdHistory[cmdHistory.length - 1 - histIdx] : '';
    termInput.value = currentInput;
    syncEnd();
    inputMirror.textContent = currentInput;
  }

  function onEnter() {
    const val = currentInput;
    currentInput = ''; termInput.value = ''; inputMirror.textContent = ''; histIdx = -1;
    if (sudoMode) {
      appendLine('<span class="tco">[sudo] 請輸入 irukatun 的密碼：</span>');
      sudoTries++;
      if (sudoTries >= 3) {
        appendLine(`<span class="term-err">sudo: 密碼錯誤 ${sudoTries} 次</span>`);
        sudoMode = false; sudoTries = 0; resetPrompt();
      } else {
        appendLine('<span class="term-err">密碼錯誤，再試一次。</span>');
      }
      return;
    }
    const trimmed = val.trim();
    appendLine(`${promptStr()}${esc(trimmed)}`);
    if (!trimmed) return;
    cmdHistory.push(trimmed);
    run(trimmed);
  }

  function resetPrompt() { promptLabel.innerHTML = promptStr(); }
  function sudoPrompt()  { promptLabel.innerHTML = '<span class="tco">[sudo] 請輸入 irukatun 的密碼：</span>'; }

  /* ── COMMAND ROUTER ── */
  function run(input) {
    const argv = input.trim().split(/\s+/);
    const cmd  = argv[0].toLowerCase();
    const map  = {
      help: () => cmdHelp(),
      cls: () => appendLine('<span class="term-err">這裡不是 Windows 喔</span>'),
      whoami: () => cmdWhoami(),
      id:     () => cmdId(),
      cat: () => cmdCat(argv),
      cd:  () => appendLine('<span class="tv">💿 這是一個什麼都沒有的CD片...</span>'),
      apt: () => cmdApt(argv),
      sudo: () => cmdSudo(argv),
      git: () => cmdGit(argv),
      ping: () => cmdPing(argv),
      neofetch: cmdNeofetch, fastfetch: cmdNeofetch,
      clear: clearTerm,
      pwd:    () => appendLine('<span class="tv">/home/irukatun</span>'),
      uname:  () => appendLine(`<span class="tv">Linux ${HOST} 6.12.15-irukatun #1 aarch64 GNU/Linux</span>`),
      date:   () => appendLine(`<span class="tv">${new Date().toLocaleString('zh-TW', {weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>`),
      uptime: () => appendLine(`<span class="tv">${new Date().toLocaleTimeString('zh-TW')} 已運行 1234 天 5:16，7 位使用者，系統負載：2.30 4.60 4.10</span>`),
      echo:   () => appendLine(`<span class="tv">${esc(argv.slice(1).join(' '))}</span>`),
      coffee: cmdCoffee, '咖啡': cmdCoffee,
      unminimize: () => {
        appendLine('<span class="tco">正在嘗試還原最小化安裝...</span>');
        setTimeout(() => appendLine('<span class="term-err">unminimize: 此為展示環境，無法擴展。豚豚說不行就是不行。</span>'), 900);
      },
      exit:   () => appendLine('<span class="tco">你捨得離開嘛？（不可以）</span>'),
      logout: () => appendLine('<span class="tco">你捨得離開嘛？（不可以）</span>'),
      vim:    () => appendLine('<span class="term-err">vim: 找不到出口，請關閉瀏覽器頁籤求生</span>'),
      nvim:   () => appendLine('<span class="term-err">nvim: 找不到出口，請關閉瀏覽器頁籤求生</span>'),
      nano:   () => appendLine('<span class="tco">nano: 已開啟 (Ctrl+X 無效，Ctrl+C 取消)</span>'),
      rm: () => {
        if (/rm\b.*-[a-z]*r[a-z]*f/.test(input)) {
          appendLine('<span class="term-err">rm: 你是認真的嗎 👀 </span>');
        } else {
          appendLine(`<span class="term-err">rm: ${esc(argv.slice(1).join(' '))}不可以亂刪資料ㄛ！</span>`);
        }
      },
    };
    if (map[cmd]) { map[cmd](); }
    else {
      appendLine(`<span class="term-err">bash: ${esc(cmd)}: 找不到指令</span>`);
      appendLine('<span class="tco">（試試 <span class="tk">help</span> 查看可用指令）</span>');
    }
  }

  /* ── COMMANDS ── */

  function cmdHelp() {
    appendLine('<span class="tco">可用指令：</span>');
    [
      ['whoami',             '顯示當前使用者'],
      ['id',                 '顯示 uid/gid/groups'],
      ['cat [file]',         '喵？'],
      ['cd <dir>',           '♫'],
      ['echo <text>',        '輸出文字'],
      ['pwd',                '目前路徑'],
      ['date',               '目前時間'],
      ['uptime',             '系統運行時間'],
      ['uname',              '系統資訊'],
      ['neofetch',           '詳細系統資訊'],
      ['git log|status',     '匪夷所思的 commit 歷史'],
      ['apt update|upgrade', '更新套件'],
      ['sudo <cmd>',         '嘗試提權?'],
      ['ping <host>',        '測試連線'],
      ['vim / nvim / nano',  '開啟編輯器'],
      ['rm <file>',          '刪除檔案？'],
      ['exit / logout',      '嘗試離開'],
      ['clear',              '清除畫面'],
      ['coffee',             '補充能量 ☕'],
    ].forEach(([c, d]) =>
      appendLine(`  <span class="tk">${esc(c).padEnd(22)}</span><span class="tco">${esc(d)}</span>`)
    );
  }

  function cmdWhoami() {
    appendLine('<span class="tv">你居然還不記得豚豚(´；ω；`)</span>');
  }
  function cmdId() {
    appendLine(`<span class="tv">uid=<span class="tk">1000</span>(${USER}) gid=<span class="tk">1000</span>(${USER}) groups=<span class="tk">1000</span>(${USER}),<span class="tk">27</span>(sudo),<span class="tk">999</span>(docker),<span class="tk">1001</span>(sleep_deprived),<span class="tk">1002</span>(caffeine_addicts)</span>`);
  }


  function cmdCat(argv) {
    const raw  = argv[1] || '';
    const file = raw.replace('./', '').toLowerCase();
    const map  = {};
    if (!raw) {
      appendLine('<span class="tv">喵！</span>');
    } else if (map[file]) {
      map[file].forEach(l => appendLine(l));
    } else {
      appendLine('<span class="tv"> /\\_/\\  </span>');
      appendLine('<span class="tv">( o.o ) </span>');
      appendLine(`<span class="tv"> &gt; ^ &lt;  聽不懂 "${esc(raw)}" 是什麼...</span>`);
    }
  }

  function cmdApt(argv) {
    const sub = argv[1];
    if (sub === 'update') {
      busy = true;
      printAsync([
        '<span class="tco">已有：1 http://us-west1.gce.archive.ubuntu.com/ubuntu noble InRelease</span>',
        '<span class="tco">下載：2 https://download.docker.com/linux/ubuntu noble InRelease [48.5 kB]</span>',
        '<span class="tco">下載：3 http://download.zerotier.com/debian/noble noble InRelease [20.5 kB]</span>',
        '<span class="tco">已有：4 https://pkg.cloudflare.com/cloudflared any InRelease</span>',
        '<span class="tco">下載：5 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]</span>',
        '<span class="tco">已取得 215 kB，耗時 2s (速度為 107 kB/s)</span>',
        '<span class="tv">正在讀取套件清單... 完成</span>',
        '<span class="tv">正在建立相依關係樹... 完成</span>',
        '<span class="tco">有 3 個套件可以升級，執行 apt upgrade 查看。</span>',
      ], 130);
    } else if (sub === 'upgrade') {
      busy = true;
      printAsync([
        '<span class="tco">正在讀取套件清單... 完成</span>',
        '<span class="tco">正在建立相依關係樹... 完成</span>',
        '<span class="tco">以下套件將被升級：</span>',
        '<span class="tv">  motivation  sleep-schedule  work-life-balance</span>',
        '<span class="tco">3 個已升級，0 個新安裝，0 個移除，0 個未升級。</span>',
        '<span class="tco">需要下載 42 MB 的套件。</span>',
        '<span class="tco">正在解壓縮 motivation (3.1.4)，覆蓋 (2.9.9) ...</span>',
        '<span class="term-warn">dpkg: 警告：sleep-schedule 沒有可用的升級</span>',
        '<span class="tco">正在設定 work-life-balance (1.0.0) ...</span>',
        '<span class="tco">正在處理 irukatun-brain 的觸發程序 ...</span>',
        '<span class="tv">Done.</span>',
      ], 110);
    } else {
      appendLine(`<span class="term-err">apt: 無效操作 '${esc(sub||'')}'</span>`);
      appendLine('<span class="tco">用法：apt update | apt upgrade</span>');
    }
  }

  function cmdSudo(argv) {
    const sub = argv.slice(1).join(' ');
    if (/rm\s+-[a-z]*rf?\s*\//.test(sub) || /rm\s+-[a-z]*f[a-z]*r\s*\//.test(sub)) {
      appendLine('<span class="term-err">sudo: 你是認真的嗎 👀</span>');
      return;
    }
    sudoMode = true; sudoTries = 0;
    sudoPrompt();
  }

  function cmdGit(argv) {
    if (argv[1] === 'log') {
      [
        { h:'a4f2c1e', m:'fix: 還是AI好用',               t:'3 小時前'  },
        { h:'b9e3d7a', m:'feat: 喝咖啡還是喝魔爪好呢？',   t:'1 天前'    },
        { h:'c1a8f42', m:'style: 好想睡覺',               t:'2 天前'    },
        { h:'d7f9b3c', m:'fix: 再寫程式學測要裂開了qwq',   t:'3 天前'    },
        { h:'e2c4a1d', m:'feat: 想要花錢錢但沒有零用錢錢', t:'1 週前'    },
        { h:'f5b8e21', m:'chore: 凹...',                  t:'2 週前'    },
        { h:'0a3c9d7', m:'init: Commit是什麼？能吃嗎？',   t:'6 個月前'  },
      ].forEach(c => {
        appendLine(`<span style="color:#F0C070">commit ${c.h}</span>`);
        appendLine(`<span class="tco">日期：   ${c.t}</span>`);
        appendLine(`<span class="tv">    ${esc(c.m)}</span>`);
        appendLine('&nbsp;');
      });
    } else if (argv[1] === 'status') {
      ['<span class="tp">位於分支 main</span>',
       '<span class="tco">您的分支領先 \'origin/main\' ∞ 個提交。</span>', '&nbsp;',
       '<span class="tv">尚未暫存以備提交的變更：</span>',
       '<span class="tco">  已修改：   life/sleep-schedule.txt</span>',
       '<span class="term-err">  已刪除：   free-time.json</span>',
      ].forEach(l => appendLine(l));
    } else {
      appendLine(`<span class="term-err">git: '${esc(argv[1]||'')}' 不是 git 指令，試試 git log 或 git status</span>`);
    }
  }

  function cmdPing(argv) {
    const host = argv[1] || 'irukatun.dev';
    busy = true;
    promptLine.style.display = 'none';
    appendLine(`<span class="tco">PING ${esc(host)}：56 位元組資料</span>`);
    let seq = 0;
    const iv = setInterval(() => {
      const ms = (Math.random() * 5 + 1).toFixed(3);
      appendLine(`<span class="tv">來自 ${esc(host)} 的 64 位元組：icmp_seq=${seq} ttl=64 時間=${ms} ms</span>`);
      if (++seq >= 4) {
        clearInterval(iv);
        appendLine('&nbsp;');
        appendLine(`<span class="tco">--- ${esc(host)} ping 統計 ---</span>`);
        appendLine('<span class="tv">已傳送 4 個封包，已接收 4 個，0% 封包遺失</span>');
        busy = false;
        promptLine.style.display = '';
      }
    }, 650);
  }

  function cmdNeofetch() {
    appendLine('&nbsp;');
    const art = [
      '／(・ × ・)＼',
      '|  iruka  |',
      ' \\   tun  /',
      '  ~~ 豚豚 ~~',
    ];
    const info = [
      { key: null,      val: `<span class="tp">irukatun</span><span class="tc">@</span><span class="tp">iruka_pc_studio</span>` },
      { key: null,      val: `<span class="tco">────────────────────</span>` },
      { key: '作業系統', val: `<span class="tv">IrukaLinux 2.0 LTS</span>` },
      { key: '主機',     val: `<span class="tv">iruka_pc_studio</span>` },
      { key: '核心版本', val: `<span class="tv">GNU/Linux 6.12.15-irukatun</span>` },
      { key: '處理器',   val: `<span class="tv">Intel i7-14700KF</span>` },
      { key: '顯示卡',   val: `<span class="tv">RTX 4070 Ti Super</span>` },
      { key: '記憶體',   val: `<span class="tv">64GB DDR5-6000</span>` },
    ];
    const artDiv  = `<div>${art.map(l => `<div class="tv" style="white-space:pre">${l}</div>`).join('')}</div>`;
    const infoDiv = `<div>${info.map(({ key, val }) =>
      key
        ? `<div><span class="tk" style="display:inline-block;min-width:3.2rem">${key}</span><span class="tc"> : </span>${val}</div>`
        : `<div>${val}</div>`
    ).join('')}</div>`;
    appendLine(`<div style="display:flex;gap:2rem;align-items:flex-start;line-height:1.75">${artDiv}${infoDiv}</div>`);
    appendLine('&nbsp;');
  }

  function cmdCoffee() {
    appendLine([
      '       ( (     ',
      '        ) )    ',
      '      ........  ',
      '      |      |] ',
      '      \\      /  ',
      '       \\____/   ',
    ].map(l => `<span class="tv" style="display:block;white-space:pre;font-family:monospace">${l}</span>`).join(''));
    appendLine('&nbsp;');
    appendLine('<span class="tv">  ☕ +100 能量（還是很睏）</span>');
  }

  /* ── UTILS ── */
  function appendLine(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    termBody.insertBefore(div, promptLine);
    termBody.scrollTop = termBody.scrollHeight;
  }
  function clearTerm() {
    while (termBody.firstChild !== promptLine) termBody.removeChild(termBody.firstChild);
    currentInput = ''; termInput.value = ''; inputMirror.textContent = '';
  }
  function printAsync(lines, delay) {
    promptLine.style.display = 'none';
    let i = 0;
    (function next() {
      if (i >= lines.length) { busy = false; promptLine.style.display = ''; return; }
      appendLine(lines[i++]);
      setTimeout(next, delay);
    })();
  }
  function esc(s) {
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
})();

// ── SITE MAP ─────────────────────────────────────────────
(function initSiteMap() {
  const section = document.getElementById('sitemap');
  if (!section) return;

  // ── Node data ────────────────────────────────────────────
  const NODES = [
    { id:'origin',  tag:'ORIGIN',    title:'irukatun.dev', sub:'選擇一條路徑，\n開始你的探索', x:1500, y:1400, color:'#4aaed4', type:'origin',  connects:['contact','portal','blog','github'] },
    { id:'contact', tag:'REACH OUT', title:'聯絡我',       sub:'與豚豚取得聯絡',               x:750,  y:700,  color:'#4aaed4', type:'hub',     connects:['origin','email','discord'] },
    { id:'portal',  tag:'SERVICES',  title:'服務入口',     sub:'進入服務入口',              x:2250, y:700,  color:'#f97316', type:'portal',  url:'https://portal.irukatun.dev', connects:['origin'] },
    { id:'blog',    tag:'BLOG',   title:'部落格',       sub:'HackMD',                   x:2250, y:2100, color:'#34d399', type:'portal',  url:'https://hackmd.io/@irukatun', connects:['origin'] },
    { id:'github',  tag:'Talk is cheap',    title:'GitHub',       sub:'Show me the code',                     x:750,  y:2100, color:'#a78bfa', type:'portal',  url:'https://github.com/irukatun', connects:['origin'] },
    { id:'email',   tag:'EMAIL',     title:'電子郵件',     sub:'support@irukatun.dev',         x:200,  y:100,  color:'#4aaed4', type:'link',    url:'mailto:support@irukatun.dev', connects:['contact'] },
    { id:'discord', tag:'DISCORD',   title:'Discord',      sub:'irukatun.DEV',        x:1300, y:100,  color:'#4aaed4', type:'portal',  url:'https://discord.gg/eMxX8DuFKh', connects:['contact'] },
  ];
  const nodeMap = {};
  NODES.forEach(n => nodeMap[n.id] = n);

  // ── State ─────────────────────────────────────────────────
  let currentId  = 'origin';
  let navHistory = ['origin'];

  // ── DOM refs ──────────────────────────────────────────────
  const viewport = document.getElementById('smap-viewport');
  const canvas   = document.getElementById('smap-canvas');
  const svg      = document.getElementById('smap-svg');
  const flash    = document.getElementById('smap-flash');

  // ── Stars ─────────────────────────────────────────────────
  for (let i = 0; i < 160; i++) {
    const s  = document.createElement('span');
    s.className = 'smap-star';
    const sz  = Math.random() * 2.2 + 0.6;
    const opA = (Math.random() * 0.12 + 0.06).toFixed(2);
    const opB = (Math.random() * 0.45 + 0.35).toFixed(2);
    const dur = (2 + Math.random() * 5).toFixed(1) + 's';
    const del = (Math.random() * 8).toFixed(1) + 's';
    s.style.cssText = `left:${(Math.random()*100).toFixed(2)}%;top:${(Math.random()*100).toFixed(2)}%;`
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
        // Bezier with slight perpendicular offset for organic feel
        const mx = (node.x + t.x) / 2, my = (node.y + t.y) / 2;
        const dx = t.x - node.x,       dy = t.y - node.y;
        const ox = -dy * 0.1,           oy =  dx * 0.1;
        const d  = `M ${node.x} ${node.y} Q ${mx+ox} ${my+oy} ${t.x} ${t.y}`;
        // Line colour follows the non-origin endpoint
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

      const dot   = `<div class="smap-dot"></div>`;
      const tag   = `<div class="smap-ntag">${node.tag}</div>`;
      const title = `<div class="smap-ntitle">${node.title}</div>`;
      const sub   = `<div class="smap-nsub">${node.sub.replace(/\n/g,'<br>')}</div>`;
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
      } else if (node.type === 'link') {
        btns = `<div class="smap-btns">
          <button class="smap-enter-btn">開啟 →</button>
          <button class="smap-back-btn">← 返回</button>
        </div>`;
      } else if (node.type === 'copy') {
        btns = `<div class="smap-btns">
          <button class="smap-copy-btn" data-copy="${node.copyText}">複製帳號</button>
          <button class="smap-back-btn">← 返回</button>
        </div>`;
      }

      el.innerHTML = dot + tag + title + sub + btns;
      canvas.appendChild(el);
      nodeEls[node.id] = el;
    });
  }

  // ── Navigation ────────────────────────────────────────────
  function panTo(id, animate = true) {
    const n  = nodeMap[id];
    const tx = viewport.offsetWidth  / 2 - n.x;
    const ty = viewport.offsetHeight / 2 - n.y;
    if (animate) {
      gsap.to(canvas, { x: tx, y: ty, duration: 1.1, ease: 'power3.inOut' });
    } else {
      gsap.set(canvas, { x: tx, y: ty });
    }
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
    navHistory.pop();          // navigateTo will re-push it
    navigateTo(prev);
  }

  // Reload when returning from external service (bfcache or app-switch)
  // sessionStorage flag ensures only one reload fires regardless of which event wins
  function reloadIfReturning() {
    if (!sessionStorage.getItem('leaving')) return;
    sessionStorage.removeItem('leaving');
    window.location.reload();
  }
  window.addEventListener('pageshow', e => { if (e.persisted) reloadIfReturning(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) reloadIfReturning(); });
  window.addEventListener('focus', reloadIfReturning);

  // ── Portal animation → navigate current tab ─────────────
  function runPortalTransition(url) {
    gsap.to(canvas, { scale: 5, duration: 0.9, ease: 'power3.in' });
    gsap.to(flash, {
      opacity: 1, duration: 0.3, delay: 0.65,
      onComplete() {
        if (url) { sessionStorage.setItem('leaving', '1'); window.location.href = url; }
      }
    });
  }

  // ── UI update ─────────────────────────────────────────────
  function updateUI() {
    const cur = nodeMap[currentId];

    // Node states
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

    // Line states
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

    // Rebuild dynamic button lists
    rebuildBtns('origin');
    NODES.filter(n => n.type === 'hub').forEach(n => rebuildBtns(n.id));

    // HUD
    document.getElementById('smap-hud-label').textContent = cur.tag;
    const trail = document.getElementById('smap-trail');
    trail.innerHTML = '';
    navHistory.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'smap-trail-dot' + (i === navHistory.length - 1 ? ' active' : '');
      trail.appendChild(d);
    });
  }

  function rebuildBtns(nodeId) {
    const el = document.getElementById(`smap-btns-${nodeId}`);
    if (!el) return;
    el.innerHTML = '';
    const node   = nodeMap[nodeId];
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
    // Portal enter button
    const enterBtn = e.target.closest('.smap-enter-btn');
    if (enterBtn && !enterBtn.disabled && !enterBtn.hasAttribute('disabled')) {
      const node = nodeMap[currentId];
      if (node.type === 'link') {
        // Open immediately — delay would break iOS user-gesture requirement for external apps
        window.open(node.url, '_blank', 'noopener');
      } else {
        runPortalTransition(node.url);
      }
      return;
    }
    // Back button
    if (e.target.closest('.smap-back-btn')) { e.stopPropagation(); goBack(); return; }
    // Copy button
    const copyBtn = e.target.closest('.smap-copy-btn');
    if (copyBtn) {
      navigator.clipboard.writeText(copyBtn.dataset.copy).then(() => {
        const orig = copyBtn.textContent;
        copyBtn.textContent = '✓ 已複製';
        setTimeout(() => { copyBtn.textContent = orig; }, 2000);
      });
      return;
    }
    // Node click (navigate)
    const nodeEl = e.target.closest('.smap-node');
    if (nodeEl && !nodeEl.classList.contains('dimmed') && nodeEl.id !== `smap-n-${currentId}`) {
      navigateTo(nodeEl.id.replace('smap-n-', ''));
    }
  });

  // ESC — only when not at origin
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && currentId !== 'origin') goBack();
  });

  // Resize — re-centre without animation
  window.addEventListener('resize', () => panTo(currentId, false));

  // Cursor hover integration
  section.addEventListener('mouseover', e => {
    if (e.target.closest('.smap-node, button, a')) document.body.classList.add('cursor-hover');
  });
  section.addEventListener('mouseout', e => {
    if (e.target.closest('.smap-node, button, a')) document.body.classList.remove('cursor-hover');
  });

  // Copyright footer toggle
  const copyrightBtn    = document.getElementById('smap-copyright-btn');
  const footerPanel     = document.getElementById('smap-footer-panel');
  const footerLicense   = document.getElementById('smap-footer-license');
  const footerWrapper   = document.getElementById('smap-footer');
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

  // ── GSAP scroll entrance ──────────────────────────────────
  gsap.set('#smap-n-origin',                    { opacity: 0, scale: 0.82 });
  gsap.set('.smap-node:not(#smap-n-origin)',    { opacity: 0, scale: 0.88 });
  gsap.set('.smap-corner-label',                { opacity: 0 });
  gsap.set('#smap-hud',                         { opacity: 0, y: 8 });
  gsap.set('#smap-footer',                      { opacity: 0, y: 10 });

  ScrollTrigger.create({
    trigger: '#sitemap',
    start:   'center 75%',
    once:    true,
    onEnter() {
      const allLines = Object.values(lineMap);
      gsap.to('#smap-n-origin', {
        opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.4)',
        onComplete() {
          allLines.forEach(({ base }, i) => {
            gsap.to(base, { opacity: 1, duration: 1.0, ease: 'power2.out', delay: i * 0.1 });
          });
          gsap.to('.smap-node:not(#smap-n-origin)', {
            opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)',
            stagger: 0.08, delay: 0.1
          });
          gsap.to('.smap-corner-label', { opacity: 1, duration: 0.5, delay: 0.2 });
          gsap.to('#smap-hud',          { opacity: 1, y: 0, duration: 0.5, delay: 0.3 });
          gsap.to('#smap-footer',       { opacity: 1, y: 0, duration: 0.5, delay: 0.4 });
          setTimeout(() => updateUI(), 1800);
        }
      });
    },
  });
})();

// ── THEME TOGGLE ─────────────────────────────────────────
(function initTheme() {
  const btn      = document.getElementById('nav-theme-btn');
  const smapBtn  = document.getElementById('smap-theme-btn');
  const root     = document.documentElement;

  function applyTheme(dark) {
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    const label = dark ? '切換淺色模式' : '切換深色模式';
    btn.setAttribute('aria-label', label);
    smapBtn.setAttribute('aria-label', label);
  }

  function toggle() {
    const dark = root.getAttribute('data-theme') !== 'dark';
    sessionStorage.setItem('theme', dark ? 'dark' : 'light');
    applyTheme(dark);
  }

  btn.addEventListener('click', toggle);
  smapBtn.addEventListener('click', toggle);

  window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', e => {
    if (!sessionStorage.getItem('theme')) applyTheme(e.matches);
  });

  // Add to cursor hover detection
  [btn, smapBtn].forEach(b => {
    b.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    b.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

// ── IMAGE LIGHTBOX ────────────────────────────────────────
(function(){
  const backdrop = document.getElementById('lightbox-backdrop');
  const lightbox = document.getElementById('lightbox');
  const img      = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');

  function open(src) {
    img.src = src;
    backdrop.classList.add('open');
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    backdrop.classList.remove('open');
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    img.src = '';
  }

  document.querySelectorAll('.proj-visual[data-img]').forEach(el => {
    el.addEventListener('click', () => open(el.dataset.img));
  });

  backdrop.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
