/**
 * Canonical post service.
 *
 * Supabase is the canonical source. The local catalogue is read-only and is
 * used only when the public read path is unavailable, so the site remains
 * useful while a free-tier project wakes up or is temporarily paused.
 */

import { requireSupabase } from '../lib/supabase';
import { getKnowledgeBackendStatus } from '../lib/knowledgeBackendStatus';
import {
  FALLBACK_AUTHOR,
  getFallbackPost,
  getFallbackPosts,
  getFallbackStats,
  getFallbackUserPosts,
} from '../content/fallbackPosts';

const LEGACY_POST_FIELDS = [
  'id',
  'slug',
  'title',
  'excerpt',
  'body',
  'body_html',
  'cover_image_url',
  'category',
  'reading_time',
  'author_id',
  'is_published',
  'created_at',
  'published_at',
  'updated_at',
].join(',');

const POST_FIELDS = [
  LEGACY_POST_FIELDS,
  'content_type',
  'outcome',
  'evidence_status',
  'tested_at',
  'stale_after_days',
  'environment',
  'prerequisites',
  'verification_steps',
  'caveats',
  'sources',
  'evidence_version',
].join(',');

export const isKnowledgeSchemaMissing = (error) => {
  if (!error) return false;
  const code = String(error.code || '');
  const message = String(error.message || '').toLowerCase();
  return ['42703', '42P01', '42883', 'PGRST202', 'PGRST204', 'PGRST205'].includes(code)
    || message.includes('post_evidence_summary')
    || message.includes('evidence_status')
    || message.includes('content_type')
    || message.includes('capture_post_revision')
    || message.includes('reverify_post');
};

const knowledgeSchemaPendingError = (cause) => {
  const error = new Error('Verified Knowledge backend upgrade is pending. Public reading remains available; evidence writes will activate after the production migration.');
  error.code = 'KNOWLEDGE_SCHEMA_PENDING';
  error.cause = cause;
  return error;
};

export const getPostFieldsForCapability = (ready) => ready ? POST_FIELDS : LEGACY_POST_FIELDS;

const runCompatiblePostQuery = async (queryFactory) => {
  const backend = await getKnowledgeBackendStatus();
  const preferredFields = getPostFieldsForCapability(backend.ready === true);
  let result = await queryFactory(preferredFields);
  if (preferredFields !== LEGACY_POST_FIELDS && isKnowledgeSchemaMissing(result?.error)) {
    result = await queryFactory(LEGACY_POST_FIELDS);
  }
  return result;
};

const LOCAL_POST_IMAGES = new Set([
  'ai-muhendisligi.webp',
  'web-standartlari.webp',
  'frontend-performansi.webp',
  'urun-tasarimi.webp',
  'edge-mimarileri.webp',
  'gelistirici-akisi.webp',
  'teknik-yazarlik.webp',
  'urun-telemetrisi.webp',
]);

export const normalizeCoverImageUrl = (value) => {
  const source = String(value || '').trim();
  if (!source) return '/images/posts/frontend-performansi.webp';

  const filename = source.split('/').pop()?.toLowerCase() || '';
  if (!/\.(jpe?g|png)$/i.test(filename)) return source;

  const webpFilename = filename.replace(/\.(jpe?g|png)$/i, '.webp');
  return LOCAL_POST_IMAGES.has(webpFilename)
    ? `/images/posts/${webpFilename}`
    : source;
};

const toAuthor = (profile) => {
  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.full_name || profile.username || 'Postify Editor',
    fullName: profile.full_name || profile.username || 'Postify Editor',
    username: profile.username || '',
    email: profile.email || '',
    avatarUrl: profile.avatar_url || null,
    avatar_url: profile.avatar_url || null,
    bio: profile.bio || '',
    role: profile.role || 'user',
  };
};

const getTranslations = async (client, postIds, locale) => {
  if (!postIds.length) return new Map();

  const { data, error } = await client
    .from('post_translations')
    .select('post_id, locale, title, excerpt, body, body_html')
    .in('post_id', postIds.map(String))
    .eq('locale', locale);

  if (error) throw error;
  return new Map((data || []).map((translation) => [String(translation.post_id), translation]));
};

const getAuthors = async (client, authorIds) => {
  if (!authorIds.length) return new Map();

  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, username, email, avatar_url, bio, role')
    .in('id', authorIds);

  if (error) throw error;
  return new Map((data || []).map((profile) => [String(profile.id), toAuthor(profile)]));
};

const getEvidenceSummaries = async (client, postIds) => {
  if (!postIds.length) return new Map();
  const backend = await getKnowledgeBackendStatus();
  if (!backend.ready) return new Map();
  const { data, error } = await client.from('post_evidence_summary').select('*').in('post_id', postIds);
  if (isKnowledgeSchemaMissing(error)) return new Map();
  if (error) throw error;
  return new Map((data || []).map((item) => [String(item.post_id), item]));
};

const getCommentCounts = async (client, postIds) => {
  if (!postIds.length) return new Map();

  const { data, error } = await client
    .from('comments')
    .select('post_id')
    .in('post_id', postIds);

  if (error) throw error;

  return (data || []).reduce((counts, comment) => {
    const key = String(comment.post_id);
    counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map());
};

const normalizePost = (row, translation, author, commentCount = 0, evidenceSummary = null) => ({
  id: row.id,
  slug: row.slug,
  title: translation?.title || row.title || '',
  excerpt: translation?.excerpt || row.excerpt || '',
  body: translation?.body || row.body || '',
  bodyHtml: translation?.body_html || row.body_html || '',
    coverImageUrl: normalizeCoverImageUrl(row.cover_image_url),
    coverImageAlt: translation?.title || row.title || row.category || 'Postify yazısı',
  category: row.category || 'Web geliştirme',
  readingTime: Number(row.reading_time) || 1,
  authorId: row.author_id,
  author: author || {
    id: row.author_id,
    name: 'Postify Editor',
    fullName: 'Postify Editor',
    username: 'postify',
  },
  isPublished: row.is_published !== false,
  createdAt: row.created_at,
  publishedAt: row.published_at || row.created_at,
  updatedAt: row.updated_at || row.published_at || row.created_at,
  contentType: row.content_type || undefined,
  outcome: row.outcome || translation?.excerpt || row.excerpt || '',
  evidence: {
    level: row.evidence_status || 'unverified',
    testedAt: row.tested_at || null,
    staleAfterDays: Number(row.stale_after_days) || 180,
    environment: Array.isArray(row.environment) ? row.environment : [],
    prerequisites: Array.isArray(row.prerequisites) ? row.prerequisites : [],
    verificationSteps: Array.isArray(row.verification_steps) ? row.verification_steps : [],
    caveats: Array.isArray(row.caveats) ? row.caveats : [],
    sources: Array.isArray(row.sources) ? row.sources : [],
    version: Number(row.evidence_version) || 1,
  },
  evidenceSummary,
  commentCount,
});

const mapRows = async (rows, locale) => {
  const client = requireSupabase();
  const postIds = rows.map((row) => row.id);
  const authorIds = [...new Set(rows.map((row) => row.author_id).filter(Boolean).map(String))];
  const [translations, authors, commentCounts, evidenceSummaries] = await Promise.all([
    getTranslations(client, postIds, locale),
    getAuthors(client, authorIds),
    getCommentCounts(client, postIds),
    getEvidenceSummaries(client, postIds),
  ]);

  return rows.map((row) => normalizePost(
    row,
    translations.get(String(row.id)),
    authors.get(String(row.author_id)),
    commentCounts.get(String(row.id)) || 0,
    evidenceSummaries.get(String(row.id)) || null,
  ));
};

const getPostRow = async (identifier) => {
  const client = requireSupabase();
  const bySlug = await runCompatiblePostQuery((fields) => client.from('posts').select(fields).eq('slug', identifier).maybeSingle());
  if (bySlug.error) throw bySlug.error;
  if (bySlug.data) return bySlug.data;

  const byId = await runCompatiblePostQuery((fields) => client.from('posts').select(fields).eq('id', identifier).maybeSingle());
  if (byId.error) throw byId.error;
  return byId.data;
};

export const postService = {
  getAll: async ({ locale = 'tr', search = '' } = {}) => {
    try {
      const client = requireSupabase();
      const runQuery = (fields) => {
        let query = client
          .from('posts')
          .select(fields)
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (search.trim()) {
          const term = search.trim().replace(/[,()]/g, ' ');
          query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,body.ilike.%${term}%`);
        }
        return query;
      };

      const { data, error } = await runCompatiblePostQuery(runQuery);
      if (error) throw error;
      return mapRows(data || [], locale);
    } catch {
      // Public reading must not become a blank page when Supabase is asleep.
      // Mutations below intentionally remain Supabase-only.
      return getFallbackPosts(locale);
    }
  },

  getById: async (identifier, locale = 'tr') => {
    try {
      const row = await getPostRow(identifier);
      if (!row) return null;
      const [post] = await mapRows([row], locale);
      return post;
    } catch {
      return getFallbackPost(identifier, locale);
    }
  },

  getByUserId: async (userId, locale = 'tr') => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!userId || userId === FALLBACK_AUTHOR.id || !isUuid) return getFallbackUserPosts(userId, locale);

    const client = requireSupabase();
    const { data, error } = await runCompatiblePostQuery((fields) => client
      .from('posts')
      .select(fields)
      .eq('author_id', userId)
      .eq('is_published', true)
      .order('published_at', { ascending: false }));
    if (error) throw error;
    return mapRows(data || [], locale);
  },

  create: async ({
    title,
    body,
    bodyHtml = '',
    excerpt = '',
    category = 'Web geliştirme',
    coverImageUrl = '/images/posts/frontend-performansi.webp',
    readingTime = 4,
    slug,
    locale = 'tr',
    contentType = 'guide',
    outcome = '',
    evidence = {},
  }) => {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) throw new Error('Yazı oluşturmak için giriş yapmalısınız.');

    const generatedSlug = slug || title
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: row, error } = await client
      .from('posts')
      .insert({
        slug: generatedSlug,
        excerpt,
        body,
        body_html: bodyHtml,
        category,
        cover_image_url: coverImageUrl,
        reading_time: readingTime,
        author_id: authData.user.id,
        is_published: true,
        published_at: new Date().toISOString(),
        content_type: contentType,
        outcome,
        evidence_status: evidence.level || 'unverified',
        tested_at: evidence.testedAt || null,
        stale_after_days: evidence.staleAfterDays || 180,
        environment: evidence.environment || [],
        prerequisites: evidence.prerequisites || [],
        verification_steps: evidence.verificationSteps || [],
        caveats: evidence.caveats || [],
        sources: evidence.sources || [],
      })
      .select(POST_FIELDS)
      .single();
    if (isKnowledgeSchemaMissing(error)) throw knowledgeSchemaPendingError(error);
    if (error) throw error;

    const { error: translationError } = await client.from('post_translations').insert({
      post_id: String(row.id),
      locale,
      title,
      excerpt,
      body,
      body_html: bodyHtml,
    });
    if (translationError) throw translationError;

    return postService.getById(row.id, locale);
  },

  update: async (id, data) => {
    const client = requireSupabase();
    const { error: revisionError } = await client.rpc('capture_post_revision', { target_post_id: id, revision_reason: data.revisionReason || 'Content/evidence update' });
    if (isKnowledgeSchemaMissing(revisionError)) throw knowledgeSchemaPendingError(revisionError);
    if (revisionError) throw revisionError;
    const { locale = 'tr', ...postData } = data;
    delete postData.revisionReason;
    const updates = {
      ...(postData.excerpt !== undefined && { excerpt: postData.excerpt }),
      ...(postData.body !== undefined && { body: postData.body }),
      ...(postData.bodyHtml !== undefined && { body_html: postData.bodyHtml }),
      ...(postData.category !== undefined && { category: postData.category }),
      ...(postData.coverImageUrl !== undefined && { cover_image_url: postData.coverImageUrl }),
      ...(postData.readingTime !== undefined && { reading_time: postData.readingTime }),
      ...(postData.contentType !== undefined && { content_type: postData.contentType }),
      ...(postData.outcome !== undefined && { outcome: postData.outcome }),
      ...(postData.evidence !== undefined && {
        evidence_status: postData.evidence.level || 'unverified',
        tested_at: postData.evidence.testedAt || null,
        stale_after_days: postData.evidence.staleAfterDays || 180,
        environment: postData.evidence.environment || [],
        prerequisites: postData.evidence.prerequisites || [],
        verification_steps: postData.evidence.verificationSteps || [],
        caveats: postData.evidence.caveats || [],
        sources: postData.evidence.sources || [],
        evidence_version: postData.evidence.version || 1,
      }),
      updated_at: new Date().toISOString(),
    };

    if (Object.keys(updates).length > 1) {
      const { error } = await client.from('posts').update(updates).eq('id', id);
      if (isKnowledgeSchemaMissing(error)) throw knowledgeSchemaPendingError(error);
      if (error) throw error;
    }

    if (postData.title !== undefined || postData.excerpt !== undefined || postData.body !== undefined) {
      const { error } = await client.from('post_translations').upsert({
        post_id: String(id),
        locale,
        ...(postData.title !== undefined && { title: postData.title }),
        ...(postData.excerpt !== undefined && { excerpt: postData.excerpt }),
        ...(postData.body !== undefined && { body: postData.body }),
        ...(postData.bodyHtml !== undefined && { body_html: postData.bodyHtml }),
      }, { onConflict: 'post_id,locale' });
      if (error) throw error;
    }

    return postService.getById(id, locale);
  },

  delete: async (id) => {
    const { error } = await requireSupabase().from('posts').delete().eq('id', id);
    if (error) throw error;
  },

  getComments: async (postId) => {
    const { commentService } = await import('./commentService');
    return commentService.getPublicByPostId(postId);
  },

  getStats: async () => {
    try {
      const client = requireSupabase();
      const [postsResult, commentsResult, authorsResult] = await Promise.all([
        client.from('posts').select('id', { count: 'exact', head: true }).eq('is_published', true),
        client.from('comments').select('id', { count: 'exact', head: true }),
        client.from('posts').select('author_id').eq('is_published', true),
      ]);

      for (const result of [postsResult, commentsResult, authorsResult]) {
        if (result.error) throw result.error;
      }

      return {
        posts: postsResult.count || 0,
        comments: commentsResult.count || 0,
        authors: new Set((authorsResult.data || []).map((row) => row.author_id).filter(Boolean)).size,
      };
    } catch {
      return getFallbackStats();
    }
  },
};

export default postService;
