import { useTranslation } from 'react-i18next';
import styles from './CategoryNav.module.css';

const CategoryNav = ({ categories, activeCategory, onChange }) => {
  const { t } = useTranslation();
  return (
    <nav className={styles.nav} aria-label={t('home.categoriesLabel')}>
      <div className={styles.inner}>
        <span className={styles.label}>{t('home.categoriesLabel')}</span>
        <div className={styles.items} role="list">
          <button
            type="button"
            className={`${styles.item} ${activeCategory === 'all' ? styles.active : ''}`}
            aria-pressed={activeCategory === 'all'}
            onClick={() => onChange('all')}
          >
            {t('home.allCategories')}
          </button>
          {categories.map((category) => (
            <button
              type="button"
              className={`${styles.item} ${activeCategory === category ? styles.active : ''}`}
              aria-pressed={activeCategory === category}
              key={category}
              onClick={() => onChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
