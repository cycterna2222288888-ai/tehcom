/* ============================================
   SCRIPT.JS — Shared interactive layer
   ============================================ */

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

  burger.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay.querySelectorAll('.nav__mobile-link').forEach(l => l.addEventListener('click', close));

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
    const density = 14000;
    const count   = Math.max(8, Math.floor((canvas.width * canvas.height) / density));
    nodes = Array.from({ length: count }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.4 + 0.4,
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
      ctx.fillStyle = 'rgba(0, 212, 255, 0.55)';
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
