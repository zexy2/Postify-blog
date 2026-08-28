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
