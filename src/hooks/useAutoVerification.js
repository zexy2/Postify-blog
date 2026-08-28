import { useQuery } from '@tanstack/react-query';
import { getAutomaticVerificationState } from '../lib/runtimeReleaseSignal';

export function useVerificationRuns({ enabled = true } = {}) {
  return useQuery({ queryKey: ['verification-runs'], queryFn: async () => { const response = await fetch('/verification-runs.json', { cache: 'no-cache' }); if (!response.ok) throw new Error('Verification artifact unavailable'); return response.json(); }, enabled, staleTime: 60_000, retry: 0 });
}

export function useRuntimeReleaseStatus({ enabled = true } = {}) {
  return useQuery({ queryKey: ['runtime-release-status'], queryFn: async () => { const response = await fetch('/runtime-release-status.json', { cache: 'no-cache' }); if (!response.ok) throw new Error('Runtime release status unavailable'); return response.json(); }, enabled, staleTime: 60_000, retry: 0 });
}

export function useAutoVerification(id) {
  const verification = useVerificationRuns({ enabled: Boolean(id) });
  const runtime = useRuntimeReleaseStatus({ enabled: Boolean(id) });
  const run = id ? verification.data?.runs?.[id] || null : null;
  const state = getAutomaticVerificationState(run, runtime.data);
  return { run, state, runtimeSignal: state.signal, isLoading: verification.isLoading || runtime.isLoading, isError: verification.isError || runtime.isError };
}
