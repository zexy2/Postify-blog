# Verified Knowledge production apply

## Migration chain
Production project `fuiwcrqmxndguxymwoin` was migrated through authenticated Supabase management access on 2026-08-28. Remote migration history is aligned to these repository versions:
1. `migrations/20260828144726_postify_base_schema.sql`
2. `migrations/20260828144744_postify_content_model.sql`
3. `migrations/20260828144758_postify_security_and_storage.sql`
4. `migrations/20260828144831_verified_knowledge.sql`
5. `migrations/20260828144850_evidence_integrity_and_privacy.sql`
6. `migrations/20260828145543_production_security_and_advisor_hardening.sql`
7. `migrations/20260828155643_publish_verified_node_example.sql`
8. `migrations/20260828161849_private_rpc_boundary.sql`
9. `migrations/20260828171756_update_node_verification_lts.sql`

Do not repair or rewrite production migration history. Future migrations must be additive files after the last recorded version.

## Preconditions
- Take a Supabase schema backup/snapshot before any production migration.
- Confirm current production base/content/storage schema is healthy.
- Use Supabase CLI/SQL Editor or another authenticated owner channel; never expose the database password, PAT, or service-role secret to browser code.
- Run the CI PostgreSQL schema/RLS gate and local Chromium product suite against the exact source SHA intended for release.

## Safe apply sequence
1. Link the CLI to the production project using owner credentials.
2. Inspect remote migration history before `db push`; do not guess or repair history blindly.
3. Run a remote migration dry-run where supported and inspect the SQL list.
4. Apply only genuinely pending migrations in order; production currently has all nine versions above.
5. Run read-only schema probes for the added post evidence columns, tables, views, functions, trigger, constraints and RLS policies.
6. Rebuild/deploy the frontend. The deploy export step must switch `knowledge-backend-status.json` from `ready:false` to `ready:true` only when the new public evidence views are actually queryable.

## Verification immediately after apply
- Public content still reads existing posts/translations without data loss.
- `post_evidence_summary`, aggregate `post_failure_reports`, and sanitized `post_revision_history` are publicly readable.
- Anonymous/authenticated users cannot read raw `post_confirmations` belonging to another user or raw `post_revisions` snapshots.
- Author cannot confirm their own post; one user cannot inflate a post with duplicate confirmations.
- `get_post_failure_details(post_id)` rejects non-owners and returns owner/admin failure environment/note/date without contributor identity.
- Public authenticated RPC wrappers remain SECURITY INVOKER; required privileged work is delegated only to authenticated-only helpers in the non-exposed `private` schema.
- Author-tested status requires a test date, non-empty environment, and verification steps; future test timestamps are rejected.
- `Postify verified` remains execution-derived from release artifacts and is not author-writable database metadata.
- Authenticated shelf state and Knowledge Gap requests persist; anonymous mode remains local-only.
- One author update creates revision history; re-verification advances the evidence version.
- `/knowledge-backend-status.json` returns `ready:true` after deployment.
- `/verification-runs.json` and `/knowledge/<slug>.<locale>.json` remain reachable.
- Run the full production Chromium suite and inspect console/page errors plus failed network requests.

## Rollback
Prefer frontend rollback first. The Verified Knowledge migration chain is additive/hardening-oriented; leaving new columns/tables in place is normally safer than destructive rollback. See `verified-knowledge-rollback.md` before any destructive database rollback.
