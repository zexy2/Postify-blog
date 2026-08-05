/**
 * HomePage Component
 * Premium blog homepage with Hero and Bento Grid layout
 */

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FiPlus, FiSearch, FiArrowRight, FiTrendingUp } from 'react-icons/fi';

// Components
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';
import ScrollReveal from '../components/ScrollReveal';

// Hooks & State
import { usePosts } from '../hooks/usePosts';
import { useSearch } from '../hooks/useSearch';
import { useBookmarks } from '../hooks/useBookmarks';

// Styles
import styles from './HomePage.module.css';

const HomePage = () => {
  const { t } = useTranslation();
  const { posts, usersMap, isLoading, isError, error } = usePosts();
  const { query, debouncedQuery, setQuery } = useSearch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const [visiblePostCount, setVisiblePostCount] = useState(12);

  // Filter posts based on search
  const filteredPosts = useMemo(() => {
    if (!debouncedQuery.trim()) return posts;

    return posts.filter((post) => {
      const author = usersMap[post.userId];
      const searchFields = [
        post.title,
        post.body,
        author?.name,
        author?.username,
        author?.email,
      ].filter(Boolean);

      const normalizedQuery = debouncedQuery.toLowerCase();
      return searchFields.some((field) =>
        field.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [posts, usersMap, debouncedQuery]);

  useEffect(() => {
    setVisiblePostCount(12);
  }, [debouncedQuery]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((post) => {
    toggleBookmark(post);
  }, [toggleBookmark]);

  // Loading State
  if (isLoading) {
    return (
      <div className={styles.page}>
        <Hero 
          title="Postify" 
          subtitle={t('home.subtitle', 'Discover stories, insights, and ideas')}
          showSearch={false}
        />
        <section className={`container ${styles.section}`}>
          <BentoGrid posts={[]} isLoading={true} />
        </section>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>😕</div>
            <h3>{t('common.error')}</h3>
            <p>{error?.message || 'An error occurred'}</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Hero Section - Only show when not searching */}
      {!query && (
        <Hero
          title="Postify"
          subtitle={t('about.description', 'A modern blog platform for sharing ideas and stories')}
          showSearch={true}
          searchValue={query}
          onSearchChange={setQuery}
        />
      )}

      {/* Stats Section */}
      {!query && (
        <section className={`container ${styles.statsSection}`}>
          <ScrollReveal animation="fadeUp" delay={0.2}>
            <div className={styles.statsGrid}>
              {[
                { label: t('analytics.totalPosts'), value: posts.length, icon: '📝' },
                { label: t('analytics.totalAuthors'), value: Object.keys(usersMap).length, icon: '✍️' },
                { label: t('analytics.totalComments'), value: posts.length * 5, icon: '💬' },
                { label: t('bookmarks.title'), value: bookmarkedIds.length || '∞', icon: '🔖' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={styles.statCard}
                >
                  <span className={styles.statIcon}>{stat.icon}</span>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* CTA Section */}
      {!query && (
        <section className={`container ${styles.ctaSection}`}>
          <ScrollReveal animation="fadeUp" delay={0.3}>
            <div className={styles.ctaWrapper}>
              {isAuthenticated ? (
                <Link to="/posts/create" className={styles.ctaPrimary}>
                  <FiPlus size={20} />
                  {t('posts.createPost')}
                </Link>
              ) : (
                <Link to="/auth/register" className={styles.ctaPrimary}>
                  {t('auth.register')}
                  <FiArrowRight size={18} />
                </Link>
              )}
              <Link to="/about" className={styles.ctaSecondary}>
                {t('nav.about')}
              </Link>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Posts Section */}
      <section className={`container ${styles.postsSection}`}>
        {/* Section Header */}
        <ScrollReveal animation="fadeUp">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                {query ? (
                  <>
                    <FiSearch size={24} />
                    "{query}"
                  </>
                ) : (
                  <>
                    <FiTrendingUp size={24} />
                    {t('posts.latestPosts')}
                  </>
                )}
              </h2>
              <p className={styles.sectionSubtitle}>
                {filteredPosts.length} {t('posts.title').toLowerCase()}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* No Results */}
        {filteredPosts.length === 0 && query && (
          <ScrollReveal animation="scaleIn">
            <div className={styles.noResults}>
              <FiSearch size={48} />
              <h3>{t('common.noResults')}</h3>
              <p>"{query}" {t('common.noResultsFor')}</p>
            </div>
          </ScrollReveal>
        )}

        {/* Bento Grid */}
        <BentoGrid 
          posts={filteredPosts.slice(0, visiblePostCount)}
          isLoading={false}
          onBookmarkToggle={handleBookmarkToggle}
          bookmarkedIds={bookmarkedIds}
        />

        {/* Load More */}
        {filteredPosts.length > visiblePostCount && (
          <ScrollReveal animation="fadeUp">
            <div className={styles.loadMore}>
              <button
                className={styles.loadMoreButton}
                onClick={() => setVisiblePostCount((count) => count + 12)}
              >
                {t('common.loadMore')} ({filteredPosts.length - visiblePostCount} more)
              </button>
            </div>
          </ScrollReveal>
        )}
      </section>
    </div>
  );
};

export default HomePage;
