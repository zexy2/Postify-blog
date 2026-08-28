---
name: postify-ui-review
description: "Use for every Postify UI/UX change. Enforces an editorial + developer-tool visual system, real browser review, responsive quality, accessibility, and anti-template checks before considering UI work complete."
---

# Postify UI Review

Use this skill for any task that changes Postify's visible interface, interaction model, information hierarchy, or responsive behavior.

## Product direction

Postify should feel like an editorial knowledge product crossed with a precise developer tool: calm, readable, information-dense, trustworthy, and intentional. It must not look like a generic blog template, a startup landing-page kit, or an effect demo.

## Hard rules

- Prefer hierarchy, typography, spacing, and information design over decoration.
- Do not add gradients, glow, glassmorphism, animated backgrounds, custom cursors, marquees, shimmer, parallax, or decorative motion unless they solve a specific user problem and survive review.
- Avoid card-inside-card layouts and unnecessary bordered containers.
- Do not create a new visual primitive if an existing token/component can be reused or simplified.
- Do not use fake social proof, fake activity, fake verification, invented counts, or unsupported trust labels.
- Evidence and freshness language must reflect actual stored data.
- Mobile is not a scaled-down desktop layout. Check touch targets, hierarchy, overflow, sticky controls, and editor ergonomics separately.
- Accessibility is a release gate: keyboard navigation, visible focus, semantic headings, labels, contrast, and reduced-motion behavior must remain usable.
- A passing build is not proof of a good UI.

## Required workflow

1. Query Graphify first when `graphify-out/graph.json` exists. Identify the page, its shared components, and likely impact radius before editing.
2. Inspect the current page and relevant shared styles/components. Prefer deleting visual noise over layering more CSS on top.
3. State the user-facing problem being solved in one sentence before implementation.
4. Implement the smallest coherent redesign slice that creates a clearly visible improvement.
5. Run focused tests plus lint/build as appropriate.
6. Open the real page in a browser/Playwright and inspect it at minimum at 1440px and 390px widths.
7. Check these failure modes explicitly:
   - generic template / portfolio aesthetic
   - weak content hierarchy
   - excessive empty space
   - too many cards/borders
   - inconsistent type scale or spacing
   - decorative effects competing with content
   - navigation clutter
   - hidden or ambiguous primary action
   - mobile overflow or cramped controls
   - trust/evidence labels that overclaim
8. Capture/compare screenshots for major surfaces. For V3 baseline coverage prioritize Home, Article, Editor, and mobile Home/Article.
9. Re-query/update Graphify after code changes when useful: `graphify update src` or rebuild the focused graph.
10. Do not call the UI task complete until visual browser inspection is clean.

## V3 priority order

1. Global visual system and header/navigation
2. Home page hierarchy and content discovery
3. Post card system
4. Article reading/trust surface
5. Create/Edit editor and evidence inspector
6. Profile, bookmarks, knowledge dashboard
7. Empty/loading/error states
8. Motion/polish only after layout and hierarchy are stable

## Acceptance bar

A successful change should make an unprompted user notice that Postify looks more coherent and mature without needing an explanation of what changed. If the improvement is mainly visible in code, tests, or architecture rather than on the page, it is not sufficient for a UI V3 milestone.
