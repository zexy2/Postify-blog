import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from '../../src/pages/AdminPage/AdminPage';
import userReducer from '../../src/store/slices/userSlice';
import '../../src/lib/i18n';
import '../../src/index.css';

let dashboardAttempts = 0;
const fakeService = {
  checkAdminAuth: async () => true,
  getDashboardStats: async () => {
    dashboardAttempts += 1;
    if (dashboardAttempts === 1) throw new Error('Yönetim verileri yüklenemedi.');
    return {
      totalUsers: 0,
      totalPosts: 0,
      totalComments: 0,
      adminCount: 0,
      moderatorCount: 0,
      recentUsers: [],
    };
  },
  getAllUsers: async () => [],
  getAllPosts: async () => [],
  updateUserRole: async () => ({}),
  deletePost: async () => ({ success: true }),
  togglePostVisibility: async () => ({}),
};

const store = configureStore({
  reducer: { user: userReducer },
  preloadedState: {
    user: {
      user: {
        id: 'admin-retry',
        email: 'admin@example.com',
        user_metadata: { full_name: 'Admin' },
        role: 'admin',
      },
      session: { user: { id: 'admin-retry' } },
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
