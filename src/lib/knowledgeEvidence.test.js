import { describe, expect, it } from 'vitest';
import { getKnowledgeEvidence, getEvidenceCopy } from './knowledgeEvidence';

describe('knowledge evidence', () => {
  const now = new Date('2026-08-28T00:00:00Z');
  it('never invents verification when evidence is absent', () => {
    const result = getKnowledgeEvidence({}, now);
    expect(result.level).toBe('unverified');
    expect(result.hasEvidence).toBe(false);
    expect(result.freshness).toBe('unknown');
  });
  it('marks old author evidence as stale deterministically', () => {
    const result = getKnowledgeEvidence({ evidence: { level: 'author-tested', testedAt: '2025-01-01', staleAfterDays: 180 } }, now);
    expect(result.level).toBe('author-tested');
    expect(result.freshness).toBe('stale');
  });
  it('labels author evidence honestly', () => {
    expect(getEvidenceCopy({ evidence: { level: 'author-tested', testedAt: '2026-08-20' } }, 'tr', now).levelLabel).toBe('Yazar test etti');
  });
});
