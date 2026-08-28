import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
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
import { getPostReadingMinutes, getPostType } from '../lib/postPresentation';
import { getKnowledgeEvidence } from '../lib/knowledgeEvidence';
import { addKnowledgeGap } from '../lib/localKnowledgeState';
import { summarizeCommunityEvidence } from '../lib/communityEvidence';
import { sortKnowledge } from '../lib/knowledgeRanking';
import { useRequestGap } from '../hooks/useKnowledge';
import { useVerificationRuns } from '../hooks/useAutoVerification';
import { getWritingTemplates } from '../content/writingTemplates';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const typeParam = searchParams.get('type');
  const readingParam = searchParams.get('reading');
  const freshnessParam = searchParams.get('freshness');
  const evidenceParam = searchParams.get('evidence');
  const sortParam = searchParams.get('sort');
  const { posts, isLoading, isFetching, isError, error, refetch, isFallback } = usePosts();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const requestGapMutation = useRequestGap();
  const verificationRuns = useVerificationRuns();
  const { query, debouncedQuery, setQuery } = useSearch();
  const { bookmarkedIds, toggle: toggleBookmark } = useBookmarks();
  const [showWakeUp, setShowWakeUp] = useState(false);
  const [visiblePostCount, setVisiblePostCount] = useState(9);
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'all');
  const [activeType, setActiveType] = useState(typeParam || 'all');
  const [readingFilter, setReadingFilter] = useState(readingParam === 'quick' ? 'quick' : 'all');
  const [freshnessFilter, setFreshnessFilter] = useState(freshnessParam === 'current' ? 'current' : 'all');
  const [evidenceFilter, setEvidenceFilter] = useState(['author','community','postify'].includes(evidenceParam) ? evidenceParam : 'all');
  const [sortMode, setSortMode] = useState(sortParam === 'latest' ? 'latest' : 'evidence');
  const [gapSaved, setGapSaved] = useState(false);

  useEffect(() => {
    setActiveCategory(categoryParam || 'all');
  }, [categoryParam]);

  useEffect(() => {
    setActiveType(typeParam || 'all');
    setReadingFilter(readingParam === 'quick' ? 'quick' : 'all');
    setFreshnessFilter(freshnessParam === 'current' ? 'current' : 'all');
    setEvidenceFilter(['author','community','postify'].includes(evidenceParam) ? evidenceParam : 'all');
    setSortMode(sortParam === 'latest' ? 'latest' : 'evidence');
  }, [evidenceParam, freshnessParam, readingParam, sortParam, typeParam]);

  const updateFilterParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === 'all') nextParams.delete(key);
    else nextParams.set(key, value);
    setSearchParams(nextParams, { replace: true });
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    updateFilterParam('category', category);
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    updateFilterParam('type', type);
  };

  const handleEvidenceChange = (next) => { setEvidenceFilter(next); updateFilterParam('evidence', next); };
  const handleSortChange = (next) => { setSortMode(next); updateFilterParam('sort', next === 'evidence' ? 'all' : next); };
  const handleFreshnessChange = () => { const next=freshnessFilter==='current'?'all':'current'; setFreshnessFilter(next); updateFilterParam('freshness', next); };

  const handleReadingChange = () => {
    const next = readingFilter === 'quick' ? 'all' : 'quick';
    setReadingFilter(next);
    updateFilterParam('reading', next);
  };

  useEffect(() => {
    if (!isLoading && !(isFetching && isFallback)) return undefined;
    const timer = window.setTimeout(() => setShowWakeUp(true), 3000);
    return () => window.clearTimeout(timer);
  }, [isFetching, isFallback, isLoading]);

  useEffect(() => {
    setVisiblePostCount(9);
  }, [activeCategory, activeType, debouncedQuery, evidenceFilter, freshnessFilter, i18n.language, readingFilter, sortMode]);

  const contentTypes = useMemo(() => getWritingTemplates(i18n.language), [i18n.language]);
  const evidenceAwarePosts = useMemo(() => posts.map((post) => {
    const run = post.autoVerificationId ? verificationRuns.data?.runs?.[post.autoVerificationId] : null;
    return run?.status === 'passed' ? { ...post, evidence: { ...(post.evidence || {}), level: 'postify-verified', testedAt: run.verifiedAt || post.evidence?.testedAt } } : post;
  }), [posts, verificationRuns.data]);

  const categories = useMemo(
    () => [...new Set(evidenceAwarePosts.map((post) => post.category).filter(Boolean))],
    [evidenceAwarePosts],
  );

  const filteredPosts = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLocaleLowerCase(i18n.language);
    return evidenceAwarePosts.filter((post) => {
      const matchesCategory = activeCategory === 'all' || post.category?.toLowerCase() === activeCategory.toLowerCase();
      const matchesType = activeType === 'all' || getPostType(post) === activeType;
      const readingMinutes = getPostReadingMinutes(post);
      const matchesReading = readingFilter === 'all' || (readingMinutes !== null && readingMinutes <= 5);
      const freshness = getKnowledgeEvidence(post).freshness;
      const matchesFreshness = freshnessFilter === 'all' || freshness === 'current';
      const community = summarizeCommunityEvidence(post.evidenceSummary || {});
      const level = post.evidence?.level || 'unverified';
      const matchesEvidence = evidenceFilter === 'all' || (evidenceFilter === 'author' && level === 'author-tested') || (evidenceFilter === 'postify' && level === 'postify-verified') || (evidenceFilter === 'community' && community.communityConfirmed);
      if (!matchesCategory || !matchesType || !matchesReading || !matchesFreshness || !matchesEvidence) return false;
      if (!normalizedQuery) return true;

      return [post.title, post.excerpt, post.body, post.category, post.author?.name, post.author?.username]
        .filter(Boolean)
        .some((field) => field.toLocaleLowerCase(i18n.language).includes(normalizedQuery));
    });
  }, [activeCategory, activeType, debouncedQuery, evidenceAwarePosts, evidenceFilter, freshnessFilter, i18n.language, readingFilter]);

  const rankedPosts = useMemo(() => sortKnowledge(filteredPosts, { mode: sortMode }), [filteredPosts, sortMode]);
  const hasSearch = query.trim().length > 0;
  const displayPosts = hasSearch || activeCategory !== 'all' || activeType !== 'all' || readingFilter !== 'all' || freshnessFilter !== 'all' || filteredPosts.length < 2
    ? rankedPosts
    : rankedPosts.slice(1);
  const featuredPost = evidenceAwarePosts[0];

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

      {isFallback && (
        <div className={`container ${styles.fallbackNotice}`} role="status">
          <strong>{t(isFetching ? 'home.fallbackChecking' : 'home.fallbackNotice')}</strong>
          <span>{t('home.fallbackHint')}</span>
        </div>
      )}

      <CategoryNav categories={categories} activeCategory={activeCategory} onChange={handleCategoryChange} />

      <section id="knowledge-feed" className={`container ${styles.postsSection}`}>
        <div className={styles.typeFilter} role="group" aria-label={i18n.language?.startsWith('en') ? 'Filter by content format' : 'İçerik biçimine göre filtrele'}>
          <button
            type="button"
            className={activeType === 'all' ? styles.typeFilterActive : ''}
            aria-pressed={activeType === 'all'}
            onClick={() => handleTypeChange('all')}
          >
            {i18n.language?.startsWith('en') ? 'All formats' : 'Tüm biçimler'}
          </button>
          {contentTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              className={activeType === type.id ? styles.typeFilterActive : ''}
              aria-pressed={activeType === type.id}
              onClick={() => handleTypeChange(type.id)}
            >
              {type.label}
            </button>
          ))}
          <span className={styles.filterDivider} aria-hidden="true" />
          <button type="button" className={freshnessFilter === 'current' ? styles.typeFilterActive : ''} aria-pressed={freshnessFilter === 'current'} onClick={handleFreshnessChange}>
            {i18n.language?.startsWith('en') ? 'Current evidence' : 'Güncel kanıt'}
          </button>
          <button type="button" className={evidenceFilter === 'author' ? styles.typeFilterActive : ''} aria-pressed={evidenceFilter === 'author'} onClick={() => handleEvidenceChange(evidenceFilter === 'author' ? 'all' : 'author')}>{i18n.language?.startsWith('en') ? 'Author tested' : 'Yazar test etti'}</button>
          <button type="button" className={evidenceFilter === 'community' ? styles.typeFilterActive : ''} aria-pressed={evidenceFilter === 'community'} onClick={() => handleEvidenceChange(evidenceFilter === 'community' ? 'all' : 'community')}>{i18n.language?.startsWith('en') ? 'Community confirmed' : 'Topluluk doğruladı'}</button>
          <button type="button" className={evidenceFilter === 'postify' ? styles.typeFilterActive : ''} aria-pressed={evidenceFilter === 'postify'} onClick={() => handleEvidenceChange(evidenceFilter === 'postify' ? 'all' : 'postify')}>Postify verified</button>
          <span className={styles.filterDivider} aria-hidden="true" />
          <button type="button" className={sortMode === 'evidence' ? styles.typeFilterActive : ''} aria-pressed={sortMode === 'evidence'} onClick={() => handleSortChange('evidence')}>{i18n.language?.startsWith('en') ? 'Best evidence' : 'En güçlü kanıt'}</button>
          <button type="button" className={sortMode === 'latest' ? styles.typeFilterActive : ''} aria-pressed={sortMode === 'latest'} onClick={() => handleSortChange('latest')}>{i18n.language?.startsWith('en') ? 'Latest' : 'En yeni'}</button>
          <button
            type="button"
            className={readingFilter === 'quick' ? styles.typeFilterActive : ''}
            aria-pressed={readingFilter === 'quick'}
            onClick={handleReadingChange}
          >
            {i18n.language?.startsWith('en') ? '≤ 5 min' : '≤ 5 dk'}
          </button>
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
            <h3>{hasSearch || activeCategory !== 'all' || activeType !== 'all' || readingFilter !== 'all' ? t('common.noResults') : t('home.noContent')}</h3>
            <p>{hasSearch ? `${t('common.noResultsFor')}: “${query}”` : activeCategory !== 'all' ? t('home.noCategoryResults') : activeType !== 'all' ? (i18n.language?.startsWith('en') ? 'No stories match this format yet.' : 'Bu biçimde eşleşen yazı henüz yok.') : readingFilter !== 'all' ? (i18n.language?.startsWith('en') ? 'No quick reads match these filters yet.' : 'Bu filtrelerde kısa okuma bulunamadı.') : t('home.noContentHint')}</p>
            {hasSearch && <button type="button" disabled={gapSaved || requestGapMutation.isPending} onClick={async () => { try { if (isAuthenticated) await requestGapMutation.mutateAsync(query); else addKnowledgeGap(window.localStorage, query); setGapSaved(true); } catch { addKnowledgeGap(window.localStorage, query); setGapSaved(true); } }}>{gapSaved ? (isAuthenticated ? (i18n.language?.startsWith('en') ? 'Need recorded' : 'İhtiyaç kaydedildi') : (i18n.language?.startsWith('en') ? 'Need saved on this device' : 'İhtiyaç bu cihaza kaydedildi')) : (i18n.language?.startsWith('en') ? 'I need this solution' : 'Bu çözüme ihtiyacım var')}</button>}
            {(hasSearch || activeCategory !== 'all' || activeType !== 'all' || readingFilter !== 'all' || freshnessFilter !== 'all') && <button type="button" onClick={() => { setQuery(''); setActiveCategory('all'); setActiveType('all'); setReadingFilter('all'); setFreshnessFilter('all'); setSearchParams({}, { replace: true }); }}>{t('home.clearFilters')}</button>}
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
