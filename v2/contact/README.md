# Contact flow module

Static-hosting-compatible project inquiry UI for Alemzai Systems.

## Integration

1. Load `v2/contact/contact.css` after the shared site styles.
2. Replace the existing `#start-project` section with `contact.html`. Do not keep two elements with that ID.
3. Load `v2/contact/contact.js` after inserting the fragment.
4. Existing service and demo links continue to work because the module retains `#start-project` and the `build` field name.

## Delivery configuration

The checked-in form uses the approved Formspree endpoint `https://formspree.io/f/xeaqlakq`. JavaScript submits the existing fields with `POST` and `Accept: application/json`, while the matching HTML `action` and `method` provide a static-hosting fallback. The form clears only after an HTTP-successful JSON response with no Formspree submission errors. No SDK, API key, token, or credential is stored in the repository.

Do not report delivery as operational until an authorized real submission has been received at the destination mailbox. The agent did not send a real submission.

The public email and Telegram fallbacks remain available if the endpoint fails. To use a different approved Formspree form, update `data-form-endpoint`, the form `action`, and the endpoint allowlist in `contact.js` together.

## Telegram

The approved public Telegram contact is configured as `https://t.me/ALEMZAISYSTEMS`. The control opens the public profile in a separate tab with `noopener noreferrer`. Never place a bot token in the page.

## Public safety

No credentials, tracking scripts, private documents, or personal data are included. Visitors are explicitly asked not to enter secrets.
