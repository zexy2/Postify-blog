/**
 * CreatePostPage Component
 * Form for creating new blog posts with rich text editor
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import RichTextEditor from '../../components/RichTextEditor';
import { useCreatePost } from '../../hooks/usePosts';
import { EDITOR_CONFIG } from '../../constants';
import { getWritingStarter, getWritingTemplate, getWritingTemplates } from '../../content/writingTemplates';
import { clearDraft, createDraftKey, loadDraft, saveDraft } from '../../lib/draftStorage';
import { getPublishReadiness } from '../../lib/publishReadiness';
import { getWritingMetrics } from '../../lib/writingMetrics';
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
  const writingTemplates = getWritingTemplates(i18n.language);
  const [writingMode, setWritingMode] = useState('guide');
  const writingTemplate = getWritingTemplate(writingMode, i18n.language);
  const draftKey = createDraftKey(currentUser?.id, i18n.language);
  const initialDraft = typeof window !== 'undefined' ? loadDraft(window.localStorage, draftKey) : null;

  const [formData, setFormData] = useState(() => initialDraft?.formData || ({
    title: '',
    body: '',
    bodyHtml: '',
  }));
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [draftRestored, setDraftRestored] = useState(Boolean(initialDraft?.formData));
  const writingMetrics = getWritingMetrics(formData.body);
  const publishReadiness = getPublishReadiness({
    ...formData,
    minTitleLength: EDITOR_CONFIG.MIN_TITLE_LENGTH,
    minBodyLength: EDITOR_CONFIG.MIN_BODY_LENGTH,
  });

  useEffect(() => {
    if (!isDirty || typeof window === 'undefined') return undefined;
    const timer = window.setTimeout(() => {
      saveDraft(window.localStorage, draftKey, {
        formData,
        writingMode,
        savedAt: new Date().toISOString(),
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draftKey, formData, isDirty, writingMode]);

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

      if (typeof window !== 'undefined') clearDraft(window.localStorage, draftKey);
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
    if (typeof window !== 'undefined') clearDraft(window.localStorage, draftKey);
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
          {draftRestored && (
            <div className={styles.draftNotice} role="status">
              <span>{i18n.language?.startsWith('en') ? 'Local draft restored.' : 'Yerel taslak geri yüklendi.'}</span>
              <button type="button" onClick={() => setDraftRestored(false)}>
                {i18n.language?.startsWith('en') ? 'Dismiss' : 'Kapat'}
              </button>
            </div>
          )}
          <section className={styles.formatSection} aria-labelledby="post-format-heading">
            <div className={styles.formatHeadingRow}>
              <div>
                <span className={styles.formatEyebrow}>{i18n.language?.startsWith('en') ? 'Writing mode' : 'Yazı biçimi'}</span>
                <h2 id="post-format-heading">{i18n.language?.startsWith('en') ? 'What should this help someone do?' : 'Bu içerik birine ne yaptıracak?'}</h2>
              </div>
              <span className={styles.formatHint}>{i18n.language?.startsWith('en') ? 'Not saved to the database yet' : 'Henüz veritabanına kaydedilmez'}</span>
            </div>
            <div className={styles.formatGrid} role="group" aria-label={i18n.language?.startsWith('en') ? 'Content format' : 'İçerik biçimi'}>
              {writingTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={`${styles.formatButton} ${writingMode === template.id ? styles.formatButtonActive : ''}`}
                  aria-pressed={writingMode === template.id}
                  onClick={() => setWritingMode(template.id)}
                >
                  <strong>{template.label}</strong>
                  <span>{template.promise}</span>
                </button>
              ))}
            </div>
            <div className={styles.writingBrief}>
              <div className={styles.briefTopline}>
                <strong>{writingTemplate.label}: {writingTemplate.promise}</strong>
                <button
                  type="button"
                  className={styles.outlineButton}
                  disabled={Boolean(formData.body.trim())}
                  onClick={() => {
                    const starter = getWritingStarter(writingMode, i18n.language);
                    setFormData((prev) => ({ ...prev, body: starter.text, bodyHtml: starter.html }));
                    setIsDirty(true);
                  }}
                >
                  {i18n.language?.startsWith('en') ? 'Use outline' : 'İskeleti ekle'}
                </button>
              </div>
              <ol>
                {writingTemplate.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}
              </ol>
            </div>
          </section>

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
              content={formData.bodyHtml || formData.body}
              onChange={handleEditorChange}
              placeholder={t('posts.bodyPlaceholder')}
              minHeight={300}
              maxHeight={600}
            />
            <div className={styles.inputFooter}>
              {errors.body && <span className={styles.error}>{errors.body}</span>}
              <span className={styles.charCount}>
                {i18n.language?.startsWith('en')
                  ? `${writingMetrics.words} words · ${writingMetrics.readingMinutes || 0} min`
                  : `${writingMetrics.words} kelime · ${writingMetrics.readingMinutes || 0} dk`}
              </span>
            </div>
          </div>

          <aside className={styles.readinessPanel} aria-label={i18n.language?.startsWith('en') ? 'Publish readiness' : 'Yayın hazırlığı'}>
            <div className={styles.readinessHeader}>
              <div>
                <span>{i18n.language?.startsWith('en') ? 'Publish readiness' : 'Yayın hazırlığı'}</span>
                <strong>{publishReadiness.score}%</strong>
              </div>
              <span className={publishReadiness.ready ? styles.readyBadge : styles.draftBadge}>
                {publishReadiness.ready
                  ? (i18n.language?.startsWith('en') ? 'Core checks ready' : 'Temel kontroller hazır')
                  : (i18n.language?.startsWith('en') ? 'Draft needs work' : 'Taslak geliştirilmeli')}
              </span>
            </div>
            <ul className={styles.readinessList}>
              {publishReadiness.checks.map((check) => {
                const labels = i18n.language?.startsWith('en')
                  ? { title: 'Clear title', substance: 'Enough substance', structure: 'Scannable structure' }
                  : { title: 'Net başlık', substance: 'Yeterli içerik', structure: 'Taranabilir yapı' };
                return <li key={check.id} data-passed={check.passed}>{check.passed ? '✓' : '○'} {labels[check.id]}</li>;
              })}
            </ul>
          </aside>

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
