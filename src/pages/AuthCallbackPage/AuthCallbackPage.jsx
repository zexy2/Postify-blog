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
import SystemStatus from '../../components/SystemStatus';

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
      <SystemStatus
        eyebrow="POSTIFY / AUTH"
        title={t('auth.loginError')}
        message={t('auth.oauthError', 'Google girişi tamamlanamadı. Lütfen tekrar deneyin.')}
        role="alert"
        action={<Link to="/auth/login">{t('auth.login')}</Link>}
      />
    );
  }

  return (
    <SystemStatus
      eyebrow="POSTIFY / AUTH"
      title={t('common.loading')}
      message={t('auth.oauthPending', 'Kimliğin doğrulanıyor. Bu pencereyi kapatma.')}
      loading
    />
  );
};

export default AuthCallbackPage;
