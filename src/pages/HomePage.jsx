import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FiArrowRight, FiPlus, FiSearch } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';
import { usePosts } from '../hooks/usePosts';
import { useSearch } from '../hooks/useSearch';
import { useBookmarks } from '../hooks/useBookmarks';
import postService from '../services/postService';
import styles from './HomePage.module.css';

const withTimeout = (promise, milliseconds) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => {
    const error = new Error('CONTENT_TIMEOUT');
    error.code = 'CONTENT_TIMEOUT';
    reject(error);
  }, milliseconds)),
]);

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const { posts, isLoading, isError, error, refetch } = usePosts();
  const { query, debouncedQuery, setQuery } = useSearch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const { bookmarkedIds, toggle: toggleBookmark } = useBookmarks();
  const [showWakeUp, setShowWakeUp] = useState(false);
  const [visiblePostCount, setVisiblePostCount] = useState(9);

  const statsQuery = useQuery({
    queryKey: ['post-stats'],
    queryFn: () => withTimeout(postService.getStats(), 12000),
    staleTime: 1000 * 60 * 10,
    retry: 0,
  });

  useEffect(() => {
    if (!isLoading) return undefined;
    const timer = window.setTimeout(() => setShowWakeUp(true), 3000);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => setVisiblePostCount(9), [debouncedQuery, i18n.language]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLocaleLowerCase(i18n.language);
    if (!normalizedQuery) return posts;

    return posts.filter((post) => [
      post.title,
      post.excerpt,
      post.body,
      post.category,
      post.author?.name,
      post.author?.username,
    ].filter(Boolean).some((field) => field.toLocaleLowerCase(i18n.language).includes(normalizedQuery)));
  }, [debouncedQuery, i18n.language, posts]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Hero showSearch={false} />
        <section className={`container ${styles.loadingSection}`}>
          <BentoGrid posts={[]} isLoading />
          {showWakeUp && (
            <p className={styles.wakeUpMessage} role="status">
              <strong>{t('home.wakeUp')}</strong> {t('home.wakeUpHint')}
            </p>
          )}
        </section>
      </div>
    );
  }

  if (isError) {
    const isTimeout = error?.code === 'CONTENT_TIMEOUT';
    return (
      <div className={styles.page}>
        <section className={`container ${styles.errorSection}`}>
          <div className={styles.errorCard} role="alert">
            <span className={styles.errorKicker}>{isTimeout ? t('home.timeout') : t('common.error')}</span>
            <h1>{isTimeout ? t('home.timeoutHint') : t('errors.networkError')}</h1>
            <p>{error?.message === 'CONTENT_TIMEOUT' ? t('home.timeoutHint') : error?.message}</p>
            <button type="button" onClick={() => refetch()} className={styles.retryButton}>
              {t('common.retry')}
            </button>
          </div>
        </section>
      </div>
    );
  }

  const stats = statsQuery.data || { posts: 0, authors: 0, comments: 0 };
  const featuredPost = posts[0];

  return (
    <div className={styles.page}>
      <Hero
        showSearch
        searchValue={query}
        onSearchChange={setQuery}
        featuredPost={featuredPost}
      />

      {!query && (
        <section className={`container ${styles.statsSection}`} aria-label={t('analytics.title')}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}><strong>{stats.posts}</strong><span>{t('analytics.totalPosts')}</span></div>
            <div className={styles.statCard}><strong>{stats.authors}</strong><span>{t('analytics.totalAuthors')}</span></div>
            <div className={styles.statCard}><strong>{stats.comments}</strong><span>{t('analytics.totalComments')}</span></div>
          </div>
        </section>
      )}

      {!query && (
        <section className={`container ${styles.ctaSection}`}>
          <div className={styles.ctaWrapper}>
            <Link to={isAuthenticated ? '/posts/create' : '/auth/register'} className={styles.ctaPrimary}>
              {isAuthenticated ? <FiPlus size={18} /> : null}
              {isAuthenticated ? t('posts.createPost') : t('auth.register')}
              <FiArrowRight size={18} />
            </Link>
            <Link to="/about" className={styles.ctaSecondary}>{t('nav.about')}</Link>
          </div>
        </section>
      )}

      <section className={`container ${styles.postsSection}`}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionEyebrow}>{query ? t('home.searchLabel') : t('home.latest')}</span>
            <h2 className={styles.sectionTitle}>
              {query ? <><FiSearch size={22} /> “{query}”</> : t('home.latest')}
            </h2>
            <p className={styles.sectionSubtitle}>{t('home.resultCount', { count: filteredPosts.length })}</p>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className={styles.noResults}>
            <FiSearch size={36} />
            <h3>{query ? t('common.noResults') : t('home.noContent')}</h3>
            <p>{query ? `${t('common.noResultsFor')}: “${query}”` : t('home.noContentHint')}</p>
            {query && <button type="button" onClick={() => setQuery('')}>{t('home.clearSearch')}</button>}
          </div>
        ) : (
          <BentoGrid
            posts={filteredPosts.slice(0, visiblePostCount)}
            onBookmarkToggle={(post) => toggleBookmark(post.id, post)}
            bookmarkedIds={bookmarkedIds}
          />
        )}

        {filteredPosts.length > visiblePostCount && (
          <div className={styles.loadMore}>
            <button type="button" className={styles.loadMoreButton} onClick={() => setVisiblePostCount((count) => count + 9)}>
              {t('common.loadMore')} ({filteredPosts.length - visiblePostCount})
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
