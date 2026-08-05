/**
 * AnimationProvider
 * GSAP context and timeline management for coordinated animations
 */

import { createContext, useContext, useEffect, useRef } from 'react';

const AnimationContext = createContext(null);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    console.warn('useAnimation must be used within AnimationProvider');
  }
  return context;
};

// Animation presets
export const ANIMATION_PRESETS = {
  fadeUp: {
    from: { opacity: 0, y: 60 },
    to: { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
  },
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1, duration: 0.6, ease: 'power2.out' },
  },
  scaleIn: {
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
  },
  slideInLeft: {
    from: { opacity: 0, x: -60 },
    to: { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
  },
  slideInRight: {
    from: { opacity: 0, x: 60 },
    to: { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
  },
  staggerUp: {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
  },
};

export default function AnimationProvider({ children }) {
  const contextRef = useRef(null);

  useEffect(() => {
    contextRef.current = { cleanups: [] };
    return () => contextRef.current?.cleanups.forEach((cleanup) => cleanup());
  }, []);

  // Create scroll-triggered animation
  const createScrollTrigger = (element, animation, options = {}) => {
    if (!element) return null;

    const preset = ANIMATION_PRESETS[animation] || animation;
    
    const nativeAnimation = element.animate(
      [preset.from, preset.to],
      { duration: (preset.to.duration || 0.8) * 1000, fill: 'both', ...options }
    );
    return nativeAnimation;
  };

  // Animate element with preset
  const animate = (element, preset, options = {}) => {
    if (!element) return null;
    
    const config = ANIMATION_PRESETS[preset] || preset;
    return element.animate([config.from, config.to], {
      duration: (config.to.duration || 0.8) * 1000,
      fill: 'both',
      ...options,
    });
  };

  // Create staggered animation
  const stagger = (elements, preset, staggerTime = 0.1) => {
    if (!elements?.length) return null;
    
    const config = ANIMATION_PRESETS[preset] || ANIMATION_PRESETS.staggerUp;
    return elements.map((element, index) => element.animate([config.from, config.to], {
      duration: (config.to.duration || 0.6) * 1000,
      delay: index * staggerTime * 1000,
      fill: 'both',
    }));
  };

  // Kill specific animation
  const kill = (animation) => {
    if (animation?.cancel) animation.cancel();
  };

  // Refresh all ScrollTriggers
  const refresh = () => {
    // Native Web Animations do not require a global refresh.
  };

  const value = {
    gsap: null,
    ScrollTrigger: null,
    createScrollTrigger,
    animate,
    stagger,
    kill,
    refresh,
    presets: ANIMATION_PRESETS,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}
