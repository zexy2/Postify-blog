import { useTranslation } from 'react-i18next';
import { getEvidenceCopy } from '../lib/knowledgeEvidence';
import { useAutoVerification } from '../hooks/useAutoVerification';

export default function KnowledgeEvidencePanel({ post }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const evidence = getEvidenceCopy(post, i18n.language);
  const auto = useAutoVerification(post.autoVerificationId).run;
  const postifyVerified = auto?.status === 'passed';
  return (
    <section className="knowledge-evidence" aria-labelledby="knowledge-evidence-title">
      <div className="knowledge-evidence__header">
        <div><span>{en ? 'Evidence' : 'Kanıt durumu'}</span><h2 id="knowledge-evidence-title">{postifyVerified ? 'Postify verified' : evidence.levelLabel}</h2></div>
        <strong data-freshness={postifyVerified ? 'current' : evidence.freshness}>{postifyVerified ? (en ? 'Execution passed' : 'Çalıştırma geçti') : evidence.freshnessLabel}</strong>
      </div>
      {postifyVerified && <div className="knowledge-evidence__execution"><h3>{en ? 'Automatic execution' : 'Otomatik çalıştırma'}</h3><p>{auto.runtime} {auto.runtimeVersion} · {en ? 'Expected output' : 'Beklenen çıktı'}: <code>{auto.expectedStdout}</code> · <time dateTime={auto.verifiedAt}>{new Intl.DateTimeFormat(en ? 'en-US' : 'tr-TR', { dateStyle:'medium', timeStyle:'short' }).format(new Date(auto.verifiedAt))}</time></p></div>}
      {evidence.testedAt && <p>{en ? 'Author last tested' : 'Yazarın son testi'}: <time dateTime={evidence.testedAt}>{new Intl.DateTimeFormat(en ? 'en-US' : 'tr-TR', { dateStyle:'medium' }).format(new Date(evidence.testedAt))}</time></p>}
      {evidence.environment.length > 0 && <div><h3>{en ? 'Test environment' : 'Test ortamı'}</h3><ul>{evidence.environment.map(x=><li key={x}>{x}</li>)}</ul></div>}
      {evidence.prerequisites.length > 0 && <div><h3>{en ? 'Before you start' : 'Başlamadan önce'}</h3><ul>{evidence.prerequisites.map(x=><li key={x}>{x}</li>)}</ul></div>}
      {evidence.verificationSteps.length > 0 && <div><h3>{en ? 'How to verify' : 'Nasıl doğrulanır?'}</h3><ol>{evidence.verificationSteps.map(x=><li key={x}>{x}</li>)}</ol></div>}
      {evidence.caveats.length > 0 && <div><h3>{en ? 'Known caveats' : 'Bilinen sınırlar'}</h3><ul>{evidence.caveats.map(x=><li key={x}>{x}</li>)}</ul></div>}
      {evidence.sources.length > 0 && <div><h3>{en ? 'Evidence sources' : 'Kanıt kaynakları'}</h3><ul>{evidence.sources.map((x)=><li key={x}><a href={x} target="_blank" rel="noopener noreferrer">{x}</a></li>)}</ul></div>}
      <small>{postifyVerified
        ? (en ? 'Postify Verified applies only to the displayed deterministic execution scope; it does not certify unrelated external systems.' : 'Postify Verified yalnız gösterilen deterministik çalıştırma kapsamı için geçerlidir; dış sistemleri genel olarak sertifikalandırmaz.')
        : (en ? '“Author tested” is an author claim, not an independent Postify execution.' : '“Yazar test etti” yazar beyanıdır; Postify tarafından bağımsız çalıştırıldığı anlamına gelmez.')}</small>
    </section>
  );
}
