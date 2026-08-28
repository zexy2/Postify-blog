const COPY = {
  tr: {
    types: {
      guide: 'Rehber',
      decision: 'Karar notu',
      explainer: 'Açıklayıcı',
      fieldNote: 'Saha notu',
    },
    published: 'Yayınlandı',
    updated: 'Son güncelleme',
    reviewed: 'Son editör kontrolü',
  },
  en: {
    types: {
      guide: 'Guide',
      decision: 'Decision note',
      explainer: 'Explainer',
      fieldNote: 'Field note',
    },
    published: 'Published',
    updated: 'Last updated',
    reviewed: 'Last editor review',
  },
};

const normalizeLocale = (locale = 'tr') => (String(locale).toLowerCase().startsWith('en') ? 'en' : 'tr');

export function getPostType(post = {}) {
  if (post.contentType && ['guide', 'decision', 'explainer', 'fieldNote'].includes(post.contentType)) {
    return post.contentType;
  }

  const haystack = `${post.category || ''} ${post.title || ''}`.toLocaleLowerCase('tr');

  if (/mimari|ürün tasarımı|product design|architecture|karar|decision/.test(haystack)) return 'decision';
  if (/frontend|web geliştirme|developer tools|geliştirici araçları|devops|deployment|performans|performance/.test(haystack)) return 'guide';
  if (/yapay zekâ|artificial intelligence|\bai\b|teknik iletişim|technical communication|açıklama|explainer/.test(haystack)) return 'explainer';
  return 'fieldNote';
}


export function getPostReadingMinutes(post = {}) {
  const explicit = Number(post.readingTime);
  if (Number.isFinite(explicit) && explicit > 0) return Math.max(1, Math.ceil(explicit));
  const text = `${post.body || ''} ${post.excerpt || ''}`.trim();
  if (!text) return null;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function formatPostDate(value, locale = 'tr') {
  if (!value) return '';
  const normalized = normalizeLocale(locale);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(normalized === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function getPostPresentation(post = {}, locale = 'tr') {
  const normalized = normalizeLocale(locale);
  const copy = COPY[normalized];
  const type = getPostType(post);

  const publishedAt = post.publishedAt || post.createdAt || null;
  const updatedAt = post.updatedAt || null;
  const reviewedAt = post.lastReviewedAt || null;

  let dateValue = publishedAt;
  let dateLabel = copy.published;

  if (reviewedAt) {
    dateValue = reviewedAt;
    dateLabel = copy.reviewed;
  } else if (
    updatedAt &&
    (!publishedAt || new Date(updatedAt).getTime() > new Date(publishedAt).getTime() + 60_000)
  ) {
    dateValue = updatedAt;
    dateLabel = copy.updated;
  }

  return {
    type,
    typeLabel: copy.types[type],
    dateValue,
    dateLabel,
    formattedDate: formatPostDate(dateValue, normalized),
    outcome: post.outcome || post.excerpt || '',
  };
}
