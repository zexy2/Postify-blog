import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiSearch } from 'react-icons/fi';
import styles from './Hero.module.css';
import ContentImage from '../ContentImage/ContentImage';

export default function Hero({
  showSearch = true,
  searchValue = '',
  onSearchChange,
  featuredPost,
}) {
  const { t } = useTranslation();
  const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(new Date());

  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.utility}>
          <span>POSTIFY / {year}</span>
          <span>{t('home.edition')}</span>
        </div>
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
            <ContentImage
              src={featuredPost.coverImageUrl}
              alt={featuredPost.coverImageAlt || featuredPost.title}
              className={styles.featuredImage}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <span className={styles.featuredOverlay} />
            <span className={styles.featuredContent}>
              <span className={styles.featuredLabel}>{t('home.featured')}</span>
              <strong>{featuredPost.title}</strong>
              <span className={styles.featuredExcerpt}>{featuredPost.excerpt}</span>
              <span className={styles.featuredMeta}>
                {featuredPost.category} · {featuredPost.readingTime} {t('common.minutes')}
                <FiArrowUpRight size={16} />
              </span>
            </span>
          </Link>
        )}
        </div>
      </div>
    </section>
  );
}
