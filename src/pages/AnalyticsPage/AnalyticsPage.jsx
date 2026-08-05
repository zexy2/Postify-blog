/**
 * AnalyticsPage Component
 * Dashboard with statistics and charts
 * Enhanced with 21st.dev style components
 */

import React, { lazy, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiFileText, FiUsers, FiMessageSquare, FiTrendingUp } from 'react-icons/fi';
import { usePosts } from '../../hooks/usePosts';
import styles from './AnalyticsPage.module.css';

const AnalyticsCharts = lazy(() => import('./AnalyticsCharts'));

const StatCard = ({ icon: Icon, label, value, index = 0 }) => (
  <motion.div 
    className={styles.statCard}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <div className={styles.statIcon}>
      <Icon size={22} />
    </div>
    <div className={styles.statContent}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  </motion.div>
);

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const { posts, users, usersMap, isLoading } = usePosts();

  // Calculate statistics
  const stats = useMemo(() => {
    if (!posts.length || !users.length) {
      return {
        totalPosts: 0,
        totalAuthors: 0,
        avgPostsPerAuthor: 0,
        postsByAuthor: [],
        topAuthors: [],
      };
    }

    // Posts by author
    const authorPostCounts = posts.reduce((acc, post) => {
      acc[post.userId] = (acc[post.userId] || 0) + 1;
      return acc;
    }, {});

    const postsByAuthor = Object.entries(authorPostCounts)
      .map(([userId, count]) => ({
        name: usersMap[userId]?.name?.split(' ')[0] || `User ${userId}`,
        posts: count,
        userId,
      }))
      .sort((a, b) => b.posts - a.posts);

    // Top 5 authors
    const topAuthors = postsByAuthor.slice(0, 5);

    // Simulate posts over time data
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'];
    const postsOverTime = months.map((month) => ({
      name: month,
      posts: Math.floor(posts.length / 6) + Math.floor(Math.random() * 5),
      views: Math.floor(Math.random() * 1000) + 500,
    }));

    return {
      totalPosts: posts.length,
      totalAuthors: users.length,
      avgPostsPerAuthor: (posts.length / users.length).toFixed(1),
      postsByAuthor: postsByAuthor.slice(0, 10),
      topAuthors,
      postsOverTime,
    };
  }, [posts, users, usersMap]);

  if (isLoading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('analytics.title')}</h1>
          <p className={styles.subtitle}>
            Blog istatistiklerinizi ve performansınızı takip edin
          </p>
        </header>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard
            icon={FiFileText}
            label={t('analytics.totalPosts')}
            value={stats.totalPosts}
            index={0}
          />
          <StatCard
            icon={FiUsers}
            label={t('analytics.totalAuthors')}
            value={stats.totalAuthors}
            index={1}
          />
          <StatCard
            icon={FiMessageSquare}
            label={t('analytics.avgCommentsPerPost')}
            value={stats.avgPostsPerAuthor}
            index={2}
          />
          <StatCard
            icon={FiTrendingUp}
            label="Trend"
            value="+12%"
            index={3}
          />
        </div>

        <Suspense fallback={<div className={styles.chartSkeleton} aria-label="Loading charts" />}>
          <AnalyticsCharts stats={stats} />
        </Suspense>
      </div>
    </div>
  );
};

export default AnalyticsPage;
