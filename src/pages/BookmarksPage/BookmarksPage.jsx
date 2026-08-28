import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiBookmark, FiTrash2 } from 'react-icons/fi';
import { useBookmarks } from '../../hooks/useBookmarks';
import { getPostPresentation, getPostReadingMinutes } from '../../lib/postPresentation';
import EvidenceBadge from '../../components/EvidenceBadge';
import styles from './BookmarksPage.module.css';

const BookmarksPage = () => {
  const { t, i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const { bookmarkedPosts, bookmarksCount, remove, clearAll } = useBookmarks();

  if (bookmarksCount === 0) {
    return (
      <main className={`container ${styles.emptyState}`}>
        <span className={styles.emptyEyebrow}>{en ? 'Personal knowledge shelf' : 'Kişisel bilgi rafı'}</span>
        <div className={styles.emptyIcon} aria-hidden="true"><FiBookmark /></div>
        <h1 className={styles.emptyTitle}>{t('bookmarks.empty')}</h1>
        <p className={styles.emptyText}>{t('bookmarks.emptyHint')}</p>
        <Link to="/" className={styles.backButton}>
          <FiArrowLeft />
          {en ? 'Explore useful knowledge' : 'İşe yarayan bilgileri keşfet'}
        </Link>
      </main>
    );
  }

  return (
    <main className={`container ${styles.page}`}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <span className={styles.eyebrow}>{en ? 'Personal knowledge shelf' : 'Kişisel bilgi rafı'}</span>
          <h1 className={styles.title}>{t('bookmarks.title')}</h1>
          <p>{en
            ? 'A working set of guidance you want to return to — ordered for scanning, not collected as decorative cards.'
            : 'Tekrar dönmek istediğin rehberlerden oluşan çalışma seti; dekoratif kartlar yerine hızlı taranacak bir indeks.'}</p>
        </div>
        <div className={styles.headerMeta}>
          <strong>{bookmarksCount}</strong>
          <span>{en ? 'saved records' : 'kayıtlı içerik'}</span>
          <button type="button" onClick={clearAll} className={styles.clearButton}>
            <FiTrash2 />
            {t('bookmarks.clearAll')}
          </button>
        </div>
      </header>

      <section className={styles.index} aria-label={en ? 'Saved knowledge' : 'Kaydedilen bilgiler'}>
        {bookmarkedPosts.map((post, index) => {
          const presentation = getPostPresentation(post, i18n.language);
          const minutes = getPostReadingMinutes(post);
          const summary = presentation.outcome || post.body?.trim() || '';

          return (
            <article key={post.id} className={styles.row}>
              <span className={styles.rowIndex}>{String(index + 1).padStart(2, '0')}</span>
              <div className={styles.rowMain}>
                <div className={styles.metaRow}>
                  <EvidenceBadge post={post} compact />
                  <span>{presentation.typeLabel}</span>
                  {minutes && <span>{minutes} {en ? 'min' : 'dk'}</span>}
                  {presentation.formattedDate && <span>{presentation.formattedDate}</span>}
                </div>
                <Link to={`/posts/${post.slug || post.id}`} className={styles.rowLink}>
                  <h2>{post.title}</h2>
                  {summary && <p>{summary}</p>}
                </Link>
                {post.userId && (
                  <Link to={`/users/${post.userId}`} className={styles.author}>
                    {post.authorName || `${t('posts.author')} #${post.userId}`}
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(post.id)}
                className={styles.removeButton}
                aria-label={`${t('bookmarks.removeFromBookmarks')}: ${post.title}`}
                title={t('bookmarks.removeFromBookmarks')}
              >
                <FiTrash2 />
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default BookmarksPage;
