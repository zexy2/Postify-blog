import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../src/components/Header/Header';
import userReducer from '../../src/store/slices/userSlice';
import bookmarksReducer from '../../src/store/slices/bookmarksSlice';
import uiReducer from '../../src/store/slices/uiSlice';
import '../../src/lib/i18n';
import '../../src/index.css';

const init = { type: '@@postify/visual-init' };
const baseBookmarks = bookmarksReducer(undefined, init);
const baseUi = uiReducer(undefined, init);

const store = configureStore({
  reducer: {
    user: userReducer,
    bookmarks: bookmarksReducer,
    ui: uiReducer,
  },
  preloadedState: {
    user: {
      user: {
        id: 'visual-header-user',
        email: 'zeka@example.com',
        profile: {
          full_name: 'Zeka Kullanıcısı',
          username: 'zeka',
          role: 'user',
        },
      },
      session: { user: { id: 'visual-header-user' } },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      role: 'user',
    },
    bookmarks: baseBookmarks,
    ui: { ...baseUi, theme: 'light' },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  </Provider>,
);
