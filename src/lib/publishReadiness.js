export function getPublishReadiness({
  title = '',
  body = '',
  bodyHtml = '',
  minTitleLength = 8,
  minBodyLength = 160,
  outcome = '',
  testedAt = '',
  environment = '',
  verificationSteps = '',
  caveats = '',
  sources = '',
} = {}) {
  const normalizedTitle = title.trim();
  const normalizedBody = body.trim();
  const paragraphCount = normalizedBody ? normalizedBody.split(/\n\s*\n/).filter(Boolean).length : 0;
  const hasRichStructure = /<(h[1-3]|ul|ol|pre|blockquote)\b/i.test(bodyHtml) || paragraphCount >= 3;

  const checks = [
    { id: 'title', passed: normalizedTitle.length >= minTitleLength },
    { id: 'substance', passed: normalizedBody.length >= minBodyLength },
    { id: 'structure', passed: hasRichStructure },
    { id: 'outcome', passed: outcome.trim().length >= 12 },
    { id: 'environment', passed: environment.trim().length >= 3 },
    { id: 'verification', passed: testedAt.trim().length > 0 && verificationSteps.trim().length >= 12 },
    { id: 'provenance', passed: sources.trim().length > 0 || caveats.trim().length >= 12 },
  ];
  const passedCount = checks.filter((check) => check.passed).length;

  return {
    checks,
    passedCount,
    total: checks.length,
    score: Math.round((passedCount / checks.length) * 100),
    ready: checks[0].passed && checks[1].passed && checks[3].passed,
  };
}
