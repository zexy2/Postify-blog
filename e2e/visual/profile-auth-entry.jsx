import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '../../src/components/Header/Header';
import Footer from '../../src/components/Footer/Footer';
import ProfilePage from '../../src/pages/ProfilePage/ProfilePage';
import userReducer from '../../src/store/slices/userSlice';
import bookmarksReducer from '../../src/store/slices/bookmarksSlice';
import uiReducer from '../../src/store/slices/uiSlice';
import '../../src/lib/i18n';
import '../../src/index.css';

const init = { type: '@@postify/profile-visual-init' };
const userId = '6de3709b-0616-4ca1-a9c3-e6a97b695ba6';
const bookmarkedPost = {
  id: 'visual-saved-1',
  slug: 'guvenilir-release-akisi',
  title: 'Güvenilir bir release akışını görünür kıl',
};

const baseBookmarks = bookmarksReducer(undefined, init);
const baseUi = uiReducer(undefined, init);
const store = configureStore({
  reducer: { user: userReducer, bookmarks: bookmarksReducer, ui: uiReducer },
  preloadedState: {
    user: {
      user: {
        id: userId,
        email: 'semanur@example.com',
        created_at: '2026-08-29T09:00:00.000Z',
        profile: {
          full_name: 'Semanur',
          username: 'semanur',
          bio: 'Merak etmeyi, anlamayı ve paylaşmayı seven bir üretici.',
          location: 'İstanbul, Türkiye',
          role: 'user',
          avatar_url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="%23ead8cf"/><circle cx="60" cy="46" r="23" fill="%23c8654a"/><path d="M24 112c5-25 20-38 36-38s31 13 36 38" fill="%23c8654a"/><text x="60" y="54" text-anchor="middle" font-family="Arial" font-size="24" font-weight="700" fill="white">S</text></svg>')}`,
        },
      },
      session: { user: { id: userId } },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      role: 'user',
    },
    bookmarks: {
      ...baseBookmarks,
      items: [bookmarkedPost.id],
      posts: { [bookmarkedPost.id]: bookmarkedPost },
    },
    ui: { ...baseUi, theme: 'light' },
  },
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
queryClient.setQueryData(['posts', 'user', userId, 'tr'], [
  { id: 'visual-post-1', slug: 'node-release-dogrula', title: 'Node.js release akışını doğrula' },
  { id: 'visual-post-2', slug: 'css-layout-karari', title: 'Bir layout kararını kanıtla' },
]);
queryClient.setQueryData(['knowledge', 'backend-status'], { ready: true });
queryClient.setQueryData(['knowledge', 'dashboard'], {
  posts: [
    { id: 'visual-post-1', evidence_status: 'author-tested', tested_at: '2026-08-28' },
    { id: 'visual-post-2', evidence_status: 'unverified', tested_at: null },
  ],
  gaps: [],
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/profile']}>
        <Header />
        <ProfilePage />
        <Footer />
      </MemoryRouter>
    </QueryClientProvider>
  </Provider>,
);
