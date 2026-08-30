import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import i18n from './i18n';

const requiredFeedbackKeys = [
  'errors.postCreateFailed',
  'errors.postUpdateFailed',
  'errors.postDeleteFailed',
  'auth.logoutError',
  'auth.profileUpdateError',
  'auth.sessionCheckSlowTitle',
  'auth.sessionCheckSlowMessage',
  'auth.continueToLogin',
];

const collectStaticTranslationKeys = () => {
  const files = [];
  const walk = (directory) => {
    for (const name of fs.readdirSync(directory)) {
      const target = path.join(directory, name);
      const stat = fs.statSync(target);
      if (stat.isDirectory()) walk(target);
      else if (/\.(js|jsx)$/.test(name) && !/\.test\./.test(name)) files.push(target);
    }
  };

  walk(path.resolve('src'));
  const keys = new Set();
  const keyPattern = /\bt\(\s*['"]([^'"]+)['"]/g;
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(keyPattern)) keys.add(match[1]);
  }
  return [...keys].sort();
};

describe('translation coverage', () => {
  afterAll(async () => { await i18n.changeLanguage('tr'); });

  for (const locale of ['tr', 'en']) {
    it(`defines critical recovery/error copy in ${locale}`, async () => {
      await i18n.changeLanguage(locale);
      for (const key of requiredFeedbackKeys) {
        const value = i18n.t(key);
        expect(value).toBeTruthy();
        expect(value).not.toBe(key);
      }
    });

    it(`defines every static source translation key in ${locale}`, async () => {
      await i18n.changeLanguage(locale);
      const missing = collectStaticTranslationKeys().filter((key) => !i18n.exists(key, { lng: locale }));
      expect(missing).toEqual([]);
    });
  }
});
