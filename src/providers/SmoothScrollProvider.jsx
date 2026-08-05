/**
 * SmoothScrollProvider
 * Wraps the app with Lenis for cinematic smooth scrolling
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';

const SmoothScrollContext = createContext(null);

export const useSmoothScroll = () => {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    console.warn('useSmoothScroll must be used within SmoothScrollProvider');
  }
  return context;
};

export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    const isLowPowerDevice = (navigator.hardwareConcurrency || 8) <= 4;
    const connection = navigator.connection;

    if (
      prefersReducedMotion ||
      isSmallScreen ||
      isLowPowerDevice ||
      connection?.saveData ||
      connection?.effectiveType === '2g' ||
      connection?.effectiveType === 'slow-2g'
    ) {
      return undefined;
    }

    let mounted = true;
    let lenisInstance;
    let frameId;

    const initializeLenis = async () => {
      const [{ default: Lenis }] = await Promise.all([
        import('lenis'),
        import('lenis/dist/lenis.css'),
      ]);

      if (!mounted) return;

      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      lenisRef.current = lenisInstance;
      setLenis(lenisInstance);

      const raf = (time) => {
        lenisInstance?.raf(time);
        frameId = window.requestAnimationFrame(raf);
      };

      frameId = window.requestAnimationFrame(raf);
    };

    const idleId = 'requestIdleCallback' in window
      ? window.requestIdleCallback(initializeLenis, { timeout: 2500 })
      : window.setTimeout(initializeLenis, 1800);

    return () => {
      mounted = false;
      if ('cancelIdleCallback' in window && typeof idleId === 'number') {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
      if (frameId) window.cancelAnimationFrame(frameId);
      lenisInstance?.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  // Scroll to element helper
  const scrollTo = (target, options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: -80, // Account for header
        duration: 1.2,
        ...options,
      });
    }
  };

  // Stop/start scroll
  const stop = () => lenisRef.current?.stop();
  const start = () => lenisRef.current?.start();

  return (
    <SmoothScrollContext.Provider value={{ lenis, scrollTo, stop, start }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
