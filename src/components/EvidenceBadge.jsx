import { useTranslation } from 'react-i18next';
import { getEvidenceCopy } from '../lib/knowledgeEvidence';
import { useAutoVerification } from '../hooks/useAutoVerification';

export default function EvidenceBadge({ post, compact = false }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const evidence = getEvidenceCopy(post, i18n.language);
  const { run: auto, state } = useAutoVerification(post.autoVerificationId);
  const postifyVerified = state.status === 'verified';
  const recheckRequired = state.status === 'recheck-required';
  const freshnessUnknown = state.status === 'freshness-unknown' && auto?.status === 'passed';
  const environment = evidence.environment.slice(0, compact ? 1 : 3).join(' · ');
  const level = postifyVerified ? 'postify-verified' : recheckRequired ? 'recheck-required' : evidence.level;
  const title = recheckRequired
    ? (en ? 'Runtime advanced; re-check required' : 'Runtime ilerledi; yeniden kontrol gerekli')
    : freshnessUnknown ? (en ? 'Runtime freshness unknown' : 'Runtime güncelliği bilinmiyor') : environment || evidence.levelLabel;
  const label = postifyVerified ? 'Postify verified'
    : recheckRequired ? (en ? 'Postify re-check required' : 'Postify yeniden kontrol etmeli')
      : freshnessUnknown ? (en ? 'Verification freshness unknown' : 'Doğrulama güncelliği bilinmiyor') : evidence.levelLabel;
  return (
    <span className="evidence-badge" data-level={level} data-freshness={postifyVerified ? 'current' : recheckRequired ? 'stale' : freshnessUnknown ? 'unknown' : evidence.freshness} title={title}>
      <strong>{label}</strong>
      {auto?.status === 'passed' && <span> · {auto.runtime} {auto.runtimeVersion}</span>}
      {!postifyVerified && !recheckRequired && !freshnessUnknown && evidence.freshness !== 'unknown' && <span> · {evidence.freshnessLabel}</span>}
      {!compact && environment && <span> · {environment}</span>}
    </span>
  );
}
