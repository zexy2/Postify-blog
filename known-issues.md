# Postify Known Issues

## Current
- Oracle host has no global Node/npm runtime; deterministic verification uses `node:20-alpine` Docker.
- Playwright dependencies exist, but a real browser-engine E2E suite has not yet been executed in this environment; current browser-facing validation uses production builds plus Vite preview HTTP smoke checks.
- Explicit structured metadata (content type, outcome, prerequisites, environment/version, sources, revision history) is not persisted yet because Supabase migrations remain intentionally deferred.
- Existing visual code outside the primary homepage/article/create flow still contains legacy trend-oriented components and can be simplified incrementally.
- Current production hosting is GitHub Pages. The Oracle workspace still has no direct GitHub HTTPS credential, but connected GitHub write access is now available and should be used for branch/PR/release operations.

## Resolved in 2026-08-28 loop
- `package.json` now provides the documented `npm test` command.
- The previous React Hooks warning in `src/components/ui/design-testimonial.jsx` is fixed; lint is clean.
- Generic homepage positioning and glow-heavy primary discovery were replaced in the product-value branch.

## 2026-08-28 checkpoint note
- Discovery filter query parameters are frontend state only; server-side/pre-rendered filtered landing pages remain a future SEO enhancement.
- Reading-time fallback is an estimate based on available plain text (220 words/minute), not a measured completion-time claim.

- Browserslist compatibility data reports as 8 months old during build; dependency-data refresh is low-risk maintenance for a later batch, not a release blocker for this verified build.

- Production root is healthy (HTTP 200), but direct navigation to `/posts/ai-muhendisligi` currently returns HTTP 404 from GitHub Pages. Client-side navigation may work, but deep-link hosting fallback needs a dedicated fix before claiming full production smoke health.

## Final validation note — 2026-08-28
- GitHub Pages returns HTTP 404 for a direct SPA article path and serves `404.html`; the fallback JavaScript then redirects browsers into the SPA route. Build verification now guarantees that fallback exists and has current product identity, but HTTP-only smoke still observes the initial 404 by design. A browser-engine E2E check remains the best next verification step.

- Final production release is operationally blocked by missing GitHub repository authentication on the Oracle host. The verified fix is committed locally, but cannot be pushed/deployed from this environment until an authenticated GitHub write path is available.
