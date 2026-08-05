/**
 * Share Buttons Component
 * 
 * Social media share buttons with copy link
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TwitterShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  RedditShareButton,
  TwitterIcon,
  FacebookIcon,
  LinkedinIcon,
  WhatsappIcon,
  TelegramIcon,
  RedditIcon,
} from 'react-share';
import { FaLink, FaCheck, FaShare } from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './ShareButtons.module.css';

const ShareButtons = ({ url, title, description, compact = false }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(!compact);

  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const iconSize = compact ? 32 : 40;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t('share.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('share.copyError'));
    }
  };

  if (compact && !isOpen) {
    return (
      <button
        className={styles.compactButton}
        onClick={() => setIsOpen(true)}
        aria-label={t('share.title')}
      >
        <FaShare />
      </button>
    );
  }

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
      {!compact && <h4 className={styles.title}>{t('share.title')}</h4>}

      <div className={styles.buttons}>
        <TwitterShareButton url={shareUrl} title={shareTitle} className={styles.button}>
          <TwitterIcon size={iconSize} round />
        </TwitterShareButton>

        <FacebookShareButton url={shareUrl} quote={shareTitle} className={styles.button}>
          <FacebookIcon size={iconSize} round />
        </FacebookShareButton>

        <LinkedinShareButton
          url={shareUrl}
          title={shareTitle}
          summary={description}
          className={styles.button}
        >
          <LinkedinIcon size={iconSize} round />
        </LinkedinShareButton>

        <WhatsappShareButton url={shareUrl} title={shareTitle} className={styles.button}>
          <WhatsappIcon size={iconSize} round />
        </WhatsappShareButton>

        <TelegramShareButton url={shareUrl} title={shareTitle} className={styles.button}>
          <TelegramIcon size={iconSize} round />
        </TelegramShareButton>

        <RedditShareButton url={shareUrl} title={shareTitle} className={styles.button}>
          <RedditIcon size={iconSize} round />
        </RedditShareButton>

        <button
          className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
          onClick={handleCopyLink}
          style={{ width: iconSize, height: iconSize }}
        >
          {copied ? <FaCheck /> : <FaLink />}
        </button>
      </div>

      {compact && (
        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
          ×
        </button>
      )}
    </div>
  );
};

export default ShareButtons;
