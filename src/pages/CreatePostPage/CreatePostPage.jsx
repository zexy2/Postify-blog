/**
 * CreatePostPage Component
 * Form for creating new blog posts with rich text editor
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import RichTextEditor from '../../components/RichTextEditor';
import { useCreatePost, usePost, useUpdatePost } from '../../hooks/usePosts';
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
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const { post: editingPost } = usePost(id);

  // AI state
  const aiEnabled = useSelector(selectAIEnabled);
  const aiAvailable = isAIAvailable();
  const currentUser = useSelector((state) => state.user.user);
  const writingTemplates = getWritingTemplates(i18n.language);
  const draftKey = createDraftKey(currentUser?.id, i18n.language, id || 'new');
  const initialDraft = typeof window !== 'undefined' ? loadDraft(window.localStorage, draftKey) : null;
  const [writingMode, setWritingMode] = useState(() => initialDraft?.writingMode || 'guide');
  const writingTemplate = getWritingTemplate(writingMode, i18n.language);

  const [formData, setFormData] = useState(() => initialDraft?.formData || ({
    title: '',
    body: '',
    bodyHtml: '',
    outcome: '',
    testedAt: '',
    environment: '',
    verificationSteps: '',
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
    if (!isEdit || !editingPost || initialDraft?.formData || isDirty) return;
    setWritingMode(editingPost.contentType || 'guide');
    setFormData({
      title: editingPost.title || '',
      body: editingPost.body || '',
      bodyHtml: editingPost.bodyHtml || '',
      outcome: editingPost.outcome || editingPost.excerpt || '',
      testedAt: editingPost.evidence?.testedAt ? editingPost.evidence.testedAt.slice(0, 10) : '',
      environment: (editingPost.evidence?.environment || []).join(' · '),
      verificationSteps: (editingPost.evidence?.verificationSteps || []).join('\n'),
    });
  }, [editingPost, initialDraft?.formData, isDirty, isEdit]);

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


  const handleEvidenceChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        bodyHtml: formData.bodyHtml,
        authorId: currentUser?.id,
        locale: i18n.language?.startsWith('en') ? 'en' : 'tr',
        contentType: writingMode,
        outcome: formData.outcome.trim(),
        evidence: {
          level: formData.testedAt && formData.environment.trim() && formData.verificationSteps.trim() ? 'author-tested' : 'unverified',
          testedAt: formData.testedAt ? `${formData.testedAt}T12:00:00.000Z` : null,
          environment: formData.environment.split(/[·,\n]/).map((item) => item.trim()).filter(Boolean),
          prerequisites: editingPost?.evidence?.prerequisites || [],
          verificationSteps: formData.verificationSteps.split('\n').map((item) => item.trim()).filter(Boolean),
          caveats: editingPost?.evidence?.caveats || [],
          sources: editingPost?.evidence?.sources || [],
          staleAfterDays: editingPost?.evidence?.staleAfterDays || 180,
          version: editingPost?.evidence?.version || 1,
        },
      };
      if (isEdit) {
        await updatePost.mutateAsync({ id, data: { ...payload, revisionReason: 'Author edited content or evidence' } });
      } else {
        await createPost.mutateAsync(payload);
      }

      if (typeof window !== 'undefined') clearDraft(window.localStorage, draftKey);
      navigate(isEdit ? `/posts/${editingPost?.slug || id}` : '/');
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
          <h1 className={styles.title}>{isEdit ? (i18n.language?.startsWith('en') ? 'Edit verified knowledge' : 'Doğrulanmış bilgiyi düzenle') : t('posts.createPost')}</h1>
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
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error title-count" : "title-count"}
              maxLength={EDITOR_CONFIG.MAX_TITLE_LENGTH}
            />
            <div className={styles.inputFooter}>
              {errors.title && <span id="title-error" className={styles.error} role="alert">{errors.title}</span>}
              <span id="title-count" className={styles.charCount}>
                {formData.title.length}/{EDITOR_CONFIG.MAX_TITLE_LENGTH}
              </span>
            </div>
          </div>

          <section className={styles.evidenceFields} aria-labelledby="evidence-fields-title">
            <div><span className={styles.formatEyebrow}>{i18n.language?.startsWith('en') ? 'Evidence' : 'Kanıt'}</span><h2 id="evidence-fields-title">{i18n.language?.startsWith('en') ? 'What did you actually test?' : 'Gerçekte neyi test ettin?'}</h2><p>{i18n.language?.startsWith('en') ? 'These fields stay in the local draft in V1; production persistence waits for the reviewed schema.' : 'Bu alanlar V1’de yerel taslakta kalır; production kaydı onaylı şema sonrasına bırakıldı.'}</p></div>
            <label>{i18n.language?.startsWith('en') ? 'Expected outcome' : 'Beklenen sonuç'}<input value={formData.outcome || ''} onChange={handleEvidenceChange('outcome')} placeholder={i18n.language?.startsWith('en') ? 'After this, the reader can…' : 'Bunun sonunda okuyucu…'} /></label>
            <div className={styles.evidenceGrid}><label>{i18n.language?.startsWith('en') ? 'Tested on' : 'Test tarihi'}<input type="date" value={formData.testedAt || ''} onChange={handleEvidenceChange('testedAt')} /></label><label>{i18n.language?.startsWith('en') ? 'Environment / versions' : 'Ortam / sürümler'}<input value={formData.environment || ''} onChange={handleEvidenceChange('environment')} placeholder="Node 22 · React 19" /></label></div>
            <label>{i18n.language?.startsWith('en') ? 'Verification steps' : 'Doğrulama adımları'}<textarea rows="3" value={formData.verificationSteps || ''} onChange={handleEvidenceChange('verificationSteps')} placeholder={i18n.language?.startsWith('en') ? 'One check per line' : 'Her satıra bir kontrol'} /></label>
          </section>

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
                  ? { title: 'Clear title', substance: 'Enough substance', structure: 'Scannable structure', outcome: 'Concrete outcome', environment: 'Test environment', verification: 'Verification evidence' }
                  : { title: 'Net başlık', substance: 'Yeterli içerik', structure: 'Taranabilir yapı', outcome: 'Somut sonuç', environment: 'Test ortamı', verification: 'Doğrulama kanıtı' };
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
              disabled={createPost.isPending || updatePost.isPending}
            >
              {createPost.isPending || updatePost.isPending ? (
                <>
                  <span className={styles.spinner} />
                  {isEdit ? (i18n.language?.startsWith('en') ? 'Updating…' : 'Güncelleniyor…') : t('posts.publishing')}
                </>
              ) : (
                <>
                  <span>✨</span>
                  {isEdit ? (i18n.language?.startsWith('en') ? 'Update' : 'Güncelle') : t('posts.publish')}
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
