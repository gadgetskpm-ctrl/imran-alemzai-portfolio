(function alemzaiContactModule(global) {
  'use strict';

  const publicEmail = 'alemzai.systems@gmail.com';

  function init(root) {
    if (!root || root.dataset.contactReady === 'true') return root;
    root.dataset.contactReady = 'true';

    const form = root.querySelector('[data-contact-form]');
    const submitButton = root.querySelector('[data-submit-button]');
    const status = root.querySelector('[data-form-status]');
    const description = root.querySelector('[name="description"]');
    const count = root.querySelector('[data-description-count]');
    const telegram = root.querySelector('[data-telegram-link]');
    const endpoint = root.dataset.formEndpoint.trim();
    const telegramUrl = root.dataset.telegramUrl.trim();
    if (!form || !submitButton || !status) return root;

    if (/^https:\/\/(t\.me|telegram\.me)\/[A-Za-z0-9_/?=&.-]+$/i.test(telegramUrl)) {
      telegram.href = telegramUrl;
      telegram.target = '_blank';
      telegram.rel = 'noopener noreferrer';
      telegram.removeAttribute('aria-disabled');
      telegram.querySelector('[data-telegram-state]').textContent = 'Open chat ↗';
    } else {
      telegram.addEventListener('click', (event) => event.preventDefault());
    }

    function setStatus(state, message) {
      status.dataset.state = state;
      status.textContent = message;
    }

    function fieldError(field) {
      const output = root.querySelector(`#${field.id}-error`);
      let message = '';
      if (field.validity.valueMissing) message = 'This field is required.';
      else if (field.validity.typeMismatch) message = 'Enter a valid email address.';
      else if (field.validity.tooShort) message = `Use at least ${field.minLength} characters.`;
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), message && output?.id].filter(Boolean).join(' '));
      if (output) output.textContent = message;
      return !message;
    }

    const fields = Array.from(form.querySelectorAll('input[required], select[required], textarea[required]'));
    fields.forEach((field) => {
      field.addEventListener('blur', () => fieldError(field));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') fieldError(field);
      });
    });

    description.addEventListener('input', () => {
      count.textContent = `${description.value.length} / 2000`;
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const valid = fields.map(fieldError).every(Boolean);
      if (!valid) {
        setStatus('error', 'Please review the highlighted fields and try again.');
        fields.find((field) => !field.checkValidity())?.focus();
        return;
      }
      if (form.elements._honey.value) {
        setStatus('success', 'Thanks. Your inquiry has been received.');
        form.reset();
        count.textContent = '0 / 2000';
        return;
      }
      if (!/^https:\/\/formsubmit\.co\/ajax\//i.test(endpoint)) {
        setStatus('error', `Online delivery is not configured. Please email ${publicEmail} instead.`);
        return;
      }

      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      setStatus('pending', 'Sending your inquiry…');
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.success === false || payload.success === 'false') throw new Error('Delivery was not accepted');
        form.reset();
        fields.forEach((field) => field.removeAttribute('aria-invalid'));
        count.textContent = '0 / 2000';
        setStatus('success', 'Your inquiry was sent to Alemzai Systems. We will reply by email.');
      } catch (error) {
        setStatus('error', `We could not send this inquiry. Please email ${publicEmail} instead.`);
      } finally {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
      }
    });

    return root;
  }

  global.AlemzaiContact = { init };
  document.querySelectorAll('[data-alemzai-contact]').forEach(init);
})(window);
