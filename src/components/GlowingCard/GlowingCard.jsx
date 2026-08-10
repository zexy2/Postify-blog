/**
 * GlowingCard Component
 * High-performance CSS variable hardware-accelerated spotlight glow (Zero React re-renders on mousemove)
 */

import { useRef } from 'react';
import styles from './GlowingCard.module.css';

export default function GlowingCard({ 
  children, 
  className = '',
  glowColor = 'rgba(255, 255, 255, 0.1)',
  borderRadius = '12px',
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.glowingCard} ${className}`}
      style={{ borderRadius, '--glow-color': glowColor }}
      onMouseMove={handleMouseMove}
    >
      <div className={styles.glowEffect} style={{ borderRadius }} />
      <div className={styles.borderGlow} style={{ borderRadius }} />
      <div className={styles.content} style={{ borderRadius }}>
        {children}
      </div>
    </div>
  );
}
