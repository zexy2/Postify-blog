/**
 * CreatePostPage Component
 * Form for creating new blog posts with rich text editor
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import RichTextEditor from '../../components/RichTextEditor';
import { useCreatePost } from '../../hooks/usePosts';
import { EDITOR_CONFIG } from '../../constants';
import { 
  selectAIEnabled, 
  toggleAI,
  isAIAvailable 
} from '../../features/ai-assistant';
import styles from './CreatePostPage.module.css';

const CreatePostPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const createPost = useCreatePost();

  // AI state
  const aiEnabled = useSelector(selectAIEnabled);
  const aiAvailable = isAIAvailable();
  const currentUser = useSelector((state) => state.user.user);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    bodyHtml: '',
  });
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('validation.required');
    } else if (formData.title.length < EDITOR_CONFIG.MIN_TITLE_LENGTH) {
      newErrors.title = t('validation.minLength', { min: EDITOR_CONFIG.MIN_TITLE_LENGTH });
    } else if (formData.title.length > EDITOR_CONFIG.MAX_TITLE_LENGTH) {
      newErrors.title = t('validation.maxLength', { max: EDITOR_CONFIG.MAX_TITLE_LENGTH });
    }

    if (!formData.body.trim()) {
      newErrors.body = t('validation.required');
    } else if (formData.body.length < EDITOR_CONFIG.MIN_BODY_LENGTH) {
      newErrors.body = t('validation.minLength', { min: EDITOR_CONFIG.MIN_BODY_LENGTH });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleTitleChange = (e) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
    setIsDirty(true);
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  const handleEditorChange = ({ html, text }) => {
    setFormData((prev) => ({ ...prev, body: text, bodyHtml: html }));
    setIsDirty(true);
    if (errors.body) {
      setErrors((prev) => ({ ...prev, body: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createPost.mutateAsync({
        title: formData.title.trim(),
        body: formData.body.trim(),
        bodyHtml: formData.bodyHtml,
        authorId: currentUser?.id,
        locale: i18n.language?.startsWith('en') ? 'en' : 'tr',
      });

      navigate('/');
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm('Değişiklikler kaydedilmedi. Çıkmak istediğinize emin misiniz?');
      if (!confirmed) return;
    }
    navigate(-1);
  };

  return (
    <div className="container">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('posts.createPost')}</h1>
          <p className={styles.subtitle}>
            {t('posts.createSubtitle')}
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title Input */}
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              {t('posts.postTitle')}
              <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder={t('posts.titlePlaceholder')}
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              maxLength={EDITOR_CONFIG.MAX_TITLE_LENGTH}
            />
            <div className={styles.inputFooter}>
              {errors.title && <span className={styles.error}>{errors.title}</span>}
              <span className={styles.charCount}>
                {formData.title.length}/{EDITOR_CONFIG.MAX_TITLE_LENGTH}
              </span>
            </div>
          </div>

          {/* Content Editor */}
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label}>
                {t('posts.postContent')}
                <span className={styles.required}>*</span>
              </label>
              {/* AI Toggle */}
              {aiAvailable && (
                <button
                  type="button"
                  onClick={() => dispatch(toggleAI())}
                  className={`${styles.aiToggle} ${aiEnabled ? styles.aiActive : ''}`}
                  title={aiEnabled ? 'AI Asistan Açık' : 'AI Asistan Kapalı'}
                >
                  <span className={styles.aiIcon}>✨</span>
                  <span className={styles.aiLabel}>AI</span>
                  <span className={`${styles.aiDot} ${aiEnabled ? styles.on : ''}`}></span>
                </button>
              )}
            </div>
            <RichTextEditor
              content=""
              onChange={handleEditorChange}
              placeholder={t('posts.bodyPlaceholder')}
              minHeight={300}
              maxHeight={600}
            />
            <div className={styles.inputFooter}>
              {errors.body && <span className={styles.error}>{errors.body}</span>}
              <span className={styles.charCount}>
                {formData.body.length} karakter
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={createPost.isPending}
            >
              {createPost.isPending ? (
                <>
                  <span className={styles.spinner} />
                  {t('posts.publishing')}
                </>
              ) : (
                <>
                  <span>✨</span>
                  {t('posts.publish')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
