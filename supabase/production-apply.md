# Verified Knowledge production apply

## Migration chain
Apply in repository order through an authenticated Supabase owner/CLI connection:
1. `migrations/202608280900_verified_knowledge.sql`
2. `migrations/202608281320_evidence_integrity_and_privacy.sql`

The earlier 20260807 base/content/security migrations are existing project foundations and remain immutable.

## Preconditions
- Take a Supabase schema backup/snapshot before any production migration.
- Confirm current production base/content/storage schema is healthy.
- Use Supabase CLI/SQL Editor or another authenticated owner channel; never expose the database password, PAT, or service-role secret to browser code.
- Run the CI PostgreSQL schema/RLS gate and local Chromium product suite against the exact source SHA intended for release.

## Safe apply sequence
1. Link the CLI to the production project using owner credentials.
2. Inspect remote migration history before `db push`; do not guess or repair history blindly.
3. Run a remote migration dry-run where supported and inspect the SQL list.
4. Apply pending migrations in order.
5. Run read-only schema probes for the added post evidence columns, tables, views, functions, trigger, constraints and RLS policies.
6. Rebuild/deploy the frontend. The deploy export step must switch `knowledge-backend-status.json` from `ready:false` to `ready:true` only when the new public evidence views are actually queryable.

## Verification immediately after apply
- Public content still reads existing posts/translations without data loss.
- `post_evidence_summary`, aggregate `post_failure_reports`, and sanitized `post_revision_history` are publicly readable.
- Anonymous/authenticated users cannot read raw `post_confirmations` belonging to another user or raw `post_revisions` snapshots.
- Author cannot confirm their own post; one user cannot inflate a post with duplicate confirmations.
- `get_post_failure_details(post_id)` rejects non-owners and returns owner/admin failure environment/note/date without contributor identity.
- Author-tested status requires a test date, non-empty environment, and verification steps; future test timestamps are rejected.
- `Postify verified` remains execution-derived from release artifacts and is not author-writable database metadata.
- Authenticated shelf state and Knowledge Gap requests persist; anonymous mode remains local-only.
- One author update creates revision history; re-verification advances the evidence version.
- `/knowledge-backend-status.json` returns `ready:true` after deployment.
- `/verification-runs.json` and `/knowledge/<slug>.<locale>.json` remain reachable.
- Run the full production Chromium suite and inspect console/page errors plus failed network requests.

## Rollback
Prefer frontend rollback first. Both Verified Knowledge migrations are additive/hardening-oriented; leaving new columns/tables in place is normally safer than destructive rollback. See `verified-knowledge-rollback.md` before any destructive database rollback.
