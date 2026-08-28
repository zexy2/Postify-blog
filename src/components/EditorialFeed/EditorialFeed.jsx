import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiBookmark, FiClock } from 'react-icons/fi';
import ContentImage from '../ContentImage/ContentImage';
import { getPostPresentation, getPostReadingMinutes } from '../../lib/postPresentation';
import EvidenceBadge from '../EvidenceBadge';
import { summarizeCommunityEvidence } from '../../lib/communityEvidence';
import styles from './EditorialFeed.module.css';

const EditorialFeed = ({ posts, onBookmarkToggle, bookmarkedIds = [] }) => {
  const { t, i18n } = useTranslation();
  const [lead, ...rest] = posts;
  if (!lead) return null;

  const en = i18n.language?.startsWith('en');

  const renderMeta = (post) => {
    const presentation = getPostPresentation(post, i18n.language);
    const community = summarizeCommunityEvidence(post.evidenceSummary || {});
    const readingMinutes = getPostReadingMinutes(post);

    return (
      <div className={styles.meta}>
        <span className={styles.type}>{presentation.typeLabel}</span>
        {post.category && <span className={styles.category}>{post.category}</span>}
        {presentation.formattedDate && (
          <span className={styles.date}>{presentation.formattedDate}</span>
        )}
        {readingMinutes !== null && (
          <span className={styles.readTime}><FiClock size={11} /> {readingMinutes} {t('common.minutes')}</span>
        )}
        <EvidenceBadge post={post} compact />
        {community.total > 0 && (
          <span className={styles.communityEvidence}>
            {community.canShowRate
              ? `${community.successRate}% ${en ? 'worked' : 'çalıştı'}`
              : `${community.total} ${en ? 'confirmations' : 'doğrulama'}`}
          </span>
        )}
      </div>
    );
  };

  const BookmarkButton = ({ post }) => {
    const isBookmarked = bookmarkedIds.includes(post.id);
    return (
      <button
        type="button"
        className={`${styles.bookmark} ${isBookmarked ? styles.bookmarked : ''}`}
        onClick={() => onBookmarkToggle?.(post)}
        aria-label={isBookmarked ? t('bookmarks.removeFromBookmarks') : t('bookmarks.addToBookmarks')}
      >
        <FiBookmark size={15} />
      </button>
    );
  };

  const leadPresentation = getPostPresentation(lead, i18n.language);

  return (
    <div className={styles.feedContainer}>
      <article className={styles.lead}>
        <div className={styles.leadContent}>
          <div className={styles.leadOrdinal} aria-hidden="true">01</div>
          <div className={styles.leadKicker}>{en ? 'Priority read' : 'Öncelikli okuma'}</div>
          {renderMeta(lead)}
          <Link to={`/posts/${lead.slug || lead.id}`} className={styles.titleLink}>
            <h3 className={styles.leadTitle}>{lead.title}</h3>
          </Link>
          {leadPresentation.outcome && <p className={styles.leadExcerpt}>{leadPresentation.outcome}</p>}
          <div className={styles.footer}>
            <Link to={`/posts/${lead.slug || lead.id}`} className={styles.readLink}>
              {t('common.readMore')} <FiArrowUpRight size={15} />
            </Link>
            <BookmarkButton post={lead} />
          </div>
        </div>
        <Link to={`/posts/${lead.slug || lead.id}`} className={styles.leadImageLink} tabIndex={-1} aria-hidden="true">
          <ContentImage
            src={lead.coverImageUrl}
            alt=""
            className={styles.leadImage}
            loading="lazy"
          />
        </Link>
      </article>

      <div className={styles.list}>
        {rest.map((post, index) => {
          const presentation = getPostPresentation(post, i18n.language);
          return (
            <article className={styles.row} key={post.id}>
              <span className={styles.index}>{String(index + 2).padStart(2, '0')}</span>
              <div className={styles.rowContent}>
                {renderMeta(post)}
                <Link to={`/posts/${post.slug || post.id}`} className={styles.titleLink}>
                  <h4 className={styles.rowTitle}>{post.title}</h4>
                </Link>
                {presentation.outcome && <p className={styles.rowExcerpt}>{presentation.outcome}</p>}
                <div className={styles.rowActions}>
                  <Link to={`/posts/${post.slug || post.id}`} className={styles.readLink}>
                    {t('common.read')} <FiArrowUpRight size={14} />
                  </Link>
                  <BookmarkButton post={post} />
                </div>
              </div>
              <Link to={`/posts/${post.slug || post.id}`} className={styles.thumbLink} tabIndex={-1} aria-hidden="true">
                <ContentImage
                  src={post.coverImageUrl}
                  alt=""
                  className={styles.thumb}
                  loading="lazy"
                />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default EditorialFeed;
