# Postify Agent Working Agreement

## Start every task
1. Read `project-context.md`, `progress.md`, `known-issues.md`, and the relevant file under `specs/`.
2. Inspect the current code before changing it. Do not assume a route, service, schema, or script exists.
3. Preserve existing authentication/Supabase behavior unless the task explicitly changes it.
4. Separate verified facts from assumptions. Do not claim tests, browser checks, sources, or deployments that were not actually run.

## Product direction
Postify is not a generic Medium clone. The product is being repositioned around practical, structured, freshness-aware knowledge for builders: guides, decision notes, explainers, and field notes.

Every product change should improve at least one of these outcomes:
- a reader finds the right answer faster;
- a reader understands whether the content is current and applicable;
- an author can publish reusable knowledge instead of an unstructured blog post;
- useful content remains portable and discoverable outside Postify.

## Implementation loop
1. Pick the smallest incomplete acceptance criterion.
2. Reproduce/inspect the current behavior.
3. Make the smallest coherent change.
4. Run lint and production build; run narrower tests when available.
5. Review the diff for regressions and accidental scope creep.
6. Update `progress.md`, `decisions.md`, and `known-issues.md` when relevant.

## Quality rules
- Do not add decorative UI without a reader or author job to justify it.
- Prefer quiet hierarchy, readable typography, keyboard access, and mobile ergonomics over glass/glow effects.
- No fake social proof, fake live data, fake verification badges, or invented source counts.
- New trust/freshness labels must be backed by explicit data or use neutral wording such as “last edited”.
- Supabase schema changes are deferred until the product model is validated in the frontend.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Postify UI Review

For any visible Postify UI/UX change, follow `.codex/skills/postify-ui-review/SKILL.md`. A passing build is not enough: use Graphify for impact analysis, inspect the actual browser result on desktop and mobile, and reject generic template aesthetics or decorative effects that compete with content.
