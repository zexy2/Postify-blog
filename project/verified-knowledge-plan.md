# Postify Verified Knowledge V1 — Execution Plan

## Product promise
Postify answers a question a normal blog does not: **Does this still work, where was it tested, and what evidence supports it?**

## Non-negotiable trust rule
Never display “Postify verified” unless Postify actually executed a check. V1 distinguishes author claims, evidence, freshness, and local/community feedback explicitly.

## Execution checklist
1. [x] Define a frontend-first knowledge evidence model: outcome, prerequisites, environment/version, testedAt, verification level, verification steps, sources, known caveats.
2. [x] Add deterministic trust/freshness presentation logic with tests; never infer evidence that does not exist.
3. [x] Upgrade fallback catalogue with honest sample evidence so the live product demonstrates the model without a production DB migration.
4. [x] Redesign discovery/feed cards around evidence: tested date, environment, evidence state, freshness; make generic blog metadata secondary.
5. [x] Redesign article detail around an Evidence/Verification panel, prerequisites, verification steps, caveats and sources.
6. [x] Upgrade authoring UX to collect structured evidence in the draft and enforce stronger readiness checks; keep production persistence deferred until schema work is approved.
7. [x] Add local “Worked / Didn’t work” evidence capture with optional environment note, transparent device-local scope and aggregate presentation that never pretends to be community-wide.
8. [x] Upgrade personal utility from bookmark-only toward action state: Save / Try later / Using / Reference, stored locally in V1.
9. [x] Add freshness-aware discovery filters/sorting and stale-content warnings.
10. [x] Add Knowledge Gap behavior for zero-result searches: save a local need and expose demand semantics without fake global counts.
11. [x] Add machine-readable knowledge output in the static release where safe (`llms.txt` + documented structured metadata direction); no fake API/MCP claims.
12. [x] Extend unit + Playwright coverage for evidence, freshness, feedback, mobile and authoring flows.
13. [x] Run full lint/test/build/smoke + real Chromium QA, review diff/accessibility/responsive/performance.
14. [x] Update project docs/decisions/backlog/known issues, commit, push, PR, CI, production deploy and production browser smoke.

## Deferred after V1 (requires backend/security design)
- Production Supabase schema/migrations for evidence, confirmations, failures and revisions.
- Cross-user community aggregates and anti-abuse/reputation.
- Sandboxed automatic code execution / “Postify verified”.
- Dependency release monitoring and automatic stale detection from package ecosystems.
- Grounded Ask Postify, public API and MCP.
