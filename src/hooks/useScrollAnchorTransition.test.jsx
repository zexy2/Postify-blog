import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollAnchorTransition } from './useScrollAnchorTransition';

const Harness = ({ active }) => {
  useScrollAnchorTransition({ active, selector: '#feed-anchor' });
  return <div id="feed-anchor" />;
};

describe('useScrollAnchorTransition', () => {
  let top;
  let nextFrame;
  let rectSpy;

  beforeEach(() => {
    top = 452.5;
    nextFrame = null;
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 700 });
    window.scrollBy = vi.fn();
    window.requestAnimationFrame = vi.fn((callback) => {
      nextFrame = callback;
      return 1;
    });
    window.cancelAnimationFrame = vi.fn();
    rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      x: 0,
      y: top,
      top,
      left: 0,
      right: 390,
      bottom: top + 100,
      width: 390,
      height: 100,
      toJSON: () => ({}),
    }));
  });

  afterEach(() => {
    rectSpy?.mockRestore();
    vi.restoreAllMocks();
  });

  it('uses the latest settled fallback anchor before compensating the live layout delta', () => {
    const { rerender } = render(<Harness active />);

    // The fallback layout settles after the first render (for example after fonts load).
    top = 500;
    act(() => nextFrame?.());

    // Live content replaces it and moves the anchor 73.125px upward.
    top = 426.875;
    rerender(<Harness active={false} />);

    expect(window.scrollBy).toHaveBeenCalledTimes(1);
    expect(window.scrollBy).toHaveBeenCalledWith({ top: -73.125, left: 0, behavior: 'auto' });
  });

  it('does not move the viewport while the reader is still at the top', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    const { rerender } = render(<Harness active />);
    top = 400;
    act(() => nextFrame?.());
    top = 350;
    rerender(<Harness active={false} />);
    expect(window.scrollBy).not.toHaveBeenCalled();
  });
});
