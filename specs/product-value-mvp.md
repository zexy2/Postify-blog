# Spec — Product Value MVP

## Goal
Make the current frontend feel like a useful product for practical technical knowledge before changing Supabase.

## Primary user story
As a reader with a concrete technical question or decision, I can quickly see what an item will help me accomplish, how long it takes to read, what kind of content it is, and when it was last edited, then enter a focused article view.

## Acceptance criteria
1. First viewport states a concrete value proposition centered on usable knowledge.
2. Homepage removes marquee/glow-dependent identity from the primary discovery path.
3. Posts display a derived content type (Guide / Decision / Explainer / Field Note) without requiring a database migration.
4. Feed is readable as a dense, calm list/grid; metadata never overwhelms title/outcome.
5. Article header includes content type, reading time, and neutral last-edited/reviewed information.
6. Article includes a concise “what you will get” panel using existing excerpt/outcome data.
7. Old Supabase rows with no new metadata still render safely.
8. Turkish and English labels are supported.
9. Lint produces no new warnings/errors; production build passes.

## Non-goals
- No recommendation algorithm.
- No payment/subscription implementation.
- No final structured-content database migration.
- No claim that current posts are externally verified or source-audited.
