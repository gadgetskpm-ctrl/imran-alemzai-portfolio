(function (global) {
  'use strict';

  const names = ['AI', 'WEB', 'AUTOMATION', 'MEDIA', 'APPS', 'IT'];

  function create(options) {
    const settings = options || {};
    const canvas = settings.canvas;
    const controller = settings.controller || global.AlemzaiMotion;
    const scheduler = settings.scheduler || global.AlemzaiMotionScheduler;
    const context = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    if (!canvas || !context || !controller || !scheduler) return null;

    const tokens = global.AlemzaiMotionTokens || { canvas: { maxDpr: 1.75, accent: '#b9ff25', ink: '#f3f5ef' } };
    let width = 1;
    let height = 1;
    let progress = 0;
    let active = true;
    let destroyed = false;

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(global.devicePixelRatio || 1, tokens.canvas.maxDpr);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    function position(index, time) {
      const reduced = controller.reduced;
      const pointer = controller.pointer;
      const angle = index / names.length * Math.PI * 2 - Math.PI / 2 + progress * 0.6;
      const radius = Math.min(width, height) * (0.2 + progress * 0.055);
      const drift = reduced ? 0 : Math.sin(time * 0.00035 + index) * 4;
      return {
        x: width * 0.58 + Math.cos(angle) * (radius + drift) + (reduced ? 0 : pointer.nx * (8 + index * 1.4)),
        y: height * 0.48 + Math.sin(angle) * (radius + drift) + (reduced ? 0 : pointer.ny * (8 + index * 1.1))
      };
    }

    function draw(time) {
      if (destroyed || !active) return;
      context.clearRect(0, 0, width, height);
      const center = { x: width * 0.58, y: height * 0.48 };
      const points = names.map((name, index) => position(index, time));
      const selected = Math.min(names.length - 1, Math.floor(progress * names.length));

      points.forEach((point, index) => {
        context.beginPath();
        context.moveTo(center.x, center.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = `rgba(185,255,37,${0.12 + progress * 0.16})`;
        context.lineWidth = 1;
        context.stroke();
        context.beginPath();
        context.arc(point.x, point.y, index === selected ? 7 : 3, 0, Math.PI * 2);
        context.fillStyle = index === selected ? tokens.canvas.accent : 'rgba(243,245,239,.72)';
        context.fill();
      });

      context.beginPath();
      context.arc(center.x, center.y, 22 + progress * 9, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(243,245,239,.45)';
      context.stroke();
      context.beginPath();
      context.arc(center.x, center.y, 4, 0, Math.PI * 2);
      context.fillStyle = tokens.canvas.accent;
      context.fill();
    }

    const removeFrame = scheduler.add(time => {
      if (!controller.reduced) draw(time);
    });
    const removeMotion = controller.onChange(event => {
      if (event.type === 'motion') draw(performance.now());
    });
    const unobserve = controller.observe(canvas, visible => {
      active = visible;
      if (visible) draw(performance.now());
    }, { rootMargin: '160px 0px' });
    const resizeObserver = 'ResizeObserver' in global ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(canvas);
    if (!resizeObserver) global.addEventListener('resize', resize, { passive: true });
    resize();

    return Object.freeze({
      resize,
      render: draw,
      setProgress(value) { progress = Math.max(0, Math.min(1, Number(value) || 0)); if (controller.reduced) draw(performance.now()); },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        removeFrame();
        removeMotion();
        unobserve();
        resizeObserver?.disconnect();
        if (!resizeObserver) global.removeEventListener('resize', resize);
        context.clearRect(0, 0, width, height);
      }
    });
  }

  global.AlemzaiHeroCanvas = Object.freeze({ create });
})(window);
