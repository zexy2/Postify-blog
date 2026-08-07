import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './CopyLinkButton.module.css';

const CopyLinkButton = ({ url }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      toast.success(t('share.copied'));
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error(t('share.copyError'));
    }
  };

  return (
    <button type="button" className={`${styles.button} ${copied ? styles.copied : ''}`} onClick={copyLink}>
      {copied ? <FiCheck size={15} /> : <FiLink size={15} />}
      <span>{copied ? t('common.linkCopied') : t('common.copyLink')}</span>
    </button>
  );
};

export default CopyLinkButton;
