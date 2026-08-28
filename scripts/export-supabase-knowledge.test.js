import { describe, expect, it } from 'vitest';

describe('production knowledge export policy', () => {
  it('keeps deployable fallback artifacts while the additive production schema is pending', async () => {
    const source = await import('node:fs/promises').then(({ readFile }) => readFile('scripts/export-supabase-knowledge.mjs', 'utf8'));
    expect(source).toContain('Verified Knowledge production schema pending');
    expect(source).toContain("['42703', '42P01', 'PGRST204', 'PGRST205']");
    expect(source).toContain('process.exit(0)');
  });
});
