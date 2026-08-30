import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_AUTHOR } from '../content/fallbackPosts';
import { requireSupabase } from '../lib/supabase';
import userService from './userService';

vi.mock('../lib/supabase', () => ({ requireSupabase: vi.fn() }));

describe('userService.getById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('keeps the explicit fallback author aliases available', async () => {
    await expect(userService.getById('fallback-editor')).resolves.toEqual(FALLBACK_AUTHOR);
    expect(requireSupabase).not.toHaveBeenCalled();
  });

  it('does not impersonate the fallback editor for arbitrary non-UUID routes', async () => {
    await expect(userService.getById('missing-author')).resolves.toBeNull();
    expect(requireSupabase).not.toHaveBeenCalled();
  });

  it('propagates profile query errors instead of presenting a false not-found state', async () => {
    const databaseError = new Error('profile service unavailable');
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: databaseError });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    requireSupabase.mockReturnValue({ from: vi.fn(() => ({ select })) });

    await expect(userService.getById('00000000-0000-0000-0000-000000000000')).rejects.toThrow('profile service unavailable');
  });

  it('returns null when a UUID profile does not exist', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    requireSupabase.mockReturnValue({ from: vi.fn(() => ({ select })) });

    await expect(userService.getById('00000000-0000-0000-0000-000000000000')).resolves.toBeNull();
  });
});
