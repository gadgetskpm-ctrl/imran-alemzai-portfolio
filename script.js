const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotion = motionQuery.matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const cursor = document.querySelector('.cursor');
const canvas = document.querySelector('#field');
const context = canvas.getContext('2d');
let dots = [];
let mouseX = .5;
let mouseY = .5;

function sizeCanvas() {
  const density = Math.min(devicePixelRatio, 2);
  const bounds = canvas.getBoundingClientRect();
  canvas.width = bounds.width * density;
  canvas.height = bounds.height * density;
  context.setTransform(density, 0, 0, density, 0, 0);
  dots = Array.from({ length: 170 }, () => ({
    x: Math.random() * bounds.width,
    y: Math.random() * bounds.height,
    z: .2 + Math.random() * .9,
    phase: Math.random() * 6.28
  }));
}

function drawField(time = 0) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  context.clearRect(0, 0, width, height);
  for (const dot of dots) {
    const wave = reducedMotion ? 0 : Math.sin(dot.x * .012 + time * .0003 + dot.phase) * 55 * dot.z;
    const x = dot.x + (reducedMotion ? 0 : (mouseX - .5) * 35 * dot.z);
    const y = dot.y + wave + (reducedMotion ? 0 : (mouseY - .5) * 25 * dot.z);
    context.fillStyle = `rgba(239,243,235,${.12 + dot.z * .5})`;
    context.fillRect(x, y, 1.2 * dot.z, 1.2 * dot.z);
  }
  if (!reducedMotion) requestAnimationFrame(drawField);
}

sizeCanvas();
addEventListener('resize', () => {
  sizeCanvas();
  if (reducedMotion) drawField();
});

if (reducedMotion) {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
  drawField();
} else {
  addEventListener('pointermove', event => {
    mouseX = event.clientX / innerWidth;
    mouseY = event.clientY / innerHeight;
  });
  requestAnimationFrame(drawField);
}

if (window.gsap) {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, MotionPathPlugin, Observer);
  CustomEase.create('portfolio', 'M0,0 C0.16,1 0.3,1 1,1');

  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const split = new SplitText('.hero h1', { type: 'lines,words', linesClass: 'line', wordsClass: 'word' });
    gsap.timeline({ defaults: { ease: 'portfolio' } })
      .from(split.words, { yPercent: 115, autoAlpha: 0, stagger: .045, duration: .85 })
      .from('.hero-copy > p, .hero-copy > .button', { y: 22, autoAlpha: 0, stagger: .1, duration: .65 }, '-=.45')
      .from('.hero .rail, .hero small', { autoAlpha: 0, duration: .45 }, '-=.3');

    document.querySelectorAll('.project').forEach((project, index) => {
      const copy = project.querySelectorAll('.number, .tags, h2, .result, div > p:last-child');
      const visual = project.querySelector('.visual');
      gsap.timeline({
        scrollTrigger: {
          trigger: project,
          start: 'top 78%',
          end: 'center 48%',
          scrub: .55
        }
      })
        .fromTo(copy, { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .06, ease: 'portfolio' })
        .fromTo(visual,
          { xPercent: index % 2 ? -7 : 7, clipPath: 'inset(14% 10% 14% 10%)', scale: .96 },
          { xPercent: 0, clipPath: 'inset(0% 0% 0% 0%)', scale: 1, ease: 'portfolio' },
          '<'
        );
    });

    document.querySelectorAll('.capabilities .reveal, .approach .reveal').forEach(element => {
      gsap.from(element, {
        y: 30,
        autoAlpha: 0,
        duration: .75,
        ease: 'portfolio',
        scrollTrigger: { trigger: element, start: 'top 86%', once: true }
      });
    });

    gsap.to('.cross.a', {
      motionPath: {
        path: [{ x: 0, y: 0 }, { x: 55, y: 24 }, { x: 100, y: -12 }],
        curviness: 1.35
      },
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    if (finePointer) {
      gsap.set(cursor, { xPercent: -50, yPercent: -50 });
      const cursorX = gsap.quickTo(cursor, 'x', { duration: .18, ease: 'power3.out' });
      const cursorY = gsap.quickTo(cursor, 'y', { duration: .18, ease: 'power3.out' });
      const artX = gsap.quickTo('.hero-art', 'x', { duration: .8, ease: 'portfolio' });
      const artY = gsap.quickTo('.hero-art', 'y', { duration: .8, ease: 'portfolio' });
      const copyX = gsap.quickTo('.hero-copy', 'x', { duration: .9, ease: 'portfolio' });
      const copyY = gsap.quickTo('.hero-copy', 'y', { duration: .9, ease: 'portfolio' });

      addEventListener('pointermove', event => {
        cursorX(event.clientX);
        cursorY(event.clientY);
        const x = event.clientX / innerWidth - .5;
        const y = event.clientY / innerHeight - .5;
        artX(x * 20);
        artY(y * 14);
        copyX(x * -6);
        copyY(y * -4);
      });

      document.querySelectorAll('a').forEach(link => {
        link.addEventListener('mouseenter', () => cursor.classList.add('active'));
        link.addEventListener('mouseleave', () => cursor.classList.remove('active'));
      });
    }

    let gestureTimer;
    const signalGesture = direction => {
      document.body.classList.add('gesture-active');
      gsap.to('.hero small', { y: direction * 4, duration: .18, yoyo: true, repeat: 1, ease: 'power1.out' });
      clearTimeout(gestureTimer);
      gestureTimer = setTimeout(() => document.body.classList.remove('gesture-active'), 260);
    };
    const gestureObserver = Observer.create({
      target: window,
      type: 'wheel,touch',
      tolerance: 12,
      preventDefault: false,
      onUp: () => signalGesture(1),
      onDown: () => signalGesture(-1)
    });

    return () => {
      clearTimeout(gestureTimer);
      gestureObserver.kill();
      split.revert();
    };
  });

  motion.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('.reveal, .project .visual, .hero-copy, .hero-art, .cross.a, .hero small', {
      clearProps: 'all',
      autoAlpha: 1
    });
  });
}
