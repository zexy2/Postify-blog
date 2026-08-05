/**
 * ScrollReveal Component
 * Reusable wrapper for GSAP scroll-triggered animations
 */

import { useEffect, useRef, useState } from 'react';

const ANIMATION_PRESETS = {
  fadeUp: {
    from: { opacity: 0, y: 60 },
    to: { opacity: 1, y: 0 },
  },
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeLeft: {
    from: { opacity: 0, x: -60 },
    to: { opacity: 1, x: 0 },
  },
  fadeRight: {
    from: { opacity: 0, x: 60 },
    to: { opacity: 1, x: 0 },
  },
  scaleIn: {
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
  },
  slideUp: {
    from: { y: 100 },
    to: { y: 0 },
  },
};

export default function ScrollReveal({
  children,
  animation = 'fadeUp',
  duration = 0.8,
  delay = 0,
  start = 'top 85%',
  end = 'bottom 15%',
  scrub = false,
  markers = false,
  once = false,
  className = '',
  style = {},
  as: Component = 'div',
}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  // These props remain part of the public API for existing callers. The
  // lightweight observer below intentionally replaces ScrollTrigger here.
  void start;
  void end;
  void scrub;
  void markers;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

    if (prefersReducedMotion || isSmallScreen) {
      return;
    }

    setIsVisible(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.unobserve(element);
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0.1 }
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [animation, duration, delay, start, end, scrub, markers, once]);

  const preset = ANIMATION_PRESETS[animation] || ANIMATION_PRESETS.fadeUp;
  const initialTransform = `translate3d(${preset.from.x || 0}px, ${preset.from.y || 0}px, 0) scale(${preset.from.scale || 1})`;

  return (
    <Component
      ref={elementRef}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : (preset.from.opacity ?? 1),
        transform: isVisible ? 'none' : initialTransform,
        transition: `opacity ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s`,
      }}
    >
      {children}
    </Component>
  );
}
