/**
 * Profile Page
 * 
 * User profile with edit functionality
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCamera, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { storageService } from '../../services/storageService';
import toast from 'react-hot-toast';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();

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

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Update local loading when auth loading changes
  useEffect(() => {
    if (!isLoading) {
      setLocalLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!localLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [localLoading, isAuthenticated, navigate]);

  useEffect(() => {
    // Get profile from user.profile or user.user_metadata
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
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
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.loading}>
        <p>Kullanıcı bulunamadı. Lütfen giriş yapın.</p>
      </div>
    );
  }

  // Get profile data from user.profile or user.user_metadata as fallback
  const profile = user.profile || user.user_metadata || {};
  const displayName = profile.full_name || profile.name || user.email?.split('@')[0] || 'Kullanıcı';
  const displayUsername = profile.username || user.email?.split('@')[0] || 'user';
  const avatarUrl = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <img
                src={avatarUrl}
                alt={displayName}
                className={styles.avatar}
              />
              <label className={styles.avatarUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                  hidden
                />
                <FaCamera />
              </label>
            </div>
          </div>

          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{displayName}</h1>
            <p className={styles.username}>@{displayUsername}</p>
            <p className={styles.email}>{user.email}</p>
          </div>

          <button
            className={styles.editButton}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <FaTimes /> : <FaEdit />}
            {isEditing ? t('common.cancel') : t('profile.edit')}
          </button>
        </div>

        {isEditing ? (
          <div className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>{t('auth.fullName')}</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t('auth.username')}</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>{t('profile.bio')}</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={styles.textarea}
                rows={4}
                placeholder={t('profile.bioPlaceholder')}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>{t('profile.website')}</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="https://"
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t('profile.location')}</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder={t('profile.locationPlaceholder')}
                />
              </div>
            </div>

            <button className={styles.saveButton} onClick={handleSave}>
              <FaSave />
              {t('common.save')}
            </button>
          </div>
        ) : (
          <div className={styles.info}>
            {profile.bio && (
              <div className={styles.infoSection}>
                <h3>{t('profile.bio')}</h3>
                <p>{profile.bio}</p>
              </div>
            )}

            <div className={styles.infoGrid}>
              {profile.website && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{t('profile.website')}</span>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    {profile.website}
                  </a>
                </div>
              )}
              {profile.location && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{t('profile.location')}</span>
                  <span>{profile.location}</span>
                </div>
              )}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('profile.memberSince')}</span>
                <span>
                  {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
