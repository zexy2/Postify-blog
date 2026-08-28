import { describe, expect, it } from 'vitest';
import { absoluteAssetUrl, canonicalizeUrl, sanitizeHttpUrls } from './seoUtils';

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

  it('keeps only http/https citation URLs', () => {
    expect(sanitizeHttpUrls([
      'https://example.com/docs',
      'http://example.org',
      'javascript:alert(1)',
      'data:text/html,x',
      'not-a-url',
    ])).toEqual(['https://example.com/docs', 'http://example.org']);
  });
});
