/**
 * TextReveal Component
 * Inspired by 21st.dev - Text reveal animation on scroll/load
 */

import styles from './TextReveal.module.css';

export default function TextReveal({ 
  text, 
  className = '',
  delay = 0,
  staggerDelay = 0.03,
  duration = 0.5,
  as: Component = 'span',
}) {
  const words = text.split(' ');

  void delay;
  void staggerDelay;
  void duration;

  return (
    <Component
      className={`${styles.textReveal} ${className}`}
    >
      {words.map((word, index) => (
        <span
          key={index}
          className={styles.word}
        >
          {word}
          {index < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </Component>
  );
}
