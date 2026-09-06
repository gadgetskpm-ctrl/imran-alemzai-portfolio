(function (global) {
  'use strict';

  const tokens = Object.freeze({
    duration: Object.freeze({ instant: 0, fast: 0.2, base: 0.45, slow: 0.8, ambient: 1.4 }),
    ease: Object.freeze({
      standard: 'power2.out',
      emphasized: 'power3.out',
      enter: 'power4.out',
      exit: 'power2.in'
    }),
    stagger: Object.freeze({ tight: 0.035, base: 0.07, loose: 0.12 }),
    distance: Object.freeze({ near: 8, base: 18, far: 36 }),
    smooth: Object.freeze({ duration: 0.65, effects: false, normalizeScroll: false }),
    canvas: Object.freeze({ maxDpr: 1.75, accent: '#b9ff25', ink: '#f3f5ef' })
  });

  global.AlemzaiMotionTokens = tokens;
})(window);
