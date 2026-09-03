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

const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
}
menuToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
primaryNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false);
});

const services = [
  {title:'Websites and Shopify stores',description:'Purposeful web experiences for businesses that need clear messaging, useful customer paths, and maintainable content.',deliverables:['Business or campaign website','Shopify storefront structure','Landing pages and content sections'],build:'Website or Shopify store',example:{type:'demo',index:0}},
  {title:'AI videos, ads, brochures, and social content',description:'A connected visual-content system shaped around the campaign, audience, format, and publishing workflow.',deliverables:['Short-form video concepts','Advertising and brochure creative','Reusable social-content directions'],build:'AI video or campaign content',example:{type:'demo',index:2}},
  {title:'AI agents and custom GPT workflows',description:'Bounded assistants that organize knowledge, prompts, and repeatable tasks around a defined human workflow.',deliverables:['Custom GPT workflow','Prompt and knowledge architecture','Human approval checkpoints'],build:'AI agent or custom GPT workflow',example:{type:'demo',index:3}},
  {title:'Business automation',description:'Connected processes that reduce repetitive handoffs while keeping important decisions visible to people.',deliverables:['Workflow map','API or no-code integrations','Failure and approval states'],build:'Business automation',example:{type:'demo',index:3}},
  {title:'Simple applications and dashboards',description:'Focused interfaces that make a task, process, or operational view easier to use and understand.',deliverables:['Interactive front-end prototype','Operational dashboard concept','Responsive application interface'],build:'Application or dashboard',example:{type:'demo',index:3}},
  {title:'IT support and AI implementation',description:'Practical technical help for teams adopting digital tools, troubleshooting systems, or introducing AI responsibly.',deliverables:['Implementation plan','Technical setup and documentation','Staff guidance and support workflow'],build:'IT support or AI implementation',example:{type:'work',index:0}}
];

const demoDefinitions = [
  {name:'Barber shop website',type:'Responsive website',address:'preview.local/barber'},
  {name:'Fast-food website',type:'Interactive menu',address:'preview.local/food'},
  {name:'Graphic design studio website',type:'Filtered portfolio',address:'preview.local/studio'},
  {name:'Fitness app concept',type:'Mobile dashboard',address:'preview.local/fitness'}
];

const serviceButtons = [...document.querySelectorAll('[data-service]')];
const demoButtons = [...document.querySelectorAll('[data-demo]')];
const serviceTitle = document.querySelector('#service-title');
const serviceDescription = document.querySelector('#service-description');
const serviceDeliverables = document.querySelector('#service-deliverables');
const buildSelect = document.querySelector('[name="build"]');
let activeService = 0;
let activeDemo = 0;

function selectService(index, focus = false) {
  activeService = index;
  const service = services[index];
  serviceButtons.forEach((button, buttonIndex) => {
    const selected = buttonIndex === index;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#service-index').textContent = `0${index + 1} / SERVICE`;
  serviceTitle.textContent = service.title;
  serviceDescription.textContent = service.description;
  serviceDeliverables.replaceChildren(...service.deliverables.map(deliverable => {
    const item = document.createElement('li');
    item.textContent = deliverable;
    return item;
  }));
  if (focus) serviceButtons[index].focus();
  if (window.gsap && !reducedMotion) {
    gsap.fromTo('.service-detail > :not(.service-actions)', {y:12, autoAlpha:0}, {y:0, autoAlpha:1, stagger:.04, duration:.32, ease:'portfolio'});
  }
}

function keyboardSelect(event, index, length, callback) {
  if (!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? length - 1 : (index + (forward ? 1 : -1) + length) % length;
  callback(next, true);
}

serviceButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectService(index));
  button.addEventListener('keydown', event => keyboardSelect(event, index, services.length, selectService));
});

function barberDemo() {
  return `<div class="demo-ui barber-demo"><header><span class="demo-brand">Northline Barber</span><button class="outline-action demo-cta" data-demo-action="book">Book an appointment</button></header><h4>Look sharp.<br>Feel ready.</h4><p>A clean booking journey showing service, time, and inquiry states.</p><div class="micro-tabs" role="tablist" aria-label="Booking steps"><button class="active" data-micro="Choose a service">Service</button><button data-micro="Choose an available time">Time</button><button data-micro="Review contact details">Details</button></div><div class="demo-response" role="status">Choose a service to begin the demonstration.</div></div>`;
}

const foodItems = [
  {category:'burgers',name:'House Burger',detail:'Double patty · house sauce'},
  {category:'burgers',name:'Garden Stack',detail:'Grilled vegetables · herb sauce'},
  {category:'sides',name:'Crisp Fries',detail:'Sea salt · smoked seasoning'},
  {category:'sides',name:'Street Corn',detail:'Lime · chili · herbs'},
  {category:'drinks',name:'Citrus Fizz',detail:'Lemon · lime · soda'},
  {category:'drinks',name:'Cold Brew',detail:'Slow-steeped · chilled'}
];

function fastFoodDemo(category = 'all') {
  const items = foodItems.filter(item => category === 'all' || item.category === category);
  return `<div class="demo-ui food-demo"><header><span class="demo-brand">Counter / 24</span><button class="outline-action demo-cta" data-demo-action="food">Start an inquiry</button></header><h4>Fast menu.<br>Clear choices.</h4><div class="menu-filters" role="tablist" aria-label="Menu categories">${['all','burgers','sides','drinks'].map(item => `<button class="${item === category ? 'active' : ''}" data-food-filter="${item}">${item}</button>`).join('')}</div><div class="menu-items">${items.map(item => `<div class="menu-item"><b>${item.name}</b><span>${item.detail}</span></div>`).join('')}</div><div class="demo-response" role="status">Showing ${category === 'all' ? 'all menu categories' : category}.</div></div>`;
}

const studioItems = [
  {category:'brand',name:'Identity system',detail:'Direction · typography · usage'},
  {category:'web',name:'Launch website',detail:'Structure · interface · responsive build'},
  {category:'campaign',name:'Campaign toolkit',detail:'Concept · formats · publishing system'},
  {category:'brand',name:'Print direction',detail:'Brochure · presentation · collateral'},
  {category:'web',name:'Project archive',detail:'Filterable case-study experience'},
  {category:'campaign',name:'Social series',detail:'Templates · motion · content rhythm'}
];

function studioDemo(category = 'all') {
  const items = studioItems.filter(item => category === 'all' || item.category === category);
  return `<div class="demo-ui studio-demo"><header><span class="demo-brand">Form / Field Studio</span><button class="outline-action demo-cta" data-demo-action="studio">Send an inquiry</button></header><h4>Design with<br>a working system.</h4><div class="studio-filters" role="tablist" aria-label="Portfolio filters">${['all','brand','web','campaign'].map(item => `<button class="${item === category ? 'active' : ''}" data-studio-filter="${item}">${item}</button>`).join('')}</div><div class="studio-items">${items.map(item => `<div class="studio-item"><b>${item.name}</b><span>${item.detail}</span></div>`).join('')}</div><div class="demo-response" role="status">Showing ${category === 'all' ? 'all studio work' : category + ' work'}.</div></div>`;
}

function fitnessDemo(view = 'today') {
  const views = {
    today:[['Movement','3 planned sessions'],['Recovery','Check-in available'],['Focus','Mobility and consistency']],
    plans:[['Strength','Three-day foundation'],['Mobility','Daily movement plan'],['Cardio','Low-impact progression']],
    progress:[['Sessions','Recent activity overview'],['Consistency','Weekly pattern'],['Notes','Personal observations']],
    profile:[['Preferences','Training settings'],['Reminders','Notification choices'],['Support','Help and guidance']]
  };
  return `<div class="demo-ui fitness-demo"><header><span class="demo-brand">Form / Fitness</span><span>CONCEPT ONLY</span></header><h4>Your training.<br>One clear view.</h4><div class="fitness-cards">${views[view].map(card => `<div class="fitness-card"><b>${card[0]}</b><span>${card[1]}</span></div>`).join('')}</div><div class="fitness-nav" role="tablist" aria-label="Fitness app navigation">${['today','plans','progress','profile'].map(item => `<button class="${item === view ? 'active' : ''}" data-fitness-view="${item}">${item}</button>`).join('')}</div><div class="demo-response" role="status">${view[0].toUpperCase() + view.slice(1)} view selected.</div></div>`;
}

function renderDemo(index, focus = false) {
  activeDemo = index;
  demoButtons.forEach((button, buttonIndex) => {
    const selected = buttonIndex === index;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  const demo = demoDefinitions[index];
  document.querySelector('#demo-name').textContent = demo.name;
  document.querySelector('#demo-type').textContent = demo.type;
  document.querySelector('#demo-address').textContent = demo.address;
  document.querySelector('#demo-stage').innerHTML = index === 0 ? barberDemo() : index === 1 ? fastFoodDemo() : index === 2 ? studioDemo() : fitnessDemo();
  if (focus) demoButtons[index].focus();
  if (window.gsap && !reducedMotion) gsap.fromTo('#demo-stage > *', {autoAlpha:0, y:14}, {autoAlpha:1, y:0, duration:.35, ease:'portfolio'});
}

demoButtons.forEach((button, index) => {
  button.addEventListener('click', () => renderDemo(index));
  button.addEventListener('keydown', event => keyboardSelect(event, index, demoDefinitions.length, renderDemo));
});

document.querySelector('#view-service-example').addEventListener('click', () => {
  const example = services[activeService].example;
  if (example.type === 'demo') {
    renderDemo(example.index);
    document.querySelector('#demos').scrollIntoView();
  } else {
    document.querySelectorAll('#work .project')[example.index].scrollIntoView();
  }
});

document.querySelector('#request-service').addEventListener('click', () => {
  buildSelect.value = services[activeService].build;
});

document.querySelector('#demo-stage').addEventListener('click', event => {
  const micro = event.target.closest('[data-micro]');
  const food = event.target.closest('[data-food-filter]');
  const studio = event.target.closest('[data-studio-filter]');
  const fitness = event.target.closest('[data-fitness-view]');
  const action = event.target.closest('[data-demo-action]');
  if (micro) {
    document.querySelectorAll('[data-micro]').forEach(button => button.classList.toggle('active', button === micro));
    document.querySelector('#demo-stage .demo-response').textContent = micro.dataset.micro + '. This front-end demo does not submit a booking.';
  }
  if (food) document.querySelector('#demo-stage').innerHTML = fastFoodDemo(food.dataset.foodFilter);
  if (studio) document.querySelector('#demo-stage').innerHTML = studioDemo(studio.dataset.studioFilter);
  if (fitness) document.querySelector('#demo-stage').innerHTML = fitnessDemo(fitness.dataset.fitnessView);
  if (action) {
    const response = document.querySelector('#demo-stage .demo-response');
    response.textContent = 'Demo inquiry state opened. No information was sent.';
  }
});

const form = document.querySelector('#project-form');
const formStatus = document.querySelector('#form-status');
const description = form.elements.description;
const formEndpoint = document.querySelector('meta[name="form-endpoint"]').content.trim();
const contactEmail = document.querySelector('meta[name="contact-email"]').content.trim();
const bookingUrl = document.querySelector('meta[name="booking-url"]').content.trim();
const bookingLink = document.querySelector('.booking-link');

description.addEventListener('input', () => {
  document.querySelector('#description-count').textContent = description.value.length;
});

if (contactEmail) {
  const link = document.createElement('a');
  link.className = 'contact-email';
  link.href = `mailto:${contactEmail}`;
  link.textContent = contactEmail;
  document.querySelector('#contact-fallback').replaceChildren('Email fallback: ', link);
}

if (bookingUrl) {
  bookingLink.href = bookingUrl;
  bookingLink.removeAttribute('aria-disabled');
  bookingLink.target = '_blank';
  bookingLink.rel = 'noopener';
  document.querySelector('#booking-fallback').textContent = 'Booking link: configured.';
} else {
  bookingLink.addEventListener('click', event => {
    event.preventDefault();
    formStatus.className = 'form-status wide error';
    formStatus.textContent = 'Booking is not configured yet. Use the project form or configured email fallback.';
  });
}

form.addEventListener('input', event => {
  if (event.target.matches('input,select,textarea')) event.target.removeAttribute('aria-invalid');
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('[required]')];
  fields.forEach(field => field.setAttribute('aria-invalid', String(!field.checkValidity())));
  const invalid = fields.find(field => !field.checkValidity());
  if (invalid) {
    formStatus.className = 'form-status wide error';
    formStatus.textContent = 'Please complete every required field with a valid email address.';
    invalid.focus();
    return;
  }
  const payload = Object.fromEntries(new FormData(form));
  if (!formEndpoint) {
    formStatus.className = 'form-status wide success';
    formStatus.textContent = `Inquiry validated and ready, but it was not sent because no form endpoint is configured.${contactEmail ? ' Use the visible email fallback.' : ' Email fallback is also not configured.'}`;
    return;
  }
  formStatus.className = 'form-status wide';
  formStatus.textContent = 'Sending inquiry…';
  try {
    const response = await fetch(formEndpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
    if (!response.ok) throw new Error('Endpoint rejected the inquiry');
    formStatus.className = 'form-status wide success';
    formStatus.textContent = 'Inquiry delivered successfully.';
    form.reset();
    document.querySelector('#description-count').textContent = '0';
  } catch {
    formStatus.className = 'form-status wide error';
    formStatus.textContent = `The inquiry could not be delivered.${contactEmail ? ' Please use the visible email fallback.' : ' Email fallback is not configured.'}`;
  }
});

if (finePointer && !reducedMotion) {
  document.addEventListener('pointerover', event => {
    if (event.target.closest('a,button,input,select,textarea')) cursor.classList.add('active');
  });
  document.addEventListener('pointerout', event => {
    if (event.target.closest('a,button,input,select,textarea')) cursor.classList.remove('active');
  });
}

selectService(0);
renderDemo(0);

if (window.gsap) {
  const clientMotion = gsap.matchMedia();
  clientMotion.add('(prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll('.client-reveal').forEach(element => {
      gsap.from(element, {y:28, autoAlpha:0, duration:.7, ease:'portfolio', scrollTrigger:{trigger:element, start:'top 88%', once:true}});
    });
  });
}
