-- Keep the canonical automatic verification example on a supported Node.js LTS line.
-- This changes only prerequisite metadata; database evidence remains unverified and
-- Postify verification continues to be derived solely from release execution artifacts.

update public.posts
set prerequisites = '["Node.js 24 LTS"]'::jsonb,
    updated_at = now()
where slug = 'node-json-dogrulama'
  and prerequisites = '["Node.js 20+"]'::jsonb;
