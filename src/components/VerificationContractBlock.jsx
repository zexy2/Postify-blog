import { useTranslation } from 'react-i18next';
import { getVerificationCheck, getVerificationCommand } from '../content/verificationManifest';
import { useAutoVerification } from '../hooks/useAutoVerification';
import CopyableCodeBlock from './CopyableCodeBlock';
import styles from './VerificationContractBlock.module.css';

export default function VerificationContractBlock({ post }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const check = getVerificationCheck(post?.autoVerificationId);
  const { run } = useAutoVerification(post?.autoVerificationId);
  if (!check) return null;

  const command = getVerificationCommand(check);
  const passed = run?.status === 'passed'
    && run.articleContractMatched === true
    && run.reproductionCommand === command
    && run.expectedStdout === check.expectedStdout;

  return (
    <section className={styles.contract} aria-labelledby="verification-contract-title">
      <div className={styles.header}>
        <div>
          <span>{en ? 'Reproducible contract' : 'Tekrarlanabilir sözleşme'}</span>
          <h2 id="verification-contract-title">{en ? 'Re-run what Postify verified' : 'Postify’ın doğruladığını yeniden çalıştır'}</h2>
          <p>{en
            ? 'Save the displayed checked-in code with this filename, run the same public command, and compare stdout.'
            : 'Yukarıda gösterilen checked-in kodu bu dosya adıyla kaydet, aynı açık komutu çalıştır ve stdout sonucunu karşılaştır.'}</p>
        </div>
        <dl className={styles.meta}>
          <div><dt>{en ? 'File' : 'Dosya'}</dt><dd><code>{check.entryFile}</code></dd></div>
          <div><dt>Runtime</dt><dd>Node.js {check.minimumRuntimeMajor}+</dd></div>
        </dl>
      </div>

      <div className={styles.command}>
        <h3>{en ? 'Run' : 'Çalıştır'}</h3>
        <CopyableCodeBlock code={command} language={en ? 'command' : 'komut'} />
      </div>

      <div className={styles.outputs}>
        <div>
          <h3>{en ? 'Expected stdout' : 'Beklenen stdout'}</h3>
          <pre><code>{check.expectedStdout}</code></pre>
        </div>
        <div data-status={passed ? 'passed' : 'pending'}>
          <h3>{en ? 'Release observed' : 'Release gözlemi'}</h3>
          {passed ? (
            <>
              <pre><code>{run.actualStdout}</code></pre>
              <small>{run.runtime} {run.runtimeVersion} · {run.executionMode}</small>
            </>
          ) : <p>{en ? 'No passed release observation is attached.' : 'Bağlı bir başarılı release gözlemi yok.'}</p>}
        </div>
      </div>

      <small className={styles.scope}>{en
        ? 'The Postify Verified claim covers this exact checked-in code hash, command contract and expected stdout—not unrelated systems.'
        : 'Postify Verified iddiası yalnız bu checked-in kod özeti, komut sözleşmesi ve beklenen stdout kapsamındadır; ilgisiz sistemleri kapsamaz.'}</small>
    </section>
  );
}
