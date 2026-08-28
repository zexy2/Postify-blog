import { describe, expect, it } from 'vitest';
import { evaluateNodeRuntimeRelease, getAutomaticVerificationState } from './runtimeReleaseSignal';

const check = { id: 'node-json-parse-v1', runtime: 'node', runtimeMajor: 24 };
const run = { id: check.id, status: 'passed', runtimeVersion: 'v24.20.0', requiredRuntimeMajor: 24 };
const at = '2026-08-28T00:00:00.000Z';

describe('runtime release signal', () => {
  it('keeps verification current only on the exact latest LTS release', () => {
    const signal = evaluateNodeRuntimeRelease({ check, run, releases: [{ version: 'v26.8.1', lts: false }, { version: 'v24.20.0', lts: 'Krypton' }, { version: 'v22.23.2', lts: 'Jod' }], checkedAt: at });
    expect(signal.status).toBe('current');
    expect(getAutomaticVerificationState(run, { checks: { [check.id]: signal } }, new Date(at)).verified).toBe(true);
  });

  it('requires a re-check when a newer release appears on the tracked LTS line', () => {
    const signal = evaluateNodeRuntimeRelease({ check, run, releases: [{ version: 'v24.20.1', lts: 'Krypton' }], checkedAt: at });
    expect(signal).toMatchObject({ status: 'recheck-required', reason: 'newer-lts-release' });
    expect(getAutomaticVerificationState(run, { checks: { [check.id]: signal } }, new Date(at)).verified).toBe(false);
  });

  it('requires a re-check when a newer LTS major supersedes the verified major', () => {
    const signal = evaluateNodeRuntimeRelease({ check, run, releases: [{ version: 'v26.1.0', lts: 'NextLTS' }, { version: 'v24.20.0', lts: 'Krypton' }], checkedAt: at });
    expect(signal).toMatchObject({ status: 'recheck-required', reason: 'newer-lts-major', latestLtsMajor: 26 });
  });

  it('expires a previously current signal when scheduled refresh stops', () => {
    const signal = evaluateNodeRuntimeRelease({ check, run, releases: [{ version: 'v24.20.0', lts: 'Krypton' }], checkedAt: '2026-08-26T00:00:00.000Z' });
    const state = getAutomaticVerificationState(run, { checks: { [check.id]: signal } }, new Date('2026-08-28T00:00:01.000Z'));
    expect(state).toMatchObject({ status: 'freshness-unknown', verified: false });
  });

  it('fails closed when release freshness is unavailable or mismatched', () => {
    const unknown = evaluateNodeRuntimeRelease({ check, run, releases: [], checkedAt: at });
    expect(unknown.status).toBe('unknown');
    expect(getAutomaticVerificationState(run, { checks: { [check.id]: unknown } }, new Date(at)).status).toBe('freshness-unknown');
    expect(getAutomaticVerificationState(run, null, new Date(at)).verified).toBe(false);
  });
});
