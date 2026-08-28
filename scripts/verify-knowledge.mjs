import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { VERIFICATION_MANIFEST } from '../src/content/verificationManifest.js';
import { getFallbackPosts } from '../src/content/fallbackPosts.js';
import { validateVerificationCode } from './verification-policy.mjs';

const execFileAsync = promisify(execFile);
const results = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  scope: 'checked-in deterministic verification only',
  runs: {},
};
let failed = false;

const catalog = getFallbackPosts('en');

for (const check of VERIFICATION_MANIFEST) {
  const started = Date.now();
  const article = catalog.find((post) => post.slug === check.postSlug && post.autoVerificationId === check.id);
  const codeSha256 = createHash('sha256').update(check.code).digest('hex');
  const policy = validateVerificationCode(check);

  if (!policy.ok) {
    results.runs[check.id] = {
      id: check.id,
      postSlug: check.postSlug,
      status: 'failed',
      failureKind: 'verification-policy-rejected',
      policy: check.policy,
      policyViolations: policy.violations,
      codeSha256,
      verifiedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
    };
    failed = true;
    continue;
  }

  if (!article || !String(article.body || '').includes(check.code)) {
    results.runs[check.id] = {
      id: check.id,
      postSlug: check.postSlug,
      status: 'failed',
      failureKind: 'article-contract-drift',
      codeSha256,
      verifiedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
    };
    failed = true;
    continue;
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      ['--input-type=module', '--eval', check.code],
      { timeout: 2500, maxBuffer: 64 * 1024, env: { NODE_ENV: 'test' } },
    );
    const actualStdout = stdout.trim();
    const passed = actualStdout === check.expectedStdout && !stderr.trim();
    results.runs[check.id] = {
      id: check.id,
      postSlug: check.postSlug,
      status: passed ? 'passed' : 'failed',
      runtime: check.runtime,
      runtimeVersion: process.version,
      policy: check.policy,
      verifiedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      expectedStdout: check.expectedStdout,
      actualStdout,
      codeSha256,
      articleContractMatched: true,
    };
    if (!passed) failed = true;
  } catch (error) {
    results.runs[check.id] = {
      id: check.id,
      postSlug: check.postSlug,
      status: 'failed',
      runtime: check.runtime,
      runtimeVersion: process.version,
      policy: check.policy,
      verifiedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      expectedStdout: check.expectedStdout,
      codeSha256,
      articleContractMatched: true,
      error: String(error.message || error).slice(0, 300),
    };
    failed = true;
  }
}

await mkdir('public', { recursive: true });
await writeFile('public/verification-runs.json', `${JSON.stringify(results, null, 2)}\n`);
if (failed) {
  console.error('Knowledge verification FAILED');
  process.exit(1);
}
console.log(`Knowledge verification PASS: ${VERIFICATION_MANIFEST.length} deterministic run(s), article contract matched`);
