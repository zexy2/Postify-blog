import { useLayoutEffect, useRef, useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import styles from './DiscoveryFilterPopover.module.css';

const DiscoveryFilterPopover = ({
  anchorRef,
  isEnglish,
  resultCount,
  activeRefinementCount,
  freshnessFilter,
  evidenceFilter,
  sortMode,
  readingFilter,
  onFreshnessChange,
  onEvidenceChange,
  onSortChange,
  onReadingChange,
  onClear,
  onClose,
}) => {
  const popoverRef = useRef(null);
  const [positionStyle, setPositionStyle] = useState(null);

  useLayoutEffect(() => {
    const positionPopover = () => {
      if (window.innerWidth <= 560) {
        setPositionStyle(null);
        return;
      }

      const margin = 16;
      const gap = 8;
      const toggleRect = anchorRef.current?.getBoundingClientRect();
      const popover = popoverRef.current;
      if (!toggleRect || !popover) return;

      const width = Math.min(520, window.innerWidth - (margin * 2));
      const left = Math.min(
        Math.max(margin, toggleRect.right - width),
        window.innerWidth - width - margin,
      );
      const measuredHeight = popover.scrollHeight || popover.getBoundingClientRect().height || 480;
      const availableBelow = Math.max(0, window.innerHeight - toggleRect.bottom - gap - margin);
      const availableAbove = Math.max(0, toggleRect.top - gap - margin);
      const placeBelow = availableBelow >= Math.min(measuredHeight, 360) || availableBelow >= availableAbove;
      const availableHeight = placeBelow ? availableBelow : availableAbove;
      const maxHeight = Math.max(220, availableHeight);
      const visibleHeight = Math.min(measuredHeight, maxHeight);
      const top = placeBelow
        ? toggleRect.bottom + gap
        : Math.max(margin, toggleRect.top - gap - visibleHeight);

      setPositionStyle({
        position: 'fixed',
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
        width: `${Math.round(width)}px`,
        maxHeight: `${Math.round(maxHeight)}px`,
      });
    };

    positionPopover();
    window.addEventListener('resize', positionPopover);
    window.addEventListener('scroll', positionPopover, { passive: true });
    return () => {
      window.removeEventListener('resize', positionPopover);
      window.removeEventListener('scroll', positionPopover);
    };
  }, [anchorRef]);

  const evidenceOptions = [
    ['freshness', isEnglish ? 'Current evidence' : 'Güncel kanıt', freshnessFilter === 'current', onFreshnessChange],
    ['author', isEnglish ? 'Author tested' : 'Yazar test etti', evidenceFilter === 'author', () => onEvidenceChange(evidenceFilter === 'author' ? 'all' : 'author')],
    ['community', isEnglish ? 'Community confirmed' : 'Topluluk doğruladı', evidenceFilter === 'community', () => onEvidenceChange(evidenceFilter === 'community' ? 'all' : 'community')],
    ['postify', 'Postify verified', evidenceFilter === 'postify', () => onEvidenceChange(evidenceFilter === 'postify' ? 'all' : 'postify')],
  ];

  const orderOptions = [
    ['evidence', isEnglish ? 'Best evidence' : 'En güçlü kanıt', sortMode === 'evidence'],
    ['latest', isEnglish ? 'Latest' : 'En yeni', sortMode === 'latest'],
  ];

  return (
    <div
      ref={popoverRef}
      id="advanced-discovery-filters"
      className={styles.popover}
      style={positionStyle || undefined}
      role="dialog"
      aria-label={isEnglish ? 'Filters' : 'Filtreler'}
    >
      <div className={styles.header}>
        <div>
          <strong>{isEnglish ? 'Refine results' : 'Sonuçları daralt'}</strong>
          <span>{isEnglish ? 'Evidence, ordering and reading time.' : 'Kanıt, sıralama ve okuma süresi.'}</span>
        </div>
        <button type="button" className={styles.close} aria-label={isEnglish ? 'Close filters' : 'Filtreleri kapat'} onClick={onClose}>
          <FiX size={16} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.body} role="group" aria-label={isEnglish ? 'Evidence and ordering' : 'Kanıt ve sıralama'}>
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span>{isEnglish ? 'Evidence' : 'Kanıt'}</span>
            <small>{isEnglish ? 'Trust signals' : 'Güven sinyalleri'}</small>
          </div>
          <div className={styles.optionGrid}>
            {evidenceOptions.map(([id, label, selected, onClick]) => (
              <button key={id} type="button" className={`${styles.option} ${selected ? styles.optionActive : ''}`} aria-pressed={selected} onClick={onClick}>
                <span>{label}</span>
                <span className={styles.optionMark} aria-hidden="true">{selected ? <FiCheck size={14} /> : null}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span>{isEnglish ? 'Order' : 'Sıralama'}</span>
            <small>{isEnglish ? 'Default ranking' : 'Varsayılan sıralama'}</small>
          </div>
          <div className={styles.optionGrid}>
            {orderOptions.map(([id, label, selected]) => (
              <button key={id} type="button" className={`${styles.option} ${selected ? styles.optionActive : ''}`} aria-pressed={selected} onClick={() => onSortChange(id)}>
                <span>{label}</span>
                <span className={styles.optionMark} aria-hidden="true">{selected ? <FiCheck size={14} /> : null}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span>{isEnglish ? 'Reading time' : 'Okuma süresi'}</span>
            <small>{isEnglish ? 'Quick scan' : 'Hızlı tarama'}</small>
          </div>
          <button type="button" className={`${styles.option} ${readingFilter === 'quick' ? styles.optionActive : ''}`} aria-pressed={readingFilter === 'quick'} onClick={onReadingChange}>
            <span>{isEnglish ? '≤ 5 min' : '≤ 5 dk'}</span>
            <span className={styles.optionMark} aria-hidden="true">{readingFilter === 'quick' ? <FiCheck size={14} /> : null}</span>
          </button>
        </section>
      </div>

      <div className={styles.footer}>
        <span>{isEnglish ? `${resultCount} results` : `${resultCount} sonuç`}</span>
        <button type="button" className={styles.clear} disabled={activeRefinementCount === 0} onClick={onClear}>
          {isEnglish ? 'Clear filters' : 'Filtreleri temizle'}
        </button>
      </div>
    </div>
  );
};

export default DiscoveryFilterPopover;
