const parseVersion = (value) => {
  const match = String(value || '').match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  return match ? { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) } : null;
};

export const RUNTIME_SIGNAL_MAX_AGE_MS = 36 * 60 * 60 * 1000;

const compareVersion = (a, b) => {
  const av = parseVersion(a);
  const bv = parseVersion(b);
  if (!av || !bv) return 0;
  return av.major - bv.major || av.minor - bv.minor || av.patch - bv.patch;
};

export function evaluateNodeRuntimeRelease({ check, run, releases = [], checkedAt = new Date().toISOString() }) {
  const base = {
    checkId: check?.id || run?.id || null,
    runtime: 'node',
    checkedAt,
    verifiedRuntimeVersion: run?.runtimeVersion || null,
    requiredRuntimeMajor: check?.runtimeMajor ?? run?.requiredRuntimeMajor ?? null,
  };
  if (!check || !run || run.status !== 'passed') return { ...base, status: 'unknown', reason: 'verification-not-passed' };

  const lts = releases
    .filter((release) => release?.lts && parseVersion(release.version))
    .sort((a, b) => compareVersion(b.version, a.version));
  if (!lts.length) return { ...base, status: 'unknown', reason: 'lts-release-signal-empty' };

  const latest = lts[0];
  const latestVersion = parseVersion(latest.version);
  const verifiedVersion = parseVersion(run.runtimeVersion);
  const details = {
    ...base,
    latestLtsVersion: latest.version,
    latestLtsMajor: latestVersion.major,
    latestLtsCodename: typeof latest.lts === 'string' ? latest.lts : null,
  };

  if (!verifiedVersion || verifiedVersion.major !== check.runtimeMajor || run.requiredRuntimeMajor !== check.runtimeMajor) {
    return { ...details, status: 'unknown', reason: 'verification-runtime-contract-mismatch' };
  }
  if (latestVersion.major > check.runtimeMajor) return { ...details, status: 'recheck-required', reason: 'newer-lts-major' };
  if (latestVersion.major < check.runtimeMajor) return { ...details, status: 'unknown', reason: 'release-signal-behind-contract' };

  const comparison = compareVersion(latest.version, run.runtimeVersion);
  if (comparison > 0) return { ...details, status: 'recheck-required', reason: 'newer-lts-release' };
  if (comparison < 0) return { ...details, status: 'unknown', reason: 'release-signal-behind-verification' };
  return { ...details, status: 'current', reason: 'exact-latest-lts' };
}

export function getAutomaticVerificationState(run, runtimeStatus, now = new Date()) {
  if (!run || run.status !== 'passed') return { status: 'not-verified', verified: false, signal: null };
  const signal = runtimeStatus?.checks?.[run.id] || null;
  const checkedAt = signal?.checkedAt ? new Date(signal.checkedAt).getTime() : NaN;
  const nowTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const signalAge = nowTime - checkedAt;
  if (!signal
    || signal.verifiedRuntimeVersion !== run.runtimeVersion
    || signal.requiredRuntimeMajor !== run.requiredRuntimeMajor
    || !Number.isFinite(checkedAt)
    || !Number.isFinite(nowTime)
    || signalAge < -5 * 60 * 1000
    || signalAge > RUNTIME_SIGNAL_MAX_AGE_MS) {
    return { status: 'freshness-unknown', verified: false, signal };
  }
  if (signal.status === 'current') return { status: 'verified', verified: true, signal };
  if (signal.status === 'recheck-required') return { status: 'recheck-required', verified: false, signal };
  return { status: 'freshness-unknown', verified: false, signal };
}
