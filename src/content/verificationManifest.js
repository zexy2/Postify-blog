export const VERIFICATION_MANIFEST = [
  {
    id: 'node-json-parse-v1',
    postSlug: 'node-json-dogrulama',
    runtime: 'node',
    policy: 'node-deterministic-v1',
    artifactFile: 'node-json-parse-v1.mjs',
    reproduceCommand: 'node node-json-parse-v1.mjs',
    expectedStdout: 'PASS',
    code: `import assert from 'node:assert/strict';
const payload = '{"ok":true,"items":[1,2,3]}';
const parsed = JSON.parse(payload);
assert.equal(parsed.ok, true);
assert.deepEqual(parsed.items, [1,2,3]);
process.stdout.write('PASS');`,
  },
];

export const getVerificationCheck = (id) => VERIFICATION_MANIFEST.find((check) => check.id === id) || null;

export const getVerificationCheckByPostSlug = (slug) => (
  VERIFICATION_MANIFEST.find((check) => check.postSlug === slug) || null
);

const normalizeCode = (value) => String(value || '').replace(/\r\n/g, '\n').trimEnd();

export const getAutomaticVerificationIdForPost = ({ slug, body }) => {
  const check = getVerificationCheckByPostSlug(slug);
  if (!check) return null;

  const expectedCode = normalizeCode(check.code);
  const fencedBlocks = String(body || '').matchAll(/```(?:js|javascript|mjs)?[ \t]*\n([\s\S]*?)```/gi);
  for (const block of fencedBlocks) {
    if (normalizeCode(block[1]) === expectedCode) return check.id;
  }

  return null;
};
