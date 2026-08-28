# Verified Knowledge full conversion status

1. [x] Trust semantics
2. [x] Persistent data model
3. [x] Migration + rollback + PostgreSQL dry-run
4. [x] Backend knowledge services
5. [x] Persistent author-tested publishing payload
6. [x] Evidence readiness validation
7. [x] Persistent community Worked/Failed model
8. [x] Minimum-sample community aggregate
9. [x] Anonymous-safe failure reports
10. [x] Freshness engine
11. [x] Author stale/reverification queue
12. [x] Revision history and real edit flow
13. [x] Evidence-first article
14. [x] Evidence-first discovery
15. [x] Trust/freshness filters and evidence ranking
16. [x] Persistent authenticated Knowledge Gaps + local fallback
17. [x] Persistent authenticated knowledge shelf + local fallback
18. [x] Usefulness evidence in author dashboard
19. [x] Evidence-gated domain credibility
20. [x] Automatic verification release-gate foundation
21. [x] First real deterministic Node.js verification type
22. [x] Machine-readable verification/article artifacts
23. [x] SEO/AEO citations + alternate JSON metadata
24. [x] RLS/abuse boundaries + integration test
25. [x] Responsive/accessibility preservation checks
26. [x] Unit/integration suite
27. [x] Chromium E2E suite
28. [x] PostgreSQL migration dry-run + CI schema gate
29. [ ] Production Supabase migration + deploy
30. [ ] Production browser smoke for full conversion
31. [ ] Production observability/log check
32. [ ] Final product differentiation audit
33. [x] Architecture/decision/progress/rollback docs
34. [ ] Final completion declaration

## Pre-migration hardening checkpoint — 2026-08-28
- Current frontend is backward-compatible with the old production Supabase schema through an explicit backend capability artifact.
- Full repository migration chain + storage bootstrap + RLS/privacy assertions PASS on PostgreSQL 16.
- Raw community evidence and revision snapshots are private; public views expose aggregates/sanitized history only.
- Browser suite is a CI + production deploy gate (22 scenarios green, including Action Runbook and executable verification contract).
- Main entry performance budget: 294,024 bytes current, 320,000-byte release ceiling.
- Items 29–31 and final completion remain intentionally open until authenticated production Supabase owner access is available and the real migration/post-migration smoke is executed.

## Post-plan product hardening — 2026-08-28
- Automatic verification now binds the displayed article code to the exact executed manifest contract; artifacts include actual runtime/output and code hash.
- `node-deterministic-v1` rejects unsupported package/network/filesystem/process capabilities at release-gate policy level and is explicitly not described as a security sandbox.
- Article verification steps are now an evidence-version-scoped Action Runbook with durable device-local progress and code-copy actions.
