/**
 * LanguageSwitcher Component
 * Toggle between TR and EN languages
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FiGlobe } from 'react-icons/fi';
import { setLanguage, selectLanguage } from '../../store/slices/uiSlice';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();
  const currentLanguage = useSelector(selectLanguage);

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'tr' ? 'en' : 'tr';
    dispatch(setLanguage(newLang));
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={styles.button}
      title={t('common.toggleLanguage')}
      aria-label={t('common.toggleLanguage')}
    >
      <FiGlobe size={15} aria-hidden="true" />
      <span className={styles.languageCode}>{currentLanguage.toUpperCase()}</span>
    </button>
  );
};

export default LanguageSwitcher;
