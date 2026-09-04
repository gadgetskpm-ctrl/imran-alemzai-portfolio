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
  {category:'Graphic design & brand assets',title:'Build a brand people recognize.',description:'Visual assets that make a business look consistent, credible, and ready to sell.',deliverables:['Logos and visual identity','Brochures and flyers','Product packaging','ID cards and business materials','Social graphics','Presentation designs'],workflow:['BRIEF','IDENTITY','ASSETS','DELIVER'],preview:'assets/services/graphic-design.webp',alt:'Abstract brochure, packaging, identity, poster, and social graphic mockups',caption:'Brand asset system preview',build:'Graphic design and brand assets',example:{type:'demo',index:2}},
  {category:'AI video & content production',title:'Turn ideas into publish-ready media.',description:'AI-assisted content systems that turn ideas into publish-ready media.',deliverables:['Higgsfield AI videos','Short-form video concepts','Scripts and storyboards','Product visuals','Social media content','Creative production workflows'],workflow:['IDEA','SCRIPT','VISUAL','EDIT','PUBLISH'],preview:'assets/services/ai-content.webp',alt:'Abstract AI product-video frame, storyboard, and production timeline',caption:'AI production system preview',build:'AI video and content production',example:{type:'demo',index:2}},
  {category:'Digital advertising & campaigns',title:'Move attention toward action.',description:'Digital campaigns designed to attract attention and move people toward action.',deliverables:['Campaign strategy','TikTok, Meta, and Google ad concepts','Ad creative variations','Audience and offer positioning','Landing-page campaigns','Performance review and iteration'],workflow:['AUDIENCE','OFFER','CREATIVE','CAMPAIGN','ITERATE'],preview:'assets/services/digital-campaigns.webp',alt:'Abstract campaign layout with ad variations and landing-page preview',caption:'Campaign system preview',build:'Digital advertising and campaigns',example:{type:'demo',index:1}},
  {category:'Websites & Shopify',title:'Create a clear path from visit to action.',description:'Purposeful web experiences for businesses that need clear messaging, useful customer paths, and maintainable content.',deliverables:['Business or campaign website','Shopify storefront structure','Landing pages and content sections'],workflow:['DISCOVER','STRUCTURE','DESIGN','BUILD','LAUNCH'],preview:null,build:'Website or Shopify store',example:{type:'demo',index:0}},
  {category:'AI agents & custom GPT workflows',title:'Give repeatable work a practical AI system.',description:'Bounded assistants that organize knowledge, prompts, and repeatable tasks around a defined human workflow.',deliverables:['Custom GPT workflow','Prompt and knowledge architecture','Human approval checkpoints'],workflow:['TASK','KNOWLEDGE','PROMPT','REVIEW','USE'],preview:null,build:'AI agent or custom GPT workflow',example:{type:'demo',index:3}},
  {category:'Business automation',title:'Connect the steps that slow work down.',description:'Connected processes that reduce repetitive handoffs while keeping important decisions visible to people.',deliverables:['Workflow map','API or no-code integrations','Failure and approval states'],workflow:['MAP','CONNECT','CHECK','AUTOMATE'],preview:null,build:'Business automation',example:{type:'demo',index:3}},
  {category:'Applications & dashboards',title:'Make complex work easier to operate.',description:'Focused interfaces that make a task, process, or operational view easier to use and understand.',deliverables:['Interactive front-end prototype','Operational dashboard concept','Responsive application interface'],workflow:['DEFINE','PROTOTYPE','BUILD','TEST'],preview:null,build:'Application or dashboard',example:{type:'demo',index:3}},
  {category:'IT support & AI implementation',title:'Put useful technology into practice.',description:'Practical technical help for teams adopting digital tools, troubleshooting systems, or introducing AI responsibly.',deliverables:['Implementation plan','Technical setup and documentation','Staff guidance and support workflow'],workflow:['ASSESS','SET UP','DOCUMENT','SUPPORT'],preview:null,build:'IT support or AI implementation',example:{type:'demo',index:3}}
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
['Digital advertising and campaigns','AI video and content production','Graphic design and brand assets'].forEach(label => {
  if (![...buildSelect.options].some(option => option.value === label)) {
    const option = document.createElement('option');
    option.textContent = label;
    buildSelect.insertBefore(option, buildSelect.options[1]);
  }
});
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
  document.querySelector('#service-category').textContent = service.category;
  serviceTitle.closest('.service-detail').dataset.serviceActive = index;
  serviceTitle.textContent = service.title;
  serviceDescription.textContent = service.description;
  const preview = document.querySelector('#service-preview');
  const previewFigure = preview.closest('.service-preview');
  previewFigure.classList.toggle('service-preview-placeholder', !service.preview);
  preview.hidden = !service.preview;
  if (service.preview) {
    preview.src = service.preview;
    preview.alt = service.alt;
  }
  document.querySelector('#service-preview-caption').textContent = service.preview ? service.caption : `${service.category} system preview`;
  document.querySelector('#service-workflow').replaceChildren(...service.workflow.map((step, stepIndex) => {
    const item = document.createElement('span');
    item.textContent = step;
    if (stepIndex < service.workflow.length - 1) item.dataset.next = '→';
    return item;
  }));
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

const barberStates = {
  hero: {
    copy:'Explore a sample booking journey for a fictional barbershop.',
    response:'Select Service, Time, or Details to explore the demonstration.'
  },
  service: {
    copy:'Choose from clearly priced sample services before continuing.',
    response:'Sample services selected. No appointment or payment is created.'
  },
  time: {
    copy:'Review sample time windows in a calm, focused booking environment.',
    response:'Sample time step selected. Availability is illustrative only.'
  },
  details: {
    copy:'Review the service, preferred time, and contact fields before sending an inquiry.',
    response:'Sample details step selected. This demo does not send personal information.'
  }
};

function barberDemo() {
  return `<div class="demo-ui barber-demo" data-barber-active="hero"><header><span class="demo-brand">Northline Barber</span><button class="outline-action demo-cta" data-demo-action="book">Book an appointment</button></header><div class="barber-layout"><section class="barber-copy"><span class="barber-label">FICTIONAL DEMO · SAMPLE PRICING</span><h4>Look sharp.<br>Feel ready.</h4><p id="barber-state-copy">${barberStates.hero.copy}</p><div class="micro-tabs" role="tablist" aria-label="Sample booking steps"><button role="tab" aria-selected="false" tabindex="0" data-barber-state="service">Service</button><button role="tab" aria-selected="false" tabindex="-1" data-barber-state="time">Time</button><button role="tab" aria-selected="false" tabindex="-1" data-barber-state="details">Details</button></div><div class="barber-state-panel" id="barber-state-panel"><p>Sample flow: choose a service → select a preferred time → review inquiry details.</p></div><div class="demo-response" role="status">${barberStates.hero.response}</div></section><figure class="barber-visual"><div class="barber-image-stage"><img class="active" data-barber-image="hero" src="public/assets/demos/northline-barber/hero-barber.webp" alt="Customer seated in the fictional Northline Barber studio" loading="eager" decoding="async" fetchpriority="high"><img data-barber-image="service" src="public/assets/demos/northline-barber/service-cut.webp" alt="Barber refining a customer's haircut in the Northline service preview" loading="lazy" decoding="async"><img data-barber-image="time" src="public/assets/demos/northline-barber/booking-space.webp" alt="Prepared barber chair illustrating the sample appointment-time step" loading="lazy" decoding="async"><img data-barber-image="details" src="public/assets/demos/northline-barber/shop-interior.webp" alt="Northline studio interior illustrating the sample booking-details step" loading="lazy" decoding="async"></div><img class="barber-secondary" src="public/assets/demos/northline-barber/grooming-tools.webp" alt="Comb, brush, scissors, towels, and grooming product arranged for a barber service" loading="lazy" decoding="async"><figcaption>Northline Barber · fictional visual demonstration</figcaption></figure></div></div>`;
}

function selectBarberState(state, focus = false) {
  const demo = document.querySelector('.barber-demo');
  if (!demo || !barberStates[state]) return;
  const buttons = [...demo.querySelectorAll('[data-barber-state]')];
  const images = [...demo.querySelectorAll('[data-barber-image]')];
  const selectedButton = buttons.find(button => button.dataset.barberState === state);
  const selectedImage = images.find(image => image.dataset.barberImage === state);
  demo.dataset.barberActive = state;
  buttons.forEach(button => {
    const selected = button === selectedButton;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  images.forEach(image => {
    const selected = image === selectedImage;
    image.classList.toggle('active', selected);
    image.setAttribute('aria-hidden', String(!selected));
  });
  document.querySelector('#barber-state-copy').textContent = barberStates[state].copy;
  const panel = document.querySelector('#barber-state-panel');
  panel.innerHTML = state === 'service'
    ? '<div class="barber-prices"><span>Signature Cut <b>$35</b></span><span>Skin Fade <b>$40</b></span><span>Beard Sculpt <b>$25</b></span><span>Cut + Beard <b>$55</b></span></div><small>Sample prices · demonstration only</small>'
    : state === 'time'
      ? '<div class="barber-times"><span>Morning</span><span>Afternoon</span><span>Evening</span></div><small>Sample time windows · no live availability</small>'
      : '<p>Sample review: service choice, preferred time, and inquiry details.</p><small>No booking is submitted from this demonstration</small>';
  document.querySelector('#demo-stage .demo-response').textContent = barberStates[state].response;
  if (focus && selectedButton) selectedButton.focus();
  if (window.gsap && !reducedMotion && selectedImage) {
    gsap.set(images.filter(image => image !== selectedImage), {autoAlpha:0, scale:1, clipPath:'inset(0 0 0 0)'});
    gsap.fromTo(selectedImage, {autoAlpha:0, scale:1.025, clipPath:'inset(0 7% 0 0)'}, {autoAlpha:1, scale:1, clipPath:'inset(0 0 0 0)', duration:.45, ease:'portfolio', clearProps:'transform,clipPath'});
    gsap.fromTo(['#barber-state-copy','#barber-state-panel'], {autoAlpha:.65, y:6}, {autoAlpha:1, y:0, duration:.28, stagger:.04, ease:'portfolio', clearProps:'transform,opacity,visibility'});
  }
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
  {category:'brand',name:'Social content system',detail:'Platform formats · templates · publishing'},
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
  renderDemo(example.index);
  document.querySelector('#demos').scrollIntoView();
});

document.querySelector('#request-service').addEventListener('click', () => {
  buildSelect.value = services[activeService].build;
});

document.querySelector('#demo-stage').addEventListener('click', event => {
  const barber = event.target.closest('[data-barber-state]');
  const food = event.target.closest('[data-food-filter]');
  const studio = event.target.closest('[data-studio-filter]');
  const fitness = event.target.closest('[data-fitness-view]');
  const action = event.target.closest('[data-demo-action]');
  if (barber) selectBarberState(barber.dataset.barberState);
  if (food) document.querySelector('#demo-stage').innerHTML = fastFoodDemo(food.dataset.foodFilter);
  if (studio) document.querySelector('#demo-stage').innerHTML = studioDemo(studio.dataset.studioFilter);
  if (fitness) document.querySelector('#demo-stage').innerHTML = fitnessDemo(fitness.dataset.fitnessView);
  if (action) {
    const response = document.querySelector('#demo-stage .demo-response');
    response.textContent = 'Demo inquiry state opened. No information was sent.';
  }
});

document.querySelector('#demo-stage').addEventListener('keydown', event => {
  const button = event.target.closest('[data-barber-state]');
  if (!button) return;
  const buttons = [...document.querySelectorAll('.barber-demo [data-barber-state]')];
  keyboardSelect(event, buttons.indexOf(button), buttons.length, index => selectBarberState(buttons[index].dataset.barberState, true));
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

const capabilityData = [
  {name:'AI',description:'Practical AI systems shaped around a defined business workflow.',deliverables:'Custom GPT systems · prompt architecture · human approval flows'},
  {name:'WEB',description:'Clear digital experiences that guide visitors toward useful action.',deliverables:'Business websites · Shopify stores · campaign landing pages'},
  {name:'AUTOMATION',description:'Connected processes that reduce repetitive work and visible handoffs.',deliverables:'Marketing automation · workflow maps · integration prototypes'},
  {name:'MEDIA',description:'Creative production systems built for consistent publishing.',deliverables:'AI video production · ad creative · social media content'},
  {name:'APPS',description:'Focused interfaces that make a business task easier to operate.',deliverables:'Business app concepts · dashboards · interactive prototypes'},
  {name:'IT',description:'Practical technical implementation with clear documentation and support.',deliverables:'IT support workflows · technical setup · implementation guidance'}
];
const capabilityEngine = document.querySelector('.capability-engine');
const capabilityButtons = [...document.querySelectorAll('[data-capability]')];
function selectCapability(index, focus = false) {
  const capability = capabilityData[index];
  capabilityButtons.forEach((button, buttonIndex) => {
    const selected = buttonIndex === index;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('#capability-index').textContent = `${String(index + 1).padStart(2,'0')} / ${capability.name}`;
  document.querySelector('#capability-description').textContent = capability.description;
  document.querySelector('#capability-deliverables').textContent = capability.deliverables;
  if (focus) capabilityButtons[index].focus();
}
capabilityButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectCapability(index));
  button.addEventListener('pointerenter', () => selectCapability(index));
  button.addEventListener('focus', () => selectCapability(index));
  button.addEventListener('keydown', event => keyboardSelect(event, index, capabilityButtons.length, selectCapability));
});
selectCapability(0);
if (capabilityEngine && finePointer && !reducedMotion) {
  capabilityEngine.addEventListener('pointermove', event => {
    const bounds = capabilityEngine.getBoundingClientRect();
    capabilityEngine.style.setProperty('--engine-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 10}px`);
    capabilityEngine.style.setProperty('--engine-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 8}px`);
  });
  capabilityEngine.addEventListener('pointerleave', () => {
    capabilityEngine.style.setProperty('--engine-x', '0px');
    capabilityEngine.style.setProperty('--engine-y', '0px');
  });
}

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
