/**
 * Footer Component
 * Linear App style 4-column footer
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiGithub } from 'react-icons/fi';
import styles from './Footer.module.css';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <span className={styles.kicker}>Postify</span>
          <p>{t('footer.description')}</p>
          <Link to="/" className={styles.exploreLink}>{t('footer.explore')} <FiArrowUpRight size={16} /></Link>
        </div>

        <div className={styles.links}>
          <Link to="/about">{t('footer.about')}</Link>
          <Link to="/contact">{t('footer.contact')}</Link>
          <Link to="/bookmarks">{t('footer.bookmarks')}</Link>
          <Link to="/analytics">{t('footer.analytics')}</Link>
          <a href="https://github.com/zexy2/Postify-blog" target="_blank" rel="noopener noreferrer">
            {t('footer.github')} <FiArrowUpRight size={14} />
          </a>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottom}>
          <span className={styles.logo}>Postify</span>
          <a href="https://github.com/zexy2/Postify-blog" target="_blank" rel="noopener noreferrer" className={styles.github} aria-label="GitHub"><FiGithub size={17} /></a>
          <span className={styles.copyright}>© {currentYear} Postify · {t('footer.copyright')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
