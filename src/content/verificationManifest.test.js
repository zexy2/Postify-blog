import { describe, expect, it } from 'vitest';
import { getFallbackPosts } from './fallbackPosts';
import {
  getAutomaticVerificationIdForPost,
  getVerificationCheck,
  getVerificationCheckByPostSlug,
  VERIFICATION_MANIFEST,
} from './verificationManifest';

describe('verification manifest contract', () => {
  it('maps every automatic check to exactly one article displaying the executed code', () => {
    const posts = getFallbackPosts('en');
    for (const check of VERIFICATION_MANIFEST) {
      const matches = posts.filter((post) => post.autoVerificationId === check.id && post.slug === check.postSlug);
      expect(matches).toHaveLength(1);
      expect(matches[0].body).toContain(check.code);
      expect(matches[0].body).toContain(check.expectedStdout);
      expect(check.artifactFile).toMatch(/^[a-z0-9][a-z0-9._-]*\.mjs$/i);
      expect(check.reproduceCommand).toBe(`node ${check.artifactFile}`);
    }
  });

  it('resolves checks by stable id and immutable post slug', () => {
    expect(getVerificationCheck('node-json-parse-v1')?.postSlug).toBe('node-json-dogrulama');
    expect(getVerificationCheck('missing')).toBeNull();
    expect(getVerificationCheckByPostSlug('node-json-dogrulama')?.id).toBe('node-json-parse-v1');
    expect(getVerificationCheckByPostSlug('missing')).toBeNull();
  });

  it('only binds automatic verification when the displayed fenced code matches exactly', () => {
    const check = getVerificationCheck('node-json-parse-v1');
    const matchingBody = `## Code\n\n\`\`\`js\n${check.code}\n\`\`\``;
    const driftedBody = matchingBody.replace("assert.equal(parsed.ok, true);", "assert.equal(parsed.ok, false);");

    expect(getAutomaticVerificationIdForPost({ slug: check.postSlug, body: matchingBody })).toBe(check.id);
    expect(getAutomaticVerificationIdForPost({ slug: check.postSlug, body: driftedBody })).toBeNull();
    expect(getAutomaticVerificationIdForPost({ slug: 'other-slug', body: matchingBody })).toBeNull();
  });
});
