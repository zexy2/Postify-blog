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


export function safeHttpUrl(value) {
  const candidate = String(value || '').trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export function sanitizeHttpUrls(values = []) {
  return (Array.isArray(values) ? values : [])
    .map((value) => safeHttpUrl(value))
    .filter(Boolean);
}
