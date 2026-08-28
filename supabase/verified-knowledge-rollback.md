# Verified Knowledge migration rollback

The Verified Knowledge migration chain is designed so the safest incident response is usually **frontend rollback without destructive database rollback**.

## First response
1. Stop new Verified Knowledge writes by deploying the previous known-good frontend.
2. Preserve `post_confirmations`, `post_revisions`, `knowledge_gaps`, `knowledge_gap_requests`, and `user_knowledge_shelf`.
3. Diagnose the specific policy/function/view failure before altering production data.

## Hardening migration rollback
If `20260828144850_evidence_integrity_and_privacy.sql` itself causes a production incompatibility, prefer a forward fix. A temporary rollback would require carefully restoring the previous view/policy contracts; do not drop evidence tables or snapshots merely to restore reads.

## Destructive rollback — last resort only
Before any destructive rollback, export all Verified Knowledge tables and the affected `posts` evidence columns. Only then consider dropping helper triggers/functions/views/tables and finally the added post columns. Never use destructive rollback as the first response to a frontend, RLS, or deploy issue.
