import { useEffect, useLayoutEffect, useRef } from 'react';

const readAbsoluteTop = (selector) => {
  const element = document.querySelector(selector);
  if (!element) return null;
  return element.getBoundingClientRect().top + window.scrollY;
};

/**
 * Preserve a viewport anchor when a temporary layout state is replaced.
 *
 * While `active` is true we keep the latest absolute position on every frame,
 * so font/image/layout settling cannot leave a stale pre-transition reference.
 * When `active` turns false, any resulting layout delta is compensated before
 * paint as long as the reader has already scrolled into the document.
 */
export function useScrollAnchorTransition({ active, selector }) {
  const anchorRef = useRef({ active, absoluteTop: null });

  useLayoutEffect(() => {
    const absoluteTop = readAbsoluteTop(selector);
    if (absoluteTop === null) return;

    const previous = anchorRef.current;
    if (previous.active && !active && previous.absoluteTop !== null && window.scrollY > 1) {
      const delta = absoluteTop - previous.absoluteTop;
      if (Math.abs(delta) > 0.5) {
        window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
      }
    }

    anchorRef.current = { active, absoluteTop };
  }, [active, selector]);

  useEffect(() => {
    if (!active) return undefined;

    let frame = 0;
    const track = () => {
      const absoluteTop = readAbsoluteTop(selector);
      if (absoluteTop !== null) anchorRef.current = { active: true, absoluteTop };
      frame = window.requestAnimationFrame(track);
    };

    track();
    return () => window.cancelAnimationFrame(frame);
  }, [active, selector]);
}

export default useScrollAnchorTransition;
