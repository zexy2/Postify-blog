# Postify Known Issues

## Current
- Production Supabase has not yet received the Verified Knowledge migration chain (`202608280900` + `202608281320`). Until owner management access is available, production intentionally advertises `knowledge-backend-status.json` as not ready and uses local-only evidence/shelf/gap fallback behavior.
- GitHub Pages direct deep-link HTTP requests still return the platform's initial 404 before the checked-in SPA fallback restores the browser route. Real Chromium navigation is green, but HTTP status semantics remain a hosting limitation.
- Automatic `Postify verified` currently supports only checked-in deterministic Node.js snippets. Arbitrary user code, network access, package installation, shell execution and external-service verification remain intentionally unsupported.
- Screenshot/pixel-diff visual baselines are not committed; browser QA validates functional layout, accessibility, overflow and interaction invariants instead of pixel identity.
- Browserslist compatibility data reports as roughly 8 months old during build; this is maintenance debt, not a release blocker.
- The Oracle host has no global Node/npm runtime; deterministic verification uses Dockerized Node/Playwright toolchains.

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

## UI V2 QA note — 2026-08-28
- The Oracle host exposes Snap Chromium, but headless launch from the MCP systemd service fails with `is not a snap cgroup`. HTTP preview smoke works; real screenshot/browser QA needs a non-Snap browser/Playwright runtime or external visual review before this UI branch is promoted.

## UI V2 browser QA note — 2026-08-28
- Snap Chromium cannot run under the MCP systemd cgroup, but this is no longer a blocker: browser QA now runs successfully in the official Playwright Chromium container.
- Screenshot-diff baselines are not yet committed; current browser smoke validates layout/interaction invariants rather than pixel-level visual approval.

## Verified Knowledge V1 boundaries — 2026-08-28
- Structured evidence entered in the authoring UI is draft-only in V1; the current production Supabase schema has no reviewed evidence columns and no migration was performed.
- Worked/Didn't work, action shelf and Knowledge Gap data are device-local only. They are intentionally not presented as community totals.
- Automatic `Postify verified` execution, cross-user evidence aggregation, anti-abuse/reputation, dependency release monitoring and revision history require backend/security/schema work and remain deferred.

## Production DB credential boundary — 2026-08-28
- The repository/server has public frontend Supabase Action secrets but no database password/service-role/project-management credential and no linked Supabase CLI session. The Verified Knowledge migration is fully authored and PostgreSQL/RLS tested, but must not be falsely reported as applied to production until an authenticated project-owner migration channel is available.
- The first automatic verifier intentionally supports only checked-in deterministic Node.js snippets. Networked code, package installation, shell access, arbitrary user code and external services remain unsupported rather than being given a misleading verification badge.
