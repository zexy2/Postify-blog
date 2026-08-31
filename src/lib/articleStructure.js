export function slugifyHeading(value = '', index = 0) {
  const slug = String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('tr')
    .replace(/[^a-z0-9ıöüğşç\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return slug ? `section-${slug}-${index}` : `section-${index}`;
}

export function splitArticleBlocks(content = '') {
  return String(content)
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block) => {
      if (!/^#{1,3}\s/.test(block)) return [block];
      const [headingLine, ...rest] = block.split('\n');
      const remainder = rest.join('\n').trim();
      return remainder ? [headingLine.trim(), remainder] : [headingLine.trim()];
    });
}

export function getArticleOutline(content = '') {
  const blocks = splitArticleBlocks(content);
  return blocks
    .filter((block) => /^#{1,3}\s/.test(block))
    .map((block, index) => {
      const match = block.match(/^(#{1,3})\s+(.+)$/);
      const text = match?.[2]?.trim() || block.replace(/^#{1,3}\s+/, '').trim();
      return { text, level: Math.min(match?.[1]?.length || 2, 3), id: slugifyHeading(text, index) };
    });
}


export function extractExternalReferences(content = '', currentOrigin = '') {
  const matches = String(content).match(/https?:\/\/[^\s)\]}>"']+/g) || [];
  const unique = [...new Set(matches.map((url) => url.replace(/[.,;:!?]+$/, '')))];
  return unique.filter((url) => {
    if (!currentOrigin) return true;
    try { return new URL(url).origin !== currentOrigin; } catch { return false; }
  });
}

export function parseFencedCodeBlock(block = '') {
  const source = String(block).trim();
  const match = source.match(/^```([^\n`]*)\n?([\s\S]*?)\n?```$/);
  if (!match) return null;
  return {
    language: match[1].trim().toLowerCase(),
    code: match[2].replace(/\n$/, ''),
  };
}
