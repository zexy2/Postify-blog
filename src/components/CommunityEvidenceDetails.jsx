import { useTranslation } from 'react-i18next';
import { useFailures, useRevisions } from '../hooks/useKnowledge';

export default function CommunityEvidenceDetails({ post }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const enabled = !post.isFallback;
  const failures = useFailures(post.id, { enabled }).data || [];
  const revisions = useRevisions(post.id, { enabled }).data || [];
  const failure = failures[0] || null;
  const failureCount = Number(failure?.failure_count) || 0;
  if (!enabled || (!failureCount && !revisions.length)) return null;

  return (
    <section className="community-evidence-details" aria-label={en ? 'Evidence history' : 'Kanıt geçmişi'}>
      {failureCount > 0 && (
        <div>
          <span>{en ? 'Known failures' : 'Bilinen başarısızlıklar'}</span>
          <h2>{en ? 'Real-world failure signal' : 'Gerçek kullanım hata sinyali'}</h2>
          <p>{en ? `${failureCount} reader${failureCount === 1 ? '' : 's'} reported that this did not work.` : `${failureCount} okuyucu bu bilginin kendisinde çalışmadığını bildirdi.`}</p>
          {failure.last_failure_at && <time dateTime={failure.last_failure_at}>{en ? 'Last report: ' : 'Son bildirim: '}{new Intl.DateTimeFormat(en ? 'en-US' : 'tr-TR', { dateStyle: 'medium' }).format(new Date(failure.last_failure_at))}</time>}
          <small>{en ? 'Postify does not publish the contributor identity, raw note, or environment string.' : 'Postify katkı sahibinin kimliğini, ham notunu veya ortam bilgisini herkese açmaz.'}</small>
        </div>
      )}
      {revisions.length > 0 && (
        <div>
          <span>{en ? 'Revision history' : 'Revizyon geçmişi'}</span>
          <h2>{en ? 'What changed?' : 'Ne değişti?'}</h2>
          <ol>{revisions.slice(0, 8).map((revision) => <li key={revision.id}>
            <strong>v{revision.revision_number}</strong>
            <span>{revision.reason || (en ? 'Evidence/content revision' : 'Kanıt/içerik revizyonu')}</span>
            <time dateTime={revision.created_at}>{new Intl.DateTimeFormat(en ? 'en-US' : 'tr-TR', { dateStyle: 'medium' }).format(new Date(revision.created_at))}</time>
          </li>)}</ol>
          <small>{en ? 'Public history excludes revision snapshots; only the author-provided change reason and timestamp are exposed.' : 'Herkese açık geçmiş revision snapshot içermez; yalnız yazarın değişiklik nedeni ve tarihi görünür.'}</small>
        </div>
      )}
    </section>
  );
}
