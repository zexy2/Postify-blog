# Postify Decisions

## 2026-08-28 — Reposition away from generic blogging
**Decision:** Postify will target practical knowledge for builders, not compete head-on as a general-purpose Medium clone.

**Why:** Established platforms already have strong network effects, monetization, discovery, newsletters, or technical-blog ownership. Replicating their feature lists does not create a reason to switch.

## 2026-08-28 — Frontend-first validation before Supabase redesign
**Decision:** New content types and trust/utility presentation are introduced with graceful client-side derivation first. Supabase schema work is postponed.

**Why:** The product model should be validated before database migrations and auth/content-policy work create switching cost.

## 2026-08-28 — Quiet utility over decorative trend UI
**Decision:** Remove marquee/glow-heavy presentation from the core reading/discovery path. Use restrained surfaces, strong typography, clear metadata and one accent color.

## 2026-08-28 — “Last edited/reviewed” instead of “verified” by default
**Decision:** We will not display “verified” unless a future workflow provides evidence. Existing dates can support neutral freshness language only.

## 2026-08-28 — Production deploy authorization
- User explicitly authorized production deploys during the overnight Postify development loop.
- Rule: deploy only after relevant quality gates pass (lint/build/tests/smoke as available), then verify production health.
- Supabase production connection/migrations remain deferred unless separately justified and authorized.


## 2026-08-28 — Author guidance before schema migration
**Decision:** Writing modes are editorial guidance only for now; they do not write a new `contentType` column to Supabase.

**Why:** Authors get immediate value while existing production rows and database contracts remain untouched. A later schema migration can persist explicit metadata once the product model proves useful.

## 2026-08-28 — Local-first draft resilience
**Decision:** New-post drafts are autosaved in browser storage, scoped by user and language, until publishing or an explicitly confirmed cancel.

**Why:** Draft safety is high author value and does not require backend/schema changes.

## 2026-08-28 — One release command
**Decision:** `npm run verify` is the release gate: tests → lint → production build → artifact smoke.

**Why:** A deploy should be evidence-driven and repeatable rather than depend on remembering separate commands.


## 2026-08-28 — Do not reroute production hosting just to bypass deploy credentials
**Decision:** Keep the healthy GitHub Pages production path in place when deployment credentials are unavailable; do not repoint DNS to Oracle as an ad-hoc workaround.

**Why:** Hosting migration changes DNS, TLS, caching, rollback and operational behavior. It is disproportionate to a credential-path failure and would introduce production risk unrelated to product quality.


## 2026-08-28 — Guidance must be explicit, not generative by default
**Decision:** Author tooling may provide structure, readiness checks, and measurable writing metrics without inventing prose. Starter outlines contain headings/prompts only.

**Why:** Postify's product promise depends on useful, trustworthy knowledge. Fabricated detail would weaken that promise before provenance and verification workflows exist.

## 2026-08-28 — Surface only evidence already present in an article
**Decision:** The reader trust layer may show external references only when URLs are actually present in the article body. No synthetic source lists or “verified” badges are generated.

## 2026-08-28 — Discovery should optimize for intent and time
**Decision:** Keep category search, but add format and quick-read filters so readers can choose by desired outcome and available time.

## 2026-08-28 — Discovery filters are shareable state
**Decision:** Category, content format, and quick-read intent belong in URL query parameters; changing one filter must preserve the others.

**Why:** A useful knowledge discovery view should survive refresh/back navigation and be shareable without introducing backend state.

## 2026-08-28 — Quick-read must not treat missing metadata as zero minutes
**Decision:** Prefer explicit positive `readingTime`; otherwise derive a conservative estimate from available article text. Content with no measurable text does not qualify as a quick read.

**Why:** Missing data is unknown, not evidence of a zero-minute read. This keeps the discovery signal honest while remaining compatible with legacy rows.

## 2026-08-28 — Treat the GitHub Pages SPA fallback as a release artifact
**Decision:** Keep the existing custom-domain `404.html` SPA redirect and verify it during `npm run verify` instead of changing hosting architecture during final validation.

**Why:** It is the repository's established low-risk deep-link mechanism. Hosting/DNS changes would be disproportionate; the release gate should prevent this fallback from silently disappearing or carrying stale product identity.

## 2026-08-28 — UI V2 uses editorial hierarchy over card chrome
**Decision:** Prefer open editorial layouts, visible typography hierarchy, thin separators, and restrained utility controls over gradients, glass, giant decorative typography, and repeated rounded cards.

**Why:** Postify's value is practical knowledge. Visual chrome should help scanning and trust, not compete with the content or resemble a generic SaaS/blog template.

## 2026-08-28 — Browser QA is now a release-quality signal for UI work
**Decision:** Keep a focused Chromium UI smoke (`npm run test:e2e:ui`) alongside the existing unit/lint/build smoke gates for substantial visual changes.

**Why:** CSS regressions such as mobile overflow, broken menu operation, and unreadable article widths are not reliably caught by unit/build checks alone.

## 2026-08-28 — Remove manifesto-first homepage content
**Decision:** Do not place product principles/manifesto between the hero and content discovery on Home.

**Why:** On mobile it consumed most of the first viewport without helping the user find content. Product principles belong in About and should be expressed briefly through the interface itself.

## 2026-08-28 — Verified Knowledge V1 trust boundary
**Decision:** Build the product semantics frontend-first without a production Supabase migration. Author-tested evidence must be explicit; device-local feedback must be labelled local; “Postify verified” is reserved for a future real execution system.

**Why:** The differentiation depends on trust. Fabricating community counts or verification would destroy the product promise, while a structured frontend model lets us validate the UX before committing to a production schema and abuse/security model.

## 2026-08-28 — Verified Knowledge full trust model
**Decision:** `Postify verified` is execution-derived, not author-selected. The first supported automatic verification is a checked-in deterministic Node.js snippet executed during the release gate. Community success percentages require at least 3 independent confirmations; domain credibility requires at least 3 author-tested posts and 5 confirmations. Self-confirmation is blocked by RLS.

**Why:** The product differentiator is evidence quality. Small-sample percentages, self-confirmation, or a manually selectable Postify badge would create false certainty.

## 2026-08-28 — Capability-gate persistent evidence until the production schema exists
**Decision:** Ship `knowledge-backend-status.json` as an explicit deploy capability contract. New evidence tables/RPCs are queried only when the deployed artifact says the production schema is ready; otherwise reading remains backward-compatible and contribution/shelf/gap actions stay local.

**Why:** A frontend release must remain compatible with the old production schema while owner-level migration access is pending. Treating schema presence as an explicit capability avoids noisy 4xx calls, accidental fallback of public content, and misleading persistence claims.

## 2026-08-28 — Raw community evidence and revision snapshots are private
**Decision:** Public surfaces expose aggregate failure counts and sanitized revision reason/date history only. Raw confirmation identity, free-text notes, environment strings, and revision snapshots are not public. Authenticated users can read only their own raw confirmation; raw revision snapshots are author/admin only.

**Why:** Verification value does not require publishing contributor identity or potentially sensitive free text. Privacy-safe aggregates preserve the product signal without turning evidence collection into a data-leak surface.

## 2026-08-28 — Automatic verification is outside author-writable post status
**Decision:** Production `posts.evidence_status` permits only `unverified` and `author-tested`. `Postify verified` is derived from a successful release execution artifact, not a database value authors can select.

**Why:** The strongest trust badge must be mechanically earned. Keeping it outside author-writable metadata prevents accidental or malicious false verification.

## 2026-08-28 — Performance budgets are release gates
**Decision:** Keep command search, mobile Radix sheet and knowledge services behind lazy boundaries, remove the AI barrel import from the eager Redux path, and fail build smoke if the production entry exceeds 320 KB minified or non-critical editor/motion/sheet/knowledge chunks are eagerly preloaded.

**Why:** Postify's utility begins with fast discovery. Measured optimization reduced the main entry from about 338.6 KB to about 294 KB; a budget prevents future import regressions from silently undoing the gain.

## 2026-08-28 — Failure detail is useful to authors, private from the public
**Decision:** Public pages expose only failure count/latest time. The author/admin may request identity-free environment/note/date details through an ownership-checked RPC; contributor IDs are never returned by that RPC.

**Why:** Failure reports are only actionable if the maintainer can diagnose them, but public or author-facing identity exposure is not required for that utility.

## 2026-08-28 — Production success must prove the exact source SHA is live
**Decision:** Every main deploy stamps `release.json`. The production smoke job waits until the custom domain reports the current `github.sha`, then probes critical artifacts and runs Chromium against production.

**Why:** A green build/deploy action does not prove the CDN/custom domain is serving that commit. SHA-level attestation prevents stale-production false positives and gives the release pipeline an observable completion condition.

## 2026-08-28 — Capability must select the read contract before the request
**Decision:** When `knowledge-backend-status.json` reports `ready:false`, public post reads use the legacy column projection immediately rather than intentionally probing additive evidence columns and recovering from a 400.

**Why:** Backward compatibility should be quiet and deterministic. Expected failing requests pollute observability, mask real network failures, and make production browser smoke less trustworthy.

## 2026-08-28 — Treat only the GitHub Pages initial deep-link document 404 as expected
**Decision:** Production browser smoke may ignore the initial document-level 404 for a known SPA deep link that GitHub Pages routes through `404.html`; all API, fetch, script, style, image, and other unexpected 4xx/5xx responses remain failures.

**Why:** This preserves truthful monitoring without weakening the signal for real application/network regressions.

## 2026-08-28 — Verification steps are an executable reading contract
**Decision:** Render structured `verificationSteps` as an interactive Action Runbook. Progress is personal/device-local and scoped to the article's evidence version.

**Why:** The product should help a reader perform and verify an outcome, not merely display evidence metadata. Version-scoped progress prevents a reader from carrying a completed checklist across materially changed evidence.

## 2026-08-28 — Completing a runbook is not verification
**Decision:** A completed Action Runbook never grants `Postify verified`, `Author tested`, or community confirmation. It only offers the reader a direct path to report Worked/Didn't Work.

**Why:** Personal task completion is not independent proof. Keeping those trust states separate preserves the evidence model while still making content actionable.

## 2026-08-28 — Never send slugs through UUID post lookup
**Decision:** After a slug lookup misses, query `posts.id` only when the identifier is a syntactically valid UUID.

**Why:** Postgres/Supabase correctly rejects a non-UUID string against a UUID column with HTTP 400. Fallback/local catalogue slugs are normal product identifiers, so the client should not create a predictable backend error before falling back.

## 2026-08-28 — Production migration requires an explicit manual owner gate
**Decision:** Keep production Supabase migration in a `workflow_dispatch`-only workflow pinned to the exact production project ref and Supabase CLI version. Always inspect remote migration history and run `db push --dry-run` first. Never use `--include-all` or migration-history repair automatically. Real apply additionally requires the exact `APPLY_<project-ref>` confirmation.

**Why:** Production schema access is privileged and remote migration history may differ from the repository. An automated guess could apply legacy migrations or repair history incorrectly. The safest automation is deterministic everywhere except the explicit owner-authorized apply boundary.

## 2026-08-28 — User-controlled outbound URLs are protocol-allowlisted
**Decision:** Any user-controlled public outbound URL must pass a shared absolute `http:`/`https:` allowlist before persistence or clickable rendering. Invalid legacy values remain non-clickable.

**Why:** HTML `type=url` is not a security boundary and programmatic save flows can bypass native form validation. Centralizing the protocol boundary reduces stored-link/script-scheme risk without requiring a Supabase migration.

## 2026-08-28 — Displayed automatic-verification code must equal executed code
**Decision:** Automatically verified examples use the verification manifest as the single source for the code shown in the article and the code executed by the release gate. A mismatch fails verification.

**Why:** A green badge is meaningless if the reader sees different code from what the verifier executed. The verification artifact now carries actual runtime/output plus a code hash so provenance is inspectable.

## 2026-08-28 — Checked-in execution policy is not called a sandbox
**Decision:** The first automatic verifier is described as policy-limited checked-in Node execution, not isolated/sandboxed execution. The release gate statically rejects unsupported package/network/filesystem/process capabilities and applies code-size, output and timeout limits.

**Why:** Trust copy must reflect the real security boundary. Arbitrary or untrusted user code remains unsupported until OS/container-level isolation is deliberately designed.

## 2026-08-28 — Automatic verification requires a reproducible command/output artifact
**Decision:** A passed automatic verification must ship the exact executed `.mjs` artifact, its SHA-256, a local reproduction command, expected stdout and actual CI stdout. The release runner executes the generated artifact file rather than a separate eval-only copy.

**Why:** “Postify Verified” is only useful if a reader can inspect and reproduce the same contract. Binding the displayed code, downloadable artifact, command and output closes another trust gap between documentation and execution.
## 2026-08-28 — Production Supabase history follows the authenticated management apply
**Decision:** After authenticated management access became available, apply the reviewed migration chain in repository order, then rename the repository migration files to the exact versions recorded by production. Do not use migration-history repair.

**Why:** The production project had the base schema but an empty migration ledger. Applying the idempotent reviewed chain after a live-schema/data preflight created an auditable ledger; aligning filenames prevents future CLI runs from misclassifying already-applied migrations.

## 2026-08-28 — Public evidence views must not run as exposed SECURITY DEFINER views
**Decision:** Public evidence/revision views use `security_invoker=true` and call narrow SECURITY DEFINER row producers in a non-exposed `private` schema. Anonymous EXECUTE is revoked from public RPCs; authenticated access remains only where the product requires it and the function performs explicit ownership/auth checks.

**Why:** The Supabase security advisor correctly flagged exposed definer views and anonymous definer RPC execution. Safe aggregate output still needs privileged reads of private raw evidence, so the privilege boundary belongs behind a narrow non-exposed helper rather than on the public view itself.
## 2026-08-28 — Automatic verification binds to displayed code, not a slug or database flag
**Decision:** A production article receives an automatic verification binding only when its immutable manifest slug matches and a displayed fenced code block exactly matches the checked-in code that the release verifier executed. The database remains limited to `unverified` / `author-tested`; it never stores `postify-verified`.

**Why:** A slug match or author-writable row is not proof. Exact displayed-code matching makes content drift fail closed: if the production article changes without a corresponding checked-in verifier change and passing release artifact, the automatic badge disappears.

## 2026-08-28 — Production knowledge export is authoritative after a successful backend read
**Decision:** Once the production Supabase schema is confirmed available, the deploy exporter replaces the generated `docs/knowledge` directory instead of overlaying database artifacts onto build-time fallback artifacts. Schema-pending deploys still retain the fallback set.

**Why:** Overlay semantics allowed a fallback-only article to survive as a stale machine-readable production artifact even when no canonical database row existed. Replacing the directory after a successful production read prevents fallback content from masquerading as durable production knowledge.

## 2026-08-28 — Exposed authenticated RPCs stay SECURITY INVOKER
**Decision:** PostgREST-exposed authenticated RPCs must not be SECURITY DEFINER when a narrow non-exposed helper can hold the required privilege. `request_knowledge_gap` and `get_post_failure_details` keep their public signatures as SECURITY INVOKER wrappers and delegate only to authenticated-only helpers in the `private` schema.

**Why:** The product needs privileged aggregate mutation/raw-evidence reads that RLS deliberately prevents directly, but the privilege boundary does not need to be exposed as a definer function. Moving elevation behind a non-exposed helper preserves behavior while reducing the externally callable privileged surface and clearing the Supabase advisor warnings.

## 2026-08-28 — Prefer minimal security lock remediation over broad semver refresh
**Decision:** Dependency security remediation uses non-force `npm audit fix --package-lock-only` passes from the committed lock, preserving `package.json` ranges. A broad `npm update --package-lock-only` candidate that moved 33 direct dependencies was rejected even though its audit was clean.

**Why:** Security work should minimize compatibility surface. The selected lock reaches 0 production / 0 full-tree audit findings while changing only six direct resolutions (`axios`, `react-router-dom`, `uuid`, `vite`, `vitest`, `workbox-window`) and passes the full release + Chromium gates. The rejected 33-direct-dependency refresh reached audit 0 but broke 21/22 Chromium checks, proving that audit cleanliness alone is not a release signal.

## 2026-08-28 — Routine dependency monitoring does not batch security urgency
**Decision:** Dependabot checks npm and GitHub Actions weekly. Routine npm minor/patch version updates are grouped by production/development dependency type, while the config does not group security updates.

**Why:** Grouping normal maintenance reduces PR noise without turning security remediation into a weekly batch. Whether repository-level Dependabot security updates are enabled remains a GitHub setting and is not inferred from the config file alone.

Routine version-update automation is limited to SemVer minor/patch releases. Major upgrades stay manual because they require compatibility review; GitHub documents `allow.update-types` as a version-update restriction, while security updates are still created independently.

## 2026-08-28 — Dependency security is a fail-closed release gate
**Decision:** CI runs `npm run verify:security` immediately after `npm ci` and before normal release verification. The gate requires npm audit to report zero vulnerabilities, requires `@playwright/test` to be exact-pinned, and requires every pinned Playwright CI container to match that package version. Audit outages/non-JSON responses fail the release instead of being treated as clean.

**Why:** A clean lock can regress on a future dependency PR, and Playwright package/browser-image skew can create misleading E2E failures. Keeping online audit out of `npm run verify` preserves deterministic local verification while making the hosted release pipeline fail closed on supply-chain/security drift.

## 2026-08-28 — Automatic verification pins a supported runtime major
**Decision:** The checked-in Node verification contract requires Node major 24 on the LTS channel. Hosted verify/deploy jobs pin Node `24.20.0`, while the verifier fails closed whenever the executing Node major differs from the manifest. Browser E2E may use a different Node 24 patch supplied by the exact-pinned Playwright image.

**Why:** A passing code artifact on an EOL runtime is stale evidence, and exact patch equality across independent CI images is unnecessarily brittle. Major-line enforcement preserves a supported runtime trust boundary while the emitted artifact still records the exact Node patch that actually executed the code.

## 2026-08-28 — Runtime freshness is part of Postify Verified, not advisory decoration
**Decision:** A passed automatic execution receives the current `Postify verified` state only when `runtime-release-status.json` proves that the exact executed Node version is still the latest release on the newest LTS major. A newer LTS patch/major produces `recheck-required`; an unavailable or contradictory release signal produces `unknown`. Both states withhold the current Verified badge but preserve the historical execution contract. The signal is refreshed from Node.js' official `dist/index.json`, main CI is scheduled daily so production can invalidate stale runtime evidence even when source code has not changed, and clients treat any signal older than 36 hours as unknown so a broken refresh loop cannot leave a green badge indefinitely.

**Why:** A historical green execution remains useful provenance, but it is not proof that the same guidance still works on the runtime users should install today. Separating immutable execution history from mutable runtime freshness prevents a stale badge from silently surviving ecosystem changes. Failing closed on signal loss also avoids inventing freshness when the source cannot be checked. Package-level dependency invalidation remains separate work because it requires evidence to declare dependency versions first.

## 2026-08-28 — Publication readiness and evidence claims are separate contracts
**Decision:** The editor must not compress publication eligibility, evidence status, and writing quality into one percentage. Publication readiness mirrors the actual submit boundary (valid title + minimum body). `author-tested` is derived from a separate evidence contract requiring a test date, at least one meaningful environment entry (3+ trimmed characters), and at least one meaningful verification step (12+ trimmed characters). The same thresholds are enforced by the database integrity trigger for every write path. Outcome, scannable structure, and source/caveat coverage remain recommended quality signals and do not silently promote or block the evidence claim.

**Why:** A single readiness score made an unverified post look closer to “verified” merely because it was well structured, while the submit handler and persisted evidence level used different rules. One source of truth for each claim prevents UI/backend drift: authors can publish useful unverified knowledge, but `Yazar test etti / Author tested` requires concrete evidence rather than token placeholders.

## 2026-08-28 — UI V3 prioritizes editorial hierarchy over effect-driven decoration
**Decision:** Postify UI V3 uses an editorial knowledge-index + precise developer-tool direction. Typography, spacing, information hierarchy, evidence/freshness signals, and content discovery take precedence over gradients, glow, glass, custom cursors, marquees, shimmer, decorative motion, or card-on-card presentation. Major visible changes must be inspected in a real browser at desktop and mobile sizes; build success alone is not UI approval.

**Why:** The previous UI could pass functional tests while still feeling like a generic template because too many equally weighted visual treatments competed for attention. The product's differentiation is useful, inspectable knowledge, so the interface should make that information legible and trustworthy rather than advertise its CSS effects.

## 2026-08-28 — Discovery cards behave like a knowledge index, not a magazine grid
**Decision:** The primary discovery feed prioritizes title, outcome, evidence/freshness, format and reading cost over large decorative imagery. Thumbnails are supporting context; numbered rows and compact actions create a scannable knowledge-index rhythm.

**Why:** Postify's product value is reusable, evidence-aware knowledge. A conventional image-first blog/news card system makes that differentiation visually secondary and reduces useful information density, especially on mobile.

## 2026-08-28 — Article trust is visible before long-form reading
**Decision:** Put the compact evidence/freshness state in the article header before the title, while keeping detailed evidence and the runbook in the reading flow. Long-form prose uses the primary sans-serif reading face; magazine-style drop caps and oversized cover/title treatment are removed.

**Why:** Postify asks readers to act on technical guidance, so trust state and reading cost are decision inputs, not post-reading decoration. A quieter dossier hierarchy makes provenance visible early and improves sustained technical reading without duplicating the full evidence explanation.

## 2026-08-28 — Writing comes before evidence metadata
**Decision:** Create/Edit uses a writing-first workspace. Format choice, title and body form the primary authoring column; evidence fields follow the content. Publication/evidence readiness remains continuously visible in a sticky desktop inspector and collapses to a normal contextual block on narrower viewports.

**Why:** Postify should encourage useful writing without presenting evidence metadata as an intimidating prerequisite form. The evidence contract remains strict in code and persistence, but the interface separates writing flow from trust-state inspection so authors understand both without confusing one for the other.

## 2026-08-28 — Tiptap effects must not touch the view before mount
**Decision:** RichTextEditor keyboard bindings resolve the mounted `.ProseMirror` node from the wrapper DOM instead of directly reading Tiptap's throwing `editor.view` getter during passive-effect startup. If the node is not mounted, the effect exits safely.

**Why:** React/Tiptap can expose the editor object one effect tick before the editor view DOM exists. Direct access can crash the entire protected Create/Edit route through the ErrorBoundary even though the editor is otherwise healthy. Binding only to an existing mounted node removes that lifecycle race and now has regression coverage.

## 2026-08-28 — Knowledge Dashboard is a maintenance console, not an analytics dashboard
**Decision:** The author Knowledge Dashboard leads with maintenance state and reader demand: freshness, re-verification, evidence claim, community confirmations, domain credibility and unresolved knowledge gaps. It does not manufacture a single overall “health score.”

**Why:** Postify’s differentiated author workflow is keeping actionable guidance trustworthy over time. A generic analytics dashboard would optimize for vanity metrics; the console should instead tell an author what needs action, why it needs action and where new useful knowledge is demanded.

## 2026-08-28 — Saved items and author identity are knowledge surfaces, not social/decorative cards
**Decision:** Bookmarks use an indexed knowledge-shelf model and public author pages use a knowledge-portfolio model. Profile keeps account editing functional but visually quiet. Evidence state, format, reading cost and published work take priority over ornamental banners, badges and generic profile-card styling.

**Why:** Postify’s product identity is practical, maintained knowledge. Saved content and authors should therefore help users judge what is worth returning to and what an author actually contributes; generic social/profile decoration dilutes that value proposition and adds visual inconsistency.

## 2026-08-28 — Authentication should explain account value, and recovery must be an end-to-end route chain
**Decision:** Login/Register use the same quiet V3 editorial language as the rest of Postify and pair access forms with concise product context. Password recovery is a first-class public flow with both request and reset routes wired to the existing Supabase-backed auth methods.

**Why:** Access screens are part of the product, not a generic SaaS template. More importantly, a visible “forgot password” link is harmful if its route 404s or the recovery email redirects to another missing route. The UI audit should close functional gaps it exposes rather than merely restyle them.

## 2026-08-28 — Global chrome reinforces the knowledge contract
**Decision:** Persistent discovery/footer chrome should explain and navigate Postify as a maintained knowledge system, not as a generic blog sitemap. The footer explicitly carries the Evidence / Freshness / Reproducibility model, while topic discovery uses a numbered index with native button semantics and URL-synchronized active state.

**Why:** Header/footer/topic controls appear across a large share of the product and therefore shape the product identity more than isolated decorative components. Repeating the same trust vocabulary at these boundaries makes the evidence-aware value proposition legible without adding scores, glows or card chrome, while native controls keep the interaction accessible and testable.

## 2026-08-28 — Public system pages should explain, correct and recover
**Decision:** About, Contact and 404 are product-system surfaces rather than decorative marketing pages. About explains the inspectable knowledge contract; Contact treats reader corrections as a first-class maintenance input; 404 turns a navigation miss into a compact recovery index.

**Why:** These routes often appear at moments where a visitor is deciding whether to trust the product, challenge information, or recover from a dead path. Generic portfolio cards, animated error decoration and broken authoring links weaken that trust. A quiet indexed structure makes the same V3 product language legible outside the core feed/article/editor flow.

## 2026-08-28 — Delete unreachable UI systems instead of redesigning them
**Decision:** A legacy component with no production import/re-export path should be removed with its private tests and helper chain rather than visually modernized for V3.

**Why:** Redesigning unreachable components creates maintenance work without changing the product. Exact path audits plus unit/lint/build/browser gates provide stronger evidence than leaving speculative components around “just in case.” Test totals may decrease when tests cover only deleted unreachable code; that is not a production coverage regression.

## 2026-08-29 — Discovery density is encoded as one knowledge-card system
**Decision:** Discovery uses a single evidence-aware `KnowledgeCard` primitive with `featured`, `standard`, and `compact` variants. The variants change visual density, imagery, and outcome prominence, but they preserve the same trust vocabulary and interaction model.

**Why:** Separate page-specific card implementations drift into inconsistent metadata, duplicated bookmark behavior, and decorative hierarchy. One primitive makes the information architecture testable: prominence may decrease down the feed, but evidence and freshness cannot disappear simply because a record becomes compact.

## 2026-08-29 — Visual regression uses frozen public data and a test-only editor harness
**Decision:** Screenshot-diff coverage is maintained in a separate Playwright visual suite with committed Chromium baselines for Home, Article, and Editor at desktop/mobile widths, and that suite is release-blocking inside the Chromium CI job. Public captures force fallback content and fixed time/theme/language; Editor is rendered through an `e2e/visual` provider harness instead of weakening production auth.

**Why:** A visual baseline is useful only when content, dates, theme, and motion are deterministic. Live Supabase content would create false diffs, while a production auth bypass would create a real security/maintenance liability just to make a screenshot possible. A test-only harness preserves the actual editor component tree without changing shipped access control.

## 2026-08-29 — Authenticated identity must be visible in persistent desktop navigation
**Decision:** When a session is authenticated, desktop Header chrome must expose a stable account affordance with identity, Profile, Knowledge health, role-appropriate Admin access, and Logout. These actions must not exist only in the mobile navigation drawer.

**Why:** Authentication is incomplete as a product interaction if users can sign in but cannot discover account/session controls from the primary desktop surface. Keeping the affordance in the persistent Header makes session state legible and prevents logout/profile access from becoming viewport-dependent.

## 2026-08-29 — Profile should be an account workspace, not a decorative bio page
- The authenticated profile surface uses its available desktop area for identity, account actions, production signals, saved knowledge, and evidence-health shortcuts rather than oversized whitespace.
- Dashboard metrics must come from existing Postify data sources (published user posts, bookmarks, author knowledge dashboard). We do not show fake draft/activity counts or link to nonexistent settings routes just to fill space.
- Editing remains progressively disclosed: the dashboard stays scannable until the user explicitly opens the profile editor.
- Authenticated profile desktop/mobile screenshots are now deterministic visual-release contracts because this surface previously looked unfinished despite functional tests passing.

## 2026-08-29 — UI acceptance is browser-led, route-by-route, and data-aware
**Decision:** Postify UI QA is performed against real rendered Chromium surfaces at desktop and mobile widths, not inferred from CSS or functional tests alone. Route audits may change layout density and must also close functional/data-contract defects exposed by the rendered UI. Authenticated surfaces use deterministic test-only provider/data harnesses rather than production auth bypasses.

**Why:** Several real defects were invisible to build success: desktop account controls were absent, Profile looked unfinished despite working, Admin expected fields its service never returned, and mobile tables needed containment. Browser-level inspection plus deterministic visual baselines makes spacing, hierarchy, empty/data states and cross-layer UI/data drift release-visible without weakening production security.

## 2026-08-29 — Mobile UI quality includes containment, touch targets, and programmatic errors
**Decision:** Browser acceptance for interactive mobile surfaces requires no document/form overflow, 44px primary touch controls, and validation messages programmatically associated with their inputs. Horizontally scrollable editor toolbars may extend internally, but they must not expand the page or form.

**Why:** These defects can survive unit tests and ordinary screenshots while still making the product visibly broken or difficult to operate on a phone. Real viewport geometry and accessibility state are therefore release-quality signals, not optional polish.
## 2026-08-29 — Reading/workflow content outranks diagnostic metadata
**Decision:** Article evidence/runbook detail remains fully available but follows the readable article body, while the Editor keeps publication-readiness diagnostics after the writing and evidence inputs on narrow screens. Short quantitative summaries may collapse into compact 2×2/3-column mobile grids when they remain readable and touch-safe.

**Why:** Real Chromium geometry showed that diagnostic/trust UI was delaying the primary user task by more than a full viewport: article content began around 2.7kpx down on mobile and editor title entry around 1.3kpx. Trust metadata should strengthen a task, not become a gate that forces readers or authors through an administrative wall before they can read or write.

## 2026-08-30 — Pixel baselines require deterministic rendering, not just deterministic data
**Decision:** Keep strict pixel-diff baselines for core product surfaces and stable desktop system pages. For public-system mobile routes whose hosted Chromium raster output moves between otherwise identical runs, gate the same 390px UI with explicit geometry, overflow, hydration and 44px touch-target contracts instead of accepting a large pixel-diff tolerance.

**Why:** Two hosted runs failed different auth-mobile screenshots while 36/38 then 37/38 contracts passed, and the exact Playwright 1.57 image passed the same committed snapshots locally. Raising global screenshot tolerance would weaken every visual gate. Route-specific structural contracts preserve the mobile defects we actually care about while keeping strict pixel protection everywhere it is reproducible.
## 2026-08-30 — Markdown transfer uses the editor document model and never invents provenance
**Decision:** Create/Edit imports and exports Markdown through Tiptap's native Markdown document model. Transfer happens entirely in the browser, a leading H1 maps to the Postify title, existing title/body content requires overwrite confirmation, and imported Markdown never populates evidence or provenance fields automatically. Canonical-source URL persistence remains a separate feature.

**Why:** Markdown portability is useful only if it preserves the writing structure without weakening Postify's trust contract. Inferring test dates, environments, evidence, or canonical ownership from arbitrary Markdown would manufacture provenance. Keeping transfer local also avoids an unnecessary upload surface while giving authors a reversible way to move existing writing in and out of Postify.

## 2026-08-30 — Canonical provenance is a separate capability, not evidence
**Decision:** Store an optional `canonical_source_url` separately from evidence sources and keep Postify's own article URL as the public/share URL. The editor exposes canonical provenance only when the deployed capability artifact confirms the production column exists; reads and writes omit the field otherwise.

**Why:** Republishing metadata should not manufacture evidence or make pre-migration clients fail. A capability-gated additive column lets schema and frontend roll out independently, keeps Postify URLs stable for sharing, and prevents a missing production migration from breaking public reads or author updates.

## 2026-08-30 — Mobile hit areas are measured on the actionable surface
**Decision:** A mobile control is accepted when the actual clickable/focusable surface is at least 44px in the constrained dimension; a visually small native input may remain smaller when it is correctly wrapped by a larger interactive label. Drawers and modal-like sheets must also expose an explicit visible close control rather than relying only on backdrop, Escape, or navigation side effects.

**Why:** Raw element rectangles can create false positives (for example 13px checkboxes inside 48px labels or a compact search input inside a 54px label), while genuinely undersized icon/link targets remain hard to operate despite looking visually tidy. Measuring the user-operable hit area preserves compact editorial density without sacrificing touch access or recovery from overlays.

## 2026-08-30 — Fallback identity is explicit, never a substitute for missing users
**Decision:** The fallback Postify editor may resolve only from its explicit aliases/identifier. Arbitrary non-UUID routes and UUIDs that successfully resolve to no profile return no user and render the Author-not-found recovery surface. Profile-service/query failures render a separate retryable unavailable state instead of being mislabeled as not found.

**Why:** A resilience fallback for public content must not fabricate identity. Showing the Postify editor when a requested author does not exist makes broken links look valid and can misattribute content. Missing identity is a distinct UI state and should be represented honestly.

## 2026-08-30 — Empty and failure states are first-class visual contracts
**Decision:** High-value work surfaces with meaningful no-data or failure branches—Bookmarks, Knowledge Health and Admin operations—must expose explicit empty/recovery UI and be covered as rendered browser states, not inferred from populated-state screenshots.

**Why:** Populated routes can pass every visual gate while their empty/error paths remain blank, undersized or unrecoverable. State-specific harnesses keep those branches deterministic without weakening production auth or inventing production data.

## 2026-08-30 — ARIA roles must match the implemented keyboard model
**Decision:** Interactive UI advertises composite ARIA roles only when the corresponding keyboard behavior exists. Admin uses a real tab/tabpanel model; Command Palette uses a combobox/listbox with active-descendant navigation; the account dropdown remains a disclosure of ordinary navigation/actions instead of pretending to be a menu.

**Why:** Adding `menu`, `tab` or `listbox` roles without their keyboard contract makes the accessibility tree more misleading, not more accessible. The rendered semantics, focus order and keyboard behavior must describe the same interaction users actually receive.

## 2026-08-30 — Closing an overlay restores the initiating context
**Decision:** Modal/drawer/palette UI must return keyboard focus to the control or element that initiated it when dismissed, including Escape dismissal.

**Why:** A visually closed overlay is not a complete recovery if keyboard focus falls back to `body`. Restoring context prevents users from losing their place and makes repeated navigation predictable.

## 2026-08-30 — Muted and semantic text colors must remain readable on every product surface
**Decision:** Shared light/dark text and status tokens must meet at least 4.5:1 contrast against Postify’s primary, secondary and elevated surfaces when they are used for normal-size text. Decorative separators may remain visually quiet only when they are removed from the accessibility tree. Inline-code styling must not leak into dark code blocks.

**Why:** The browser audit found `--text-muted` around 3.3–3.8:1 on light surfaces, green/yellow status labels below that, and a global inline-code background overriding the verified article’s dark code block. These are system-level defects: fixing tokens and containment preserves hierarchy across routes while making the contract measurable in release tests.

## 2026-08-30 — Dark mode is a visual release surface, not only a token variant
**Decision:** Core public and authenticated Postify surfaces keep deterministic dark-theme pixel baselines at desktop and mobile widths in addition to shared contrast checks. Standalone visual harnesses apply theme state after navigation when they do not mount the production App theme lifecycle.

**Why:** Numeric contrast can prove readability but cannot catch hierarchy, border, elevation, spacing or theme-specific cascade regressions. The first dark Editor attempt also proved that test initialization timing can manufacture false layout drift, so dark baselines must represent the same rendered lifecycle users receive rather than a pre-parser attribute artifact.

## 2026-08-30 — Unreachable product surfaces are removed instead of visually modernized
**Decision:** A legacy screen that is no longer reachable from the product router and has no live imports is deleted together with dependencies used only by that screen. Analytics, the old interactive CommentSection, ShareButtons, ImageUpload and their unused hooks were removed under this rule; chart/share/dropzone-only dependencies were removed with them, while live public comment reading, CopyLinkButton sharing and avatar storage remain. Stale E2E navigation assumptions were updated to the current root-hosted router.

**Why:** Polishing dead UI increases maintenance and dependency surface without improving the product. Route inventory is authoritative: if a feature is intentionally absent, keeping its dashboard, chart code and package tree creates misleading technical debt and future security/update work.

## 2026-08-30 — Taxonomy identity stays canonical; localization is presentation
**Decision:** Post category values remain stable canonical data for persistence, filtering and URLs. Locale-specific category names are derived at the display/search boundary instead of rewriting stored category strings. Known fallback-author aliases likewise normalize to one canonical fallback identity, while the visible author copy is localized per requested locale.

**Why:** Translating persisted taxonomy would make filters and backend data language-dependent and could fragment existing content. Rendering localized labels preserves data stability while giving English users a coherent interface. The same separation prevents alias handling from drifting between profile and post queries and avoids serving Turkish fallback identity copy from an English query cache.

## 2026-08-30 — Overlay and visual-readiness contracts test outcomes, not implementation details
**Decision:** Overlay acceptance is defined by user-visible behavior: the dialog remains inside the viewport, background scrolling is locked, dismissal restores the previous scroll/focus context, and controls preserve their keyboard model. Tests must not require a particular scroll-lock implementation such as `body { position: fixed }`. Visual screenshot tests also wait for a meaningful rendered product marker before capture; readiness timeout may absorb runner startup jitter without relaxing pixel-diff tolerance.

**Why:** The body-fixed implementation itself helped cause the scrolled Command Palette to render offscreen, while an old functional test incorrectly treated that implementation as the contract. Separately, 50 independent Home contexts rendered in under 1 second at p99, yet a heavily loaded 98-test visual run exceeded Playwright's generic 5-second assertion window once. Outcome-based overlay assertions and marker-based visual readiness protect actual UX defects without encoding a broken technique or weakening screenshot comparisons.

## 2026-08-30 — Primary format navigation must visibly complete the navigation
**Decision:** Header format links keep the canonical Home `type` query but also target `#knowledge-feed`, derive their active state from that query, and expose it with `aria-current`. Explore and the brand reset the query context and return the viewport to the top. Mobile uses the same format identities and active semantics.

**Why:** Changing the filter in the URL was technically correct but not enough UX feedback while a large hero remained above the results. A successful navigation must visibly land the user on the changed content and clearly identify the active destination; otherwise a working filter feels like a broken button.

## 2026-08-30 — Discovery density uses hierarchy and whitespace instead of table borders
**Decision:** Home keeps its editorial masthead and evidence metadata, but reduces hero/feed vertical expansion and removes most per-cell topic/filter separators. Grouping should come from spacing, typography, selected-state tone and a small number of structural rules rather than a border around every option or fact.

**Why:** The real desktop screenshots showed that the former combination of oversized hero, long card rhythm and dense dividers read more like a poster followed by a spreadsheet than a practical knowledge product. Tightening density brings useful records into the first viewport while preserving the distinctive evidence-first information architecture.

## 2026-08-30 — Touch geometry follows the product interaction breakpoint
**Decision:** When Postify enters touch-oriented navigation at <=960px, primary interactive controls across discovery, maintenance, profile, editor and Footer surfaces must preserve at least a 44px effective hit area even if their visual layout does not reflow until a narrower breakpoint. Layout breakpoints remain content-driven; hit-area breakpoints follow the interaction mode.

**Why:** Real 600–960px Chromium rendering showed a hidden gap between phone and desktop QA: controls that were intentionally 44px at <=520/620/680/720px shrank back to 30–40px while the Header had already switched to its mobile drawer. Treating tablet widths as touch-capable closes that inconsistency without inflating the 1440 desktop interface or forcing unnecessary layout changes.

## 2026-08-30 — Persistent-shell navigation must restore keyboard context
**Decision:** When a SPA pathname changes from persistent navigation, Postify moves programmatic focus to the already-focusable `#main-content` after resetting scroll position. Query/hash-only Home format changes preserve the initiating navigation focus. Dismissible overlays restore focus to their trigger when Escape removes the focused overlay content. Programmatic scrolling also respects `prefers-reduced-motion` explicitly rather than assuming CSS can override JavaScript smooth scrolling.

**Why:** Real Chromium showed that visual scroll correction alone can leave keyboard focus on an offscreen Footer link, while closing the account popover from a focused child can drop focus to `body`. Both states are visually easy to miss but break orientation for keyboard and assistive-technology users. The same audit proved CSS reduced-motion rules do not cancel an explicit JavaScript `behavior: 'smooth'`, so motion preference must be honored at the call site.
