import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { VERIFICATION_MANIFEST } from '../src/content/verificationManifest.js';
import { evaluateNodeRuntimeRelease, RUNTIME_SIGNAL_MAX_AGE_MS } from '../src/lib/runtimeReleaseSignal.js';

const source = process.env.POSTIFY_NODE_RELEASES_URL || 'https://nodejs.org/dist/index.json';
const checkedAt = new Date().toISOString();
const verification = JSON.parse(await readFile('public/verification-runs.json', 'utf8'));
const checks = {};
let releases = null;
let signalError = null;

try {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  const response = await fetch(source, { signal: controller.signal, headers: { accept: 'application/json' } });
  clearTimeout(timer);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  releases = await response.json();
  if (!Array.isArray(releases)) throw new Error('release payload is not an array');
} catch (error) {
  signalError = error instanceof Error ? error.message : String(error);
}

for (const check of VERIFICATION_MANIFEST) {
  if (check.runtime !== 'node') continue;
  const run = verification.runs?.[check.id] || null;
  checks[check.id] = releases
    ? evaluateNodeRuntimeRelease({ check, run, releases, checkedAt })
    : {
      checkId: check.id,
      runtime: check.runtime,
      checkedAt,
      verifiedRuntimeVersion: run?.runtimeVersion || null,
      requiredRuntimeMajor: check.runtimeMajor,
      status: 'unknown',
      reason: 'release-signal-unavailable',
    };
}

const artifact = {
  schemaVersion: 1,
  checkedAt,
  source: 'nodejs.org/dist/index.json',
  sourceAvailable: Boolean(releases),
  maxAgeHours: RUNTIME_SIGNAL_MAX_AGE_MS / (60 * 60 * 1000),
  checks,
};
await mkdir('public', { recursive: true });
await writeFile('public/runtime-release-status.json', `${JSON.stringify(artifact, null, 2)}\n`);
const rechecks = Object.values(checks).filter((item) => item.status === 'recheck-required');
const unknowns = Object.values(checks).filter((item) => item.status === 'unknown');
if (rechecks.length) console.warn(`::warning title=Verified Knowledge runtime re-check required::${rechecks.map((item) => `${item.checkId}: ${item.verifiedRuntimeVersion} -> ${item.latestLtsVersion || 'newer LTS'}`).join(', ')}`);
if (unknowns.length) console.warn(`::warning title=Verified Knowledge runtime freshness unknown::${unknowns.map((item) => `${item.checkId}: ${item.reason}`).join(', ')}`);
if (signalError) console.warn(`Runtime release signal unavailable; emitted unknown state: ${signalError}`);
else console.log(`Runtime release status PASS: ${Object.values(checks).map((item) => `${item.checkId}=${item.status}`).join(', ')}`);
