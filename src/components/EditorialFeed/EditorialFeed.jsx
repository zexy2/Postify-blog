import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiBookmark, FiClock } from 'react-icons/fi';
import ContentImage from '../ContentImage/ContentImage';
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
      <span>{formatDate(post.publishedAt, i18n.language)}</span>
      <span className={styles.readTime}><FiClock size={13} /> {post.readingTime} {t('common.minutes')}</span>
    </div>
  );

  return (
    <div className={styles.feed}>
      <article className={styles.lead}>
        <Link to={`/posts/${lead.slug || lead.id}`} className={styles.leadImageLink}>
          <ContentImage src={lead.coverImageUrl} alt={lead.coverImageAlt || lead.title} className={styles.leadImage} loading="lazy" />
        </Link>
        <div className={styles.leadCopy}>
          {renderMeta(lead)}
          <Link to={`/posts/${lead.slug || lead.id}`} className={styles.titleLink}>
            <h3>{lead.title}</h3>
          </Link>
          <p>{lead.excerpt}</p>
          <Link to={`/posts/${lead.slug || lead.id}`} className={styles.readLink}>{t('common.readMore')} <FiArrowUpRight size={16} /></Link>
        </div>
      </article>

      <div className={styles.list}>
        {rest.map((post) => {
          const isBookmarked = bookmarkedIds.includes(post.id);
          return (
            <article className={styles.row} key={post.id}>
              <Link to={`/posts/${post.slug || post.id}`} className={styles.rowImageLink}>
                <ContentImage src={post.coverImageUrl} alt={post.coverImageAlt || post.title} className={styles.rowImage} loading="lazy" />
              </Link>
              <div className={styles.rowCopy}>
                {renderMeta(post)}
                <Link to={`/posts/${post.slug || post.id}`} className={styles.titleLink}><h4>{post.title}</h4></Link>
                <p>{post.excerpt}</p>
                <div className={styles.rowFooter}>
                  <Link to={`/posts/${post.slug || post.id}`} className={styles.readLink}>{t('common.readMore')} <FiArrowUpRight size={15} /></Link>
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
          );
        })}
      </div>
    </div>
  );
};

export default EditorialFeed;
