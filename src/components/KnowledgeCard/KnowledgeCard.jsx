import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiBookmark, FiClock } from 'react-icons/fi';
import ContentImage from '../ContentImage/ContentImage';
import EvidenceBadge from '../EvidenceBadge';
import { summarizeCommunityEvidence } from '../../lib/communityEvidence';
import { getEvidenceCopy } from '../../lib/knowledgeEvidence';
import { getPostPresentation, getPostReadingMinutes } from '../../lib/postPresentation';
import { getCategoryLabel } from '../../lib/categoryLabels';
import styles from './KnowledgeCard.module.css';

const VARIANTS = new Set(['featured', 'standard', 'compact']);

const KnowledgeCard = ({
  post,
  variant = 'standard',
  ordinal,
  priorityLabel,
  onBookmarkToggle,
  isBookmarked = false,
}) => {
  const { t, i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const safeVariant = VARIANTS.has(variant) ? variant : 'standard';
  const presentation = getPostPresentation(post, i18n.language);
  const evidence = getEvidenceCopy(post, i18n.language);
  const community = summarizeCommunityEvidence(post.evidenceSummary || {});
  const readingMinutes = getPostReadingMinutes(post);
  const href = `/posts/${post.slug || post.id}`;
  const environment = evidence.environment[0] || '';
  const communityLabel = community.total > 0
    ? community.canShowRate
      ? `${community.successRate}% ${en ? 'worked' : 'çalıştı'}`
      : `${community.total} ${en ? 'confirmations' : 'doğrulama'}`
    : '';

  const factItems = [
    readingMinutes !== null && {
      label: en ? 'Read' : 'Okuma',
      value: `${readingMinutes} ${t('common.minutes')}`,
      icon: <FiClock size={12} aria-hidden="true" />,
    },
    environment && {
      label: en ? 'Context' : 'Bağlam',
      value: environment,
    },
    communityLabel && {
      label: en ? 'Community' : 'Topluluk',
      value: communityLabel,
    },
  ].filter(Boolean);

  return (
    <article className={`${styles.card} ${styles[safeVariant]}`} data-card-variant={safeVariant} data-scroll-anchor-key={href}>
      <div className={styles.ordinal} aria-hidden="true">{ordinal}</div>

      <div className={styles.content}>
        {priorityLabel && <div className={styles.priority}>{priorityLabel}</div>}

        <div className={styles.meta}>
          <span className={styles.type}>{presentation.typeLabel}</span>
          {post.category && <span className={styles.category}>{getCategoryLabel(post.category, i18n.language)}</span>}
          {presentation.formattedDate && <span className={styles.date}>{presentation.formattedDate}</span>}
        </div>

        <Link to={href} className={styles.titleLink}>
          {safeVariant === 'featured'
            ? <h3 className={styles.title}>{post.title}</h3>
            : <h4 className={styles.title}>{post.title}</h4>}
        </Link>

        {safeVariant !== 'compact' && presentation.outcome && (
          <p className={styles.outcome}>
            <span>{en ? 'Outcome' : 'Sonuç'}</span>
            {presentation.outcome}
          </p>
        )}

        <div className={styles.trustStrip}>
          <div className={styles.evidenceFact}>
            <span>{en ? 'Evidence' : 'Kanıt'}</span>
            <EvidenceBadge post={post} compact />
          </div>
          <div className={styles.freshnessFact} data-freshness={evidence.freshness}>
            <span>{en ? 'Freshness' : 'Güncellik'}</span>
            <strong>{evidence.freshnessLabel}</strong>
          </div>
          {factItems.map((item) => (
            <div className={styles.fact} key={`${item.label}-${item.value}`}>
              <span>{item.label}</span>
              <strong>{item.icon}{item.value}</strong>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Link to={href} className={styles.readLink}>
            {safeVariant === 'featured' ? t('common.readMore') : t('common.read')} <FiArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className={`${styles.bookmark} ${isBookmarked ? styles.bookmarked : ''}`}
            onClick={() => onBookmarkToggle?.(post)}
            aria-label={isBookmarked ? t('bookmarks.removeFromBookmarks') : t('bookmarks.addToBookmarks')}
          >
            <FiBookmark size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {safeVariant !== 'compact' && (
        <Link to={href} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
          <ContentImage
            src={post.coverImageUrl}
            alt=""
            className={styles.image}
            loading="lazy"
          />
        </Link>
      )}
    </article>
  );
};

export default KnowledgeCard;
