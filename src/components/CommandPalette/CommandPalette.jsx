import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiCommand, FiSearch, FiX } from 'react-icons/fi';
import { usePosts } from '../../hooks/usePosts';
import ContentImage from '../ContentImage/ContentImage';
import { getCategoryLabel } from '../../lib/categoryLabels';
import styles from './CommandPalette.module.css';

const CommandPalette = ({ open, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { posts } = usePosts({ enabled: open });
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;
    setQuery('');
    setActiveIndex(0);

    const html = document.documentElement;
    const body = document.body;
    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
    const previousStyles = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    };

    // Keep the document at its current scroll position without shifting <body>.
    // A fixed body with a negative top offset also offsets fixed descendants,
    // which can push this palette above the viewport when opened after scrolling.
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const focusTimer = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
    return () => {
      window.clearTimeout(focusTimer);
      html.style.overflow = previousStyles.htmlOverflow;
      body.style.overflow = previousStyles.bodyOverflow;
      body.style.paddingRight = previousStyles.bodyPaddingRight;
      if (previousFocusRef.current instanceof HTMLElement) previousFocusRef.current.focus({ preventScroll: true });
    };
  }, [open]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(i18n.language);
    if (!normalizedQuery) return posts.slice(0, 6);

    return posts
      .filter((post) => [post.title, post.excerpt, post.category, getCategoryLabel(post.category, i18n.language), post.author?.name]
        .filter(Boolean)
        .some((field) => field.toLocaleLowerCase(i18n.language).includes(normalizedQuery)))
      .slice(0, 6);
  }, [i18n.language, posts, query]);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    if (!open || !results[activeIndex]) return;
    const activeOption = document.getElementById(`command-result-${results[activeIndex].id}`);
    activeOption?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeIndex, open, results]);

  const openPost = useCallback((post) => {
    navigate(`/posts/${post.slug || post.id}`);
    onClose();
  }, [navigate, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Tab' && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])')];
        if (focusable.length) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      } else if (event.key === 'ArrowDown' && results.length) {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      } else if (event.key === 'ArrowUp' && results.length) {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      } else if (event.key === 'Enter' && results[activeIndex]) {
        event.preventDefault();
        openPost(results[activeIndex]);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, onClose, open, openPost, results]);

  if (!open) return null;

  return createPortal(
    <div className={styles.layer}>
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label={t('common.closeSearch')} />
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="command-palette-title">
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.icon}><FiCommand size={16} /></span>
            <div>
              <p id="command-palette-title" className={styles.title}>{t('search.title')}</p>
              <p className={styles.hint}>{t('search.hint')}</p>
            </div>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t('common.closeSearch')}>
            <FiX size={18} />
          </button>
        </div>

        <label className={styles.inputWrap}>
          <FiSearch aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-activedescendant={results[activeIndex] ? `command-result-${results[activeIndex].id}` : undefined}
            type="search"
          />
          <kbd>ESC</kbd>
        </label>

        <div id="command-palette-results" className={styles.results} role="listbox" aria-label={t('search.results')}>
          {results.length ? results.map((post, index) => (
            <button
              type="button"
              id={`command-result-${post.id}`}
              className={`${styles.result} ${index === activeIndex ? styles.resultActive : ''}`}
              key={post.id}
              onClick={() => openPost(post)}
              role="option"
              aria-selected={index === activeIndex}
              tabIndex={-1}
            >
              <span className={styles.resultImage}>
                <ContentImage src={post.coverImageUrl} alt="" loading="lazy" />
              </span>
              <span className={styles.resultCopy}>
                <strong>{post.title}</strong>
                <small>{getCategoryLabel(post.category, i18n.language)} · {post.readingTime} {t('common.minutes')}</small>
              </span>
              <FiArrowUpRight className={styles.resultArrow} size={17} />
            </button>
          )) : (
            <p className={styles.empty}>{t('common.noResults')}</p>
          )}
        </div>
        <div className={styles.footer}><span>{t('search.navigate')}</span><span><kbd>↵</kbd> {t('search.open')}</span></div>
      </div>
    </div>,
    document.body,
  );
};

export default CommandPalette;
