import { describe, expect, it } from 'vitest';
import { formatPostDate, getPostPresentation, getPostType } from './postPresentation';

describe('postPresentation', () => {
  it('uses an explicit supported content type', () => {
    expect(getPostType({ contentType: 'decision' })).toBe('decision');
  });

  it('derives a guide from practical frontend content', () => {
    expect(getPostType({ category: 'Frontend', title: 'Performans rehberi' })).toBe('guide');
  });

  it('falls back safely for unknown content', () => {
    expect(getPostType({ category: 'Diğer', title: 'Bir not' })).toBe('fieldNote');
  });

  it('prefers a meaningful update over publication date', () => {
    const result = getPostPresentation({
      publishedAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-03T10:00:00.000Z',
      excerpt: 'Outcome',
    }, 'tr');
    expect(result.dateLabel).toBe('Son güncelleme');
    expect(result.dateValue).toBe('2026-08-03T10:00:00.000Z');
    expect(result.outcome).toBe('Outcome');
  });

  it('prefers review metadata when present', () => {
    const result = getPostPresentation({
      publishedAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-03T10:00:00.000Z',
      lastReviewedAt: '2026-08-04T10:00:00.000Z',
    }, 'en');
    expect(result.dateLabel).toBe('Last editor review');
    expect(result.dateValue).toBe('2026-08-04T10:00:00.000Z');
  });

  it('returns an empty string for invalid dates', () => {
    expect(formatPostDate('not-a-date', 'tr')).toBe('');
  });
});
