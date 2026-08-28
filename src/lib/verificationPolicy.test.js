import { describe, expect, it } from 'vitest';
import { NODE_DETERMINISTIC_POLICY, validateVerificationCode } from '../../scripts/verification-policy.mjs';

const valid = {
  policy: NODE_DETERMINISTIC_POLICY,
  code: "import assert from 'node:assert/strict';\nassert.equal(1, 1);\nprocess.stdout.write('PASS');",
};

describe('deterministic verification policy', () => {
  it('accepts the narrow checked-in assertion contract', () => {
    expect(validateVerificationCode(valid)).toEqual({ ok: true, violations: [] });
  });

  it.each([
    ["import fs from 'node:fs';\nprocess.stdout.write('PASS')", 'import not allowed'],
    ["await fetch('https://example.com');\nprocess.stdout.write('PASS')", 'network fetch'],
    ["process.env.SECRET;\nprocess.stdout.write('PASS')", 'process access'],
    ["const pkg = await import('left-pad');\nprocess.stdout.write('PASS')", 'dynamic import'],
  ])('rejects unsupported capabilities', (code, reason) => {
    const result = validateVerificationCode({ policy: NODE_DETERMINISTIC_POLICY, code });
    expect(result.ok).toBe(false);
    expect(result.violations.join(' ')).toContain(reason);
  });
});
