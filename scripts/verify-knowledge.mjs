import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { getVerificationCommand, VERIFICATION_MANIFEST } from '../src/content/verificationManifest.js';
import { getFallbackPosts } from '../src/content/fallbackPosts.js';
import { validateVerificationCode } from './verification-policy.mjs';

const execFileAsync = promisify(execFile);
const results = {
  schemaVersion: 3,
  generatedAt: new Date().toISOString(),
  scope: 'checked-in deterministic verification only',
  runs: {},
};
let failed = false;

const catalog = getFallbackPosts('en');
const runtimeMajor = Number(process.versions.node.split('.')[0]);

for (const check of VERIFICATION_MANIFEST) {
  const started = Date.now();
  const article = catalog.find((post) => post.slug === check.postSlug && post.autoVerificationId === check.id);
  const codeSha256 = createHash('sha256').update(check.code).digest('hex');
  const policy = validateVerificationCode(check);
  const contract = {
    id: check.id,
    postSlug: check.postSlug,
    runtime: check.runtime,
    runtimeVersion: process.version,
    minimumRuntimeMajor: check.minimumRuntimeMajor,
    policy: check.policy,
    entryFile: check.entryFile,
    reproductionCommand: getVerificationCommand(check),
    expectedStdout: check.expectedStdout,
    codeSha256,
  };

  if (!policy.ok) {
    results.runs[check.id] = {
      ...contract,
      status: 'failed',
      failureKind: 'verification-policy-rejected',
      policyViolations: policy.violations,
      verifiedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
    };
    failed = true;
    continue;
  }

  if (runtimeMajor < check.minimumRuntimeMajor) {
    results.runs[check.id] = {
      ...contract,
      status: 'failed',
      failureKind: 'unsupported-runtime',
      verifiedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
    };
    failed = true;
    continue;
  }

  const articleBody = String(article?.body || '');
  if (!article || !articleBody.includes(check.code) || !articleBody.includes(check.expectedStdout)) {
    results.runs[check.id] = {
      ...contract,
      status: 'failed',
      failureKind: 'article-contract-drift',
      verifiedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
    };
    failed = true;
    continue;
  }

  let runDir = null;
  try {
    runDir = await mkdtemp(join(tmpdir(), 'postify-verify-'));
    await writeFile(join(runDir, check.entryFile), check.code, { encoding: 'utf8', mode: 0o600 });
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [check.entryFile],
      { cwd: runDir, timeout: 2500, maxBuffer: 64 * 1024, env: { NODE_ENV: 'test' } },
    );
    const actualStdout = stdout.trim();
    const passed = actualStdout === check.expectedStdout && !stderr.trim();
    results.runs[check.id] = {
      ...contract,
      status: passed ? 'passed' : 'failed',
      executionMode: 'temporary-module-file',
      verifiedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      actualStdout,
      articleContractMatched: true,
    };
    if (!passed) failed = true;
  } catch (error) {
    results.runs[check.id] = {
      ...contract,
      status: 'failed',
      executionMode: 'temporary-module-file',
      verifiedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      articleContractMatched: true,
      error: String(error.message || error).slice(0, 300),
    };
    failed = true;
  } finally {
    if (runDir) await rm(runDir, { recursive: true, force: true });
  }
}

await mkdir('public', { recursive: true });
await writeFile('public/verification-runs.json', `${JSON.stringify(results, null, 2)}\n`);
if (failed) {
  console.error('Knowledge verification FAILED');
  process.exit(1);
}
console.log(`Knowledge verification PASS: ${VERIFICATION_MANIFEST.length} deterministic run(s), reproducible file contract matched`);
