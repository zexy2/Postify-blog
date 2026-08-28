export function getWritingMetrics(text = '', wordsPerMinute = 220) {
  const normalized = text.trim();
  const words = normalized ? normalized.split(/\s+/).filter(Boolean).length : 0;
  return {
    characters: text.length,
    words,
    readingMinutes: words === 0 ? 0 : Math.max(1, Math.ceil(words / wordsPerMinute)),
  };
}
