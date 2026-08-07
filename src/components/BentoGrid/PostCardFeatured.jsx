import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiBookmark, FiClock, FiMessageCircle } from 'react-icons/fi';
import styles from './PostCards.module.css';
import ContentImage from '../ContentImage/ContentImage';

export default function PostCardFeatured({ post, isBookmarked, onBookmarkToggle }) {
  const { t } = useTranslation();
  const href = `/posts/${post.slug || post.id}`;

  return (
    <article className={`${styles.card} ${styles.featured}`}>
      <Link to={href} className={styles.imageLink}>
        <ContentImage
          src={post.coverImageUrl}
          alt={post.coverImageAlt || post.title}
          className={styles.featuredImage}
          loading="eager"
        />
      </Link>
      <div className={styles.featuredContent}>
        <div className={styles.meta}>
          <span className={styles.category}>{post.category}</span>
          <span><FiClock size={13} /> {post.readingTime} {t('common.minutes')}</span>
          <span><FiMessageCircle size={13} /> {post.commentCount || 0}</span>
        </div>
        <Link to={href} className={styles.titleLink}><h2 className={styles.featuredTitle}>{post.title}</h2></Link>
        <p className={styles.featuredExcerpt}>{post.excerpt}</p>
        <div className={styles.actions}>
          <Link to={href} className={styles.readMore}>{t('common.readMore')} <FiArrowUpRight size={17} /></Link>
          <button
            type="button"
            className={`${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarked : ''}`}
            onClick={() => onBookmarkToggle?.(post)}
            aria-label={isBookmarked ? t('bookmarks.removeFromBookmarks') : t('bookmarks.addToBookmarks')}
          ><FiBookmark size={18} /></button>
        </div>
      </div>
    </article>
  );
}
