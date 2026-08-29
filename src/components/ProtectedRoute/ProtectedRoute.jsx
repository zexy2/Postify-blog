/**
 * Protected Route Component
 * 
 * Redirects to login if not authenticated
 */

import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import SystemStatus from '../SystemStatus';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);


  // If still loading and not timed out, show spinner
  if (isLoading && !timedOut && !user) {
    return (
      <SystemStatus
        eyebrow="POSTIFY / ACCOUNT"
        title={t('common.loading')}
        loading
      />
    );
  }

  // If user exists, allow access
  if (user || isAuthenticated) {
    return children;
  }

  // Otherwise redirect to login
  return <Navigate to="/auth/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
