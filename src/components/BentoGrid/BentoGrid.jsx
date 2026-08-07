/**
 * BentoGrid Component
 * Premium Bento-style grid layout for blog posts
 */

import PostCardFeatured from './PostCardFeatured';
import PostCardMedium from './PostCardMedium';
import PostCardCompact from './PostCardCompact';
import { useTranslation } from 'react-i18next';
import styles from './BentoGrid.module.css';

export default function BentoGrid({ 
  posts = [], 
  isLoading = false,
  onBookmarkToggle,
  bookmarkedIds = [],
}) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={`${styles.item} ${i === 0 ? styles.featured : ''} ${styles.skeleton}`}
            data-bento-item
          >
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonText} style={{ width: '60%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className={styles.empty}>
        <p>{t('home.noContent')}</p>
      </div>
    );
  }

  // Determine card type based on position
  const getCardComponent = (post, index) => {
    const isBookmarked = bookmarkedIds.includes(post.id);
    
    // First post is featured (large)
    if (index === 0) {
      return (
        <PostCardFeatured 
          post={post} 
          isBookmarked={isBookmarked}
          onBookmarkToggle={onBookmarkToggle}
        />
      );
    }
    
    // Posts 1-2 are medium
    if (index <= 2) {
      return (
        <PostCardMedium 
          post={post} 
          isBookmarked={isBookmarked}
          onBookmarkToggle={onBookmarkToggle}
        />
      );
    }
    
    // Rest are compact
    return (
      <PostCardCompact 
        post={post} 
        isBookmarked={isBookmarked}
        onBookmarkToggle={onBookmarkToggle}
      />
    );
  };

  // Determine grid area class based on index
  const getItemClass = (index) => {
    if (index === 0) return styles.featured;
    if (index <= 2) return styles.medium;
    return styles.compact;
  };

  return (
    <div className={styles.grid}>
      {posts.map((post, index) => (
          <div
            key={post.id}
            className={`${styles.item} ${getItemClass(index)}`}
            data-bento-item
          >
            {getCardComponent(post, index)}
          </div>
      ))}
    </div>
  );
}
