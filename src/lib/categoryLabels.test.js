import { describe, expect, it } from 'vitest';
import { getCategoryLabel } from './categoryLabels';

describe('getCategoryLabel', () => {
  it('localizes known Turkish category values for English UI without changing unknown values', () => {
    expect(getCategoryLabel('Ürün tasarımı', 'en')).toBe('Product design');
    expect(getCategoryLabel('Geliştirici araçları', 'en-US')).toBe('Developer tools');
    expect(getCategoryLabel('İş akışı', 'en')).toBe('Workflow');
    expect(getCategoryLabel('Custom category', 'en')).toBe('Custom category');
  });

  it('can present known English category values in Turkish UI', () => {
    expect(getCategoryLabel('Product design', 'tr')).toBe('Ürün tasarımı');
    expect(getCategoryLabel('Infrastructure', 'tr-TR')).toBe('Altyapı');
    expect(getCategoryLabel('Node.js', 'tr')).toBe('Node.js');
  });
});
