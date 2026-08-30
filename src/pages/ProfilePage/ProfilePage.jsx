import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiActivity,
  FiArrowRight,
  FiBookmark,
  FiCalendar,
  FiCamera,
  FiEdit3,
  FiFileText,
  FiGlobe,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiPlus,
  FiSave,
  FiShield,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useUserPosts } from '../../hooks/usePosts';
import { useAuthorDashboard } from '../../hooks/useKnowledge';
import { storageService } from '../../services/storageService';
import toast from 'react-hot-toast';
import { safeHttpUrl } from '../../lib/seoUtils';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, updateProfile, logout } = useAuth();
  const { bookmarksCount, bookmarkedPosts } = useBookmarks();
  const userPostsQuery = useUserPosts(user?.id);
  const authorDashboard = useAuthorDashboard({ enabled: Boolean(user?.id) });

  const [isEditing, setIsEditing] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    website: '',
    location: '',
  });
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLocalLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) setLocalLoading(false);
  }, [isLoading]);

  useEffect(() => {
    if (!localLoading && !isAuthenticated) navigate('/auth/login');
  }, [localLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const profileData = user?.profile || user?.user_metadata;
    if (profileData) {
      setFormData({
        full_name: profileData.full_name || '',
        username: profileData.username || '',
        bio: profileData.bio || '',
        website: profileData.website || '',
        location: profileData.location || '',
      });
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const website = formData.website.trim();
    const safeWebsite = website ? safeHttpUrl(website) : '';
    if (website && !safeWebsite) {
      toast.error(t('profile.websiteInvalid'));
      return;
    }

    const result = await updateProfile({ ...formData, website: safeWebsite });
    if (result.success) setIsEditing(false);
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      const publicUrl = await storageService.uploadAvatar(file, user.id);
      await updateProfile({ avatar_url: publicUrl });
      toast.success(t('profile.avatarUpdated'));
    } catch (error) {
      toast.error(error.message || t('profile.avatarError'));
    } finally {
      setAvatarUploading(false);
    }
  };

  if (localLoading && !user) {
    return <div className={styles.loading}><div className={styles.spinner} /></div>;
  }

  if (!user) {
    return (
      <div className={styles.loading}>
        <p>{en ? 'User not found. Please sign in.' : 'Kullanıcı bulunamadı. Lütfen giriş yapın.'}</p>
      </div>
    );
  }

  const profile = user.profile || user.user_metadata || {};
  const displayName = profile.full_name || profile.name || user.email?.split('@')[0] || (en ? 'User' : 'Kullanıcı');
  const displayUsername = profile.username || user.email?.split('@')[0] || 'user';
  const avatarUrl = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  const profileWebsite = safeHttpUrl(profile.website);
  const memberSince = new Date(user.created_at || Date.now()).toLocaleDateString(en ? 'en-US' : 'tr-TR');
  const roleLabel = profile.role === 'admin' ? (en ? 'Admin' : 'Yönetici') : (en ? 'Author' : 'Yazar');
  const userPosts = userPostsQuery.data || [];
  const latestPost = userPosts[0];
  const latestBookmark = bookmarkedPosts[0];
  const knowledgePosts = authorDashboard.data?.posts || [];
  const authorTestedCount = knowledgePosts.filter((post) => post.evidence_status === 'author-tested').length;
  const needsAttentionCount = knowledgePosts.filter((post) => post.evidence_status !== 'author-tested' || !post.tested_at).length;
  const bio = profile.bio || (en
    ? 'Add a short profile note so readers know what you build and write about.'
    : 'Ne ürettiğini ve hangi konularda yazdığını anlatan kısa bir profil notu ekleyebilirsin.');

  return (
    <main className={styles.container}>
      <section className={styles.profileGrid} aria-label={en ? 'Account overview' : 'Hesap özeti'}>
        <article className={styles.identityCard}>
          <div className={styles.identityTop}>
            <div className={styles.avatarWrapper}>
              <img src={avatarUrl} alt={displayName} className={styles.avatar} />
              <label className={styles.avatarUpload} aria-label={en ? 'Change profile photo' : 'Profil fotoğrafını değiştir'}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                  hidden
                />
                <FiCamera />
              </label>
            </div>

            <div className={styles.identityCopy}>
              <span className={styles.eyebrow}>{en ? 'Account profile' : 'Hesap profili'}</span>
              <h1>{displayName}</h1>
              <div className={styles.identityMeta}>
                <span>@{displayUsername}</span>
                <i aria-hidden="true" />
                <span>{user.email}</span>
              </div>
              <p className={`${styles.bio} ${!profile.bio ? styles.bioPlaceholder : ''}`}>{bio}</p>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}><FiCalendar /><span>{en ? 'Member' : 'Üyelik'}<strong>{memberSince}</strong></span></div>
            <div className={styles.stat}><FiShield /><span>{en ? 'Role' : 'Rol'}<strong>{roleLabel}</strong></span></div>
            <div className={styles.stat}><FiFileText /><span>{en ? 'Posts' : 'Yazı'}<strong>{userPosts.length}</strong></span></div>
            <div className={styles.stat}><FiBookmark /><span>{en ? 'Saved' : 'Kaydedilen'}<strong>{bookmarksCount}</strong></span></div>
          </div>
        </article>

        <aside className={styles.actionsCard}>
          <div className={styles.cardHeading}>
            <span>{en ? 'Account actions' : 'Hesap işlemleri'}</span>
            <small>{en ? 'Manage the essentials without hunting through menus.' : 'Temel hesap işlerini menülerde kaybolmadan yönet.'}</small>
          </div>
          <div className={styles.actionList}>
            <button type="button" onClick={() => setIsEditing(true)}>
              <FiEdit3 /><span><strong>{t('profile.edit')}</strong><small>{en ? 'Update profile identity and public details' : 'Profil bilgilerini ve görünümünü güncelle'}</small></span><FiArrowRight />
            </button>
            <Link to="/knowledge">
              <FiActivity /><span><strong>{en ? 'Knowledge health' : 'Bilgi sağlığı'}</strong><small>{en ? 'Review evidence freshness and maintenance' : 'Kanıt güncelliğini ve bakım kuyruğunu incele'}</small></span><FiArrowRight />
            </Link>
            <button type="button" className={styles.logoutAction} onClick={logout}>
              <FiLogOut /><span><strong>{t('auth.logout')}</strong><small>{en ? 'End this account session securely' : 'Bu hesap oturumunu güvenli biçimde kapat'}</small></span><FiArrowRight />
            </button>
          </div>
        </aside>
      </section>

      {isEditing && (
        <section className={styles.editorPanel} aria-label={en ? 'Edit profile' : 'Profili düzenle'}>
          <div className={styles.editorHeader}>
            <div>
              <span className={styles.eyebrow}>{en ? 'Profile editor' : 'Profil düzenleyici'}</span>
              <h2>{en ? 'Keep your public identity useful.' : 'Profilini kısa ve faydalı tut.'}</h2>
            </div>
            <button type="button" className={styles.closeEditor} onClick={() => setIsEditing(false)} aria-label={t('common.cancel')}><FiX /></button>
          </div>

          <div className={styles.form}>
            <div className={styles.formRow}>
              <label>{t('auth.fullName')}<input type="text" name="full_name" value={formData.full_name} onChange={handleChange} /></label>
              <label>{t('auth.username')}<input type="text" name="username" value={formData.username} onChange={handleChange} /></label>
            </div>
            <label>{t('profile.bio')}<textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder={t('profile.bioPlaceholder')} /></label>
            <div className={styles.formRow}>
              <label>{t('profile.website')}<input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://" /></label>
              <label>{t('profile.location')}<input type="text" name="location" value={formData.location} onChange={handleChange} placeholder={t('profile.locationPlaceholder')} /></label>
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={() => setIsEditing(false)}><FiX />{t('common.cancel')}</button>
              <button type="button" className={styles.saveButton} onClick={handleSave}><FiSave />{t('common.save')}</button>
            </div>
          </div>
        </section>
      )}

      <section className={styles.dashboardGrid}>
        <article className={styles.dashboardCard}>
          <div className={styles.cardTitle}><FiUser /><h2>{en ? 'Account summary' : 'Hesap özeti'}</h2></div>
          <dl className={styles.detailList}>
            <div><dt>{en ? 'Username' : 'Kullanıcı adı'}</dt><dd>@{displayUsername}</dd></div>
            <div><dt>{t('auth.email')}</dt><dd>{user.email}</dd></div>
            <div><dt>{en ? 'Member since' : 'Üyelik tarihi'}</dt><dd>{memberSince}</dd></div>
            <div><dt>{en ? 'Role' : 'Rol'}</dt><dd>{roleLabel}</dd></div>
            {profile.location && <div><dt>{t('profile.location')}</dt><dd>{profile.location}</dd></div>}
            {profileWebsite && <div><dt>{t('profile.website')}</dt><dd><a href={profileWebsite} target="_blank" rel="noopener noreferrer">{profileWebsite.replace(/^https?:\/\//, '')}</a></dd></div>}
          </dl>
          <button type="button" className={styles.cardCta} onClick={() => setIsEditing(true)}>{en ? 'Edit account details' : 'Hesap detaylarını düzenle'}<FiArrowRight /></button>
        </article>

        <article className={styles.dashboardCard}>
          <div className={styles.cardTitle}><FiFileText /><h2>{en ? 'Content production' : 'İçerik üretimi'}</h2></div>
          <div className={styles.metricRow}>
            <div><span>{en ? 'Published' : 'Yayınlanan yazı'}</span><strong>{userPosts.length}</strong></div>
            <div><span>{en ? 'Author-tested' : 'Yazar testli'}</span><strong>{authorTestedCount}</strong></div>
          </div>
          <div className={styles.cardBody}>
            <span className={styles.cardLabel}>{en ? 'Latest content' : 'Son içerik'}</span>
            {latestPost ? (
              <Link to={`/posts/${latestPost.slug || latestPost.id}`} className={styles.latestLink}>{latestPost.title}<FiArrowRight /></Link>
            ) : (
              <p>{en ? 'You have not published anything yet.' : 'Henüz yayınlanmış bir içeriğin yok.'}</p>
            )}
          </div>
          <Link to="/posts/create" className={styles.cardCta}><FiPlus />{en ? 'Create content' : 'Yazı oluştur'}<FiArrowRight /></Link>
        </article>

        <article className={styles.dashboardCard}>
          <div className={styles.cardTitle}><FiBookmark /><h2>{en ? 'Saved knowledge' : 'Kaydedilenler'}</h2></div>
          <div className={styles.centerMetric}><strong>{bookmarksCount}</strong><span>{en ? 'saved records' : 'kayıtlı içerik'}</span></div>
          <div className={styles.cardBody}>
            {latestBookmark ? <p>{en ? 'Last saved:' : 'Son kaydedilen:'} <strong>{latestBookmark.title}</strong></p> : <p>{en ? 'Save useful knowledge and return to it from here.' : 'İşe yarayan içerikleri kaydedip buradan kolayca geri dönebilirsin.'}</p>}
          </div>
          <Link to={bookmarksCount ? '/bookmarks' : '/'} className={styles.cardCta}>{bookmarksCount ? (en ? 'Open saved items' : 'Kaydedilenleri aç') : (en ? 'Explore' : 'Keşfet')}<FiArrowRight /></Link>
        </article>

        <article className={styles.dashboardCard}>
          <div className={styles.cardTitle}><FiActivity /><h2>{en ? 'Knowledge health' : 'Bilgi sağlığı'}</h2></div>
          <div className={styles.metricRow}>
            <div><span>{en ? 'Tracked' : 'Takip edilen'}</span><strong>{knowledgePosts.length}</strong></div>
            <div><span>{en ? 'Needs review' : 'Bakım bekleyen'}</span><strong>{needsAttentionCount}</strong></div>
          </div>
          <div className={styles.cardBody}>
            <p>{knowledgePosts.length
              ? (needsAttentionCount ? (en ? 'Some published knowledge needs evidence review.' : 'Bazı yayınların kanıt/güncellik kontrolü bekliyor.') : (en ? 'Your tracked knowledge is currently healthy.' : 'Takip edilen yayınların şu an güncel görünüyor.'))
              : (en ? 'Evidence health appears here once you publish.' : 'İçerik yayınladıkça kanıt ve güncellik durumu burada görünür.')}</p>
          </div>
          <Link to="/knowledge" className={styles.cardCta}>{en ? 'Open knowledge health' : 'Bilgi sağlığını aç'}<FiArrowRight /></Link>
        </article>
      </section>

      <section className={styles.quickSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>{en ? 'Workspace' : 'Üretim alanı'}</span>
          <h2>{en ? 'Quick access' : 'Hızlı erişim'}</h2>
        </div>
        <div className={styles.quickGrid}>
          <Link to={`/users/${user.id}`}><FiFileText /><span><strong>{en ? 'My posts' : 'Yazılarım'}</strong><small>{en ? 'See your public knowledge portfolio' : 'Herkese açık bilgi portföyünü gör'}</small></span><FiArrowRight /></Link>
          <Link to="/posts/create"><FiEdit3 /><span><strong>{en ? 'New content' : 'Yeni içerik'}</strong><small>{en ? 'Start a guide, decision, or field note' : 'Rehber, karar veya saha notu oluştur'}</small></span><FiArrowRight /></Link>
          <Link to="/bookmarks"><FiBookmark /><span><strong>{en ? 'Saved items' : 'Kaydettiklerim'}</strong><small>{en ? 'Return to your personal knowledge shelf' : 'Kişisel bilgi rafına dön'}</small></span><FiArrowRight /></Link>
          <Link to="/knowledge"><FiActivity /><span><strong>{en ? 'Knowledge health' : 'Bilgi sağlığı'}</strong><small>{en ? 'Review evidence and maintenance' : 'Kanıt ve bakım durumunu yönet'}</small></span><FiArrowRight /></Link>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
