import { useTranslation } from 'react-i18next';
import styles from './CategoryNav.module.css';

const CategoryNav = ({ categories, activeCategory, onChange }) => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language?.startsWith('en');
  const topics = [{ value: 'all', label: t('home.allCategories') }, ...categories.map((category) => ({ value: category, label: category }))];

  return (
    <nav className={styles.nav} aria-label={t('home.categoriesLabel')}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <span className={styles.kicker}>{isEnglish ? 'TOPIC INDEX' : 'KONU DİZİNİ'}</span>
          <span className={styles.current}>{activeCategory === 'all' ? t('home.allCategories') : activeCategory}</span>
        </div>

        <div className={styles.items}>
          {topics.map((topic, index) => {
            const isActive = activeCategory === topic.value;
            return (
              <button
                type="button"
                className={`${styles.item} ${isActive ? styles.active : ''}`}
                aria-pressed={isActive}
                key={topic.value}
                onClick={() => onChange(topic.value)}
              >
                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                <span>{topic.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
