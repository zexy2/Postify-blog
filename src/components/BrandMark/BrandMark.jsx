import styles from './BrandMark.module.css';

const BrandMark = ({ size = 'md', className = '' }) => (
  <svg
    className={`${styles.mark} ${styles[size]} ${className}`}
    viewBox="0 0 40 40"
    aria-hidden="true"
  >
    <path
      className={styles.page}
      d="M6 4.5h18.5L34 14v21.5H6V4.5Z"
    />
    <path className={styles.fold} d="M24.5 4.5V14H34" />
    <path
      className={styles.letter}
      d="M12.5 17.5h7.8c4.8 0 7.7 2.35 7.7 6.25S25.1 30 20.3 30h-3.8v4h-4V17.5Zm4 3.8v4.9h3.45c2.5 0 4.05-.82 4.05-2.45s-1.55-2.45-4.05-2.45H16.5Z"
    />
  </svg>
);

export default BrandMark;
