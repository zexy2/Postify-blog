import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiAlertTriangle,
  FiArrowUpRight,
  FiCheckCircle,
  FiEdit3,
  FiRefreshCw,
} from 'react-icons/fi';
import { useAuthorDashboard, useKnowledgeBackendStatus, useReverifyPost } from '../../hooks/useKnowledge';
import { getKnowledgeEvidence } from '../../lib/knowledgeEvidence';
import { hasMeaningfulEvidenceEntry } from '../../lib/publishReadiness';
import { summarizeCommunityEvidence } from '../../lib/communityEvidence';
import { getDomainCredibility } from '../../lib/domainCredibility';
import { getCategoryLabel } from '../../lib/categoryLabels';
import styles from './KnowledgeDashboardPage.module.css';
import AuthorFailurePanel from './AuthorFailurePanel';

const asPost = (row) => ({
  evidence: {
    level: row.evidence_status,
    testedAt: row.tested_at,
    staleAfterDays: row.stale_after_days,
    environment: row.environment || [],
    verificationSteps: row.verification_steps || [],
  },
});

const getFreshnessLabel = (freshness, en) => {
  const labels = en
    ? { current: 'Current', aging: 'Re-check soon', stale: 'Needs re-verification', unknown: 'Freshness unknown' }
    : { current: 'Güncel', aging: 'Yakında kontrol et', stale: 'Yeniden doğrula', unknown: 'Güncellik bilinmiyor' };
  return labels[freshness] || labels.unknown;
};

export default function KnowledgeDashboardPage({ dataOverride = null, backendReadyOverride = null, reverifyOverride = null }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const backend = useKnowledgeBackendStatus();
  const dashboard = useAuthorDashboard({ enabled: dataOverride === null });
  const reverify = useReverifyPost();
  const reverifyAction = reverifyOverride || reverify;
  const data = dataOverride || dashboard.data || { posts: [], gaps: [] };
  const backendReady = backendReadyOverride ?? backend.data?.ready;
  const credibility = getDomainCredibility(data.posts);
  const enrichedPosts = data.posts.map((post) => ({
    post,
    evidence: getKnowledgeEvidence(asPost(post)),
    summary: summarizeCommunityEvidence(post.summary || {}),
  }));
  const currentCount = enrichedPosts.filter(({ evidence }) => evidence.freshness === 'current').length;
  const attentionCount = enrichedPosts.filter(({ evidence }) => evidence.freshness !== 'current').length;
  const authorTestedCount = data.posts.filter((post) => post.evidence_status === 'author-tested').length;
  const confirmationCount = enrichedPosts.reduce((total, item) => total + item.summary.total, 0);
  const topGap = data.gaps[0] || null;

  if ((backendReadyOverride === null && backend.isLoading) || (dataOverride === null && dashboard.isLoading)) {
    return <div className={`container ${styles.status}`}>{en ? 'Loading knowledge health…' : 'Bilgi sağlığı yükleniyor…'}</div>;
  }

  if (backendReady !== true) {
    return (
      <div className={`container ${styles.page}`}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Verified Knowledge backend</span>
          <h1>{en ? 'Account sync is not active yet.' : 'Hesap senkronu henüz aktif değil.'}</h1>
          <p>{en
            ? 'The product remains usable with local evidence while the production database upgrade is pending. This dashboard will activate automatically after migration.'
            : 'Production veritabanı yükseltmesi beklerken ürün yerel kanıtla kullanılmaya devam eder. Migration sonrası bu panel otomatik olarak aktif olacak.'}</p>
        </header>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>{en ? 'Knowledge health console' : 'Bilgi sağlık konsolu'}</span>
        <div className={styles.headerGrid}>
          <div>
            <h1>{en ? 'Keep useful knowledge current.' : 'İşe yarayan bilgiyi güncel tut.'}</h1>
            <p>{en
              ? 'See what is current, what needs another pass, where community evidence is accumulating, and what readers still cannot find.'
              : 'Neyin güncel olduğunu, neyin tekrar kontrol istediğini, topluluk kanıtının nerede biriktiğini ve okuyucuların hâlâ neyi bulamadığını tek yerde gör.'}</p>
          </div>
          {topGap && (
            <aside className={styles.demandSignal} aria-label={en ? 'Highest reader demand' : 'En yüksek okuyucu talebi'}>
              <span>{en ? 'Highest reader demand' : 'En yüksek okuyucu talebi'}</span>
              <strong>{topGap.display_query}</strong>
              <small>{topGap.request_count} {en ? 'requests' : 'talep'}</small>
            </aside>
          )}
        </div>
      </header>

      <section className={styles.healthStrip} aria-label={en ? 'Knowledge health summary' : 'Bilgi sağlığı özeti'}>
        <div>
          <span>{en ? 'Authored knowledge' : 'Yazdığın bilgi'}</span>
          <strong>{data.posts.length}</strong>
          <small>{en ? 'published + draft records' : 'yayın + taslak kayıt'}</small>
        </div>
        <div data-tone={attentionCount ? 'attention' : 'calm'}>
          <span>{en ? 'Needs attention' : 'İlgi istiyor'}</span>
          <strong>{attentionCount}</strong>
          <small>{currentCount} {en ? 'currently fresh' : 'şu an güncel'}</small>
        </div>
        <div>
          <span>{en ? 'Author-tested' : 'Yazar test etti'}</span>
          <strong>{authorTestedCount}</strong>
          <small>{en ? 'evidence-backed claims' : 'kanıt destekli iddia'}</small>
        </div>
        <div>
          <span>{en ? 'Community signals' : 'Topluluk sinyali'}</span>
          <strong>{confirmationCount}</strong>
          <small>{en ? 'worked / failed confirmations' : 'çalıştı / çalışmadı doğrulaması'}</small>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <div>
            <span>{en ? 'Maintenance queue' : 'Bakım kuyruğu'}</span>
            <h2>{en ? 'Re-verification' : 'Yeniden doğrulama'}</h2>
          </div>
          <strong>{data.posts.length}</strong>
        </div>

        <div className={styles.queue}>
          {enrichedPosts.length === 0 ? (
            <p className={styles.empty}>{en ? 'No authored knowledge yet.' : 'Henüz yazdığın bilgi yok.'}</p>
          ) : enrichedPosts.map(({ post, evidence, summary }, index) => {
            const canReverify = hasMeaningfulEvidenceEntry(post.environment, 3)
              && hasMeaningfulEvidenceEntry(post.verification_steps, 12);
            const stateIcon = evidence.freshness === 'stale' || evidence.freshness === 'unknown'
              ? <FiAlertTriangle />
              : <FiCheckCircle />;

            return (
              <article key={post.id} data-freshness={evidence.freshness} className={styles.queueItem}>
                <span className={styles.queueIndex}>{String(index + 1).padStart(2, '0')}</span>
                <div className={styles.queueMain}>
                  <div className={styles.queueMeta}>
                    <span className={styles.state}>{stateIcon}{getFreshnessLabel(evidence.freshness, en)}</span>
                    <span>{post.category ? getCategoryLabel(post.category, i18n.language) : (en ? 'General' : 'Genel')}</span>
                    <span>{post.evidence_status === 'author-tested' ? (en ? 'Author tested' : 'Yazar test etti') : (en ? 'Unverified' : 'Doğrulanmamış')}</span>
                  </div>
                  <h3><Link to={`/posts/${post.slug || post.id}`}>{post.title}</Link></h3>
                  <div className={styles.queueFacts}>
                    <span>{post.environment?.join(' · ') || (en ? 'No test environment' : 'Test ortamı yok')}</span>
                    <span>{summary.total
                      ? `${summary.total} ${en ? 'community confirmations' : 'topluluk doğrulaması'}`
                      : (en ? 'No community confirmations' : 'Topluluk doğrulaması yok')}</span>
                  </div>
                  <AuthorFailurePanel postId={post.id} count={summary.failed} />
                </div>
                <div className={styles.actions}>
                  <Link to={`/posts/${post.id}/edit`}><FiEdit3 />{en ? 'Edit evidence' : 'Kanıtı düzenle'}</Link>
                  <button
                    type="button"
                    disabled={reverifyAction.isPending || !canReverify}
                    onClick={() => reverifyAction.mutate({ postId: post.id, reason: 'Author re-verified current environment and checks' })}
                  >
                    <FiRefreshCw />{en ? 'Re-verify' : 'Yeniden doğrula'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className={styles.lowerGrid}>
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <div>
              <span>{en ? 'Track record' : 'Geçmiş performans'}</span>
              <h2>{en ? 'Domain credibility' : 'Alan güvenilirliği'}</h2>
            </div>
          </div>
          <div className={styles.credibility}>
            {credibility.length === 0 ? <p className={styles.empty}>—</p> : credibility.map((item, index) => (
              <div key={item.domain} className={styles.credibilityRow}>
                <span className={styles.rowIndex}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{item.domain}</strong>
                  <small>{item.authorTested} {en ? 'tested posts' : 'test edilmiş içerik'} · {item.confirmations} {en ? 'confirmations' : 'doğrulama'}</small>
                </div>
                {item.score === null
                  ? <span className={styles.pendingScore}>{en ? 'Building evidence' : 'Kanıt birikiyor'}</span>
                  : <b>{item.score}<small>/100</small></b>}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <div>
              <span>{en ? 'Demand map' : 'Talep haritası'}</span>
              <h2>{en ? 'Knowledge gaps' : 'Bilgi boşlukları'}</h2>
            </div>
            <strong>{data.gaps.length}</strong>
          </div>
          <div className={styles.gaps}>
            {data.gaps.length === 0 ? <p className={styles.empty}>{en ? 'No recorded gaps yet.' : 'Henüz kayıtlı bilgi boşluğu yok.'}</p> : data.gaps.map((gap, index) => (
              <div key={gap.id} className={styles.gapRow}>
                <span className={styles.rowIndex}>{String(index + 1).padStart(2, '0')}</span>
                <strong>{gap.display_query}</strong>
                <span>{gap.request_count} {en ? 'requests' : 'talep'}</span>
                <FiArrowUpRight aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
