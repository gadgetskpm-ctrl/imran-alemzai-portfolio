# Alemzai V2 motion runtime

Load scripts in this order after GSAP, ScrollTrigger, and (optionally) ScrollSmoother:

1. `tokens.js`
2. `scheduler.js`
3. `hero-canvas.js`
4. `controller.js`

`window.AlemzaiMotion` owns the shared pointer, media-query state, visibility lifecycle, cleanup registry, smooth-scroll instance, and Canvas hero factory. Components should subscribe to `window.AlemzaiMotionScheduler`; they must not start private animation-frame loops.

Public integration methods are `subscribeFrame`, `getPointer`, `onReducedChange`, `isReduced`, `createContext`, `registerCleanup`, `observe`, `refresh`, `scrollTo`, `enableSmooth`, `disableSmooth`, `createHero`, and `destroy`. Every subscription and registration returns a disposer. A component context groups all of its disposers behind one `destroy()` call.

Smooth scrolling is opt-in through `AlemzaiMotion.enableSmooth({ wrapper, content })`. It activates only for a fine-pointer, hover-capable viewport at least 900px wide, never on touch, and shuts down on live reduced-motion or capability changes.
