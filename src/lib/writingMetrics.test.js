import { describe, expect, it } from 'vitest';
import { getWritingMetrics } from './writingMetrics';

describe('getWritingMetrics', () => {
  it('returns zeros for an empty draft', () => {
    expect(getWritingMetrics('')).toEqual({ characters: 0, words: 0, readingMinutes: 0 });
  });
  it('counts whitespace-separated words', () => {
    expect(getWritingMetrics('one two\nthree').words).toBe(3);
  });
  it('rounds reading time up', () => {
    expect(getWritingMetrics(Array(221).fill('word').join(' ')).readingMinutes).toBe(2);
  });
});
