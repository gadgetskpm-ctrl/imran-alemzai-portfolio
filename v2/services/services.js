(function alemzaiServicesModule(global) {
  'use strict';

  const catalog = {
    websitesShopify: { number: '01', category: 'Digital and commerce systems', code: 'WEB', title: 'Websites and stores built around clear journeys.', position: 'Responsive websites and Shopify storefronts that organize content, products, and customer actions into a coherent experience.', deliverables: ['Responsive business websites', 'Shopify storefront configuration', 'Landing and product page systems', 'Accessibility and launch review'] },
    aiMedia: { number: '02', category: 'Creative and campaign systems', code: 'MEDIA', title: 'AI media and ads shaped for each channel.', position: 'AI-assisted video and advertising workflows that connect an approved idea, message, format, and publishing plan.', deliverables: ['AI video concepts and production', 'Scripts and storyboards', 'Digital ad creative variations', 'Campaign and landing-page direction'] },
    design: { number: '03', category: 'Visual identity systems', code: 'DESIGN', title: 'Brand assets designed to work together.', position: 'Practical visual systems that help a business present itself consistently across print and digital touchpoints.', deliverables: ['Logo and identity direction', 'Packaging and business materials', 'Social graphics', 'Presentation and campaign assets'] },
    aiAutomation: { number: '04', category: 'AI and workflow systems', code: 'AUTO', title: 'AI agents and automation for repeatable work.', position: 'Purpose-built assistants and mapped automations that support routine tasks while keeping review and approval visible.', deliverables: ['Custom GPT and agent workflows', 'Workflow and trigger mapping', 'Data-routing prototypes', 'Human review checkpoints'] },
    apps: { number: '05', category: 'Application systems', code: 'APP', title: 'Focused tools for real operating needs.', position: 'Simple applications and dashboards that organize information and make key tasks easier to understand and complete.', deliverables: ['Interactive application prototypes', 'Dashboard information design', 'Responsive interfaces', 'Workflow and handoff documentation'] },
    it: { number: '06', category: 'Implementation support', code: 'IT', title: 'Practical IT and AI implementation support.', position: 'Clear technical support for selecting, configuring, documenting, and safely adopting useful business tools.', deliverables: ['Tool and workflow assessment', 'AI implementation planning', 'Setup and support documentation', 'Team handoff workflows'] }
  };

  function init(root) {
    if (!root || root.dataset.servicesReady === 'true') return root;
    root.dataset.servicesReady = 'true';

    const tabs = Array.from(root.querySelectorAll('[data-service-key]'));
    const panel = root.querySelector('#service-panel');
    const title = root.querySelector('[data-service-title]');
    const position = root.querySelector('[data-service-position]');
    const meta = root.querySelector('[data-service-meta]');
    const list = root.querySelector('[data-service-deliverables]');
    const code = root.querySelector('[data-service-code]');
    const diagram = root.querySelector('[data-service-diagram]');
    const status = root.querySelector('[data-service-status]');
    const reducedMotion = global.matchMedia('(prefers-reduced-motion: reduce)');
    let activeKey = tabs[0] ? tabs[0].dataset.serviceKey : 'websitesShopify';

    function render(key, moveFocus) {
      const service = catalog[key];
      const activeTab = tabs.find((tab) => tab.dataset.serviceKey === key);
      if (!service || !activeTab) return;
      activeKey = key;
      tabs.forEach((tab) => {
        const selected = tab === activeTab;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', activeTab.id);
      meta.textContent = `${service.number} / ${service.category}`;
      title.textContent = service.title;
      position.textContent = service.position;
      list.replaceChildren(...service.deliverables.map((item) => {
        const entry = document.createElement('li');
        entry.textContent = item;
        return entry;
      }));
      code.textContent = `${service.code} / ${service.number}`;
      root.dataset.activeService = key;
      status.textContent = `${activeTab.textContent.trim()} service selected.`;

      if (!reducedMotion.matches && global.gsap) {
        global.gsap.killTweensOf([title, position, list, diagram]);
        global.gsap.fromTo([title, position, list], { autoAlpha: 0.35, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.035, ease: 'power2.out', overwrite: true });
        global.gsap.fromTo(diagram, { rotate: -5, scale: 0.97 }, { rotate: 0, scale: 1, duration: 0.45, ease: 'power2.out', overwrite: true });
      }
      if (moveFocus) activeTab.focus();
    }

    function emit(action) {
      const service = catalog[activeKey];
      root.dispatchEvent(new CustomEvent(`alemzai:service-${action}`, { bubbles: true, detail: { key: activeKey, service: { ...service, deliverables: [...service.deliverables] } } }));
      status.textContent = action === 'request' ? `${service.category} request selected. Continue in the project form to provide details.` : `${service.category} example selected.`;
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => render(tab.dataset.serviceKey, false));
      tab.addEventListener('keydown', (event) => {
        let next = index;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        render(tabs[next].dataset.serviceKey, true);
      });
    });

    root.querySelector('[data-service-example]')?.addEventListener('click', () => emit('example'));
    root.querySelector('[data-service-request]')?.addEventListener('click', () => emit('request'));
    render(activeKey, false);
    return root;
  }

  const api = { init, catalog };
  global.AlemzaiServices = api;
  document.querySelectorAll('[data-alemzai-services]').forEach(init);
}(window));
