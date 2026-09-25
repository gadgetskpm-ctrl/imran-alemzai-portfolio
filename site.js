(() => {
  'use strict';
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const closeMenu = (returnFocus = false) => {
    navToggle?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
    document.documentElement.classList.remove('nav-open');
    if (returnFocus) navToggle?.focus();
  };
  navToggle?.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('nav-open', open);
    if (open) requestAnimationFrame(() => nav?.querySelector('a')?.focus());
  });
  nav?.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (event) => {
    if (!nav?.classList.contains('is-open')) return;
    if (event.key === 'Escape') { closeMenu(true); return; }
    if (event.key !== 'Tab') return;
    const focusable = [navToggle, ...nav.querySelectorAll('a')].filter(Boolean);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.querySelectorAll('[data-project]').forEach((link) => link.addEventListener('click', () => {
    const select = document.querySelector('#contact-build');
    const option = select ? [...select.options].find((item) => item.text === link.dataset.project) : null;
    if (option) { select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true })); }
  }));
  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

  const reveals = [...document.querySelectorAll('.reveal')];
  let revealObserver;
  function configureReveals() {
    revealObserver?.disconnect();
    if (motionQuery.matches || !('IntersectionObserver' in window)) { reveals.forEach((node) => node.classList.add('is-visible')); return; }
    revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } }), { threshold: .1, rootMargin: '0px 0px -35px' });
    reveals.forEach((node) => { if (!node.classList.contains('is-visible')) revealObserver.observe(node); });
  }
  configureReveals(); motionQuery.addEventListener?.('change', configureReveals);

  const hero = document.querySelector('[data-hero-motion]');
  let heroFrame = 0;
  let heroTargetX = 0;
  let heroTargetY = 0;
  const renderHeroMotion = () => {
    heroFrame = 0;
    if (!hero || motionQuery.matches) return;
    hero.style.setProperty('--hero-x', `${heroTargetX.toFixed(3)}`);
    hero.style.setProperty('--hero-y', `${heroTargetY.toFixed(3)}`);
  };
  const resetHeroMotion = () => {
    heroTargetX = 0;
    heroTargetY = 0;
    if (heroFrame) cancelAnimationFrame(heroFrame);
    heroFrame = requestAnimationFrame(renderHeroMotion);
  };
  hero?.addEventListener('pointermove', (event) => {
    if (motionQuery.matches || event.pointerType === 'touch') return;
    const bounds = hero.getBoundingClientRect();
    heroTargetX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    heroTargetY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    if (!heroFrame) heroFrame = requestAnimationFrame(renderHeroMotion);
  }, { passive: true });
  hero?.addEventListener('pointerleave', resetHeroMotion, { passive: true });
  motionQuery.addEventListener?.('change', resetHeroMotion);

  // Scroll typography adapted from the interaction model in Codrops ScrollTextMotion (MIT).
  const scrollTextElements = [...document.querySelectorAll('.section-heading h2, .studio-panel h2, .contact h2')];
  let scrollTextFrame = 0;
  const resetScrollText = () => scrollTextElements.forEach((element) => {
    element.style.removeProperty('--scroll-text-x');
    element.style.removeProperty('--scroll-text-opacity');
  });
  const updateScrollText = () => {
    scrollTextFrame = 0;
    if (motionQuery.matches) { resetScrollText(); return; }
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    scrollTextElements.forEach((element, index) => {
      const bounds = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (viewportHeight - bounds.top) / (viewportHeight + bounds.height)));
      const direction = index % 2 === 0 ? 1 : -1;
      const distance = direction * (0.5 - progress) * 72;
      const visibility = 0.62 + (0.38 * (1 - Math.min(1, Math.abs(progress - 0.5) * 2)));
      element.style.setProperty('--scroll-text-x', distance.toFixed(2));
      element.style.setProperty('--scroll-text-opacity', visibility.toFixed(3));
    });
  };
  const requestScrollTextUpdate = () => {
    if (!scrollTextFrame) scrollTextFrame = requestAnimationFrame(updateScrollText);
  };
  scrollTextElements.forEach((element) => element.classList.add('scroll-text-motion'));
  window.addEventListener('scroll', requestScrollTextUpdate, { passive: true });
  window.addEventListener('resize', requestScrollTextUpdate, { passive: true });
  motionQuery.addEventListener?.('change', requestScrollTextUpdate);
  requestScrollTextUpdate();

  document.querySelectorAll('[data-workflow]').forEach((root) => {
    const steps = [...root.querySelectorAll('li')];
    const run = root.querySelector('[data-workflow-run]');
    const approve = root.querySelector('[data-workflow-approve]');
    const reset = root.querySelector('[data-workflow-reset]');
    const status = root.querySelector('[data-workflow-status]');
    let timers = [];
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const setStep = (index) => steps.forEach((step, itemIndex) => step.classList.toggle('is-active', itemIndex <= index));
    const doReset = () => { clearTimers(); setStep(0); run.disabled = false; approve.disabled = true; status.textContent = 'Ready to run a safe local demonstration.'; };
    run.addEventListener('click', () => {
      clearTimers(); run.disabled = true; approve.disabled = true; setStep(0); status.textContent = 'Organizing the sample request…';
      const delay = motionQuery.matches ? 0 : 650;
      timers.push(setTimeout(() => { setStep(1); status.textContent = 'A sample draft has been prepared.'; }, delay));
      timers.push(setTimeout(() => { setStep(2); approve.disabled = false; status.textContent = 'Paused at human approval. Nothing has been sent.'; }, delay * 2));
    });
    approve.addEventListener('click', () => { setStep(3); approve.disabled = true; status.textContent = 'Sample approved. Final handoff recorded locally.'; });
    reset.addEventListener('click', doReset);
  });
})();
