import { useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiArrowRight, FiMessageCircle } from 'react-icons/fi';
import { usePost, usePosts } from '../hooks/usePosts';
import ContentImage from '../components/ContentImage/ContentImage';
import CopyLinkButton from '../components/CopyLinkButton';
import ReadingProgress from '../components/ReadingProgress';
import SEO from '../components/SEO';
import styles from './PostDetailPage.module.css';

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
            <aside className={styles.rail} aria-label={t('article.tools')}>
              <Link to="/" className={styles.backLink}><FiArrowLeft size={16} /> {t('common.back')}</Link>
              <div className={styles.railRule} />
              <div className={styles.railStat}><span>{t('common.read')}</span><strong>{post.readingTime} {t('common.minutes')}</strong></div>
              <CopyLinkButton url={pageUrl} />
            </aside>

            <article ref={articleRef} className={styles.articleShell}>
              <ContentImage
                src={post.coverImageUrl}
                alt={post.coverImageAlt || post.title}
                className={styles.coverImage}
                loading="eager"
                fetchPriority="high"
              />
              <div className={styles.articleContent}>
                {post.isFallback && (
                  <p role="status" className={styles.fallbackNotice}>
                    <strong>{t('home.fallbackNotice')}</strong> {t('home.fallbackHint')}
                  </p>
                )}
                <header className={styles.articleHeader}>
                  <div className={styles.meta}>
                    <span className={styles.category}>{post.category}</span>
                    <time dateTime={post.publishedAt}>{publishedDate}</time>
                    {isUpdated && <span>{t('article.updated')} {updatedDate}</span>}
                  </div>
                  <h1 className={styles.title}>{post.title}</h1>
                  <p className={styles.excerpt}>{post.excerpt}</p>
                  {author?.id ? <Link to={`/users/${author.id}`} className={styles.author}>
                    <span className={styles.avatar}>{initials(author?.name)}</span>
                    <span><strong>{author?.name}</strong><small>@{author?.username || 'postify'}</small></span>
                  </Link> : <div className={styles.author}>
                    <span className={styles.avatar}>{initials(author?.name)}</span>
                    <span><strong>{author?.name || t('article.editor')}</strong><small>@{author?.username || 'postify'}</small></span>
                  </div>}
                </header>

                <div className={styles.body}>
                  <PlainArticleBody content={articleBody} />
                </div>
              </div>
            </article>
          </div>

          <section className={styles.commentsSection} id="comments-section">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionEyebrow}>{t('article.discussion')}</span>
                <h2><FiMessageCircle size={19} /> {t('posts.comments')} <span>({comments.length})</span></h2>
              </div>
              <CopyLinkButton url={pageUrl} />
            </div>
            {commentsUnavailable ? <p className={styles.commentHint} role="status">{t('comments.unavailable')}</p> : comments.length === 0 ? <p className={styles.commentHint}>{t('comments.noComments')}</p> : comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <strong>{comment.author?.full_name || comment.author?.username || t('comments.reader')}</strong>
                <p>{comment.content}</p>
              </div>
            ))}
          </section>

          {(adjacentPosts.newer || adjacentPosts.older) && (
            <nav className={styles.adjacent} aria-label={t('article.moreStories')}>
              {adjacentPosts.older ? <Link to={`/posts/${adjacentPosts.older.slug || adjacentPosts.older.id}`} className={styles.adjacentLink}>
                <span>{t('article.older')}</span><strong>{adjacentPosts.older.title}</strong><FiArrowLeft size={17} />
              </Link> : <span />}
              {adjacentPosts.newer ? <Link to={`/posts/${adjacentPosts.newer.slug || adjacentPosts.newer.id}`} className={`${styles.adjacentLink} ${styles.newer}`}>
                <span>{t('article.newer')}</span><strong>{adjacentPosts.newer.title}</strong><FiArrowRight size={17} />
              </Link> : <span />}
            </nav>
          )}
        </div>

        {/* Mobile Sticky Thumb-Zone Action Bar */}
        <div className={styles.mobileActionBar} aria-label={t('article.tools')}>
          <Link to="/" className={styles.mobileActionBtn} aria-label={t('common.back')}>
            <FiArrowLeft size={18} />
          </Link>
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
