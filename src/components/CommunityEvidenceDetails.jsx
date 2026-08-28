import { useTranslation } from 'react-i18next';
import { useFailures, useRevisions } from '../hooks/useKnowledge';

export default function CommunityEvidenceDetails({ post }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const enabled = !post.isFallback;
  const failures = useFailures(post.id, { enabled }).data || [];
  const revisions = useRevisions(post.id, { enabled }).data || [];
  if (!enabled || (!failures.length && !revisions.length)) return null;
  return (
    <section className="community-evidence-details" aria-label={en ? 'Evidence history' : 'Kanıt geçmişi'}>
      {failures.length > 0 && (
        <div>
          <span>{en ? 'Known failures' : 'Bilinen başarısızlıklar'}</span>
          <h2>{en ? 'Where readers reported problems' : 'Nerelerde sorun bildirildi?'}</h2>
          <ul>{failures.map((failure) => <li key={failure.id}><strong>{failure.environment || (en ? 'Environment not specified' : 'Ortam belirtilmedi')}</strong><p>{failure.note}</p><time dateTime={failure.updated_at}>{new Intl.DateTimeFormat(en ? 'en-US' : 'tr-TR', { dateStyle: 'medium' }).format(new Date(failure.updated_at))}</time></li>)}</ul>
        </div>
      )}
      {revisions.length > 0 && (
        <div>
          <span>{en ? 'Revision history' : 'Revizyon geçmişi'}</span>
          <h2>{en ? 'What changed?' : 'Ne değişti?'}</h2>
          <ol>{revisions.slice(0, 8).map((revision) => <li key={revision.id}><strong>v{revision.revision_number}</strong><span>{revision.reason || (en ? 'Evidence/content revision' : 'Kanıt/içerik revizyonu')}</span><time dateTime={revision.created_at}>{new Intl.DateTimeFormat(en ? 'en-US' : 'tr-TR', { dateStyle: 'medium' }).format(new Date(revision.created_at))}</time></li>)}</ol>
        </div>
      )}
    </section>
  );
}
