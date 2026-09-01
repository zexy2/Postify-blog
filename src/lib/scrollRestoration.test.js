import { afterEach, describe, expect, it, vi } from 'vitest';
import { findScrollAnchor, readViewportScrollAnchor } from './scrollRestoration';

const addAnchor = (key, top, height = 120) => {
  const element = document.createElement('article');
  element.setAttribute('data-scroll-anchor-key', key);
  element.getBoundingClientRect = vi.fn(() => ({
    x: 0, y: top, top, left: 0, right: 390, bottom: top + height, width: 390, height,
    toJSON: () => ({}),
  }));
  document.body.appendChild(element);
  return element;
};

describe('scrollRestoration', () => {
  afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });

  it('captures the card crossing the viewport top as the semantic anchor', () => {
    addAnchor('/posts/above', -180, 100);
    addAnchor('/posts/current', -24, 180);
    addAnchor('/posts/next', 180, 140);
    expect(readViewportScrollAnchor(document, 700)).toEqual({ key: '/posts/current', viewportTop: -24 });
  });

  it('falls forward to the first visible card and resolves it again by key', () => {
    addAnchor('/posts/first', 72, 160);
    const second = addAnchor('/posts/second', 260, 160);
    expect(readViewportScrollAnchor(document, 700)).toEqual({ key: '/posts/first', viewportTop: 72 });
    expect(findScrollAnchor('/posts/second')).toBe(second);
    expect(findScrollAnchor('/posts/missing')).toBeNull();
  });
});
