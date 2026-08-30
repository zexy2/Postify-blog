import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiBookmark,
  FiActivity,
  FiChevronDown,
  FiInfo,
  FiLogIn,
  FiLogOut,
  FiMail,
  FiMoon,
  FiPlus,
  FiSearch,
  FiShield,
  FiSun,
  FiUser,
} from 'react-icons/fi';

import styles from './Header.module.css';
import { useTheme } from '../../hooks/useTheme';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcher from '../LanguageSwitcher';
import BrandMark from '../BrandMark';
const Sheet = lazy(() => import('../ui/sheet').then((module) => ({ default: module.Sheet })));
const SheetContent = lazy(() => import('../ui/sheet').then((module) => ({ default: module.SheetContent })));
const SheetTitle = lazy(() => import('../ui/sheet').then((module) => ({ default: module.SheetTitle })));

const CommandPalette = lazy(() => import('../CommandPalette'));

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState('⌘K');
  const accountMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const { theme, toggle: toggleTheme } = useTheme();
  const { bookmarksCount } = useBookmarks();
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.profile?.role === 'admin';
  const accountName = user?.profile?.full_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || (i18n.language?.startsWith('en') ? 'Account' : 'Hesap');
  const accountEmail = user?.email || '';
  const accountLabel = i18n.language?.startsWith('en') ? 'Account' : 'Hesap';
  const knowledgeLabel = i18n.language?.startsWith('en') ? 'Knowledge health' : 'Bilgi sağlığı';
  const isHome = location.pathname === '/';
  const activeType = isHome ? new URLSearchParams(location.search).get('type') : null;
  const formatLinks = [
    ['guide', i18n.language?.startsWith('en') ? 'Guides' : 'Rehberler'],
    ['decision', i18n.language?.startsWith('en') ? 'Decisions' : 'Kararlar'],
    ['fieldNote', i18n.language?.startsWith('en') ? 'Field notes' : 'Saha notları'],
  ];

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const handleHomeNavigation = useCallback(() => {
    closeMenu();
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [closeMenu]);
  const openSearch = useCallback(() => {
    closeMenu();
    setIsCommandOpen(true);
  }, [closeMenu]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsCommandOpen(false);
    setIsAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAccountOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setIsAccountOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsAccountOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAccountOpen]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [openSearch]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      setShortcutLabel(isMac ? '⌘K' : 'Ctrl K');
    }
  }, []);

  const handleLogout = () => {
    setIsAccountOpen(false);
    closeMenu();
    logout();
  };

  return (
    <header className={styles.header}>
      {isCommandOpen && <Suspense fallback={null}><CommandPalette open onClose={() => setIsCommandOpen(false)} /></Suspense>}

      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label="Postify" onClick={handleHomeNavigation}>
          <BrandMark size="md" />
          <span>Postify</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          <Link
            to="/"
            className={isHome && !activeType ? styles.active : ''}
            aria-current={isHome && !activeType ? 'page' : undefined}
            onClick={handleHomeNavigation}
          >
            {t('nav.home')}
          </Link>
          {formatLinks.map(([type, label]) => {
            const isActive = isHome && activeType === type;
            return (
              <Link
                key={type}
                to={`/?type=${type}#knowledge-feed`}
                className={isActive ? styles.active : ''}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.desktopActions}>
          <button type="button" className={styles.searchButton} onClick={openSearch} aria-label={t('search.open')}>
            <FiSearch size={15} />
            <span>{t('search.open')}</span>
            <kbd>{shortcutLabel}</kbd>
          </button>

          {isAuthenticated && (
            <Link to="/bookmarks" className={styles.iconButton} aria-label={t('nav.bookmarks')} title={t('nav.bookmarks')}>
              <FiBookmark size={17} />
              {bookmarksCount > 0 && <span className={styles.badge}>{bookmarksCount}</span>}
            </Link>
          )}

          {isAuthenticated ? (
            <Link to="/posts/create" className={styles.writeButton}>
              <FiPlus size={15} /> {t('nav.createPost')}
            </Link>
          ) : (
            <Link to="/auth/login" className={styles.loginButton}>
              <FiLogIn size={15} /> {t('auth.login')}
            </Link>
          )}

          {isAuthenticated && (
            <div className={styles.accountMenu} ref={accountMenuRef}>
              <button
                type="button"
                className={`${styles.accountButton} ${isAccountOpen ? styles.accountButtonOpen : ''}`}
                onClick={() => setIsAccountOpen((open) => !open)}
                aria-label={accountLabel}
                aria-expanded={isAccountOpen}
                aria-controls="header-account-popover"
              >
                <span className={styles.accountAvatar} aria-hidden="true">
                  {accountName.trim().charAt(0).toLocaleUpperCase(i18n.language || 'tr')}
                </span>
                <span className={styles.accountButtonName}>{accountName}</span>
                <FiChevronDown size={14} aria-hidden="true" />
              </button>

              {isAccountOpen && (
                <div id="header-account-popover" className={styles.accountPopover} aria-label={accountLabel}>
                  <div className={styles.accountIdentity}>
                    <strong>{accountName}</strong>
                    {accountEmail && <span>{accountEmail}</span>}
                  </div>
                  <div className={styles.accountLinks}>
                    <Link to="/profile">
                      <FiUser size={15} /> <span>{t('user.profile')}</span>
                    </Link>
                    <Link to="/knowledge">
                      <FiActivity size={15} /> <span>{knowledgeLabel}</span>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin">
                        <FiShield size={15} /> <span>{t('nav.admin')}</span>
                      </Link>
                    )}
                  </div>
                  <button type="button" className={styles.accountLogout} onClick={handleLogout}>
                    <FiLogOut size={15} /> <span>{t('auth.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={styles.utilityActions}>
            <LanguageSwitcher />
            <button
              type="button"
              onClick={toggleTheme}
              className={styles.iconButton}
              aria-label={theme === 'light' ? t('theme.dark') : t('theme.light')}
            >
              {theme === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
            </button>
          </div>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className={`${styles.menuButton} ${isMenuOpen ? styles.menuOpen : ''}`}
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={t('common.toggleMenu')}
          aria-expanded={isMenuOpen}
        >
          <span /><span /><span />
        </button>

        {isMenuOpen && <Suspense fallback={null}>
          <Sheet open onOpenChange={setIsMenuOpen} modal>
            <SheetContent
              side="right"
              className={styles.sheet}
              closeLabel={i18n.language?.startsWith('en') ? 'Close menu' : 'Menüyü kapat'}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                menuButtonRef.current?.focus();
              }}
            >
              <SheetTitle className="sr-only">{t('common.toggleMenu')}</SheetTitle>
              <div className={styles.mobilePanel}>
              <div className={styles.mobileTop}>
                <Link to="/" className={styles.logo} onClick={handleHomeNavigation}>
                  <BrandMark size="md" /><span>Postify</span>
                </Link>
                <p>{t('home.subtitle')}</p>
              </div>

              <button type="button" className={styles.mobileSearch} onClick={openSearch}>
                <FiSearch size={17} />
                <span>{t('home.searchPlaceholder')}</span>
              </button>

              <nav className={styles.mobileNav}>
                <Link
                  to="/"
                  onClick={handleHomeNavigation}
                  aria-current={isHome && !activeType ? 'page' : undefined}
                >
                  <span>{t('nav.home')}</span><small aria-hidden="true">01</small>
                </Link>
                {formatLinks.map(([type, label], index) => (
                  <Link
                    key={type}
                    to={`/?type=${type}#knowledge-feed`}
                    onClick={closeMenu}
                    aria-current={isHome && activeType === type ? 'page' : undefined}
                  >
                    <span>{label}</span><small aria-hidden="true">{String(index + 2).padStart(2, '0')}</small>
                  </Link>
                ))}
                {isAuthenticated && <Link to="/posts/create" onClick={closeMenu}><span>{t('nav.createPost')}</span><FiPlus size={16} /></Link>}
                {isAuthenticated && <Link to="/knowledge" onClick={closeMenu}><span>{i18n.language?.startsWith('en') ? 'Knowledge health' : 'Bilgi sağlığı'}</span><FiActivity size={16} /></Link>}
                {isAuthenticated && <Link to="/bookmarks" onClick={closeMenu}><span>{t('nav.bookmarks')}</span><small>{bookmarksCount || '—'}</small></Link>}
                <Link to="/about" onClick={closeMenu}><span>{t('nav.about')}</span><FiInfo size={16} /></Link>
                <Link to="/contact" onClick={closeMenu}><span>{t('nav.contact')}</span><FiMail size={16} /></Link>
                {isAuthenticated && <Link to="/profile" onClick={closeMenu}><span>{t('user.profile')}</span><FiUser size={16} /></Link>}
                {isAuthenticated && isAdmin && <Link to="/admin" onClick={closeMenu}><span>{t('nav.admin')}</span><FiShield size={16} /></Link>}
              </nav>

              <div className={styles.mobileFooter}>
                <div className={styles.mobileUtilities}>
                  <LanguageSwitcher />
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={styles.iconButton}
                    aria-label={theme === 'light' ? t('theme.dark') : t('theme.light')}
                  >
                    {theme === 'light' ? <FiMoon size={17} /> : <FiSun size={17} />}
                  </button>
                </div>
                {isAuthenticated ? (
                  <button type="button" onClick={handleLogout} className={styles.logoutButton}>
                    <FiLogOut size={16} /> {t('auth.logout')}
                  </button>
                ) : (
                  <Link to="/auth/login" className={styles.mobileLogin} onClick={closeMenu}>
                    <FiLogIn size={16} /> {t('auth.login')}
                  </Link>
                )}
              </div>
              </div>
            </SheetContent>
          </Sheet>
        </Suspense>}
      </div>
    </header>
  );
};

export default Header;
