(function (global) {
  'use strict';

  const callbacks = new Set();
  let frame = 0;
  let lastTime = 0;
  let running = false;
  let enabled = !document.hidden;

  function tick(time) {
    frame = 0;
    if (!running || !enabled || callbacks.size === 0) return;
    const delta = lastTime ? Math.min(64, time - lastTime) : 16.67;
    lastTime = time;
    callbacks.forEach(callback => callback(time, delta));
    frame = global.requestAnimationFrame(tick);
  }

  function sync() {
    const shouldRun = running && enabled && callbacks.size > 0;
    if (shouldRun && !frame) {
      lastTime = 0;
      frame = global.requestAnimationFrame(tick);
    } else if (!shouldRun && frame) {
      global.cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }
  }

  const scheduler = Object.freeze({
    add(callback) {
      if (typeof callback !== 'function') return function () {};
      callbacks.add(callback);
      sync();
      return () => { callbacks.delete(callback); sync(); };
    },
    start() { running = true; sync(); },
    stop() { running = false; sync(); },
    setEnabled(value) { enabled = Boolean(value); sync(); },
    renderOnce(time) {
      const now = typeof time === 'number' ? time : performance.now();
      callbacks.forEach(callback => callback(now, 0));
    },
    clear() { callbacks.clear(); sync(); },
    get size() { return callbacks.size; },
    get running() { return Boolean(frame); }
  });

  global.AlemzaiMotionScheduler = scheduler;
})(window);
