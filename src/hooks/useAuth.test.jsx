import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import toast from 'react-hot-toast';
import userReducer from '../store/slices/userSlice';
import { authService } from '../services/authService';
import { useAuth } from './useAuth';

vi.mock('../lib/supabase', () => ({ hasSupabaseConfig: true }));
vi.mock('../services/authService', () => ({
  authService: {
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
    getCurrentUser: vi.fn(),
    getProfile: vi.fn(),
    register: vi.fn(),
    login: vi.fn(),
    loginWithOAuth: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
  },
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

const createWrapper = () => {
  const store = configureStore({ reducer: { user: userReducer } });
  return ({ children }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );
};

describe('useAuth hydration', () => {
  let consoleError;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    authService.onAuthStateChange.mockResolvedValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  afterEach(() => consoleError.mockRestore());

  it('keeps the authenticated identity when profile enrichment is unavailable', async () => {
    const session = { user: { id: 'auth-user-1' }, access_token: 'token' };
    const authUser = { id: 'auth-user-1', email: 'reader@example.com', user_metadata: { full_name: 'Reader' } };
    authService.getSession.mockResolvedValue(session);
    authService.getCurrentUser.mockResolvedValue(authUser);
    authService.getProfile.mockRejectedValue(new Error('profiles unavailable'));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({ id: 'auth-user-1', email: 'reader@example.com', profile: null });
    expect(consoleError).toHaveBeenCalledWith('Auth profile hydration error:', expect.any(Error));
  });
  it('does not report login failure when only profile enrichment fails', async () => {
    const session = { user: { id: 'auth-user-2' }, access_token: 'token-2' };
    const authUser = { id: 'auth-user-2', email: 'writer@example.com' };
    authService.getSession.mockResolvedValue(null);
    authService.login.mockResolvedValue({ session, user: authUser });
    authService.getProfile.mockRejectedValue(new Error('profiles unavailable'));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.login({ email: 'writer@example.com', password: 'valid-password' });
    });
    expect(response.success).toBe(true);

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({ id: 'auth-user-2', profile: null });
    expect(toast.success).toHaveBeenCalledWith('auth.loginSuccess');
    expect(toast.error).not.toHaveBeenCalledWith('auth.loginError');
    expect(consoleError).toHaveBeenCalledWith('Login profile hydration error:', expect.any(Error));
  });

});
