let statusPromise = null;

export async function getKnowledgeBackendStatus({ force = false } = {}) {
  if (typeof window === 'undefined') return { ready: false, mode: 'server-default' };
  if (!statusPromise || force) {
    statusPromise = fetch('/knowledge-backend-status.json', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return { ready: false, mode: 'status-unavailable' };
        const payload = await response.json();
        return { ...payload, ready: payload?.ready === true };
      })
      .catch(() => ({ ready: false, mode: 'status-unavailable' }));
  }
  return statusPromise;
}

export function resetKnowledgeBackendStatusCache() {
  statusPromise = null;
}
