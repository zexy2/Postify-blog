# Postify Known Issues

## Current — release relevant
- **Production Supabase Verified Knowledge migration is not applied yet.** The migration chain, privacy hardening, RLS/abuse verification and frontend services are ready, but owner-level Supabase management access is still required before production `db push`. Until then `/knowledge-backend-status.json` remains `ready:false`, public reading stays backward-compatible, and evidence/shelf/gap contributions use honest local fallback behavior.
- **GitHub Pages direct SPA paths return an initial HTTP 404 by hosting design.** The checked `404.html` redirect restores the route in browsers. Chromium E2E covers direct article navigation; HTTP-only probes must not mislabel the expected initial 404 as an application rendering failure.
- **Automatic Postify verification intentionally supports only checked-in deterministic Node.js snippets.** Arbitrary user code, package installation, shell/network access and external-service verification remain unsupported until an isolated runtime is designed.
- **Browserslist/caniuse-lite data is ~8 months old.** This is a maintenance warning, not a current release blocker.
- **Pixel/screenshot baselines are not committed.** Chromium tests enforce functional/layout/accessibility invariants, not pixel-identical visual approval.
- The Oracle host has no global Node/npm runtime; deterministic release checks use pinned Docker images.

## Resolved — 2026-08-28
- User-controlled profile website links are now restricted to absolute HTTP/HTTPS URLs on save, render, and profile normalization; script/data schemes are rejected.
- GitHub HTTPS/CLI write authentication is available; branches, PRs, merges and workflow changes can be pushed from the Oracle workspace.
- Real browser QA runs successfully in the official Playwright Chromium container; Snap Chromium cgroup limitations are no longer a blocker.
- Verified Knowledge schema, persistence services, revision model, community evidence, Knowledge Gaps, shelf state, freshness and author dashboard are implemented and PostgreSQL/RLS tested; only production schema activation remains.
- Raw confirmation identity/free text and raw revision snapshots are no longer public surfaces. Public failure/revision views are privacy-safe aggregates/history; author failure details use an owner/admin-only identity-free RPC.
- Authors cannot write `postify-verified` into database metadata. The badge is derived only from a successful deterministic release execution artifact.
- Pre-migration frontend/backend compatibility is explicit through `knowledge-backend-status.json`; the current production schema does not generate noisy missing-table requests or force public reading into fallback content.
- Main entry size was reduced from roughly 338.6 KB to ~294 KB minified; a 320 KB build budget and lazy-boundary preload checks now protect the gain.

## Hosting boundary — 2026-08-28
- GitHub Pages still returns an initial HTTP 404 for direct SPA deep links before the checked-in `404.html` fallback restores the client route. Production browser smoke classifies only that document-level behavior as expected; unexpected API/subresource errors still fail the release.
