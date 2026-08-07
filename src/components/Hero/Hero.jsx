import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiSearch } from 'react-icons/fi';
import styles from './Hero.module.css';

export default function Hero({
  showSearch = true,
  searchValue = '',
  onSearchChange,
  featuredPost,
}) {
  const { t } = useTranslation();

  return (
    <section className={styles.hero}>
      <div className={styles.gradientMesh} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{t('home.eyebrow')}</span>
          <h1 className={styles.title}>{t('home.title')}</h1>
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
            </label>
          )}
        </div>

        {featuredPost && (
          <Link to={`/posts/${featuredPost.slug || featuredPost.id}`} className={styles.featured}>
            <img src={featuredPost.coverImageUrl} alt="" className={styles.featuredImage} loading="eager" fetchPriority="high" decoding="async" />
            <span className={styles.featuredOverlay} />
            <span className={styles.featuredContent}>
              <span className={styles.featuredLabel}>{t('home.featured')}</span>
              <strong>{featuredPost.title}</strong>
              <span className={styles.featuredMeta}>
                {featuredPost.category} · {featuredPost.readingTime} {t('common.minutes')}
                <FiArrowUpRight size={16} />
              </span>
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
