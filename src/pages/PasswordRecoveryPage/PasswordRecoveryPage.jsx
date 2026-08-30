import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import styles from './PasswordRecoveryPage.module.css';

const PasswordRecoveryPage = ({ mode = 'request' }) => {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const { resetPassword, updatePassword, isLoading } = useAuth();
  const updating = mode === 'update';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [complete, setComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!updating) {
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError({ field: 'email', message: en ? 'Enter a valid email address.' : 'Geçerli bir e-posta adresi gir.' });
        if (typeof window !== 'undefined') window.requestAnimationFrame(() => window.document.getElementById('recovery-email')?.focus());
        return;
      }
      const result = await resetPassword(email.trim());
      if (result.success) setComplete(true);
      return;
    }

    if (password.length < 8) {
      setError({ field: 'password', message: en ? 'Use at least 8 characters.' : 'En az 8 karakter kullan.' });
      if (typeof window !== 'undefined') window.requestAnimationFrame(() => window.document.getElementById('new-password')?.focus());
      return;
    }
    if (password !== confirmPassword) {
      setError({ field: 'confirmPassword', message: en ? 'Passwords do not match.' : 'Şifreler eşleşmiyor.' });
      if (typeof window !== 'undefined') window.requestAnimationFrame(() => window.document.getElementById('confirm-new-password')?.focus());
      return;
    }

    const result = await updatePassword(password);
    if (result.success) setComplete(true);
  };

  const title = updating
    ? (en ? 'Choose a new password' : 'Yeni şifreni belirle')
    : (en ? 'Recover your account' : 'Hesabını kurtar');
  const subtitle = updating
    ? (en ? 'Finish the recovery session with a new password.' : 'Kurtarma oturumunu yeni bir şifre belirleyerek tamamla.')
    : (en ? 'We will send a secure recovery link to your account email.' : 'Hesabındaki e-posta adresine güvenli bir kurtarma bağlantısı göndereceğiz.');

  return (
    <div className={styles.container}>
      <section className={styles.context}>
        <span className={styles.eyebrow}>{en ? 'Account recovery' : 'Hesap kurtarma'}</span>
        <h2>{en ? 'Get back to your knowledge without losing the trail.' : 'Bilgi geçmişini kaybetmeden hesabına geri dön.'}</h2>
        <p>{en
          ? 'Recovery changes access credentials only. Your saved knowledge, published work and evidence history stay attached to the account.'
          : 'Kurtarma yalnızca erişim bilgisini değiştirir. Kaydedilen bilgilerin, yayınların ve kanıt geçmişin hesabında kalır.'}</p>
      </section>

      <section className={styles.card} aria-labelledby="recovery-title">
        <header className={styles.header}>
          <h1 id="recovery-title">{title}</h1>
          <p>{subtitle}</p>
        </header>

        {complete ? (
          <div className={styles.complete} role="status">
            <strong>{updating
              ? (en ? 'Password updated.' : 'Şifre güncellendi.')
              : (en ? 'Recovery email sent.' : 'Kurtarma e-postası gönderildi.')}</strong>
            <p>{updating
              ? (en ? 'You can now sign in with the new password.' : 'Artık yeni şifrenle giriş yapabilirsin.')
              : (en ? 'Open the link in the email to continue. You can close this page.' : 'Devam etmek için e-postadaki bağlantıyı aç. Bu sayfayı kapatabilirsin.')}</p>
            <Link to="/auth/login">{en ? 'Back to sign in' : 'Girişe dön'}</Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {!updating ? (
              <div className={styles.inputGroup}>
                <label htmlFor="recovery-email">{en ? 'Account email' : 'Hesap e-postası'}</label>
                <div className={styles.inputWrapper}>
                  <FaEnvelope aria-hidden="true" />
                  <input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); if (error?.field === 'email') setError(null); }}
                    autoComplete="email"
                    placeholder="ornek@email.com"
                    disabled={isLoading}
                    aria-invalid={error?.field === 'email'}
                    aria-describedby={error?.field === 'email' ? 'recovery-form-error' : undefined}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="new-password">{en ? 'New password' : 'Yeni şifre'}</label>
                  <div className={styles.inputWrapper}>
                    <FaLock aria-hidden="true" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => { setPassword(event.target.value); if (error?.field === 'password') setError(null); }}
                      autoComplete="new-password"
                      disabled={isLoading}
                      aria-invalid={error?.field === 'password'}
                      aria-describedby={error?.field === 'password' ? 'recovery-form-error' : undefined}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? (en ? 'Hide password' : 'Şifreyi gizle') : (en ? 'Show password' : 'Şifreyi göster')}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="confirm-new-password">{en ? 'Confirm new password' : 'Yeni şifreyi doğrula'}</label>
                  <div className={styles.inputWrapper}>
                    <FaLock aria-hidden="true" />
                    <input
                      id="confirm-new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => { setConfirmPassword(event.target.value); if (error?.field === 'confirmPassword') setError(null); }}
                      autoComplete="new-password"
                      disabled={isLoading}
                      aria-invalid={error?.field === 'confirmPassword'}
                      aria-describedby={error?.field === 'confirmPassword' ? 'recovery-form-error' : undefined}
                    />
                  </div>
                </div>
              </>
            )}

            {error && <p id="recovery-form-error" className={styles.error} role="alert">{error.message}</p>}
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading
                ? (en ? 'Working…' : 'İşleniyor…')
                : updating
                  ? (en ? 'Update password' : 'Şifreyi güncelle')
                  : (en ? 'Send recovery link' : 'Kurtarma bağlantısı gönder')}
            </button>
            <Link to="/auth/login" className={styles.backLink}>{en ? 'Back to sign in' : 'Girişe dön'}</Link>
          </form>
        )}
      </section>
    </div>
  );
};

export default PasswordRecoveryPage;
