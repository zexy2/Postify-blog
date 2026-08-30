/**
 * App Component
 * Main application component with routing
 */

import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { selectTheme } from './store/slices/uiSlice';

// Layout (keep eager - needed immediately)
import Header from './components/Header/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import SystemStatus from './components/SystemStatus';

// Critical pages - eager load
import HomePage from './pages/HomePage';

// Lazy loaded pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const PasswordRecoveryPage = lazy(() => import('./pages/PasswordRecoveryPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const UserPage = lazy(() => import('./pages/UserPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const KnowledgeDashboardPage = lazy(() => import('./pages/KnowledgeDashboardPage'));

// Route-level loading surface keeps lazy transitions inside the same product language.
const PageLoader = () => {
  const { t } = useTranslation();
  return (
    <SystemStatus
      eyebrow="POSTIFY / LOADING"
      title={t('common.loading')}
      loading
    />
  );
};

// SSR-compatible useLayoutEffect
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function App() {
  const location = useLocation();
  const theme = useSelector(selectTheme);
  const { i18n } = useTranslation();
  const previousPathnameRef = useRef(location.pathname);

  // Scroll to top on route change
  useIsomorphicLayoutEffect(() => {
    const pathnameChanged = previousPathnameRef.current !== location.pathname;
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    if (pathnameChanged) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
    previousPathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = i18n.language?.startsWith('en') ? 'en' : 'tr';
  }, [i18n.language]);

  return (
    <ErrorBoundary>
      <div
        style={{
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <a className="skipLink" href="#main-content">
          {i18n.language?.startsWith('en') ? 'Skip to content' : 'İçeriğe geç'}
        </a>
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            background: 'var(--bg-primary)',
          }}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/forgot-password" element={<PasswordRecoveryPage mode="request" />} />
              <Route path="/auth/reset-password" element={<PasswordRecoveryPage mode="update" />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
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
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/knowledge"
                element={
                  <ProtectedRoute>
                    <KnowledgeDashboardPage />
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
