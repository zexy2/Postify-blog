import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from './ProfilePage';

const updateProfile = vi.fn();
const logout = vi.fn();
const useAuthMock = vi.fn();
const useBookmarksMock = vi.fn();
const useUserPostsMock = vi.fn();
const useAuthorDashboardMock = vi.fn();

vi.mock('../../hooks/useAuth', () => ({ useAuth: () => useAuthMock() }));
vi.mock('../../hooks/useBookmarks', () => ({ useBookmarks: () => useBookmarksMock() }));
vi.mock('../../hooks/usePosts', () => ({ useUserPosts: () => useUserPostsMock() }));
vi.mock('../../hooks/useKnowledge', () => ({ useAuthorDashboard: () => useAuthorDashboardMock() }));
vi.mock('../../services/storageService', () => ({ storageService: { uploadAvatar: vi.fn() } }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

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
    role: 'user',
  },
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({ user, isAuthenticated: true, isLoading: false, updateProfile, logout });
    useBookmarksMock.mockReturnValue({
      bookmarksCount: 2,
      bookmarkedPosts: [{ id: 'saved-1', title: 'Kaydedilen örnek' }],
    });
    useUserPostsMock.mockReturnValue({
      data: [{ id: 'post-1', slug: 'ornek', title: 'Yayınlanmış örnek' }],
    });
    useAuthorDashboardMock.mockReturnValue({
      data: { posts: [{ id: 'post-1', evidence_status: 'author-tested', tested_at: '2026-08-28' }] },
    });
  });

  it('renders the account dashboard with real navigation and opens the focused edit workspace', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);

    expect(screen.getByRole('heading', { level: 1, name: 'Zeka Kullanıcısı' })).toBeVisible();
    expect(screen.getByText('Hesap profili')).toBeVisible();
    expect(screen.getByText('Teknik bilgiyi tekrar üretilebilir hale getirir.')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Hesap özeti' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'İçerik üretimi' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Kaydedilenler' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Bilgi sağlığı' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Yazılarım/i })).toHaveAttribute('href', '/users/profile-qa-user');
    expect(screen.getByRole('link', { name: /Kaydettiklerim/i })).toHaveAttribute('href', '/bookmarks');

    fireEvent.click(screen.getAllByRole('button', { name: /Profili Düzenle/i })[0]);
    expect(document.querySelector('input[name="full_name"]')).toHaveValue('Zeka Kullanıcısı');
    expect(document.querySelector('textarea[name="bio"]')).toHaveValue('Teknik bilgiyi tekrar üretilebilir hale getirir.');
    expect(screen.getByRole('button', { name: /Kaydet/i })).toBeVisible();
  });

  it('keeps a valid session on an account recovery surface when user hydration is unavailable', () => {
    useAuthMock.mockReturnValue({ user: null, isAuthenticated: true, isLoading: false, updateProfile, logout });
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Hesap profili geçici olarak kullanılamıyor.' })).toBeVisible();
    expect(screen.getByText('Oturumun korunuyor. Hesap bilgilerini yeniden yüklemek için sayfayı yenile.')).toBeVisible();
    expect(screen.getByRole('button', { name: /Tekrar Dene/i })).toBeVisible();
  });

  it('wires the account logout action to the authenticated session', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Çıkış Yap/i }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
