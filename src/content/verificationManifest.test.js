import { describe, expect, it } from 'vitest';
import { getFallbackPosts } from './fallbackPosts';
import { getVerificationCheck, getVerificationCommand, VERIFICATION_MANIFEST } from './verificationManifest';

describe('verification manifest contract', () => {
  it('maps every automatic check to one article and a reproducible command contract', () => {
    const posts = getFallbackPosts('en');
    for (const check of VERIFICATION_MANIFEST) {
      const matches = posts.filter((post) => post.autoVerificationId === check.id && post.slug === check.postSlug);
      expect(matches).toHaveLength(1);
      expect(matches[0].body).toContain(check.code);
      expect(matches[0].body).toContain(check.expectedStdout);
      expect(check.entryFile).toMatch(/^[a-z0-9][a-z0-9._-]*\.mjs$/i);
      expect(check.minimumRuntimeMajor).toBeGreaterThanOrEqual(20);
      expect(getVerificationCommand(check)).toBe(`node ${check.entryFile}`);
    }
  });

  it('resolves checks by stable id', () => {
    expect(getVerificationCheck('node-json-parse-v1')?.postSlug).toBe('node-json-dogrulama');
    expect(getVerificationCheck('missing')).toBeNull();
  });
});
