import { describe, expect, it } from 'vitest';
import { extractExternalReferences, getArticleOutline, slugifyHeading } from './articleStructure';

describe('articleStructure', () => {
  it('extracts markdown-style headings into a stable outline', () => {
    expect(getArticleOutline('## Kurulum\n\nMetin\n\n### Doğrulama')).toEqual([
      { text: 'Kurulum', level: 2, id: 'section-kurulum-0' },
      { text: 'Doğrulama', level: 3, id: 'section-dogrulama-1' },
    ]);
  });
  it('creates deterministic ids for duplicate headings', () => {
    expect(slugifyHeading('Aynı başlık', 0)).not.toBe(slugifyHeading('Aynı başlık', 1));
  });
  it('extracts unique external references and skips the current origin', () => {
    expect(extractExternalReferences('See https://example.com/a and https://postify.zekiakgul.dev/x and https://example.com/a.', 'https://postify.zekiakgul.dev')).toEqual(['https://example.com/a']);
  });
});
