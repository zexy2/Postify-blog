import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiClock, FiMessageCircle } from 'react-icons/fi';
import { usePost } from '../hooks/usePosts';

const initials = (name = '') => name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'P';

const PostDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { post, comments, isLoading, isError, error, refetch, commentsUnavailable } = usePost(id);

  if (isLoading) {
    return <div className="container" style={{ padding: '5rem 0', color: 'var(--text-secondary)' }}>{t('common.loading')}</div>;
  }

  if (isError || !post) {
    return (
      <div className="container" style={{ padding: '5rem 0' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>{t('errors.notFound')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{error?.message || t('errors.serverError')}</p>
        <button type="button" onClick={() => refetch()} style={{ padding: '.7rem 1rem', color: '#fff', background: 'var(--primary)', border: 0, borderRadius: '6px', cursor: 'pointer' }}>{t('common.retry')}</button>
      </div>
    );
  }

  const author = post.author;
  const publishedDate = post.publishedAt
    ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(new Date(post.publishedAt))
    : '';

  return (
    <article className="container" style={{ maxWidth: '880px', padding: '3rem 1rem 5rem' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', marginBottom: '2rem', color: 'var(--text-secondary)', textDecoration: 'none' }}><FiArrowLeft size={16} /> {t('common.back')}</Link>
      <div style={{ overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-elevated)' }}>
        <img src={post.coverImageUrl} alt="" style={{ display: 'block', width: '100%', maxHeight: '480px', objectFit: 'cover' }} />
        <div style={{ padding: 'clamp(1.5rem, 5vw, 4rem)' }}>
          {post.isFallback && (
            <p role="status" style={{ margin: '0 0 1.25rem', padding: '.75rem 1rem', color: 'var(--text-secondary)', background: 'var(--primary-subtle)', border: '1px solid var(--primary-light)', borderRadius: '10px', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-primary)' }}>{t('home.fallbackNotice')}</strong> {t('home.fallbackHint')}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.8rem', color: 'var(--text-muted)', fontSize: '.85rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{post.category}</span>
            <span>{publishedDate}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem' }}><FiClock size={14} /> {post.readingTime} {t('common.minutes')}</span>
          </div>
          <h1 style={{ margin: '1rem 0', color: 'var(--text-primary)', fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', letterSpacing: '-.06em', lineHeight: 1 }}>{post.title}</h1>
          <p style={{ maxWidth: '680px', margin: '0 0 1.5rem', color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.6 }}>{post.excerpt}</p>
          <Link to={`/users/${author?.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '.6rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
            <span style={{ display: 'grid', width: '2.25rem', height: '2.25rem', placeItems: 'center', color: '#fff', background: 'var(--primary)', borderRadius: '50%', fontSize: '.75rem', fontWeight: 800 }}>{initials(author?.name)}</span>
            <span><strong>{author?.name}</strong><small style={{ display: 'block', color: 'var(--text-muted)' }}>@{author?.username || 'postify'}</small></span>
          </Link>
          <div style={{ maxWidth: '700px', marginTop: '3rem', color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{post.body}</div>
        </div>
      </div>

      <section style={{ marginTop: '2rem', padding: 'clamp(1.25rem, 4vw, 2rem)', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-elevated)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: '0 0 1.25rem', color: 'var(--text-primary)' }}><FiMessageCircle size={20} /> {t('posts.comments')} ({comments.length})</h2>
        {commentsUnavailable ? <p role="status" style={{ color: 'var(--text-muted)' }}>{t('comments.unavailable')}</p> : comments.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{t('comments.noComments')}</p> : comments.map((comment) => (
          <div key={comment.id} style={{ padding: '1rem 0', borderTop: '1px solid var(--border-color)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{comment.author?.full_name || comment.author?.username || t('comments.you')}</strong>
            <p style={{ margin: '.4rem 0 0', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{comment.content}</p>
          </div>
        ))}
      </section>
    </article>
  );
};

export default PostDetailPage;
