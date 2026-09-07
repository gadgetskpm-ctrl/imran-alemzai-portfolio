(() => {
  'use strict';

  const engine = document.querySelector('.capability-engine');
  if (!engine) return;

  const capabilities = [
    ['AI', 'Practical AI systems shaped around a defined business workflow.', 'Custom GPT systems · prompt architecture · human approval flows'],
    ['WEB', 'Clear digital experiences that guide visitors toward useful action.', 'Business websites · Shopify stores · campaign landing pages'],
    ['AUTOMATION', 'Connected processes that reduce repetitive work and clarify handoffs.', 'Marketing automation · workflow maps · integration prototypes'],
    ['MEDIA', 'Creative production systems built for consistent publishing.', 'AI video production · ad creative · social media content'],
    ['APPS', 'Focused interfaces that make a business task easier to operate.', 'Business app concepts · dashboards · interactive prototypes'],
    ['IT', 'Practical technical implementation with clear documentation and support.', 'IT support workflows · technical setup · implementation guidance']
  ];
  const buttons = [...engine.querySelectorAll('[data-capability]')];
  const indexOutput = engine.querySelector('#capability-index');
  const descriptionOutput = engine.querySelector('#capability-description');
  const deliverablesOutput = engine.querySelector('#capability-deliverables');

  function select(index, focus = false) {
    const capability = capabilities[index];
    if (!capability) return;
    buttons.forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    indexOutput.textContent = `${String(index + 1).padStart(2, '0')} / ${capability[0]}`;
    descriptionOutput.textContent = capability[1];
    deliverablesOutput.textContent = capability[2];
    if (focus) buttons[index].focus();
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('pointerenter', () => select(index));
    button.addEventListener('focus', () => select(index));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      select(next, true);
    });
  });

  select(0);
})();
