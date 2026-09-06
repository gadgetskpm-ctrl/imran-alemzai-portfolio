(function (global) {
  'use strict';

  const scheduler = global.AlemzaiMotionScheduler;
  const tokens = global.AlemzaiMotionTokens;
  const cleanups = new Set();
  const subscribers = new Set();
  const reducedQuery = global.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopQuery = global.matchMedia('(min-width: 900px) and (pointer: fine) and (hover: hover)');
  const pointer = { x: global.innerWidth / 2, y: global.innerHeight / 2, nx: 0, ny: 0, active: false };
  let reduced = reducedQuery.matches;
  let capableDesktop = desktopQuery.matches;
  let smoother = null;
  let destroyed = false;

  function notify(type) {
    subscribers.forEach(callback => callback({ type, reduced, capableDesktop, pointer }));
  }

  function listen(target, type, handler, options) {
    if (!target) return function () {};
    target.addEventListener(type, handler, options);
    const cleanup = () => target.removeEventListener(type, handler, options);
    cleanups.add(cleanup);
    return () => { cleanup(); cleanups.delete(cleanup); };
  }

  function listenQuery(query, handler) {
    if (query.addEventListener) return listen(query, 'change', handler);
    query.addListener(handler);
    const cleanup = () => query.removeListener(handler);
    cleanups.add(cleanup);
    return cleanup;
  }

  function disableSmooth() {
    if (!smoother) return;
    smoother.kill();
    smoother = null;
  }

  function enableSmooth(options) {
    disableSmooth();
    const gsap = global.gsap;
    const ScrollTrigger = global.ScrollTrigger;
    const ScrollSmoother = global.ScrollSmoother;
    if (destroyed || reduced || !capableDesktop || !gsap || !ScrollTrigger || !ScrollSmoother) return null;
    const settings = options || {};
    const wrapper = settings.wrapper || document.querySelector('[data-smooth-wrapper]');
    const content = settings.content || document.querySelector('[data-smooth-content]');
    if (!wrapper || !content) return null;
    smoother = ScrollSmoother.create({
      wrapper,
      content,
      smooth: settings.smooth == null ? tokens.smooth.duration : settings.smooth,
      effects: settings.effects == null ? tokens.smooth.effects : settings.effects,
      normalizeScroll: settings.normalizeScroll == null ? tokens.smooth.normalizeScroll : settings.normalizeScroll,
      smoothTouch: 0
    });
    return smoother;
  }

  function observe(element, callback, options) {
    if (!element || typeof callback !== 'function') return function () {};
    if (!('IntersectionObserver' in global)) { callback(true); return function () {}; }
    const observer = new IntersectionObserver(entries => callback(Boolean(entries[0]?.isIntersecting), entries[0]), options);
    observer.observe(element);
    const cleanup = () => observer.disconnect();
    cleanups.add(cleanup);
    return () => { cleanup(); cleanups.delete(cleanup); };
  }

  function registerCleanup(callback) {
    if (typeof callback !== 'function') return function () {};
    cleanups.add(callback);
    return () => cleanups.delete(callback);
  }

  function createContext(name) {
    const local = new Set();
    let disposed = false;
    const context = {
      name: name || '',
      add(callback) {
        if (disposed || typeof callback !== 'function') return function () {};
        local.add(callback);
        return () => local.delete(callback);
      },
      listen(target, type, handler, options) {
        if (disposed || !target) return function () {};
        target.addEventListener(type, handler, options);
        return context.add(() => target.removeEventListener(type, handler, options));
      },
      subscribeFrame(callback) { return context.add(scheduler.add(callback)); },
      destroy() {
        if (disposed) return;
        disposed = true;
        Array.from(local).reverse().forEach(cleanup => cleanup());
        local.clear();
        cleanups.delete(context.destroy);
      }
    };
    cleanups.add(context.destroy);
    return Object.freeze(context);
  }

  function scrollTo(target, options) {
    const settings = options || {};
    const resolved = typeof target === 'string' ? document.querySelector(target) : target;
    if (smoother) {
      smoother.scrollTo(resolved || target, settings.smooth !== false && !reduced, settings.position || 'top top');
      return true;
    }
    if (resolved?.scrollIntoView) {
      resolved.scrollIntoView({ behavior: reduced || settings.smooth === false ? 'auto' : 'smooth', block: settings.block || 'start' });
      return true;
    }
    if (typeof target === 'number') {
      global.scrollTo({ top: target, behavior: reduced || settings.smooth === false ? 'auto' : 'smooth' });
      return true;
    }
    return false;
  }

  listen(global, 'pointermove', event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.nx = event.clientX / Math.max(1, global.innerWidth) - 0.5;
    pointer.ny = event.clientY / Math.max(1, global.innerHeight) - 0.5;
    pointer.active = true;
  }, { passive: true });
  listen(global, 'pointerleave', () => { pointer.active = false; }, { passive: true });
  listen(document, 'visibilitychange', () => scheduler.setEnabled(!document.hidden));
  listenQuery(reducedQuery, event => {
    reduced = event.matches;
    document.documentElement.toggleAttribute('data-reduced-motion', reduced);
    if (reduced) disableSmooth();
    notify('motion');
  });
  listenQuery(desktopQuery, event => {
    capableDesktop = event.matches;
    if (!capableDesktop) disableSmooth();
    notify('capability');
  });

  document.documentElement.toggleAttribute('data-reduced-motion', reduced);
  scheduler?.setEnabled(!document.hidden);
  scheduler?.start();

  const api = {
    tokens,
    pointer,
    get reduced() { return reduced; },
    get capableDesktop() { return capableDesktop; },
    get smoother() { return smoother; },
    isReduced: () => reduced,
    getPointer: () => pointer,
    subscribeFrame(callback) { return scheduler.add(callback); },
    onReducedChange(callback, options) {
      if (typeof callback !== 'function') return function () {};
      const wrapped = event => { if (event.type === 'motion') callback(event.reduced); };
      subscribers.add(wrapped);
      if (options?.immediate) callback(reduced);
      return () => subscribers.delete(wrapped);
    },
    listen,
    observe,
    addCleanup: registerCleanup,
    registerCleanup,
    createContext,
    onChange(callback) { subscribers.add(callback); return () => subscribers.delete(callback); },
    enableSmooth,
    disableSmooth,
    refresh() { smoother?.refresh?.(); global.ScrollTrigger?.refresh?.(); },
    scrollTo,
    createHero(options) { return global.AlemzaiHeroCanvas?.create({ ...options, controller: api, scheduler }); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      disableSmooth();
      cleanups.forEach(cleanup => cleanup());
      cleanups.clear();
      subscribers.clear();
      scheduler?.clear();
      scheduler?.stop();
      delete global.AlemzaiMotion;
    }
  };

  global.AlemzaiMotion = Object.freeze(api);
})(window);
