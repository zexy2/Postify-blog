import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiBookmark } from 'react-icons/fi';
import styles from './PostCards.module.css';

export default function PostCardCompact({ post, isBookmarked, onBookmarkToggle }) {
  const { t } = useTranslation();
  const href = `/posts/${post.slug || post.id}`;

  return (
    <article className={`${styles.card} ${styles.compact}`}>
      <div className={styles.compactContent}>
        <div className={styles.compactHeader}><span className={styles.category}>{post.category}</span><button type="button" className={`${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarked : ''}`} onClick={() => onBookmarkToggle?.(post)} aria-label={isBookmarked ? t('bookmarks.removeFromBookmarks') : t('bookmarks.addToBookmarks')}><FiBookmark size={15} /></button></div>
        <Link to={href} className={styles.titleLink}><h4 className={styles.compactTitle}>{post.title}</h4></Link>
        <span className={styles.compactFooter}>{post.author?.name || 'Postify Editor'} <FiArrowUpRight size={14} /></span>
      </div>
    </article>
  );
}
