/**
 * App Component
 * Main application component with routing
 */

import { Navigate, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
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
  const navigationType = useNavigationType();
  const theme = useSelector(selectTheme);
  const { i18n } = useTranslation();
  const previousPathnameRef = useRef(location.pathname);
  const scrollPositionsRef = useRef(new Map());
  const activeLocationKeyRef = useRef(location.key);
  const previousLocationKeyRef = useRef(location.key);
  const restorableLocationKeysRef = useRef(new Set());
  const isHistoryRestore = navigationType === 'POP' && restorableLocationKeysRef.current.has(location.key);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previousRestoration; };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const previousKey = previousLocationKeyRef.current;
    if (previousKey !== location.key) {
      restorableLocationKeysRef.current.add(previousKey);
      previousLocationKeyRef.current = location.key;
    }
    activeLocationKeyRef.current = location.key;
  }, [location.key]);

  useEffect(() => {
    const locationKey = location.key;
    const locationSignature = `${location.pathname}${location.search}${location.hash}`;
    const savePosition = () => {
      const currentSignature = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (activeLocationKeyRef.current !== locationKey || currentSignature !== locationSignature) return;
      scrollPositionsRef.current.set(locationKey, { left: window.scrollX, top: window.scrollY });
    };
    savePosition();
    window.addEventListener('scroll', savePosition, { passive: true });
    return () => window.removeEventListener('scroll', savePosition);
  }, [location.hash, location.key, location.pathname, location.search]);

  // Preserve history-entry scroll positions without interfering with in-page filters.
  useIsomorphicLayoutEffect(() => {
    const pathnameChanged = previousPathnameRef.current !== location.pathname;
    const savedPosition = isHistoryRestore ? scrollPositionsRef.current.get(location.key) : null;
    let restoreTimer;
    let restoreFrame;

    if (savedPosition) {
      let attempts = 0;
      const restore = () => {
        const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo(savedPosition.left, Math.min(savedPosition.top, maxTop));
        attempts += 1;
        if (Math.abs(window.scrollY - savedPosition.top) > 1 && attempts < 40) {
          restoreTimer = window.setTimeout(restore, 50);
        }
      };
      restoreFrame = window.requestAnimationFrame(() => {
        restoreFrame = window.requestAnimationFrame(restore);
      });
    } else if (navigationType !== 'POP' && pathnameChanged) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }

    if (pathnameChanged) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
    previousPathnameRef.current = location.pathname;

    return () => {
      if (restoreFrame) window.cancelAnimationFrame(restoreFrame);
      if (restoreTimer) window.clearTimeout(restoreTimer);
    };
  }, [isHistoryRestore, location.key, location.pathname, navigationType]);

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
              <Route path="/" element={<HomePage isHistoryRestore={isHistoryRestore} />} />
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
