import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser, useUserPosts } from '../hooks/usePosts';

const UserPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: user, isLoading: userLoading } = useUser(id);
  const { data: posts = [], isLoading: postsLoading } = useUserPosts(id);

  if (userLoading) return <div className="container" style={{ padding: '5rem 1rem', color: 'var(--text-secondary)' }}>{t('common.loadingAuthor')}</div>;
  if (!user) return <div className="container" style={{ padding: '5rem 1rem' }}><h1 style={{ color: 'var(--text-primary)' }}>{t('common.authorNotFound')}</h1><p style={{ color: 'var(--text-secondary)' }}>{t('errors.userNotFound')}</p></div>;

  return (
    <main className="container" style={{ maxWidth: '900px', padding: '4rem 1rem 5rem' }}>
      <header style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ display: 'grid', width: '4rem', height: '4rem', placeItems: 'center', color: '#fff', background: 'var(--primary)', borderRadius: '50%', fontWeight: 800 }}>{(user.name || 'P')[0].toUpperCase()}</span>
        <h1 style={{ margin: '1rem 0 .4rem', color: 'var(--text-primary)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-.06em' }}>{user.name}</h1>
        {user.username && <p style={{ margin: 0, color: 'var(--text-muted)' }}>@{user.username}</p>}
        {user.bio && <p style={{ maxWidth: '600px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{user.bio}</p>}
      </header>
      <section style={{ paddingTop: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>{t('user.posts')} ({posts.length})</h2>
        {postsLoading ? <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p> : posts.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{t('home.noContent')}</p> : (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {posts.map((post) => <Link key={post.id} to={`/posts/${post.slug || post.id}`} style={{ padding: '1.2rem', color: 'var(--text-primary)', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', textDecoration: 'none' }}><strong>{post.title}</strong><span style={{ display: 'block', marginTop: '.4rem', color: 'var(--text-secondary)' }}>{post.excerpt}</span></Link>)}
          </div>
        )}
      </section>
    </main>
  );
};

export default UserPage;
