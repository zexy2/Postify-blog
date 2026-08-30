/**
 * Admin Page
 * Dashboard for admin users with user management and post moderation
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiUsers, FiFileText, FiShield, FiActivity, FiTrash2, FiEdit, FiEye, FiEyeOff, FiMessageSquare } from 'react-icons/fi';
import adminService, { USER_ROLES } from '../../services/adminService';
import styles from './AdminPage.module.css';

const ADMIN_COPY = {
  en: {
    dashboard: 'Dashboard', totalUsers: 'Total users', totalPosts: 'Content items', admin: 'Admin', moderator: 'Moderator', comments: 'Comments',
    recentUsers: 'Recently registered users', noRecentUsers: 'No new users yet.', userManagement: 'User management', noUsers: 'No users yet.',
    user: 'User', email: 'Email', role: 'Role', registered: 'Registered', actions: 'Actions', unnamedUser: 'Unnamed user',
    serverOnlyTitle: 'Deleting users requires a secure server-side Admin API.', serverOnly: 'Server API required',
    contentModeration: 'Content moderation', noPosts: 'No content items yet.', title: 'Title', author: 'Author', date: 'Date', status: 'Status', anonymous: 'Anonymous',
    published: 'Published', draft: 'Draft', unpublish: 'Unpublish', publish: 'Publish', edit: 'Edit', delete: 'Delete',
    loading: 'Loading…', eyebrow: 'ADMIN CONSOLE', headline: 'Manage Postify operations.', description: 'Control user roles, publishing state, and community operations from one workspace.',
    activeAdmin: 'Active administrator', tabsLabel: 'Administration sections', usersTab: 'Users', postsTab: 'Content', retry: 'Try again',
    loadError: 'Administration data could not be loaded.', confirmDelete: 'Delete this content item? This action cannot be undone.', actionFailed: 'The admin action could not be completed.',
  },
  tr: {
    dashboard: 'Genel bakış', totalUsers: 'Toplam kullanıcı', totalPosts: 'Toplam içerik', admin: 'Yönetici', moderator: 'Moderatör', comments: 'Yorum',
    recentUsers: 'Son kayıt olan kullanıcılar', noRecentUsers: 'Henüz yeni kullanıcı yok.', userManagement: 'Kullanıcı yönetimi', noUsers: 'Henüz kullanıcı bulunmuyor.',
    user: 'Kullanıcı', email: 'E-posta', role: 'Rol', registered: 'Kayıt tarihi', actions: 'İşlemler', unnamedUser: 'İsimsiz kullanıcı',
    serverOnlyTitle: 'Kullanıcı silme işlemi güvenli server-side Admin API gerektirir.', serverOnly: 'Server API gerekli',
    contentModeration: 'İçerik moderasyonu', noPosts: 'Henüz içerik bulunmuyor.', title: 'Başlık', author: 'Yazar', date: 'Tarih', status: 'Durum', anonymous: 'Anonim',
    published: 'Yayında', draft: 'Taslak', unpublish: 'Yayından kaldır', publish: 'Yayınla', edit: 'Düzenle', delete: 'Sil',
    loading: 'Yükleniyor…', eyebrow: 'YÖNETİM KONSOLU', headline: 'Postify operasyonlarını yönet.', description: 'Kullanıcı rolleri, yayın durumu ve topluluk operasyonlarını tek çalışma alanından kontrol et.',
    activeAdmin: 'Aktif yönetici', tabsLabel: 'Yönetim bölümleri', usersTab: 'Kullanıcılar', postsTab: 'İçerikler', retry: 'Tekrar dene',
    loadError: 'Yönetim verileri yüklenemedi.', confirmDelete: 'Bu içeriği silmek istiyor musun? Bu işlem geri alınamaz.', actionFailed: 'Yönetim işlemi tamamlanamadı.',
  },
};

const AdminPage = ({ service = adminService }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { user } = useSelector((state) => state.user);
  const en = i18n.language?.startsWith('en');
  const copy = ADMIN_COPY[en ? 'en' : 'tr'];
  const dateLocale = en ? 'en-US' : 'tr-TR';
  const roleLabel = (role) => ({
    admin: copy.admin,
    moderator: copy.moderator,
    user: copy.user,
  }[role] || role);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        await service.checkAdminAuth();
      } catch {
        navigate('/');
      }
    };
    checkAccess();
  }, [navigate, service]);

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'dashboard') {
          const dashboardStats = await service.getDashboardStats();
          setStats(dashboardStats);
        } else if (activeTab === 'users') {
          const allUsers = await service.getAllUsers();
          setUsers(allUsers);
        } else if (activeTab === 'posts') {
          const allPosts = await service.getAllPosts();
          setPosts(allPosts);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, reloadKey, service]);


  const handleTabKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...event.currentTarget.parentElement.querySelectorAll('[role="tab"]')];
    const currentIndex = tabs.indexOf(event.currentTarget);
    if (currentIndex < 0 || tabs.length === 0) return;

    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;

    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await service.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error(err.message || copy.actionFailed);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm(copy.confirmDelete)) return;
    
    try {
      await service.deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      toast.error(err.message || copy.actionFailed);
    }
  };

  const handleTogglePostVisibility = async (postId) => {
    try {
      const updatedPost = await service.togglePostVisibility(postId);
      setPosts(posts.map(p => p.id === postId ? updatedPost : p));
    } catch (err) {
      toast.error(err.message || copy.actionFailed);
    }
  };

  const renderDashboard = () => (
    <div className={styles.dashboard}>
      <h2>{copy.dashboard}</h2>
      
      {stats && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <FiUsers className={styles.statIcon} />
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>{stats.totalUsers}</span>
                <span className={styles.statLabel}>{copy.totalUsers}</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <FiFileText className={styles.statIcon} />
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>{stats.totalPosts}</span>
                <span className={styles.statLabel}>{copy.totalPosts}</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <FiShield className={styles.statIcon} />
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>{stats.adminCount}</span>
                <span className={styles.statLabel}>{copy.admin}</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <FiActivity className={styles.statIcon} />
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>{stats.moderatorCount}</span>
                <span className={styles.statLabel}>{copy.moderator}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <FiMessageSquare className={styles.statIcon} />
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>{stats.totalComments}</span>
                <span className={styles.statLabel}>{copy.comments}</span>
              </div>
            </div>
          </div>

          <div className={styles.recentSection}>
            <h3>{copy.recentUsers}</h3>
            {stats.recentUsers?.length ? (
              <ul className={styles.recentList}>
              {stats.recentUsers.map(user => (
                <li key={user.id} className={styles.recentItem}>
                  <img 
                    src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name || user.username || user.email || 'U')}`}
                    alt={user.full_name || user.username || user.email || copy.user}
                    className={styles.avatar}
                  />
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.full_name || user.username || copy.unnamedUser}</span>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                  <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                    {roleLabel(user.role)}
                  </span>
                </li>
              ))}
              </ul>
            ) : (
              <p className={styles.noPosts}>{copy.noRecentUsers}</p>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className={styles.usersSection}>
      <h2>{copy.userManagement}</h2>
      
      {users.length === 0 ? (
        <p className={styles.noPosts}>{copy.noUsers}</p>
      ) : (
        <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{copy.user}</th>
              <th>{copy.email}</th>
              <th>{copy.role}</th>
              <th>{copy.registered}</th>
              <th>{copy.actions}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
              <td>
                <div className={styles.userCell}>
                  <img 
                    src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.full_name || u.username || u.email || 'U')}`}
                    alt={u.full_name || u.username || u.email || copy.user}
                    className={styles.tableAvatar}
                  />
                  <span>{u.full_name || u.username || copy.unnamedUser}</span>
                </div>
              </td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role || USER_ROLES.USER}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className={styles.roleSelect}
                  aria-label={en ? `${u.full_name || u.username || u.email || copy.user} role` : `${u.full_name || u.username || u.email || copy.user} rolü`}
                  disabled={u.id === user?.id}
                >
                  <option value={USER_ROLES.USER}>{copy.user}</option>
                  <option value={USER_ROLES.MODERATOR}>{copy.moderator}</option>
                  <option value={USER_ROLES.ADMIN}>{copy.admin}</option>
                </select>
              </td>
              <td>{new Date(u.created_at).toLocaleDateString(dateLocale)}</td>
              <td>
                <span className={styles.serverOnly} title={copy.serverOnlyTitle}>
                  {copy.serverOnly}
                </span>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );

  const renderPosts = () => (
    <div className={styles.postsSection}>
      <h2>{copy.contentModeration}</h2>
      
      {posts.length === 0 ? (
        <p className={styles.noPosts}>{copy.noPosts}</p>
      ) : (
        <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{copy.title}</th>
              <th>{copy.author}</th>
              <th>{copy.date}</th>
              <th>{copy.status}</th>
              <th>{copy.actions}</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td className={styles.postTitle}>{post.title}</td>
                <td>{post.author || copy.anonymous}</td>
                <td>{new Date(post.createdAt || post.created_at || Date.now()).toLocaleDateString(dateLocale)}</td>
                <td>
                  <span className={`${styles.statusBadge} ${post.isPublished !== false ? styles.published : styles.draft}`}>
                    {post.isPublished !== false ? copy.published : copy.draft}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => handleTogglePostVisibility(post.id)}
                    className={styles.actionBtn}
                    aria-label={post.isPublished !== false ? `${copy.unpublish}: ${post.title}` : `${copy.publish}: ${post.title}`}
                    title={post.isPublished !== false ? copy.unpublish : copy.publish}
                  >
                    {post.isPublished !== false ? <FiEyeOff /> : <FiEye />}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/posts/${post.id}/edit`)}
                    className={styles.actionBtn}
                    aria-label={`${copy.edit}: ${post.title}`}
                    title={copy.edit}
                  >
                    <FiEdit />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className={styles.deleteBtn}
                    aria-label={`${copy.delete}: ${post.title}`}
                    title={copy.delete}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );

  if (loading && activeTab === 'dashboard' && !stats) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{copy.loading}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>{copy.eyebrow}</span>
        <h1>{copy.headline}</h1>
        <p>{copy.description}</p>
        <span className={styles.operator}>{copy.activeAdmin} · {user?.user_metadata?.full_name || user?.email || copy.admin}</span>
      </header>

      <div className={styles.tabs} role="tablist" aria-label={copy.tabsLabel}>
        <button
          type="button"
          id="admin-tab-dashboard"
          className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`}
          onClick={() => setActiveTab('dashboard')}
          onKeyDown={handleTabKeyDown}
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          aria-controls="admin-panel-dashboard"
          tabIndex={activeTab === 'dashboard' ? 0 : -1}
        >
          <FiActivity /> {copy.dashboard}
        </button>
        <button
          type="button"
          id="admin-tab-users"
          className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
          onKeyDown={handleTabKeyDown}
          role="tab"
          aria-selected={activeTab === 'users'}
          aria-controls="admin-panel-users"
          tabIndex={activeTab === 'users' ? 0 : -1}
        >
          <FiUsers /> {copy.usersTab}
        </button>
        <button
          type="button"
          id="admin-tab-posts"
          className={`${styles.tab} ${activeTab === 'posts' ? styles.active : ''}`}
          onClick={() => setActiveTab('posts')}
          onKeyDown={handleTabKeyDown}
          role="tab"
          aria-selected={activeTab === 'posts'}
          aria-controls="admin-panel-posts"
          tabIndex={activeTab === 'posts' ? 0 : -1}
        >
          <FiFileText /> {copy.postsTab}
        </button>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <span>{copy.loadError}</span>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)}>{copy.retry}</button>
        </div>
      )}

      <div
        className={styles.content}
        role="tabpanel"
        id={`admin-panel-${activeTab}`}
        aria-labelledby={`admin-tab-${activeTab}`}
      >
        {loading ? (
          <div className={styles.loading}>{copy.loading}</div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'posts' && renderPosts()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
