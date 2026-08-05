/**
 * BackgroundPaths Component
 * Inspired by 21st.dev/Kokonut UI - Animated SVG background paths
 */

import styles from './BackgroundPaths.module.css';

function FloatingPath({ d, delay = 0, duration = 20 }) {
  return (
    <path
      d={d}
      stroke="url(#pathGradient)"
      strokeWidth="0.5"
      fill="none"
      className={styles.path}
      style={{ '--path-delay': `${delay}s`, '--path-duration': `${duration}s` }}
    />
  );
}

export default function BackgroundPaths({ className = '' }) {
  const paths = [
    "M-100 300 Q 200 100 500 300 T 900 300 T 1300 300",
    "M-50 400 Q 250 200 550 400 T 950 400 T 1350 400",
    "M0 500 Q 300 300 600 500 T 1000 500 T 1400 500",
    "M50 350 Q 350 150 650 350 T 1050 350 T 1450 350",
    "M-150 450 Q 150 250 450 450 T 850 450 T 1250 450",
  ];

  return (
    <div className={`${styles.backgroundPaths} ${className}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>
        
        {paths.map((d, index) => (
          <FloatingPath
            key={index}
            d={d}
            delay={index * 2}
            duration={15 + index * 2}
          />
        ))}
      </svg>
    </div>
  );
}
