import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import Hero from '../components/Hero';
import CategoryNav from '../components/CategoryNav';
import EditorialFeed from '../components/EditorialFeed';
import SEO from '../components/SEO';
import { usePosts } from '../hooks/usePosts';
import { useSearch } from '../hooks/useSearch';
import { useBookmarks } from '../hooks/useBookmarks';
import { getPostType } from '../lib/postPresentation';
import { getWritingTemplates } from '../content/writingTemplates';
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
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    setActiveCategory(categoryParam || 'all');
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
  }, [activeType, debouncedQuery, i18n.language]);

  const contentTypes = useMemo(() => getWritingTemplates(i18n.language), [i18n.language]);

  const categories = useMemo(
    () => [...new Set(posts.map((post) => post.category).filter(Boolean))],
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLocaleLowerCase(i18n.language);
    return posts.filter((post) => {
      const matchesCategory = activeCategory === 'all' || post.category?.toLowerCase() === activeCategory.toLowerCase();
      const matchesType = activeType === 'all' || getPostType(post) === activeType;
      if (!matchesCategory || !matchesType) return false;
      if (!normalizedQuery) return true;

      return [post.title, post.excerpt, post.body, post.category, post.author?.name, post.author?.username]
        .filter(Boolean)
        .some((field) => field.toLocaleLowerCase(i18n.language).includes(normalizedQuery));
    });
  }, [activeCategory, activeType, debouncedQuery, i18n.language, posts]);

  const hasSearch = query.trim().length > 0;
  const displayPosts = hasSearch || activeCategory !== 'all' || activeType !== 'all' || filteredPosts.length < 2
    ? filteredPosts
    : filteredPosts.slice(1);
  const featuredPost = posts[0];

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Hero showSearch={false} />
        <section className={`container ${styles.loadingSection}`}>
          <div className={styles.loadingLine} />
          <div className={styles.loadingCards}>
            <div /><div /><div />
          </div>
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
      <div className={`container ${styles.errorSection}`}>
        <div className={styles.errorCard} role="alert">
          <span className={styles.errorKicker}>{isTimeout ? t('home.timeout') : t('common.error')}</span>
          <h1>{isTimeout ? t('home.timeoutHint') : t('errors.networkError')}</h1>
          <p>{error?.message === 'CONTENT_TIMEOUT' ? t('home.timeoutHint') : error?.message}</p>
          <button type="button" onClick={() => refetch()} className={styles.retryButton}>{t('common.retry')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <SEO title={t('home.title')} description={t('home.subtitle')} />
      <Hero
        showSearch
        searchValue={query}
        onSearchChange={setQuery}
        featuredPost={featuredPost}
      />

      <section className={styles.standardSection}>
        <div className={`container ${styles.standardInner}`}>
          <div className={styles.standardIntro}>
            <span className={styles.sectionEyebrow}>{t('home.standardLabel')}</span>
            <h2>{t('home.standardTitle')}</h2>
          </div>
          <div className={styles.principles}>
            <article><span>01</span><div><strong>{t('home.principleOutcomeTitle')}</strong><p>{t('home.principleOutcomeText')}</p></div></article>
            <article><span>02</span><div><strong>{t('home.principleFreshTitle')}</strong><p>{t('home.principleFreshText')}</p></div></article>
            <article><span>03</span><div><strong>{t('home.principlePortableTitle')}</strong><p>{t('home.principlePortableText')}</p></div></article>
          </div>
        </div>
      </section>

      {isFallback && (
        <div className={`container ${styles.fallbackNotice}`} role="status">
          <strong>{t(isFetching ? 'home.fallbackChecking' : 'home.fallbackNotice')}</strong>
          <span>{t('home.fallbackHint')}</span>
        </div>
      )}

      <CategoryNav categories={categories} activeCategory={activeCategory} onChange={handleCategoryChange} />

      <section className={`container ${styles.postsSection}`}>
        <div className={styles.typeFilter} aria-label={i18n.language?.startsWith('en') ? 'Filter by content format' : 'İçerik biçimine göre filtrele'}>
          <button
            type="button"
            className={activeType === 'all' ? styles.typeFilterActive : ''}
            aria-pressed={activeType === 'all'}
            onClick={() => setActiveType('all')}
          >
            {i18n.language?.startsWith('en') ? 'All formats' : 'Tüm biçimler'}
          </button>
          {contentTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              className={activeType === type.id ? styles.typeFilterActive : ''}
              aria-pressed={activeType === type.id}
              onClick={() => setActiveType(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionEyebrow}>{hasSearch ? t('home.searchLabel') : t('home.latest')}</span>
            <h2 className={styles.sectionTitle}>
              {hasSearch ? <><FiSearch size={22} /> “{query}”</> : activeCategory !== 'all' ? activeCategory : t('home.feedTitle')}
            </h2>
            <p className={styles.sectionSubtitle}>{t('home.resultCount', { count: filteredPosts.length })}</p>
          </div>
        </div>

        {displayPosts.length === 0 ? (
          <div className={styles.noResults}>
            <FiSearch size={32} />
            <h3>{hasSearch || activeCategory !== 'all' || activeType !== 'all' ? t('common.noResults') : t('home.noContent')}</h3>
            <p>{hasSearch ? `${t('common.noResultsFor')}: “${query}”` : activeCategory !== 'all' ? t('home.noCategoryResults') : activeType !== 'all' ? (i18n.language?.startsWith('en') ? 'No stories match this format yet.' : 'Bu biçimde eşleşen yazı henüz yok.') : t('home.noContentHint')}</p>
            {(hasSearch || activeCategory !== 'all' || activeType !== 'all') && <button type="button" onClick={() => { setQuery(''); setActiveCategory('all'); setActiveType('all'); }}>{t('home.clearFilters')}</button>}
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
              {t('common.loadMore')} <FiArrowRight size={15} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
