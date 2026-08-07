import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireSupabase = vi.fn(() => {
  throw new Error('Supabase unavailable');
});

vi.mock('../lib/supabase', () => ({ requireSupabase }));

const { default: postService } = await import('./postService');

describe('postService public fallback', () => {
  beforeEach(() => {
    requireSupabase.mockClear();
  });

  it('keeps the public list available when Supabase is unavailable', async () => {
    const posts = await postService.getAll({ locale: 'en' });

    expect(posts).toHaveLength(8);
    expect(posts[0].isFallback).toBe(true);
    expect(posts[0].title).toBe('An AI feature is a system, not a model call');
  });

  it('keeps detail, author posts, and stats available offline', async () => {
    const post = await postService.getById('ai-muhendisligi', 'tr');
    const authorPosts = await postService.getByUserId('fallback-editor', 'tr');
    const stats = await postService.getStats();

    expect(post.isFallback).toBe(true);
    expect(authorPosts).toHaveLength(8);
    expect(stats).toEqual({ posts: 8, authors: 1, comments: 0, isFallback: true });
  });
});

