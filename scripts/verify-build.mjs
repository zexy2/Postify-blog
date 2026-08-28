import { readFile, stat } from 'node:fs/promises';

const required = [
  'docs/index.html',
  'docs/404.html',
  'docs/llms.txt',
  'docs/verification-runs.json',
  'docs/knowledge-backend-status.json',
  'docs/knowledge/node-json-dogrulama.tr.json',
  'docs/manifest.webmanifest',
  'docs/sw.js',
  'docs/registerSW.js',
];

for (const path of required) {
  const file = await stat(path);
  if (!file.isFile() || file.size === 0) {
    throw new Error(`Missing or empty build artifact: ${path}`);
  }
}

const fallbackHtml = await readFile('docs/404.html', 'utf8');
if (!fallbackHtml.includes("l.replace(")) {
  throw new Error('GitHub Pages SPA fallback redirect is missing from docs/404.html');
}
if (!fallbackHtml.includes('Postify — Uygulanabilir Bilgi')) {
  throw new Error('GitHub Pages SPA fallback uses stale product identity');
}

const html = await readFile('docs/index.html', 'utf8');
if (!html.includes('Postify — Uygulanabilir Bilgi')) {
  throw new Error('Expected product title is missing from built index.html');
}
if (!html.includes('name="description"')) {
  throw new Error('Static description metadata is missing');
}

const entryMatch = html.match(/<script[^>]+type="module"[^>]+src="\/assets\/(index-[^"]+\.js)"/)
  || html.match(/<script[^>]+src="\/assets\/(index-[^"]+\.js)"[^>]+type="module"/);
if (!entryMatch) throw new Error('Could not identify the production entry chunk');
const entryStat = await stat(`docs/assets/${entryMatch[1]}`);
const ENTRY_BUDGET_BYTES = 320_000;
if (entryStat.size > ENTRY_BUDGET_BYTES) {
  throw new Error(`Production entry chunk exceeds ${ENTRY_BUDGET_BYTES} bytes: ${entryStat.size}`);
}

const forbiddenPreloads = ['sheet-', 'knowledgeService-', 'editor-', 'motion-'];
for (const chunk of forbiddenPreloads) {
  if (html.includes(`modulepreload`) && new RegExp(`rel="modulepreload"[^>]+${chunk}`).test(html)) {
    throw new Error(`Non-critical chunk was eagerly preloaded: ${chunk}`);
  }
}

const backendStatus = JSON.parse(await readFile('docs/knowledge-backend-status.json', 'utf8'));
if (typeof backendStatus.ready !== 'boolean') {
  throw new Error('Knowledge backend capability artifact is invalid');
}

const manifest = JSON.parse(await readFile('docs/manifest.webmanifest', 'utf8'));
if (manifest.name !== 'Postify' || manifest.start_url !== '/') {
  throw new Error('PWA manifest identity or start URL is invalid');
}

console.log(`Build smoke PASS: ${required.length} critical artifacts + product metadata + ${entryStat.size} byte entry budget verified.`);
