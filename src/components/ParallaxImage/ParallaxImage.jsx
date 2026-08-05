/**
 * ParallaxImage Component
 * Scroll-triggered parallax effect for images
 */

import { useEffect, useRef } from 'react';
import styles from './ParallaxImage.module.css';

export default function ParallaxImage({
  src,
  alt = '',
  speed = 0.3,
  scale = 1.2,
  overlay = true,
  overlayGradient = 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)',
  height = '50vh',
  children,
  className = '',
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    
    if (!container || !image) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

    if (prefersReducedMotion || isSmallScreen) {
      image.style.transform = 'scale(1) translate3d(0, 0, 0)';
      return;
    }

    let frameId;
    const update = () => {
      frameId = undefined;
      const rect = container.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) /
        (window.innerHeight + rect.height);
      const offset = (progress - 0.5) * rect.height * speed;
      image.style.transform = `scale(${scale}) translate3d(0, ${offset}px, 0)`;
    };
    const onScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };

    image.style.transform = `scale(${scale}) translate3d(0, 0, 0)`;
    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [speed, scale]);

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={{ height }}
    >
      <div className={styles.imageWrapper}>
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={styles.image}
          loading="eager"
        />
      </div>
      
      {overlay && (
        <div 
          className={styles.overlay}
          style={{ background: overlayGradient }}
        />
      )}
      
      {children && (
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
}
