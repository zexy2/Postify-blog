/**
 * Footer Component
 * Linear App style 4-column footer
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiGithub } from 'react-icons/fi';
import styles from './Footer.module.css';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Features Column */}
          <div className={styles.column}>
            <h4>{t('footer.features')}</h4>
            <Link to="/">{t('footer.blog')}</Link>
            <Link to="/bookmarks">{t('footer.bookmarks')}</Link>
            <Link to="/analytics">{t('footer.analytics')}</Link>
          </div>

          {/* Product Column */}
          <div className={styles.column}>
            <h4>{t('footer.product')}</h4>
            <Link to="/posts/create">{t('footer.create')}</Link>
            <Link to="/">{t('footer.explore')}</Link>
          </div>

          {/* Company Column */}
          <div className={styles.column}>
            <h4>{t('footer.company')}</h4>
            <Link to="/about">{t('footer.about')}</Link>
            <Link to="/contact">{t('footer.contact')}</Link>
            <a href="https://github.com/zexy2/Postify-blog" target="_blank" rel="noopener noreferrer">
              {t('footer.github')}
            </a>
          </div>

          {/* Connect Column */}
          <div className={styles.column}>
            <h4>{t('footer.connect')}</h4>
            <a href="https://github.com/zexy2/Postify-blog" target="_blank" rel="noopener noreferrer">
              {t('footer.github')}
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottom}>
          <span className={styles.logo}>Postify</span>
          
          <div className={styles.social}>
            <a href="https://github.com/zexy2/Postify-blog" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FiGithub size={18} />
            </a>
          </div>
          
          <span className={styles.copyright}>© {currentYear} Postify · {t('footer.copyright')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
