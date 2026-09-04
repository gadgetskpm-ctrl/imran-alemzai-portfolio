(async () => {
  const locations = {
    shell: 'v2/shell/shell.html',
    services: 'v2/services/services.html',
    demos: 'v2/demos/demos.html',
    contact: 'v2/contact/contact.html'
  };

  function fragment(markup) {
    const template = document.createElement('template');
    template.innerHTML = markup.trim();
    return template.content;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load ${src}`));
      document.body.append(script);
    });
  }

  try {
    const [shellMarkup, servicesMarkup, demosMarkup, contactMarkup] = await Promise.all(
      Object.values(locations).map(async path => {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Unable to load ${path}: ${response.status}`);
        return response.text();
      })
    );

    document.body.prepend(fragment(shellMarkup));
    document.querySelector('#top > .services')?.before(fragment(servicesMarkup));
    document.querySelector('#top > .demos')?.before(fragment(demosMarkup));
    const legacyContact = document.querySelector('#top > .start-project');
    legacyContact?.before(fragment(contactMarkup));
    if (legacyContact) legacyContact.id = 'legacy-start-project';
    document.documentElement.classList.add('av2-integrated');

    document.addEventListener('alemzai:service-example', event => {
      const destinations = {
        websitesShopify: 'food', aiMedia: 'studio', design: 'studio',
        aiAutomation: 'fitness', apps: 'fitness', it: 'barber'
      };
      document.querySelector(`[data-demo-select="${destinations[event.detail.key]}"]`)?.click();
      document.querySelector('#v2-demos')?.scrollIntoView({ block: 'start' });
    });

    document.addEventListener('alemzai:service-request', event => {
      const select = document.querySelector('[data-contact-form] [name="build"]');
      const values = {
        websitesShopify: 'Website or Shopify store', aiMedia: 'AI video or digital advertising',
        design: 'Graphic design or brand assets', aiAutomation: 'AI agent or automation',
        apps: 'Application or dashboard', it: 'IT support or AI implementation'
      };
      if (select) select.value = values[event.detail.key] || '';
      document.querySelector('#start-project')?.scrollIntoView({ block: 'start' });
    });

    document.addEventListener('alemzai:request-build', event => {
      const select = document.querySelector('[data-contact-form] [name="build"]');
      const type = String(event.detail?.type || '').toLowerCase();
      const value = type.includes('barber') || type.includes('food') || type.includes('studio')
        ? 'Website or Shopify store'
        : type.includes('fitness') ? 'Application or dashboard' : '';
      if (select && value) select.value = value;
    });

    await loadScript('v2/shell/shell.js');
    await loadScript('v2/services/services.js');
    await loadScript('v2/demos/demos.js');
    await loadScript('v2/contact/contact.js');
  } catch (error) {
    document.documentElement.classList.remove('av2-integrated');
    console.error('Immersive V2 enhancement could not load.', error);
  }
})();
