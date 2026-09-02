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

## 2026-08-30 — Overlay QA treats viewport height as a first-class constraint
**Decision:** Modal and command surfaces must remain fully operable in short landscape viewports, not only at standard phone/desktop heights. When vertical space is scarce, Postify removes non-essential overlay chrome and constrains the scrollable result region instead of allowing fixed dialog content to escape the viewport. Touch-target guarantees remain valid during entrance transforms, not just after animation settles.

**Why:** Real 844×390 and 568×320 Chromium renders showed the Command Palette extending 82–115px below the visible viewport even though width/overflow tests passed. Width-only responsive QA misses this class of defect, and a nominal 44px control can temporarily fall below 44px when its parent is scaled during entrance animation.

## 2026-08-30 — Floating utilities yield to visible keyboard focus rather than removing functionality
**Decision:** On touch-layout Articles, the floating action bar remains available for pointer/touch users and in the keyboard tab order, but retreats whenever `:focus-visible` belongs to another Article control. When focus enters the bar itself it reappears. The behavior is expressed in CSS using the page’s focus state rather than hiding the bar permanently on short screens.

**Why:** Short landscape Chromium runs showed the 59px fixed bar partially covering focused evidence and navigation controls. Simply disabling the bar would remove the only persistent mobile Bookmark control, while scroll margins did not fully eliminate overlap for large focus boxes. Yielding only during external keyboard focus preserves functionality and touch convenience while preventing focus obscuration.

## 2026-08-30 — Custom editors own native-equivalent validation semantics
**Decision:** A custom contenteditable used as a required form field must expose the same label, invalid-state, descriptive-error and focus-recovery semantics as a native input. Validation errors are attached to the actual editable node, not only to its visual wrapper, and invalid submission moves focus to the first actionable invalid field after the error state renders.

**Why:** The TipTap editor looked correctly labeled visually, but the browser accessibility tree had no programmatic relationship between `Content` and the editable surface. Body errors were also plain text while focus stayed on Publish, leaving keyboard and screen-reader users far from the problem they needed to fix. Treating the custom editor as a first-class form control closes that gap without changing the visual layout.

## 2026-08-30 — Form validation identifies one actionable correction point
**Decision:** Invalid form submission should not only announce errors; it must return keyboard focus to the first actionable invalid field. Multi-field credentials must mark only the field responsible for the current validation failure when the error can be attributed precisely.

**Why:** Login, Register and Recovery already rendered readable alerts, but real Chromium showed focus remaining on the submit button after failure. Password reset also marked both inputs invalid for a short-password error. Moving focus and narrowing `aria-invalid` to the responsible control shortens recovery for keyboard users and makes the accessibility state match the visible validation message.

## 2026-08-30 — Remove unreachable UI instead of polishing it
**Decision:** UI components with no live route/component consumers are removed rather than localized or visually polished. For the AI assistant, keep only the runtime hook/service/store and the editor integration that is actually reachable; remove the orphaned AISettings/GhostText presentation exports.

**Why:** The unreachable settings surface contained stale copy and interaction patterns, and its barrel exports pulled a large unused dependency graph into build analysis. Removing it reduced Vite's transformed-module count from 877 to 476 without changing the product UI or test baselines.

## 2026-08-30 — Global feedback layers must reserve persistent mobile controls
**Decision:** On <=640px viewports, Postify's global bottom-right toast stack reserves vertical space for the fixed Article action bar instead of sharing the same bottom edge. Desktop/tablet toast placement remains unchanged.

**Why:** Real production bookmark feedback overlapped the mobile Article toolbar after its entrance animation settled, obscuring controls despite zero document overflow. A shared narrow-screen bottom-offset token keeps transient feedback and persistent actions spatially distinct without moving desktop notifications or removing the toolbar.

**Scope refinement:** The elevated toast offset is conditional on an Article tool marker, not viewport width alone. Global feedback on Home/auth/other narrow routes keeps the standard 16px edge offset; only a page that actually mounts the persistent mobile Article tools reserves the larger clearance.

## 2026-08-30 — Transient feedback yields to modal interaction layers
**Decision:** Keep toast status nodes mounted for announcement/timing, but visually suppress the global toaster while a real dialog is open. The toaster returns after the dialog unmounts. This applies to Command Palette and mobile drawer instead of trying to stack transient feedback above modal content.

**Why:** At 568×320 a bottom toast obscured the Command Palette by roughly 9.4k px², and on both short and normal mobile heights it rendered above the drawer because the toaster owns z-index 9999. There is no reliable free edge around a full-height modal, so hiding the transient visual layer is safer than moving it into another interactive region.

## 2026-08-30 — Scroll stability is anchored to visible content, not a stale scroll number
**Decision:** During fallback→live discovery upgrades, Postify continuously tracks the current absolute position of the visible feed anchor while fallback is active and compensates the final layout delta when live content replaces it. History navigation stores/restores scroll per browser history entry, while modal dismissal restores focus/context without forcing an obsolete captured `scrollY` back onto a page whose layout may have legitimately changed.

**Why:** Production Chromium proved that `scrollY` can remain numerically unchanged while the content the reader is looking at moves by 73.125px because the fallback notice disappears and the live hero has different geometry. The old one-shot fallback measurement also became stale after font/layout settling. A visible-content anchor reflects what the reader actually perceives; deterministic delayed-live testing reduced the same forced transition to 0.344px drift across 10/10 runs.

## 2026-08-31 — Auth hydration, feedback and route-state closeout
- An unresolved authentication check is not an unauthenticated verdict. Protected routes may expose a neutral recovery state after a long session check, but automatic login redirection happens only after auth has actually resolved without a user/session.
- Supabase auth identity is durable independently of optional profile enrichment. A valid auth user is published to application state before the profiles query completes; profile failure may reduce enrichment but must not turn a successful session/login into a false authentication failure.
- Mutation error fallbacks must describe the failed operation. Create/update/delete failures must never reuse registration or success copy when an upstream error has no message.
- Every static `t('...')` / `t("...")` key in product source must exist in both Turkish and English. Missing translation keys are a release failure rather than a runtime raw-key fallback.
- The fallback-first Home catalogue is the loading strategy for public discovery. Unreachable skeleton/wake-up presentation code is removed rather than maintained as a second loading system.
- Public Article detail keeps offline resilience only when the requested story exists in the local fallback catalogue. A backend failure for a live-only story remains a retryable service error; a successful backend lookup returning no story is the only not-found state.
- Shared `SystemStatus` is the default semantic loading/recovery surface for protected and route-level states that need busy/error context.

### Evidence feedback stays inside the product UI
- Browser-native `prompt()` dialogs are not an acceptable evidence-capture surface: they break visual continuity, are hard to style/localize, and provide poor mobile context.
- Evidence context is collected inline and remains optional; persistence semantics are unchanged.
- Evidence-result and shelf controls expose selection with `aria-pressed`; save failures use `role="alert"`, successful saves use `role="status"`.
- Interaction hit-area rules follow the product touch breakpoint (<=960px) without changing desktop density.

- Destructive or replacement confirmations must use the shared in-product `ConfirmDialog`, not `window.confirm`. The dialog must autofocus the safe Cancel action, restore focus to the invoking control when it remains mounted, honor reduced motion, remain contained in short touch viewports, and keep physical action targets >=44px throughout animations. When the invoking control is removed by the confirmed action (for example an Admin row deletion), the owning surface must explicitly move focus to a stable contextual control such as the Content tab.

### 2026-08-31 — Auxiliary controls follow the Header touch breakpoint
When the Header switches to drawer/touch navigation at 960px, secondary controls that are likely to be touched must also meet the 44px interaction target through 960px. Layout breakpoints remain independent; only hit-area rules for LanguageSwitcher, Hero actions, code/link copy actions, Verification Runbook actions, and evidence links are widened to the touch-mode boundary.

- Article Back is history-aware navigation, not a hardcoded Home link: if React Router history has an in-app entry, navigate(-1) to preserve filters and scroll restoration; direct/deep-linked articles fall back to `/`. Both desktop rail and mobile action bar use button semantics for this action.

- Command Palette keyboard navigation must keep the `aria-activedescendant` result visually synchronized. Active options scroll only within the existing result rail using `scrollIntoView({ block: 'nearest', inline: 'nearest' })`; the page remains scroll-locked and larger viewports do not move unnecessarily.

- Full-page ErrorBoundary recovery must establish a deterministic keyboard context. When the fallback mounts, focus moves to Retry/Tekrar Dene with `preventScroll`; the assertive status still announces the error, while keyboard users land on the primary recovery action instead of `BODY`.

## 2026-08-31 — Discovery filters express hierarchy before density
**Decision:** Desktop discovery controls are presented as two semantic clusters—content format and evidence/order refinement—rather than relying on incidental flex wrapping. At the product touch breakpoint (<=960px), those clusters flatten into one horizontally scrollable rail with 44px controls. Critical discovery microcopy should remain around an 11px visual floor unless it is purely decorative.

**Why:** The live 1304px toolbar happened to wrap as 9+3 unrelated buttons, which made a working filter system look unfinished. At the same time, important evidence/topic labels dropped below 10px. Intentional grouping clarifies the control model without adding dashboard-style dividers, while the single touch rail preserves compact mobile/tablet navigation and keeps useful content close to the first viewport.

## 2026-09-01 — Advanced discovery refinement uses progressive disclosure
**Decision:** Keep content format directly visible as the primary discovery control, but move evidence, ordering and reading-time refinements into one anchored `Filters / Filtreler` disclosure. The disclosure is a non-layout-shifting popover on larger viewports and a contained bottom sheet on narrow mobile. Selected advanced refinements remain visible outside the panel as removable summary chips. The advanced panel is lazy-loaded so its interaction complexity does not consume the Home entry budget before the reader asks for it.

**Why:** The previous flat multi-row control surface made a reader parse every filter before reaching content and could look like an admin dashboard rather than an editorial knowledge product. Progressive disclosure preserves fast access to the dominant format choice while keeping secondary trust/refinement controls one action away. Adaptive placement, Escape focus restoration, 44px touch geometry and 200% text containment make the disclosure reliable across desktop, tablet, mobile and short landscape viewports. Lazy-loading also kept the main entry below the existing 320 KB release budget without weakening that performance gate.

## 2026-09-01 — Article chrome must not delay the start of reading
**Decision:** Article metadata is shown once in the most useful layer. Reading time belongs in the compact header metadata row; Quick Brief is reserved for the expected reader outcome rather than repeating content type/date/read-time fields. On touch layouts, a multi-item article outline uses native progressive disclosure (`details/summary`) while desktop may keep the outline visible. Disclosure controls and links must preserve >=44px touch geometry, keyboard focus behavior, and 200% text containment.

**Why:** Production measurements showed that repeated pre-reading chrome pushed the cover/body substantially down the page, especially on mobile. Removing duplicate metadata and collapsing the mobile outline shortens the path from title to useful content without hiding information or weakening evidence/trust signals.

**Parser invariant:** Markdown heading lines must be normalized separately from body copy that follows on the next line. Outline labels and rendered heading IDs come from the same normalized block sequence. A paragraph must never become part of a heading merely because the source omitted an extra blank line after `## Heading`.

## 2026-09-01 — Trust verdicts stay visible; technical evidence uses progressive disclosure
**Decision:** Article trust status and runtime freshness remain visible without interaction, but dense technical evidence—execution contract, environment, verification steps, caveats and sources—lives inside one native disclosure. The disclosure must remain keyboard-native, >=44px in touch mode, and safe at 200% text scaling; expanding it must reveal the exact same evidence rather than a reduced summary.

**Why:** The verified Article evidence section was nearly 1,000px tall on mobile even though most readers first need the verdict and freshness state, not every execution field simultaneously. Collapsing the technical layer reduces reading interruption while preserving inspectability and avoids turning the article tail into an admin/report surface.

## 2026-09-01 — History restoration is semantic before pixel-perfect
**Decision:** Discovery-to-article return state is anchored to the visible article card identity and its viewport offset, not only to saved `scrollY`. Raw coordinates remain a fallback until the semantic card exists. During POP restoration Postify may compensate async feed reflow for a short bounded period, but any pointer, wheel, touch or keyboard interaction immediately cancels automatic restoration.

**Why:** Production data can replace fallback cards or change feed geometry after navigation returns. A raw pixel coordinate therefore describes the old document, not necessarily the reader's place in the new one. Preserving the same content card at the same visual offset better matches user intent and remains stable across async data replacement.

## 2026-09-01 — Discovery cards should read like an editorial index, not a dashboard
**Decision:** Knowledge-card hierarchy uses typography, rhythm and one restrained evidence rule before decorative containers. Sequence ordinals are quiet mono indices rather than badges; trust facts share a borderless rail; featured records may be contained but must not rely on elevation/lift effects; standard and compact records remain row-like. On <=360px standard cards keep the two primary trust signals visible and defer lower-priority facts to the article.

**Why:** After modernizing discovery controls, the feed itself still looked like a component/dashboard collection because every record carried badges, boxed trust cells and card-like elevation. Removing that chrome makes the content title and evidence hierarchy visually dominant and is immediately visible without sacrificing trust information or mobile usability.

## 2026-09-01 — Home scroll restoration owns anchoring and captures reader intent
**Decision:** While Home is mounted, native browser scroll anchoring is disabled because Postify already compensates the fallback→live layout transition and history restoration. Before an internal article navigation, the exact clicked knowledge card is stored as the semantic return anchor (`key + viewportTop`); generic viewport-anchor capture remains the fallback. Article/navigation pages restore the browser default anchoring behavior when Home unmounts.

**Why:** Production repetition showed double compensation of the ~74px fallback banner and occasional restoration to the previous card instead of the opened card. Capturing the reader's actual click target and preventing competing browser anchoring makes Back restoration deterministic while still yielding immediately to subsequent user scroll/touch/keyboard input.

## 2026-09-01 — Article reading quality comes from measure and hierarchy, not more cards
**Decision:** The Article reading surface uses a lighter display-title weight, a framed cover, ~64ch desktop prose measure, larger editorial section headings, rule-based contents/references sections, and typographic previous/next navigation. Mobile keeps its own compact disclosure/stacking model. We do not turn each reading section into an elevated card or introduce decorative effects.

**Why:** The Article header had become strong, but the lower reading flow still looked like a sequence of utility blocks. Improving type scale, reading measure, whitespace and section boundaries makes the page visibly more mature while preserving Postify's calm editorial/developer-tool direction and avoiding card-inside-card visual noise.

## 2026-09-01 — The editor is a publishing workspace, not a settings form
**Decision:** Create/Edit knowledge uses one document-like writing canvas for title, body and evidence, paired with a visually distinct readiness inspector on wide screens. Writing-mode selection is an editorial chooser, the rich-text toolbar belongs to the writing surface, and Publish is the single primary accent action. Mobile stacks the inspector after the document and keeps actions touch-safe rather than shrinking the desktop layout.

**Why:** The previous editor was functionally strong but visually read as a long sequence of form fields and divider lines. Grouping the writing flow into a calm document surface and separating readiness/status information improves hierarchy at first glance without hiding evidence requirements or adding card-within-card chrome.

## 2026-09-01 — Home opens as an editorial front page, not a card dashboard
**Decision:** The Home masthead prioritizes display typography, one prominent discovery/search control and a rule-based featured cover story. The featured story does not use a rounded elevated outer card; image framing and typographic hierarchy provide separation instead. Browse is the primary accent action, while contribution stays secondary.

**Why:** Discovery controls and feed cards had already been simplified, but the first screen still mixed a premium masthead with an elevated product-card featured story. Removing that outer card and strengthening the search/title hierarchy makes the product feel intentionally editorial at first glance without changing information architecture or adding decorative complexity.

## 2026-09-01 — Global navigation should behave like an editorial index, not a toolbar
**Decision:** Keep the shared header height stable while changing its hierarchy: Postify brand first, numbered content-format navigation second, search/account/language/theme as quiet utilities, and write/login as the single primary action. On mobile, use a full-height editorial index with a masthead, search surface, numbered routes, and separated utilities instead of compressing desktop controls into a drawer.

**Why:** The prior header was functionally complete but every control carried similar visual weight, which made the shell feel like application chrome rather than a publication/knowledge product. A stable-height editorial hierarchy creates a visible quality jump across the entire product without shifting page content or changing navigation semantics.

## 2026-09-01 — The footer is a product close, not a sitemap block
**Decision:** The shared footer closes with one large editorial product statement, one accent discovery CTA, quiet indexed navigation, and a three-part trust rail. Desktop may explain Evidence / Freshness / Reproducibility in one sentence each; mobile keeps the same trust model compact. Footer controls must remain >=44px in touch mode and must not escape the viewport at 200% text scaling.

**Why:** The previous footer already exposed the right information, but brand, CTAs, navigation and trust labels carried similar visual weight. Making the reader promise dominant and the sitemap secondary creates a visible end-of-page hierarchy without hiding product routes or fabricating trust. The 200% regression also showed that CSS Grid min-content behavior must be constrained explicitly in responsive CTA rows.

**Performance constraint:** The eager main entry is now 319,496 bytes against the existing 320 KB gate. Further visible UI work should prefer CSS or already-lazy surfaces; new eager JavaScript should be avoided unless equivalent entry weight is removed or moved behind a lazy boundary.

## 2026-09-01 — Authentication is an editorial entry rail, not a SaaS card
**Decision:** Login, Register and Password Recovery keep their existing two-part account-context + form information architecture, but the form must not sit inside a rounded elevated card. Desktop separates context from action with one vertical rule; narrow mobile uses a top rule. Primary credential actions use the product accent, supporting OAuth choices use a flat ruled rail, and benefit copy may use quiet editorial indices. Auth behavior, validation semantics and recovery flows remain unchanged.

**Why:** Production Chromium comparison showed About, Contact and Not Found already matched Postify's rule-based editorial system while every auth form still carried the same 10px radius and drop shadow associated with a generic startup dashboard. Removing that container chrome makes the first account interaction feel continuous with the rest of Postify, and doing it entirely in CSS preserves the near-limit 320 KB eager JavaScript budget.

## 2026-09-01 — The account profile is an editorial workspace, not a dashboard card grid
**Decision:** Profile identity, account actions, knowledge summaries and quick access use shared rules, typography and open layout rather than independent rounded/elevated cards. Identity is the dominant masthead; stats share one strip; maintenance/content summaries may remain multi-column on wide screens but are separated by rules instead of card chrome. Mobile stacks the same hierarchy with touch-safe rows. Profile editing remains inline and uses underline-style fields plus one accent save action.

**Why:** After Home, Article, Editor, Header, Footer and Auth moved to Postify's editorial knowledge system, Profile still contained the strongest generic startup-dashboard cues: 14px card shells, nested stat cards, metric cards inside dashboard cards and lift-on-hover shortcut tiles. Removing those containers makes the authenticated account surface visually continuous with the product while preserving every existing account and knowledge action and adding no eager JavaScript.

## 2026-09-01 — Admin is an operator ledger, not a dashboard card grid
**Decision:** Administration keeps its task-oriented tabs and native data tables, but overview metrics are shown as one ruled rail rather than boxed stat cards. Management tables use typography and row rules before filled headers, badges or mini-card controls. On <=390px the three primary Admin tabs form equal wrap-safe columns so 200% text scaling does not require horizontal scrolling.

**Why:** The Admin surface was functionally mature but its five boxed metrics, filled table header and bordered action/status controls still looked like generic dashboard chrome. Flattening those containers preserves dense operational scanning, reduces mobile height, and aligns the console with Postify's editorial ledger language without changing role, moderation or destructive-action behavior.

## 2026-09-01 — Command search is an editorial index, not a floating SaaS card
**Decision:** The global command search keeps its modal/focus-trap behavior, but its visible surface uses publication-like rules, one underlined search rail and separated result rows rather than a large rounded elevated container with nested rounded controls. Result imagery may stay compact and framed; active selection is communicated by a restrained directional background treatment. Mobile keeps >=44px close/result targets and horizontal containment at 200% text scaling.

**Why:** After the global shell, Home, Article, Editor, Auth, Profile and Admin moved to Postify's editorial knowledge language, Command Search remained one of the most visible generic application-modal surfaces. Flattening only its CSS creates a visible cross-product quality gain while preserving the mature keyboard/focus/scroll behavior and adding zero eager JavaScript weight.

## 2026-09-02 — Public authors are presented as knowledge folios, not social profiles
**Decision:** Keep the public author route focused on authorship and published knowledge. The author initial is a small editorial folio marker rather than a circular avatar surrogate, and publication/reading/evidence totals are rendered as a ruled metadata ledger without decorative icons.

**Why:** Postify's reader-facing identity is a verified knowledge product, not a social network. The previous circular monogram and icon-led stats reintroduced profile-dashboard language after the rest of the product had moved to a calmer editorial system. This CSS-only treatment strengthens continuity without changing author data, trust semantics, or bundle behavior.

## 2026-09-02 — Bootstrap/loading/recovery share one system-status surface
**Decision:** PersistGate bootstrap loading reuses `SystemStatus` rather than maintaining a separate circular spinner implementation. System-state recovery actions use flat rule-based controls and debug details use a ruled panel rather than rounded card chrome.

**Why:** A first-load spinner is one of the earliest product impressions and the old generic loader visibly broke the editorial knowledge language established across Postify. Reusing the existing status primitive improves coherence and removes eager code instead of adding another visual primitive.

## 2026-09-02 — Advanced discovery refinement is a sheet, not a settings-card grid
**Decision:** Keep advanced discovery behind the existing progressive disclosure, but render the opened surface as a flat editorial refinement sheet with ruled rows and compact state marks instead of a large rounded popover containing many rounded option cards.

**Why:** Discovery is the product's primary knowledge-index surface. Opening refinements should preserve that publication/index language rather than switching to generic dashboard settings chrome. The change is intentionally CSS-only so filtering behavior, URL state and the tight eager bundle budget remain untouched.

## 2026-09-02 — Confirmation is a decision panel, not a generic modal card
**Decision:** Shared confirmation dialogs use a flat ruled editorial panel. Cancellation is a quiet underlined action; the actual decision remains the sole filled action, including the existing danger tone for destructive operations.

**Why:** Confirmation is a high-attention moment. Rounded shadow-heavy modal chrome looked like generic application UI and competed with the decision itself. A flatter panel preserves hierarchy, reduces decoration and keeps the destructive/default semantics obvious.

## 2026-09-02 — Publishing workspace is a manuscript, not a card
**Decision:** The Create/Edit writing column uses a top editorial rule with no rounded container/background, and the readiness inspector behaves as a ruled margin note instead of a secondary card. Readiness states use typographic underlines rather than status pills.

**Why:** The workspace structure was already document-first, but the remaining large rounded containers visually pulled it back toward a generic form/dashboard. Removing those shells makes the authoring surface feel more like a focused knowledge manuscript while preserving every existing publishing and evidence behavior.

## 2026-09-02 — The Home search entry is a publication rail, not a search card
**Decision:** The dominant Home search control uses a strong top rule, quiet bottom rule and flat focus wash instead of a rounded elevated input container. Its Browse/Contribute actions are ruled text actions rather than pill/card buttons, and the featured cover frame is square.

**Why:** The masthead had already become an editorial knowledge-product surface, but the most important interaction still reverted to generic startup-search/card language. Flattening this high-visibility interaction keeps hierarchy and focus clarity while removing decorative chrome and adding zero eager JavaScript.

## 2026-09-02 — Prewarm the mobile navigation chunk instead of making it eager
**Decision:** Keep the Radix Sheet implementation as a separate Vite chunk, but start its dynamic import when the Header module loads and share the resulting promise across Sheet, SheetContent, and SheetTitle.

**Why:** The mobile navigation is a primary control and cannot have a cold first-click wait, but the main entry remains under a strict 320 KB budget. Prewarming the existing split chunk removes the user-visible latency while preserving code splitting and avoiding a multi-kilobyte eager bundle increase.

## 2026-09-02 — Resolve the prewarmed mobile Sheet before interaction
**Decision:** Keep `ui/sheet` dynamically imported, but resolve the module into Header state before the hamburger interaction and render the resolved exports directly rather than wrapping first-use Sheet exports in `React.lazy`.

**Why:** Network prewarming removed the cold chunk download, yet first-use Suspense still delayed the actual dialog mount by ~650 ms after `aria-expanded` changed. Resolving the already split module ahead of interaction keeps the bundle budget intact while making the drawer mount synchronous with the user's click.

## 2026-09-02 — Mobile navigation controls follow the same editorial rail language as Home
**Decision:** Inside the mobile drawer, search and session actions use flat ruled treatments rather than rounded elevated controls. The numbered navigation remains the strongest visual structure; mobile footer actions may wrap at <=520px so 200% text scaling never pushes controls outside the viewport.

**Why:** After the drawer itself became fast, its remaining rounded search/login chrome still broke the publication-like visual system established on Home, discovery and publishing. Keeping the interaction model unchanged while flattening only the control chrome makes the mobile shell feel coherent and preserves the strict accessibility/touch constraints.

## 2026-09-02 — Mobile article tools are a reading rail, not a floating app pill
**Decision:** The mobile Article action bar uses a flat rule-based rail with square 44px actions. Bookmark and Copy Link state is communicated through color/underline emphasis rather than rounded filled controls or a shadowed capsule.

**Why:** The Article body and evidence surfaces are now editorial and document-led; a large floating rounded toolbar reintroduced generic application chrome at the most visible mobile reading moment. A restrained reading rail preserves touch safety and focus/toast behavior while matching the publication system.
