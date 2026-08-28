import { describe, expect, it } from 'vitest';
import { getFallbackPosts } from './fallbackPosts';
import { getVerificationCheck, VERIFICATION_MANIFEST } from './verificationManifest';

describe('verification manifest contract', () => {
  it('maps every automatic check to exactly one article displaying the executed code', () => {
    const posts = getFallbackPosts('en');
    for (const check of VERIFICATION_MANIFEST) {
      const matches = posts.filter((post) => post.autoVerificationId === check.id && post.slug === check.postSlug);
      expect(matches).toHaveLength(1);
      expect(matches[0].body).toContain(check.code);
      expect(matches[0].body).toContain(check.expectedStdout);
    }
  });

  it('resolves checks by stable id', () => {
    expect(getVerificationCheck('node-json-parse-v1')?.postSlug).toBe('node-json-dogrulama');
    expect(getVerificationCheck('missing')).toBeNull();
  });
});
