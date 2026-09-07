(function alemzaiChoreography(global) {
  'use strict';

  const motion = global.AlemzaiMotion;
  const gsap = global.gsap;
  if (!motion) return;

  const plugins = [global.ScrollTrigger, global.ScrollSmoother, global.SplitText,
    global.CustomEase, global.MotionPathPlugin, global.Observer].filter(Boolean);
  if (gsap && plugins.length) gsap.registerPlugin(...plugins);
  global.CustomEase?.create?.('alemzaiFocus', '0.22,1,0.36,1');

  const context = motion.createContext('choreography');
  let gsapContext = null;
  let magneticTarget = null;
  let magneticX = 0;
  let magneticY = 0;

  function enableSmooth() {
    if (motion.isReduced() || !motion.capableDesktop) {
      motion.disableSmooth();
      return;
    }
    motion.enableSmooth({
      wrapper: document.querySelector('[data-smooth-wrapper]'),
      content: document.querySelector('[data-smooth-content]'),
      smooth: motion.tokens?.smooth?.duration || 0.72,
      effects: false,
      normalizeScroll: false
    });
  }

  function buildReveals() {
    gsapContext?.revert?.();
    gsapContext = null;
    if (!gsap || motion.isReduced() || !global.ScrollTrigger) return;
    gsapContext = gsap.context(() => {
      gsap.utils.toArray('.as-services__heading, .av2-demos__heading, .studio-intro, .capability-strip, .studio-panel, .ac-contact__intro').forEach(element => {
        gsap.from(element, {
          y: motion.tokens?.distance?.section || 28,
          opacity: 0,
          duration: motion.tokens?.duration?.reveal || 0.72,
          ease: 'alemzaiFocus',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true }
        });
      });
    });
    motion.refresh();
  }

  function resetMagnetic() {
    if (!magneticTarget) return;
    gsap?.to?.(magneticTarget, { x: 0, y: 0, duration: 0.28, ease: 'alemzaiFocus', overwrite: true });
    magneticTarget = null;
    magneticX = 0;
    magneticY = 0;
  }

  context.listen(document, 'pointerover', event => {
    if (motion.isReduced() || !motion.capableDesktop) return;
    const candidate = event.target.closest('.av2-primary, .av2-secondary, .av2-connect, .studio-cta');
    if (!candidate) return;
    if (magneticTarget !== candidate) resetMagnetic();
    magneticTarget = candidate;
  }, { passive: true });

  context.listen(document, 'pointerout', event => {
    if (magneticTarget && !magneticTarget.contains(event.relatedTarget)) resetMagnetic();
  }, { passive: true });

  context.subscribeFrame(() => {
    if (!magneticTarget || motion.isReduced() || !motion.capableDesktop || !gsap) return;
    const bounds = magneticTarget.getBoundingClientRect();
    const pointer = motion.getPointer();
    magneticX = (pointer.x - (bounds.left + bounds.width / 2)) * 0.08;
    magneticY = (pointer.y - (bounds.top + bounds.height / 2)) * 0.08;
    gsap.set(magneticTarget, { x: magneticX, y: magneticY });
  });

  context.listen(document, 'click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    const target = hash && hash !== '#' ? document.querySelector(hash) : null;
    if (!target) return;
    event.preventDefault();
    motion.scrollTo(target, { smooth: !motion.isReduced(), block: 'start' });
    if (global.history?.replaceState) global.history.replaceState(null, '', hash);
  });

  const disposeReduced = motion.onReducedChange(reduced => {
    if (reduced) {
      resetMagnetic();
      gsapContext?.revert?.();
      gsapContext = null;
      motion.disableSmooth();
      gsap?.set?.('.as-services__heading, .av2-demos__heading, .studio-intro, .capability-strip, .studio-panel, .ac-contact__intro', { clearProps: 'all' });
    } else {
      enableSmooth();
      buildReveals();
    }
  }, { immediate: true });
  context.add(disposeReduced);
  context.add(() => gsapContext?.revert?.());
  context.add(resetMagnetic);

  global.AlemzaiChoreography = Object.freeze({
    refresh() { enableSmooth(); buildReveals(); },
    destroy() { context.destroy(); motion.disableSmooth(); delete global.AlemzaiChoreography; }
  });
})(window);
