import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from './ProfilePage';

const updateProfile = vi.fn();
const useAuthMock = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('../../services/storageService', () => ({
  storageService: { uploadAvatar: vi.fn() },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const user = {
  id: 'profile-qa-user',
  email: 'zeka@example.com',
  created_at: '2026-01-15T12:00:00.000Z',
  profile: {
    full_name: 'Zeka Kullanıcısı',
    username: 'zeka',
    bio: 'Teknik bilgiyi tekrar üretilebilir hale getirir.',
    website: 'https://example.com',
    location: 'İstanbul, Türkiye',
    avatar_url: 'https://example.com/avatar.png',
  },
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      user,
      isAuthenticated: true,
      isLoading: false,
      updateProfile,
    });
  });

  it('renders the V3 account profile and exposes the focused edit workspace', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Zeka Kullanıcısı' })).toBeVisible();
    expect(screen.getByText('Hesap profili')).toBeVisible();
    expect(screen.getByText('Teknik bilgiyi tekrar üretilebilir hale getirir.')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /Profili Düzenle/i }));

    expect(document.querySelector('input[name="full_name"]')).toHaveValue('Zeka Kullanıcısı');
    expect(document.querySelector('input[name="username"]')).toHaveValue('zeka');
    expect(document.querySelector('textarea[name="bio"]')).toHaveValue('Teknik bilgiyi tekrar üretilebilir hale getirir.');
    expect(screen.getByRole('button', { name: /Kaydet/i })).toBeVisible();
  });
});
