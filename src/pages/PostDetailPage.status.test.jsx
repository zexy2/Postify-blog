import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePost, usePosts } from '../hooks/usePosts';
import PostDetailPage from './PostDetailPage';

const refetch = vi.fn();

vi.mock('../hooks/usePosts', () => ({
  usePost: vi.fn(),
  usePosts: vi.fn(),
}));
vi.mock('../hooks/useBookmarks', () => ({
  useBookmarks: () => ({ bookmarkedIds: [], toggle: vi.fn() }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'common.loading': 'Loading...',
      'common.retry': 'Retry',
      'nav.home': 'Explore',
      'errors.articleUnavailable': 'This story is temporarily unavailable',
      'errors.articleUnavailableHint': 'The content service could not load this story. Try again in a moment.',
      'errors.articleNotFound': 'This story could not be found',
      'errors.articleNotFoundHint': 'The link may have changed or the story may have been removed. Continue from Explore.',
    }[key] || key),
    i18n: { language: 'en' },
  }),
}));

const renderPage = () => render(
  <MemoryRouter initialEntries={['/posts/live-only-story']}>
    <Routes>
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route path="/" element={<div>home route</div>} />
    </Routes>
  </MemoryRouter>,
);

const baseState = {
  post: null,
  comments: [],
  isLoading: false,
  isError: false,
  refetch,
  commentsUnavailable: false,
};

describe('PostDetailPage route states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePosts.mockReturnValue({ posts: [] });
  });

  it('renders a busy reading state while the detail is unresolved', () => {
    usePost.mockReturnValue({ ...baseState, isLoading: true });
    renderPage();

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('heading', { name: 'Loading...' })).toBeVisible();
  });

  it('renders a retryable service-unavailable state for read failures', () => {
    usePost.mockReturnValue({ ...baseState, isError: true });
    renderPage();

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'This story is temporarily unavailable' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders a non-retry 404 recovery state when the service resolves no story', () => {
    usePost.mockReturnValue(baseState);
    renderPage();

    expect(screen.getByRole('heading', { name: 'This story could not be found' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore' })).toHaveAttribute('href', '/');
  });
});
