/* ============================================
   SCRIPT.JS — Shared interactive layer
   ============================================ */

/* ============================================
   NAV DROPDOWN
   ============================================ */
(function initNavDropdown() {
  const items = document.querySelectorAll('.nav__item--has-dropdown');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.nav__link--btn');
    if (!btn) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = item.classList.contains('is-open');
      items.forEach(i => {
        i.classList.remove('is-open');
        i.querySelector('.nav__link--btn')?.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', () => {
    items.forEach(i => {
      i.classList.remove('is-open');
      i.querySelector('.nav__link--btn')?.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') items.forEach(i => i.classList.remove('is-open'));
  });
}());

/* ============================================
   NAV — sticky + scroll active
   ============================================ */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Highlight active nav link by scroll position */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

  const sectionWatcher = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionWatcher.observe(s));
}());

/* ============================================
   MOBILE NAV TOGGLE
   ============================================ */
(function initMobileNav() {
  const burger  = document.querySelector('.nav__burger');
  const overlay = document.querySelector('.nav__mobile-overlay');
  const closeBtn = document.querySelector('.nav__mobile-close');
  if (!burger || !overlay) return;

  const open = () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    overlay.classList.contains('open') ? close() : open();
  });
  closeBtn?.addEventListener('click', close);
  overlay.querySelectorAll('.nav__mobile-link, .btn').forEach(l => l.addEventListener('click', close));

  /* close on backdrop click */
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  /* close on escape */
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}());

/* ============================================
   SCROLL REVEAL
   ============================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  els.forEach(el => observer.observe(el));
}());

/* ============================================
   TEXT DECODE (hacker / glitch effect)
   Usage: add data-decode to any element
   ============================================ */
const DECODE_CHARS = '0123456789·_/';

function runDecode(el) {
  const original = el.dataset.text || el.textContent;
  el.dataset.text = original;
  let step = 0;
  const total = original.length;

  const tick = setInterval(() => {
    el.textContent = original
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (i < step) return original[i];
        return DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
      })
      .join('');

    step++;
    if (step > total) {
      el.textContent = original;
      clearInterval(tick);
    }
  }, 9);
}

(function initDecode() {
  const els = document.querySelectorAll('[data-decode]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      setTimeout(() => runDecode(entry.target), 200);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  els.forEach(el => observer.observe(el));
}());

/* ============================================
   COUNTER ANIMATION
   Usage: data-count="99.9" data-suffix="%" data-prefix=""
   ============================================ */
(function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
}());

function animateCounter(el) {
  const target   = parseFloat(el.dataset.count);
  const isFloat  = el.dataset.count.includes('.');
  const suffix   = el.dataset.suffix  || '';
  const prefix   = el.dataset.prefix  || '';
  const duration = 1800;
  const start    = performance.now();

  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const val = target * ease;
    el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/* ============================================
   HERO CANVAS — animated network graph
   ============================================ */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let nodes = [];
  let raf;

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    buildNodes();
  };

  const buildNodes = () => {
    const density = 12000;
    const count   = Math.max(10, Math.floor((canvas.width * canvas.height) / density));
    nodes = Array.from({ length: count }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      r:     Math.random() * 1.6 + 0.5,
      green: Math.random() < 0.25,
    }));
  };

  const MAX_DIST = 140;

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Move nodes */
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    /* Draw edges */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= MAX_DIST) continue;

        const alpha = (1 - dist / MAX_DIST) * 0.22;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.lineWidth   = 0.6;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }

    /* Draw nodes */
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.green ? 'rgba(57, 255, 20, 0.50)' : 'rgba(0, 212, 255, 0.55)';
      ctx.fill();
    });

    raf = requestAnimationFrame(draw);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  draw();

  /* Pause when tab hidden — save CPU */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });
}());

/* ============================================
   FAQ ACCORDION
   ============================================ */
(function initFaq() {
  document.querySelectorAll('.faq-item__q').forEach(q => {
    q.addEventListener('click', () => {
      const item   = q.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');

      /* Close all */
      document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('is-open'));

      /* Toggle current */
      if (!isOpen) item.classList.add('is-open');
    });
  });
}());

/* ============================================
   CONTACT FORM VALIDATION
   ============================================ */
(function initFormValidation() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const requiredFields = Array.from(form.querySelectorAll('[required]'));
  const submitBtn = form.querySelector('[type="submit"]');

  requiredFields.forEach(field => {
    field.addEventListener('input', () => field.classList.remove('form-input--error'));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    requiredFields.forEach(f => f.classList.remove('form-input--error'));

    const invalid = requiredFields.filter(f => !f.value.trim());
    if (invalid.length) {
      invalid.forEach(f => f.classList.add('form-input--error'));
      invalid[0].focus();
      return;
    }

    submitBtn.textContent = 'Заявка отправлена';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.65';
  });
}());

/* ============================================
   3D CARD TILT
   ============================================ */
(function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.svc-card, .case-card, .info-card, .metric-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      /* Disable transform transition so tilt tracks the cursor instantly */
      card.style.transition = 'background 300ms ease, border-color 300ms ease, box-shadow 300ms ease';
    });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x  = e.clientX - rect.left;
      const y  = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rotY =  ((x - cx) / cx) * 5;
      const rotX = -((y - cy) / cy) * 5;
      const liftPx = card.classList.contains('case-card') ? -6 : -3;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(${liftPx}px)`;
    });

    card.addEventListener('mouseleave', () => {
      /* Restore full transition so card eases back smoothly */
      card.style.transition = '';
      card.style.transform  = '';
    });
  });
}());

/* ============================================
   SIDEBAR NAV — highlight active section
   ============================================ */
(function initSidebarNav() {
  const items = document.querySelectorAll('.sidebar-nav__item[data-target]');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const target = document.getElementById(item.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const ids = [...items].map(i => i.dataset.target).filter(Boolean);
  const sectionEls = ids.map(id => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      items.forEach(item => {
        item.classList.toggle('is-active', item.dataset.target === id);
      });
    });
  }, { threshold: 0.3 });

  sectionEls.forEach(el => observer.observe(el));
}());

/* ============================================
   SCROLL PROGRESS BAR
   ============================================ */
(function initScrollProgress() {
  const bar = document.createElement("div");
  bar.id = "scroll-bar";
  document.body.prepend(bar);
  window.addEventListener(
    "scroll",
    () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH > 0) bar.style.width = ((window.scrollY / docH) * 100).toFixed(1) + "%";
    },
    { passive: true }
  );
})();

(function initMagneticButtons() {
  if (window.matchMedia("(hover: none)").matches) return;
  document.querySelectorAll(".btn--primary.btn--lg, .btn--outline-green.btn--lg").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${(dx * 0.28).toFixed(1)}px,${(dy * 0.28).toFixed(1)}px)`;
      btn.style.transition = "transform 0.1s linear";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
      btn.style.transition = "transform 0.5s cubic-bezier(0.23,1,0.32,1)";
      setTimeout(() => { btn.style.transition = ""; }, 520);
    });
  });
})();

/* ============================================
   HERO EYEBROW — TYPEWRITER
   ============================================ */
(function initHeroType() {
  const el = document.querySelector(".hero__eyebrow-text");
  if (!el) return;

  const text = el.textContent.trim();
  el.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "type-cursor";
  cursor.textContent = "_";
  el.appendChild(cursor);

  let i = 0;
  const iv = setInterval(() => {
    if (i >= text.length) { clearInterval(iv); return; }
    el.insertBefore(document.createTextNode(text[i]), cursor);
    i++;
  }, 42);
})();

/* ============================================
   SECTION EYEBROW SCRAMBLE ON SCROLL
   ============================================ */
(function initEyebrowScramble() {
  const eyebrows = document.querySelectorAll(".section-eyebrow");
  if (!eyebrows.length) return;

  const triggered = new WeakSet();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || triggered.has(entry.target)) return;
        triggered.add(entry.target);
        setTimeout(() => runDecode(entry.target), 120);
      });
    },
    { threshold: 0.4 }
  );

  eyebrows.forEach((el) => {
    if (!el.closest(".hero")) observer.observe(el);
  });
})();

/* ============================================
   GYROSCOPE PARALLAX — mobile hero
   ============================================ */
(function initGyroParallax() {
  if (!window.matchMedia("(hover: none)").matches) return;

  const radial = document.querySelector(".hero__radial");
  if (!radial) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;
  const MAX = 22;

  radial.style.animation = "none";

  const onOrientation = (e) => {
    const gamma = e.gamma || 0;
    const beta = e.beta || 0;
    tx = Math.max(-MAX, Math.min(MAX, (gamma / 35) * MAX));
    ty = Math.max(-MAX, Math.min(MAX, ((beta - 40) / 35) * MAX));
  };

  const startLoop = () => {
    (function loop() {
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;
      radial.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`;
      requestAnimationFrame(loop);
    })();
  };

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    // iOS 13+ — needs permission from user gesture
    document.addEventListener(
      "touchstart",
      () => {
        DeviceOrientationEvent.requestPermission()
          .then((state) => {
            if (state === "granted") {
              window.addEventListener("deviceorientation", onOrientation, { passive: true });
              startLoop();
            }
          })
          .catch(() => {});
      },
      { once: true }
    );
  } else if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", onOrientation, { passive: true });
    startLoop();
  }
})();

/* ============================================
   TOUCH RIPPLE — mobile tap feedback
   ============================================ */
(function initTouchRipple() {
  if (!window.matchMedia("(hover: none)").matches) return;

  const sel = ".btn, .svc-card, .case-card, .info-card, .metric-card";

  document.addEventListener(
    "touchstart",
    (e) => {
      const el = e.target.closest(sel);
      if (!el) return;

      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = touch.clientX - rect.left - size / 2;
      const y = touch.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.className = "touch-ripple";
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
      el.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    },
    { passive: true }
  );
})();

/* ============================================
   CASES SWIPE DOTS — mobile
   ============================================ */
(function initCasesSwipe() {
  const grid = document.querySelector(".cases__grid");
  if (!grid) return;

  const cards = grid.querySelectorAll(".case-card");
  if (cards.length < 2) return;

  const dotsWrap = document.createElement("div");
  dotsWrap.className = "cases-dots";

  const dots = Array.from(cards).map((card, i) => {
    const dot = document.createElement("button");
    dot.className = "cases-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Кейс ${i + 1}`);
    dot.addEventListener("click", () => {
      card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  grid.insertAdjacentElement("afterend", dotsWrap);

  // IntersectionObserver on the grid as root — marks whichever card is most visible
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = Array.from(cards).indexOf(entry.target);
        if (idx >= 0) dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      });
    },
    { root: grid, threshold: 0.5 }
  );

  cards.forEach((card) => io.observe(card));
})();
