import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from '../../src/pages/AdminPage/AdminPage';
import userReducer from '../../src/store/slices/userSlice';
import '../../src/index.css';

const avatar = (label, background = '#ead8cf') => `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <rect width="80" height="80" rx="40" fill="${background}"/>
    <text x="40" y="49" text-anchor="middle" font-family="Arial" font-size="28" font-weight="700" fill="#1c1917">${label}</text>
  </svg>
`)}`;

const users = [
  { id: 'admin-1', email: 'semanur@example.com', full_name: 'Semanur', username: 'semanur', avatar_url: avatar('S'), role: 'admin', created_at: '2026-08-29T09:00:00Z' },
  { id: 'mod-1', email: 'derya@example.com', full_name: 'Derya', username: 'derya', avatar_url: avatar('D', '#d9e5dc'), role: 'moderator', created_at: '2026-08-28T09:00:00Z' },
  { id: 'user-1', email: 'mert@example.com', full_name: 'Mert', username: 'mert', avatar_url: avatar('M', '#e6dfd2'), role: 'user', created_at: '2026-08-27T09:00:00Z' },
  { id: 'user-2', email: 'aylin@example.com', full_name: 'Aylin', username: 'aylin', avatar_url: avatar('A', '#dedcec'), role: 'user', created_at: '2026-08-26T09:00:00Z' },
  { id: 'user-3', email: 'can@example.com', full_name: 'Can', username: 'can', avatar_url: avatar('C', '#e9d9d9'), role: 'user', created_at: '2026-08-25T09:00:00Z' },
];

const posts = [
  { id: 'p1', title: 'Node.js doğrulama akışını tekrar üretilebilir hale getir', author: 'Semanur', isPublished: true, createdAt: '2026-08-29T10:00:00Z' },
  { id: 'p2', title: 'Frontend performans kararlarını ölçülebilir kaydet', author: 'Derya', isPublished: false, createdAt: '2026-08-28T10:00:00Z' },
  { id: 'p3', title: 'Ürün telemetrisinde gereksiz sinyalleri ayıkla', author: 'Mert', isPublished: true, createdAt: '2026-08-27T10:00:00Z' },
];

const fakeService = {
  checkAdminAuth: async () => true,
  getDashboardStats: async () => ({
    totalUsers: 128,
    totalPosts: 42,
    totalComments: 317,
    adminCount: 2,
    moderatorCount: 5,
    recentUsers: users,
  }),
  getAllUsers: async () => users,
  getAllPosts: async () => posts,
  updateUserRole: async () => ({}),
  deletePost: async () => ({ success: true }),
  togglePostVisibility: async (id) => ({ ...posts.find((post) => post.id === id), isPublished: false }),
};

const store = configureStore({
  reducer: { user: userReducer },
  preloadedState: {
    user: {
      user: {
        id: 'admin-1',
        email: 'semanur@example.com',
        user_metadata: { full_name: 'Semanur' },
        role: 'admin',
      },
      session: { user: { id: 'admin-1' } },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      role: 'admin',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <MemoryRouter initialEntries={['/admin']}>
      <AdminPage service={fakeService} />
    </MemoryRouter>
  </Provider>,
);
