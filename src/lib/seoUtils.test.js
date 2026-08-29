import { describe, expect, it } from 'vitest';
import { absoluteAssetUrl, canonicalizeUrl, normalizeCanonicalSourceUrl, safeHttpUrl, sanitizeHttpUrls } from './seoUtils';

describe('seoUtils', () => {
  it('removes query strings and fragments from canonicals', () => {
    expect(canonicalizeUrl('https://postify.zekiakgul.dev/posts/test?ref=x#part'))
      .toBe('https://postify.zekiakgul.dev/posts/test');
  });

  it('keeps the site root canonical stable', () => {
    expect(canonicalizeUrl('https://postify.zekiakgul.dev/?category=AI'))
      .toBe('https://postify.zekiakgul.dev/');
  });

  it('resolves local assets to absolute URLs', () => {
    expect(absoluteAssetUrl('/pwa-512x512.png'))
      .toBe('https://postify.zekiakgul.dev/pwa-512x512.png');
  });

  it('accepts only absolute http/https URLs for user-controlled links', () => {
    expect(safeHttpUrl(' https://example.com/path ')).toBe('https://example.com/path');
    expect(safeHttpUrl('http://example.org')).toBe('http://example.org/');
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('data:text/html,x')).toBeNull();
    expect(safeHttpUrl('//example.com')).toBeNull();
    expect(safeHttpUrl('example.com')).toBeNull();
  });

  it('normalizes an external canonical source without deleting meaningful query parameters', () => {
    expect(normalizeCanonicalSourceUrl(' https://example.com/original?edition=2#section '))
      .toBe('https://example.com/original?edition=2');
    expect(normalizeCanonicalSourceUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeCanonicalSourceUrl(`https://example.com/${'a'.repeat(2040)}`)).toBeNull();
  });

  it('keeps only http/https citation URLs', () => {
    expect(sanitizeHttpUrls([
      'https://example.com/docs',
      'http://example.org',
      'javascript:alert(1)',
      'data:text/html,x',
      'not-a-url',
    ])).toEqual(['https://example.com/docs', 'http://example.org/']);
  });
});
