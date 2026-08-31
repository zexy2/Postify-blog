import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUp, FiArrowUpRight, FiGithub } from 'react-icons/fi';
import BrandMark from '../BrandMark';
import styles from './Footer.module.css';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language?.startsWith('en');
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const handleHomeNavigation = () => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  };

  const formatLinks = [
    ['guide', isEnglish ? 'Guides' : 'Rehberler'],
    ['decision', isEnglish ? 'Decisions' : 'Karar notları'],
    ['explainer', isEnglish ? 'Explainers' : 'Açıklayıcılar'],
    ['fieldNote', isEnglish ? 'Field notes' : 'Saha notları'],
  ];

  return (
    <footer className={styles.footer} aria-label={isEnglish ? 'Postify footer' : 'Postify alt bilgi'}>
      <div className={styles.shell}>
        <section className={styles.statement} aria-labelledby="footer-statement-title">
          <div className={styles.statementCopy}>
            <span className={styles.eyebrow}>{isEnglish ? 'KNOWLEDGE SYSTEM' : 'BİLGİ SİSTEMİ'}</span>
            <h2 id="footer-statement-title" className={styles.statementTitle}>
              {isEnglish ? 'Useful knowledge should stay usable.' : 'Faydalı bilgi kullanılabilir kalmalı.'}
            </h2>
            <p className={styles.statementText}>
              {isEnglish
                ? 'Postify keeps practical knowledge close to its evidence, freshness and execution context.'
                : 'Postify, pratik bilgiyi kanıtı, güncelliği ve uygulama bağlamıyla birlikte tutar.'}
            </p>
          </div>

          <div className={styles.primaryActions}>
            <Link to="/" className={styles.primaryLink} onClick={handleHomeNavigation}>
              {isEnglish ? 'Explore knowledge' : 'Bilgiyi keşfet'}
              <FiArrowUpRight aria-hidden="true" />
            </Link>
            <Link to="/posts/create" className={styles.secondaryLink}>
              {isEnglish ? 'Write a field-tested note' : 'Sahada denenmiş not yaz'}
            </Link>
          </div>
        </section>

        <div className={styles.indexGrid}>
          <div className={styles.brandBlock}>
            <Link to="/" className={styles.brandLink} aria-label="Postify home" onClick={handleHomeNavigation}>
              <BrandMark size="md" />
              <span>Postify</span>
            </Link>
            <p>{t('footer.description')}</p>
            <a
              href="https://github.com/zexy2/postify"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              <FiGithub aria-hidden="true" />
              <span>GitHub</span>
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>

          <nav className={styles.linkGroup} aria-label={isEnglish ? 'Content formats' : 'İçerik biçimleri'}>
            <span className={styles.groupLabel}>{isEnglish ? 'READ BY FORMAT' : 'BİÇİME GÖRE OKU'}</span>
            {formatLinks.map(([type, label], index) => (
              <Link key={type} to={`/?type=${type}#knowledge-feed`}>
                <span className={styles.linkIndex} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <nav className={styles.linkGroup} aria-label={isEnglish ? 'Postify pages' : 'Postify sayfaları'}>
            <span className={styles.groupLabel}>POSTIFY</span>
            <Link to="/about"><span className={styles.linkIndex} aria-hidden="true">01</span><span>{t('nav.about')}</span></Link>
            <Link to="/contact"><span className={styles.linkIndex} aria-hidden="true">02</span><span>{t('nav.contact')}</span></Link>
            <Link to="/bookmarks"><span className={styles.linkIndex} aria-hidden="true">03</span><span>{t('nav.bookmarks')}</span></Link>
            <Link to="/knowledge"><span className={styles.linkIndex} aria-hidden="true">04</span><span>{isEnglish ? 'Knowledge health' : 'Bilgi sağlığı'}</span></Link>
          </nav>
        </div>

        <div className={styles.systemLine} aria-label={isEnglish ? 'Postify trust model' : 'Postify güven modeli'}>
          <div><span>01</span><strong>{isEnglish ? 'Evidence' : 'Kanıt'}</strong></div>
          <div><span>02</span><strong>{isEnglish ? 'Freshness' : 'Güncellik'}</strong></div>
          <div><span>03</span><strong>{isEnglish ? 'Reproducibility' : 'Tekrarlanabilirlik'}</strong></div>
        </div>

        <div className={styles.bottomBar}>
          <span>© {currentYear} Postify · {t('footer.copyright')}</span>
          <button type="button" onClick={scrollToTop} className={styles.scrollTopButton}>
            <span>{isEnglish ? 'Back to top' : 'Başa dön'}</span>
            <FiArrowUp aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
