# Alemzai V2 demo module

This directory is an integration-ready, vanilla HTML/CSS/JavaScript module. It does not load fonts, analytics, scripts, or media from external sources.

## Integration

1. Insert the contents of `demos.html` where the V2 demos section should appear.
2. Load `v2/demos/demos.css` after the V2 global stylesheet.
3. Load the existing local GSAP bundle first, then load `v2/demos/demos.js` with `defer`.
4. Keep the existing `public/assets/demos/northline-barber/` directory at the same repository-relative path.

The JavaScript uses `window.gsap` when available and remains functional without it. All state changes are immediate when `prefers-reduced-motion: reduce` is active.
