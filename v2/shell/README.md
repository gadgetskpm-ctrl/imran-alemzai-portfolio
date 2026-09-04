# Alemzai V2 immersive shell

This package is an isolated, progressively enhanced shell for the existing vanilla portfolio. It does not fetch assets, fonts, analytics, or libraries.

## Integration

1. Load `shell.css` after the existing portfolio styles.
2. Keep the existing local GSAP and ScrollTrigger scripts before `shell.js`.
3. Place the contents of `shell.html` where the current header and hero should render. If the existing page keeps its main element, remove the fragment's `<main>` wrapper and retain `id="av2-main"` on the first content container.
4. Ensure the existing sections retain the targets `#services`, `#demos`, `#about`, `#approach`, and `#start-project`.

The module initializes every `[data-av2-shell]` once. Repeated `AlemzaiShell.init(element)` calls return the existing API rather than adding duplicate listeners. Call `api.destroy()` before replacing a mounted shell.

## Behavior and fallbacks

- The capability map represents the six studio disciplines. Pointer input subtly adjusts the map; hero scroll advances its active discipline.
- GSAP drives the initial reveal and ScrollTrigger-driven system transition when the existing local globals are available.
- Without GSAP, all content remains visible and usable.
- On touch/coarse pointers the custom cursor is removed and native scrolling is untouched.
- Under `prefers-reduced-motion: reduce`, canvas animation, pointer response, scroll animation, and animated transitions are disabled; a static capability map remains visible.
- The menu includes Escape handling, focus containment, focus restoration, and correct `aria-expanded` / `aria-hidden` state.

No case-study claims, contact information, remote URLs, or personal files are included.
