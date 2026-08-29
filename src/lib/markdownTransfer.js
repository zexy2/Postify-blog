export const MAX_MARKDOWN_IMPORT_BYTES = 1_000_000;

const normalizeMarkdown = (value = '') => String(value)
  .replace(/^\uFEFF/, '')
  .replace(/\r\n?/g, '\n');

export function splitMarkdownDocument(value = '') {
  const source = normalizeMarkdown(value);
  const lines = source.split('\n');
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);

  if (firstContentIndex < 0) return { title: '', body: '' };

  const headingMatch = lines[firstContentIndex].match(/^#\s+(.+?)(?:\s+#+)?\s*$/);
  if (!headingMatch) return { title: '', body: source.trim() };

  const title = headingMatch[1].trim();
  const bodyLines = lines.slice(0, firstContentIndex).concat(lines.slice(firstContentIndex + 1));
  while (bodyLines.length && !bodyLines[0].trim()) bodyLines.shift();

  return { title, body: bodyLines.join('\n').trim() };
}

export function buildMarkdownDocument({ title = '', body = '' } = {}) {
  const cleanTitle = String(title).replace(/[\r\n]+/g, ' ').trim();
  const cleanBody = normalizeMarkdown(body).trim();
  if (!cleanTitle) return cleanBody ? `${cleanBody}\n` : '';
  return cleanBody ? `# ${cleanTitle}\n\n${cleanBody}\n` : `# ${cleanTitle}\n`;
}

export function markdownFilename(title = '') {
  const slug = String(title || 'postify-knowledge')
    .replace(/[İIı]/g, 'i')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
  return `${slug || 'postify-knowledge'}.md`;
}
