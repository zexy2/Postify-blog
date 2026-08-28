import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiArrowDown, FiArrowUpRight, FiClock, FiEdit3, FiSearch } from 'react-icons/fi';
import styles from './Hero.module.css';
import ContentImage from '../ContentImage/ContentImage';
import { getPostPresentation } from '../../lib/postPresentation';

export default function Hero({
  showSearch = true,
  searchValue = '',
  onSearchChange,
  featuredPost,
}) {
  const { t, i18n } = useTranslation();
  const presentation = featuredPost ? getPostPresentation(featuredPost, i18n.language) : null;

  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.utility}>
          <span>POSTIFY / {t('home.edition')}</span>
          <div className={styles.promiseLine} aria-label={t('home.standardLabel')}>
            <span>{t('home.promiseOutcome')}</span>
            <span>{t('home.promiseFreshness')}</span>
            <span>{t('home.promisePortable')}</span>
          </div>
        </div>

        <div className={styles.masthead}>
          <span className={styles.eyebrow}>{t('home.eyebrow')}</span>
          <h1 className={styles.title}>{t('home.title')}</h1>
        </div>

        <div className={styles.supportingGrid}>
          <div className={styles.copy}>
            <p className={styles.subtitle}>{t('home.subtitle')}</p>

            {showSearch && (
              <label className={styles.searchContainer}>
                <FiSearch className={styles.searchIcon} aria-hidden="true" />
                <input
                  type="search"
                  className={styles.searchInput}
                  placeholder={t('home.searchPlaceholder')}
                  value={searchValue}
                  onChange={(event) => onSearchChange?.(event.target.value)}
                  aria-label={t('home.searchLabel')}
                />
                <span className={styles.searchHint}>⌘K</span>
              </label>
            )}

            <div className={styles.heroActions}>
              <a href="#knowledge-feed" className={styles.primaryAction}>
                {i18n.language?.startsWith('en') ? 'Browse the library' : 'Bilgi arşivine göz at'} <FiArrowDown size={15} />
              </a>
              <Link to="/posts/create" className={styles.secondaryAction}>
                <FiEdit3 size={14} /> {i18n.language?.startsWith('en') ? 'Contribute' : 'Katkı yap'}
              </Link>
            </div>
          </div>

          {featuredPost && (
            <Link to={`/posts/${featuredPost.slug || featuredPost.id}`} className={styles.featured}>
              <div className={styles.featuredVisual}>
                <ContentImage
                  src={featuredPost.coverImageUrl}
                  alt={featuredPost.coverImageAlt || featuredPost.title}
                  className={styles.featuredImage}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <span className={styles.featuredType}>{presentation?.typeLabel}</span>
              </div>
              <div className={styles.featuredContent}>
                <div className={styles.featuredTopline}>
                  <span className={styles.featuredLabel}>{t('home.featured')}</span>
                  <FiArrowUpRight className={styles.arrow} size={17} />
                </div>
                <strong>{featuredPost.title}</strong>
                <span className={styles.featuredExcerpt}>{presentation?.outcome}</span>
                <span className={styles.featuredMeta}>
                  <span>{featuredPost.category}</span>
                  <span className={styles.dot}>·</span>
                  <span><FiClock size={13} /> {featuredPost.readingTime} {t('common.minutes')}</span>
                  {presentation?.formattedDate && (
                    <>
                      <span className={styles.dot}>·</span>
                      <span>{presentation.dateLabel}: {presentation.formattedDate}</span>
                    </>
                  )}
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
