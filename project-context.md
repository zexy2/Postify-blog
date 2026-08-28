# Postify — Project Context

## Current product
Postify is **Verified Knowledge**: a practical knowledge network for builders where content can carry explicit evidence, freshness, reproducibility, community confirmation, and revision history instead of behaving like a generic blog.

Reader promise: **“Do not just read it. Use it — and see what the claim is based on.”**

The production site is `https://postify.zekiakgul.dev/` and production content/auth/evidence persistence is backed by Supabase project `fuiwcrqmxndguxymwoin`.

## Current stack
- React 19 + Vite 7
- React Router 7
- Redux Toolkit + TanStack Query
- Supabase/PostgreSQL production backend with RLS
- TipTap editor
- CSS Modules + global design tokens
- Vitest + Playwright Chromium product coverage
- Node **24.20.0** for hosted verify/build/deploy jobs
- GitHub Pages custom-domain deployment with exact-source-SHA attestation

## Product model
Structured content modes:
- Guide — accomplish a concrete task
- Decision note — compare choices and trade-offs
- Explainer — understand a concept
- Field note — report lessons from real work

Evidence states:
- `unverified` — no author-tested claim
- `author-tested` — author supplied a valid test date, meaningful environment evidence, and meaningful verification steps; this is an author claim, not independent Postify execution
- `Postify verified` — never author-writable; derived only from a checked-in deterministic execution artifact whose displayed code matches the executed code and whose tracked runtime freshness is current

Community evidence:
- Authenticated users can persist one Worked/Didn't Work confirmation per post; duplicates cannot inflate counts
- Public surfaces expose privacy-safe aggregates, not raw contributor identity/free text
- Anonymous/fallback feedback stays device-local
- Success-rate percentages require the configured minimum sample before display

## Automatic verification boundary
The current automatic verifier supports only checked-in deterministic Node.js snippets under `node-deterministic-v1`.
- It is **not** an arbitrary-code security sandbox
- external package/network/filesystem/process capabilities are outside the supported execution policy
- a passing run ships exact code/artifact hashes, runtime, command, expected stdout and actual stdout
- the runtime contract requires Node 24 LTS
- `runtime-release-status.json` checks the official Node release signal; newer LTS releases produce `recheck-required`, source uncertainty produces `unknown`, and both withhold the current Verified badge while preserving historical execution proof
- runtime signals expire client-side after 36 hours; main CI also refreshes daily

## Production backend status
Verified Knowledge migrations are active in production, including:
- structured evidence fields
- confirmations and privacy-safe aggregate views
- revisions/history
- Knowledge Gaps
- private Knowledge Shelf state
- evidence integrity trigger
- private SECURITY DEFINER helpers behind public SECURITY INVOKER RPC wrappers
- canonical production automatic-verification example

Production migration history is authoritative. Do not use migration-history repair. New schema changes must be additive, locally verified against a fresh PostgreSQL 16 chain, then applied through authenticated Supabase management and renamed locally to the exact remote version if Supabase assigns a different timestamp.

## Release gates
A safe release requires, as relevant:
1. `npm ci`
2. `npm run verify:security` — npm audit must be zero and Playwright package/container versions must match
3. `npm run verify` — deterministic knowledge verification, Vitest, lint, production build and artifact smoke
4. fresh PostgreSQL migration chain + `supabase/verify-verified-knowledge.sql` for DB changes
5. official Playwright 1.57 Chromium product suite
6. PR CI green
7. merge to `main`
8. GitHub Pages deploy
9. production exact-SHA artifact probe + production Chromium suite

Do not fabricate authenticated browser coverage, evidence counts, verification, deployment success, or completion.

## Current product priorities
- increase real production evidence coverage without fabricating author-tested data
- keep publication eligibility separate from evidence claims and writing-quality suggestions
- expand dependency/environment invalidation only when evidence declares trackable versions
- improve remaining authenticated author/admin surfaces with real production behavior
- add grounded Ask Postify/API/MCP only after durable evidence/provenance coverage is broad enough

## Known boundaries
- Supabase Auth leaked-password protection remains disabled; current connected management actions do not expose that toggle
- GitHub Pages deep SPA routes initially return hosting-level 404 before the checked `404.html` browser fallback restores the route
- arbitrary user/package/network/shell execution is intentionally unsupported
- package-level evidence invalidation is not yet implemented
- screenshot-diff visual baselines are not committed
- Browserslist/caniuse-lite maintenance data is stale and should be refreshed separately

## Working rules
- Prefer small, reviewed, evidence-backed changes over broad rewrites
- Never promote database metadata to `Postify verified`
- Never invent evidence, community activity, authorship, or test results
- Preserve exact production migration history
- If a strategy fails twice, change strategy instead of repeating it
- Keep `progress.md`, `decisions.md`, `backlog.md`, `known-issues.md`, and this file aligned with the actual released system
