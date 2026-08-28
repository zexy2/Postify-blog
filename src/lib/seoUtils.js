export function canonicalizeUrl(value, fallback = 'https://postify.zekiakgul.dev') {
  try {
    const url = new URL(value || fallback, fallback);
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, url.pathname === '/' ? '/' : '');
  } catch {
    return fallback;
  }
}

export function absoluteAssetUrl(value, siteUrl = 'https://postify.zekiakgul.dev') {
  if (!value) return siteUrl;
  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return siteUrl;
  }
}
