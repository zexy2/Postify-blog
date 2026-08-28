import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const workflow = await readFile('.github/workflows/ci.yml', 'utf8');

const declaredPlaywright = packageJson.devDependencies?.['@playwright/test'];
const resolvedPlaywright = lock.packages?.['node_modules/@playwright/test']?.version;
const containerVersions = [...workflow.matchAll(/mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-noble/g)].map((match) => match[1]);

if (!/^\d+\.\d+\.\d+$/.test(String(declaredPlaywright || ''))) {
  throw new Error(`@playwright/test must be exact-pinned; received ${declaredPlaywright || 'missing'}`);
}
if (resolvedPlaywright !== declaredPlaywright) {
  throw new Error(`Playwright lock drift: package.json=${declaredPlaywright}, lock=${resolvedPlaywright || 'missing'}`);
}
if (containerVersions.length < 2 || containerVersions.some((version) => version !== declaredPlaywright)) {
  throw new Error(`Playwright container drift: expected all pinned images at ${declaredPlaywright}, found ${containerVersions.join(', ') || 'none'}`);
}

let auditStdout = '';
try {
  const result = await execFileAsync('npm', ['audit', '--json'], { maxBuffer: 8 * 1024 * 1024, timeout: 120_000 });
  auditStdout = result.stdout;
} catch (error) {
  auditStdout = error.stdout || '';
  if (!auditStdout.trim()) {
    throw new Error(`npm audit unavailable: ${String(error.message || error).slice(0, 240)}`);
  }
}

let audit;
try {
  audit = JSON.parse(auditStdout);
} catch {
  throw new Error('npm audit returned non-JSON output; release gate fails closed');
}
if (audit.error) {
  throw new Error(`npm audit failed: ${audit.error.summary || audit.error.code || 'unknown error'}`);
}

const vulnerabilities = audit.metadata?.vulnerabilities;
if (!vulnerabilities || typeof vulnerabilities.total !== 'number') {
  throw new Error('npm audit metadata missing vulnerability totals');
}
if (vulnerabilities.total !== 0) {
  throw new Error(`Dependency audit blocked release: ${JSON.stringify(vulnerabilities)}`);
}

console.log(`Release security PASS: npm audit 0 vulnerabilities; Playwright package/images ${declaredPlaywright}`);
