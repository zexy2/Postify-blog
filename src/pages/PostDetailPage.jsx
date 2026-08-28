import { useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiArrowRight, FiMessageCircle, FiBookmark, FiClock } from 'react-icons/fi';
import { usePost, usePosts } from '../hooks/usePosts';
import { useBookmarks } from '../hooks/useBookmarks';
import ContentImage from '../components/ContentImage/ContentImage';
import CopyLinkButton from '../components/CopyLinkButton';
import ReadingProgress from '../components/ReadingProgress';
import SEO from '../components/SEO';
import styles from './PostDetailPage.module.css';
import { getPostPresentation } from '../lib/postPresentation';

const initials = (name = '') => name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'P';

const formatDate = (value, locale) => {
  if (!value) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(value));
};

const PlainArticleBody = ({ content }) => {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return (
    <div className={styles.plainBody}>
      {blocks.map((block, index) => {
        const key = `${index}-${block.slice(0, 12)}`;
        if (/^#{1,3}\s/.test(block)) {
          const heading = block.replace(/^#{1,3}\s+/, '');
          return <h2 key={key}>{heading}</h2>;
        }
        if (block.startsWith('```')) {
          const code = block.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim();
          return <pre key={key}><code>{code}</code></pre>;
        }
        if (block.split('\n').every((line) => line.trim().startsWith('- '))) {
          return <ul key={key}>{block.split('\n').map((line, lineIndex) => <li key={`${lineIndex}-${line}`}>{line.trim().slice(2)}</li>)}</ul>;
        }
        return <p key={key}>{block}</p>;
      })}
    </div>
  );
};

const PostDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const articleRef = useRef(null);
  const { post, comments, isLoading, isError, error, refetch, commentsUnavailable } = usePost(id);
  const { posts } = usePosts();
  const { bookmarkedIds, toggle: toggleBookmark } = useBookmarks();

  const adjacentPosts = useMemo(() => {
    if (!post || !posts.length) return { newer: null, older: null };
    const index = posts.findIndex((item) => item.id === post.id || item.slug === post.slug || item.slug === id);
    return {
      newer: index > 0 ? posts[index - 1] : null,
      older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null,
    };
  }, [id, post, posts]);

  if (isLoading) {
    return <div className={`container ${styles.status}`}>{t('common.loading')}</div>;
  }

  if (isError || !post) {
    return (
      <div className={`container ${styles.status}`}>
        <h1>{t('errors.notFound')}</h1>
        <p>{error?.message || t('errors.serverError')}</p>
        <button type="button" onClick={() => refetch()} className={styles.retryButton}>{t('common.retry')}</button>
      </div>
    );
  }

  const author = post.author;
  const publishedDate = formatDate(post.publishedAt, i18n.language);
  const updatedDate = formatDate(post.updatedAt, i18n.language);
  const isUpdated = post.updatedAt && post.publishedAt && new Date(post.updatedAt).getTime() > new Date(post.publishedAt).getTime() + 60_000;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;
  const pageImage = typeof window !== 'undefined' && post.coverImageUrl?.startsWith('/')
    ? `${window.location.origin}${post.coverImageUrl}`
    : post.coverImageUrl;
  const articleBody = post.body || post.bodyHtml?.replace(/<[^>]+>/g, ' ') || '';
  const isBookmarked = bookmarkedIds.includes(post.id);
  const presentation = getPostPresentation(post, i18n.language);

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        image={pageImage}
        url={pageUrl}
        type="article"
        author={author?.name || t('article.editor')}
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt}
        keywords={[post.category]}
      />
      <ReadingProgress containerRef={articleRef} />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.articleLayout}>
            {/* Left Floating Rail Tools Widget */}
            <aside className={styles.rail} aria-label={t('article.tools')}>
              <div className={styles.railWidget}>
                <Link to="/" className={styles.backBtn} title={t('common.back')}>
                  <FiArrowLeft size={16} />
                  <span>{t('common.back')}</span>
                </Link>

                <div className={styles.railDivider} />

                <div className={styles.readStat}>
                  <FiClock size={14} className={styles.statIcon} />
                  <span>{post.readingTime} {t('common.minutes')}</span>
                </div>

                <button
                  type="button"
                  className={`${styles.railActionBtn} ${isBookmarked ? styles.bookmarked : ''}`}
                  onClick={() => toggleBookmark(post.id, post)}
                  title={isBookmarked ? t('bookmarks.removeFromBookmarks') : t('bookmarks.addToBookmarks')}
                >
                  <FiBookmark size={16} />
                </button>

                <div className={styles.railShareBtn}>
                  <CopyLinkButton url={pageUrl} />
                </div>
              </div>
            </aside>

            {/* Main Article Shell */}
            <article ref={articleRef} className={styles.articleShell}>
              {/* Header Info FIRST */}
              <header className={styles.articleHeader}>
                <div className={styles.meta}>
                  <span className={styles.contentType}>{presentation.typeLabel}</span>
                  <span className={styles.category}>{post.category}</span>
                  <span className={styles.metaDot}>•</span>
                  <time dateTime={post.publishedAt}>{publishedDate}</time>
                  {isUpdated && <span>({t('article.updated')} {updatedDate})</span>}
                </div>

                <h1 className={styles.title}>{post.title}</h1>
                
                {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

                <div className={styles.authorBar}>
                  <Link to={`/users/${author?.id || 'fallback-editor'}`} className={styles.author} title={author?.name || t('article.editor')}>
                    <span className={styles.avatar}>{initials(author?.name || t('article.editor'))}</span>
                    <div className={styles.authorInfo}>
                      <strong>{author?.name || t('article.editor')}</strong>
                      <small>@{author?.username || 'postify'}</small>
                    </div>
                  </Link>
                </div>
              </header>

              <section className={styles.quickBrief} aria-label={t('article.quickBrief')}>
                <div className={styles.quickBriefCopy}>
                  <span className={styles.quickBriefEyebrow}>{t('article.quickBrief')}</span>
                  <strong>{t('article.expectedOutcome')}</strong>
                  <p>{presentation.outcome}</p>
                </div>
                <dl className={styles.quickBriefMeta}>
                  <div>
                    <dt>{t('article.contentType')}</dt>
                    <dd>{presentation.typeLabel}</dd>
                  </div>
                  <div>
                    <dt>{t('posts.readingTime')}</dt>
                    <dd>{post.readingTime} {t('common.minutes')}</dd>
                  </div>
                  <div>
                    <dt>{t('article.lastTouch')}</dt>
                    <dd>{presentation.formattedDate || publishedDate}</dd>
                  </div>
                </dl>
              </section>

              {/* Cover Image SECOND */}
              <div className={styles.coverWrapper}>
                <ContentImage
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt || post.title}
                  className={styles.coverImage}
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              <div className={styles.articleContent}>
                {post.isFallback && (
                  <p role="status" className={styles.fallbackNotice}>
                    <strong>{t('home.fallbackNotice')}</strong> {t('home.fallbackHint')}
                  </p>
                )}

                <div className={styles.body}>
                  <PlainArticleBody content={articleBody} />
                </div>
              </div>
            </article>
          </div>

          {/* Comments Section */}
          <section className={styles.commentsSection} id="comments-section">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionEyebrow}>{t('article.discussion')}</span>
                <h2><FiMessageCircle size={19} /> {t('posts.comments')} <span>({comments.length})</span></h2>
              </div>
              <CopyLinkButton url={pageUrl} />
            </div>
            {commentsUnavailable ? (
              <p className={styles.commentHint} role="status">{t('comments.unavailable')}</p>
            ) : comments.length === 0 ? (
              <p className={styles.commentHint}>{t('comments.noComments')}</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                  <strong>{comment.author?.full_name || comment.author?.username || t('comments.reader')}</strong>
                  <p>{comment.content}</p>
                </div>
              ))
            )}
          </section>

          {/* Next / Previous Article Navigation */}
          {(adjacentPosts.newer || adjacentPosts.older) && (
            <nav className={styles.adjacent} aria-label={t('article.moreStories')}>
              {adjacentPosts.older ? (
                <Link to={`/posts/${adjacentPosts.older.slug || adjacentPosts.older.id}`} className={styles.adjacentLink}>
                  <span>{t('article.older')}</span>
                  <strong>{adjacentPosts.older.title}</strong>
                  <FiArrowLeft size={17} />
                </Link>
              ) : <span />}
              {adjacentPosts.newer ? (
                <Link to={`/posts/${adjacentPosts.newer.slug || adjacentPosts.newer.id}`} className={`${styles.adjacentLink} ${styles.newer}`}>
                  <span>{t('article.newer')}</span>
                  <strong>{adjacentPosts.newer.title}</strong>
                  <FiArrowRight size={17} />
                </Link>
              ) : <span />}
            </nav>
          )}
        </div>

        {/* Mobile Sticky Action Bar */}
        <div className={styles.mobileActionBar} aria-label={t('article.tools')}>
          <Link to="/" className={styles.mobileActionBtn} aria-label={t('common.back')}>
            <FiArrowLeft size={18} />
          </Link>
          <button
            type="button"
            className={`${styles.mobileActionBtn} ${isBookmarked ? styles.bookmarked : ''}`}
            onClick={() => toggleBookmark(post.id, post)}
          >
            <FiBookmark size={18} />
          </button>
          <a href="#comments-section" className={styles.mobileActionBtn} aria-label={t('posts.comments')}>
            <FiMessageCircle size={18} />
            <small>{comments.length}</small>
          </a>
          <div className={styles.mobileShareWrap}>
            <CopyLinkButton url={pageUrl} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetailPage;
