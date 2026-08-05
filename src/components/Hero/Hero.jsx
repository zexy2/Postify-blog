/**
 * Hero Component
 * Premium hero section with animated background paths
 * Inspired by 21st.dev components
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import BackgroundPaths from '../BackgroundPaths';
import TextReveal from '../TextReveal';
import styles from './Hero.module.css';

export default function Hero({ 
  title, 
  subtitle, 
  showSearch = true,
  searchValue = '',
  onSearchChange,
}) {
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    // Simple CSS-based fade-in
    if (searchRef.current) {
      searchRef.current.style.opacity = '1';
      searchRef.current.style.transform = 'translateY(0)';
    }
  }, [title]);

  return (
    <section ref={heroRef} className={styles.hero}>
      {/* Animated background paths - 21st.dev style */}
      <BackgroundPaths />
      
      {/* Static gradient mesh background */}
      <div className={styles.gradientMesh} aria-hidden="true" />

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>
          <TextReveal text={title || t('home.title', 'Postify')} />
        </h1>
        
        <p className={styles.subtitle}>
          {subtitle || t('home.subtitle', 'Discover stories, insights, and ideas')}
        </p>

        {showSearch && (
          <div
            ref={searchRef} 
            className={styles.searchWrapper}
          >
            <div className={styles.searchContainer}>
              <svg 
                className={styles.searchIcon} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={t('home.searchPlaceholder', 'Search posts...')}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                aria-label={t('home.searchLabel', 'Search posts')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
