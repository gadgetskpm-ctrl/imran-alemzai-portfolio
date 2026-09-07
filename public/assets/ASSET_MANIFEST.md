# Public asset manifest

This manifest records the repository’s reviewed, public-facing visual assets as of 2026-09-04. It is an inventory and integration guide, not permission to publish new source material. Only the optimized files listed below should be referenced by the site.

## Brand

| Asset | Format | Dimensions | Status | Intended use |
| --- | --- | ---: | --- | --- |
| `public/assets/brand/alemzai-logo-placeholder.svg` | SVG | 480 × 96 viewBox | **Placeholder — replace before final brand launch** | Local header/footer wordmark fallback. The SVG contains no external links, font imports, scripts, metadata, or embedded raster data. |

The placeholder’s accessible name is “Alemzai Systems,” and its description explicitly identifies it as temporary. Its wordmark uses a local system-font fallback and makes no font request. Keep the existing text-based site mark until the final logo is approved, or provide equivalent adjacent text when the SVG is treated as decorative.

## Northline Barber demo

These five local images support a fictional front-end demonstration. They are not evidence of a real client engagement, appointment, result, or location.

| Asset | Dimensions | File size | Purpose | Loading guidance |
| --- | ---: | ---: | --- | --- |
| `public/assets/demos/northline-barber/hero-barber.webp` | 1280 × 714 | 37 KB | Default Northline visual | Eager only when it is the initial visible demo image; otherwise lazy |
| `public/assets/demos/northline-barber/service-cut.webp` | 1280 × 714 | 64 KB | Service-selection state | Lazy |
| `public/assets/demos/northline-barber/booking-space.webp` | 1280 × 714 | 38 KB | Time-selection state | Lazy |
| `public/assets/demos/northline-barber/shop-interior.webp` | 1280 × 714 | 43 KB | Details state | Lazy |
| `public/assets/demos/northline-barber/grooming-tools.webp` | 1280 × 714 | 65 KB | Secondary service detail | Lazy |

## Service previews

The current vanilla site serves these tracked assets from `assets/services/`. They remain outside `public/assets/` to preserve the existing runtime paths; this asset-only branch does not relocate or duplicate them.

| Asset | Dimensions | File size | Purpose | Loading guidance |
| --- | ---: | ---: | --- | --- |
| `assets/services/graphic-design.webp` | 1200 × 751 | 32 KB | Graphic design and brand-assets preview | Lazy when below the fold |
| `assets/services/ai-content.webp` | 1200 × 749 | 53 KB | AI video and content-production preview | Lazy when below the fold |
| `assets/services/digital-campaigns.webp` | 1200 × 749 | 25 KB | Digital advertising and campaign preview | Lazy when below the fold |

## Optimization and safety review

- All eight raster assets are WebP, sRGB, and contain no EXIF or ICC metadata.
- Raster widths are 1200–1280 pixels and current file sizes are approximately 25–65 KB; no recompression is presently necessary.
- No remote asset URLs, external fonts, tracking pixels, scripts, credentials, personal documents, resumes, certificates, private client material, or job-search information are included.
- Keep meaningful alternative text in page markup. Describe what the image communicates in its UI state; do not repeat nearby headings or imply a real client result.
- Do not commit raw generations, unused variants, editable source files, or assets copied from private folders. Add a reviewed, optimized derivative only after explicit approval.
- When replacing an approved asset, update this manifest with its path, dimensions, purpose, and loading guidance in the same change.
