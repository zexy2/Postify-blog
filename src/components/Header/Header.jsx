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

  const [shortcutLabel, setShortcutLabel] = useState('⌘K');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      setShortcutLabel(isMac ? '⌘K' : 'Ctrl K');
    }
  }, []);

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
        <kbd className={styles.searchKbd}>{shortcutLabel}</kbd>
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

  const renderMobileNav = () => (
    <div className={styles.mobileDrawerContainer}>
      {/* 1. Quick Search Trigger */}
      <div className={styles.mobileSearchWrapper}>
        <button
          type="button"
          className={styles.mobileSearchTrigger}
          onClick={() => { closeMenu(); setIsCommandOpen(true); }}
          aria-label={t('search.open')}
        >
          <FiSearch size={18} className={styles.mobileSearchIcon} />
          <span className={styles.mobileSearchPlaceholder}>{t('search.open')}...</span>
        </button>
      </div>

      {/* 2. User Profile Card or Login CTA Banner */}
      {isAuthenticated && user ? (
        <div className={styles.mobileProfileCard}>
          <div className={styles.mobileAvatar}>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt={user?.user_metadata?.full_name || 'User'} />
            ) : (
              <FiUser size={18} />
            )}
          </div>
          <div className={styles.mobileUserInfo}>
            <span className={styles.mobileUserName}>
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('user.profile')}
            </span>
            <span className={styles.mobileUserEmail}>{user?.email}</span>
          </div>
          <Link
            to="/profile"
            className={styles.mobileProfileBtn}
            onClick={closeMenu}
          >
            Profil
          </Link>
        </div>
      ) : (
        <div className={styles.mobileGuestBanner}>
          <div className={styles.mobileGuestInfo}>
            <span className={styles.mobileGuestTitle}>Postify'a Hoş Geldiniz</span>
            <span className={styles.mobileGuestDesc}>Yazıları kaydetmek ve paylaşmak için giriş yapın</span>
          </div>
          <Link
            to="/auth/login"
            className={styles.mobileGuestLoginBtn}
            onClick={closeMenu}
          >
            <FiLogIn size={16} />
            <span>{t('auth.login')}</span>
          </Link>
        </div>
      )}

      {/* 3. Navigation Links List */}
      <div className={styles.mobileNavSection}>
        <span className={styles.mobileSectionLabel}>NAVİGASYON</span>
        <nav className={styles.mobileNavList}>
          <Link
            to="/"
            className={`${styles.mobileNavItem} ${isActive('/') ? styles.mobileActive : ''}`}
            onClick={closeMenu}
          >
            <div className={styles.mobileIconWrapper}>
              <FiHome size={18} />
            </div>
            <div className={styles.mobileNavContent}>
              <span className={styles.mobileNavTitle}>{t('nav.home')}</span>
              <span className={styles.mobileNavDesc}>Ana Sayfa ve Akış</span>
            </div>
          </Link>

          {isAuthenticated && (
            <Link
              to="/posts/create"
              className={`${styles.mobileNavItem} ${styles.mobileCreatePostItem} ${isActive('/posts/create') ? styles.mobileActive : ''}`}
              onClick={closeMenu}
            >
              <div className={`${styles.mobileIconWrapper} ${styles.createIconWrapper}`}>
                <FiPlus size={18} />
              </div>
              <div className={styles.mobileNavContent}>
                <span className={styles.mobileNavTitle}>{t('nav.createPost')}</span>
                <span className={styles.mobileNavDesc}>Yeni Yazı Paylaş</span>
              </div>
            </Link>
          )}

          {isAuthenticated && (
            <Link
              to="/bookmarks"
              className={`${styles.mobileNavItem} ${isActive('/bookmarks') ? styles.mobileActive : ''}`}
              onClick={closeMenu}
            >
              <div className={styles.mobileIconWrapper}>
                <FiBookmark size={18} />
              </div>
              <div className={styles.mobileNavContent}>
                <span className={styles.mobileNavTitle}>Yer İşaretleri</span>
                <span className={styles.mobileNavDesc}>Kaydedilen İçerikler</span>
              </div>
              {bookmarksCount > 0 && (
                <span className={styles.mobileCountBadge}>{bookmarksCount}</span>
              )}
            </Link>
          )}

          <Link
            to="/about"
            className={`${styles.mobileNavItem} ${isActive('/about') ? styles.mobileActive : ''}`}
            onClick={closeMenu}
          >
            <div className={styles.mobileIconWrapper}>
              <FiInfo size={18} />
            </div>
            <div className={styles.mobileNavContent}>
              <span className={styles.mobileNavTitle}>{t('nav.about')}</span>
              <span className={styles.mobileNavDesc}>Hakkımızda ve Detaylar</span>
            </div>
          </Link>

          <Link
            to="/contact"
            className={`${styles.mobileNavItem} ${isActive('/contact') ? styles.mobileActive : ''}`}
            onClick={closeMenu}
          >
            <div className={styles.mobileIconWrapper}>
              <FiMail size={18} />
            </div>
            <div className={styles.mobileNavContent}>
              <span className={styles.mobileNavTitle}>{t('nav.contact')}</span>
              <span className={styles.mobileNavDesc}>İletişime Geçin</span>
            </div>
          </Link>

          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className={`${styles.mobileNavItem} ${styles.mobileAdminNavItem} ${isActive('/admin') ? styles.mobileActive : ''}`}
              onClick={closeMenu}
            >
              <div className={`${styles.mobileIconWrapper} ${styles.adminIconWrapper}`}>
                <FiShield size={18} />
              </div>
              <div className={styles.mobileNavContent}>
                <span className={styles.mobileNavTitle}>{t('nav.admin', 'Admin Panel')}</span>
                <span className={styles.mobileNavDesc}>Yönetici Kontrolleri</span>
              </div>
            </Link>
          )}
        </nav>
      </div>

      {/* 4. Bottom Footer & Actions */}
      <div className={styles.mobileDrawerFooter}>
        <div className={styles.mobileAuthAction}>
          {isAuthenticated ? (
            <button
              onClick={() => { handleLogout(); closeMenu(); }}
              className={styles.mobileLogoutButton}
            >
              <FiLogOut size={17} />
              <span>{t('auth.logout')}</span>
            </button>
          ) : (
            <Link
              to="/auth/login"
              className={styles.mobileLoginButton}
              onClick={closeMenu}
            >
              <FiLogIn size={17} />
              <span>{t('auth.login')}</span>
            </Link>
          )}
        </div>

        <div className={styles.mobileUtilsCluster}>
          <div className={styles.mobileLangWrap}>
            <LanguageSwitcher />
          </div>

          <a
            href="https://github.com/zexy2"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileUtilIconBtn}
            onClick={closeMenu}
            aria-label="GitHub"
            title="GitHub"
          >
            <FiGithub size={18} />
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            className={styles.mobileUtilIconBtn}
            aria-label={theme === 'light' ? t('theme.dark') : t('theme.light')}
            title={theme === 'light' ? t('theme.dark') : t('theme.light')}
          >
            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <header className={styles.header}>
      <CommandPalette open={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

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
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen} modal={true}>
          <SheetContent side="right" className={styles.shadcnSheetContent}>
            <SheetTitle className="sr-only">Navigasyon Menüsü</SheetTitle>
            <div className={styles.shadcnSheetBody}>
              {renderMobileNav()}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
