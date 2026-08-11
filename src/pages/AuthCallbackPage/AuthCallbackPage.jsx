/**
 * OAuth callback boundary.
 *
 * Supabase may still be exchanging the provider response when this route
 * mounts. Waiting here prevents an immediate redirect before Redux receives
 * the persisted session.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const CALLBACK_TIMEOUT_MS = 10000;

const AuthCallbackPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), CALLBACK_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (timedOut && !isAuthenticated) {
    return (
      <section style={{ maxWidth: '36rem', margin: '8rem auto', padding: '2rem', textAlign: 'center' }}>
        <h1>{t('auth.loginError')}</h1>
        <p>{t('auth.oauthError', 'Google girişi tamamlanamadı. Lütfen tekrar deneyin.')}</p>
        <Link to="/auth/login">{t('auth.login')}</Link>
      </section>
    );
  }

  return (
    <section
      aria-live="polite"
      style={{ maxWidth: '36rem', margin: '8rem auto', padding: '2rem', textAlign: 'center' }}
    >
      <p>{t('common.loading')}</p>
    </section>
  );
};

export default AuthCallbackPage;
