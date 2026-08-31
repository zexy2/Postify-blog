import { useTranslation } from 'react-i18next';
import styles from './CategoryNav.module.css';
import { getCategoryLabel } from '../../lib/categoryLabels';

const CategoryNav = ({ categories, activeCategory, onChange }) => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language?.startsWith('en');
  const topics = [{ value: 'all', label: t('home.allCategories') }, ...categories.map((category) => ({ value: category, label: getCategoryLabel(category, i18n.language) }))];

  return (
    <nav className={styles.nav} aria-label={t('home.categoriesLabel')}>
      <div className={styles.inner}>
        <span className={styles.label}>{isEnglish ? 'Topics' : 'Konular'}</span>
        <div className={styles.items} onFocusCapture={(event) => event.target?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })}>
          {topics.map((topic) => {
            const isActive = activeCategory === topic.value;
            return (
              <button
                type="button"
                className={`${styles.item} ${isActive ? styles.active : ''}`}
                aria-pressed={isActive}
                key={topic.value}
                onClick={() => onChange(topic.value)}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
