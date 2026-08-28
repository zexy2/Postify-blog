export const NODE_DETERMINISTIC_POLICY = 'node-deterministic-v1';
export const MAX_VERIFICATION_CODE_BYTES = 4_096;
export const MAX_EXPECTED_OUTPUT_BYTES = 4_096;

const ALLOWED_IMPORTS = new Set(['node:assert', 'node:assert/strict']);
const SAFE_ENTRY_FILE = /^[a-z0-9][a-z0-9._-]*\.mjs$/i;
const FORBIDDEN_PATTERNS = [
  ['dynamic import', /\bimport\s*\(/],
  ['CommonJS require', /\brequire\s*\(/],
  ['network fetch', /\bfetch\s*\(/],
  ['XMLHttpRequest', /\bXMLHttpRequest\b/],
  ['WebSocket', /\bWebSocket\b/],
  ['globalThis escape', /\bglobalThis\b/],
  ['eval', /\beval\s*\(/],
  ['Function constructor', /\bnew\s+Function\b|\bFunction\s*\(/],
  ['filesystem builtin', /['"]node:(?:fs|fs\/promises)['"]/],
  ['network builtin', /['"]node:(?:http|https|net|tls|dgram|dns|dns\/promises)['"]/],
  ['process execution builtin', /['"]node:(?:child_process|cluster|worker_threads|vm|module)['"]/],
];

const getStaticImports = (code) => {
  const imports = [];
  const pattern = /\bimport\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = pattern.exec(code))) imports.push(match[1]);
  return imports;
};

export function validateVerificationCode(check) {
  const code = String(check?.code || '');
  const expectedStdout = String(check?.expectedStdout ?? '');
  const minimumRuntimeMajor = Number(check?.minimumRuntimeMajor);
  const violations = [];

  if (check?.runtime !== 'node') violations.push('only node runtime is supported');
  if (check?.policy !== NODE_DETERMINISTIC_POLICY) violations.push('unknown or missing verification policy');
  if (!SAFE_ENTRY_FILE.test(String(check?.entryFile || ''))) violations.push('entry file must be a safe .mjs basename');
  if (!Number.isInteger(minimumRuntimeMajor) || minimumRuntimeMajor < 20) violations.push('minimum Node runtime must be an integer >= 20');
  if (!code.trim()) violations.push('empty code');
  if (Buffer.byteLength(code, 'utf8') > MAX_VERIFICATION_CODE_BYTES) violations.push('code exceeds 4096-byte policy limit');
  if (!expectedStdout.length) violations.push('expected stdout is required');
  if (Buffer.byteLength(expectedStdout, 'utf8') > MAX_EXPECTED_OUTPUT_BYTES) violations.push('expected stdout exceeds 4096-byte policy limit');

  for (const specifier of getStaticImports(code)) {
    if (!ALLOWED_IMPORTS.has(specifier)) violations.push(`import not allowed: ${specifier}`);
  }
  for (const [label, pattern] of FORBIDDEN_PATTERNS) {
    if (pattern.test(code)) violations.push(`${label} is not allowed`);
  }

  const withoutAllowedStdout = code.replace(/\bprocess\.stdout\.write\b/g, '');
  if (/\bprocess\s*\./.test(withoutAllowedStdout)) violations.push('process access is limited to process.stdout.write');

  return { ok: violations.length === 0, violations };
}
