import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const renderRoute = () => render(
  <MemoryRouter initialEntries={['/bookmarks']}>
    <Routes>
      <Route path="/bookmarks" element={<ProtectedRoute><div>protected content</div></ProtectedRoute>} />
      <Route path="/auth/login" element={<div>login route</div>} />
    </Routes>
  </MemoryRouter>,
);

describe('ProtectedRoute', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('keeps slow unresolved auth neutral instead of redirecting automatically', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isLoading: true, user: null });
    renderRoute();

    expect(screen.getByRole('heading', { name: 'common.loading' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    act(() => { vi.advanceTimersByTime(3001); });

    expect(screen.queryByText('login route')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'auth.sessionCheckSlowTitle' })).toBeInTheDocument();
    expect(screen.getByRole('status')).not.toHaveAttribute('aria-busy');
    const continueLink = screen.getByRole('link', { name: 'auth.continueToLogin' });
    expect(continueLink).toHaveAttribute('href', '/auth/login');

    fireEvent.click(continueLink);
    expect(screen.getByText('login route')).toBeInTheDocument();
  });

  it('redirects only after auth resolves unauthenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, user: null });
    renderRoute();
    expect(screen.getByText('login route')).toBeInTheDocument();
  });

  it('renders protected content when a user is available', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { id: 'u-1' } });
    renderRoute();
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});
