const DAY = 86_400_000;

const localeKey = (locale = 'tr') => String(locale).toLowerCase().startsWith('en') ? 'en' : 'tr';

export function getKnowledgeEvidence(post = {}, now = new Date()) {
  const evidence = post.evidence || {};
  const testedAt = evidence.testedAt || post.lastReviewedAt || null;
  const testedTime = testedAt ? new Date(testedAt).getTime() : NaN;
  const ageDays = Number.isFinite(testedTime) ? Math.max(0, Math.floor((now.getTime() - testedTime) / DAY)) : null;
  const environment = Array.isArray(evidence.environment) ? evidence.environment.filter(Boolean) : [];
  const prerequisites = Array.isArray(evidence.prerequisites) ? evidence.prerequisites.filter(Boolean) : [];
  const verificationSteps = Array.isArray(evidence.verificationSteps) ? evidence.verificationSteps.filter(Boolean) : [];
  const caveats = Array.isArray(evidence.caveats) ? evidence.caveats.filter(Boolean) : [];
  const sources = Array.isArray(evidence.sources) ? evidence.sources.filter(Boolean) : [];
  const level = ['author-tested','postify-verified'].includes(evidence.level) ? evidence.level : 'unverified';
  const staleAfterDays = Number(evidence.staleAfterDays) > 0 ? Number(evidence.staleAfterDays) : 180;
  const freshness = ageDays === null ? 'unknown' : ageDays > staleAfterDays ? 'stale' : ageDays > staleAfterDays * 0.65 ? 'aging' : 'current';

  return {
    level,
    testedAt,
    ageDays,
    freshness,
    environment,
    prerequisites,
    verificationSteps,
    caveats,
    sources,
    hasEvidence: level !== 'unverified' || environment.length > 0 || verificationSteps.length > 0 || sources.length > 0,
  };
}

export function getEvidenceCopy(post = {}, locale = 'tr', now = new Date()) {
  const evidence = getKnowledgeEvidence(post, now);
  const lang = localeKey(locale);
  const labels = lang === 'en' ? {
    postifyVerified: 'Postify verified', authorTested: 'Author tested', unverified: 'Not independently verified', current: 'Current', aging: 'Re-check soon', stale: 'Needs re-verification', unknown: 'Freshness unknown', tested: 'Tested',
  } : {
    postifyVerified: 'Postify doğruladı', authorTested: 'Yazar test etti', unverified: 'Bağımsız doğrulanmadı', current: 'Güncel', aging: 'Yakında tekrar kontrol edilmeli', stale: 'Yeniden doğrulama gerekli', unknown: 'Güncellik bilinmiyor', tested: 'Test edildi',
  };
  return {
    ...evidence,
    levelLabel: evidence.level === 'postify-verified' ? labels.postifyVerified : evidence.level === 'author-tested' ? labels.authorTested : labels.unverified,
    freshnessLabel: labels[evidence.freshness],
    testedLabel: labels.tested,
  };
}
