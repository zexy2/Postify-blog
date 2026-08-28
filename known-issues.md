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
