# Public asset manifest

This manifest records the repository’s reviewed, public-facing visual assets. It is an inventory and integration guide, not permission to publish new source material. Only the optimized files listed below should be referenced by the site.

## Brand

| Asset | Format | Dimensions | Status | Intended use |
| --- | --- | ---: | --- | --- |
| `public/assets/brand/alemzai-logo-primary.svg` | SVG | 700 × 144 viewBox | Production | Warm-white horizontal lockup with lime accent for dark backgrounds; used by the website header and footer. |
| `public/assets/brand/alemzai-logo-dark.svg` | SVG | 700 × 144 viewBox | Production | Black horizontal lockup with accessible darker-green accent for light backgrounds. |
| `public/assets/brand/alemzai-logo-monochrome.svg` | SVG | 700 × 144 viewBox | Production | Single-color horizontal lockup for documents, engraving, and one-color printing. |
| `public/assets/brand/alemzai-mark.svg` | SVG | 176 × 136 viewBox | Production | Icon-only mark for dark backgrounds. |
| `public/assets/brand/alemzai-mark-dark.svg` | SVG | 176 × 136 viewBox | Production | Icon-only mark for light backgrounds. |
| `public/assets/brand/alemzai-mark-monochrome.svg` | SVG | 176 × 136 viewBox | Production | Single-color icon-only mark. |
| `public/assets/brand/alemzai-logo-primary.png` | PNG | 1400 × 288 | Production | Transparent raster export of the primary horizontal lockup. |
| `public/assets/brand/alemzai-mark-512.png` | PNG | 512 × 396 | Production | Transparent icon export for profiles and applications that reject SVG. |
| `public/assets/brand/alemzai-social-profile.svg` | SVG | 1024 × 1024 viewBox | Production | Square black profile image with centered mark. |
| `public/assets/brand/alemzai-social-profile.png` | PNG | 1024 × 1024 | Production | Raster social-profile export. |
| `public/assets/brand/alemzai-social-card.png` | PNG | 1200 × 630 | Production | Branded Open Graph and social-sharing preview. |

The approved system uses near-black `#080A09`, warm off-white `#F3F0E8`, and electric lime `#B8FF18`. All SVG lettering is outlined, so the logo makes no external font request. Keep clear space around the lockup equal to the lime square. Do not add glow, gradients, shadows, outlines, or alternate accent colors.

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

- Portfolio and service raster assets are optimized WebP files. Approved logo raster exports are transparent PNG files and contain no EXIF metadata.
- Raster widths are 1200–1280 pixels and current file sizes are approximately 25–65 KB; no recompression is presently necessary.
- No remote asset URLs, external fonts, tracking pixels, scripts, credentials, personal documents, resumes, certificates, private client material, or job-search information are included.
- Keep meaningful alternative text in page markup. Describe what the image communicates in its UI state; do not repeat nearby headings or imply a real client result.
- Do not commit raw generations, unused variants, editable source files, or assets copied from private folders. Add a reviewed, optimized derivative only after explicit approval.
- When replacing an approved asset, update this manifest with its path, dimensions, purpose, and loading guidance in the same change.
