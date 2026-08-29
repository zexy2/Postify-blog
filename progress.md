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
- Added immutable follow-up migration `20260828144850_evidence_integrity_and_privacy.sql`: DB evidence integrity trigger/constraints, author-writable status restriction, private raw confirmations/revision snapshots, aggregate public failure view and sanitized public revision history.
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

## 2026-08-28 — Verification Contract V2
- Removed verifier/article code duplication for the first Postify Verified Node.js example. The article now renders the exact code stored in the verification manifest.
- The release verifier fails if an automatic verification manifest entry cannot find a matching article or if the article no longer contains the exact executed code.
- Verification artifacts now expose the actual Node runtime version, expected stdout, actual stdout, SHA-256 of the executed code, policy id and `articleContractMatched` state.
- Added `node-deterministic-v1` release policy: narrow checked-in snippets reject external packages, dynamic imports, network APIs, filesystem builtins, process execution APIs, eval/Function and non-output process access. Execution remains explicitly documented as checked-in child-process execution, not a security sandbox.
- Full gate: 22 test files / 89 tests PASS, deterministic verifier/article contract PASS, lint/build/smoke PASS, Chromium 22/22 PASS.

## 2026-08-28 — Reproducible command/output verification contract
- Extended verification artifact schema to v3 with a downloadable `.mjs`, reproduction command, expected/actual stdout, artifact hash and execution mode.
- The release verifier now executes the generated artifact file itself and rejects code/artifact hash drift.
- Evidence UI exposes the local command, expected output, actual CI output and exact executed file.
- Build smoke and Chromium coverage require the reproduction artifact and command/hash contract.
## 2026-08-28 — Production Supabase activation + advisor hardening
- Confirmed authenticated Supabase management access and inspected the live schema before any DDL: 8 posts, 16 translations, 2 profiles, no drafts/null publish timestamps, RLS enabled on the existing public tables.
- Applied the base/content/security migrations idempotently, restoring missing `comment_likes` policies and creating the expected `avatars` / `post-images` storage buckets.
- Applied Verified Knowledge and privacy/integrity migrations to production; evidence columns, confirmations, revisions, Knowledge Gaps, private shelf state, integrity trigger and owner-only failure-detail RPC are live.
- Ran a fresh PostgreSQL 16 migration-chain dry-run plus the full RLS/abuse verification: PASS (`verified knowledge RLS PASS`).
- Supabase security advisor initially found 3 ERROR-level SECURITY DEFINER public views plus anonymous definer RPC execution. Added and applied a follow-up hardening migration using SECURITY INVOKER public views over narrow private-schema helpers and removed anonymous RPC EXECUTE grants. Security ERROR findings are now 0.
- Added covering foreign-key indexes, removed the duplicate slug index, split the translation ALL policy, and converted RLS auth lookups to init-plan-safe `(select auth.uid())`. Performance advisor no longer reports unindexed-FK, auth-initplan, duplicate-index or multiple-permissive-policy findings.
- Production migration history now records six migrations; repository filenames were aligned to those exact remote versions without `migration repair`.
- Remaining Supabase security advisor warnings are two intentional authenticated SECURITY DEFINER RPCs (`request_knowledge_gap`, `get_post_failure_details`) with explicit auth/ownership checks, plus the project-level leaked-password-protection Auth setting.

## 2026-08-28 — Production activation release gates
- Full `npm run verify` PASS after production migration alignment: deterministic knowledge verification, 22 test files / 89 tests, lint, production build and artifact/performance smoke.
- The previously observed Chromium failure reproduced as a local parallel-worker flake only; the isolated case PASS and the CI-parity Chromium suite (`CI=true`, 1 worker) PASS 22/22 without weakening assertions.
- `npm ci` reports 28 advisories across the full dependency tree. Repeated online `npm audit` classification timed out from Oracle; offline audit output is not treated as authoritative, so production-vs-dev impact is not claimed yet.
## 2026-08-28 — Canonical production Verified example + stale-artifact hardening
- Found a trust-consistency gap: `node-json-dogrulama` existed in the fallback catalogue/build artifacts but not in production Supabase, while the production exporter overlaid live artifacts without deleting stale fallback JSON.
- Automatic verification now binds only when the production slug and the exact displayed fenced code match the checked-in verification manifest; code drift therefore removes the binding instead of preserving a misleading badge.
- Production knowledge export now clears the fallback-generated knowledge directory only after a successful Supabase schema/data read, then writes the canonical production set and attaches release verification only to exact code matches.
- Applied production migration `20260828155643_publish_verified_node_example.sql` through authenticated Supabase management access. The new database row intentionally remains `evidence_status=unverified`, `tested_at=null`, has no attributed author, and has TR/EN translations; `Postify verified` is derived only from the release execution artifact.
- Verified both production migration code blocks are byte-equivalent after newline normalization to the manifest code (2/2 exact). Fresh PostgreSQL 16 full migration chain + RLS/abuse verification PASS.
- Full release gate PASS: 22 Vitest files / 90 tests, deterministic verifier/article contract, lint, build and build smoke. Official Playwright v1.57 Chromium container PASS 22/22.
- Playwright local preview port is now configurable with `PLAYWRIGHT_PORT`; default CI behavior remains 4173 and unrelated server processes are not terminated.
## 2026-08-28 — Private RPC privilege boundary
- Moved privileged Knowledge Gap mutation and author failure-detail reads behind `private` SECURITY DEFINER helpers; the PostgREST-exposed `public.request_knowledge_gap` and `public.get_post_failure_details` signatures now remain SECURITY INVOKER wrappers.
- Anonymous EXECUTE remains denied; authenticated callers retain the same public RPC contract. Fresh PostgreSQL 16 migration/RLS/abuse verification PASS, including a new assertion that these public RPCs can never regress to SECURITY DEFINER.
- Applied production migration `20260828161849_private_rpc_boundary.sql` through authenticated Supabase management access and aligned the repository filename to the exact remote ledger version.
- Production transaction smoke used an existing profile, confirmed Knowledge Gap normalization/deduplication (`duplicate_count=1`), confirmed unauthorized failure-detail rejection, and rolled back with 0 persisted smoke rows. Production has no authored posts, so the positive author-only failure-detail path remains verified in the fresh PostgreSQL RLS test rather than by fabricating production data.
- Supabase security advisor no longer reports authenticated SECURITY DEFINER RPC warnings; the only remaining security advisor warning is the project-level leaked-password-protection Auth setting.
- Full release verify PASS: 22 Vitest files / 90 tests, deterministic verification, lint, build and build smoke. Official Playwright v1.57 Chromium suite PASS 22/22.

## 2026-08-28 — Dependency security baseline + recurring monitoring
- Reclassified the previously unresolved npm advisory set using online audit against the committed lock: baseline was 9 production vulnerabilities (6 high, 3 moderate) and 28 full-tree vulnerabilities (1 critical, 20 high, 6 moderate, 1 low).
- Rejected a broad semver-compatible refresh that changed 33 direct package resolutions. Two non-force `npm audit fix --package-lock-only --ignore-scripts` passes from the committed lock instead reached 0 production / 0 full-tree vulnerabilities while changing six direct resolutions and leaving `package.json` ranges unchanged.
- Added `.github/dependabot.yml` for weekly npm and GitHub Actions version monitoring. Routine npm minor/patch version updates are grouped by dependency type; security updates are intentionally not grouped by this configuration.
- Clean validation of the selected minimal lock PASS: Node 20 `npm ci`, deterministic verification, 22 Vitest files / 90 tests, lint, production build/smoke, official Playwright 1.57 Chromium 22/22, and final independent npm audit 0/0.
- A broad semver refresh candidate also reached audit 0 but failed Chromium badly (21/22 failures), validating the smaller remediation strategy; it was not selected or committed.
## 2026-08-28 — Fail-closed dependency release gate
- Added `npm run verify:security` to CI immediately after clean install. The gate requires npm audit to report zero vulnerabilities and fails closed on audit/network/non-JSON errors instead of treating missing data as clean.
- Exact-pinned `@playwright/test` at `1.57.0` and assert both Playwright CI container images match that package version, preventing browser/package drift from producing misleading E2E results.
- Tightened Dependabot version-update automation to SemVer minor/patch only; major upgrades remain manual compatibility work. Playwright is excluded from the grouped development PR so its package + browser image update can be reviewed together. GitHub Actions minor/patch updates are grouped.
- Clean Node 20 gate PASS: `npm ci`, online dependency audit 0 vulnerabilities, release security parity, deterministic verification, 22 Vitest files / 90 tests, lint, production build and build smoke.
- Official Playwright v1.57 Chromium clean workspace PASS 22/22.

## 2026-08-28 — Node 24 LTS verification runtime
- Moved hosted verify/deploy runtime from Node 20 to exact Node `24.20.0` and declared `runtimeMajor: 24` / `runtimeChannel: lts` in the automatic verification manifest.
- The verifier now fails closed with `runtime-major-mismatch` outside Node 24; an isolated Node 20 negative test PASS confirmed that the old runtime can no longer mint a passing release artifact.
- Clean Node `24.20.0` release gate PASS: npm audit 0, dependency/browser parity PASS, deterministic verification, 22 Vitest files / 90 tests, lint, build and build smoke. Official Playwright 1.57 Chromium PASS 22/22 on its bundled Node 24 runtime.
- Fresh PostgreSQL 16 full migration chain + RLS/abuse verification PASS with the Node LTS metadata migration. A focused DML invariant check confirmed only prerequisites change while `unverified`, `tested_at=null`, empty environment and evidence version 1 remain unchanged.
- Applied production migration `20260828171756_update_node_verification_lts.sql`. Production `node-json-dogrulama` now requires `Node.js 24 LTS`; evidence remains `unverified`, community worked/failed/confirmation counts remain 0, and no verification state was fabricated.

## 2026-08-28 — Automatic Node runtime freshness invalidation
- Added `runtime-release-status.json`, generated from the official Node.js distribution index during build/dev preparation. The artifact binds each automatic verification id to the executed runtime version, required major, latest Node LTS version/major, signal timestamp and one of `current`, `recheck-required`, or `unknown`.
- `Postify verified` now requires both a successful deterministic execution and a `current` runtime release signal. Newer Node LTS patch/major releases withhold the badge as `recheck-required`; source outage/contradiction withholds it as freshness `unknown`. Historical code/hash/output/runtime proof remains visible instead of being deleted.
- Discovery filtering/ranking no longer upgrades an article to `postify-verified` when runtime freshness is stale or unknown. Article and compact badge UI explain re-check/unknown states instead of presenting a stale green claim.
- Production/fallback machine-readable knowledge artifacts now carry the same runtime-release signal as the UI. Build smoke and production smoke verify that the signal is structurally valid and bound to the exact execution runtime/major.
- Added a daily main CI schedule so runtime freshness and dependency-security gates refresh production even with no source-code push. Clients also expire runtime signals after 36 hours, so repeated schedule/deploy failures cannot leave a stale `current` badge indefinitely.
- Corrected stale `llms.txt` trust copy: Postify Verified is real checked-in deterministic execution with runtime freshness, explicitly not an arbitrary-code sandbox. Authenticated community confirmations vs anonymous device-local feedback and the 3-confirmation rate threshold are now described accurately; machine-readable trust artifact pointers were added.
- Runtime refresh emits GitHub Actions warnings for `recheck-required`/`unknown` without failing the deploy, so production can actually publish the downgraded trust state while maintainers still see the upgrade signal.
- Runtime signal tests cover exact-current LTS, newer patch, newer LTS major and unknown/fail-closed states. Independent fail-soft probe PASS when the Node release source is unreachable; independent live probe PASS as `current / v24.20.0 / Krypton` on 2026-08-28.
- Final exact-worktree gates PASS: Node 24.20.0 clean install + npm audit 0 + release-security parity + 23 Vitest files / 94 tests + lint/build/smoke; runtime artifact `current / v24.20.0 / maxAge=36h`; official Playwright 1.57 Chromium 23/23 PASS. The Playwright image executes on Node v24.11.1 and correctly emits `recheck-required -> v24.20.0`, proving the stale-runtime path without weakening browser coverage. Entry bundle remained ~303.4 KB under the 320 KB budget.

## 2026-08-28 — Publication/evidence readiness contract
- Split the editor's old single readiness percentage into three explicit surfaces: real publication eligibility, evidence claim status, and recommended quality signals.
- Publication readiness now mirrors the actual core submit rule: a valid trimmed title and minimum trimmed body. Missing outcome/evidence metadata no longer falsely marks an otherwise publishable post as blocked.
- The editor previews the exact persisted evidence claim: `Unverified` unless a non-future test date, meaningful environment entry, and meaningful verification step are present; then and only then it becomes `Author tested`. The payload uses the same helper instead of duplicating evidence-level logic.
- Meaningful evidence thresholds are fail-closed: environment requires at least one 3+ character trimmed entry; verification requires at least one 12+ character trimmed step. The author dashboard's re-verify action uses the same helper.
- Fixed date semantics: the date picker disallows future dates and test dates are persisted at the browser-local start of the selected day instead of fixed UTC noon, avoiding morning same-day writes being rejected as future timestamps.
- Removed misleading author copy that called every edited post “verified” or described structured-evidence persistence as “verified publishing.”
- Applied production migration `20260828185717_strengthen_author_tested_evidence.sql`. The DB integrity trigger and `reverify_post` now enforce the same meaningful evidence thresholds across non-UI write paths and reject weak re-verification before revision capture.
- Production preflight had 9 `unverified` posts and 0 `author-tested`, so the stricter trigger invalidated no existing production evidence. Production weak-environment/weak-verification smoke rejected both attempts and left the canonical Node post unchanged as `unverified` with `tested_at=null`.
- Exact local gates PASS: focused readiness tests 12/12 + lint; fresh PostgreSQL 16 full migration/RLS chain PASS; Node 24.20.0 clean install + npm audit 0 + release-security + full verify PASS; official Playwright 1.57 Chromium 23/23 PASS.
- Supabase advisor after apply: security ERROR 0; only the pre-existing leaked-password-protection WARN remains. Performance remains INFO-only unused-index observations.
- Modernized `project-context.md` and README so future loops and repository visitors no longer see stale “Supabase deferred / Node 20 / generic blog” assumptions.

## 2026-08-28 — UI V3 discovery masthead
- Started a dedicated `chatgpt/postify-ui-v3` branch so the redesign does not mix with the evidence-readiness release work.
- Installed Graphify repo-scoped and added a Postify UI Review skill that requires impact analysis, real-browser desktop/mobile inspection, accessibility checks, and rejects effect-first/template styling as a completion criterion.
- Reworked the first discovery viewport around an editorial knowledge-index hierarchy: calmer sticky header, masthead-scale value proposition, compact search/actions, featured knowledge presentation, restrained topic navigation, and a clearer segmented discovery filter.
- Removed one remaining app-shell decorative shadow and reduced competing visual weight instead of layering more effects onto the existing UI.
- Rebuilt the focused `src/` Graphify map after the change: 590 nodes / 1,273 edges / 32 communities.
- Exact UI V3 slice gates PASS: Node 24.20.0 23 Vitest files / 105 tests, lint, Vite production build (~303.7 KB main entry), and official Playwright 1.57 Chromium UI suite 24/24, including a new mobile feed-overflow regression check. Real 1440px and 390px home screenshots were reviewed; no horizontal overflow or blocking hierarchy defect was found.

## 2026-08-28 — UI V3 discovery feed
- Reworked the live `EditorialFeed` surface from image-led blog cards into a denser knowledge index: priority lead record, numbered rows, quieter thumbnails, compact actions and evidence-first metadata.
- Feed metadata now derives reading minutes through the shared presentation helper, so legacy posts without explicit `readingTime` no longer surface an undefined duration.
- Preserved category, format, freshness/evidence badge, community confirmation and bookmark behavior while reducing decorative card chrome and oversized imagery.
- Responsive QA: mobile document width is exact 390/390; each new feed article is 358/358 with no card overflow. The filter strip remains intentionally horizontally scrollable edge-to-edge.
- Validation PASS: 23 Vitest files / 105 tests, lint, production Vite build, and official Playwright 1.57 Chromium UI suite 24/24, including a new mobile feed-overflow regression check.

## 2026-08-28 — UI V3 article reader dossier
- Rebuilt the article detail surface as a quieter reader dossier instead of a stacked magazine/card composition: tighter title scale, compact author/meta, compressed quick brief, shallower cover, denser outline, sans-serif long-form body and flatter discussion/adjacent navigation.
- Surfaced the evidence/freshness badge in the article header before the H1 so readers can see the trust state before committing to the guidance; the full evidence panel and runbook remain intact below.
- Article reading time now uses the shared `getPostReadingMinutes` fallback, preventing legacy rows without explicit metadata from rendering an undefined duration in the rail or quick brief.
- Removed the legacy drop-cap and collapsed the accumulated V1/V2 CSS override layers into one coherent V3 stylesheet; every JSX CSS-module reference has a matching selector.
- Responsive QA: desktop article width is 820px; mobile article is 358px inside a 390px document with exact 390/390 document width. Trust metadata remains above the H1 and the mobile cover resolves to 16:9.
- Validation PASS: 23 Vitest files / 105 tests, lint, production Vite build, and official Playwright 1.57 Chromium UI suite 25/25 including trust-before-reading, mobile overflow and duration-fallback regression coverage.

## 2026-08-28 — UI V3 focused writing workspace
- Reordered Create/Edit around the author’s real task flow: choose a practical format, write the title/body first, then attach evidence. Evidence metadata no longer blocks the first writing interaction visually.
- Rebuilt the desktop editor as a wide writing column plus a calm sticky publication/trust inspector. Tablet and mobile collapse to one column with the readiness inspector before the writing fields, preserving context without horizontal overflow.
- Flattened the RichTextEditor chrome to match V3: restrained toolbar, editorial content surface, quieter focus states, technical-code treatment and no gradient/card-heavy shell.
- Browser QA used an isolated local-only route bypass that was reverted before validation/commit. Measured exact document widths at 1440/1440, 820/820 and 390/390 with zero page errors; body editor appears before evidence fields and the desktop inspector is genuinely sticky.
- QA exposed an existing Tiptap mount race: AI ghost-keyboard setup accessed `editor.view.dom` before EditorContent had mounted. The binding now targets the mounted `.ProseMirror` node through the editor wrapper and safely skips the effect until it exists.
- Added a dedicated RichTextEditor regression test proving the editor mounts safely while AI ghost completion is enabled.
- Final exact-worktree gates PASS: 24 Vitest files / 106 tests, lint, production Vite build (main entry 303,604 bytes), and official Playwright 1.57 Chromium public UI suite 25/25.

## 2026-08-28 — UI V3 knowledge health console
- Rebuilt Knowledge Dashboard from a compressed admin-style list into a product-facing knowledge health console with a clear maintenance model: authored knowledge, needs-attention count, author-tested count and aggregate community signals.
- Added an explicit top-demand signal, re-verification queue, domain credibility track record and knowledge-gap demand map while preserving all existing author-only failure detail and re-verification behavior.
- Freshness states now use readable localized labels instead of exposing raw state tokens as the main UI copy; stale/unknown records are visually separated from current guidance without inventing a health score.
- Browser QA used a local-only protected-route bypass plus a mocked ready backend status and was fully reverted before commit. Responsive document widths were exact at 1440/1440, 820/820 and 390/390 with four core dashboard sections and zero page errors.
- Validation PASS: 24 Vitest files / 106 tests, lint, production Vite compile/PWA generation, and responsive browser structure QA.

## 2026-08-28 — UI V3 account knowledge surfaces
- Rebuilt Bookmarks as a personal knowledge shelf instead of a decorative card grid. Saved records now expose evidence state, format, reading cost, freshness/date context, outcome/summary and author linkage in a dense numbered index.
- Rebuilt public author pages as knowledge portfolios: removed banner/pattern/active-publisher decoration, surfaced published-record count, real derived reading minutes and author-tested record count, and reused the live V3 EditorialFeed for the author’s work.
- Rebuilt Profile as a focused account workspace with a calm identity header, flat editable fields and compact account metadata; removed the unused legacy danger/stats/gradient-card CSS layers entirely.
- Added Profile component regression coverage for both read and edit modes and added a public-author mobile E2E overflow/knowledge-portfolio contract.
- Populated Bookmarks browser QA used local-only Redux-persist seeding plus a temporary protected-route bypass; the bypass was reverted before release validation. Desktop/mobile document widths were exact at 1440/1440 and 390/390 with evidence/type/read-cost visible and no page errors.
- Public author browser QA passed at 1440/1440 and 390/390 with nine fallback knowledge records and zero page errors.
- Final release gates PASS: 25 Vitest files / 107 tests, lint, production Vite/PWA build (main entry 303,604 bytes), and official Chromium UI suite 26/26.

## 2026-08-28 — UI V3 auth surfaces and complete password recovery
- Rebuilt Login and Register from legacy glass/gradient cards into the V3 knowledge-account system: a product-context column explains why an account matters while the access form stays restrained and task-focused; mobile collapses to one clean column.
- Removed the old duplicated auth CSS override layers, colored glow shadows and glassmorphism. Both auth stylesheets now have exact JSX selector coverage with no unused page selectors.
- Found a real broken recovery chain during the visual audit: Login linked to `/auth/forgot-password`, and Supabase reset emails redirected to `/auth/reset-password`, but neither route existed. Added both public routes and a shared PasswordRecoveryPage that uses the existing `useAuth.resetPassword` and `useAuth.updatePassword` flows.
- Added localized recovery failure/success keys that were already referenced by the auth hook but missing from i18n.
- Added direct unit coverage for requesting a recovery email and completing a matching-password reset, plus a mobile Chromium contract proving both recovery routes render and do not overflow.
- Real browser QA on Login, Register, Forgot Password and Reset Password passed at 1440/1440 and 390/390 document widths with zero page errors.
- Final release gates PASS: 26 Vitest files / 109 tests, lint, production Vite/PWA build (main entry 304,189 bytes), and official Chromium UI suite 27/27.

## 2026-08-28 — UI V3 global knowledge navigation
- Rebuilt the global Footer as a single V3 knowledge-system surface instead of the legacy footer plus V2 override stack. The footer now makes Postify’s trust model explicit through Evidence, Freshness and Reproducibility and routes users back into knowledge discovery/authoring.
- Replaced pill-style category chrome with a numbered Topic Index rail that exposes the active topic, preserves URL-addressable category state and remains horizontally contained on mobile.
- Removed unused giant-footer banner styling and updated the footer product description so global chrome describes practical knowledge with evidence, freshness and execution context rather than generic editorial notes.
- Browser QA found and corrected an ARIA regression before release: custom `listitem` roles were removed so topic controls retain their native button semantics. Real-data QA confirmed 10 topic controls, state change to `Yapay zekâ`, URL synchronization, zero horizontal overflow and zero page errors at 390px.
- Tightened the mobile footer after browser measurement, reducing its rendered height from 1,273px to 1,057px while keeping the two content indexes readable and preserving exact 390/390 document width.
- Stabilized the password-recovery regression by waiting for the post-mutation React success render rather than only the mocked auth call; focused recovery coverage remains 2/2.
- Final exact-worktree gates PASS: 26 Vitest files / 109 tests, source-only lint, production Vite/PWA build (main entry 305,219 bytes), and official Playwright 1.57 Chromium UI suite 29/29 including new Topic Index state and global Footer trust/mobile contracts.

## 2026-08-28 — UI V3 public system pages
- Rebuilt About as a product-contract page centered on Outcome, Evidence, Freshness and Reproducibility instead of a generic portfolio/about layout. The page now explains what Postify is optimizing for and how Guide / Decision / Explainer / Field Note formats map to practical work.
- Fixed a real navigation defect exposed by the redesign: the About authoring CTA pointed to nonexistent `/create`; it now targets the protected real route `/posts/create`.
- Rebuilt Contact as a correction-first public channel index. The page now prioritizes corrections, useful topic proposals and evidence-backed collaboration rather than generic contact-card decoration.
- Replaced the legacy 264-line animated/glowing 404 stack plus appended V2 override with one quiet V3 index-miss recovery surface and three format-aware recovery links. No gradient, blur, animation or box-shadow debt remains in the three public-system stylesheets.
- Updated stale Playwright contracts to the new public-system language and scoped the 404 primary CTA assertion to its own recovery surface so the identical global Footer CTA cannot create strict-mode ambiguity.
- Browser QA: About, Contact and 404 render without page errors at 1440px and 390px; mobile document width stays exact at 390/390. About exposes the real `/posts/create` href, Contact exposes correction/direct-channel rows, and 404 exposes its recovery index.
- Final exact-worktree gates PASS: 26 Vitest files / 109 tests, lint, production Vite/PWA build (main entry 305,219 bytes), focused public-system Chromium 3/3, and full Chromium UI suite 29/29.

## 2026-08-28 — UI V3 dead decorative island cleanup
- Audited the remaining V1/V2 decorative component island by exact module-path import/re-export usage before deleting anything. BackgroundPaths, BentoGrid and its card variants, CustomCursor, GlowingCard, GradientBackground, MarqueeBanner, ParallaxImage, ScrollReveal, ShimmerButton, TextReveal, the old PostCard, its private Button/BookmarkButton chain, the standalone Skeleton component and the unused design-testimonial had no live production consumers.
- Removed 44 dead files / 2,724 lines. The old PostCard's 9 tests were removed with the component; the suite therefore moves from 109 to 100 live tests without losing coverage of production-reachable code. EditorialFeed's current bookmark control is a separate local implementation and remains intact.
- Post-delete dangling-import scan returned zero matches. 25 Vitest files / 100 live tests PASS, lint PASS, and production build PASS. The main entry remains exactly 305,219 bytes, confirming this island was not in the shipped dependency graph. Full Chromium UI suite also PASS at 29/29 after deletion, confirming the reachable browser flows are unchanged.

## 2026-08-29 — UI V3 evidence-aware knowledge card hierarchy
- Added one live `KnowledgeCard` primitive with explicit `featured`, `standard`, and `compact` variants instead of reviving the deleted Bento/V1 card stack. `EditorialFeed` now only orchestrates hierarchy: the first record is featured, the next three are standard, and later records become compact.
- Made the product contract scannable inside every live card: format/category/date metadata stays above the title, featured/standard cards expose an explicit Outcome, and the trust strip separates Evidence, Freshness, reading cost, execution/context environment, and community confirmation when available. Compact records reduce image/outcome density but keep evidence and freshness visible.
- Added direct component coverage for the 1 featured / 3 standard / remaining compact distribution plus Outcome / Evidence / Freshness / bookmark behavior. The live unit suite is now 26 Vitest files / 102 tests.
- Browser QA caught an internal desktop overflow that document-level checks would have missed: image `aspect-ratio` was forcing the featured/standard grid track beyond the card width. Constraining the image track with `minmax(0, 31%)`, `min-width: 0`, and `width: 100%` reduced max card overflow from 164px to 0.
- Real-data QA at 1440px and 390px confirmed 1 featured / 3 standard / 4 compact records, document overflow 0, max card overflow 0, max trust-strip overflow 0, and zero page errors.
- Final exact-worktree gates PASS: 26 Vitest files / 102 tests, lint, production Vite/PWA build (main entry 305,818 bytes), focused card Chromium 1/1, recovery stability 5/5 after generated-artifact cleanup, and full Chromium UI suite 29/29 with retries disabled.

## 2026-08-29 — UI V3 deterministic screenshot-diff baselines
- Added a dedicated Playwright visual-regression configuration and six committed baselines covering Home, Article, and Editor at 1440px desktop and 390px mobile. The snapshot set is 2.7 MB total and captures the route-specific main surface rather than relying on failure-only screenshots.
- Made public baselines deterministic by starting the visual Vite server with Supabase environment variables explicitly unset, pinning language/theme to English/light, freezing browser time to 2026-08-29, disabling animations/transitions/carets, and waiting for fonts before capture. Home and Article therefore use the committed fallback knowledge catalogue rather than changing production records.
- Kept production authentication untouched. Editor visual coverage uses an `e2e/visual` harness that renders the real `CreatePostPage` with the real Redux and React Query providers, plus a fixed local draft that exercises writing, evidence, and readiness surfaces. No ProtectedRoute or auth bypass was added to shipped source.
- First baseline generation PASS 6/6; immediate comparison-only rerun PASS 6/6 without updating snapshots, proving deterministic output on the same Playwright 1.57 Chromium runtime.
- Production quality gates remain clean: 26 Vitest files / 102 tests PASS, lint PASS, production Vite/PWA build PASS, and the main entry remains exactly 305,818 bytes. The visual harness/config is test-only and does not enter the production dependency graph.

## 2026-08-29 — UI V3 visual regression promoted to release gate
- Promoted the deterministic six-snapshot Home / Article / Editor suite from a local QA tool into the `ui-e2e` GitHub Actions gate. CI runs it on a dedicated port after the functional Chromium suite and before the deploy job can become eligible.
- Removed the stale known issue claiming pixel baselines were not committed. The baseline set is committed, compare-only rerun is 6/6 PASS, lint PASS, and the production build remains 305,818 bytes.
- Visual CI uses the pinned Playwright 1.57 Chromium image already used by product E2E, with fixed language/theme/time and fallback public content, so release failures should represent real visual drift rather than changing production data.

## 2026-08-29 — Authenticated desktop account access restored
- Fixed a real post-login desktop navigation gap reported from production: authenticated users could create content and see bookmarks, but the desktop Header exposed neither the account/profile surface nor a logout action. Those controls previously existed only inside the mobile sheet.
- Added a compact authenticated account trigger that shows the user identity and opens a focused menu with Profile, Knowledge health, optional Admin, and Logout. The menu closes on route changes, outside pointer interaction, and Escape; narrower desktop widths collapse the trigger to its avatar without removing access.
- Added direct Header regression coverage for authenticated account visibility, profile/knowledge routes, logout dispatch, Escape dismissal, and signed-out absence.
- Added a test-only authenticated Header visual harness and committed desktop screenshot baseline so future visual regressions cannot silently remove the account affordance again.
- Final exact-worktree gates PASS: 27 Vitest files / 105 tests, lint, production Vite/PWA build (main entry 307,812 bytes, under the 320 KB budget), functional Chromium 29/29, and deterministic visual regression 7/7.

## 2026-08-29 — Profile dashboard redesign
- Rebuilt `/profile` from a sparse identity page into a dense account/creator dashboard based on the approved visual direction.
- Added balanced identity + account-actions hero, real membership/role/post/bookmark stats, account summary, content production, saved knowledge, knowledge-health cards, and quick-access workspace links.
- Kept all actions wired to existing real routes/data (`/users/:id`, `/posts/create`, `/bookmarks`, `/knowledge`) instead of inventing settings/draft surfaces that do not exist.
- Preserved the existing profile edit/avatar workflow inside a focused expandable editor panel and added a direct logout action.
- Added authenticated profile visual harness + desktop/mobile deterministic screenshot baselines and horizontal-overflow assertions.
- QA: 27 test files / 106 unit tests PASS, lint PASS, production build PASS (main entry 307,812 bytes), Chromium functional 29/29 PASS, visual regression 9/9 PASS.
- Browser layout measurement: desktop main profile content 922px high with 2-column hero + 4-column dashboard; tablet dashboard 2-column; mobile single-column; document overflow 0 at 1440/820/390 widths.

## 2026-08-29 — browser-led route audit and account/admin polish
- Ran a real Chromium route audit across Home, Login, Register, Forgot/Reset password, About, Contact, 404 recovery, Article and public Author at 1440px, 820px and 390px. The audit checked document overflow, section spacing, H1 scale, broken images, console/page errors and fixed/sticky chrome. No page-level overflow or broken-image regression was found.
- Normalized the most over-scaled public editorial surfaces after the browser pass: About, Contact and public Author now use a tighter desktop type/spacing scale while preserving the existing mobile hierarchy. Added committed desktop/mobile visual baselines for all three.
- Rebuilt the remaining legacy Admin visual layer as a single V3 operations console: removed the old shadow/indigo card stack plus appended V2 overrides, added contained mobile table wrappers, clearer tab semantics and a denser stats/recency layout.
- Fixed three Admin data-contract defects discovered during UI inspection: dashboard admin/moderator/recent-user fields are now actually returned; flat profile fields are rendered correctly instead of nonexistent `user_metadata`; moderation rows now resolve author profiles instead of falling back to `Anonim` for known authors.
- Removed the misleading user-delete affordance because the current service intentionally rejects client-side account deletion; the UI now states that a secure server-side Admin API is required instead of presenting a destructive control that can never succeed.
- Aligned Bookmarks and Knowledge Health with the denser Profile account-workspace scale and added deterministic populated-state visual harnesses for both. Knowledge Health gained test-only data overrides so the real component can be rendered in Chromium without weakening production auth or depending on live database content.
- Expanded deterministic visual regression from 9 to 22 browser contracts: Home/Article/Editor, authenticated Header/Profile, About/Contact/Author, Admin desktop/mobile + mobile table containment, populated Bookmarks and Knowledge Health.
- Final exact-worktree gates PASS: 28 Vitest files / 108 tests, lint, production Vite/PWA build (main entry 307,812 bytes), functional Chromium 29/29 and visual regression 22/22.
- CI caught one deterministic-visual weakness before deploy: the public Author mobile test was capturing the entire ~3.5k-pixel async feed and could vary in total height during settling. The contract now screenshots the fixed first viewport after waiting for the first knowledge record, preserving the visible author/header/feed hierarchy while removing irrelevant full-page height jitter. The updated Author baseline passed three consecutive compare-only runs and the full 22-test visual suite.
