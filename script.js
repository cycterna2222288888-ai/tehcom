// mobile nav
const burger = document.getElementById('burger');
const navMob = document.getElementById('navMobile');
if (burger && navMob) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navMob.classList.toggle('open');
  });
  navMob.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      navMob.classList.remove('open');
    });
  });
}

// smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
}), { threshold: .07 });
document.querySelectorAll('.r').forEach(el => io.observe(el));

// animated counters
function animCount(el, to, suffix, ms) {
  const start = performance.now();
  const run = t => {
    const p = Math.min((t - start) / ms, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = (Number.isInteger(to) ? Math.round(ease * to) : (ease * to).toFixed(0)) + suffix;
    if (p < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    const { count, suffix } = e.target.dataset;
    animCount(e.target, parseFloat(count), suffix || '', 1400);
    cio.unobserve(e.target);
  }
}), { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

// contact form
const form = document.getElementById('contact-form');
const btn  = document.getElementById('form-btn');
if (form && btn) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.disabled = true;
    const orig = btn.textContent;
    btn.textContent = '...';
    await new Promise(r => setTimeout(r, 1200));
    btn.textContent = form.dataset.success || 'Отправлено ✓';
    btn.style.background = '#16a34a';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
}
