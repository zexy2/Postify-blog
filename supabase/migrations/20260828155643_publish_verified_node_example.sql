-- Publish one real production example for the checked-in deterministic
-- verification contract. The database never stores `postify-verified`;
-- the frontend/exporter derive that label only when the displayed fenced
-- code exactly matches the checked-in manifest and the release run passed.

insert into public.posts (
  slug, title, excerpt, body, body_html, cover_image_url, category, reading_time,
  author_id, is_published, published_at, content_type, outcome, evidence_status,
  tested_at, stale_after_days, environment, prerequisites, verification_steps,
  caveats, sources, evidence_version
)
select
  'node-json-dogrulama',
  'Node.js örneğini “çalışmalı” diye değil, çalıştırarak doğrula',
  'Postify’ın ilk otomatik doğrulanabilir örneği: JSON parse ve assertion adımlarını gerçek Node.js runtime’ında çalıştır.',
  $post_tr$## Problem
Kod örnekleri çoğu teknik yazıda yalnızca okunur. Bu rehberde küçük ama deterministik bir Node.js örneğini gerçekten çalıştırıp beklenen çıktıyı doğruluyoruz.

## Kod

```js
import assert from 'node:assert/strict';
const payload = '{"ok":true,"items":[1,2,3]}';
const parsed = JSON.parse(payload);
assert.equal(parsed.ok, true);
assert.deepEqual(parsed.items, [1,2,3]);
process.stdout.write('PASS');
```

## Doğrulama
Build sırasında Postify yukarıda gösterilen aynı kodu daraltılmış deterministik release politikası altında ayrı bir Node.js child process’inde çalıştırır. Beklenen stdout tam olarak `PASS` değeridir. Çıktı eşleşmezse release gate başarısız olur. “Postify verified” etiketi yalnız bu gösterilen kod release artifactıyla birebir eşleştiğinde türetilir.$post_tr$,
  '',
  '/images/posts/gelistirici-akisi.webp',
  'Node.js',
  4,
  null,
  true,
  now(),
  'guide',
  'Node.js içinde gelen JSON verisini parse edip beklenen yapıyı assertion ile doğrulamak.',
  'unverified',
  null,
  90,
  '[]'::jsonb,
  '["Node.js 20+"]'::jsonb,
  '["Yerelde / locally: node node-json-parse-v1.mjs → stdout PASS"]'::jsonb,
  '["Deterministic checked-in code only; no external packages, network, filesystem or process APIs."]'::jsonb,
  '["https://nodejs.org/api/assert.html"]'::jsonb,
  1
where not exists (select 1 from public.posts where slug = 'node-json-dogrulama');

insert into public.post_translations (post_id, locale, title, excerpt, body, body_html)
select p.id::text, 'tr',
  'Node.js örneğini “çalışmalı” diye değil, çalıştırarak doğrula',
  'Postify’ın ilk otomatik doğrulanabilir örneği: JSON parse ve assertion adımlarını gerçek Node.js runtime’ında çalıştır.',
  p.body, ''
from public.posts p
where p.slug = 'node-json-dogrulama'
on conflict (post_id, locale) do nothing;

insert into public.post_translations (post_id, locale, title, excerpt, body, body_html)
select p.id::text, 'en',
  'Verify a Node.js example by running it, not by saying it should work',
  'Postify’s first automatically verifiable example runs JSON parsing and assertions in a real Node.js runtime.',
  $post_en$## Problem
Code samples are usually only read. Here a small deterministic Node.js example is actually executed and its expected output is checked.

## Code

```js
import assert from 'node:assert/strict';
const payload = '{"ok":true,"items":[1,2,3]}';
const parsed = JSON.parse(payload);
assert.equal(parsed.ok, true);
assert.deepEqual(parsed.items, [1,2,3]);
process.stdout.write('PASS');
```

## Verification
During the build Postify runs the exact code displayed above under the deterministic release policy in a Node.js child process. Expected stdout is exactly `PASS`. If it differs, the release gate fails. The “Postify verified” label is derived only when this displayed code exactly matches the checked-in release artifact.$post_en$,
  ''
from public.posts p
where p.slug = 'node-json-dogrulama'
on conflict (post_id, locale) do nothing;
