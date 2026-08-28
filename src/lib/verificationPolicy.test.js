import { describe, expect, it } from 'vitest';
import { NODE_DETERMINISTIC_POLICY, validateVerificationCode } from '../../scripts/verification-policy.mjs';

const valid = {
  runtime: 'node',
  minimumRuntimeMajor: 20,
  entryFile: 'check.mjs',
  expectedStdout: 'PASS',
  policy: NODE_DETERMINISTIC_POLICY,
  code: "import assert from 'node:assert/strict';\nassert.equal(1, 1);\nprocess.stdout.write('PASS');",
};

describe('deterministic verification policy', () => {
  it('accepts the narrow checked-in assertion contract', () => {
    expect(validateVerificationCode(valid)).toEqual({ ok: true, violations: [] });
  });

  it.each([
    [{ ...valid, code: "import fs from 'node:fs';\nprocess.stdout.write('PASS')" }, 'import not allowed'],
    [{ ...valid, code: "await fetch('https://example.com');\nprocess.stdout.write('PASS')" }, 'network fetch'],
    [{ ...valid, code: "process.env.SECRET;\nprocess.stdout.write('PASS')" }, 'process access'],
    [{ ...valid, code: "const pkg = await import('left-pad');\nprocess.stdout.write('PASS')" }, 'dynamic import'],
    [{ ...valid, entryFile: '../escape.mjs' }, 'safe .mjs basename'],
    [{ ...valid, minimumRuntimeMajor: 18 }, 'integer >= 20'],
    [{ ...valid, expectedStdout: '' }, 'expected stdout is required'],
  ])('rejects unsupported contracts', (check, reason) => {
    const result = validateVerificationCode(check);
    expect(result.ok).toBe(false);
    expect(result.violations.join(' ')).toContain(reason);
  });
});
