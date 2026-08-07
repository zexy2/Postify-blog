/**
 * 404 Not Found Page
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaHome, FaSearch, FaArrowLeft } from 'react-icons/fa';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>{t('notFound.title')}</h1>
        <p className={styles.message}>{t('notFound.message')}</p>

        <div className={styles.actions}>
          <Link to="/" className={styles.homeButton}>
            <FaHome />
            {t('notFound.home')}
          </Link>
          <button onClick={() => window.history.back()} className={styles.backButton}>
            <FaArrowLeft />
            {t('notFound.back')}
          </button>
        </div>

        <div className={styles.suggestions}>
          <h3>{t('notFound.suggestions')}</h3>
          <ul>
            <li>
              <Link to="/">{t('nav.home')}</Link>
            </li>
            <li>
              <Link to="/bookmarks">{t('nav.bookmarks')}</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
