/**
 * Admin Page
 * Dashboard for admin users with user management and post moderation
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiUsers, FiFileText, FiShield, FiActivity, FiTrash2, FiEdit, FiEye, FiEyeOff } from 'react-icons/fi';
import adminService, { USER_ROLES } from '../../services/adminService';
import { localAuthService } from '../../services/localAuthService';
import styles from './AdminPage.module.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      const isAdmin = await localAuthService.isAdmin();
      if (!isAdmin) {
        navigate('/');
      }
    };
    checkAccess();
  }, [navigate]);

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'dashboard') {
          const dashboardStats = await adminService.getDashboardStats();
          setStats(dashboardStats);
        } else if (activeTab === 'users') {
          const allUsers = await adminService.getAllUsers();
          setUsers(allUsers);
        } else if (activeTab === 'posts') {
          const allPosts = await adminService.getAllPosts();
          setPosts(allPosts);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bu postu silmek istediğinizden emin misiniz?')) return;
    
    try {
      await adminService.deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTogglePostVisibility = async (postId) => {
    try {
      const updatedPost = await adminService.togglePostVisibility(postId);
      setPosts(posts.map(p => p.id === postId ? updatedPost : p));
    } catch (err) {
      alert(err.message);
    }
  };

  const renderDashboard = () => (
    <div className={styles.dashboard}>
      <h2>Dashboard</h2>
      
      {stats && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <FiUsers className={styles.statIcon} />
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>{stats.totalUsers}</span>
                <span className={styles.statLabel}>Toplam Kullanıcı</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <FiFileText className={styles.statIcon} />
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>{stats.totalPosts}</span>
                <span className={styles.statLabel}>Toplam Post</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <FiShield className={styles.statIcon} />
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>{stats.adminCount}</span>
                <span className={styles.statLabel}>Admin</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <FiActivity className={styles.statIcon} />
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>{stats.moderatorCount}</span>
                <span className={styles.statLabel}>Moderatör</span>
              </div>
            </div>
          </div>

          <div className={styles.recentSection}>
            <h3>Son Kayıt Olan Kullanıcılar</h3>
            <ul className={styles.recentList}>
              {stats.recentUsers?.map(user => (
                <li key={user.id} className={styles.recentItem}>
                  <img 
                    src={user.user_metadata?.avatar_url} 
                    alt={user.user_metadata?.username}
                    className={styles.avatar}
                  />
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.user_metadata?.full_name}</span>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                  <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                    {user.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className={styles.usersSection}>
      <h2>Kullanıcı Yönetimi</h2>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Kullanıcı</th>
            <th>E-posta</th>
            <th>Rol</th>
            <th>Kayıt Tarihi</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <div className={styles.userCell}>
                  <img 
                    src={u.user_metadata?.avatar_url} 
                    alt={u.user_metadata?.username}
                    className={styles.tableAvatar}
                  />
                  <span>{u.user_metadata?.full_name || u.user_metadata?.username}</span>
                </div>
              </td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role || USER_ROLES.USER}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className={styles.roleSelect}
                  disabled={u.id === user?.id}
                >
                  <option value={USER_ROLES.USER}>User</option>
                  <option value={USER_ROLES.MODERATOR}>Moderator</option>
                  <option value={USER_ROLES.ADMIN}>Admin</option>
                </select>
              </td>
              <td>{new Date(u.created_at).toLocaleDateString('tr-TR')}</td>
              <td>
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className={styles.deleteBtn}
                  disabled={u.id === user?.id}
                  title="Kullanıcıyı Sil"
                >
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPosts = () => (
    <div className={styles.postsSection}>
      <h2>Post Moderasyonu</h2>
      
      {posts.length === 0 ? (
        <p className={styles.noPosts}>Henüz post bulunmuyor.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Yazar</th>
              <th>Tarih</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td className={styles.postTitle}>{post.title}</td>
                <td>{post.author || 'Anonim'}</td>
                <td>{new Date(post.createdAt || post.created_at || Date.now()).toLocaleDateString('tr-TR')}</td>
                <td>
                  <span className={`${styles.statusBadge} ${post.isPublished !== false ? styles.published : styles.draft}`}>
                    {post.isPublished !== false ? 'Yayında' : 'Taslak'}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button
                    onClick={() => handleTogglePostVisibility(post.id)}
                    className={styles.actionBtn}
                    title={post.isPublished !== false ? 'Yayından Kaldır' : 'Yayınla'}
                  >
                    {post.isPublished !== false ? <FiEyeOff /> : <FiEye />}
                  </button>
                  <button
                    onClick={() => navigate(`/posts/${post.id}/edit`)}
                    className={styles.actionBtn}
                    title="Düzenle"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className={styles.deleteBtn}
                    title="Sil"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  if (loading && activeTab === 'dashboard' && !stats) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <FiShield className={styles.headerIcon} />
          Admin Panel
        </h1>
        <p>Hoş geldiniz, {user?.user_metadata?.full_name || 'Admin'}</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FiActivity /> Dashboard
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FiUsers /> Kullanıcılar
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'posts' ? styles.active : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <FiFileText /> Postlar
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Yükleniyor...</div>
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
