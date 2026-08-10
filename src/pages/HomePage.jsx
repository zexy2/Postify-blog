import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';
import CategoryNav from '../components/CategoryNav';
import EditorialFeed from '../components/EditorialFeed';
import MarqueeBanner from '../components/MarqueeBanner/MarqueeBanner';
import SEO from '../components/SEO';
import { usePosts } from '../hooks/usePosts';
import { useSearch } from '../hooks/useSearch';
import { useBookmarks } from '../hooks/useBookmarks';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const { posts, isLoading, isFetching, isError, error, refetch, isFallback } = usePosts();
  const { query, debouncedQuery, setQuery } = useSearch();
  const { bookmarkedIds, toggle: toggleBookmark } = useBookmarks();
  const [showWakeUp, setShowWakeUp] = useState(false);
  const [visiblePostCount, setVisiblePostCount] = useState(9);
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'all');

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory('all');
    }
  }, [categoryParam]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category }, { replace: true });
    }
  };

  useEffect(() => {
    if (!isLoading && !(isFetching && isFallback)) return undefined;
    const timer = window.setTimeout(() => setShowWakeUp(true), 3000);
    return () => window.clearTimeout(timer);
  }, [isFetching, isFallback, isLoading]);

  useEffect(() => {
    setVisiblePostCount(9);
  }, [debouncedQuery, i18n.language]);

  const categories = useMemo(
    () => [...new Set(posts.map((post) => post.category).filter(Boolean))],
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLocaleLowerCase(i18n.language);
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === 'all' ||
        post.category?.toLowerCase() === activeCategory.toLowerCase();
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      return [
      post.title,
      post.excerpt,
      post.body,
      post.category,
      post.author?.name,
      post.author?.username,
      ].filter(Boolean).some((field) => field.toLocaleLowerCase(i18n.language).includes(normalizedQuery));
    });
  }, [activeCategory, debouncedQuery, i18n.language, posts]);

  const hasSearch = query.trim().length > 0;
  const displayPosts = hasSearch || activeCategory !== 'all' || filteredPosts.length < 2
    ? filteredPosts
    : filteredPosts.slice(1);

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

  const featuredPost = posts[0];
  const usingFallback = isFallback;
  const checkingLiveContent = isFetching;

  return (
    <div className={styles.page}>
      <SEO title={t('home.title')} description={t('home.subtitle')} />
      <Hero
        showSearch
        searchValue={query}
        onSearchChange={setQuery}
        featuredPost={featuredPost}
      />
      <MarqueeBanner />

      {usingFallback && (
        <div className={`container ${styles.fallbackNotice}`} role="status">
          <strong>{t(checkingLiveContent ? 'home.fallbackChecking' : 'home.fallbackNotice')}</strong>
          <span>{t('home.fallbackHint')}</span>
        </div>
      )}

      <CategoryNav categories={categories} activeCategory={activeCategory} onChange={handleCategoryChange} />

      <section className={`container ${styles.postsSection}`}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionEyebrow}>{hasSearch ? t('home.searchLabel') : t('home.latest')}</span>
            <h2 className={styles.sectionTitle}>
              {hasSearch ? <><FiSearch size={22} /> “{query}”</> : activeCategory !== 'all' ? activeCategory : t('home.latest')}
            </h2>
            <p className={styles.sectionSubtitle}>{t('home.resultCount', { count: filteredPosts.length })}</p>
          </div>
        </div>

        {displayPosts.length === 0 ? (
          <div className={styles.noResults}>
            <FiSearch size={36} />
            <h3>{hasSearch || activeCategory !== 'all' ? t('common.noResults') : t('home.noContent')}</h3>
            <p>{hasSearch ? `${t('common.noResultsFor')}: “${query}”` : activeCategory !== 'all' ? t('home.noCategoryResults') : t('home.noContentHint')}</p>
            {(hasSearch || activeCategory !== 'all') && <button type="button" onClick={() => { setQuery(''); setActiveCategory('all'); }}>{t('home.clearFilters')}</button>}
          </div>
        ) : (
          <EditorialFeed
            posts={displayPosts.slice(0, visiblePostCount)}
            onBookmarkToggle={(post) => toggleBookmark(post.id, post)}
            bookmarkedIds={bookmarkedIds}
          />
        )}

        {displayPosts.length > visiblePostCount && (
          <div className={styles.loadMore}>
            <button type="button" className={styles.loadMoreButton} onClick={() => setVisiblePostCount((count) => count + 9)}>
              {t('common.loadMore')} ({displayPosts.length - visiblePostCount})
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
