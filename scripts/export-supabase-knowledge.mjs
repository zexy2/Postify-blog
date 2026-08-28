import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { getAutomaticVerificationIdForPost } from '../src/content/verificationManifest.js';

const url = process.env.VITE_SUPABASE_URL?.trim();
const key = process.env.VITE_SUPABASE_ANON_KEY?.trim();
if (!url || !key) throw new Error('Supabase public deploy credentials are required for knowledge export');

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const postFields = 'id,slug,title,excerpt,body,category,content_type,outcome,evidence_status,tested_at,stale_after_days,environment,prerequisites,verification_steps,caveats,sources,evidence_version,author_id,published_at,updated_at';
const isSchemaPending = (error) => {
  if (!error) return false;
  const code = String(error.code || '');
  const message = String(error.message || '').toLowerCase();
  return ['42703', '42P01', 'PGRST204', 'PGRST205'].includes(code)
    || message.includes('post_evidence_summary')
    || message.includes('evidence_status')
    || message.includes('content_type');
};

const [{ data: posts, error: postsError }, { data: summaries, error: summaryError }] = await Promise.all([
  supabase.from('posts').select(postFields).eq('is_published', true).order('published_at', { ascending: false }),
  supabase.from('post_evidence_summary').select('*'),
]);

if (isSchemaPending(postsError) || isSchemaPending(summaryError)) {
  await mkdir('docs', { recursive: true });
  await writeFile('docs/knowledge-backend-status.json', `${JSON.stringify({ schemaVersion: 1, ready: false, mode: 'supabase-schema-pending', checkedAt: new Date().toISOString() }, null, 2)}\n`);
  console.warn('::warning title=Verified Knowledge production schema pending::Keeping build-generated fallback knowledge artifacts until the production migration is applied.');
  process.exit(0);
}
if (postsError) throw postsError;
if (summaryError) throw summaryError;

const ids = (posts || []).map((post) => String(post.id));
const [{ data: translations, error: translationError }, { data: profiles, error: profilesError }] = await Promise.all([
  ids.length ? supabase.from('post_translations').select('post_id,locale,title,excerpt,body').in('post_id', ids) : Promise.resolve({ data: [], error: null }),
  supabase.from('profiles').select('id,full_name,username'),
]);
if (translationError) throw translationError;
if (profilesError) throw profilesError;

const summaryById = new Map((summaries || []).map((item) => [String(item.post_id), item]));
const profileById = new Map((profiles || []).map((item) => [String(item.id), item]));
const translationsByPost = new Map();
for (const translation of translations || []) {
  const postId = String(translation.post_id);
  if (!translationsByPost.has(postId)) translationsByPost.set(postId, []);
  translationsByPost.get(postId).push(translation);
}

const verification = JSON.parse(await readFile('docs/verification-runs.json', 'utf8'));
const runtimeStatus = JSON.parse(await readFile('docs/runtime-release-status.json', 'utf8'));
if (!verification?.runs || typeof verification.runs !== 'object') {
  throw new Error('Production verification-runs.json is missing a runs object');
}

await rm('docs/knowledge', { recursive: true, force: true });
await mkdir('docs/knowledge', { recursive: true });
let count = 0;
for (const post of posts || []) {
  const variants = translationsByPost.get(String(post.id)) || [{ locale: 'tr', title: post.title, excerpt: post.excerpt, body: post.body }];
  for (const translation of variants) {
    const author = profileById.get(String(post.author_id));
    const body = translation.body || post.body;
    const automaticVerificationId = getAutomaticVerificationIdForPost({ slug: post.slug, body });
    const automaticVerification = automaticVerificationId ? verification.runs[automaticVerificationId] || null : null;
    if (automaticVerificationId && !automaticVerification) {
      throw new Error(`Missing verification run for ${automaticVerificationId}`);
    }
    const artifact = {
      schemaVersion: 1,
      id: post.id,
      slug: post.slug,
      locale: translation.locale,
      title: translation.title || post.title,
      outcome: post.outcome || translation.excerpt || post.excerpt,
      body,
      contentType: post.content_type,
      category: post.category,
      publishedAt: post.published_at,
      updatedAt: post.updated_at,
      author: author ? { name: author.full_name || author.username, username: author.username } : null,
      evidence: {
        level: post.evidence_status,
        testedAt: post.tested_at,
        staleAfterDays: post.stale_after_days,
        environment: post.environment || [],
        prerequisites: post.prerequisites || [],
        verificationSteps: post.verification_steps || [],
        caveats: post.caveats || [],
        sources: post.sources || [],
        version: post.evidence_version,
        community: summaryById.get(String(post.id)) || null,
        automaticVerification,
        runtimeReleaseSignal: automaticVerificationId ? runtimeStatus.checks?.[automaticVerificationId] || null : null,
      },
      canonicalUrl: `https://postify.zekiakgul.dev/posts/${post.slug}`,
    };
    await writeFile(`docs/knowledge/${post.slug}.${translation.locale}.json`, `${JSON.stringify(artifact, null, 2)}\n`);
    count += 1;
  }
}
await writeFile('docs/knowledge-backend-status.json', `${JSON.stringify({ schemaVersion: 1, ready: true, mode: 'supabase', checkedAt: new Date().toISOString(), exportedArtifacts: count }, null, 2)}\n`);
console.log(`Supabase knowledge export PASS: ${count} artifact(s)`);
