/**
 * CustomCursor Component
 * Ultra lightweight hardware-accelerated cursor (Zero JS re-renders on mousemove)
 */

import { useEffect, useRef, useState } from 'react';
import styles from './CustomCursor.module.css';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    setIsTouch(false);

    const handleMouseMove = (e) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, [role="button"], input, textarea');
      setIsHovering(Boolean(target));
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (isTouch) return null;

  return (
    <div
      ref={cursorRef}
      className={`${styles.cursor} ${isHovering ? styles.hovering : ''}`}
      style={{ opacity: isVisible ? 1 : 0 }}
    />
  );
}
