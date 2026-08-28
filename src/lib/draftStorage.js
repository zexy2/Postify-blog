export function createDraftKey(userId, locale = 'tr') {
  const language = String(locale).toLowerCase().startsWith('en') ? 'en' : 'tr';
  return `postify:create-draft:${userId || 'local'}:${language}`;
}

export function loadDraft(storage, key) {
  if (!storage || !key) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.formData) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(storage, key, draft) {
  if (!storage || !key) return false;
  try {
    storage.setItem(key, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(storage, key) {
  if (!storage || !key) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
