import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiBookmark, FiClock } from 'react-icons/fi';
import ContentImage from '../ContentImage/ContentImage';
import GlowingCard from '../GlowingCard/GlowingCard';
import styles from './EditorialFeed.module.css';

const formatDate = (value, locale) => {
  if (!value) return '';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
};

const EditorialFeed = ({ posts, onBookmarkToggle, bookmarkedIds = [] }) => {
  const { t, i18n } = useTranslation();
  const [lead, ...rest] = posts;
  if (!lead) return null;

  const renderMeta = (post) => (
    <div className={styles.meta}>
      <span className={styles.category}>{post.category}</span>
      <span>•</span>
      <span>{formatDate(post.publishedAt, i18n.language)}</span>
      <span className={styles.readTime}><FiClock size={13} /> {post.readingTime} {t('common.minutes')}</span>
    </div>
  );

  return (
    <div className={styles.feedContainer}>
      {/* 1. Hero Featured Lead Post with 21st.dev Spotlight Glow */}
      {lead && (
        <GlowingCard
          glowColor="color-mix(in srgb, var(--primary) 25%, transparent)"
          borderRadius="16px"
          className={styles.heroGlowWrapper}
        >
          <article className={styles.heroLead}>
            <Link to={`/posts/${lead.slug || lead.id}`} className={styles.heroImageLink}>
              <ContentImage src={lead.coverImageUrl} alt={lead.coverImageAlt || lead.title} className={styles.heroImage} loading="lazy" />
            </Link>
            <div className={styles.heroContent}>
              {renderMeta(lead)}
              <Link to={`/posts/${lead.slug || lead.id}`} className={styles.titleLink}>
                <h3 className={styles.heroTitle}>{lead.title}</h3>
              </Link>
              <p className={styles.heroExcerpt}>{lead.excerpt}</p>
              <div className={styles.heroFooter}>
                <Link to={`/posts/${lead.slug || lead.id}`} className={styles.readLink}>
                  {t('common.readMore')} <FiArrowUpRight size={16} />
                </Link>
                <button
                  type="button"
                  className={`${styles.bookmark} ${bookmarkedIds.includes(lead.id) ? styles.bookmarked : ''}`}
                  onClick={() => onBookmarkToggle?.(lead)}
                  aria-label={t('bookmarks.addToBookmarks')}
                >
                  <FiBookmark size={16} />
                </button>
              </div>
            </div>
          </article>
        </GlowingCard>
      )}

      {/* 2. Balanced 3-Column Responsive Grid with Spotlight Glow Cards */}
      <div className={styles.grid}>
        {rest.map((post) => {
          const isBookmarked = bookmarkedIds.includes(post.id);
          return (
            <GlowingCard
              key={post.id}
              glowColor="color-mix(in srgb, var(--primary) 20%, transparent)"
              borderRadius="16px"
              className={styles.cardGlowWrapper}
            >
              <article className={styles.card}>
                <Link to={`/posts/${post.slug || post.id}`} className={styles.cardImageLink}>
                  <ContentImage src={post.coverImageUrl} alt={post.coverImageAlt || post.title} className={styles.cardImage} loading="lazy" />
                </Link>
                <div className={styles.cardBody}>
                  {renderMeta(post)}
                  <Link to={`/posts/${post.slug || post.id}`} className={styles.titleLink}>
                    <h4 className={styles.cardTitle}>{post.title}</h4>
                  </Link>
                  <p className={styles.cardExcerpt}>{post.excerpt}</p>
                  <div className={styles.cardFooter}>
                    <Link to={`/posts/${post.slug || post.id}`} className={styles.readLink}>
                      {t('common.readMore')} <FiArrowUpRight size={15} />
                    </Link>
                    <button
                      type="button"
                      className={`${styles.bookmark} ${isBookmarked ? styles.bookmarked : ''}`}
                      onClick={() => onBookmarkToggle?.(post)}
                      aria-label={isBookmarked ? t('bookmarks.removeFromBookmarks') : t('bookmarks.addToBookmarks')}
                    >
                      <FiBookmark size={16} />
                    </button>
                  </div>
                </div>
              </article>
            </GlowingCard>
          );
        })}
      </div>
    </div>
  );
};

export default EditorialFeed;
