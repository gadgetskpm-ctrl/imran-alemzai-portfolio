(function alemzaiContactModule(global) {
  'use strict';

  const publicEmail = 'alemzai.systems@gmail.com';
  const telegramUrl = 'https://t.me/ALEMZAISYSTEMS';
  const submissionCooldown = 15000;
  const instances = new WeakMap();

  function init(root) {
    if (!root) return null;
    if (instances.has(root)) return instances.get(root);
    root.dataset.contactReady = 'true';
    const context = global.AlemzaiMotion?.createContext?.('contact');
    const cleanups = [];
    const listen = context?.listen ? context.listen.bind(context) : (target, type, handler, options) => {
      target?.addEventListener(type, handler, options);
      const remove = () => target?.removeEventListener(type, handler, options);
      cleanups.push(remove);
      return remove;
    };
    let requestController = null;
    let submitting = false;
    let lastSubmissionAt = 0;

    const form = root.querySelector('[data-contact-form]');
    const submitButton = root.querySelector('[data-submit-button]');
    const status = root.querySelector('[data-form-status]');
    const description = root.querySelector('[name="description"]');
    const count = root.querySelector('[data-description-count]');
    const telegram = root.querySelector('[data-telegram-link]');
    const endpoint = root.dataset.formEndpoint.trim();
    const configuredTelegramUrl = root.dataset.telegramUrl.trim();
    if (!form || !submitButton || !status) {
      context?.destroy?.();
      delete root.dataset.contactReady;
      return null;
    }

    if (/^https:\/\/(t\.me|telegram\.me)\/[A-Za-z0-9_/?=&.-]+$/i.test(configuredTelegramUrl)) {
      telegram.href = configuredTelegramUrl;
      telegram.target = '_blank';
      telegram.rel = 'noopener noreferrer';
      telegram.removeAttribute('aria-disabled');
      telegram.querySelector('[data-telegram-state]').textContent = 'Open chat ↗';
    } else {
      listen(telegram, 'click', (event) => event.preventDefault());
    }

    function setStatus(state, message) {
      status.dataset.state = state;
      status.textContent = message;
    }

    function setFailure(message) {
      status.dataset.state = 'error';
      const introduction = document.createTextNode(`${message} `);
      const telegramLink = Object.assign(document.createElement('a'), {
        href: telegramUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        textContent: 'Message on Telegram'
      });
      const separator = document.createTextNode(' or ');
      const emailLink = Object.assign(document.createElement('a'), {
        href: `mailto:${publicEmail}`,
        textContent: `email ${publicEmail}`
      });
      status.replaceChildren(introduction, telegramLink, separator, emailLink, document.createTextNode('.'));
    }

    function isMeaningful(value) {
      const compact = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
      if (compact.length < 3 || new Set(compact).size < 3) return false;
      return !/^(.{1,4})\1{2,}$/.test(compact);
    }

    function fieldError(field) {
      const output = root.querySelector(`#${field.id}-error`);
      let message = '';
      if (field.validity.valueMissing) message = 'This field is required.';
      else if (field.validity.typeMismatch) message = 'Enter a valid email address.';
      else if (field.validity.tooShort) message = `Use at least ${field.minLength} characters.`;
      else if (field.name === 'description' && !isMeaningful(field.value)) message = 'Describe the project using meaningful words, not repeated characters.';
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      const describedBy = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      if (output?.id) {
        if (message) describedBy.add(output.id);
        else describedBy.delete(output.id);
      }
      if (describedBy.size) field.setAttribute('aria-describedby', [...describedBy].join(' '));
      else field.removeAttribute('aria-describedby');
      if (output) output.textContent = message;
      return !message;
    }

    const fields = Array.from(form.querySelectorAll('input[required], select[required], textarea[required]'));
    fields.forEach((field) => {
      listen(field, 'blur', () => fieldError(field));
      listen(field, 'input', () => {
        if (field.getAttribute('aria-invalid') === 'true') fieldError(field);
      });
    });

    listen(description, 'input', () => {
      count.textContent = `${description.value.length} / 2000`;
    });

    listen(form, 'submit', async (event) => {
      event.preventDefault();
      if (submitting) return;
      const valid = fields.map(fieldError).every(Boolean);
      if (!valid) {
        setStatus('error', 'Please review the highlighted fields and try again.');
        fields.find((field) => field.getAttribute('aria-invalid') === 'true')?.focus();
        return;
      }
      if (form.elements._gotcha.value) {
        setStatus('error', 'This submission could not be processed.');
        return;
      }
      const now = Date.now();
      if (now - lastSubmissionAt < submissionCooldown) {
        setStatus('error', 'Please wait a few seconds before sending another inquiry.');
        return;
      }
      if (!/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/i.test(endpoint)) {
        setFailure('Online delivery is not configured.');
        return;
      }

      submitting = true;
      lastSubmissionAt = now;
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      setStatus('pending', 'Sending your inquiry…');
      try {
        requestController?.abort();
        requestController = new AbortController();
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
          signal: requestController.signal
        });
        const payload = await response.json().catch(() => null);
        const submissionErrors = Array.isArray(payload?.errors) ? payload.errors : [];
        const formspreeRejected = payload?.ok === false || payload?.success === false || payload?.success === 'false';
        if (!response.ok || !payload || submissionErrors.length > 0 || formspreeRejected) {
          throw new Error('Delivery was not accepted');
        }
        form.reset();
        fields.forEach((field) => field.removeAttribute('aria-invalid'));
        count.textContent = '0 / 2000';
        setStatus('success', 'Thank you. Your project inquiry was sent successfully. Alemzai Systems will reply by email.');
      } catch (error) {
        if (error.name === 'AbortError') return;
        setFailure('We could not send this inquiry.');
      } finally {
        submitting = false;
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
      }
    });

    const api = { destroy() {
      requestController?.abort();
      context?.destroy?.();
      cleanups.splice(0).forEach(cleanup => typeof cleanup === 'function' && cleanup());
      delete root.dataset.contactReady;
      instances.delete(root);
    } };
    instances.set(root, api);
    return api;
  }

  function initAll(scope) { return [...(scope || document).querySelectorAll('[data-alemzai-contact]')].map(init); }
  function destroyAll(scope) { [...(scope || document).querySelectorAll('[data-alemzai-contact]')].forEach(root => instances.get(root)?.destroy()); }
  global.AlemzaiContact = { init, initAll, destroyAll };
  initAll();
})(window);
