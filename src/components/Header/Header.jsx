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
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const { theme, toggle: toggleTheme } = useTheme();
  const { bookmarksCount } = useBookmarks();
  const { isAuthenticated, user, logout: handleLogout } = useAuth();

  const isAdmin = user?.profile?.role === 'admin';

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const isActive = (path) => location.pathname === path;

  const renderNavContent = (isMobile = false) => (
    <>
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
      </nav>

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
    </>
  );

  return (
    <header className={styles.header}>
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      <div className={styles.container}>
        <div className={styles.logoSection}>
          <Link to="/" className={styles.logo} aria-label="Postify Home" onClick={closeMenu}>
            <BrandMark size="sm" />
            <span className={styles.logoText}>Postify</span>
          </Link>
        </div>

        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`}
          onClick={toggleMenu}
          aria-label={t('common.toggleMenu')}
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Desktop Inline Navigation */}
        <div className={`${styles.navContainer} ${styles.desktopNav}`}>
          {renderNavContent(false)}
        </div>

        {/* Shadcn UI Sheet Drawer for Mobile */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetContent side="right" className={styles.shadcnSheetContent}>
            <SheetTitle className="sr-only">Navigasyon Menüsü</SheetTitle>
            <div className={styles.shadcnSheetBody}>
              {renderNavContent(true)}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
