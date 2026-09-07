(function alemzaiDemosModule(global) {
  'use strict';
  const instances = new WeakMap();

  function init(root) {
  if (!root) return null;
  if (instances.has(root)) return instances.get(root);
  const motion = global.AlemzaiMotion;
  const context = motion?.createContext?.('demos');
  const cleanups = [];
  const animations = new Set();
  const tokens = motion?.tokens || global.AlemzaiMotionTokens || { duration: { fast: .2, base: .45 }, distance: { near: 8 } };
  const listen = context?.listen ? context.listen.bind(context) : (target, type, handler, options) => {
    target?.addEventListener(type, handler, options);
    const remove = () => target?.removeEventListener(type, handler, options);
    cleanups.push(remove);
    return remove;
  };
  function cancelAnimations() { animations.forEach(animation => animation.cancel()); animations.clear(); }
  root.dataset.ready = 'true';

  const stage = root.querySelector('[data-demo-stage]');
  const title = root.querySelector('[data-demo-name]');
  const format = root.querySelector('[data-demo-format]');
  const mainTabs = [...root.querySelectorAll('[data-demo-select]')];
  let workflowTimers = [];

  const definitions = {
    barber: { name: 'Northline Barber', format: 'Booking website' },
    food: { name: 'Counter / 24', format: 'Menu website' },
    studio: { name: 'FIELD / FORM', format: 'Brand system' },
    fitness: { name: 'Form / Fitness', format: 'Mobile app concept' },
    automation: { name: 'Signal / Ops', format: 'Business automation' }
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
      { name: 'Classic Double Cheeseburger', type: 'burgers', detail: 'Two beef patties · American cheese · pickles · house sauce', price: '$12 sample', image: 'double-cheeseburger.jpg', alt: 'Double cheeseburger with fries and crispy bites' },
      { name: 'Bacon Cheeseburger', type: 'burgers', detail: 'Beef patty · smoked bacon · cheddar · lettuce · tomato', price: '$13 sample', image: 'hero-burger.jpg', alt: 'Bacon cheeseburger served with golden fries' },
      { name: 'Crispy Chicken Sandwich', type: 'chicken', detail: 'Crispy chicken · lettuce · pickles · pepper mayo', price: '$11 sample', image: 'menu-spread.jpg', alt: 'Fast-food spread with sandwiches and crispy chicken' },
      { name: 'Buffalo Wings', type: 'chicken', detail: 'Six wings · buffalo glaze · ranch dip', price: '$10 sample', image: 'combo-platter.webp', alt: 'Glazed chicken wings beside a burger and fries' },
      { name: 'Seasoned Fries', type: 'sides', detail: 'Skin-on fries · sea salt · cracked pepper', price: '$5 sample', image: 'combo-platter.webp', alt: 'Golden fries on a restaurant serving tray' },
      { name: 'Vanilla Shake', type: 'drinks', detail: 'Vanilla soft serve · whole milk · whipped cream', price: '$6 sample', image: 'menu-spread.jpg', alt: 'Restaurant menu spread with classic fast-food favorites' }
    ],
    studio: [
      { id: 'hero', type: 'identity', title: 'FIELD / FORM introduction', description: 'A wide editorial view of the modular FIELD / FORM identity across physical brand applications.', caption: 'A modular identity shown across editorial objects, stationery and physical applications.', image: 'hero-field-form.webp' },
      { id: 'identity', type: 'identity', title: 'Identity system', description: 'A flexible identity language built from structure, contrast and controlled movement.', caption: 'A flexible identity language built from structure, contrast and controlled movement.' },
      { id: 'digital', type: 'digital', title: 'Responsive interfaces', description: 'Responsive interface directions designed around one consistent modular system.', caption: 'Responsive interface directions designed around one consistent modular system.', image: 'digital-interface.webp' },
      { id: 'campaign', type: 'campaign', title: 'Campaign system', description: 'Campaign applications extending the same identity across editorial, social and physical formats.', caption: 'Campaign applications extending the same identity across editorial, social and physical formats.', image: 'campaign-system.webp' }
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
    return `<article class="av2-scene av2-food" data-scene="food">
      <div class="av2-scene__bar"><strong class="av2-scene__brand">Counter / 24</strong><span class="av2-scene__notice">Fictional restaurant · sample menu</span></div>
      <div class="av2-food__hero">
        <img src="public/assets/demos/counter-24/hero-burger.jpg" alt="Cheeseburger and fries presented in a warm restaurant setting" decoding="async">
        <div class="av2-food__hero-copy"><span>Made to order</span><h4>Real food.<br>Ready fast.</h4><p>Classic burgers, crispy chicken, and familiar sides—presented through a premium, easy-to-use menu experience.</p></div>
      </div>
      <div class="av2-food__menu-head"><div><span>Explore the menu</span><h5>Choose your favorite.</h5></div>${tabButtons(['all','burgers','chicken','sides','drinks'], filter, 'data-food-filter', 'Menu categories')}</div>
      <div class="av2-grid av2-food__grid">${items.map(item => `<article class="av2-card av2-food-card"><img src="public/assets/demos/counter-24/${item.image}" alt="${item.alt}" loading="lazy" decoding="async"><div><b>${item.name}</b><span>${item.detail}</span><strong>${item.price}</strong></div></article>`).join('')}</div>
      <div class="av2-food__footer"><a class="av2-action" href="#start-project" data-demo-request data-request-type="Fast-food website">Request this build</a><div class="av2-status" role="status" data-status>Showing ${filter === 'all' ? 'the complete sample menu' : `sample ${filter}`}.</div></div>
    </article>`;
  }

  function studioIdentityMarkup() {
    return `<article class="av2-studio-identity" aria-labelledby="studio-identity-title" aria-describedby="studio-identity-caption">
      <div class="av2-studio-wordmark" id="studio-identity-title">FIELD <i aria-hidden="true">/</i> FORM</div>
      <div class="av2-studio-tokens" aria-label="Identity color tokens"><span class="is-black">Black</span><span class="is-paper">Warm off-white</span><span class="is-graphite">Graphite</span><span class="is-lime">Electric lime</span></div>
      <div class="av2-studio-grid-sample" aria-label="Modular spacing and grid sample"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <p id="studio-identity-caption">A flexible identity language built from structure, contrast and controlled movement.</p>
    </article>`;
  }

  function studioCardMarkup(item) {
    if (item.id === 'identity') return `<div class="av2-studio-card av2-studio-card--identity" data-studio-card data-studio-type="${item.type}">${studioIdentityMarkup()}</div>`;
    return `<figure class="av2-studio-card av2-studio-card--${item.id}" data-studio-card data-studio-type="${item.type}"><button type="button" class="av2-studio-card__open" data-studio-detail="${item.id}" aria-label="Open detail view: ${item.title}"><img src="public/assets/demos/form-field/${item.image}" alt="${item.description}" width="1586" height="992" loading="lazy" decoding="async"><span aria-hidden="true">View detail ↗</span></button><figcaption><b>${item.title}</b><p>${item.caption}</p></figcaption></figure>`;
  }

  function studioMarkup(filter = 'all') {
    const items = data.studio.filter(item => filter === 'all' || item.type === filter);
    return `<article class="av2-scene av2-studio" data-scene="studio">
      <div class="av2-scene__bar"><strong class="av2-scene__brand">FIELD / FORM</strong><span class="av2-scene__notice">Concept project · not client work</span></div>
      <div class="av2-studio__intro"><div><span>Alemzai concept study</span><h4>A modular identity built to move across media.</h4></div><p>A fictional brand system exploring identity, responsive digital experiences, campaign design and physical applications.</p></div>
      <dl class="av2-studio__meta"><div><dt>Format</dt><dd>Brand system</dd></div><div><dt>Status</dt><dd>Interactive concept</dd></div><div><dt>Disciplines</dt><dd>Identity · Digital · Campaign</dd></div><div><dt>Input</dt><dd>Pointer · Touch · Keyboard</dd></div></dl>
      ${tabButtons(['all','identity','digital','campaign'], filter, 'data-studio-filter', 'FIELD / FORM gallery filters')}
      <div class="av2-studio-gallery" id="field-form-gallery" aria-live="polite">${items.map(studioCardMarkup).join('')}</div>
      <div class="av2-studio__footer"><a class="av2-action" href="#start-project" data-demo-request data-request-type="Brand system">Build a brand system</a><div class="av2-status" role="status" data-status>Showing ${filter === 'all' ? 'all concept work' : `${filter} concept work`}.</div></div>
      <p class="av2-studio__disclosure">FIELD / FORM is an Alemzai concept study. It is not client work.</p>
      <dialog class="av2-studio-modal" data-studio-modal aria-labelledby="studio-modal-title" aria-describedby="studio-modal-description"><button class="av2-studio-modal__close" type="button" data-studio-modal-close aria-label="Close detail view">Close ×</button><div class="av2-studio-modal__media"><img data-studio-modal-image alt="" width="1586" height="992" decoding="async"></div><div class="av2-studio-modal__copy"><span>FIELD / FORM · concept project</span><h5 id="studio-modal-title" data-studio-modal-title></h5><p id="studio-modal-description" data-studio-modal-description></p></div></dialog>
    </article>`;
  }

  function fitnessMarkup(view = 'today') {
    return `<article class="av2-scene" data-scene="fitness"><div class="av2-scene__bar"><strong class="av2-scene__brand">Form / Fitness</strong><span class="av2-scene__notice">App concept · sample data</span></div><h4>Your training.<br>One clear view.</h4><p class="av2-scene__lead">A mobile-style navigation concept for planning and reviewing workouts.</p><div class="av2-grid">${data.fitness[view].map(card => `<div class="av2-card"><b>${card[0]}</b><span>${card[1]}</span></div>`).join('')}</div><nav class="av2-mobile-nav" role="tablist" aria-label="Fitness app views">${['today','plans','progress','profile'].map(item => `<button type="button" role="tab" aria-selected="${item === view}" tabindex="${item === view ? 0 : -1}" data-fitness-view="${item}">${item}</button>`).join('')}</nav><a class="av2-action" href="#start-project" data-demo-request data-request-type="Fitness app concept">Request this build</a><div class="av2-status" role="status" data-status>${view[0].toUpperCase() + view.slice(1)} sample view selected.</div></article>`;
  }

  function automationMarkup() {
    return `<article class="av2-scene av2-automation" data-scene="automation">
      <div class="av2-scene__bar"><strong class="av2-scene__brand">Signal / Ops</strong><span class="av2-scene__notice">Interactive concept · sample data</span></div>
      <div class="av2-automation__intro"><div><span>Alemzai workflow demonstration</span><h4>Every inquiry.<br>Routed with intent.</h4></div><p>A practical lead-operations system that captures a request, organizes the details, pauses for human approval, and prepares the next action.</p></div>
      <div class="av2-automation__toolbar">
        <label>Sample trigger<select data-automation-source><option>Website inquiry</option><option>Email request</option><option>Campaign lead</option></select></label>
        <div><button type="button" data-automation-run>Run sample workflow <span aria-hidden="true">→</span></button><button type="button" data-automation-reset>Reset</button></div>
      </div>
      <div class="av2-automation__workspace">
        <div class="av2-automation__flow" aria-label="Sample business automation workflow">
          <div class="av2-automation__flow-head"><span>Workflow / Lead operations</span><b data-automation-state>Ready to simulate</b></div>
          <ol>
            <li data-automation-step><i>01</i><div><strong>Capture inquiry</strong><span data-automation-capture>Website inquiry enters the workflow.</span></div><b>Idle</b></li>
            <li data-automation-step><i>02</i><div><strong>Organize + qualify</strong><span>AI extracts the service, timeline, and priority.</span></div><b>Idle</b></li>
            <li data-automation-step><i>03</i><div><strong>Human approval</strong><span>A person reviews the summary before anything is sent.</span></div><b>Idle</b></li>
            <li data-automation-step><i>04</i><div><strong>Route next action</strong><span>CRM record and follow-up draft are prepared.</span></div><b>Idle</b></li>
          </ol>
        </div>
        <aside class="av2-automation__outcome">
          <span>Sample output</span>
          <div><small>Request</small><strong>Website + automation</strong></div>
          <div><small>Priority</small><strong>Qualified / normal</strong></div>
          <div><small>Owner</small><strong>Project intake</strong></div>
          <div class="av2-automation__checkpoint"><small>Human checkpoint</small><strong>Nothing sends automatically.</strong><button type="button" data-automation-approve disabled>Approve sample draft</button></div>
        </aside>
      </div>
      <div class="av2-automation__footer"><a class="av2-action" href="#start-project" data-demo-request data-request-type="Lead operations automation">Build an automation system</a><div class="av2-status" role="status" aria-live="polite" data-status>Select a sample trigger, then run the workflow.</div></div>
    </article>`;
  }

  function clearWorkflowTimers() {
    workflowTimers.forEach(timer => clearTimeout(timer));
    workflowTimers = [];
  }

  function requestAutomationApproval(scene) {
    scene.querySelector('[data-automation-state]').textContent = 'Approval required';
    scene.querySelector('[data-automation-approve]').disabled = false;
    scene.querySelector('[data-status]').textContent = 'Sample lead qualified. Review the prepared action at the human checkpoint.';
  }

  function runAutomation(scene) {
    clearWorkflowTimers();
    const steps = [...scene.querySelectorAll('[data-automation-step]')];
    const run = scene.querySelector('[data-automation-run]');
    const approve = scene.querySelector('[data-automation-approve]');
    steps.forEach(step => { step.classList.remove('is-active', 'is-done'); step.querySelector(':scope > b').textContent = 'Idle'; });
    run.disabled = true;
    approve.disabled = true;
    approve.textContent = 'Approve sample draft';
    scene.querySelector('[data-automation-state]').textContent = 'Processing sample';
    scene.querySelector('[data-status]').textContent = 'Sample workflow running. No information is being sent.';
    const reduce = motion?.isReduced?.() !== false;
    steps.slice(0, 3).forEach((step, index) => {
      const advance = () => {
        steps[index - 1]?.classList.replace('is-active', 'is-done');
        if (steps[index - 1]) steps[index - 1].querySelector(':scope > b').textContent = 'Complete';
        step.classList.add('is-active');
        step.querySelector(':scope > b').textContent = index === 2 ? 'Review' : 'Running';
        if (index === 2) requestAutomationApproval(scene);
      };
      if (reduce) advance(); else workflowTimers.push(setTimeout(advance, index * 650));
    });
  }

  function resetAutomation(scene) {
    clearWorkflowTimers();
    scene.querySelectorAll('[data-automation-step]').forEach(step => { step.classList.remove('is-active', 'is-done'); step.querySelector(':scope > b').textContent = 'Idle'; });
    scene.querySelector('[data-automation-state]').textContent = 'Ready to simulate';
    scene.querySelector('[data-automation-run]').disabled = false;
    const approve = scene.querySelector('[data-automation-approve]');
    approve.disabled = true;
    approve.textContent = 'Approve sample draft';
    scene.querySelector('[data-status]').textContent = 'Sample workflow reset. No information was stored or sent.';
  }

  function animateIn(targets) {
    if (motion?.isReduced?.() !== false) return;
    [...targets].forEach((target, index) => {
      if (!target?.animate) return;
      const animation = target.animate([{ opacity: 0, transform: `translateY(${tokens.distance.near}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration: tokens.duration.fast * 1500, delay: index * 28, easing: 'cubic-bezier(.22,1,.36,1)' });
      animations.add(animation);
      animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    });
  }

  function renderDemo(key, focus = false) {
    const definition = definitions[key];
    if (!definition) return;
    clearWorkflowTimers();
    mainTabs.forEach(button => {
      const selected = button.dataset.demoSelect === key;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    title.textContent = definition.name;
    format.textContent = definition.format;
    stage.innerHTML = key === 'barber' ? barberMarkup() : key === 'food' ? foodMarkup() : key === 'studio' ? studioMarkup() : key === 'fitness' ? fitnessMarkup() : automationMarkup();
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
    if (motion?.isReduced?.() === false && selected?.animate) {
      const animation = selected.animate([{ opacity: 0, transform: 'scale(1.018)', clipPath: 'inset(0 5% 0 0)' }, { opacity: 1, transform: 'scale(1)', clipPath: 'inset(0)' }], { duration: tokens.duration.base * 800, easing: 'cubic-bezier(.22,1,.36,1)' });
      animations.add(animation);
      animation.finished.catch(() => {}).finally(() => animations.delete(animation));
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

  let modalOpener = null;
  function closeStudioModal() {
    const dialog = stage.querySelector('[data-studio-modal]');
    if (!dialog?.open) return;
    dialog.close();
    modalOpener?.focus?.({ preventScroll: true });
    modalOpener = null;
  }

  function openStudioModal(button) {
    const item = data.studio.find(entry => entry.id === button.dataset.studioDetail && entry.image);
    const dialog = stage.querySelector('[data-studio-modal]');
    if (!item || !dialog?.showModal) return;
    const image = dialog.querySelector('[data-studio-modal-image]');
    image.src = `public/assets/demos/form-field/${item.image}`;
    image.alt = item.description;
    dialog.querySelector('[data-studio-modal-title]').textContent = item.title;
    dialog.querySelector('[data-studio-modal-description]').textContent = item.description;
    modalOpener = button;
    dialog.showModal();
    dialog.querySelector('[data-studio-modal-close]').focus();
  }

  function selectStudioFilter(filter) {
    stage.innerHTML = studioMarkup(filter);
    const selected = stage.querySelector(`[data-studio-filter="${filter}"]`);
    selected?.focus?.({ preventScroll: true });
    animateIn(stage.querySelectorAll('[data-studio-card]'));
  }

  mainTabs.forEach(button => listen(button, 'click', () => renderDemo(button.dataset.demoSelect, true)));
  listen(root.querySelector('.av2-demos__selector'), 'keydown', event => selectRoving(event, mainTabs, button => renderDemo(button.dataset.demoSelect)));

  listen(stage, 'click', event => {
    const barber = event.target.closest('[data-barber-state]');
    const food = event.target.closest('[data-food-filter]');
    const studio = event.target.closest('[data-studio-filter]');
    const studioDetail = event.target.closest('[data-studio-detail]');
    const studioClose = event.target.closest('[data-studio-modal-close]');
    const fitness = event.target.closest('[data-fitness-view]');
    const automationRun = event.target.closest('[data-automation-run]');
    const automationReset = event.target.closest('[data-automation-reset]');
    const automationApprove = event.target.closest('[data-automation-approve]');
    const time = event.target.closest('[data-time]');
    if (barber) selectBarberState(barber.dataset.barberState);
    if (food) { stage.innerHTML = foodMarkup(food.dataset.foodFilter); animateIn(stage.querySelectorAll('.av2-card')); }
    if (studio) selectStudioFilter(studio.dataset.studioFilter);
    if (studioDetail) openStudioModal(studioDetail);
    if (studioClose) closeStudioModal();
    if (fitness) { stage.innerHTML = fitnessMarkup(fitness.dataset.fitnessView); animateIn(stage.querySelectorAll('.av2-card')); }
    if (automationRun) runAutomation(automationRun.closest('[data-scene="automation"]'));
    if (automationReset) resetAutomation(automationReset.closest('[data-scene="automation"]'));
    if (automationApprove) {
      automationApprove.disabled = true;
      automationApprove.textContent = 'Sample approved';
      const scene = automationApprove.closest('[data-scene="automation"]');
      const steps = [...scene.querySelectorAll('[data-automation-step]')];
      steps[2].classList.replace('is-active', 'is-done');
      steps[2].querySelector(':scope > b').textContent = 'Approved';
      steps[3].classList.add('is-active');
      steps[3].querySelector(':scope > b').textContent = 'Running';
      scene.querySelector('[data-automation-state]').textContent = 'Preparing handoff';
      const complete = () => {
        steps[3].classList.replace('is-active', 'is-done');
        steps[3].querySelector(':scope > b').textContent = 'Prepared';
        scene.querySelector('[data-automation-state]').textContent = 'Ready for handoff';
        scene.querySelector('[data-automation-run]').disabled = false;
        scene.querySelector('[data-status]').textContent = 'Sample approved. CRM update and follow-up are ready for a real system to execute.';
      };
      if (motion?.isReduced?.() !== false) complete(); else workflowTimers.push(setTimeout(complete, 550));
    }
    if (time) {
      stage.querySelectorAll('[data-time]').forEach(button => button.setAttribute('aria-pressed', String(button === time)));
      stage.querySelector('[data-status]').textContent = `${time.textContent} selected as a sample preference. No appointment is reserved.`;
    }
  });

  listen(stage, 'change', event => {
    const source = event.target.closest('[data-automation-source]');
    if (!source) return;
    const scene = source.closest('[data-scene="automation"]');
    resetAutomation(scene);
    scene.querySelector('[data-automation-capture]').textContent = `${source.value} enters the workflow.`;
    scene.querySelector('[data-status]').textContent = `${source.value} selected as the fictional trigger.`;
  });

  listen(root, 'click', event => {
    const request = event.target.closest('[data-demo-request]');
    if (!request) return;
    root.dispatchEvent(new CustomEvent('alemzai:request-build', {
      bubbles: true,
      detail: { type: request.dataset.requestType || title.textContent, source: 'applications-demo' }
    }));
  });

  listen(stage, 'keydown', event => {
    const dialog = event.target.closest('[data-studio-modal]');
    if (dialog?.open && event.key === 'Escape') { event.preventDefault(); closeStudioModal(); return; }
    if (dialog?.open && event.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    const container = event.target.closest('[role="tablist"]');
    if (!container) return;
    const buttons = [...container.querySelectorAll('[role="tab"]')];
    selectRoving(event, buttons, button => button.click());
  });

  if (typeof motion?.onReducedChange === 'function') {
    const dispose = motion.onReducedChange(cancelAnimations);
    if (context?.add) context.add(dispose); else cleanups.push(dispose);
  }
  renderDemo('barber');
  const api = { render: renderDemo, destroy() {
    cancelAnimations();
    clearWorkflowTimers();
    context?.destroy?.();
    cleanups.splice(0).forEach(cleanup => typeof cleanup === 'function' && cleanup());
    delete root.dataset.ready;
    instances.delete(root);
  } };
  instances.set(root, api);
  return api;
  }

  function initAll(scope) { return [...(scope || document).querySelectorAll('[data-demos-root]')].map(init); }
  function destroyAll(scope) { [...(scope || document).querySelectorAll('[data-demos-root]')].forEach(root => instances.get(root)?.destroy()); }
  global.AlemzaiDemos = { init, initAll, destroyAll };
  initAll();
}(window));
