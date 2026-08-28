import { beforeEach, describe, expect, it, vi } from 'vitest';

const chain = {};
for (const name of ['select', 'eq', 'order', 'limit', 'upsert', 'delete']) chain[name] = vi.fn(() => chain);
chain.maybeSingle = vi.fn(async () => ({ data: null, error: null }));
chain.single = vi.fn(async () => ({ data: { result: 'worked' }, error: null }));
chain.then = (resolve) => resolve({ data: [], error: null });

const client = {
  from: vi.fn(() => chain),
  rpc: vi.fn(async () => ({ data: { id: 'g1' }, error: null })),
  auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'u1' } }, error: null })) },
};

vi.mock('../lib/supabase', () => ({ requireSupabase: () => client }));
const { default: service } = await import('./knowledgeService');

describe('knowledgeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chain.maybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it('returns an honest zero summary when none exists', async () => {
    expect((await service.getSummary('p1')).confirmation_count).toBe(0);
  });

  it('reads only the current user confirmation detail', async () => {
    await service.getMyConfirmation('p1');
    expect(client.from).toHaveBeenCalledWith('post_confirmations');
    expect(chain.eq).toHaveBeenCalledWith('post_id', 'p1');
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'u1');
  });

  it('uses privacy-safe public failure aggregates', async () => {
    await service.getFailures('p1');
    expect(client.from).toHaveBeenCalledWith('post_failure_reports');
    expect(chain.select).toHaveBeenCalledWith('post_id,failure_count,last_failure_at');
  });

  it('uses sanitized public revision history rather than raw snapshots', async () => {
    await service.getRevisions('p1');
    expect(client.from).toHaveBeenCalledWith('post_revision_history');
    expect(chain.select).toHaveBeenCalledWith('id,revision_number,reason,created_at');
  });

  it('rejects invalid confirmation results before a write', async () => {
    await expect(service.setConfirmation('p1', { result: 'maybe' })).rejects.toThrow('Invalid');
  });

  it('records an authenticated knowledge gap through the atomic rpc', async () => {
    await service.requestGap('React cache');
    expect(client.rpc).toHaveBeenCalledWith('request_knowledge_gap', { query_text: 'React cache' });
  });
});
