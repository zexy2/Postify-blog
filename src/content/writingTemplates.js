const TEMPLATE_COPY = {
  tr: [
    {
      id: 'guide',
      label: 'Rehber',
      promise: 'Okuru somut bir sonuca adım adım götür.',
      prompts: ['Hedef ve önkoşullar', 'Adım adım uygulama', 'Doğrulama / beklenen sonuç', 'Sık hata veya geri dönüş yolu'],
    },
    {
      id: 'decision',
      label: 'Karar notu',
      promise: 'Seçenekleri, ödünleşimleri ve karar gerekçesini netleştir.',
      prompts: ['Karar bağlamı', 'Gerçek seçenekler', 'Ödünleşimler', 'Seçim ve ne zaman değiştirilmeli'],
    },
    {
      id: 'explainer',
      label: 'Açıklayıcı',
      promise: 'Bir kavramı kısa sürede doğru zihinsel modele dönüştür.',
      prompts: ['Tek cümlelik tanım', 'Neden önemli', 'Nasıl çalışır', 'Yanlış anlaşılan nokta / örnek'],
    },
    {
      id: 'fieldNote',
      label: 'Saha notu',
      promise: 'Gerçek bir deneyimi, sonucu ve çıkarımı kaydet.',
      prompts: ['Bağlam / ortam', 'Ne denendi', 'Ne oldu', 'Tekrar yapacak olsan neyi değiştirirdin'],
    },
  ],
  en: [
    {
      id: 'guide',
      label: 'Guide',
      promise: 'Take the reader to a concrete outcome step by step.',
      prompts: ['Goal and prerequisites', 'Step-by-step implementation', 'Verification / expected result', 'Common failure or recovery path'],
    },
    {
      id: 'decision',
      label: 'Decision note',
      promise: 'Make the options, trade-offs, and rationale explicit.',
      prompts: ['Decision context', 'Real options', 'Trade-offs', 'Choice and when to revisit it'],
    },
    {
      id: 'explainer',
      label: 'Explainer',
      promise: 'Turn a concept into an accurate mental model quickly.',
      prompts: ['One-sentence definition', 'Why it matters', 'How it works', 'Common misconception / example'],
    },
    {
      id: 'fieldNote',
      label: 'Field note',
      promise: 'Capture a real experience, result, and lesson.',
      prompts: ['Context / environment', 'What was tried', 'What happened', 'What you would change next time'],
    },
  ],
};

export const normalizeWritingLocale = (locale = 'tr') => (
  String(locale).toLowerCase().startsWith('en') ? 'en' : 'tr'
);

export function getWritingTemplates(locale = 'tr') {
  return TEMPLATE_COPY[normalizeWritingLocale(locale)];
}

export function getWritingTemplate(id, locale = 'tr') {
  const templates = getWritingTemplates(locale);
  return templates.find((template) => template.id === id) || templates[0];
}


export function getWritingStarter(id, locale = 'tr') {
  const template = getWritingTemplate(id, locale);
  const html = template.prompts.map((prompt) => `<h2>${prompt}</h2><p></p>`).join('');
  const text = template.prompts.map((prompt) => `## ${prompt}`).join('\n\n');
  return { html, text };
}
