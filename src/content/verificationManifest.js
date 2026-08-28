export const VERIFICATION_MANIFEST = [
  {
    id: 'node-json-parse-v1',
    postSlug: 'node-json-dogrulama',
    runtime: 'node',
    minimumRuntimeMajor: 20,
    policy: 'node-deterministic-v1',
    entryFile: 'postify-node-json-check.mjs',
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
export const getVerificationCommand = (check) => check?.entryFile ? `node ${check.entryFile}` : '';
