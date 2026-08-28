import { describe, expect, it } from 'vitest';
import { getPublishReadiness } from './publishReadiness';

describe('getPublishReadiness', () => {
  it('keeps required readiness separate from advisory structure', () => {
    const result = getPublishReadiness({ title: 'Useful title', body: 'x'.repeat(200) });
    expect(result.ready).toBe(true);
    expect(result.score).toBe(67);
  });

  it('recognizes useful rich structure', () => {
    const result = getPublishReadiness({
      title: 'Practical guide',
      body: 'x'.repeat(200),
      bodyHtml: '<h2>Steps</h2><p>Body</p>',
    });
    expect(result.ready).toBe(true);
    expect(result.score).toBe(100);
  });

  it('is not ready when core content is missing', () => {
    expect(getPublishReadiness({ title: 'Tiny', body: 'short' }).ready).toBe(false);
  });
});
