import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiAlertTriangle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useAuthorFailureDetails } from '../../hooks/useKnowledge';
import styles from './KnowledgeDashboardPage.module.css';

export default function AuthorFailurePanel({ postId, count }) {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const [open, setOpen] = useState(false);
  const details = useAuthorFailureDetails(postId, { enabled: open && count > 0 });

  if (!count) return null;

  return (
    <div className={styles.failurePanel}>
      <button type="button" className={styles.failureToggle} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <FiAlertTriangle />
        <span>{count} {en ? `failure report${count === 1 ? '' : 's'}` : 'başarısızlık bildirimi'}</span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && (
        <div className={styles.failureDetails} role="region" aria-label={en ? 'Failure report details' : 'Başarısızlık bildirimi detayları'}>
          {details.isLoading ? (
            <p>{en ? 'Loading private failure details…' : 'Özel başarısızlık detayları yükleniyor…'}</p>
          ) : details.isError ? (
            <p role="status">{en ? 'Failure details could not be loaded.' : 'Başarısızlık detayları yüklenemedi.'}</p>
          ) : details.data?.length ? (
            <ul>
              {details.data.map((item, index) => (
                <li key={`${item.updated_at || index}-${index}`}>
                  <strong>{item.environment || (en ? 'Environment not specified' : 'Ortam belirtilmedi')}</strong>
                  {item.note && <p>{item.note}</p>}
                  {item.updated_at && <time dateTime={item.updated_at}>{new Intl.DateTimeFormat(en ? 'en-US' : 'tr-TR', { dateStyle: 'medium' }).format(new Date(item.updated_at))}</time>}
                </li>
              ))}
            </ul>
          ) : (
            <p>{en ? 'No detailed failure note was provided.' : 'Detaylı başarısızlık notu girilmemiş.'}</p>
          )}
          <small>{en ? 'Contributor identity is intentionally not returned.' : 'Katkı yapan kişinin kimliği bilinçli olarak döndürülmez.'}</small>
        </div>
      )}
    </div>
  );
}
