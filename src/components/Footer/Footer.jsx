import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiGithub, FiArrowUp } from 'react-icons/fi';
import styles from './Footer.module.css';
import BrandMark from '../BrandMark';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.footerStickyWrapper}>
      <footer className={styles.footer}>
        <div className={styles.container}>
          {/* Top Section: Brand Statement & Columns */}
          <div className={styles.topSection}>
            <div className={styles.brandCol}>
              <Link to="/" className={styles.brandLink}>
                <BrandMark size="md" />
                <span className={styles.brandTitle}>Postify</span>
              </Link>
              <p className={styles.brandDesc}>{t('footer.description', 'Okumak için değil, uygulamak için. Rehberler, karar notları ve saha deneyimleri.')}</p>
              <div className={styles.socialBadges}>
                <a href="https://github.com/zexy2/Postify-blog" target="_blank" rel="noopener noreferrer" className={styles.socialBadge} title="GitHub">
                  <FiGithub size={16} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>

            <div className={styles.columnsGroup}>
              <div className={styles.col}>
                <h4 className={styles.colTitle}>Navigasyon</h4>
                <ul className={styles.colList}>
                  <li><Link to="/">{t('nav.home')}</Link></li>
                  <li><Link to="/about">{t('nav.about')}</Link></li>
                  <li><Link to="/contact">{t('nav.contact')}</Link></li>
                  <li><Link to="/bookmarks">{t('nav.bookmarks', 'Yer İşaretleri')}</Link></li>
                </ul>
              </div>

              <div className={styles.col}>
                <h4 className={styles.colTitle}>Biçimler</h4>
                <ul className={styles.colList}>
                  <li><Link to="/?type=guide">Rehberler</Link></li>
                  <li><Link to="/?type=decision">Karar notları</Link></li>
                  <li><Link to="/?type=explainer">Açıklayıcılar</Link></li>
                  <li><Link to="/?type=fieldNote">Saha notları</Link></li>
                </ul>
              </div>

              <div className={styles.col}>
                <h4 className={styles.colTitle}>Kaynaklar</h4>
                <ul className={styles.colList}>
                  <li>
                    <a href="https://github.com/zexy2/Postify-blog" target="_blank" rel="noopener noreferrer">
                      Açık Kaynak <FiArrowUpRight size={13} />
                    </a>
                  </li>
                  <li>
                    <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                      Supabase Docs <FiArrowUpRight size={13} />
                    </a>
                  </li>
                  <li>
                    <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                      React 19 <FiArrowUpRight size={13} />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Scroll to Top */}
          <div className={styles.bottomBar}>
            <div className={styles.copyGroup}>
              <span className={styles.copyBrand}>Postify</span>
              <span className={styles.copyDot}>•</span>
              <span className={styles.copyright}>© {currentYear} Postify. {t('footer.copyright', 'Tüm hakları saklıdır.')}</span>
            </div>

            <button
              type="button"
              className={styles.scrollTopBtn}
              onClick={scrollToTop}
              aria-label="Başa Dön"
              title="Başa Dön"
            >
              <span>Başa Dön</span>
              <FiArrowUp size={16} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
