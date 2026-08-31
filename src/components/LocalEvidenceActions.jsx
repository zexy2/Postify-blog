import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  getLocalFeedback,
  getShelfState,
  setLocalFeedback,
  setShelfState,
} from '../lib/localKnowledgeState';
import {
  useEvidenceSummary,
  useMyConfirmation,
  useSetConfirmation,
  useSetShelf,
  useShelf,
  useKnowledgeBackendStatus,
} from '../hooks/useKnowledge';
import { summarizeCommunityEvidence } from '../lib/communityEvidence';

export default function LocalEvidenceActions({ post }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const { isAuthenticated } = useSelector((state) => state.user);
  const backendStatus = useKnowledgeBackendStatus();
  const backendReady = backendStatus.data?.ready === true;
  const persistent = isAuthenticated && !post.isFallback && backendReady;
  const storage = typeof window === 'undefined' ? null : window.localStorage;
  const [localFeedback, setLocalFeedbackState] = useState(() => storage ? getLocalFeedback(storage, post.id) : null);
  const [localShelf, setLocalShelfState] = useState(() => storage ? getShelfState(storage, post.id) : null);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('status');
  const [draftResult, setDraftResult] = useState(null);
  const [environmentDraft, setEnvironmentDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');

  const summaryQuery = useEvidenceSummary(post.id, { enabled: !post.isFallback });
  const mineQuery = useMyConfirmation(post.id, { enabled: persistent });
  const confirmationMutation = useSetConfirmation(post.id);
  const shelfQuery = useShelf({ enabled: persistent });
  const shelfMutation = useSetShelf();
  const summary = useMemo(() => summarizeCommunityEvidence(summaryQuery.data), [summaryQuery.data]);
  const remoteShelf = shelfQuery.data?.find((item) => item.post_id === post.id)?.state || null;
  const feedback = persistent ? mineQuery.data : localFeedback;
  const shelf = persistent ? remoteShelf : localShelf;

  const beginRecord = (result) => {
    setDraftResult(result);
    setEnvironmentDraft(feedback?.environment || '');
    setNoteDraft(result === 'failed' ? (feedback?.note || '') : '');
    setMessage('');
  };

  const cancelRecord = () => {
    setDraftResult(null);
    setEnvironmentDraft('');
    setNoteDraft('');
  };

  const record = async (event) => {
    event.preventDefault();
    if (!draftResult) return;
    const result = draftResult;
    const environment = environmentDraft.trim();
    const note = result === 'failed' ? noteDraft.trim() : '';
    setMessage('');
    try {
      if (persistent) await confirmationMutation.mutateAsync({ result, environment, note });
      else setLocalFeedbackState(setLocalFeedback(storage, post.id, { result, environment, note }));
      setMessageTone('status');
      setMessage(en ? 'Evidence saved.' : 'Kanıt kaydedildi.');
      cancelRecord();
    } catch (error) {
      setMessageTone('error');
      setMessage(error.message || (en ? 'Could not save evidence.' : 'Kanıt kaydedilemedi.'));
    }
  };

  const changeShelf = async (state) => {
    const next = shelf === state ? null : state;
    setMessage('');
    try {
      if (persistent) await shelfMutation.mutateAsync({ postId: post.id, state: next });
      else setLocalShelfState(setShelfState(storage, post.id, next));
    } catch (error) {
      setMessageTone('error');
      setMessage(error.message || (en ? 'Could not update your shelf.' : 'Kişisel liste güncellenemedi.'));
    }
  };

  return (
    <section id="evidence-feedback" className="local-evidence-actions" aria-label={en ? 'Community and personal evidence' : 'Topluluk ve kişisel kanıt'}>
      <div className="local-evidence-actions__summary">
        <div>
          <span>{en ? 'Does this work in the real world?' : 'Gerçek ortamda çalışıyor mu?'}</span>
          {!post.isFallback && summary.total > 0 ? (
            <small>
              {summary.canShowRate
                ? (en ? `${summary.successRate}% success from ${summary.total} confirmations` : `${summary.total} doğrulamada %${summary.successRate} başarı`)
                : (en ? `${summary.total} confirmation${summary.total === 1 ? '' : 's'} — too little data for a percentage` : `${summary.total} doğrulama — yüzde göstermek için henüz az veri`)}
              {summary.environments > 0 ? (en ? ` · ${summary.environments} environments` : ` · ${summary.environments} ortam`) : ''}
            </small>
          ) : (
            <small>{en ? 'No independent community evidence yet.' : 'Henüz bağımsız topluluk kanıtı yok.'}</small>
          )}
        </div>
        {!persistent && <small>{isAuthenticated && !backendReady
          ? (en ? 'Account sync is waiting for the Verified Knowledge backend upgrade. Your feedback stays on this device meanwhile.' : 'Hesap senkronu Verified Knowledge backend yükseltmesini bekliyor. Bu sırada geri bildirimin bu cihazda kalır.')
          : (en ? 'Sign in to contribute to community evidence. Anonymous feedback stays only on this device.' : 'Topluluk kanıtına katkı için giriş yap. Girişsiz geri bildirim yalnız bu cihazda kalır.')}</small>}
      </div>
      <div className="local-evidence-actions__buttons">
        <button
          type="button"
          data-active={feedback?.result === 'worked'}
          aria-pressed={feedback?.result === 'worked'}
          aria-expanded={draftResult === 'worked'}
          aria-controls={draftResult ? 'evidence-context-form' : undefined}
          disabled={confirmationMutation.isPending}
          onClick={() => beginRecord('worked')}
        >
          {en ? 'Worked' : 'Çalıştı'}
        </button>
        <button
          type="button"
          data-active={feedback?.result === 'failed'}
          aria-pressed={feedback?.result === 'failed'}
          aria-expanded={draftResult === 'failed'}
          aria-controls={draftResult ? 'evidence-context-form' : undefined}
          disabled={confirmationMutation.isPending}
          onClick={() => beginRecord('failed')}
        >
          {en ? "Didn't work" : 'Çalışmadı'}
        </button>
      </div>
      {draftResult && (
        <form id="evidence-context-form" className="local-evidence-actions__context-form" onSubmit={record}>
          <div className="local-evidence-actions__context-heading">
            <strong>{draftResult === 'worked'
              ? (en ? 'Add the context that worked' : 'Çalışan ortamı ekle')
              : (en ? 'Add failure context' : 'Çalışmayan ortamı ekle')}</strong>
            <small>{en ? 'Context makes this signal more useful to the next reader.' : 'Bağlam, bu sinyali sonraki okuyucu için daha faydalı yapar.'}</small>
          </div>
          <label htmlFor="evidence-environment">
            <span>{en ? 'Environment / version (optional)' : 'Ortam / sürüm (isteğe bağlı)'}</span>
            <input
              id="evidence-environment"
              value={environmentDraft}
              onChange={(event) => setEnvironmentDraft(event.target.value)}
              placeholder={en ? 'Node.js 22 · macOS 15' : 'Node.js 22 · macOS 15'}
              autoComplete="off"
            />
          </label>
          {draftResult === 'failed' && (
            <label htmlFor="evidence-note">
              <span>{en ? 'What failed? (optional)' : 'Ne çalışmadı? (isteğe bağlı)'}</span>
              <textarea
                id="evidence-note"
                rows="3"
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder={en ? 'Short symptom or error detail' : 'Kısa belirti veya hata detayı'}
              />
            </label>
          )}
          <div className="local-evidence-actions__form-actions">
            <button type="submit" data-action="save" disabled={confirmationMutation.isPending}>
              {confirmationMutation.isPending ? (en ? 'Saving…' : 'Kaydediliyor…') : (en ? 'Save evidence' : 'Kanıtı kaydet')}
            </button>
            <button type="button" onClick={cancelRecord} disabled={confirmationMutation.isPending}>
              {en ? 'Cancel' : 'İptal'}
            </button>
          </div>
        </form>
      )}
      {feedback?.environment && <p>{en ? 'Your environment' : 'Senin ortamın'}: {feedback.environment}</p>}
      <div className="local-evidence-actions__shelf">
        <span>{en ? 'Keep it as' : 'Nasıl saklansın?'}</span>
        {[['try', en ? 'Try later' : 'Sonra dene'], ['using', en ? 'Using' : 'Kullanıyorum'], ['reference', en ? 'Reference' : 'Referans']].map(([id, label]) => (
          <button type="button" key={id} data-active={shelf === id} aria-pressed={shelf === id} disabled={shelfMutation.isPending} onClick={() => changeShelf(id)}>{label}</button>
        ))}
      </div>
      {message && <p role={messageTone === 'error' ? 'alert' : 'status'}>{message}</p>}
    </section>
  );
}
