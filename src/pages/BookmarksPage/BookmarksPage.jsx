/**
 * BookmarksPage Component
 * Display user's bookmarked posts
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiBookmark, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useBookmarks } from '../../hooks/useBookmarks';
import styles from './BookmarksPage.module.css';

const BookmarksPage = () => {
  const { t } = useTranslation();
  const { bookmarkedPosts, bookmarksCount, remove, clearAll } = useBookmarks();

  if (bookmarksCount === 0) {
    return (
      <div className="container">
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FiBookmark size={64} />
          </div>
          <h2 className={styles.emptyTitle}>{t('bookmarks.empty')}</h2>
          <p className={styles.emptyText}>{t('bookmarks.emptyHint')}</p>
          <Link to="/" className={styles.backButton}>
            <FiArrowLeft />
            {t('nav.home')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>{t('bookmarks.title')}</h1>
            <span className={styles.count}>{bookmarksCount} {t('posts.title').toLowerCase()}</span>
          </div>
          <button onClick={clearAll} className={styles.clearButton}>
            <FiTrash2 />
            {t('bookmarks.clearAll')}
          </button>
        </header>

        <div className={styles.grid}>
          {bookmarkedPosts.map((post) => (
            <article key={post.id} className={styles.card}>
              <Link to={`/posts/${post.slug || post.id}`} className={styles.cardLink}>
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <p className={styles.cardBody}>
                  {post.body?.substring(0, 120)}...
                </p>
              </Link>
              <div className={styles.cardFooter}>
                <Link to={`/users/${post.userId}`} className={styles.author}>
                  {post.authorName || `${t('posts.author')} #${post.userId}`}
                </Link>
                <button
                  onClick={() => remove(post.id)}
                  className={styles.removeButton}
                  title={t('bookmarks.removeFromBookmarks')}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;
