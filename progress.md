# Postify Progress

## 2026-08-28 — Product value MVP implemented locally
Completed:
- Audited repository structure, homepage, article, navigation, fallback content, and build setup.
- Chose a practical-knowledge positioning instead of a generic Medium-style blog proposition.
- Created persistent project memory: context, requirements, decisions, backlog, known issues, reports, and specs.
- Reworked the homepage value proposition around usable knowledge: guides, decision notes, explainers, and field notes.
- Replaced the glow-heavy primary feed with a calmer utility-oriented lead + list layout.
- Added frontend-only content-type derivation so existing Supabase rows do not require a schema migration yet.
- Added neutral freshness/date presentation without fake “verified” claims.
- Added an article “before you read” panel showing expected outcome, content type, reading time, and relevant date.
- Simplified the header/navigation and preserved search, auth, bookmarks, language, theme, profile/admin routes.
- Preserved fallback-content behavior and Turkish/English support.

Verification:
- `npm ci`: PASS in `node:20-alpine` Docker.
- `npm run lint`: PASS with 0 errors and the same 1 pre-existing React Hooks warning in `src/components/ui/design-testimonial.jsx`.
- `npm run build`: PASS.
- No Supabase schema or production deployment changes were made.

Current branch:
- `chatgpt/postify-rethink` on the Oracle development clone `/opt/postify-dev`.

Next:
- Preview the product-value MVP in a browser and fix visual/interaction issues found there.
- Then implement author-side structured templates (Guide / Decision / Explainer / Field Note) without requiring Supabase schema changes yet.

## Overnight loop checkpoint — 04:15 TRT
- Production deployment is now explicitly permitted after quality gates pass.
- Continuing autonomous product-development loops on `chatgpt/postify-rethink`.


## 2026-08-28 — Controlled loop batch (7+ loops)
Completed in this run:
1. Restored the documented test command and added focused tests for Postify content presentation.
2. Removed the remaining React Hooks lint warning; lint now passes with zero warnings/errors.
3. Added four author writing modes (Guide / Decision note / Explainer / Field note) with localized, actionable writing briefs and no database dependency.
4. Added safe local draft autosave/restore with user+language scoped keys and tests.
5. Added reader-side format filtering so discovery can be driven by intended outcome, not only category/search.
6. Hardened SEO/PWA identity: Postify naming, practical-knowledge description, canonical URL normalization, Article structured data, correct app icon metadata, Turkish static document language.
7. Added a repeatable release gate (`npm run verify`) plus build artifact smoke checks and a runtime Vite preview smoke for `/` and an article SPA route.
8. Updated README to reflect the new product positioning and release workflow.

Evidence:
- `npm test`: 10 test files / 42 tests PASS.
- `npm run lint`: PASS, zero warnings/errors.
- `npm run build`: PASS.
- `npm run smoke:build`: PASS.
- Runtime preview smoke: `/` HTTP 200 and `/posts/ai-muhendisligi` HTTP 200.
- `git diff --check`: PASS.

Production status:
- Quality gates are green. Deployment via the current GitHub Pages path will be attempted after checkpoint commit.


### Follow-up loop — language accessibility + deploy attempt
- Added dynamic `<html lang>` synchronization when the user switches Turkish/English.
- Re-ran `npm run verify`: 10 test files / 42 tests PASS, lint clean, production build PASS, build smoke PASS.
- Attempted the repository's existing GitHub Pages deploy path after gates were green.
- First deploy attempt exposed Docker git safe-directory context; strategy was corrected.
- Second deploy reached GitHub but failed because the Oracle workspace has no GitHub HTTPS write credential (`could not read Username for https://github.com`).
- Connected GitHub integration also returned HTTP 403 when creating a branch, confirming there is no usable repository write path from this run.
- Production was left untouched and remains healthy: `https://postify.zekiakgul.dev/` returned HTTP 200 and still serves the prior `Postify Blog` build.
- No DNS/hosting architecture switch was attempted as a workaround; preserving the healthy production site is safer than rerouting hosting solely to bypass missing GitHub credentials.


## 2026-08-28 — Controlled loop batch: author quality + reader utility
Completed in this run:
1. Added a publish-readiness panel that separates required title/body checks from advisory scannable-structure guidance.
2. Added live author metrics for word count and estimated reading time.
3. Added safe one-click starter outlines for Guide / Decision note / Explainer / Field note; outlines add structure only and never fabricate article content.
4. Added deterministic article heading anchors and an automatic “On this page / Bu yazıda” outline when enough headings exist.
5. Added a transparent external-reference section that only surfaces URLs actually present in article content; same-origin links are excluded.
6. Added keyboard skip navigation, global focus-visible treatment, and accessible loading status semantics.
7. Added a ≤5-minute quick-read discovery filter alongside content-format filters.

Verification evidence:
- Focused tests for publish readiness, writing metrics, writing templates, and article structure: PASS.
- Full `npm run verify`: 13 test files / 52 tests PASS, lint PASS with zero warnings/errors, production build PASS, build smoke PASS.
- Runtime Vite preview smoke: `/`, `/posts/ai-muhendisligi`, `/posts/create` all HTTP 200; product HTML metadata check PASS.
- `git diff --check`: PASS.

Release note:
- GitHub write access has since been restored through the connected GitHub integration. This batch is eligible for branch push/PR/CI and production release after the checkpoint commit.

## 2026-08-28 — Controlled loop batch: resilient drafts + shareable discovery
Completed in this run:
1. Fixed restored drafts so their selected writing mode is restored with the content.
2. Made content-format discovery state URL-addressable via the `type` query parameter.
3. Made quick-read discovery state URL-addressable via the `reading=quick` query parameter.
4. Preserved category/type/reading filters when any one filter changes instead of overwriting sibling query state.
5. Reset feed pagination when category changes and added explicit group semantics to format/time filters.
6. Made quick-read filtering derive reading time from body/excerpt when API metadata is absent, while excluding posts with no measurable text; added unit coverage.
7. Connected title validation and character-count feedback to the title input with `aria-invalid`, `aria-describedby`, and alert semantics.

Verification: focused post-presentation/draft tests pass (10/10); full `npm run verify` passes with 13 test files / 53 tests, lint clean, production build PASS, and build smoke PASS. Runtime preview smoke returned HTTP 200 for `/`, the combined filter URL, and `/posts/create`; HTML product marker PASS.

Production check after the batch: root returned HTTP 200 and serves the newer Postify identity, but a direct article deep link returned HTTP 404. Therefore this run does not claim a successful production deploy; deep-link hosting fallback is recorded as a release issue.

## 2026-08-28 — Final release validation
- Re-ran the full release gate after the overnight batches: 13 test files / 53 tests PASS, lint clean, production build PASS, build smoke PASS.
- Hardened the GitHub Pages SPA fallback release gate: `docs/404.html` is now a required build artifact and its redirect/product identity are verified.
- Updated the fallback page from the stale “Postify Blog” identity to “Postify — Uygulanabilir Bilgi”.
- Production root remains healthy; direct article requests currently return GitHub Pages HTTP 404 before client-side fallback, so release verification must distinguish HTTP status from browser redirect behavior.

### Final deploy attempt — blocked by repository authentication
- Final source commit created locally: `78ecfb4` (`fix: harden pages deep-link fallback`).
- `git push -u origin chatgpt/postify-rethink` failed because the Oracle host has no GitHub HTTPS credential.
- `gh auth status` confirms no authenticated GitHub session; SSH auth to `git@github.com` also fails with `Permission denied (publickey)`; no GH/GITHUB token environment variables are present.
- Production remains healthy at the root (HTTP 200) but still serves the prior fallback identity (`Postify Blog`) at `/404.html`, proving the final fallback hardening has not been deployed yet.

## 2026-08-28 — UI V2 parallel worktree kickoff
- Split the UI redesign into isolated foundation, home/discovery, article, editor, and QA worktree lanes.
- Integrated the first four UI lanes into `chatgpt/postify-ui-v2` without functional/schema changes.
- Foundation: warmer editorial palette, calmer typography system, simplified header, direct Guides/Decisions/Field Notes navigation.
- Discovery: typography-led hero, useful primary/secondary actions, quieter search treatment, flatter featured story and filter styling.
- Article: removed card/glass reading shell in favor of a cleaner editorial page, larger display hierarchy and quieter utility rail.
- Editor: removed gradient/card treatment and moved toward a focused writing workspace with structured format/readiness tools retained.
- Verification after integration: 13 test files / 53 tests PASS, lint PASS, production build PASS, build smoke PASS.
- Runtime Vite preview root returned HTTP 200. Host Chromium screenshot automation is blocked by Snap cgroup restrictions under the MCP service, so this batch is not being auto-deployed before a real visual/browser QA pass.

## 2026-08-28 — UI V2 parallel pass 2
- Refined the editorial feed and category discovery: flatter surfaces, stronger serif hierarchy, calmer metadata, underline-style filters, less card chrome.
- Reworked bookmarks/profile/public author surfaces to match the editorial system and removed legacy gradient/glass treatments from the main account flows.
- Fixed the public author bookmark callback to match the current `EditorialFeed` contract and made bookmarked links slug-aware.
- Simplified the footer, removed the giant display banner, shifted category links to Postify content formats, and added a global reduced-motion safeguard.
- Added a dedicated Chromium UI V2 E2E smoke covering desktop discovery/navigation, direct article rendering, 390px mobile overflow/menu, and reduced-motion behavior.
- Verification: full `npm run verify` PASS (13 files / 53 tests, lint, production build, build smoke) and Playwright Chromium UI smoke PASS (4/4).

## 2026-08-28 — UI V2 polish pass 3
- Calmed login/auth and 404 recovery surfaces by removing decorative orb/gradient motion and emphasizing typography + clear actions.
- Brought analytics/admin dashboards into the same flat editorial system: lighter surfaces, fewer shadows, stronger separators, quieter status treatments.
- Simplified secondary sharing, bookmark and fallback post-card controls; removed platform-color spectacle and hover scale/glow behavior.
- Expanded Chromium UI smoke from 4 to 6 scenarios with login and unknown-route recovery coverage.
- Verification: `npm run verify` PASS (13 files / 53 tests, lint, production build, build smoke) and Playwright Chromium UI smoke PASS (6/6).

## 2026-08-28 — UI cleanup v4
- Removed the oversized “Postify Standardı” manifesto block from Home; discovery now moves directly from hero into topics/formats/content.
- Mobile format filters now stay in one horizontally scrollable row instead of wrapping into a large two-row control block.
- Rebuilt About as a concise product explanation instead of a founder/tech-stack portfolio showcase.
- Rebuilt Contact as two direct channels plus a short contact-purpose note; removed glowing/bento presentation.
- Restyled article comments into the same quiet editorial system.
- Expanded Chromium UI smoke to 9 scenarios covering About, Contact, and mobile filter layout.
- Full verify PASS: 13 files / 53 tests, lint, production build, artifact smoke. Chromium UI smoke PASS: 9/9.

## 2026-08-28 — Verified Knowledge V1
- Repositioned the product from generic practical publishing toward explicit evidence/freshness semantics.
- Added deterministic evidence model + tests; absent evidence is never upgraded to verification.
- Added honest author-tested sample evidence to the local catalogue, including environment, tested date, verification steps and caveats.
- Discovery now exposes evidence/freshness and a current-evidence filter.
- Article detail now explains evidence, freshness, environment, prerequisites and verification steps, with an explicit author-claim disclaimer.
- Added device-local Worked/Didn't work evidence and Try later/Using/Reference shelf states; no fake community aggregates.
- Added zero-result Knowledge Gap capture stored only on-device.
- Authoring draft now collects outcome, test date, environment and verification steps and includes them in readiness scoring; production persistence remains deferred pending schema review.
- Added `llms.txt` trust semantics to static release and build smoke.
- Verification baseline expanded to 15 test files / 59 unit tests and 12 Chromium UI scenarios.

## 2026-08-28 — Verified Knowledge full product conversion
- Added additive production schema for post evidence, confirmations, revisions, knowledge gaps, private shelf state and aggregate evidence views.
- Migration passes PostgreSQL 16 dry-run and idempotency; RLS integration test passes self-confirmation, duplicate inflation, private shelf, gap dedupe, revision ownership and re-verification boundaries.
- Authoring now persists structured evidence and edit mode performs real updates with revision snapshots.
- Added real community confirmations/failure reports and minimum-sample aggregate rules.
- Added author Knowledge Health dashboard with re-verification queue, knowledge demand and evidence-gated domain credibility.
- Added evidence-aware discovery ranking/filtering and persistent authenticated knowledge gaps/shelf states.
- Added the first real `Postify verified` execution: deterministic Node.js code is run in the release gate; failed expected output fails release.
- Added machine-readable verification and per-article JSON artifacts plus structured citations/alternate JSON metadata.
- CI now includes a PostgreSQL schema/RLS gate. Deploy workflow now reads existing Supabase Action secrets correctly and exports production knowledge artifacts after build.
- Local release verification: 19 test files / 67 tests PASS; lint/build/smoke PASS; Chromium 15/15 PASS.

## 2026-08-28 — Pre-Supabase hardening and release-gate expansion
- Added explicit `knowledge-backend-status.json` capability gating so the same frontend is compatible with both the current production schema and the future Verified Knowledge schema.
- Public `postService` now retries legacy post fields when additive evidence columns are absent instead of dropping the whole live catalogue to fallback content.
- Authenticated/community features remain honestly local-only while the production backend upgrade is pending; the Knowledge Health dashboard explains the pending state instead of firing broken requests.
- Expanded author evidence UI with prerequisites, verification steps, caveats, sources, freshness window and revision reason. Publish is disabled until the persistent backend capability is active.
- Sanitized structured-data citations to HTTP(S) URLs only.
- Added immutable follow-up migration `202608281320_evidence_integrity_and_privacy.sql`: DB evidence integrity trigger/constraints, author-writable status restriction, private raw confirmations/revision snapshots, aggregate public failure view and sanitized public revision history.
- PostgreSQL 16 full migration chain dry-run passes all five repository migrations plus RLS/privacy assertions, including cross-user confirmation privacy and anonymous raw-snapshot denial.
- CI schema job now applies every migration in repository order and bootstraps the minimal Supabase Storage contract required for a faithful dry-run.
- Added Chromium E2E as a deploy dependency; production cannot deploy when the 20-scenario browser suite fails.
- First-load profiling removed eager `react-icons/fa`, Framer Motion/AI UI barrel loading, Command Palette, Radix mobile sheet and knowledge-service code from the discovery critical path.
- Production main entry reduced from ~338.6 KB / 111.3 KB gzip to ~294.0 KB / 96.9 KB gzip. Build smoke now enforces a 320 KB entry budget and forbids eager preload of sheet/knowledgeService/editor/motion chunks.
- Current gates: deterministic Node verifier PASS; 20 test files / 74 tests PASS; lint PASS; production build + artifact/performance smoke PASS; local Chromium product suite 20/20 PASS.

## 2026-08-28 — Privacy, compatibility, performance and production-observability hardening
- Added an immutable follow-up migration instead of rewriting the already-merged Verified Knowledge migration history.
- Database trust enforcement now rejects author-written `postify-verified`, future `tested_at`, and incomplete `author-tested` evidence.
- Raw confirmations are user-private; raw revision snapshots are author/admin-only. Public failure evidence is aggregate-only and public revision history excludes snapshots.
- Added owner/admin-only `get_post_failure_details` RPC returning environment/note/date without contributor identity, plus an on-demand author dashboard panel.
- Added HTTP(S)-only citation sanitization before JSON-LD output.
- Added explicit backend capability gating and legacy post-read fallback so one frontend release works safely before and after production migration.
- Verified publishing is disabled while backend capability is pending; local draft/autosave stays available instead of silently losing evidence fields.
- CI now runs full Chromium product E2E as a deploy dependency and applies every repository migration in order in a fresh PostgreSQL schema job.
- Deploy now stamps `release.json`; a post-deploy job waits for the exact source SHA on the custom domain, probes machine-readable artifacts/capability, then runs the Chromium suite against production.
- First-load hardening lazy-loads Command Palette/mobile Sheet/knowledge service and removes the AI barrel from the eager Redux path. Entry chunk is ~294 KB versus ~338.6 KB before; build smoke enforces a 320 KB budget.
- Current local gates: deterministic Node verification PASS; 20 test files / 75 tests PASS; lint/build/artifact/performance smoke PASS; full migration chain + RLS/privacy assertions PASS; Chromium 20/20 PASS.

## 2026-08-28 — Production smoke compatibility fix
- Production SHA attestation proved the live site was serving the exact merged source SHA.
- Production Chromium/network probing found avoidable Supabase 400 responses before the Verified Knowledge schema migration: public post reads requested additive evidence columns first, then fell back to legacy fields.
- Public post queries now consult the deployed knowledge capability contract first and choose legacy fields immediately while `ready:false`, eliminating expected pre-migration API 400 noise.
- Production browser observability now distinguishes GitHub Pages' known initial deep-link document 404 from unexpected API/subresource 4xx/5xx responses; API/resource failures remain release-blocking.
- GitHub Actions public Supabase URL/publishable key were aligned with the production client already served by the live site; this does not grant schema-management access.

## 2026-08-28 — Action Runbook V1
- Turned evidence `verificationSteps` into an interactive article runbook so Postify content can be applied, not only read.
- Runbook progress is stored device-locally and keyed to `evidence_version`; a new evidence version invalidates old completion state instead of carrying stale checks forward.
- Completing a runbook never creates a `Postify verified` claim. The completed state links readers to the existing Worked/Didn't Work evidence flow.
- Added copyable fenced code blocks with language labels and a clipboard fallback when the modern Clipboard API is denied.
- Added keyboard-operable runbook checkboxes, progress semantics, reset, mobile layout, reduced-motion behavior, and clear local-only trust copy.
- Verification baseline: 20 test files / 80 tests PASS, lint/build/smoke PASS, Chromium product suite 22/22 PASS.

## 2026-08-28 — Production read noise hardening
- Production network probing found one remaining avoidable Supabase 400 after the schema-capability fix: a missing fallback slug was retried against the UUID `posts.id` column.
- Added a strict UUID guard so non-UUID slugs never enter the ID lookup path.
- Current verification on the combined main + Action Runbook baseline: 20 unit/integration files / 81 tests PASS; lint/build/artifact smoke PASS; Chromium 22/22 PASS.

## 2026-08-28 — Production migration runner prepared
- Added a manual-only Supabase production migration workflow pinned to CLI 2.116.0 and project `fuiwcrqmxndguxymwoin`.
- The workflow validates owner credentials, links the exact project, lists remote migration history, performs a dry-run without `--include-all`, and refuses apply unless the exact production confirmation is supplied.
- Successful apply re-reads migration history, probes the three new public evidence views with the production publishable key, then triggers the full main CI/deploy/production-browser pipeline.
- No production migration is performed by normal push/PR events.

## 2026-08-28 — Profile URL trust-boundary hardening
- Supabase management access rechecked: CLI is installed but no authenticated access token is available; production migration remains untouched.
- Added a shared HTTP/HTTPS-only URL normalizer for user-controlled public links.
- Profile website saves now reject non-HTTP(S) schemes; previously stored unsafe values are not rendered as clickable links.
- Profile service normalization applies the same boundary so future public profile consumers receive a safe URL or `null`.
- Verification: focused URL tests PASS; full `npm run verify` PASS with 20 files / 81 tests; Chromium CI-parity E2E PASS 22/22.
