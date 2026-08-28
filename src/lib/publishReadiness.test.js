import { describe, expect, it } from 'vitest';
import { dateInputToTimestamp, getLocalDateInputValue, getPublishReadiness, hasMeaningfulEvidenceEntry, timestampToLocalDateInputValue } from './publishReadiness';

const core = { title: 'Useful title', body: 'x'.repeat(200) };
const evidence = {
  testedAt: '2026-08-28',
  environment: 'Node 24.20.0',
  verificationSteps: 'Run the check and confirm PASS output',
};

describe('getPublishReadiness', () => {
  it('keeps publication readiness identical to the real title/body submit gate', () => {
    const ready = getPublishReadiness(core);
    expect(ready.publication.ready).toBe(true);
    expect(ready.ready).toBe(true);
    expect(ready.evidence.level).toBe('unverified');
  });

  it('does not block publication when outcome or evidence metadata is absent', () => {
    const result = getPublishReadiness(core);
    expect(result.publication.ready).toBe(true);
    expect(result.quality.checks.find((check) => check.id === 'outcome').passed).toBe(false);
    expect(result.evidence.ready).toBe(false);
  });

  it('derives author-tested only from the same three fields persisted by the editor', () => {
    const result = getPublishReadiness({ ...core, ...evidence });
    expect(result.evidence.ready).toBe(true);
    expect(result.evidence.level).toBe('author-tested');
  });

  it('fails author-tested closed when any required evidence field is missing', () => {
    for (const missing of ['testedAt', 'environment', 'verificationSteps']) {
      const candidate = { ...core, ...evidence, [missing]: '' };
      expect(getPublishReadiness(candidate).evidence.level).toBe('unverified');
    }
  });

  it('does not promote token evidence strings to author-tested', () => {
    const result = getPublishReadiness({
      ...core,
      testedAt: '2026-08-28',
      environment: 'x,y',
      verificationSteps: 'ok\nno',
    });
    expect(result.evidence.level).toBe('unverified');
    expect(result.evidence.ready).toBe(false);
  });

  it('trims publication fields before evaluating the submit contract', () => {
    const result = getPublishReadiness({ title: '        a        ', body: `   ${'x'.repeat(159)}   ` });
    expect(result.publication.ready).toBe(false);
  });

  it('keeps outcome, structure and provenance as recommended quality signals', () => {
    const result = getPublishReadiness({
      ...core,
      bodyHtml: '<h2>Steps</h2>',
      outcome: 'A concrete useful outcome',
      sources: 'https://nodejs.org/docs',
    });
    expect(result.quality.ready).toBe(true);
    expect(result.evidence.level).toBe('unverified');
  });

  it('applies the same meaningful-entry threshold to persisted evidence arrays', () => {
    expect(hasMeaningfulEvidenceEntry(['x', ' Node 24.20.0 '], 3)).toBe(true);
    expect(hasMeaningfulEvidenceEntry(['x', '  '], 3)).toBe(false);
    expect(hasMeaningfulEvidenceEntry(['ok', 'Run check and confirm output'], 12)).toBe(true);
  });

  it('does not present a future test date as author-tested evidence', () => {
    const result = getPublishReadiness({ ...core, ...evidence, testedAt: '2026-08-29', latestTestDate: '2026-08-28' });
    expect(result.evidence.level).toBe('unverified');
  });

  it('converts a date input to local midnight instead of a fixed future-prone UTC noon', () => {
    const timestamp = dateInputToTimestamp('2026-08-28');
    const parsed = new Date(timestamp);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(28);
    expect(parsed.getHours()).toBe(0);
  });

  it('formats the browser-local maximum test date deterministically', () => {
    expect(getLocalDateInputValue(new Date(2026, 7, 28, 23, 59))).toBe('2026-08-28');
  });

  it('round-trips a local date input without UTC slice drift', () => {
    const timestamp = dateInputToTimestamp('2026-08-28');
    expect(timestampToLocalDateInputValue(timestamp)).toBe('2026-08-28');
    expect(timestampToLocalDateInputValue('not-a-date')).toBe('');
  });

  it('honors the editor title maximum in the publication contract', () => {
    const result = getPublishReadiness({ ...core, title: 'x'.repeat(21), maxTitleLength: 20 });
    expect(result.publication.ready).toBe(false);
  });
});
