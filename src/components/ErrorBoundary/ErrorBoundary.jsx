/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors in child components
 */

import { Component } from 'react';
import { useTranslation } from 'react-i18next';
import { FiRefreshCw, FiHome } from 'react-icons/fi';
import SystemStatus from '../SystemStatus';
import styles from './ErrorBoundary.module.css';

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.handleReset)
      ) : (
        <ErrorFallback
          error={this.state.error}
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Functional fallback component with translations
const ErrorFallback = ({ error, resetError }) => {
  const { t } = useTranslation();

  return (
    <SystemStatus
      eyebrow="POSTIFY / RECOVERY"
      title={t('error.title')}
      message={t('error.message')}
      fullPage
      role="alert"
      action={(
        <>
          <button onClick={resetError}>
            <FiRefreshCw />
            {t('error.retry')}
          </button>
          <a href={import.meta.env.BASE_URL}>
            <FiHome />
            {t('error.home')}
          </a>
        </>
      )}
    >
      {import.meta.env.DEV && error && (
        <details className={styles.details}>
          <summary>{t('error.details')}</summary>
          <pre className={styles.errorText}>{error.toString()}</pre>
        </details>
      )}
    </SystemStatus>
  );
};

export default ErrorBoundaryClass;
