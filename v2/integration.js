(() => {
  'use strict';

  const root = document.documentElement;
  const controller = new AbortController();
  const { signal } = controller;

  const serviceDemo = {
    websitesShopify: 'food',
    aiMedia: 'studio',
    design: 'studio',
    aiAutomation: 'fitness',
    apps: 'fitness',
    it: 'barber'
  };

  const serviceBuild = {
    websitesShopify: 'Website or Shopify store',
    aiMedia: 'AI video or digital advertising',
    design: 'Graphic design or brand assets',
    aiAutomation: 'AI agent or automation',
    apps: 'Application or dashboard',
    it: 'IT support or AI implementation'
  };

  function contactSelect() {
    return document.querySelector('[data-contact-form] [name="build"]');
  }

  function onServiceExample(event) {
    document.querySelector(`[data-demo-select="${serviceDemo[event.detail?.key]}"]`)?.click();
    document.querySelector('#v2-demos')?.scrollIntoView({ block: 'start' });
  }

  function onServiceRequest(event) {
    const select = contactSelect();
    if (select) select.value = serviceBuild[event.detail?.key] || '';
    document.querySelector('#start-project')?.scrollIntoView({ block: 'start' });
  }

  function onRequestBuild(event) {
    const type = String(event.detail?.type || '').toLowerCase();
    const value = type.includes('barber') || type.includes('food') || type.includes('studio')
      ? 'Website or Shopify store'
      : type.includes('fitness') ? 'Application or dashboard' : '';
    const select = contactSelect();
    if (select && value) select.value = value;
  }

  function destroy() {
    controller.abort();
    window.AlemzaiMotion?.destroy?.();
    root.classList.remove('av2-ready');
  }

  document.addEventListener('alemzai:service-example', onServiceExample, { signal });
  document.addEventListener('alemzai:service-request', onServiceRequest, { signal });
  document.addEventListener('alemzai:request-build', onRequestBuild, { signal });
  window.addEventListener('pagehide', destroy, { signal, once: true });

  root.classList.add('av2-ready');
  document.dispatchEvent(new CustomEvent('alemzai:v2-ready'));
  window.AlemzaiV2 = Object.freeze({ destroy });
})();
