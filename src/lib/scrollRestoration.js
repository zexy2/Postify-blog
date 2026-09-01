const ANCHOR_ATTRIBUTE = 'data-scroll-anchor-key';
const ANCHOR_SELECTOR = `[${ANCHOR_ATTRIBUTE}]`;

export function readViewportScrollAnchor(root = document, viewportHeight = window.innerHeight) {
  const visible = Array.from(root.querySelectorAll(ANCHOR_SELECTOR))
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({ element, rect }) => element.getAttribute(ANCHOR_ATTRIBUTE) && rect.bottom > 0 && rect.top < viewportHeight);

  if (!visible.length) return null;

  const crossingTop = visible
    .filter(({ rect }) => rect.top <= 0)
    .sort((a, b) => b.rect.top - a.rect.top)[0];
  const nextVisible = visible
    .filter(({ rect }) => rect.top > 0)
    .sort((a, b) => a.rect.top - b.rect.top)[0];
  const selected = crossingTop || nextVisible;

  return selected ? {
    key: selected.element.getAttribute(ANCHOR_ATTRIBUTE),
    viewportTop: selected.rect.top,
  } : null;
}

export function readElementScrollAnchor(element) {
  const key = element?.getAttribute?.(ANCHOR_ATTRIBUTE);
  if (!key) return null;
  return { key, viewportTop: element.getBoundingClientRect().top };
}

export function findScrollAnchor(key, root = document) {
  if (!key) return null;
  return Array.from(root.querySelectorAll(ANCHOR_SELECTOR))
    .find((element) => element.getAttribute(ANCHOR_ATTRIBUTE) === key) || null;
}
