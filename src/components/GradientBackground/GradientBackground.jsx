/**
 * GradientBackground Component
 * GradFlow ile animasyonlu arka plan
 * Postify renk paletiyle uyumlu
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import styles from './GradientBackground.module.css';

// GradFlow pulls in OGL and creates a continuously-rendered WebGL canvas. Keep
// that cost out of the critical path and never start it on constrained devices.
const LazyGradFlow = lazy(() =>
  import('gradflow').then(({ GradFlow }) => ({ default: GradFlow }))
);

const canUseAnimatedGradient = () => {
  if (typeof window === 'undefined') return false;

  const connection = navigator.connection;
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
  const isLowPowerDevice = (navigator.hardwareConcurrency || 8) <= 4;

  if (
    prefersReducedMotion ||
    isSmallScreen ||
    isLowPowerDevice ||
    connection?.saveData ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g'
  ) {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) ||
        canvas.getContext('experimental-webgl', {
          failIfMajorPerformanceCaveat: true,
        })
    );
  } catch {
    return false;
  }
};

class WebGLFallbackBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const GradientBackground = ({
  type = 'silk',
  opacity = 0.4,
  speed = 0.3,
  className = '',
}) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!canUseAnimatedGradient()) return undefined;

    let mounted = true;
    const load = () => {
      if (mounted) setAnimated(true);
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(load, { timeout: 3000 });
      return () => {
        mounted = false;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(load, 2500);
    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      className={`${styles.container} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className={styles.staticGradient} />
      {animated && (
        <WebGLFallbackBoundary>
          <Suspense fallback={null}>
            <LazyGradFlow
              config={{
                color1: '#5e6ad2',
                color2: '#8b95e0',
                color3: '#3d4692',
                speed,
                scale: 1.5,
                type,
                noise: 0.06,
              }}
              className={styles.gradient}
            />
          </Suspense>
        </WebGLFallbackBoundary>
      )}
    </div>
  );
};

// Farklı sayfa türleri için preset'ler
export const GradientPresets = {
  // Hero için - yavaş, zarif silk
  hero: {
    type: 'silk',
    opacity: 0.35,
    speed: 0.25,
  },
  // Sayfalar için - subtle smoke
  page: {
    type: 'smoke',
    opacity: 0.25,
    speed: 0.2,
  },
  // Dinamik alanlar için - animated
  dynamic: {
    type: 'animated',
    opacity: 0.3,
    speed: 0.4,
  },
  // Minimal - wave
  minimal: {
    type: 'wave',
    opacity: 0.2,
    speed: 0.15,
  },
};

export default GradientBackground;
