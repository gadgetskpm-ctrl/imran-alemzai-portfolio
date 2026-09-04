(() => {
  const root = document.querySelector('[data-demos-root]');
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';

  const stage = root.querySelector('[data-demo-stage]');
  const title = root.querySelector('[data-demo-name]');
  const format = root.querySelector('[data-demo-format]');
  const mainTabs = [...root.querySelectorAll('[data-demo-select]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const definitions = {
    barber: { name: 'Northline Barber', format: 'Booking website' },
    food: { name: 'Counter / 24', format: 'Menu website' },
    studio: { name: 'Form / Field Studio', format: 'Portfolio website' },
    fitness: { name: 'Form / Fitness', format: 'Mobile app concept' }
  };

  const barberStates = {
    service: {
      copy: 'Compare clearly labeled sample services before moving to a preferred time.',
      response: 'Sample service step selected. No purchase or appointment is created.',
      panel: '<div class="av2-price-grid"><span>Signature Cut <b>$35</b></span><span>Skin Fade <b>$40</b></span><span>Beard Sculpt <b>$25</b></span><span>Cut + Beard <b>$55</b></span></div><small class="av2-sample">Sample prices · fictional demonstration</small>'
    },
    time: {
      copy: 'Choose a sample preference to demonstrate the booking path without reserving a real appointment.',
      response: 'Sample time step selected. Availability is illustrative only.',
      panel: '<div class="av2-controls" aria-label="Sample time preferences"><button type="button" data-time>Morning</button><button type="button" data-time>Afternoon</button><button type="button" data-time>Evening</button></div><small class="av2-sample">Illustrative availability · no reservation</small>'
    },
    details: {
      copy: 'Review the chosen service and time before a fictional inquiry would be prepared.',
      response: 'Sample details step selected. No personal information is collected or sent.',
      panel: '<p>Review: service choice → preferred time → contact details.</p><small class="av2-sample">Demo only · no information is submitted</small>'
    }
  };

  const data = {
    food: [
      { name: 'House Stack', type: 'burgers', detail: 'Double patty · pickles · house sauce', price: '$12 sample' },
      { name: 'Green Heat', type: 'burgers', detail: 'Grilled vegetable patty · chilli relish', price: '$11 sample' },
      { name: 'Crisp Fries', type: 'sides', detail: 'Sea salt · smoked paprika', price: '$5 sample' },
      { name: 'Lime Soda', type: 'drinks', detail: 'Citrus · soda · mint', price: '$4 sample' }
    ],
    studio: [
      { name: 'Signal Identity', type: 'brand', detail: 'Identity direction · application system' },
      { name: 'Field Notes', type: 'web', detail: 'Editorial website · responsive interface' },
      { name: 'Launch Sequence', type: 'campaign', detail: 'Campaign concept · social adaptations' },
      { name: 'Object / 04', type: 'brand', detail: 'Packaging direction · visual toolkit' }
    ],
    fitness: {
      today: [['Next session', 'Strength · 42 min'], ['Weekly load', '3 of 4 sessions'], ['Recovery', 'Easy day recommended']],
      plans: [['Build strength', 'Four-week sample plan'], ['Move better', 'Mobility concept'], ['Start steady', 'Beginner routine']],
      progress: [['Sessions', '12 sample entries'], ['Consistency', '3-week example'], ['Focus', 'Strength + mobility']],
      profile: [['Goal', 'General fitness'], ['Schedule', 'Four days weekly'], ['Preferences', 'Gym + home']]
    }
  };

  const tabButtons = (values, active, attr, label) => `<div class="av2-controls" role="tablist" aria-label="${label}">${values.map(value => `<button type="button" role="tab" aria-selected="${value === active}" tabindex="${value === active ? 0 : -1}" ${attr}="${value}">${value}</button>`).join('')}</div>`;

  function barberMarkup() {
    return `<article class="av2-scene av2-barber" data-scene="barber">
      <div class="av2-scene__bar"><strong class="av2-scene__brand">Northline Barber</strong><span class="av2-scene__notice">Fictional demo · sample pricing</span></div>
      <div class="av2-barber__layout">
        <div class="av2-barber__copy"><h4>Look sharp.<br>Feel ready.</h4><p class="av2-scene__lead" data-barber-copy>Explore the sample booking flow through service, time, and review states.</p>
          ${tabButtons(['service', 'time', 'details'], '', 'data-barber-state', 'Sample booking steps')}
          <div class="av2-barber__state" data-barber-panel>Choose a step to explore the front-end demonstration.</div>
          <div class="av2-status" role="status" data-status>No real appointment, payment, or confirmation is created.</div>
          <a class="av2-action" href="#start-project" data-demo-request data-request-type="Northline Barber website">Request this build</a>
        </div>
        <figure class="av2-barber__media">
          <img class="is-active" data-barber-image="hero" src="public/assets/demos/northline-barber/hero-barber.webp" alt="Customer seated in the fictional Northline Barber studio" loading="eager" decoding="async" fetchpriority="high">
          <img data-barber-image="service" src="public/assets/demos/northline-barber/service-cut.webp" alt="Barber refining a haircut in the Northline service preview" loading="lazy" decoding="async">
          <img data-barber-image="time" src="public/assets/demos/northline-barber/booking-space.webp" alt="Prepared barber chair representing a sample appointment time" loading="lazy" decoding="async">
          <img data-barber-image="details" src="public/assets/demos/northline-barber/shop-interior.webp" alt="Northline studio interior representing booking details" loading="lazy" decoding="async">
          <img class="av2-barber__tools" src="public/assets/demos/northline-barber/grooming-tools.webp" alt="Comb, brush, scissors, towels, and grooming product" loading="lazy" decoding="async">
          <figcaption>Northline Barber · fictional visual demonstration</figcaption>
        </figure>
      </div>
    </article>`;
  }

  function foodMarkup(filter = 'all') {
    const items = data.food.filter(item => filter === 'all' || item.type === filter);
    return `<article class="av2-scene" data-scene="food"><div class="av2-scene__bar"><strong class="av2-scene__brand">Counter / 24</strong><span class="av2-scene__notice">Sample menu</span></div><h4>Fast menu.<br>Clear choices.</h4><p class="av2-scene__lead">Filter a fictional menu and move into a local inquiry state.</p>${tabButtons(['all','burgers','sides','drinks'], filter, 'data-food-filter', 'Menu categories')}<div class="av2-grid">${items.map(item => `<div class="av2-card"><b>${item.name}</b><span>${item.detail}</span><strong>${item.price}</strong></div>`).join('')}</div><a class="av2-action" href="#start-project" data-demo-request data-request-type="Fast-food website">Request this build</a><div class="av2-status" role="status" data-status>Showing ${filter === 'all' ? 'all sample categories' : `sample ${filter}`}.</div></article>`;
  }

  function studioMarkup(filter = 'all') {
    const items = data.studio.filter(item => filter === 'all' || item.type === filter);
    return `<article class="av2-scene" data-scene="studio"><div class="av2-scene__bar"><strong class="av2-scene__brand">Form / Field Studio</strong><span class="av2-scene__notice">Fictional portfolio</span></div><h4>Design with<br>a working system.</h4><p class="av2-scene__lead">Explore sample creative directions by discipline.</p>${tabButtons(['all','brand','web','campaign'], filter, 'data-studio-filter', 'Portfolio filters')}<div class="av2-grid">${items.map(item => `<div class="av2-card"><b>${item.name}</b><span>${item.detail}</span></div>`).join('')}</div><a class="av2-action" href="#start-project" data-demo-request data-request-type="Design studio website">Request this build</a><div class="av2-status" role="status" data-status>Showing ${filter === 'all' ? 'all fictional work' : `fictional ${filter} work`}.</div></article>`;
  }

  function fitnessMarkup(view = 'today') {
    return `<article class="av2-scene" data-scene="fitness"><div class="av2-scene__bar"><strong class="av2-scene__brand">Form / Fitness</strong><span class="av2-scene__notice">App concept · sample data</span></div><h4>Your training.<br>One clear view.</h4><p class="av2-scene__lead">A mobile-style navigation concept for planning and reviewing workouts.</p><div class="av2-grid">${data.fitness[view].map(card => `<div class="av2-card"><b>${card[0]}</b><span>${card[1]}</span></div>`).join('')}</div><nav class="av2-mobile-nav" role="tablist" aria-label="Fitness app views">${['today','plans','progress','profile'].map(item => `<button type="button" role="tab" aria-selected="${item === view}" tabindex="${item === view ? 0 : -1}" data-fitness-view="${item}">${item}</button>`).join('')}</nav><a class="av2-action" href="#start-project" data-demo-request data-request-type="Fitness app concept">Request this build</a><div class="av2-status" role="status" data-status>${view[0].toUpperCase() + view.slice(1)} sample view selected.</div></article>`;
  }

  function animateIn(targets) {
    if (reduceMotion.matches || !window.gsap) return;
    window.gsap.fromTo(targets, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .34, stagger: .035, ease: 'power2.out', clearProps: 'opacity,visibility,transform' });
  }

  function renderDemo(key, focus = false) {
    const definition = definitions[key];
    if (!definition) return;
    mainTabs.forEach(button => {
      const selected = button.dataset.demoSelect === key;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    title.textContent = definition.name;
    format.textContent = definition.format;
    stage.innerHTML = key === 'barber' ? barberMarkup() : key === 'food' ? foodMarkup() : key === 'studio' ? studioMarkup() : fitnessMarkup();
    animateIn(stage.firstElementChild.children);
    if (focus) stage.focus({ preventScroll: true });
  }

  function selectBarberState(state) {
    const setting = barberStates[state];
    if (!setting) return;
    const scene = stage.querySelector('[data-scene="barber"]');
    const images = [...scene.querySelectorAll('[data-barber-image]')];
    const selected = images.find(image => image.dataset.barberImage === state);
    scene.querySelectorAll('[data-barber-state]').forEach(button => {
      const active = button.dataset.barberState === state;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    images.forEach(image => image.classList.toggle('is-active', image === selected));
    scene.querySelector('[data-barber-copy]').textContent = setting.copy;
    scene.querySelector('[data-barber-panel]').innerHTML = setting.panel;
    scene.querySelector('[data-status]').textContent = setting.response;
    if (!reduceMotion.matches && window.gsap) {
      window.gsap.fromTo(selected, { autoAlpha: 0, scale: 1.025, clipPath: 'inset(0 7% 0 0)' }, { autoAlpha: 1, scale: 1, clipPath: 'inset(0 0 0 0)', duration: .42, ease: 'power2.out', clearProps: 'transform,clipPath' });
      animateIn([scene.querySelector('[data-barber-copy]'), scene.querySelector('[data-barber-panel]')]);
    }
  }

  function selectRoving(event, buttons, callback) {
    const current = buttons.indexOf(event.target.closest('button'));
    if (current < 0 || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
    event.preventDefault();
    let next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next].focus();
    callback(buttons[next]);
  }

  mainTabs.forEach(button => button.addEventListener('click', () => renderDemo(button.dataset.demoSelect, true)));
  root.querySelector('.av2-demos__selector').addEventListener('keydown', event => selectRoving(event, mainTabs, button => renderDemo(button.dataset.demoSelect)));

  stage.addEventListener('click', event => {
    const barber = event.target.closest('[data-barber-state]');
    const food = event.target.closest('[data-food-filter]');
    const studio = event.target.closest('[data-studio-filter]');
    const fitness = event.target.closest('[data-fitness-view]');
    const time = event.target.closest('[data-time]');
    if (barber) selectBarberState(barber.dataset.barberState);
    if (food) { stage.innerHTML = foodMarkup(food.dataset.foodFilter); animateIn(stage.querySelectorAll('.av2-card')); }
    if (studio) { stage.innerHTML = studioMarkup(studio.dataset.studioFilter); animateIn(stage.querySelectorAll('.av2-card')); }
    if (fitness) { stage.innerHTML = fitnessMarkup(fitness.dataset.fitnessView); animateIn(stage.querySelectorAll('.av2-card')); }
    if (time) {
      stage.querySelectorAll('[data-time]').forEach(button => button.setAttribute('aria-pressed', String(button === time)));
      stage.querySelector('[data-status]').textContent = `${time.textContent} selected as a sample preference. No appointment is reserved.`;
    }
  });

  root.addEventListener('click', event => {
    const request = event.target.closest('[data-demo-request]');
    if (!request) return;
    root.dispatchEvent(new CustomEvent('alemzai:request-build', {
      bubbles: true,
      detail: { type: request.dataset.requestType || title.textContent, source: 'applications-demo' }
    }));
  });

  stage.addEventListener('keydown', event => {
    const container = event.target.closest('[role="tablist"]');
    if (!container) return;
    const buttons = [...container.querySelectorAll('[role="tab"]')];
    selectRoving(event, buttons, button => button.click());
  });

  renderDemo('barber');
})();
