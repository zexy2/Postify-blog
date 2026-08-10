/**
 * Header Component
 * Main navigation header with search, theme toggle, and language switcher
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiBookmark, FiGithub, FiUser, FiLogIn, FiLogOut, FiShield, FiMoon, FiSun, FiSearch, FiHome, FiInfo, FiMail } from 'react-icons/fi';

import styles from './Header.module.css';
import { useTheme } from '../../hooks/useTheme';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcher from '../LanguageSwitcher';
import CommandPalette from '../CommandPalette';
import BrandMark from '../BrandMark';

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const { theme, toggle: toggleTheme } = useTheme();
  const { bookmarksCount } = useBookmarks();
  const { isAuthenticated, user, logout: handleLogout } = useAuth();

  const isAdmin = user?.profile?.role === 'admin';

  const toggleMenu = () => setIsMenuOpen((open) => !open);
  const closeMenu = () => setIsMenuOpen(false);
  const closeCommand = useCallback(() => setIsCommandOpen(false), []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsCommandOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandOpen(true);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" onClick={closeMenu}>
            <BrandMark size="md" />
            Postify
          </Link>
        </div>

        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`}
          onClick={toggleMenu}
          aria-label={t('common.toggleMenu')}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {isMenuOpen && <button type="button" className={styles.menuBackdrop} onClick={closeMenu} aria-label={t('common.closeMenu')} />}
        <div id="primary-navigation" className={`${styles.navContainer} ${isMenuOpen ? styles.open : ''}`}>
          {/* 21st.dev Style Top Banner */}
          <div className={styles.mobileMenuHeaderCard}>
            <div className={styles.mobileMenuBadge}>✨ POSTIFY EDITORIAL</div>
            <h3 className={styles.mobileMenuCardTitle}>{t('about.title', 'Modern Teknoloji & Tasarım Dergisi')}</h3>
            <p className={styles.mobileMenuCardDesc}>{t('home.subtitle', 'Güncel makaleleri, rehberleri ve analizleri keşfedin.')}</p>

            <div className={styles.mobileMenuTopics}>
              {['AI', 'Frontend', 'Design', 'Supabase'].map((topic) => (
                <Link
                  key={topic}
                  to="/"
                  className={styles.mobileTopicTag}
                  onClick={closeMenu}
                >
                  #{topic}
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={styles.searchTrigger}
            onClick={() => { closeMenu(); setIsCommandOpen(true); }}
            aria-label={t('search.open')}
          >
            <FiSearch size={16} />
            <span>{t('search.open')}</span>
            <kbd>⌘K</kbd>
          </button>

          {/* Navigation Links */}
          <nav className={styles.navLinks}>
            <Link
              to="/"
              className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}
              onClick={closeMenu}
            >
              <FiHome size={17} className={styles.navIcon} />
              <span>{t('nav.home')}</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/posts/create"
                className={`${styles.createButton} ${isActive('/posts/create') ? styles.active : ''}`}
                onClick={closeMenu}
              >
                <FiPlus size={16} />
                {t('nav.createPost')}
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/bookmarks"
                className={`${styles.iconLink} ${isActive('/bookmarks') ? styles.active : ''}`}
                onClick={closeMenu}
              >
                <FiBookmark size={18} />
                {bookmarksCount > 0 && (
                  <span className={styles.badge}>{bookmarksCount}</span>
                )}
              </Link>
            )}

            <Link
              to="/about"
              className={`${styles.navItem} ${isActive('/about') ? styles.active : ''}`}
              onClick={closeMenu}
            >
              <FiInfo size={17} className={styles.navIcon} />
              <span>{t('nav.about')}</span>
            </Link>

            <Link
              to="/contact"
              className={`${styles.navItem} ${isActive('/contact') ? styles.active : ''}`}
              onClick={closeMenu}
            >
              <FiMail size={17} className={styles.navIcon} />
              <span>{t('nav.contact')}</span>
            </Link>

            {/* Actions */}
            <div className={styles.actions}>
              {/* Auth Links */}
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`${styles.adminLink} ${isActive('/admin') ? styles.active : ''}`}
                      onClick={closeMenu}
                      title={t('nav.admin', 'Admin')}
                    >
                      <FiShield size={18} />
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className={`${styles.iconLink} ${isActive('/profile') ? styles.active : ''}`}
                    onClick={closeMenu}
                    title={user?.user_metadata?.full_name || t('user.profile')}
                  >
                    <FiUser size={18} />
                  </Link>
                  <button
                    onClick={() => { handleLogout(); closeMenu(); }}
                    className={styles.logoutButton}
                    title={t('auth.logout')}
                  >
                    <FiLogOut size={18} />
                  </button>
                </>
              ) : (
                <Link
                  to="/auth/login"
                  className={styles.loginButton}
                  onClick={closeMenu}
                >
                  <FiLogIn size={16} />
                  {t('auth.login')}
                </Link>
              )}

              <LanguageSwitcher />

              <a
                href="https://github.com/zexy2"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubButton}
                onClick={closeMenu}
                aria-label="GitHub"
                title="GitHub"
              >
                <FiGithub size={18} />
              </a>

              <button
                type="button"
                onClick={toggleTheme}
                className={styles.themeToggle}
                aria-label={theme === 'light' ? t('theme.dark') : t('theme.light')}
                title={theme === 'light' ? t('theme.dark') : t('theme.light')}
              >
                {theme === 'light' ? <FiMoon size={17} /> : <FiSun size={17} />}
              </button>
            </div>
          </nav>
        </div>
      </div>
      </header>
      <CommandPalette open={isCommandOpen} onClose={closeCommand} />
    </>
  );
};

export default Header;
