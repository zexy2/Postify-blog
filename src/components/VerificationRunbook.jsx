import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiRotateCcw } from 'react-icons/fi';
import { clearRunbookProgress, getRunbookProgress, setRunbookProgress } from '../lib/localKnowledgeState';
import styles from './VerificationRunbook.module.css';

export default function VerificationRunbook({ post }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const steps = useMemo(() => (Array.isArray(post?.evidence?.verificationSteps) ? post.evidence.verificationSteps.filter(Boolean) : []), [post?.evidence?.verificationSteps]);
  const version = Math.max(1, Number(post?.evidence?.version) || 1);
  const storage = typeof window === 'undefined' ? null : window.localStorage;
  const [progress, setProgress] = useState(() => storage
    ? getRunbookProgress(storage, post.id, version)
    : { version, completed: [], updatedAt: null });

  if (steps.length === 0) return null;

  const completed = progress.completed.filter((index) => index < steps.length);
  const completeCount = completed.length;
  const isComplete = completeCount === steps.length;
  const percent = Math.round((completeCount / steps.length) * 100);

  const toggle = (index) => {
    if (!storage) return;
    const next = completed.includes(index)
      ? completed.filter((item) => item !== index)
      : [...completed, index];
    setProgress(setRunbookProgress(storage, post.id, version, next));
  };

  const reset = () => {
    if (!storage) return;
    clearRunbookProgress(storage, post.id);
    setProgress({ version, completed: [], updatedAt: null });
  };

  return (
    <section className={styles.runbook} aria-labelledby="verification-runbook-title">
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>{en ? 'Action runbook' : 'Uygulama turu'}</span>
          <h2 id="verification-runbook-title">{en ? 'Do the checks, not just the reading' : 'Sadece okuma, kontrolleri uygula'}</h2>
          <p>{en ? 'Work through the author’s verification steps and keep your progress on this device.' : 'Yazarın doğrulama adımlarını uygula; ilerlemen bu cihazda saklansın.'}</p>
        </div>
        <div className={styles.progressLabel} aria-label={en ? `${completeCount} of ${steps.length} steps complete` : `${steps.length} adımın ${completeCount} tanesi tamamlandı`}>
          <strong>{completeCount}/{steps.length}</strong>
          <span>{percent}%</span>
        </div>
      </div>

      <div className={styles.progressTrack} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}>
        <span style={{ width: `${percent}%` }} />
      </div>

      <ol className={styles.steps}>
        {steps.map((step, index) => {
          const checked = completed.includes(index);
          return (
            <li key={`${index}-${step}`} data-complete={checked}>
              <label>
                <input type="checkbox" checked={checked} onChange={() => toggle(index)} />
                <span className={styles.checkIcon} aria-hidden="true"><FiCheck /></span>
                <span>{step}</span>
              </label>
            </li>
          );
        })}
      </ol>

      <div className={styles.footer}>
        <small>{en
          ? `Progress is local to this device and evidence v${version}. Completing it is not a Postify verification.`
          : `İlerleme yalnız bu cihazda ve kanıt v${version} için tutulur. Tamamlamak Postify doğrulaması değildir.`}</small>
        <div className={styles.actions}>
          {completeCount > 0 && <button type="button" onClick={reset}><FiRotateCcw />{en ? 'Reset' : 'Sıfırla'}</button>}
          {isComplete && <a href="#evidence-feedback">{en ? 'Report whether it worked' : 'Çalışıp çalışmadığını bildir'}</a>}
        </div>
      </div>
    </section>
  );
}
