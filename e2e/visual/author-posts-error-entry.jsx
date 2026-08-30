import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserPage from '../../src/pages/UserPage';
import bookmarksReducer from '../../src/store/slices/bookmarksSlice';
import '../../src/lib/i18n';
import '../../src/index.css';

const userId = '11111111-1111-4111-8111-111111111111';
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
queryClient.setQueryData(['users', userId], {
  id: userId,
  name: 'Ada Example',
  fullName: 'Ada Example',
  username: 'ada-example',
  bio: 'Documents repeatable engineering decisions.',
  role: 'user',
});
const store = configureStore({ reducer: { bookmarks: bookmarksReducer } });

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/users/${userId}`]}>
        <Routes>
          <Route path="/users/:id" element={<UserPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  </QueryClientProvider>,
);
