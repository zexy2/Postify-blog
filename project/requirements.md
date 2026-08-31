# Postify Requirements

## MVP product requirements
1. The homepage must explain Postify's utility within the first viewport without describing itself as “another blog”.
2. Content must be browsable by useful intent/type in addition to topic/category.
3. Feed items must communicate title, outcome/excerpt, topic, content type, reading time, and date without visual clutter.
4. Article pages must expose a compact “what you will get” / summary layer before the long body.
5. Trust labels must never imply external verification unless a real verification workflow exists.
6. Existing fallback content must remain fully usable without Supabase.
7. Existing Supabase-backed posts must render even when they do not yet have new structured metadata.
8. Authentication, bookmarks, comments, editor, admin and existing routes must remain functional unless intentionally changed later.
9. UI must be usable on phone and desktop, keyboard-accessible, and respect reduced-motion preferences.

## Quality gates
- ESLint: no new errors; do not increase existing warning count.
- Production build must pass.
- No hard dependency on a new backend field during the product-validation phase.
- No fabricated engagement numbers, source counts, verification claims, or author statistics.
