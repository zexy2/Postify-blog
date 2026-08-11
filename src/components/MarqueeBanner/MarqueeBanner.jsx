import { FiZap, FiStar, FiSearch, FiCode, FiGlobe } from 'react-icons/fi';
import styles from './MarqueeBanner.module.css';

const MarqueeBanner = () => {
  const items = [
    { icon: <FiZap className={styles.icon} />, text: 'Frontend & Web Performance' },
    { icon: <FiStar className={styles.icon} />, text: 'Curated Technology Notes' },
    { icon: <FiSearch className={styles.icon} />, text: '⌘K Quick Command Search' },
    { icon: <FiCode className={styles.icon} />, text: 'Open Source Community' },
    { icon: <FiGlobe className={styles.icon} />, text: 'Independent Tech Journal' },
  ];

  return (
    <div className={styles.marqueeContainer} aria-hidden="true">
      <div className={styles.track}>
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <div className={styles.item} key={idx}>
            {item.icon}
            <span>{item.text}</span>
            <span className={styles.dot}>•</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
