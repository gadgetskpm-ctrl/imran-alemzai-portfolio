# Alemzai Services module

This module is a self-contained HTML, CSS, and JavaScript interface for six service categories: Websites and Shopify; AI videos and digital ads; Graphic design and brand assets; AI agents and automation; Applications and dashboards; and IT support and AI implementation. It does not load fonts, images, trackers, or other network resources.

## Integration

1. Copy the contents of `services.html` into the target document.
2. Load `services.css` after the shared portfolio styles.
3. Load `services.js` after GSAP. GSAP is optional; the module remains functional without it.

Initialization is automatic for every `[data-alemzai-services]` element. Re-running `AlemzaiServices.init(element)` is safe and does not attach duplicate listeners.

The CTA controls dispatch bubbling events so the integration layer can decide where examples and requests should lead:

- `alemzai:service-example`
- `alemzai:service-request`

Each event includes `detail.key` and a copy of the selected service data. No contact destination or external URL is assumed.
