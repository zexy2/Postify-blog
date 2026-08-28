export const MIN_RATE_SAMPLE = 3;
export function summarizeCommunityEvidence(summary = {}) {
  const total = Number(summary.confirmation_count ?? summary.confirmationCount ?? 0) || 0;
  const worked = Number(summary.worked_count ?? summary.workedCount ?? 0) || 0;
  const failed = Number(summary.failed_count ?? summary.failedCount ?? 0) || 0;
  const environments = Number(summary.environment_count ?? summary.environmentCount ?? 0) || 0;
  return {
    total, worked, failed, environments,
    canShowRate: total >= MIN_RATE_SAMPLE,
    successRate: total >= MIN_RATE_SAMPLE ? Math.round((worked / total) * 100) : null,
    communityConfirmed: total >= MIN_RATE_SAMPLE && worked > failed,
  };
}
