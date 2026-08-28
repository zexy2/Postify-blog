import { useTranslation } from 'react-i18next';
import { getEvidenceCopy } from '../lib/knowledgeEvidence';

export default function KnowledgeEvidencePanel({ post }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const evidence = getEvidenceCopy(post, i18n.language);
  return (
    <section className="knowledge-evidence" aria-labelledby="knowledge-evidence-title">
      <div className="knowledge-evidence__header">
        <div><span>{en ? 'Evidence' : 'Kanıt durumu'}</span><h2 id="knowledge-evidence-title">{evidence.levelLabel}</h2></div>
        <strong data-freshness={evidence.freshness}>{evidence.freshnessLabel}</strong>
      </div>
      {evidence.testedAt && <p>{en ? 'Last tested' : 'Son test'}: <time dateTime={evidence.testedAt}>{new Intl.DateTimeFormat(en ? 'en-US' : 'tr-TR', { dateStyle:'medium' }).format(new Date(evidence.testedAt))}</time></p>}
      {evidence.environment.length > 0 && <div><h3>{en ? 'Test environment' : 'Test ortamı'}</h3><ul>{evidence.environment.map(x=><li key={x}>{x}</li>)}</ul></div>}
      {evidence.prerequisites.length > 0 && <div><h3>{en ? 'Before you start' : 'Başlamadan önce'}</h3><ul>{evidence.prerequisites.map(x=><li key={x}>{x}</li>)}</ul></div>}
      {evidence.verificationSteps.length > 0 && <div><h3>{en ? 'How to verify' : 'Nasıl doğrulanır?'}</h3><ol>{evidence.verificationSteps.map(x=><li key={x}>{x}</li>)}</ol></div>}
      {evidence.caveats.length > 0 && <div><h3>{en ? 'Known caveats' : 'Bilinen sınırlar'}</h3><ul>{evidence.caveats.map(x=><li key={x}>{x}</li>)}</ul></div>}
      <small>{en ? '“Author tested” is an author claim, not an independent Postify execution.' : '“Yazar test etti” yazar beyanıdır; Postify tarafından bağımsız çalıştırıldığı anlamına gelmez.'}</small>
    </section>
  );
}
