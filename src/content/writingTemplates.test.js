import { describe, expect, it } from 'vitest';
import { getWritingTemplate, getWritingTemplates } from './writingTemplates';

describe('writingTemplates', () => {
  it('exposes the four Postify knowledge formats', () => {
    expect(getWritingTemplates('tr').map((item) => item.id)).toEqual([
      'guide', 'decision', 'explainer', 'fieldNote',
    ]);
  });

  it('returns localized copy', () => {
    expect(getWritingTemplate('decision', 'en-US').label).toBe('Decision note');
    expect(getWritingTemplate('decision', 'tr-TR').label).toBe('Karar notu');
  });

  it('falls back safely to guide for an unknown id', () => {
    expect(getWritingTemplate('missing', 'tr').id).toBe('guide');
  });
});
