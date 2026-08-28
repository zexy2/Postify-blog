import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiBookmark, FiClock } from 'react-icons/fi';
import ContentImage from '../ContentImage/ContentImage';
import { getPostPresentation } from '../../lib/postPresentation';
import styles from './EditorialFeed.module.css';

const EditorialFeed = ({ posts, onBookmarkToggle, bookmarkedIds = [] }) => {
  const { t, i18n } = useTranslation();
  const [lead, ...rest] = posts;
  if (!lead) return null;

  const renderMeta = (post) => {
    const presentation = getPostPresentation(post, i18n.language);
    return (
      <div className={styles.meta}>
        <span className={styles.type}>{presentation.typeLabel}</span>
        <span className={styles.category}>{post.category}</span>
        {presentation.formattedDate && (
          <span>{presentation.dateLabel}: {presentation.formattedDate}</span>
        )}
        <span className={styles.readTime}><FiClock size={12} /> {post.readingTime} {t('common.minutes')}</span>
      </div>
    );
  };

  const BookmarkButton = ({ post }) => {
    const isBookmarked = bookmarkedIds.includes(post.id);
    return (
      <button
        type="button"
        className={`${styles.bookmark} ${isBookmarked ? styles.bookmarked : ''}`}
        onClick={() => onBookmarkToggle?.(post)}
        aria-label={isBookmarked ? t('bookmarks.removeFromBookmarks') : t('bookmarks.addToBookmarks')}
      >
        <FiBookmark size={16} />
      </button>
    );
  };

  const leadPresentation = getPostPresentation(lead, i18n.language);

  return (
    <div className={styles.feedContainer}>
      <article className={styles.lead}>
        <Link to={`/posts/${lead.slug || lead.id}`} className={styles.leadImageLink}>
          <ContentImage
            src={lead.coverImageUrl}
            alt={lead.coverImageAlt || lead.title}
            className={styles.leadImage}
            loading="lazy"
          />
        </Link>
        <div className={styles.leadContent}>
          {renderMeta(lead)}
          <Link to={`/posts/${lead.slug || lead.id}`} className={styles.titleLink}>
            <h3 className={styles.leadTitle}>{lead.title}</h3>
          </Link>
          <p className={styles.leadExcerpt}>{leadPresentation.outcome}</p>
          <div className={styles.footer}>
            <Link to={`/posts/${lead.slug || lead.id}`} className={styles.readLink}>
              {t('common.readMore')} <FiArrowUpRight size={15} />
            </Link>
            <BookmarkButton post={lead} />
          </div>
        </div>
      </article>

      <div className={styles.list}>
        {rest.map((post, index) => {
          const presentation = getPostPresentation(post, i18n.language);
          return (
            <article className={styles.row} key={post.id}>
              <span className={styles.index}>{String(index + 2).padStart(2, '0')}</span>
              <div className={styles.rowContent}>
                {renderMeta(post)}
                <Link to={`/posts/${post.slug || post.id}`} className={styles.titleLink}>
                  <h4 className={styles.rowTitle}>{post.title}</h4>
                </Link>
                <p className={styles.rowExcerpt}>{presentation.outcome}</p>
                <div className={styles.rowActions}>
                  <Link to={`/posts/${post.slug || post.id}`} className={styles.readLink}>
                    {t('common.read')} <FiArrowUpRight size={14} />
                  </Link>
                  <BookmarkButton post={post} />
                </div>
              </div>
              <Link to={`/posts/${post.slug || post.id}`} className={styles.thumbLink} tabIndex={-1} aria-hidden="true">
                <ContentImage
                  src={post.coverImageUrl}
                  alt=""
                  className={styles.thumb}
                  loading="lazy"
                />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default EditorialFeed;
