import { afterEach, describe, expect, it, vi } from 'vitest';
import { getKnowledgeBackendStatus, resetKnowledgeBackendStatusCache } from './knowledgeBackendStatus';

afterEach(() => {
  vi.unstubAllGlobals();
  resetKnowledgeBackendStatusCache();
});

describe('knowledge backend capability', () => {
  it('defaults closed when the status artifact cannot be read', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await getKnowledgeBackendStatus()).toEqual({ ready: false, mode: 'status-unavailable' });
  });

  it('opens persistent knowledge features only on explicit ready=true', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ready: true, mode: 'supabase' }) }));
    expect((await getKnowledgeBackendStatus()).ready).toBe(true);
  });
});
