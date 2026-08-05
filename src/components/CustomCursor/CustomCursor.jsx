/**
 * CustomCursor Component
 * Premium SVG cursor with hover state transformations
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import styles from './CustomCursor.module.css';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverText, setHoverText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Motion values for smooth cursor movement
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Spring animation for smoother following
  const springConfig = { damping: 25, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Check if device supports hover (not touch)
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    // Check for touch device
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (hasTouch || prefersReducedMotion) {
      setIsTouchDevice(true);
      return;
    }
    
    setIsTouchDevice(false);

    // Mouse move handler
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      if (!isVisible) setIsVisible(true);
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Mouse enter handler
    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Add listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Find interactive elements and add hover listeners
    const addHoverListeners = () => {
      // Links and buttons
      const interactiveElements = document.querySelectorAll('a, button, [data-cursor="pointer"]');
      
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          setIsHovering(true);
          setHoverText(el.dataset.cursorText || '');
        });
        el.addEventListener('mouseleave', () => {
          setIsHovering(false);
          setHoverText('');
        });
      });

      // Post cards with special cursor
      const postCards = document.querySelectorAll('[data-bento-item], .card');
      
      postCards.forEach(el => {
        el.addEventListener('mouseenter', () => {
          setIsHovering(true);
          setHoverText('Read');
        });
        el.addEventListener('mouseleave', () => {
          setIsHovering(false);
          setHoverText('');
        });
      });
    };

    // Initial setup and mutation observer for dynamic content
    addHoverListeners();
    
    const observer = new MutationObserver(() => {
      addHoverListeners();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      observer.disconnect();
    };
  }, [cursorX, cursorY, isVisible]);

  // Don't render on touch devices
  if (isTouchDevice) return null;

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        ref={cursorRef}
        className={`${styles.cursor} ${isHovering ? styles.hovering : ''}`}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          opacity: isVisible ? 1 : 0,
        }}
      >
        {/* Inner dot */}
        <motion.div 
          className={styles.dot}
          animate={{
            scale: isHovering ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Hover ring */}
        <motion.div 
          className={styles.ring}
          animate={{
            scale: isHovering ? 1 : 0,
            opacity: isHovering ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          {hoverText && (
            <span className={styles.text}>{hoverText}</span>
          )}
        </motion.div>
      </motion.div>

      {/* Trailing cursor */}
      <motion.div
        className={styles.trailer}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          opacity: isVisible ? 0.5 : 0,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </>
  );
}
