# Postify — Project Context

## Current product
Postify is a React 19/Vite publishing application with Supabase-backed content/authentication and a local fallback catalog. It already contains post creation/editing, profiles, bookmarks, comments, admin flows, i18n, dark/light themes, PWA support, and analytics-related UI.

## Current stack
- React 19 + Vite 7
- React Router 7
- Redux Toolkit + TanStack Query
- Supabase client (database/auth integration kept for later product validation)
- TipTap editor
- CSS Modules + global design tokens
- Vitest/Playwright dependencies are installed, but `package.json` currently has no `test` script
- Docker build uses Node 20 Alpine and Nginx

## Current baseline (2026-08-28)
- `npm run lint`: passes with one existing React Hooks warning in `src/components/ui/design-testimonial.jsx`
- `npm run build`: passes
- Existing homepage is a generic editorial/blog feed with a large hero, marquee, categories, featured story, and glow-card feed.
- Fallback content is mostly Turkish/English technical product and software-engineering writing.

## Product problem
The codebase has many conventional blog features but no compelling reason for a reader or author to choose it over established networks such as Medium, Substack, Hashnode, or DEV.

## Repositioning hypothesis
Postify should become a practical knowledge network for builders rather than a generic blog platform.

Reader promise: **“Do not just read it. Use it.”**

Content primitives:
- Guide — accomplish a concrete task
- Decision note — compare choices and trade-offs
- Explainer — understand a concept quickly and accurately
- Field note — concise experience/report from real work

Trust/utility primitives (frontend-first; no fake claims):
- visible last-edited/reviewed date when data exists
- clear content type and expected outcome
- concise summary before the long body
- later: sources, version/environment, ‘worked for me’, revision history, author credibility signals

## Deferred
- Final Supabase schema and migrations
- Payments/monetization
- Large-scale social graph/recommendation system
- Native mobile apps
