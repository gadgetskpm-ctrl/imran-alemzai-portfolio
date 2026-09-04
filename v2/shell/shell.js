(function (global) {
  'use strict';

  const instances = new WeakMap();
  const systemNames = ['AI', 'WEB', 'AUTOMATION', 'MEDIA', 'APPS', 'IT'];

  function createField(canvas, reduced) {
    if (!canvas || !canvas.getContext) return { resize() {}, draw() {}, destroy() {} };
    const context = canvas.getContext('2d');
    if (!context) return { resize() {}, draw() {}, destroy() {} };

    let width = 0;
    let height = 0;
    let frame = 0;
    let pointerX = .5;
    let pointerY = .5;
    let scrollProgress = 0;
    let destroyed = false;
    const nodes = systemNames.map((name, index) => ({ name, index }));

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const density = Math.min(global.devicePixelRatio || 1, 1.75);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      draw(performance.now());
    }

    function setPointer(x, y) {
      pointerX = Math.max(0, Math.min(1, x));
      pointerY = Math.max(0, Math.min(1, y));
    }

    function setScroll(progress) {
      scrollProgress = Math.max(0, Math.min(1, progress));
    }

    function nodePosition(index, time) {
      const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2 + scrollProgress * .6;
      const radius = Math.min(width, height) * (.2 + scrollProgress * .055);
      const drift = reduced ? 0 : Math.sin(time * .00035 + index) * 4;
      const responseX = reduced ? 0 : (pointerX - .5) * (8 + index * 1.4);
      const responseY = reduced ? 0 : (pointerY - .5) * (8 + index * 1.1);
      return {
        x: width * .58 + Math.cos(angle) * (radius + drift) + responseX,
        y: height * .48 + Math.sin(angle) * (radius + drift) + responseY
      };
    }

    function draw(time) {
      if (destroyed) return;
      context.clearRect(0, 0, width, height);
      const center = { x: width * .58, y: height * .48 };
      const positions = nodes.map((_, index) => nodePosition(index, time));

      context.lineWidth = 1;
      positions.forEach((point, index) => {
        context.beginPath();
        context.moveTo(center.x, center.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = `rgba(185,255,37,${.12 + scrollProgress * .16})`;
        context.stroke();

        context.beginPath();
        context.arc(point.x, point.y, index === Math.floor(scrollProgress * 5.99) ? 7 : 3, 0, Math.PI * 2);
        context.fillStyle = index === Math.floor(scrollProgress * 5.99) ? '#b9ff25' : 'rgba(243,245,239,.72)';
        context.fill();
      });

      context.beginPath();
      context.arc(center.x, center.y, 22 + scrollProgress * 9, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(243,245,239,.45)';
      context.stroke();
      context.beginPath();
      context.arc(center.x, center.y, 4, 0, Math.PI * 2);
      context.fillStyle = '#b9ff25';
      context.fill();

      if (!reduced) frame = global.requestAnimationFrame(draw);
    }

    return {
      resize,
      draw,
      setPointer,
      setScroll,
      destroy() { destroyed = true; global.cancelAnimationFrame(frame); }
    };
  }

  function init(root) {
    const shell = root || document.querySelector('[data-av2-shell]');
    if (!shell) return null;
    if (instances.has(shell)) return instances.get(shell).api;

    const reducedQuery = global.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = global.matchMedia('(pointer: fine)');
    const menuButton = shell.querySelector('.av2-menu-button');
    const menu = shell.querySelector('.av2-menu');
    const hero = shell.querySelector('.av2-hero');
    const stage = shell.querySelector('.av2-system-stage');
    const cursor = shell.querySelector('[data-av2-cursor]');
    const signal = shell.querySelector('[data-av2-signal]');
    const field = createField(shell.querySelector('[data-av2-field]'), reducedQuery.matches);
    const cleanups = [];
    let lastFocus = null;
    let menuOpen = false;

    function listen(target, type, handler, options) {
      if (!target) return;
      target.addEventListener(type, handler, options);
      cleanups.push(() => target.removeEventListener(type, handler, options));
    }

    function setMenu(open) {
      if (!menu || !menuButton || menuOpen === open) return;
      menuOpen = open;
      menuButton.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      if (open) {
        lastFocus = document.activeElement;
        menu.setAttribute('data-open', '');
        document.documentElement.style.overflow = 'hidden';
        menu.querySelector('a')?.focus();
      } else {
        menu.removeAttribute('data-open');
        document.documentElement.style.removeProperty('overflow');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }
    }

    function onMenuKeydown(event) {
      if (!menuOpen) return;
      if (event.key === 'Escape') { setMenu(false); return; }
      if (event.key !== 'Tab') return;
      const focusable = [...menu.querySelectorAll('a[href], button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    listen(menuButton, 'click', () => setMenu(!menuOpen));
    listen(menu, 'click', event => { if (event.target.closest('a')) setMenu(false); });
    listen(document, 'keydown', onMenuKeydown);
    listen(global, 'resize', field.resize, { passive: true });

    if (!reducedQuery.matches && finePointer.matches) {
      listen(shell, 'pointermove', event => {
        field.setPointer(event.clientX / global.innerWidth, event.clientY / global.innerHeight);
        if (cursor) {
          cursor.setAttribute('data-visible', '');
          cursor.style.transform = `translate3d(${event.clientX - cursor.offsetWidth / 2}px, ${event.clientY - cursor.offsetHeight / 2}px, 0)`;
        }
      }, { passive: true });
      listen(shell, 'pointerover', event => {
        if (cursor && event.target.closest('a,button')) cursor.setAttribute('data-active', '');
      });
      listen(shell, 'pointerout', event => {
        if (cursor && event.target.closest('a,button')) cursor.removeAttribute('data-active');
      });
      listen(shell, 'pointerleave', () => cursor?.removeAttribute('data-visible'));
    }

    field.resize();
    if (reducedQuery.matches) field.draw(performance.now());

    const gsap = global.gsap;
    const ScrollTrigger = global.ScrollTrigger;
    let gsapContext = null;
    if (gsap && !reducedQuery.matches) {
      if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
      gsapContext = gsap.context(() => {
        const titleLines = shell.querySelectorAll('.av2-hero h1 > span');
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from(titleLines, { yPercent: 105, autoAlpha: 0, stagger: .07, duration: .85 })
          .from('.av2-kicker, .av2-intro, .av2-actions', { y: 18, autoAlpha: 0, stagger: .08, duration: .55 }, '-=.5')
          .from('.av2-hero-meta div, .av2-stage-label', { autoAlpha: 0, stagger: .06, duration: .4 }, '-=.25');

        if (ScrollTrigger && hero && stage) {
          gsap.to(stage, {
            yPercent: 10,
            scale: 1.06,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'bottom top',
              scrub: .5,
              onUpdate(self) {
                field.setScroll(self.progress);
                const active = Math.min(systemNames.length - 1, Math.floor(self.progress * systemNames.length));
                if (signal) signal.textContent = `${systemNames[active]} / ${String(active + 1).padStart(2, '0')}`;
              }
            }
          });
          gsap.to('.av2-scroll-cue i', { scaleY: .15, transformOrigin: 'top', ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
        }
      }, shell);
    }

    const api = {
      closeMenu: () => setMenu(false),
      destroy() {
        setMenu(false);
        field.destroy();
        gsapContext?.revert();
        cleanups.splice(0).forEach(cleanup => cleanup());
        instances.delete(shell);
      }
    };
    instances.set(shell, { api });
    return api;
  }

  function initAll(scope) {
    return [...(scope || document).querySelectorAll('[data-av2-shell]')].map(init);
  }

  global.AlemzaiShell = { init, initAll };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initAll(), { once: true });
  else initAll();
})(window);
