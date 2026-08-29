/**
 * Login Page
 * 
 * User authentication with email/password and OAuth
 */

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaGithub, FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const { login, loginWithOAuth, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const registered = searchParams.get('registered') === '1';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail');
    }

    if (!formData.password) {
      newErrors.password = t('validation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await login(formData);
    }
  };

  const handleOAuthLogin = async (provider) => {
    await loginWithOAuth(provider);
  };

  return (
    <div className={styles.container}>
      <section className={styles.context} aria-label={en ? 'Why use a Postify account' : 'Postify hesabı neden kullanılır'}>
        <span className={styles.eyebrow}>{en ? 'Postify account' : 'Postify hesabı'}</span>
        <h2>{en ? 'Keep useful knowledge within reach.' : 'İşe yarayan bilgiyi elinin altında tut.'}</h2>
        <p>{en
          ? 'Sign in to keep a personal knowledge shelf, maintain what you publish and return to evidence-backed guidance.'
          : 'Kişisel bilgi rafını korumak, yayınladıklarını güncel tutmak ve kanıtlı rehberlere geri dönmek için giriş yap.'}</p>
        <ul className={styles.contextList}>
          <li>{en ? 'Save guidance you actually plan to reuse' : 'Gerçekten tekrar kullanacağın rehberleri kaydet'}</li>
          <li>{en ? 'Maintain evidence and re-verification state' : 'Kanıt ve yeniden doğrulama durumunu yönet'}</li>
          <li>{en ? 'Build a practical knowledge portfolio' : 'Uygulanabilir bir bilgi portföyü oluştur'}</li>
        </ul>
      </section>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.login')}</h1>
          <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
        </div>

        {registered && (
          <p className={styles.confirmationMessage} role="status">
            {t('auth.emailConfirmationHint')}
          </p>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              {t('auth.email')}
            </label>
            <div className={styles.inputWrapper}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.emailPlaceholder')}
                autoComplete="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                disabled={isLoading}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
              />
            </div>
            {errors.email && <span id="login-email-error" className={styles.error} role="alert">{errors.email}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              {t('auth.password')}
            </label>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="current-password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                disabled={isLoading}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span id="login-password-error" className={styles.error} role="alert">{errors.password}</span>}
          </div>

          <div className={styles.forgotPassword}>
            <Link to="/auth/forgot-password">{t('auth.forgotPassword')}</Link>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? t('common.loading') : t('auth.login')}
          </button>
        </form>

        <div className={styles.divider}>
          <span>{t('auth.orContinueWith')}</span>
        </div>

        <div className={styles.socialButtons}>
          <button
            type="button"
            className={`${styles.socialButton} ${styles.google}`}
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
          >
            <FaGoogle />
            <span>Google</span>
          </button>
          <button
            type="button"
            className={`${styles.socialButton} ${styles.github}`}
            onClick={() => handleOAuthLogin('github')}
            disabled={isLoading}
          >
            <FaGithub />
            <span>GitHub</span>
          </button>
        </div>

        <p className={styles.footer}>
          {t('auth.noAccount')}{' '}
          <Link to="/auth/register">{t('auth.register')}</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
