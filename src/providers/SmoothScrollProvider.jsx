/**
 * SmoothScrollProvider
 *
 * Keeps the small scroll API used by the app without hijacking the browser's
 * native scrolling. A permanent requestAnimationFrame loop made wheel input
 * feel delayed on desktop, especially on long pages.
 */

import { createContext, useContext } from 'react';

const SmoothScrollContext = createContext(null);

export const useSmoothScroll = () => {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    console.warn('useSmoothScroll must be used within SmoothScrollProvider');
  }
  return context;
};

export default function SmoothScrollProvider({ children }) {
  const scrollTo = (target, options = {}) => {
    const offset = options.offset ?? -80;
    const behavior = options.behavior ?? 'auto';
    const targetElement = typeof target === 'string'
      ? document.querySelector(target)
      : typeof Element !== 'undefined' && target instanceof Element
        ? target
        : null;

    const top = targetElement
      ? targetElement.getBoundingClientRect().top + window.scrollY + offset
      : typeof target === 'number'
        ? target + offset
        : 0;

    window.scrollTo({ top, behavior });
  };

  // Kept as no-op compatibility methods for existing consumers.
  const stop = () => undefined;
  const start = () => undefined;

  return (
    <SmoothScrollContext.Provider value={{ lenis: null, scrollTo, stop, start }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
