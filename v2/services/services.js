(function alemzaiServicesModule(global) {
  'use strict';

  const instances = new WeakMap();
  const catalog = {
    websitesShopify: { number: '01', category: 'Digital and commerce systems', code: 'WEB', title: 'Websites and stores built around clear journeys.', position: 'Responsive websites and Shopify storefronts that organize content, products, and customer actions into a coherent experience.', deliverables: ['Responsive business websites', 'Shopify storefront configuration', 'Landing and product page systems', 'Accessibility and launch review'] },
    aiMedia: { number: '02', category: 'Creative and campaign systems', code: 'MEDIA', title: 'AI media and ads shaped for each channel.', position: 'AI-assisted video and advertising workflows that connect an approved idea, message, format, and publishing plan.', deliverables: ['AI video concepts and production', 'Scripts and storyboards', 'Digital ad creative variations', 'Campaign and landing-page direction'] },
    design: { number: '03', category: 'Visual identity systems', code: 'DESIGN', title: 'Brand assets designed to work together.', position: 'Practical visual systems that help a business present itself consistently across print and digital touchpoints.', deliverables: ['Logo and identity direction', 'Packaging and business materials', 'Social graphics', 'Presentation and campaign assets'] },
    aiAutomation: { number: '04', category: 'AI and workflow systems', code: 'AUTO', title: 'AI agents and automation for repeatable work.', position: 'Purpose-built assistants and mapped automations that support routine tasks while keeping review and approval visible.', deliverables: ['Custom GPT and agent workflows', 'Workflow and trigger mapping', 'Data-routing prototypes', 'Human review checkpoints'] },
    apps: { number: '05', category: 'Application systems', code: 'APP', title: 'Focused tools for real operating needs.', position: 'Simple applications and dashboards that organize information and make key tasks easier to understand and complete.', deliverables: ['Interactive application prototypes', 'Dashboard information design', 'Responsive interfaces', 'Workflow and handoff documentation'] },
    it: { number: '06', category: 'Implementation support', code: 'IT', title: 'Practical IT and AI implementation support.', position: 'Clear technical support for selecting, configuring, documenting, and safely adopting useful business tools.', deliverables: ['Tool and workflow assessment', 'AI implementation planning', 'Setup and support documentation', 'Team handoff workflows'] }
  };

  function init(root) {
    if (!root) return null;
    if (instances.has(root)) return instances.get(root);
    const motion = global.AlemzaiMotion;
    const context = motion?.createContext?.('services');
    const cleanups = [];
    const animations = new Set();
    const tokens = motion?.tokens || global.AlemzaiMotionTokens || { duration: { fast: .2, base: .45 }, distance: { near: 8 } };
    const listen = context?.listen ? context.listen.bind(context) : (target, type, handler, options) => {
      target?.addEventListener(type, handler, options);
      const remove = () => target?.removeEventListener(type, handler, options);
      cleanups.push(remove);
      return remove;
    };
    const tabs = [...root.querySelectorAll('[data-service-key]')];
    const panel = root.querySelector('#service-panel');
    const title = root.querySelector('[data-service-title]');
    const position = root.querySelector('[data-service-position]');
    const meta = root.querySelector('[data-service-meta]');
    const list = root.querySelector('[data-service-deliverables]');
    const code = root.querySelector('[data-service-code]');
    const diagram = root.querySelector('[data-service-diagram]');
    const status = root.querySelector('[data-service-status]');
    let activeKey = tabs[0]?.dataset.serviceKey || 'websitesShopify';

    function cancelAnimations() { animations.forEach(animation => animation.cancel()); animations.clear(); }
    function animate(target, keyframes, options) {
      if (motion?.isReduced?.() !== false || !target?.animate) return;
      const animation = target.animate(keyframes, options);
      animations.add(animation);
      animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    }

    function render(key, moveFocus) {
      const service = catalog[key];
      const activeTab = tabs.find(tab => tab.dataset.serviceKey === key);
      if (!service || !activeTab || !panel) return;
      activeKey = key;
      tabs.forEach(tab => {
        const selected = tab === activeTab;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', activeTab.id);
      meta.textContent = `${service.number} / ${service.category}`;
      title.textContent = service.title;
      position.textContent = service.position;
      list.replaceChildren(...service.deliverables.map(item => Object.assign(document.createElement('li'), { textContent: item })));
      code.textContent = `${service.code} / ${service.number}`;
      root.dataset.activeService = key;
      status.textContent = `${activeTab.textContent.trim()} service selected.`;
      cancelAnimations();
      [title, position, list].forEach((target, index) => animate(target, [{ opacity: .45, transform: `translateY(${tokens.distance.near}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration: tokens.duration.fast * 1400, delay: index * 28, easing: 'cubic-bezier(.22,1,.36,1)' }));
      animate(diagram, [{ transform: 'rotate(-3deg) scale(.98)' }, { transform: 'rotate(0) scale(1)' }], { duration: tokens.duration.base * 800, easing: 'cubic-bezier(.22,1,.36,1)' });
      if (moveFocus) activeTab.focus();
    }

    function emit(action) {
      const service = catalog[activeKey];
      root.dispatchEvent(new CustomEvent(`alemzai:service-${action}`, { bubbles: true, detail: { key: activeKey, service: { ...service, deliverables: [...service.deliverables] } } }));
      status.textContent = action === 'request' ? `${service.category} request selected. Continue in the project form to provide details.` : `${service.category} example selected.`;
    }

    tabs.forEach((tab, index) => {
      listen(tab, 'click', () => render(tab.dataset.serviceKey, false));
      listen(tab, 'keydown', event => {
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
    listen(root.querySelector('[data-service-example]'), 'click', () => emit('example'));
    listen(root.querySelector('[data-service-request]'), 'click', () => emit('request'));
    if (typeof motion?.onReducedChange === 'function') {
      const dispose = motion.onReducedChange(cancelAnimations);
      if (context?.add) context.add(dispose); else cleanups.push(dispose);
    }
    render(activeKey, false);
    root.dataset.servicesReady = 'true';

    const api = { render, destroy() {
      cancelAnimations();
      context?.destroy?.();
      cleanups.splice(0).forEach(cleanup => typeof cleanup === 'function' && cleanup());
      delete root.dataset.servicesReady;
      instances.delete(root);
    } };
    instances.set(root, api);
    return api;
  }

  function initAll(scope) { return [...(scope || document).querySelectorAll('[data-alemzai-services]')].map(init); }
  function destroyAll(scope) { [...(scope || document).querySelectorAll('[data-alemzai-services]')].forEach(root => instances.get(root)?.destroy()); }

  global.AlemzaiServices = { init, initAll, destroyAll, catalog };
  initAll();
}(window));
