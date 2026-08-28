# Postify Backlog

## Now — Product value MVP
- [x] Replace generic homepage proposition with practical-knowledge positioning
- [x] Replace glow-card editorial feed with utility-focused content cards
- [x] Add content-type derivation that works with old Supabase rows
- [x] Add article quick-summary/trust strip
- [x] Simplify desktop navigation and remove nonessential visual noise
- [x] Preserve Turkish/English support

## Next — Author value
- [x] Structured editor templates: Guide / Decision / Explainer / Field Note
- [x] Explicit outcome, prerequisites, environment/version, verification, caveats and source fields
- [x] Draft quality checklist before publish
- [x] Local draft autosave/restore
- [x] Reader filter by content format
- [x] Repeatable test/lint/build/smoke release gate
- [ ] Markdown import/export and canonical URL support
- [x] Revision history / changelog model

- [x] Reader table of contents for structured articles
- [x] Quick-read discovery filter

## Later — Network value
- [x] “Worked for me” with environment/version context
- [ ] Suggested corrections / patch-style contributions
- [ ] Follow authors/topics
- [ ] Personalized reading queue
- [x] Structured source/reference blocks and freshness reminders
- [x] AEO/structured data + machine-readable knowledge JSON/llms.txt

## Deferred until value is proven
- [x] Apply the reviewed Supabase structured-evidence migration to production and verify RLS/advisors
- [ ] Monetization and paid publications
- [ ] Recommendation ranking at scale

## Completed — discovery resilience batch
- [x] Restore writing mode with local drafts
- [x] URL-addressable category + format + quick-read discovery state
- [x] Derive quick-read duration safely when legacy rows omit reading-time metadata
- [x] Associate title validation feedback with the editor input for assistive technology

## Final validation follow-up
- [x] Verify GitHub Pages SPA fallback artifact and current product identity in the release gate
- [x] Add a real browser-engine E2E check for direct deep-link navigation and responsive critical flows

## UI V2 follow-up
- [x] Flatten feed/category navigation and strengthen editorial hierarchy
- [x] Align bookmarks/profile/public author pages with the new visual system
- [x] Add Chromium desktop/article/mobile/reduced-motion smoke coverage
- [ ] Add screenshot-diff baselines for the key UI V2 viewports once a stable visual baseline is approved
- [ ] Continue legacy surface cleanup: analytics/admin/secondary share controls where old gradient/card styles remain
- [x] Align auth/404 and analytics/admin secondary surfaces with UI V2
- [x] Restrain share/bookmark/fallback-card control styling

## UI cleanup follow-up
- [x] Remove homepage manifesto block and compress mobile discovery controls
- [x] Rework About and Contact away from portfolio/bento presentation
- [x] Align comment discussion UI with the editorial system
- [ ] Run a content/copy pass on remaining authenticated-only surfaces with real production data once Supabase production work is allowed

## Verified Knowledge — backend phase
- [x] Design/review Supabase schema for evidence snapshots, user confirmations, failure aggregates and revisions
- [x] Threat-model core confirmation abuse/privacy boundaries; self-confirmation/duplicate inflation/raw cross-user reads blocked by RLS
- [x] Give authors identity-free private access to failure details without exposing raw community evidence publicly
- [x] Move privileged authenticated RPC execution behind non-exposed private helpers
- [x] Build a narrow deterministic Node.js automatic verification runtime before introducing “Postify verified”
- [x] Bind the first automatic verification example to a canonical production row and reject stale fallback-only artifacts
- [x] Add repository dependency/version monitoring with weekly Dependabot checks
- [ ] Invalidate or re-check Verified Knowledge evidence when tracked dependency/runtime releases advance
- [x] Add revision history model with private immutable snapshots and sanitized public changelog
- [ ] Add grounded Ask Postify/API/MCP only after provenance/freshness data is durable

## Verified Knowledge expansion after full conversion
- [ ] Add additional sandbox runtimes only with resource/network isolation and explicit supported scopes
- [ ] Add dependency-release invalidation signals for evidence environments
- [ ] Add moderation tooling if community failure notes become abusive/noisy at scale
- [ ] Add grounded Ask Postify only after durable production evidence/revision data has enough coverage

## Actionability
- [x] Turn article verification steps into a version-scoped interactive runbook
- [x] Add copy actions for fenced code examples with clipboard fallback
- [x] Bind displayed automatic-verification code, expected output, actual output and code hash to one release contract
- [ ] Sync personal runbook progress to account state only after a reviewed persistence model exists

## Security hardening
- [x] Harden user-controlled profile website URLs with an HTTP/HTTPS protocol allowlist
