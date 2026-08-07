import { beforeEach, describe, expect, it, vi } from 'vitest';

const signUp = vi.fn();
const requireSupabase = vi.fn();

vi.mock('../lib/supabase', () => ({
  auth: { signUp },
  requireSupabase,
}));

const { default: authService } = await import('./authService');

describe('authService registration', () => {
  beforeEach(() => {
    signUp.mockReset();
    requireSupabase.mockReset();
  });

  it('does not write profiles before email confirmation creates a session', async () => {
    signUp.mockResolvedValue({
      user: { id: 'user-1', email: 'reader@example.com' },
      session: null,
    });

    const result = await authService.register({
      email: 'reader@example.com',
      password: 'password123',
      fullName: 'Reader',
      username: 'reader',
    });

    expect(result.needsEmailConfirmation).toBe(true);
    expect(requireSupabase).not.toHaveBeenCalled();
  });

  it('does not require confirmation when Supabase returns a session', async () => {
    signUp.mockResolvedValue({
      user: { id: 'user-2', email: 'reader@example.com' },
      session: { access_token: 'session-token' },
    });

    const result = await authService.register({
      email: 'reader@example.com',
      password: 'password123',
      fullName: 'Reader',
      username: 'reader',
    });

    expect(result.needsEmailConfirmation).toBe(false);
  });
});

