import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiBookmark, FiClock } from 'react-icons/fi';
import styles from './PostCards.module.css';

export default function PostCardMedium({ post, isBookmarked, onBookmarkToggle }) {
  const { t } = useTranslation();
  const href = `/posts/${post.slug || post.id}`;

  return (
    <article className={`${styles.card} ${styles.medium}`}>
      <Link to={href} className={styles.imageLink}><img src={post.coverImageUrl} alt="" className={styles.cardImage} loading="lazy" /></Link>
      <div className={styles.mediumContent}>
        <div className={styles.meta}><span className={styles.category}>{post.category}</span><span><FiClock size={13} /> {post.readingTime} {t('common.minutes')}</span></div>
        <Link to={href} className={styles.titleLink}><h3 className={styles.mediumTitle}>{post.title}</h3></Link>
        <p className={styles.mediumExcerpt}>{post.excerpt}</p>
        <div className={styles.footer}>
          <Link to={href} className={styles.readLink}>{t('common.readMore')} <FiArrowUpRight size={15} /></Link>
          <button type="button" className={`${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarked : ''}`} onClick={() => onBookmarkToggle?.(post)} aria-label={isBookmarked ? t('bookmarks.removeFromBookmarks') : t('bookmarks.addToBookmarks')}><FiBookmark size={16} /></button>
        </div>
      </div>
    </article>
  );
}
