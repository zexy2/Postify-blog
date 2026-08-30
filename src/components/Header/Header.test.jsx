import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from './Header';

const logout = vi.fn();
const useAuthMock = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));
vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggle: vi.fn() }),
}));
vi.mock('../../hooks/useBookmarks', () => ({
  useBookmarks: () => ({ bookmarksCount: 2 }),
}));
vi.mock('../LanguageSwitcher', () => ({
  default: () => <button type="button">TR</button>,
}));
vi.mock('../BrandMark', () => ({
  default: () => <span aria-hidden="true">P</span>,
}));

const authenticatedUser = {
  id: 'header-user',
  email: 'zeka@example.com',
  profile: {
    full_name: 'Zeka Kullanıcısı',
    role: 'user',
  },
};

describe('Header authenticated account controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: authenticatedUser,
      logout,
    });
  });

  it('exposes profile, knowledge health, identity, and logout from the desktop account menu', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);

    const trigger = screen.getByRole('button', { name: 'Hesap' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByText('Zeka Kullanıcısı')).toHaveLength(2);
    expect(screen.getByText('zeka@example.com')).toBeVisible();
    expect(screen.getByRole('link', { name: /Profil/i })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('link', { name: /Bilgi sağlığı/i })).toHaveAttribute('href', '/knowledge');

    fireEvent.click(screen.getByRole('button', { name: /Çıkış Yap/i }));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(document.getElementById('header-account-popover')).not.toBeInTheDocument();
  });

  it('closes the account menu with Escape and restores focus to its trigger', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    const trigger = screen.getByRole('button', { name: 'Hesap' });
    fireEvent.click(trigger);
    expect(document.getElementById('header-account-popover')).toBeVisible();
    screen.getByRole('link', { name: /Profil/i }).focus();
    expect(screen.getByRole('link', { name: /Profil/i })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.getElementById('header-account-popover')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('keeps the account control absent for signed-out users', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, user: null, logout });
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.queryByRole('button', { name: 'Hesap' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Giriş Yap/i })).toHaveAttribute('href', '/auth/login');
  });
});
