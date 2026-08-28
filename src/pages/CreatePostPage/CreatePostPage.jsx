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
import { dateInputToTimestamp, getLocalDateInputValue, getPublishReadiness } from '../../lib/publishReadiness';
import { useKnowledgeBackendStatus } from '../../hooks/useKnowledge';
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
  const knowledgeBackend = useKnowledgeBackendStatus();
  const knowledgeBackendReady = knowledgeBackend.data?.ready === true;
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
    prerequisites: '',
    verificationSteps: '',
    caveats: '',
    sources: '',
    staleAfterDays: '180',
    revisionReason: '',
  }));
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [draftRestored, setDraftRestored] = useState(Boolean(initialDraft?.formData));
  const writingMetrics = getWritingMetrics(formData.body);
  const maxTestedDate = getLocalDateInputValue();
  const publishReadiness = getPublishReadiness({
    ...formData,
    minTitleLength: EDITOR_CONFIG.MIN_TITLE_LENGTH,
    maxTitleLength: EDITOR_CONFIG.MAX_TITLE_LENGTH,
    minBodyLength: EDITOR_CONFIG.MIN_BODY_LENGTH,
    latestTestDate: maxTestedDate,
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
      prerequisites: (editingPost.evidence?.prerequisites || []).join('\n'),
      verificationSteps: (editingPost.evidence?.verificationSteps || []).join('\n'),
      caveats: (editingPost.evidence?.caveats || []).join('\n'),
      sources: (editingPost.evidence?.sources || []).join('\n'),
      staleAfterDays: String(editingPost.evidence?.staleAfterDays || 180),
      revisionReason: '',
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
    const normalizedTitle = formData.title.trim();
    const normalizedBody = formData.body.trim();

    if (!normalizedTitle) {
      newErrors.title = t('validation.required');
    } else if (normalizedTitle.length < EDITOR_CONFIG.MIN_TITLE_LENGTH) {
      newErrors.title = t('validation.minLength', { min: EDITOR_CONFIG.MIN_TITLE_LENGTH });
    } else if (normalizedTitle.length > EDITOR_CONFIG.MAX_TITLE_LENGTH) {
      newErrors.title = t('validation.maxLength', { max: EDITOR_CONFIG.MAX_TITLE_LENGTH });
    }

    if (!normalizedBody) {
      newErrors.body = t('validation.required');
    } else if (normalizedBody.length < EDITOR_CONFIG.MIN_BODY_LENGTH) {
      newErrors.body = t('validation.minLength', { min: EDITOR_CONFIG.MIN_BODY_LENGTH });
    }

    setErrors(newErrors);
    return publishReadiness.publication.ready && Object.keys(newErrors).length === 0;
  }, [formData.body, formData.title, publishReadiness.publication.ready, t]);

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
    if (!knowledgeBackendReady) {
      setErrors((prev) => ({ ...prev, backend: i18n.language?.startsWith('en') ? 'Publishing with persisted evidence is waiting for the production knowledge backend upgrade. Your local draft is safe.' : 'Kalıcı kanıtla yayınlama production bilgi backend yükseltmesini bekliyor. Yerel taslağın güvende.' }));
      return;
    }

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
          level: publishReadiness.evidence.level,
          testedAt: formData.testedAt ? dateInputToTimestamp(formData.testedAt) : null,
          environment: formData.environment.split(/[·,\n]/).map((item) => item.trim()).filter(Boolean),
          prerequisites: formData.prerequisites.split('\n').map((item) => item.trim()).filter(Boolean),
          verificationSteps: formData.verificationSteps.split('\n').map((item) => item.trim()).filter(Boolean),
          caveats: formData.caveats.split('\n').map((item) => item.trim()).filter(Boolean),
          sources: formData.sources.split('\n').map((item) => item.trim()).filter(Boolean),
          staleAfterDays: Number(formData.staleAfterDays) || 180,
          version: editingPost?.evidence?.version || 1,
        },
      };
      if (isEdit) {
        await updatePost.mutateAsync({ id, data: { ...payload, revisionReason: formData.revisionReason.trim() || 'Author edited content or evidence' } });
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
          <h1 className={styles.title}>{isEdit ? (i18n.language?.startsWith('en') ? 'Edit knowledge' : 'Bilgiyi düzenle') : t('posts.createPost')}</h1>
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
              <span className={styles.formatHint}>{i18n.language?.startsWith('en') ? 'Structured practical knowledge' : 'Yapılandırılmış uygulanabilir bilgi'}</span>
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
            <div>
              <span className={styles.formatEyebrow}>{i18n.language?.startsWith('en') ? 'Evidence' : 'Kanıt'}</span>
              <h2 id="evidence-fields-title">{i18n.language?.startsWith('en') ? 'What did you actually test?' : 'Gerçekte neyi test ettin?'}</h2>
              <p>{knowledgeBackendReady
                ? (i18n.language?.startsWith('en') ? 'Evidence will be persisted with this knowledge unit.' : 'Kanıt bu bilgi birimiyle kalıcı olarak kaydedilecek.')
                : (i18n.language?.startsWith('en') ? 'Keep drafting locally. Publishing evidence activates automatically after the production backend upgrade.' : 'Taslağa yerel olarak devam et. Kanıt yayınlama production backend yükseltmesinden sonra otomatik açılacak.')}</p>
            </div>
            <label>{i18n.language?.startsWith('en') ? 'Expected outcome' : 'Beklenen sonuç'}<input value={formData.outcome || ''} onChange={handleEvidenceChange('outcome')} placeholder={i18n.language?.startsWith('en') ? 'After this, the reader can…' : 'Bunun sonunda okuyucu…'} /></label>
            <div className={styles.evidenceGrid}>
              <label>{i18n.language?.startsWith('en') ? 'Tested on' : 'Test tarihi'}<input type="date" max={maxTestedDate} value={formData.testedAt || ''} onChange={handleEvidenceChange('testedAt')} /></label>
              <label>{i18n.language?.startsWith('en') ? 'Environment / versions' : 'Ortam / sürümler'}<input value={formData.environment || ''} onChange={handleEvidenceChange('environment')} placeholder="Node 22 · React 19" /></label>
            </div>
            <label>{i18n.language?.startsWith('en') ? 'Prerequisites' : 'Ön koşullar'}<textarea rows="3" value={formData.prerequisites || ''} onChange={handleEvidenceChange('prerequisites')} placeholder={i18n.language?.startsWith('en') ? 'One prerequisite per line' : 'Her satıra bir ön koşul'} /></label>
            <label>{i18n.language?.startsWith('en') ? 'Verification steps' : 'Doğrulama adımları'}<textarea rows="4" value={formData.verificationSteps || ''} onChange={handleEvidenceChange('verificationSteps')} placeholder={i18n.language?.startsWith('en') ? 'One check per line' : 'Her satıra bir kontrol'} /></label>
            <label>{i18n.language?.startsWith('en') ? 'Known caveats / failure conditions' : 'Bilinen sınırlar / hata koşulları'}<textarea rows="3" value={formData.caveats || ''} onChange={handleEvidenceChange('caveats')} placeholder={i18n.language?.startsWith('en') ? 'Where should a reader not trust this blindly?' : 'Okuyucu bunu hangi durumda körü körüne uygulamamalı?'} /></label>
            <label>{i18n.language?.startsWith('en') ? 'Sources / evidence URLs' : 'Kaynaklar / kanıt URL’leri'}<textarea rows="3" value={formData.sources || ''} onChange={handleEvidenceChange('sources')} placeholder="https://…" /></label>
            <div className={styles.evidenceGrid}>
              <label>{i18n.language?.startsWith('en') ? 'Re-check after' : 'Tekrar kontrol süresi'}<select value={formData.staleAfterDays || '180'} onChange={handleEvidenceChange('staleAfterDays')}><option value="30">30 {i18n.language?.startsWith('en') ? 'days' : 'gün'}</option><option value="90">90 {i18n.language?.startsWith('en') ? 'days' : 'gün'}</option><option value="180">180 {i18n.language?.startsWith('en') ? 'days' : 'gün'}</option><option value="365">365 {i18n.language?.startsWith('en') ? 'days' : 'gün'}</option></select></label>
              {isEdit && <label>{i18n.language?.startsWith('en') ? 'What changed?' : 'Ne değişti?'}<input value={formData.revisionReason || ''} onChange={handleEvidenceChange('revisionReason')} placeholder={i18n.language?.startsWith('en') ? 'Updated for Node 22 / fixed step 3' : 'Node 22 için güncellendi / 3. adım düzeltildi'} /></label>}
            </div>
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

          <aside className={styles.readinessPanel} aria-label={i18n.language?.startsWith('en') ? 'Publishing and evidence readiness' : 'Yayın ve kanıt hazırlığı'}>
            <div className={styles.readinessGrid}>
              <section className={styles.readinessTrack}>
                <div className={styles.readinessHeader}>
                  <div><span>{i18n.language?.startsWith('en') ? 'Publication' : 'Yayın'}</span></div>
                  <span className={publishReadiness.publication.ready ? styles.readyBadge : styles.draftBadge}>
                    {publishReadiness.publication.ready
                      ? (i18n.language?.startsWith('en') ? 'Ready to publish' : 'Yayınlanabilir')
                      : (i18n.language?.startsWith('en') ? 'Needs title/content' : 'Başlık/içerik gerekli')}
                  </span>
                </div>
                <ul className={styles.readinessList}>
                  {publishReadiness.publication.checks.map((check) => {
                    const labels = i18n.language?.startsWith('en')
                      ? { title: 'Valid title', substance: 'Enough content' }
                      : { title: 'Geçerli başlık', substance: 'Yeterli içerik' };
                    return <li key={check.id} data-passed={check.passed}>{check.passed ? '✓' : '○'} {labels[check.id]}</li>;
                  })}
                </ul>
              </section>

              <section className={styles.readinessTrack}>
                <div className={styles.readinessHeader}>
                  <div><span>{i18n.language?.startsWith('en') ? 'Evidence claim' : 'Kanıt iddiası'}</span></div>
                  <span className={publishReadiness.evidence.ready ? styles.readyBadge : styles.neutralBadge}>
                    {publishReadiness.evidence.ready
                      ? (i18n.language?.startsWith('en') ? 'Author tested' : 'Yazar test etti')
                      : (i18n.language?.startsWith('en') ? 'Unverified' : 'Doğrulanmamış')}
                  </span>
                </div>
                <ul className={styles.readinessList}>
                  {publishReadiness.evidence.checks.map((check) => {
                    const labels = i18n.language?.startsWith('en')
                      ? { testedAt: 'Test date', environment: 'Test environment', verification: 'Verification steps' }
                      : { testedAt: 'Test tarihi', environment: 'Test ortamı', verification: 'Doğrulama adımları' };
                    return <li key={check.id} data-passed={check.passed}>{check.passed ? '✓' : '○'} {labels[check.id]}</li>;
                  })}
                </ul>
                <p className={styles.readinessHint}>{publishReadiness.evidence.ready
                  ? (i18n.language?.startsWith('en') ? 'This will publish as an author-tested claim; it is not independent Postify execution.' : 'Bu içerik “Yazar test etti” olarak yayınlanır; bağımsız Postify çalıştırması değildir.')
                  : (i18n.language?.startsWith('en') ? 'You can still publish. It will stay Unverified until all three evidence fields are present.' : 'Yine de yayınlayabilirsin. Üç kanıt alanı da dolana kadar Unverified kalır.')}</p>
              </section>
            </div>

            <section className={styles.qualityTrack}>
              <span>{i18n.language?.startsWith('en') ? 'Recommended quality signals' : 'Önerilen kalite sinyalleri'}</span>
              <ul className={styles.readinessList}>
                {publishReadiness.quality.checks.map((check) => {
                  const labels = i18n.language?.startsWith('en')
                    ? { outcome: 'Concrete outcome', structure: 'Scannable structure', provenance: 'Source or caveat' }
                    : { outcome: 'Somut sonuç', structure: 'Taranabilir yapı', provenance: 'Kaynak veya sınır' };
                  return <li key={check.id} data-passed={check.passed}>{check.passed ? '✓' : '○'} {labels[check.id]}</li>;
                })}
              </ul>
            </section>
          </aside>

          {errors.backend && <p className={styles.backendNotice} role="status">{errors.backend}</p>}

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
              disabled={createPost.isPending || updatePost.isPending || !knowledgeBackendReady}
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
          {!knowledgeBackendReady && <p id="verified-publish-status" className={styles.backendStatus}>{i18n.language?.startsWith('en') ? 'Drafting and autosave work now; publishing with persisted evidence activates after the production schema migration.' : 'Taslak ve otomatik kayıt çalışıyor; kalıcı kanıtla yayınlama production şema migration’ından sonra açılacak.'}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
