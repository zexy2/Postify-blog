import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const suggestions = [
    ['01', isEn ? 'Guides' : 'Rehberler', '/?type=guide'],
    ['02', isEn ? 'Decisions' : 'Karar notları', '/?type=decision'],
    ['03', isEn ? 'Field notes' : 'Saha notları', '/?type=fieldNote'],
  ];

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.codeRail} aria-hidden="true">
          <span>INDEX MISS</span>
          <strong>404</strong>
        </div>

        <section className={styles.content} aria-labelledby="not-found-title">
          <span className={styles.eyebrow}>{isEn ? 'KNOWLEDGE ROUTE NOT FOUND' : 'BİLGİ YOLU BULUNAMADI'}</span>
          <h1 id="not-found-title">{t('notFound.title')}</h1>
          <p>{t('notFound.message')}</p>

          <div className={styles.actions}>
            <Link to="/" className={styles.primaryAction}>
              {isEn ? 'Explore knowledge' : 'Bilgiyi keşfet'}
              <FiArrowRight aria-hidden="true" />
            </Link>
            <button type="button" onClick={() => window.history.back()} className={styles.secondaryAction}>
              <FiArrowLeft aria-hidden="true" />
              {t('notFound.back')}
            </button>
          </div>
        </section>

        <nav className={styles.recoveryIndex} aria-label={t('notFound.suggestions')}>
          <span className={styles.indexLabel}>{isEn ? 'RECOVERY INDEX' : 'GERİ DÖNÜŞ DİZİNİ'}</span>
          {suggestions.map(([index, label, to]) => (
            <Link to={to} key={to}>
              <span>{index}</span>
              <strong>{label}</strong>
              <FiArrowRight aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NotFoundPage;
