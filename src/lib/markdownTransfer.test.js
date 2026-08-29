import { describe, expect, it } from 'vitest';
import { buildMarkdownDocument, markdownFilename, splitMarkdownDocument } from './markdownTransfer';

describe('markdownTransfer', () => {
  it('promotes a leading H1 to the Postify title and keeps the remaining markdown', () => {
    expect(splitMarkdownDocument('\uFEFF\n# Repeatable release\r\n\r\n## Steps\r\n\r\n- Build\r\n- Verify')).toEqual({
      title: 'Repeatable release',
      body: '## Steps\n\n- Build\n- Verify',
    });
  });

  it('keeps markdown without a leading H1 entirely in the body', () => {
    expect(splitMarkdownDocument('## Notes\n\nKeep the evidence.')).toEqual({
      title: '',
      body: '## Notes\n\nKeep the evidence.',
    });
  });

  it('exports a stable H1 document that can be imported again', () => {
    const output = buildMarkdownDocument({ title: 'Release notes', body: '## Result\n\n**PASS**' });
    expect(output).toBe('# Release notes\n\n## Result\n\n**PASS**\n');
    expect(splitMarkdownDocument(output)).toEqual({ title: 'Release notes', body: '## Result\n\n**PASS**' });
  });

  it('creates a filesystem-safe markdown filename', () => {
    expect(markdownFilename('Şifre Güvenliği / Node 24')).toBe('sifre-guvenligi-node-24.md');
    expect(markdownFilename('Imported Release Guide')).toBe('imported-release-guide.md');
  });
});
