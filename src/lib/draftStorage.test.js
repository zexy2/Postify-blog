import { describe, expect, it } from 'vitest';
import { clearDraft, createDraftKey, loadDraft, saveDraft } from './draftStorage';

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

describe('draftStorage', () => {
  it('scopes drafts by user and language', () => {
    expect(createDraftKey('u1', 'tr-TR')).toBe('postify:create-draft:u1:tr:new');
    expect(createDraftKey('u1', 'en-US')).toBe('postify:create-draft:u1:en:new');
  });

  it('round-trips and clears a draft safely', () => {
    const storage = createMemoryStorage();
    const key = createDraftKey('u1', 'tr');
    const draft = { formData: { title: 'Test', body: 'Body', bodyHtml: '<p>Body</p>' } };
    expect(saveDraft(storage, key, draft)).toBe(true);
    expect(loadDraft(storage, key)).toEqual(draft);
    expect(clearDraft(storage, key)).toBe(true);
    expect(loadDraft(storage, key)).toBeNull();
  });

  it('ignores malformed stored data', () => {
    const storage = { getItem: () => '{bad', setItem() {}, removeItem() {} };
    expect(loadDraft(storage, 'key')).toBeNull();
  });
});
