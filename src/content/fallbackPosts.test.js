import { describe, expect, it } from 'vitest';
import {
  FALLBACK_AUTHOR,
  getFallbackPost,
  getFallbackPosts,
  getFallbackStats,
  getFallbackUserPosts,
} from './fallbackPosts';

describe('fallback public catalogue', () => {
  it('contains a complete Turkish and English reading catalogue', () => {
    const turkishPosts = getFallbackPosts('tr');
    const englishPosts = getFallbackPosts('en');

    expect(turkishPosts).toHaveLength(8);
    expect(englishPosts).toHaveLength(8);
    expect(turkishPosts.every((post) => post.isFallback && post.coverImageUrl && post.slug)).toBe(true);
    expect(englishPosts[0].title).toBe('An AI feature is a system, not a model call');
    expect(turkishPosts[0].author.id).toBe(FALLBACK_AUTHOR.id);
  });

  it('resolves a post by slug and keeps unknown posts absent', () => {
    expect(getFallbackPost('frontend-performansi', 'tr').title).toContain('Frontend performansı');
    expect(getFallbackPost('not-a-real-post', 'tr')).toBeNull();
  });

  it('provides honest fallback stats and author posts', () => {
    expect(getFallbackStats()).toEqual({ posts: 8, authors: 1, comments: 0, isFallback: true });
    expect(getFallbackUserPosts(FALLBACK_AUTHOR.id, 'en')).toHaveLength(8);
    expect(getFallbackUserPosts('another-user', 'en')).toEqual([]);
  });
});

