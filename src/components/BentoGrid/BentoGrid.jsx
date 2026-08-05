/**
 * BentoGrid Component
 * Premium Bento-style grid layout for blog posts
 */

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PostCardFeatured from './PostCardFeatured';
import PostCardMedium from './PostCardMedium';
import PostCardCompact from './PostCardCompact';
import styles from './BentoGrid.module.css';

gsap.registerPlugin(ScrollTrigger);

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3,
    },
  },
};

export default function BentoGrid({ 
  posts = [], 
  isLoading = false,
  onBookmarkToggle,
  bookmarkedIds = [],
}) {
  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current || isLoading) return;

    const ctx = gsap.context(() => {
      // ScrollTrigger for grid items
      const items = gridRef.current.querySelectorAll('[data-bento-item]');
      
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { 
            opacity: 0, 
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              end: 'bottom 10%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, gridRef);

    return () => ctx.revert();
  }, [posts, isLoading]);

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
        <p>No posts found</p>
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
    <motion.div 
      ref={gridRef}
      className={styles.grid}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            className={`${styles.item} ${getItemClass(index)}`}
            variants={itemVariants}
            layout
            data-bento-item
          >
            {getCardComponent(post, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
