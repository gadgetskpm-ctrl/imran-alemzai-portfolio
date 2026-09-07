(function alemzaiShellModule(global) {
  'use strict';

  const instances = new WeakMap();
  const labels = ['AI', 'WEB', 'AUTOMATION', 'MEDIA', 'APPS', 'IT'];

  function drawStaticField(canvas) {
    const context = canvas?.getContext?.('2d');
    if (!context) return;
    const bounds = canvas.getBoundingClientRect();
    const density = Math.min(global.devicePixelRatio || 1, 1.75);
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    context.setTransform(density, 0, 0, density, 0, 0);
    context.clearRect(0, 0, width, height);
    const center = { x: width * .58, y: height * .48 };
    const radius = Math.min(width, height) * .2;
    context.lineWidth = 1;
    labels.forEach((label, index) => {
      const angle = index / labels.length * Math.PI * 2 - Math.PI / 2;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      context.beginPath();
      context.moveTo(center.x, center.y);
      context.lineTo(x, y);
      context.strokeStyle = 'rgba(185,255,37,.16)';
      context.stroke();
      context.beginPath();
      context.arc(x, y, index ? 3 : 7, 0, Math.PI * 2);
      context.fillStyle = index ? 'rgba(243,245,239,.72)' : '#b9ff25';
      context.fill();
    });
    context.beginPath();
    context.arc(center.x, center.y, 22, 0, Math.PI * 2);
    context.strokeStyle = 'rgba(243,245,239,.45)';
    context.stroke();
  }

  function init(root) {
    const shell = root || document.querySelector('[data-av2-shell]');
    if (!shell) return null;
    if (instances.has(shell)) return instances.get(shell);

    const motion = global.AlemzaiMotion;
    const context = motion?.createContext?.('shell');
    const cleanups = [];
    const listen = context?.listen ? context.listen.bind(context) : (target, type, handler, options) => {
      target?.addEventListener(type, handler, options);
      const remove = () => target?.removeEventListener(type, handler, options);
      cleanups.push(remove);
      return remove;
    };
    const menuButton = shell.querySelector('.av2-menu-button');
    const menu = shell.querySelector('.av2-menu');
    const canvas = shell.querySelector('[data-av2-field]');
    const heroSection = shell.querySelector('.av2-hero');
    const cursor = shell.querySelector('[data-av2-cursor]');
    const signal = shell.querySelector('[data-av2-signal]');
    let lastFocus = null;
    let menuOpen = false;
    let hero = null;

    function setMenu(open, restoreFocus = true) {
      if (!menu || !menuButton || open === menuOpen) return;
      menuOpen = open;
      menuButton.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      menu.toggleAttribute('data-open', open);
      shell.toggleAttribute('data-menu-open', open);
      document.documentElement.classList.toggle('av2-menu-locked', open);
      if (open) {
        lastFocus = document.activeElement;
        menu.querySelector('a[href]')?.focus();
      } else if (restoreFocus && lastFocus?.isConnected) lastFocus.focus();
    }

    function trapMenu(event) {
      if (!menuOpen) return;
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false); return; }
      if (event.key !== 'Tab') return;
      const focusable = [...menu.querySelectorAll('a[href], button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    function mountHero() {
      hero?.destroy?.();
      hero = motion?.createHero?.({ canvas, root: shell }) || null;
      if (!hero) drawStaticField(canvas);
    }

    listen(menuButton, 'click', () => setMenu(!menuOpen));
    listen(menu, 'click', event => { if (event.target.closest('a[href]')) setMenu(false, false); });
    listen(document, 'keydown', trapMenu);
    listen(global, 'resize', () => { if (!hero) drawStaticField(canvas); }, { passive: true });
    if (context?.subscribeFrame) context.subscribeFrame(() => {
      const reduced = motion.isReduced();
      const pointer = motion.getPointer();
      const showCursor = !reduced && motion.capableDesktop && pointer.active;
      cursor?.toggleAttribute('data-visible', showCursor);
      if (cursor && showCursor) cursor.style.transform = `translate3d(${pointer.x - cursor.offsetWidth / 2}px, ${pointer.y - cursor.offsetHeight / 2}px, 0)`;
      if (!heroSection || !hero) return;
      const bounds = heroSection.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height)));
      hero.setProgress?.(progress);
      const active = Math.min(labels.length - 1, Math.floor(progress * labels.length));
      if (signal) signal.textContent = `${labels[active]} / ${String(active + 1).padStart(2, '0')}`;
    });
    if (typeof motion?.onReducedChange === 'function') {
      const dispose = motion.onReducedChange(mountHero);
      if (context?.add) context.add(dispose); else cleanups.push(dispose);
    }
    mountHero();
    shell.dataset.shellReady = 'true';

    const api = {
      closeMenu: () => setMenu(false),
      destroy() {
        setMenu(false, false);
        document.documentElement.classList.remove('av2-menu-locked');
        hero?.destroy?.();
        context?.destroy?.();
        cleanups.splice(0).forEach(cleanup => typeof cleanup === 'function' && cleanup());
        delete shell.dataset.shellReady;
        instances.delete(shell);
      }
    };
    instances.set(shell, api);
    return api;
  }

  function initAll(scope) { return [...(scope || document).querySelectorAll('[data-av2-shell]')].map(init); }
  function destroyAll(scope) { [...(scope || document).querySelectorAll('[data-av2-shell]')].forEach(root => instances.get(root)?.destroy()); }

  global.AlemzaiShell = { init, initAll, destroyAll };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initAll(), { once: true });
  else initAll();
}(window));
