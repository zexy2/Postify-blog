/**
 * Header Component
 * Main navigation header with search, theme toggle, and language switcher
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiBookmark, FiBarChart2, FiGithub, FiUser, FiLogIn, FiLogOut, FiShield } from 'react-icons/fi';

import styles from './Header.module.css';
import { useTheme } from '../../hooks/useTheme';
import { useSearch } from '../../hooks/useSearch';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useAuth } from '../../hooks/useAuth';
import { localAuthService } from '../../services/localAuthService';
import LanguageSwitcher from '../LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { theme, toggle: toggleTheme } = useTheme();
  const { query, setQuery } = useSearch();
  const { bookmarksCount } = useBookmarks();
  const { isAuthenticated, user, logout: handleLogout } = useAuth();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (isAuthenticated) {
        const adminStatus = await localAuthService.isAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [isAuthenticated, user]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" onClick={closeMenu}>
            <span className={styles.logoIcon}>📝</span>
            Postify
          </Link>
        </div>

        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`${styles.navContainer} ${isMenuOpen ? styles.open : ''}`}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder={`🔍 ${t('common.searchPosts')}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Navigation Links */}
          <nav className={styles.navLinks}>
            <Link
              to="/"
              className={isActive('/') ? styles.active : ''}
              onClick={closeMenu}
            >
              {t('nav.home')}
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
              to="/analytics"
              className={`${styles.iconLink} ${isActive('/analytics') ? styles.active : ''}`}
              onClick={closeMenu}
            >
              <FiBarChart2 size={18} />
            </Link>

            <Link
              to="/about"
              className={isActive('/about') ? styles.active : ''}
              onClick={closeMenu}
            >
              {t('nav.about')}
            </Link>

            <Link
              to="/contact"
              className={isActive('/contact') ? styles.active : ''}
              onClick={closeMenu}
            >
              {t('nav.contact')}
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
                      title="Admin Panel"
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
              >
                <FiGithub size={18} />
              </a>

              <button onClick={toggleTheme} className={styles.themeToggle}>
                {theme === 'light' ? '🌙' : '🌞'}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
