/**
 * Register Page
 * 
 * New user registration with validation
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaGithub, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const { register, loginWithOAuth, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = t('validation.required');
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = t('validation.minLength', { min: 2 });
    }

    if (!formData.username) {
      newErrors.username = t('validation.required');
    } else if (formData.username.length < 3) {
      newErrors.username = t('validation.minLength', { min: 3 });
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = t('validation.usernameFormat');
    }

    if (!formData.email) {
      newErrors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail');
    }

    if (!formData.password) {
      newErrors.password = t('validation.required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.minLength', { min: 8 });
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
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
      await register(formData);
    }
  };

  const handleOAuthLogin = async (provider) => {
    await loginWithOAuth(provider);
  };

  return (
    <div className={styles.container}>
      <section className={styles.context} aria-label={en ? 'What a Postify account is for' : 'Postify hesabı ne işe yarar'}>
        <span className={styles.eyebrow}>{en ? 'Publish with a trail' : 'İz bırakarak yayınla'}</span>
        <h2>{en ? 'Turn experience into maintainable knowledge.' : 'Deneyimi bakımı yapılabilir bilgiye dönüştür.'}</h2>
        <p>{en
          ? 'Postify separates publishing from evidence claims, so useful guidance can stay readable without pretending every note is independently verified.'
          : 'Postify yayınlamayı kanıt iddiasından ayırır; böylece faydalı bilgi okunabilir kalırken her not bağımsız doğrulanmış gibi gösterilmez.'}</p>
        <ul className={styles.contextList}>
          <li>{en ? 'Write guides, decisions, explainers and field notes' : 'Rehber, karar notu, açıklayıcı ve saha notu yaz'}</li>
          <li>{en ? 'Attach the environment and checks you actually tested' : 'Gerçekte test ettiğin ortamı ve kontrolleri ekle'}</li>
          <li>{en ? 'See when published knowledge needs another pass' : 'Yayınlanan bilginin ne zaman tekrar kontrol istediğini gör'}</li>
        </ul>
      </section>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.register')}</h1>
          <p className={styles.subtitle}>{t('auth.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="fullName" className={styles.label}>
                {t('auth.fullName')}
              </label>
              <div className={styles.inputWrapper}>
                <FaUser className={styles.inputIcon} />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={t('auth.fullNamePlaceholder')}
                  autoComplete="name"
                  className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? 'register-fullname-error' : undefined}
                />
              </div>
              {errors.fullName && <span id="register-fullname-error" className={styles.error} role="alert">{errors.fullName}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                {t('auth.username')}
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputPrefix}>@</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={t('auth.usernamePlaceholder')}
                  autoComplete="username"
                  className={`${styles.input} ${styles.inputWithPrefix} ${
                    errors.username ? styles.inputError : ''
                  }`}
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={errors.username ? 'register-username-error' : undefined}
                />
              </div>
              {errors.username && <span id="register-username-error" className={styles.error} role="alert">{errors.username}</span>}
            </div>
          </div>

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
                  aria-describedby={errors.email ? 'register-email-error' : undefined}
              />
            </div>
            {errors.email && <span id="register-email-error" className={styles.error} role="alert">{errors.email}</span>}
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
                autoComplete="new-password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                disabled={isLoading}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'register-password-error' : undefined}
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
            {errors.password && <span id="register-password-error" className={styles.error} role="alert">{errors.password}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              {t('auth.confirmPassword')}
            </label>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                autoComplete="new-password"
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                disabled={isLoading}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined}
              />
            </div>
            {errors.confirmPassword && (
              <span id="register-confirm-error" className={styles.error} role="alert">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? t('common.loading') : t('auth.createAccount')}
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
          {t('auth.hasAccount')}{' '}
          <Link to="/auth/login">{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
