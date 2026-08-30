const CATEGORY_LABELS = {
  'yapay zekâ': { tr: 'Yapay zekâ', en: 'AI' },
  'web geliştirme': { tr: 'Web geliştirme', en: 'Web development' },
  'ürün tasarımı': { tr: 'Ürün tasarımı', en: 'Product design' },
  mimari: { tr: 'Mimari', en: 'Architecture' },
  'geliştirici araçları': { tr: 'Geliştirici araçları', en: 'Developer tools' },
  'teknik iletişim': { tr: 'Teknik iletişim', en: 'Technical communication' },
  'ürün analitiği': { tr: 'Ürün analitiği', en: 'Product analytics' },
  'iş akışı': { tr: 'İş akışı', en: 'Workflow' },
  performans: { tr: 'Performans', en: 'Performance' },
  altyapı: { tr: 'Altyapı', en: 'Infrastructure' },
  'artificial intelligence': { tr: 'Yapay zekâ', en: 'AI' },
  'web development': { tr: 'Web geliştirme', en: 'Web development' },
  'product design': { tr: 'Ürün tasarımı', en: 'Product design' },
  architecture: { tr: 'Mimari', en: 'Architecture' },
  'developer tools': { tr: 'Geliştirici araçları', en: 'Developer tools' },
  'technical communication': { tr: 'Teknik iletişim', en: 'Technical communication' },
  'product analytics': { tr: 'Ürün analitiği', en: 'Product analytics' },
  workflow: { tr: 'İş akışı', en: 'Workflow' },
  performance: { tr: 'Performans', en: 'Performance' },
  infrastructure: { tr: 'Altyapı', en: 'Infrastructure' },
};

const normalizeCategory = (value) => value.toLocaleLowerCase('en-US').replace(/\u0307/g, '');

export const getCategoryLabel = (category, locale = 'tr') => {
  const value = typeof category === 'string' ? category.trim() : '';
  if (!value) return '';

  const language = locale?.startsWith('en') ? 'en' : 'tr';
  return CATEGORY_LABELS[normalizeCategory(value)]?.[language] || value;
};

export default getCategoryLabel;
