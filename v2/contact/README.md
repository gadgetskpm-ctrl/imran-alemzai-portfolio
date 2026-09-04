# Contact flow module

Static-hosting-compatible project inquiry UI for Alemzai Systems.

## Integration

1. Load `v2/contact/contact.css` after the shared site styles.
2. Replace the existing `#start-project` section with `contact.html`. Do not keep two elements with that ID.
3. Load `v2/contact/contact.js` after inserting the fragment.
4. Existing service and demo links continue to work because the module retains `#start-project` and the `build` field name.

## Delivery configuration

The checked-in `data-form-endpoint` uses FormSubmit's free AJAX endpoint for the public destination `alemzai.systems@gmail.com`. FormSubmit may require the owner to activate the address from its first confirmation email before inquiries are delivered. This third-party endpoint is the only non-local request made by the module and contains no API key or credential.

Do not report delivery as operational until an authorized real submission has been received at the destination mailbox. The agent did not send a real submission.

The public email fallback remains visible even if the endpoint fails. To use a different approved static-form handler, update `data-form-endpoint` and the endpoint allowlist in `contact.js` together.

## Telegram

The approved public Telegram contact is configured as `https://t.me/alemzaisystem`. The control opens the public profile in a separate tab with `noopener noreferrer`. Never place a bot token in the page.

## Public safety

No credentials, tracking scripts, private documents, or personal data are included. Visitors are explicitly asked not to enter secrets.
