/**
 * App Component
 * Main application component with routing
 */

import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useLayoutEffect, Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from './store/slices/uiSlice';

// Layout (keep eager - needed immediately)
import Header from './components/Header/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Critical pages - eager load
import HomePage from './pages/HomePage';

// Lazy loaded pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const UserPage = lazy(() => import('./pages/UserPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Loading spinner component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid var(--border-color, #333)',
      borderTopColor: 'var(--primary-color, #6366f1)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
  </div>
);

// SSR-compatible useLayoutEffect
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function App() {
  const location = useLocation();
  const theme = useSelector(selectTheme);

  // Scroll to top on route change
  useIsomorphicLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [location.pathname]);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      <div
        style={{
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <Header />
        <main
          style={{
            position: 'relative',
            width: '100%',
          }}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route
                path="/posts/create"
                element={
                  <ProtectedRoute>
                    <CreatePostPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route
                path="/posts/:id/edit"
                element={
                  <ProtectedRoute>
                    <CreatePostPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/users/:id" element={<UserPage />} />
              <Route
                path="/bookmarks"
                element={
                  <ProtectedRoute>
                    <BookmarksPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
