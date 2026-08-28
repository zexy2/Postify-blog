import { useTranslation } from 'react-i18next';
import { getEvidenceCopy } from '../lib/knowledgeEvidence';
import { useAutoVerification } from '../hooks/useAutoVerification';

export default function EvidenceBadge({ post, compact = false }) {
  const { i18n } = useTranslation();
  const evidence = getEvidenceCopy(post, i18n.language);
  const auto = useAutoVerification(post.autoVerificationId).run;
  const postifyVerified = auto?.status === 'passed';
  const environment = evidence.environment.slice(0, compact ? 1 : 3).join(' · ');
  return (
    <span className="evidence-badge" data-level={postifyVerified ? 'postify-verified' : evidence.level} data-freshness={evidence.freshness} title={environment || evidence.levelLabel}>
      <strong>{postifyVerified ? 'Postify verified' : evidence.levelLabel}</strong>
      {postifyVerified && <span> · {auto.runtime} {auto.runtimeVersion}</span>}
      {!postifyVerified && evidence.freshness !== 'unknown' && <span> · {evidence.freshnessLabel}</span>}
      {!compact && environment && <span> · {environment}</span>}
    </span>
  );
}
