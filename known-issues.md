# Postify Known Issues

## Current
- Oracle host has no global Node/npm runtime; deterministic verification uses `node:20-alpine` Docker.
- Playwright dependencies exist, but this run has not yet executed a real browser-engine E2E suite; runtime smoke used Vite preview + HTTP checks.
- Explicit structured metadata (content type, outcome, prerequisites, environment/version, sources, revision history) is not persisted yet because Supabase migrations remain intentionally deferred.
- Existing visual code outside the primary homepage/article/create flow still contains legacy trend-oriented components and can be simplified incrementally.
- Current production hosting is GitHub Pages. Deployment requires a working GitHub write credential/path from the Oracle workspace; this must be verified during deploy attempt.

## Resolved in 2026-08-28 loop
- `package.json` now provides the documented `npm test` command.
- The previous React Hooks warning in `src/components/ui/design-testimonial.jsx` is fixed; lint is clean.
- Generic homepage positioning and glow-heavy primary discovery were replaced in the product-value branch.
