export function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateInputToTimestamp(value) {
  const match = String(value || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);
  const date = new Date(year, month, day, 0, 0, 0, 0);
  if (Number.isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return date.toISOString();
}

export const hasMeaningfulEvidenceEntry = (value, minLength, separator = /\n/) => {
  const items = Array.isArray(value) ? value : String(value || '').split(separator);
  return items.some((item) => String(item || '').trim().length >= minLength);
};


const summarizeChecks = (checks) => {
  const passedCount = checks.filter((check) => check.passed).length;
  return {
    checks,
    passedCount,
    total: checks.length,
    score: checks.length ? Math.round((passedCount / checks.length) * 100) : 0,
    ready: checks.every((check) => check.passed),
  };
};

export function getPublishReadiness({
  title = '',
  body = '',
  bodyHtml = '',
  minTitleLength = 8,
  maxTitleLength = Infinity,
  minBodyLength = 160,
  outcome = '',
  testedAt = '',
  latestTestDate = '',
  environment = '',
  verificationSteps = '',
  caveats = '',
  sources = '',
} = {}) {
  const normalizedTitle = title.trim();
  const normalizedBody = body.trim();
  const paragraphCount = normalizedBody ? normalizedBody.split(/\n\s*\n/).filter(Boolean).length : 0;
  const hasRichStructure = /<(h[1-3]|ul|ol|pre|blockquote)\b/i.test(bodyHtml) || paragraphCount >= 3;

  const publication = summarizeChecks([
    { id: 'title', passed: normalizedTitle.length >= minTitleLength && normalizedTitle.length <= maxTitleLength },
    { id: 'substance', passed: normalizedBody.length >= minBodyLength },
  ]);

  const evidence = summarizeChecks([
    { id: 'testedAt', passed: testedAt.trim().length > 0 && (!latestTestDate || testedAt <= latestTestDate) },
    { id: 'environment', passed: hasMeaningfulEvidenceEntry(environment, 3, /[·,\n]/) },
    { id: 'verification', passed: hasMeaningfulEvidenceEntry(verificationSteps, 12) },
  ]);
  evidence.level = evidence.ready ? 'author-tested' : 'unverified';

  const quality = summarizeChecks([
    { id: 'outcome', passed: outcome.trim().length >= 12 },
    { id: 'structure', passed: hasRichStructure },
    { id: 'provenance', passed: sources.trim().length > 0 || caveats.trim().length >= 12 },
  ]);

  return {
    publication,
    evidence,
    quality,
    // Compatibility aliases for older callers; `ready` now means exactly "can submit".
    ready: publication.ready,
    evidenceLevel: evidence.level,
  };
}
