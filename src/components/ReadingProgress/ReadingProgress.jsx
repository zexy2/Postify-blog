/**
 * ReadingProgress Component
 * Minimal reading progress bar for post detail pages
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ReadingProgress.module.css';

export default function ReadingProgress({ 
  containerRef = null,
  color = 'var(--primary)',
  height = 3,
}) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);

  const calculateProgress = useCallback(() => {
    if (containerRef?.current) {
      // Calculate based on specific container
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const containerHeight = container.offsetHeight;
      
      // How much of the container has been scrolled past
      const scrolled = Math.max(0, -rect.top);
      const scrollable = containerHeight - windowHeight;
      
      if (scrollable <= 0) {
        setProgress(100);
      } else {
        const percentage = Math.min(100, Math.max(0, (scrolled / scrollable) * 100));
        setProgress(percentage);
      }
    } else {
      // Calculate based on full page
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      
      if (documentHeight <= 0) {
        setProgress(100);
      } else {
        const percentage = Math.min(100, Math.max(0, (scrollTop / documentHeight) * 100));
        setProgress(percentage);
      }
    }
  }, [containerRef]);

  useEffect(() => {
    // Initial calculation
    calculateProgress();

    // Add scroll listener
    window.addEventListener('scroll', calculateProgress, { passive: true });
    window.addEventListener('resize', calculateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
    };
  }, [calculateProgress]);

  return (
    <div 
      className={styles.container} 
      style={{ height: `${height}px` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t('article.readingProgress')}
    >
      <div 
        className={styles.bar}
        style={{ 
          width: `${progress}%`,
          background: color,
        }}
      />
      {/* Glow effect */}
      <div 
        className={styles.glow}
        style={{ 
          width: `${progress}%`,
          background: color,
        }}
      />
    </div>
  );
}
