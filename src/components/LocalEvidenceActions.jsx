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
} from '../hooks/useKnowledge';
import { summarizeCommunityEvidence } from '../lib/communityEvidence';

export default function LocalEvidenceActions({ post }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const { isAuthenticated } = useSelector((state) => state.user);
  const persistent = isAuthenticated && !post.isFallback;
  const storage = typeof window === 'undefined' ? null : window.localStorage;
  const [localFeedback, setLocalFeedbackState] = useState(() => storage ? getLocalFeedback(storage, post.id) : null);
  const [localShelf, setLocalShelfState] = useState(() => storage ? getShelfState(storage, post.id) : null);
  const [message, setMessage] = useState('');

  const summaryQuery = useEvidenceSummary(post.id, { enabled: !post.isFallback });
  const mineQuery = useMyConfirmation(post.id, { enabled: persistent });
  const confirmationMutation = useSetConfirmation(post.id);
  const shelfQuery = useShelf({ enabled: persistent });
  const shelfMutation = useSetShelf();
  const summary = useMemo(() => summarizeCommunityEvidence(summaryQuery.data), [summaryQuery.data]);
  const remoteShelf = shelfQuery.data?.find((item) => item.post_id === post.id)?.state || null;
  const feedback = persistent ? mineQuery.data : localFeedback;
  const shelf = persistent ? remoteShelf : localShelf;

  const record = async (result) => {
    const environment = window.prompt(en ? 'What environment/version did you use?' : 'Hangi ortam/sürümde denedin?', feedback?.environment || '') || '';
    const note = result === 'failed'
      ? (window.prompt(en ? 'What failed? Optional, but useful.' : 'Ne çalışmadı? İsteğe bağlı ama faydalı.', feedback?.note || '') || '')
      : '';
    setMessage('');
    try {
      if (persistent) await confirmationMutation.mutateAsync({ result, environment, note });
      else setLocalFeedbackState(setLocalFeedback(storage, post.id, { result, environment, note }));
      setMessage(en ? 'Evidence saved.' : 'Kanıt kaydedildi.');
    } catch (error) {
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
      setMessage(error.message || (en ? 'Could not update your shelf.' : 'Kişisel liste güncellenemedi.'));
    }
  };

  return (
    <section className="local-evidence-actions" aria-label={en ? 'Community and personal evidence' : 'Topluluk ve kişisel kanıt'}>
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
        {!persistent && <small>{en ? 'Sign in to contribute to community evidence. Anonymous feedback stays only on this device.' : 'Topluluk kanıtına katkı için giriş yap. Girişsiz geri bildirim yalnız bu cihazda kalır.'}</small>}
      </div>
      <div className="local-evidence-actions__buttons">
        <button type="button" data-active={feedback?.result === 'worked'} disabled={confirmationMutation.isPending} onClick={() => record('worked')}>{en ? 'Worked' : 'Çalıştı'}</button>
        <button type="button" data-active={feedback?.result === 'failed'} disabled={confirmationMutation.isPending} onClick={() => record('failed')}>{en ? "Didn't work" : 'Çalışmadı'}</button>
      </div>
      {feedback?.environment && <p>{en ? 'Your environment' : 'Senin ortamın'}: {feedback.environment}</p>}
      <div className="local-evidence-actions__shelf">
        <span>{en ? 'Keep it as' : 'Nasıl saklansın?'}</span>
        {[['try', en ? 'Try later' : 'Sonra dene'], ['using', en ? 'Using' : 'Kullanıyorum'], ['reference', en ? 'Reference' : 'Referans']].map(([id, label]) => (
          <button type="button" key={id} data-active={shelf === id} disabled={shelfMutation.isPending} onClick={() => changeShelf(id)}>{label}</button>
        ))}
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
