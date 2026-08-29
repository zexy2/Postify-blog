import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookmarksPage from '../../src/pages/BookmarksPage/BookmarksPage';
import bookmarksReducer from '../../src/store/slices/bookmarksSlice';
import { getFallbackPosts } from '../../src/content/fallbackPosts';
import '../../src/lib/i18n';
import '../../src/index.css';

const posts = getFallbackPosts('tr').slice(0, 3);
const ids = posts.map((post) => post.id);
const byId = Object.fromEntries(posts.map((post) => [post.id, post]));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const store = configureStore({
  reducer: { bookmarks: bookmarksReducer },
  preloadedState: { bookmarks: { items: ids, posts: byId } },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <MemoryRouter initialEntries={['/bookmarks']}>
      <BookmarksPage />
      </MemoryRouter>
    </Provider>
  </QueryClientProvider>,
);
