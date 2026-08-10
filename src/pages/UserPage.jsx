import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { FiBookOpen, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useUser, useUserPosts } from '../hooks/usePosts';
import { useBookmarks } from '../hooks/useBookmarks';
import EditorialFeed from '../components/EditorialFeed';
import SEO from '../components/SEO';
import styles from './UserPage.module.css';

const UserPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: user, isLoading: userLoading } = useUser(id);
  const { data: posts = [], isLoading: postsLoading } = useUserPosts(id);
  const { bookmarkedIds, toggle: toggleBookmark } = useBookmarks();

  if (userLoading) {
    return <div className={`container ${styles.status}`}>{t('common.loadingAuthor')}</div>;
  }

  if (!user) {
    return (
      <div className={`container ${styles.status}`}>
        <h1>{t('common.authorNotFound')}</h1>
        <p>{t('errors.userNotFound')}</p>
      </div>
    );
  }

  const totalReadingTime = posts.reduce((acc, post) => acc + (post.readingTime || 5), 0);

  return (
    <div className={styles.page}>
      <SEO title={user.name} description={user.bio} />
      
      <main className="container" style={{ maxWidth: '1080px' }}>
        {/* Profile Card Hero */}
        <section className={styles.profileCard}>
          <div className={styles.banner}>
            <div className={styles.bannerPattern} />
          </div>

          <div className={styles.profileBody}>
            <div className={styles.avatarWrapper}>
              <span className={styles.avatar}>{(user.name || 'P')[0].toUpperCase()}</span>
              <span className={styles.badge} title="Aktif Yayıncı" />
            </div>

            <div className={styles.identity}>
              <span className={styles.roleTag}>
                <FiCheckCircle size={13} /> {user.role === 'editor' ? 'Postify Editör' : 'Yazar'}
              </span>

              <h1 className={styles.name}>{user.name}</h1>
              
              {user.username && <p className={styles.handle}>@{user.username}</p>}
              
              {user.bio && <p className={styles.bio}>{user.bio}</p>}
            </div>

            {/* Stats Pills Row */}
            <div className={styles.statsRow}>
              <span className={styles.statPill}>
                <FiBookOpen size={14} className={styles.statIcon} />
                <span>{posts.length} {t('user.posts', 'Yayımlanan Makale')}</span>
              </span>

              <span className={styles.statPill}>
                <FiClock size={14} className={styles.statIcon} />
                <span>{totalReadingTime} {t('common.minutes', 'dakika okuma süresi')}</span>
              </span>
            </div>
          </div>
        </section>

        {/* Author Posts Grid */}
        <section>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>Yazarın Makaleleri</span>
              <h2 className={styles.sectionTitle}>
                Yayımlanan Hikayeler <span className={styles.countBadge}>({posts.length})</span>
              </h2>
            </div>
          </div>

          {postsLoading ? (
            <p className={styles.status}>{t('common.loading')}</p>
          ) : posts.length === 0 ? (
            <p className={styles.status}>{t('home.noContent')}</p>
          ) : (
            <EditorialFeed
              posts={posts}
              bookmarkedIds={bookmarkedIds}
              onBookmarkToggle={(_, post) => toggleBookmark(post?.id || _, post)}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default UserPage;
