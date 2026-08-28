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
