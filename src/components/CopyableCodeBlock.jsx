import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiCopy } from 'react-icons/fi';
import styles from './CopyableCodeBlock.module.css';

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Clipboard permission can be denied even on HTTPS. Fall through to the
      // user-gesture based legacy path instead of turning Copy into a dead end.
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  textarea.remove();
  if (!ok) throw new Error('copy failed');
}

export default function CopyableCodeBlock({ code, language = '' }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const [state, setState] = useState('idle');

  useEffect(() => {
    if (state !== 'copied') return undefined;
    const timer = window.setTimeout(() => setState('idle'), 1800);
    return () => window.clearTimeout(timer);
  }, [state]);

  const handleCopy = async () => {
    try {
      await copyText(code);
      setState('copied');
    } catch {
      setState('failed');
    }
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.toolbar}>
        <span>{language || (en ? 'code' : 'kod')}</span>
        <button type="button" onClick={handleCopy} aria-live="polite">
          {state === 'copied' ? <FiCheck /> : <FiCopy />}
          {state === 'copied'
            ? (en ? 'Copied' : 'Kopyalandı')
            : state === 'failed'
              ? (en ? 'Copy failed' : 'Kopyalanamadı')
              : (en ? 'Copy' : 'Kopyala')}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}
